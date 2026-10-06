import React from 'react';
import { useTranslation } from 'react-i18next';
import {
	Badge,
	Button,
	Group,
	Menu,
	Progress,
	Stack,
	Switch,
	Text,
} from '@mantine/core';
import {
	IconCopy,
	IconDotsVertical,
	IconEdit,
	IconPlayerStop,
	IconStar,
	IconTrash,
} from '@tabler/icons-react';
import dayjs from 'dayjs';
import SectionCard from '~/components/SectionCard';
import { TODAY } from '~/modules/qa/analytics/constants';
import type {
	RankingProgram,
	RankingStanding,
} from '~/models/qa/rankingPrograms';
import {
	daysLeft,
	elapsedPct,
	formatScore,
	formatTarget,
	isPermanent,
	leader,
} from '../helpers';
import { STATUS_COLOR } from '../constants';
import MetricChips from './MetricChips';

interface RankingProgramCardProps {
	program: RankingProgram;
	standings: RankingStanding[];
	onView: () => void;
	onEdit: () => void;
	onDuplicate: () => void;
	onToggleActive: (active: boolean) => void;
	onSetDefault: () => void;
	onEnd: () => void;
	onDelete: () => void;
}

export const RankingProgramCard: React.FC<RankingProgramCardProps> = ({
	program,
	standings,
	onView,
	onEdit,
	onDuplicate,
	onToggleActive,
	onSetDefault,
	onEnd,
	onDelete,
}) => {
	const { t } = useTranslation('qa.rankings');
	const top = leader(standings);
	const isLive = program.status === 'active';
	const isCompleted = program.status === 'completed';
	const canToggle = isLive || program.status === 'inactive';
	const permanent = isPermanent(program);
	const remaining = daysLeft(program);
	const elapsed = elapsedPct(program);
	const notStarted = program.startDate > TODAY;

	return (
		<SectionCard
			fullHeight
			title={program.name}
			description={program.description}
			headerActions={
				<Group gap='xs' wrap='nowrap'>
					{program.isDefault && (
						<Badge
							variant='outline'
							color='gray'
							leftSection={<IconStar size={12} />}
						>
							{t('card.default')}
						</Badge>
					)}
					{canToggle ? (
						<Switch
							checked={isLive}
							onChange={(e) => onToggleActive(e.currentTarget.checked)}
							label={t(isLive ? 'status.active' : 'status.inactive')}
							aria-label={t(isLive ? 'card.deactivate' : 'card.activate', {
								name: program.name,
							})}
						/>
					) : (
						<Badge variant='light' color={STATUS_COLOR[program.status]}>
							{t(`status.${program.status}`)}
						</Badge>
					)}
				</Group>
			}
			footer={
				<Group justify='space-between' w='100%'>
					<Button size='xs' variant='default' onClick={onView}>
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
							{permanent && !program.isDefault && !isCompleted && (
								<Menu.Item
									leftSection={<IconStar size={14} />}
									onClick={onSetDefault}
								>
									{t('card.setDefault')}
								</Menu.Item>
							)}
							{isLive && !permanent && (
								<Menu.Item
									color='red'
									leftSection={<IconPlayerStop size={14} />}
									onClick={onEnd}
								>
									{t('card.end')}
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
				<MetricChips program={program} />
				<Group gap='xs' wrap='wrap'>
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

				{permanent ? (
					<Text size='xs' c='dimmed'>
						{t('card.since', {
							date: dayjs(program.startDate).format('DD MMM YYYY'),
						})}{' '}
						· {t('card.noEndDate')}
					</Text>
				) : (
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
									: notStarted
										? t('card.notStarted', {
												date: dayjs(program.startDate).format('DD MMM'),
											})
										: t('card.daysLeft', { count: remaining ?? 0 })}
							</Text>
						</Group>
						<Progress
							value={elapsed ?? 0}
							size='sm'
							color={isCompleted ? 'gray' : 'blue'}
						/>
					</div>
				)}

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
