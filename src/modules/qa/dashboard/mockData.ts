/**
 * Mock Data Layer for QA Dashboard
 * Provides realistic test data for Agent, Supervisor, QA Manager, and Operation Manager roles
 */

import type { AgentNotification, NotificationTrigger } from '~/models/qa/notifications';

// ============================================================================
// TypeScript Interfaces
// ============================================================================

export interface ComplianceCategory {
	name: 'Security' | 'Regulatory' | 'Legal';
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

export interface BestWorstCall {
	id: string;
	date: string;
	agent: string;
	duration: number;
	qaScore: number;
	sentiment: number;
	type: 'best' | 'worst';
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
		{ name: 'Security', items: ['Protocol adherence', 'Data protection'], status: 'compliant', score: 94 },
		{ name: 'Regulatory', items: ['Disclosure compliance', 'Record-keeping'], status: 'compliant', score: 88 },
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

export const SUPERVISOR_SENTIMENT_TREND: SentimentTrendPoint[] = [
	{ week: 1, agentAverage: 3.9, customerAverage: 3.8, label: 'Week 1' },
	{ week: 2, agentAverage: 4.0, customerAverage: 3.9, label: 'Week 2' },
	{ week: 3, agentAverage: 4.05, customerAverage: 3.95, label: 'Week 3' },
	{ week: 4, agentAverage: 4.1, customerAverage: 4.0, label: 'Week 4' },
];

export const QA_MANAGER_SENTIMENT_TREND: SentimentTrendPoint[] = [
	{ week: 1, agentAverage: 3.7, customerAverage: 3.6, label: 'Week 1' },
	{ week: 2, agentAverage: 3.8, customerAverage: 3.7, label: 'Week 2' },
	{ week: 3, agentAverage: 3.85, customerAverage: 3.75, label: 'Week 3' },
	{ week: 4, agentAverage: 3.9, customerAverage: 3.8, label: 'Week 4' },
];

export const OPERATION_MANAGER_SENTIMENT_TREND: SentimentTrendPoint[] = [
	{ week: 1, agentAverage: 3.6, customerAverage: 3.5, label: 'Week 1' },
	{ week: 2, agentAverage: 3.65, customerAverage: 3.55, label: 'Week 2' },
	{ week: 3, agentAverage: 3.7, customerAverage: 3.6, label: 'Week 3' },
	{ week: 4, agentAverage: 3.75, customerAverage: 3.65, label: 'Week 4' },
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

export const BEST_WORST_CALLS: BestWorstCall[] = [
	// Best calls
	{
		id: 'CALL-BEST-001',
		date: '2026-09-07T10:30:00Z',
		agent: 'John Smith',
		duration: 420,
		qaScore: 98,
		sentiment: 4.8,
		type: 'best',
	},
	{
		id: 'CALL-BEST-002',
		date: '2026-09-06T14:15:00Z',
		agent: 'Sarah Johnson',
		duration: 380,
		qaScore: 96,
		sentiment: 4.7,
		type: 'best',
	},
	{
		id: 'CALL-BEST-003',
		date: '2026-09-05T09:45:00Z',
		agent: 'Mike Chen',
		duration: 450,
		qaScore: 97,
		sentiment: 4.9,
		type: 'best',
	},
	// Worst calls
	{
		id: 'CALL-WORST-001',
		date: '2026-09-07T13:45:00Z',
		agent: 'David Brown',
		duration: 520,
		qaScore: 62,
		sentiment: 2.1,
		type: 'worst',
	},
	{
		id: 'CALL-WORST-002',
		date: '2026-09-06T11:20:00Z',
		agent: 'Lisa Wong',
		duration: 680,
		qaScore: 58,
		sentiment: 2.3,
		type: 'worst',
	},
];

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
		{ name: 'Security', items: ['Team protocol adherence', 'Data access controls'], status: 'compliant', score: 91 },
		{ name: 'Regulatory', items: ['Disclosure standards', 'Audit trail maintenance'], status: 'warning', score: 86 },
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

export const SUPERVISOR_QUICK_STATS = {
	teamSize: 8,
	totalCalls: 156,
	avgHandlingTime: '8.5m',
	completionRate: 89,
	escalationRate: 11,
	teamAvgSentimentAgent: 4.0,
	teamAvgSentimentCustomer: 3.9,
	evaluationsCompleted: 42,
};

export const SUPERVISOR_CALLS: BestWorstCall[] = [
	// Best calls
	{
		id: 'CALL-BEST-SUP-001',
		date: '2026-09-07T10:30:00Z',
		agent: 'Sarah Johnson',
		duration: 420,
		qaScore: 98,
		sentiment: 4.8,
		type: 'best',
		ecn: 0,
		enc: 0,
		ecc: 0,
		ecuf: 0,
		compliance: 100,
	},
	{
		id: 'CALL-BEST-SUP-002',
		date: '2026-09-06T14:15:00Z',
		agent: 'Mike Chen',
		duration: 380,
		qaScore: 96,
		sentiment: 4.7,
		type: 'best',
		ecn: 0,
		enc: 1,
		ecc: 0,
		ecuf: 0,
		compliance: 98,
	},
	{
		id: 'CALL-BEST-SUP-003',
		date: '2026-09-05T09:45:00Z',
		agent: 'Jessica Martinez',
		duration: 450,
		qaScore: 97,
		sentiment: 4.9,
		type: 'best',
		ecn: 0,
		enc: 0,
		ecc: 0,
		ecuf: 0,
		compliance: 99,
	},
	// Worst calls
	{
		id: 'CALL-WORST-SUP-001',
		date: '2026-09-07T13:45:00Z',
		agent: 'David Brown',
		duration: 520,
		qaScore: 62,
		sentiment: 2.1,
		type: 'worst',
		ecn: 2,
		enc: 3,
		ecc: 1,
		ecuf: 1,
		compliance: 58,
	},
	{
		id: 'CALL-WORST-SUP-002',
		date: '2026-09-06T11:20:00Z',
		agent: 'Lisa Wong',
		duration: 680,
		qaScore: 58,
		sentiment: 2.3,
		type: 'worst',
		ecn: 1,
		enc: 4,
		ecc: 2,
		ecuf: 0,
		compliance: 52,
	},
	{
		id: 'CALL-WORST-SUP-003',
		date: '2026-09-05T15:30:00Z',
		agent: 'Robert Kim',
		duration: 610,
		qaScore: 61,
		sentiment: 2.0,
		type: 'worst',
		ecn: 2,
		enc: 2,
		ecc: 1,
		ecuf: 1,
		compliance: 60,
	},
];

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
		{ name: 'Security', items: ['Platform security controls', 'Audit logging'], status: 'warning', score: 89 },
		{ name: 'Regulatory', items: ['Compliance monitoring', 'Regulatory reporting'], status: 'warning', score: 83 },
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
		{ name: 'Security', items: ['Cross-client security standards', 'Infrastructure compliance'], status: 'warning', score: 86 },
		{ name: 'Regulatory', items: ['Multi-client compliance', 'Regulatory alignment'], status: 'violation', score: 80 },
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

// ============================================================================
// QA Manager Calls (Platform-wide best/worst calls from all teams)
// ============================================================================

export const QA_MANAGER_CALLS: BestWorstCall[] = [
	// Best calls from across all supervisors
	{
		id: 'CALL-BEST-QA-001',
		date: '2026-09-07T10:30:00Z',
		agent: 'Sarah Johnson',
		duration: 420,
		qaScore: 98,
		sentiment: 4.8,
		type: 'best',
		ecn: 0,
		enc: 0,
		ecc: 0,
		ecuf: 0,
		compliance: 100,
	},
	{
		id: 'CALL-BEST-QA-002',
		date: '2026-09-06T14:15:00Z',
		agent: 'Mike Chen',
		duration: 380,
		qaScore: 96,
		sentiment: 4.7,
		type: 'best',
		ecn: 0,
		enc: 1,
		ecc: 0,
		ecuf: 0,
		compliance: 98,
	},
	{
		id: 'CALL-BEST-QA-003',
		date: '2026-09-05T09:45:00Z',
		agent: 'Jessica Martinez',
		duration: 450,
		qaScore: 97,
		sentiment: 4.9,
		type: 'best',
		ecn: 0,
		enc: 0,
		ecc: 0,
		ecuf: 0,
		compliance: 99,
	},
	{
		id: 'CALL-BEST-QA-004',
		date: '2026-09-04T11:20:00Z',
		agent: 'James Wilson',
		duration: 410,
		qaScore: 95,
		sentiment: 4.6,
		type: 'best',
		ecn: 0,
		enc: 1,
		ecc: 0,
		ecuf: 0,
		compliance: 97,
	},
	{
		id: 'CALL-BEST-QA-005',
		date: '2026-09-03T16:00:00Z',
		agent: 'Amanda Taylor',
		duration: 390,
		qaScore: 94,
		sentiment: 4.5,
		type: 'best',
		ecn: 0,
		enc: 1,
		ecc: 1,
		ecuf: 0,
		compliance: 95,
	},
	// Worst calls from across all supervisors
	{
		id: 'CALL-WORST-QA-001',
		date: '2026-09-07T13:45:00Z',
		agent: 'David Brown',
		duration: 520,
		qaScore: 62,
		sentiment: 2.1,
		type: 'worst',
		ecn: 2,
		enc: 3,
		ecc: 1,
		ecuf: 1,
		compliance: 58,
	},
	{
		id: 'CALL-WORST-QA-002',
		date: '2026-09-06T11:20:00Z',
		agent: 'Lisa Wong',
		duration: 680,
		qaScore: 58,
		sentiment: 2.3,
		type: 'worst',
		ecn: 1,
		enc: 4,
		ecc: 2,
		ecuf: 0,
		compliance: 52,
	},
	{
		id: 'CALL-WORST-QA-003',
		date: '2026-09-05T15:30:00Z',
		agent: 'Robert Kim',
		duration: 610,
		qaScore: 61,
		sentiment: 2.0,
		type: 'worst',
		ecn: 2,
		enc: 2,
		ecc: 1,
		ecuf: 1,
		compliance: 60,
	},
	{
		id: 'CALL-WORST-QA-004',
		date: '2026-09-04T14:10:00Z',
		agent: 'Patricia Lopez',
		duration: 590,
		qaScore: 59,
		sentiment: 2.2,
		type: 'worst',
		ecn: 1,
		enc: 3,
		ecc: 1,
		ecuf: 0,
		compliance: 55,
	},
	{
		id: 'CALL-WORST-QA-005',
		date: '2026-09-03T12:50:00Z',
		agent: 'Thomas Anderson',
		duration: 710,
		qaScore: 56,
		sentiment: 1.9,
		type: 'worst',
		ecn: 3,
		enc: 3,
		ecc: 2,
		ecuf: 1,
		compliance: 50,
	},
];

export const QA_MANAGER_QUICK_STATS = {
	supervisors: 12,
	agents: 85,
	totalCalls: 2340,
	avgHandlingTime: '7.8m',
	completionRate: 88,
	escalationRate: 12,
	averageSentimentAgent: 3.9,
	averageSentimentCustomer: 3.8,
	evaluationsCompleted: 234,
};

export const OPERATION_MANAGER_QUICK_STATS = {
	clients: 25,
	supervisors: 42,
	agents: 312,
	totalCalls: 8420,
	avgHandlingTime: '7.5m',
	completionRate: 87,
	escalationRate: 13,
	averageSentimentAgent: 3.75,
	averageSentimentCustomer: 3.65,
	platformHealth: 86,
};

export const OPERATION_MANAGER_CALLS: BestWorstCall[] = [
	// Best calls from across all clients
	{
		id: 'CALL-BEST-OM-001',
		date: '2026-09-07T10:30:00Z',
		agent: 'Sarah Johnson (Client A)',
		duration: 420,
		qaScore: 98,
		sentiment: 4.8,
		type: 'best',
		ecn: 0,
		enc: 0,
		ecc: 0,
		ecuf: 0,
		compliance: 100,
	},
	{
		id: 'CALL-BEST-OM-002',
		date: '2026-09-06T14:15:00Z',
		agent: 'Mike Chen (Client B)',
		duration: 380,
		qaScore: 96,
		sentiment: 4.7,
		type: 'best',
		ecn: 0,
		enc: 1,
		ecc: 0,
		ecuf: 0,
		compliance: 98,
	},
	{
		id: 'CALL-BEST-OM-003',
		date: '2026-09-05T09:45:00Z',
		agent: 'Jessica Martinez (Client C)',
		duration: 450,
		qaScore: 97,
		sentiment: 4.9,
		type: 'best',
		ecn: 0,
		enc: 0,
		ecc: 0,
		ecuf: 0,
		compliance: 99,
	},
	{
		id: 'CALL-BEST-OM-004',
		date: '2026-09-04T11:20:00Z',
		agent: 'James Wilson (Client D)',
		duration: 410,
		qaScore: 95,
		sentiment: 4.6,
		type: 'best',
		ecn: 0,
		enc: 1,
		ecc: 0,
		ecuf: 0,
		compliance: 97,
	},
	{
		id: 'CALL-BEST-OM-005',
		date: '2026-09-03T16:00:00Z',
		agent: 'Amanda Taylor (Client E)',
		duration: 390,
		qaScore: 94,
		sentiment: 4.5,
		type: 'best',
		ecn: 0,
		enc: 1,
		ecc: 1,
		ecuf: 0,
		compliance: 95,
	},
	// Worst calls from across all clients
	{
		id: 'CALL-WORST-OM-001',
		date: '2026-09-07T13:45:00Z',
		agent: 'David Brown (Client F)',
		duration: 520,
		qaScore: 62,
		sentiment: 2.1,
		type: 'worst',
		ecn: 2,
		enc: 3,
		ecc: 1,
		ecuf: 1,
		compliance: 58,
	},
	{
		id: 'CALL-WORST-OM-002',
		date: '2026-09-06T11:20:00Z',
		agent: 'Lisa Wong (Client G)',
		duration: 680,
		qaScore: 58,
		sentiment: 2.3,
		type: 'worst',
		ecn: 1,
		enc: 4,
		ecc: 2,
		ecuf: 0,
		compliance: 52,
	},
	{
		id: 'CALL-WORST-OM-003',
		date: '2026-09-05T15:30:00Z',
		agent: 'Robert Kim (Client H)',
		duration: 610,
		qaScore: 61,
		sentiment: 2.0,
		type: 'worst',
		ecn: 2,
		enc: 2,
		ecc: 1,
		ecuf: 1,
		compliance: 60,
	},
	{
		id: 'CALL-WORST-OM-004',
		date: '2026-09-04T14:10:00Z',
		agent: 'Patricia Lopez (Client I)',
		duration: 590,
		qaScore: 59,
		sentiment: 2.2,
		type: 'worst',
		ecn: 1,
		enc: 3,
		ecc: 1,
		ecuf: 0,
		compliance: 55,
	},
	{
		id: 'CALL-WORST-OM-005',
		date: '2026-09-03T12:50:00Z',
		agent: 'Thomas Anderson (Client J)',
		duration: 710,
		qaScore: 56,
		sentiment: 1.9,
		type: 'worst',
		ecn: 3,
		enc: 3,
		ecc: 2,
		ecuf: 1,
		compliance: 50,
	},
];

// ============================================================================
// Agent Inbox Mock Data (Notifications & Triggers)
// ============================================================================

export const AGENT_NOTIFICATIONS: AgentNotification[] = [
	// DIRECT_MESSAGE notifications
	{
		id: 'NOTIF-001',
		agentId: 'AGENT-001',
		category: 'DIRECT_MESSAGE',
		priority: 'CRITICAL',
		title: 'Urgent: Compliance Issue on Call CALL-003',
		message:
			'Hi John, I reviewed your call with Carol Brown (CALL-003). You missed the security protocol disclosure. Please review the latest compliance guidelines and schedule a coaching session with me.',
		icon: 'IconAlertTriangle',
		sourceRole: 'SUPERVISOR',
		sourceId: 'SUP-001',
		read: true,
		archived: false,
		actioned: false,
		threadId: 'THREAD-001',
		replies: [
			{
				id: 'REPLY-001',
				fromRole: 'AGENT',
				fromId: 'AGENT-001',
				message: 'Thanks for flagging this. I see the gap now. I will review the protocol and confirm with you by end of day.',
				createdAt: '2026-09-08T09:15:00Z',
			},
			{
				id: 'REPLY-002',
				fromRole: 'SUPERVISOR',
				fromId: 'SUP-001',
				message:
					'Perfect. I scheduled our coaching for tomorrow at 2pm. Focus on the disclosure steps—we can walk through a few examples.',
				createdAt: '2026-09-08T09:45:00Z',
			},
		],
		actions: [
			{
				label: 'View Call Recording',
				url: '/qa/calls/CALL-003',
				icon: 'IconPlayerPlay',
			},
		],
		createdAt: '2026-09-08T08:30:00Z',
		readAt: '2026-09-08T08:45:00Z',
	},
	{
		id: 'NOTIF-002',
		agentId: 'AGENT-001',
		category: 'DIRECT_MESSAGE',
		priority: 'HIGH',
		title: 'Great Job on CALL-001',
		message: 'John, your handling of the objection with Alice Johnson was textbook perfect. Your sentiment score was 4.5 and compliance was 95%. Keep this up!',
		icon: 'IconMessageSquare',
		sourceRole: 'SUPERVISOR',
		sourceId: 'SUP-001',
		read: false,
		archived: false,
		actioned: false,
		createdAt: '2026-09-08T07:00:00Z',
	},
	// METRIC_ALERT notifications
	{
		id: 'NOTIF-003',
		agentId: 'AGENT-001',
		category: 'METRIC_ALERT',
		priority: 'HIGH',
		title: 'QA Score Alert: Below Team Average',
		message:
			'Your weekly QA score is 90, which is 2 points below your team average of 92. Focus on reducing error codes, particularly ECN and ECUF categories.',
		icon: 'IconAlert',
		sourceRole: 'SYSTEM',
		metric: 'QUALITY_ASSURANCE',
		read: false,
		archived: false,
		actioned: false,
		actions: [
			{
				label: 'View QA Details',
				url: '/qa/agent/AGENT-001/metrics',
				icon: 'IconBarChart',
			},
		],
		createdAt: '2026-09-07T18:00:00Z',
	},
	{
		id: 'NOTIF-004',
		agentId: 'AGENT-001',
		category: 'METRIC_ALERT',
		priority: 'NORMAL',
		title: 'Compliance Score Update',
		message: 'Your compliance score for this week is 91%, maintaining a good standing across all compliance categories.',
		icon: 'IconCheckCircle',
		sourceRole: 'QA_MANAGER',
		sourceId: 'QAM-001',
		metric: 'COMPLIANCE',
		read: true,
		archived: false,
		actioned: false,
		createdAt: '2026-09-07T09:30:00Z',
		readAt: '2026-09-07T10:15:00Z',
	},
	// TREND_WARNING notifications
	{
		id: 'NOTIF-005',
		agentId: 'AGENT-001',
		category: 'TREND_WARNING',
		priority: 'HIGH',
		title: 'Sentiment Decline Detected',
		message:
			'Your customer sentiment scores have declined 0.3 points over the past 3 weeks. This may indicate customers perceive longer hold times or slower issue resolution.',
		icon: 'IconTrendingDown',
		sourceRole: 'SYSTEM',
		metric: 'SENTIMENT_EMOTION',
		read: false,
		archived: false,
		actioned: false,
		actions: [
			{
				label: 'View Sentiment Trends',
				url: '/qa/agent/AGENT-001/sentiment-trends',
				icon: 'IconTrendingDown',
			},
		],
		createdAt: '2026-09-06T14:00:00Z',
	},
	{
		id: 'NOTIF-006',
		agentId: 'AGENT-001',
		category: 'TREND_WARNING',
		priority: 'NORMAL',
		title: 'Auto-Fail Rate Stable',
		message:
			'Your auto-fail rate remains at 2 failures per week, consistent with your baseline. No action needed at this time.',
		icon: 'IconCheckCircle',
		sourceRole: 'QA_MANAGER',
		sourceId: 'QAM-001',
		metric: 'AUTO_FAILS',
		read: true,
		archived: false,
		actioned: false,
		createdAt: '2026-09-05T11:00:00Z',
		readAt: '2026-09-05T15:30:00Z',
	},
	// POSITIVE_RECOGNITION notifications
	{
		id: 'NOTIF-007',
		agentId: 'AGENT-001',
		category: 'POSITIVE_RECOGNITION',
		priority: 'NORMAL',
		title: 'Top Performer This Week',
		message:
			'John, you ranked in the top 3 of your team this week with a QA score of 90 and 4 out of 5 calls rated highly by customers. Excellent work!',
		icon: 'IconAward',
		sourceRole: 'SUPERVISOR',
		sourceId: 'SUP-001',
		read: false,
		archived: false,
		actioned: false,
		createdAt: '2026-09-08T06:00:00Z',
	},
	// WEEKLY_SUMMARY notification
	{
		id: 'NOTIF-008',
		agentId: 'AGENT-001',
		category: 'WEEKLY_SUMMARY',
		priority: 'NORMAL',
		title: 'Weekly Summary: Sept 2-8',
		message:
			"Here's your weekly snapshot: 24 calls completed, 90 QA score, 4.2 agent sentiment, 2 auto-fails. You had 1 escalation. Review the full report in your dashboard.",
		icon: 'IconBarChart',
		sourceRole: 'SYSTEM',
		read: false,
		archived: false,
		actioned: false,
		actions: [
			{
				label: 'View Full Summary',
				url: '/qa/agent/AGENT-001/weekly-summary',
				icon: 'IconBarChart',
			},
		],
		createdAt: '2026-09-08T05:00:00Z',
	},
];

export const SUPERVISOR_TRIGGERS: NotificationTrigger[] = [
	{
		id: 'TRIG-SUP-001',
		name: 'QA Drop Alert',
		category: 'METRIC_ALERT',
		priority: 'HIGH',
		enabled: true,
		scope: 'TEAM',
		supervisorId: 'SUP-001',
		condition: 'THRESHOLD',
		metricThreshold: {
			metric: 'QUALITY_ASSURANCE',
			operator: '<',
			value: 85,
		},
		templateId: 'TMPL-QUALITY-DROP',
		recipients: 'AGENT',
	},
	{
		id: 'TRIG-SUP-002',
		name: 'Sentiment Uptrend Recognition',
		category: 'POSITIVE_RECOGNITION',
		priority: 'NORMAL',
		enabled: true,
		scope: 'TEAM',
		supervisorId: 'SUP-001',
		condition: 'TREND',
		trendDetection: {
			metric: 'SENTIMENT_EMOTION',
			direction: 'UP',
			windowSize: 5,
			threshold: 10,
		},
		templateId: 'TMPL-SENTIMENT-UP',
		recipients: 'AGENT',
	},
	{
		id: 'TRIG-SUP-003',
		name: 'Weekly Supervisor Summary',
		category: 'WEEKLY_SUMMARY',
		priority: 'NORMAL',
		enabled: true,
		scope: 'TEAM',
		supervisorId: 'SUP-001',
		condition: 'SCHEDULED',
		schedule: {
			frequency: 'WEEKLY',
			dayOfWeek: 'FRIDAY',
			time: '17:00',
		},
		templateId: 'TMPL-WEEKLY-SUMMARY',
		recipients: 'AGENT',
	},
	{
		id: 'TRIG-SUP-004',
		name: 'Compliance Violation Alert',
		category: 'METRIC_ALERT',
		priority: 'CRITICAL',
		enabled: false,
		scope: 'TEAM',
		supervisorId: 'SUP-001',
		condition: 'THRESHOLD',
		metricThreshold: {
			metric: 'COMPLIANCE',
			operator: '<',
			value: 80,
		},
		templateId: 'TMPL-COMPLIANCE-VIOLATION',
		recipients: 'AGENT',
	},
];

export const QA_MANAGER_TRIGGERS: NotificationTrigger[] = [
	{
		id: 'TRIG-QAM-001',
		name: 'Platform Compliance Alert',
		category: 'METRIC_ALERT',
		priority: 'CRITICAL',
		enabled: true,
		scope: 'PLATFORM',
		condition: 'THRESHOLD',
		metricThreshold: {
			metric: 'COMPLIANCE',
			operator: '<=',
			value: 82,
		},
		templateId: 'TMPL-PLATFORM-COMPLIANCE',
		recipients: 'SUPERVISORS',
	},
	{
		id: 'TRIG-QAM-002',
		name: 'Agent Achievement Recognition',
		category: 'POSITIVE_RECOGNITION',
		priority: 'NORMAL',
		enabled: true,
		scope: 'PLATFORM',
		condition: 'ACHIEVEMENT',
		achievement: {
			pattern: '5_perfect_calls',
			value: 5,
		},
		templateId: 'TMPL-ACHIEVEMENT-MILESTONE',
		recipients: 'AGENT',
	},
	{
		id: 'TRIG-QAM-003',
		name: 'Auto-Fail Rate Spike',
		category: 'TREND_WARNING',
		priority: 'HIGH',
		enabled: true,
		scope: 'PLATFORM',
		condition: 'TREND',
		trendDetection: {
			metric: 'AUTO_FAILS',
			direction: 'UP',
			windowSize: 7,
			threshold: 20,
		},
		templateId: 'TMPL-AUTO-FAIL-SPIKE',
		recipients: 'SUPERVISORS',
	},
	{
		id: 'TRIG-QAM-004',
		name: 'Team Quality Trend Monitor',
		category: 'TREND_WARNING',
		priority: 'NORMAL',
		enabled: true,
		scope: 'TEAM',
		condition: 'TREND',
		trendDetection: {
			metric: 'QUALITY_ASSURANCE',
			direction: 'DOWN',
			windowSize: 4,
			threshold: 15,
		},
		templateId: 'TMPL-QUALITY-DECLINE',
		recipients: 'AGENT',
	},
];
