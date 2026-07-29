export interface DemoAgentKpis {
	totalCampaigns: number;
	weeklyPerformance: number;
	avgCallScore: number;
	totalCallsPerformed: number;
	effectiveContactsCount: number;
	nonEffectiveContactsCount: number;
	monthlyTrends: Array<{ month: string; score: number }>;
}

export interface DemoAgentCall {
	id: string;
	callDate: string;
	campaign: string;
	duration: number;
	score: number;
	result: 'passed' | 'failed';
	disputed: boolean;
	evaluationType: 'Compliance' | 'Sentiment Analysis' | 'QA';
	transcript: Array<{
		speaker: 'agent' | 'customer';
		text: string;
		timestamp: number;
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
	weekStart: string;
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
		lmsReferences: Array<{
			title: string;
			contentId: string;
		}>;
	};
}

export interface DemoLmsContent {
	id: string;
	title: string;
	type: 'PDF' | 'Video' | 'Course' | 'Article';
	mandatory: boolean;
	deadline?: string;
	durationMin?: number;
	completed: boolean;
	completionPercent?: number;
}
