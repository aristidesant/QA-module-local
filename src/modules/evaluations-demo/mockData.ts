export type DemoHealth = 'healthy' | 'atRisk' | 'critical';
export type DemoCallStatus = 'completed' | 'pending';
export type DemoPassFail = 'pass' | 'fail';
export type DemoCampaignStatus = 'active' | 'pending' | 'paused';
export type DemoCampaignType = 'Inbound' | 'Outbound' | 'Mixed';
export type DemoCategory = 'Business Insight' | 'Sentiment' | 'Compliance';

export interface DemoSubCriterion {
	id: string;
	description: string;
	verdict: DemoPassFail;
	points: number;
	maxPoints: number;
}

export interface DemoCriteriaSection {
	id: string;
	name: string;
	score: number;
	maxScore: number;
	subCriteria: DemoSubCriterion[];
}

export interface DemoTranscriptTurn {
	id: string;
	role: 'agent' | 'customer';
	timestamp: string;
	text: string;
}

export interface DemoCall {
	id: string;
	fileName: string;
	agentName: string;
	date: string;
	score: number | null;
	status: DemoCallStatus;
	pass: DemoPassFail;
	durationLabel: string;
	durationSeconds: number;
	transcript: DemoTranscriptTurn[];
	criteria: DemoCriteriaSection[];
}

export interface DemoEvaluation {
	id: string;
	title: string;
	category: DemoCategory;
	health: DemoHealth;
	lastEvaluationAt: string;
	stats: {
		totalCalls: number;
		callsAnalyzed: number;
		averageScore: number;
		passRate: number;
	};
	calls: DemoCall[];
}

export interface DemoResultCall {
	id: string;
	fileName: string;
	date: string;
	score: number | null;
	status: DemoCallStatus;
	passed: boolean;
	disputeRequested: boolean;
	disputed: boolean;
}

export interface DemoRosterAgent {
	id: string;
	name: string;
	email: string;
	department: string;
	callsRecorded: number;
	evaluationScore: number;
	status: 'active' | 'inactive';
	disputes: number;
}

export interface DemoCampaign {
	id: string;
	name: string;
	groupLabel: string;
	description: string;
	source: string;
	campaignType: DemoCampaignType;
	status: DemoCampaignStatus;
	qaTestsCount: number;
	stats: {
		totalEvaluations: number;
		totalCalls: number;
		passRate: number;
		analyzedToday: number;
		autoFails: number;
		disputes: number;
	};
	evaluations: DemoEvaluation[];
	results: DemoResultCall[];
	roster: DemoRosterAgent[];
}

const call001Transcript: DemoTranscriptTurn[] = [
	{
		id: 't1',
		role: 'agent',
		timestamp: '0:00',
		text: 'Good morning! Thank you for calling. How can I help you today?',
	},
	{
		id: 't2',
		role: 'customer',
		timestamp: '0:05',
		text: "Hi, I'm calling about my account. I can't access it.",
	},
	{
		id: 't3',
		role: 'agent',
		timestamp: '0:10',
		text: "I'm sorry to hear that. Can you confirm the name and email on the account so I can look into this?",
	},
	{
		id: 't4',
		role: 'customer',
		timestamp: '0:18',
		text: "Sure, it's John Smith, and the email is john.smith@example.com.",
	},
	{
		id: 't5',
		role: 'agent',
		timestamp: '0:27',
		text: 'Thanks, John. I can see the account — it looks like the password was reset recently. Let me send a new verification link.',
	},
	{
		id: 't6',
		role: 'customer',
		timestamp: '0:38',
		text: "Okay, that would be great. I didn't request a reset though.",
	},
	{
		id: 't7',
		role: 'agent',
		timestamp: '0:45',
		text: "I understand the concern — I've flagged the account for a security review as well, just to be safe. You should receive the link within a minute.",
	},
	{
		id: 't8',
		role: 'customer',
		timestamp: '0:56',
		text: 'Got it, thank you for the help!',
	},
];

