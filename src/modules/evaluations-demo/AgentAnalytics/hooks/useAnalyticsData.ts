import { useMemo } from 'react';
import {
	AnalysisType,
	AnalysisCall,
	DateRange,
	AggregatedMetric,
} from '../types/analyticsTypes';

const CAMPAIGNS = [
	'Customer Support Quality',
	'Sales Campaign A',
	'Billing Department',
	'Technical Support',
	'Customer Retention',
];

const generateMockCalls = (): AnalysisCall[] => {
	const calls: AnalysisCall[] = [];
	const baseDate = new Date();

	for (let i = 0; i < 45; i++) {
		const callDate = new Date(baseDate);
		callDate.setDate(callDate.getDate() - Math.floor(Math.random() * 30));

		calls.push({
			id: `CALL-${String(i + 1).padStart(4, '0')}`,
			date: callDate,
			duration: Math.floor(Math.random() * 900) + 60,
			agentName: `Agent ${Math.floor(Math.random() * 5) + 1}`,
			campaign: CAMPAIGNS[Math.floor(Math.random() * CAMPAIGNS.length)],

			// QA metrics
			qaScore: Math.floor(Math.random() * 40) + 60,
			qaStatus: Math.random() > 0.3 ? 'pass' : 'fail',
			qaCategory: ['Sales', 'Support', 'Billing'][
				Math.floor(Math.random() * 3)
			],

			// Emotion & Sentiment
			agentEmotion: ['NEUTRAL', 'JOY', 'FRUSTRATION', 'EMPATHY'][
				Math.floor(Math.random() * 4)
			],
			customerEmotion: ['NEUTRAL', 'JOY', 'ANGER', 'FRUSTRATION', 'SADNESS'][
				Math.floor(Math.random() * 5)
			],
			sentimentScore: Math.random() * 2 - 1,
			recoveryStatus: Math.random() > 0.4 ? 'recovered' : 'unresolved',
			tone: ['Professional', 'Friendly', 'Formal'][
				Math.floor(Math.random() * 3)
			],

			// Compliance
			violationsFound: Math.floor(Math.random() * 3),
			complianceSeverity: ['critical', 'high', 'medium', 'low'][
				Math.floor(Math.random() * 4)
			] as any,
			violationType: ['Policy', 'Documentation', 'Procedure'][
				Math.floor(Math.random() * 3)
			],
			complianceStatus: Math.random() > 0.2 ? 'compliant' : 'violation',

			// Behavioral
			engagementLevel: Math.floor(Math.random() * 40) + 60,
			responseTime: Math.floor(Math.random() * 30) + 5,
			handlingQuality: Math.floor(Math.random() * 40) + 60,
			customerSatisfaction: Math.floor(Math.random() * 3) + 2,
		});
	}

	return calls;
};

