import {
	useQuery,
	useMutation,
	useQueryClient,
	type UseQueryOptions,
} from '@tanstack/react-query';
import type {
	PronunciationDictionary,
	PronunciationRule,
	CreateDictionaryParams,
	CreateRuleParams,
	UpdateRuleParams,
	BulkUpsertRulesParams,
	BulkUploadCsvResult,
} from '~/models/PronunciationDictionaryModel';
import type { PaginatedResponse } from '~/models/CampaignsModel';
import {
	getDictionaries,
	getDictionary,
	createDictionary,
	deleteDictionary,
	getRules,
	createRule,
	updateRule,
	deleteRule,
	bulkUpsertRules,
	bulkUploadCsvRules,
	syncDictionary,
	attachDictionaryToAgent,
	detachDictionaryFromAgent,
} from '~/api/pronunciationDictionaryApi';

// ── Query keys ──

export const pronunciationDictionaryKeys = {
	all: ['pronunciationDictionaries'] as const,
	lists: (params?: { limit?: number; offset?: number }) =>
		[...pronunciationDictionaryKeys.all, 'list', params ?? {}] as const,
	detail: (id: number) =>
		[...pronunciationDictionaryKeys.all, 'detail', id] as const,
	rules: (dictionaryId: number, params?: { limit?: number; offset?: number }) =>
		[
			...pronunciationDictionaryKeys.all,
			'rules',
			dictionaryId,
			params ?? {},
		] as const,
};

// ── Dictionary hooks ──

/**
 * Fetch all pronunciation dictionaries for the current client (paginated).
 */
export const usePronunciationDictionaries = (
	params?: { limit?: number; offset?: number },
	options?: Omit<
		UseQueryOptions<PaginatedResponse<PronunciationDictionary>, Error>,
		'queryKey' | 'queryFn'
	>
) => {
	return useQuery<PaginatedResponse<PronunciationDictionary>, Error>({
		queryKey: pronunciationDictionaryKeys.lists(params),
		queryFn: () => getDictionaries(params),
		...options,
	});
};

/**
 * Fetch a single pronunciation dictionary by ID.
 */
export const usePronunciationDictionary = (
	id: number,
	options?: Omit<
		UseQueryOptions<PronunciationDictionary, Error>,
		'queryKey' | 'queryFn'
	>
) => {
	return useQuery<PronunciationDictionary, Error>({
		queryKey: pronunciationDictionaryKeys.detail(id),
		queryFn: () => getDictionary(id),
		...options,
	});
};

/**
 * Create a new pronunciation dictionary.
 */
export const useCreateDictionary = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (params: CreateDictionaryParams) => createDictionary(params),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: pronunciationDictionaryKeys.all,
			});
		},
	});
};

/**
 * Delete (soft-delete) a pronunciation dictionary.
 */
export const useDeleteDictionary = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (id: number) => deleteDictionary(id),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: pronunciationDictionaryKeys.all,
			});
		},
	});
};

// ── Rule hooks ──

/**
 * Fetch all rules for a dictionary (paginated).
 */
export const usePronunciationRules = (
	dictionaryId: number,
	params?: { limit?: number; offset?: number },
	options?: Omit<
		UseQueryOptions<PaginatedResponse<PronunciationRule>, Error>,
		'queryKey' | 'queryFn'
	>
) => {
	return useQuery<PaginatedResponse<PronunciationRule>, Error>({
		queryKey: pronunciationDictionaryKeys.rules(dictionaryId, params),
		queryFn: () => getRules(dictionaryId, params),
		enabled: dictionaryId > 0,
		...options,
	});
};

/**
 * Add a single rule to a dictionary.
 */
export const useCreateRule = (dictionaryId: number) => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (params: CreateRuleParams) => createRule(dictionaryId, params),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: pronunciationDictionaryKeys.rules(dictionaryId),
			});
		},
	});
};

/**
 * Update an existing rule.
 */
export const useUpdateRule = (dictionaryId: number) => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({
			ruleId,
			params,
		}: {
			ruleId: number;
			params: UpdateRuleParams;
		}) => updateRule(dictionaryId, ruleId, params),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: pronunciationDictionaryKeys.rules(dictionaryId),
			});
		},
	});
};

/**
 * Delete a rule.
 */
export const useDeleteRule = (dictionaryId: number) => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (ruleId: number) => deleteRule(dictionaryId, ruleId),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: pronunciationDictionaryKeys.rules(dictionaryId),
			});
		},
	});
};

/**
 * Bulk upsert rules.
 */
export const useBulkUpsertRules = (dictionaryId: number) => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (params: BulkUpsertRulesParams) =>
			bulkUpsertRules(dictionaryId, params),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: pronunciationDictionaryKeys.rules(dictionaryId),
			});
		},
	});
};

/**
 * Bulk upload rules from a CSV file.
 */
export const useBulkUploadCsvRules = (dictionaryId: number) => {
	const queryClient = useQueryClient();

	return useMutation<BulkUploadCsvResult, Error, File>({
		mutationFn: (file: File) => bulkUploadCsvRules(dictionaryId, file),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: pronunciationDictionaryKeys.rules(dictionaryId),
			});
		},
	});
};

// ── Sync hook ──

/**
 * Force-sync dictionary to ElevenLabs.
 */
export const useSyncDictionary = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (id: number) => syncDictionary(id),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: pronunciationDictionaryKeys.all,
			});
		},
	});
};

// ── Agent attachment hook ──

/**
 * Attach a dictionary to an agent.
 */
export const useAttachDictionaryToAgent = () => {
	return useMutation({
		mutationFn: ({
			dictionaryId,
			agentId,
		}: {
			dictionaryId: number;
			agentId: string;
		}) => attachDictionaryToAgent(dictionaryId, agentId),
	});
};

/**
 * Detach a dictionary from an agent.
 */
export const useDetachDictionaryFromAgent = () => {
	return useMutation({
		mutationFn: ({
			dictionaryId,
			agentId,
		}: {
			dictionaryId: number;
			agentId: string;
		}) => detachDictionaryFromAgent(dictionaryId, agentId),
	});
};
