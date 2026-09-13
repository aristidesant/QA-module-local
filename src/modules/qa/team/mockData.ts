import { BurnoutRiskLevel } from '~/modules/qa/dashboard/types/burnoutRisk';
import { PREDEFINED_BADGE_CATALOGS } from '~/models/qa/badges';
import type { Emotion, SentimentCategory } from '~/modules/qa/emotion-sentiment/types';
import type {
	ActivityEvent, AgentProfile, CoachingSession, DimensionKey, DimensionScore, EarnedBadge, EvaluationHistoryRow,
	LmsAssignment, OperationalMetric, PerformancePoint, RosterAgent, RosterCampaign, RosterSupervisor, Trend,
} from './types';
import {
	BUSINESS_SIGNAL_ORDER, COMPLIANCE_AREA_ORDER, LMS_CATALOG, NOW_ISO, OPERATIONAL_META, OPERATIONAL_ORDER,
	OVERALL_WEIGHTS, QA_ERROR_TYPE_ORDER, SENTIMENT_CATEGORY_ORDER,
} from './constants';

export const TEAM_SUPERVISORS: RosterSupervisor[] = [
	{ id: 'SUP-001', name: 'Maria García', team: 'Team 1' },
	{ id: 'SUP-002', name: 'Juan Pérez', team: 'Team 2' },
	{ id: 'SUP-003', name: 'Laura Gómez', team: 'Team 3' },
];

export const TEAM_CAMPAIGNS: RosterCampaign[] = [
	{ id: 'camp-001', name: 'Q3 Customer Service', lineOfBusiness: 'Customer Service', campaignType: 'INBOUND' },
	{ id: 'camp-002', name: 'Sales Training', lineOfBusiness: 'Sales', campaignType: 'OUTBOUND' },
	{ id: 'camp-003', name: 'Q4 Compliance', lineOfBusiness: 'Collections', campaignType: 'BLENDED' },
	{ id: 'camp-004', name: 'Tech Support', lineOfBusiness: 'Tech Support', campaignType: 'INBOUND' },
];

/** Persona knobs: base level per dimension (0-1 = weak..strong) and a monthly slope (-1..1). */
interface Persona {
	id: string; name: string; supervisorId: string; campaignIds: string[]; status?: RosterAgent['status']; shift?: RosterAgent['shift'];
	hireDate: string; trackedSince: string; base: Record<DimensionKey, number>; slope: number; burnout: BurnoutRiskLevel; skills: string[];
}

const AVATAR_COLORS = ['blue', 'teal', 'grape', 'orange', 'cyan', 'indigo', 'pink', 'lime', 'violet', 'green'];

