import { useEffect, useMemo, useState } from 'react';
import { Badge, Button, Text as MantineText } from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { useTranslation } from 'react-i18next';
import {
	useCreateAgentBehavior,
	useUpdateAgentBehavior,
} from '~/queries/useAgentBehaviors';
import { useClientConfigByName } from '~/queries/useClientConfigs';
import type { AgentBehavior } from '~/models/AgentBehavior';
import type {
	CampaignPredefinedConversationConfig,
	SuggestedAudioTag,
} from '~/models/CampaignPredefinedParam';
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
import {
	DEFAULT_AGENT_LLM,
	DEFAULT_TTS_MODEL_ID,
	EXPRESSIVE_TTS_MODEL_ID,
	LLM_MODELS,
	isExpressiveTtsModel,
	normalizeSuggestedAudioTags,
} from './formConfig';

import styles from './CampaignPredefinedParamsForm.module.css';
import GeneralSection from './components/GeneralSection';
import ASRSection from './components/ASRSection';
import TTSSection from './components/TTSSection';
import AgentSection from './components/AgentSection';

interface AgentBehaviorsFormProps {
	behavior?: AgentBehavior;
	mode: 'create' | 'edit';
	onCancel: () => void;
	onSuccess: () => void;
}

interface LlmClientConfigValue {
	llms?: Array<{
		llm?: string;
		is_checkpoint?: boolean;
		available_reasoning_efforts?: string[] | null;
	}>;
}

