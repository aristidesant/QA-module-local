import { useEffect, useState } from 'react';
import { Badge, Button, Group, Text as MantineText } from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import {
	useCreateClientConfig,
	useUpdateClientConfig,
} from '~/queries/useClientConfigs';
import type { CampaignPredefinedParam } from '~/modules/campaigns/CampaignsForm/useCampaignsPredefinedParams';
import type { ClientConfig } from '~/models/ClientConfig';
import type { CampaignPredefinedConversationConfig } from '~/models/CampaignPredefinedParam';
import { generateUUID } from '~/utils/stringUtils';
import { ModalMenu, ModalBody } from '~/components/ModalMenu';
import {
	IconInfoCircle,
	IconMicrophone,
	IconVolume,
	IconRobot,
} from '@tabler/icons-react';
import {
	CampaignPredefinedFormProvider,
	type FormValues,
} from './CampaignPredefinedFormProvider';

import styles from './CampaignPredefinedParamsForm.module.css';
import GeneralSection from './components/GeneralSection';
import ASRSection from './components/ASRSection';
import TTSSection from './components/TTSSection';
import AgentSection from './components/AgentSection';

interface CampaignPredefinedParamsFormProps {
	param?: CampaignPredefinedParam;
	list: CampaignPredefinedParam[];
	config: ClientConfig | undefined;
	saveStrategy: 'create' | 'update';
	mode: 'create' | 'edit';
	onCancel: () => void;
	onSuccess: () => void;
	canSubmit?: boolean;
}
const menuItems = [
	{ id: 'general', label: 'General', icon: IconInfoCircle },
	{ id: 'asr', label: 'Speech Recognition', icon: IconMicrophone },
	{ id: 'tts', label: 'Voice Output', icon: IconVolume },
	{ id: 'agent', label: 'Agent Personality', icon: IconRobot },
];

const sectionCopy: Record<
	'general' | 'asr' | 'tts' | 'agent',
	{ title: string; description: string }
> = {
	general: {
		title: 'General',
		description: 'Name this preset and keep it discoverable for teammates.',
	},
	asr: {
		title: 'Speech Recognition',
		description: 'Control quality, keywords, and input formats for calls.',
	},
	tts: {
		title: 'Voice Output',
		description: 'Tune speed, clarity, and latency for outbound audio.',
	},
	agent: {
		title: 'Agent Personality',
		description: 'Pick the model and tone that will represent the brand.',
	},
};

const CampaignPredefinedParamsForm: React.FC<
	CampaignPredefinedParamsFormProps
