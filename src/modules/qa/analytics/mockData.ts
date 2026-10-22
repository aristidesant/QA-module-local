import { BurnoutRiskLevel } from '~/modules/qa/dashboard/types/burnoutRisk';
import {
	PERSONAS,
	TEAM_AGENTS,
	TEAM_CAMPAIGNS,
	TEAM_SUPERVISORS,
	type Persona,
} from '~/modules/qa/team/mockData';
import {
	AGENT_PERSONA_ID,
	NOW_ISO,
	SUPERVISOR_PERSONA,
	UNASSIGNED_SUPERVISOR,
} from '~/modules/qa/team/constants';
import { monthsBetween } from '~/modules/qa/team/helpers';
import { TYPICAL_VOICE } from '~/modules/qa/burnout/constants';
import { applyVoiceSignals } from '~/modules/qa/burnout/mockVoice';
import type {
	NonConversionReasonKey,
	RosterAgent,
	RosterSupervisor,
	Shift,
} from '~/modules/qa/team/types';
import type { AgentType } from '~/models/qa/agents';
import type {
	DisputeEvaluationType,
	DisputeStatus,
} from '~/models/qa/disputeCases';
import { HISTORY_DAYS, TODAY, addDays } from './constants';
import type {
	BurnoutAction,
	CallDirection,
	CallEmotion,
	ContactOutcome,
	TeamCallMetric,
	TeamDispute,
	TenureBand,
	TimeSlot,
} from './types';

/**
 * The recent window keeps its original seeds and draw order (so every existing number is
 * unchanged); an older pass extends the history to HISTORY_DAYS.
 */
const RECENT_DAYS = 180;
const OLDER_DAYS = HISTORY_DAYS - RECENT_DAYS;
/** Personas' slope plays out over the last 90 days; older days sit at the starting level. */
const TREND_DAYS = 90;
const PRODUCTS = [
	'Premium Plan',
	'Fiber 300 Mbps',
	'TV Bundle',
	'Mobile Add-on',
	'Device Protection',
];
const COMPETITORS = ['Claro', 'Altice', 'Viva', 'Wind'];
const REASONS: { key: NonConversionReasonKey; weight: number }[] = [
	{ key: 'priceTooHigh', weight: 35 },
	{ key: 'noNeed', weight: 20 },
	{ key: 'thirdPartyDecision', weight: 15 },
	{ key: 'distrustQuality', weight: 13 },
	{ key: 'installationRequirements', weight: 10 },
	{ key: 'other', weight: 7 },
];

function seeded(seed: number) {
	let s = seed;
	return () => {
		s = (s * 9301 + 49297) % 233280;
		return s / 233280;
	};
}
const clamp = (v: number, min: number, max: number) =>
	Math.max(min, Math.min(max, v));
const round1 = (v: number) => Math.round(v * 10) / 10;
const pad = (n: number) => String(n).padStart(2, '0');
const pick = <T>(items: T[], rand: () => number): T =>
	items[Math.floor(rand() * items.length)];

/** Knuth Poisson sampler — fine for the small means used here. */
function poisson(mean: number, rand: () => number): number {
	const limit = Math.exp(-mean);
	let k = 0;
	let p = 1;
	do {
		k += 1;
		p *= rand();
	} while (p > limit);
	return k - 1;
}

function pickWeighted<T>(
	items: { key: T; weight: number }[],
	rand: () => number
): T {
	const total = items.reduce((s, i) => s + i.weight, 0);
	let r = rand() * total;
	for (const item of items) {
		r -= item.weight;
		if (r <= 0) return item.key;
	}
	return items[items.length - 1].key;
}

