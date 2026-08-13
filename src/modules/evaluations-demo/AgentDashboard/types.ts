// Legacy interface (kept for backward compatibility with existing components)
export interface DemoAgentKpis {
	totalCampaigns: number;
	weeklyPerformance: number; // 0-100
	avgCallScore: number; // 0-100
	totalCallsPerformed: number;
	effectiveContactsCount: number;
	nonEffectiveContactsCount: number;
	monthlyTrends: Array<{ month: string; score: number }>;
}

// Weekly KPI snapshot (aggregated across all agent's campaigns) - NEW STRUCTURE
export interface DemoAgentWeeklyKpis {
	weekStartDate: string; // ISO date, e.g., "2026-07-28"
	totalCalls: number; // Total calls this week
	avgScore: number; // 0-100, average of all call scores
	passRate: number; // 0-100, % of calls with score >= 80
	effectiveContacts: number; // Successful/productive calls
	nonEffectiveContacts: number; // Unsuccessful calls
	lastEvaluationTime: string; // ISO datetime or relative ("2h ago")
	activeCampaigns: number; // Count of campaigns agent is on
}

// Weekly comparison for trend calculation
export interface DemoWeeklyTrend {
	weekStartDate: string;
	avgScore: number;
	passRate: number;
	totalCalls: number;
}

// 12-week history for trend chart
export type DemoAgentWeeklyHistory = DemoWeeklyTrend[];

export interface DemoAgentCall {
	id: string;
	callDate: string; // ISO date
	campaign: string; // Campaign name
	agentName?: string; // Agent name (optional for backward compatibility)
	durationSeconds: number;
	score: number; // 0-100
	result: 'passed' | 'failed'; // passed = score >= 80, failed = score < 80
	disputed: boolean;
	evaluationType: 'Compliance' | 'Sentiment Analysis' | 'QA' | 'Behavioral';
	transcript: Array<{
		speaker: 'agent' | 'customer';
		text: string;
		timestamp: number; // seconds from start
	}>;
	evaluationDetails: Array<{
		section: string;
		items: Array<{
			name: string;
			score: number;
			maxPoints: number;
		}>;
	}>;
}

export interface DemoCoachingReport {
	id: string;
	campaign: string;
	weekStart: string; // ISO date
	weekEnd: string;
	performanceScore: number;
	callsAnalyzed: number;
	sections: {
		overview: string;
		metrics: {
			callsAnalyzed: number;
			avgScore: number;
			passRate: number;
			trends: string;
		};
		suggestions: string[];
		lmsReferences: Array<{ title: string; contentId: string }>;
	};
}

export interface DemoLmsContent {
	id: string;
	title: string;
	type: 'PDF' | 'Video' | 'Course' | 'Article';
	mandatory: boolean; // badge distinction
	deadline?: string; // ISO, for mandatory only
	durationMin?: number;
	completed: boolean;
	completionPercent?: number;
}
