import { useEffect, useState } from 'react';
import { Badge, Button, Text as MantineText } from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { useTranslation } from 'react-i18next';
import {
	useCreateAgentBehavior,
	useUpdateAgentBehavior,
} from '~/queries/useAgentBehaviors';
import { useActiveElevenLabsLlmCatalog } from '~/queries/elevenLabsLlmQueries';
import type { AgentBehavior } from '~/models/AgentBehavior';
import type {
	CampaignPredefinedConversationConfig,
	SuggestedAudioTag,
} from '~/models/CampaignPredefinedParam';
import { generateUUID } from '~/utils/stringUtils';
import { getErrorMessage } from '~/utils/httpClient';
import { ModalMenu, ModalBody } from '~/components/ModalMenu';
import {
	IconInfoCircle,
	IconMicrophone,
	IconVolume,
	IconRobot,
	IconShieldLock,
} from '@tabler/icons-react';
import {
	CampaignPredefinedFormProvider,
	type FormValues,
} from './CampaignPredefinedFormProvider';
import {
	DEFAULT_AGENT_LLM,
	DEFAULT_BACKUP_LLM_PREFERENCE,
	DEFAULT_TTS_MODEL_ID,
	EXPRESSIVE_TTS_MODEL_ID,
	isExpressiveTtsModel,
	normalizeSuggestedAudioTags,
} from './formConfig';
import {
	clonePlatformSettingsOverrides,
	DEFAULT_PLATFORM_SETTINGS_OVERRIDES,
} from './platformSettingsConfig';

import styles from './CampaignPredefinedParamsForm.module.css';
import GeneralSection from './components/GeneralSection';
import ASRSection from './components/ASRSection';
import TTSSection from './components/TTSSection';
import AgentSection from './components/AgentSection';
import SecuritySection from './components/SecuritySection';

const TTS_SPEED_MIN = 0.25;
const TTS_SPEED_MAX = 1.2;

const clampTtsSpeed = (value: number | null | undefined) => {
	const nextValue = value ?? 1.0;

	return Math.min(TTS_SPEED_MAX, Math.max(TTS_SPEED_MIN, nextValue));
};

type BackupLlmPromptConfig = {
	preference?: string;
	order?: string[];
};

const getBackupLlmConfig = (prompt?: {
	backupLlmConfig?: BackupLlmPromptConfig;
}) => {
	const config = prompt?.backupLlmConfig;

	return {
		preference: config?.preference ?? DEFAULT_BACKUP_LLM_PREFERENCE,
		order: config?.order ?? [],
	};
};

interface AgentBehaviorsFormProps {
	behavior?: AgentBehavior;
	allBehaviors?: AgentBehavior[];
	mode: 'create' | 'edit';
	onCancel: () => void;
	onSuccess: () => void;
}

