import React from 'react';
import { useTranslation } from 'react-i18next';
import {
	Badge,
	Group,
	Progress,
	Stack,
	Text,
	ThemeIcon,
	Tooltip,
} from '@mantine/core';
import {
	IconArrowDownRight,
	IconArrowUpRight,
	IconCircleCheck,
	IconMinus,
} from '@tabler/icons-react';
import SectionCard from '~/components/SectionCard';
import type {
	RankingProgram,
	RankingStanding,
} from '~/models/qa/rankingPrograms';
import { useTriggerRulesStore } from '~/stores/qa/triggerRulesStore';
import { METRIC_BY_ID } from '~/modules/qa/triggers/constants';
import { formatScore, formatTarget } from '../helpers';

interface MyPositionCardProps {
	program: RankingProgram;
	standing: RankingStanding | undefined;
	total: number;
}

/** The agent's own standing: rank, progress toward the target and next milestone. */
export const MyPositionCard: React.FC<MyPositionCardProps> = ({
	program,
	standing,
	total,
}) => {
	const { t } = useTranslation('qa.rankings');
	const badges = useTriggerRulesStore((s) => s.badges);

	if (!standing) return null;

	const higherIsBetter = METRIC_BY_ID[program.metricId]?.higherIsBetter ?? true;
	const delta = standing.delta;
	const DeltaIcon =
		delta === null || delta === 0
			? IconMinus
			: delta > 0
				? IconArrowUpRight
				: IconArrowDownRight;
	const deltaColor =
		delta === null || delta === 0 ? 'gray' : delta > 0 ? 'green' : 'red';

	/** The closest milestone the agent has not reached yet. */
	const nextMilestone = program.milestones
		.filter((milestone) => !standing.milestoneIds.includes(milestone.id))
		.sort((a, b) =>
			higherIsBetter ? a.threshold - b.threshold : b.threshold - a.threshold
		)[0];

	return (
		<SectionCard fullHeight title={t('agent.mine.title')}>
			<Stack gap='md'>
				{standing.rank === null ? (
					<Text size='sm' c='dimmed'>
						{t('agent.mine.unranked', {
							count: Math.max(0, program.minCalls - standing.calls),
						})}
					</Text>
				) : (
					<Group justify='space-between' align='center'>
						<Text fw={700} size='xl'>
							{t('agent.mine.rank', { rank: standing.rank, total })}
						</Text>
						<Tooltip label={t('agent.mine.delta')} withArrow>
							<Group gap={4} wrap='nowrap'>
								<Text size='sm' c='dimmed'>
									{delta === null
										? t('agent.mine.noDelta')
										: delta === 0
											? '0'
											: Math.abs(delta)}
								</Text>
								{delta !== null && (
									<ThemeIcon size='sm' variant='light' color={deltaColor}>
										<DeltaIcon size={14} />
									</ThemeIcon>
								)}
							</Group>
						</Tooltip>
					</Group>
				)}

				<div>
					<Group justify='space-between' mb={4}>
						<Text size='xs' c='dimmed'>
							{t('agent.mine.score')}: {formatScore(program, standing.score)}
						</Text>
						<Text size='xs' c='dimmed'>
							{t('agent.mine.target')}: {formatTarget(program)}
						</Text>
					</Group>
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
					/>
				</div>

				{standing.reachedTarget && (
					<Group gap='xs'>
						<ThemeIcon size='sm' variant='light' color='green'>
							<IconCircleCheck size={14} />
						</ThemeIcon>
						<Text size='sm' c='green' fw={500}>
							{t('agent.mine.reachedTarget')}
						</Text>
					</Group>
				)}

				{standing.milestoneIds.length > 0 && (
					<div>
						<Text size='xs' c='dimmed' mb={6}>
							{t('agent.mine.milestones')}
						</Text>
						<Group gap='xs'>
							{standing.milestoneIds.map((milestoneId) => {
								const milestone = program.milestones.find(
									(m) => m.id === milestoneId
								);
								const badge = badges.find((b) => b.id === milestone?.badgeId);
								return (
									<Badge
										key={milestoneId}
										variant='light'
										color={badge?.color ?? 'gray'}
										tt='none'
										leftSection={badge?.icon}
									>
										{milestone?.label || badge?.name}
									</Badge>
								);
							})}
						</Group>
					</div>
				)}

				{nextMilestone && (
					<Text size='xs' c='dimmed'>
						{t('agent.mine.nextMilestone', {
							label: nextMilestone.label,
							value: formatScore(program, nextMilestone.threshold),
						})}
					</Text>
				)}
			</Stack>
		</SectionCard>
	);
};

export default MyPositionCard;
