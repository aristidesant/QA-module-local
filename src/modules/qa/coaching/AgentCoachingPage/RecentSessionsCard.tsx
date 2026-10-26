import { Group, Stack, Text, UnstyledButton } from '@mantine/core';
import { IconCheck, IconClock, IconHistory } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { SectionCard } from '~/components/SectionCard';
import type { CoachingSessionRecord } from '~/models/qa';
import { AreaMark } from '~/modules/qa/lms/components/AreaMark';
import { formatDay } from '~/modules/qa/lms/helpers';
import classes from './RecentSessionsCard.module.css';

interface RecentSessionsCardProps {
	sessions: CoachingSessionRecord[];
	onOpen: (session: CoachingSessionRecord) => void;
}

/** The last completed sessions with what each one assigned and whether the agent has acknowledged it. Read only: acting happens in Pending. */
export function RecentSessionsCard({
	sessions,
	onOpen,
}: RecentSessionsCardProps) {
	const { t } = useTranslation('qa.lms');

	return (
		<SectionCard
			title={t('agent.coaching.recent.title')}
			icon={IconHistory}
			contentSpacing={0}
			fullHeight
		>
			{sessions.length === 0 ? (
				<Text size='sm' c='dimmed'>
					{t('agent.coaching.recent.empty')}
				</Text>
			) : (
				sessions.map((session) => {
					const done = session.actionItems.filter(
						(i) => i.acknowledgedByAgent
					).length;
					return (
						<UnstyledButton
							key={session.id}
							className={classes.session}
							onClick={() => onOpen(session)}
						>
							<Stack gap={6}>
								<Group justify='space-between' wrap='nowrap' gap='sm'>
									<Text size='sm' fw={600} lineClamp={1}>
										{session.topic}
									</Text>
									<Text size='xs' c='dimmed' miw='fit-content'>
										{formatDay(session.date)}
									</Text>
								</Group>
								{session.area && (
									<AreaMark area={session.area} subItem={session.subItem} />
								)}

								{session.actionItems.length === 0 ? (
									<Text size='sm' c='dimmed'>
										{t('agent.coaching.recent.noItems')}
									</Text>
								) : (
									<Stack gap={4}>
										<Text size='sm'>
											{t('agent.coaching.recent.progress', {
												done,
												total: session.actionItems.length,
											})}
										</Text>
										{session.actionItems.map((item) => (
											<Group
												key={item.id}
												gap={6}
												wrap='nowrap'
												className={classes.item}
											>
												{item.acknowledgedByAgent ? (
													<IconCheck
														size={14}
														color='var(--mantine-color-dimmed)'
														aria-label={t(
															'agent.coaching.recent.itemAcknowledged'
														)}
													/>
												) : (
													<IconClock
														size={14}
														color='var(--mantine-color-dimmed)'
														aria-label={t('agent.coaching.recent.itemDue', {
															date: formatDay(item.dueDate),
														})}
													/>
												)}
												<Text size='xs' lineClamp={1} flex={1} miw={0}>
													{item.text}
												</Text>
												{!item.acknowledgedByAgent && (
													<Text size='xs' c='dimmed' miw='fit-content'>
														{t('agent.coaching.recent.itemDue', {
															date: formatDay(item.dueDate),
														})}
													</Text>
												)}
											</Group>
										))}
									</Stack>
								)}

								{session.type !== 'AI_MESSAGE' && (
									<Text size='sm' c='dimmed'>
										{session.agentCommitment.acknowledged
											? t('agent.coaching.recent.committed', {
													date: formatDay(
														session.agentCommitment.acknowledgedAt ??
															session.date
													),
												})
											: t('agent.coaching.recent.commitmentPending')}
									</Text>
								)}
							</Stack>
						</UnstyledButton>
					);
				})
			)}
		</SectionCard>
	);
}

export default RecentSessionsCard;