const tenureBandFor = (hireDate: string, isoDay: string): TenureBand => {
	const m = monthsBetween(hireDate, `${isoDay}T00:00:00Z`);
	return m < 6 ? 'lt6m' : m < 12 ? '6to12m' : m < 24 ? '1to2y' : 'gt2y';
};
/** Hours 18-19 (after-hours) fall into the last slot on purpose. */
const timeSlotFor = (hour: number): TimeSlot =>
	hour < 10
		? '08-10'
		: hour < 12
			? '10-12'
			: hour < 14
				? '12-14'
				: hour < 16
					? '14-16'
					: '16-18';
const hourFor = (shift: Shift, rand: () => number): number => {
	if (shift === 'morning') return 8 + Math.floor(rand() * 5); // 8-12
	if (shift === 'afternoon') return 12 + Math.floor(rand() * 6); // 12-17
	return rand() < 0.05 ? 18 : 16 + Math.floor(rand() * 2); // 16-17, 5% at 18
};
const emotionFor = (
	customerSentiment: number,
	rand: () => number
): CallEmotion =>
	customerSentiment >= 4.3
		? pick<CallEmotion>(['Joy', 'Trust'], rand)
		: customerSentiment >= 3.5
			? pick<CallEmotion>(['Trust', 'Anticipation'], rand)
			: customerSentiment >= 2.8
				? pick<CallEmotion>(['Surprise', 'Sadness'], rand)
				: pick<CallEmotion>(['Anger', 'Fear', 'Disgust'], rand);

/** What differs per agent type when a call is generated. Humans keep the original numbers. */
interface CallShape {
	agentType: AgentType;
	worksSunday: boolean;
	callsPerDay: (weekday: number, rand: () => number) => number;
	hourFor: (shift: Shift, rand: () => number) => number;
	handleTime: (rand: () => number, burnout: BurnoutRiskLevel) => number;
	holdTime: (rand: () => number) => number;
	wrapUp: (rand: () => number) => number;
	transferRate: number;
	/** P(first-contact resolution | effective contact), scaled by the persona's QA level. */
	fcrRate: number;
}

const HUMAN_SHAPE: CallShape = {
	agentType: 'HUMAN',
	worksSunday: false,
	callsPerDay: (weekday, rand) =>
		weekday === 6 ? (rand() < 0.5 ? 0 : 1) : 1 + Math.floor(rand() * 3),
	hourFor,
	handleTime: (rand, burnout) =>
		Math.round(
			240 + rand() * 480 + (burnout === BurnoutRiskLevel.HIGH ? 180 : 0)
		),
	holdTime: (rand) => (rand() < 0.6 ? 0 : Math.round(15 + rand() * 105)),
	wrapUp: (rand) => Math.round(30 + rand() * 120),
	transferRate: 0.08,
	fcrRate: 0.72,
};

/** AI agents work every day, all day: shorter calls, no hold, almost no wrap-up, twice the transfers. */
const AI_SHAPE: CallShape = {
	agentType: 'AI_BOT',
	worksSunday: true,
	callsPerDay: (_weekday, rand) => 3 + Math.floor(rand() * 3),
	hourFor: (_shift, rand) => 8 + Math.floor(rand() * 12),
	handleTime: (rand) => Math.round((240 + rand() * 480) * 0.6),
	holdTime: () => 0,
	wrapUp: (rand) => Math.round(rand() * 5),
	transferRate: 0.16,
	fcrRate: 0.55,
};

interface GenerateOptions {
	seed: number;
	idPrefix: string;
	personas: Persona[];
	/** Roster the personas resolve against (TEAM_AGENTS or AI_AGENTS). */
	roster: RosterAgent[];
	shape: CallShape;
	/** Number of days generated. */
	days: number;
	/** 0 = the window ends on TODAY; RECENT_DAYS = it ends the day before the recent window starts. */
	endOffsetDays: number;
	/** Added to every working day's call count, to thicken a window. */
	extraCallsPerDay: number;
}

