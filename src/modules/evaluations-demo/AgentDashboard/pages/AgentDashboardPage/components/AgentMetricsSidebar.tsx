import React, { useMemo } from 'react';
import { Card, Stack, Text, Group, Badge, ThemeIcon } from '@mantine/core';
import {
	IconPhone,
	IconBriefcase,
	IconAlertCircle,
	IconTrendingDown,
} from '@tabler/icons-react';
import type { DemoAgentCall } from '../../../types';
import type { DemoAgentWeeklyKpis } from '../../../types';
import styles from './AgentMetricsSidebar.module.css';

interface AgentMetricsSidebarProps {
	calls: DemoAgentCall[];
	kpis: DemoAgentWeeklyKpis;
}

const AgentMetricsSidebar: React.FC<AgentMetricsSidebarProps> = ({
	calls,
	kpis,
}) => {
	const metrics = useMemo(() => {
		// Weekly call volume from KPIs
		const weeklyCallVolume = kpis.totalCalls;

		// Active campaigns (unique campaigns from calls)
		const activeCampaigns = new Set(calls.map((c) => c.campaign)).size;

		// Open disputes (mock: count calls with disputed flag)
		const openDisputes = calls.filter((c) => c.disputed).length;

		// Lowest performance campaign
		const campaignMap = new Map<string, number[]>();
		calls.forEach((call) => {
			if (!campaignMap.has(call.campaign)) {
				campaignMap.set(call.campaign, []);
			}
			if (call.score !== null) {
				campaignMap.get(call.campaign)!.push(call.score);
			}
		});

		let lowestCampaign = { name: 'N/A', score: 100 };
		campaignMap.forEach((scores, campaign) => {
			const avg = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
			if (avg < lowestCampaign.score) {
				lowestCampaign = { name: campaign, score: avg };
			}
		});

		return {
			weeklyCallVolume,
			activeCampaigns,
			openDisputes,
			lowestCampaign,
		};
	}, [calls, kpis]);

	return (
		<Card withBorder radius='md' shadow='sm' className={styles.card}>
			<Stack gap='md'>
				{/* Weekly Call Volume */}
				<div className={styles.metricItem}>
					<Group justify='space-between' mb='xs'>
						<Group gap='xs'>
							<ThemeIcon
								size='md'
								radius='md'
								variant='light'
								color='blue'
								className={styles.icon}
							>
								<IconPhone size={16} />
							</ThemeIcon>
							<div>
								<Text size='xs' c='dimmed' fw={500}>
									Weekly Calls
								</Text>
								<Text fw={700} size='lg'>
									{metrics.weeklyCallVolume}
								</Text>
							</div>
						</Group>
					</Group>
				</div>

				{/* Active Campaigns */}
				<div className={styles.metricItem}>
					<Group justify='space-between' mb='xs'>
						<Group gap='xs'>
							<ThemeIcon
								size='md'
								radius='md'
								variant='light'
								color='green'
								className={styles.icon}
							>
								<IconBriefcase size={16} />
							</ThemeIcon>
							<div>
								<Text size='xs' c='dimmed' fw={500}>
									Active Campaigns
								</Text>
								<Text fw={700} size='lg'>
									{metrics.activeCampaigns}
								</Text>
							</div>
						</Group>
					</Group>
				</div>

				{/* Open Disputes */}
				<div className={styles.metricItem}>
					<Group justify='space-between' mb='xs'>
						<Group gap='xs'>
							<ThemeIcon
								size='md'
								radius='md'
								variant='light'
								color='yellow'
								className={styles.icon}
							>
								<IconAlertCircle size={16} />
							</ThemeIcon>
							<div>
								<Text size='xs' c='dimmed' fw={500}>
									Open Disputes
								</Text>
								<Text fw={700} size='lg'>
									{metrics.openDisputes}
								</Text>
							</div>
						</Group>
					</Group>
				</div>

				{/* Lowest Performance Campaign */}
				<div className={styles.metricItem}>
					<Group justify='space-between' mb='xs'>
						<Group gap='xs'>
							<ThemeIcon
								size='md'
								radius='md'
								variant='light'
								color='red'
								className={styles.icon}
							>
								<IconTrendingDown size={16} />
							</ThemeIcon>
							<div>
								<Text size='xs' c='dimmed' fw={500}>
									Lowest Campaign
								</Text>
								<Stack gap={2}>
									<Text fw={700} size='sm' lineClamp={1}>
										{metrics.lowestCampaign.name}
									</Text>
									<Badge
										variant='light'
										color={
											metrics.lowestCampaign.score >= 70 ? 'yellow' : 'red'
										}
										size='xs'
									>
										{metrics.lowestCampaign.score}%
									</Badge>
								</Stack>
							</div>
						</Group>
					</Group>
				</div>
			</Stack>
		</Card>
	);
};

export default AgentMetricsSidebar;
