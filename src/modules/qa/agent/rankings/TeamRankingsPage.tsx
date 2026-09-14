import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Badge, SimpleGrid, Stack } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { IconTrophy } from '@tabler/icons-react';
import ContentContainer from '~/components/ContentContainer';
import SectionCard from '~/components/SectionCard';
import EmptyState from '~/components/EmptyState';
import type { AgentRankingEntry } from '~/modules/qa/dashboard/mockData';
import { AGENT_PERSONA_ID } from '~/modules/qa/team/constants';
import { useRankingsStore } from '~/stores/qa/rankingsStore';
import { useActiveRanking } from '~/modules/qa/rankings/hooks/useActiveRanking';
import { formatScore, toRankingEntry } from '~/modules/qa/rankings/helpers';
import MyPositionCard from '~/modules/qa/rankings/components/MyPositionCard';
import PodiumStrip from '~/modules/qa/rankings/components/PodiumStrip';
import PastRankingsCard from '~/modules/qa/rankings/components/PastRankingsCard';
import ExpandedRankingsTable from './components/ExpandedRankingsTable';
import RankingCardGrid from './components/RankingCardGrid';
import RankingDetailDrawer from './components/RankingDetailDrawer';
import LeaderboardHeader from './components/LeaderboardHeader';

/** Below this width the table is replaced by the responsive card grid. */
const TABLE_BREAKPOINT = '(max-width: 1024px)';

/**
 * The agent's view of the ranking their supervisor is running: prize, their own
 * position, the podium and the full leaderboard.
 */
export const TeamRankingsPage: React.FC = () => {
	const { t } = useTranslation('qa.rankings');
	const isCompact = useMediaQuery(TABLE_BREAKPOINT);
	const { program, standings, pastPrograms } = useActiveRanking();
	const syncMilestones = useRankingsStore((s) => s.syncMilestones);

	const [selectedEntry, setSelectedEntry] = useState<AgentRankingEntry | null>(
		null
	);

	// Opening the leaderboard reconciles any milestone the agent has just reached.
	useEffect(() => {
		if (program) syncMilestones(program.id);
	}, [program, syncMilestones]);

	const entries = useMemo(
		() =>
			program
				? standings.map((standing) => toRankingEntry(standing, program))
				: [],
		[program, standings]
	);

	const mine = standings.find(
		(standing) => standing.agentId === AGENT_PERSONA_ID
	);
	const ranked = standings.filter((standing) => standing.rank !== null).length;

	const renderScore = useCallback(
		(score: number) => (program ? formatScore(program, score) : String(score)),
		[program]
	);

	const handleRowClick = useCallback((entry: AgentRankingEntry) => {
		setSelectedEntry(entry);
	}, []);

	if (!program) {
		return (
			<ContentContainer contentWidth='full'>
				<Stack gap='lg'>
					<EmptyState
						icon={<IconTrophy size={32} />}
						message={t('agent.empty.noActive')}
					/>
					<PastRankingsCard programs={pastPrograms} />
				</Stack>
			</ContentContainer>
		);
	}

	return (
		<ContentContainer contentWidth='full'>
			<Stack gap='lg'>
				<LeaderboardHeader program={program} />

				<SimpleGrid cols={{ base: 1, md: 2 }} spacing='lg'>
					<MyPositionCard program={program} standing={mine} total={ranked} />
					<PodiumStrip program={program} standings={standings} />
				</SimpleGrid>

				<SectionCard
					title={t('agent.leaderboard')}
					description={t('agent.leaderboardDescription')}
					headerActions={
						<Badge variant='light' size='sm'>
							{standings.length}
						</Badge>
					}
				>
					{isCompact ? (
						<RankingCardGrid
							data={entries}
							currentAgentId={AGENT_PERSONA_ID}
							formatScore={renderScore}
							onRowClick={handleRowClick}
						/>
					) : (
						<ExpandedRankingsTable
							data={entries}
							currentAgentId={AGENT_PERSONA_ID}
							formatScore={renderScore}
							onRowClick={handleRowClick}
						/>
					)}
				</SectionCard>

				<PastRankingsCard programs={pastPrograms} />
			</Stack>

			<RankingDetailDrawer
				entry={selectedEntry}
				data={entries}
				program={program}
				opened={selectedEntry !== null}
				onClose={() => setSelectedEntry(null)}
			/>
		</ContentContainer>
	);
};

export default TeamRankingsPage;
