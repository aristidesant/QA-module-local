import { Button, Group, Stack, Text } from '@mantine/core';
import { IconRoute } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { SectionCard } from '~/components/SectionCard';
import type {
	LmsAssignment,
	LmsContent,
	LmsLearningPath,
	LmsPathEnrollment,
} from '~/models/qa';
import {
	AcceptanceBadge,
	AssignmentStatusBadge,
	ImpactBadge,
} from '../components/Badges';
import { ImpactSparkline } from '../components/ImpactSparkline';
import { PathStepper } from '../components/PathStepper';
import { formatDay, nextModule } from '../helpers';

interface ContentSidebarProps {
	content: LmsContent;
	assignment?: LmsAssignment;
	path?: LmsLearningPath;
	enrollment?: LmsPathEnrollment;
	contentById: Record<string, LmsContent>;
	onOpenModule: (contentId: string) => void;
}

export function ContentSidebar({
	content,
	assignment,
	path,
	enrollment,
	contentById,
	onOpenModule,
}: ContentSidebarProps) {
	const { t } = useTranslation(['qa.lms', 'qa.triggers']);
	const next = path ? nextModule(path, enrollment, contentById) : undefined;

	return (
		<Stack gap='md'>
			{assignment && (
				<SectionCard title={t('player.assignment.title')} padding='md'>
					<Stack gap='sm'>
						<Text size='sm'>{assignment.reason}</Text>
						<Stack gap={4}>
							<Text size='xs' c='dimmed'>
								{t('player.assignment.assignedOn', {
									name: assignment.assignedBy,
									date: formatDay(assignment.assignedAt),
								})}
							</Text>
							<Text size='xs' fw={600}>
								{t('player.assignment.due', {
									date: formatDay(assignment.dueDate),
								})}
							</Text>
						</Stack>
						<Group gap='xs'>
							<AssignmentStatusBadge assignment={assignment} size='xs' />
							<AcceptanceBadge acceptance={assignment.acceptance} size='xs' />
						</Group>
					</Stack>
				</SectionCard>
			)}

			{assignment?.impact && (
				<SectionCard title={t('impact.title')} padding='md'>
					<Stack gap='sm'>
						<Group gap='xs'>
							<ImpactBadge impact={assignment.impact} size='xs' />
							<Text size='xs' c='dimmed'>
								{t(`metrics.${assignment.impact.metricId}`, {
									ns: 'qa.triggers',
								})}
							</Text>
						</Group>
						<ImpactSparkline impact={assignment.impact} height={70} />
					</Stack>
				</SectionCard>
			)}

			{path && (
				<SectionCard
					title={t('player.partOfPath', { path: path.title })}
					icon={IconRoute}
					padding='md'
				>
					<Stack gap='sm'>
						<PathStepper
							path={path}
							enrollment={enrollment}
							contentById={contentById}
							onOpenModule={onOpenModule}
						/>
						{next && next.id !== content.id && (
							<Button
								size='xs'
								variant='light'
								onClick={() => onOpenModule(next.id)}
							>
								{t('player.completed.next', { title: next.title })}
							</Button>
						)}
					</Stack>
				</SectionCard>
			)}
		</Stack>
	);
}
