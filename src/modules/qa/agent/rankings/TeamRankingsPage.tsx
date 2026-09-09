import React, { useCallback, useState } from 'react';
import { Stack, Text, Title } from '@mantine/core';
import ContentContainer from '~/components/ContentContainer';
import SectionCard from '~/components/SectionCard';
import type { AgentRankingEntry } from '~/modules/qa/dashboard/mockData';
import ExpandedRankingsTable from './components/ExpandedRankingsTable';
import RankingDetailDrawer from './components/RankingDetailDrawer';

/**
 * Team Rankings page: full leaderboard for the current period.
 *
 * Clicking a row opens the detail drawer (achievements, reactions, metrics).
 * Period selector, sort presets and filters land in follow-up tasks.
 */
export const TeamRankingsPage: React.FC = () => {
	const [selectedEntry, setSelectedEntry] = useState<AgentRankingEntry | null>(
		null
	);

	const handleRowClick = useCallback((entry: AgentRankingEntry) => {
		setSelectedEntry(entry);
	}, []);

	const handleCloseDrawer = useCallback(() => {
		setSelectedEntry(null);
	}, []);

	return (
		<ContentContainer contentWidth='full'>
			<Stack gap='lg'>
				<div>
					<Title order={1}>Team Rankings</Title>
					<Text c='dimmed' mt='xs'>
						Agent performance leaderboard this period
					</Text>
				</div>

				<SectionCard
					title='Leaderboard'
					description='All team members ranked by score — select a row for details'
				>
					<ExpandedRankingsTable onRowClick={handleRowClick} />
				</SectionCard>
			</Stack>

			<RankingDetailDrawer
				entry={selectedEntry}
				opened={selectedEntry !== null}
				onClose={handleCloseDrawer}
			/>
		</ContentContainer>
	);
};

export default TeamRankingsPage;
