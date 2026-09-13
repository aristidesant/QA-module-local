import { Badge, Button, Group, Paper, Progress, Stack, Text } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import type { LmsAssignment, LmsContent } from '~/models/qa';
import { LMS_FORMAT_META } from '../constants';
import { dueLabel, effectiveStatus } from '../helpers';
import { AcceptanceBadge, AreaBadge, AssignmentStatusBadge, FormatBadge } from './Badges';
import classes from './Cards.module.css';

interface AssignmentCardProps {
	assignment: LmsAssignment;
	content: LmsContent | undefined;
	onOpen: () => void;
}

export function AssignmentCard({ assignment, content, onOpen }: AssignmentCardProps) {
	const { t } = useTranslation('qa.lms');
	if (!content) return null;

	const status = effectiveStatus(assignment);
	const overdue = status === 'OVERDUE';
	const ctaKey =
		assignment.progress > 0 && status !== 'COMPLETED' ? 'cta.continue' : LMS_FORMAT_META[content.format].ctaKey;

	return (
		<Paper
			withBorder
			p='md'
			radius='md'
			className={`${classes.areaBar} ${overdue ? classes.overdue : ''}`}
			data-area={content.area}
		>
			<Stack gap='xs'>
				<Group justify='space-between' align='flex-start' wrap='nowrap'>
					<Stack gap={6} flex={1} miw={0}>
						<Group gap='xs'>
							<Text fw={600} size='sm'>
								{content.title}
							</Text>
							{assignment.mandatory && (
								<Badge size='xs' color='red' variant='light'>
									{t('agent.assignments.mandatoryBadge')}
								</Badge>
							)}
						</Group>
						<Group gap='xs'>
							<FormatBadge format={content.format} size='xs' />
							<AreaBadge area={content.area} subItem={content.subItem} size='xs' />
						</Group>
					</Stack>
					<Group gap='xs'>
						<AcceptanceBadge acceptance={assignment.acceptance} size='xs' />
						<AssignmentStatusBadge assignment={assignment} size='xs' />
					</Group>
				</Group>

				<div className={classes.reasonBlock}>
					<Text size='xs' c='dimmed'>
						{t('agent.assignments.why')}
					</Text>
					<Text size='xs'>{assignment.reason}</Text>
				</div>

				{assignment.progress > 0 && status !== 'COMPLETED' && (
					<Stack gap={4}>
						<Progress value={assignment.progress} size='sm' radius='xl' />
						<Text size='xs' c='dimmed'>
							{t('agent.assignments.progress', { value: assignment.progress })}
						</Text>
					</Stack>
				)}

				<Group justify='space-between' align='center'>
					<Stack gap={0}>
						<Text size='xs' c={overdue ? 'red' : 'dimmed'} fw={overdue ? 600 : 400}>
							{dueLabel(t, assignment)}
						</Text>
						<Text size='xs' c='dimmed'>
							{t('agent.assignments.assignedBy', { name: assignment.assignedBy })} ·{' '}
							{t('common.minutes', { count: content.durationMin })}
						</Text>
					</Stack>
					<Button size='xs' onClick={onOpen} variant={overdue ? 'filled' : 'light'} color={overdue ? 'red' : undefined}>
						{t(ctaKey)}
					</Button>
				</Group>
			</Stack>
		</Paper>
	);
}