export const PERSONAS: Persona[] = [
	{ id: 'AGT-001', name: 'Sarah Johnson', supervisorId: 'SUP-001', campaignIds: ['camp-001'], hireDate: '2023-03-06', trackedSince: '2025-01-13', base: { qa: 0.92, sentiment: 0.9, compliance: 0.95, business: 0.8 }, slope: 0.1, burnout: BurnoutRiskLevel.LOW, skills: ['Retention', 'Upsell', 'Bilingual'] },
	{ id: 'AGT-002', name: 'Mike Chen', supervisorId: 'SUP-001', campaignIds: ['camp-001', 'camp-003'], hireDate: '2022-11-14', trackedSince: '2025-01-13', base: { qa: 0.85, sentiment: 0.78, compliance: 0.98, business: 0.7 }, slope: 0.05, burnout: BurnoutRiskLevel.LOW, skills: ['Collections', 'Compliance'] },
	{ id: 'AGT-003', name: 'Jessica Martinez', supervisorId: 'SUP-001', campaignIds: ['camp-001'], hireDate: '2024-05-20', trackedSince: '2025-02-03', base: { qa: 0.8, sentiment: 0.82, compliance: 0.86, business: 0.66 }, slope: 0.15, burnout: BurnoutRiskLevel.LOW, skills: ['Customer Service'] },
	{ id: 'AGT-004', name: 'John Smith', supervisorId: 'SUP-001', campaignIds: ['camp-001'], hireDate: '2024-09-02', trackedSince: '2025-03-03', base: { qa: 0.72, sentiment: 0.74, compliance: 0.84, business: 0.6 }, slope: 0.35, burnout: BurnoutRiskLevel.LOW, skills: ['Customer Service', 'Tech Support'] },
	{ id: 'AGT-005', name: 'Emma Davis', supervisorId: 'SUP-001', campaignIds: ['camp-001'], hireDate: '2023-08-21', trackedSince: '2025-01-13', base: { qa: 0.78, sentiment: 0.52, compliance: 0.88, business: 0.62 }, slope: -0.1, burnout: BurnoutRiskLevel.MEDIUM, skills: ['Customer Service'] },
	{ id: 'AGT-006', name: 'David Brown', supervisorId: 'SUP-001', campaignIds: ['camp-001', 'camp-003'], hireDate: '2022-02-07', trackedSince: '2025-01-13', base: { qa: 0.58, sentiment: 0.45, compliance: 0.7, business: 0.5 }, slope: -0.35, burnout: BurnoutRiskLevel.HIGH, skills: ['Collections'] },
	{ id: 'AGT-007', name: 'Lisa Wong', supervisorId: 'SUP-001', campaignIds: ['camp-003'], hireDate: '2023-01-16', trackedSince: '2025-01-13', base: { qa: 0.84, sentiment: 0.8, compliance: 0.68, business: 0.72 }, slope: -0.05, burnout: BurnoutRiskLevel.MEDIUM, skills: ['Collections', 'Retention'] },
	{ id: 'AGT-008', name: 'Sofia Rodríguez', supervisorId: 'SUP-002', campaignIds: ['camp-002'], hireDate: '2023-06-12', trackedSince: '2025-01-20', base: { qa: 0.82, sentiment: 0.8, compliance: 0.9, business: 0.55 }, slope: 0.05, burnout: BurnoutRiskLevel.LOW, skills: ['Sales', 'Bilingual'] },
	{ id: 'AGT-009', name: 'Miguel Fernández', supervisorId: 'SUP-002', campaignIds: ['camp-002'], hireDate: '2024-01-08', trackedSince: '2025-01-20', base: { qa: 0.76, sentiment: 0.7, compliance: 0.85, business: 0.74 }, slope: 0.2, burnout: BurnoutRiskLevel.LOW, skills: ['Sales'] },
	{ id: 'AGT-010', name: 'Carlos Vega', supervisorId: 'SUP-002', campaignIds: ['camp-002', 'camp-004'], hireDate: '2022-07-25', trackedSince: '2025-01-20', base: { qa: 0.7, sentiment: 0.68, compliance: 0.62, business: 0.7 }, slope: -0.2, burnout: BurnoutRiskLevel.MEDIUM, skills: ['Sales', 'Tech Support'] },
	{ id: 'AGT-011', name: 'Lucía Torres', supervisorId: 'SUP-002', campaignIds: ['camp-004'], hireDate: '2023-10-02', trackedSince: '2025-01-20', base: { qa: 0.88, sentiment: 0.93, compliance: 0.9, business: 0.65 }, slope: 0.08, burnout: BurnoutRiskLevel.LOW, skills: ['Tech Support', 'De-escalation'] },
	{ id: 'AGT-012', name: 'Diego Ramírez', supervisorId: 'SUP-002', campaignIds: ['camp-002'], hireDate: '2024-03-18', trackedSince: '2025-04-07', base: { qa: 0.74, sentiment: 0.6, compliance: 0.86, business: 0.58 }, slope: -0.15, burnout: BurnoutRiskLevel.MEDIUM, skills: ['Sales'] },
	{ id: 'AGT-013', name: 'Valentina Cruz', supervisorId: 'SUP-002', campaignIds: ['camp-002'], hireDate: '2024-08-05', trackedSince: '2025-04-07', base: { qa: 0.79, sentiment: 0.84, compliance: 0.88, business: 0.68 }, slope: 0.12, burnout: BurnoutRiskLevel.LOW, skills: ['Sales', 'Bilingual'] },
	{ id: 'AGT-014', name: 'Andrés Mora', supervisorId: 'SUP-002', campaignIds: ['camp-004'], hireDate: '2023-04-10', trackedSince: '2025-01-20', status: 'on-leave', base: { qa: 0.81, sentiment: 0.76, compliance: 0.9, business: 0.6 }, slope: 0, burnout: BurnoutRiskLevel.LOW, skills: ['Tech Support'] },
	{ id: 'AGT-015', name: 'Camila Herrera', supervisorId: 'SUP-003', campaignIds: ['camp-003', 'camp-001'], hireDate: '2022-05-09', trackedSince: '2025-02-10', base: { qa: 0.96, sentiment: 0.88, compliance: 0.97, business: 0.78 }, slope: 0.03, burnout: BurnoutRiskLevel.LOW, skills: ['Collections', 'Mentor'] },
	{ id: 'AGT-016', name: 'Javier Ortiz', supervisorId: 'SUP-003', campaignIds: ['camp-003'], hireDate: '2024-02-19', trackedSince: '2025-02-10', base: { qa: 0.77, sentiment: 0.72, compliance: 0.83, business: 0.64 }, slope: 0.1, burnout: BurnoutRiskLevel.LOW, skills: ['Collections'] },
	{ id: 'AGT-017', name: 'Nina Patel', supervisorId: 'SUP-003', campaignIds: ['camp-003'], hireDate: '2023-09-11', trackedSince: '2025-02-10', base: { qa: 0.62, sentiment: 0.7, compliance: 0.75, business: 0.6 }, slope: -0.25, burnout: BurnoutRiskLevel.HIGH, skills: ['Collections'] },
	{ id: 'AGT-018', name: 'Paula Castillo', supervisorId: 'SUP-003', campaignIds: ['camp-001'], hireDate: '2025-01-06', trackedSince: '2025-05-05', status: 'training', base: { qa: 0.7, sentiment: 0.78, compliance: 0.82, business: 0.55 }, slope: 0.3, burnout: BurnoutRiskLevel.LOW, skills: ['Customer Service'] },
	{ id: 'AGT-019', name: 'Tomás Ríos', supervisorId: 'SUP-003', campaignIds: ['camp-003'], hireDate: '2023-11-27', trackedSince: '2025-02-10', base: { qa: 0.83, sentiment: 0.79, compliance: 0.91, business: 0.7 }, slope: 0.02, burnout: BurnoutRiskLevel.LOW, skills: ['Collections', 'Retention'] },
	{ id: 'AGT-020', name: 'Isabel Navarro', supervisorId: 'SUP-003', campaignIds: ['camp-001'], hireDate: '2022-09-19', trackedSince: '2025-02-10', base: { qa: 0.87, sentiment: 0.86, compliance: 0.93, business: 0.75 }, slope: 0.04, burnout: BurnoutRiskLevel.LOW, skills: ['Customer Service', 'Mentor'] },
	{ id: 'AGT-021', name: 'Bruno Salas', supervisorId: 'SUP-003', campaignIds: ['camp-003', 'camp-001'], hireDate: '2024-06-03', trackedSince: '2025-05-05', base: { qa: 0.75, sentiment: 0.66, compliance: 0.8, business: 0.62 }, slope: -0.08, burnout: BurnoutRiskLevel.MEDIUM, skills: ['Collections'] },
];

