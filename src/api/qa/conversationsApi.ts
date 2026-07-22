import type {
	AiEvaluationResponse,
	CreateAiEvaluationPayload,
	ConversationTranscript,
	ConversationTranscriptProfile,
	TranscribeConversationPayload,
	TranscribeConversationResponse,
	TranscriptionStatusResponse,
} from '~/models/qa';
import { normalizeConversationTranscript } from '~/modules/qa/utils/conversationTranscript';
import { qaHttpClient } from '~/api/qa/qaConfig';

export async function transcribeConversation(
	conversationId: number,
	payload: TranscribeConversationPayload = {}
) {
	const response = await qaHttpClient.post<TranscribeConversationResponse>(
		`/conversations/${conversationId}/transcript/transcribe`,
		payload
	);

	return response.data;
}

export async function getTranscriptionStatus(conversationId: number) {
	const response = await qaHttpClient.get<TranscriptionStatusResponse>(
		`/conversations/${conversationId}/transcript/transcription-status`
	);

	return response.data;
}

export async function getConversationTranscript(
	conversationId: number,
	profile: ConversationTranscriptProfile = 'FULL'
): Promise<ConversationTranscript> {
	const response = await qaHttpClient.get<unknown>(
		`/conversations/${conversationId}/transcript`,
		{
			params: { profile },
		}
	);

	return normalizeConversationTranscript(response.data, profile);
}

export async function createAiEvaluation(
	conversationId: number,
	payload: CreateAiEvaluationPayload
) {
	const response = await qaHttpClient.post<AiEvaluationResponse>(
		`/conversations/${conversationId}/ai-evaluations`,
		payload
	);

	return response.data;
}

export async function deleteConversation(conversationId: number) {
	const response = await qaHttpClient.delete<{ message: string }>(
		`/conversations/${conversationId}`
	);

	return response.data;
}
