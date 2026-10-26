import { Button, Group, Stack, Text, Title } from '@mantine/core';
import { IconCalendarEvent } from '@tabler/icons-react';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import { SectionCard } from '~/components/SectionCard';
import type { CoachingSessionRecord } from '~/models/qa';
import { AreaMark } from '~/modules/qa/lms/components/AreaMark';
import classes from './NextSessionCard.module.css';
import { whenHeading } from './relativeDay';

interface NextSessionCardProps {
	session: CoachingSessionRecord | null;
	onOpen: (session: CoachingSessionRecord) => void;
}

/** The soonest scheduled session as the page hero: when it is, what it covers, where, and how to prepare. */
export function NextSessionCard({ session, onOpen }: NextSessionCardProps) {
	const { t } = useTranslation('qa.lms');

	const place = !session
		? null
		: session.modality === 'IN_PERSON'
			? session.location
				? t('agent.coaching.next.inPerson', { place: session.location })
				: t('agent.coaching.next.inPersonNoPlace')
			: session.modality === 'REMOTE'
				? t('agent.coaching.next.remote')
				: null;

	const joinHref = session?.meetingLink
		? /^https?:\/\//i.test(session.meetingLink)
			? session.meetingLink
			: `https://${session.meetingLink}`
		: null;

	return (
		<SectionCard
			title={t('agent.coaching.next.title')}
			icon={IconCalendarEvent}
			padding='lg'
		>
			{!session ? (
				<Text size='sm' c='dimmed'>
					{t('agent.coaching.next.empty')}
				</Text>
			) : (
				<div className={classes.grid}>
					<Stack gap={4}>
						<Title order={2}>{whenHeading(t, session.date)}</Title>
						<Text size='sm'>
							{dayjs(session.date).format('dddd D MMM, HH:mm')}
						</Text>
						<Text size='sm' c='dimmed'>
							{t('agent.coaching.next.duration', {
								count: session.durationMin,
							})}
						</Text>
					</Stack>

					<Stack gap='xs' className={classes.detail}>
						<Group gap='md' wrap='wrap'>
							<Title order={4}>{session.topic}</Title>
							{session.area && (
								<AreaMark
									area={session.area}
									subItem={session.subItem}
									size='sm'
								/>
							)}
						</Group>
						<Text size='sm'>
							{t('agent.coaching.next.with', { name: session.coachName })}
						</Text>
						{place && <Text size='sm'>{place}</Text>}
						<Text size='sm' c='dimmed'>
							{session.talkingPoints.length > 0
								? t('agent.coaching.next.points', {
										count: session.talkingPoints.length,
									})
								: t('agent.coaching.next.noPoints')}
						</Text>
						<Group gap='xs' mt='xs'>
							<Button size='sm' onClick={() => onOpen(session)}>
								{t('agent.coaching.next.view')}
							</Button>
							{joinHref && (
								<Button
									size='sm'
									variant='default'
									component='a'
									href={joinHref}
									target='_blank'
									rel='noreferrer'
								>
									{t('agent.coaching.next.join')}
								</Button>
							)}
						</Group>
					</Stack>
				</div>
			)}
		</SectionCard>
	);
}

export default NextSessionCard;
