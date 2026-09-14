import React from 'react';
import { useTranslation } from 'react-i18next';
import { Badge, Group, Progress, Stack, Text, Title } from '@mantine/core';
import { IconCalendar, IconClock, IconTarget } from '@tabler/icons-react';
import dayjs from 'dayjs';
import type { RankingProgram } from '~/models/qa/rankingPrograms';
import { CALL_EVALUATION_TABS } from '~/views/Campaigns/constants';
import {
	daysLeft,
	elapsedPct,
	formatTarget,
} from '~/modules/qa/rankings/helpers';
import styles from '~/modules/qa/rankings/Rankings.module.css';

interface LeaderboardHeaderProps {
	program: RankingProgram;
}

/** Name, period, target and prize of the ranking the agent is competing in. */
export const LeaderboardHeader: React.FC<LeaderboardHeaderProps> = ({
	program,
}) => {
	const { t } = useTranslation('qa.rankings');
	const typeMeta = CALL_EVALUATION_TABS.find(
		(tab) => tab.key === program.evaluationType
	);
	const remaining = daysLeft(program);
	const completed = program.status === 'completed';

	return (
		<Stack gap='md'>
			<Group justify='space-between' align='flex-start' wrap='wrap'>
				<div>
					<Title order={2}>{program.name}</Title>
					{program.description && (
						<Text c='dimmed' mt='xs'>
							{program.description}
						</Text>
					)}
					<Text size='xs' c='dimmed' mt={4}>
						{t('agent.header.setBy', { name: program.createdBy })}
					</Text>
				</div>
				<Group gap='xs' align='flex-start'>
					<Badge size='lg' variant='light' color={typeMeta?.color ?? 'gray'}>
						{t(`types.${program.evaluationType}`)}
					</Badge>
					<Badge
						size='lg'
						variant='light'
						color='yellow'
						className={styles.prizeChip}
						leftSection={program.prize.icon}
					>
						{program.prize.title}
					</Badge>
				</Group>
			</Group>

			<Group gap='xl' wrap='wrap'>
				<div>
					<Text size='xs' c='dimmed' tt='uppercase' fw={600}>
						{t('editor.start')}
					</Text>
					<Group gap={4} mt={4}>
						<IconCalendar size={16} />
						<Text size='sm'>
							{dayjs(program.startDate).format('DD MMM YYYY')}
						</Text>
					</Group>
				</div>
				<div>
					<Text size='xs' c='dimmed' tt='uppercase' fw={600}>
						{t('editor.end')}
					</Text>
					<Group gap={4} mt={4}>
						<IconClock size={16} />
						<Text size='sm'>
							{dayjs(program.endDate).format('DD MMM YYYY')}
						</Text>
					</Group>
				</div>
				<div>
					<Text size='xs' c='dimmed' tt='uppercase' fw={600}>
						{t('editor.target')}
					</Text>
					<Group gap={4} mt={4}>
						<IconTarget size={16} />
						<Text size='sm' fw={600}>
							{formatTarget(program)}
						</Text>
					</Group>
				</div>
				<div>
					<Text size='xs' c='dimmed' tt='uppercase' fw={600}>
						{completed
							? t('agent.header.completed')
							: t('agent.header.daysLeft', { count: remaining })}
					</Text>
				</div>
			</Group>

			<Progress value={elapsedPct(program)} radius='md' size='sm' />
		</Stack>
	);
};

export default LeaderboardHeader;