const call001Criteria: DemoCriteriaSection[] = [
	{
		id: 'greeting',
		name: 'Greeting Quality',
		score: 18,
		maxScore: 20,
		subCriteria: [
			{
				id: 'greeting-1',
				description: 'Agent greeted within 5 seconds',
				verdict: 'pass',
				points: 10,
				maxPoints: 10,
			},
			{
				id: 'greeting-2',
				description: 'Used customer name',
				verdict: 'pass',
				points: 8,
				maxPoints: 10,
			},
		],
	},
	{
		id: 'resolution',
		name: 'Problem Resolution',
		score: 27,
		maxScore: 30,
		subCriteria: [
			{
				id: 'resolution-1',
				description: 'Identified main issue',
				verdict: 'pass',
				points: 10,
				maxPoints: 10,
			},
			{
				id: 'resolution-2',
				description: 'Provided solution',
				verdict: 'pass',
				points: 10,
				maxPoints: 10,
			},
			{
				id: 'resolution-3',
				description: 'Confirmed resolution',
				verdict: 'fail',
				points: 7,
				maxPoints: 10,
			},
		],
	},
	{
		id: 'communication',
		name: 'Communication',
		score: 22,
		maxScore: 25,
		subCriteria: [
			{
				id: 'communication-1',
				description: 'Clear and professional tone',
				verdict: 'pass',
				points: 10,
				maxPoints: 10,
			},
			{
				id: 'communication-2',
				description: 'Active listening demonstrated',
				verdict: 'pass',
				points: 12,
				maxPoints: 15,
			},
		],
	},
	{
		id: 'compliance',
		name: 'Compliance',
		score: 21,
		maxScore: 25,
		subCriteria: [
			{
				id: 'compliance-1',
				description: 'Followed compliance script',
				verdict: 'pass',
				points: 11,
				maxPoints: 15,
			},
			{
				id: 'compliance-2',
				description: 'Provided required disclosures',
				verdict: 'pass',
				points: 10,
				maxPoints: 10,
			},
		],
	},
];

const genericTranscript = (agentName: string): DemoTranscriptTurn[] => [
	{
		id: 't1',
		role: 'agent',
		timestamp: '0:00',
		text: `Hi, this is ${agentName}. Thanks for calling — how can I help?`,
	},
	{
		id: 't2',
		role: 'customer',
		timestamp: '0:06',
		text: "I had a question about my recent order.",
	},
	{
		id: 't3',
		role: 'agent',
		timestamp: '0:12',
		text: "Happy to take a look — let me pull that up for you.",
	},
];

const genericCriteria = (score: number): DemoCriteriaSection[] => [
	{
		id: 'greeting',
		name: 'Greeting Quality',
		score: Math.min(20, Math.round(score * 0.2)),
		maxScore: 20,
		subCriteria: [
			{
				id: 'greeting-1',
				description: 'Agent greeted within 5 seconds',
				verdict: 'pass',
				points: 10,
				maxPoints: 10,
			},
		],
	},
	{
		id: 'communication',
		name: 'Communication',
		score: Math.min(25, Math.round(score * 0.25)),
		maxScore: 25,
		subCriteria: [
			{
				id: 'communication-1',
				description: 'Clear and professional tone',
				verdict: score >= 70 ? 'pass' : 'fail',
				points: Math.round((score / 100) * 25),
				maxPoints: 25,
			},
		],
	},
];

function buildCall(
	id: string,
	fileName: string,
	agentName: string,
	date: string,
	score: number | null,
	status: DemoCallStatus,
	durationLabel: string,
	durationSeconds: number
): DemoCall {
	return {
		id,
		fileName,
		agentName,
		date,
		score,
		status,
		pass: (score ?? 0) >= 80 ? 'pass' : 'fail',
		durationLabel,
		durationSeconds,
		transcript: genericTranscript(agentName),
		criteria: genericCriteria(score ?? 0),
	};
}

