import { Alert, Badge, Button, Group, Paper, Stack, Text, Timeline } from '@mantine/core';
import {
	IconAlertTriangle,
	IconBell,
	IconCalendarEvent,
	IconCheck,
	IconCircleCheck,
	IconPlayerPlay,
	IconSend,
	IconUser,
} from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { AppDrawer } from '~/components/AppDrawer';
import { SectionCard } from '~/components/SectionCard';
import { notifySuccess } from '~/modules/qa/utils/notifications';
import { useLmsStore, notifyAgent } from '~/stores/qa/lmsStore';
import { AGENT_LMS_PATH } from '../constants';
import type { AssignmentRow, ManagerPersona } from '../helpers';
import { AcceptanceBadge, AreaBadge, AssignmentStatusBadge, FormatBadge, ImpactBadge } from './Badges';
import { ImpactSparkline } from './ImpactSparkline';
import classes from './Cards.module.css';

interface AssignmentDetailDrawerProps {
	assignment: AssignmentRow | null;
	persona: ManagerPersona;
	opened: boolean;
	onClose: () => void;
	onOpenProfile: (agentId: string) => void;
}

export function AssignmentDetailDrawer({
	assignment,
	persona,
	opened,
	onClose,
	onOpenProfile,
}: AssignmentDetailDrawerProps) {
	const { t } = useTranslation(['qa.lms', 'qa.triggers']);
	if (!assignment) return null;

	const { acceptance } = assignment;

	const handleDecision = (decision: 'APPROVED' | 'REJECTED') => {
		useLmsStore.getState().decideReschedule(assignment.id, decision, persona.name);
		notifyAgent(
			assignment.agentId,
			{ name: persona.name, role: persona.role },
			{
				priority: 'NORMAL',
				title:
					decision === 'APPROVED'
						? t('acceptance.approved')
						: t('acceptance.rejected'),
				message: `${persona.name}: "${assignment.contentTitle}" — ${
					decision === 'APPROVED'
						? t('manager.assignments.detail.approved', { name: persona.name })
						: t('manager.assignments.detail.rejected', { name: persona.name })
				}`,
				actions: [{ label: 'Open My Learning', url: `${AGENT_LMS_PATH}?tab=assignments`, icon: 'book' }],
			}
		);
		notifySuccess(t('manager.assignments.detail.decided', { name: assignment.agentName }));
		onClose();
	};

	const handleRemind = () => {
		notifyAgent(
			assignment.agentId,
			{ name: persona.name, role: persona.role },
			{
				priority: 'HIGH',
				title: `Reminder: please respond to "${assignment.contentTitle}"`,
				message: `${persona.name} is waiting for your answer. Due ${assignment.dueDate}. ${assignment.reason}`,
				actions: [{ label: 'Open My Learning', url: `${AGENT_LMS_PATH}?tab=assignments`, icon: 'book' }],
			}
		);
		notifySuccess(t('manager.assignments.detail.reminded', { name: assignment.agentName }));
	};

	return (
		<AppDrawer
			opened={opened}
			onClose={onClose}
			size='md'
			title={assignment.contentTitle}
			description={`${assignment.agentName} · ${assignment.team}`}
			icon={<IconCalendarEvent size={18} />}
			iconColor='blue'
		>
			<Stack gap='md'>
				<Group gap='xs'>
					<FormatBadge format={assignment.format} size='xs' />
					<AreaBadge area={assignment.area} size='xs' />
					<AssignmentStatusBadge assignment={assignment} size='xs' />
					<AcceptanceBadge acceptance={acceptance} size='xs' />
					{assignment.mandatory && (
						<Badge size='xs' color='red' variant='light'>
							{t('agent.assignments.mandatoryBadge')}
						</Badge>
					)}
				</Group>

				<div className={classes.reasonBlock}>
					<Text size='xs' c='dimmed'>
						{t('manager.assignments.detail.reason')}
					</Text>
					<Text size='sm'>{assignment.reason}</Text>
				</div>

				{acceptance.status === 'RESCHEDULE_REQUESTED' && (
					<Alert color='orange' variant='light' icon={<IconCalendarEvent size={18} />}>
						<Stack gap='sm'>
							<Text size='sm' fw={500}>
								{t('manager.assignments.detail.rescheduleAsk', { date: acceptance.proposedDueDate })}
							</Text>
							{acceptance.reason && (
								<Text size='xs' c='dimmed'>
									{t('manager.assignments.detail.rescheduleReason')}: {acceptance.reason}
								</Text>
							)}
							<Group gap='xs'>
								<Button size='xs' onClick={() => handleDecision('APPROVED')}>
									{t('manager.assignments.detail.approve')}
								</Button>
								<Button size='xs' variant='default' onClick={() => handleDecision('REJECTED')}>
									{t('manager.assignments.detail.reject')}
								</Button>
							</Group>
						</Stack>
					</Alert>
				)}

				{acceptance.status === 'NO_RESPONSE' && (
					<Alert color='red' variant='light' icon={<IconAlertTriangle size={18} />}>
						<Stack gap='sm'>
							<Text size='sm'>{t('manager.assignments.detail.noResponse')}</Text>
							<Button size='xs' color='red' variant='light' leftSection={<IconBell size={14} />} onClick={handleRemind}>
								{t('manager.assignments.detail.remind')}
							</Button>
						</Stack>
					</Alert>
				)}

				<SectionCard title={t('manager.assignments.detail.timeline')} padding='md'>
					<Timeline active={4} bulletSize={20} lineWidth={2}>
						<Timeline.Item bullet={<IconSend size={11} />} title={t('manager.assignments.detail.assignedOn', { name: assignment.assignedBy, date: assignment.assignedAt })} />
						{acceptance.respondedAt && (
							<Timeline.Item
								bullet={<IconCheck size={11} />}
								title={
									acceptance.status === 'RESCHEDULE_REQUESTED'
										? t('manager.assignments.detail.rescheduleAsk', { date: acceptance.proposedDueDate })
										: t('manager.assignments.detail.acceptedOn', { date: acceptance.respondedAt.slice(0, 10) })
								}
							/>
						)}
						{assignment.startedAt && (
							<Timeline.Item
								bullet={<IconPlayerPlay size={11} />}
								title={t('manager.assignments.detail.started', { date: assignment.startedAt })}
							/>
						)}
						{assignment.completedAt && (
							<Timeline.Item
								bullet={<IconCircleCheck size={11} />}
								title={t('manager.assignments.detail.completed', { date: assignment.completedAt })}
							/>
						)}
					</Timeline>
				</SectionCard>

				{assignment.impact && (
					<SectionCard title={t('manager.assignments.detail.impact')} padding='md'>
						<Stack gap='sm'>
							<Group gap='xs'>
								<ImpactBadge impact={assignment.impact} size='xs' />
								<Text size='xs' c='dimmed'>
									{t(`metrics.${assignment.impact.metricId}`, { ns: 'qa.triggers' })}
								</Text>
							</Group>
							<ImpactSparkline impact={assignment.impact} height={80} />
						</Stack>
					</SectionCard>
				)}

				{assignment.score !== null && (
					<Paper withBorder p='sm' radius='md'>
						<Text size='sm'>{t('agent.assignments.score', { value: assignment.score })}</Text>
					</Paper>
				)}

				<Button
					variant='light'
					leftSection={<IconUser size={16} />}
					onClick={() => onOpenProfile(assignment.agentId)}
				>
					{t('manager.assignments.detail.openProfile')}
				</Button>
			</Stack>
		</AppDrawer>
	);
}
