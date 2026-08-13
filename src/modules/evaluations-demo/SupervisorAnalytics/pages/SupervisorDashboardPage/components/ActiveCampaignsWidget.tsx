import React, { useMemo } from 'react';
import {
	Card,
	Table,
	Text,
	Badge,
	Group,
	Stack,
	ThemeIcon,
} from '@mantine/core';
import {
	IconTrendingUp,
	IconTrendingDown,
	IconBriefcase,
} from '@tabler/icons-react';
import type { DemoAgentCall } from '../../../../AgentDashboard/types';
import styles from './ActiveCampaignsWidget.module.css';

interface ActiveCampaignsWidgetProps {
	calls: DemoAgentCall[];
}

interface CampaignMetrics {
	campaign: string;
	score: number;
	callCount: number;
	trend: 'up' | 'down' | 'stable';
	changePercent: number;
}

const ActiveCampaignsWidget: React.FC<ActiveCampaignsWidgetProps> = ({
	calls,
}) => {
	const campaigns = useMemo(() => {
		const campaignMap = new Map<string, DemoAgentCall[]>();

		// Group calls by campaign
		calls.forEach((call) => {
			if (!campaignMap.has(call.campaign)) {
				campaignMap.set(call.campaign, []);
			}
			campaignMap.get(call.campaign)!.push(call);
		});

		// Calculate metrics for each campaign
		const metrics: CampaignMetrics[] = [];
		campaignMap.forEach((callsList, campaign) => {
			if (callsList.length > 0) {
				const scores = callsList
					.map((c) => c.score)
					.filter((s) => s !== null) as number[];

				if (scores.length > 0) {
					const avg = Math.round(
						scores.reduce((a, b) => a + b, 0) / scores.length
					);

					// Determine trend based on recency
					const sorted = [...callsList].sort(
						(a, b) =>
							new Date(b.callDate).getTime() - new Date(a.callDate).getTime()
					);
					const midpoint = Math.ceil(sorted.length / 2);
					const recentScores = sorted
						.slice(0, midpoint)
						.map((c) => c.score)
						.filter((s) => s !== null) as number[];
					const previousScores = sorted
						.slice(midpoint)
						.map((c) => c.score)
						.filter((s) => s !== null) as number[];

					const recentAvg =
						recentScores.length > 0
							? Math.round(
									recentScores.reduce((a, b) => a + b, 0) / recentScores.length
								)
							: 0;
					const previousAvg =
						previousScores.length > 0
							? Math.round(
									previousScores.reduce((a, b) => a + b, 0) /
										previousScores.length
								)
							: 0;

					const change = recentAvg - previousAvg;
					const trend: 'up' | 'down' | 'stable' =
						change > 2 ? 'up' : change < -2 ? 'down' : 'stable';

					metrics.push({
						campaign,
						score: avg,
						callCount: callsList.length,
						trend,
						changePercent: Math.abs(change),
					});
				}
			}
		});

		return metrics.sort((a, b) => b.score - a.score);
	}, [calls]);

	const getTrendIcon = (trend: 'up' | 'down' | 'stable'): React.ReactNode => {
		switch (trend) {
			case 'up':
				return (
					<IconTrendingUp size={16} color='var(--mantine-color-green-6)' />
				);
			case 'down':
				return (
					<IconTrendingDown size={16} color='var(--mantine-color-red-6)' />
				);
			default:
				return (
					<IconTrendingUp
						size={16}
						color='var(--mantine-color-gray-6)'
						className={styles.stableIcon}
					/>
				);
		}
	};

	const getTrendBadgeColor = (trend: 'up' | 'down' | 'stable'): string => {
		switch (trend) {
			case 'up':
				return 'green';
			case 'down':
				return 'red';
			default:
				return 'gray';
		}
	};

	const getTrendLabel = (trend: 'up' | 'down' | 'stable'): string => {
		switch (trend) {
			case 'up':
				return 'Uptrending';
			case 'down':
				return 'Downtrending';
			default:
				return 'Stable';
		}
	};

	const getScoreColor = (score: number): string => {
		if (score >= 85) return 'green';
		if (score >= 70) return 'yellow';
		return 'red';
	};

	return (
		<Card withBorder radius='md' shadow='sm' className={styles.card}>
			<Card.Section withBorder inheritPadding py='md'>
				<Group gap='xs'>
					<ThemeIcon
						size='lg'
						radius='md'
						variant='light'
						color='blue'
						className={styles.icon}
					>
						<IconBriefcase size={20} />
					</ThemeIcon>
					<Stack gap={0}>
						<Text fw={700} size='lg'>
							Active Campaigns
						</Text>
						<Text size='sm' c='dimmed'>
							Campaign performance & trends
						</Text>
					</Stack>
				</Group>
			</Card.Section>

			<Card.Section>
				{campaigns.length > 0 ? (
					<Table striped highlightOnHover className={styles.table}>
						<Table.Thead>
							<Table.Tr>
								<Table.Th>Campaign</Table.Th>
								<Table.Th>Score</Table.Th>
								<Table.Th>Trend</Table.Th>
								<Table.Th>Calls</Table.Th>
							</Table.Tr>
						</Table.Thead>
						<Table.Tbody>
							{campaigns.map((campaign) => (
								<Table.Tr key={campaign.campaign}>
									<Table.Td fw={500}>{campaign.campaign}</Table.Td>
									<Table.Td>
										<Badge
											variant='light'
											color={getScoreColor(campaign.score)}
											size='sm'
										>
											{campaign.score}%
										</Badge>
									</Table.Td>
									<Table.Td>
										<Group gap={4}>
											{getTrendIcon(campaign.trend)}
											<Badge
												variant='light'
												color={getTrendBadgeColor(campaign.trend)}
												size='sm'
											>
												{getTrendLabel(campaign.trend)}
											</Badge>
										</Group>
									</Table.Td>
									<Table.Td>
										<Text size='sm' c='dimmed'>
											{campaign.callCount}
										</Text>
									</Table.Td>
								</Table.Tr>
							))}
						</Table.Tbody>
					</Table>
				) : (
					<Text p='md' c='dimmed' ta='center'>
						No active campaigns
					</Text>
				)}
			</Card.Section>
		</Card>
	);
};

export default ActiveCampaignsWidget;
