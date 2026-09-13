import type { TablerIcon } from '@tabler/icons-react';
import {
	IconAward, IconBriefcase, IconClipboardList, IconHeadset, IconHistory, IconMoodSmile,
	IconSchool, IconShieldCheck, IconTrendingUp,
} from '@tabler/icons-react';
import type { Emotion, SentimentCategory } from '~/modules/qa/emotion-sentiment/types';
import type {
	ActivityType, BusinessSignalType, ComplianceAreaKey, DimensionKey, LmsMaterial,
	NonConversionReasonKey, OperationalMetricKey, ProfilePeriod, QAErrorTypeCode,
} from './types';

export const NOW_ISO = '2026-09-12T15:00:00Z';
export const SUPERVISOR_PERSONA = { id: 'SUP-001', name: 'Maria García' };
export const QA_MANAGER_PERSONA = { id: 'QAM-001', name: 'Elena Ruiz' };

export const PROFILE_PERIODS: { value: ProfilePeriod; labelKey: string; months: number | null }[] = [
	{ value: '30d', labelKey: 'period.30d', months: 1 },
	{ value: '90d', labelKey: 'period.90d', months: 3 },
	{ value: '12m', labelKey: 'period.12m', months: 12 },
	{ value: 'all', labelKey: 'period.all', months: null },
];

export type ProfileTab = 'overview' | 'qa' | 'sentiment' | 'compliance' | 'business' | 'operations' | 'coaching' | 'achievements' | 'activity';
export const PROFILE_TABS: { value: ProfileTab; labelKey: string; icon: TablerIcon }[] = [
	{ value: 'overview', labelKey: 'tabs.overview', icon: IconTrendingUp },
	{ value: 'qa', labelKey: 'tabs.qa', icon: IconClipboardList },
	{ value: 'sentiment', labelKey: 'tabs.sentiment', icon: IconMoodSmile },
	{ value: 'compliance', labelKey: 'tabs.compliance', icon: IconShieldCheck },
	{ value: 'business', labelKey: 'tabs.business', icon: IconBriefcase },
	{ value: 'operations', labelKey: 'tabs.operations', icon: IconHeadset },
	{ value: 'coaching', labelKey: 'tabs.coaching', icon: IconSchool },
	{ value: 'achievements', labelKey: 'tabs.achievements', icon: IconAward },
	{ value: 'activity', labelKey: 'tabs.activity', icon: IconHistory },
];

export const DIMENSION_META: Record<DimensionKey, { labelKey: string; color: string; icon: TablerIcon; max: number; unit: '%' | '/5' }> = {
	qa: { labelKey: 'dimension.qa', color: 'orange', icon: IconClipboardList, max: 100, unit: '%' },
	sentiment: { labelKey: 'dimension.sentiment', color: 'violet', icon: IconMoodSmile, max: 5, unit: '/5' },
	compliance: { labelKey: 'dimension.compliance', color: 'green', icon: IconShieldCheck, max: 100, unit: '%' },
	business: { labelKey: 'dimension.business', color: 'blue', icon: IconBriefcase, max: 100, unit: '%' },
};
export const DIMENSION_ORDER: DimensionKey[] = ['qa', 'sentiment', 'compliance', 'business'];
export const OVERALL_WEIGHTS: Record<DimensionKey, number> = { qa: 40, sentiment: 20, compliance: 25, business: 15 };

export const QA_ERROR_TYPE_META: Record<QAErrorTypeCode, { label: string; shortLabel: string; color: string }> = {
	ECN: { label: 'Critical Business Error', shortLabel: 'Business Critical', color: 'red' },
	ENC: { label: 'Non-Critical Error', shortLabel: 'Non-Critical', color: 'orange' },
	ECC: { label: 'Critical Compliance Error', shortLabel: 'Compliance', color: 'grape' },
	ECUF: { label: 'Critical End-User Error', shortLabel: 'End-User', color: 'yellow' },
};
export const QA_ERROR_TYPE_ORDER: QAErrorTypeCode[] = ['ECN', 'ENC', 'ECC', 'ECUF'];

export const SENTIMENT_CATEGORY_ORDER: SentimentCategory[] = ['very-negative', 'negative', 'neutral', 'positive', 'very-positive'];
export const SENTIMENT_CATEGORY_META: Record<SentimentCategory, { label: string; color: string }> = {
	'very-negative': { label: 'Very Negative', color: 'red' },
	'negative': { label: 'Negative', color: 'orange' },
	'neutral': { label: 'Neutral', color: 'gray' },
	'positive': { label: 'Positive', color: 'teal' },
	'very-positive': { label: 'Very Positive', color: 'green' },
};
export const EMOTION_META: Record<Emotion, { label: string; color: string }> = {
	RAGE: { label: 'Rage', color: 'red' }, ANGER: { label: 'Anger', color: 'red' },
	FRUSTRATION: { label: 'Frustration', color: 'orange' }, DISAPPOINTMENT: { label: 'Disappointment', color: 'orange' },
	SADNESS: { label: 'Sadness', color: 'orange' }, FEAR: { label: 'Fear', color: 'yellow' },
	NEUTRAL: { label: 'Neutral', color: 'gray' }, SURPRISE: { label: 'Surprise', color: 'blue' },
	RELIEF: { label: 'Relief', color: 'teal' }, SATISFACTION: { label: 'Satisfaction', color: 'teal' },
	GRATITUDE: { label: 'Gratitude', color: 'teal' }, JOY: { label: 'Joy', color: 'green' }, ELATION: { label: 'Elation', color: 'green' },
};

