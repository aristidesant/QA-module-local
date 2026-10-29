import {
	IconChartBar,
	IconChartLine,
	IconClipboardList,
	IconFlame,
	IconFolders,
	IconLayoutDashboard,
	IconMessageCircleStar,
	IconMoodSmile,
	IconShieldCheck,
	IconSpeakerphone,
	IconTable,
	IconTargetArrow,
	IconTrendingUp,
	IconTrophy,
	IconUsers,
	type Icon,
} from '@tabler/icons-react';
import type {
	ChartableSectionKey,
	ReportDraft,
	ReportFormat,
	ReportFrequency,
	ReportSectionKey,
	ReportSectionView,
	SubsectionedSectionKey,
} from '~/models/qa/reportBuilder';
import type { SegmentMetricId } from '~/modules/qa/analytics/types';
import { TODAY, addDays } from '~/modules/qa/analytics/constants';
import {
	QA_MANAGER_PERSONA,
	SUPERVISOR_PERSONA,
} from '~/modules/qa/team/constants';
import type { TeamRole } from '~/modules/qa/team/types';

/** Render order of the section picker; a definition keeps its own order. */
export const SECTION_ORDER: ReportSectionKey[] = [
	'overview',
	'qa',
	'compliance',
	'sentiment',
	'business',
	'surveys',
	'campaigns',
	'agents',
	'coaching',
	'disputes',
	'burnout',
	'rankings',
];

/** Client-facing reports may only contain these — the rest is internal. */
export const CLIENT_SECTIONS: ReportSectionKey[] = [
	'overview',
	'qa',
	'compliance',
	'sentiment',
	'business',
	'surveys',
	'campaigns',
];

/** A named slice of a section: the metrics of its table and, first, the one its chart plots. */
export interface ReportSubsection {
	key: string;
	metricIds: SegmentMetricId[];
}

const AREAS_AT_A_GLANCE: ReportSubsection[] = [
	{ key: 'quality', metricIds: ['QA_OVERALL_SCORE'] },
	{ key: 'compliance', metricIds: ['COMPLIANCE_OVERALL_SCORE'] },
	{ key: 'sentiment', metricIds: ['CUSTOMER_SENTIMENT_SCORE'] },
	{ key: 'business', metricIds: ['BI_NON_CONVERSION_RATE'] },
];

/** Subsections per section, in document order. Labels: `sections.subsections.<section>.<key>` in qa.reports. */
export const SUBSECTIONS: Record<SubsectionedSectionKey, ReportSubsection[]> = {
	qa: [
		{ key: 'overall', metricIds: ['QA_OVERALL_SCORE'] },
		{ key: 'ecn', metricIds: ['QA_ECN_COUNT'] },
		{ key: 'enc', metricIds: ['QA_ENC_COUNT'] },
		{ key: 'ecc', metricIds: ['QA_ECC_COUNT'] },
		{ key: 'ecuf', metricIds: ['QA_ECUF_COUNT'] },
		{ key: 'autoFail', metricIds: ['QA_AUTO_FAIL_COUNT'] },
	],
	compliance: [
		{ key: 'overall', metricIds: ['COMPLIANCE_OVERALL_SCORE'] },
		{ key: 'security', metricIds: ['COMPLIANCE_SECURITY_SCORE'] },
		{ key: 'regulatory', metricIds: ['COMPLIANCE_REGULATORY_SCORE'] },
		{ key: 'legal', metricIds: ['COMPLIANCE_LEGAL_SCORE'] },
		{ key: 'violations', metricIds: ['COMPLIANCE_VIOLATION_COUNT'] },
	],
	sentiment: [
		{ key: 'customerSentiment', metricIds: ['CUSTOMER_SENTIMENT_SCORE'] },
		{ key: 'agentSentiment', metricIds: ['AGENT_SENTIMENT_SCORE'] },
		{
			key: 'customerEmotions',
			metricIds: ['POSITIVE_EMOTION_CALL_SHARE', 'NEGATIVE_EMOTION_CALL_SHARE'],
		},
		{
			key: 'agentEmotions',
			metricIds: [
				'AGENT_POSITIVE_EMOTION_CALL_SHARE',
				'AGENT_NEGATIVE_EMOTION_CALL_SHARE',
			],
		},
		{
			key: 'recovery',
			metricIds: ['SENTIMENT_RECOVERY_RATE', 'SENTIMENT_RECOVERY_COUNT'],
		},
		{
			key: 'drops',
			metricIds: ['SENTIMENT_DROP_CALL_SHARE', 'SENTIMENT_DROP_CALL_COUNT'],
		},
	],
	business: [
		{
			key: 'conversion',
			metricIds: ['BI_CONVERSION_RATE', 'BI_NON_CONVERSION_RATE'],
		},
		{
			key: 'objections',
			metricIds: ['BI_EARLY_OBJECTION_RATE', 'BI_UNHANDLED_OBJECTION_RATE'],
		},
		{ key: 'competitorCost', metricIds: ['BI_COMPETITOR_PLUS_COST_RATE'] },
		{ key: 'mistargetedOffer', metricIds: ['BI_MISTARGETED_OFFER_RATE'] },
	],
	surveys: [
		{ key: 'nps', metricIds: ['SURVEY_NPS'] },
		{ key: 'csat', metricIds: ['SURVEY_CSAT_AVG'] },
		{
			key: 'responseRate',
			metricIds: ['SURVEY_RESPONSE_RATE', 'SURVEY_RESPONSE_COUNT'],
		},
		{ key: 'detractors', metricIds: ['SURVEY_DETRACTOR_SHARE'] },
	],
	campaigns: AREAS_AT_A_GLANCE,
	agents: AREAS_AT_A_GLANCE,
};

