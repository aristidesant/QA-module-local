import type { DisputeStatus } from '~/models/qa/disputeCases';
import type {
	Emotion,
	SentimentCategory,
} from '~/modules/qa/emotion-sentiment/types';

export const STATUS_COLOR: Record<DisputeStatus, string> = {
	open: 'blue',
	accepted: 'green',
	'partially-accepted': 'yellow',
	rejected: 'red',
};

export const TEAMS = ['Team 1', 'Team 2', 'Team 3'];

/** Minimum characters before the agent can submit, and before a reject is allowed. */
export const MIN_AGENT_COMMENT = 20;
export const MIN_MANAGER_COMMENT = 10;
/** Minimum characters of the justification a changed compliance finding needs. */
export const MIN_ITEM_NOTE = 10;

/** Score a compliance finding keeps when downgraded to a warning (matches the mock warning). */
export const COMPLIANCE_WARNING_SCORE = 70;

/** Midpoint of each 0-5 sentiment band, used when the QA Manager sets a category. */
export const CATEGORY_MIDPOINT: Record<SentimentCategory, number> = {
	'very-negative': 0.5,
	negative: 1.5,
	neutral: 2.5,
	positive: 3.5,
	'very-positive': 4.5,
};

/** Fallback dominant emotion when none of the detected ones belongs to the chosen category. */
export const DEFAULT_EMOTION_BY_CATEGORY: Record<SentimentCategory, Emotion> = {
	'very-negative': 'ANGER',
	negative: 'FRUSTRATION',
	neutral: 'NEUTRAL',
	positive: 'SATISFACTION',
	'very-positive': 'JOY',
};
