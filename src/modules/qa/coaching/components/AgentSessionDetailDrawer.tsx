import { Badge, Group, Paper, Stack, Text, ThemeIcon } from '@mantine/core';
import {
	IconCalendarEvent,
	IconCheck,
	IconClock,
	IconPhone,
} from '@tabler/icons-react';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { AppDrawer } from '~/components/AppDrawer';
import { SectionCard } from '~/components/SectionCard';
import type { CoachingSessionRecord } from '~/models/qa';
import { AreaBadge } from '~/modules/qa/lms/components/Badges';
import pointerStyles from '~/modules/qa/lms/components/Cards.module.css';
import queueStyles from './Queue.module.css';
import { SESSION_STATUS_COLOR } from '../constants';

interface AgentSessionDetailDrawerProps {
	session: CoachingSessionRecord | null;
	opened: boolean;
	onClose: () => void;
}

/**
 * Read-only view of one coaching session for the agent — what they can review
 * after the fact (or ahead of an upcoming one). No edit, complete or status
 * controls: that belongs to the coach's own drawer (`SessionDetailDrawer`),
 * which this deliberately does not reuse.
 */
export function AgentSessionDetailDrawer({
	session,
	opened,
	onClose,
}: AgentSessionDetailDrawerProps) {
	const { t } = useTranslation('qa.lms');
	const navigate = useNavigate();

	if (!session) return null;

	const isAi = session.type === 'AI_MESSAGE';

	return (
		<AppDrawer
			opened={opened}
			onClose={onClose}
			size='lg'
			title={session.topic}
			description={`${dayjs(session.date).format('D MMM YYYY · HH:mm')} · ${session.coachName} · ${session.durationMin} min`}
			icon={<IconCalendarEvent size={18} />}
			iconColor={SESSION_STATUS_COLOR[session.status]}
		>
			<Stack gap='md'>
				<Group gap='xs'>
					<Badge
						size='xs'
						color={SESSION_STATUS_COLOR[session.status]}
						variant='light'
					>
						{t(`agent.coaching.status.${session.status.toLowerCase()}`)}
					</Badge>
					<Badge size='xs' variant='outline'>
						{session.coachRole}
					</Badge>
					{session.modality && (
						<Badge size='xs' variant='light' color='gray'>
							{t(`agent.coaching.modality.${session.modality}`)}
						</Badge>
					)}
					{session.area && (
						<AreaBadge
							area={session.area}
							subItem={session.subItem}
							size='xs'
						/>
					)}
				</Group>

				{isAi ? (
					<SectionCard
						title={t('agent.coaching.detail.aiMessage')}
						padding='md'
					>
						<Text size='sm' className={queueStyles.preWrap}>
							{session.aiMessage}
						</Text>
					</SectionCard>
				) : (
					<>
						<SectionCard
							title={t('agent.coaching.detail.talkingPoints')}
							padding='md'
						>
							{session.talkingPoints.length === 0 ? (
								<Text size='sm' c='dimmed'>
									{t('agent.coaching.detail.noPoints')}
								</Text>
							) : (
								<Stack gap={4}>
									{session.talkingPoints.map((point, i) => (
										<Text key={`${point}-${i}`} size='sm'>
											• {point}
										</Text>
									))}
								</Stack>
							)}
						</SectionCard>

						{session.evidenceCallIds.length > 0 && (
							<SectionCard
								title={t('agent.coaching.detail.evidence')}
								padding='md'
							>
								<Group gap='xs'>
									{session.evidenceCallIds.map((callId) => (
										<Badge
											key={callId}
											variant='light'
											leftSection={<IconPhone size={12} />}
											className={pointerStyles.pointer}
											onClick={() =>
												navigate(`/qa/campaigns/2/calls/${callId}`)
											}
										>
											{callId}
										</Badge>
									))}
								</Group>
							</SectionCard>
						)}

						<SectionCard
							title={t('agent.coaching.detail.actionItems')}
							padding='md'
						>
							{session.actionItems.length === 0 ? (
								<Text size='sm' c='dimmed'>
									{t('agent.coaching.detail.noItems')}
								</Text>
							) : (
								<Stack gap='xs'>
									{session.actionItems.map((item) => (
										<Paper key={item.id} withBorder p='xs' radius='sm'>
											<Group justify='space-between' wrap='nowrap'>
												<Stack gap={0} flex={1} miw={0}>
													<Text size='sm'>{item.text}</Text>
													<Text size='xs' c='dimmed'>
														{t('due.date', { date: item.dueDate })}
													</Text>
												</Stack>
												<ThemeIcon
													size='sm'
													radius='xl'
													variant='light'
													color={item.acknowledgedByAgent ? 'green' : 'gray'}
												>
													{item.acknowledgedByAgent ? (
														<IconCheck size={12} />
													) : (
														<IconClock size={12} />
													)}
												</ThemeIcon>
											</Group>
										</Paper>
									))}
								</Stack>
							)}
						</SectionCard>

						{session.outcome && (
							<SectionCard
								title={t('agent.coaching.detail.outcome')}
								padding='md'
							>
								<Text size='sm'>{session.outcome}</Text>
							</SectionCard>
						)}

						<SectionCard
							title={t('agent.coaching.detail.commitment')}
							padding='md'
						>
							{session.agentCommitment.acknowledged ? (
								<Badge
									color='green'
									variant='light'
									leftSection={<IconCheck size={12} />}
								>
									{t('agent.coaching.acknowledged', {
										date:
											session.agentCommitment.acknowledgedAt?.slice(0, 10) ??
											'',
									})}
								</Badge>
							) : (
								<Text size='sm' c='dimmed'>
									{t('agent.coaching.detail.notCommitted')}
								</Text>
							)}
						</SectionCard>
					</>
				)}
			</Stack>
		</AppDrawer>
	);
}

export default AgentSessionDetailDrawer;