/** Deterministic call history ending on TODAY for the given personas. */
function generateCalls({
	seed,
	idPrefix,
	personas,
	roster,
	shape,
	days,
	endOffsetDays,
	extraCallsPerDay,
}: GenerateOptions): TeamCallMetric[] {
	const rand = seeded(seed);
	/** Own stream for the operational fields, so the original draws are never shifted. */
	const extra = seeded(seed * 31 + 7);
	const out: TeamCallMetric[] = [];
	let seq = 0;

	for (const persona of personas) {
		const agent = roster.find((a) => a.id === persona.id);
		if (!agent) continue;
		const campaigns = TEAM_CAMPAIGNS.filter((c) =>
			agent.campaignIds.includes(c.id)
		);
		if (campaigns.length === 0) continue;

		const { base, slope, burnout } = persona;
		const errorsPerCall = (1 - base.qa) * 3.5;
		const burnoutPenalty =
			burnout === BurnoutRiskLevel.HIGH
				? 0.8
				: burnout === BurnoutRiskLevel.MEDIUM
					? 0.3
					: 0;
		const bizWeak = 1 - base.business;

		// Oldest day first, so the draw order matches the original generator.
		for (let age = endOffsetDays + days - 1; age >= endOffsetDays; age--) {
			const isoDay = addDays(TODAY, -age);
			if (isoDay < agent.hireDate) continue;
			const weekday = new Date(`${isoDay}T00:00:00Z`).getUTCDay();
			if (weekday === 0 && !shape.worksSunday) continue;
			if (agent.status === 'inactive' && age < 20) continue;

			// -0.5 … +0.5 over the last TREND_DAYS; older days sit at the starting level.
			const progress =
				Math.max(0, TREND_DAYS - 1 - age) / (TREND_DAYS - 1) - 0.5;
			const callsToday = shape.callsPerDay(weekday, rand) + extraCallsPerDay;

			for (let c = 0; c < callsToday; c++) {
				const campaign = pick(campaigns, rand);
				const hour = shape.hourFor(agent.shift, rand);
				const minute = Math.floor(rand() * 60);
				const direction: CallDirection =
					campaign.campaignType === 'BLENDED'
						? rand() < 0.5
							? 'INBOUND'
							: 'OUTBOUND'
						: campaign.campaignType;

				// --- QA: error counts (what the QA tab sums) + a 0-100 score ---
				const total = poisson(errorsPerCall, rand);
				let ecn = 0,
					enc = 0,
					ecc = 0,
					ecuf = 0;
				for (let i = 0; i < total; i++) {
					const r = rand();
					if (r < 0.1) ecn += 1;
					else if (r < 0.65) enc += 1;
					else if (r < 0.8) ecc += 1;
					else ecuf += 1;
				}
				const qaScore = clamp(
					Math.round(
						50 +
							base.qa * 48 +
							slope * 12 * progress +
							(rand() - 0.5) * 8 -
							(ecn + ecc + ecuf) * 6 -
							enc * 2
					),
					35,
					100
				);
				const autoFail = ecc + ecuf >= 2 || ecn >= 2;

				// --- Compliance: area score ± 6, items = area ± 5 ---
				const compBase =
					55 + base.compliance * 45 + slope * 0.6 * 12 * progress;
				const area = () =>
					clamp(Math.round(compBase + (rand() - 0.5) * 12), 40, 100);
				const item = (score: number) =>
					clamp(Math.round(score + (rand() - 0.5) * 10), 40, 100);
				const security = area();
				const regulatory = area();
				const legal = area();

				// --- Sentiment ---
				const drift = slope * 1.2 * progress;
				const customerSentiment = round1(
					clamp(1 + base.sentiment * 4 + drift + (rand() - 0.5), 1, 5)
				);
				const agentSentiment = round1(
					clamp(
						1 +
							base.sentiment * 4 +
							0.3 +
							drift +
							(rand() - 0.5) * 0.6 -
							burnoutPenalty,
						1,
						5
					)
				);

				// --- Business ---
				const signals = {
					earlyObjection: rand() < 0.1 + 0.2 * bizWeak,
					unhandledObjection: rand() < 0.08 + 0.27 * bizWeak,
					competitorPlusCost: rand() < 0.06 + 0.19 * bizWeak,
					mistargetedOffer: rand() < 0.05 + 0.15 * bizWeak,
				};
				const offered = rand() < (direction === 'OUTBOUND' ? 0.6 : 0.55);
				const offeredProduct = offered ? pick(PRODUCTS, rand) : null;
				const converted = offered && rand() < 0.1 + base.business * 0.35;
				const nonConversionReason =
					offered && !converted ? pickWeighted(REASONS, rand) : null;
				const competitorMentioned =
					signals.competitorPlusCost || rand() < 0.14
						? pick(COMPETITORS, rand)
						: null;
				const sentimentRecovered = customerSentiment >= 3.5 && rand() < 0.18;
				const agentEmotion = emotionFor(agentSentiment, rand);
				const contactOutcome: ContactOutcome =
					rand() < (direction === 'INBOUND' ? 0.82 : 0.64)
						? 'EFFECTIVE'
						: 'NON_EFFECTIVE';

				seq += 1;
				out.push({
					id: `${idPrefix}-${String(seq).padStart(5, '0')}`,
					date: `${isoDay}T${pad(hour)}:${pad(minute)}:00Z`,
					qaScores: { ecn, enc, ecc, ecuf },
					agentSentiment,
					customerSentiment,
					predominantEmotion: emotionFor(customerSentiment, rand),
					complianceByArea: {
						security: {
							score: security,
							items: {
								dataProtection: item(security),
								disclosureCompliance: item(security),
							},
						},
						regulatory: {
							score: regulatory,
							items: {
								cobranzaRegulada: item(regulatory),
								transparenciaConsentimiento: item(regulatory),
							},
						},
						legal: {
							score: legal,
							items: {
								amenazasTradicionales: item(legal),
								rrss: item(legal),
								superintendenciaBancos: item(legal),
								noLlamarList: item(legal),
							},
						},
					},
					campaignId: campaign.id,
					campaignName: campaign.name,
					agentId: agent.id,
					agentName: agent.name,
					agentStatus: agent.status,
					supervisorId: agent.supervisorId,
					supervisorName: agent.supervisorName,
					team: agent.team,
					lineOfBusiness: campaign.lineOfBusiness,
					campaignType: campaign.campaignType,
					direction,
					shift: agent.shift,
					tenureBand: tenureBandFor(agent.hireDate, isoDay),
					hour,
					weekday,
					timeSlot: timeSlotFor(hour),
					handleTimeSeconds: shape.handleTime(rand, burnout),
					afterHours: hour >= 18,
					qaScore,
					autoFail,
					signals,
					offeredProduct,
					converted,
					nonConversionReason,
					competitorMentioned,
					sentimentRecovered,
					agentEmotion,
					contactOutcome,
					agentType: shape.agentType,
					holdTimeSeconds: shape.holdTime(extra),
					wrapUpSeconds: shape.wrapUp(extra),
					transferred: extra() < shape.transferRate,
					firstContactResolved:
						contactOutcome === 'EFFECTIVE' &&
						extra() < shape.fcrRate * (0.7 + 0.3 * base.qa),
					// Placeholder: the voice pass below fills the human agents' calls.
					voice: TYPICAL_VOICE,
				});
			}
		}
	}
	return out;
}

