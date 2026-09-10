import React from 'react';
import {
	Badge,
	Divider,
	Group,
	Paper,
	Stack,
	Tabs,
	Text,
	Tooltip,
} from '@mantine/core';
import {
	IconAward,
	IconChartBar,
	IconHeartHandshake,
} from '@tabler/icons-react';
import AppDrawer from '~/components/AppDrawer';
import type { AgentRankingEntry } from '~/modules/qa/dashboard/mockData';
import {
	getPointLeadColor,
	getPointLeadFromRoster,
	getPointLeadTooltip,
	getRankMovementColor,
	getRankMovementTooltip,
	getReactionsTotal,
} from '../gamification';
import AchievementsTab from './tabs/AchievementsTab';
import MetricsTab from './tabs/MetricsTab';
import ReactionsTab from './tabs/ReactionsTab';
import ReactionButtons from './ReactionButtons';
import { useUserReaction } from '../hooks/useUserReaction';
import { WinnerBadge } from './WinnerBadge';
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

interface GamificationChipProps {
	/** Indicator emoji (📊 / 🔥 / 💪 / 🤝). */
	emoji: string;
	label: string;
	tooltip: string;
	color: string;
}

/** One compact indicator of the gamification summary row. */
const GamificationChip: React.FC<GamificationChipProps> = ({
	emoji,
	label,
	tooltip,
	color,
}) => (
	<Tooltip label={tooltip} withArrow>
		<Badge variant='light' color={color} radius='sm' size='lg'>
			<span aria-hidden>{emoji}</span> {label}
		</Badge>
	</Tooltip>
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
	const streak = entry.streak ?? 0;
	const pointLead = getPointLeadFromRoster(entry);
	const reactionsTotal = getReactionsTotal(entry);
	const { currentReaction, setReaction } = useUserReaction(entry.agentId);

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

					<Divider my='sm' />

					{/* Gamification summary: rank movement · streak · point lead · social proof */}
					<Group gap='xs'>
						<GamificationChip
							emoji='📊'
							label={`${trend > 0 ? '↑' : trend < 0 ? '↓' : '–'} ${Math.abs(trend)}`}
							tooltip={getRankMovementTooltip(entry)}
							color={getRankMovementColor(trend)}
						/>
						<GamificationChip
							emoji='🔥'
							label={`${streak} ${streak === 1 ? 'week' : 'weeks'}`}
							tooltip={
								streak > 0
									? `${streak} consecutive week${streak === 1 ? '' : 's'} in the top of the ranking`
									: 'No active streak this period'
							}
							color={streak > 0 ? 'orange' : 'gray'}
						/>
						<GamificationChip
							emoji='💪'
							label={
								pointLead.points === null ? '—' : `+${pointLead.points} pts`
							}
							tooltip={getPointLeadTooltip(pointLead)}
							color={getPointLeadColor(pointLead.points)}
						/>
						<GamificationChip
							emoji='🤝'
							label={`${reactionsTotal}`}
							tooltip={`${reactionsTotal} peer reaction${reactionsTotal === 1 ? '' : 's'} received`}
							color={reactionsTotal > 0 ? 'grape' : 'gray'}
						/>
						{entry.achievements?.length ? (
							<Badge variant='light' color='blue' radius='sm' size='lg'>
								{entry.achievements.length} badge
								{entry.achievements.length === 1 ? '' : 's'}
							</Badge>
						) : null}
					</Group>
				</Paper>

				<Divider />

				<Stack gap='sm'>
					<ReactionButtons
						currentReaction={currentReaction}
						onReactionChange={setReaction}
					/>
					<Text size='xs' c='dimmed'>
						Your reaction helps celebrate team achievements
					</Text>
				</Stack>

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
