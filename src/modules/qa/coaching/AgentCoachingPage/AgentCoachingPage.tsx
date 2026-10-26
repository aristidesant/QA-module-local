import { useState } from 'react';
import { Grid, Stack } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { ContentContainer } from '~/components/ContentContainer';
import EmptyState from '~/components/EmptyState';
import type { CoachingSessionRecord } from '~/models/qa';
import { notifySuccess } from '~/modules/qa/utils/notifications';
import { useCoachingStore } from '~/stores/qa/coachingStore';
import { AgentSessionDetailDrawer } from '../components/AgentSessionDetailDrawer';
import { NextSessionCard } from './NextSessionCard';
import { PendingCard } from './PendingCard';
import { RecentSessionsCard } from './RecentSessionsCard';
import { SessionHistoryTable } from './SessionHistoryTable';
import { useAgentSessions } from './useAgentSessions';
import { whenPhrase } from './relativeDay';

/**
 * The agent's own Coaching page, ordered by urgency: the next session, what is
 * still pending, what the last sessions assigned, then the full history.
 * Learning material stays in My Learning; this page only tracks sessions and commitments.
 */
export default function AgentCoachingPage() {
	const { t } = useTranslation('qa.lms');
	const { all, next, pending, overdueCount, recent, impacts, history } =
		useAgentSessions();
	const acknowledgeActionItem = useCoachingStore(
		(s) => s.acknowledgeActionItem
	);
	const acknowledgeCommitment = useCoachingStore(
		(s) => s.acknowledgeCommitment
	);
	const [detailId, setDetailId] = useState<string | null>(null);

	// Read the live record so a checkbox ticked in the drawer updates it at once.
	const detail: CoachingSessionRecord | null =
		all.find((s) => s.id === detailId) ?? null;

	const commit = (sessionId: string) => {
		acknowledgeCommitment(sessionId, null);
		notifySuccess(t('agent.coaching.committed'));
	};
	const acknowledgeItem = (sessionId: string, itemId: string) => {
		acknowledgeActionItem(sessionId, itemId);
		notifySuccess(t('agent.coaching.itemAcknowledged'));
	};

	// One sentence that answers "when is it and what do I owe".
	const when = next ? whenPhrase(t, next.date) : '';
	const headline = next
		? pending.length > 0
			? t('agent.coaching.headline.withNext', { when, count: pending.length })
			: t('agent.coaching.headline.clear', { when })
		: pending.length > 0
			? t('agent.coaching.headline.noNext', { count: pending.length })
			: t('agent.coaching.headline.clearNoNext');

	return (
		<ContentContainer
			contentWidth='full'
			title={t('agent.coaching.title')}
			description={headline}
		>
			{all.length === 0 ? (
				<EmptyState message={t('agent.coaching.empty')} />
			) : (
				<Stack gap='md'>
					<NextSessionCard session={next} onOpen={(s) => setDetailId(s.id)} />
					<Grid>
						<Grid.Col span={{ base: 12, md: 7 }}>
							<PendingCard
								pending={pending}
								overdueCount={overdueCount}
								onAcknowledgeItem={acknowledgeItem}
								onCommit={commit}
							/>
						</Grid.Col>
						<Grid.Col span={{ base: 12, md: 5 }}>
							<RecentSessionsCard
								sessions={recent}
								onOpen={(s) => setDetailId(s.id)}
							/>
						</Grid.Col>
					</Grid>
					<SessionHistoryTable
						sessions={history}
						impacts={impacts}
						onOpen={(s) => setDetailId(s.id)}
					/>
				</Stack>
			)}
			<AgentSessionDetailDrawer
				session={detail}
				opened={detail !== null}
				onClose={() => setDetailId(null)}
				onAcknowledgeItem={(itemId) =>
					detail && acknowledgeItem(detail.id, itemId)
				}
				onCommit={() => detail && commit(detail.id)}
			/>
		</ContentContainer>
	);
}
