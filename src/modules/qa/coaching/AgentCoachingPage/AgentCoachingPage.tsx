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
import { OpenCommitmentsCard } from './OpenCommitmentsCard';
import { SessionHistoryTable } from './SessionHistoryTable';
import { SessionImpactCard } from './SessionImpactCard';
import { useAgentSessions } from './useAgentSessions';

/**
 * The agent's own Coaching page: the next session, what they still have to
 * acknowledge, what changed after past sessions and the full history. Learning
 * material stays in My Learning; this page only tracks sessions and commitments.
 */
export default function AgentCoachingPage() {
	const { t } = useTranslation('qa.lms');
	const { all, next, openItems, openCommitments, impacts, history } =
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

	return (
		<ContentContainer
			contentWidth='full'
			title={t('agent.coaching.title')}
			description={t('agent.coaching.description')}
		>
			{all.length === 0 ? (
				<EmptyState message={t('agent.coaching.empty')} />
			) : (
				<Stack gap='md'>
					<Grid>
						<Grid.Col span={{ base: 12, md: 7 }}>
							<NextSessionCard
								session={next}
								onOpen={(s) => setDetailId(s.id)}
							/>
						</Grid.Col>
						<Grid.Col span={{ base: 12, md: 5 }}>
							<OpenCommitmentsCard
								items={openItems}
								commitments={openCommitments}
								onAcknowledgeItem={acknowledgeItem}
								onCommit={commit}
							/>
						</Grid.Col>
					</Grid>
					<SessionImpactCard rows={impacts} onOpen={setDetailId} />
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