/** Baseline history of the recent window: every persona over the last 180 days. */
export const buildTeamCalls = (): TeamCallMetric[] =>
	generateCalls({
		seed: 11,
		idPrefix: 'TCALL',
		personas: PERSONAS,
		roster: TEAM_AGENTS,
		shape: HUMAN_SHAPE,
		days: RECENT_DAYS,
		endOffsetDays: 0,
		extraCallsPerDay: 0,
	}).sort((a, b) => a.date.localeCompare(b.date));

/** The history before the recent window, so 12-month periods have data. */
const buildOlderTeamCalls = (): TeamCallMetric[] =>
	generateCalls({
		seed: 17,
		idPrefix: 'TOCALL',
		personas: PERSONAS,
		roster: TEAM_AGENTS,
		shape: HUMAN_SHAPE,
		days: OLDER_DAYS,
		endOffsetDays: RECENT_DAYS,
		extraCallsPerDay: 0,
	}).sort((a, b) => a.date.localeCompare(b.date));

/**
 * Rough patches for selected agents over the last 45 days: the same generator
 * with a weaker (or different) base on one or two dimensions. They thicken the
 * history and spread every metric across agents, so Team Analytics filters and
 * Finder queries (e.g. compliance 70-85%, sentiment below 3, QA below 75%)
 * always find agents. The agent persona (AGT-004) and the top performers are
 * left alone so their dashboards keep their story, and sentiment/QA patches
 * only go to agents already at burnout risk so no one changes risk level.
 */
