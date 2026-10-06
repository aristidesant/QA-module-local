import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
	Badge,
	Group,
	Paper,
	Progress,
	Stack,
	Text,
	ThemeIcon,
} from '@mantine/core';
import { IconAward, IconTargetArrow } from '@tabler/icons-react';
import type { RankingProgram } from '~/models/qa/rankingPrograms';
import { PREDEFINED_BADGE_CATALOGS } from '~/models/qa/badges';
import type { AgentRankingEntry } from '~/modules/qa/dashboard/mockData';
import { useTriggerRulesStore } from '~/stores/qa/triggerRulesStore';
import { formatScore, higherIsBetterOf } from '~/modules/qa/rankings/helpers';
import styles from './AchievementsTab.module.css';

interface ResolvedBadge {
	id: string;
	name: string;
	description: string;
	icon: string;
	color: string;
	tier: string | null;
	earnedAt: string | null;
}

export interface AchievementsTabProps {
	entry: AgentRankingEntry;
	/** Ranking the row belongs to — its milestones define the badges on offer. */
	program: RankingProgram;
}

/**
 * Badges this agent earned in the current ranking, resolved against the
 * Triggers badge catalogue the managers author, plus the next milestone.
 */
export const AchievementsTab: React.FC<AchievementsTabProps> = ({
	entry,
	program,
}) => {
	const { t } = useTranslation('qa.rankings');
	const badges = useTriggerRulesStore((state) => state.badges);

	const earned = useMemo<ResolvedBadge[]>(
		() =>
			(entry.achievements ?? []).map((badgeId) => {
				const badge = badges.find((candidate) => candidate.id === badgeId);
				const legacy = PREDEFINED_BADGE_CATALOGS[badgeId];

				return {
					id: badgeId,
					name: badge?.name ?? legacy?.name ?? badgeId,
					description: badge?.description ?? legacy?.description ?? '',
					icon: badge?.icon ?? legacy?.icon ?? '🏅',
					color: badge?.color ?? 'gray',
					tier: badge?.tier ?? null,
					earnedAt:
						badge?.holders.find((holder) => holder.agentId === entry.agentId)
							?.earnedAt ?? null,
				};
			}),
		[entry.achievements, entry.agentId, badges]
	);

	const higherIsBetter = higherIsBetterOf(program);

	/** Closest milestone whose badge the agent has not earned yet. */
	const next = useMemo(() => {
		const earnedBadgeIds = new Set(entry.achievements ?? []);
		const milestone = program.milestones
			.filter((candidate) => !earnedBadgeIds.has(candidate.badgeId))
			.sort((a, b) =>
				higherIsBetter ? a.threshold - b.threshold : b.threshold - a.threshold
			)[0];
		if (!milestone) return null;

		const badge = badges.find(
			(candidate) => candidate.id === milestone.badgeId
		);
		const progress = higherIsBetter
			? Math.min(100, Math.round((entry.score / milestone.threshold) * 100))
			: Math.min(
					100,
					Math.round((milestone.threshold / Math.max(entry.score, 1)) * 100)
				);

		return { milestone, badge, progress: Math.max(0, progress) };
	}, [program, entry.achievements, entry.score, badges, higherIsBetter]);

	return (
		<Stack gap='md'>
			{earned.length === 0 ? (
				<Paper withBorder radius='md' p='lg' className={styles.emptyState}>
					<Stack gap={4} align='center'>
						<ThemeIcon size={40} variant='light' color='gray' radius='xl'>
							<IconAward size={20} />
						</ThemeIcon>
						<Text size='sm' fw={600}>
							{t('achievements.empty')}
						</Text>
						<Text size='xs' c='dimmed' ta='center'>
							{t('achievements.emptyHint')}
						</Text>
					</Stack>
				</Paper>
			) : (
				<Stack gap='xs'>
					<Text size='xs' c='dimmed' fw={600} tt='uppercase'>
						{t('achievements.earned', { count: earned.length })}
					</Text>
					{earned.map((badge) => (
						<Paper
							key={badge.id}
							withBorder
							radius='md'
							p='sm'
							className={styles.card}
						>
							<Group gap='sm' wrap='nowrap'>
								<span className={styles.icon} aria-hidden>
									{badge.icon}
								</span>
								<div className={styles.titleBlock}>
									<Text size='sm' fw={600} lineClamp={1}>
										{badge.name}
									</Text>
									<Text size='xs' c='dimmed' lineClamp={2}>
										{badge.description}
									</Text>
								</div>
								{badge.tier && (
									<Badge
										variant='light'
										color={badge.color}
										radius='sm'
										size='sm'
										tt='none'
									>
										{t(`achievements.tier.${badge.tier}`)}
									</Badge>
								)}
							</Group>
						</Paper>
					))}
				</Stack>
			)}

			{next && (
				<Paper withBorder radius='md' p='md' className={styles.nextCard}>
					<Stack gap='sm'>
						<Group gap='xs' wrap='nowrap'>
							<IconTargetArrow size={18} className={styles.nextIcon} />
							<Text size='xs' c='dimmed' fw={600} tt='uppercase'>
								{t('achievements.next')}
							</Text>
						</Group>

						<Group gap='sm' wrap='nowrap'>
							<span className={styles.icon} aria-hidden>
								{next.badge?.icon ?? '🏅'}
							</span>
							<Text size='sm' fw={600}>
								{next.badge?.name ?? next.milestone.label}
							</Text>
							<Text size='sm' fw={700} ml='auto'>
								{next.progress}%
							</Text>
						</Group>

						<Progress
							value={next.progress}
							color='blue'
							radius='xl'
							size='md'
						/>

						<Text size='xs' c='dimmed'>
							{t('achievements.nextHint', {
								label: next.milestone.label,
								value: formatScore(program, next.milestone.threshold),
							})}
						</Text>
					</Stack>
				</Paper>
			)}
		</Stack>
	);
};

export default AchievementsTab;
