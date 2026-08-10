import type { TranscriptSegment, ToneBreakdown } from './types';

/**
 * Calculate tone percentages based on time spent in each tone mode.
 *
 * Each transcript segment has a tone: 'polite' | 'professional' | 'empathetic'
 * Duration = timestamp difference between segments
 * Percentages add up to 100%
 */
export const calculateTonePercentages = (
	transcript: TranscriptSegment[]
): ToneBreakdown => {
	if (!transcript || transcript.length === 0) {
		return {
			polite: { percentage: 0, durationSeconds: 0 },
			professional: { percentage: 0, durationSeconds: 0 },
			empathetic: { percentage: 0, durationSeconds: 0 },
			totalDurationSeconds: 0,
		};
	}

	let politeSeconds = 0;
	let professionalSeconds = 0;
	let empatheticSeconds = 0;

	// Calculate duration for each segment
	for (let i = 0; i < transcript.length; i++) {
		const current = transcript[i];
		const next = transcript[i + 1];

		// Duration is time until next segment (or assume 5 seconds for last segment)
		const duration = next ? next.timestamp - current.timestamp : 5;

		// Accumulate time in each tone
		switch (current.tone) {
			case 'polite':
				politeSeconds += duration;
				break;
			case 'professional':
				professionalSeconds += duration;
				break;
			case 'empathetic':
				empatheticSeconds += duration;
				break;
		}
	}

	const totalSeconds = politeSeconds + professionalSeconds + empatheticSeconds;

	// Avoid division by zero
	if (totalSeconds === 0) {
		return {
			polite: { percentage: 0, durationSeconds: 0 },
			professional: { percentage: 0, durationSeconds: 0 },
			empathetic: { percentage: 0, durationSeconds: 0 },
			totalDurationSeconds: 0,
		};
	}

	return {
		polite: {
			percentage: Math.round((politeSeconds / totalSeconds) * 100),
			durationSeconds: politeSeconds,
		},
		professional: {
			percentage: Math.round((professionalSeconds / totalSeconds) * 100),
			durationSeconds: professionalSeconds,
		},
		empathetic: {
			percentage: Math.round((empatheticSeconds / totalSeconds) * 100),
			durationSeconds: empatheticSeconds,
		},
		totalDurationSeconds: totalSeconds,
	};
};

/**
 * Format duration in seconds to "Xm Ys" format
 * Example: 83 seconds → "1m 23s"
 */
export const formatDuration = (seconds: number): string => {
	const minutes = Math.floor(seconds / 60);
	const secs = seconds % 60;
	return `${minutes}m ${secs}s`;
};

/**
 * Format timestamp in seconds to "M:SS" format
 * Example: 145 seconds → "2:25"
 */
export const formatTimestamp = (seconds: number): string => {
	const minutes = Math.floor(seconds / 60);
	const secs = seconds % 60;
	return `${minutes}:${secs.toString().padStart(2, '0')}`;
};
