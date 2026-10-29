import { create } from 'zustand';
import type {
	AnyCauseKey,
	SentimentCauseReview,
} from '~/modules/qa/sentimentCauses/types';

interface SentimentCauseReviewState {
	/** Nothing is persisted; keyed by call id. A call with no entry is 'pending'. */
	reviews: Record<string, SentimentCauseReview>;
	confirm: (callId: string) => void;
	correct: (callId: string, key: AnyCauseKey) => void;
	/** Drops the decision, so the call is back to 'pending'. */
	reset: (callId: string) => void;
}

const now = () => new Date().toISOString();

export const useSentimentCauseReviewStore = create<SentimentCauseReviewState>()(
	(set) => ({
		reviews: {},
		confirm: (callId) =>
			set((s) => ({
				reviews: {
					...s.reviews,
					[callId]: { status: 'confirmed', reviewedAt: now() },
				},
			})),
		correct: (callId, key) =>
			set((s) => ({
				reviews: {
					...s.reviews,
					[callId]: {
						status: 'corrected',
						correctedTo: key,
						reviewedAt: now(),
					},
				},
			})),
		reset: (callId) =>
			set((s) => ({
				reviews: Object.fromEntries(
					Object.entries(s.reviews).filter(([id]) => id !== callId)
				),
			})),
	})
);

export const selectReviews = (s: SentimentCauseReviewState) => s.reviews;
/** Raw slice for one call (undefined = pending); a stable reference, safe for Zustand v5 selectors. */
export const selectReview =
	(callId: string) =>
	(s: SentimentCauseReviewState): SentimentCauseReview | undefined =>
		s.reviews[callId];
