import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router';
import { useTranslation } from 'react-i18next';
import { Badge, Stack, Tabs } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { IconHistory, IconTrophy } from '@tabler/icons-react';
import ContentContainer from '~/components/ContentContainer';
import SectionCard from '~/components/SectionCard';
import EmptyState from '~/components/EmptyState';
import type { AgentRankingEntry } from '~/modules/qa/dashboard/mockData';
import { AGENT_PERSONA_ID } from '~/modules/qa/team/constants';
import { useRankingsStore } from '~/stores/qa/rankingsStore';
import { useActiveRanking } from '~/modules/qa/rankings/hooks/useActiveRanking';
import { formatScore, toRankingEntry } from '~/modules/qa/rankings/helpers';
import PodiumStrip from '~/modules/qa/rankings/components/PodiumStrip';
import PastRankingsCard from '~/modules/qa/rankings/components/PastRankingsCard';
import ExpandedRankingsTable from './components/ExpandedRankingsTable';
import RankingCardGrid from './components/RankingCardGrid';
import RankingDetailDrawer from './components/RankingDetailDrawer';
import LeaderboardHeader from './components/LeaderboardHeader';

/** Below this width the table is replaced by the responsive card grid. */
const TABLE_BREAKPOINT = '(max-width: 1024px)';

type RankingsTab = 'current' | 'past';

/**
 * The agent's view of the rankings their supervisor runs: the current
 * leaderboard (prize, podium, standings) and their placement in past ones.
 */
export const TeamRankingsPage: React.FC = () => {
	const { t } = useTranslation('qa.rankings');
	const isCompact = useMediaQuery(TABLE_BREAKPOINT);
	const { program, standings, pastPrograms } = useActiveRanking();
	const syncMilestones = useRankingsStore((s) => s.syncMilestones);
	const [searchParams, setSearchParams] = useSearchParams();

	const [selectedEntry, setSelectedEntry] = useState<AgentRankingEntry | null>(
		null
	);

	const tab = (searchParams.get('tab') as RankingsTab | null) ?? 'current';
	const setTab = (value: string | null) => {
		setSearchParams(
			(prev) => {
				const next = new URLSearchParams(prev);
				if (value) next.set('tab', value);
				return next;
			},
			{ replace: true }
		);
	};

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

	const renderScore = useCallback(
		(score: number) => (program ? formatScore(program, score) : String(score)),
		[program]
	);

	const handleRowClick = useCallback((entry: AgentRankingEntry) => {
		setSelectedEntry(entry);
	}, []);

	return (
		<ContentContainer contentWidth='full'>
			<Tabs value={tab} onChange={setTab} keepMounted={false}>
				<Tabs.List>
					<Tabs.Tab value='current' leftSection={<IconTrophy size={16} />}>
						{t('agent.tabs.current')}
					</Tabs.Tab>
					<Tabs.Tab value='past' leftSection={<IconHistory size={16} />}>
						{t('agent.tabs.past')}
					</Tabs.Tab>
				</Tabs.List>

				<Tabs.Panel value='current' pt='md'>
					{!program ? (
						<EmptyState
							icon={<IconTrophy size={32} />}
							message={t('agent.empty.noActive')}
						/>
					) : (
						<Stack gap='lg'>
							<LeaderboardHeader program={program} />

							<PodiumStrip program={program} standings={standings} />

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
										hideReactions={!program.allowReactions}
									/>
								) : (
									<ExpandedRankingsTable
										data={entries}
										currentAgentId={AGENT_PERSONA_ID}
										formatScore={renderScore}
										onRowClick={handleRowClick}
										hideReactions={!program.allowReactions}
									/>
								)}
							</SectionCard>
						</Stack>
					)}
				</Tabs.Panel>

				<Tabs.Panel value='past' pt='md'>
					<PastRankingsCard
						programs={pastPrograms}
						agentId={AGENT_PERSONA_ID}
					/>
				</Tabs.Panel>
			</Tabs>

			{program && (
				<RankingDetailDrawer
					entry={selectedEntry}
					data={entries}
					program={program}
					opened={selectedEntry !== null}
					onClose={() => setSelectedEntry(null)}
				/>
			)}
		</ContentContainer>
	);
};

export default TeamRankingsPage;
