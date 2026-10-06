import type { TFunction } from 'i18next';
import type {
	CoachingQueueItem,
	CoachingQueueReason,
	CoachingSessionRecord,
	CoachingSuggestedAction,
	EvaluationArea,
	LmsAssignment,
	LmsContent,
	LmsImpactVerdict,
} from '~/models/qa';
import type { AgentProfile, DimensionKey } from '~/modules/qa/team/types';
import { DIMENSION_TO_AREA } from '~/modules/qa/lms/constants';
import { daysUntil, isOverdue } from '~/modules/qa/lms/helpers';
import { DIMENSION_META } from '~/modules/qa/team/constants';
import { DECLINE_DELTA, LOW_SCORE_THRESHOLD } from './constants';

const DIMENSION_LABEL: Record<DimensionKey, string> = {
	qa: 'QA',
	sentiment: 'Customer sentiment',
	compliance: 'Compliance',
	business: 'Business',
};

/**
 * The text of an AI_MESSAGE session: last week's scores per dimension, the
 * weakest one, and the material the rule attached. Mock-only wording.
 */
export const buildAiCoachingMessage = (
	profile: AgentProfile,
	ruleName: string,
	contentTitles: string[]
): string => {
	const lines = profile.dimensions.map((d) => {
		const unit = DIMENSION_META[d.key].unit;
		const delta =
			d.delta === 0 ? 'stable' : `${d.delta > 0 ? '+' : ''}${d.delta}${unit}`;
		return `• ${DIMENSION_LABEL[d.key]}: ${d.score}${unit} (${delta} vs last week)`;
	});
	const weakest = [...profile.dimensions].sort(
		(a, b) =>
			a.score / DIMENSION_META[a.key].max - b.score / DIMENSION_META[b.key].max
	)[0];
	const focus = weakest ? DIMENSION_LABEL[weakest.key] : 'quality';
	const material = contentTitles.length
		? `\n\nTo work on it this week I attached: ${contentTitles.join(', ')}.`
		: '';
	return `Hi ${profile.agent.name.split(' ')[0]}, here is your weekly review (${ruleName}).\n\n${lines.join('\n')}\n\nYour focus for the week is ${focus}. Pick one call from last week where it slipped and note what you would do differently.${material}`;
};

const pct = (key: DimensionKey, v: number) =>
	key === 'sentiment' ? Math.round(((v - 1) / 4) * 100) : v;

/**
 * Builds the prioritised coaching queue. Rule-triggered reasons come from
 * `profile.risk.alerts`, so the rule list itself is not needed here.
 */
