import { useMemo, useState } from 'react';
import { Stack, Text } from '@mantine/core';
import { IconSparkles } from '@tabler/icons-react';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import { SectionCard } from '~/components/SectionCard';
import EmptyState from '~/components/EmptyState';
import type { CoachingSessionRecord } from '~/models/qa';
import {
	useCoachingStore,
	selectCohorts,
	selectSessions,
} from '~/stores/qa/coachingStore';
import { AgentSessionDetailDrawer } from '~/modules/qa/coaching/components/AgentSessionDetailDrawer';
import { AGENT_PERSONA } from '../../constants';
import cardStyles from '../../components/Cards.module.css';

export function AgentCoachingTab() {
	const { t } = useTranslation('qa.lms');
	const allSessions = useCoachingStore(selectSessions);
	const cohorts = useCoachingStore(selectCohorts);
	const [detailSession, setDetailSession] =
		useState<CoachingSessionRecord | null>(null);

	const sessions = useMemo(() => {
		const myCohortIds = cohorts
			.filter((c) => c.agentIds.includes(AGENT_PERSONA.id))
			.map((c) => c.id);
		return allSessions.filter(
			(s) =>
				s.status !== 'PROPOSED' &&
				(s.agentId === AGENT_PERSONA.id ||
					s.agentIds?.includes(AGENT_PERSONA.id) ||
					(s.cohortId && myCohortIds.includes(s.cohortId)))
		);
	}, [allSessions, cohorts]);

	// The last AI-written weekly review, so it reads like a message from the QA assistant.
	const latestAi = useMemo(
		() =>
			sessions
				.filter((s) => s.type === 'AI_MESSAGE')
				.sort((a, b) => b.date.localeCompare(a.date))[0] ?? null,
		[sessions]
	);

	if (!sessions.length) {
		return <EmptyState message={t('agent.coaching.empty')} />;
	}

	return (
		<Stack gap='md'>
			{latestAi && (
				<SectionCard
					title={t('agent.coaching.latestMessage')}
					description={t('agent.coaching.latestMessageDescription')}
					icon={IconSparkles}
				>
					<Stack
						gap={4}
						className={cardStyles.clickable}
						onClick={() => setDetailSession(latestAi)}
					>
						<Text size='xs' c='dimmed'>
							{dayjs(latestAi.date).format('D MMM YYYY')} · {latestAi.coachName}
						</Text>
						<Text size='sm'>{(latestAi.aiMessage ?? '').slice(0, 280)}…</Text>
					</Stack>
				</SectionCard>
			)}

			<AgentSessionDetailDrawer
				session={detailSession}
				opened={detailSession !== null}
				onClose={() => setDetailSession(null)}
			/>
		</Stack>
	);
}
