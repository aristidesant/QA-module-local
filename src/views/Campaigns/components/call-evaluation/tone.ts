import type { CallSentimentEvaluation } from '../../types';

type SentimentCategory = CallSentimentEvaluation['customer']['overallCategory'];

/** Below this a 0-100 score is a problem; at or above it everything stays neutral. */
export const PROBLEM_SCORE = 70;
export const NEUTRAL = 'gray';
/** The only hue on the call evaluation page: something needs attention. */
export const ALERT = 'red';

/** Neutral unless the score signals a problem. */
export const scoreTone = (score: number): string =>
	score >= PROBLEM_SCORE ? NEUTRAL : ALERT;

/** A 1-5 sentiment score on the same rule. */
export const sentimentTone = (score: number): string =>
	scoreTone(Math.round(((score - 1) / 4) * 100));

export const sentimentCategoryTone = (category: SentimentCategory): string =>
	category === 'very-negative' || category === 'negative' ? ALERT : NEUTRAL;

/** Badge props for a yes/no "is this a problem" flag. */
export const flagTone = (problem: boolean) =>
	({ color: problem ? ALERT : NEUTRAL, variant: 'light' }) as const;