export const TEAM_AGENTS: RosterAgent[] = PERSONAS.map((p, i) => {
	const sup = TEAM_SUPERVISORS.find((s) => s.id === p.supervisorId)!;
	return {
		id: p.id, name: p.name, email: `${p.name.toLowerCase().normalize('NFD').replace(/\p{M}/gu, '').replace(' ', '.')}@newtech.com`,
		supervisorId: sup.id, supervisorName: sup.name, team: sup.team, campaignIds: p.campaignIds,
		status: p.status ?? 'active', shift: p.shift ?? (i % 3 === 0 ? 'morning' : i % 3 === 1 ? 'afternoon' : 'night'),
		hireDate: p.hireDate, trackedSince: p.trackedSince, skills: p.skills, avatarColor: AVATAR_COLORS[i % AVATAR_COLORS.length],
	};
});
function seeded(seed: number) {
	let s = seed;
	return () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
}
const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));
const round1 = (v: number) => Math.round(v * 10) / 10;
const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const monthLabel = (d: Date) => `${MONTH_LABELS[d.getUTCMonth()]} ${String(d.getUTCFullYear()).slice(2)}`;
const isoDay = (d: Date) => d.toISOString().slice(0, 10);
const trendOf = (delta: number, flatBand: number): Trend => (delta > flatBand ? 'up' : delta < -flatBand ? 'down' : 'flat');

/** Months from trackedSince (first day) to NOW (first day), inclusive. */
function monthsSince(trackedSince: string): Date[] {
	const start = new Date(trackedSince); start.setUTCDate(1); start.setUTCHours(0, 0, 0, 0);
	const end = new Date(NOW_ISO); end.setUTCDate(1); end.setUTCHours(0, 0, 0, 0);
	const out: Date[] = [];
	for (let d = new Date(start); d <= end; d.setUTCMonth(d.getUTCMonth() + 1)) out.push(new Date(d));
	return out;
}

/** Dimension value at month index i of n: base ± slope drift + noise. qa/compliance/business → 0-100, sentiment → 1-5. */
function dimensionAt(key: DimensionKey, base: number, slope: number, i: number, n: number, rand: () => number): number {
	const progress = n <= 1 ? 1 : i / (n - 1);
	const drift = slope * 0.18 * (progress - 0.5) * 2; // ±18% of range across the whole history
	const noise = (rand() - 0.5) * 0.08;
	const v = clamp(base + drift + noise, 0.05, 1);
	return key === 'sentiment' ? round1(1 + v * 4) : Math.round(v * 100);
}

const toPct = (key: DimensionKey, v: number) => (key === 'sentiment' ? Math.round(((v - 1) / 4) * 100) : v);
interface RankContext { rankInTeam: number; teamSize: number; percentile: number }

