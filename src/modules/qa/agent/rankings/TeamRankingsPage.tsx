import React, { useCallback, useState } from 'react';
import { Stack, Text, Title } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import ContentContainer from '~/components/ContentContainer';
import SectionCard from '~/components/SectionCard';
import type { AgentRankingEntry } from '~/modules/qa/dashboard/mockData';
import ExpandedRankingsTable from './components/ExpandedRankingsTable';
import RankingCardGrid from './components/RankingCardGrid';
import RankingDetailDrawer from './components/RankingDetailDrawer';

/** Below this width the table is replaced by the responsive card grid. */
const TABLE_BREAKPOINT = '(max-width: 1024px)';

/**
 * Team Rankings page: full leaderboard for the current period.
 *
 * Three-tier layout: virtualized table on desktop (>= 1024px), a two-column
 * card grid on tablet and a single-column card list on mobile. Every tier shows
 * the same seven data points.
 *
 * Clicking a row/card opens the detail drawer (achievements, reactions, metrics).
 * Period selector, sort presets and filters land in follow-up tasks.
 */
export const TeamRankingsPage: React.FC = () => {
	const isCompact = useMediaQuery(TABLE_BREAKPOINT);

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
					{isCompact ? (
						<RankingCardGrid onRowClick={handleRowClick} />
					) : (
						<ExpandedRankingsTable onRowClick={handleRowClick} />
					)}
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
