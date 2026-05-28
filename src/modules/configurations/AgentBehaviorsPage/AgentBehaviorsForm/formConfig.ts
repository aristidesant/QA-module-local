import type { TFunction } from 'i18next';

export const AUDIO_FORMATS = [
	{ value: 'pcm_16000', label: 'PCM 16000' },
	{ value: 'pcm_22050', label: 'PCM 22050' },
	{ value: 'pcm_24000', label: 'PCM 24000' },
	{ value: 'pcm_44100', label: 'PCM 44100' },
	{ value: 'pcm_48000', label: 'PCM 48000' },
	{ value: 'ulaw_8000', label: 'uLaw 8000' },
	{ value: 'mp3_44100_128', label: 'MP3 44100 128' },
	{ value: 'mp3_22050_32', label: 'MP3 22050 32' },
];

export const LLM_MODELS = [
	{
		modelName: 'GLM-4.5-Air',
		modelCode: 'glm-45-air-fp8',
		provider: 'ElevenLabs',
	},
	{
		modelName: 'GPT-OSS-120B',
		modelCode: 'gpt-oss-120b',
		provider: 'ElevenLabs',
	},
	{
		modelName: 'Qwen3-4B',
		modelCode: 'qwen3-4b',
		provider: 'ElevenLabs',
	},
	{
		modelName: 'Qwen3-30B-A3B',
		modelCode: 'qwen3-30b-a3b',
		provider: 'ElevenLabs',
	},
	{
		modelName: 'Qwen3.5-397B-A17B',
		modelCode: 'qwen35-397b-a17b',
		provider: 'ElevenLabs',
	},
	{
		modelName: 'Qwen3.6-35B-A3B',
		modelCode: 'qwen36-35b-a3b',
		provider: 'ElevenLabs',
	},
	{
		modelName: 'Gemini 2.5 Flash',
		modelCode: 'gemini-2.5-flash',
		provider: 'Google',
	},
	{
		modelName: 'Gemini 2.5 Flash Lite',
		modelCode: 'gemini-2.5-flash-lite',
		provider: 'Google',
	},
	{
		modelName: 'Gemini 3 Flash Preview',
		modelCode: 'gemini-3-flash-preview',
		provider: 'Google',
	},
	{
		modelName: 'Gemini 3.1 Flash Lite Preview',
		modelCode: 'gemini-3.1-flash-lite-preview',
		provider: 'Google',
	},
	{
		modelName: 'Gemini 3.1 Pro Preview',
		modelCode: 'gemini-3.1-pro-preview',
		provider: 'Google',
	},
	{
		modelName: 'GPT-3.5 Turbo',
		modelCode: 'gpt-3.5-turbo',
		provider: 'OpenAI',
	},
	{ modelName: 'GPT-4 Turbo', modelCode: 'gpt-4-turbo', provider: 'OpenAI' },
	{ modelName: 'GPT-4o', modelCode: 'gpt-4o', provider: 'OpenAI' },
	{ modelName: 'GPT-4o Mini', modelCode: 'gpt-4o-mini', provider: 'OpenAI' },
	{ modelName: 'GPT-4.1', modelCode: 'gpt-4.1', provider: 'OpenAI' },
	{ modelName: 'GPT-4.1 Mini', modelCode: 'gpt-4.1-mini', provider: 'OpenAI' },
	{ modelName: 'GPT-4.1 Nano', modelCode: 'gpt-4.1-nano', provider: 'OpenAI' },
	{ modelName: 'GPT-5', modelCode: 'gpt-5', provider: 'OpenAI' },
	{ modelName: 'GPT-5 Mini', modelCode: 'gpt-5-mini', provider: 'OpenAI' },
	{ modelName: 'GPT-5 Nano', modelCode: 'gpt-5-nano', provider: 'OpenAI' },
	{ modelName: 'GPT-5.1', modelCode: 'gpt-5.1', provider: 'OpenAI' },
	{ modelName: 'GPT-5.2', modelCode: 'gpt-5.2', provider: 'OpenAI' },
	{
		modelName: 'GPT-5.2 Chat Latest',
		modelCode: 'gpt-5.2-chat-latest',
		provider: 'OpenAI',
	},
	{ modelName: 'GPT-5.4', modelCode: 'gpt-5.4', provider: 'OpenAI' },
	{
		modelName: 'GPT-5.4 (2026-03-05)',
		modelCode: 'gpt-5.4-2026-03-05',
		provider: 'OpenAI',
	},
	{ modelName: 'GPT-5.4 Mini', modelCode: 'gpt-5.4-mini', provider: 'OpenAI' },
	{
		modelName: 'GPT-5.4 Mini (2026-03-17)',
		modelCode: 'gpt-5.4-mini-2026-03-17',
		provider: 'OpenAI',
	},
	{ modelName: 'GPT-5.4 Nano', modelCode: 'gpt-5.4-nano', provider: 'OpenAI' },
	{ modelName: 'GPT-5.5', modelCode: 'gpt-5.5', provider: 'OpenAI' },
	{
		modelName: 'GPT-5.5 (2026-04-23)',
		modelCode: 'gpt-5.5-2026-04-23',
		provider: 'OpenAI',
	},
	{
		modelName: 'Claude 3 Haiku',
		modelCode: 'claude-3-haiku',
		provider: 'Anthropic',
	},
	{
		modelName: 'Claude 3.5 Sonnet',
		modelCode: 'claude-3-5-sonnet',
		provider: 'Anthropic',
	},
	{
		modelName: 'Claude 3.7 Sonnet',
		modelCode: 'claude-3-7-sonnet',
		provider: 'Anthropic',
	},
	{
		modelName: 'Claude Haiku 4.5',
		modelCode: 'claude-haiku-4-5',
		provider: 'Anthropic',
	},
	{
		modelName: 'Claude Opus 4.7',
		modelCode: 'claude-opus-4-7',
		provider: 'Anthropic',
	},
	{
		modelName: 'Claude Sonnet 4',
		modelCode: 'claude-sonnet-4',
		provider: 'Anthropic',
	},
	{
		modelName: 'Claude Sonnet 4.5',
		modelCode: 'claude-sonnet-4-5',
		provider: 'Anthropic',
	},
	{
		modelName: 'Claude Sonnet 4.6',
		modelCode: 'claude-sonnet-4-6',
		provider: 'Anthropic',
	},
];

