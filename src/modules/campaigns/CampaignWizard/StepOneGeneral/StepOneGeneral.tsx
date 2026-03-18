import { isAxiosError } from 'axios';
import { useTranslation } from 'react-i18next';
import React, { useState } from 'react';
import {
	TextInput,
	Textarea,
	Box,
	Text,
	Stack,
	SegmentedControl,
	Select,
	Button,
	Group,
	NumberInput,
	Modal,
	ActionIcon,
	Tooltip,
	Input,
	Alert,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { useCampaignWizardStore } from '~/stores/campaignWizardStore';
import PhoneNumberSelector from '../../AddNewCampaignForm/PhoneNumberSelector';
import {
	useCreateCampaignWithAgent,
	useSetCampaignDraft,
} from '~/queries/campaignsQueries';
import { CampaignStatus } from '~/models/CampaignStatus';
import type { CampaignObjective } from '~/models/CampaignObjectiveModel';
import type { CreateCampaignWithAgentDTO } from '~/api/campaignsApi';
import styles from '../CampaignWizard.module.css';
import { useGetCampaignObjectives } from '~/queries/campaignObjectivesQueries';
import { useGetAllAgentVoices } from '~/queries/agentVoiceQueries';
import { CampaignObjectivesForm } from '~/modules/campaign-management/campaign-objectives/components/CampaignObjectivesForm/CampaignObjectivesForm';
import {
	IconPlus,
	IconAlertCircle,
	IconPhoneOutgoing,
	IconPhoneIncoming,
} from '@tabler/icons-react';
import { useQueryClient } from '@tanstack/react-query';

interface StepOneGeneralProps {
	onNext: () => void;
	onCancel: () => void;
}

export const StepOneGeneral: React.FC<StepOneGeneralProps> = ({
	onNext,
	onCancel,
}) => {
	const { t } = useTranslation([
		'campaigns.wizard',
		'campaign.form.shared',
		'common',
	]);
	type CampaignTypeValue = 'INBOUND' | 'OUTBOUND';

	const {
		campaignName,
		description,
		campaignType,
		phoneNumberId,
		objectiveId,
		setCampaignName,
		setDescription,
		setCampaignType,
		setPhoneNumberId,
		setObjectiveId,
		defaultMaxWaves,
		setDefaultMaxWaves,
		defaultWaveExecutionDelaySeconds,
		setDefaultWaveExecutionDelaySeconds,
		setCreatedCampaign,
		setIsSubmitting,
	} = useCampaignWizardStore();

	const [isObjectiveModalOpen, setIsObjectiveModalOpen] = useState(false);
	const queryClient = useQueryClient();

	const createCampaignWithAgent = useCreateCampaignWithAgent();
	const { mutateAsync: setDraft } = useSetCampaignDraft();
	const { data: objectivesResponse } = useGetCampaignObjectives({
		active: true,
	});
	const { data: voicesResponse } = useGetAllAgentVoices();

	const form = useForm({
		initialValues: {
			campaignName,
			description,
			campaignType,
			phoneNumberId,
			objectiveId,
			defaultMaxWaves,
			defaultWaveExecutionDelaySeconds,
		},
		validate: {
			campaignName: (value: string) =>
				value.trim().length < 2
					? t('wizard.steps.general.validation.nameRequired')
					: null,
			description: (value: string) =>
				value.trim().length < 2
					? t('wizard.steps.general.validation.descriptionRequired')
					: null,
			phoneNumberId: (value: number | null) =>
				!value ? t('wizard.steps.general.validation.phoneIdRequired') : null,
			defaultMaxWaves: (value: number, values) =>
				values.campaignType === 'OUTBOUND' && (!value || value < 1)
					? t('wizard.steps.general.validation.wavesRequired')
					: null,
			defaultWaveExecutionDelaySeconds: (value: number, values) =>
				values.campaignType === 'OUTBOUND' && value < 0
					? t('wizard.steps.general.validation.waveDelayRequired')
					: null,
			objectiveId: (value: number | null, values) =>
				values.campaignType === 'OUTBOUND' && !value
					? t('wizard.steps.general.validation.objectiveRequired')
					: null,
		},
		validateInputOnChange: true,
	});

	const handleSubmit = async (values: typeof form.values) => {
		setIsSubmitting(true);

		// Get default voice (first available voice)
		const defaultVoiceId =
			voicesResponse && voicesResponse.length > 0
				? voicesResponse[0].voice.id
				: '';

		if (!defaultVoiceId) {
			setIsSubmitting(false);
			notifications.show({
				title: t('common:status.error'),
				message: t('wizard.steps.general.errorVoices'),
				color: 'red',
			});
			return;
		}

		// Generate agent name from campaign name (hidden from user)
		const agentName = values.campaignName;

		// Build the conversationConfig.agent object with the phone number
		const agentConfig: Record<string, unknown> = {};

		if (values.phoneNumberId) {
			if (values.campaignType === 'OUTBOUND') {
				agentConfig.outboundPhoneNumberId = values.phoneNumberId;
			} else if (values.campaignType === 'INBOUND') {
				agentConfig.inboundPhoneNumberId = values.phoneNumberId;
			}
		}

		const isOutboundType = values.campaignType === 'OUTBOUND';

		const dto: CreateCampaignWithAgentDTO = {
			campaign: {
				name: values.campaignName,
				description: values.description,
				budget: 500,
				spent: 0,
				type: values.campaignType,
				campaignExecutionType: 'TIME_BASED',
				status: CampaignStatus.INACTIVE,
				...(isOutboundType && {
					defaultMaxWaves: values.defaultMaxWaves || 3,
					defaultWaveExecutionDelaySeconds:
						values.defaultWaveExecutionDelaySeconds || 0,
					objectiveId: values.objectiveId!,
				}),
			},
			agent: {
				conversationConfig: {
					agent: agentConfig,
				},
				platformSettings: {},
				name: agentName,
				type: values.campaignType,
				voiceId: defaultVoiceId,
			},
		};

		createCampaignWithAgent.mutate(dto, {
			onSuccess: (data: unknown) => {
				const response = data as { campaign?: Record<string, unknown> };
				const campaign = response?.campaign || data;

				// Update store with values and created campaign
				setCampaignName(values.campaignName);
				setDescription(values.description);
				setCampaignType(values.campaignType);
				setPhoneNumberId(values.phoneNumberId);
				setObjectiveId(isOutboundType ? values.objectiveId : null);
				setDefaultMaxWaves(isOutboundType ? values.defaultMaxWaves || 3 : 3);
				setDefaultWaveExecutionDelaySeconds(
					isOutboundType ? values.defaultWaveExecutionDelaySeconds || 0 : 0
				);
				setCreatedCampaign(campaign as any);
				setIsSubmitting(false);

				notifications.show({
					title: t('wizard.steps.general.successCreatedTitle'),
					message: t('wizard.steps.general.successCreatedMessage'),
					color: 'green',
				});

				// Save draft step as 1 (Agent Step)
				setDraft({
					campaignId: String((campaign as any).id),
					data: { isDraft: true, draftStep: 1 },
				}).catch(() => undefined);

				// Proceed to next step
				onNext();
			},
			onError: (error) => {
				setIsSubmitting(false);

				let errorMessage = t('form.notifications.errorCreate');
				if (isAxiosError(error) && error.response?.data?.message) {
					errorMessage = error.response.data.message;
				} else if (error instanceof Error) {
					errorMessage = error.message;
				}

				notifications.show({
					title: t('common:status.error'),
					message: errorMessage,
					color: 'red',
				});
			},
		});
	};

	const handleObjectiveCreated = (objective?: CampaignObjective) => {
		setIsObjectiveModalOpen(false);
		queryClient.invalidateQueries({ queryKey: ['campaignObjectives'] });
		if (objective) {
			form.setFieldValue('objectiveId', objective.id);
		}
	};

	const handleCampaignTypeChange = (value: string) => {
		if (value !== 'INBOUND' && value !== 'OUTBOUND') return;
		const nextValue: CampaignTypeValue = value;
		form.setFieldValue('campaignType', nextValue);
		form.setFieldValue('phoneNumberId', null);
		// Clear outbound-only fields when switching to inbound
		if (nextValue === 'INBOUND') {
			form.setFieldValue('objectiveId', null);
			form.setFieldValue('defaultMaxWaves', 3);
			form.setFieldValue('defaultWaveExecutionDelaySeconds', 0);
		}
		setCampaignType(nextValue);
	};

	const isFormOutbound = form.values.campaignType === 'OUTBOUND';

	return (
		<>
			<form onSubmit={form.onSubmit(handleSubmit)}>
				<Stack gap='xl' className={styles.stepSurface}>
					<Box className={styles.stepHeaderCard}>
						<Text className={styles.stepEyebrow}>
							{t('wizard.steps.general.eyebrow')}
						</Text>
						<Text className={styles.stepTitle}>
							{t('wizard.steps.general.title')}
						</Text>
						<Text className={styles.stepDescriptionText}>
							{t('wizard.steps.general.intro')}
						</Text>
					</Box>

					<div className={styles.sectionGrid}>
						{/* Campaign Type Selector — top-level decision */}
						<Box className={styles.campaignTypeCard}>
							<div className={styles.sectionHeading}>
								<Text className={styles.sectionHeadingTitle}>
									{t('wizard.steps.general.campaignType')}
								</Text>
								<Text className={styles.sectionHeadingDescription}>
									{t('wizard.steps.general.campaignTypeDesc')}
								</Text>
							</div>
							<SegmentedControl
								data={[
									{
										value: 'OUTBOUND',
										label: (
											<Group gap={6} justify='center'>
												<IconPhoneOutgoing size={16} />
												<span>{t('columns.outbound')}</span>
											</Group>
										),
									},
									{
										value: 'INBOUND',
										label: (
											<Group gap={6} justify='center'>
												<IconPhoneIncoming size={16} />
												<span>{t('columns.inbound')}</span>
											</Group>
										),
									},
								]}
								value={form.values.campaignType}
								onChange={handleCampaignTypeChange}
								fullWidth
								className={styles.segmentedControl}
							/>
						</Box>

						{/* Identity Card */}
						<Box className={styles.wizardCard}>
							<div className={styles.sectionHeading}>
								<Text className={styles.sectionHeadingTitle}>
									{t('wizard.steps.general.identityTitle')}
								</Text>
								<Text className={styles.sectionHeadingDescription}>
									{t('wizard.steps.general.identityDesc')}
								</Text>
							</div>
							<Stack gap='md'>
								<TextInput
									label={t('wizard.steps.general.campaignName')}
									description={t('wizard.steps.general.campaignNameDesc')}
									placeholder={t(
										'wizard.steps.general.campaignNamePlaceholder'
									)}
									withAsterisk
									className={styles.field}
									{...form.getInputProps('campaignName')}
								/>

								<Textarea
									label={t('wizard.steps.general.description')}
									description={t('wizard.steps.general.descriptionDesc')}
									placeholder={t('wizard.steps.general.descriptionPlaceholder')}
									withAsterisk
									className={styles.field}
									{...form.getInputProps('description')}
									minRows={3}
									rows={3}
								/>
							</Stack>
						</Box>

						{/* Routing Card */}
						<Box className={styles.wizardCardRouting}>
							<div className={styles.sectionHeading}>
								<Text className={styles.sectionHeadingTitle}>
									{t('wizard.steps.general.routingTitle')}
								</Text>
								<Text className={styles.sectionHeadingDescription}>
									{isFormOutbound
										? t('wizard.steps.general.routingDesc')
										: t('wizard.steps.general.routingDescInbound')}
								</Text>
							</div>
							<Stack gap='md'>
								<PhoneNumberSelector
									campaignType={form.values.campaignType}
									value={form.values.phoneNumberId}
									onChange={(value) =>
										form.setFieldValue('phoneNumberId', value)
									}
									label={t('wizard.steps.general.phoneNumber')}
									description={t('wizard.steps.general.phoneNumberDesc')}
									placeholder={t('wizard.steps.general.phoneNumberPlaceholder')}
									withAsterisk
								/>

								{isFormOutbound && (
									<>
										<Input.Wrapper
											label={t('wizard.steps.general.objective')}
											description={t('wizard.steps.general.objectiveDesc')}
											error={form.errors.objectiveId}
											withAsterisk
											className={styles.field}
										>
											<Group gap='xs'>
												<Select
													placeholder={t(
														'wizard.steps.general.objectivePlaceholder'
													)}
													data={
														objectivesResponse?.data?.map((obj) => ({
															value: obj.id.toString(),
															label: obj.name,
														})) || []
													}
													value={form.values.objectiveId?.toString() || null}
													onChange={(value) =>
														form.setFieldValue(
															'objectiveId',
															value ? parseInt(value, 10) : null
														)
													}
													searchable
													clearable
													error={!!form.errors.objectiveId}
													style={{ flex: 1 }}
												/>
												<Tooltip
													label={t('wizard.steps.general.createObjective')}
												>
													<ActionIcon
														variant='light'
														color='blue'
														size='lg'
														onClick={() => setIsObjectiveModalOpen(true)}
													>
														<IconPlus size={20} />
													</ActionIcon>
												</Tooltip>
											</Group>
										</Input.Wrapper>

										<NumberInput
											label={t('wizard.steps.general.defaultWaves')}
											description={t('wizard.steps.general.defaultWavesDesc')}
											min={1}
											step={1}
											clampBehavior='strict'
											allowDecimal={false}
											allowNegative={false}
											withAsterisk
											size='sm'
											{...form.getInputProps('defaultMaxWaves')}
										/>

										<NumberInput
											label={t('wizard.steps.general.defaultWaveDelay')}
											description={t(
												'wizard.steps.general.defaultWaveDelayDesc'
											)}
											min={0}
											step={30}
											clampBehavior='strict'
											allowDecimal={false}
											allowNegative={false}
											size='sm'
											{...form.getInputProps(
												'defaultWaveExecutionDelaySeconds'
											)}
										/>
									</>
								)}
							</Stack>
						</Box>
					</div>

					{createCampaignWithAgent.isError && (
						<Alert
							variant='light'
							color='red'
							title={t('wizard.steps.general.alertTitle')}
							icon={<IconAlertCircle />}
						>
							{t('wizard.steps.general.alertMessage')}
						</Alert>
					)}
				</Stack>

				<Group className={styles.actions}>
					<Button variant='default' onClick={onCancel}>
						{t('actions.cancel', { ns: 'common' })}
					</Button>
					<Button
						type='submit'
						loading={createCampaignWithAgent.isPending}
						disabled={!form.isValid()}
					>
						{t('wizard.steps.general.submit')}
					</Button>
				</Group>
			</form>

			<Modal
				opened={isObjectiveModalOpen}
				onClose={() => setIsObjectiveModalOpen(false)}
				title={t('wizard.steps.general.modalCreateObjective')}
				centered
				size='xl'
			>
				<CampaignObjectivesForm
					onSuccess={handleObjectiveCreated}
					onCancel={() => setIsObjectiveModalOpen(false)}
				/>
			</Modal>
		</>
	);
};
