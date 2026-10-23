import { Anchor, Badge, Button, Group, Stack, Text } from '@mantine/core';
import { IconCalendarEvent, IconPhone } from '@tabler/icons-react';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { SectionCard } from '~/components/SectionCard';
import type { CoachingSessionRecord } from '~/models/qa';
import { AGENT_LMS_PATH } from '~/modules/qa/lms/constants';
import { AreaBadge } from '~/modules/qa/lms/components/Badges';
import pointerStyles from '~/modules/qa/lms/components/Cards.module.css';

const POINTS_SHOWN = 3;

interface NextSessionCardProps {
	session: CoachingSessionRecord | null;
	onOpen: (session: CoachingSessionRecord) => void;
}

/** The soonest scheduled session with what to bring to it. */
export function NextSessionCard({ session, onOpen }: NextSessionCardProps) {
	const { t } = useTranslation('qa.lms');
	const navigate = useNavigate();

	return (
		<SectionCard
			title={t('agent.coaching.next.title')}
			icon={IconCalendarEvent}
			fullHeight
		>
			{!session ? (
				<Text size='sm' c='dimmed'>
					{t('agent.coaching.next.empty')}
				</Text>
			) : (
				<Stack gap='sm'>
					<Group gap='xs' wrap='wrap'>
						<Text size='sm' fw={600}>
							{dayjs(session.date).format('ddd D MMM · HH:mm')}
						</Text>
						<Text size='sm' c='dimmed'>
							{session.durationMin} min · {session.coachName}
						</Text>
						{session.modality && (
							<Badge size='xs' variant='light' color='gray'>
								{t(`agent.coaching.modality.${session.modality}`)}
							</Badge>
						)}
					</Group>
					<Group gap='xs'>
						<Text fw={600}>{session.topic}</Text>
						{session.area && (
							<AreaBadge
								area={session.area}
								subItem={session.subItem}
								size='xs'
							/>
						)}
					</Group>
					{session.modality === 'IN_PERSON' && session.location && (
						<Text size='sm'>
							{t('agent.coaching.detail.location', {
								place: session.location,
							})}
						</Text>
					)}
					{session.talkingPoints.length > 0 && (
						<Stack gap={2}>
							<Text size='xs' c='dimmed' fw={600}>
								{t('agent.coaching.detail.talkingPoints')}
							</Text>
							{session.talkingPoints.slice(0, POINTS_SHOWN).map((point, i) => (
								<Text key={`${point}-${i}`} size='sm'>
									• {point}
								</Text>
							))}
							{session.talkingPoints.length > POINTS_SHOWN && (
								<Text size='xs' c='dimmed'>
									{t('agent.coaching.next.morePoints', {
										count: session.talkingPoints.length - POINTS_SHOWN,
									})}
								</Text>
							)}
						</Stack>
					)}
					{session.evidenceCallIds.length > 0 && (
						<Stack gap={4}>
							<Text size='xs' c='dimmed' fw={600}>
								{t('agent.coaching.detail.evidence')}
							</Text>
							<Group gap='xs'>
								{session.evidenceCallIds.map((callId) => (
									<Badge
										key={callId}
										variant='light'
										leftSection={<IconPhone size={12} />}
										className={pointerStyles.pointer}
										onClick={() => navigate(`/qa/campaigns/2/calls/${callId}`)}
									>
										{callId}
									</Badge>
								))}
							</Group>
						</Stack>
					)}
					{session.linkedAssignmentIds.length > 0 && (
						<Anchor size='sm' onClick={() => navigate(AGENT_LMS_PATH)}>
							{t('agent.coaching.next.material')}
						</Anchor>
					)}
					<Group>
						<Button variant='default' size='xs' onClick={() => onOpen(session)}>
							{t('agent.coaching.next.open')}
						</Button>
					</Group>
				</Stack>
			)}
		</SectionCard>
	);
}

export default NextSessionCard;
