import { useMemo, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { notifications } from '@mantine/notifications';
import type {
	ContactFileSummary,
	MappedResult,
} from '~/models/ContactFileSummary';
import { useProcessContactGroupFile } from '~/queries/contactGroupFilesQueries';
import type ContactGroup from '~/models/ContactGroup';
import { areAllSystemFieldsMapped } from './ColumnMappingCard/ColumnMappingCard';
import { useGetClientConfig } from '~/queries/clientConfigQueries';
import { transformFieldMapping } from '~/utils/fieldMappingTransformer';
import { useUpdateContactGroup } from '~/queries/contactGroupQueries';
import { useCampaignActiveSchedule } from '~/queries/schedulerQueries';
import { useGetContactGroups } from '~/queries/contactGroupQueries';
import { useGetCampaign } from '~/queries/campaignsQueries';
import {
	calculateHumanEquivalentValues,
	type HumanEquivalentCalculations,
} from './humanEquivalentCalculations';
import { useCampaignsStore } from '~/stores/campaignsStore';
import { ContactLimitsForm } from './ContactLimitsForm';

type ContactLimitsProps = {
	fileSummary?: ContactFileSummary;
	contactGroup: Partial<ContactGroup>;
	onComplete?: () => void;
	objectiveId?: number;
	campaignId?: string | number;
};

export const ContactLimits = ({
	fileSummary,
	contactGroup,
	onComplete,
	objectiveId,
	campaignId,
}: ContactLimitsProps) => {
	const { t } = useTranslation(['campaign.form.contacts', 'common']);
	const processFileMutation = useProcessContactGroupFile();
	const { setRightComponent, selectedCampaign } = useCampaignsStore(
		(state) => state
	);
	const updateContactGroupMutation = useUpdateContactGroup();

	const { data: activeSchedule } = useCampaignActiveSchedule(campaignId);
	const { data: contactGroups } = useGetContactGroups({
		isActive: true,
		campaignId,
	});
	const { data: campaign } = useGetCampaign(
		campaignId ? String(campaignId) : ''
	);

	const [name, setName] = useState(contactGroup.name || '');
	const [columnMappings, setColumnMappings] = useState<MappedResult>(
		{} as MappedResult
	);
	const [selectedSchemaId, setSelectedSchemaId] = useState<number>(0);
	const [humanEquivalent, setHumanEquivalent] = useState<number>(
		contactGroup.humanEquivalent || 1
	);
	const [selectedVoiceIds, setSelectedVoiceIds] = useState<string[]>(
		contactGroup.voiceIds ?? []
	);
	const [isTest, setIsTest] = useState<boolean>(
		contactGroup.id ? (contactGroup.isTest ?? false) : false
	);
	const defaultWaves = useMemo(
		() =>
			contactGroup.maxWaves ??
			selectedCampaign?.defaultMaxWaves ??
			campaign?.defaultMaxWaves ??
			3,
		[
			campaign?.defaultMaxWaves,
			contactGroup.maxWaves,
			selectedCampaign?.defaultMaxWaves,
		]
	);
	const [maxWaves, setMaxWaves] = useState<number>(defaultWaves);
	const defaultWaveExecutionDelaySeconds = useMemo(
		() =>
			contactGroup.waveExecutionDelaySeconds ??
			selectedCampaign?.defaultWaveExecutionDelaySeconds ??
			campaign?.defaultWaveExecutionDelaySeconds ??
			0,
		[
			campaign?.defaultWaveExecutionDelaySeconds,
			contactGroup.waveExecutionDelaySeconds,
			selectedCampaign?.defaultWaveExecutionDelaySeconds,
		]
	);
	const [waveExecutionDelaySeconds, setWaveExecutionDelaySeconds] =
		useState<number>(defaultWaveExecutionDelaySeconds);
	const [showMappingError, setShowMappingError] = useState(false);
	const campaignVoiceIds = useMemo(
		() => campaign?.voiceIds ?? selectedCampaign?.voiceIds ?? [],
		[campaign?.voiceIds, selectedCampaign?.voiceIds]
	);

	const { data: systemConfig } = useGetClientConfig('contact_columns');

	const systemFields = useMemo(() => {
		if (!systemConfig?.value) return [];
		try {
			const parsed = JSON.parse(systemConfig.value) as Array<{
				name: string;
				label: string;
				type: string;
				isArray: boolean;
				required?: boolean;
			}>;
			return parsed.map((field) => ({
				...field,
				required: field.required ?? false,
			}));
		} catch {
			return [];
		}
	}, [systemConfig]);

	useEffect(() => {
		setName(contactGroup.name || '');
		setColumnMappings({} as MappedResult);
		setSelectedSchemaId(0);
		setHumanEquivalent(contactGroup.humanEquivalent || 1);
		setSelectedVoiceIds(contactGroup.voiceIds ?? []);
		setIsTest(contactGroup.id ? (contactGroup.isTest ?? false) : false);
		setMaxWaves(defaultWaves);
		setWaveExecutionDelaySeconds(defaultWaveExecutionDelaySeconds);
		setShowMappingError(false);
	}, [contactGroup.id]);

	const isPending =
		processFileMutation?.isPending || updateContactGroupMutation.isPending;

	const validateForm = (): boolean => {
		if (!name?.trim()) {
			notifications.show({
				title: t('form.contacts.limits.notifications.invalidInput'),
				message: t('form.contacts.limits.notifications.nameRequired'),
				color: 'red',
			});
			return false;
		}

		if (!contactGroup.id && fileSummary) {
			if (!areAllSystemFieldsMapped(columnMappings || {}, systemFields)) {
				setShowMappingError(true);
				notifications.show({
					title: t('form.contacts.limits.notifications.invalidInput'),
					message: t('form.contacts.limits.notifications.mappingRequired'),
					color: 'red',
				});
				return false;
			}
		}

		if (humanEquivalent > sliderMax) {
			notifications.show({
				title: t('form.contacts.limits.notifications.invalidInput'),
				message: t('form.contacts.limits.notifications.capacityExceeded'),
				color: 'red',
			});
			return false;
		}

		if (!maxWaves || maxWaves < 1) {
			notifications.show({
				title: t('form.contacts.limits.notifications.invalidInput'),
				message: t('form.contacts.limits.notifications.wavesMinimum'),
				color: 'red',
			});
			return false;
		}

		if (waveExecutionDelaySeconds < 0) {
			notifications.show({
				title: t('form.contacts.limits.notifications.invalidInput'),
				message: t('form.contacts.limits.notifications.waveDelayMinimum'),
				color: 'red',
			});
			return false;
		}

		if (isCreatingAndFull) {
			notifications.show({
				title: t('form.contacts.limits.notifications.schedulerFullTitle'),
				message: t('form.contacts.limits.notifications.schedulerFullMessage'),
				color: 'red',
			});
			return false;
		}

		return true;
	};

	const humanEquivalentCalculations =
		useMemo((): HumanEquivalentCalculations => {
			return calculateHumanEquivalentValues(
				contactGroups?.data || [],
				activeSchedule,
				contactGroup.id
			);
		}, [contactGroups?.data, activeSchedule, contactGroup.id]);

	const { maxAvailableHumanEquivalent, isCreatingAndFull, sliderMax } =
		humanEquivalentCalculations;

	const handleSubmit = async () => {
		if (!validateForm()) return;

		try {
			if (!contactGroup.id && fileSummary?.contactGroupFileId) {
				const { fieldMapping } = transformFieldMapping(columnMappings || {});

				await processFileMutation.mutateAsync({
					contactGroupFileId: fileSummary.contactGroupFileId,
					fieldMapping,
					groupName:
						name ||
						t('form.contacts.limits.defaultName', {
							date: new Date().toLocaleDateString(),
						}),
					groupDescription: contactGroup.description || '',
					groupExpiration: new Date(
						Date.now() + 30 * 24 * 60 * 60 * 1000
					).toISOString(),
					groupMaxCallPerContact: 1,
					groupMaxCallPerGroup: 1,
					humanEquivalent,
					schedulerId: activeSchedule?.id || 0,
					voiceIds: selectedVoiceIds,
					...(fieldMapping.dynamicColumns &&
					Object.keys(fieldMapping.dynamicColumns).length > 0 &&
					selectedSchemaId > 0
						? { schemaId: selectedSchemaId }
						: {}),
					maxWaves,
					waveExecutionDelaySeconds,
					isTest,
				});

				notifications.show({
					title: t('form.contacts.limits.notifications.successTitle'),
					message: t('form.contacts.limits.notifications.saveSuccess'),
					color: 'green',
				});
			} else if (contactGroup.id) {
				await updateContactGroupMutation.mutateAsync({
					id: contactGroup.id,
					updateData: {
						name,
						description: contactGroup.description || '',
						humanEquivalent,
						voiceIds: selectedVoiceIds,
						maxWaves,
						waveExecutionDelaySeconds,
						isTest,
					},
				});

				notifications.show({
					title: t('form.contacts.limits.notifications.successTitle'),
					message: t('form.contacts.limits.notifications.updateSuccess'),
					color: 'green',
				});
			}
			setRightComponent(null);
			onComplete?.();
		} catch (error: any) {
			notifications.show({
				title: t('form.contacts.limits.notifications.errorTitle'),
				message:
					error?.response?.data?.message ||
					t('form.contacts.limits.notifications.saveError'),
				color: 'red',
			});
		}
	};

	return (
		<ContactLimitsForm
			name={name}
			setName={setName}
			selectedVoiceIds={selectedVoiceIds}
			setSelectedVoiceIds={setSelectedVoiceIds}
			isTest={isTest}
			setIsTest={setIsTest}
			campaignVoiceIds={campaignVoiceIds}
			maxWaves={maxWaves}
			setMaxWaves={setMaxWaves}
			waveExecutionDelaySeconds={waveExecutionDelaySeconds}
			setWaveExecutionDelaySeconds={setWaveExecutionDelaySeconds}
			humanEquivalent={humanEquivalent}
			setHumanEquivalent={setHumanEquivalent}
			sliderMax={sliderMax}
			maxAvailableHumanEquivalent={maxAvailableHumanEquivalent}
			isCreatingAndFull={isCreatingAndFull}
			fileSummary={fileSummary}
			columnMappings={columnMappings}
			setColumnMappings={setColumnMappings}
			selectedSchemaId={selectedSchemaId}
			setSelectedSchemaId={setSelectedSchemaId}
			showMappingError={showMappingError}
			setShowMappingError={setShowMappingError}
			systemFields={systemFields}
			objectiveId={objectiveId}
			campaignId={campaignId}
			activeSchedule={activeSchedule}
			isPending={isPending}
			onSubmit={handleSubmit}
			onComplete={onComplete}
			isEditMode={Boolean(contactGroup.id)}
			processFileError={processFileMutation.error?.message}
		/>
	);
};

export default ContactLimits;