> = ({
	param,
	list,
	config,
	saveStrategy,
	mode,
	onCancel,
	onSuccess,
	canSubmit = true,
}) => {
	const isEditMode = mode === 'edit' && !!param;
	const createMutation = useCreateClientConfig();
	const updateMutation = useUpdateClientConfig();
	const [activeTab, setActiveTab] = useState<string>('general');

	const conversationConfig = param?.params.conversationConfig;

	const form = useForm<FormValues>({
		initialValues: {
			id: param?.id || generateUUID(),
			name: param?.name || '',
			// ASR
			asrQuality: conversationConfig?.asr?.quality || 'high',
			asrKeywords: conversationConfig?.asr?.keywords || [],
			asrProvider: conversationConfig?.asr?.provider || 'elevenlabs',
			asrUserInputAudioFormat:
				conversationConfig?.asr?.userInputAudioFormat || 'pcm_16000',
			// TTS
			ttsModelId: conversationConfig?.tts?.modelId || 'eleven_turbo_v2_5',
			ttsStability: conversationConfig?.tts?.stability || 0.5,
			ttsSpeed: conversationConfig?.tts?.speed || 1.0,
			ttsSimilarityBoost: conversationConfig?.tts?.similarityBoost || 0.75,
			ttsOptimizeStreamingLatency:
				conversationConfig?.tts?.optimizeStreamingLatency || 3,
			ttsAgentOutputAudioFormat:
				conversationConfig?.tts?.agentOutputAudioFormat || 'pcm_16000',
			// Agent
			agentPromptLlm:
				conversationConfig?.agent?.prompt?.llm || 'gpt-4o-mini-2024-07-18',
			agentPromptTemperature:
				conversationConfig?.agent?.prompt?.temperature || 1.0,
		},
		validate: {
			name: (value) => {
				if (!value) return 'Name is required';
				// Check for duplicates only when creating or if name changed
				if (!isEditMode || (isEditMode && param && value !== param.name)) {
					const isDuplicate = list.some((p) => p.name === value);
					if (isDuplicate) return 'A parameter with this name already exists';
				}
				return null;
			},
			// ASR validations
			asrQuality: (value) => (!value ? 'ASR quality is required' : null),
			asrProvider: (value) => (!value ? 'ASR provider is required' : null),
			asrUserInputAudioFormat: (value) =>
				!value ? 'User input audio format is required' : null,
			// TTS validations
			ttsModelId: (value) => (!value ? 'TTS model ID is required' : null),
			ttsStability: (value) =>
				value < 0 || value > 1 ? 'Stability must be between 0 and 1' : null,
			ttsSpeed: (value) =>
				value < 0.25 || value > 4.0
					? 'Speed must be between 0.25 and 4.0'
					: null,
			ttsSimilarityBoost: (value) =>
				value < 0 || value > 1
					? 'Similarity boost must be between 0 and 1'
					: null,
			ttsOptimizeStreamingLatency: (value) =>
				value < 0 || value > 4
					? 'Optimize streaming latency must be between 0 and 4'
					: null,
			ttsAgentOutputAudioFormat: (value) =>
				!value ? 'Agent output audio format is required' : null,
			// Agent validations
			agentPromptLlm: (value) => (!value ? 'LLM model is required' : null),
			agentPromptTemperature: (value) =>
				value < 0 || value > 2 ? 'Temperature must be between 0 and 2' : null,
		},
	});

	useEffect(() => {
		if (param) {
			const cfg = param.params.conversationConfig;
			form.setValues({
				name: param.name,
				// ASR
				asrQuality: cfg?.asr?.quality || 'high',
				asrKeywords: cfg?.asr?.keywords || [],
				asrProvider: cfg?.asr?.provider || 'elevenlabs',
				asrUserInputAudioFormat: cfg?.asr?.userInputAudioFormat || 'pcm_16000',
				// TTS
				ttsModelId: cfg?.tts?.modelId || 'eleven_turbo_v2_5',
				ttsStability: cfg?.tts?.stability || 0.5,
				ttsSpeed: cfg?.tts?.speed || 1.0,
				ttsSimilarityBoost: cfg?.tts?.similarityBoost || 0.75,
				ttsOptimizeStreamingLatency: cfg?.tts?.optimizeStreamingLatency || 3,
				ttsAgentOutputAudioFormat:
					cfg?.tts?.agentOutputAudioFormat || 'pcm_16000',
				// Agent
				agentPromptLlm: cfg?.agent?.prompt?.llm || 'gpt-4o-mini-2024-07-18',
				agentPromptTemperature: cfg?.agent?.prompt?.temperature || 1.0,
			});
		}
	}, [param]);

	const buildConversationConfig = (
		values: typeof form.values
	): CampaignPredefinedConversationConfig => ({
		asr: {
			quality: values.asrQuality,
			keywords: values.asrKeywords,
			provider: values.asrProvider,
			userInputAudioFormat: values.asrUserInputAudioFormat,
		},
		tts: {
			modelId: values.ttsModelId,
			stability: values.ttsStability,
			speed: values.ttsSpeed,
			similarityBoost: values.ttsSimilarityBoost,
			optimizeStreamingLatency: values.ttsOptimizeStreamingLatency,
			agentOutputAudioFormat: values.ttsAgentOutputAudioFormat,
		},
		agent: {
			prompt: {
				llm: values.agentPromptLlm,
				temperature: values.agentPromptTemperature,
			},
		},
	});

	const handleSubmit = async (values: typeof form.values) => {
		if (!config) {
			notifications.show({
				title: 'Error',
				message: 'Configuration not found',
				color: 'red',
			});
			return;
		}

		try {
			const newParam: CampaignPredefinedParam = {
				id: values.id,
				name: values.name,
				params: {
					conversationConfig: buildConversationConfig(values),
				},
			};

			let updatedList: CampaignPredefinedParam[];

			if (isEditMode && param) {
				// Update existing param
				const index = list.findIndex((p) => p.id === param.id);
				if (index === -1) {
					throw new Error('Parameter not found in list');
				}
				updatedList = [...list];
				updatedList[index] = newParam;
			} else {
				// Create new param
				updatedList = [...list, newParam];
			}

			const parsedValue = JSON.stringify(updatedList);
			if (saveStrategy === 'create') {
				await createMutation.mutateAsync({
					name: config.name,
					description: config.description,
					value: parsedValue,
					type: config.type,
				});
			} else {
				await updateMutation.mutateAsync({
					name: config.name,
					data: {
						description: config.description,
						value: parsedValue,
						type: config.type,
					},
				});
			}

			notifications.show({
				title: 'Success',
				message: `Parameter ${isEditMode ? 'updated' : 'created'} successfully`,
				color: 'green',
			});

			onSuccess();
		} catch (error) {
			notifications.show({
				title: 'Error',
				message: `Failed to ${isEditMode ? 'update' : 'create'} parameter`,
				color: 'red',
			});
		}
	};

	const renderSection = () => {
		switch (activeTab) {
			case 'asr':
				return <ASRSection />;
			case 'tts':
				return <TTSSection />;
			case 'agent':
				return <AgentSection />;
			default:
				return <GeneralSection />;
		}
	};

	const activeSection =
		sectionCopy[activeTab as keyof typeof sectionCopy] || sectionCopy.general;

	return (
		<form onSubmit={form.onSubmit(handleSubmit)} className={styles.form}>
			<CampaignPredefinedFormProvider form={form} isEditMode={isEditMode}>
				<div className={styles.mainContainer}>
					<ModalBody
						menu={
							<ModalMenu
								items={menuItems}
								activeId={activeTab}
								onSelect={setActiveTab}
							/>
						}
					>
						<div className={styles.editorColumn}>
							<div className={styles.editorShell}>
								<div className={styles.editorHeader}>
									<div className={styles.editorHeaderText}>
										<MantineText fw={600} size='sm'>
											{activeSection.title}
										</MantineText>
										<MantineText size='xs' c='dimmed'>
											{activeSection.description}
										</MantineText>
									</div>
									<Badge
										size='sm'
										variant='light'
										color={isEditMode ? 'blue' : 'green'}
									>
										{isEditMode ? 'Editing preset' : 'New preset'}
									</Badge>
								</div>

								<div className={styles.editorContent}>{renderSection()}</div>
							</div>
						</div>
					</ModalBody>

					<div className={styles.actions}>
						<div className={styles.actionsLeft}>
							<MantineText size='xs' c='dimmed'>
								{isEditMode
									? 'Changes update this preset for every campaign using it.'
									: 'Creating a fresh preset adds it to your campaign defaults.'}
							</MantineText>
						</div>
						<Group justify='flex-end' gap='xs' className={styles.actionsRight}>
							<Button variant='subtle' size='sm' onClick={onCancel}>
								Cancel
							</Button>
							{(canSubmit || !isEditMode) && (
								<Button
									type='submit'
									size='sm'
									loading={updateMutation.isPending || createMutation.isPending}
								>
									{isEditMode ? 'Update' : 'Create'}
								</Button>
							)}
						</Group>
					</div>
				</div>
			</CampaignPredefinedFormProvider>
		</form>
	);
};

export default CampaignPredefinedParamsForm;
