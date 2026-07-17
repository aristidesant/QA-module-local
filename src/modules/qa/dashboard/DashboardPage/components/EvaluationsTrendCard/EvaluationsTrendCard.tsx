import { LineChart } from '@mantine/charts';
import { Skeleton } from '@mantine/core';
import { IconChartLine } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';

import EmptyState from '~/components/EmptyState';
import SectionCard from '~/components/SectionCard';
import { useChartReady } from '~/modules/qa/hooks/useChartReady';
import {
	TREND_COMPLETED_COLOR,
	TREND_CREATED_COLOR,
} from '../../DashboardPage.constants';
import type { TrendBucket } from '../../DashboardPage.types';
import classes from './EvaluationsTrendCard.module.css';

export interface EvaluationsTrendCardProps {
	data: TrendBucket[];
	loading: boolean;
	className?: string;
}

export default function EvaluationsTrendCard({
	data,
	loading,
	className,
}: EvaluationsTrendCardProps) {
	const { t } = useTranslation('qa.dashboard');
	const chartReady = useChartReady();
	const isEmpty = data.every(
		(bucket) => bucket.created === 0 && bucket.completed === 0
	);

	return (
		<SectionCard
			className={className}
			description={t('trend.description')}
			icon={IconChartLine}
			title={t('trend.title')}
		>
			{loading || !chartReady ? (
				<Skeleton className={classes.chartArea} />
			) : isEmpty ? (
				<div className={classes.chartArea}>
					<EmptyState
						description={t('trend.emptyDescription')}
						icon={<IconChartLine size={32} />}
						message={t('trend.empty')}
					/>
				</div>
			) : (
				<LineChart
					className={classes.chartArea}
					curveType='monotone'
					data={data}
					dataKey='label'
					gridAxis='y'
					series={[
						{
							name: 'created',
							label: t('trend.series.created'),
							color: TREND_CREATED_COLOR,
						},
						{
							name: 'completed',
							label: t('trend.series.completed'),
							color: TREND_COMPLETED_COLOR,
						},
					]}
					withLegend
				/>
			)}
		</SectionCard>
	);
}
