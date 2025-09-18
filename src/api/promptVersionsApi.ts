import axios from 'axios';
import type { PromptVersion } from '~/models/PromptVersionModel';
import { DEFAULT_API_URL } from './config';

/**
 * Prompt Versions API client
 * Note: Authorization handled by global Axios interceptor.
 *
 * Available endpoints:
 * - GET /prompt-versions - Get all prompt versions
 * - GET /prompt-versions/{id} - Get prompt version by id
 *
 * Response structure includes:
 * - id: version ID
 * - fullFields: complete prompt data (Prompt object)
 * - generatedPrompt: version-specific generated content
 * - version: version number
 * - promptId: parent prompt ID
 * - userId: owner ID
 * - timestamps: createdAt, updatedAt, deletedAt
 */
const promptVersionsApi = (_authHeader?: Record<string, string>) => {
	return {
		// GET /prompt-versions - Get all prompt versions
		getAllPromptVersions: async (params?: {
			promptId?: number;
			status?: 'ACTIVE' | 'INACTIVE';
			cursor?: string;
			limit?: number;
		}) => {
			const response = await axios.get<PromptVersion[]>(
				`${DEFAULT_API_URL}/prompt-versions`,
				{
					params,
					timeout: 5000,
				}
			);
			return response.data;
		},

		// GET /prompt-versions/{id} - Get prompt version by id
		getPromptVersionById: async (versionId: string) => {
			const response = await axios.get<PromptVersion>(
				`${DEFAULT_API_URL}/prompt-versions/${versionId}`
			);
			return response.data;
		},
	};
};

export default promptVersionsApi;
