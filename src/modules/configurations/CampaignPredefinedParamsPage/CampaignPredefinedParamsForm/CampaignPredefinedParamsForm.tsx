import { useEffect } from 'react';
import {
	TextInput,
	Button,
	Group,
	Slider,
	ActionIcon,
	Stack,
	Select,
	Divider,
	Text as MantineText,
	TagsInput,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { IconX } from '@tabler/icons-react';
import { useUpdateClientConfig } from '~/queries/useClientConfigs';
import type { CampaignPredefinedParam } from '~/modules/campaigns/CampaignsForm/useCampaignsPredefinedParams';
import type { ClientConfig } from '~/models/ClientConfig';
import type { CampaignPredefinedConversationConfig } from '~/models/CampaignPredefinedParam';
import useCampaignPredefinedParamsStore from '../store/useCampaignPredefinedParamsStore';
import { generateUUID } from '~/utils/stringUtils';
import RightSectionCard from '~/components/RightSectionCard/RightSectionCard';
import { IconSettings } from '@tabler/icons-react';
import {
	AUDIO_FORMATS,
	LLM_MODELS,
	TTS_MODELS,
	ASR_PROVIDERS,
	ASR_QUALITY,
} from './formConfig';
import styles from './CampaignPredefinedParamsForm.module.css';

interface CampaignPredefinedParamsFormProps {
	param?: CampaignPredefinedParam;
	list: CampaignPredefinedParam[];
	config: ClientConfig | undefined;
}

const CampaignPredefinedParamsForm: React.FC<
	CampaignPredefinedParamsFormProps
> = ({ param, list, config }) => {
	const isEditMode = !!param;
	const { clearRightComponent } = useCampaignPredefinedParamsStore();
	const updateMutation = useUpdateClientConfig();

	const conversationConfig = param?.params.conversationConfig;

	const form = useForm({
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

			await updateMutation.mutateAsync({
				name: config.name,
				data: {
					description: config.description,
					value: JSON.stringify(updatedList),
					type: config.type,
				},
			});

			notifications.show({
				title: 'Success',
				message: `Parameter ${isEditMode ? 'updated' : 'created'} successfully`,
				color: 'green',
			});

			clearRightComponent();
		} catch (error) {
			notifications.show({
				title: 'Error',
				message: `Failed to ${isEditMode ? 'update' : 'create'} parameter`,
				color: 'red',
			});
		}
	};

	return (
		<form onSubmit={form.onSubmit(handleSubmit)} className={styles.form}>
			<RightSectionCard
				title={isEditMode ? 'Edit Parameter' : 'Create Parameter'}
				icon={IconSettings}
				iconColor='var(--mantine-color-blue-6)'
				rightSection={
					<ActionIcon
						variant='subtle'
						color='gray'
						aria-label='Close form'
						onClick={clearRightComponent}
						size='sm'
					>
						<IconX size={14} />
					</ActionIcon>
				}
			>
				<Stack gap='lg'>
					<div className={styles.sectionHeading}>
						<MantineText className={styles.sectionTitle}>
							General information
						</MantineText>
						<MantineText className={styles.sectionDescription}>
							Name and organize this preset so the team recognizes it quickly.
						</MantineText>
					</div>

					<TextInput
						label='Parameter Name'
						placeholder='e.g., Fast response agent'
						required
						{...form.getInputProps('name')}
						description={
							isEditMode
								? 'Changing the name will create a new parameter'
								: 'Unique identifier for this configuration'
						}
					/>

					<Divider />

					<div className={styles.section}>
						<div className={styles.sectionHeading}>
							<MantineText className={styles.sectionTitle}>
								Speech recognition
							</MantineText>
							<MantineText className={styles.sectionDescription}>
								Configure how the system transcribes caller speech.
							</MantineText>
						</div>

						<div className={styles.grid}>
							<Select
								label='Provider'
								placeholder='Select ASR provider'
								required
								data={ASR_PROVIDERS}
								{...form.getInputProps('asrProvider')}
								searchable
							/>
							<Select
								label='Quality'
								placeholder='Select quality'
								required
								data={ASR_QUALITY}
								{...form.getInputProps('asrQuality')}
							/>
							<Select
								label='Input Audio Format'
								placeholder='Select format'
								required
								data={AUDIO_FORMATS}
								{...form.getInputProps('asrUserInputAudioFormat')}
							/>
							<TagsInput
								label='Keywords'
								placeholder='Type and press Enter'
								description='Add keywords to improve transcription accuracy'
								{...form.getInputProps('asrKeywords')}
							/>
						</div>
					</div>

					<Divider />

					<div className={styles.section}>
						<div className={styles.sectionHeading}>
							<MantineText className={styles.sectionTitle}>
								Voice output
							</MantineText>
							<MantineText className={styles.sectionDescription}>
								Tune the ElevenLabs synthesis defaults that callers will hear.
							</MantineText>
						</div>

						<div className={styles.grid}>
							<Select
								label='Model'
								placeholder='Select TTS model'
								required
								data={TTS_MODELS}
								{...form.getInputProps('ttsModelId')}
								searchable
							/>
							<Select
								label='Output Audio Format'
								placeholder='Select format'
								required
								data={AUDIO_FORMATS}
								{...form.getInputProps('ttsAgentOutputAudioFormat')}
							/>
							<div className={styles.sliderContainer}>
								<div className={styles.sliderLabel}>
									<label>Speed</label>
									<span className={styles.sliderValue}>
										{form.values.ttsSpeed.toFixed(2)}
									</span>
								</div>
								<Slider
									min={0.25}
									max={4.0}
									step={0.01}
									value={form.values.ttsSpeed}
									onChange={(value) => form.setFieldValue('ttsSpeed', value)}
									marks={[
										{ value: 0.25, label: '0.25' },
										{ value: 2.0, label: '2.0' },
										{ value: 4.0, label: '4.0' },
									]}
								/>
								<MantineText size='xs' c='dimmed'>
									Speech rate (0.25–4.0)
								</MantineText>
							</div>
							<div className={styles.sliderContainer}>
								<div className={styles.sliderLabel}>
									<label>Streaming Latency</label>
									<span className={styles.sliderValue}>
										{form.values.ttsOptimizeStreamingLatency}
									</span>
								</div>
								<Slider
									min={0}
									max={4}
									step={1}
									value={form.values.ttsOptimizeStreamingLatency}
									onChange={(value) =>
										form.setFieldValue('ttsOptimizeStreamingLatency', value)
									}
									marks={[
										{ value: 0, label: '0' },
										{ value: 2, label: '2' },
										{ value: 4, label: '4' },
									]}
								/>
								<MantineText size='xs' c='dimmed'>
									0 = best quality, 4 = lowest latency
								</MantineText>
							</div>
							<div className={styles.sliderContainer}>
								<div className={styles.sliderLabel}>
									<label>Stability</label>
									<span className={styles.sliderValue}>
										{form.values.ttsStability.toFixed(2)}
									</span>
								</div>
								<Slider
									min={0}
									max={1}
									step={0.01}
									value={form.values.ttsStability}
									onChange={(value) =>
										form.setFieldValue('ttsStability', value)
									}
									marks={[
										{ value: 0, label: '0' },
										{ value: 0.5, label: '0.5' },
										{ value: 1, label: '1' },
									]}
								/>
								<MantineText size='xs' c='dimmed'>
									Voice consistency (0–1)
								</MantineText>
							</div>
							<div className={styles.sliderContainer}>
								<div className={styles.sliderLabel}>
									<label>Similarity Boost</label>
									<span className={styles.sliderValue}>
										{form.values.ttsSimilarityBoost.toFixed(2)}
									</span>
								</div>
								<Slider
									min={0}
									max={1}
									step={0.01}
									value={form.values.ttsSimilarityBoost}
									onChange={(value) =>
										form.setFieldValue('ttsSimilarityBoost', value)
									}
									marks={[
										{ value: 0, label: '0' },
										{ value: 0.5, label: '0.5' },
										{ value: 1, label: '1' },
									]}
								/>
								<MantineText size='xs' c='dimmed'>
									Match to original voice (0–1)
								</MantineText>
							</div>
						</div>
					</div>

					<Divider />

					<div className={styles.section}>
						<div className={styles.sectionHeading}>
							<MantineText className={styles.sectionTitle}>
								Agent personality
							</MantineText>
							<MantineText className={styles.sectionDescription}>
								Shape the tone and behaviour of the assistant.
							</MantineText>
						</div>
						<div className={styles.grid}>
							<Select
								label='LLM Model'
								placeholder='Select LLM model'
								required
								data={LLM_MODELS}
								{...form.getInputProps('agentPromptLlm')}
								searchable
							/>
							<div className={styles.sliderContainer}>
								<div className={styles.sliderLabel}>
									<label>Temperature</label>
									<span className={styles.sliderValue}>
										{form.values.agentPromptTemperature.toFixed(2)}
									</span>
								</div>
								<Slider
									min={0}
									max={2}
									step={0.01}
									value={form.values.agentPromptTemperature}
									onChange={(value) =>
										form.setFieldValue('agentPromptTemperature', value)
									}
									marks={[
										{ value: 0, label: '0' },
										{ value: 1, label: '1' },
										{ value: 2, label: '2' },
									]}
								/>
								<MantineText size='xs' c='dimmed'>
									Controls randomness (0–2)
								</MantineText>
							</div>
						</div>
					</div>
				</Stack>
			</RightSectionCard>

			<Group justify='space-between' mt='md' className={styles.actions}>
				<Group justify='flex-end' className={styles.actionsRight}>
					<Button variant='light' onClick={clearRightComponent}>
						Cancel
					</Button>
					<Button type='submit' loading={updateMutation.isPending}>
						{isEditMode ? 'Update' : 'Create'}
					</Button>
				</Group>
			</Group>
		</form>
	);
};

export default CampaignPredefinedParamsForm;
