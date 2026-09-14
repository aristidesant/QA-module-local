import type { CallEvaluationTab } from '~/views/Campaigns/types';

/** Agent opens it, QA Manager resolves it. No other transitions exist. */
export type DisputeStatus = 'open' | 'accepted' | 'rejected';

export type DisputeEvaluationType = CallEvaluationTab;

/**
 * One disputable sub-item of an evaluation: the agent flags it when opening,
 * the QA Manager ticks it to mark it as wrongly scored.
 */
export interface DisputeItemRef {
	id: string;
	label: string;
	/** Aspect name, compliance area, "Signals", "Outcome" or "Sentiment". */
	group: string;
	/** The value as originally scored, e.g. "No · 0/5" or "Warning". */
	original: string;
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
	/** Items the agent flagged when opening; pre-ticks the manager's review. */
	flaggedItemIds: string[];
	status: DisputeStatus;
	createdAt: string;
	resolvedAt: string | null;
	resolvedBy: string | null;
	managerComment: string | null;
	/** Items the manager marked as wrongly scored (accepted disputes only). */
	correctedItemIds: string[];
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
