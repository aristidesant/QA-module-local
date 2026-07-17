import type { ListQueryParams } from './shared';
import type { ConversationSource } from './campaigns';

export type ConversationMediaType = 'AUDIO' | 'STRUCTURED';
export type TranscriptionStatus =
	| 'PENDING'
	| 'PROCESSING'
	| 'COMPLETED'
	| 'FAILED';

export interface ConversationListQueryParams extends ListQueryParams {
	q?: string;
	externalRef?: string;
	sortBy?: 'id' | 'externalRef' | 'createdAt';
	orderBy?: 'ASC' | 'DESC';
}

export interface Conversation {
	id: number;
	clientId?: number;
	campaignId: number;
	externalRef?: string | null;
	metadata?: Record<string, unknown> | null;
	source?: ConversationSource | null;
	sourceMetadata?: Record<string, unknown> | null;
	mediaType?: ConversationMediaType | null;
	audioFileKey?: string | null;
	audioSizeBytes?: number | null;
	audioDurationSeconds?: number | null;
	audioContentType?: string | null;
	transcriptionStatus?: TranscriptionStatus | null;
	transcriptionError?: string | null;
	createdAt?: string;
	updatedAt?: string;
}

export interface TranscribeConversationPayload {
	agentSpeakerIndex?: number;
}

export interface TranscribeConversationResponse {
	jobId: string;
	conversationId: number;
	status: TranscriptionStatus;
}

export interface TranscriptionStatusResponse {
	status: TranscriptionStatus | null;
	error: string | null;
}

export type ConversationTranscriptProfile = 'MIN' | 'INTERMEDIATE' | 'FULL';

export interface ConversationTranscriptSegment {
	id: string;
	speakerLabel: string;
	text: string;
	startSeconds: number | null;
	endSeconds: number | null;
	raw: unknown;
}

export interface ConversationTranscript {
	conversationId?: number;
	profile?: ConversationTranscriptProfile;
	fullText?: string | null;
	segments: ConversationTranscriptSegment[];
	raw: unknown;
}

export interface UploadAudioConversationPayload {
	file: File;
	externalRef?: string;
	source?: ConversationSource;
	sourceMetadata?: Record<string, unknown>;
}

export interface MockConversation {
	id: string;
	campaignId: number;
	campaignName: string;
	externalRef: string;
	customerName: string;
	agentName: string;
	channel: string;
	durationLabel: string;
	occurredAt: string;
}
