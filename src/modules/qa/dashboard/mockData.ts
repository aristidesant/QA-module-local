/**
 * Mock Data Layer for QA Dashboard
 * Provides realistic test data for Agent, Supervisor, QA Manager, and Operation Manager roles
 */

// ============================================================================
// TypeScript Interfaces
// ============================================================================

export interface ComplianceCategory {
	name: 'Seguridad' | 'Regulatorio' | 'Legal';
	items: string[];
	status: 'compliant' | 'warning' | 'violation';
	score: number;
}

export interface BusinessInsight {
	type: 'Early Objection' | 'Unhandled objection' | 'Competitor plus cost' | 'Mis-targeted offer';
	count: number;
	percentage: number;
	trend: 'up' | 'down' | 'stable';
	description: string;
}

export interface WeeklyMetrics {
	period: 'This week';
	qaScore: {
		total: number;
		ecn: number;
		enc: number;
		ecc: number;
		ecuf: number;
	};
	autoFailsCount: number;
	complianceCategories: ComplianceCategory[];
	businessInsights: BusinessInsight[];
	sentiment: {
		agentAvg: number;
		customerAvg: number;
		predominantEmotion: string;
	};
}

export interface CallData {
	callId: string;
	duration: number;
	sentiment: number;
	complianceScore: number;
	timestamp: string;
	agentName: string;
	customerName: string;
	resolution: 'resolved' | 'escalated' | 'pending';
}

export interface SentimentTrendPoint {
	week: number;
	agentAverage: number;
	customerAverage: number;
	label: string;
}

export interface CriticalIssue {
	id: string;
	title: string;
	severity: 'critical' | 'high' | 'medium' | 'low';
	description: string;
	affectedCount: number;
	timestamp: string;
}

// ============================================================================
// Agent Mock Data (Personal Metrics)
// ============================================================================

export const AGENT_WEEKLY_METRICS: WeeklyMetrics = {
	period: 'This week',
	qaScore: {
		total: 90,
		ecn: 95,
		enc: 88,
		ecc: 92,
		ecuf: 85,
	},
	autoFailsCount: 2,
	complianceCategories: [
		{ name: 'Seguridad', items: ['Protocol adherence', 'Data protection'], status: 'compliant', score: 94 },
		{ name: 'Regulatorio', items: ['Disclosure compliance', 'Record-keeping'], status: 'compliant', score: 88 },
		{ name: 'Legal', items: ['Consent verification', 'Terms acknowledgment'], status: 'compliant', score: 91 },
	],
	businessInsights: [
		{
			type: 'Early Objection',
			count: 3,
			percentage: 85,
			trend: 'down',
			description: 'Objections handled proactively',
		},
		{
			type: 'Unhandled objection',
			count: 1,
			percentage: 15,
			trend: 'stable',
			description: 'Customer concerns not fully addressed',
		},
		{
			type: 'Competitor plus cost',
			count: 2,
			percentage: 40,
			trend: 'up',
			description: 'Competitive pressure with pricing concerns',
		},
		{
			type: 'Mis-targeted offer',
			count: 0,
			percentage: 0,
			trend: 'down',
			description: 'Offers well-matched to customer needs',
		},
	],
	sentiment: {
		agentAvg: 4.2,
		customerAvg: 4.1,
		predominantEmotion: 'Satisfaction',
	},
};

export const AGENT_SENTIMENT_TREND: SentimentTrendPoint[] = [
	{ week: 1, agentAverage: 4.0, customerAverage: 3.9, label: 'Week 1' },
	{ week: 2, agentAverage: 4.1, customerAverage: 4.0, label: 'Week 2' },
	{ week: 3, agentAverage: 4.15, customerAverage: 4.05, label: 'Week 3' },
	{ week: 4, agentAverage: 4.2, customerAverage: 4.1, label: 'Week 4' },
];

export const SUPERVISOR_SENTIMENT_TREND = [
	{ week: 'Week 1', agentSentiment: 3.9, customerSentiment: 3.8 },
	{ week: 'Week 2', agentSentiment: 4.0, customerSentiment: 3.9 },
	{ week: 'Week 3', agentSentiment: 4.05, customerSentiment: 3.95 },
	{ week: 'Week 4', agentSentiment: 4.1, customerSentiment: 4.0 },
];

export const QA_MANAGER_SENTIMENT_TREND = [
	{ week: 'Week 1', agentSentiment: 3.7, customerSentiment: 3.6 },
	{ week: 'Week 2', agentSentiment: 3.8, customerSentiment: 3.7 },
	{ week: 'Week 3', agentSentiment: 3.85, customerSentiment: 3.75 },
	{ week: 'Week 4', agentSentiment: 3.9, customerSentiment: 3.8 },
];

