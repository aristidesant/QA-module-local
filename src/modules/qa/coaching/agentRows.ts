import { useMemo } from 'react';
import type { CoachingSessionRecord, LmsAssignment } from '~/models/qa';
import { withRuleBurnout } from '~/modules/qa/analytics/helpers';
import { isOverdue, managerScopeAgents } from '~/modules/qa/lms/helpers';
import { SUPERVISOR_PERSONA } from '~/modules/qa/team/constants';
import type { AgentProfile, TeamRole } from '~/modules/qa/team/types';
import { useCoachingStore, selectSessions } from '~/stores/qa/coachingStore';
import { useLmsStore, selectAssignments } from '~/stores/qa/lmsStore';
import { useSettingsStore, selectThresholds } from '~/stores/qa/settingsStore';
import { useTeamStore } from '~/stores/qa/teamStore';
import {
	useTriggerRulesStore,
	selectTriggerRules,
} from '~/stores/qa/triggerRulesStore';
import { buildTierTenure, type TierTenure } from './postCoaching';
import {
	buildAgentScorecard,
	type PerformanceTier,
	type ScorecardDimension,
	type ScorecardTrend,
	type WeeklyScorecard,
} from './scorecard';

export interface AgentCoachingRow {
	id: string;
	name: string;
	team: string;
	supervisorId: string;
	/** This week's scorecard; null when the agent has no evaluated calls in the last 7 days. */
	scorecard: WeeklyScorecard | null;
	tier: PerformanceTier | null;
	/** How long the agent has been in the current tier. */
	tenure: TierTenure;
	/** This week's scorecard against the previous week's. */
	trend: ScorecardTrend | null;
	weakest: { dimension: ScorecardDimension; value: number } | null;
	pending: number;
	overdue: number;
	/** Dates of the agent's coaching sessions; counted over the evaluation period. */
	sessionDates: string[];
	/** Has at least one coaching session still scheduled. */
	pendingSession: boolean;
	/** Coaching rules that fired for the agent (assigned content or created a session), with the date. */
	ruleEvents: { ruleId: string; date: string }[];
}

export function buildAgentRows(
	profiles: AgentProfile[],
	assignments: LmsAssignment[],
	sessions: CoachingSessionRecord[]
): AgentCoachingRow[] {
	return profiles.map((p) => {
		const mine = assignments.filter((a) => a.agentId === p.agent.id);
		const open = mine.filter((a) => a.status !== 'COMPLETED');
		const sc = buildAgentScorecard(p.agent.id);

		return {
			id: p.agent.id,
			name: p.agent.name,
			team: p.agent.team,
			supervisorId: p.agent.supervisorId,
			scorecard: sc.current,
			tier: sc.tier,
			tenure: buildTierTenure(p.agent.id),
			trend: sc.trend,
			weakest: sc.weakest,
			pending: mine.filter(
				(a) =>
					a.acceptance.status === 'PENDING' ||
					a.acceptance.status === 'NO_RESPONSE'
			).length,
			overdue: open.filter(isOverdue).length,
			sessionDates: sessions
				.filter((s) => s.agentId === p.agent.id)
				.map((s) => s.date),
			ruleEvents: [
				...mine.flatMap((a) =>
					a.ruleId ? [{ ruleId: a.ruleId, date: a.assignedAt }] : []
				),
				...sessions
					.filter(
						(s) => s.agentId === p.agent.id || s.agentIds?.includes(p.agent.id)
					)
					.flatMap((s) =>
						s.ruleId ? [{ ruleId: s.ruleId, date: s.date }] : []
					),
			],
			pendingSession: sessions.some(
				(s) =>
					(s.agentId === p.agent.id || s.agentIds?.includes(p.agent.id)) &&
					s.status === 'SCHEDULED'
			),
		};
	});
}

/** The Agents-tab rows for everyone in the viewer's scope; the tier detail page reads the same data. */
export function useAgentCoachingRows(role: TeamRole): AgentCoachingRow[] {
	const profilesMap = useTeamStore((s) => s.profiles);
	const triggerRules = useTriggerRulesStore(selectTriggerRules);
	const tierCuts = useSettingsStore(selectThresholds).coaching.tierCuts;
	const assignments = useLmsStore(selectAssignments);
	const sessions = useCoachingStore(selectSessions);
	const scopeAgents = useMemo(() => managerScopeAgents(role), [role]);

	return useMemo(() => {
		const scopeProfiles = Object.values(profilesMap)
			.filter(
				(p) =>
					role === 'qa-manager' ||
					p.agent.supervisorId === SUPERVISOR_PERSONA.id
			)
			.map((p) => withRuleBurnout(p, triggerRules));
		const scopeAssignments = assignments.filter((a) =>
			scopeAgents.some((x) => x.id === a.agentId)
		);
		const scopeSessions = sessions.filter((s) =>
			(s.agentIds ?? [s.agentId]).some((id) =>
				scopeAgents.some((a) => a.id === id)
			)
		);
		return buildAgentRows(scopeProfiles, scopeAssignments, scopeSessions);
		// tierCuts: rows are re-grouped when the cut-offs change in Settings.
	}, [
		profilesMap,
		triggerRules,
		assignments,
		sessions,
		scopeAgents,
		role,
		tierCuts,
	]);
}
