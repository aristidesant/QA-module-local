import React, { useMemo } from 'react';
import { Badge, Card, Divider, Group, Stack, Text } from '@mantine/core';
import {
	IconArrowDown,
	IconArrowUp,
	IconChevronRight,
	IconMinus,
} from '@tabler/icons-react';
import { PREDEFINED_BADGE_CATALOGS } from '~/models/qa/badges';
import type { AgentRankingEntry } from '~/modules/qa/dashboard/mockData';
import {
	HEALTHY_LEAD_THRESHOLD,
	buildRankIndex,
	getPointLead,
	getReactionsTotal,
} from '../gamification';
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
	/**
	 * Rank lookup used to resolve the point lead against the next position.
	 * Provided by `RankingCardGrid` so it is built once per list.
	 */
	rankIndex?: Map<number, AgentRankingEntry>;
	/** Invoked when the card is activated (detail drawer hook-up). */
	onRowClick?: (entry: AgentRankingEntry) => void;
}

/**
 * Compact leaderboard entry for tablet and mobile viewports.
 *
 * Shows the same seven data points as the desktop table — rank, name,
 * score + point lead, achievements, reactions, streak and rank velocity —
 * stacked so nothing is hidden on narrow screens.
 */
export const RankingCard: React.FC<RankingCardProps> = ({
	entry,
	rankIndex,
	onRowClick,
}) => {
	const resolvedIndex = useMemo(
		() => rankIndex ?? buildRankIndex([entry]),
		[rankIndex, entry]
	);

	const lead = getPointLead(entry, resolvedIndex);
	const reactionsTotal = getReactionsTotal(entry);
	const achievements = entry.achievements ?? [];
	const visibleAchievements = achievements.slice(0, MAX_VISIBLE_ACHIEVEMENTS);
	const hiddenAchievements = achievements.length - visibleAchievements.length;

	const trend = entry.rankTrend ?? 0;
	const isUp = trend > 0;
	const isFlat = trend === 0;
	const trendClass = isFlat
		? styles.trendFlat
		: isUp
			? styles.trendUp
			: styles.trendDown;

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
					<Badge
						color={RANK_BADGE_COLORS[entry.rank] ?? 'gray'}
						variant='light'
						radius='sm'
					>
						#{entry.rank}
					</Badge>

					<div className={styles.nameBlock}>
						<Text size='sm' fw={600} lineClamp={1}>
							{entry.agentName}
						</Text>
					</div>

					{entry.streak ? (
						<Text
							size='sm'
							fw={500}
							className={styles.streak}
							title={`${entry.streak} consecutive weeks`}
						>
							<span aria-hidden>🔥</span> {entry.streak}
						</Text>
					) : null}
				</Group>

				{/* Body: score + point lead, rank velocity */}
				<Group gap='xs' justify='space-between' wrap='nowrap'>
					<Group gap={6} wrap='nowrap' align='baseline'>
						<Text size='xl' fw={700} className={styles.score}>
							{entry.score}
						</Text>
						{lead.points !== null && (
							<Text
								size='xs'
								fw={600}
								className={
									lead.points > HEALTHY_LEAD_THRESHOLD
										? styles.leadStrong
										: styles.leadTight
								}
							>
								+{lead.points} ahead
							</Text>
						)}
					</Group>

					<Group gap={4} wrap='nowrap' className={trendClass}>
						{isFlat && <IconMinus size={16} />}
						{!isFlat &&
							(isUp ? <IconArrowUp size={16} /> : <IconArrowDown size={16} />)}
						<Text size='sm' inherit>
							{Math.abs(trend)}
						</Text>
					</Group>
				</Group>

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
