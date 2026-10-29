import type { SentimentCauseKey } from '~/modules/qa/sentimentCauses/types';
import type { SurveyStrengthKey, SurveyThemeKey } from './types';

/** What promoters praise: a short fixed list, since praise rarely needs a root cause. */
export const SURVEY_STRENGTHS: SurveyStrengthKey[] = [
	'QUICK_RESOLUTION',
	'CLEAR_EXPLANATION',
	'PATIENT_AGENT',
	'FIRST_CALL_FIX',
];

export const isStrengthKey = (key: SurveyThemeKey): key is SurveyStrengthKey =>
	(SURVEY_STRENGTHS as string[]).includes(key);

/** A realistic comment and the words in it that carry the theme (always a substring of `quote`). */
export interface CommentSample {
	quote: string;
	highlight: string;
}

/** Comments per theme, so the text a seeded response carries always matches the theme it is filed under. */
export const COMMENT_SAMPLES: Record<SentimentCauseKey, CommentSample[]> &
	Record<SurveyStrengthKey, CommentSample[]> = {
	WAIT_TIME: [
		{
			quote: 'I was on hold for twenty minutes before anyone picked up.',
			highlight: 'on hold for twenty minutes',
		},
		{
			quote: 'Too many transfers, nobody could help me from the start.',
			highlight: 'Too many transfers',
		},
	],
	PRICING_BILLING: [
		{
			quote: 'The price after the promo is much higher than what I was told.',
			highlight: 'price after the promo is much higher',
		},
		{
			quote: 'I do not understand why my bill went up this month.',
			highlight: 'my bill went up',
		},
	],
	TECHNICAL_FAILURE: [
		{
			quote: 'The system kept failing and I had to explain everything twice.',
			highlight: 'The system kept failing',
		},
		{
			quote: 'My internet is still down after the technician visit.',
			highlight: 'still down after the technician visit',
		},
	],
	PROCESS_POLICY: [
		{
			quote: 'They asked for so many verifications that I gave up.',
			highlight: 'so many verifications',
		},
		{
			quote: 'The policy did not allow them to fix something simple.',
			highlight: 'policy did not allow them',
		},
	],
	BROKEN_PROMISE: [
		{
			quote: 'Someone promised to call me back and nobody ever did.',
			highlight: 'promised to call me back',
		},
		{
			quote: 'I was told the credit would arrive last week and it never did.',
			highlight: 'credit would arrive last week',
		},
	],
	AGENT_TONE: [
		{
			quote: 'The agent sounded rushed and annoyed the whole time.',
			highlight: 'sounded rushed and annoyed',
		},
		{
			quote: 'Rude tone when I asked for the second time.',
			highlight: 'Rude tone',
		},
	],
	LACK_OF_EMPATHY: [
		{
			quote: 'I explained how stressful this was and got a scripted answer.',
			highlight: 'got a scripted answer',
		},
		{
			quote: 'Nobody acknowledged how frustrated I was.',
			highlight: 'Nobody acknowledged how frustrated I was',
		},
	],
	INTERRUPTIONS: [
		{
			quote: 'The agent kept interrupting me before I could finish.',
			highlight: 'kept interrupting me',
		},
		{
			quote: 'I could not get a full sentence in without being cut off.',
			highlight: 'cut off',
		},
	],
	WRONG_INFORMATION: [
		{
			quote: 'I was given the wrong information and had to call again.',
			highlight: 'wrong information',
		},
		{
			quote:
				'First they said one thing, then the next agent said the opposite.',
			highlight: 'said the opposite',
		},
	],
	QUICK_RESOLUTION: [
		{
			quote: 'Quick and clear, solved in a few minutes.',
			highlight: 'solved in a few minutes',
		},
		{ quote: 'Fast service, no waiting at all.', highlight: 'Fast service' },
	],
	CLEAR_EXPLANATION: [
		{
			quote: 'Great explanation of the plan, now I understand my bill.',
			highlight: 'Great explanation',
		},
		{
			quote: 'Everything was explained step by step.',
			highlight: 'explained step by step',
		},
	],
	PATIENT_AGENT: [
		{
			quote: 'Very patient with all my questions.',
			highlight: 'Very patient',
		},
		{
			quote: 'The agent took the time to listen to me.',
			highlight: 'took the time to listen',
		},
	],
	FIRST_CALL_FIX: [
		{
			quote: 'Problem solved on the first call.',
			highlight: 'solved on the first call',
		},
		{
			quote: 'I did not have to call again, it was fixed right away.',
			highlight: 'fixed right away',
		},
	],
};
