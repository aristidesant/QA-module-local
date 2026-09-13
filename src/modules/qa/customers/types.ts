import type { Emotion, SentimentCategory } from '~/modules/qa/emotion-sentiment/types';
import type { BusinessSignalType, NonConversionReasonKey, Trend } from '~/modules/qa/team/types';

export type CustomerSegment = 'residential' | 'business' | 'premium';
export type CustomerStatus = 'active' | 'prospect' | 'churned';
export type ContactChannel = 'phone' | 'whatsapp' | 'email' | 'sms';
export type DayPart = 'morning' | 'afternoon' | 'evening';
export type Weekday = 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat';
export type ChurnRisk = 'low' | 'medium' | 'high';
export type ReceptivenessBand = 'receptive' | 'neutral' | 'resistant';
export type ContactOutcome = 'answered' | 'no-answer' | 'voicemail' | 'busy' | 'callback';
export type OfferResult = 'accepted' | 'rejected' | 'deferred';

export interface CustomerRecord {
	id: string; // CUST-001
	name: string;
	phone: string;
	email: string;
	city: string;
	segment: CustomerSegment;
	status: CustomerStatus;
	language: 'es' | 'en';
	preferredChannel: ContactChannel;
	currentPlan: string;
	monthlyValue: number; // USD
	customerSince: string; // ISO date
	trackedSince: string; // ISO date — first contact through the platform
	consent: { recording: boolean; marketing: boolean };
	doNotCall: boolean;
	tags: string[];
	avatarColor: string;
}

export interface OfferRecord {
	id: string;
	contactId: string;
	date: string;
	offer: string;
	monthlyPrice: number;
	result: OfferResult;
	nonConversionReason?: NonConversionReasonKey;
	competitorMentioned?: string;
	agentName: string;
	note?: string;
}

export interface ContactRecord {
	id: string;
	callId: string; // links to /qa/campaigns/1/calls/:callId — first contact uses 'call-001'
	date: string; // ISO datetime
	weekday: Weekday;
	dayPart: DayPart;
	channel: ContactChannel;
	direction: 'inbound' | 'outbound';
	campaignId: string;
	campaignName: string;
	agentId: string;
	agentName: string;
	outcome: ContactOutcome;
	durationSeconds: number; // 0 when not answered
	customerSentiment?: number; // 1-5 when answered
	customerCategory?: SentimentCategory;
	dominantEmotion?: Emotion;
	agentSentiment?: number;
	signals: BusinessSignalType[];
	offerId?: string;
	summary: string;
}

export interface SurveyResponse {
	id: string;
	contactId: string;
	date: string;
	type: 'NPS' | 'CSAT';
	score: number; // NPS 0-10, CSAT 1-5
	verbatim?: string;
	agentName: string;
}

export interface ContactWindowStat {
	weekday: Weekday;
	dayPart: DayPart;
	contacts: number;
	answered: number;
	accepted: number;
	rejected: number;
	avgSentiment: number; // 1-5 over answered
}

export interface CustomerKpis {
	totalContacts: number;
	answered: number;
	answerRate: number; // %
	inbound: number;
	outbound: number;
	avgDurationSeconds: number;
	firstContactAt: string;
	lastContactAt: string;
	agentsInvolved: number;
	receptivenessScore: number; // 0-100
	receptivenessBand: ReceptivenessBand;
	churnRisk: ChurnRisk;
	offersPresented: number;
	offersAccepted: number;
	offersRejected: number;
	acceptanceRate: number; // %
	avgCustomerSentiment: number; // 1-5
	sentimentTrend: Trend;
	sentimentDelta: number;
	npsLatest?: number;
	csatAverage?: number;
	surveysAnswered: number;
}

export interface SentimentPoint { label: string; date: string; customer: number; agent: number; category: SentimentCategory }

export type CustomerEventType = 'contact' | 'offer' | 'survey' | 'note' | 'followUp' | 'flag';
export interface CustomerEvent { id: string; type: CustomerEventType; date: string; title: string; description: string; link?: string }

export interface CustomerNote { id: string; authorName: string; authorRole: 'SUPERVISOR' | 'QA_MANAGER'; createdAt: string; text: string }
export interface FollowUp { id: string; date: string; reason: string; assignedAgentName: string; status: 'scheduled' | 'done' }

export interface CustomerProfile {
	customer: CustomerRecord;
	kpis: CustomerKpis;
	contacts: ContactRecord[]; // newest first
	offers: OfferRecord[];
	surveys: SurveyResponse[];
	sentimentSeries: SentimentPoint[]; // one per answered contact, oldest first
	categoryShare: Record<SentimentCategory, number>;
	topEmotions: { emotion: Emotion; share: number }[];
	sentimentByAgent: { agentName: string; contacts: number; avgSentiment: number }[];
	windows: ContactWindowStat[];
	bestWindows: ContactWindowStat[]; // top 3 by acceptance then answer rate
	worstWindows: ContactWindowStat[]; // top 3 by rejections
	signalCounts: { type: BusinessSignalType; count: number }[];
	nonConversionReasons: { key: NonConversionReasonKey; count: number }[];
	competitors: { name: string; count: number }[];
	objections: { text: string; count: number }[];
	timeline: CustomerEvent[];
	notes: CustomerNote[];
	followUps: FollowUp[];
	nextBestAction: string;
}

export interface CustomerTableRow {
	id: string;
	name: string;
	segment: CustomerSegment;
	status: CustomerStatus;
	doNotCall: boolean;
	contacts: number;
	lastContactAt: string;
	receptivenessScore: number;
	receptivenessBand: ReceptivenessBand;
	churnRisk: ChurnRisk;
	avgSentiment: number;
	sentimentTrend: Trend;
	acceptanceRate: number;
	npsLatest?: number;
	lastAgentName: string;
	bestWindow: string; // 'Tue afternoon'
	teamIds: string[]; // supervisor ids of agents who contacted them (visibility filter)
}

export interface CustomerFilters {
	search: string;
	segment: CustomerSegment | 'all';
	status: CustomerStatus | 'all';
	receptiveness: ReceptivenessBand | 'all';
	churnRisk: ChurnRisk | 'all';
	agentId: string | 'all';
	dncOnly: boolean;
}
