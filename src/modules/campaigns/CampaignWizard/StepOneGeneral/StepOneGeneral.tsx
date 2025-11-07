import React from 'react';
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
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { useCampaignWizardStore } from '~/stores/campaignWizardStore';
import PhoneNumberSelector from '../../AddNewCampaignForm/PhoneNumberSelector';
import { useCreateCampaignWithAgent } from '~/queries/campaignsQueries';
import { CampaignStatus } from '~/models/CampaignStatus';
import type { CreateCampaignWithAgentDTO } from '~/api/campaignsApi';
import styles from '../CampaignWizard.module.css';
import { useGetCampaignObjectives } from '~/queries/campaignObjectivesQueries';
import { useGetAllAgentVoices } from '~/queries/agentVoiceQueries';

interface StepOneGeneralProps {
	onNext: () => void;
	onCancel: () => void;
}

export const StepOneGeneral: React.FC<StepOneGeneralProps> = ({
	onNext,
	onCancel,
}) => {
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
		setCreatedCampaign,
		setIsSubmitting,
	} = useCampaignWizardStore();

	const createCampaignWithAgent = useCreateCampaignWithAgent();
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
		},
		validate: {
			campaignName: (value) =>
				value.trim().length < 2 ? 'Campaign name is required' : null,
			description: (value) =>
				value.trim().length < 2 ? 'Description is required' : null,
			phoneNumberId: (value) => (!value ? 'Phone number is required' : null),
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
				...(values.objectiveId && { objectiveId: values.objectiveId }),
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
				setCreatedCampaign(campaign);
				setIsSubmitting(false);

				notifications.show({
					title: 'Campaign Created',
					message:
						'Campaign created successfully. Continue to configure your agent.',
					color: 'green',
				});

				// Proceed to next step
				onNext();
			},
			onError: (error) => {
				setIsSubmitting(false);
				notifications.show({
					title: 'Error',
					message:
						error instanceof Error
							? error.message
							: 'Failed to create campaign',
					color: 'red',
				});
			},
		});
	};

	return (
		<form onSubmit={form.onSubmit(handleSubmit)}>
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
					<SegmentedControl
						data={[
							{ value: 'INBOUND', label: 'Inbound' },
							{ value: 'OUTBOUND', label: 'Outbound' },
						]}
						{...form.getInputProps('campaignType')}
						fullWidth
						className={styles.segmentedControl}
					/>
				</Box>

				<PhoneNumberSelector
					campaignType={form.values.campaignType}
					value={form.values.phoneNumberId}
					onChange={(value) => form.setFieldValue('phoneNumberId', value)}
					label='Phone Number'
					description='Select the phone number for this campaign'
					placeholder='Choose a phone number'
					withAsterisk
				/>

				<Select
					label='Campaign Objective'
					description='Choose the main objective this campaign aims to achieve'
					placeholder='Localizacion'
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
					className={styles.field}
				/>

				{createCampaignWithAgent.isError && (
					<Text className={styles.error}>
						{createCampaignWithAgent.error instanceof Error
							? createCampaignWithAgent.error.message
							: 'Error creating campaign'}
					</Text>
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
	);
};
