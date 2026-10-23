import { useMemo, useState, type ReactNode } from 'react';
import { Badge, Group, Text } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { useTranslation } from 'react-i18next';
import { SectionCard } from '~/components/SectionCard';
import AppSegmentedControl from '~/components/ui/AppSegmentedControl/AppSegmentedControl';
import { TODAY } from '~/modules/qa/analytics/constants';
import { TEAM_CALLS } from '~/modules/qa/analytics/mockData';
import type {
	RankingProgram,
	RankingStanding,
} from '~/models/qa/rankingPrograms';
import { STANDINGS_PERIODS, type StandingsPeriod } from '../constants';
import { computeStandings, formatTarget } from '../helpers';
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
	const [period, setPeriod] = useState<StandingsPeriod>('all');
	const qualifiedAll = standings.filter((s) => s.rank !== null).length;
	// The whole-period standings come from the parent (they are the official ones);
	// a trailing window is ranked here so every page gets the same control.
	const shown = useMemo(
		() =>
			period === 'all'
				? standings
				: computeStandings(program, TEAM_CALLS, TODAY, Number(period)),
		[period, standings, program]
	);
	const qualified = shown.filter((s) => s.rank !== null);

	return (
		<SectionCard
			title={title ?? t('drawer.standings')}
			description={
				period === 'all'
					? `${t('editor.target')}: ${formatTarget(program)}`
					: t('standings.windowNote', { days: period })
			}
			footer={footer}
			headerActions={
				<Group gap='sm' wrap='nowrap'>
					{headerActions}
					{!dense && qualifiedAll > 0 && (
						<AppSegmentedControl
							size='xs'
							value={period}
							onChange={(value) => setPeriod(value as StandingsPeriod)}
							data={STANDINGS_PERIODS.map((value) => ({
								value,
								label: t(`standings.window.${value}`),
							}))}
						/>
					)}
					<Badge variant='light' size='sm'>
						{shown.length}
					</Badge>
				</Group>
			}
		>
			{qualified.length === 0 ? (
				<Text size='sm' c='dimmed'>
					{qualifiedAll === 0 ? t('drawer.pending') : t('standings.empty')}
				</Text>
			) : isCompact ? (
				<StandingsCardGrid
					program={program}
					standings={shown}
					period={period}
					currentAgentId={currentAgentId}
					onRowClick={onRowClick}
					reactions={reactions}
				/>
			) : (
				<StandingsTable
					program={program}
					standings={shown}
					period={period}
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
