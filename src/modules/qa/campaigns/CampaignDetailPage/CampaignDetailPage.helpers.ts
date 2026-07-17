import type { Conversation } from '~/models/qa';

export function hasAudio(conversation: Conversation) {
	return (
		conversation.mediaType === 'AUDIO' ||
		Boolean(conversation.audioFileKey || conversation.audioContentType)
	);
}