const ROUGH_PATCHES: Record<string, Partial<Persona['base']>> = {
	'AGT-001': { business: 0.22 },
	'AGT-002': { compliance: 0.45 },
	'AGT-003': { qa: 0.5 },
	'AGT-005': { compliance: 0.45 },
	'AGT-006': { qa: 0.3, compliance: 0.4 },
	'AGT-007': { compliance: 0.4, sentiment: 0.5 },
	'AGT-008': { business: 0.2 },
	'AGT-009': { qa: 0.4 },
	'AGT-010': { compliance: 0.4 },
	'AGT-012': { sentiment: 0.25, business: 0.3 },
	'AGT-013': { qa: 0.5, compliance: 0.55 },
	'AGT-016': { compliance: 0.4 },
	'AGT-017': { qa: 0.3, sentiment: 0.4 },
	'AGT-019': { business: 0.25 },
	'AGT-021': { compliance: 0.45, business: 0.35 },
};
const ROUGH_PATCH_DAYS = 45;

const buildRoughPatchCalls = (): TeamCallMetric[] =>
	generateCalls({
		seed: 29,
		idPrefix: 'TXCALL',
		personas: PERSONAS.filter((p) => p.id in ROUGH_PATCHES).map((p) => ({
			...p,
			base: { ...p.base, ...ROUGH_PATCHES[p.id] },
		})),
		roster: TEAM_AGENTS,
		shape: HUMAN_SHAPE,
		days: ROUGH_PATCH_DAYS,
		endOffsetDays: 0,
		extraCallsPerDay: 1,
	});

/**
 * The generator maps sentiment to emotion deterministically, which leaves each
 * agent's positive/negative emotion share at 0% or 100%. One call in five
 * reads a band off, so shares spread out the way real data does. The agent
 * persona keeps its emotions: its alerts point at specific calls.
 */
const blurCustomerEmotions = (calls: TeamCallMetric[], seed: number): void => {
	const rand = seeded(seed);
	for (const call of calls) {
		if (call.agentId === AGENT_PERSONA_ID || rand() >= 0.2) continue;
		const shifted = call.customerSentiment + (rand() < 0.5 ? -0.9 : 0.9);
		call.predominantEmotion = emotionFor(clamp(shifted, 1, 5), rand);
	}
};

/**
 * Agents mostly work their own shift, which left whole weekday x time-slot cells with calls
 * from agents of a single profile (a slot could read 0% negative on every day). One call in
 * three is moved to another working hour of the same day, as cover and overtime do, so every
 * slot has calls from several agents. After-hours calls and the agent persona are left alone.
 */
const spreadWorkingHours = (calls: TeamCallMetric[], seed: number): void => {
	const rand = seeded(seed);
	for (const call of calls) {
		if (call.agentId === AGENT_PERSONA_ID || call.afterHours) continue;
		if (rand() >= 0.34) continue;
		const hour = 8 + Math.floor(rand() * 10); // 8-17
		call.hour = hour;
		call.timeSlot = timeSlotFor(hour);
		call.date = `${call.date.slice(0, 11)}${pad(hour)}${call.date.slice(13)}`;
	}
	calls.sort((a, b) => a.date.localeCompare(b.date));
};

