import {
	IconClipboardList,
	IconFlame,
	IconFolders,
	IconLayoutDashboard,
	IconMoodSmile,
	IconShieldCheck,
	IconSpeakerphone,
	IconTargetArrow,
	IconTrendingUp,
	IconTrophy,
	IconUsers,
	type Icon,
} from '@tabler/icons-react';
import type {
	ReportDraft,
	ReportFormat,
	ReportFrequency,
	ReportSectionKey,
} from '~/models/qa/reportBuilder';
import type { SegmentMetricId } from '~/modules/qa/analytics/types';
import { TODAY, VIEW_METRICS, addDays } from '~/modules/qa/analytics/constants';
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
	'campaigns',
];

const HEADLINE_METRICS: SegmentMetricId[] = [
	'QA_OVERALL_SCORE',
	'COMPLIANCE_OVERALL_SCORE',
	'CUSTOMER_SENTIMENT_SCORE',
	'BI_NON_CONVERSION_RATE',
];

/** Default table columns per section. Sections with no table have none. */
export const SECTION_METRICS: Record<ReportSectionKey, SegmentMetricId[]> = {
	overview: HEADLINE_METRICS,
	qa: VIEW_METRICS.qa,
	compliance: VIEW_METRICS.compliance,
	sentiment: VIEW_METRICS.sentiment,
	business: VIEW_METRICS.business,
	campaigns: HEADLINE_METRICS,
	agents: HEADLINE_METRICS,
	coaching: [],
	disputes: [],
	burnout: [],
	rankings: [],
};

/** Every metric a report can put in a table, deduplicated, in section order. */
export const ALL_REPORT_METRICS: SegmentMetricId[] = [
	...new Set(SECTION_ORDER.flatMap((key) => SECTION_METRICS[key])),
];

export const SECTION_ICON: Record<ReportSectionKey, Icon> = {
	overview: IconLayoutDashboard,
	qa: IconClipboardList,
	compliance: IconShieldCheck,
	sentiment: IconMoodSmile,
	business: IconTrendingUp,
	campaigns: IconSpeakerphone,
	agents: IconUsers,
	coaching: IconTargetArrow,
	disputes: IconFolders,
	burnout: IconFlame,
	rankings: IconTrophy,
};

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
	metrics: [],
	formats: ['PDF'],
	schedule: null,
	createdBy:
		role === 'supervisor' ? SUPERVISOR_PERSONA.name : QA_MANAGER_PERSONA.name,
	createdByRole: role === 'supervisor' ? 'SUPERVISOR' : 'QA_MANAGER',
});
