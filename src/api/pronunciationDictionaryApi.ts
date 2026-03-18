import axios from 'axios';
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
import { DEFAULT_API_URL } from './config';

const BASE_PATH = '/pronunciation-dictionaries';

// ── Dictionary endpoints ──

/**
 * List all pronunciation dictionaries for the current client (paginated).
 */
export const getDictionaries = async (
	params?: { limit?: number; offset?: number },
	apiUrl: string = DEFAULT_API_URL
): Promise<PaginatedResponse<PronunciationDictionary>> => {
	const response = await axios.get<PaginatedResponse<PronunciationDictionary>>(
		`${apiUrl}${BASE_PATH}`,
		{ params }
	);
	return response.data;
};

/**
 * Get a single dictionary by ID.
 */
export const getDictionary = async (
	id: number,
	apiUrl: string = DEFAULT_API_URL
): Promise<PronunciationDictionary> => {
	const response = await axios.get<PronunciationDictionary>(
		`${apiUrl}${BASE_PATH}/${id}`
	);
	return response.data;
};

/**
 * Create a new pronunciation dictionary.
 */
export const createDictionary = async (
	params: CreateDictionaryParams,
	apiUrl: string = DEFAULT_API_URL
): Promise<PronunciationDictionary> => {
	const response = await axios.post<PronunciationDictionary>(
		`${apiUrl}${BASE_PATH}`,
		params
	);
	return response.data;
};

/**
 * Soft-delete a pronunciation dictionary.
 */
export const deleteDictionary = async (
	id: number,
	apiUrl: string = DEFAULT_API_URL
): Promise<void> => {
	await axios.delete(`${apiUrl}${BASE_PATH}/${id}`);
};

// ── Rule endpoints ──

/**
 * List all active rules for a dictionary (paginated).
 */
export const getRules = async (
	dictionaryId: number,
	params?: { limit?: number; offset?: number },
	apiUrl: string = DEFAULT_API_URL
): Promise<PaginatedResponse<PronunciationRule>> => {
	const response = await axios.get<PaginatedResponse<PronunciationRule>>(
		`${apiUrl}${BASE_PATH}/${dictionaryId}/rules`,
		{ params }
	);
	return response.data;
};

/**
 * Fetch ALL rules for a dictionary by paginating until exhausted.
 * Used for CSV export where a single unbounded request is not available.
 */
export const exportAllRules = async (
	dictionaryId: number,
	apiUrl: string = DEFAULT_API_URL
): Promise<PronunciationRule[]> => {
	const all: PronunciationRule[] = [];
	const limit = 200;
	let offset = 0;

	while (true) {
		const page = await getRules(dictionaryId, { limit, offset }, apiUrl);
		all.push(...page.data);
		if (page.data.length < limit) break;
		offset += limit;
	}

	return all;
};

/**
 * Add a single rule to a dictionary.
 */
export const createRule = async (
	dictionaryId: number,
	params: CreateRuleParams,
	apiUrl: string = DEFAULT_API_URL
): Promise<PronunciationRule> => {
	const response = await axios.post<PronunciationRule>(
		`${apiUrl}${BASE_PATH}/${dictionaryId}/rules`,
		params
	);
	return response.data;
};

/**
 * Update an existing rule.
 */
export const updateRule = async (
	dictionaryId: number,
	ruleId: number,
	params: UpdateRuleParams,
	apiUrl: string = DEFAULT_API_URL
): Promise<PronunciationRule> => {
	const response = await axios.put<PronunciationRule>(
		`${apiUrl}${BASE_PATH}/${dictionaryId}/rules/${ruleId}`,
		params
	);
	return response.data;
};

/**
 * Delete a rule (soft-delete + ElevenLabs removal).
 */
export const deleteRule = async (
	dictionaryId: number,
	ruleId: number,
	apiUrl: string = DEFAULT_API_URL
): Promise<void> => {
	await axios.delete(`${apiUrl}${BASE_PATH}/${dictionaryId}/rules/${ruleId}`);
};

/**
 * Bulk upsert rules (create or update by grapheme match).
 */
export const bulkUpsertRules = async (
	dictionaryId: number,
	params: BulkUpsertRulesParams,
	apiUrl: string = DEFAULT_API_URL
): Promise<PronunciationRule[]> => {
	const response = await axios.post<PronunciationRule[]>(
		`${apiUrl}${BASE_PATH}/${dictionaryId}/rules/bulk`,
		params
	);
	return response.data;
};

/**
 * Bulk upload rules from a CSV file (create or update by grapheme match).
 */
export const bulkUploadCsvRules = async (
	dictionaryId: number,
	file: File,
	apiUrl: string = DEFAULT_API_URL
): Promise<BulkUploadCsvResult> => {
	const formData = new FormData();
	formData.append('file', file);
	const response = await axios.post<BulkUploadCsvResult>(
		`${apiUrl}${BASE_PATH}/${dictionaryId}/rules/bulk/csv`,
		formData,
		{ headers: { 'Content-Type': 'multipart/form-data' } }
	);
	return response.data;
};

// ── Sync ──

/**
 * Force a full rebuild of the ElevenLabs dictionary from DB rules.
 */
export const syncDictionary = async (
	id: number,
	apiUrl: string = DEFAULT_API_URL
): Promise<PronunciationDictionary> => {
	const response = await axios.post<PronunciationDictionary>(
		`${apiUrl}${BASE_PATH}/${id}/sync`
	);
	return response.data;
};

// ── Agent attachment ──

/**
 * Attach multiple pronunciation dictionaries to an agent in a single call.
 * The provided list replaces the agent's complete set of attached dictionaries.
 * Requires at least one dictionaryId.
 */
export const bulkAttachDictionariesToAgent = async (
	dictionaryIds: number[],
	agentId: string,
	apiUrl: string = DEFAULT_API_URL
): Promise<void> => {
	await axios.put(`${apiUrl}${BASE_PATH}/bulk-attach/agents/${agentId}`, {
		dictionaryIds,
	});
};

/**
 * Detach a pronunciation dictionary from an ElevenLabs agent.
 */
export const detachDictionaryFromAgent = async (
	dictionaryId: number,
	agentId: string,
	apiUrl: string = DEFAULT_API_URL
): Promise<void> => {
	await axios.delete(`${apiUrl}${BASE_PATH}/${dictionaryId}/agents/${agentId}`);
};
