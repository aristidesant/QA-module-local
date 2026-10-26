import { Button, Group, Text } from '@mantine/core';
import { IconCheck } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import type { LmsAssignment, LmsContent } from '~/models/qa';
import { ACCEPTANCE_SLA_HOURS } from '../constants';
import { formatDay } from '../helpers';
import { FormatIcon } from './FormatIcon';
import rowClasses from './LearningRow.module.css';

interface AcceptanceCardProps {
	assignment: LmsAssignment;
	content: LmsContent | undefined;
	onAccept: () => void;
	onPropose: () => void;
}

/** An assignment waiting for the agent's answer: the reason, the deadline, two actions. */
export function AcceptanceCard({
	assignment,
	content,
	onAccept,
	onPropose,
}: AcceptanceCardProps) {
	const { t } = useTranslation('qa.lms');
	if (!content) return null;
	const noResponse = assignment.acceptance.status === 'NO_RESPONSE';

	return (
		<div className={rowClasses.row}>
			<span className={rowClasses.icon}>
				<FormatIcon format={content.format} />
			</span>
			<div className={rowClasses.main}>
				<Text size='sm' fw={600}>
					{content.title}
				</Text>
				<Text size='sm'>{assignment.reason}</Text>
				<Group gap='md' wrap='wrap'>
					<Text size='xs' fw={600}>
						{t('agent.assignments.dueOn', {
							date: formatDay(assignment.dueDate),
						})}
					</Text>
					<Text size='xs' c='dimmed'>
						{t('agent.assignments.assignedOn', {
							name: assignment.assignedBy,
							date: formatDay(assignment.assignedAt),
						})}
					</Text>
					<Text size='xs' c='dimmed'>
						{t('common.minutes', { count: content.durationMin })}
					</Text>
				</Group>
				{noResponse && (
					<Text size='xs' className={rowClasses.due}>
						{t('agent.assignments.noResponse', { count: ACCEPTANCE_SLA_HOURS })}
					</Text>
				)}
			</div>
			<Group gap='xs' wrap='nowrap'>
				<Button size='xs' variant='default' onClick={onPropose}>
					{t('agent.assignments.proposeDate')}
				</Button>
				<Button
					size='xs'
					leftSection={<IconCheck size={14} />}
					onClick={onAccept}
				>
					{t('agent.assignments.accept')}
				</Button>
			</Group>
		</div>
	);
}