const batch2Calls: DemoCall[] = [
	{
		id: 'call_001',
		fileName: 'call_001.mp3',
		agentName: 'John Smith',
		date: '2026-06-22',
		score: 88,
		status: 'completed',
		pass: 'pass',
		durationLabel: '1:02',
		durationSeconds: 62,
		transcript: call001Transcript,
		criteria: call001Criteria,
	},
	buildCall('call_090', 'call_090.mp3', 'John Smith', '2026-07-20', 89, 'completed', '2:14', 134),
	buildCall('call_091', 'call_091.mp3', 'John Smith', '2026-07-20', 70, 'completed', '1:48', 108),
	buildCall('call_088', 'call_088.mp3', 'John Smith', '2026-07-19', 93, 'completed', '3:02', 182),
	buildCall('call_089', 'call_089.mp3', 'Alex Brown', '2026-07-19', 71, 'pending', '1:22', 82),
	buildCall('call_086', 'call_086.mp3', 'John Smith', '2026-07-18', 82, 'completed', '2:41', 161),
	buildCall('call_085', 'call_085.mp3', 'Alex Brown', '2026-07-18', 65, 'completed', '1:57', 117),
	buildCall('call_084', 'call_084.mp3', 'Maria Garcia', '2026-07-17', 91, 'completed', '2:08', 128),
	buildCall('call_083', 'call_083.mp3', 'Maria Garcia', '2026-07-17', 58, 'completed', '1:34', 94),
	buildCall('call_082', 'call_082.mp3', 'John Smith', '2026-07-16', null, 'pending', '0:52', 52),
];

const q2SalesResults: DemoResultCall[] = [
	{
		id: 'call_001',
		fileName: 'call_001.mp3',
		date: '2026-06-15',
		score: 85,
		status: 'completed',
		passed: true,
		disputeRequested: false,
		disputed: false,
	},
	{
		id: 'call_002',
		fileName: 'call_002.mp3',
		date: '2026-06-15',
		score: 92,
		status: 'completed',
		passed: true,
		disputeRequested: false,
		disputed: false,
	},
	{
		id: 'call_003',
		fileName: 'call_003.mp3',
		date: '2026-06-16',
		score: 68,
		status: 'completed',
		passed: false,
		disputeRequested: true,
		disputed: false,
	},
	{
		id: 'call_004',
		fileName: 'call_004.mp3',
		date: '2026-06-16',
		score: 78,
		status: 'completed',
		passed: true,
		disputeRequested: false,
		disputed: true,
	},
	{
		id: 'call_005',
		fileName: 'call_005.mp3',
		date: '2026-06-17',
		score: null,
		status: 'pending',
		passed: false,
		disputeRequested: false,
		disputed: false,
	},
	{
		id: 'call_006',
		fileName: 'call_006.mp3',
		date: '2026-06-17',
		score: 88,
		status: 'completed',
		passed: true,
		disputeRequested: false,
		disputed: false,
	},
	{
		id: 'call_007',
		fileName: 'call_007.mp3',
		date: '2026-06-18',
		score: 45,
		status: 'completed',
		passed: false,
		disputeRequested: true,
		disputed: true,
	},
];

const q2SalesRoster: DemoRosterAgent[] = [
	{
		id: 'john-smith',
		name: 'John Smith',
		email: 'john.smith@company.com',
		department: 'Sales',
		callsRecorded: 156,
		evaluationScore: 88,
		status: 'active',
		disputes: 0,
	},
	{
		id: 'sarah-johnson',
		name: 'Sarah Johnson',
		email: 'sarah.johnson@company.com',
		department: 'Sales',
		callsRecorded: 203,
		evaluationScore: 92,
		status: 'active',
		disputes: 0,
	},
	{
		id: 'mike-chen',
		name: 'Mike Chen',
		email: 'mike.chen@company.com',
		department: 'Sales',
		callsRecorded: 142,
		evaluationScore: 85,
		status: 'active',
		disputes: 0,
	},
	{
		id: 'emma-davis',
		name: 'Emma Davis',
		email: 'emma.davis@company.com',
		department: 'Sales',
		callsRecorded: 189,
		evaluationScore: 90,
		status: 'active',
		disputes: 0,
	},
	{
		id: 'alex-rodriguez',
		name: 'Alex Rodriguez',
		email: 'alex.rodriguez@company.com',
		department: 'Sales',
		callsRecorded: 167,
		evaluationScore: 87,
		status: 'inactive',
		disputes: 0,
	},
	{
		id: 'jessica-lee',
		name: 'Jessica Lee',
		email: 'jessica.lee@company.com',
		department: 'Sales',
		callsRecorded: 198,
		evaluationScore: 91,
		status: 'active',
		disputes: 0,
	},
];

