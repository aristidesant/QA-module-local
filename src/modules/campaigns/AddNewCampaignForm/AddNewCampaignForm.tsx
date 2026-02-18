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
	NumberInput,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { useTranslation } from 'react-i18next';
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
import type { CampaignPredefinedConversationConfig } from '~/models/CampaignPredefinedParam';
// import ConfigurationSummary from '../CampaignsForm/AgentSection/CampaignConfigurationPredefinedParams/ConfigurationSummary';
import {
	CreateCampaignWithAgentDTO,
	type ConversationAgentConfig,
} from '~/api/campaignsApi';

type AddNewCampaignFormProps = {
	onComplete?: () => void;
	onCancel?: () => void;
};

export const AddNewCampaignForm: React.FC<AddNewCampaignFormProps> = ({
	onComplete,
	onCancel,
}) => {
	const { t } = useTranslation('campaigns');
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
				status: CampaignStatus.INACTIVE,
				promptId: undefined,
				objectiveId: undefined,
				defaultMaxWaves: 3,
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
					value.trim().length < 2
						? t('addNewCampaign.validation.nameRequired')
						: null,
				description: (value) =>
					value.trim().length < 2
						? t('addNewCampaign.validation.descriptionRequired')
						: null,
				type: (value) =>
					value !== 'INBOUND' && value !== 'OUTBOUND'
						? t('addNewCampaign.validation.typeInvalid')
						: null,
				defaultMaxWaves: (value) =>
					!value || value < 1 ? t('addNewCampaign.validation.wavesMin') : null,
			},
			agent: {
				name: (value) =>
					value.trim().length < 2
						? t('addNewCampaign.validation.agentNameRequired')
						: null,
				voiceId: (value) =>
					!value ? t('addNewCampaign.validation.agentVoiceRequired') : null,
				type: (value) =>
					value !== 'INBOUND' && value !== 'OUTBOUND'
						? t('addNewCampaign.validation.typeInvalid')
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

	const applyConversationConfig = (
		config: CampaignPredefinedConversationConfig
	) => {
		const currentAgentConfig = form.values.agent.conversationConfig || {};

		const mergedConfig = deepMergeConfig(currentAgentConfig, {
			...(config.tts
				? {
						tts: {
							...config.tts,
						},
					}
				: {}),
			...(config.agent
				? {
						agent: {
							...(currentAgentConfig.agent || {}),
							prompt: {
								...(currentAgentConfig.agent?.prompt || {}),
								...config.agent.prompt,
							},
						},
					}
				: {}),
		});

		form.setFieldValue('agent.conversationConfig', mergedConfig);
	};

	const handleSubmit = (values: typeof form.values) => {
		// Sync the type between campaign and agent to ensure they match
		const campaignType = values.campaign.type;

		// Build the conversationConfig.agent object with the phone number
		const agentConfig: ConversationAgentConfig = {
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
				defaultMaxWaves: values.campaign.defaultMaxWaves || 3,
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
					title: t('common:status.error'),
					message:
						error instanceof Error
							? error.message
							: t('addNewCampaign.form.failedToCreate'),
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
						label={t('addNewCampaign.form.campaignName')}
						description={t('addNewCampaign.form.campaignNameDesc')}
						placeholder={t('addNewCampaign.form.campaignNamePlaceholder')}
						withAsterisk
						className={styles.field}
						key={form.key('campaign.name')}
						{...form.getInputProps('campaign.name')}
					/>
					<Textarea
						label={t('addNewCampaign.form.description')}
						description={t('addNewCampaign.form.descriptionDesc')}
						placeholder={t('addNewCampaign.form.descriptionPlaceholder')}
						withAsterisk
						className={styles.field}
						key={form.key('campaign.description')}
						{...form.getInputProps('campaign.description')}
						minRows={3}
						rows={3}
					/>

					<Box className={styles.field}>
						<Text size='sm' fw={500} mb='xs'>
							{t('addNewCampaign.form.campaignType')}{' '}
							<span style={{ color: 'var(--mantine-color-red-6)' }}>*</span>
						</Text>
						<SegmentedControl
							data={[
								{ value: 'INBOUND', label: t('columns.inbound') },
								{ value: 'OUTBOUND', label: t('columns.outbound') },
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
					<NumberInput
						label={t('addNewCampaign.form.defaultWaves')}
						description={t('addNewCampaign.form.defaultWavesDesc')}
						placeholder={t('addNewCampaign.form.defaultWavesPlaceholder')}
						min={1}
						step={1}
						size='sm'
						clampBehavior='strict'
						allowNegative={false}
						withAsterisk
						key={form.key('campaign.defaultMaxWaves')}
						{...form.getInputProps('campaign.defaultMaxWaves')}
					/>
					<PhoneNumberSelector
						campaignType={form.values.campaign.type}
						value={selectedPhoneNumberId}
						onChange={setSelectedPhoneNumberId}
						label={t('addNewCampaign.form.phoneNumber')}
						description={t('addNewCampaign.form.phoneNumberDesc')}
						placeholder={t('addNewCampaign.form.phoneNumberPlaceholder')}
						withAsterisk
					/>
					<TextInput
						label={t('addNewCampaign.form.agentName')}
						description={t('addNewCampaign.form.agentNameDesc')}
						placeholder={t('addNewCampaign.form.agentNamePlaceholder')}
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
						label={t('addNewCampaign.form.agentBehavior')}
						description={t('addNewCampaign.form.agentBehaviorDesc')}
						placeholder={t('addNewCampaign.form.agentBehaviorPlaceholder')}
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
								form.setFieldValue('campaign.configId', param.id);
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
							: t('addNewCampaign.form.errorMessage')}
					</Text>
				)}
				<Group justify='flex-end' mt='md'>
					<Button variant='default' onClick={() => onCancel?.()} size='sm'>
						{t('addNewCampaign.form.cancelButton')}
					</Button>
					<Button
						leftSection={<IconDeviceFloppy />}
						type='submit'
						loading={createCampaignWithAgent.isPending}
						disabled={!form.isValid() || !selectedPhoneNumberId}
						size='sm'
					>
						{t('addNewCampaign.form.createButton')}
					</Button>
				</Group>
			</form>
		</div>
	);
};
