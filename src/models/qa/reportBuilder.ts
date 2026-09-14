import type { TriggerMetricId } from './triggerRules';
import type {
	GroupByDimension,
	QuickRange,
} from '~/modules/qa/analytics/types';

/** Who the report is written for: internal staff or the end client. */
export type ReportAudience = 'internal' | 'client';

export type ReportSectionKey =
	| 'overview'
	| 'qa'
	| 'compliance'
	| 'sentiment'
	| 'business'
	| 'campaigns'
	| 'agents'
	| 'coaching'
	| 'disputes'
	| 'burnout'
	| 'rankings';

export type ReportFormat = 'PDF' | 'CSV' | 'XLSX';
export type ReportFrequency = 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY';

/** The grouping dimensions that make sense as report table rows. */
export type ReportGroupBy = Extract<
	GroupByDimension,
	'none' | 'team' | 'supervisor' | 'agent' | 'campaign' | 'lineOfBusiness'
>;

export interface ReportSchedule {
	enabled: boolean;
	frequency: ReportFrequency;
	/** 0 = Sunday … 6 = Saturday. For MONTHLY this is the day of the month. */
	dayOfWeek: number;
	/** 'HH:mm' */
	time: string;
	recipients: string[];
	nextRunAt: string;
}

export interface ReportPeriod {
	preset: QuickRange;
	from: string;
	to: string;
	compareWithPrevious: boolean;
}

export interface ReportScope {
	teams: string[];
	supervisorIds: string[];
	agentIds: string[];
	campaignIds: string[];
	linesOfBusiness: string[];
}

export interface ReportDefinition {
	id: string;
	name: string;
	description: string;
	audience: ReportAudience;
	/** Set when the audience is a client. */
	clientName: string | null;
	/** Client reports can anonymise agents as "Agent 01", "Agent 02"… */
	showAgentNames: boolean;
	period: ReportPeriod;
	scope: ReportScope;
	groupBy: ReportGroupBy;
	/** Ordered — the preview renders them in this order. */
	sections: ReportSectionKey[];
	/** Columns of the section tables; empty means each section's defaults. */
	metrics: TriggerMetricId[];
	formats: ReportFormat[];
	schedule: ReportSchedule | null;
	builtIn: boolean;
	createdBy: string;
	createdByRole: 'SUPERVISOR' | 'QA_MANAGER';
	createdAt: string;
	updatedAt: string;
	lastGeneratedAt: string | null;
}

export interface GeneratedReportRecord {
	id: string;
	definitionId: string;
	definitionName: string;
	audience: ReportAudience;
	format: ReportFormat;
	generatedAt: string;
	trigger: 'MANUAL' | 'SCHEDULED';
	sizeKb: number;
	status: 'READY' | 'SENT';
	recipients: string[];
	/** CSV text kept in memory so the row can be downloaded again. */
	csv?: string;
}

export type ReportDraft = Omit<
	ReportDefinition,
	'id' | 'createdAt' | 'updatedAt' | 'lastGeneratedAt' | 'builtIn'
>;
