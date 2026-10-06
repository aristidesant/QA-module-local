import type { CallEvaluationTab } from '~/views/Campaigns/types';

/**
 * Agent opens it, QA Manager resolves it: accepted when every item under review
 * was corrected, partially accepted when some were kept, rejected when none.
 */
export type DisputeStatus =
	| 'open'
	| 'accepted'
	| 'partially-accepted'
	| 'rejected';

export type DisputeEvaluationType = CallEvaluationTab;

/** Which control the QA Manager gets to decide the item. */
export type DisputeItemKind =
	| 'binary'
	| 'compliance'
	| 'sentiment-category'
	| 'emotion'
	| 'recovery';

/** The AI's written analysis of a compliance finding, which the QA Manager can correct. */
export interface DisputeItemAnalysis {
	note?: string;
	evidenceTimestamp?: string;
	evidenceQuote?: string;
}

/**
 * One disputable sub-item of an evaluation: the agent flags it when opening,
 * the QA Manager decides whether the original stands or what the right value is.
 */
export interface DisputeItemRef {
	id: string;
	label: string;
	/** Aspect name, compliance area, "Signals", "Outcome" or "Sentiment". */
	group: string;
	kind: DisputeItemKind;
	/** The raw original value: 'no', a compliance status, a sentiment category, an emotion, 'not-recovered', 'detected'… */
	value: string;
	/** The value as originally scored, for display, e.g. "No · 0/5" or "Warning". */
	original: string;
	/** What the AI wrote about the item; only compliance findings carry it. */
	analysis?: DisputeItemAnalysis;
}

/** The QA Manager's decision on one disputable item. */
export interface DisputeItemDecision {
	itemId: string;
	outcome: 'keep' | 'correct';
	/** Corrected raw value: 'yes', 'warning' | 'compliant', a sentiment category, an emotion, 'recovered', 'not-detected' or 'converted'. */
	value?: string;
	/** Justification; required when a compliance finding changes. */
	note?: string;
	/** Corrected AI analysis (note and evidence) for a compliance finding. */
	edits?: DisputeItemAnalysis;
	/** Set when the decision was adopted from an AI re-evaluation instead of decided by hand. */
	source?: 'ai-reevaluation';
}

export interface DisputeCase {
	id: string;
	callId: string;
	campaignId: string;
	campaignName: string;
	agentId: string;
	agentName: string;
	supervisorId: string;
	supervisorName: string;
	team: string;
	evaluationType: DisputeEvaluationType;
	/** Headline score of the disputed aspect when opened. Business Insights has none. */
	scoreBefore: number | null;
	/** Filled on accept, after the corrections are applied. */
	scoreAfter: number | null;
	agentComment: string;
	/** Items the agent flagged when opening; highlighted in the manager's review. */
	flaggedItemIds: string[];
	status: DisputeStatus;
	createdAt: string;
	resolvedAt: string | null;
	resolvedBy: string | null;
	managerComment: string | null;
	/** One decision per disputable item (accepted and partially accepted disputes only). */
	decisions: DisputeItemDecision[];
}

export interface OpenDisputeInput {
	callId: string;
	campaignId: string;
	campaignName: string;
	agentId: string;
	evaluationType: DisputeEvaluationType;
	agentComment: string;
	flaggedItemIds: string[];
}
