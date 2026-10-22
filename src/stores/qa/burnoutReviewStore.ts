import { create } from 'zustand';
import { addDays } from '~/modules/qa/analytics/constants';
import { NOW_ISO } from '~/modules/qa/team/constants';

export type BurnoutReviewDecision = 'CONFIRMED' | 'DISMISSED';

/** What a supervisor decided about an agent's burnout risk. One decision per agent: the latest. */
export interface BurnoutReview {
	id: string;
	agentId: string;
	decision: BurnoutReviewDecision;
	/** Why the risk was dismissed; empty when it was confirmed. */
	reason: string;
	by: string;
	/** ISO datetime. */
	at: string;
	/** A dismissed agent stays out of the lists of agents at risk until this day (inclusive). */
	silencedUntil: string | null;
}

interface BurnoutReviewState {
	/** Nothing is persisted. */
	reviews: BurnoutReview[];
	confirm: (agentId: string, by: string) => void;
	dismiss: (agentId: string, reason: string, days: number, by: string) => void;
	/** Drops the decision, so the agent is back in the lists when still at risk. */
	undo: (agentId: string) => void;
}

let counter = 0;
const nextId = () => `BRV-${++counter}`;
const TODAY = NOW_ISO.slice(0, 10);

const replaceFor = (reviews: BurnoutReview[], review: BurnoutReview) => [
	review,
	...reviews.filter((r) => r.agentId !== review.agentId),
];

export const useBurnoutReviewStore = create<BurnoutReviewState>()((set) => ({
	reviews: [],
	confirm: (agentId, by) =>
		set((s) => ({
			reviews: replaceFor(s.reviews, {
				id: nextId(),
				agentId,
				decision: 'CONFIRMED',
				reason: '',
				by,
				at: NOW_ISO,
				silencedUntil: null,
			}),
		})),
	dismiss: (agentId, reason, days, by) =>
		set((s) => ({
			reviews: replaceFor(s.reviews, {
				id: nextId(),
				agentId,
				decision: 'DISMISSED',
				reason,
				by,
				at: NOW_ISO,
				silencedUntil: addDays(TODAY, days),
			}),
		})),
	undo: (agentId) =>
		set((s) => ({ reviews: s.reviews.filter((r) => r.agentId !== agentId) })),
}));

export const selectBurnoutReviews = (s: BurnoutReviewState) => s.reviews;

/** Whether the agent was dismissed and the silence has not ended. */
export const isBurnoutSilenced = (
	reviews: BurnoutReview[],
	agentId: string
): boolean =>
	reviews.some(
		(r) =>
			r.agentId === agentId &&
			r.decision === 'DISMISSED' &&
			r.silencedUntil !== null &&
			r.silencedUntil >= TODAY
	);