const buildAllCalls = (): TeamCallMetric[] => {
	// The recent window is blurred on its own (seed 53) so its numbers never change.
	const recent = [...buildTeamCalls(), ...buildRoughPatchCalls()].sort((a, b) =>
		a.date.localeCompare(b.date)
	);
	blurCustomerEmotions(recent, 53);
	spreadWorkingHours(recent, 61);
	const older = buildOlderTeamCalls();
	blurCustomerEmotions(older, 59);
	spreadWorkingHours(older, 67);
	const all = [...older, ...recent];
	applyVoiceSignals(all);
	return all;
};

export const TEAM_CALLS: TeamCallMetric[] = buildAllCalls();

/**
 * Mock incident: John Smith's (AGT-004) 3 most recent calls get a real regulatory
 * disclosure compliance dip. Matches the "Regulatory disclosure compliance is at
 * 86%" inbox alert (`ntf-a13` in `qa/inbox/mockData.ts`) and gives the dashboard's
 * Compliance drill-down / My Calls "compliance-regulatory" issue filter and the
 * inbox alert's deep link something real to show — without this, the generator's
 * seeded RNG never dips this agent's regulatory score below the compliance target.
 */
const REGULATORY_DIP_SCORES = [68, 74, 82];
TEAM_CALLS.filter((c) => c.agentId === AGENT_PERSONA_ID)
	.slice(-REGULATORY_DIP_SCORES.length)
	.forEach((call, i) => {
		const score = REGULATORY_DIP_SCORES[i];
		call.complianceByArea.regulatory.score = score;
		call.complianceByArea.regulatory.items.cobranzaRegulada = score;
		call.complianceByArea.regulatory.items.transparenciaConsentimiento =
			Math.max(40, score - 5);
	});

/**
 * Mock incident: 2 more of John Smith's recent calls (distinct from the
 * compliance dip above, so no single call carries every possible issue) get a
 * real negative sentiment/emotion dip on both sides. Gives the dashboard's
 * Sentiment & Emotion drill-down (agent vs customer negative-emotion rows) and
 * the "Customer sentiment is trending down" inbox alert (`ntf-a02`) real calls
 * to point to — the seeded RNG's recent trend for this agent is improving, so
 * neither side ever dips within the dashboard's 30-day window otherwise.
 */
const SENTIMENT_DIP: {
	customerSentiment: number;
	predominantEmotion: CallEmotion;
	agentSentiment: number;
	agentEmotion: CallEmotion;
}[] = [
	{
		customerSentiment: 2.1,
		predominantEmotion: 'Anger',
		agentSentiment: 2.4,
		agentEmotion: 'Fear',
	},
	{
		customerSentiment: 1.9,
		predominantEmotion: 'Sadness',
		agentSentiment: 2.2,
		agentEmotion: 'Sadness',
	},
];
TEAM_CALLS.filter((c) => c.agentId === AGENT_PERSONA_ID)
	.slice(
		-(REGULATORY_DIP_SCORES.length + SENTIMENT_DIP.length),
		-REGULATORY_DIP_SCORES.length
	)
	.forEach((call, i) => {
		const dip = SENTIMENT_DIP[i];
		call.customerSentiment = dip.customerSentiment;
		call.predominantEmotion = dip.predominantEmotion;
		call.agentSentiment = dip.agentSentiment;
		call.agentEmotion = dip.agentEmotion;
	});

// ---------- AI agents (analytics only) ----------
const aiPersona = (
	n: number,
	name: string,
	supervisorId: string,
	campaignIds: string[],
	hireDate: string,
	shift: Shift,
	base: Persona['base']
): Persona => ({
	id: `AIB-${String(n).padStart(3, '0')}`,
	name,
	supervisorId,
	campaignIds,
	hireDate,
	trackedSince: hireDate,
	shift,
	base,
	slope: 0,
	burnout: BurnoutRiskLevel.LOW,
	skills: ['Voice bot'],
});

