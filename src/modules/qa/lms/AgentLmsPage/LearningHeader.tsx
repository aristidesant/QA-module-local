import {
	Group,
	Paper,
	RingProgress,
	SimpleGrid,
	Stack,
	Text,
	Title,
} from '@mantine/core';
import {
	IconAlertTriangle,
	IconCalendarDue,
	IconCircleCheck,
	IconClipboardCheck,
	IconMailForward,
} from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { StatCard } from '~/components/StatCard';
import type {
	LmsAssignment,
	LmsContent,
	LmsLearningPath,
	LmsPathEnrollment,
} from '~/models/qa';
import { agentLmsKpis, pathProgress } from '../helpers';

interface LearningHeaderProps {
	assignments: LmsAssignment[];
	paths: LmsLearningPath[];
	enrollments: LmsPathEnrollment[];
	contentById: Record<string, LmsContent>;
}

export function LearningHeader({
	assignments,
	paths,
	enrollments,
}: LearningHeaderProps) {
	const { t } = useTranslation('qa.lms');
	const kpis = agentLmsKpis(assignments);

	const activeEnrollment = enrollments.find((e) => !e.completedAt);
	const activePath = activeEnrollment
		? paths.find((p) => p.id === activeEnrollment.pathId)
		: undefined;
	const progress = activePath
		? pathProgress(activePath, activeEnrollment)
		: null;
	// Progress ring uses the one informational accent — area no longer carries its own color.
	const ringColor = activePath ? 'blue' : 'gray';

	return (
		<Stack gap='md'>
			<Group justify='space-between' align='flex-start' wrap='nowrap'>
				<Stack gap={0} flex={1}>
					<Text size='xs' c='dimmed' tt='uppercase' fw={600}>
						{t('agent.eyebrow')}
					</Text>
					<Title order={1}>{t('agent.title')}</Title>
					<Text c='dimmed' size='sm'>
						{t('agent.description')}
					</Text>
				</Stack>

				<Paper withBorder p='sm' radius='md'>
					<Group gap='sm' wrap='nowrap'>
						<RingProgress
							size={84}
							thickness={9}
							roundCaps
							sections={[{ value: progress?.percent ?? 0, color: ringColor }]}
							label={
								<Text size='sm' ta='center' fw={700}>
									{progress?.percent ?? 0}%
								</Text>
							}
						/>
						<Stack gap={2}>
							<Text size='xs' c='dimmed' tt='uppercase' fw={600}>
								{t('agent.activePath')}
							</Text>
							<Text size='sm' fw={600}>
								{activePath?.title ?? t('agent.noActivePath')}
							</Text>
							{activePath && progress && (
								<Text size='xs' c='dimmed'>
									{t('agent.paths.modules', {
										done: progress.done,
										total: progress.total,
									})}
								</Text>
							)}
						</Stack>
					</Group>
				</Paper>
			</Group>

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
