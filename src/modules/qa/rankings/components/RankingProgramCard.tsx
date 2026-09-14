import React from 'react';
import { useTranslation } from 'react-i18next';
import {
	Badge,
	Button,
	Group,
	Menu,
	Progress,
	Stack,
	Text,
} from '@mantine/core';
import {
	IconCopy,
	IconDotsVertical,
	IconEdit,
	IconPlayerStop,
	IconTrash,
} from '@tabler/icons-react';
import dayjs from 'dayjs';
import SectionCard from '~/components/SectionCard';
import type {
	RankingProgram,
	RankingStanding,
} from '~/models/qa/rankingPrograms';
import { CALL_EVALUATION_TABS } from '~/views/Campaigns/constants';
import {
	daysLeft,
	elapsedPct,
	formatScore,
	formatTarget,
	leader,
} from '../helpers';
import { STATUS_COLOR } from '../constants';

interface RankingProgramCardProps {
	program: RankingProgram;
	standings: RankingStanding[];
	onView: () => void;
	onEdit: () => void;
	onDuplicate: () => void;
	onEnd: () => void;
	onCancel: () => void;
	onDelete: () => void;
}

export const RankingProgramCard: React.FC<RankingProgramCardProps> = ({
	program,
	standings,
	onView,
	onEdit,
	onDuplicate,
	onEnd,
	onCancel,
	onDelete,
}) => {
	const { t } = useTranslation('qa.rankings');
	const typeMeta = CALL_EVALUATION_TABS.find(
		(tab) => tab.key === program.evaluationType
	);
	const top = leader(standings);
	const isLive = program.status === 'active';
	const isCompleted = program.status === 'completed';
	const isScheduled = program.status === 'scheduled';

	return (
		<SectionCard
			fullHeight
			title={program.name}
			description={program.description}
			headerActions={
				<Badge variant='light' color={STATUS_COLOR[program.status]}>
					{t(`status.${program.status}`)}
				</Badge>
			}
			footer={
				<Group justify='space-between' w='100%'>
					<Button size='xs' variant='light' onClick={onView}>
						{t('card.view')}
					</Button>
					<Menu withArrow position='bottom-end'>
						<Menu.Target>
							<Button size='xs' variant='subtle' px={8}>
								<IconDotsVertical size={16} />
							</Button>
						</Menu.Target>
						<Menu.Dropdown>
							<Menu.Item leftSection={<IconEdit size={14} />} onClick={onEdit}>
								{t('card.edit')}
							</Menu.Item>
							<Menu.Item
								leftSection={<IconCopy size={14} />}
								onClick={onDuplicate}
							>
								{t('card.duplicate')}
							</Menu.Item>
							{isLive && (
								<Menu.Item
									color='red'
									leftSection={<IconPlayerStop size={14} />}
									onClick={onEnd}
								>
									{t('card.end')}
								</Menu.Item>
							)}
							{isScheduled && (
								<Menu.Item
									color='red'
									leftSection={<IconPlayerStop size={14} />}
									onClick={onCancel}
								>
									{t('card.cancel')}
								</Menu.Item>
							)}
							{program.status === 'draft' && (
								<Menu.Item
									color='red'
									leftSection={<IconTrash size={14} />}
									onClick={onDelete}
								>
									{t('card.delete')}
								</Menu.Item>
							)}
						</Menu.Dropdown>
					</Menu>
				</Group>
			}
		>
			<Stack gap='sm'>
				<Group gap='xs' wrap='wrap'>
					<Badge size='sm' variant='light' color={typeMeta?.color ?? 'gray'}>
						{t(`types.${program.evaluationType}`)}
					</Badge>
					{program.teams.map((team) => (
						<Badge key={team} size='sm' variant='outline' color='gray'>
							{team}
						</Badge>
					))}
				</Group>

				<Text size='sm' c='dimmed'>
					{t('card.target', {
						value: formatTarget(program),
						calls: program.minCalls,
					})}
				</Text>

				<div>
					<Group justify='space-between' mb={4}>
						<Text size='xs' c='dimmed'>
							{t('card.period', {
								from: dayjs(program.startDate).format('DD MMM'),
								to: dayjs(program.endDate).format('DD MMM'),
							})}
						</Text>
						<Text size='xs' c='dimmed'>
							{isCompleted
								? t('card.ended')
								: isScheduled
									? t('card.notStarted', {
											date: dayjs(program.startDate).format('DD MMM'),
										})
									: t('card.daysLeft', { count: daysLeft(program) })}
						</Text>
					</Group>
					<Progress
						value={elapsedPct(program)}
						size='sm'
						color={isCompleted ? 'grape' : 'blue'}
					/>
				</div>

				<Group gap='xs' wrap='nowrap'>
					<Text size='lg'>{program.prize.icon}</Text>
					<Text size='sm' fw={500}>
						{program.prize.title}
					</Text>
				</Group>

				{(isLive || isCompleted) && (
					<Group justify='space-between'>
						<Text size='xs' c='dimmed'>
							{isCompleted ? t('card.winner') : t('card.leader')}
						</Text>
						<Text size='sm' fw={600}>
							{isCompleted
								? (program.winnerName ?? '—')
								: top
									? `${top.agentName} · ${formatScore(program, top.score)}`
									: '—'}
						</Text>
					</Group>
				)}
			</Stack>
		</SectionCard>
	);
};

export default RankingProgramCard;
