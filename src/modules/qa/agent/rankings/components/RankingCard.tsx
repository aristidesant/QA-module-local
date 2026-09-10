import React from 'react';
import { Badge, Card, Divider, Group, Stack, Text } from '@mantine/core';
import { IconChevronRight } from '@tabler/icons-react';
import { PREDEFINED_BADGE_CATALOGS } from '~/models/qa/badges';
import type { AgentRankingEntry } from '~/modules/qa/dashboard/mockData';
import { getReactionsTotal } from '../gamification';
import { WinnerBadge } from './WinnerBadge';
import { useLeaderboardMetadata } from '../hooks/useLeaderboardMetadata';
import styles from './RankingCard.module.css';

/** Max number of achievement badges rendered inside a card. */
const MAX_VISIBLE_ACHIEVEMENTS = 2;

const RANK_BADGE_COLORS: Record<number, string> = {
	1: 'yellow',
	2: 'gray',
	3: 'orange',
};

export interface RankingCardProps {
	/** Leaderboard row rendered by this card. */
	entry: AgentRankingEntry;
	/** Invoked when the card is activated (detail drawer hook-up). */
	onRowClick?: (entry: AgentRankingEntry) => void;
}

/**
 * Compact leaderboard entry for tablet and mobile viewports.
 *
 * Shows rank, name, score, achievements, and reactions stacked
 * so nothing is hidden on narrow screens.
 */
export const RankingCard: React.FC<RankingCardProps> = ({
	entry,
	onRowClick,
}) => {
	const { isCompleted } = useLeaderboardMetadata();
	const reactionsTotal = getReactionsTotal(entry);
	const achievements = entry.achievements ?? [];
	const visibleAchievements = achievements.slice(0, MAX_VISIBLE_ACHIEVEMENTS);
	const hiddenAchievements = achievements.length - visibleAchievements.length;

	const clickable = Boolean(onRowClick);
	const handleActivate = () => onRowClick?.(entry);

	return (
		<Card
			withBorder
			radius='md'
			padding='md'
			shadow='md'
			className={styles.card}
			data-clickable={clickable || undefined}
			role={clickable ? 'button' : undefined}
			tabIndex={clickable ? 0 : undefined}
			aria-label={
				clickable
					? `Rank ${entry.rank}, ${entry.agentName}, score ${entry.score}. Open details`
					: undefined
			}
			onClick={clickable ? handleActivate : undefined}
			onKeyDown={
				clickable
					? (event: React.KeyboardEvent<HTMLDivElement>) => {
							if (event.key === 'Enter' || event.key === ' ') {
								event.preventDefault();
								handleActivate();
							}
						}
					: undefined
			}
		>
			<Stack gap='xs'>
				{/* Header: rank + name + streak */}
				<Group gap='xs' wrap='nowrap'>
					<Group gap={4} wrap='nowrap'>
						<Badge
							color={RANK_BADGE_COLORS[entry.rank] ?? 'gray'}
							variant='light'
							radius='sm'
						>
							#{entry.rank}
						</Badge>
						<WinnerBadge isWinner={isCompleted && entry.rank === 1} />
					</Group>

					<div className={styles.nameBlock}>
						<Text size='sm' fw={600} lineClamp={1}>
							{entry.agentName}
						</Text>
					</div>
				</Group>

				{/* Body: score only */}
				<Text size='xl' fw={700} className={styles.score}>
					{entry.score}
				</Text>

				{/* Achievements + reactions */}
				<Group gap='sm' justify='space-between' wrap='nowrap'>
					<Group gap={4} wrap='nowrap'>
						{visibleAchievements.length === 0 ? (
							<Text size='xs' c='dimmed'>
								No achievements yet
							</Text>
						) : (
							visibleAchievements.map((badgeType, index) => {
								const catalog = PREDEFINED_BADGE_CATALOGS[badgeType];
								return (
									<span
										key={`${badgeType}-${index}`}
										className={styles.achievement}
										title={catalog?.name ?? badgeType}
										aria-label={catalog?.name ?? badgeType}
									>
										{catalog?.icon ?? '🏅'}
									</span>
								);
							})
						)}
						{hiddenAchievements > 0 && (
							<Text size='xs' c='dimmed'>
								+{hiddenAchievements}
							</Text>
						)}
					</Group>

					<Text size='sm' fw={500} className={styles.reaction}>
						<span aria-hidden>🤝</span> {reactionsTotal} reactions
					</Text>
				</Group>

				{clickable && (
					<>
						<Divider className={styles.divider} />
						<Group gap={4} wrap='nowrap' className={styles.footer}>
							<Text size='xs' fw={600} inherit>
								View details
							</Text>
							<IconChevronRight size={14} />
						</Group>
					</>
				)}
			</Stack>
		</Card>
	);
};

export default RankingCard;
