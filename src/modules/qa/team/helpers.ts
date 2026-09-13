import type { AgentProfile, PerformancePoint, ProfilePeriod, TeamFilters, TeamRole, TeamTableRow, Trend } from './types';
import { NOW_ISO, PROFILE_PERIODS, SCORE_COLOR_STEPS } from './constants';

export const roleFromPath = (pathname: string): TeamRole => (pathname.startsWith('/qa/qa-manager') ? 'qa-manager' : 'supervisor');
export const teamBasePath = (role: TeamRole) => (role === 'qa-manager' ? '/qa/qa-manager/agents' : '/qa/supervisor/your-team');
export const customersBasePath = (role: TeamRole) => (role === 'qa-manager' ? '/qa/qa-manager/customers' : '/qa/supervisor/customers');

export const getScoreColor = (score: number): string => SCORE_COLOR_STEPS.find(([min]) => score >= min)?.[1] ?? 'red';
export const sentimentColor = (score: number) => getScoreColor(Math.round(((score - 1) / 4) * 100));

export const formatSeconds = (s: number) => `${Math.floor(s / 60)}:${String(Math.round(s % 60)).padStart(2, '0')}`;
export const formatDate = (iso: string) => new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
export const formatDateTime = (iso: string) => new Date(iso).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
export const monthsBetween = (fromIso: string, toIso = NOW_ISO) => {
	const a = new Date(fromIso), b = new Date(toIso);
	return (b.getUTCFullYear() - a.getUTCFullYear()) * 12 + (b.getUTCMonth() - a.getUTCMonth());
};
export const formatTenure = (fromIso: string) => {
	const m = monthsBetween(fromIso);
	return m < 12 ? `${m} mo` : `${Math.floor(m / 12)} yr ${m % 12} mo`;
};

export const trendDelta = (delta: number, unit: '%' | '/5' | 's' | '') => `${delta > 0 ? '+' : ''}${unit === '/5' ? delta.toFixed(1) : Math.round(delta)}${unit === '/5' ? '' : unit}`;
export const trendColor = (trend: Trend, betterWhen: 'higher' | 'lower' = 'higher') =>
	trend === 'flat' ? 'gray' : (trend === 'up') === (betterWhen === 'higher') ? 'teal' : 'red';

/** Slice of the monthly series covered by the selected period. */
export const filterByPeriod = (points: PerformancePoint[], period: ProfilePeriod): PerformancePoint[] => {
	const months = PROFILE_PERIODS.find((p) => p.value === period)?.months ?? null;
	return months === null ? points : points.slice(-Math.max(2, months));
};

/** Direction over the period: compares the average of the first and last third of the slice. */
export const periodDirection = (points: PerformancePoint[], key: keyof Pick<PerformancePoint, 'overall' | 'qa' | 'sentiment' | 'compliance' | 'business'>): { trend: Trend; delta: number } => {
	if (points.length < 2) return { trend: 'flat', delta: 0 };
	const third = Math.max(1, Math.floor(points.length / 3));
	const avg = (arr: PerformancePoint[]) => arr.reduce((s, p) => s + p[key], 0) / arr.length;
	const delta = Math.round(avg(points.slice(-third)) - avg(points.slice(0, third)));
	return { trend: delta > 2 ? 'up' : delta < -2 ? 'down' : 'flat', delta };
};

export const toTableRow = (p: AgentProfile): TeamTableRow => ({
	id: p.agent.id, name: p.agent.name, team: p.agent.team, supervisorName: p.agent.supervisorName, status: p.agent.status,
	overall: p.overall.score, overallTrend: p.overall.trend,
	qa: p.dimensions.find((d) => d.key === 'qa')!.score,
	sentiment: p.dimensions.find((d) => d.key === 'sentiment')!.score,
	compliance: p.dimensions.find((d) => d.key === 'compliance')!.score,
	conversionRate: p.dimensions.find((d) => d.key === 'business')!.score,
	ahtSeconds: p.operational.find((m) => m.key === 'aht')!.value,
	burnoutLevel: p.risk.burnout.level,
	badges: p.badges.length,
	openCoaching: p.coaching.filter((c) => c.status === 'scheduled').length,
	overdueLms: p.lms.filter((l) => l.status === 'overdue').length,
	lastEvaluationAt: p.evaluations[0]?.date ?? NOW_ISO,
});

export const isAtRisk = (row: TeamTableRow) => row.burnoutLevel === 'high' || row.overall < 70 || row.overdueLms > 0;

export const applyTeamFilters = (rows: TeamTableRow[], profiles: Record<string, AgentProfile>, f: TeamFilters): TeamTableRow[] =>
	rows.filter((r) => {
		const agent = profiles[r.id].agent;
		if (f.search && !r.name.toLowerCase().includes(f.search.toLowerCase()) && !r.id.toLowerCase().includes(f.search.toLowerCase())) return false;
		if (f.status !== 'all' && r.status !== f.status) return false;
		if (f.campaignId !== 'all' && !agent.campaignIds.includes(f.campaignId)) return false;
		if (f.supervisorId !== 'all' && agent.supervisorId !== f.supervisorId) return false;
		if (f.riskOnly && !isAtRisk(r)) return false;
		return true;
	});

export const teamKpis = (rows: TeamTableRow[]) => ({
	averageOverall: rows.length ? Math.round(rows.reduce((s, r) => s + r.overall, 0) / rows.length) : 0,
	atRisk: rows.filter(isAtRisk).length,
	overdueLms: rows.reduce((s, r) => s + r.overdueLms, 0),
	openCoaching: rows.reduce((s, r) => s + r.openCoaching, 0),
	improving: rows.filter((r) => r.overallTrend === 'up').length,
	declining: rows.filter((r) => r.overallTrend === 'down').length,
});
