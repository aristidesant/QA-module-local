import React from 'react';
import { useTranslation } from 'react-i18next';
import { SimpleGrid, Text } from '@mantine/core';
import { type AgentRankingEntry } from '~/modules/qa/dashboard/mockData';
import RankingCard from './RankingCard';

export interface RankingCardGridProps {
	/** Leaderboard rows, computed from the active ranking program. */
	data: AgentRankingEntry[];
	/** Highlights the card of the agent viewing their own leaderboard. */
	currentAgentId?: string;
	/** Renders the score with the ranking metric's unit. */
	formatScore?: (score: number) => string;
	/** Invoked when a card is clicked (detail drawer hook-up). */
	onRowClick?: (entry: AgentRankingEntry) => void;
	/** Drops the peer-reactions row — for read-only views (e.g. a supervisor's dashboard). */
	hideReactions?: boolean;
}

/**
 * Responsive card layout used instead of the desktop table below 1024px.
 *
 * One column on mobile, two on tablet. Cards are not virtualized: the desktop
 * table keeps the windowed rendering, while narrow viewports rely on native
 * scrolling over a plain grid.
 */
export const RankingCardGrid: React.FC<RankingCardGridProps> = ({
	data,
	currentAgentId,
	formatScore,
	onRowClick,
	hideReactions,
}) => {
	const { t } = useTranslation('qa.rankings');

	if (data.length === 0) {
		return (
			<Text size='sm' c='dimmed' ta='center' py='xl'>
				{t('agent.empty.noActive')}
			</Text>
		);
	}

	return (
		<SimpleGrid cols={{ base: 1, sm: 1, md: 2, lg: 2 }} spacing='md'>
			{data.map((entry) => (
				<RankingCard
					key={entry.agentId}
					entry={entry}
					isCurrentAgent={entry.agentId === currentAgentId}
					formatScore={formatScore}
					onRowClick={onRowClick}
					hideReactions={hideReactions}
				/>
			))}
		</SimpleGrid>
	);
};

export default RankingCardGrid;
