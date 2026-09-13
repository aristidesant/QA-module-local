import { TEAM_AGENTS, TEAM_CAMPAIGNS } from '~/modules/qa/team/mockData';
import { EMOTION_SENTIMENT_MAP } from '~/modules/qa/emotion-sentiment/types';
import type { Emotion, SentimentCategory } from '~/modules/qa/emotion-sentiment/types';
import type { BusinessSignalType, NonConversionReasonKey } from '~/modules/qa/team/types';
import { NON_CONVERSION_REASON_LABELS } from '~/modules/qa/team/constants';
import type {
	ContactRecord, ContactWindowStat, CustomerEvent, CustomerProfile, CustomerRecord, DayPart, OfferRecord, SentimentPoint, SurveyResponse, Weekday,
} from './types';
import { COMPETITORS, DAY_PARTS, NOW_ISO, OBJECTION_PHRASES, OFFER_CATALOG, WEEKDAYS } from './constants';

function seeded(seed: number) { let s = seed; return () => { s = (s * 9301 + 49297) % 233280; return s / 233280; }; }
const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
const round1 = (v: number) => Math.round(v * 10) / 10;
const pick = <T,>(arr: T[], r: number) => arr[Math.floor(r * arr.length) % arr.length];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const shortDate = (d: Date) => `${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}`;
const categoryOf = (score: number): SentimentCategory => (score < 1.8 ? 'very-negative' : score < 2.6 ? 'negative' : score < 3.4 ? 'neutral' : score < 4.2 ? 'positive' : 'very-positive');
const EMOTIONS_BY_CATEGORY: Record<SentimentCategory, Emotion[]> = {
	'very-negative': ['RAGE', 'ANGER'], negative: ['FRUSTRATION', 'DISAPPOINTMENT', 'SADNESS', 'FEAR'], neutral: ['NEUTRAL', 'SURPRISE'],
	positive: ['RELIEF', 'SATISFACTION', 'GRATITUDE'], 'very-positive': ['JOY', 'ELATION'],
};

interface CustomerPersona {
	id: string; name: string; city: string; segment: CustomerRecord['segment']; status: CustomerRecord['status']; language: 'es' | 'en';
	channel: CustomerRecord['preferredChannel']; plan: string; value: number; since: string; tracked: string;
	receptive: number; // 0-1 probability of accepting an offer
	baseSentiment: number; // 1-5 at first contact
	slope: number; // sentiment change across history (-1..1)
	contacts: number; // number of contacts in history
	bestPart: DayPart; bestDay: Weekday; dnc?: boolean; marketing?: boolean; agentIds: string[];
}

