import {
	Badge,
	Button,
	Checkbox,
	Group,
	Paper,
	Stack,
	Text,
} from '@mantine/core';
import { IconChecklist } from '@tabler/icons-react';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import { SectionCard } from '~/components/SectionCard';
import type { CoachingSessionRecord } from '~/models/qa';
import type { OpenActionItem } from './useAgentSessions';

interface OpenCommitmentsCardProps {
	items: OpenActionItem[];
	commitments: CoachingSessionRecord[];
	onAcknowledgeItem: (sessionId: string, itemId: string) => void;
	onCommit: (sessionId: string) => void;
}

/** What the agent still has to acknowledge from completed sessions. */
export function OpenCommitmentsCard({
	items,
	commitments,
	onAcknowledgeItem,
	onCommit,
}: OpenCommitmentsCardProps) {
	const { t } = useTranslation('qa.lms');
	const count = items.length + commitments.length;

	return (
		<SectionCard
			title={t('agent.coaching.commitments.title')}
			icon={IconChecklist}
			fullHeight
			headerActions={
				count > 0 ? (
					<Badge size='sm' variant='light' color='gray'>
						{count}
					</Badge>
				) : undefined
			}
		>
			{count === 0 ? (
				<Text size='sm' c='dimmed'>
					{t('agent.coaching.commitments.empty')}
				</Text>
			) : (
				<Stack gap='xs'>
					{items.map(({ session, item }) => (
						<Paper key={item.id} withBorder p='xs' radius='sm'>
							<Checkbox
								size='sm'
								checked={false}
								onChange={() => onAcknowledgeItem(session.id, item.id)}
								label={item.text}
								description={t('agent.coaching.commitments.from', {
									topic: session.topic,
									date: dayjs(item.dueDate).format('D MMM'),
								})}
							/>
						</Paper>
					))}
					{commitments.map((session) => (
						<Paper key={session.id} withBorder p='xs' radius='sm'>
							<Group justify='space-between' wrap='nowrap' gap='xs'>
								<Stack gap={0} flex={1} miw={0}>
									<Text size='sm' fw={500}>
										{t('agent.coaching.commitments.commitTo', {
											topic: session.topic,
										})}
									</Text>
									<Text size='xs' c='dimmed'>
										{dayjs(session.date).format('D MMM YYYY')}
									</Text>
								</Stack>
								<Button
									size='compact-xs'
									variant='light'
									onClick={() => onCommit(session.id)}
								>
									{t('agent.coaching.acknowledge')}
								</Button>
							</Group>
						</Paper>
					))}
				</Stack>
			)}
		</SectionCard>
	);
}

export default OpenCommitmentsCard;
