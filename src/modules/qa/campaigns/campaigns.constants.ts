import type { ConversationSource } from '~/models/qa';

export const CONVERSATION_SOURCES: ConversationSource[] = [
	'MANUAL_UPLOAD',
	'UCXM',
	'ELEVENLABS',
	'OTHER',
];

export const AUDIO_MAX_SIZE_MB = 50;
export const AUDIO_MAX_SIZE_BYTES = AUDIO_MAX_SIZE_MB * 1024 * 1024;
