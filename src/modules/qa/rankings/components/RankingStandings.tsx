import type { ReactNode } from 'react';
import { Badge, Group, Text } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { useTranslation } from 'react-i18next';
import { SectionCard } from '~/components/SectionCard';
import type {
	RankingProgram,
	RankingStanding,
} from '~/models/qa/rankingPrograms';
import { formatTarget } from '../helpers';
import StandingsCardGrid from './StandingsCardGrid';
import StandingsTable, { type ReactionsMode } from './StandingsTable';

/** Below this width the table is replaced by the card grid. */
const TABLE_BREAKPOINT = '(max-width: 1024px)';

interface RankingStandingsProps {
	program: RankingProgram;
	standings: RankingStanding[];
	/** Highlights the row of whoever is looking, when they are on the ranking. */
	currentAgentId?: string;
	onRowClick?: (standing: RankingStanding) => void;
	reactions?: ReactionsMode;
	/** Rank, agent and scorecard only, for a narrow placement such as a dashboard card. */
	dense?: boolean;
	headerActions?: ReactNode;
	/** Replaces the default "Standings" title. */
	title?: string;
	/** Rendered under the standings, e.g. a link to the full ranking. */
	footer?: ReactNode;
}

/** The standings card: table on wide screens, cards below 1024px, the same columns for every role. */
export function RankingStandings({
	program,
	standings,
	currentAgentId,
	onRowClick,
	reactions = 'off',
	dense = false,
	headerActions,
	title,
	footer,
}: RankingStandingsProps) {
	const { t } = useTranslation('qa.rankings');
	const isCompact = useMediaQuery(TABLE_BREAKPOINT);
	const qualified = standings.filter((s) => s.rank !== null);

	return (
		<SectionCard
			title={title ?? t('drawer.standings')}
			description={`${t('editor.target')}: ${formatTarget(program)}`}
			footer={footer}
			headerActions={
				<Group gap='sm' wrap='nowrap'>
					{headerActions}
					<Badge variant='light' size='sm'>
						{standings.length}
					</Badge>
				</Group>
			}
		>
			{qualified.length === 0 ? (
				<Text size='sm' c='dimmed'>
					{t('drawer.pending')}
				</Text>
			) : isCompact ? (
				<StandingsCardGrid
					program={program}
					standings={standings}
					currentAgentId={currentAgentId}
					onRowClick={onRowClick}
					reactions={reactions}
					dense={dense}
				/>
			) : (
				<StandingsTable
					program={program}
					standings={standings}
					currentAgentId={currentAgentId}
					onRowClick={onRowClick}
					reactions={reactions}
					dense={dense}
					showTeam={program.teams.length > 1}
				/>
			)}
		</SectionCard>
	);
}

export default RankingStandings;
