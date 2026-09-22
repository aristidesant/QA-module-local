/**
 * Line of Business filter for the Supervisor/QA Manager dashboards only.
 * Deliberately separate from the `lineOfBusiness` field on TeamCallMetric,
 * which backs Trigger Rules, Coaching Rules and Reports — this filter maps
 * each existing campaign to one of these 4 categories without touching
 * that taxonomy or any other feature.
 */
export type DashboardLineOfBusiness =
	| 'Collections'
	| 'Accounts Receivable'
	| 'Services'
	| 'Location';

export const DASHBOARD_LINES_OF_BUSINESS: DashboardLineOfBusiness[] = [
	'Collections',
	'Accounts Receivable',
	'Services',
	'Location',
];

const CAMPAIGN_LINE_OF_BUSINESS: Record<string, DashboardLineOfBusiness> = {
	'camp-001': 'Services',
	'camp-002': 'Accounts Receivable',
	'camp-003': 'Collections',
	'camp-004': 'Location',
};

export const dashboardLineOfBusinessFor = (
	campaignId: string
): DashboardLineOfBusiness | null =>
	CAMPAIGN_LINE_OF_BUSINESS[campaignId] ?? null;
