import type {
	DisputeEvaluationType,
	DisputeItemAnalysis,
	DisputeItemRef,
} from '~/models/qa/disputeCases';
import type { SentimentCategory } from '~/modules/qa/emotion-sentiment/types';
import {
	EMOTION_LABELS,
	SENTIMENT_CATEGORIES,
	SENTIMENT_CATEGORY_ORDER,
} from '~/views/Campaigns/constants';
import { DEFAULT_EMOTION_BY_CATEGORY } from './constants';

/** What the AI says about one item after being asked to evaluate the call again. */
export interface ReevaluationProposal {
	itemId: string;
	/** Proposed raw value, in the same vocabulary as a decision's `value`. */
	value: string;
	/** Proposed analysis for a compliance finding. */
	edits?: DisputeItemAnalysis;
	/** One line explaining why the AI changed its mind. */
	reason: string;
}

/** Re-evaluation takes this long in the mock, so the loading state is visible. */
export const REEVALUATION_DELAY_MS = 1400;

const FINDING_REVISIONS: Record<
	string,
	{
		note: string;
		reason: string;
		evidence?: { timestamp: string; quote: string };
	}
> = {
	transparenciaConsentimiento: {
		note: 'Regular price after month six was stated later in the call, after the promotional quote',
		reason:
			'The regular price is disclosed at 2:40, so the omission was partial and not a violation.',
		evidence: {
			timestamp: '2:40',
			quote:
				'After the first six months the regular price is $79.99 per month.',
		},
	},
};

/** One band closer to neutral: a re-reading rarely flips a call, it softens it. */
const towardNeutral = (category: SentimentCategory): SentimentCategory => {
	const index = SENTIMENT_CATEGORY_ORDER.indexOf(category);
	const neutral = SENTIMENT_CATEGORY_ORDER.indexOf('neutral');
	return SENTIMENT_CATEGORY_ORDER[index + Math.sign(neutral - index)];
};

/**
 * Mock of re-running the AI evaluation on the disputed items. Deterministic:
 * compliance findings drop one severity level, the customer's sentiment moves
 * a band toward neutral and an unrecovered call is read as recovered; every
 * other item is confirmed as originally scored (and therefore omitted).
 */
export function reevaluateItems(
	type: DisputeEvaluationType,
	items: DisputeItemRef[]
): ReevaluationProposal[] {
	if (type === 'compliance') {
		return items.flatMap((item): ReevaluationProposal[] => {
			const revision = FINDING_REVISIONS[item.id];
			if (item.value === 'violation') {
				return [
					{
						itemId: item.id,
						value: 'warning',
						edits: revision && {
							note: revision.note,
							evidenceTimestamp: revision.evidence?.timestamp,
							evidenceQuote: revision.evidence?.quote,
						},
						reason:
							revision?.reason ??
							'Reviewing the full context, the finding is real but less severe than first scored.',
					},
				];
			}
			if (item.value === 'warning') {
				return [
					{
						itemId: item.id,
						value: 'compliant',
						reason:
							'No breach found once the approved script version is applied.',
					},
				];
			}
			return [];
		});
	}

	if (type === 'sentiment-emotion') {
		const proposals: ReevaluationProposal[] = [];
		const category = items.find((item) => item.id === 'customer-category');
		if (category) {
			const next = towardNeutral(category.value as SentimentCategory);
			if (next !== category.value) {
				proposals.push({
					itemId: 'customer-category',
					value: next,
					reason: `The closing minutes read as ${SENTIMENT_CATEGORIES[next].label.toLowerCase()}, not ${SENTIMENT_CATEGORIES[category.value as SentimentCategory].label.toLowerCase()}.`,
				});
				if (items.some((item) => item.id === 'customer-emotion')) {
					const emotion = DEFAULT_EMOTION_BY_CATEGORY[next];
					proposals.push({
						itemId: 'customer-emotion',
						value: emotion,
						reason: `${EMOTION_LABELS[emotion]} fits the new reading better.`,
					});
				}
			}
		}
		const recovery = items.find((item) => item.id === 'recovery');
		if (recovery && recovery.value === 'not-recovered') {
			proposals.push({
				itemId: 'recovery',
				value: 'recovered',
				reason:
					'The customer agreed to a callback and thanked the agent, which counts as recovery.',
			});
		}
		return proposals;
	}

	return [];
}

/** Evaluation types where a re-run makes sense. */
export const canReevaluate = (type: DisputeEvaluationType): boolean =>
	type === 'compliance' || type === 'sentiment-emotion';
