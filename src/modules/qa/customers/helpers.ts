import { TEAM_AGENTS } from '~/modules/qa/team/mockData';
import { SUPERVISOR_PERSONA } from '~/modules/qa/team/constants';
import type { TeamRole } from '~/modules/qa/team/types';
import type { ContactWindowStat, CustomerFilters, CustomerProfile, CustomerTableRow } from './types';
import { DAY_PART_HOURS } from './constants';

export const windowLabel = (w: Pick<ContactWindowStat, 'weekday' | 'dayPart'>, t: (k: string) => string) => `${t(`weekday.${w.weekday}`)} ${t(`dayPart.${w.dayPart}`)}`;
export const windowHours = (w: Pick<ContactWindowStat, 'dayPart'>) => DAY_PART_HOURS[w.dayPart];

export const toCustomerRow = (p: CustomerProfile): CustomerTableRow => ({
	id: p.customer.id, name: p.customer.name, segment: p.customer.segment, status: p.customer.status, doNotCall: p.customer.doNotCall,
	contacts: p.kpis.totalContacts, lastContactAt: p.kpis.lastContactAt, receptivenessScore: p.kpis.receptivenessScore, receptivenessBand: p.kpis.receptivenessBand,
	churnRisk: p.kpis.churnRisk, avgSentiment: p.kpis.avgCustomerSentiment, sentimentTrend: p.kpis.sentimentTrend, acceptanceRate: p.kpis.acceptanceRate,
	npsLatest: p.kpis.npsLatest, lastAgentName: p.contacts[0]?.agentName ?? '—',
	bestWindow: p.bestWindows[0] ? `${p.bestWindows[0].weekday} ${p.bestWindows[0].dayPart}` : '—',
	teamIds: [...new Set(p.contacts.map((c) => TEAM_AGENTS.find((a) => a.id === c.agentId)?.supervisorId ?? ''))],
});

/** Supervisor sees customers contacted by at least one agent of Team 1; QA Manager sees all. */
export const visibleForRole = (rows: CustomerTableRow[], role: TeamRole) => (role === 'qa-manager' ? rows : rows.filter((r) => r.teamIds.includes(SUPERVISOR_PERSONA.id)));

export const applyCustomerFilters = (rows: CustomerTableRow[], profiles: Record<string, CustomerProfile>, f: CustomerFilters) =>
	rows.filter((r) => {
		const q = f.search.toLowerCase();
		if (q && !r.name.toLowerCase().includes(q) && !r.id.toLowerCase().includes(q) && !profiles[r.id].customer.phone.includes(q)) return false;
		if (f.segment !== 'all' && r.segment !== f.segment) return false;
		if (f.status !== 'all' && r.status !== f.status) return false;
		if (f.receptiveness !== 'all' && r.receptivenessBand !== f.receptiveness) return false;
		if (f.churnRisk !== 'all' && r.churnRisk !== f.churnRisk) return false;
		if (f.agentId !== 'all' && !profiles[r.id].contacts.some((c) => c.agentId === f.agentId)) return false;
		if (f.dncOnly && !r.doNotCall) return false;
		return true;
	});

export const customerKpis = (rows: CustomerTableRow[]) => ({
	total: rows.length,
	receptive: rows.filter((r) => r.receptivenessBand === 'receptive').length,
	churnHigh: rows.filter((r) => r.churnRisk === 'high').length,
	doNotCall: rows.filter((r) => r.doNotCall).length,
	improving: rows.filter((r) => r.sentimentTrend === 'up').length,
	declining: rows.filter((r) => r.sentimentTrend === 'down').length,
	avgAcceptance: rows.length ? Math.round(rows.reduce((s, r) => s + r.acceptanceRate, 0) / rows.length) : 0,
});

export const npsBand = (score: number): { label: 'promoter' | 'passive' | 'detractor'; color: string } =>
	score >= 9 ? { label: 'promoter', color: 'green' } : score >= 7 ? { label: 'passive', color: 'yellow' } : { label: 'detractor', color: 'red' };
