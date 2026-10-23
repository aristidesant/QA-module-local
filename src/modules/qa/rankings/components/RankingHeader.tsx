import type { ReactNode } from 'react';
import { Badge, Group, Progress, Stack, Text, Title } from '@mantine/core';
import {
	IconCalendar,
	IconClock,
	IconStar,
	IconTarget,
} from '@tabler/icons-react';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import type { RankingProgram } from '~/models/qa/rankingPrograms';
import { PRIZE_ICON, STATUS_COLOR } from '../constants';
import { daysLeft, elapsedPct, formatTarget, isPermanent } from '../helpers';
import MetricChips from './MetricChips';
import styles from '../Rankings.module.css';

interface RankingHeaderProps {
	program: RankingProgram;
	/** Page-level actions (for example Edit) shown at the right of the title. */
	actions?: ReactNode;
}

function Fact({
	label,
	icon,
	children,
}: {
	label: string;
	icon: ReactNode;
	children: ReactNode;
}) {
	return (
		<div>
			<Text size='xs' c='dimmed' tt='uppercase' fw={600}>
				{label}
			</Text>
			<Group gap={4} mt={4} wrap='nowrap'>
				{icon}
				<Text size='sm' fw={500}>
					{children}
				</Text>
			</Group>
		</div>
	);
}

/** Name, status, prize, metrics and period of a ranking: the same header for whoever is looking. */
export function RankingHeader({ program, actions }: RankingHeaderProps) {
	const { t } = useTranslation('qa.rankings');
	const remaining = daysLeft(program);
	const elapsed = elapsedPct(program);
	const permanent = isPermanent(program);
	const completed = program.status === 'completed';
	const PrizeIcon = PRIZE_ICON[program.prize.kind];

	return (
		<Stack gap='md'>
			<Group justify='space-between' align='flex-start' wrap='wrap'>
				<Stack gap={6}>
					<Title order={1}>{program.name}</Title>
					{program.description && (
						<Text size='sm' c='dimmed'>
							{program.description}
						</Text>
					)}
					<Text size='xs' c='dimmed'>
						{t('agent.header.setBy', { name: program.createdBy })}
					</Text>
					<Group gap='xs' mt={4}>
						<Badge variant='light' color={STATUS_COLOR[program.status]}>
							{t(`status.${program.status}`)}
						</Badge>
						{program.isDefault && (
							<Badge
								variant='outline'
								color='gray'
								leftSection={<IconStar size={12} />}
							>
								{t('card.default')}
							</Badge>
						)}
						<Badge
							size='lg'
							variant='outline'
							color='gray'
							className={styles.prizeChip}
							leftSection={<PrizeIcon size={14} />}
						>
							{program.prize.title}
						</Badge>
					</Group>
				</Stack>
				{actions}
			</Group>

			<MetricChips program={program} size='md' />

			<Group gap='xl' wrap='wrap' align='flex-start'>
				<Fact label={t('editor.start')} icon={<IconCalendar size={16} />}>
					{dayjs(program.startDate).format('DD MMM YYYY')}
				</Fact>
				<Fact label={t('editor.end')} icon={<IconClock size={16} />}>
					{program.endDate
						? dayjs(program.endDate).format('DD MMM YYYY')
						: t('agent.header.noEndDate')}
				</Fact>
				<Fact label={t('editor.target')} icon={<IconTarget size={16} />}>
					{formatTarget(program)}
				</Fact>
				<Text size='xs' c='dimmed' tt='uppercase' fw={600}>
					{completed
						? t('agent.header.completed')
						: permanent
							? t('agent.header.ongoing')
							: t('agent.header.daysLeft', { count: remaining ?? 0 })}
				</Text>
			</Group>

			{elapsed !== null && (
				<Progress
					value={elapsed}
					radius='md'
					size='sm'
					color={completed ? 'gray' : 'blue'}
				/>
			)}
		</Stack>
	);
}

export default RankingHeader;
