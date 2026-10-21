import type { CallEmotion } from '~/modules/qa/analytics/types';
import type { Emotion } from '~/modules/qa/emotion-sentiment/types';

/**
 * The mock calls carry a Plutchik-style emotion; the platform names emotions
 * differently. Dashboards that must speak the platform's vocabulary map here.
 * Display only: calls, Settings and Analytics keep CallEmotion.
 */
export const CALL_EMOTION_TO_PLATFORM: Record<CallEmotion, Emotion> = {
	Joy: 'JOY',
	Trust: 'SATISFACTION',
	Anticipation: 'RELIEF',
	Surprise: 'SURPRISE',
	Anger: 'ANGER',
	Fear: 'FEAR',
	Sadness: 'SADNESS',
	Disgust: 'FRUSTRATION',
};

export const toPlatformEmotion = (
	emotion: CallEmotion | null
): Emotion | null => (emotion ? CALL_EMOTION_TO_PLATFORM[emotion] : null);