export const OPERATION_MANAGER_SENTIMENT_TREND = [
	{ week: 'Week 1', agentSentiment: 3.6, customerSentiment: 3.5 },
	{ week: 'Week 2', agentSentiment: 3.65, customerSentiment: 3.55 },
	{ week: 'Week 3', agentSentiment: 3.7, customerSentiment: 3.6 },
	{ week: 'Week 4', agentSentiment: 3.75, customerSentiment: 3.65 },
];

export const AGENT_CALLS: CallData[] = [
	{
		callId: 'CALL-001',
		duration: 420,
		sentiment: 4.5,
		complianceScore: 95,
		timestamp: '2026-09-07T10:30:00Z',
		agentName: 'John Smith',
		customerName: 'Alice Johnson',
		resolution: 'resolved',
	},
	{
		callId: 'CALL-002',
		duration: 380,
		sentiment: 4.2,
		complianceScore: 92,
		timestamp: '2026-09-07T11:15:00Z',
		agentName: 'John Smith',
		customerName: 'Bob Williams',
		resolution: 'resolved',
	},
	{
		callId: 'CALL-003',
		duration: 520,
		sentiment: 3.8,
		complianceScore: 88,
		timestamp: '2026-09-07T13:45:00Z',
		agentName: 'John Smith',
		customerName: 'Carol Brown',
		resolution: 'escalated',
	},
	{
		callId: 'CALL-004',
		duration: 340,
		sentiment: 4.3,
		complianceScore: 94,
		timestamp: '2026-09-07T14:20:00Z',
		agentName: 'John Smith',
		customerName: 'David Lee',
		resolution: 'resolved',
	},
	{
		callId: 'CALL-005',
		duration: 290,
		sentiment: 4.1,
		complianceScore: 90,
		timestamp: '2026-09-07T15:50:00Z',
		agentName: 'John Smith',
		customerName: 'Emma Davis',
		resolution: 'resolved',
	},
];

export const AGENT_QUICK_STATS = {
	totalCalls: 24,
	avgCallDuration: 412,
	completionRate: 92,
	escalationRate: 8,
	averageSentimentAgent: 4.2,
	averageSentimentCustomer: 4.1,
	emotion: 'Satisfaction',
};

export const CRITICAL_ISSUES_AGENT: CriticalIssue[] = [
	{
		id: 'ISSUE-AGENT-001',
		title: 'Frequent objection on pricing during customer lifecycle stage',
		severity: 'high',
		description: 'Customers are raising pricing concerns more frequently this week',
		affectedCount: 3,
		timestamp: '2026-09-05T09:00:00Z',
	},
	{
		id: 'ISSUE-AGENT-002',
		title: 'Compliance gap in security disclosure',
		severity: 'medium',
		description: 'Two calls did not include full security protocol disclosure',
		affectedCount: 2,
		timestamp: '2026-09-04T14:30:00Z',
	},
];

// ============================================================================
// Supervisor Mock Data (Team Metrics)
// ============================================================================

export const SUPERVISOR_WEEKLY_METRICS: WeeklyMetrics = {
	period: 'This week',
	qaScore: {
		total: 87,
		ecn: 92,
		enc: 85,
		ecc: 89,
		ecuf: 81,
	},
	autoFailsCount: 5,
	complianceCategories: [
		{ name: 'Seguridad', items: ['Team protocol adherence', 'Data access controls'], status: 'compliant', score: 91 },
		{ name: 'Regulatorio', items: ['Disclosure standards', 'Audit trail maintenance'], status: 'warning', score: 86 },
		{ name: 'Legal', items: ['Consent procedures', 'Documentation standards'], status: 'compliant', score: 88 },
	],
	businessInsights: [
		{
			type: 'Early Objection',
			count: 8,
			percentage: 75,
			trend: 'up',
			description: 'Team is proactively addressing objections',
		},
		{
			type: 'Unhandled objection',
			count: 4,
			percentage: 20,
			trend: 'up',
			description: 'Some customer concerns requiring escalation',
		},
		{
			type: 'Competitor plus cost',
			count: 6,
			percentage: 55,
			trend: 'stable',
			description: 'Steady competitive pressure across team',
		},
		{
			type: 'Mis-targeted offer',
			count: 2,
			percentage: 10,
			trend: 'down',
			description: 'Improving offer alignment',
		},
	],
	sentiment: {
		agentAvg: 4.0,
		customerAvg: 3.9,
		predominantEmotion: 'Neutral',
	},
};

