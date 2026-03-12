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
}

export interface UpdateRuleParams {
	grapheme?: string;
	ruleType?: RuleType;
	alias?: string;
	phoneme?: string;
	locale?: string;
	description?: string;
}

export interface BulkUpsertRulesParams {
	rules: CreateRuleParams[];
}
