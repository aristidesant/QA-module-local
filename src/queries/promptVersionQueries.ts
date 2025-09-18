import { useQuery } from '@tanstack/react-query';
import promptVersionsApi from '~/api/promptVersionsApi';

/**
 * React Query hooks for Prompt Versions (Read-only)
 *
 * Available operations:
 * - Get all prompt versions (with filters)
 * - Get single prompt version by ID
 * - Get versions for a specific prompt
 *
 * PromptVersion structure:
 * - id: version identifier
 * - fullFields: complete Prompt object with all data
 * - generatedPrompt: version-specific generated content
 * - version: version number (1, 2, 3, etc.)
 * - promptId: reference to parent prompt
 */

// Get all prompt versions
export const useGetAllPromptVersions = (params?: {
	promptId?: number;
	status?: 'ACTIVE' | 'INACTIVE';
	cursor?: string;
	limit?: number;
}) => {
	return useQuery({
		queryKey: ['prompt-versions', params],
		queryFn: async () => {
			const api = promptVersionsApi();
			return api.getAllPromptVersions(params);
		},
		staleTime: 5 * 60 * 1000, // 5 minutes
	});
};

// Get prompt version by ID
export const useGetPromptVersion = (versionId: string) => {
	return useQuery({
		queryKey: ['prompt-version', versionId],
		queryFn: async () => {
			const api = promptVersionsApi();
			return api.getPromptVersionById(versionId);
		},
		enabled: !!versionId,
	});
};

// Get prompt versions for a specific prompt
export const useGetPromptVersionsByPromptId = (promptId: number) => {
	return useQuery({
		queryKey: ['prompt-versions', { promptId }],
		queryFn: async () => {
			const api = promptVersionsApi();
			return api.getAllPromptVersions({ promptId });
		},
		enabled: !!promptId,
		staleTime: 5 * 60 * 1000, // 5 minutes
	});
};