export const CUSTOMER_PERSONAS: CustomerPersona[] = [
	{ id: 'CUST-001', name: 'Mr. Doe', city: 'Santo Domingo', segment: 'residential', status: 'active', language: 'en', channel: 'phone', plan: 'Fiber 200 Mbps', value: 29.99, since: '2024-07-15', tracked: '2025-02-03', receptive: 0.35, baseSentiment: 2.4, slope: 0.6, contacts: 9, bestPart: 'afternoon', bestDay: 'Tue', agentIds: ['AGT-001', 'AGT-004'] },
	{ id: 'CUST-002', name: 'Ana Belén Castro', city: 'Santiago', segment: 'premium', status: 'active', language: 'es', channel: 'whatsapp', plan: 'Premium Fiber 500 + TV', value: 49.99, since: '2022-03-10', tracked: '2025-01-20', receptive: 0.8, baseSentiment: 4.1, slope: 0.1, contacts: 12, bestPart: 'morning', bestDay: 'Wed', agentIds: ['AGT-001', 'AGT-002', 'AGT-015'] },
	{ id: 'CUST-003', name: 'Roberto Peña', city: 'La Romana', segment: 'residential', status: 'active', language: 'es', channel: 'phone', plan: 'Fiber 100 Mbps', value: 19.99, since: '2023-11-02', tracked: '2025-03-10', receptive: 0.15, baseSentiment: 2.9, slope: -0.7, contacts: 8, bestPart: 'evening', bestDay: 'Thu', agentIds: ['AGT-006', 'AGT-005'] },
	{ id: 'CUST-004', name: 'Comercial Nova SRL', city: 'Santo Domingo', segment: 'business', status: 'active', language: 'es', channel: 'email', plan: 'Business Fiber 1 Gbps', value: 149.0, since: '2021-06-01', tracked: '2025-01-27', receptive: 0.6, baseSentiment: 3.6, slope: 0.2, contacts: 14, bestPart: 'morning', bestDay: 'Mon', agentIds: ['AGT-002', 'AGT-008', 'AGT-020'] },
	{ id: 'CUST-005', name: 'Karla Jiménez', city: 'Puerto Plata', segment: 'residential', status: 'prospect', language: 'es', channel: 'phone', plan: '—', value: 0, since: '2026-05-04', tracked: '2026-05-04', receptive: 0.45, baseSentiment: 3.2, slope: 0.3, contacts: 4, bestPart: 'evening', bestDay: 'Sat', agentIds: ['AGT-004'] },
	{ id: 'CUST-006', name: 'Luis Alberto Mena', city: 'San Pedro', segment: 'residential', status: 'churned', language: 'es', channel: 'phone', plan: '—', value: 0, since: '2020-09-14', tracked: '2025-02-17', receptive: 0.1, baseSentiment: 2.2, slope: -0.4, contacts: 7, bestPart: 'afternoon', bestDay: 'Fri', dnc: true, agentIds: ['AGT-006', 'AGT-007'] },
	{ id: 'CUST-007', name: 'Patricia Vargas', city: 'Santo Domingo', segment: 'premium', status: 'active', language: 'en', channel: 'email', plan: 'Premium Fiber 500 + TV', value: 49.99, since: '2023-01-23', tracked: '2025-01-20', receptive: 0.7, baseSentiment: 3.9, slope: 0.4, contacts: 10, bestPart: 'afternoon', bestDay: 'Wed', agentIds: ['AGT-001', 'AGT-003'] },
	{ id: 'CUST-008', name: 'Grupo Delta', city: 'Santiago', segment: 'business', status: 'active', language: 'es', channel: 'phone', plan: 'Business Fiber 500', value: 99.0, since: '2022-10-05', tracked: '2025-02-10', receptive: 0.5, baseSentiment: 3.3, slope: -0.2, contacts: 11, bestPart: 'morning', bestDay: 'Tue', agentIds: ['AGT-010', 'AGT-011', 'AGT-002'] },
	{ id: 'CUST-009', name: 'Esteban Rojas', city: 'Higüey', segment: 'residential', status: 'active', language: 'es', channel: 'sms', plan: 'Fiber 300 Mbps', value: 34.99, since: '2024-02-19', tracked: '2025-04-07', receptive: 0.55, baseSentiment: 3.5, slope: 0.0, contacts: 6, bestPart: 'evening', bestDay: 'Mon', agentIds: ['AGT-005', 'AGT-013'] },
	{ id: 'CUST-010', name: 'Marisol Reyes', city: 'Santo Domingo', segment: 'residential', status: 'active', language: 'es', channel: 'whatsapp', plan: 'Mobile + Home bundle', value: 59.99, since: '2023-07-31', tracked: '2025-01-13', receptive: 0.85, baseSentiment: 4.3, slope: 0.1, contacts: 13, bestPart: 'afternoon', bestDay: 'Thu', agentIds: ['AGT-001', 'AGT-007', 'AGT-019'] },
	{ id: 'CUST-011', name: 'Héctor Sánchez', city: 'Moca', segment: 'residential', status: 'prospect', language: 'es', channel: 'phone', plan: '—', value: 0, since: '2026-06-22', tracked: '2026-06-22', receptive: 0.25, baseSentiment: 2.8, slope: -0.1, contacts: 3, bestPart: 'morning', bestDay: 'Fri', agentIds: ['AGT-009'] },
	{ id: 'CUST-012', name: 'Clínica San Rafael', city: 'Santo Domingo', segment: 'business', status: 'active', language: 'es', channel: 'email', plan: 'Business Fiber 1 Gbps', value: 149.0, since: '2019-04-08', tracked: '2025-01-27', receptive: 0.65, baseSentiment: 3.8, slope: 0.3, contacts: 9, bestPart: 'morning', bestDay: 'Wed', agentIds: ['AGT-002', 'AGT-016'] },
	{ id: 'CUST-013', name: 'Yolanda Peralta', city: 'Barahona', segment: 'residential', status: 'active', language: 'es', channel: 'phone', plan: 'Fiber 100 Mbps', value: 19.99, since: '2022-12-12', tracked: '2025-03-03', receptive: 0.3, baseSentiment: 2.6, slope: 0.5, contacts: 8, bestPart: 'evening', bestDay: 'Tue', agentIds: ['AGT-004', 'AGT-006'] },
	{ id: 'CUST-014', name: 'Daniel Ureña', city: 'Santiago', segment: 'residential', status: 'active', language: 'en', channel: 'phone', plan: 'Fiber 300 Mbps', value: 34.99, since: '2024-10-01', tracked: '2025-05-05', receptive: 0.4, baseSentiment: 3.0, slope: 0.2, contacts: 5, bestPart: 'afternoon', bestDay: 'Sat', agentIds: ['AGT-012', 'AGT-018'] },
	{ id: 'CUST-015', name: 'Ferretería El Sol', city: 'San Cristóbal', segment: 'business', status: 'churned', language: 'es', channel: 'phone', plan: '—', value: 0, since: '2021-02-15', tracked: '2025-02-10', receptive: 0.2, baseSentiment: 2.5, slope: -0.6, contacts: 8, bestPart: 'morning', bestDay: 'Mon', agentIds: ['AGT-010', 'AGT-017'] },
	{ id: 'CUST-016', name: 'Sofía Almonte', city: 'Santo Domingo', segment: 'premium', status: 'active', language: 'es', channel: 'whatsapp', plan: 'Premium Fiber 500 + TV', value: 49.99, since: '2023-05-29', tracked: '2025-01-13', receptive: 0.75, baseSentiment: 4.0, slope: 0.0, contacts: 11, bestPart: 'evening', bestDay: 'Wed', agentIds: ['AGT-003', 'AGT-001'] },
	{ id: 'CUST-017', name: 'Ramón Guzmán', city: 'La Vega', segment: 'residential', status: 'active', language: 'es', channel: 'phone', plan: 'Fiber 200 Mbps', value: 29.99, since: '2022-08-08', tracked: '2025-02-17', receptive: 0.2, baseSentiment: 2.3, slope: 0.1, contacts: 10, bestPart: 'afternoon', bestDay: 'Mon', agentIds: ['AGT-007', 'AGT-006', 'AGT-021'] },
	{ id: 'CUST-018', name: 'Beatriz Lora', city: 'Punta Cana', segment: 'residential', status: 'prospect', language: 'en', channel: 'email', plan: '—', value: 0, since: '2026-07-14', tracked: '2026-07-14', receptive: 0.5, baseSentiment: 3.4, slope: 0.4, contacts: 3, bestPart: 'morning', bestDay: 'Thu', agentIds: ['AGT-013'] },
	{ id: 'CUST-019', name: 'Transportes Caribe', city: 'Santo Domingo', segment: 'business', status: 'active', language: 'es', channel: 'phone', plan: 'Business Fiber 500', value: 99.0, since: '2020-11-30', tracked: '2025-01-27', receptive: 0.45, baseSentiment: 3.1, slope: -0.3, contacts: 12, bestPart: 'afternoon', bestDay: 'Tue', agentIds: ['AGT-008', 'AGT-002', 'AGT-015'] },
	{ id: 'CUST-020', name: 'Carmen Díaz', city: 'Santiago', segment: 'residential', status: 'active', language: 'es', channel: 'sms', plan: 'Fiber 100 Mbps', value: 19.99, since: '2023-09-18', tracked: '2025-03-10', receptive: 0.6, baseSentiment: 3.7, slope: 0.2, contacts: 7, bestPart: 'evening', bestDay: 'Fri', agentIds: ['AGT-005', 'AGT-011'] },
	{ id: 'CUST-021', name: 'Iván Cabrera', city: 'Bonao', segment: 'residential', status: 'active', language: 'es', channel: 'phone', plan: 'Fiber 300 Mbps', value: 34.99, since: '2024-04-22', tracked: '2025-04-07', receptive: 0.3, baseSentiment: 2.7, slope: -0.2, contacts: 6, bestPart: 'morning', bestDay: 'Sat', dnc: true, agentIds: ['AGT-006'] },
	{ id: 'CUST-022', name: 'Hotel Costa Azul', city: 'Puerto Plata', segment: 'business', status: 'active', language: 'en', channel: 'email', plan: 'Business Fiber 1 Gbps', value: 149.0, since: '2018-12-03', tracked: '2025-02-10', receptive: 0.7, baseSentiment: 3.9, slope: 0.1, contacts: 10, bestPart: 'afternoon', bestDay: 'Wed', agentIds: ['AGT-015', 'AGT-020', 'AGT-002'] },
	{ id: 'CUST-023', name: 'Gabriela Santos', city: 'Santo Domingo', segment: 'residential', status: 'active', language: 'es', channel: 'whatsapp', plan: 'Mobile + Home bundle', value: 59.99, since: '2024-01-15', tracked: '2025-01-20', receptive: 0.65, baseSentiment: 3.6, slope: 0.5, contacts: 9, bestPart: 'evening', bestDay: 'Thu', agentIds: ['AGT-003', 'AGT-004'] },
	{ id: 'CUST-024', name: 'Nicolás Brito', city: 'Santiago', segment: 'residential', status: 'active', language: 'es', channel: 'phone', plan: 'Fiber 200 Mbps', value: 29.99, since: '2021-05-17', tracked: '2025-02-03', receptive: 0.15, baseSentiment: 2.1, slope: 0.0, contacts: 9, bestPart: 'morning', bestDay: 'Tue', agentIds: ['AGT-005', 'AGT-007'] },
];