export const COMPLIANCE_AREA_META: Record<ComplianceAreaKey, { label: string; color: string; items: string[] }> = {
	security: { label: 'Security', color: 'blue', items: ['Data Protection', 'Disclosure Compliance'] },
	regulatory: { label: 'Regulatory', color: 'orange', items: ['Billing Process', 'Transparency'] },
	legal: { label: 'Legal', color: 'red', items: ['Threats', 'Social Media', 'Banking Superintendence', 'Do-Not-Call'] },
};
export const COMPLIANCE_AREA_ORDER: ComplianceAreaKey[] = ['security', 'regulatory', 'legal'];

export const BUSINESS_SIGNAL_META: Record<BusinessSignalType, { label: string; tone: 'risk' | 'opportunity' }> = {
	EARLY_OBJECTION: { label: 'Early Objection', tone: 'risk' },
	UNHANDLED_OBJECTION: { label: 'Unhandled Objection', tone: 'risk' },
	COMPETITOR_PLUS_COST: { label: 'Competitor Plus Cost', tone: 'risk' },
	MISTARGETED_OFFER: { label: 'Mis-targeted Offer', tone: 'risk' },
	BEST_TIME_FRAME: { label: 'Best Time Frame', tone: 'opportunity' },
};
export const BUSINESS_SIGNAL_ORDER: BusinessSignalType[] = ['EARLY_OBJECTION', 'UNHANDLED_OBJECTION', 'COMPETITOR_PLUS_COST', 'MISTARGETED_OFFER', 'BEST_TIME_FRAME'];
export const NON_CONVERSION_REASON_LABELS: Record<NonConversionReasonKey, string> = {
	priceTooHigh: 'Price too high', noNeed: 'No need for the product', distrustQuality: 'Distrust in quality / service',
	thirdPartyDecision: 'Decision depends on a third party', installationRequirements: 'Installation requirements', other: 'Other',
};

export const OPERATIONAL_META: Record<OperationalMetricKey, { labelKey: string; unit: 'seconds' | 'percent' | 'count'; betterWhen: 'higher' | 'lower'; baseline: number }> = {
	callsHandled: { labelKey: 'ops.callsHandled', unit: 'count', betterWhen: 'higher', baseline: 540 },
	callsPerDay: { labelKey: 'ops.callsPerDay', unit: 'count', betterWhen: 'higher', baseline: 27 },
	aht: { labelKey: 'ops.aht', unit: 'seconds', betterWhen: 'lower', baseline: 372 },
	talkTime: { labelKey: 'ops.talkTime', unit: 'seconds', betterWhen: 'lower', baseline: 268 },
	holdTime: { labelKey: 'ops.holdTime', unit: 'seconds', betterWhen: 'lower', baseline: 41 },
	wrapUpTime: { labelKey: 'ops.wrapUpTime', unit: 'seconds', betterWhen: 'lower', baseline: 63 },
	fcr: { labelKey: 'ops.fcr', unit: 'percent', betterWhen: 'higher', baseline: 78 },
	transferRate: { labelKey: 'ops.transferRate', unit: 'percent', betterWhen: 'lower', baseline: 9 },
	adherence: { labelKey: 'ops.adherence', unit: 'percent', betterWhen: 'higher', baseline: 93 },
	occupancy: { labelKey: 'ops.occupancy', unit: 'percent', betterWhen: 'higher', baseline: 81 },
};
export const OPERATIONAL_ORDER: OperationalMetricKey[] = ['callsHandled', 'callsPerDay', 'aht', 'talkTime', 'holdTime', 'wrapUpTime', 'fcr', 'transferRate', 'adherence', 'occupancy'];

export const ACTIVITY_META: Record<ActivityType, { color: string; labelKey: string }> = {
	evaluation: { color: 'gray', labelKey: 'activity.types.evaluation' },
	badge: { color: 'yellow', labelKey: 'activity.types.badge' },
	milestone: { color: 'grape', labelKey: 'activity.types.milestone' },
	coaching: { color: 'blue', labelKey: 'activity.types.coaching' },
	lms: { color: 'teal', labelKey: 'activity.types.lms' },
	alert: { color: 'red', labelKey: 'activity.types.alert' },
	dispute: { color: 'orange', labelKey: 'activity.types.dispute' },
	note: { color: 'indigo', labelKey: 'activity.types.note' },
	rank: { color: 'green', labelKey: 'activity.types.rank' },
};

export const LMS_CATALOG: LmsMaterial[] = [
	{ id: 'lms-001', title: 'Objection Handling Fundamentals', type: 'Course', durationMin: 45, dimension: 'business' },
	{ id: 'lms-002', title: 'Active Listening & Empathy', type: 'Video', durationMin: 20, dimension: 'sentiment' },
	{ id: 'lms-003', title: 'Regulatory Disclosures 2026', type: 'PDF', durationMin: 15, dimension: 'compliance' },
	{ id: 'lms-004', title: 'Closing the Call: Recap & Next Steps', type: 'Article', durationMin: 10, dimension: 'qa' },
	{ id: 'lms-005', title: 'Handling Competitor Comparisons', type: 'Course', durationMin: 35, dimension: 'business' },
	{ id: 'lms-006', title: 'De-escalation Techniques', type: 'Video', durationMin: 25, dimension: 'sentiment' },
	{ id: 'lms-007', title: 'Data Protection on Calls', type: 'Course', durationMin: 30, dimension: 'compliance' },
	{ id: 'lms-008', title: 'Needs Assessment Questions', type: 'Article', durationMin: 12, dimension: 'qa' },
];

export const COACHING_TOPICS = [
	'Objection handling', 'Empathy & tone', 'Mandatory disclosures', 'Call closing', 'Needs assessment',
	'Competitor positioning', 'Handling frustrated customers', 'Auto-fail prevention',
];

export const SCORE_COLOR_STEPS: [number, string][] = [[90, 'green'], [80, 'lime'], [70, 'yellow'], [60, 'orange'], [0, 'red']];
