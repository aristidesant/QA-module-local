import type {
	DemoAgentKpis,
	DemoAgentWeeklyKpis,
	DemoAgentWeeklyHistory,
	DemoAgentCall,
	DemoCoachingReport,
	DemoLmsContent,
} from './types';

export const THIS_WEEK_KPIS: DemoAgentWeeklyKpis = {
	weekStartDate: '2026-07-28',
	totalCalls: 24,
	avgScore: 87,
	passRate: 85,
	effectiveContacts: 18,
	nonEffectiveContacts: 6,
	lastEvaluationTime: '2026-07-30T14:32:00Z',
	activeCampaigns: 3,
};

export const WEEKLY_HISTORY: DemoAgentWeeklyHistory = [
	{ weekStartDate: '2026-05-13', avgScore: 76, passRate: 71, totalCalls: 18 },
	{ weekStartDate: '2026-05-20', avgScore: 78, passRate: 74, totalCalls: 19 },
	{ weekStartDate: '2026-05-27', avgScore: 79, passRate: 76, totalCalls: 21 },
	{ weekStartDate: '2026-06-03', avgScore: 81, passRate: 79, totalCalls: 22 },
	{ weekStartDate: '2026-06-10', avgScore: 82, passRate: 81, totalCalls: 23 },
	{ weekStartDate: '2026-06-17', avgScore: 84, passRate: 82, totalCalls: 20 },
	{ weekStartDate: '2026-06-24', avgScore: 85, passRate: 83, totalCalls: 25 },
	{ weekStartDate: '2026-07-01', avgScore: 84, passRate: 82, totalCalls: 24 },
	{ weekStartDate: '2026-07-08', avgScore: 86, passRate: 84, totalCalls: 26 },
	{ weekStartDate: '2026-07-15', avgScore: 85, passRate: 83, totalCalls: 22 },
	{ weekStartDate: '2026-07-22', avgScore: 86, passRate: 84, totalCalls: 23 },
	{ weekStartDate: '2026-07-28', avgScore: 87, passRate: 85, totalCalls: 24 },
];

// Legacy KPIs export (for backward compatibility with existing components)
export const DEMO_AGENT_KPIS: DemoAgentKpis = {
	totalCampaigns: THIS_WEEK_KPIS.activeCampaigns,
	weeklyPerformance: THIS_WEEK_KPIS.passRate,
	avgCallScore: THIS_WEEK_KPIS.avgScore,
	totalCallsPerformed: THIS_WEEK_KPIS.totalCalls,
	effectiveContactsCount: THIS_WEEK_KPIS.effectiveContacts,
	nonEffectiveContactsCount: THIS_WEEK_KPIS.nonEffectiveContacts,
	monthlyTrends: WEEKLY_HISTORY.map(week => ({
		month: week.weekStartDate.substring(0, 7),
		score: week.avgScore,
	})),
};

