import { Group, Stack, Text } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { SectionCard } from '~/components/SectionCard';
import {
	ShareBar,
	SmallMultiples,
	STATUS,
} from '~/modules/qa/analytics/TeamAnalyticsPage/charts';
import type {
	PlatformBurnoutSummary,
	TeamSeriesPoint,
} from '../../operationManagerMetrics';
import { BurnoutRiskLevel } from '../../types/burnoutRisk';
import dashboardStyles from '../../Dashboard.module.css';

interface BurnoutCardProps {
	summary: PlatformBurnoutSummary;
	/** Share of calls with a negative agent emotion, per team and period. */
	series: TeamSeriesPoint[];
	teams: string[];
}

/** Where the agents stand today and how negative emotion moves per team. */
export function BurnoutCard({ summary, series, teams }: BurnoutCardProps) {
	const { t } = useTranslation('qa.dashboard');

	return (
		<SectionCard
			padding='md'
			fullHeight
			title={t('operationManager.insights.burnout.title')}
			description={t('operationManager.insights.burnout.subtitle')}
		>
			<Stack gap='md'>
				<Group gap='xs' align='baseline'>
					<Text className={dashboardStyles.scoreValue}>{summary.atRisk}</Text>
					<Text size='sm' c='dimmed'>
						{t('operationManager.insights.burnout.ofTotal', {
							total: summary.total,
						})}
					</Text>
				</Group>
				<ShareBar
					segments={[
						{
							key: 'low',
							label: t(`burnout.level.${BurnoutRiskLevel.LOW}`),
							value: summary.counts[BurnoutRiskLevel.LOW],
							color: STATUS.low,
						},
						{
							key: 'medium',
							label: t(`burnout.level.${BurnoutRiskLevel.MEDIUM}`),
							value: summary.counts[BurnoutRiskLevel.MEDIUM],
							color: STATUS.medium,
						},
						{
							key: 'high',
							label: t(`burnout.level.${BurnoutRiskLevel.HIGH}`),
							value: summary.counts[BurnoutRiskLevel.HIGH],
							color: STATUS.high,
						},
					]}
				/>
				<Text size='xs' c='dimmed'>
					{t('operationManager.burnout.chartCaption')}
				</Text>
				{series.length < 2 ? (
					<Text size='sm' c='dimmed'>
						{t('operationManager.teams.needLongerPeriod')}
					</Text>
				) : (
					<SmallMultiples
						metricId='AGENT_NEGATIVE_EMOTION_CALL_SHARE'
						items={teams.map((team) => ({
							key: team,
							label: team,
							data: series.map((point) => ({
								period: point.period,
								value: point[team] as number | null,
							})),
						}))}
					/>
				)}
			</Stack>
		</SectionCard>
	);
}

export default BurnoutCard;