export function buildQueue(
	profiles: AgentProfile[],
	assignments: LmsAssignment[],
	sessions: CoachingSessionRecord[],
	content: LmsContent[],
	t: TFunction
): CoachingQueueItem[] {
	const out: CoachingQueueItem[] = [];

	for (const p of profiles) {
		const mine = assignments.filter((a) => a.agentId === p.agent.id);
		const reasons: CoachingQueueReason[] = [];
		let score = 0;

		const weakest = [...p.dimensions].sort(
			(a, b) => pct(a.key, a.score) - pct(b.key, b.score)
		)[0];
		const weakestArea = DIMENSION_TO_AREA[weakest.key];
		/** Every dimension is compared on the same 0-100 scale, so sentiment (1-5) is converted. */
		const weakestPct = pct(weakest.key, weakest.score);

		if (weakestPct < LOW_SCORE_THRESHOLD) {
			reasons.push({
				kind: 'LOW_SCORE',
				area: weakestArea,
				detail: t('queue.reasons.LOW_SCORE', {
					area: t(`areas.${weakestArea}`, { ns: 'qa.lms' }),
					value: weakestPct,
					threshold: LOW_SCORE_THRESHOLD,
				}),
			});
			score += 30;
		}

		for (const d of p.dimensions) {
			if (d.delta <= DECLINE_DELTA && d.trend === 'down') {
				reasons.push({
					kind: 'DECLINING_TREND',
					area: DIMENSION_TO_AREA[d.key],
					detail: t('queue.reasons.DECLINING_TREND', {
						area: t(`areas.${DIMENSION_TO_AREA[d.key]}`, { ns: 'qa.lms' }),
						delta: d.delta,
					}),
				});
				score += 15;
			}
		}

		for (const alert of p.risk.alerts.filter((x) => !x.acknowledged)) {
			reasons.push({
				kind: 'RULE_TRIGGERED',
				area: null,
				detail: alert.ruleName,
			});
			score += 20;
		}

		const overdue = mine.filter(isOverdue);
		if (overdue.length) {
			reasons.push({
				kind: 'OVERDUE_TRAINING',
				area: null,
				detail: t('queue.reasons.OVERDUE_TRAINING', { count: overdue.length }),
			});
			score += 15 * overdue.length;
		}

		const noResponse = mine.filter(
			(a) => a.acceptance.status === 'NO_RESPONSE'
		);
		if (noResponse.length) {
			reasons.push({
				kind: 'NO_RESPONSE',
				area: null,
				detail: t('queue.reasons.NO_RESPONSE', { count: noResponse.length }),
			});
			score += 25;
		}

		const pending = mine.filter((a) => a.acceptance.status === 'PENDING');
		if (pending.length) {
			reasons.push({
				kind: 'PENDING_ACCEPTANCE',
				area: null,
				detail: t('queue.reasons.PENDING_ACCEPTANCE', {
					count: pending.length,
				}),
			});
			score += 5;
		}

		const rescheduled = mine.filter(
			(a) => a.acceptance.status === 'RESCHEDULE_REQUESTED'
		);
		if (rescheduled.length) {
			reasons.push({
				kind: 'RESCHEDULE_REQUESTED',
				area: null,
				detail: t('queue.reasons.RESCHEDULE_REQUESTED', {
					count: rescheduled.length,
				}),
			});
			score += 20;
		}

		const declined = mine.filter((a) => a.impact?.verdict === 'DECLINED');
		if (declined.length) {
			reasons.push({
				kind: 'DECLINED_AFTER_TRAINING',
				area: null,
				detail: t('queue.reasons.DECLINED_AFTER_TRAINING', {
					count: declined.length,
				}),
			});
			score += 20;
		}

		const followUps = sessions.filter(
			(s) =>
				s.agentId === p.agent.id &&
				s.status === 'COMPLETED' &&
				s.followUpDate &&
				daysUntil(s.followUpDate) <= 3
		);
		if (followUps.length) {
			reasons.push({
				kind: 'FOLLOW_UP_DUE',
				area: null,
				detail: t('queue.reasons.FOLLOW_UP_DUE', { topic: followUps[0].topic }),
			});
			score += 10;
		}

		if (p.risk.burnout.level === 'high') {
			reasons.push({
				kind: 'BURNOUT_HIGH',
				area: null,
				detail: t('queue.reasons.BURNOUT_HIGH', {
					value: p.risk.burnout.percentage,
				}),
			});
			score += 25;
		}

		if (!reasons.length) continue;

		const hasOpenTraining = mine.some((a) => a.status !== 'COMPLETED');
		const suggestedAction: CoachingSuggestedAction = rescheduled.length
			? 'REVIEW_REQUEST'
			: noResponse.length
				? 'SEND_REMINDER'
				: p.risk.burnout.level === 'high'
					? 'CHECK_IN'
					: reasons.some(
								(r) => r.kind === 'LOW_SCORE' || r.kind === 'DECLINING_TREND'
						  ) && !hasOpenTraining
						? 'ASSIGN_CONTENT'
						: 'SCHEDULE_SESSION';

		const suggestedContentIds = content
			.filter(
				(c) =>
					c.status === 'PUBLISHED' &&
					c.area === weakestArea &&
					!mine.some((a) => a.contentId === c.id && a.status !== 'COMPLETED')
			)
			.slice(0, 2)
			.map((c) => c.id);

		out.push({
			agentId: p.agent.id,
			agentName: p.agent.name,
			team: p.agent.team,
			supervisorId: p.agent.supervisorId,
			priority: score >= 50 ? 'HIGH' : score >= 25 ? 'MEDIUM' : 'LOW',
			score,
			reasons,
			suggestedAction,
			suggestedContentIds,
			weakestArea,
			weakestValue: weakestPct,
			snoozedUntil: null,
		});
	}

	return out.sort((a, b) => b.score - a.score);
}

export const areaHealth = (profiles: AgentProfile[]) =>
	(['qa', 'sentiment', 'compliance', 'business'] as DimensionKey[]).map(
		(key) => {
			const values = profiles.map((p) =>
				pct(key, p.dimensions.find((d) => d.key === key)!.score)
			);
			return {
				area: DIMENSION_TO_AREA[key],
				average: values.length
					? Math.round(values.reduce((s, v) => s + v, 0) / values.length)
					: 0,
				below: values.filter((v) => v < LOW_SCORE_THRESHOLD).length,
				total: values.length,
			};
		}
	);

export const impactByArea = (
	assignments: LmsAssignment[],
	contentById: Record<string, LmsContent>
) =>
	(
		[
			'QUALITY_ASSURANCE',
			'COMPLIANCE',
			'SENTIMENT_EMOTION',
			'BUSINESS_INSIGHTS',
		] as EvaluationArea[]
	).map((area) => {
		const rows = assignments.filter(
			(a) =>
				a.impact &&
				a.impact.verdict !== 'PENDING' &&
				contentById[a.contentId]?.area === area
		);
		const count = (v: LmsImpactVerdict) =>
			rows.filter((a) => a.impact?.verdict === v).length;
		return {
			area,
			measured: rows.length,
			improved: count('IMPROVED'),
			same: count('SAME'),
			declined: count('DECLINED'),
			improvedRate: rows.length
				? Math.round((count('IMPROVED') / rows.length) * 100)
				: 0,
		};
	});
