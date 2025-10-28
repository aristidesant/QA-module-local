import React, { useCallback, useState } from 'react';
import {
	Button,
	Group,
	SegmentedControl,
	TextInput,
	Textarea,
	Box,
	Text,
	Stack,
	Select,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { useCreateCampaignWithAgent } from '~/queries/campaignsQueries';
import styles from './AddNewCampaignForm.module.css';
import { notifications } from '@mantine/notifications';
import { IconDeviceFloppy } from '@tabler/icons-react';
import { CampaignStatus } from '~/models/CampaignStatus';
import AgentVoiceSelector from './AgentVoiceSelector';
import PhoneNumberSelector from './PhoneNumberSelector';
import type { AgentVoiceModel } from '~/models/AgentVoiceModel';
import useCampaignsPredefinedParams, {
	CampaignPredefinedParam,
} from '../CampaignsForm/useCampaignsPredefinedParams';
import { deepMergeConfig } from '~/utils/objectUtils';
import type { ConversationConfigModel } from '~/models/AgentListObject';
// import ConfigurationSummary from '../CampaignsForm/AgentSection/CampaignConfigurationPredefinedParams/ConfigurationSummary';
import { CreateCampaignWithAgentDTO } from '~/api/campaignsApi';

type AddNewCampaignFormProps = {
	onComplete?: () => void;
	onCancel?: () => void;
};

export const AddNewCampaignForm: React.FC<AddNewCampaignFormProps> = ({
	onComplete,
	onCancel,
}) => {
	const createCampaignWithAgent = useCreateCampaignWithAgent();

	const form = useForm<CreateCampaignWithAgentDTO>({
		initialValues: {
			campaign: {
				name: '',
				description: '',
				budget: 500,
				spent: 0,
				type: 'OUTBOUND',
				campaignExecutionType: 'TIME_BASED',
				status: CampaignStatus.PENDING,
				promptId: undefined,
				objectiveId: undefined,
			},
			agent: {
				conversationConfig: {},
				platformSettings: {},
				name: '',
				type: 'OUTBOUND',
				voiceId: '',
			},
		},
		validate: {
			campaign: {
				name: (value) =>
					value.trim().length < 2 ? 'Campaign name is required' : null,
				description: (value) =>
					value.trim().length < 2 ? 'Description is required' : null,
				type: (value) =>
					value !== 'INBOUND' && value !== 'OUTBOUND'
						? 'Type must be one of the following values: INBOUND, OUTBOUND'
						: null,
			},
			agent: {
				name: (value) =>
					value.trim().length < 2 ? 'Agent name is required' : null,
				voiceId: (value) => (!value ? 'Agent voice is required' : null),
				type: (value) =>
					value !== 'INBOUND' && value !== 'OUTBOUND'
						? 'Type must be one of the following values: INBOUND, OUTBOUND'
						: null,
			},
		},
		validateInputOnChange: true,
	});

	const [selectedPhoneNumberId, setSelectedPhoneNumberId] = useState<
		number | null
	>(null);

	const predefinedParams = useCampaignsPredefinedParams();
	const [selectedParam, setSelectedParam] =
		useState<CampaignPredefinedParam | null>(null);

	const isValidValue = (value: unknown): boolean => {
		if (value === null || value === undefined) return false;
		if (typeof value === 'string' && value.length === 0) return false;
		if (typeof value === 'number' && isNaN(value)) return false;
		return true;
	};

	const isValidObject = (obj: unknown): obj is Record<string, any> => {
		return (
			obj !== null &&
			obj !== undefined &&
			typeof obj === 'object' &&
			!Array.isArray(obj)
		);
	};

	const applyConversationConfig = (config: ConversationConfigModel) => {
		if (!isValidObject(config)) {
			console.log('Config is not a valid object:', config);
			return;
		}
		const conversationConfig: Record<string, any> = {};

		// Apply all properties from the config that have valid values
		(
			[
				'asr',
				'tts',
				'turn',
				'agent',
				'conversation',
				'languagePresets',
			] as const
		).forEach((key) => {
			const value = config[key];

			// Accept any valid value (object, array, primitive)
			if (isValidValue(value)) {
				if (isValidObject(value)) {
					// Deep clone objects to avoid reference issues
					conversationConfig[key] = JSON.parse(JSON.stringify(value));
				} else if (Array.isArray(value)) {
					conversationConfig[key] = [...value];
				} else {
					conversationConfig[key] = value;
				}
			}
		});

		// Only update the form if there are valid properties to apply
		console.log('Filtered conversation config:', conversationConfig);
		if (Object.keys(conversationConfig).length > 0) {
			const currentAgentConfig = form.values.agent || {};
			const mergedConfig = deepMergeConfig(
				currentAgentConfig.conversationConfig || {},
				conversationConfig as Record<string, any>
			);

			form.setFieldValue('agent.conversationConfig', mergedConfig);
		} else {
			console.log('No valid properties to apply from config');
		}
	};

	const handleSubmit = (values: typeof form.values) => {
		// Sync the type between campaign and agent to ensure they match
		const campaignType = values.campaign.type;

		// Build the conversationConfig.agent object with the phone number
		const agentConfig: any = {
			...(values.agent.conversationConfig?.agent || {}),
		};

		// Add the appropriate phone number ID based on campaign type
		if (selectedPhoneNumberId) {
			if (campaignType === 'OUTBOUND') {
				agentConfig.outboundPhoneNumberId = selectedPhoneNumberId;
			} else if (campaignType === 'INBOUND') {
				agentConfig.inboundPhoneNumberId = selectedPhoneNumberId;
			}
		}

		const dto: CreateCampaignWithAgentDTO = {
			campaign: {
				...values.campaign,
				type: campaignType,
				...(values.campaign.promptId && { promptId: values.campaign.promptId }),
				...(values.campaign.objectiveId && {
					objectiveId: values.campaign.objectiveId,
				}),
			},
			agent: {
				...values.agent,
				type: campaignType, // Use campaign type to ensure they match
				conversationConfig: {
					...values.agent.conversationConfig,
					agent: agentConfig,
				},
			},
		};

		createCampaignWithAgent.mutate(dto, {
			onSuccess: () => {
				if (onComplete) {
					onComplete();
				}
				form.reset();
				setSelectedPhoneNumberId(null);
			},
			onError: (error) => {
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

	const handleVoiceSelect = useCallback(
		(voice: AgentVoiceModel) => {
			form.setFieldValue('agent.voiceId', voice.voice.id);
		},
		[form]
	);

	return (
		<div>
			<form onSubmit={form.onSubmit(handleSubmit)}>
				<Stack gap={'xs'}>
					<TextInput
						label='Campaign Name'
						description='Give your campaign a descriptive name'
						placeholder='Enter campaign name'
						withAsterisk
						className={styles.field}
						key={form.key('campaign.name')}
						{...form.getInputProps('campaign.name')}
					/>
					<Textarea
						label='Description'
						description='Briefly describe the purpose of this campaign'
						placeholder='Describe your campaign'
						withAsterisk
						className={styles.field}
						key={form.key('campaign.description')}
						{...form.getInputProps('campaign.description')}
						minRows={3}
						rows={3}
					/>

					<Box className={styles.field}>
						<Text size='sm' fw={500} mb='xs'>
							Campaign Type{' '}
							<span style={{ color: 'var(--mantine-color-red-6)' }}>*</span>
						</Text>
						<SegmentedControl
							data={[
								{ value: 'INBOUND', label: 'Inbound' },
								{ value: 'OUTBOUND', label: 'Outbound' },
							]}
							{...form.getInputProps('campaign.type')}
							fullWidth
							onChange={(value) => {
								// Update both campaign and agent type to keep them in sync
								form.setFieldValue(
									'campaign.type',
									value as 'INBOUND' | 'OUTBOUND'
								);
								form.setFieldValue(
									'agent.type',
									value as 'INBOUND' | 'OUTBOUND'
								);
								// Reset phone number selection when type changes
								setSelectedPhoneNumberId(null);
							}}
						/>
					</Box>
					<PhoneNumberSelector
						campaignType={form.values.campaign.type}
						value={selectedPhoneNumberId}
						onChange={setSelectedPhoneNumberId}
						label='Phone Number'
						description='Select the phone number for this campaign'
						placeholder='Choose a phone number'
						withAsterisk
					/>
					<TextInput
						label='Agent Name'
						description='Enter the name of the agent'
						placeholder='Enter agent name'
						withAsterisk
						className={styles.field}
						key={form.key('agent.name')}
						{...form.getInputProps('agent.name')}
					/>
					<AgentVoiceSelector
						onSelect={handleVoiceSelect}
						selectedVoiceId={form.values.agent.voiceId}
					/>
					<Select
						label='Agent Behavior'
						description='Select a predefined agent behavior configuration'
						placeholder='Choose an agent behavior'
						data={predefinedParams.map((param) => ({
							value: param.name,
							label: param.name,
						}))}
						value={selectedParam?.name || null}
						onChange={(value) => {
							const param = predefinedParams.find((p) => p.name === value);
							if (param && param.params?.conversationConfig) {
								applyConversationConfig(param.params.conversationConfig);
								setSelectedParam(param);
							}
						}}
						clearable
						className={styles.field}
					/>
					{/* <ConfigurationSummary
								config={
									form.values.agent
										.conversationConfig as ConversationConfigModel
								}
							/> */}
				</Stack>
				{createCampaignWithAgent.isError && (
					<Text className={styles.error}>
						{createCampaignWithAgent.error instanceof Error
							? createCampaignWithAgent.error.message
							: 'Error creating campaign'}
					</Text>
				)}
				<Group justify='flex-end' mt='md'>
					<Button variant='default' onClick={() => onCancel?.()} size='sm'>
						Cancel
					</Button>
					<Button
						leftSection={<IconDeviceFloppy />}
						type='submit'
						loading={createCampaignWithAgent.isPending}
						disabled={!form.isValid() || !selectedPhoneNumberId}
						size='sm'
					>
						Create Campaign
					</Button>
				</Group>
			</form>
		</div>
	);
};