export const useAnalyticsData = (
	analysisType: AnalysisType,
	dateRange: DateRange,
	_compareEnabled: boolean,
	selectedCampaigns: string[] = [],
	minScore?: number,
	maxScore?: number,
	selectedAutofail?: string[],
	selectedDisputes?: string[]
) => {
	const mockCalls = useMemo(() => generateMockCalls(), []);

	const filteredCalls = useMemo(() => {
		return mockCalls.filter((call) => {
			const callDate = new Date(call.date);
			const isInDateRange =
				callDate >= dateRange.startDate && callDate <= dateRange.endDate;

			if (!isInDateRange) return false;

			if (selectedCampaigns.length > 0 && !selectedCampaigns.includes(call.campaign)) {
				return false;
			}

			if (minScore !== undefined && call.qaScore && call.qaScore < minScore) {
				return false;
			}

			if (maxScore !== undefined && call.qaScore && call.qaScore > maxScore) {
				return false;
			}

			if (selectedAutofail && selectedAutofail.length > 0 && !selectedAutofail.includes('All')) {
				// Mock autofail filtering - in real app this would come from call data
				return true;
			}

			if (selectedDisputes && selectedDisputes.length > 0 && !selectedDisputes.includes('All')) {
				// Mock dispute filtering - in real app this would come from call data
				return true;
			}

			return true;
		});
	}, [mockCalls, dateRange, selectedCampaigns, minScore, maxScore, selectedAutofail, selectedDisputes]);

	const aggregatedMetrics = useMemo<AggregatedMetric[]>(() => {
		if (filteredCalls.length === 0) {
			return [];
		}

		switch (analysisType) {
			case 'qa': {
				const avgScore =
					filteredCalls.reduce((sum, c) => sum + (c.qaScore || 0), 0) /
					filteredCalls.length;
				const passCount = filteredCalls.filter(
					(c) => c.qaStatus === 'pass'
				).length;

				return [
					{
						label: 'Average Quality Score',
						value: Math.round(avgScore),
						suffix: '',
					},
					{
						label: 'Total Calls Evaluated',
						value: filteredCalls.length,
						suffix: '',
					},
					{ label: 'Avg. Metric Card', value: Math.round(avgScore), suffix: '' },
					{ label: 'Conversations Passed', value: passCount, suffix: '' },
				];
			}

			case 'emotion': {
				const avgSentiment =
					filteredCalls.reduce((sum, c) => sum + (c.sentimentScore || 0), 0) /
					filteredCalls.length;

				// Calculate predominant emotion
				const emotionCounts: Record<string, number> = {};
				filteredCalls.forEach((c) => {
					if (c.agentEmotion) {
						emotionCounts[c.agentEmotion] = (emotionCounts[c.agentEmotion] || 0) + 1;
					}
				});
				const predominantEmotion = Object.entries(emotionCounts).sort(
					(a, b) => b[1] - a[1]
				)[0];
				const predominantEmotionPercentage = predominantEmotion
					? Math.round((predominantEmotion[1] / filteredCalls.length) * 100)
					: 0;

				const empathyCount = filteredCalls.filter(
					(c) => c.agentEmotion === 'EMPATHY'
				).length;
				const recoveredCount = filteredCalls.filter(
					(c) => c.recoveryStatus === 'recovered'
				).length;
				const recoveryRate = (recoveredCount / filteredCalls.length) * 100;

				return [
					{
						label: 'Average Sentiment Score',
						value: avgSentiment.toFixed(2),
						suffix: '',
					},
					{
						label: `Predominant Emotion (${predominantEmotion?.[0] || 'N/A'})`,
						value: predominantEmotionPercentage,
						suffix: '%',
					},
					{ label: 'Empathy Indicators', value: empathyCount, suffix: '' },
					{
						label: 'Recovery Rate',
						value: Math.round(recoveryRate),
						suffix: '%',
					},
				];
			}

			case 'compliance': {
				const compliantCount = filteredCalls.filter(
					(c) => c.complianceStatus === 'compliant'
				).length;
				const complianceRate = (compliantCount / filteredCalls.length) * 100;
				const totalViolations = filteredCalls.reduce(
					(sum, c) => sum + (c.violationsFound || 0),
					0
				);
				const criticalCount = filteredCalls.filter(
					(c) => c.complianceSeverity === 'critical'
				).length;

				return [
					{
						label: 'Compliance Score',
						value: Math.round(complianceRate),
						suffix: '%',
					},
					{ label: 'Total Violations', value: totalViolations, suffix: '' },
					{ label: 'Critical Issues', value: criticalCount, suffix: '' },
					{
						label: 'Resolved Issues',
						value: Math.floor(totalViolations * 0.7),
						suffix: '',
					},
				];
			}

			case 'behavioral': {
				const avgEngagement =
					filteredCalls.reduce((sum, c) => sum + (c.engagementLevel || 0), 0) /
					filteredCalls.length;
				const avgResponseTime =
					filteredCalls.reduce((sum, c) => sum + (c.responseTime || 0), 0) /
					filteredCalls.length;
				const avgQuality =
					filteredCalls.reduce((sum, c) => sum + (c.handlingQuality || 0), 0) /
					filteredCalls.length;
				const avgSatisfaction =
					filteredCalls.reduce(
						(sum, c) => sum + (c.customerSatisfaction || 0),
						0
					) / filteredCalls.length;

				return [
					{
						label: 'Engagement Score',
						value: Math.round(avgEngagement),
						suffix: '',
					},
					{
						label: 'Avg Response Time',
						value: Math.round(avgResponseTime),
						suffix: 's',
					},
					{
						label: 'Call Handling Quality',
						value: Math.round(avgQuality),
						suffix: '%',
					},
					{
						label: 'Customer Satisfaction',
						value: avgSatisfaction.toFixed(1),
						suffix: '/5',
					},
				];
			}

			default:
				return [];
		}
	}, [analysisType, filteredCalls]);

	return {
		calls: filteredCalls,
		aggregatedMetrics,
		totalCalls: filteredCalls.length,
	};
};
