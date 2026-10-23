import { useMemo } from 'react';
import { Text } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { EChart } from '../EChart';
import type { EChartsOption } from '../echarts';
import { InsightsTile } from '../InsightsTile';
import { axisStyle, useInsightsTheme, withAlpha } from '../useInsightsTheme';
import type {
	PlatformBurnoutSummary,
	TeamSeriesPoint,
} from '../../operationManagerMetrics';
import { BurnoutRiskLevel } from '../../types/burnoutRisk';
import styles from '../Insights.module.css';

const LEVELS = [
	BurnoutRiskLevel.LOW,
	BurnoutRiskLevel.MEDIUM,
	BurnoutRiskLevel.HIGH,
];

interface BurnoutPanelProps {
	index: number;
	summary: PlatformBurnoutSummary;
	/** Share of calls with a negative agent emotion, per team. */
	series: TeamSeriesPoint[];
	teams: string[];
	selectedTeam: string | null;
	onTeamClick: (team: string) => void;
}

/** Where the agents stand today (donut) and how negative emotion moves per team (one small line each). */
export function BurnoutPanel({
	index,
	summary,
	series,
	teams,
	selectedTeam,
	onTeamClick,
}: BurnoutPanelProps) {
	const { t } = useTranslation('qa.dashboard');
	const theme = useInsightsTheme();

	const donut = useMemo<EChartsOption>(() => {
		const color: Record<string, string> = {
			[BurnoutRiskLevel.LOW]: theme.neutral,
			[BurnoutRiskLevel.MEDIUM]: theme.indigo,
			[BurnoutRiskLevel.HIGH]: theme.alert,
		};
		return {
			...theme.base,
			tooltip: { ...theme.tooltip, trigger: 'item' },
			series: [
				{
					type: 'pie',
					radius: ['62%', '82%'],
					padAngle: 2,
					avoidLabelOverlap: true,
					label: { show: false },
					itemStyle: {
						borderRadius: 4,
						borderColor: theme.surface,
						borderWidth: 1,
					},
					emphasis: { scaleSize: 4 },
					data: LEVELS.map((level) => ({
						name: t(`burnout.level.${level}`),
						value: summary.counts[level],
						itemStyle: { color: color[level] },
					})),
				},
			],
		};
	}, [summary, theme, t]);

	const lineFor = (team: string): EChartsOption => {
		const color = theme.team[team] ?? theme.accent;
		const dim = selectedTeam !== null && selectedTeam !== team;
		return {
			...theme.base,
			grid: { left: 4, right: 4, top: 6, bottom: 4 },
			tooltip: {
				...theme.tooltip,
				trigger: 'axis',
				confine: true,
				axisPointer: { type: 'line', lineStyle: { color: theme.border } },
				valueFormatter: (value: unknown) =>
					value === null || value === undefined ? '—' : `${value}%`,
			},
			xAxis: {
				type: 'category',
				show: false,
				boundaryGap: false,
				data: series.map((point) => point.label),
			},
			yAxis: {
				type: 'value',
				show: false,
				min: 0,
				max: 100,
				...axisStyle(theme),
			},
			series: [
				{
					name: team,
					type: 'line',
					data: series.map((point) => point[team] as number | null),
					smooth: 0.35,
					symbol: 'none',
					lineStyle: { width: 1.8, color, opacity: dim ? 0.3 : 1 },
					areaStyle: { color: withAlpha(color, dim ? '08' : '1f') },
				},
			],
		};
	};

	return (
		<InsightsTile
			span={6}
			index={index}
			title={t('operationManager.insights.burnout.title')}
			subtitle={t('operationManager.insights.burnout.subtitle')}
		>
			<div className={styles.burnoutGrid}>
				<div className={styles.donutHost}>
					<EChart
						option={donut}
						height={220}
						ariaLabel={t('operationManager.burnout.atRisk', {
							atRisk: summary.atRisk,
							total: summary.total,
							high: summary.counts[BurnoutRiskLevel.HIGH],
						})}
					/>
					<div className={styles.centerOverlay}>
						<div className={styles.kpiValue}>{summary.atRisk}</div>
						<Text size='xs' c='dimmed'>
							{t('operationManager.insights.burnout.ofTotal', {
								total: summary.total,
							})}
						</Text>
					</div>
				</div>
				<div>
					<Text size='xs' c='dimmed' mb={4}>
						{t('operationManager.burnout.chartCaption')}
					</Text>
					{series.length < 2 ? (
						<Text size='sm' c='dimmed' py='md'>
							{t('operationManager.teams.needLongerPeriod')}
						</Text>
					) : (
						teams.map((team) => (
							<div key={team} className={styles.miniLine}>
								<Text size='xs' fw={600} w={48}>
									{team}
								</Text>
								<div className={styles.miniLineChart}>
									<EChart
										option={lineFor(team)}
										height={56}
										ariaLabel={`${team}: ${t('operationManager.burnout.chartCaption')}`}
										onItemClick={() => onTeamClick(team)}
									/>
								</div>
							</div>
						))
					)}
				</div>
			</div>
		</InsightsTile>
	);
}

export default BurnoutPanel;