// Sample agent calls (evaluations)
export const DEMO_AGENT_CALLS: DemoAgentCall[] = [
	{
		id: 'call-1',
		callDate: '2026-07-30',
		campaign: 'Customer Support Quality',
		durationSeconds: 420,
		score: 92,
		result: 'passed',
		disputed: false,
		evaluationType: 'QA',
		transcript: [
			{ speaker: 'agent', text: 'Thank you for calling, how can I help you today?', timestamp: 0 },
			{ speaker: 'customer', text: 'Hi, I have a question about my order', timestamp: 8 },
			{ speaker: 'agent', text: 'I would be happy to help. Let me look that up for you.', timestamp: 15 },
			{ speaker: 'customer', text: 'It was supposed to arrive yesterday', timestamp: 22 },
			{ speaker: 'agent', text: 'Let me check the tracking for you. Can I have your order number?', timestamp: 30 },
			{ speaker: 'customer', text: 'Sure, it\'s ORD-2026-12345', timestamp: 35 },
			{ speaker: 'agent', text: 'Thank you. I see it was delayed in transit but should arrive today.', timestamp: 45 },
			{ speaker: 'customer', text: 'Great, thank you for checking!', timestamp: 55 },
			{ speaker: 'agent', text: 'Is there anything else I can help you with?', timestamp: 62 },
			{ speaker: 'customer', text: 'No, that\'s all. Thank you!', timestamp: 68 },
			{ speaker: 'agent', text: 'Thank you for calling. Have a great day!', timestamp: 75 },
		],
		evaluationDetails: [
			{
				section: 'Greeting Quality',
				items: [
					{ name: 'Agent greeted within 5 seconds', score: 10, maxPoints: 10 },
					{ name: 'Used professional tone', score: 10, maxPoints: 10 },
					{ name: 'Offered specific help', score: 8, maxPoints: 10 },
				],
			},
			{
				section: 'Communication',
				items: [
					{ name: 'Spoke clearly and at appropriate pace', score: 10, maxPoints: 10 },
					{ name: 'Used active listening techniques', score: 9, maxPoints: 10 },
					{ name: 'Avoided jargon or explained terms', score: 10, maxPoints: 10 },
					{ name: 'Asked clarifying questions', score: 10, maxPoints: 10 },
				],
			},
			{
				section: 'Problem Resolution',
				items: [
					{ name: 'Understood customer issue accurately', score: 10, maxPoints: 10 },
					{ name: 'Provided effective solution', score: 9, maxPoints: 10 },
					{ name: 'Offered proactive assistance', score: 8, maxPoints: 10 },
					{ name: 'Verified resolution satisfaction', score: 9, maxPoints: 10 },
				],
			},
			{
				section: 'Compliance & Policies',
				items: [
					{ name: 'Followed company policies', score: 10, maxPoints: 10 },
					{ name: 'Protected customer information', score: 10, maxPoints: 10 },
					{ name: 'Documented call appropriately', score: 10, maxPoints: 10 },
					{ name: 'Proper call closing procedure', score: 10, maxPoints: 10 },
				],
			},
			{
				section: 'Customer Engagement',
				items: [
					{ name: 'Demonstrated empathy', score: 9, maxPoints: 10 },
					{ name: 'Maintained positive tone', score: 10, maxPoints: 10 },
					{ name: 'Built customer rapport', score: 8, maxPoints: 10 },
				],
			},
		],
	},
	{
		id: 'call-2',
		callDate: '2026-07-30',
		campaign: 'Sales Performance',
		durationSeconds: 580,
		score: 88,
		result: 'passed',
		disputed: false,
		evaluationType: 'Sentiment Analysis',
		transcript: [],
		evaluationDetails: [],
	},
	{
		id: 'call-3',
		callDate: '2026-07-29',
		campaign: 'Customer Support Quality',
		durationSeconds: 340,
		score: 82,
		result: 'passed',
		disputed: false,
		evaluationType: 'QA',
		transcript: [],
		evaluationDetails: [],
	},
	{
		id: 'call-4',
		callDate: '2026-07-29',
		campaign: 'Compliance Review',
		durationSeconds: 620,
		score: 76,
		result: 'failed',
		disputed: false,
		evaluationType: 'Compliance',
		transcript: [],
		evaluationDetails: [],
	},
	{
		id: 'call-5',
		callDate: '2026-07-28',
		campaign: 'Sales Performance',
		durationSeconds: 450,
		score: 85,
		result: 'passed',
		disputed: false,
		evaluationType: 'QA',
		transcript: [],
		evaluationDetails: [],
	},
];

// Coaching reports
export const DEMO_COACHING_REPORTS: DemoCoachingReport[] = [
	{
		id: 'report-1',
		campaign: 'Customer Support Quality',
		weekStart: '2026-07-28',
		weekEnd: '2026-08-03',
		performanceScore: 89,
		callsAnalyzed: 8,
		sections: {
			overview: 'Great week overall! Your greeting and problem resolution skills are consistently strong.',
			metrics: { callsAnalyzed: 8, avgScore: 89, passRate: 87.5, trends: 'Up 2% from last week' },
			suggestions: ['Continue excellence', 'Work on concise explanations', 'Practice empathy statements'],
			lmsReferences: [
				{ title: 'Efficient Problem Solving', contentId: 'lms-1' },
			],
		},
	},
];

// LMS materials
export const DEMO_LMS_CONTENTS: DemoLmsContent[] = [
	{
		id: 'lms-1',
		title: 'Efficient Problem Solving Techniques',
		type: 'Course',
		mandatory: true,
		deadline: '2026-08-15',
		durationMin: 45,
		completed: false,
		completionPercent: 0,
	},
	{
		id: 'lms-2',
		title: 'Call Duration Best Practices',
		type: 'Video',
		mandatory: true,
		deadline: '2026-08-15',
		durationMin: 12,
		completed: false,
		completionPercent: 30,
	},
];
