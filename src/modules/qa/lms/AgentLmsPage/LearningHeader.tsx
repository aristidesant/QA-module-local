import { SimpleGrid, Stack, Text, Title } from '@mantine/core';
import {
	IconAlertTriangle,
	IconCalendarDue,
	IconCircleCheck,
	IconClipboardCheck,
	IconMailForward,
} from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { StatCard } from '~/components/StatCard';
import type { LmsAssignment } from '~/models/qa';
import { agentLmsKpis } from '../helpers';

interface LearningHeaderProps {
	assignments: LmsAssignment[];
}

export function LearningHeader({ assignments }: LearningHeaderProps) {
	const { t } = useTranslation('qa.lms');
	const kpis = agentLmsKpis(assignments);

	return (
		<Stack gap='md'>
			<Stack gap={0}>
				<Text size='xs' c='dimmed' tt='uppercase' fw={600}>
					{t('agent.eyebrow')}
				</Text>
				<Title order={1}>{t('agent.title')}</Title>
				<Text c='dimmed' size='sm'>
					{t('agent.description')}
				</Text>
			</Stack>

			<SimpleGrid cols={{ base: 2, md: 5 }} spacing='md'>
				<StatCard
					title={t('agent.kpi.needsResponse')}
					value={kpis.needsResponse}
					color={
						kpis.needsResponse > 0 ? 'var(--mantine-color-yellow-7)' : undefined
					}
					icon={<IconMailForward size={18} />}
					variant='compact'
				/>
				<StatCard
					title={t('agent.kpi.dueThisWeek')}
					value={kpis.dueThisWeek}
					icon={<IconCalendarDue size={18} />}
					variant='compact'
				/>
				<StatCard
					title={t('agent.kpi.overdue')}
					value={kpis.overdue}
					color={kpis.overdue > 0 ? 'var(--mantine-color-red-7)' : undefined}
					icon={<IconAlertTriangle size={18} />}
					variant='compact'
				/>
				<StatCard
					title={t('agent.kpi.completedThisMonth')}
					value={kpis.completedThisMonth}
					icon={<IconCircleCheck size={18} />}
					variant='compact'
				/>
				<StatCard
					title={t('agent.kpi.quizAverage')}
					value={kpis.quizAverage === null ? '—' : `${kpis.quizAverage}%`}
					icon={<IconClipboardCheck size={18} />}
					variant='compact'
				/>
			</SimpleGrid>
		</Stack>
	);
}
