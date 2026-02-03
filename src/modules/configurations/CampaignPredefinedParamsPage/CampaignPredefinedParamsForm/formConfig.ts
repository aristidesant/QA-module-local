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
		modelName: 'Qwen3-30B-A3B',
		modelCode: 'qwen3-30b-a3b',
		provider: 'ElevenLabs',
	},
	{
		modelName: 'GPT-OSS-120B',
		modelCode: 'gpt-oss-120b',
		provider: 'ElevenLabs',
	},
	{
		modelName: 'Gemini 3 Pro Preview',
		modelCode: 'gemini-3-pro-preview',
		provider: 'Google',
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
		modelName: 'Gemini 2.0 Flash',
		modelCode: 'gemini-2.0-flash',
		provider: 'Google',
	},
	{
		modelName: 'Gemini 2.0 Flash Lite',
		modelCode: 'gemini-2.0-flash-lite',
		provider: 'Google',
	},
	{ modelName: 'GPT-5', modelCode: 'gpt-5', provider: 'OpenAI' },
	{ modelName: 'GPT-5 Mini', modelCode: 'gpt-5-mini', provider: 'OpenAI' },
	{ modelName: 'GPT-5 Nano', modelCode: 'gpt-5-nano', provider: 'OpenAI' },
	{ modelName: 'GPT-4.1', modelCode: 'gpt-4.1', provider: 'OpenAI' },
	{ modelName: 'GPT-4.1 Mini', modelCode: 'gpt-4.1-mini', provider: 'OpenAI' },
	{ modelName: 'GPT-4.1 Nano', modelCode: 'gpt-4.1-nano', provider: 'OpenAI' },
	{ modelName: 'GPT-4o', modelCode: 'gpt-4o', provider: 'OpenAI' },
	{ modelName: 'GPT-4o Mini', modelCode: 'gpt-4o-mini', provider: 'OpenAI' },
	{ modelName: 'GPT-4 Turbo', modelCode: 'gpt-4-turbo', provider: 'OpenAI' },
	{
		modelName: 'GPT-3.5 Turbo',
		modelCode: 'gpt-3.5-turbo',
		provider: 'OpenAI',
	},
	{
		modelName: 'Claude Sonnet 4.5',
		modelCode: 'claude-sonnet-4-5',
		provider: 'Anthropic',
	},
	{
		modelName: 'Claude Sonnet 4',
		modelCode: 'claude-sonnet-4',
		provider: 'Anthropic',
	},
	{
		modelName: 'Claude Haiku 4.5',
		modelCode: 'claude-haiku-4-5',
		provider: 'Anthropic',
	},
	{
		modelName: 'Claude 3.7 Sonnet',
		modelCode: 'claude-3-7-sonnet',
		provider: 'Anthropic',
	},
	{
		modelName: 'Claude 3.5 Sonnet',
		modelCode: 'claude-3-5-sonnet',
		provider: 'Anthropic',
	},
	{
		modelName: 'Claude 3 Haiku',
		modelCode: 'claude-3-haiku',
		provider: 'Anthropic',
	},
];

export const DEFAULT_AGENT_LLM = 'gpt-4o-mini';

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
	{ value: 'eleven_turbo_v2_5', label: 'Eleven Turbo v2.5' },
	{ value: 'eleven_flash_v2_5', label: 'Eleven Flash v2.5' },
	{ value: 'eleven_multilingual_v2', label: 'Eleven Multilingual v2' },
];

export const ASR_PROVIDERS = [{ value: 'elevenlabs', label: 'ElevenLabs' }];

export const getAsrQualityOptions = (t: TFunction) => [
	{ value: 'high', label: t('form.asr.quality.options.high') },
	{ value: 'medium', label: t('form.asr.quality.options.medium') },
	{ value: 'low', label: t('form.asr.quality.options.low') },
];