const AVATAR = ['blue', 'teal', 'grape', 'orange', 'cyan', 'indigo', 'pink', 'lime', 'violet', 'green'];

export const CUSTOMERS: CustomerRecord[] = CUSTOMER_PERSONAS.map((p, i) => ({
	id: p.id, name: p.name, phone: `+1 809 ${String(200 + i).padStart(3, '0')} ${String(1000 + i * 37).slice(-4)}`,
	email: `${p.name.toLowerCase().normalize('NFD').replace(/\p{M}/gu, '').replace(/[^a-z ]/g, '').trim().replace(/ +/g, '.')}@example.com`,
	city: p.city, segment: p.segment, status: p.status, language: p.language, preferredChannel: p.channel, currentPlan: p.plan, monthlyValue: p.value,
	customerSince: p.since, trackedSince: p.tracked, consent: { recording: true, marketing: p.marketing ?? !p.dnc }, doNotCall: p.dnc ?? false,
	tags: [p.segment === 'business' ? 'B2B' : 'B2C', p.receptive >= 0.6 ? 'Upsell candidate' : p.receptive <= 0.25 ? 'Price sensitive' : 'Needs nurturing'].concat(p.status === 'churned' ? ['Win-back'] : []),
	avatarColor: AVATAR[i % AVATAR.length],
}));

