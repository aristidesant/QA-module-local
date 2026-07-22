import axios from 'axios';
import { DEFAULT_API_URL } from './config';
import type {
	ElevenLabsLlm,
	ElevenLabsLlmFilters,
	ElevenLabsLlmStatusUpdate,
	ElevenLabsLlmSyncResponse,
} from '~/models/ElevenLabsLlmModel';

interface ElevenLabsLlmApiClient {
	getLlms: (filters?: ElevenLabsLlmFilters) => Promise<ElevenLabsLlm[]>;
	syncLlms: () => Promise<ElevenLabsLlmSyncResponse>;
	updateLlmStatus: (
		llm: string,
		payload: ElevenLabsLlmStatusUpdate
	) => Promise<ElevenLabsLlm>;
}

const elevenLabsLlmApi = (
	_authHeader: Record<string, string> = {}
): ElevenLabsLlmApiClient => ({
	getLlms: async (filters = {}) => {
		const response = await axios.get<ElevenLabsLlm[]>(
			`${DEFAULT_API_URL}/models/elevenlabs/llms`,
			{ params: filters, headers: { ..._authHeader } }
		);
		return response.data;
	},

	syncLlms: async () => {
		const response = await axios.post<ElevenLabsLlmSyncResponse>(
			`${DEFAULT_API_URL}/models/elevenlabs/llms/sync`,
			{},
			{ headers: { ..._authHeader } }
		);
		return response.data;
	},

	updateLlmStatus: async (llm, payload) => {
		const response = await axios.patch<ElevenLabsLlm>(
			`${DEFAULT_API_URL}/models/elevenlabs/llms/${encodeURIComponent(llm)}/status`,
			payload,
			{ headers: { ..._authHeader } }
		);
		return response.data;
	},
});

export default elevenLabsLlmApi;