export function buildAgentProfile(p: Persona, rank: RankContext): AgentProfile {
	const agent = TEAM_AGENTS.find((a) => a.id === p.id)!;
	const rand = seeded(Number(p.id.replace(/\D/g, '')) * 7919);
	const months = monthsSince(p.trackedSince);
	const n = months.length;

	// --- performance series (one point per month) ---
	const performance: PerformancePoint[] = months.map((d, i) => {
		const qa = dimensionAt('qa', p.base.qa, p.slope, i, n, rand);
		const sentiment = dimensionAt('sentiment', p.base.sentiment, p.slope, i, n, rand);
		const compliance = dimensionAt('compliance', p.base.compliance, p.slope * 0.6, i, n, rand);
		const business = dimensionAt('business', p.base.business, p.slope, i, n, rand);
		const overall = Math.round((qa * OVERALL_WEIGHTS.qa + toPct('sentiment', sentiment) * OVERALL_WEIGHTS.sentiment + compliance * OVERALL_WEIGHTS.compliance + business * OVERALL_WEIGHTS.business) / 100);
		return { date: isoDay(d), label: monthLabel(d), overall, qa, sentiment: toPct('sentiment', sentiment), compliance, business, callsEvaluated: 18 + Math.round(rand() * 14) };
	});
	const last = performance[n - 1];
	const prev = performance[Math.max(0, n - 2)];
	const lastSentiment5 = round1(1 + (last.sentiment / 100) * 4);
	const prevSentiment5 = round1(1 + (prev.sentiment / 100) * 4);

	const dimensions: DimensionScore[] = [
		{ key: 'qa', score: last.qa, delta: last.qa - prev.qa, trend: trendOf(last.qa - prev.qa, 1.5), evaluations: last.callsEvaluated },
		{ key: 'sentiment', score: lastSentiment5, delta: round1(lastSentiment5 - prevSentiment5), trend: trendOf(lastSentiment5 - prevSentiment5, 0.1), evaluations: last.callsEvaluated },
		{ key: 'compliance', score: last.compliance, delta: last.compliance - prev.compliance, trend: trendOf(last.compliance - prev.compliance, 1.5), evaluations: last.callsEvaluated },
		{ key: 'business', score: last.business, delta: last.business - prev.business, trend: trendOf(last.business - prev.business, 1.5), evaluations: Math.round(last.callsEvaluated * 0.6) },
	];
	const overall = { score: last.overall, delta: last.overall - prev.overall, trend: trendOf(last.overall - prev.overall, 1.5), ...rank, weights: OVERALL_WEIGHTS };

	// --- operational: value = baseline scaled by persona quality (worse agents slower / more transfers) ---
	const quality = (p.base.qa + p.base.sentiment) / 2; // 0-1
	const operational: OperationalMetric[] = OPERATIONAL_ORDER.map((key) => {
		const meta = OPERATIONAL_META[key];
		const factor = meta.betterWhen === 'lower' ? 1 + (0.75 - quality) * 0.5 : 1 + (quality - 0.75) * 0.3;
		const value = meta.unit === 'percent' ? clamp(Math.round(meta.baseline * factor), 0, 100) : Math.round(meta.baseline * factor);
		const teamAverage = meta.baseline;
		const delta = Math.round((rand() - 0.5) * (meta.unit === 'seconds' ? 30 : meta.unit === 'count' ? 20 : 6));
		return { key, value, teamAverage, delta, unit: meta.unit, betterWhen: meta.betterWhen };
	});
	const ahtNow = operational.find((m) => m.key === 'aht')!.value;
	const operationalTrend = performance.slice(-12).map((pt) => {
		const aht = Math.round(ahtNow * (0.92 + rand() * 0.16));
		const talk = Math.round(aht * 0.72), hold = Math.round(aht * 0.11), wrapUp = aht - talk - hold;
		return { label: pt.label, aht, talk, hold, wrapUp, calls: 420 + Math.round(rand() * 200) };
	});

	// --- QA history ---
	const totalEvals = performance.reduce((s, pt) => s + pt.callsEvaluated, 0);
	const errorRates: Record<string, number> = { ECN: 0.12, ENC: 0.35, ECC: 0.05, ECUF: 0.04 };
	const qaWeak = 1.4 - p.base.qa; // 0.44 (strong) .. 0.82 (weak)
	const qa = {
		averageScore: Math.round(performance.reduce((s, pt) => s + pt.qa, 0) / n),
		passRate: clamp(Math.round(60 + p.base.qa * 40), 0, 100),
		evaluations: totalEvals,
		autoFails: Math.round(totalEvals * 0.02 * qaWeak),
		errorTypes: QA_ERROR_TYPE_ORDER.map((code) => {
			const count = Math.round(totalEvals * errorRates[code] * qaWeak);
			return { code, count, ratePerCall: round1((count / totalEvals) * 100), delta: Math.round((rand() - 0.5) * 4) };
		}),
		errorTrend: performance.slice(-12).map((pt) => ({
			label: pt.label,
			ECN: Math.round(pt.callsEvaluated * errorRates.ECN * qaWeak * (0.7 + rand() * 0.6)),
			ENC: Math.round(pt.callsEvaluated * errorRates.ENC * qaWeak * (0.7 + rand() * 0.6)),
			ECC: Math.round(pt.callsEvaluated * errorRates.ECC * qaWeak * (0.7 + rand() * 0.6)),
			ECUF: Math.round(pt.callsEvaluated * errorRates.ECUF * qaWeak * (0.7 + rand() * 0.6)),
		})),
		topFailedItems: [
			{ item: 'Asked discovery questions before presenting the offer', aspect: 'Needs Assessment', errorType: 'ENC' as const, count: Math.round(totalEvals * 0.14 * qaWeak) },
			{ item: 'Resolved the main objection (price / competitor)', aspect: 'Objection Handling', errorType: 'ECN' as const, count: Math.round(totalEvals * 0.09 * qaWeak) },
			{ item: 'Recapped the offer and next steps', aspect: 'Closing', errorType: 'ENC' as const, count: Math.round(totalEvals * 0.11 * qaWeak) },
			{ item: 'Contract and cancellation terms disclosed', aspect: 'Mandatory Disclosures', errorType: 'ECUF' as const, count: Math.round(totalEvals * 0.03 * qaWeak) },
			{ item: 'Verified customer identity before discussing the account', aspect: 'Opening & Identification', errorType: 'ECC' as const, count: Math.round(totalEvals * 0.03 * qaWeak) },
		].sort((a, b) => b.count - a.count),
	};

	// --- Sentiment history --- (category shares derive from the 1-5 average: higher avg → more positive share)
	const share = (avg: number): Record<SentimentCategory, number> => {
		const pos = clamp((avg - 1) / 4, 0, 1);
		const raw = [Math.round((1 - pos) * 12), Math.round((1 - pos) * 38), Math.round(30 + (0.5 - Math.abs(pos - 0.5)) * 20), Math.round(pos * 32), Math.round(pos * 12)];
		const total = raw.reduce((a, b) => a + b, 0);
		const pct = raw.map((v) => Math.round((v / total) * 100));
		pct[2] += 100 - pct.reduce((a, b) => a + b, 0); // make it sum 100
		return Object.fromEntries(SENTIMENT_CATEGORY_ORDER.map((k, i) => [k, pct[i]])) as Record<SentimentCategory, number>;
	};
	const emotionsFor = (avg: number): { emotion: Emotion; share: number }[] => (
		avg >= 3.5
			? [{ emotion: 'NEUTRAL', share: 34 }, { emotion: 'SATISFACTION', share: 26 }, { emotion: 'GRATITUDE', share: 16 }, { emotion: 'RELIEF', share: 14 }, { emotion: 'FRUSTRATION', share: 10 }]
			: [{ emotion: 'FRUSTRATION', share: 31 }, { emotion: 'NEUTRAL', share: 28 }, { emotion: 'DISAPPOINTMENT', share: 17 }, { emotion: 'ANGER', share: 12 }, { emotion: 'RELIEF', share: 12 }]
	);
	const agentAvg = lastSentiment5;
	const customerAvg = round1(clamp(agentAvg - 0.6 + rand() * 0.4, 1, 5));
	const sentiment = {
		agentAverage: agentAvg, customerAverage: customerAvg,
		agentCategories: share(agentAvg), customerCategories: share(customerAvg),
		agentEmotions: emotionsFor(agentAvg), customerEmotions: emotionsFor(customerAvg),
		recoveryRate: clamp(Math.round(30 + p.base.sentiment * 55), 0, 100),
		empathyPhrasesPerCall: round1(1 + p.base.sentiment * 2.5),
		trend: performance.slice(-12).map((pt) => ({ label: pt.label, agent: round1(1 + (pt.sentiment / 100) * 4), customer: round1(clamp(1 + (pt.sentiment / 100) * 4 - 0.6 + rand() * 0.4, 1, 5)) })),
	};

	// --- Compliance history ---
	const compWeak = 1.3 - p.base.compliance;
	const compliance = {
		overall: last.compliance,
		areas: COMPLIANCE_AREA_ORDER.map((key, i) => ({
			key, score: clamp(last.compliance + [4, -6, 2][i] + Math.round((rand() - 0.5) * 6), 0, 100),
			violations: Math.round(totalEvals * [0.005, 0.02, 0.004][i] * compWeak), warnings: Math.round(totalEvals * [0.02, 0.06, 0.015][i] * compWeak),
			delta: Math.round((rand() - 0.5) * 6),
		})),
		timeline: performance.slice(-12).map((pt) => ({ label: pt.label, violations: Math.round(pt.callsEvaluated * 0.03 * compWeak * rand()), warnings: Math.round(pt.callsEvaluated * 0.1 * compWeak * rand()) })),
		flaggedItems: [
			{ item: 'Transparency', area: 'regulatory' as const, count: Math.round(totalEvals * 0.05 * compWeak), lastSeen: '2026-09-08' },
			{ item: 'Disclosure Compliance', area: 'security' as const, count: Math.round(totalEvals * 0.02 * compWeak), lastSeen: '2026-08-27' },
			{ item: 'Do-Not-Call', area: 'legal' as const, count: Math.round(totalEvals * 0.008 * compWeak), lastSeen: '2026-07-15' },
		].filter((f) => f.count > 0),
	};

	// --- Business history ---
	const offers = Math.round(totalEvals * 0.6);
	const converted = Math.round(offers * (last.business / 100));
	const bizWeak = 1.3 - p.base.business;
	const signalRates: Record<string, number> = { EARLY_OBJECTION: 0.22, UNHANDLED_OBJECTION: 0.14, COMPETITOR_PLUS_COST: 0.12, MISTARGETED_OFFER: 0.08, BEST_TIME_FRAME: 0.18 };
	const business = {
		conversionRate: last.business, offersPresented: offers, converted, followUpsScheduled: Math.round(offers * 0.25),
		signals: BUSINESS_SIGNAL_ORDER.map((type) => {
			const weight = type === 'BEST_TIME_FRAME' ? 2 - bizWeak : bizWeak;
			const count = Math.round(offers * signalRates[type] * weight);
			return { type, count, ratePerCall: round1((count / offers) * 100), delta: Math.round((rand() - 0.5) * 5) };
		}),
		nonConversionReasons: [
			{ key: 'priceTooHigh' as const, count: Math.round((offers - converted) * 0.38) }, { key: 'noNeed' as const, count: Math.round((offers - converted) * 0.22) },
			{ key: 'thirdPartyDecision' as const, count: Math.round((offers - converted) * 0.16) }, { key: 'distrustQuality' as const, count: Math.round((offers - converted) * 0.1) },
			{ key: 'installationRequirements' as const, count: Math.round((offers - converted) * 0.08) }, { key: 'other' as const, count: Math.round((offers - converted) * 0.06) },
		],
		competitorMentions: [{ name: 'Claro', count: Math.round(offers * 0.09 * bizWeak) }, { name: 'Tigo', count: Math.round(offers * 0.05 * bizWeak) }, { name: 'Altice', count: Math.round(offers * 0.03 * bizWeak) }],
		conversionTrend: performance.slice(-12).map((pt) => ({ label: pt.label, conversionRate: pt.business, offers: Math.round(pt.callsEvaluated * 0.6) })),
	};

	// --- Risk history ---
	const burnoutPct = p.burnout === BurnoutRiskLevel.HIGH ? 78 : p.burnout === BurnoutRiskLevel.MEDIUM ? 55 : 22;
	const risk = {
		criticalErrorsTrend: qa.errorTrend.map((e) => ({ label: e.label, autoFails: Math.round((e.ECN + e.ECC) * 0.3), criticalErrors: e.ECN + e.ECC + e.ECUF })),
		alerts: p.base.qa < 0.8 || p.base.compliance < 0.8 || p.base.sentiment < 0.6 ? [
			{ id: `alr-${p.id}-1`, ruleName: 'QA score below 75%', metric: 'QA_OVERALL_SCORE', severity: 'warning' as const, firedAt: '2026-09-04T09:10:00Z', acknowledged: true },
			{ id: `alr-${p.id}-2`, ruleName: 'Negative emotion share above 30%', metric: 'NEGATIVE_EMOTION_CALL_SHARE', severity: 'critical' as const, firedAt: '2026-09-09T14:30:00Z', acknowledged: false },
		] : [],
		disputes: p.base.qa < 0.85 ? [
			{ id: `dsp-${p.id}-1`, callId: 'call-001', item: 'Resolved the main objection (price / competitor)', status: 'won' as const, filedAt: '2026-07-22', resolvedAt: '2026-07-29' },
			{ id: `dsp-${p.id}-2`, callId: 'call-002', item: 'Recapped the offer and next steps', status: 'open' as const, filedAt: '2026-09-06' },
		] : [],
		burnout: { agentId: p.id, level: p.burnout, percentage: burnoutPct, trend: p.slope < -0.1 ? 'declining' as const : p.slope > 0.1 ? 'improving' as const : 'stable' as const, lastUpdated: NOW_ISO },
		burnoutTrend: performance.slice(-6).map((pt, i, arr) => ({ label: pt.label, percentage: clamp(Math.round(burnoutPct - (arr.length - 1 - i) * (p.slope < 0 ? -4 : 3)), 5, 95) })),
	};

	// --- Coaching & LMS (seed; the store appends new ones) ---
	const weakest = [...dimensions].sort((a, b) => toPct(a.key, a.score) - toPct(b.key, b.score))[0].key;
	const coaching: CoachingSession[] = [
		{ id: `coa-${p.id}-1`, date: '2026-06-18T10:00:00Z', topic: 'Needs assessment', coachName: agent.supervisorName, coachRole: 'SUPERVISOR', status: 'completed', linkedDimension: 'qa', outcome: 'Agreed to open with 2 discovery questions', followUpDate: '2026-07-02' },
		{ id: `coa-${p.id}-2`, date: '2026-08-07T15:00:00Z', topic: weakest === 'sentiment' ? 'Handling frustrated customers' : weakest === 'compliance' ? 'Mandatory disclosures' : 'Objection handling', coachName: agent.supervisorName, coachRole: 'SUPERVISOR', status: p.base.qa < 0.7 ? 'missed' : 'completed', linkedDimension: weakest, outcome: p.base.qa < 0.7 ? undefined : 'Practised 3 role-plays; follow-up in two weeks' },
		{ id: `coa-${p.id}-3`, date: '2026-09-18T11:00:00Z', topic: 'Call closing', coachName: 'Elena Ruiz', coachRole: 'QA_MANAGER', status: 'scheduled', linkedDimension: 'qa' },
	];
	const lmsPick = LMS_CATALOG.filter((m) => m.dimension === weakest).concat(LMS_CATALOG.filter((m) => m.dimension !== weakest)).slice(0, 4);
	const lms: LmsAssignment[] = lmsPick.map((m, i) => {
		const status = i === 0 ? 'completed' : i === 1 ? 'in-progress' : i === 2 ? (p.base.qa < 0.75 ? 'overdue' : 'not-started') : 'completed';
		return { id: `lms-${p.id}-${i}`, materialId: m.id, title: m.title, type: m.type, mandatory: i < 2, assignedAt: ['2026-05-12', '2026-07-01', '2026-08-15', '2026-03-03'][i], assignedBy: agent.supervisorName, dueDate: ['2026-06-12', '2026-09-30', '2026-09-05', '2026-04-03'][i], progress: status === 'completed' ? 100 : status === 'in-progress' ? 45 + Math.round(rand() * 40) : status === 'overdue' ? 20 : 0, status, completedAt: status === 'completed' ? ['2026-06-02', '', '', '2026-03-28'][i] || undefined : undefined };
	});

	// --- Achievements ---
	const cat = PREDEFINED_BADGE_CATALOGS;
	const badges: EarnedBadge[] = [
		p.base.qa >= 0.85 ? { id: `bdg-${p.id}-1`, type: cat.QA_EXCELLENCE.type, name: cat.QA_EXCELLENCE.name, icon: cat.QA_EXCELLENCE.icon, earnedAt: '2026-08-29', reason: '5 consecutive evaluations above 95%' } : null,
		p.base.sentiment >= 0.85 ? { id: `bdg-${p.id}-2`, type: cat.SENTIMENT_CHAMPION.type, name: cat.SENTIMENT_CHAMPION.name, icon: cat.SENTIMENT_CHAMPION.icon, earnedAt: '2026-07-14', reason: 'Customer sentiment above 4.5 for 3 calls' } : null,
		p.base.compliance >= 0.9 ? { id: `bdg-${p.id}-3`, type: cat.COMPLIANCE_GUARDIAN.type, name: cat.COMPLIANCE_GUARDIAN.name, icon: cat.COMPLIANCE_GUARDIAN.icon, earnedAt: '2026-06-03', reason: '0 violations in 10 calls' } : null,
		p.slope >= 0.2 ? { id: `bdg-${p.id}-4`, type: cat.IMPROVEMENT_CHAMPION.type, name: cat.IMPROVEMENT_CHAMPION.name, icon: cat.IMPROVEMENT_CHAMPION.icon, earnedAt: '2026-08-01', reason: '+10% QA score in one month' } : null,
		p.base.business >= 0.7 ? { id: `bdg-${p.id}-5`, type: cat.BUSINESS_DRIVER.type, name: cat.BUSINESS_DRIVER.name, icon: cat.BUSINESS_DRIVER.icon, earnedAt: '2026-05-20', reason: '5+ business insights in a month' } : null,
		p.base.qa >= 0.8 && p.base.sentiment >= 0.75 ? { id: `bdg-${p.id}-6`, type: cat.STREAKER.type, name: cat.STREAKER.name, icon: cat.STREAKER.icon, earnedAt: '2026-04-11', reason: '5 high-performing evaluations in a row' } : null,
	].filter((b): b is EarnedBadge => b !== null);
	const milestones = [
		{ id: `mil-${p.id}-1`, name: '100 evaluated calls', description: 'Reach 100 evaluated calls', progress: clamp(Math.round((totalEvals / 100) * 100), 0, 100), achievedAt: totalEvals >= 100 ? '2026-04-20' : undefined },
		{ id: `mil-${p.id}-2`, name: 'QA 90+ for a full month', description: 'Monthly QA average of 90 or more', progress: clamp(Math.round((last.qa / 90) * 100), 0, 100), achievedAt: last.qa >= 90 ? last.date : undefined },
		{ id: `mil-${p.id}-3`, name: 'Zero auto-fails quarter', description: 'No auto-fails in 3 consecutive months', progress: qa.autoFails === 0 ? 100 : 40, achievedAt: qa.autoFails === 0 ? '2026-06-30' : undefined },
		{ id: `mil-${p.id}-4`, name: 'Conversion 35%+', description: 'Monthly conversion rate of 35% or more', progress: clamp(Math.round((last.business / 35) * 100), 0, 100), achievedAt: last.business >= 35 ? last.date : undefined },
	];
	const rankingHistory = performance.slice(-12).map((pt) => ({ label: pt.label, position: clamp(Math.round(rank.rankInTeam + (rand() - 0.5) * 2), 1, rank.teamSize), score: pt.overall, teamSize: rank.teamSize }));
	rankingHistory[rankingHistory.length - 1].position = rank.rankInTeam;

	// --- Evaluations table (last 12) — call-001 always exists so the link works ---
	const evaluations: EvaluationHistoryRow[] = Array.from({ length: 12 }, (_, i) => {
		const d = new Date(NOW_ISO); d.setUTCDate(d.getUTCDate() - i * 4 - Math.round(rand() * 2));
		const camp = TEAM_CAMPAIGNS.find((c) => c.id === p.campaignIds[i % p.campaignIds.length])!;
		const qaScore = clamp(Math.round(last.qa + (rand() - 0.5) * 20), 40, 100);
		return { id: `ev-${p.id}-${i}`, callId: i === 0 ? 'call-001' : `call-${String(100 + i)}`, campaignId: camp.id, campaignName: camp.name, date: d.toISOString(), durationSeconds: 120 + Math.round(rand() * 400), qaScore, customerSentiment: round1(clamp(customerAvg + (rand() - 0.5), 1, 5)), complianceScore: clamp(Math.round(last.compliance + (rand() - 0.5) * 14), 50, 100), converted: rand() < last.business / 100, autoFail: qaScore < 55, evaluatedBy: i % 5 === 3 ? 'Manual' : 'AI' };
	});

	// --- Activity feed: derived from the blocks above, newest first ---
	const activity: ActivityEvent[] = [
		...badges.map((b) => ({ id: `act-${b.id}`, type: 'badge' as const, date: `${b.earnedAt}T12:00:00Z`, title: `Earned ${b.name}`, description: b.reason })),
		...milestones.filter((m) => m.achievedAt).map((m) => ({ id: `act-${m.id}`, type: 'milestone' as const, date: `${m.achievedAt}T12:00:00Z`, title: m.name, description: m.description })),
		...coaching.map((c) => ({ id: `act-${c.id}`, type: 'coaching' as const, date: c.date, title: `Coaching ${c.status}: ${c.topic}`, description: `${c.coachName} · ${c.outcome ?? 'No outcome recorded yet'}` })),
		...lms.map((l) => ({ id: `act-${l.id}`, type: 'lms' as const, date: `${l.completedAt ?? l.assignedAt}T09:00:00Z`, title: `${l.status === 'completed' ? 'Completed' : 'Assigned'}: ${l.title}`, description: `${l.type} · due ${l.dueDate}` })),
		...risk.alerts.map((a) => ({ id: `act-${a.id}`, type: 'alert' as const, date: a.firedAt, title: `Trigger fired: ${a.ruleName}`, description: a.acknowledged ? 'Acknowledged' : 'Pending acknowledgement' })),
		...risk.disputes.map((d) => ({ id: `act-${d.id}`, type: 'dispute' as const, date: `${d.filedAt}T10:00:00Z`, title: `Dispute ${d.status}: ${d.item}`, description: `Call ${d.callId}`, link: `/qa/campaigns/1/calls/${d.callId}` })),
		...evaluations.slice(0, 4).map((e) => ({ id: `act-${e.id}`, type: 'evaluation' as const, date: e.date, title: `Call evaluated · QA ${e.qaScore}%`, description: `${e.campaignName} · sentiment ${e.customerSentiment}/5 · compliance ${e.complianceScore}%`, link: `/qa/campaigns/1/calls/${e.callId}` })),
		{ id: `act-rank-${p.id}`, type: 'rank' as const, date: last.date + 'T00:00:00Z', title: `Ranked #${rank.rankInTeam} of ${rank.teamSize} in ${agent.team}`, description: `Overall score ${last.overall}` },
	].sort((a, b) => b.date.localeCompare(a.date));

	const notes = [
		{ id: `note-${p.id}-1`, agentId: p.id, authorName: agent.supervisorName, authorRole: 'SUPERVISOR' as const, createdAt: '2026-08-08T16:20:00Z', text: `Followed up after coaching on ${coaching[1].topic.toLowerCase()}. Committed to practise on live calls this week.`, pinned: true },
		{ id: `note-${p.id}-2`, agentId: p.id, authorName: 'Elena Ruiz', authorRole: 'QA_MANAGER' as const, createdAt: '2026-06-20T09:05:00Z', text: 'Calibration check: AI and manual scores within 3 points on the last 5 calls.', pinned: false },
	];

	const peerComparison = [
		{ label: 'QA score', agentValue: last.qa, teamAverage: 82, unit: '%' },
		{ label: 'Customer sentiment', agentValue: Math.round(customerAvg * 20), teamAverage: 72, unit: '%' },
		{ label: 'Compliance', agentValue: last.compliance, teamAverage: 88, unit: '%' },
		{ label: 'Conversion rate', agentValue: last.business, teamAverage: 31, unit: '%' },
		{ label: 'AHT (s)', agentValue: ahtNow, teamAverage: OPERATIONAL_META.aht.baseline, unit: 's' },
	];
	const strengths = dimensions.filter((d) => toPct(d.key, d.score) >= 85).map((d) => ({ label: `${d.key === 'qa' ? 'QA' : d.key === 'sentiment' ? 'Sentiment' : d.key === 'compliance' ? 'Compliance' : 'Conversion'} ${d.score}${d.key === 'sentiment' ? '/5' : '%'}`, evidence: `Top quartile of ${agent.team} over the last period` }));
	const weaknesses = dimensions.filter((d) => toPct(d.key, d.score) < 75).map((d) => ({ label: `${d.key === 'qa' ? 'QA' : d.key === 'sentiment' ? 'Sentiment' : d.key === 'compliance' ? 'Compliance' : 'Conversion'} ${d.score}${d.key === 'sentiment' ? '/5' : '%'}`, evidence: `Below team average for ${Math.min(n, 3)} months`, suggestedAction: d.key === 'sentiment' ? 'Assign "De-escalation Techniques" and schedule empathy coaching' : d.key === 'compliance' ? 'Assign "Regulatory Disclosures 2026"' : d.key === 'business' ? 'Assign "Objection Handling Fundamentals"' : 'Schedule coaching on needs assessment and closing' }));

	return { agent, overall, dimensions, performance, operational, operationalTrend, qa, sentiment, compliance, business, risk, coaching, lms, badges, milestones, rankingHistory, activity, notes, evaluations, peerComparison, strengths, weaknesses };
}
/** Rank each agent inside its team by the latest overall score, then build the profiles. */
function buildAll(): Record<string, AgentProfile> {
	// First pass: latest overall per persona (cheap re-run of the series with a throwaway rank).
	const provisional = PERSONAS.map((p) => ({ p, overall: buildAgentProfile(p, { rankInTeam: 1, teamSize: 1, percentile: 50 }).overall.score }));
	const out: Record<string, AgentProfile> = {};
	for (const sup of TEAM_SUPERVISORS) {
		const team = provisional.filter((x) => x.p.supervisorId === sup.id).sort((a, b) => b.overall - a.overall);
		team.forEach((x, i) => {
			const rankInTeam = i + 1;
			const percentile = Math.round(((team.length - rankInTeam) / Math.max(1, team.length - 1)) * 100);
			out[x.p.id] = buildAgentProfile(x.p, { rankInTeam, teamSize: team.length, percentile });
		});
	}
	return out;
}

export const TEAM_PROFILES: Record<string, AgentProfile> = buildAll();
