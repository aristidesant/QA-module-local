import React from 'react';
import { Badge, Group, Paper, Stack, Tabs, Text } from '@mantine/core';
import {
	IconAward,
	IconChartBar,
	IconHeartHandshake,
} from '@tabler/icons-react';
import AppDrawer from '~/components/AppDrawer';
import type { AgentRankingEntry } from '~/modules/qa/dashboard/mockData';
import AchievementsTab from './tabs/AchievementsTab';
import MetricsTab from './tabs/MetricsTab';
import ReactionsTab from './tabs/ReactionsTab';
import styles from './RankingDetailDrawer.module.css';

export interface RankingDetailDrawerProps {
	/** Row the drawer describes. `null` keeps the drawer unmounted. */
	entry: AgentRankingEntry | null;
	opened: boolean;
	onClose: () => void;
}

interface QuickStatProps {
	label: string;
	value: React.ReactNode;
}

const QuickStat: React.FC<QuickStatProps> = ({ label, value }) => (
	<div className={styles.stat}>
		<Text size='xs' c='dimmed' tt='uppercase' fw={600}>
			{label}
		</Text>
		<Text size='xl' fw={700} className={styles.statValue}>
			{value}
		</Text>
	</div>
);

/**
 * Detail drawer for a leaderboard row: quick stats plus achievements, peer
 * reactions and metric comparison tabs.
 */
export const RankingDetailDrawer: React.FC<RankingDetailDrawerProps> = ({
	entry,
	opened,
	onClose,
}) => {
	if (!entry) return null;

	const trend = entry.rankTrend ?? 0;

	return (
		<AppDrawer
			opened={opened}
			onClose={onClose}
			position='right'
			size='md'
			title={`#${entry.rank} · ${entry.agentName}`}
			description='Performance detail for the current period'
		>
			<Stack gap='lg'>
				<Paper withBorder radius='md' p='md' className={styles.statsCard}>
					<Group grow align='flex-start' wrap='nowrap'>
						<QuickStat label='Rank' value={`#${entry.rank}`} />
						<QuickStat label='Score' value={entry.score} />
						<QuickStat
							label='Streak'
							value={
								<>
									<span aria-hidden>🔥</span> {entry.streak ?? 0}
								</>
							}
						/>
					</Group>

					<Group gap='xs' mt='sm'>
						<Badge
							variant='light'
							color={trend > 0 ? 'green' : trend < 0 ? 'red' : 'gray'}
							radius='sm'
						>
							{trend > 0 ? '▲' : trend < 0 ? '▼' : '■'} {Math.abs(trend)} vs.
							last period
						</Badge>
						{entry.achievements?.length ? (
							<Badge variant='light' color='blue' radius='sm'>
								{entry.achievements.length} badge
								{entry.achievements.length === 1 ? '' : 's'}
							</Badge>
						) : null}
					</Group>
				</Paper>

				<Tabs defaultValue='achievements' variant='pills' keepMounted={false}>
					<Tabs.List>
						<Tabs.Tab
							value='achievements'
							leftSection={<IconAward size={16} />}
						>
							Achievements
						</Tabs.Tab>
						<Tabs.Tab
							value='reactions'
							leftSection={<IconHeartHandshake size={16} />}
						>
							Reactions
						</Tabs.Tab>
						<Tabs.Tab value='metrics' leftSection={<IconChartBar size={16} />}>
							Metrics
						</Tabs.Tab>
					</Tabs.List>

					<Tabs.Panel value='achievements' pt='md'>
						<AchievementsTab entry={entry} />
					</Tabs.Panel>

					<Tabs.Panel value='reactions' pt='md'>
						<ReactionsTab entry={entry} />
					</Tabs.Panel>

					<Tabs.Panel value='metrics' pt='md'>
						<MetricsTab entry={entry} />
					</Tabs.Panel>
				</Tabs>
			</Stack>
		</AppDrawer>
	);
};

export default RankingDetailDrawer;
