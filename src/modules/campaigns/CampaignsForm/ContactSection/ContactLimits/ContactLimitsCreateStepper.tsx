import { useState } from 'react';
import {
	Stepper,
	Button,
	Group,
	Text,
	NumberInput,
	Slider,
	Alert,
	Box,
} from '@mantine/core';
import { IconUser, IconSettings, IconColumns } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { notifications } from '@mantine/notifications';
import type { MappedResult } from '~/models/ContactFileSummary';
import type { ContactFileSummary } from '~/models/ContactFileSummary';
import { ContactListInfo } from './ContactListInfo';
import CampaignVoicePoolSelector from '~/modules/campaigns/components/CampaignVoicePoolSelector';
import ColumnMappingCard, {
	areAllSystemFieldsMapped,
} from './ColumnMappingCard/ColumnMappingCard';
import CapacityProgress from '../ContactList/CapacityProgress';
import styles from './ContactLimitsCreateStepper.module.css';

type SystemField = {
	name: string;
	label: string;
	type: string;
	isArray: boolean;
	required: boolean;
};

export type ContactLimitsCreateStepperProps = {
	name: string;
	setName: (name: string) => void;
	selectedVoiceIds: string[];
	setSelectedVoiceIds: (ids: string[]) => void;
	campaignVoiceIds: string[];
	maxWaves: number;
	setMaxWaves: (value: number) => void;
	defaultWaves: number;
	waveExecutionDelaySeconds: number;
	setWaveExecutionDelaySeconds: (value: number) => void;
	defaultWaveExecutionDelaySeconds: number;
	humanEquivalent: number;
	setHumanEquivalent: (value: number) => void;
	sliderMax: number;
	maxAvailableHumanEquivalent: number;
	isCreatingAndFull: boolean;
	fileSummary?: ContactFileSummary;
	columnMappings: MappedResult;
	setColumnMappings: (mappings: MappedResult) => void;
	selectedSchemaId: number;
	setSelectedSchemaId: (id: number) => void;
	showMappingError: boolean;
	setShowMappingError: (show: boolean) => void;
	systemFields: SystemField[];
	objectiveId?: number;
	campaignId?: string | number;
	activeSchedule?: { id: number } | null;
	isPending: boolean;
	onSubmit: () => void;
	onComplete?: () => void;
	hasEditedMaxWaves: boolean;
	setHasEditedMaxWaves: (edited: boolean) => void;
	hasEditedWaveDelay: boolean;
	setHasEditedWaveDelay: (edited: boolean) => void;
	shouldShowInheritedWavesHelper: boolean;
	shouldShowInheritedWaveDelayHelper: boolean;
	waveDelayDisplay: string;
	waveUnits: Record<string, string>;
	processFileError?: string;
};

