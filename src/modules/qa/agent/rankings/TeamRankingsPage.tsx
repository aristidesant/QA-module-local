import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router';
import { useTranslation } from 'react-i18next';
import { Stack, Tabs } from '@mantine/core';
import { IconHistory, IconTrophy } from '@tabler/icons-react';
import ContentContainer from '~/components/ContentContainer';
import EmptyState from '~/components/EmptyState';
import AppSegmentedControl from '~/components/ui/AppSegmentedControl/AppSegmentedControl';
import type { AgentRankingEntry } from '~/modules/qa/dashboard/mockData';
import { AGENT_PERSONA_ID } from '~/modules/qa/team/constants';
import { useRankingsStore } from '~/stores/qa/rankingsStore';
import { useActiveRanking } from '~/modules/qa/rankings/hooks/useActiveRanking';
import { toRankingEntry } from '~/modules/qa/rankings/helpers';
import PastRankingsCard from '~/modules/qa/rankings/components/PastRankingsCard';
import AgentRankingView from './components/AgentRankingView';
import RankingDetailDrawer from './components/RankingDetailDrawer';

type RankingsTab = 'current' | 'past';

/**
 * The agent's view of the rankings their supervisor runs: where they stand in
 * each ranking running for their team, and how they did in past ones.
 */
export const TeamRankingsPage: React.FC = () => {
	const { t } = useTranslation('qa.rankings');
	const { current, pastPrograms, standingsOf } = useActiveRanking();
	const syncMilestones = useRankingsStore((s) => s.syncMilestones);
	const [searchParams, setSearchParams] = useSearchParams();

	const [selectedEntry, setSelectedEntry] = useState<AgentRankingEntry | null>(
		null
	);

	const tab = (searchParams.get('tab') as RankingsTab | null) ?? 'current';
	const setParam = (key: 'tab' | 'ranking', value: string | null) =>
		setSearchParams(
			(prev) => {
				const next = new URLSearchParams(prev);
				if (value) next.set(key, value);
				else next.delete(key);
				return next;
			},
			{ replace: true }
		);

	// The dated ranking comes first; the agent can switch to the team index.
	const program =
		current.find((p) => p.id === searchParams.get('ranking')) ??
		current[0] ??
		null;
	const standings = useMemo(
		() => (program ? standingsOf(program) : []),
		[program, standingsOf]
	);

	// Opening the ranking reconciles any milestone the agent has just reached.
	useEffect(() => {
		if (program) syncMilestones(program.id);
	}, [program, syncMilestones]);

	// The detail drawer still reads the leaderboard-entry shape.
	const entries = useMemo(
		() =>
			program
				? standings.map((standing) => toRankingEntry(standing, program))
				: [],
		[program, standings]
	);

	return (
		<ContentContainer
			contentWidth='full'
			title={t('agent.title')}
			description={t('agent.description')}
		>
			<Tabs
				value={tab}
				onChange={(value) => setParam('tab', value)}
				keepMounted={false}
			>
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
							{current.length > 1 && (
								<AppSegmentedControl
									value={program.id}
									onChange={(id) => setParam('ranking', id)}
									data={current.map((p) => ({
										value: p.id,
										label: p.isDefault ? t('agent.switch.default') : p.name,
									}))}
								/>
							)}
							<AgentRankingView
								program={program}
								standings={standings}
								agentId={AGENT_PERSONA_ID}
								onRowClick={(standing) =>
									setSelectedEntry(
										entries.find(
											(entry) => entry.agentId === standing.agentId
										) ?? null
									)
								}
							/>
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
					standing={standings.find(
						(standing) => standing.agentId === selectedEntry?.agentId
					)}
					opened={selectedEntry !== null}
					onClose={() => setSelectedEntry(null)}
				/>
			)}
		</ContentContainer>
	);
};

export default TeamRankingsPage;
