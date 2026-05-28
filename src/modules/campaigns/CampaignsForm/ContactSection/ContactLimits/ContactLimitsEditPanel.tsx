import { Button, Text, NumberInput, Slider, Alert, Grid } from '@mantine/core';
import { IconUser, IconSettings, IconActivity } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { SectionCard } from '~/components/SectionCard';
import { ContactListInfo } from './ContactListInfo';
import CampaignVoicePoolSelector from '~/modules/campaigns/components/CampaignVoicePoolSelector';
import CapacityProgress from '../ContactList/CapacityProgress';
import styles from './ContactLimitsEditPanel.module.css';

export type ContactLimitsEditPanelProps = {
	name: string;
	setName: (name: string) => void;
	selectedVoiceIds: string[];
	setSelectedVoiceIds: (ids: string[]) => void;
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
	campaignId?: string | number;
	activeSchedule?: { id: number } | null;
	isPending: boolean;
	onSubmit: () => void;
	onComplete?: () => void;
	waveDelayDisplay: string;
};

export const ContactLimitsEditPanel = (props: ContactLimitsEditPanelProps) => {
	const { t } = useTranslation(['campaign.form.contacts', 'common']);

	const {
		name,
		setName,
		selectedVoiceIds,
		setSelectedVoiceIds,
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
		campaignId,
		activeSchedule,
		isPending,
		onSubmit,
		onComplete,
		waveDelayDisplay,
	} = props;

	return (
		<div className={styles.panel}>
			<SectionCard
				title={t('form.contacts.limits.edit.sections.basicInfo')}
				icon={IconUser}
				contentSpacing='sm'
			>
				<ContactListInfo listName={name} onNameChange={setName} />
			</SectionCard>

			<SectionCard
				title={t('form.contacts.limits.edit.sections.voiceAndExecution')}
				icon={IconSettings}
				contentSpacing='sm'
			>
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
				<Grid gap='md'>
					<Grid.Col span={6}>
						<NumberInput
							label={t('form.contacts.limits.maxWavesLabel')}
							description={t('form.contacts.limits.maxWavesDescription')}
							value={maxWaves}
							onChange={(value) =>
								setMaxWaves(typeof value === 'number' ? value : 0)
							}
							min={1}
							step={1}
							clampBehavior='strict'
							allowNegative={false}
							allowDecimal={false}
							size='sm'
							withAsterisk
						/>
					</Grid.Col>
					<Grid.Col span={6}>
						<NumberInput
							label={t('form.contacts.limits.waveDelayLabel')}
							description={t('form.contacts.limits.waveDelayDescription', {
								value: waveDelayDisplay,
							})}
							value={waveExecutionDelaySeconds}
							onChange={(value) =>
								setWaveExecutionDelaySeconds(
									typeof value === 'number' ? value : 0
								)
							}
							min={0}
							step={30}
							clampBehavior='strict'
							allowNegative={false}
							allowDecimal={false}
							size='sm'
						/>
					</Grid.Col>
				</Grid>
			</SectionCard>

			<SectionCard
				title={t('form.contacts.limits.edit.sections.capacity')}
				icon={IconActivity}
				contentSpacing='sm'
			>
				{isCreatingAndFull && (
					<Alert color='yellow' variant='light'>
						{t('form.contacts.limits.capacityFull.message')}
					</Alert>
				)}
				<div className={styles.sliderHeader}>
					<Text size='sm' fw={500}>
						{t('form.contacts.limits.humanEquivalentLabel')}: {humanEquivalent}
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
			</SectionCard>

			<div className={styles.actions}>
				<Button variant='default' onClick={onComplete} disabled={isPending}>
					{t('cancel', { ns: 'common' })}
				</Button>
				<Button
					onClick={onSubmit}
					loading={isPending}
					disabled={isCreatingAndFull}
				>
					{t('form.contacts.limits.actions.update')}
				</Button>
			</div>
		</div>
	);
};

export default ContactLimitsEditPanel;