export const ContactLimitsCreateStepper = (
	props: ContactLimitsCreateStepperProps
) => {
	const { t } = useTranslation(['campaign.form.contacts', 'common']);
	const [activeStep, setActiveStep] = useState(0);

	const {
		name,
		setName,
		selectedVoiceIds,
		setSelectedVoiceIds,
		campaignVoiceIds,
		maxWaves,
		setMaxWaves,
		defaultWaves,
		waveExecutionDelaySeconds,
		setWaveExecutionDelaySeconds,
		defaultWaveExecutionDelaySeconds,
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
		systemFields,
		objectiveId,
		campaignId,
		activeSchedule,
		isPending,
		onSubmit,
		onComplete,
		setHasEditedMaxWaves,
		setHasEditedWaveDelay,
		shouldShowInheritedWavesHelper,
		shouldShowInheritedWaveDelayHelper,
		waveDelayDisplay,
		waveUnits,
		processFileError,
	} = props;

	const hasMapping = Boolean(fileSummary);
	const totalSteps = hasMapping ? 3 : 2;

	const validateCurrentStep = (): boolean => {
		if (activeStep === 0) {
			if (!name?.trim()) {
				notifications.show({
					title: t('form.contacts.limits.notifications.invalidInput'),
					message: t('form.contacts.limits.notifications.nameRequired'),
					color: 'red',
				});
				return false;
			}
		}

		if (activeStep === 1) {
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
		}

		if (activeStep === 2 && hasMapping) {
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

		return true;
	};

	const handleNext = () => {
		if (validateCurrentStep()) {
			setActiveStep((s) => Math.min(s + 1, totalSteps - 1));
		}
	};

	const handleBack = () => {
		setActiveStep((s) => Math.max(s - 1, 0));
	};

	const isLastStep = activeStep === totalSteps - 1;

	return (
		<Box>
			<Stepper
				active={activeStep}
				onStepClick={setActiveStep}
				iconSize={34}
				size='sm'
				contentPadding='0'
				classNames={{
					root: styles.stepperRoot,
					steps: styles.stepperSteps,
					stepWrapper: styles.stepWrapper,
					stepBody: styles.stepBody,
					stepLabel: styles.stepLabel,
					stepDescription: styles.stepDescription,
					stepIcon: styles.stepIcon,
					separator: styles.stepSeparator,
				}}
			>
				<Stepper.Step
					label={t('form.contacts.limits.stepper.steps.identity.label')}
					description={t(
						'form.contacts.limits.stepper.steps.identity.description'
					)}
					icon={<IconUser size={18} />}
				>
					<div className={styles.stepContent}>
						<ContactListInfo listName={name} onNameChange={setName} />
						<CampaignVoicePoolSelector
							value={selectedVoiceIds}
							onChange={setSelectedVoiceIds}
							allowedVoiceIds={campaignVoiceIds}
							label={t('form.contacts.limits.voicePoolLabel')}
							description={t('form.contacts.limits.voicePoolDescription')}
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
					</div>
				</Stepper.Step>

				<Stepper.Step
					label={t('form.contacts.limits.stepper.steps.configuration.label')}
					description={t(
						'form.contacts.limits.stepper.steps.configuration.description'
					)}
					icon={<IconSettings size={18} />}
				>
					<div className={styles.stepContent}>
						<NumberInput
							label={t('form.contacts.limits.maxWavesLabel')}
							description={
								<>
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
								</>
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
								<>
									<Text size='xs' c='dimmed'>
										{t('form.contacts.limits.waveDelayDescription', {
											value: waveDelayDisplay,
										})}
									</Text>
									{shouldShowInheritedWaveDelayHelper && (
										<Text size='xs' c='blue'>
											{t('form.contacts.limits.waveDelayInherited', {
												value: formatWaveDelay(
													defaultWaveExecutionDelaySeconds,
													waveUnits
												),
											})}
										</Text>
									)}
								</>
							}
							value={waveExecutionDelaySeconds}
							onChange={(value) => {
								setHasEditedWaveDelay(true);
								setWaveExecutionDelaySeconds(
									typeof value === 'number' ? value : 0
								);
							}}
							min={0}
							step={30}
							clampBehavior='strict'
							allowNegative={false}
							allowDecimal={false}
							size='sm'
						/>

						<div className={styles.capacitySection}>
							{isCreatingAndFull && (
								<Alert color='yellow' variant='light'>
									{t('form.contacts.limits.capacityFull.message')}
								</Alert>
							)}
							<div className={styles.sliderHeader}>
								<Text size='sm' fw={500}>
									{t('form.contacts.limits.humanEquivalentLabel')}:{' '}
									{humanEquivalent}
								</Text>
								<Text size='xs' c='dimmed'>
									{t('form.contacts.limits.availableLabel')}:{' '}
									{maxAvailableHumanEquivalent}
								</Text>
							</div>
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
							{activeSchedule && <CapacityProgress campaignId={campaignId} />}
						</div>
					</div>
				</Stepper.Step>

				{hasMapping && (
					<Stepper.Step
						label={t('form.contacts.limits.stepper.steps.mapping.label')}
						description={t(
							'form.contacts.limits.stepper.steps.mapping.description'
						)}
						icon={<IconColumns size={18} />}
					>
						<div className={styles.stepContent}>
							<ColumnMappingCard
								headers={fileSummary!.headers || []}
								onMappingChange={(mappings) => {
									setShowMappingError(false);
									setColumnMappings(mappings);
								}}
								columnMappings={columnMappings || {}}
								error={processFileError}
								onSchemaSelected={setSelectedSchemaId}
								objectiveId={objectiveId}
								selectedSchemaId={selectedSchemaId}
								showError={showMappingError}
							/>
						</div>
					</Stepper.Step>
				)}
			</Stepper>

			<div className={styles.actions}>
				<Button variant='subtle' color='gray' onClick={onComplete}>
					{t('cancel', { ns: 'common' })}
				</Button>
				<Group gap='sm'>
					{activeStep > 0 && (
						<Button variant='default' onClick={handleBack}>
							{t('form.contacts.limits.stepper.back')}
						</Button>
					)}
					{isLastStep ? (
						<Button
							onClick={onSubmit}
							loading={isPending}
							disabled={isCreatingAndFull}
						>
							{t('form.contacts.limits.actions.save')}
						</Button>
					) : (
						<Button onClick={handleNext}>
							{t('form.contacts.limits.stepper.next')}
						</Button>
					)}
				</Group>
			</div>
		</Box>
	);
};

const formatWaveDelay = (
	seconds: number,
	units: Record<string, string>
): string => {
	if (seconds === 0) return units.noDelay || 'No delay';
	const days = Math.floor(seconds / 86400);
	const hours = Math.floor((seconds % 86400) / 3600);
	const minutes = Math.floor((seconds % 3600) / 60);
	const secs = seconds % 60;
	const parts: string[] = [];
	if (days > 0) parts.push(`${days}${units.day || 'd'}`);
	if (hours > 0) parts.push(`${hours}${units.hour || 'h'}`);
	if (minutes > 0) parts.push(`${minutes}${units.minute || 'm'}`);
	if (secs > 0 && parts.length < 2) parts.push(`${secs}${units.second || 's'}`);
	return parts.slice(0, 2).join(' ');
};

export default ContactLimitsCreateStepper;
