import React from 'react';
import { Container, Stack, Grid, Group, Text, Title, SimpleGrid, Tabs, Card } from '@mantine/core';
import styles from '../Dashboard.module.css';

/**
 * Adaptive Dashboard Layout Pattern
 *
 * Provides a consistent structure for all role dashboards:
 * - Header with role-specific title and key metric
 * - Metric cards section (COPC, Sentiment, Compliance, Auto-Fails, etc.)
 * - Alerts section
 * - Tabbed content area with role-specific tabs
 * - Optional widget (rankings, health, etc.)
 */

interface DashboardMetricCard {
	id: string;
	component: React.ReactNode;
	compact?: boolean;
}

interface DashboardTab {
	value: string;
	label: string;
	content: React.ReactNode;
}

interface AdaptiveDashboardLayoutProps {
	role: 'agent' | 'supervisor' | 'qaManager' | 'operationManager';
	title: string;
	keyMetric?: {
		label: string;
		value: string | number;
		color?: string;
	};
	metricCards: DashboardMetricCard[];
	alertsComponent?: React.ReactNode;
	tabs: DashboardTab[];
	widget?: React.ReactNode;
	loading?: boolean;
}

export const AdaptiveDashboardLayout: React.FC<AdaptiveDashboardLayoutProps> = ({
	role,
	title,
	keyMetric,
	metricCards,
	alertsComponent,
	tabs,
	widget,
	loading = false,
}) => {
	return (
		<Container size="xl" py="lg">
			<Stack gap="xl">
				{/* Header */}
				<div>
					<Group justify="space-between" align="flex-start" mb="md">
						<div>
							<Title order={1} size="h2">
								{title}
							</Title>
							<Text size="sm" c="dimmed">
								Role: <strong>{role.charAt(0).toUpperCase() + role.slice(1)}</strong>
							</Text>
						</div>
						{keyMetric && (
							<Card p="md" radius="md" withBorder style={{ minWidth: 200 }}>
								<Stack gap={4}>
									<Text size="xs" c="dimmed">
										{keyMetric.label}
									</Text>
									<Text fw={700} size="xl" c={keyMetric.color}>
										{keyMetric.value}
									</Text>
								</Stack>
							</Card>
						)}
					</Group>
				</div>

				{/* Metric Cards Section */}
				<div>
					<Text fw={600} mb="md" size="sm">
						Key Metrics
					</Text>
					<SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="lg">
						{metricCards.map((card) => (
							<div key={card.id}>{card.component}</div>
						))}
					</SimpleGrid>
				</div>

				{/* Alerts Section */}
				{alertsComponent && (
					<div>
						<Text fw={600} mb="md" size="sm">
							Alerts
						</Text>
						{alertsComponent}
					</div>
				)}

				{/* Tabbed Content Area */}
				{tabs.length > 0 && (
					<Tabs defaultValue={tabs[0]?.value}>
						<Tabs.List>
							{tabs.map((tab) => (
								<Tabs.Tab key={tab.value} value={tab.value}>
									{tab.label}
								</Tabs.Tab>
							))}
						</Tabs.List>

						{tabs.map((tab) => (
							<Tabs.Panel key={tab.value} value={tab.value} pt="lg">
								{tab.content}
							</Tabs.Panel>
						))}
					</Tabs>
				)}

				{/* Optional Widget */}
				{widget && (
					<div>
						<Text fw={600} mb="md" size="sm">
							Performance Widget
						</Text>
						{widget}
					</div>
				)}
			</Stack>
		</Container>
	);
};

/**
 * Helper hook to calculate COPC metrics for a group of evaluations
 */
export const useCOPCMetrics = (evaluations: any[]) => {
	return React.useMemo(() => {
		if (!evaluations.length) {
			return { ecn: 0, enc: 0, ecc: 0, ecuf: 0, total: 0 };
		}

		let ecn = 0,
			enc = 0,
			ecc = 0,
			ecuf = 0;

		evaluations.forEach((eval) => {
			if (eval.qaDetails) {
				ecn += eval.qaDetails.errorCriticoBusiness ?? 0;
				enc += eval.qaDetails.errorCriticoNonBusiness ?? 0;
				ecc += eval.qaDetails.errorCriticoCompliance ?? 0;
				ecuf += eval.qaDetails.errorCriticoEndUser ?? 0;
			}
		});

		return {
			ecn,
			enc,
			ecc,
			ecuf,
			total: ecn + enc + ecc + ecuf,
		};
	}, [evaluations]);
};

/**
 * Helper hook to calculate average sentiment for evaluations
 */
export const useAverageSentiment = (evaluations: any[]) => {
	return React.useMemo(() => {
		if (!evaluations.length) {
			return { agentAvg: 0, customerAvg: 0, total: 0 };
		}

		let agentSum = 0,
			customerSum = 0,
			count = 0;

		evaluations.forEach((eval) => {
			if (eval.agentSentimentScore) {
				agentSum += eval.agentSentimentScore;
			}
			if (eval.customerSentimentScore) {
				customerSum += eval.customerSentimentScore;
			}
			if (eval.agentSentimentScore || eval.customerSentimentScore) {
				count++;
			}
		});

		return {
			agentAvg: count > 0 ? agentSum / count : 0,
			customerAvg: count > 0 ? customerSum / count : 0,
			total: count,
		};
	}, [evaluations]);
};

/**
 * Helper hook to count auto-fails
 */
export const useAutoFailCount = (evaluations: any[]) => {
	return React.useMemo(() => {
		if (!evaluations.length) {
			return { total: 0, critical: 0, evaluated: 0 };
		}

		let total = 0,
			critical = 0;
		const evaluated = evaluations.filter((e) => (e.autoFailCount ?? 0) > 0).length;

		evaluations.forEach((eval) => {
			total += eval.autoFailCount ?? 0;
			if (eval.qaInvalidated) {
				critical++;
			}
		});

		return { total, critical, evaluated };
	}, [evaluations]);
};
