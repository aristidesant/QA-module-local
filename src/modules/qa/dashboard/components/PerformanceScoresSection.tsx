import React from 'react';
import {
	Card,
	SimpleGrid,
	Text,
	ThemeIcon,
	Group,
	Stack,
	Progress,
	Badge,
} from '@mantine/core';
import {
	IconChartBar,
	IconMoodSmile,
	IconShieldCheck,
	IconSparkles,
} from '@tabler/icons-react';
import type { WeeklyMetrics } from '../mockData';
import styles from '../Dashboard.module.css';

interface PerformanceScoresSectionProps {
	metrics: WeeklyMetrics;
}

const getComplianceColor = (status: 'compliant' | 'warning' | 'violation') => {
	switch (status) {
		case 'compliant':
			return 'teal';
		case 'warning':
			return 'yellow';
		case 'violation':
			return 'red';
		default:
			return 'gray';
	}
};

const getComplianceProgressColor = (
	status: 'compliant' | 'warning' | 'violation'
) => {
	switch (status) {
		case 'compliant':
			return 'teal';
		case 'warning':
			return 'yellow';
		case 'violation':
			return 'red';
		default:
			return 'gray';
	}
};

const QAScoreCard: React.FC<{ qaScore: WeeklyMetrics['qaScore'] }> = ({
	qaScore,
}) => (
	<Card className={styles.metricCard} p="lg" radius="md" withBorder shadow="sm">
		<Stack gap="md">
			<Group justify="space-between" align="flex-start">
				<div>
					<Text fw={600} size="md">
						QA Score
					</Text>
					<Text size="xs" c="dimmed">
						Performance Breakdown
					</Text>
				</div>
				<ThemeIcon size="lg" color="blue" radius="md">
					<IconChartBar size={20} />
				</ThemeIcon>
			</Group>

			<div>
				<Group justify="space-between" mb="xs">
					<Text size="lg" fw={700}>
						{qaScore.total}%
					</Text>
					<Text size="xs" c="dimmed">
						Total Score
					</Text>
				</Group>
				<Progress value={qaScore.total} size="md" color="blue" />
			</div>

			<Stack gap="sm">
				<div>
					<Group justify="space-between" mb={4}>
						<Text size="sm" fw={500}>
							ECN (Business Critical)
						</Text>
						<Text size="sm" fw={600}>
							{qaScore.ecn}%
						</Text>
					</Group>
					<Progress value={qaScore.ecn} size="sm" color="cyan" />
				</div>
				<div>
					<Group justify="space-between" mb={4}>
						<Text size="sm" fw={500}>
							ENC (Non-Critical)
						</Text>
						<Text size="sm" fw={600}>
							{qaScore.enc}%
						</Text>
					</Group>
					<Progress value={qaScore.enc} size="sm" color="blue" />
				</div>
				<div>
					<Group justify="space-between" mb={4}>
						<Text size="sm" fw={500}>
							ECC (Compliance)
						</Text>
						<Text size="sm" fw={600}>
							{qaScore.ecc}%
						</Text>
					</Group>
					<Progress value={qaScore.ecc} size="sm" color="grape" />
				</div>
				<div>
					<Group justify="space-between" mb={4}>
						<Text size="sm" fw={500}>
							ECUF (End-User)
						</Text>
						<Text size="sm" fw={600}>
							{qaScore.ecuf}%
						</Text>
					</Group>
					<Progress value={qaScore.ecuf} size="sm" color="indigo" />
				</div>
			</Stack>
		</Stack>
	</Card>
);

