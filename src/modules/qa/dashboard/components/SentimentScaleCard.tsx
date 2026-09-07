import React from 'react';
import { Card, SimpleGrid, Text, Group, Stack, Progress, ThemeIcon } from '@mantine/core';
import { IconMood, IconMoodSmile, IconMoodNeutral, IconMoodEmpty, IconMoodCry } from '@tabler/icons-react';
import styles from '../Dashboard.module.css';

interface SentimentScaleCardProps {
	agentScore?: number | null;
	customerScore?: number | null;
	clientAverageScore?: number | null;
	compact?: boolean;
}

const sentimentConfig = [
	{ value: 1, label: 'Very Negative', color: '#FA5252', icon: IconMoodCry },
	{ value: 2, label: 'Negative', color: '#FD7E14', icon: IconMoodEmpty },
	{ value: 3, label: 'Neutral', color: '#FFD43B', icon: IconMoodNeutral },
	{ value: 4, label: 'Positive', color: '#94D82D', icon: IconMoodSmile },
	{ value: 5, label: 'Very Positive', color: '#51CF66', icon: IconMood },
];

const getSentimentConfig = (score: number | null | undefined) => {
	if (score === null || score === undefined) return null;
	return sentimentConfig.find((s) => s.value === Math.round(score));
};

const SentimentBadge: React.FC<{ score: number | null | undefined; label: string }> = ({ score, label }) => {
	const config = getSentimentConfig(score);
	if (!config) return <Text size="sm">N/A</Text>;

	const Icon = config.icon;
	return (
		<div>
			<Text size="xs" c="dimmed" mb={8}>
				{label}
			</Text>
			<Group gap="xs" align="center">
				<ThemeIcon size="lg" style={{ backgroundColor: config.color }} radius="md">
					<Icon size={20} color="white" />
				</ThemeIcon>
				<div>
					<Text fw={700} size="md">
						{score}
					</Text>
					<Text size="xs" c="dimmed">
						{config.label}
					</Text>
				</div>
			</Group>
		</div>
	);
};

export const SentimentScaleCard: React.FC<SentimentScaleCardProps> = ({
	agentScore,
	customerScore,
	clientAverageScore,
	compact = false,
}) => {
	if (compact) {
		return (
			<Card className={styles.metricCard} p="md" radius="md" withBorder>
				<Stack gap="xs">
					<Text fw={600} size="sm">
						Sentiment (5.0 Scale)
					</Text>
					{agentScore !== null && agentScore !== undefined && (
						<Group gap="xs">
							<Text size="xs" fw={500}>
								Agent:
							</Text>
							<Text fw={700} size="sm">
								{agentScore.toFixed(1)}
							</Text>
						</Group>
					)}
					{customerScore !== null && customerScore !== undefined && (
						<Group gap="xs">
							<Text size="xs" fw={500}>
								Customer:
							</Text>
							<Text fw={700} size="sm">
								{customerScore.toFixed(1)}
							</Text>
						</Group>
					)}
					{clientAverageScore !== null && clientAverageScore !== undefined && (
						<Group gap="xs">
							<Text size="xs" fw={500}>
								Client Avg:
							</Text>
							<Text fw={700} size="sm">
								{clientAverageScore.toFixed(1)}
							</Text>
						</Group>
					)}
				</Stack>
			</Card>
		);
	}

	return (
		<Card className={styles.metricCard} p="lg" radius="md" withBorder>
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
				</Group>

				<SimpleGrid cols={3} spacing="lg">
					<SentimentBadge score={agentScore} label="Agent Sentiment" />
					<SentimentBadge score={customerScore} label="Customer Sentiment" />
					<SentimentBadge score={clientAverageScore} label="Client Average" />
				</SimpleGrid>

				<div>
					<Text size="xs" c="dimmed" fw={500} mb={8}>
						Scale Reference
					</Text>
					<Stack gap={4}>
						{sentimentConfig.map((config) => (
							<Group key={config.value} gap="xs" justify="space-between">
								<Text size="xs">{config.label}</Text>
								<Progress value={(config.value / 5) * 100} size="sm" color={config.color} style={{ flex: 1 }} />
								<Text size="xs" fw={600} w={30} ta="right">
									{config.value}
								</Text>
							</Group>
						))}
					</Stack>
				</div>
			</Stack>
		</Card>
	);
};