export function buildCustomerProfile(p: CustomerPersona): CustomerProfile {
	const customer = CUSTOMERS.find((c) => c.id === p.id)!;
	const rand = seeded(Number(p.id.replace(/\D/g, '')) * 6007);
	const start = new Date(p.tracked).getTime();
	const end = new Date(NOW_ISO).getTime() - 3 * 86400000;
	const contacts: ContactRecord[] = [];
	const offers: OfferRecord[] = [];
	const surveys: SurveyResponse[] = [];

	for (let i = 0; i < p.contacts; i++) {
		const t = start + ((end - start) * (i + rand() * 0.6)) / p.contacts;
		const d = new Date(t);
		const preferred = rand() < 0.55; // most contacts hit the customer's good window
		const weekday = preferred ? p.bestDay : pick(WEEKDAYS, rand());
		const dayPart = preferred ? p.bestPart : pick(DAY_PARTS, rand());
		const agentId = pick(p.agentIds, rand());
		const agent = TEAM_AGENTS.find((a) => a.id === agentId)!;
		const campaign = TEAM_CAMPAIGNS.find((c) => c.id === agent.campaignIds[0])!;
		const answered = preferred ? rand() < 0.85 : rand() < 0.55;
		const outcome: ContactRecord['outcome'] = answered ? 'answered' : pick(['no-answer', 'voicemail', 'busy', 'callback'] as const, rand());
		const progress = p.contacts <= 1 ? 1 : i / (p.contacts - 1);
		const custSent = answered ? round1(clamp(p.baseSentiment + p.slope * 1.6 * progress + (rand() - 0.5) * 0.8 + (preferred ? 0.2 : -0.2), 1, 5)) : undefined;
		const category = custSent !== undefined ? categoryOf(custSent) : undefined;
		const emotion = category ? pick(EMOTIONS_BY_CATEGORY[category], rand()) : undefined;
		const id = `ct-${p.id}-${i}`;
		const signals: BusinessSignalType[] = [];
		let offerId: string | undefined;
		if (answered && rand() < 0.7) {
			const off = pick(OFFER_CATALOG, rand());
			const accepted = rand() < p.receptive * (preferred ? 1.25 : 0.8);
			const deferred = !accepted && rand() < 0.2;
			const result: OfferRecord['result'] = accepted ? 'accepted' : deferred ? 'deferred' : 'rejected';
			const reason = result === 'rejected' ? pick(['priceTooHigh', 'priceTooHigh', 'noNeed', 'thirdPartyDecision', 'distrustQuality', 'installationRequirements', 'other'] as NonConversionReasonKey[], rand()) : undefined;
			const competitor = result !== 'accepted' && rand() < 0.35 ? pick(COMPETITORS, rand()) : undefined;
			offerId = `of-${p.id}-${i}`;
			offers.push({ id: offerId, contactId: id, date: d.toISOString(), offer: off.name, monthlyPrice: off.price, result, nonConversionReason: reason, competitorMentioned: competitor, agentName: agent.name, note: result === 'deferred' ? 'Asked to be called back after the 15th' : undefined });
			if (result !== 'accepted') { signals.push(rand() < 0.5 ? 'EARLY_OBJECTION' : 'UNHANDLED_OBJECTION'); if (competitor) signals.push('COMPETITOR_PLUS_COST'); if (rand() < 0.2) signals.push('MISTARGETED_OFFER'); }
			if (result === 'deferred' || rand() < 0.25) signals.push('BEST_TIME_FRAME');
		}
		if (answered && rand() < 0.4) {
			const nps = custSent !== undefined ? clamp(Math.round((custSent - 1) * 2.5 + (rand() - 0.5) * 2), 0, 10) : 5;
			const isNps = rand() < 0.5;
			surveys.push({ id: `sv-${p.id}-${i}`, contactId: id, date: new Date(t + 3600000).toISOString(), type: isNps ? 'NPS' : 'CSAT', score: isNps ? nps : clamp(Math.round(nps / 2), 1, 5), verbatim: nps >= 8 ? 'Quick and clear, the agent understood what I needed.' : nps >= 5 ? 'Fine, but I still do not know the price after the promo.' : 'Felt pushed to buy; I asked not to be called again this month.', agentName: agent.name });
		}
		contacts.push({
			id, callId: i === 0 && p.id === 'CUST-001' ? 'call-001' : `call-${p.id.slice(-3)}${i}`, date: d.toISOString(), weekday, dayPart, channel: rand() < 0.8 ? 'phone' : p.channel,
			direction: rand() < 0.8 ? 'outbound' : 'inbound', campaignId: campaign.id, campaignName: campaign.name, agentId, agentName: agent.name, outcome,
			durationSeconds: answered ? 90 + Math.round(rand() * 420) : 0, customerSentiment: custSent, customerCategory: category, dominantEmotion: emotion,
			agentSentiment: answered ? round1(clamp(3.6 + (rand() - 0.5) * 1.2, 1, 5)) : undefined, signals, offerId,
			summary: !answered ? 'No contact made.' : offerId ? `Presented ${offers[offers.length - 1].offer}; ${offers[offers.length - 1].result}.` : pick(['Billing question resolved.', 'Service check-in, no issues.', 'Technical issue escalated.', 'Plan details explained.'], rand()),
		});
	}
	contacts.sort((a, b) => b.date.localeCompare(a.date));
	const answered = contacts.filter((c) => c.outcome === 'answered');
	const sentimentSeries: SentimentPoint[] = [...answered].reverse().map((c) => ({ label: shortDate(new Date(c.date)), date: c.date, customer: c.customerSentiment!, agent: c.agentSentiment!, category: c.customerCategory! }));
	const avgSent = answered.length ? round1(answered.reduce((s, c) => s + c.customerSentiment!, 0) / answered.length) : 3;
	const third = Math.max(1, Math.floor(sentimentSeries.length / 3));
	const sentimentDelta = sentimentSeries.length >= 2 ? round1(sentimentSeries.slice(-third).reduce((s, x) => s + x.customer, 0) / third - sentimentSeries.slice(0, third).reduce((s, x) => s + x.customer, 0) / third) : 0;
	const accepted = offers.filter((o) => o.result === 'accepted').length;
	const rejected = offers.filter((o) => o.result === 'rejected').length;
	const acceptanceRate = offers.length ? Math.round((accepted / offers.length) * 100) : 0;
	const answerRate = contacts.length ? Math.round((answered.length / contacts.length) * 100) : 0;
	const receptivenessScore = clamp(Math.round(acceptanceRate * 0.5 + answerRate * 0.25 + ((avgSent - 1) / 4) * 100 * 0.25), 0, 100);
	const receptivenessBand = receptivenessScore >= 60 ? 'receptive' : receptivenessScore >= 35 ? 'neutral' : 'resistant';
	const churnRisk = p.status === 'churned' ? 'high' : avgSent < 2.6 || sentimentDelta < -0.5 ? 'high' : avgSent < 3.4 ? 'medium' : 'low';
	const npsList = surveys.filter((s) => s.type === 'NPS');
	const csatList = surveys.filter((s) => s.type === 'CSAT');

	const windows: ContactWindowStat[] = [];
	for (const weekday of WEEKDAYS) for (const dayPart of DAY_PARTS) {
		const cs = contacts.filter((c) => c.weekday === weekday && c.dayPart === dayPart);
		if (!cs.length) continue;
		const ans = cs.filter((c) => c.outcome === 'answered');
		const ofs = cs.map((c) => offers.find((o) => o.id === c.offerId)).filter(Boolean) as OfferRecord[];
		windows.push({ weekday, dayPart, contacts: cs.length, answered: ans.length, accepted: ofs.filter((o) => o.result === 'accepted').length, rejected: ofs.filter((o) => o.result === 'rejected').length, avgSentiment: ans.length ? round1(ans.reduce((s, c) => s + c.customerSentiment!, 0) / ans.length) : 0 });
	}
	const bestWindows = [...windows].sort((a, b) => b.accepted - a.accepted || b.answered / b.contacts - a.answered / a.contacts || b.avgSentiment - a.avgSentiment).slice(0, 3);
	const worstWindows = [...windows].sort((a, b) => b.rejected - a.rejected || (a.answered / a.contacts) - (b.answered / b.contacts)).filter((w) => w.rejected > 0 || w.answered < w.contacts).slice(0, 3);

	const share: Record<SentimentCategory, number> = { 'very-negative': 0, negative: 0, neutral: 0, positive: 0, 'very-positive': 0 };
	answered.forEach((c) => { share[c.customerCategory!] += 1; });
	(Object.keys(share) as SentimentCategory[]).forEach((k) => { share[k] = answered.length ? Math.round((share[k] / answered.length) * 100) : 0; });
	const emotionCounts = new Map<Emotion, number>();
	answered.forEach((c) => emotionCounts.set(c.dominantEmotion!, (emotionCounts.get(c.dominantEmotion!) ?? 0) + 1));
	const topEmotions = [...emotionCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5).map(([emotion, n]) => ({ emotion, share: Math.round((n / answered.length) * 100) }));
	void EMOTION_SENTIMENT_MAP;
	const byAgent = new Map<string, { n: number; sum: number }>();
	answered.forEach((c) => { const e = byAgent.get(c.agentName) ?? { n: 0, sum: 0 }; byAgent.set(c.agentName, { n: e.n + 1, sum: e.sum + c.customerSentiment! }); });
	const sentimentByAgent = [...byAgent.entries()].map(([agentName, v]) => ({ agentName, contacts: v.n, avgSentiment: round1(v.sum / v.n) })).sort((a, b) => b.contacts - a.contacts);

	const signalCounts = (['EARLY_OBJECTION', 'UNHANDLED_OBJECTION', 'COMPETITOR_PLUS_COST', 'MISTARGETED_OFFER', 'BEST_TIME_FRAME'] as BusinessSignalType[]).map((type) => ({ type, count: contacts.filter((c) => c.signals.includes(type)).length }));
	const reasonCounts = new Map<NonConversionReasonKey, number>();
	offers.forEach((o) => { if (o.nonConversionReason) reasonCounts.set(o.nonConversionReason, (reasonCounts.get(o.nonConversionReason) ?? 0) + 1); });
	const compCounts = new Map<string, number>();
	offers.forEach((o) => { if (o.competitorMentioned) compCounts.set(o.competitorMentioned, (compCounts.get(o.competitorMentioned) ?? 0) + 1); });
	const objections = OBJECTION_PHRASES.map((text, i) => ({ text, count: Math.round(rejected * [0.35, 0.2, 0.2, 0.15, 0.06, 0.04][i]) })).filter((o) => o.count > 0);

	const followUps = offers.filter((o) => o.result === 'deferred').slice(0, 1).map((o, i) => ({ id: `fu-${p.id}-${i}`, date: '2026-09-16T10:00:00Z', reason: 'Promo follow-up', assignedAgentName: o.agentName, status: 'scheduled' as const }));
	const notes = [{ id: `cn-${p.id}-1`, authorName: 'Maria García', authorRole: 'SUPERVISOR' as const, createdAt: '2026-08-20T11:30:00Z', text: p.receptive >= 0.6 ? 'Good candidate for the streaming add-on; prefers being contacted on ' + p.bestDay + ' ' + p.bestPart + '.' : 'Price sensitive — lead with the loyalty discount, avoid ' + (p.bestPart === 'morning' ? 'evenings' : 'mornings') + '.' }];

	const timeline: CustomerEvent[] = [
		...contacts.map((c) => ({ id: `ev-${c.id}`, type: 'contact' as const, date: c.date, title: `${c.direction === 'inbound' ? 'Inbound' : 'Outbound'} ${c.channel} · ${c.outcome}`, description: `${c.agentName} · ${c.campaignName} · ${c.summary}`, link: c.outcome === 'answered' ? `/qa/campaigns/1/calls/${c.callId}` : undefined })),
		...offers.map((o) => ({ id: `ev-${o.id}`, type: 'offer' as const, date: o.date, title: `Offer ${o.result}: ${o.offer}`, description: `$${o.monthlyPrice}/mo · ${o.agentName}${o.nonConversionReason ? ' · ' + NON_CONVERSION_REASON_LABELS[o.nonConversionReason] : ''}${o.competitorMentioned ? ' · vs ' + o.competitorMentioned : ''}` })),
		...surveys.map((s) => ({ id: `ev-${s.id}`, type: 'survey' as const, date: s.date, title: `${s.type} ${s.score}${s.type === 'NPS' ? '/10' : '/5'}`, description: s.verbatim ?? '' })),
		...notes.map((n) => ({ id: `ev-${n.id}`, type: 'note' as const, date: n.createdAt, title: `Note by ${n.authorName}`, description: n.text })),
		...followUps.map((f) => ({ id: `ev-${f.id}`, type: 'followUp' as const, date: f.date, title: `Follow-up scheduled: ${f.reason}`, description: `${f.assignedAgentName}` })),
		...(customer.doNotCall ? [{ id: `ev-dnc-${p.id}`, type: 'flag' as const, date: '2026-07-02T09:00:00Z', title: 'Flagged Do-Not-Call', description: 'Customer asked not to be contacted for offers.' }] : []),
	].sort((a, b) => b.date.localeCompare(a.date));

	const nextBestAction = customer.doNotCall ? 'Do not contact for offers; service calls only.'
		: churnRisk === 'high' ? 'Retention call by a senior agent; lead with the loyalty discount.'
		: receptivenessBand === 'receptive' ? `Upsell ${p.segment === 'business' ? 'Business Fiber 1 Gbps' : 'Premium Fiber 500 + TV'} on ${bestWindows[0]?.weekday ?? p.bestDay} ${bestWindows[0]?.dayPart ?? p.bestPart}.`
		: `Nurture: answer the price-after-promo question first; contact on ${bestWindows[0]?.weekday ?? p.bestDay} ${bestWindows[0]?.dayPart ?? p.bestPart}.`;

	return {
		customer, contacts, offers, surveys, sentimentSeries, categoryShare: share, topEmotions, sentimentByAgent, windows, bestWindows, worstWindows, signalCounts,
		nonConversionReasons: [...reasonCounts.entries()].map(([key, count]) => ({ key, count })).sort((a, b) => b.count - a.count),
		competitors: [...compCounts.entries()].map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count),
		objections, timeline, notes, followUps, nextBestAction,
		kpis: {
			totalContacts: contacts.length, answered: answered.length, answerRate, inbound: contacts.filter((c) => c.direction === 'inbound').length, outbound: contacts.filter((c) => c.direction === 'outbound').length,
			avgDurationSeconds: answered.length ? Math.round(answered.reduce((s, c) => s + c.durationSeconds, 0) / answered.length) : 0,
			firstContactAt: contacts[contacts.length - 1]?.date ?? p.tracked, lastContactAt: contacts[0]?.date ?? p.tracked, agentsInvolved: new Set(contacts.map((c) => c.agentId)).size,
			receptivenessScore, receptivenessBand, churnRisk, offersPresented: offers.length, offersAccepted: accepted, offersRejected: rejected, acceptanceRate,
			avgCustomerSentiment: avgSent, sentimentTrend: sentimentDelta > 0.3 ? 'up' : sentimentDelta < -0.3 ? 'down' : 'flat', sentimentDelta,
			npsLatest: npsList[0]?.score, csatAverage: csatList.length ? round1(csatList.reduce((s, x) => s + x.score, 0) / csatList.length) : undefined, surveysAnswered: surveys.length,
		},
	};
}

export const CUSTOMER_PROFILES: Record<string, CustomerProfile> = Object.fromEntries(CUSTOMER_PERSONAS.map((p) => [p.id, buildCustomerProfile(p)]));
