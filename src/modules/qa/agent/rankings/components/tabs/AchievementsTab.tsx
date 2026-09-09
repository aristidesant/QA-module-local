import React, { useMemo, useState } from 'react';
import {
	Badge,
	Collapse,
	Group,
	List,
	Paper,
	Progress,
	Stack,
	Text,
	UnstyledButton,
} from '@mantine/core';
import {
	IconChevronDown,
	IconChevronRight,
	IconCircleCheck,
	IconTargetArrow,
} from '@tabler/icons-react';
import {
	getRankingAchievements,
	type AgentRankingEntry,
	type RankingAchievement,
} from '~/modules/qa/dashboard/mockData';
import styles from './AchievementsTab.module.css';

const dateFormatter = new Intl.DateTimeFormat('en-US', {
	day: 'numeric',
	month: 'short',
	year: 'numeric',
});

const formatEarnedAt = (isoDate: string): string =>
	dateFormatter.format(new Date(isoDate));

interface AchievementRowProps {
	achievement: RankingAchievement;
}

const AchievementRow: React.FC<AchievementRowProps> = ({ achievement }) => {
	const [expanded, setExpanded] = useState(false);

	return (
		<Paper withBorder radius='md' p='sm' className={styles.card}>
			<UnstyledButton
				className={styles.trigger}
				onClick={() => setExpanded((value) => !value)}
				aria-expanded={expanded}
			>
				<Group gap='sm' wrap='nowrap' className={styles.triggerInner}>
					<span className={styles.icon} aria-hidden>
						{achievement.icon}
					</span>

					<div className={styles.titleBlock}>
						<Text size='sm' fw={600} lineClamp={1}>
							{achievement.name}
						</Text>
						<Text size='xs' c='dimmed' lineClamp={1}>
							{achievement.description}
						</Text>
					</div>

					<Group gap='xs' wrap='nowrap'>
						<Badge variant='light' color='gray' radius='sm' size='sm'>
							{formatEarnedAt(achievement.earnedAt)}
						</Badge>
						<span className={styles.chevron} aria-hidden>
							{expanded ? (
								<IconChevronDown size={16} />
							) : (
								<IconChevronRight size={16} />
							)}
						</span>
					</Group>
				</Group>
			</UnstyledButton>

			<Collapse expanded={expanded}>
				<Stack gap='xs' pt='sm'>
					<Text size='xs' c='dimmed' fw={600} tt='uppercase'>
						Criteria met
					</Text>
					<List
						spacing={4}
						size='sm'
						icon={<IconCircleCheck size={16} className={styles.criteriaIcon} />}
					>
						{achievement.criteria.map((criterion) => (
							<List.Item key={criterion}>{criterion}</List.Item>
						))}
					</List>
				</Stack>
			</Collapse>
		</Paper>
	);
};

export interface AchievementsTabProps {
	entry: AgentRankingEntry;
}

/** Badge history for one agent plus progress towards the next badge. */
export const AchievementsTab: React.FC<AchievementsTabProps> = ({ entry }) => {
	const { earned, nextMilestone } = useMemo(
		() => getRankingAchievements(entry),
		[entry]
	);

	return (
		<Stack gap='md'>
			{earned.length === 0 ? (
				<Paper withBorder radius='md' p='lg' className={styles.emptyState}>
					<Stack gap={4} align='center'>
						<span className={styles.emptyIcon} aria-hidden>
							🏅
						</span>
						<Text size='sm' fw={600}>
							No badges earned yet
						</Text>
						<Text size='xs' c='dimmed' ta='center'>
							Keep performing — the first badge is within reach.
						</Text>
					</Stack>
				</Paper>
			) : (
				<Stack gap='xs'>
					<Text size='xs' c='dimmed' fw={600} tt='uppercase'>
						Earned this period ({earned.length})
					</Text>
					{earned.map((achievement) => (
						<AchievementRow
							key={achievement.badgeType}
							achievement={achievement}
						/>
					))}
				</Stack>
			)}

			{nextMilestone ? (
				<Paper withBorder radius='md' p='md' className={styles.nextCard}>
					<Stack gap='sm'>
						<Group gap='xs' wrap='nowrap'>
							<IconTargetArrow size={18} className={styles.nextIcon} />
							<Text size='xs' c='dimmed' fw={600} tt='uppercase'>
								Next badge
							</Text>
						</Group>

						<Group gap='sm' wrap='nowrap'>
							<span className={styles.icon} aria-hidden>
								{nextMilestone.icon}
							</span>
							<Text size='sm' fw={600}>
								{nextMilestone.name}
							</Text>
							<Text size='sm' fw={700} ml='auto'>
								{nextMilestone.progress}%
							</Text>
						</Group>

						<Progress
							value={nextMilestone.progress}
							color='blue'
							radius='xl'
							size='md'
							aria-label={`Progress towards ${nextMilestone.name}`}
						/>

						<Stack gap={4}>
							<Text size='xs' c='dimmed' fw={600} tt='uppercase'>
								Still missing
							</Text>
							<List spacing={4} size='sm' withPadding>
								{nextMilestone.criteriaRemaining.map((criterion) => (
									<List.Item key={criterion}>{criterion}</List.Item>
								))}
							</List>
						</Stack>
					</Stack>
				</Paper>
			) : null}
		</Stack>
	);
};

export default AchievementsTab;
