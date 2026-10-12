import React from 'react';
import {
	Divider,
	Group,
	Paper,
	Stack,
	Tabs,
	Text,
	ThemeIcon,
	Tooltip,
} from '@mantine/core';
import {
	IconAward,
	IconArrowDownRight,
	IconArrowUpRight,
	IconBolt,
	IconHeartHandshake,
	IconMinus,
} from '@tabler/icons-react';
import AppDrawer from '~/components/AppDrawer';
import type { AgentRankingEntry } from '~/modules/qa/dashboard/mockData';
import {
	getPointLeadColor,
	getPointLeadFromRoster,
	getPointLeadTooltip,
	getRankMovementColor,
	getRankMovementTooltip,
} from '../gamification';
import { useTranslation } from 'react-i18next';
import type {
	RankingProgram,
	RankingStanding,
} from '~/models/qa/rankingPrograms';
import {
	formatScore,
	formatTarget,
	isComposite,
} from '~/modules/qa/rankings/helpers';
import ScoreBreakdown from '~/modules/qa/rankings/components/ScoreBreakdown';
import AchievementsTab from './tabs/AchievementsTab';
import ReactionsTab from './tabs/ReactionsTab';
import LeaderboardReactions from './LeaderboardReactions';
import { useUserReaction } from '../hooks/useUserReaction';
import styles from './RankingDetailDrawer.module.css';

export interface RankingDetailDrawerProps {
	/** Row the drawer describes. `null` keeps the drawer unmounted. */
	entry: AgentRankingEntry | null;
	/** Full leaderboard, used to compute the gap to the position below. */
	data: AgentRankingEntry[];
	/** Ranking the row belongs to. */
	program: RankingProgram;
	/** The agent's standing, which carries the per-metric breakdown of a combined score. */
	standing?: RankingStanding;
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
		<Text component='div' size='xl' fw={700} className={styles.statValue}>
			{value}
		</Text>
	</div>
);

interface SignalRowProps {
	icon: React.ComponentType<{ size?: number }>;
	label: string;
	tooltip: string;
	color: string;
}

/** One line of the compact signal summary: rank movement, point lead, reactions, badges. */
const SignalRow: React.FC<SignalRowProps> = ({
	icon: Icon,
	label,
	tooltip,
	color,
}) => (
	<Tooltip label={tooltip} withArrow position='left'>
		<Group gap='xs' wrap='nowrap'>
			<ThemeIcon size='sm' variant='light' color={color} radius='sm'>
				<Icon size={14} />
			</ThemeIcon>
			<Text size='sm'>{label}</Text>
		</Group>
	</Tooltip>
);

/**
 * Detail drawer for a leaderboard row: quick stats plus achievements and
 * peer reactions tabs.
 */
const DrawerBody: React.FC<
	Omit<RankingDetailDrawerProps, 'entry'> & { entry: AgentRankingEntry }
> = ({ entry, data, program, standing, opened, onClose }) => {
	const { t } = useTranslation('qa.rankings');

	const trend = entry.rankTrend ?? 0;
	const pointLead = getPointLeadFromRoster(entry, data);
	const { totals } = useUserReaction(program.id, entry.agentId);
	// Peer reactions given on this ranking, the same number the row shows.
	const reactionsTotal = Object.values(totals).reduce(
		(sum, count) => sum + count,
		0
	);

	return (
		<AppDrawer
			opened={opened}
			onClose={onClose}
			position='right'
			size='md'
			title={`#${entry.rank} · ${entry.agentName}`}
			description={t('drawer.detailDescription')}
		>
			<Stack gap='lg'>
				<Paper withBorder radius='md' p='md' className={styles.statsCard}>
					<Group grow align='flex-start' wrap='nowrap'>
						<QuickStat
							label={t('drawer.stats.rank')}
							value={`#${entry.rank}`}
						/>
						<QuickStat
							label={t('drawer.columns.score')}
							value={
								<>
									<div>{formatScore(program, entry.score)}</div>
									<Text size='xs' c='dimmed' mt={4}>
										{t('drawer.targetIs', {
											value: formatTarget(program),
										})}
									</Text>
								</>
							}
						/>
					</Group>

					{standing && isComposite(program) && (
						<>
							<Divider my='sm' />
							<Stack gap={6}>
								<Text size='xs' c='dimmed' tt='uppercase' fw={600}>
									{t('agent.header.breakdown')}
								</Text>
								<ScoreBreakdown program={program} standing={standing} />
							</Stack>
						</>
					)}

					<Divider my='sm' />

					{/* Signals not already covered by the Rank/Score/Streak stats above. */}
					<Stack gap='xs'>
						<SignalRow
							icon={
								trend > 0
									? IconArrowUpRight
									: trend < 0
										? IconArrowDownRight
										: IconMinus
							}
							label={
								trend === 0
									? t('drawer.signals.held')
									: t(`drawer.signals.${trend > 0 ? 'up' : 'down'}`, {
											count: Math.abs(trend),
										})
							}
							tooltip={getRankMovementTooltip(entry)}
							color={getRankMovementColor(trend)}
						/>
						<SignalRow
							icon={IconBolt}
							label={
								pointLead.points === null
									? t('drawer.signals.tied')
									: t('drawer.signals.lead', { count: pointLead.points })
							}
							tooltip={getPointLeadTooltip(pointLead)}
							color={getPointLeadColor(pointLead.points)}
						/>
						{program.allowReactions && (
							<SignalRow
								icon={IconHeartHandshake}
								label={t('drawer.signals.reactions', { count: reactionsTotal })}
								tooltip={t('drawer.signals.reactions', {
									count: reactionsTotal,
								})}
								color={reactionsTotal > 0 ? 'blue' : 'gray'}
							/>
						)}
						<SignalRow
							icon={IconAward}
							label={t('drawer.signals.badges', {
								count: entry.achievements?.length ?? 0,
							})}
							tooltip={t('drawer.columns.milestones')}
							color={entry.achievements?.length ? 'blue' : 'gray'}
						/>
					</Stack>
				</Paper>

				{program.allowReactions && (
					<>
						<Divider />

						<LeaderboardReactions
							programId={program.id}
							agentId={entry.agentId}
							agentName={entry.agentName}
							size='md'
						/>
					</>
				)}

				<Tabs
					defaultValue='achievements'
					variant='default'
					keepMounted={false}
					className={styles.tabs}
				>
					<Tabs.List>
						<Tabs.Tab
							value='achievements'
							leftSection={<IconAward size={16} />}
						>
							{t('drawer.columns.milestones')}
						</Tabs.Tab>
						{program.allowReactions && (
							<Tabs.Tab
								value='reactions'
								leftSection={<IconHeartHandshake size={16} />}
							>
								{t('drawer.columns.reactions')}
							</Tabs.Tab>
						)}
					</Tabs.List>

					<Tabs.Panel value='achievements' pt='md'>
						<AchievementsTab entry={entry} program={program} />
					</Tabs.Panel>

					{program.allowReactions && (
						<Tabs.Panel value='reactions' pt='md'>
							<ReactionsTab entry={entry} programId={program.id} />
						</Tabs.Panel>
					)}
				</Tabs>
			</Stack>
		</AppDrawer>
	);
};

/**
 * Keeps the hook order stable: the body only mounts once a row is selected,
 * so its hooks are never called conditionally.
 */
export const RankingDetailDrawer: React.FC<RankingDetailDrawerProps> = (
	props
) => (props.entry ? <DrawerBody {...props} entry={props.entry} /> : null);

export default RankingDetailDrawer;
