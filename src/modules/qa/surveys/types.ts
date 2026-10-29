import type {
	CauseTrend,
	FamilyShareRow,
	SentimentCauseFamily,
	SentimentCauseKey,
} from '~/modules/qa/sentimentCauses/types';

/** What promoters praise, from a short fixed list. */
export type SurveyStrengthKey =
	| 'QUICK_RESOLUTION'
	| 'CLEAR_EXPLANATION'
	| 'PATIENT_AGENT'
	| 'FIRST_CALL_FIX';

/** A comment is about a root cause (detractors and passives) or a strength (promoters). */
export type SurveyThemeKey = SentimentCauseKey | SurveyStrengthKey;

/** What a comment is about and the words in it that say so. */
export interface SurveyTheme {
	key: SurveyThemeKey;
	highlight: string;
}

/** QA score bands the NPS is compared across; the cut points come from the QA bands in Settings. */
export type QaBandKey = 'low' | 'mid' | 'high';

export interface SurveyBandRow {
	key: QaBandKey;
	/** NPS responses from calls in the band. */
	responses: number;
	/** Net Promoter Score of those calls, -100 to 100; null without responses. */
	nps: number | null;
}

/** One agent on the QA-vs-NPS scatter. */
export interface SurveyAgentPoint {
	agentId: string;
	agentName: string;
	/** Mean QA score of the agent's calls in the filters. */
	qa: number;
	/** The agent's NPS, -100 to 100. */
	nps: number;
	responses: number;
}

export interface SurveyComment {
	id: string;
	date: string;
	agentName: string;
	type: 'NPS' | 'CSAT';
	score: number;
	verbatim: string;
	/** NPS 0-6 or CSAT 1-2: the only responses worth a colour. */
	detractor: boolean;
	/** What the comment is about, and the words in it that say so. */
	theme: SurveyThemeKey | null;
	highlight: string | null;
}

/** One root cause in the ranking of what detractors write about. */
export interface CommentCauseRow {
	key: SentimentCauseKey;
	family: SentimentCauseFamily;
	/** Detractor comments whose theme is this cause. */
	comments: number;
	/** % of the detractor comments, one decimal. */
	share: number;
	previousComments: number;
	/** Null when no previous period was given. */
	previousShare: number | null;
	/** share minus previousShare, in points; null without a previous period. */
	delta: number | null;
}

/** One thing promoters praise. */
export interface StrengthRow {
	key: SurveyStrengthKey;
	comments: number;
	/** % of the promoter comments, one decimal. */
	share: number;
}

/** The comments read as structured insight: which causes sit behind detractor comments, and what promoters praise. */
export interface SurveyCommentary {
	causes: CommentCauseRow[];
	families: FamilyShareRow[];
	strengths: StrengthRow[];
	/** Detractor comments per period for the most frequent causes. */
	trend: CauseTrend;
	/** Detractor responses that left a comment, and so carry a cause. */
	detractorComments: number;
	/** Every detractor response, with or without a comment. */
	detractorResponses: number;
}

export interface SurveySummary {
	bands: SurveyBandRow[];
	byAgent: SurveyAgentPoint[];
	comments: SurveyComment[];
	commentary: SurveyCommentary;
}

/** An agent needs this many NPS responses to appear on the scatter, or one answer would swing the point. */
export const MIN_AGENT_RESPONSES = 5;
export const MAX_COMMENTS = 12;
