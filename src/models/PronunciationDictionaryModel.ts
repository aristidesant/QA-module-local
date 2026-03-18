export interface PronunciationDictionary {
	id: number;
	clientId: number;
	name: string;
	description: string | null;
	elevenLabsDictionaryId: string;
	elevenLabsVersionId: string;
	createdAt: string;
	updatedAt: string;
}

export type RuleType = 'ALIAS' | 'PHONEME';

export type RuleCategory =
	| 'CITY'
	| 'PROVINCE'
	| 'NAME'
	| 'LAST_NAME'
	| 'GENERAL';

export interface PronunciationRule {
	id: number;
	dictionaryId: number;
	clientId: number;
	grapheme: string;
	ruleType: RuleType;
	alias: string | null;
	phoneme: string | null;
	locale: string | null;
	description: string | null;
	category: RuleCategory;
	createdAt: string;
}

export interface CreateDictionaryParams {
	name: string;
	description?: string;
}

export interface CreateRuleParams {
	grapheme: string;
	ruleType: RuleType;
	alias?: string;
	phoneme?: string;
	locale?: string;
	description?: string;
	category?: RuleCategory;
}

export interface UpdateRuleParams {
	grapheme?: string;
	ruleType?: RuleType;
	alias?: string;
	phoneme?: string;
	locale?: string;
	description?: string;
	category?: RuleCategory;
}

export interface BulkUpsertRulesParams {
	rules: CreateRuleParams[];
}

export interface BulkUploadCsvError {
	row: number;
	grapheme: string;
	error: string;
}

export interface BulkUploadCsvResult {
	processed: number;
	succeeded: number;
	failed: number;
	errors: BulkUploadCsvError[];
}
