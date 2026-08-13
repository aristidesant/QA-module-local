export type AnalysisType = 'qa' | 'emotion' | 'compliance' | 'behavioral';

export interface DateRange {
	startDate: Date;
	endDate: Date;
}

export interface AnalysisCall {
	id: string;
	date: Date;
	duration: number;
	agentName: string;
	campaign: string;

	// QA specific
	qaScore?: number;
	qaStatus?: 'pass' | 'fail';
	qaCategory?: string;

	// Emotion & Sentiment specific
	agentEmotion?: string;
	customerEmotion?: string;
	sentimentScore?: number;
	recoveryStatus?: 'recovered' | 'unresolved';
	tone?: string;

	// Compliance specific
	violationsFound?: number;
	complianceSeverity?: 'critical' | 'high' | 'medium' | 'low';
	violationType?: string;
	complianceStatus?: 'compliant' | 'violation';

	// Behavioral specific
	engagementLevel?: number;
	responseTime?: number;
	handlingQuality?: number;
	customerSatisfaction?: number;
}

export interface AggregatedMetric {
	label: string;
	value: string | number;
	suffix?: string;
	trend?: 'up' | 'down' | 'neutral';
}

export interface AggregatedMetrics {
	qa: AggregatedMetric[];
	emotion: AggregatedMetric[];
	compliance: AggregatedMetric[];
	behavioral: AggregatedMetric[];
}
