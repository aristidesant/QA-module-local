import {
	Stack,
	TextInput,
	Slider,
	Alert,
	Button,
	Text,
	Group,
	NumberInput,
	Select,
	Switch,
} from '@mantine/core';
import { IconAlertTriangle } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import CampaignVoicePoolSelector from '~/modules/campaigns/components/CampaignVoicePoolSelector';
import ColumnMappingCard from './ColumnMappingCard/ColumnMappingCard';
import CapacityProgress from '../ContactList/CapacityProgress';
import type {
	MappedResult,
	ContactFileSummary,
} from '~/models/ContactFileSummary';
import styles from './ContactLimitsForm.module.css';

type SystemField = {
	name: string;
	label: string;
	type: string;
	isArray: boolean;
	required: boolean;
};

const DELAY_OPTIONS = [
	{ value: '0', label: 'No delay' },
	{ value: '900', label: '15 minutes' },
	{ value: '1800', label: '30 minutes' },
	{ value: '3600', label: '1 hour' },
	{ value: '7200', label: '2 hours' },
	{ value: '14400', label: '4 hours' },
	{ value: '28800', label: '8 hours' },
	{ value: '86400', label: '1 day' },
];

const DELAY_SECONDS = DELAY_OPTIONS.map((o) => Number(o.value));

function snapDelay(seconds: number): string {
	let closest = DELAY_SECONDS[0];
	for (const s of DELAY_SECONDS) {
		if (Math.abs(seconds - s) < Math.abs(seconds - closest)) closest = s;
	}
	return String(closest);
}

export type ContactLimitsFormProps = {
	name: string;
	setName: (name: string) => void;
	selectedVoiceIds: string[];
	setSelectedVoiceIds: (ids: string[]) => void;
	isTest: boolean;
	setIsTest: (value: boolean) => void;
	campaignVoiceIds: string[];
	maxWaves: number;
	setMaxWaves: (value: number) => void;
	waveExecutionDelaySeconds: number;
	setWaveExecutionDelaySeconds: (value: number) => void;
	humanEquivalent: number;
	setHumanEquivalent: (value: number) => void;
	sliderMax: number;
	maxAvailableHumanEquivalent: number;
	isCreatingAndFull: boolean;
	fileSummary?: ContactFileSummary;
	columnMappings?: MappedResult;
	setColumnMappings?: (mappings: MappedResult) => void;
	selectedSchemaId?: number;
	setSelectedSchemaId?: (id: number) => void;
	showMappingError?: boolean;
	setShowMappingError?: (show: boolean) => void;
	systemFields?: SystemField[];
	objectiveId?: number;
	processFileError?: string;
	campaignId?: string | number;
	activeSchedule?: { id: number } | null;
	isPending: boolean;
	onSubmit: () => void;
	onComplete?: () => void;
	isEditMode?: boolean;
};