export const SECTION_ICON: Record<ReportSectionKey, Icon> = {
	overview: IconLayoutDashboard,
	qa: IconClipboardList,
	compliance: IconShieldCheck,
	sentiment: IconMoodSmile,
	business: IconTrendingUp,
	surveys: IconMessageCircleStar,
	campaigns: IconSpeakerphone,
	agents: IconUsers,
	coaching: IconTargetArrow,
	disputes: IconFolders,
	burnout: IconFlame,
	rankings: IconTrophy,
};

/** Sections with a view selector, in picker order. */
export const CHARTABLE_SECTIONS: ChartableSectionKey[] = [
	'overview',
	'qa',
	'compliance',
	'sentiment',
	'business',
	'surveys',
	'campaigns',
	'agents',
];

export const isChartableSection = (
	key: ReportSectionKey
): key is ChartableSectionKey =>
	(CHARTABLE_SECTIONS as ReportSectionKey[]).includes(key);

export const isSubsectionedSection = (
	key: ReportSectionKey
): key is SubsectionedSectionKey => key in SUBSECTIONS;

/** Values by default: a fresh report is one table per section; charts are opt-in per subsection. */
export const DEFAULT_SECTION_VIEW: Record<
	ChartableSectionKey,
	ReportSectionView
> = {
	overview: 'line',
	qa: 'table',
	compliance: 'table',
	sentiment: 'table',
	business: 'table',
	surveys: 'table',
	campaigns: 'table',
	agents: 'table',
};

/** The overview's four KPIs have different units, so it never draws bars. */
export const VIEWS_OF_SECTION: Record<
	ChartableSectionKey,
	ReportSectionView[]
> = {
	overview: ['table', 'line'],
	qa: ['table', 'bar', 'line'],
	compliance: ['table', 'bar', 'line'],
	sentiment: ['table', 'bar', 'line'],
	business: ['table', 'bar', 'line'],
	surveys: ['table', 'bar', 'line'],
	campaigns: ['table', 'bar', 'line'],
	agents: ['table', 'bar', 'line'],
};

export const SECTION_VIEW_ICON: Record<ReportSectionView, Icon> = {
	table: IconTable,
	bar: IconChartBar,
	line: IconChartLine,
};

/** Mantine colours of the per-segment lines, in table order (the analytics palette variables live on that page only). */
export const REPORT_LINE_COLORS = ['blue.6', 'orange.6', 'teal.6', 'gray.6'];

export const FORMATS: ReportFormat[] = ['PDF', 'CSV', 'XLSX'];
export const FREQUENCIES: ReportFrequency[] = ['WEEKLY', 'BIWEEKLY', 'MONTHLY'];
export const REPORT_TABS = [
	'builder',
	'saved',
	'generated',
	'schedules',
] as const;
export type ReportTab = (typeof REPORT_TABS)[number];

export const FORMAT_COLOR: Record<ReportFormat, string> = {
	PDF: 'red',
	CSV: 'green',
	XLSX: 'teal',
};

/** A blank definition scoped to whoever is building it. */
export const defaultDraft = (role: TeamRole): ReportDraft => ({
	name: '',
	description: '',
	audience: 'internal',
	clientName: null,
	showAgentNames: true,
	period: {
		preset: '30d',
		from: addDays(TODAY, -29),
		to: TODAY,
		compareWithPrevious: true,
	},
	scope: {
		teams: role === 'supervisor' ? ['Team 1'] : [],
		supervisorIds: [],
		agentIds: [],
		campaignIds: [],
		linesOfBusiness: [],
	},
	groupBy: 'agent',
	sections: ['overview', 'qa', 'compliance', 'sentiment', 'business'],
	formats: ['PDF'],
	schedule: null,
	createdBy:
		role === 'supervisor' ? SUPERVISOR_PERSONA.name : QA_MANAGER_PERSONA.name,
	createdByRole: role === 'supervisor' ? 'SUPERVISOR' : 'QA_MANAGER',
});

/** US Letter at 96 dpi, portrait. The preview lays out at this size and scales the whole page to fit. */
export const LETTER = {
	width: 816,
	height: 1056,
	margin: 72,
	/** width - 2 * margin */
	contentWidth: 672,
	/** height - 2 * margin */
	contentHeight: 912,
	/** Space between flow items on a page. */
	gap: 20,
	/** Height of the "continued" caption above a table that carries over from the previous page. */
	continuedExtra: 22,
} as const;
