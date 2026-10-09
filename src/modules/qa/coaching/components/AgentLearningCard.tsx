import { Button, Group, Progress, Stack, Text } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { SectionCard } from '~/components/SectionCard';
import type {
	LmsAssignment,
	LmsContent,
	LmsLearningPath,
	LmsPathEnrollment,
} from '~/models/qa';
import { AssignmentStatusBadge } from '~/modules/qa/lms/components/Badges';
import { LMS_FORMAT_META } from '~/modules/qa/lms/constants';
import { dueLabel, pathProgress } from '~/modules/qa/lms/helpers';

const MAX_OPEN = 5;

interface AgentLearningCardProps {
	agentId: string;
	assignments: LmsAssignment[];
	enrollments: LmsPathEnrollment[];
	paths: LmsLearningPath[];
	contentById: Record<string, LmsContent>;
	onViewAll: () => void;
}

/** What the agent is learning right now: the paths they are enrolled in and their open materials. */
export function AgentLearningCard({
	agentId,
	assignments,
	enrollments,
	paths,
	contentById,
	onViewAll,
}: AgentLearningCardProps) {
	const { t } = useTranslation('qa.coaching');
	const { t: tLms } = useTranslation('qa.lms');

	const open = assignments
		.filter((a) => a.agentId === agentId && a.status !== 'COMPLETED')
		.sort((a, b) => a.dueDate.localeCompare(b.dueDate));

	const enrolled = enrollments
		.filter((e) => e.agentId === agentId)
		.flatMap((e) => {
			const path = paths.find((p) => p.id === e.pathId);
			return path ? [{ path, progress: pathProgress(path, e) }] : [];
		});

	return (
		<SectionCard
			title={t('sessions.learning.title')}
			padding='md'
			headerActions={
				<Button size='xs' variant='subtle' onClick={onViewAll}>
					{t('sessions.learning.viewAll')}
				</Button>
			}
		>
			{open.length === 0 && enrolled.length === 0 ? (
				<Text size='sm' c='dimmed'>
					{t('sessions.learning.empty')}
				</Text>
			) : (
				<Stack gap='md'>
					{enrolled.map(({ path, progress }) => (
						<Stack key={path.id} gap={4}>
							<Group justify='space-between' wrap='nowrap'>
								<Text size='sm' lineClamp={1}>
									{path.title}
								</Text>
								<Text size='xs' c='dimmed' flex='none'>
									{t('sessions.learning.modules', {
										done: progress.done,
										total: progress.total,
									})}
								</Text>
							</Group>
							<Progress
								size='xs'
								color='gray'
								value={progress.percent}
								aria-label={`${path.title} ${progress.percent}%`}
							/>
						</Stack>
					))}

					{open.slice(0, MAX_OPEN).map((a) => {
						const material = contentById[a.contentId];
						return (
							<Group key={a.id} justify='space-between' wrap='nowrap'>
								<Stack gap={0} miw={0}>
									<Text size='sm' lineClamp={1}>
										{material?.title ?? a.contentId}
									</Text>
									<Text size='xs' c='dimmed'>
										{material &&
											`${tLms(LMS_FORMAT_META[material.format].labelKey)} · `}
										{dueLabel(tLms, a)}
									</Text>
								</Stack>
								<AssignmentStatusBadge assignment={a} size='xs' />
							</Group>
						);
					})}

					{open.length > MAX_OPEN && (
						<Text size='xs' c='dimmed'>
							{t('sessions.learning.more', { count: open.length - MAX_OPEN })}
						</Text>
					)}
				</Stack>
			)}
		</SectionCard>
	);
}
