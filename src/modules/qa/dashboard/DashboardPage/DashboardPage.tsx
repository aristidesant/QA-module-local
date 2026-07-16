import { Alert, Container, Stack, Text } from '@mantine/core';
import {
	IconAlertTriangle,
	IconClipboardCheck,
	IconGavel,
	IconPercentage,
	IconRobot,
} from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';

import PageHeader from '~/components/ui/PageHeader';
import { useNumberFormatter } from '~/modules/qa/hooks/useFormatters';
import { useDashboardFilterStore } from '~/stores/qaDashboardFilterStore';
import { formatScorePct, formatSignedDelta } from '~/modules/qa/utils/format';
import { getErrorMessage } from '~/utils/httpClient';
import { EVALUATION_WINDOW_LIMIT } from './DashboardPage.constants';
import classes from './DashboardPage.module.css';
import AiStatusDonutCard from './components/AiStatusDonutCard';
import EvaluationsTrendCard from './components/EvaluationsTrendCard';
import KpiCard from './components/KpiCard';
import ProviderHealthCard from './components/ProviderHealthCard';
import RecentEvaluationsCard from './components/RecentEvaluationsCard';
import TimeRangeControl from './components/TimeRangeControl';
import TopAgentsCard from './components/TopAgentsCard';
import { useDashboardMetrics } from './useDashboardMetrics';

export default function DashboardPage() {
	const { t } = useTranslation('qa.dashboard');
	const timeRange = useDashboardFilterStore((state) => state.timeRange);
	const {
		evaluationsQuery,
		disputesQuery,
		healthQuery,
		kpis,
		trend,
		aiStatus,
		topAgents,
		recentEvaluations,
		resolveAgentName,
		showWindowNotice,
	} = useDashboardMetrics(timeRange);
	const numberFormatter = useNumberFormatter();

	const evaluationsLoading = evaluationsQuery.isLoading;
	const signedDelta =
		kpis.avgScoreDelta == null ? null : formatSignedDelta(kpis.avgScoreDelta);

	return (
		<Container className={classes.page} fluid>
			<Stack gap='md'>
				<PageHeader
					actions={<TimeRangeControl />}
					description={t('description')}
					title={t('title')}
				/>

				{evaluationsQuery.isError ? (
					<Alert
						color='red'
						icon={<IconAlertTriangle size={18} />}
						title={t('error.title')}
						variant='light'
					>
						{getErrorMessage(evaluationsQuery.error)}
					</Alert>
				) : null}

				<div className={classes.grid}>
					<KpiCard
						accent='green'
						className={classes.kpi}
						hint={t('kpis.evaluations.hint', {
							count: kpis.completedCount,
						})}
						icon={IconClipboardCheck}
						label={t('kpis.evaluations.label')}
						loading={evaluationsLoading}
						value={numberFormatter.format(kpis.evaluationsCount)}
					/>
					<KpiCard
						accent='blue'
						className={classes.kpi}
						hint={t('kpis.avgScore.hint', { count: kpis.completedCount })}
						icon={IconPercentage}
						label={t('kpis.avgScore.label')}
						loading={evaluationsLoading}
						value={
							kpis.avgScorePct == null
								? t('kpis.noData')
								: t('kpis.avgScore.value', {
										score: formatScorePct(kpis.avgScorePct),
									})
						}
					/>
					<KpiCard
						accent='yellow'
						className={classes.kpi}
						hint={t('kpis.aiFailureRate.hint', {
							count: kpis.aiEvaluationsCount,
						})}
						icon={IconRobot}
						label={t('kpis.aiFailureRate.label')}
						loading={evaluationsLoading}
						value={
							kpis.aiFailureRatePct == null
								? t('kpis.noData')
								: t('kpis.aiFailureRate.value', {
										rate: formatScorePct(kpis.aiFailureRatePct),
									})
						}
					/>
					<KpiCard
						accent='red'
						className={classes.kpi}
						hint={
							signedDelta == null
								? t('kpis.disputes.hintEmpty')
								: t('kpis.disputes.hint', { delta: signedDelta })
						}
						icon={IconGavel}
						label={t('kpis.disputes.label')}
						loading={disputesQuery.isLoading}
						value={numberFormatter.format(kpis.disputesCount)}
					/>

					<EvaluationsTrendCard
						className={classes.trend}
						data={trend}
						loading={evaluationsLoading}
					/>
					<AiStatusDonutCard
						className={classes.donut}
						loading={evaluationsLoading}
						segments={aiStatus}
					/>

					<TopAgentsCard
						agents={topAgents}
						className={classes.topAgents}
						loading={evaluationsLoading}
					/>
					<RecentEvaluationsCard
						className={classes.recent}
						evaluations={recentEvaluations}
						loading={evaluationsLoading}
						resolveAgentName={resolveAgentName}
					/>

					<ProviderHealthCard
						className={classes.health}
						health={healthQuery.data}
						loading={healthQuery.isLoading}
					/>
				</div>

				{showWindowNotice ? (
					<Text c='dimmed' size='xs'>
						{t('windowNotice', { count: EVALUATION_WINDOW_LIMIT })}
					</Text>
				) : null}
			</Stack>
		</Container>
	);
}
