import { BurnoutRiskLevel } from '~/modules/qa/dashboard/types/burnoutRisk';
import {
	PERSONAS,
	TEAM_AGENTS,
	TEAM_CAMPAIGNS,
} from '~/modules/qa/team/mockData';
import {
	AGENT_PERSONA_ID,
	SUPERVISOR_PERSONA,
} from '~/modules/qa/team/constants';
import { monthsBetween } from '~/modules/qa/team/helpers';
import type { NonConversionReasonKey, Shift } from '~/modules/qa/team/types';
import { TODAY, addDays } from './constants';
import type {
	BurnoutAction,
	CallDirection,
	CallEmotion,
	ContactOutcome,
	TeamCallMetric,
	TenureBand,
	TimeSlot,
} from './types';

/** History length. The agent Analytics 6M preset needs 180 days. */
const DAYS = 180;
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

/** Deterministic 180-day call history for every PERSONAS agent (ends on TODAY). */
export function buildTeamCalls(): TeamCallMetric[] {
	const rand = seeded(11);
	const out: TeamCallMetric[] = [];
	let seq = 0;

	for (const persona of PERSONAS) {
		const agent = TEAM_AGENTS.find((a) => a.id === persona.id);
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

		for (let dayIndex = 0; dayIndex < DAYS; dayIndex++) {
			const isoDay = addDays(TODAY, dayIndex - (DAYS - 1));
			const weekday = new Date(`${isoDay}T00:00:00Z`).getUTCDay();
			if (weekday === 0) continue;
			if (agent.status === 'on-leave' && dayIndex >= DAYS - 20) continue;
			if (agent.status === 'training' && dayIndex < DAYS - 45) continue;

			const progress =
				Math.max(0, dayIndex - (DAYS - TREND_DAYS)) / (TREND_DAYS - 1) - 0.5; // -0.5 … +0.5 over the last TREND_DAYS
			const callsToday =
				weekday === 6 ? (rand() < 0.5 ? 0 : 1) : 1 + Math.floor(rand() * 3);

			for (let c = 0; c < callsToday; c++) {
				const campaign = pick(campaigns, rand);
				const hour = hourFor(agent.shift, rand);
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
					id: `TCALL-${String(seq).padStart(5, '0')}`,
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
					handleTimeSeconds: Math.round(
						240 + rand() * 480 + (burnout === BurnoutRiskLevel.HIGH ? 180 : 0)
					),
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
				});
			}
		}
	}
	return out.sort((a, b) => a.date.localeCompare(b.date));
}

export const TEAM_CALLS: TeamCallMetric[] = buildTeamCalls();

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
