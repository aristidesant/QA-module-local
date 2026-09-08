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

export interface ComplianceArea {
	score: number;
	items: Record<string, number>;
}

export interface CallMetric {
	id: string;
	date: string;
	qaScores: {
		ecn: number;
		enc: number;
		ecc: number;
		ecuf: number;
	};
	agentSentiment: number;
	customerSentiment: number;
	predominantEmotion: 'Joy' | 'Trust' | 'Anticipation' | 'Surprise' | 'Anger' | 'Fear' | 'Sadness' | 'Disgust';
	complianceByArea: {
		security: ComplianceArea;
		regulatory: ComplianceArea;
		legal: ComplianceArea;
	};
}

export interface AggregatedMetrics {
	timestamp: string;
	period: string;
	callCount: number;
	avgAgentSentiment: number;
	avgCustomerSentiment: number;
	avgSecurityCompliance: number;
	avgRegulatoryCompliance: number;
	avgLegalCompliance: number;
	totalErrorsECN: number;
	totalErrorsENC: number;
	totalErrorsECC: number;
	totalErrorsECUF: number;
	predominantEmotion: string;
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

// ============================================================================
// Agent Analytics Mock Data (Call Metrics & Aggregation)
// ============================================================================

/**
 * Generate realistic call metrics spanning the last 30 days
 * Includes variation in QA scores, sentiment, and compliance across all 8 emotions
 */
export const AGENT_CALL_METRICS: CallMetric[] = [
	// Week 1 (Aug 9-15, 2026)
	{
		id: 'METRIC-001',
		date: '2026-08-09T08:30:00Z',
		qaScores: { ecn: 0, enc: 1, ecc: 0, ecuf: 0 },
		agentSentiment: 4.2,
		customerSentiment: 4.1,
		predominantEmotion: 'Joy',
		complianceByArea: {
			security: { score: 94, items: { dataProtection: 95, disclosureCompliance: 93 } },
			regulatory: { score: 91, items: { cobranzaRegulada: 90, transparenciaConsentimiento: 92 } },
			legal: { score: 93, items: { amenazasTradicionales: 93, rrss: 92, superintendenciaBancos: 94, noLlamarList: 93 } },
		},
	},
	{
		id: 'METRIC-002',
		date: '2026-08-09T10:15:00Z',
		qaScores: { ecn: 1, enc: 0, ecc: 0, ecuf: 1 },
		agentSentiment: 3.9,
		customerSentiment: 3.8,
		predominantEmotion: 'Trust',
		complianceByArea: {
			security: { score: 88, items: { dataProtection: 89, disclosureCompliance: 87 } },
			regulatory: { score: 85, items: { cobranzaRegulada: 84, transparenciaConsentimiento: 86 } },
			legal: { score: 87, items: { amenazasTradicionales: 88, rrss: 86, superintendenciaBancos: 87, noLlamarList: 87 } },
		},
	},
	{
		id: 'METRIC-003',
		date: '2026-08-09T14:45:00Z',
		qaScores: { ecn: 2, enc: 2, ecc: 1, ecuf: 0 },
		agentSentiment: 3.2,
		customerSentiment: 3.1,
		predominantEmotion: 'Anger',
		complianceByArea: {
			security: { score: 76, items: { dataProtection: 75, disclosureCompliance: 77 } },
			regulatory: { score: 72, items: { cobranzaRegulada: 71, transparenciaConsentimiento: 73 } },
			legal: { score: 74, items: { amenazasTradicionales: 73, rrss: 74, superintendenciaBancos: 75, noLlamarList: 74 } },
		},
	},
	{
		id: 'METRIC-004',
		date: '2026-08-10T09:00:00Z',
		qaScores: { ecn: 0, enc: 0, ecc: 0, ecuf: 0 },
		agentSentiment: 4.5,
		customerSentiment: 4.4,
		predominantEmotion: 'Anticipation',
		complianceByArea: {
			security: { score: 96, items: { dataProtection: 97, disclosureCompliance: 95 } },
			regulatory: { score: 94, items: { cobranzaRegulada: 93, transparenciaConsentimiento: 95 } },
			legal: { score: 95, items: { amenazasTradicionales: 95, rrss: 94, superintendenciaBancos: 96, noLlamarList: 95 } },
		},
	},
	{
		id: 'METRIC-005',
		date: '2026-08-10T11:30:00Z',
		qaScores: { ecn: 1, enc: 1, ecc: 0, ecuf: 0 },
		agentSentiment: 4.0,
		customerSentiment: 3.9,
		predominantEmotion: 'Surprise',
		complianceByArea: {
			security: { score: 89, items: { dataProtection: 90, disclosureCompliance: 88 } },
			regulatory: { score: 86, items: { cobranzaRegulada: 85, transparenciaConsentimiento: 87 } },
			legal: { score: 88, items: { amenazasTradicionales: 89, rrss: 87, superintendenciaBancos: 88, noLlamarList: 88 } },
		},
	},
	{
		id: 'METRIC-006',
		date: '2026-08-11T08:20:00Z',
		qaScores: { ecn: 0, enc: 1, ecc: 1, ecuf: 0 },
		agentSentiment: 3.7,
		customerSentiment: 3.6,
		predominantEmotion: 'Fear',
		complianceByArea: {
			security: { score: 83, items: { dataProtection: 84, disclosureCompliance: 82 } },
			regulatory: { score: 80, items: { cobranzaRegulada: 79, transparenciaConsentimiento: 81 } },
			legal: { score: 82, items: { amenazasTradicionales: 81, rrss: 82, superintendenciaBancos: 83, noLlamarList: 82 } },
		},
	},
	{
		id: 'METRIC-007',
		date: '2026-08-12T13:10:00Z',
		qaScores: { ecn: 2, enc: 1, ecc: 0, ecuf: 1 },
		agentSentiment: 3.4,
		customerSentiment: 3.3,
		predominantEmotion: 'Sadness',
		complianceByArea: {
			security: { score: 79, items: { dataProtection: 78, disclosureCompliance: 80 } },
			regulatory: { score: 76, items: { cobranzaRegulada: 75, transparenciaConsentimiento: 77 } },
			legal: { score: 78, items: { amenazasTradicionales: 77, rrss: 78, superintendenciaBancos: 79, noLlamarList: 78 } },
		},
	},
	{
		id: 'METRIC-008',
		date: '2026-08-13T10:40:00Z',
		qaScores: { ecn: 0, enc: 0, ecc: 0, ecuf: 0 },
		agentSentiment: 4.3,
		customerSentiment: 4.2,
		predominantEmotion: 'Joy',
		complianceByArea: {
			security: { score: 95, items: { dataProtection: 96, disclosureCompliance: 94 } },
			regulatory: { score: 93, items: { cobranzaRegulada: 92, transparenciaConsentimiento: 94 } },
			legal: { score: 94, items: { amenazasTradicionales: 94, rrss: 93, superintendenciaBancos: 95, noLlamarList: 94 } },
		},
	},
	{
		id: 'METRIC-009',
		date: '2026-08-14T15:25:00Z',
		qaScores: { ecn: 3, enc: 2, ecc: 1, ecuf: 1 },
		agentSentiment: 2.9,
		customerSentiment: 2.8,
		predominantEmotion: 'Disgust',
		complianceByArea: {
			security: { score: 72, items: { dataProtection: 71, disclosureCompliance: 73 } },
			regulatory: { score: 68, items: { cobranzaRegulada: 67, transparenciaConsentimiento: 69 } },
			legal: { score: 70, items: { amenazasTradicionales: 69, rrss: 70, superintendenciaBancos: 71, noLlamarList: 70 } },
		},
	},
	{
		id: 'METRIC-010',
		date: '2026-08-15T09:50:00Z',
		qaScores: { ecn: 1, enc: 0, ecc: 0, ecuf: 0 },
		agentSentiment: 4.1,
		customerSentiment: 4.0,
		predominantEmotion: 'Trust',
		complianceByArea: {
			security: { score: 91, items: { dataProtection: 92, disclosureCompliance: 90 } },
			regulatory: { score: 89, items: { cobranzaRegulada: 88, transparenciaConsentimiento: 90 } },
			legal: { score: 90, items: { amenazasTradicionales: 90, rrss: 89, superintendenciaBancos: 91, noLlamarList: 90 } },
		},
	},

	// Week 2 (Aug 16-22, 2026)
	{
		id: 'METRIC-011',
		date: '2026-08-16T08:15:00Z',
		qaScores: { ecn: 0, enc: 1, ecc: 0, ecuf: 0 },
		agentSentiment: 4.2,
		customerSentiment: 4.1,
		predominantEmotion: 'Anticipation',
		complianceByArea: {
			security: { score: 92, items: { dataProtection: 93, disclosureCompliance: 91 } },
			regulatory: { score: 90, items: { cobranzaRegulada: 89, transparenciaConsentimiento: 91 } },
			legal: { score: 91, items: { amenazasTradicionales: 91, rrss: 90, superintendenciaBancos: 92, noLlamarList: 91 } },
		},
	},
	{
		id: 'METRIC-012',
		date: '2026-08-17T11:45:00Z',
		qaScores: { ecn: 1, enc: 2, ecc: 0, ecuf: 1 },
		agentSentiment: 3.6,
		customerSentiment: 3.5,
		predominantEmotion: 'Surprise',
		complianceByArea: {
			security: { score: 85, items: { dataProtection: 86, disclosureCompliance: 84 } },
			regulatory: { score: 82, items: { cobranzaRegulada: 81, transparenciaConsentimiento: 83 } },
			legal: { score: 84, items: { amenazasTradicionales: 84, rrss: 83, superintendenciaBancos: 85, noLlamarList: 84 } },
		},
	},
	{
		id: 'METRIC-013',
		date: '2026-08-18T14:20:00Z',
		qaScores: { ecn: 0, enc: 0, ecc: 0, ecuf: 0 },
		agentSentiment: 4.4,
		customerSentiment: 4.3,
		predominantEmotion: 'Joy',
		complianceByArea: {
			security: { score: 97, items: { dataProtection: 98, disclosureCompliance: 96 } },
			regulatory: { score: 95, items: { cobranzaRegulada: 94, transparenciaConsentimiento: 96 } },
			legal: { score: 96, items: { amenazasTradicionales: 96, rrss: 95, superintendenciaBancos: 97, noLlamarList: 96 } },
		},
	},
	{
		id: 'METRIC-014',
		date: '2026-08-19T10:05:00Z',
		qaScores: { ecn: 2, enc: 1, ecc: 1, ecuf: 0 },
		agentSentiment: 3.3,
		customerSentiment: 3.2,
		predominantEmotion: 'Fear',
		complianceByArea: {
			security: { score: 80, items: { dataProtection: 81, disclosureCompliance: 79 } },
			regulatory: { score: 77, items: { cobranzaRegulada: 76, transparenciaConsentimiento: 78 } },
			legal: { score: 79, items: { amenazasTradicionales: 78, rrss: 79, superintendenciaBancos: 80, noLlamarList: 79 } },
		},
	},
	{
		id: 'METRIC-015',
		date: '2026-08-20T13:35:00Z',
		qaScores: { ecn: 1, enc: 0, ecc: 0, ecuf: 1 },
		agentSentiment: 4.0,
		customerSentiment: 3.9,
		predominantEmotion: 'Trust',
		complianceByArea: {
			security: { score: 88, items: { dataProtection: 89, disclosureCompliance: 87 } },
			regulatory: { score: 86, items: { cobranzaRegulada: 85, transparenciaConsentimiento: 87 } },
			legal: { score: 87, items: { amenazasTradicionales: 87, rrss: 86, superintendenciaBancos: 88, noLlamarList: 87 } },
		},
	},
	{
		id: 'METRIC-016',
		date: '2026-08-21T09:15:00Z',
		qaScores: { ecn: 2, enc: 2, ecc: 0, ecuf: 1 },
		agentSentiment: 3.1,
		customerSentiment: 3.0,
		predominantEmotion: 'Anger',
		complianceByArea: {
			security: { score: 74, items: { dataProtection: 75, disclosureCompliance: 73 } },
			regulatory: { score: 71, items: { cobranzaRegulada: 70, transparenciaConsentimiento: 72 } },
			legal: { score: 73, items: { amenazasTradicionales: 72, rrss: 73, superintendenciaBancos: 74, noLlamarList: 73 } },
		},
	},
	{
		id: 'METRIC-017',
		date: '2026-08-22T12:40:00Z',
		qaScores: { ecn: 0, enc: 0, ecc: 0, ecuf: 0 },
		agentSentiment: 4.3,
		customerSentiment: 4.2,
		predominantEmotion: 'Joy',
		complianceByArea: {
			security: { score: 94, items: { dataProtection: 95, disclosureCompliance: 93 } },
			regulatory: { score: 92, items: { cobranzaRegulada: 91, transparenciaConsentimiento: 93 } },
			legal: { score: 93, items: { amenazasTradicionales: 93, rrss: 92, superintendenciaBancos: 94, noLlamarList: 93 } },
		},
	},

	// Week 3 (Aug 23-29, 2026)
	{
		id: 'METRIC-018',
		date: '2026-08-23T08:30:00Z',
		qaScores: { ecn: 1, enc: 1, ecc: 0, ecuf: 0 },
		agentSentiment: 4.1,
		customerSentiment: 4.0,
		predominantEmotion: 'Anticipation',
		complianceByArea: {
			security: { score: 90, items: { dataProtection: 91, disclosureCompliance: 89 } },
			regulatory: { score: 88, items: { cobranzaRegulada: 87, transparenciaConsentimiento: 89 } },
			legal: { score: 89, items: { amenazasTradicionales: 89, rrss: 88, superintendenciaBancos: 90, noLlamarList: 89 } },
		},
	},
	{
		id: 'METRIC-019',
		date: '2026-08-24T11:20:00Z',
		qaScores: { ecn: 3, enc: 1, ecc: 1, ecuf: 0 },
		agentSentiment: 3.0,
		customerSentiment: 2.9,
		predominantEmotion: 'Sadness',
		complianceByArea: {
			security: { score: 76, items: { dataProtection: 77, disclosureCompliance: 75 } },
			regulatory: { score: 73, items: { cobranzaRegulada: 72, transparenciaConsentimiento: 74 } },
			legal: { score: 75, items: { amenazasTradicionales: 74, rrss: 75, superintendenciaBancos: 76, noLlamarList: 75 } },
		},
	},
	{
		id: 'METRIC-020',
		date: '2026-08-25T14:50:00Z',
		qaScores: { ecn: 0, enc: 0, ecc: 0, ecuf: 0 },
		agentSentiment: 4.5,
		customerSentiment: 4.4,
		predominantEmotion: 'Joy',
		complianceByArea: {
			security: { score: 96, items: { dataProtection: 97, disclosureCompliance: 95 } },
			regulatory: { score: 94, items: { cobranzaRegulada: 93, transparenciaConsentimiento: 95 } },
			legal: { score: 95, items: { amenazasTradicionales: 95, rrss: 94, superintendenciaBancos: 96, noLlamarList: 95 } },
		},
	},
	{
		id: 'METRIC-021',
		date: '2026-08-26T10:10:00Z',
		qaScores: { ecn: 1, enc: 2, ecc: 1, ecuf: 1 },
		agentSentiment: 3.5,
		customerSentiment: 3.4,
		predominantEmotion: 'Surprise',
		complianceByArea: {
			security: { score: 82, items: { dataProtection: 83, disclosureCompliance: 81 } },
			regulatory: { score: 79, items: { cobranzaRegulada: 78, transparenciaConsentimiento: 80 } },
			legal: { score: 81, items: { amenazasTradicionales: 80, rrss: 81, superintendenciaBancos: 82, noLlamarList: 81 } },
		},
	},
	{
		id: 'METRIC-022',
		date: '2026-08-27T13:45:00Z',
		qaScores: { ecn: 0, enc: 1, ecc: 0, ecuf: 0 },
		agentSentiment: 4.2,
		customerSentiment: 4.1,
		predominantEmotion: 'Trust',
		complianceByArea: {
			security: { score: 93, items: { dataProtection: 94, disclosureCompliance: 92 } },
			regulatory: { score: 91, items: { cobranzaRegulada: 90, transparenciaConsentimiento: 92 } },
			legal: { score: 92, items: { amenazasTradicionales: 92, rrss: 91, superintendenciaBancos: 93, noLlamarList: 92 } },
		},
	},
	{
		id: 'METRIC-023',
		date: '2026-08-28T09:30:00Z',
		qaScores: { ecn: 2, enc: 1, ecc: 0, ecuf: 0 },
		agentSentiment: 3.4,
		customerSentiment: 3.3,
		predominantEmotion: 'Disgust',
		complianceByArea: {
			security: { score: 81, items: { dataProtection: 82, disclosureCompliance: 80 } },
			regulatory: { score: 78, items: { cobranzaRegulada: 77, transparenciaConsentimiento: 79 } },
			legal: { score: 80, items: { amenazasTradicionales: 79, rrss: 80, superintendenciaBancos: 81, noLlamarList: 80 } },
		},
	},
	{
		id: 'METRIC-024',
		date: '2026-08-29T15:15:00Z',
		qaScores: { ecn: 0, enc: 0, ecc: 0, ecuf: 0 },
		agentSentiment: 4.4,
		customerSentiment: 4.3,
		predominantEmotion: 'Joy',
		complianceByArea: {
			security: { score: 95, items: { dataProtection: 96, disclosureCompliance: 94 } },
			regulatory: { score: 93, items: { cobranzaRegulada: 92, transparenciaConsentimiento: 94 } },
			legal: { score: 94, items: { amenazasTradicionales: 94, rrss: 93, superintendenciaBancos: 95, noLlamarList: 94 } },
		},
	},

	// Week 4 (Aug 30 - Sep 5, 2026)
	{
		id: 'METRIC-025',
		date: '2026-08-30T08:45:00Z',
		qaScores: { ecn: 1, enc: 0, ecc: 0, ecuf: 1 },
		agentSentiment: 4.0,
		customerSentiment: 3.9,
		predominantEmotion: 'Anticipation',
		complianceByArea: {
			security: { score: 89, items: { dataProtection: 90, disclosureCompliance: 88 } },
			regulatory: { score: 87, items: { cobranzaRegulada: 86, transparenciaConsentimiento: 88 } },
			legal: { score: 88, items: { amenazasTradicionales: 88, rrss: 87, superintendenciaBancos: 89, noLlamarList: 88 } },
		},
	},
	{
		id: 'METRIC-026',
		date: '2026-08-31T12:25:00Z',
		qaScores: { ecn: 2, enc: 1, ecc: 1, ecuf: 0 },
		agentSentiment: 3.2,
		customerSentiment: 3.1,
		predominantEmotion: 'Fear',
		complianceByArea: {
			security: { score: 79, items: { dataProtection: 80, disclosureCompliance: 78 } },
			regulatory: { score: 76, items: { cobranzaRegulada: 75, transparenciaConsentimiento: 77 } },
			legal: { score: 78, items: { amenazasTradicionales: 77, rrss: 78, superintendenciaBancos: 79, noLlamarList: 78 } },
		},
	},
	{
		id: 'METRIC-027',
		date: '2026-09-01T10:00:00Z',
		qaScores: { ecn: 0, enc: 0, ecc: 0, ecuf: 0 },
		agentSentiment: 4.3,
		customerSentiment: 4.2,
		predominantEmotion: 'Joy',
		complianceByArea: {
			security: { score: 94, items: { dataProtection: 95, disclosureCompliance: 93 } },
			regulatory: { score: 92, items: { cobranzaRegulada: 91, transparenciaConsentimiento: 93 } },
			legal: { score: 93, items: { amenazasTradicionales: 93, rrss: 92, superintendenciaBancos: 94, noLlamarList: 93 } },
		},
	},
	{
		id: 'METRIC-028',
		date: '2026-09-02T14:35:00Z',
		qaScores: { ecn: 1, enc: 1, ecc: 0, ecuf: 0 },
		agentSentiment: 4.1,
		customerSentiment: 4.0,
		predominantEmotion: 'Trust',
		complianceByArea: {
			security: { score: 91, items: { dataProtection: 92, disclosureCompliance: 90 } },
			regulatory: { score: 89, items: { cobranzaRegulada: 88, transparenciaConsentimiento: 90 } },
			legal: { score: 90, items: { amenazasTradicionales: 90, rrss: 89, superintendenciaBancos: 91, noLlamarList: 90 } },
		},
	},
	{
		id: 'METRIC-029',
		date: '2026-09-03T11:10:00Z',
		qaScores: { ecn: 2, enc: 2, ecc: 1, ecuf: 1 },
		agentSentiment: 3.3,
		customerSentiment: 3.2,
		predominantEmotion: 'Sadness',
		complianceByArea: {
			security: { score: 78, items: { dataProtection: 79, disclosureCompliance: 77 } },
			regulatory: { score: 75, items: { cobranzaRegulada: 74, transparenciaConsentimiento: 76 } },
			legal: { score: 77, items: { amenazasTradicionales: 76, rrss: 77, superintendenciaBancos: 78, noLlamarList: 77 } },
		},
	},
	{
		id: 'METRIC-030',
		date: '2026-09-04T09:55:00Z',
		qaScores: { ecn: 0, enc: 1, ecc: 0, ecuf: 0 },
		agentSentiment: 4.2,
		customerSentiment: 4.1,
		predominantEmotion: 'Anticipation',
		complianceByArea: {
			security: { score: 92, items: { dataProtection: 93, disclosureCompliance: 91 } },
			regulatory: { score: 90, items: { cobranzaRegulada: 89, transparenciaConsentimiento: 91 } },
			legal: { score: 91, items: { amenazasTradicionales: 91, rrss: 90, superintendenciaBancos: 92, noLlamarList: 91 } },
		},
	},
	{
		id: 'METRIC-031',
		date: '2026-09-05T13:20:00Z',
		qaScores: { ecn: 1, enc: 0, ecc: 0, ecuf: 1 },
		agentSentiment: 4.0,
		customerSentiment: 3.9,
		predominantEmotion: 'Joy',
		complianceByArea: {
			security: { score: 90, items: { dataProtection: 91, disclosureCompliance: 89 } },
			regulatory: { score: 88, items: { cobranzaRegulada: 87, transparenciaConsentimiento: 89 } },
			legal: { score: 89, items: { amenazasTradicionales: 89, rrss: 88, superintendenciaBancos: 90, noLlamarList: 89 } },
		},
	},

	// Week 5 (Sep 6-8, 2026)
	{
		id: 'METRIC-032',
		date: '2026-09-06T08:30:00Z',
		qaScores: { ecn: 0, enc: 0, ecc: 0, ecuf: 0 },
		agentSentiment: 4.4,
		customerSentiment: 4.3,
		predominantEmotion: 'Joy',
		complianceByArea: {
			security: { score: 96, items: { dataProtection: 97, disclosureCompliance: 95 } },
			regulatory: { score: 94, items: { cobranzaRegulada: 93, transparenciaConsentimiento: 95 } },
			legal: { score: 95, items: { amenazasTradicionales: 95, rrss: 94, superintendenciaBancos: 96, noLlamarList: 95 } },
		},
	},
	{
		id: 'METRIC-033',
		date: '2026-09-07T10:15:00Z',
		qaScores: { ecn: 1, enc: 1, ecc: 0, ecuf: 0 },
		agentSentiment: 4.1,
		customerSentiment: 4.0,
		predominantEmotion: 'Trust',
		complianceByArea: {
			security: { score: 91, items: { dataProtection: 92, disclosureCompliance: 90 } },
			regulatory: { score: 89, items: { cobranzaRegulada: 88, transparenciaConsentimiento: 90 } },
			legal: { score: 90, items: { amenazasTradicionales: 90, rrss: 89, superintendenciaBancos: 91, noLlamarList: 90 } },
		},
	},
	{
		id: 'METRIC-034',
		date: '2026-09-08T11:45:00Z',
		qaScores: { ecn: 2, enc: 1, ecc: 0, ecuf: 1 },
		agentSentiment: 3.6,
		customerSentiment: 3.5,
		predominantEmotion: 'Surprise',
		complianceByArea: {
			security: { score: 85, items: { dataProtection: 86, disclosureCompliance: 84 } },
			regulatory: { score: 82, items: { cobranzaRegulada: 81, transparenciaConsentimiento: 83 } },
			legal: { score: 84, items: { amenazasTradicionales: 84, rrss: 83, superintendenciaBancos: 85, noLlamarList: 84 } },
		},
	},
];

/**
 * Aggregates call metrics by date range and granularity
 * @param calls - Array of CallMetric objects to aggregate
 * @param startDate - Start date in ISO format
 * @param endDate - End date in ISO format
 * @param granularity - Aggregation level: 'per-call' | 'daily' | 'weekly' | 'monthly'
 * @returns Array of aggregated metrics grouped by time period
 */
export function aggregateMetricsByDateRange(
	calls: CallMetric[],
	startDate: string,
	endDate: string,
	granularity: 'per-call' | 'daily' | 'weekly' | 'monthly' = 'daily'
): AggregatedMetrics[] {
	const start = new Date(startDate);
	const end = new Date(endDate);

	// Filter calls within date range
	const filteredCalls = calls.filter((call) => {
		const callDate = new Date(call.date);
		return callDate >= start && callDate <= end;
	});

	if (filteredCalls.length === 0) {
		return [];
	}

	// For 'per-call' granularity, return each call as individual aggregated metric
	if (granularity === 'per-call') {
		return filteredCalls.map((call) => ({
			timestamp: call.date,
			period: new Date(call.date).toISOString().split('T')[0],
			callCount: 1,
			avgAgentSentiment: call.agentSentiment,
			avgCustomerSentiment: call.customerSentiment,
			avgSecurityCompliance: call.complianceByArea.security.score,
			avgRegulatoryCompliance: call.complianceByArea.regulatory.score,
			avgLegalCompliance: call.complianceByArea.legal.score,
			totalErrorsECN: call.qaScores.ecn,
			totalErrorsENC: call.qaScores.enc,
			totalErrorsECC: call.qaScores.ecc,
			totalErrorsECUF: call.qaScores.ecuf,
			predominantEmotion: call.predominantEmotion,
		}));
	}

	// Group calls by time period
	const grouped = new Map<string, CallMetric[]>();

	filteredCalls.forEach((call) => {
		const callDate = new Date(call.date);
		let key: string = '';

		if (granularity === 'daily') {
			key = callDate.toISOString().split('T')[0];
		} else if (granularity === 'weekly') {
			// Get ISO week number
			const date = new Date(callDate);
			const startOfYear = new Date(date.getFullYear(), 0, 1);
			const diff = date.getTime() - startOfYear.getTime();
			const weekNumber = Math.floor(diff / (7 * 24 * 60 * 60 * 1000));
			key = `${date.getFullYear()}-W${String(weekNumber + 1).padStart(2, '0')}`;
		} else if (granularity === 'monthly') {
			key = callDate.toISOString().substring(0, 7);
		} else {
			// Default to daily if granularity is per-call (shouldn't reach here)
			key = callDate.toISOString().split('T')[0];
		}

		if (!grouped.has(key)) {
			grouped.set(key, []);
		}
		grouped.get(key)!.push(call);
	});

	// Aggregate metrics for each group
	const result: AggregatedMetrics[] = [];

	grouped.forEach((groupedCalls, key) => {
		const callCount = groupedCalls.length;

		// Calculate averages
		const avgAgentSentiment = groupedCalls.reduce((sum, c) => sum + c.agentSentiment, 0) / callCount;
		const avgCustomerSentiment = groupedCalls.reduce((sum, c) => sum + c.customerSentiment, 0) / callCount;
		const avgSecurityCompliance = groupedCalls.reduce((sum, c) => sum + c.complianceByArea.security.score, 0) / callCount;
		const avgRegulatoryCompliance =
			groupedCalls.reduce((sum, c) => sum + c.complianceByArea.regulatory.score, 0) / callCount;
		const avgLegalCompliance = groupedCalls.reduce((sum, c) => sum + c.complianceByArea.legal.score, 0) / callCount;

		// Sum errors
		const totalErrorsECN = groupedCalls.reduce((sum, c) => sum + c.qaScores.ecn, 0);
		const totalErrorsENC = groupedCalls.reduce((sum, c) => sum + c.qaScores.enc, 0);
		const totalErrorsECC = groupedCalls.reduce((sum, c) => sum + c.qaScores.ecc, 0);
		const totalErrorsECUF = groupedCalls.reduce((sum, c) => sum + c.qaScores.ecuf, 0);

		// Get most common emotion
		const emotionCounts = new Map<string, number>();
		groupedCalls.forEach((c) => {
			emotionCounts.set(c.predominantEmotion, (emotionCounts.get(c.predominantEmotion) || 0) + 1);
		});
		const predominantEmotion = Array.from(emotionCounts.entries()).sort((a, b) => b[1] - a[1])[0][0];

		// Determine timestamp based on first call in group
		const timestamp = groupedCalls[0].date;

		result.push({
			timestamp,
			period: key,
			callCount,
			avgAgentSentiment: Math.round(avgAgentSentiment * 100) / 100,
			avgCustomerSentiment: Math.round(avgCustomerSentiment * 100) / 100,
			avgSecurityCompliance: Math.round(avgSecurityCompliance),
			avgRegulatoryCompliance: Math.round(avgRegulatoryCompliance),
			avgLegalCompliance: Math.round(avgLegalCompliance),
			totalErrorsECN,
			totalErrorsENC,
			totalErrorsECC,
			totalErrorsECUF,
			predominantEmotion,
		});
	});

	// Sort by timestamp
	result.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

	return result;
}
