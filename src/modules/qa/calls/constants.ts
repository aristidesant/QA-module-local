/** Campaigns routes use mockCampaigns ids ('1'..'5'); the roster/TEAM_CALLS use camp-00N. */
export const CAMPAIGN_ROSTER_MAP: Record<string, string> = {
	'1': 'camp-002', // Q2 Sales Performance → Sales Training
	'2': 'camp-001', // Customer Support Quality → Q3 Customer Service
	'3': 'camp-004', // New Hire Training - June → Tech Support
	'4': 'camp-003', // Compliance Audit Wave 2 → Q4 Compliance
	'5': 'camp-001', // Agent Coaching Program → Q3 Customer Service
};

/** Reverse lookup used to deep-link an agent call to a mock campaign id. First match wins. */
export const ROSTER_TO_MOCK_CAMPAIGN: Record<string, string> = {
	'camp-001': '2',
	'camp-002': '1',
	'camp-003': '4',
	'camp-004': '3',
};

export type MyCallsPeriod = '7d' | '30d' | '90d' | 'all';
export const MY_CALLS_PERIODS: {
	value: MyCallsPeriod;
	labelKey: string;
	days: number | null;
}[] = [
	{ value: '7d', labelKey: 'period.7d', days: 7 },
	{ value: '30d', labelKey: 'period.30d', days: 30 },
	{ value: '90d', labelKey: 'period.90d', days: 90 },
	{ value: 'all', labelKey: 'period.all', days: null },
];

export const QA_FORM_BY_CAMPAIGN_TYPE = {
	INBOUND: 'Customer Service Excellence',
	OUTBOUND: 'Sales Call Quality Standards',
	BLENDED: 'Compliance Check',
} as const;
