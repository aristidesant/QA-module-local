import dayjs from 'dayjs';
import type {
	DisputeCase,
	DisputeEvaluationType,
} from '~/models/qa/disputeCases';
import type { DemoTranscriptTurn } from '~/modules/evaluations-demo/mockData';
import type {
	CallEvaluationDetail,
	TranscriptTurn,
} from '~/views/Campaigns/types';
import { mockCallEvaluationDetail } from '~/views/Campaigns/constants';
import {
	AGENT_PERSONA_ID,
	NOW_ISO,
	SUPERVISOR_PERSONA,
} from '~/modules/qa/team/constants';
import type { InboxRole } from '~/modules/qa/inbox/constants';

/**
 * Every dispute renders the one evaluated call the mock provides, personalised
 * with the agent and date of the case.
 */
export const getDisputeCall = (dispute: DisputeCase): CallEvaluationDetail => ({
	...mockCallEvaluationDetail,
	callId: dispute.callId,
	agentName: dispute.agentName,
	date: dispute.createdAt.slice(0, 10),
});

/** The demo transcript component keys the speaker as `role`, the call as `speaker`. */
export const toDemoTurns = (turns: TranscriptTurn[]): DemoTranscriptTurn[] =>
	turns.map((turn) => ({
		id: turn.id,
		role: turn.speaker,
		timestamp: turn.timestamp,
		text: turn.text,
	}));

/** One open dispute per call and evaluation type; the button blocks a second. */
export const hasOpenDispute = (
	cases: DisputeCase[],
	callId: string,
	type: DisputeEvaluationType
): boolean =>
	cases.some(
		(c) =>
			c.callId === callId && c.evaluationType === type && c.status === 'open'
	);

/** Agents see their own, supervisors their team, the QA Manager everything. */
export const casesForRole = (
	cases: DisputeCase[],
	role: InboxRole
): DisputeCase[] =>
	role === 'agent'
		? cases.filter((c) => c.agentId === AGENT_PERSONA_ID)
		: role === 'supervisor'
			? cases.filter((c) => c.supervisorId === SUPERVISOR_PERSONA.id)
			: cases;

export const openCount = (cases: DisputeCase[]): number =>
	cases.filter((c) => c.status === 'open').length;

export const daysOpen = (dispute: DisputeCase): number =>
	dayjs(dispute.resolvedAt ?? NOW_ISO).diff(dayjs(dispute.createdAt), 'day');

/**
 * The demo clock is NOW_ISO, not the wall clock, so relative dates must be
 * measured against it or "2 days ago" contradicts "0 days open".
 */
export const fromMockNow = (iso: string): string =>
	dayjs(iso).from(dayjs(NOW_ISO));

/** Share of resolved disputes that were accepted; null when none are resolved. */
export const acceptanceRate = (cases: DisputeCase[]): number | null => {
	const accepted = cases.filter((c) => c.status === 'accepted').length;
	const rejected = cases.filter((c) => c.status === 'rejected').length;
	const resolved = accepted + rejected;
	return resolved === 0 ? null : Math.round((accepted / resolved) * 100);
};
