import { Button, Group, Stack, Text } from '@mantine/core';
import { IconCalendarEvent } from '@tabler/icons-react';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import { SectionCard } from '~/components/SectionCard';
import type { CoachingSessionRecord } from '~/models/qa';

interface NextSessionCardProps {
	session: CoachingSessionRecord | null;
	onOpen: (session: CoachingSessionRecord) => void;
}

/** The soonest scheduled session: when it is and what it is about, nothing more. */
export function NextSessionCard({ session, onOpen }: NextSessionCardProps) {
	const { t } = useTranslation('qa.lms');

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
					<Text size='sm' fw={600}>
						{dayjs(session.date).format('ddd D MMM · HH:mm')}
					</Text>
					<Text fw={600}>{session.topic}</Text>
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
