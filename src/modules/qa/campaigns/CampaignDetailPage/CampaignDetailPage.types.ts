import type { ConversationSource } from '~/models/qa';

export interface UploadAudioFormValues {
	file: File | null;
	externalRef: string;
	source: ConversationSource;
}