/** Two AI agents per team, deployed in waves so the tenure bands differ. */
export const AI_PERSONAS: Persona[] = [
	aiPersona(1, 'Aria (AI)', 'SUP-001', ['camp-001'], '2025-11-03', 'morning', {
		qa: 0.86,
		sentiment: 0.66,
		compliance: 0.96,
		business: 0.44,
	}),
	aiPersona(
		2,
		'Nova (AI)',
		'SUP-001',
		['camp-004'],
		'2025-11-03',
		'afternoon',
		{ qa: 0.84, sentiment: 0.63, compliance: 0.95, business: 0.47 }
	),
	aiPersona(3, 'Echo (AI)', 'SUP-002', ['camp-002'], '2026-02-16', 'night', {
		qa: 0.88,
		sentiment: 0.68,
		compliance: 0.97,
		business: 0.42,
	}),
	aiPersona(
		4,
		'Iris (AI)',
		'SUP-002',
		['camp-001', 'camp-003'],
		'2026-02-16',
		'morning',
		{ qa: 0.83, sentiment: 0.62, compliance: 0.94, business: 0.46 }
	),
	aiPersona(5, 'Sol (AI)', 'SUP-003', ['camp-003'], '2026-05-04', 'afternoon', {
		qa: 0.87,
		sentiment: 0.67,
		compliance: 0.96,
		business: 0.43,
	}),
	aiPersona(
		6,
		'Luna (AI)',
		'SUP-003',
		['camp-004', 'camp-002'],
		'2026-05-04',
		'night',
		{ qa: 0.85, sentiment: 0.64, compliance: 0.95, business: 0.45 }
	),
];

export const AI_AGENTS: RosterAgent[] = AI_PERSONAS.map((p) => {
	const sup: RosterSupervisor =
		TEAM_SUPERVISORS.find((s) => s.id === p.supervisorId) ??
		UNASSIGNED_SUPERVISOR;
	return {
		id: p.id,
		name: p.name,
		email: `${p.id.toLowerCase()}@newtech.ai`,
		supervisorId: sup.id,
		supervisorName: sup.name,
		team: sup.team,
		campaignIds: p.campaignIds,
		status: 'active',
		shift: p.shift ?? 'morning',
		hireDate: p.hireDate,
		trackedSince: p.trackedSince,
		skills: p.skills,
		avatarColor: 'gray',
	};
});
export const AI_AGENT_IDS: ReadonlySet<string> = new Set(
	AI_AGENTS.map((a) => a.id)
);
export const isAiAgentId = (id: string): boolean => AI_AGENT_IDS.has(id);

export const AI_TEAM_CALLS: TeamCallMetric[] = generateCalls({
	seed: 71,
	idPrefix: 'AICALL',
	personas: AI_PERSONAS,
	roster: AI_AGENTS,
	shape: AI_SHAPE,
	days: HISTORY_DAYS,
	endOffsetDays: 0,
	extraCallsPerDay: 0,
}).sort((a, b) => a.date.localeCompare(b.date));

/**
 * Human + AI calls, date-ascending. Only Team Analytics reads this; every other
 * consumer keeps the human-only TEAM_CALLS.
 */
export const ANALYTICS_CALLS: TeamCallMetric[] = [
	...TEAM_CALLS,
	...AI_TEAM_CALLS,
].sort((a, b) => a.date.localeCompare(b.date));