export const CRITICAL_ISSUES_SUPERVISOR: CriticalIssue[] = [
	{
		id: 'ISSUE-SUP-001',
		title: 'Regulatory compliance drift in team',
		severity: 'high',
		description: 'Supervisor team is showing declining compliance with regulatory requirements',
		affectedCount: 5,
		timestamp: '2026-09-06T08:00:00Z',
	},
	{
		id: 'ISSUE-SUP-002',
		title: 'Training needed for new compliance update',
		severity: 'high',
		description: 'Three agents on team not following latest compliance protocol',
		affectedCount: 3,
		timestamp: '2026-09-05T11:20:00Z',
	},
	{
		id: 'ISSUE-SUP-003',
		title: 'Escalation trend increasing',
		severity: 'medium',
		description: 'Call escalations up 15% compared to last week',
		affectedCount: 8,
		timestamp: '2026-09-04T16:45:00Z',
	},
	{
		id: 'ISSUE-SUP-004',
		title: 'Customer satisfaction decline in specific segment',
		severity: 'medium',
		description: 'Certain customer segment reporting lower satisfaction scores',
		affectedCount: 12,
		timestamp: '2026-09-03T13:10:00Z',
	},
	{
		id: 'ISSUE-SUP-005',
		title: 'QA review backlogs growing',
		severity: 'low',
		description: 'QA review queue is building up due to volume',
		affectedCount: 24,
		timestamp: '2026-09-02T10:30:00Z',
	},
];

// ============================================================================
// QA Manager Mock Data (Platform Metrics)
// ============================================================================

export const QA_MANAGER_WEEKLY_METRICS: WeeklyMetrics = {
	period: 'This week',
	qaScore: {
		total: 84,
		ecn: 88,
		enc: 82,
		ecc: 86,
		ecuf: 78,
	},
	autoFailsCount: 18,
	complianceCategories: [
		{ name: 'Seguridad', items: ['Platform security controls', 'Audit logging'], status: 'warning', score: 89 },
		{ name: 'Regulatorio', items: ['Compliance monitoring', 'Regulatory reporting'], status: 'warning', score: 83 },
		{ name: 'Legal', items: ['Policy enforcement', 'Legal documentation'], status: 'warning', score: 85 },
	],
	businessInsights: [
		{
			type: 'Early Objection',
			count: 28,
			percentage: 65,
			trend: 'stable',
			description: 'Platform-wide early objection handling',
		},
		{
			type: 'Unhandled objection',
			count: 14,
			percentage: 35,
			trend: 'up',
			description: 'Increasing unhandled objections across teams',
		},
		{
			type: 'Competitor plus cost',
			count: 22,
			percentage: 70,
			trend: 'up',
			description: 'Competitive pressure impacting multiple teams',
		},
		{
			type: 'Mis-targeted offer',
			count: 8,
			percentage: 25,
			trend: 'up',
			description: 'Offer targeting accuracy declining',
		},
	],
	sentiment: {
		agentAvg: 3.9,
		customerAvg: 3.8,
		predominantEmotion: 'Concern',
	},
};

export const CRITICAL_ISSUES_QA_MANAGER: CriticalIssue[] = [
	{
		id: 'ISSUE-QA-001',
		title: 'Platform-wide compliance violation trend',
		severity: 'critical',
		description: 'Multiple teams showing non-compliance with security protocols',
		affectedCount: 18,
		timestamp: '2026-09-07T07:00:00Z',
	},
	{
		id: 'ISSUE-QA-002',
		title: 'Auto-failure rate spike',
		severity: 'critical',
		description: 'AI evaluation failures up 25% this week across platform',
		affectedCount: 127,
		timestamp: '2026-09-06T09:15:00Z',
	},
	{
		id: 'ISSUE-QA-003',
		title: 'Regulatory audit preparation needed',
		severity: 'high',
		description: 'Upcoming compliance audit requires immediate attention',
		affectedCount: 45,
		timestamp: '2026-09-05T14:30:00Z',
	},
	{
		id: 'ISSUE-QA-004',
		title: 'Customer satisfaction trending downward',
		severity: 'high',
		description: 'Platform-wide customer satisfaction down 7 points',
		affectedCount: 342,
		timestamp: '2026-09-04T11:45:00Z',
	},
	{
		id: 'ISSUE-QA-005',
		title: 'QA resource allocation imbalance',
		severity: 'medium',
		description: 'Some teams understaffed for QA workload',
		affectedCount: 12,
		timestamp: '2026-09-03T10:20:00Z',
	},
	{
		id: 'ISSUE-QA-006',
		title: 'Training compliance across supervisors',
		severity: 'medium',
		description: 'Supervisors need updated compliance training',
		affectedCount: 34,
		timestamp: '2026-09-02T15:00:00Z',
	},
	{
		id: 'ISSUE-QA-007',
		title: 'Escalation process review needed',
		severity: 'low',
		description: 'Escalation procedures not uniformly followed',
		affectedCount: 67,
		timestamp: '2026-09-01T12:30:00Z',
	},
	{
		id: 'ISSUE-QA-008',
		title: 'Data quality issues in reporting',
		severity: 'low',
		description: 'Some metrics showing inconsistencies',
		affectedCount: 89,
		timestamp: '2026-08-31T14:15:00Z',
	},
];

