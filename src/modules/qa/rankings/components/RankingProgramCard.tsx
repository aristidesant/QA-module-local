import React from 'react';
import { useTranslation } from 'react-i18next';
import {
	ActionIcon,
	Badge,
	Button,
	Group,
	Menu,
	Stack,
	Text,
} from '@mantine/core';
import {
	IconClock,
	IconCopy,
	IconDotsVertical,
	IconEdit,
	IconPlayerPlay,
	IconPlayerStop,
	IconPower,
	IconStar,
	IconTrash,
	IconUser,
} from '@tabler/icons-react';
import dayjs from 'dayjs';
import SectionCard from '~/components/SectionCard';
import type {
	RankingProgram,
	RankingStanding,
} from '~/models/qa/rankingPrograms';
import { daysLeft, formatScore, leader, participantCount } from '../helpers';
import { STATUS_COLOR } from '../constants';
import MetricChips from './MetricChips';

interface RankingProgramCardProps {
	program: RankingProgram;
	standings: RankingStanding[];
	onView: () => void;
	onEdit: () => void;
	onDuplicate: () => void;
	/** Publishes a draft, or turns the default back on. */
	onPublish: () => void;
	onDisableDefault: () => void;
	onEnd: () => void;
	onDelete: () => void;
}

const day = (iso: string | null) => dayjs(iso).format('DD MMM');

/** A ranking in five facts: name, status, metric, time left, and who leads. The rest is on its page. */
export const RankingProgramCard: React.FC<RankingProgramCardProps> = ({
	program,
	standings,
	onView,
	onEdit,
	onDuplicate,
	onPublish,
	onDisableDefault,
	onEnd,
	onDelete,
}) => {
	const { t } = useTranslation('qa.rankings');
	const top = leader(standings);
	const { status, isDefault } = program;
	const isLive = status === 'active';
	const isCompleted = status === 'completed';
	const dated = program.endDate !== null;

	const timeLabel = isDefault
		? t('card.alwaysOn')
		: status === 'scheduled'
			? t('card.startsOn', { date: day(program.startDate) })
			: status === 'completed'
				? t('card.endedOn', { date: day(program.endDate) })
				: status === 'draft'
					? dated
						? t('card.draftDates', {
								from: day(program.startDate),
								to: day(program.endDate),
							})
						: t('card.alwaysOn')
					: `${t('card.daysLeft', { count: daysLeft(program) ?? 0 })} · ${t('card.endsOn', { date: day(program.endDate) })}`;

	const peopleLabel =
		isLive && top ? (
			<>
				<Text span c='dimmed'>
					{t('card.leader')}{' '}
				</Text>
				<Text span fw={600}>
					{top.agentName} · {formatScore(program, top.score)}
				</Text>
			</>
		) : isCompleted ? (
			<>
				<Text span c='dimmed'>
					{t('card.winner')}{' '}
				</Text>
				<Text span fw={600}>
					{program.winnerName ?? '—'}
				</Text>
			</>
		) : (
			<Text span c='dimmed'>
				{t('card.participants', { count: participantCount([program]) })}
			</Text>
		);

	return (
		<SectionCard
			fullHeight
			title={program.name}
			headerActions={
				isDefault ? (
					<Badge
						variant='light'
						color={isLive ? 'green' : 'gray'}
						leftSection={<IconStar size={12} />}
					>
						{t(isLive ? 'card.defaultStatus.on' : 'card.defaultStatus.off')}
					</Badge>
				) : (
					<Badge variant='light' color={STATUS_COLOR[status]}>
						{t(`status.${status}`)}
					</Badge>
				)
			}
			footer={
				<Group justify='space-between' w='100%'>
					<Button size='xs' variant='default' onClick={onView}>
						{t('card.view')}
					</Button>
					<Menu withArrow position='bottom-end'>
						<Menu.Target>
							<ActionIcon
								variant='subtle'
								color='gray'
								size={36}
								aria-label={t('card.more')}
							>
								<IconDotsVertical size={16} />
							</ActionIcon>
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
							{status === 'draft' && (
								<Menu.Item
									leftSection={<IconPlayerPlay size={14} />}
									onClick={onPublish}
								>
									{t('card.publish')}
								</Menu.Item>
							)}
							{isDefault && status === 'inactive' && (
								<Menu.Item
									leftSection={<IconPower size={14} />}
									onClick={onPublish}
								>
									{t('card.enable')}
								</Menu.Item>
							)}
							{isDefault && isLive && (
								<Menu.Item
									color='red'
									leftSection={<IconPower size={14} />}
									onClick={onDisableDefault}
								>
									{t('card.disable')}
								</Menu.Item>
							)}
							{isLive && dated && (
								<Menu.Item
									color='red'
									leftSection={<IconPlayerStop size={14} />}
									onClick={onEnd}
								>
									{t('card.end')}
								</Menu.Item>
							)}
							{status === 'draft' && (
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
				<MetricChips program={program} size='xs' />
				<Group gap={6} wrap='nowrap'>
					<IconClock size={14} color='var(--mantine-color-dimmed)' />
					<Text size='sm' c='dimmed'>
						{timeLabel}
					</Text>
				</Group>
				<Group gap={6} wrap='nowrap' align='flex-start'>
					<IconUser size={14} color='var(--mantine-color-dimmed)' />
					<Text size='sm'>{peopleLabel}</Text>
				</Group>
			</Stack>
		</SectionCard>
	);
};

export default RankingProgramCard;