const AgentBehaviorsForm: React.FC<AgentBehaviorsFormProps> = ({
	behavior,
	mode,
	onCancel,
	onSuccess,
}) => {
	const { t } = useTranslation('campaign-predefined-params');
	const isEditMode = mode === 'edit' && !!behavior;
	const createMutation = useCreateAgentBehavior();
	const updateMutation = useUpdateAgentBehavior();
	const { data: llmConfig } = useClientConfigByName('llm');
	const [activeTab, setActiveTab] = useState<string>('general');

	const { hasResolvedReasoningAvailability, reasoningEffortsByModel } =
		useMemo(() => {
			if (!llmConfig?.value) {
				return {
					hasResolvedReasoningAvailability: false,
					reasoningEffortsByModel: {} as Record<string, string[] | null>,
				};
			}

			try {
				const parsed = JSON.parse(llmConfig.value) as LlmClientConfigValue;
				if (!Array.isArray(parsed.llms)) {
					return {
						hasResolvedReasoningAvailability: false,
						reasoningEffortsByModel: {} as Record<string, string[] | null>,
					};
				}

				const supportedModelCodes = new Set(
					LLM_MODELS.map(({ modelCode }) => modelCode)
				);
				const nextReasoningEffortsByModel = parsed.llms.reduce<
					Record<string, string[] | null>
				>((acc, model) => {
					if (
						!model.llm ||
						model.is_checkpoint ||
						!supportedModelCodes.has(model.llm)
					) {
						return acc;
					}

					acc[model.llm] = Array.isArray(model.available_reasoning_efforts)
						? model.available_reasoning_efforts.filter(
								(effort): effort is string => typeof effort === 'string'
							)
						: null;

					return acc;
				}, {});

				return {
					hasResolvedReasoningAvailability: true,
					reasoningEffortsByModel: nextReasoningEffortsByModel,
				};
			} catch {
				return {
					hasResolvedReasoningAvailability: false,
					reasoningEffortsByModel: {} as Record<string, string[] | null>,
				};
			}
		}, [llmConfig?.value]);

	const menuItems = [
		{
			id: 'general',
			label: t('form.menu.general', 'General'),
			icon: IconInfoCircle,
		},
		{
			id: 'asr',
			label: t('form.menu.asr', 'ASR'),
			icon: IconMicrophone,
		},
		{
			id: 'tts',
			label: t('form.menu.tts', 'TTS'),
			icon: IconVolume,
		},
		{
			id: 'agent',
			label: t('form.menu.agent', 'Agent'),
			icon: IconRobot,
		},
	];

	const sectionCopy: Record<
		'general' | 'asr' | 'tts' | 'agent',
		{ title: string; description: string }
	> = {
		general: {
			title: t('form.sections.general.title', 'General Config'),
			description: t(
				'form.sections.general.description',
				'Basic behavior information'
			),
		},
		asr: {
			title: t('form.sections.asr.title', 'ASR'),
			description: t(
				'form.sections.asr.description',
				'Speech recognition config'
			),
		},
		tts: {
			title: t('form.sections.tts.title', 'TTS'),
			description: t('form.sections.tts.description', 'Text-to-speech config'),
		},
		agent: {
			title: t('form.sections.agent.title', 'Agent'),
			description: t(
				'form.sections.agent.description',
				'Agent prompt and LLM settings'
			),
		},
	};

	const conversationConfig = behavior?.params?.conversationConfig;

	const form = useForm<FormValues>({
		initialValues: {
			id: behavior?.id || generateUUID(),
			name: behavior?.name || '',
			// ASR
			asrQuality: conversationConfig?.asr?.quality || 'high',
			asrKeywords: conversationConfig?.asr?.keywords || [],
			asrProvider: conversationConfig?.asr?.provider || 'elevenlabs',
			asrUserInputAudioFormat:
				conversationConfig?.asr?.userInputAudioFormat || 'pcm_16000',
			// TTS
			ttsModelId: conversationConfig?.tts?.modelId || DEFAULT_TTS_MODEL_ID,
			ttsVoiceId: conversationConfig?.tts?.voiceId || '',
			ttsSupportedVoices: conversationConfig?.tts?.supportedVoices || [],
			ttsExpressiveMode:
				conversationConfig?.tts?.modelId === EXPRESSIVE_TTS_MODEL_ID ||
				conversationConfig?.tts?.expressiveMode ||
				false,
			ttsSuggestedAudioTags: normalizeSuggestedAudioTags(
				conversationConfig?.tts?.suggestedAudioTags as
					| SuggestedAudioTag[]
					| null
			),
			ttsStability: conversationConfig?.tts?.stability ?? 0.5,
			ttsSpeed: conversationConfig?.tts?.speed ?? 1.0,
			ttsSimilarityBoost: conversationConfig?.tts?.similarityBoost ?? 0.75,
			ttsOptimizeStreamingLatency:
				conversationConfig?.tts?.optimizeStreamingLatency ?? 3,
			ttsAgentOutputAudioFormat:
				conversationConfig?.tts?.agentOutputAudioFormat || 'pcm_16000',
			// Agent
			agentPromptLlm:
				conversationConfig?.agent?.prompt?.llm || DEFAULT_AGENT_LLM,
			agentPromptReasoningEffort:
				conversationConfig?.agent?.prompt?.reasoningEffort ?? null,
			agentPromptTemperature:
				conversationConfig?.agent?.prompt?.temperature ?? 1.0,
		},
		validate: {
			name: (value) => {
				if (!value)
					return t('form.validation.nameRequired', 'Name is required');
				return null;
			},
			// ASR validations
			asrQuality: (value) =>
				!value
					? t('form.validation.asrQualityRequired', 'ASR Quality is required')
					: null,
			asrProvider: (value) =>
				!value
					? t('form.validation.asrProviderRequired', 'ASR Provider is required')
					: null,
			asrUserInputAudioFormat: (value) =>
				!value
					? t(
							'form.validation.asrInputAudioFormatRequired',
							'Input Audio Format required'
						)
					: null,
			// TTS validations
			ttsModelId: (value) =>
				!value
					? t('form.validation.ttsModelRequired', 'TTS Model required')
					: null,
			ttsStability: (value) =>
				value < 0 || value > 1
					? t('form.validation.ttsStabilityRange', 'Stability must be 0-1')
					: null,
			ttsSpeed: (value) =>
				value < 0.25 || value > 4.0
					? t('form.validation.ttsSpeedRange', 'Speed must be 0.25-4.0')
					: null,
			ttsSimilarityBoost: (value) =>
				value < 0 || value > 1
					? t('form.validation.ttsSimilarityBoostRange', 'Boost must be 0-1')
					: null,
			ttsOptimizeStreamingLatency: (value) =>
				value < 0 || value > 4
					? t('form.validation.ttsStreamingLatencyRange', 'Latency must be 0-4')
					: null,
			ttsAgentOutputAudioFormat: (value) =>
				!value
					? t(
							'form.validation.ttsOutputAudioFormatRequired',
							'Output format required'
						)
					: null,
			// Agent validations
			agentPromptLlm: (value) =>
				!value ? t('form.validation.agentLlmRequired', 'LLM required') : null,
			agentPromptTemperature: (value) =>
				value < 0 || value > 2
					? t('form.validation.agentTemperatureRange', 'Temp must be 0-2')
					: null,
		},
	});

	useEffect(() => {
		if (behavior) {
			const cfg = behavior.params.conversationConfig;
			form.setValues({
				name: behavior.name,
				// ASR
				asrQuality: cfg?.asr?.quality || 'high',
				asrKeywords: cfg?.asr?.keywords || [],
				asrProvider: cfg?.asr?.provider || 'elevenlabs',
				asrUserInputAudioFormat: cfg?.asr?.userInputAudioFormat || 'pcm_16000',
				// TTS
				ttsModelId: cfg?.tts?.modelId || DEFAULT_TTS_MODEL_ID,
				ttsVoiceId: cfg?.tts?.voiceId || '',
				ttsSupportedVoices: cfg?.tts?.supportedVoices || [],
				ttsExpressiveMode:
					cfg?.tts?.modelId === EXPRESSIVE_TTS_MODEL_ID ||
					cfg?.tts?.expressiveMode ||
					false,
				ttsSuggestedAudioTags: normalizeSuggestedAudioTags(
					cfg?.tts?.suggestedAudioTags as SuggestedAudioTag[] | null
				),
				ttsStability: cfg?.tts?.stability ?? 0.5,
				ttsSpeed: cfg?.tts?.speed ?? 1.0,
				ttsSimilarityBoost: cfg?.tts?.similarityBoost ?? 0.75,
				ttsOptimizeStreamingLatency: cfg?.tts?.optimizeStreamingLatency ?? 3,
				ttsAgentOutputAudioFormat:
					cfg?.tts?.agentOutputAudioFormat || 'pcm_16000',
				// Agent
				agentPromptLlm: cfg?.agent?.prompt?.llm || DEFAULT_AGENT_LLM,
				agentPromptReasoningEffort: cfg?.agent?.prompt?.reasoningEffort ?? null,
				agentPromptTemperature: cfg?.agent?.prompt?.temperature ?? 1.0,
			});
		}
	}, [behavior]);

	const buildConversationConfig = (
		values: typeof form.values
	): CampaignPredefinedConversationConfig => ({
		asr: {
			...conversationConfig?.asr,
			quality: values.asrQuality,
			keywords: values.asrKeywords,
			provider: values.asrProvider,
			userInputAudioFormat: values.asrUserInputAudioFormat,
		},
		tts: {
			...conversationConfig?.tts,
			modelId: values.ttsModelId,
			voiceId:
				values.ttsVoiceId || conversationConfig?.tts?.voiceId || undefined,
			supportedVoices:
				values.ttsSupportedVoices.length > 0
					? values.ttsSupportedVoices
					: conversationConfig?.tts?.supportedVoices || [],
			expressiveMode: isExpressiveTtsModel(values.ttsModelId),
			suggestedAudioTags: isExpressiveTtsModel(values.ttsModelId)
				? normalizeSuggestedAudioTags(values.ttsSuggestedAudioTags)
				: [],
			stability: values.ttsStability,
			speed: values.ttsSpeed,
			similarityBoost: values.ttsSimilarityBoost,
			optimizeStreamingLatency: values.ttsOptimizeStreamingLatency,
			agentOutputAudioFormat: values.ttsAgentOutputAudioFormat,
		},
		agent: {
			...conversationConfig?.agent,
			prompt: {
				...conversationConfig?.agent?.prompt,
				llm: values.agentPromptLlm,
				reasoningEffort: values.agentPromptReasoningEffort ?? undefined,
				temperature: values.agentPromptTemperature,
			},
		},
	});

	const handleSubmit = async (values: typeof form.values) => {
		try {
			const payload = {
				name: values.name,
				params: {
					conversationConfig: buildConversationConfig(values),
				},
			};

			if (isEditMode && behavior) {
				await updateMutation.mutateAsync({
					id: behavior.id,
					data: payload,
				});
			} else {
				await createMutation.mutateAsync(payload);
			}

			notifications.show({
				title: t('status.success', { ns: 'common' }),
				message: isEditMode
					? t('form.notifications.parameterUpdated', 'Behavior updated')
					: t('form.notifications.parameterCreated', 'Behavior created'),
				color: 'green',
			});

			onSuccess();
		} catch (error) {
			notifications.show({
				title: t('status.error', { ns: 'common' }),
				message: isEditMode
					? t('form.notifications.parameterUpdateFailed', 'Update failed')
					: t('form.notifications.parameterCreateFailed', 'Create failed'),
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
				return (
					<AgentSection
						hasResolvedReasoningAvailability={hasResolvedReasoningAvailability}
						reasoningEffortsByModel={reasoningEffortsByModel}
					/>
				);
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
										{isEditMode
											? t('form.badge.editingPreset', 'Editing')
											: t('form.badge.newPreset', 'New')}
									</Badge>
								</div>

								<div className={styles.editorContent}>{renderSection()}</div>
							</div>
						</div>
					</ModalBody>

					<div className={styles.actions}>
						<div className={styles.actionsLeft}>
							<Badge
								size='sm'
								variant='light'
								color={isEditMode ? 'blue' : 'green'}
								className={styles.footerBadge}
							>
								{isEditMode
									? t('form.badge.editingPreset', 'Editing')
									: t('form.badge.newPreset', 'New')}
							</Badge>
							<MantineText size='xs' c='dimmed' className={styles.footerHint}>
								{isEditMode
									? t('form.footer.editHint', 'Modifying existing behavior')
									: t('form.footer.createHint', 'Creating new behavior')}
							</MantineText>
						</div>
						<div className={styles.actionsRight}>
							<Button variant='subtle' size='sm' onClick={onCancel}>
								{t('actions.cancel', { ns: 'common' })}
							</Button>
							<Button
								type='submit'
								size='sm'
								loading={updateMutation.isPending || createMutation.isPending}
							>
								{isEditMode
									? t('form.actions.update', 'Update')
									: t('form.actions.create', 'Create')}
							</Button>
						</div>
					</div>
				</div>
			</CampaignPredefinedFormProvider>
		</form>
	);
};

export default AgentBehaviorsForm;
