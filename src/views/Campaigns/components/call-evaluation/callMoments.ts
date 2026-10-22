import type {
	CallEvaluationDetail,
	CallMoment,
	CallMomentStatus,
	TranscriptTurn,
} from '../../types';

/** "m:ss" → seconds. */
export const parseTimestamp = (mmss: string): number => {
	const [m, s] = mmss.split(':').map(Number);
	return (m || 0) * 60 + (s || 0);
};

export const turnSeconds = (turn: TranscriptTurn) =>
	parseTimestamp(turn.timestamp);

/** The turn playing at `seconds`: the last one that started at or before it. */
export const activeTurnAt = (
	turns: TranscriptTurn[],
	seconds: number
): TranscriptTurn | null => {
	let active: TranscriptTurn | null = null;
	for (const t of turns) {
		if (turnSeconds(t) <= seconds) active = t;
		else break;
	}
	return active;
};

/** Every QA item with evidence becomes one AI moment, anchored to the turn with the same timestamp (or the one playing then). */
export const buildAiMoments = (call: CallEvaluationDetail): CallMoment[] =>
	call.qa.aspects.flatMap((aspect) =>
		aspect.items.flatMap((item): CallMoment[] => {
			const evidence = item.evidence;
			if (!evidence) return [];
			const seconds = parseTimestamp(evidence.timestamp);
			const turn =
				call.transcript.find((t) => t.timestamp === evidence.timestamp) ??
				activeTurnAt(call.transcript, seconds);
			return [
				{
					id: `m-${call.callId}-${item.id}`,
					callId: call.callId,
					itemId: item.id,
					itemName: item.name,
					errorType: item.errorType,
					turnId: turn?.id ?? '',
					timestamp: evidence.timestamp,
					seconds,
					speaker: evidence.speaker,
					quote: evidence.quote,
					source: 'ai',
					status: 'pending',
					note: '',
				},
			];
		})
	);

/** Red is the only hue: a confirmed moment is the thing the reviewer acts on. */
export const MOMENT_STATUS_COLOR: Record<CallMomentStatus, string> = {
	pending: 'gray',
	confirmed: 'red',
	dismissed: 'gray',
};

/** Pending moments are outlined, so status reads without hue. */
export const MOMENT_STATUS_VARIANT: Record<
	CallMomentStatus,
	'outline' | 'light'
> = {
	pending: 'outline',
	confirmed: 'light',
	dismissed: 'light',
};

/** Moments worth coaching on: everything the reviewer did not dismiss, in call order. */
export const coachableMoments = (moments: CallMoment[]) =>
	moments
		.filter((m) => m.status !== 'dismissed')
		.sort((a, b) => a.seconds - b.seconds);