export const DEMO_CAMPAIGNS: DemoCampaign[] = [
	{
		id: 'q2-sales-performance',
		name: 'Q2 Sales Performance',
		groupLabel: 'Q2 Sales Performance 06/15 – 06/30',
		description: 'Evaluate sales calls from Q2 2026',
		source: 'External',
		campaignType: 'Outbound',
		status: 'active',
		qaTestsCount: 8,
		stats: {
			totalEvaluations: 8,
			totalCalls: 487,
			passRate: 88,
			analyzedToday: 115,
			autoFails: 0,
			disputes: 0,
		},
		evaluations: [
			{
				id: 'batch-1',
				title: 'Sales Quality Scorecard – Batch 1',
				category: 'Business Insight',
				health: 'healthy',
				lastEvaluationAt: 'Jul 23, 2026 at 2:45 PM',
				stats: { totalCalls: 51, callsAnalyzed: 51, averageScore: 90, passRate: 92 },
				calls: batch2Calls,
			},
			{
				id: 'batch-2',
				title: 'Sales Quality Scorecard – Batch 2',
				category: 'Sentiment',
				health: 'atRisk',
				lastEvaluationAt: 'Jul 23, 2026 at 1:30 PM',
				stats: { totalCalls: 43, callsAnalyzed: 43, averageScore: 82, passRate: 53 },
				calls: batch2Calls,
			},
			{
				id: 'call-compliance-audit',
				title: 'Call Compliance Audit',
				category: 'Compliance',
				health: 'healthy',
				lastEvaluationAt: 'Jul 23, 2026 at 12:30 PM',
				stats: { totalCalls: 60, callsAnalyzed: 60, averageScore: 87, passRate: 90 },
				calls: batch2Calls,
			},
			{
				id: 'customer-satisfaction-survey',
				title: 'Customer Satisfaction Survey',
				category: 'Sentiment',
				health: 'healthy',
				lastEvaluationAt: 'Jul 23, 2026 at 3:20 PM',
				stats: { totalCalls: 38, callsAnalyzed: 38, averageScore: 88, passRate: 86 },
				calls: batch2Calls,
			},
			{
				id: 'revenue-impact-analysis',
				title: 'Revenue Impact Analysis',
				category: 'Business Insight',
				health: 'atRisk',
				lastEvaluationAt: 'Jul 23, 2026 at 1:10 PM',
				stats: { totalCalls: 47, callsAnalyzed: 47, averageScore: 76, passRate: 61 },
				calls: batch2Calls,
			},
			{
				id: 'customer-emotion-tracking',
				title: 'Customer Emotion Tracking',
				category: 'Sentiment',
				health: 'atRisk',
				lastEvaluationAt: 'Jul 23, 2026 at 11:30 AM',
				stats: { totalCalls: 55, callsAnalyzed: 55, averageScore: 74, passRate: 58 },
				calls: batch2Calls,
			},
			{
				id: 'agent-empathy-index',
				title: 'Agent Empathy Index',
				category: 'Business Insight',
				health: 'healthy',
				lastEvaluationAt: 'Jul 22, 2026 at 4:05 PM',
				stats: { totalCalls: 62, callsAnalyzed: 62, averageScore: 91, passRate: 94 },
				calls: batch2Calls,
			},
			{
				id: 'script-adherence-check',
				title: 'Script Adherence Check',
				category: 'Compliance',
				health: 'critical',
				lastEvaluationAt: 'Jul 22, 2026 at 10:15 AM',
				stats: { totalCalls: 41, callsAnalyzed: 41, averageScore: 62, passRate: 39 },
				calls: batch2Calls,
			},
		],
		results: q2SalesResults,
		roster: q2SalesRoster,
	},
	{
		id: 'customer-support-quality',
		name: 'Customer Support Quality',
		groupLabel: 'Customer Support Quality',
		description: 'CS team performance evaluation',
		source: 'CMX',
		campaignType: 'Inbound',
		status: 'active',
		qaTestsCount: 6,
		stats: {
			totalEvaluations: 6,
			totalCalls: 210,
			passRate: 81,
			analyzedToday: 34,
			autoFails: 0,
			disputes: 0,
		},
		evaluations: batch2Calls.map((call, i) => ({
			id: `eval-${i}`,
			title: `Evaluation ${i + 1}`,
			category: i % 3 === 0 ? 'Business Insight' : i % 3 === 1 ? 'Sentiment' : 'Compliance',
			health: i % 3 === 0 ? 'healthy' : 'atRisk',
			lastEvaluationAt: 'Jul 23, 2026 at 2:45 PM',
			stats: { totalCalls: 10, callsAnalyzed: 10, averageScore: 85, passRate: 90 },
			calls: [call],
		})).slice(0, 3),
		results: q2SalesResults,
		roster: q2SalesRoster,
	},
	{
		id: 'new-hire-training-june',
		name: 'New Hire Training – June',
		groupLabel: 'New Hire Training – June',
		description: 'Onboarding evaluation for new agents',
		source: 'External',
		campaignType: 'Mixed',
		status: 'pending',
		qaTestsCount: 0,
		stats: {
			totalEvaluations: 3,
			totalCalls: 45,
			passRate: 89,
			analyzedToday: 8,
			autoFails: 0,
			disputes: 0,
		},
		evaluations: batch2Calls.map((call, i) => ({
			id: `eval-${i}`,
			title: `Evaluation ${i + 1}`,
			category: i % 3 === 0 ? 'Business Insight' : i % 3 === 1 ? 'Sentiment' : 'Compliance',
			health: i % 3 === 0 ? 'healthy' : 'atRisk',
			lastEvaluationAt: 'Jul 23, 2026 at 2:45 PM',
			stats: { totalCalls: 10, callsAnalyzed: 10, averageScore: 85, passRate: 90 },
			calls: [call],
		})).slice(0, 3),
		results: q2SalesResults,
		roster: q2SalesRoster,
	},
	{
		id: 'compliance-review-q2',
		name: 'Compliance Review – Q2',
		groupLabel: 'Compliance Review – Q2',
		description: 'Regulatory compliance evaluation',
		source: 'CMX',
		campaignType: 'Inbound',
		status: 'paused',
		qaTestsCount: 9,
		stats: {
			totalEvaluations: 9,
			totalCalls: 302,
			passRate: 74,
			analyzedToday: 0,
			autoFails: 2,
			disputes: 1,
		},
		evaluations: batch2Calls.map((call, i) => ({
			id: `eval-${i}`,
			title: `Evaluation ${i + 1}`,
			category: i % 3 === 0 ? 'Business Insight' : i % 3 === 1 ? 'Sentiment' : 'Compliance',
			health: i % 3 === 0 ? 'healthy' : 'atRisk',
			lastEvaluationAt: 'Jul 23, 2026 at 2:45 PM',
			stats: { totalCalls: 10, callsAnalyzed: 10, averageScore: 85, passRate: 90 },
			calls: [call],
		})).slice(0, 3),
		results: q2SalesResults,
		roster: q2SalesRoster,
	},
	{
		id: 'agent-performance-audit',
		name: 'Agent Performance Audit',
		groupLabel: 'Agent Performance Audit',
		description: 'Comprehensive performance and quality check',
		source: 'External',
		campaignType: 'Outbound',
		status: 'active',
		qaTestsCount: 7,
		stats: {
			totalEvaluations: 7,
			totalCalls: 156,
			passRate: 85,
			analyzedToday: 12,
			autoFails: 0,
			disputes: 0,
		},
		evaluations: batch2Calls.map((call, i) => ({
			id: `eval-${i}`,
			title: `Evaluation ${i + 1}`,
			category: i % 3 === 0 ? 'Business Insight' : i % 3 === 1 ? 'Sentiment' : 'Compliance',
			health: i % 3 === 0 ? 'healthy' : 'atRisk',
			lastEvaluationAt: 'Jul 23, 2026 at 2:45 PM',
			stats: { totalCalls: 10, callsAnalyzed: 10, averageScore: 85, passRate: 90 },
			calls: [call],
		})).slice(0, 3),
		results: q2SalesResults,
		roster: q2SalesRoster,
	},
];

export const getDemoCampaign = (campaignId?: string) =>
	DEMO_CAMPAIGNS.find((c) => c.id === campaignId);

export const getDemoEvaluation = (
	campaignId?: string,
	evaluationId?: string
) => getDemoCampaign(campaignId)?.evaluations.find((e) => e.id === evaluationId);

export const getDemoCall = (
	campaignId?: string,
	evaluationId?: string,
	callId?: string
) => getDemoEvaluation(campaignId, evaluationId)?.calls.find((c) => c.id === callId);