export const ContactLimitsForm = ({
	name,
	setName,
	selectedVoiceIds,
	setSelectedVoiceIds,
	isTest,
	setIsTest,
	campaignVoiceIds,
	maxWaves,
	setMaxWaves,
	waveExecutionDelaySeconds,
	setWaveExecutionDelaySeconds,
	humanEquivalent,
	setHumanEquivalent,
	sliderMax,
	maxAvailableHumanEquivalent,
	isCreatingAndFull,
	fileSummary,
	columnMappings,
	setColumnMappings,
	selectedSchemaId,
	setSelectedSchemaId,
	showMappingError,
	setShowMappingError,
	objectiveId,
	processFileError,
	campaignId,
	activeSchedule,
	isPending,
	onSubmit,
	onComplete,
	isEditMode = false,
}: ContactLimitsFormProps) => {
	const { t } = useTranslation(['campaign.form.contacts', 'common']);

	const delayValue = snapDelay(waveExecutionDelaySeconds);
	const hasMapping = Boolean(fileSummary);

	return (
		<Stack gap='md' className={styles.form}>
			<TextInput
				label={t('form.contacts.limits.form.nameLabel')}
				placeholder={t('form.contacts.limits.form.namePlaceholder')}
				value={name}
				onChange={(e) =>
					setName(
						e.currentTarget.value
							.replace(/[^A-Za-z\s\d-]/g, '')
							.replace(/\s+/g, ' ')
							.slice(0, 50)
					)
				}
				maxLength={50}
				size='sm'
				withAsterisk
				autoComplete='off'
			/>

			<CampaignVoicePoolSelector
				value={selectedVoiceIds}
				onChange={setSelectedVoiceIds}
				allowedVoiceIds={campaignVoiceIds}
				label={t('form.contacts.limits.voicePoolLabel')}
				description=''
				placeholder={t('form.contacts.limits.voicePoolPlaceholder')}
				hint={
					campaignVoiceIds.length > 0
						? t('form.contacts.limits.voicePoolHint', {
								count: campaignVoiceIds.length,
							})
						: undefined
				}
				noVoicesMessage={
					campaignVoiceIds.length > 0
						? t('form.contacts.limits.voicePoolNoVoices')
						: t('form.contacts.limits.voicePoolNoCampaignVoices')
				}
				noMatchesMessage={t('form.contacts.limits.voicePoolNoMatches')}
				loadErrorTitle={t('form.contacts.limits.voicePoolLoadErrorTitle')}
				loadErrorDescription={t(
					'form.contacts.limits.voicePoolLoadErrorDescription'
				)}
			/>

			<div>
				<Text className={styles.sectionLabel}>
					{t('form.contacts.limits.sections.calling')}
				</Text>
				<div className={styles.callingBox}>
					<div className={styles.wavesRow}>
						<NumberInput
							label={t('form.contacts.limits.maxWavesLabel')}
							value={maxWaves}
							onChange={(value) =>
								setMaxWaves(typeof value === 'number' ? value : 1)
							}
							min={1}
							step={1}
							clampBehavior='strict'
							allowNegative={false}
							allowDecimal={false}
							size='sm'
							withAsterisk
						/>

						<Select
							label={t('form.contacts.limits.waveDelayLabel')}
							data={DELAY_OPTIONS}
							value={delayValue}
							onChange={(val) =>
								setWaveExecutionDelaySeconds(val ? Number(val) : 0)
							}
							size='sm'
							allowDeselect={false}
						/>
					</div>
				</div>
			</div>

			<div>
				<Text className={styles.sectionLabel}>
					{t('form.contacts.limits.sections.capacity')}
				</Text>
				<div className={styles.capacityBox}>
					<Group justify='space-between' mb={8}>
						<Text size='xs' c='dimmed'>
							{humanEquivalent} {t('form.contacts.limits.sections.allocated')}
						</Text>
						<Text size='xs' c='dimmed'>
							{maxAvailableHumanEquivalent}{' '}
							{t('form.contacts.limits.availableLabel')}
						</Text>
					</Group>
					<Slider
						value={humanEquivalent}
						onChange={setHumanEquivalent}
						min={1}
						max={sliderMax}
						step={1}
						label={(value) => `${value}`}
						size='sm'
						disabled={isCreatingAndFull}
					/>
					<Switch
						label={t('form.contacts.limits.isTestLabel')}
						description={t('form.contacts.limits.isTestDescription')}
						checked={isTest}
						onChange={(event) => setIsTest(event.currentTarget.checked)}
						size='sm'
						mt='md'
					/>
					{activeSchedule && (
						<div className={styles.capacityProgress}>
							<CapacityProgress campaignId={campaignId} />
						</div>
					)}
				</div>
			</div>

			{isCreatingAndFull && (
				<Alert
					icon={<IconAlertTriangle size={16} />}
					color='yellow'
					variant='light'
					p='sm'
				>
					{t('form.contacts.limits.capacityFull.message')}
				</Alert>
			)}

			{hasMapping && (
				<div>
					<Text className={styles.sectionLabel}>
						{t('form.contacts.limits.sections.mapping')}
					</Text>
					<ColumnMappingCard
						headers={fileSummary!.headers || []}
						onMappingChange={(mappings) => {
							setShowMappingError?.(false);
							setColumnMappings?.(mappings);
						}}
						columnMappings={columnMappings || ({} as MappedResult)}
						error={processFileError}
						onSchemaSelected={(id) => setSelectedSchemaId?.(id)}
						objectiveId={objectiveId}
						selectedSchemaId={selectedSchemaId ?? 0}
						showError={showMappingError}
					/>
				</div>
			)}

			<div className={styles.actions}>
				<Button
					variant='default'
					onClick={onComplete}
					disabled={isPending}
					size='sm'
				>
					{t('cancel', { ns: 'common' })}
				</Button>
				<Button
					onClick={onSubmit}
					loading={isPending}
					disabled={isCreatingAndFull}
					size='sm'
				>
					{isEditMode
						? t('form.contacts.limits.actions.update')
						: t('form.contacts.limits.actions.save')}
				</Button>
			</div>
		</Stack>
	);
};

export default ContactLimitsForm;
