import { Button, Divider, Group, Stack, Text } from '@mantine/core';
import { IconClock, IconRoute, IconUser } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { SectionCard } from '~/components/SectionCard';
import type { LmsAssignment, LmsContent, LmsLearningPath, LmsPathEnrollment } from '~/models/qa';
import { AcceptanceBadge, AreaBadge, AssignmentStatusBadge, FormatBadge, ImpactBadge } from '../components/Badges';
import { ImpactSparkline } from '../components/ImpactSparkline';
import { PathStepper } from '../components/PathStepper';
import { nextModule } from '../helpers';

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
			<SectionCard title={content.title} padding='md'>
				<Stack gap='sm'>
					<Group gap='xs'>
						<FormatBadge format={content.format} size='xs' />
						<AreaBadge area={content.area} subItem={content.subItem} size='xs' />
					</Group>

					<Group gap='lg'>
						<Group gap={4}>
							<IconClock size={14} />
							<Text size='xs' c='dimmed'>
								{t('common.minutes', { count: content.durationMin })}
							</Text>
						</Group>
						<Text size='xs' c='dimmed'>
							{t('player.meta.level')}: {t(`levels.${content.level}`)}
						</Text>
					</Group>

					<Group gap={4}>
						<IconUser size={14} />
						<Text size='xs' c='dimmed'>
							{t('player.meta.by', { name: content.author })}
						</Text>
					</Group>

					{assignment && (
						<>
							<Divider />
							<Stack gap={6}>
								<Group gap='xs'>
									<AssignmentStatusBadge assignment={assignment} size='xs' />
									<AcceptanceBadge acceptance={assignment.acceptance} size='xs' />
								</Group>
								<Text size='xs' c='dimmed'>
									{t('player.meta.assigned', { date: assignment.assignedAt })}
								</Text>
								<Text size='xs' c='dimmed'>
									{t('player.meta.due', { date: assignment.dueDate })}
								</Text>
								<Text size='xs'>{assignment.reason}</Text>
							</Stack>
						</>
					)}
				</Stack>
			</SectionCard>

			{assignment?.impact && (
				<SectionCard title={t('impact.title')} padding='md'>
					<Stack gap='sm'>
						<Group gap='xs'>
							<ImpactBadge impact={assignment.impact} size='xs' />
							<Text size='xs' c='dimmed'>
								{t(`metrics.${assignment.impact.metricId}`, { ns: 'qa.triggers' })}
							</Text>
						</Group>
						<ImpactSparkline impact={assignment.impact} height={70} />
					</Stack>
				</SectionCard>
			)}

			{path && (
				<SectionCard title={t('player.partOfPath', { path: path.title })} icon={IconRoute} padding='md'>
					<Stack gap='sm'>
						<PathStepper
							path={path}
							enrollment={enrollment}
							contentById={contentById}
							onOpenModule={onOpenModule}
						/>
						{next && next.id !== content.id && (
							<Button size='xs' variant='light' onClick={() => onOpenModule(next.id)}>
								{t('player.nextModule')}: {next.title}
							</Button>
						)}
					</Stack>
				</SectionCard>
			)}
		</Stack>
	);
}
