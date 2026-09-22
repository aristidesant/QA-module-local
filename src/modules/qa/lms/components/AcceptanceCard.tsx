import { Alert, Badge, Button, Group, Paper, Stack, Text } from '@mantine/core';
import {
	IconAlertTriangle,
	IconCalendarEvent,
	IconCheck,
} from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import type { LmsAssignment, LmsContent } from '~/models/qa';
import { ACCEPTANCE_SLA_HOURS } from '../constants';
import { AreaBadge, FormatBadge } from './Badges';

interface AcceptanceCardProps {
	assignment: LmsAssignment;
	content: LmsContent | undefined;
	onAccept: () => void;
	onPropose: () => void;
}

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
		<Paper withBorder p='md' radius='md'>
			<Stack gap='sm'>
				<Stack gap={6}>
					<Group gap='xs'>
						<Text fw={600}>{content.title}</Text>
						{assignment.mandatory && (
							<Badge size='xs' color='gray' variant='outline'>
								{t('agent.assignments.mandatoryBadge')}
							</Badge>
						)}
					</Group>
					<Group gap='xs'>
						<FormatBadge format={content.format} size='xs' />
						<AreaBadge
							area={content.area}
							subItem={content.subItem}
							size='xs'
						/>
						<Text size='xs' c='dimmed'>
							{t('common.minutes', { count: content.durationMin })}
						</Text>
					</Group>
				</Stack>

				<Stack gap={2}>
					<Text size='xs' c='dimmed'>
						{t('agent.assignments.why')}
					</Text>
					<Text size='sm'>{assignment.reason}</Text>
				</Stack>

				<Group gap='xs'>
					<IconCalendarEvent size={16} />
					<Text size='sm' fw={500}>
						{t('due.date', { date: assignment.dueDate })}
					</Text>
					<Text size='xs' c='dimmed'>
						{t('agent.assignments.assignedBy', { name: assignment.assignedBy })}
					</Text>
				</Group>

				{noResponse && (
					<Alert
						color='red'
						variant='light'
						icon={<IconAlertTriangle size={16} />}
						p='xs'
					>
						<Text size='xs'>
							{t('agent.assignments.noResponse', {
								count: ACCEPTANCE_SLA_HOURS,
							})}
						</Text>
					</Alert>
				)}

				<Group justify='flex-end' gap='xs'>
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
			</Stack>
		</Paper>
	);
}