const AgentBehaviorsForm: React.FC<AgentBehaviorsFormProps> = ({
	behavior,
	allBehaviors = [],
	mode,
	onCancel,
	onSuccess,
}) => {
	const { t } = useTranslation('campaign-predefined-params');
	const isEditMode = mode === 'edit' && !!behavior;
	const createMutation = useCreateAgentBehavior();
	const updateMutation = useUpdateAgentBehavior();
	const { isSuccess: isLlmCatalogLoaded, reasoningEffortsByModel } =
		useActiveElevenLabsLlmCatalog();
	const [activeTab, setActiveTab] = useState<string>('general');

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
		{
			id: 'platformSettings',
			label: t('form.menu.platformSettings', 'Platoform Settings'),
			icon: IconShieldLock,
		},
	];

	const sectionCopy: Record<
		'general' | 'asr' | 'tts' | 'agent' | 'platformSettings',
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
		platformSettings: {
			title: t('form.sections.platformSettings.title', 'Platform Settings'),
			description: t(
				'form.sections.platformSettings.description',
				'Toggle platform-level overrides exposed to the client.'
			),
		},
	};

	const conversationConfig = behavior?.params?.conversationConfig;
	const platformSettingsOverrides =
		behavior?.params?.platformSettings?.overrides ??
		DEFAULT_PLATFORM_SETTINGS_OVERRIDES;
	const initialBackupLlmConfig = getBackupLlmConfig(
		conversationConfig?.agent?.prompt
	);

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
			ttsSpeed: clampTtsSpeed(conversationConfig?.tts?.speed),
			ttsSimilarityBoost: conversationConfig?.tts?.similarityBoost ?? 0.75,
			ttsOptimizeStreamingLatency:
				conversationConfig?.tts?.optimizeStreamingLatency ?? 3,
			ttsAgentOutputAudioFormat:
				conversationConfig?.tts?.agentOutputAudioFormat || 'pcm_16000',
			// Agent
			agentPromptLlm:
				conversationConfig?.agent?.prompt?.llm || DEFAULT_AGENT_LLM,
			agentPromptReasoningEffort: (() => {
				const promptConfig = conversationConfig?.agent?.prompt;
				return promptConfig && 'reasoningEffort' in promptConfig
					? (promptConfig.reasoningEffort ?? '')
					: null;
			})(),
			agentPromptBackupLlmPreference: initialBackupLlmConfig.preference,
			agentPromptBackupLlmOrder: initialBackupLlmConfig.order,
			agentPromptTemperature:
				conversationConfig?.agent?.prompt?.temperature ?? 1.0,
			platformSettingsOverrides: clonePlatformSettingsOverrides(
				platformSettingsOverrides
			),
			isBackup: behavior?.isBackup ?? false,
			backupBehaviorId: behavior?.backupBehaviorId ?? null,
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
				value < TTS_SPEED_MIN || value > TTS_SPEED_MAX
					? t('form.validation.ttsSpeedRange', 'Speed must be 0.25-1.2')
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
			const backupLlmConfig = getBackupLlmConfig(cfg?.agent?.prompt);
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
				ttsSpeed: clampTtsSpeed(cfg?.tts?.speed),
				ttsSimilarityBoost: cfg?.tts?.similarityBoost ?? 0.75,
				ttsOptimizeStreamingLatency: cfg?.tts?.optimizeStreamingLatency ?? 3,
				ttsAgentOutputAudioFormat:
					cfg?.tts?.agentOutputAudioFormat || 'pcm_16000',
				// Agent
				agentPromptLlm: cfg?.agent?.prompt?.llm || DEFAULT_AGENT_LLM,
				agentPromptReasoningEffort: (() => {
					const promptConfig = cfg?.agent?.prompt;
					return promptConfig && 'reasoningEffort' in promptConfig
						? (promptConfig.reasoningEffort ?? '')
						: null;
				})(),
				agentPromptBackupLlmPreference: backupLlmConfig.preference,
				agentPromptBackupLlmOrder: backupLlmConfig.order,
				agentPromptTemperature: cfg?.agent?.prompt?.temperature ?? 1.0,
				platformSettingsOverrides: clonePlatformSettingsOverrides(
					behavior?.params?.platformSettings?.overrides ??
						DEFAULT_PLATFORM_SETTINGS_OVERRIDES
				),
				isBackup: behavior.isBackup ?? false,
				backupBehaviorId: behavior.backupBehaviorId ?? null,
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
			speed: clampTtsSpeed(values.ttsSpeed),
			similarityBoost: values.ttsSimilarityBoost,
			optimizeStreamingLatency: values.ttsOptimizeStreamingLatency,
			agentOutputAudioFormat: values.ttsAgentOutputAudioFormat,
		},
		agent: {
			...conversationConfig?.agent,
			prompt: {
				...conversationConfig?.agent?.prompt,
				llm: values.agentPromptLlm,
				reasoningEffort:
					values.agentPromptReasoningEffort === ''
						? null
						: values.agentPromptReasoningEffort || undefined,
				backupLlmConfig: {
					preference: values.agentPromptBackupLlmPreference,
					order: values.agentPromptBackupLlmOrder,
				},
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
					platformSettings: {
						...(behavior?.params?.platformSettings ?? {}),
						overrides: clonePlatformSettingsOverrides(
							values.platformSettingsOverrides
						),
					},
				},
				isBackup: values.isBackup,
				backupBehaviorId: values.isBackup ? null : values.backupBehaviorId,
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
					? `${t('form.notifications.parameterUpdateFailed', 'Update failed')}: ${getErrorMessage(error)}`
					: `${t('form.notifications.parameterCreateFailed', 'Create failed')}: ${getErrorMessage(error)}`,
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
						hasResolvedReasoningAvailability={isLlmCatalogLoaded}
						reasoningEffortsByModel={reasoningEffortsByModel}
					/>
				);
			case 'platformSettings':
				return <SecuritySection />;
			default:
				return <GeneralSection />;
		}
	};

	const activeSection =
		sectionCopy[activeTab as keyof typeof sectionCopy] || sectionCopy.general;

	return (
		<form onSubmit={form.onSubmit(handleSubmit)} className={styles.form}>
			<CampaignPredefinedFormProvider
				form={form}
				isEditMode={isEditMode}
				currentBehaviorId={behavior?.id}
				allBehaviors={allBehaviors}
			>
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
