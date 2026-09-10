import React, { useMemo } from 'react';
import { SimpleGrid, Text } from '@mantine/core';
import {
	AGENT_RANKINGS,
	type AgentRankingEntry,
} from '~/modules/qa/dashboard/mockData';
import { buildRankIndex } from '../gamification';
import RankingCard from './RankingCard';

export interface RankingCardGridProps {
	/** Leaderboard rows. Defaults to the full mock roster. */
	data?: AgentRankingEntry[];
	/** Invoked when a card is clicked (detail drawer hook-up). */
	onRowClick?: (entry: AgentRankingEntry) => void;
}

/**
 * Responsive card layout used instead of the desktop table below 1024px.
 *
 * One column on mobile, two on tablet. Cards are not virtualized: the desktop
 * table keeps the windowed rendering, while narrow viewports rely on native
 * scrolling over a plain grid.
 */
export const RankingCardGrid: React.FC<RankingCardGridProps> = ({
	data = AGENT_RANKINGS,
	onRowClick,
}) => {
	/** Rank lookup so each card can read the score of the position below it. */
	const rankIndex = useMemo(() => buildRankIndex(data), [data]);

	if (data.length === 0) {
		return (
			<Text size='sm' c='dimmed' ta='center' py='xl'>
				No rankings available for this period
			</Text>
		);
	}

	return (
		<SimpleGrid cols={{ base: 1, sm: 1, md: 2, lg: 2 }} spacing='md'>
			{data.map((entry) => (
				<RankingCard
					key={entry.agentId}
					entry={entry}
					rankIndex={rankIndex}
					onRowClick={onRowClick}
				/>
			))}
		</SimpleGrid>
	);
};

export default RankingCardGrid;
