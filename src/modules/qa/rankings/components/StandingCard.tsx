import React from 'react';
import { useTranslation } from 'react-i18next';
import {
	Badge,
	Card,
	Divider,
	Group,
	Progress,
	Stack,
	Text,
	ThemeIcon,
} from '@mantine/core';
import {
	IconArrowDownRight,
	IconArrowUpRight,
	IconChevronRight,
	IconMinus,
} from '@tabler/icons-react';
import type {
	RankingProgram,
	RankingStanding,
} from '~/models/qa/rankingPrograms';
import LeaderboardReactions from '~/modules/qa/agent/rankings/components/LeaderboardReactions';
import { useTriggerRulesStore } from '~/stores/qa/triggerRulesStore';
import { formatScore } from '../helpers';
import WinnerBadge from './WinnerBadge';
import type { ReactionsMode } from './StandingsTable';
import styles from './StandingCard.module.css';

/** Max number of milestone badges rendered inside a card. */
const MAX_VISIBLE_BADGES = 2;

interface StandingCardProps {
	program: RankingProgram;
	standing: RankingStanding;
	isCurrentAgent?: boolean;
	onRowClick?: (standing: RankingStanding) => void;
	reactions?: ReactionsMode;
	/** Drops the progress bar, for a compact dashboard placement. */
	dense?: boolean;
}

/** One agent's standing as a card: the same facts as a table row, stacked for narrow screens. */
export const StandingCard: React.FC<StandingCardProps> = ({
	program,
	standing,
	isCurrentAgent,
	onRowClick,
	reactions = 'off',
	dense = false,
}) => {
	const { t } = useTranslation('qa.rankings');
	const badges = useTriggerRulesStore((s) => s.badges);
	const unranked = standing.rank === null;
	const delta = standing.delta;
	const DeltaIcon =
		delta === null || delta === 0
			? IconMinus
			: delta > 0
				? IconArrowUpRight
				: IconArrowDownRight;
	const deltaColor =
		delta === null || delta === 0 ? 'gray' : delta > 0 ? 'green' : 'red';

	const earned = standing.milestoneIds.flatMap((milestoneId) => {
		const milestone = program.milestones.find((m) => m.id === milestoneId);
		const badge = badges.find((b) => b.id === milestone?.badgeId);
		return badge
			? [{ id: milestoneId, icon: badge.icon, name: badge.name }]
			: [];
	});
	const visible = earned.slice(0, MAX_VISIBLE_BADGES);
	const hidden = earned.length - visible.length;

	const clickable = Boolean(onRowClick);
	const activate = () => onRowClick?.(standing);

	return (
		<Card
			withBorder
			radius='md'
			padding='md'
			shadow='md'
			className={styles.card}
			data-current={isCurrentAgent || undefined}
			data-clickable={clickable || undefined}
			role={clickable ? 'button' : undefined}
			tabIndex={clickable ? 0 : undefined}
			onClick={clickable ? activate : undefined}
			onKeyDown={
				clickable
					? (event: React.KeyboardEvent<HTMLDivElement>) => {
							if (event.key === 'Enter' || event.key === ' ') {
								event.preventDefault();
								activate();
							}
						}
					: undefined
			}
		>
			<Stack gap='xs'>
				<Group gap='xs' wrap='nowrap'>
					<Group gap={4} wrap='nowrap'>
						{standing.rank === null ? (
							<Badge color='gray' variant='light' radius='sm'>
								{t('drawer.unranked')}
							</Badge>
						) : (
							<>
								<Badge
									variant='default'
									radius='sm'
									fw={standing.rank <= 3 ? 700 : 500}
								>
									#{standing.rank}
								</Badge>
								<WinnerBadge
									isWinner={
										program.status === 'completed' && standing.rank === 1
									}
								/>
							</>
						)}
					</Group>
					<div className={styles.nameBlock}>
						<Text size='sm' fw={600} lineClamp={1}>
							{standing.agentName}
						</Text>
					</div>
				</Group>

				<Stack gap={6}>
					<Text
						size='xl'
						fw={700}
						c={unranked ? 'dimmed' : undefined}
						className={styles.score}
					>
						{formatScore(program, standing.score)}
					</Text>
					{!dense && (
						<Progress
							value={
								standing.score === null
									? 0
									: Math.min(
											100,
											(standing.score / Math.max(program.targetScore, 1)) * 100
										)
							}
							color={standing.reachedTarget ? 'green' : 'blue'}
							size='sm'
						/>
					)}
				</Stack>

				<Group gap='md' wrap='wrap'>
					<Text size='xs' c='dimmed'>
						{t('drawer.columns.calls')}: {standing.calls}
					</Text>
					<Group gap={4} wrap='nowrap'>
						<Text size='xs' c='dimmed'>
							{t('drawer.columns.delta')}:
						</Text>
						{delta === null ? (
							<Text size='xs' c='dimmed'>
								—
							</Text>
						) : (
							<>
								<Text size='xs'>{delta === 0 ? '0' : Math.abs(delta)}</Text>
								<ThemeIcon size='xs' variant='light' color={deltaColor}>
									<DeltaIcon size={12} />
								</ThemeIcon>
							</>
						)}
					</Group>
				</Group>

				<Group gap='sm' justify='space-between' wrap='nowrap'>
					<Group gap={4} wrap='nowrap'>
						{visible.length === 0 ? (
							<Text size='xs' c='dimmed'>
								{t('achievements.empty')}
							</Text>
						) : (
							visible.map((badge) => (
								<span
									key={badge.id}
									className={styles.badge}
									title={badge.name}
									aria-label={badge.name}
								>
									{badge.icon}
								</span>
							))
						)}
						{hidden > 0 && (
							<Text size='xs' c='dimmed'>
								+{hidden}
							</Text>
						)}
					</Group>
					{reactions !== 'off' && (
						<LeaderboardReactions
							programId={program.id}
							agentId={standing.agentId}
							agentName={standing.agentName}
							readOnly={reactions === 'readonly'}
						/>
					)}
				</Group>

				{clickable && (
					<>
						<Divider className={styles.divider} />
						<Group gap={4} wrap='nowrap' className={styles.footer}>
							<Text size='xs' fw={600} inherit>
								{t('drawer.viewDetails')}
							</Text>
							<IconChevronRight size={14} />
						</Group>
					</>
				)}
			</Stack>
		</Card>
	);
};

export default StandingCard;
