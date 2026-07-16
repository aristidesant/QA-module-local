import type { AiEvaluationStatus } from '~/models/qa';
import type { DashboardTimeRange } from '~/stores/qaDashboardFilterStore';

/**
 * /evaluations has no server-side date filtering, so the dashboard works on
 * a bounded window of the most recent evaluations filtered client-side.
 */
export const EVALUATION_WINDOW_LIMIT = 200;
export const DISPUTES_PAGE_LIMIT = 50;
export const AGENT_NAME_MAP_LIMIT = 100;
export const RECENT_EVALUATIONS_COUNT = 8;
export const TOP_AGENTS_COUNT = 5;
export const TOP_AGENTS_MIN_EVALUATIONS = 2;

export const DASHBOARD_TIME_RANGES: DashboardTimeRange[] = [
	'TODAY',
	'WEEK',
	'MONTH',
	'ALL',
];

export const AI_STATUS_CHART_COLORS: Record<AiEvaluationStatus, string> = {
	PENDING: 'gray.5',
	PROCESSING: 'blue.5',
	COMPLETED: 'green.6',
	FAILED: 'red.6',
};

export const TREND_CREATED_COLOR = 'blue.5';
export const TREND_COMPLETED_COLOR = 'green.6';
export const TOP_AGENTS_BAR_COLOR = 'green.6';
