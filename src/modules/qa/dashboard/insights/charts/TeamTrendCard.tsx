import {
	Group,
	SegmentedControl,
	Stack,
	Text,
	UnstyledButton,
} from '@mantine/core';
import { LineChart } from '@mantine/charts';
import { useTranslation } from 'react-i18next';
import { SectionCard } from '~/components/SectionCard';
import { SERIES } from '~/modules/qa/analytics/TeamAnalyticsPage/charts';
import { useChartReady } from '~/modules/qa/hooks/useChartReady';
import type {
	TeamSeriesPoint,
	TeamTrendMetric,
} from '../../operationManagerMetrics';
import styles from '../Insights.module.css';

const METRICS: { id: TeamTrendMetric; key: string }[] = [
	{ id: 'QA_OVERALL_SCORE', key: 'qa' },
	{ id: 'COMPLIANCE_OVERALL_SCORE', key: 'compliance' },
	{ id: 'CUSTOMER_SENTIMENT_SCORE', key: 'customerSentiment' },
];

/** Team → validated series slot. Fixed by roster position, never by what is selected. */
export const teamColor = (teams: string[], team: string): string =>
	SERIES[Math.max(0, teams.indexOf(team)) % SERIES.length];

interface TeamTrendCardProps {
	data: TeamSeriesPoint[];
	teams: string[];
	metric: TeamTrendMetric;
	onMetricChange: (metric: TeamTrendMetric) => void;
	selectedTeam: string | null;
	onTeamClick: (team: string) => void;
}

/** One line per team; the chips above are the legend and the team filter at once. */
export function TeamTrendCard({
	data,
	teams,
	metric,
	onMetricChange,
	selectedTeam,
	onTeamClick,
}: TeamTrendCardProps) {
	const { t } = useTranslation('qa.dashboard');
	const ready = useChartReady();
	const domain: [number, number] =
		metric === 'CUSTOMER_SENTIMENT_SCORE' ? [1, 5] : [0, 100];

	return (
		<SectionCard
			padding='md'
			fullHeight
			title={t('operationManager.insights.teamTrend.title')}
			description={t('operationManager.insights.teamTrend.subtitle')}
			headerActions={
				<SegmentedControl
					size='xs'
					value={metric}
					onChange={(value) => onMetricChange(value as TeamTrendMetric)}
					data={METRICS.map(({ id, key }) => ({
						value: id,
						label: t(`operationManager.teams.metric.${key}`),
					}))}
				/>
			}
		>
			<Stack gap='sm'>
				<Group gap='xs' wrap='wrap'>
					{teams.map((team) => (
						<UnstyledButton
							key={team}
							className={styles.teamButton}
							data-active={selectedTeam === team || undefined}
							aria-pressed={selectedTeam === team}
							onClick={() => onTeamClick(team)}
						>
							<Group gap={6} wrap='nowrap'>
								<span
									className={styles.swatch}
									// inline-style-allow: the swatch takes the team's series token at runtime
									style={{ backgroundColor: teamColor(teams, team) }}
								/>
								{team}
							</Group>
						</UnstyledButton>
					))}
				</Group>
				{data.length < 2 ? (
					<Text size='sm' c='dimmed' py='xl' ta='center'>
						{t('operationManager.teams.needLongerPeriod')}
					</Text>
				) : !ready ? null : (
					<LineChart
						h={260}
						data={data}
						dataKey='label'
						series={teams.map((team) => ({
							name: team,
							label: team,
							color: teamColor(teams, team),
							strokeDasharray:
								selectedTeam !== null && selectedTeam !== team
									? '2 4'
									: undefined,
						}))}
						curveType='monotone'
						strokeWidth={2}
						withDots={data.length <= 31}
						connectNulls
						gridAxis='y'
						tickLine='none'
						withLegend
						legendProps={{ verticalAlign: 'top', height: 28 }}
						yAxisProps={{ domain, width: 40 }}
						xAxisProps={{ minTickGap: 24 }}
					/>
				)}
			</Stack>
		</SectionCard>
	);
}

export default TeamTrendCard;
