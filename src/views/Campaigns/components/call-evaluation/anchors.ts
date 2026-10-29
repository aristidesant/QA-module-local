import type {
	AnchorStatus,
	CallEvaluationDetail,
	CallMoment,
	SentimentAnchorKind,
	TimelineAnchor,
	TranscriptTurn,
} from '../../types';
import { COMPLIANCE_AREAS } from '../../constants';
import { activeTurnAt, parseTimestamp } from './callMoments';

/** Red is the only hue: an anchor that needs attention. Everything else stays grey. */
export const ANCHOR_STATUS_COLOR: Record<AnchorStatus, string> = {
	pending: 'gray',
	confirmed: 'red',
	dismissed: 'gray',
	neutral: 'gray',
	alert: 'red',
};

/** Outlined means "not an alert", so status reads without hue. */
export const ANCHOR_STATUS_VARIANT: Record<AnchorStatus, 'outline' | 'light'> =
	{
		pending: 'outline',
		confirmed: 'light',
		dismissed: 'light',
		neutral: 'outline',
		alert: 'light',
	};

const turnAt = (transcript: TranscriptTurn[], timestamp: string) =>
	transcript.find((t) => t.timestamp === timestamp) ??
	activeTurnAt(transcript, parseTimestamp(timestamp));

/** The words to underline, only when they are a part of the turn and not all of it. */
const partOf = (turn: TranscriptTurn | null | undefined, quote: string) =>
	turn && quote !== turn.text && turn.text.includes(quote) ? quote : undefined;

/** QA moments already know their turn; they only change shape. */
export const momentToAnchor = (moment: CallMoment): TimelineAnchor => ({
	id: moment.id,
	tab: 'qa',
	turnId: moment.turnId,
	timestamp: moment.timestamp,
	seconds: moment.seconds,
	speaker: moment.speaker,
	tag: moment.errorType,
	label: moment.itemName,
	quote: moment.quote,
	status: moment.status,
});

/** Emotions that call for attention; the others are context. */
const ALERT_EMOTIONS = new Set(['RAGE', 'ANGER', 'FRUSTRATION']);

const ALERT_KINDS = new Set<SentimentAnchorKind>([
	'negativeLanguage',
	'hostileTone',
]);

/** Emotions, negative wording, hostile tone and the agent's empathy phrases, each on the turn where they happen. */
export const buildSentimentAnchors = (
	call: CallEvaluationDetail
): TimelineAnchor[] => {
	const { anchors, empathyIndicators } = call.sentiment;
	const detected = anchors.map((a, index): TimelineAnchor | null => {
		const turn = turnAt(call.transcript, a.timestamp);
		if (!turn) return null;
		const alert =
			ALERT_KINDS.has(a.kind) || (!!a.emotion && ALERT_EMOTIONS.has(a.emotion));
		return {
			id: `sa-${call.callId}-${index}`,
			tab: 'sentiment-emotion',
			turnId: turn.id,
			timestamp: a.timestamp,
			seconds: parseTimestamp(a.timestamp),
			speaker: a.speaker,
			tag: a.label,
			label: a.note ? `${a.label} · ${a.note}` : a.label,
			quote: turn.text,
			highlight: a.highlight,
			status: alert ? 'alert' : 'neutral',
		};
	});
	const empathy = empathyIndicators.map((e, index): TimelineAnchor | null => {
		const turn = turnAt(call.transcript, e.timestamp);
		if (!turn) return null;
		return {
			id: `sa-${call.callId}-empathy-${index}`,
			tab: 'sentiment-emotion',
			turnId: turn.id,
			timestamp: e.timestamp,
			seconds: parseTimestamp(e.timestamp),
			speaker: 'agent',
			tag: 'Empathy',
			label: `Empathy · ${e.context}`,
			quote: turn.text,
			highlight: partOf(turn, e.phrase),
			status: 'neutral',
		};
	});
	return [...detected, ...empathy]
		.filter((a): a is TimelineAnchor => a !== null)
		.sort((a, b) => a.seconds - b.seconds);
};

/** Every compliance item with evidence, on the turn where the agent or customer said it. */
export const buildComplianceAnchors = (
	call: CallEvaluationDetail
): TimelineAnchor[] =>
	call.compliance.areas
		.flatMap((area) =>
			area.items.flatMap((item): TimelineAnchor[] => {
				const evidence = item.evidence;
				if (!evidence) return [];
				const turn = turnAt(call.transcript, evidence.timestamp);
				if (!turn) return [];
				return [
					{
						id: `ca-${call.callId}-${item.key}`,
						tab: 'compliance',
						turnId: turn.id,
						timestamp: evidence.timestamp,
						seconds: parseTimestamp(evidence.timestamp),
						speaker: evidence.speaker,
						tag: item.label,
						label: `${COMPLIANCE_AREAS[area.key].label} · ${item.label}`,
						quote: turn.text,
						highlight: partOf(turn, evidence.quote),
						status: item.status === 'violation' ? 'alert' : 'neutral',
						refKey: item.key,
					},
				];
			})
		)
		.sort((a, b) => a.seconds - b.seconds);

/** Anchors that share a second get one marker on the timeline. */
export const groupBySecond = (anchors: TimelineAnchor[]) => {
	const groups = new Map<number, TimelineAnchor[]>();
	for (const a of anchors) {
		groups.set(a.seconds, [...(groups.get(a.seconds) ?? []), a]);
	}
	return [...groups.entries()]
		.sort(([a], [b]) => a - b)
		.map(([seconds, items]) => ({ seconds, items }));
};

/** The turn the root cause points at, as a jumpable anchor (not listed with the other moments). */
export const buildCauseAnchor = (
	call: CallEvaluationDetail
): TimelineAnchor | null => {
	const cause = call.sentiment.cause;
	if (!cause?.evidence) return null;
	const turn = turnAt(call.transcript, cause.evidence.timestamp);
	if (!turn) return null;
	return {
		id: `sc-${call.callId}`,
		tab: 'sentiment-emotion',
		turnId: turn.id,
		timestamp: cause.evidence.timestamp,
		seconds: parseTimestamp(cause.evidence.timestamp),
		speaker: cause.evidence.speaker,
		tag: 'Root cause',
		label: cause.primary,
		quote: turn.text,
		highlight: partOf(turn, cause.evidence.quote),
		status: 'alert',
	};
};