// ============================================================================
// Operation Manager Mock Data (Multi-Client)
// ============================================================================

export const OPERATION_MANAGER_WEEKLY_METRICS: WeeklyMetrics = {
	period: 'This week',
	qaScore: {
		total: 81,
		ecn: 85,
		enc: 79,
		ecc: 83,
		ecuf: 75,
	},
	autoFailsCount: 42,
	complianceCategories: [
		{ name: 'Seguridad', items: ['Cross-client security standards', 'Infrastructure compliance'], status: 'warning', score: 86 },
		{ name: 'Regulatorio', items: ['Multi-client compliance', 'Regulatory alignment'], status: 'violation', score: 80 },
		{ name: 'Legal', items: ['Client agreements', 'Legal compliance verification'], status: 'warning', score: 82 },
	],
	businessInsights: [
		{
			type: 'Early Objection',
			count: 64,
			percentage: 72,
			trend: 'down',
			description: 'Early objection handling across multiple clients',
		},
		{
			type: 'Unhandled objection',
			count: 32,
			percentage: 45,
			trend: 'up',
			description: 'Significant increase in unhandled objections',
		},
		{
			type: 'Competitor plus cost',
			count: 51,
			percentage: 80,
			trend: 'up',
			description: 'Strong competitive and pricing pressure',
		},
		{
			type: 'Mis-targeted offer',
			count: 19,
			percentage: 38,
			trend: 'up',
			description: 'Offer targeting accuracy needs improvement',
		},
	],
	sentiment: {
		agentAvg: 3.75,
		customerAvg: 3.65,
		predominantEmotion: 'Frustration',
	},
};

export const CRITICAL_ISSUES_OPERATION_MANAGER: CriticalIssue[] = [
	{
		id: 'ISSUE-OM-001',
		title: 'Multi-client compliance breach detected',
		severity: 'critical',
		description: 'Regulatory non-compliance across multiple client operations',
		affectedCount: 42,
		timestamp: '2026-09-07T06:00:00Z',
	},
	{
		id: 'ISSUE-OM-002',
		title: 'Service level agreement violations',
		severity: 'critical',
		description: 'Multiple clients falling below agreed SLA targets',
		affectedCount: 8,
		timestamp: '2026-09-06T08:30:00Z',
	},
	{
		id: 'ISSUE-OM-003',
		title: 'Client satisfaction scores declining',
		severity: 'high',
		description: 'Multiple clients reporting decreased satisfaction',
		affectedCount: 7,
		timestamp: '2026-09-05T13:00:00Z',
	},
	{
		id: 'ISSUE-OM-004',
		title: 'Resource allocation crisis',
		severity: 'high',
		description: 'Insufficient staffing across multiple client teams',
		affectedCount: 156,
		timestamp: '2026-09-04T10:45:00Z',
	},
	{
		id: 'ISSUE-OM-005',
		title: 'Cross-client training gaps',
		severity: 'high',
		description: 'Training standards not uniform across clients',
		affectedCount: 89,
		timestamp: '2026-09-03T09:20:00Z',
	},
	{
		id: 'ISSUE-OM-006',
		title: 'Budget overrun on QA operations',
		severity: 'medium',
		description: 'Operating costs exceeding projected budget',
		affectedCount: 12,
		timestamp: '2026-09-02T14:15:00Z',
	},
	{
		id: 'ISSUE-OM-007',
		title: 'Vendor performance issues',
		severity: 'medium',
		description: 'Third-party vendors not meeting performance standards',
		affectedCount: 5,
		timestamp: '2026-09-01T11:30:00Z',
	},
	{
		id: 'ISSUE-OM-008',
		title: 'Technology infrastructure concerns',
		severity: 'medium',
		description: 'System reliability and uptime concerns',
		affectedCount: 234,
		timestamp: '2026-08-31T15:45:00Z',
	},
	{
		id: 'ISSUE-OM-009',
		title: 'Data security audit findings',
		severity: 'low',
		description: 'Minor security findings requiring remediation',
		affectedCount: 45,
		timestamp: '2026-08-30T12:00:00Z',
	},
	{
		id: 'ISSUE-OM-010',
		title: 'Process optimization opportunities',
		severity: 'low',
		description: 'Identified areas for operational improvement',
		affectedCount: 321,
		timestamp: '2026-08-29T10:30:00Z',
	},
];
