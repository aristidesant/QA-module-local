import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Stack, Text } from '@mantine/core';
import {
	HEATMAP_MIN_CALLS,
	PRIMARY_METRIC,
	VIEW_METRICS,
} from '../../constants';
import { heatmap } from '../../helpers';
import SegmentationView from '../Segmentation/SegmentationView';
import { useTeamAnalyticsData } from '../TeamAnalyticsContext';
import {
	AreaLayout,
	ChartCard,
	Heatmap,
	MetricTileRow,
	Pair,
	SERIES,
	SERIES_CURRENT,
	SERIES_OTHER,
	ShareBar,
	TrendSection,
	useMetricTiles,
} from '../charts';

/** Calls, contact outcome, handle time and transfers: how the operation runs. */
export default function OperationalView() {
	const { t } = useTranslation('qa.teamAnalytics');
	const { calls } = useTeamAnalyticsData();
	const { tile } = useMetricTiles();

	const grid = useMemo(
		() =>
			heatmap(
				calls,
				'OPS_CALLS_HANDLED',
				calls.some((c) => c.weekday === 0)
			),
		[calls]
	);
	const split = useMemo(() => {
		let effective = 0;
		let inbound = 0;
		for (const c of calls) {
			if (c.contactOutcome === 'EFFECTIVE') effective += 1;
			if (c.direction === 'INBOUND') inbound += 1;
		}
		return {
			effective,
			nonEffective: calls.length - effective,
			inbound,
			outbound: calls.length - inbound,
		};
	}, [calls]);

	return (
		<AreaLayout>
			<MetricTileRow
				tiles={[
					tile('OPS_CALLS_HANDLED', { neutral: true }),
					tile('OPS_EFFECTIVE_CONTACT_RATE'),
					tile('OPS_AHT_SECONDS'),
					tile('OPS_FCR_RATE'),
					tile('OPS_TRANSFER_RATE'),
					tile('OPS_AFTER_HOURS_SHARE'),
				]}
			/>
			<Text size='xs' c='dimmed'>
				{t('operational.fcrHint')}
			</Text>
			<TrendSection
				metricIds={VIEW_METRICS.operational}
				primary={PRIMARY_METRIC.operational}
			/>
			<Pair>
				<ChartCard
					title={t('operational.heatmapTitle')}
					description={t('operational.heatmapDescription')}
					footer={t('charts.lowSampleHint', { count: HEATMAP_MIN_CALLS })}
				>
					<Heatmap data={grid} metricId='OPS_CALLS_HANDLED' />
				</ChartCard>
				<ChartCard title={t('operational.outcomeTitle')}>
					<Stack gap='lg'>
						<ShareBar
							title={t('operational.outcomeTitle')}
							segments={[
								{
									key: 'effective',
									label: t('operational.effective'),
									value: split.effective,
									color: SERIES_CURRENT,
								},
								{
									key: 'nonEffective',
									label: t('operational.nonEffective'),
									value: split.nonEffective,
									color: SERIES_OTHER,
								},
							]}
						/>
						<ShareBar
							title={t('operational.direction')}
							segments={[
								{
									key: 'inbound',
									label: t('operational.inbound'),
									value: split.inbound,
									color: SERIES[0],
								},
								{
									key: 'outbound',
									label: t('operational.outbound'),
									value: split.outbound,
									color: SERIES[1],
								},
							]}
						/>
					</Stack>
				</ChartCard>
			</Pair>
			<SegmentationView
				metricIds={VIEW_METRICS.operational}
				primary={PRIMARY_METRIC.operational}
			/>
		</AreaLayout>
	);
}
