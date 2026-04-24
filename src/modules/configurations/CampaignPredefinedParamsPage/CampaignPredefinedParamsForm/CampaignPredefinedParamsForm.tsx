import { useEffect, useMemo, useState } from 'react';
import { Badge, Button, Text as MantineText } from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { useTranslation } from 'react-i18next';
import {
	useCreateClientConfig,
	useClientConfigByName,
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
import { DEFAULT_AGENT_LLM, LLM_MODELS } from './formConfig';

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

interface LlmClientConfigValue {
	llms?: Array<{
		llm?: string;
		is_checkpoint?: boolean;
		available_reasoning_efforts?: string[] | null;
	}>;
}

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
	const { t } = useTranslation('campaign-predefined-params');
	const isEditMode = mode === 'edit' && !!param;
	const createMutation = useCreateClientConfig();
	const updateMutation = useUpdateClientConfig();
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
			label: t('form.menu.general'),
			icon: IconInfoCircle,
		},
		{
			id: 'asr',
			label: t('form.menu.asr'),
			icon: IconMicrophone,
		},
		{
			id: 'tts',
			label: t('form.menu.tts'),
			icon: IconVolume,
		},
		{
			id: 'agent',
			label: t('form.menu.agent'),
			icon: IconRobot,
		},
	];

	const sectionCopy: Record<
		'general' | 'asr' | 'tts' | 'agent',
		{ title: string; description: string }
	> = {
		general: {
			title: t('form.sections.general.title'),
			description: t('form.sections.general.description'),
		},
		asr: {
			title: t('form.sections.asr.title'),
			description: t('form.sections.asr.description'),
		},
		tts: {
			title: t('form.sections.tts.title'),
			description: t('form.sections.tts.description'),
		},
		agent: {
			title: t('form.sections.agent.title'),
			description: t('form.sections.agent.description'),
		},
	};

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
				conversationConfig?.agent?.prompt?.llm || DEFAULT_AGENT_LLM,
			agentPromptReasoningEffort:
				conversationConfig?.agent?.prompt?.reasoningEffort || null,
			agentPromptTemperature:
				conversationConfig?.agent?.prompt?.temperature || 1.0,
		},
		validate: {
			name: (value) => {
				if (!value) return t('form.validation.nameRequired');
				// Check for duplicates only when creating or if name changed
				if (!isEditMode || (isEditMode && param && value !== param.name)) {
					const isDuplicate = list.some((p) => p.name === value);
					if (isDuplicate) return t('form.validation.nameUnique');
				}
				return null;
			},
			// ASR validations
			asrQuality: (value) =>
				!value ? t('form.validation.asrQualityRequired') : null,
			asrProvider: (value) =>
				!value ? t('form.validation.asrProviderRequired') : null,
			asrUserInputAudioFormat: (value) =>
				!value ? t('form.validation.asrInputAudioFormatRequired') : null,
			// TTS validations
			ttsModelId: (value) =>
				!value ? t('form.validation.ttsModelRequired') : null,
			ttsStability: (value) =>
				value < 0 || value > 1 ? t('form.validation.ttsStabilityRange') : null,
			ttsSpeed: (value) =>
				value < 0.25 || value > 4.0 ? t('form.validation.ttsSpeedRange') : null,
			ttsSimilarityBoost: (value) =>
				value < 0 || value > 1
					? t('form.validation.ttsSimilarityBoostRange')
					: null,
			ttsOptimizeStreamingLatency: (value) =>
				value < 0 || value > 4
					? t('form.validation.ttsStreamingLatencyRange')
					: null,
			ttsAgentOutputAudioFormat: (value) =>
				!value ? t('form.validation.ttsOutputAudioFormatRequired') : null,
			// Agent validations
			agentPromptLlm: (value) =>
				!value ? t('form.validation.agentLlmRequired') : null,
			agentPromptTemperature: (value) =>
				value < 0 || value > 2
					? t('form.validation.agentTemperatureRange')
					: null,
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
				agentPromptLlm: cfg?.agent?.prompt?.llm || DEFAULT_AGENT_LLM,
				agentPromptReasoningEffort: cfg?.agent?.prompt?.reasoningEffort || null,
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
				reasoningEffort: values.agentPromptReasoningEffort ?? undefined,
				temperature: values.agentPromptTemperature,
			},
		},
	});

	const handleSubmit = async (values: typeof form.values) => {
		if (!config) {
			notifications.show({
				title: t('status.error', { ns: 'common' }),
				message: t('form.notifications.configNotFound'),
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
					throw new Error(t('form.errors.parameterNotFound'));
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
				title: t('status.success', { ns: 'common' }),
				message: isEditMode
					? t('form.notifications.parameterUpdated')
					: t('form.notifications.parameterCreated'),
				color: 'green',
			});

			onSuccess();
		} catch (error) {
			notifications.show({
				title: t('status.error', { ns: 'common' }),
				message: isEditMode
					? t('form.notifications.parameterUpdateFailed')
					: t('form.notifications.parameterCreateFailed'),
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
											? t('form.badge.editingPreset')
											: t('form.badge.newPreset')}
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
									? t('form.badge.editingPreset')
									: t('form.badge.newPreset')}
							</Badge>
							<MantineText size='xs' c='dimmed' className={styles.footerHint}>
								{isEditMode
									? t('form.footer.editHint')
									: t('form.footer.createHint')}
							</MantineText>
						</div>
						<div className={styles.actionsRight}>
							<Button variant='subtle' size='sm' onClick={onCancel}>
								{t('actions.cancel', { ns: 'common' })}
							</Button>
							{(canSubmit || !isEditMode) && (
								<Button
									type='submit'
									size='sm'
									loading={updateMutation.isPending || createMutation.isPending}
								>
									{isEditMode
										? t('form.actions.update')
										: t('form.actions.create')}
								</Button>
							)}
						</div>
					</div>
				</div>
			</CampaignPredefinedFormProvider>
		</form>
	);
};

export default CampaignPredefinedParamsForm;