// ---------- Disputes (derived from the human calls) ----------
const DISPUTE_TYPE_WEIGHTS: { key: DisputeEvaluationType; weight: number }[] = [
	{ key: 'qa', weight: 45 },
	{ key: 'compliance', weight: 20 },
	{ key: 'sentiment-emotion', weight: 25 },
	{ key: 'business-insights', weight: 10 },
];
const DISPUTE_STATUS_WEIGHTS: { key: DisputeStatus; weight: number }[] = [
	{ key: 'accepted', weight: 35 },
	{ key: 'partially-accepted', weight: 20 },
	{ key: 'rejected', weight: 25 },
	{ key: 'open', weight: 20 },
];

/** About 3-4% of human calls are disputed, weighted toward weak evaluations. */
function buildDisputes(calls: TeamCallMetric[]): TeamDispute[] {
	const rand = seeded(97);
	const out: TeamDispute[] = [];
	let seq = 0;
	for (const call of calls) {
		if (call.agentType !== 'HUMAN') continue;
		const weak =
			call.qaScore < 70 ||
			call.autoFail ||
			call.complianceByArea.regulatory.score < 75 ||
			call.customerSentiment < 2.6;
		if (rand() >= (weak ? 0.12 : 0.015)) continue;

		const filedDay = addDays(
			call.date.slice(0, 10),
			1 + Math.floor(rand() * 3)
		);
		const createdAt = `${filedDay}T12:00:00Z`;
		if (createdAt > NOW_ISO) continue;

		let status = pickWeighted(DISPUTE_STATUS_WEIGHTS, rand);
		const resolvedDay = addDays(filedDay, 1 + Math.floor(rand() * 9));
		const resolvedAt = `${resolvedDay}T15:00:00Z`;
		if (status !== 'open' && resolvedAt > NOW_ISO) status = 'open';

		seq += 1;
		out.push({
			id: `TDSP-${String(seq).padStart(4, '0')}`,
			callId: call.id,
			agentId: call.agentId,
			agentName: call.agentName,
			supervisorId: call.supervisorId,
			team: call.team,
			campaignId: call.campaignId,
			evaluationType: pickWeighted(DISPUTE_TYPE_WEIGHTS, rand),
			status,
			createdAt,
			resolvedAt: status === 'open' ? null : resolvedAt,
			scoreDelta:
				status === 'accepted'
					? 4 + Math.round(rand() * 8)
					: status === 'partially-accepted'
						? 1 + Math.round(rand() * 4)
						: 0,
		});
	}
	return out;
}

export const TEAM_DISPUTES: TeamDispute[] = buildDisputes(TEAM_CALLS);
export const DISPUTE_BY_CALL_ID: ReadonlyMap<string, TeamDispute> = new Map(
	TEAM_DISPUTES.map((d) => [d.callId, d])
);

export const BURNOUT_ACTIONS_SEED: BurnoutAction[] = [
	{
		id: 'bact-003',
		agentId: 'AGT-007',
		kind: 'SCHEDULE_COACHING',
		title: 'Coaching: handling frustrated customers',
		detail:
			'30-minute 1:1 focused on de-escalation and closing negative calls.',
		createdBy: SUPERVISOR_PERSONA.name,
		createdAt: '2026-09-10T16:05:00Z',
		dueAt: '2026-09-17',
		status: 'PLANNED',
	},
	{
		id: 'bact-002',
		agentId: 'AGT-006',
		kind: 'ADJUST_WORKLOAD',
		title: 'No after-hours calls for 2 weeks',
		detail: 'Removed from the 18:00 overflow queue until 2026-09-22.',
		createdBy: SUPERVISOR_PERSONA.name,
		createdAt: '2026-09-08T09:40:00Z',
		dueAt: '2026-09-22',
		status: 'IN_PROGRESS',
	},
	{
		id: 'bact-001',
		agentId: 'AGT-006',
		kind: 'SEND_CHECK_IN',
		title: 'Quick check-in',
		detail:
			'Asked how the last two weeks felt; David mentioned back-to-back collections calls.',
		createdBy: SUPERVISOR_PERSONA.name,
		createdAt: '2026-09-04T10:15:00Z',
		dueAt: null,
		status: 'DONE',
	},
];