export const DEFAULT_AGENT_LLM = 'gpt-4o-mini';
export const DEFAULT_BACKUP_LLM_PREFERENCE = 'override';

export const getGroupedLlmOptions = () =>
	LLM_MODELS.reduce<
		{ group: string; items: { value: string; label: string }[] }[]
	>((groups, model) => {
		const existingGroup = groups.find(
			(group) => group.group === model.provider
		);
		const option = { value: model.modelCode, label: model.modelName };
		if (existingGroup) {
			existingGroup.items.push(option);
			return groups;
		}
		return [...groups, { group: model.provider, items: [option] }];
	}, []);

export const TTS_MODELS = [
	{ value: 'eleven_v3_conversational', label: 'Eleven v3 Conversational' },
	{ value: 'eleven_turbo_v2_5', label: 'Eleven Turbo v2.5' },
	{ value: 'eleven_flash_v2_5', label: 'Eleven Flash v2.5' },
	{ value: 'eleven_multilingual_v2', label: 'Eleven Multilingual v2' },
];

export const DEFAULT_TTS_MODEL_ID = 'eleven_turbo_v2_5';
export const EXPRESSIVE_TTS_MODEL_ID = 'eleven_v3_conversational';

export interface SuggestedAudioTagFormValue {
	tag: string;
	description: string;
}

export const isExpressiveTtsModel = (modelId?: string | null) =>
	modelId === EXPRESSIVE_TTS_MODEL_ID;

export const normalizeSuggestedAudioTags = (
	tags?: SuggestedAudioTagFormValue[] | null
): SuggestedAudioTagFormValue[] =>
	(tags ?? [])
		.map((tag) => ({
			tag: tag.tag.trim(),
			description: tag.description.trim(),
		}))
		.filter((tag) => tag.tag.length > 0);

export const ASR_PROVIDERS = [
	{ value: 'scribe_realtime', label: 'Scribe Realtime' },
	{ value: 'elevenlabs', label: 'ElevenLabs' },
];

export const getAsrQualityOptions = (t: TFunction) => [
	{ value: 'high', label: t('form.asr.quality.options.high') },
	{ value: 'medium', label: t('form.asr.quality.options.medium') },
	{ value: 'low', label: t('form.asr.quality.options.low') },
];