const SentimentEmotionCard: React.FC<{
	sentiment: WeeklyMetrics['sentiment'];
}> = ({ sentiment }) => (
	<Card className={styles.metricCard} p="lg" radius="md" withBorder shadow="sm">
		<Stack gap="md">
			<Group justify="space-between" align="flex-start">
				<div>
					<Text fw={600} size="md">
						Sentiment & Emotion
					</Text>
					<Text size="xs" c="dimmed">
						5.0 Scale Assessment
					</Text>
				</div>
				<ThemeIcon size="lg" color="yellow" radius="md">
					<IconMoodSmile size={20} />
				</ThemeIcon>
			</Group>

			<SimpleGrid cols={2} spacing="md">
				<div>
					<Text size="xs" c="dimmed" fw={500} mb="xs">
						Agent Average
					</Text>
					<Group gap="xs" align="baseline">
						<Text fw={700} size="xl">
							{sentiment.agentAvg.toFixed(1)}
						</Text>
						<Text size="xs" c="dimmed">
							/ 5.0
						</Text>
					</Group>
				</div>
				<div>
					<Text size="xs" c="dimmed" fw={500} mb="xs">
						Customer Average
					</Text>
					<Group gap="xs" align="baseline">
						<Text fw={700} size="xl">
							{sentiment.customerAvg.toFixed(1)}
						</Text>
						<Text size="xs" c="dimmed">
							/ 5.0
						</Text>
					</Group>
				</div>
			</SimpleGrid>

			<div>
				<Text size="xs" c="dimmed" fw={500} mb="xs">
					Predominant Emotion
				</Text>
				<Badge color="green" variant="light" size="lg">
					{sentiment.predominantEmotion}
				</Badge>
			</div>
		</Stack>
	</Card>
);

const ComplianceScoreCard: React.FC<{
	categories: WeeklyMetrics['complianceCategories'];
}> = ({ categories }) => (
	<Card className={styles.metricCard} p="lg" radius="md" withBorder shadow="sm">
		<Stack gap="md">
			<Group justify="space-between" align="flex-start">
				<div>
					<Text fw={600} size="md">
						Compliance Score
					</Text>
					<Text size="xs" c="dimmed">
						Category Overview
					</Text>
				</div>
				<ThemeIcon size="lg" color="green" radius="md">
					<IconShieldCheck size={20} />
				</ThemeIcon>
			</Group>

			<Stack gap="sm">
				{categories.map((category) => (
					<div key={category.name}>
						<Group justify="space-between" mb={4}>
							<Group gap="xs" align="center">
								<Text size="sm" fw={500}>
									{category.name}
								</Text>
								<Badge
									size="xs"
									color={getComplianceColor(category.status)}
									variant="light"
								>
									{category.status.charAt(0).toUpperCase() +
										category.status.slice(1)}
								</Badge>
							</Group>
							<Text size="sm" fw={600}>
								{category.score}%
							</Text>
						</Group>
						<Progress
							value={category.score}
							size="sm"
							color={getComplianceProgressColor(category.status)}
						/>
					</div>
				))}
			</Stack>
		</Stack>
	</Card>
);

const BusinessInsightsCard: React.FC<{
	insights: WeeklyMetrics['businessInsights'];
}> = ({ insights }) => (
	<Card className={styles.metricCard} p="lg" radius="md" withBorder shadow="sm">
		<Stack gap="md">
			<Group justify="space-between" align="flex-start">
				<div>
					<Text fw={600} size="md">
						Business Insights
					</Text>
					<Text size="xs" c="dimmed">
						Objection & Offer Analysis
					</Text>
				</div>
				<ThemeIcon size="lg" color="violet" radius="md">
					<IconSparkles size={20} />
				</ThemeIcon>
			</Group>

			<Stack gap="sm">
				{insights.map((insight) => (
					<Group
						key={insight.type}
						justify="space-between"
						p="xs"
						style={{
							backgroundColor:
								'var(--mantine-color-gray-0)',
							borderRadius: 'var(--mantine-radius-md)',
						}}
					>
						<div>
							<Text size="sm" fw={500}>
								{insight.type}
							</Text>
						</div>
						<Group gap="xs" align="center">
							<Text size="sm" fw={600}>
								{insight.count}
							</Text>
							<Badge size="sm" variant="dot">
								{insight.percentage}%
							</Badge>
						</Group>
					</Group>
				))}
			</Stack>
		</Stack>
	</Card>
);

export const PerformanceScoresSection: React.FC<PerformanceScoresSectionProps> =
	({ metrics }) => {
		return (
			<SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="md">
				<QAScoreCard qaScore={metrics.qaScore} />
				<SentimentEmotionCard sentiment={metrics.sentiment} />
				<ComplianceScoreCard categories={metrics.complianceCategories} />
				<BusinessInsightsCard insights={metrics.businessInsights} />
			</SimpleGrid>
		);
	};

export default PerformanceScoresSection;
