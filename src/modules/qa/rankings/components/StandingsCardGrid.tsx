import React from 'react';
import { SimpleGrid } from '@mantine/core';
import type {
	RankingProgram,
	RankingStanding,
} from '~/models/qa/rankingPrograms';
import StandingCard from './StandingCard';
import type { ReactionsMode } from './StandingsTable';

interface StandingsCardGridProps {
	program: RankingProgram;
	standings: RankingStanding[];
	currentAgentId?: string;
	onRowClick?: (standing: RankingStanding) => void;
	reactions?: ReactionsMode;
}

/**
 * Responsive card layout used instead of the table below 1024px, for every role.
 * One column on mobile, two on tablet.
 */
export const StandingsCardGrid: React.FC<StandingsCardGridProps> = ({
	program,
	standings,
	currentAgentId,
	onRowClick,
	reactions,
}) => (
	<SimpleGrid cols={{ base: 1, md: 2 }} spacing='md'>
		{standings.map((standing) => (
			<StandingCard
				key={standing.agentId}
				program={program}
				standing={standing}
				isCurrentAgent={standing.agentId === currentAgentId}
				onRowClick={onRowClick}
				reactions={reactions}
			/>
		))}
	</SimpleGrid>
);

export default StandingsCardGrid;
