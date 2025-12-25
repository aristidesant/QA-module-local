import { isAxiosError } from 'axios';
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
import { IconPlus, IconAlertCircle } from '@tabler/icons-react';
import { useQueryClient } from '@tanstack/react-query';

interface StepOneGeneralProps {
	onNext: () => void;
	onCancel: () => void;
}

export const StepOneGeneral: React.FC<StepOneGeneralProps> = ({
	onNext,
	onCancel,
}) => {
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
		},
		validate: {
			campaignName: (value: string) =>
				value.trim().length < 2 ? 'Campaign name is required' : null,
			description: (value: string) =>
				value.trim().length < 2 ? 'Description is required' : null,
			phoneNumberId: (value: number | null) =>
				!value ? 'Phone number is required' : null,
			defaultMaxWaves: (value: number) =>
				!value || value < 1 ? 'Waves must be at least 1' : null,
			objectiveId: (value: number | null) =>
				!value ? 'Campaign objective is required' : null,
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
				title: 'Error',
				message: 'No agent voices available. Please contact support.',
				color: 'red',
				// ...
			});
			return;
		}

		// Generate agent name from campaign name (hidden from user)
		const agentName = values.campaignName;

		// Build the conversationConfig.agent object with the phone number
		const agentConfig: any = {};

		if (values.phoneNumberId) {
			if (values.campaignType === 'OUTBOUND') {
				agentConfig.outboundPhoneNumberId = values.phoneNumberId;
			} else if (values.campaignType === 'INBOUND') {
				agentConfig.inboundPhoneNumberId = values.phoneNumberId;
			}
		}

		const dto: CreateCampaignWithAgentDTO = {
			campaign: {
				name: values.campaignName,
				description: values.description,
				budget: 500,
				spent: 0,
				type: values.campaignType,
				campaignExecutionType: 'TIME_BASED',
				status: CampaignStatus.PENDING,
				defaultMaxWaves: values.defaultMaxWaves || 3,
				objectiveId: values.objectiveId!, // Guaranteed by validation
			},
			agent: {
				conversationConfig: {
					agent: agentConfig,
				},
				platformSettings: {},
				name: agentName, // Auto-generated from campaign name, hidden from user
				type: values.campaignType,
				voiceId: defaultVoiceId, // Use first available voice
			},
		};

		createCampaignWithAgent.mutate(dto, {
			onSuccess: (data: any) => {
				// Extract campaign from response (API returns { campaign, agent, assignmentStatus })
				const campaign = data?.campaign || data;

				// Update store with values and created campaign
				setCampaignName(values.campaignName);
				setDescription(values.description);
				setCampaignType(values.campaignType);
				setPhoneNumberId(values.phoneNumberId);
				setObjectiveId(values.objectiveId);
				setDefaultMaxWaves(values.defaultMaxWaves || 3);
				setCreatedCampaign(campaign);
				setIsSubmitting(false);

				notifications.show({
					title: 'Campaign Created',
					message:
						'Campaign created successfully. Continue to configure your agent.',
					color: 'green',
				});

				// Save draft step as 1 (Agent Step)
				setDraft({
					campaignId: String(campaign.id),
					data: { isDraft: true, draftStep: 1 },
				}).catch((err) => console.error('Failed to save draft step', err));

				// Proceed to next step
				onNext();
			},
			onError: (error) => {
				setIsSubmitting(false);

				let errorMessage = 'Failed to create campaign';
				if (isAxiosError(error) && error.response?.data?.message) {
					errorMessage = error.response.data.message;
				} else if (error instanceof Error) {
					errorMessage = error.message;
				}

				notifications.show({
					title: 'Error',
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
	};

	return (
		<>
			<form onSubmit={form.onSubmit(handleSubmit)}>
				<Stack gap='xl' className={styles.stepSurface}>
					<Box className={styles.stepHeaderCard}>
						<Text className={styles.stepEyebrow}>General setup</Text>
						<Text className={styles.stepTitle}>Campaign essentials</Text>
						<Text className={styles.stepDescriptionText}>
							Define how this campaign is presented to your team and contacts.
							The name, description, and type keep everyone aligned.
						</Text>
					</Box>

					<div className={styles.sectionGrid}>
						<Box className={styles.wizardCard}>
							<div className={styles.sectionHeading}>
								<Text className={styles.sectionHeadingTitle}>Identity</Text>
								<Text className={styles.sectionHeadingDescription}>
									Set the tone and structure for this campaign.
								</Text>
							</div>
							<Stack gap='md'>
								<TextInput
									label='Campaign Name'
									description='Give your campaign a descriptive name'
									placeholder='Enter campaign name'
									withAsterisk
									className={styles.field}
									{...form.getInputProps('campaignName')}
								/>

								<Textarea
									label='Description'
									description='Briefly describe the purpose of this campaign'
									placeholder='Describe your campaign'
									withAsterisk
									className={styles.field}
									{...form.getInputProps('description')}
									minRows={3}
									rows={3}
								/>

								<Box className={styles.field}>
									<Text className={styles.fieldLabel}>
										Campaign Type <span className={styles.required}>*</span>
									</Text>
									<Text className={styles.fieldDescription}>
										Choose how calls will be routed.
									</Text>
									<SegmentedControl
										data={[
											{ value: 'INBOUND', label: 'Inbound' },
											{ value: 'OUTBOUND', label: 'Outbound' },
										]}
										value={form.values.campaignType}
										onChange={handleCampaignTypeChange}
										fullWidth
										className={styles.segmentedControl}
									/>
									<NumberInput
										label='Default Waves'
										description='How many waves each new contact list should run before stopping'
										min={1}
										step={1}
										clampBehavior='strict'
										allowDecimal={false}
										allowNegative={false}
										withAsterisk
										size='sm'
										{...form.getInputProps('defaultMaxWaves')}
									/>
								</Box>
							</Stack>
						</Box>

						<Box className={styles.wizardCard}>
							<div className={styles.sectionHeading}>
								<Text className={styles.sectionHeadingTitle}>Routing</Text>
								<Text className={styles.sectionHeadingDescription}>
									Match this campaign to the right number and objective.
								</Text>
							</div>
							<Stack gap='md'>
								<PhoneNumberSelector
									campaignType={form.values.campaignType}
									value={form.values.phoneNumberId}
									onChange={(value) =>
										form.setFieldValue('phoneNumberId', value)
									}
									label='Phone Number'
									description='Select the phone number for this campaign'
									placeholder='Choose a phone number'
									withAsterisk
								/>

								<Input.Wrapper
									label='Campaign Objective'
									description='Choose the main objective this campaign aims to achieve'
									error={form.errors.objectiveId}
									withAsterisk
									className={styles.field}
								>
									<Group gap='xs'>
										<Select
											placeholder='Select an objective'
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
										<Tooltip label='Create new objective'>
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
							</Stack>
						</Box>
					</div>

					{createCampaignWithAgent.isError && (
						<Alert
							variant='light'
							color='red'
							title='Campaign Creation Failed'
							icon={<IconAlertCircle />}
						>
							Please check the notification for details.
						</Alert>
					)}
				</Stack>

				<Group className={styles.actions}>
					<Button variant='default' onClick={onCancel}>
						Cancel
					</Button>
					<Button
						type='submit'
						loading={createCampaignWithAgent.isPending}
						disabled={!form.isValid()}
					>
						Save & Continue
					</Button>
				</Group>
			</form>

			<Modal
				opened={isObjectiveModalOpen}
				onClose={() => setIsObjectiveModalOpen(false)}
				title='Create Campaign Objective'
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
