import { useMemo, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
	Stack,
	Box,
	LoadingOverlay,
	Group,
	Button,
	Text,
	Slider,
	Alert,
	NumberInput,
} from '@mantine/core';
import { IconInfoCircle } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import type {
	ContactFileSummary,
	MappedResult,
} from '~/models/ContactFileSummary';
import { useProcessContactGroupFile } from '~/queries/contactGroupFilesQueries';
import { ContactListInfo } from './ContactListInfo';
import type ContactGroup from '~/models/ContactGroup';
import ColumnMappingCard, {
	areAllSystemFieldsMapped,
} from './ColumnMappingCard/ColumnMappingCard';
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
import CapacityProgress from '../ContactList/CapacityProgress';
import { useCampaignsStore } from '~/stores/campaignsStore';
import { formatWaveDelaySeconds } from '~/utils/waveUtils';

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
	const [data, setData] = useState<{
		name: string;
		description: string;
		columnMappings: MappedResult;
	}>({
		name: contactGroup.name || '',
		description: contactGroup.description || '',
		columnMappings: {} as MappedResult,
	});

	// Track the selected schema ID for dynamic columns
	const [selectedSchemaId, setSelectedSchemaId] = useState<number>(0);
	const [humanEquivalent, setHumanEquivalent] = useState<number>(
		contactGroup.humanEquivalent || 1
	);
	const defaultWaves = useMemo(() => {
		return (
			contactGroup.maxWaves ??
			selectedCampaign?.defaultMaxWaves ??
			campaign?.defaultMaxWaves ??
			3
		);
	}, [
		campaign?.defaultMaxWaves,
		contactGroup.maxWaves,
		selectedCampaign?.defaultMaxWaves,
	]);
	const [maxWaves, setMaxWaves] = useState<number>(defaultWaves);
	const defaultWaveExecutionDelaySeconds = useMemo(() => {
		return (
			contactGroup.waveExecutionDelaySeconds ??
			selectedCampaign?.defaultWaveExecutionDelaySeconds ??
			campaign?.defaultWaveExecutionDelaySeconds ??
			0
		);
	}, [
		campaign?.defaultWaveExecutionDelaySeconds,
		contactGroup.waveExecutionDelaySeconds,
		selectedCampaign?.defaultWaveExecutionDelaySeconds,
	]);
	const [waveExecutionDelaySeconds, setWaveExecutionDelaySeconds] =
		useState<number>(defaultWaveExecutionDelaySeconds);
	const [hasEditedMaxWaves, setHasEditedMaxWaves] = useState(false);
	const [hasEditedWaveDelay, setHasEditedWaveDelay] = useState(false);

	// Track whether mapping validation has failed (to show error styling)
	const [showMappingError, setShowMappingError] = useState(false);

	// Fetch system columns from client config for validation
	const { data: systemConfig } = useGetClientConfig('contact_columns');

	// Parse system columns from config
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

	// Sync state when contactGroup prop changes
	useEffect(() => {
		setData((prev) => ({
			...prev,
			name: contactGroup.name || '',
			description: contactGroup.description || '',
		}));
	}, [contactGroup.name, contactGroup.description]);

	useEffect(() => {
		setHumanEquivalent(contactGroup.humanEquivalent || 1);
	}, [contactGroup.humanEquivalent]);

	useEffect(() => {
		setMaxWaves(defaultWaves);
	}, [defaultWaves]);

	useEffect(() => {
		setWaveExecutionDelaySeconds(defaultWaveExecutionDelaySeconds);
	}, [defaultWaveExecutionDelaySeconds]);

	useEffect(() => {
		setHasEditedMaxWaves(false);
		setHasEditedWaveDelay(false);
	}, [
		contactGroup.id,
		contactGroup.maxWaves,
		contactGroup.waveExecutionDelaySeconds,
	]);

	// Handle form field changes
	const handleChange = <K extends keyof typeof data>(
		field: K,
		value: (typeof data)[K]
	) => {
		setData((prev) => ({
			...prev,
			[field]: value,
		}));
	};

	// Validate form data
	const validateForm = (): boolean => {
		// Name is always required
		if (!data.name?.trim()) {
			notifications.show({
				title: t('form.contacts.limits.notifications.invalidInput'),
				message: t('form.contacts.limits.notifications.nameRequired'),
				color: 'red',
			});
			return false;
		}

		// Validate column mappings when creating a new contact group
		// Only system fields are required (except phones), dynamic fields are optional
		if (!contactGroup.id && fileSummary) {
			if (!areAllSystemFieldsMapped(data.columnMappings || {}, systemFields)) {
				setShowMappingError(true);
				notifications.show({
					title: t('form.contacts.limits.notifications.invalidInput'),
					message: t('form.contacts.limits.notifications.mappingRequired'),
					color: 'red',
				});
				return false;
			}
		}

		// Validate human equivalent doesn't exceed available capacity
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

		// Prevent creating when scheduler is full
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
		// Validate form before submission
		if (!validateForm()) {
			return;
		}

		try {
			if (!contactGroup.id && fileSummary?.contactGroupFileId) {
				// Transform field mapping to separate dynamic columns
				const { fieldMapping } = transformFieldMapping(
					data.columnMappings || {}
				);

				await processFileMutation.mutateAsync({
					contactGroupFileId: fileSummary.contactGroupFileId,
					fieldMapping,
					groupName:
						data.name ||
						t('form.contacts.limits.defaultName', {
							date: new Date().toLocaleDateString(),
						}),
					groupDescription: data.description || '',
					groupExpiration: new Date(
						Date.now() + 30 * 24 * 60 * 60 * 1000
					).toISOString(), // 30 days from now
					groupMaxCallPerContact: 1,
					groupMaxCallPerGroup: 1,
					humanEquivalent: humanEquivalent,
					schedulerId: activeSchedule?.id || 0,
					...(fieldMapping.dynamicColumns &&
					Object.keys(fieldMapping.dynamicColumns).length > 0 &&
					selectedSchemaId > 0
						? { schemaId: selectedSchemaId }
						: {}),
					maxWaves,
					waveExecutionDelaySeconds,
				});

				notifications.show({
					title: t('form.contacts.limits.notifications.successTitle'),
					message: t('form.contacts.limits.notifications.saveSuccess'),
					color: 'green',
				});
			} else if (contactGroup.id) {
				// Update existing contact group
				await updateContactGroupMutation.mutateAsync({
					id: contactGroup.id,
					updateData: {
						name: data.name,
						description: data.description,
						humanEquivalent,
						maxWaves,
						waveExecutionDelaySeconds,
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
			const errorMessage =
				error?.response?.data?.message ||
				t('form.contacts.limits.notifications.saveError');
			notifications.show({
				title: t('form.contacts.limits.notifications.errorTitle'),
				message: errorMessage,
				color: 'red',
			});
		}
	};

	const shouldShowInheritedWavesHelper =
		!contactGroup.id && contactGroup.maxWaves == null && !hasEditedMaxWaves;
	const shouldShowInheritedWaveDelayHelper =
		!contactGroup.id &&
		contactGroup.waveExecutionDelaySeconds == null &&
		!hasEditedWaveDelay;
	const waveDelayDisplay = formatWaveDelaySeconds(waveExecutionDelaySeconds, {
		day: t('units.day', { ns: 'common' }),
		hour: t('units.hour', { ns: 'common' }),
		minute: t('units.minute', { ns: 'common' }),
		second: t('units.second', { ns: 'common' }),
		noDelay: t('form.contacts.limits.noWaveDelay'),
		notSet: t('form.contacts.details.stats.notSet'),
	});

	return (
		<Box pos='relative'>
			<LoadingOverlay
				visible={
					processFileMutation?.isPending || updateContactGroupMutation.isPending
				}
				zIndex={1000}
				overlayProps={{ radius: 'sm', blur: 2 }}
				loaderProps={{ type: 'bars' }}
			/>
			<Stack gap='md'>
				{/* Contact list information */}
				<ContactListInfo
					listName={data?.name}
					onNameChange={(name) => {
						handleChange('name', name);
					}}
				/>
				<NumberInput
					label={t('form.contacts.limits.maxWavesLabel')}
					description={
						<Stack gap={2}>
							<Text size='xs' c='dimmed'>
								{t('form.contacts.limits.maxWavesDescription')}
							</Text>
							{shouldShowInheritedWavesHelper && (
								<Text size='xs' c='blue'>
									{t('form.contacts.limits.maxWavesInherited', {
										value: defaultWaves,
									})}
								</Text>
							)}
						</Stack>
					}
					value={maxWaves}
					onChange={(value) => {
						setHasEditedMaxWaves(true);
						setMaxWaves(typeof value === 'number' ? value : 0);
					}}
					min={1}
					step={1}
					clampBehavior='strict'
					allowNegative={false}
					allowDecimal={false}
					size='sm'
					withAsterisk
				/>
				<NumberInput
					label={t('form.contacts.limits.waveDelayLabel')}
					description={
						<Stack gap={2}>
							<Text size='xs' c='dimmed'>
								{t('form.contacts.limits.waveDelayDescription', {
									value: waveDelayDisplay,
								})}
							</Text>
							{shouldShowInheritedWaveDelayHelper && (
								<Text size='xs' c='blue'>
									{t('form.contacts.limits.waveDelayInherited', {
										value: formatWaveDelaySeconds(
											defaultWaveExecutionDelaySeconds,
											{
												day: t('units.day', { ns: 'common' }),
												hour: t('units.hour', { ns: 'common' }),
												minute: t('units.minute', { ns: 'common' }),
												second: t('units.second', { ns: 'common' }),
												noDelay: t('form.contacts.limits.noWaveDelay'),
												notSet: t('form.contacts.details.stats.notSet'),
											}
										),
									})}
								</Text>
							)}
						</Stack>
					}
					value={waveExecutionDelaySeconds}
					onChange={(value) => {
						setHasEditedWaveDelay(true);
						setWaveExecutionDelaySeconds(typeof value === 'number' ? value : 0);
					}}
					min={0}
					step={30}
					clampBehavior='strict'
					allowNegative={false}
					allowDecimal={false}
					size='sm'
				/>
				{/* Human Equivalent Slider */}
				{isCreatingAndFull && (
					<Alert
						icon={<IconInfoCircle size={16} />}
						title={t('form.contacts.limits.capacityFull.title')}
						color='yellow'
					>
						{t('form.contacts.limits.capacityFull.message')}
					</Alert>
				)}
				<Box>
					<Group justify='space-between' mb='xs'>
						<Text size='sm' fw={500}>
							{t('form.contacts.limits.humanEquivalentLabel')}:{' '}
							{humanEquivalent}
						</Text>
						<Text size='xs' c='dimmed'>
							{t('form.contacts.limits.availableLabel')}:{' '}
							{maxAvailableHumanEquivalent}
						</Text>
					</Group>
					<Slider
						value={humanEquivalent}
						onChange={setHumanEquivalent}
						min={1}
						max={sliderMax}
						step={1}
						label={(value) => `${value}`}
						size='md'
						disabled={isCreatingAndFull}
					/>
				</Box>

				{activeSchedule && <CapacityProgress campaignId={campaignId} />}

				{/*Column Mapper*/}
				{fileSummary && !contactGroup?.id && (
					<ColumnMappingCard
						headers={fileSummary.headers || []}
						onMappingChange={(columnMappings) => {
							setShowMappingError(false);
							handleChange('columnMappings', columnMappings);
						}}
						columnMappings={data?.columnMappings || {}}
						error={processFileMutation.error?.message}
						onSchemaSelected={setSelectedSchemaId}
						objectiveId={objectiveId}
						selectedSchemaId={selectedSchemaId}
						showError={showMappingError}
					/>
				)}
				<Group justify='flex-end' mt='md'>
					<Button
						variant='outline'
						onClick={() => onComplete?.()}
						disabled={
							processFileMutation.isPending ||
							updateContactGroupMutation.isPending
						}
					>
						{t('cancel', { ns: 'common' })}
					</Button>
					<Button
						onClick={handleSubmit}
						loading={
							processFileMutation.isPending ||
							updateContactGroupMutation.isPending
						}
						disabled={
							processFileMutation.isPending ||
							updateContactGroupMutation.isPending ||
							isCreatingAndFull
						}
					>
						{contactGroup.id
							? t('form.contacts.limits.actions.update')
							: t('form.contacts.limits.actions.save')}
					</Button>
				</Group>
			</Stack>
		</Box>
	);
};

export default ContactLimits;
