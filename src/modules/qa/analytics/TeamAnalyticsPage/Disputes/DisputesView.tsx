import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { createColumnHelper } from '@tanstack/react-table';
import { Text } from '@mantine/core';
import BaseTable, {
	type BaseTableColumnDef,
} from '~/components/BaseTable/BaseTable';
import { PRIMARY_METRIC, VIEW_METRICS } from '../../constants';
import {
	aggregateDisputes,
	disputeSeries,
	disputesByAgent,
} from '../../helpers';
import type { DisputesByAgentRow } from '../../types';
import SegmentationView from '../Segmentation/SegmentationView';
import { useTeamAnalyticsData } from '../TeamAnalyticsContext';
import {
	AreaLayout,
	BreakdownBars,
	ChartCard,
	HEAT,
	MetricTileRow,
	Pair,
	SERIES,
	SERIES_CURRENT,
	SERIES_OTHER,
	ShareBar,
	TrendChart,
	useMetricTiles,
	type MetricTileProps,
} from '../charts';

const helper = createColumnHelper<DisputesByAgentRow>();

/** Disputes raised against evaluations: how many, of which type, how they ended and who files most. */
export default function DisputesView() {
	const { t } = useTranslation('qa.teamAnalytics');
	const { calls, previousCalls, disputes, previousDisputes, filters, compare } =
		useTeamAnalyticsData();
	const { tile } = useMetricTiles();

	const summary = useMemo(
		() => aggregateDisputes(calls, disputes),
		[calls, disputes]
	);
	const previous = useMemo(
		() => aggregateDisputes(previousCalls, previousDisputes),
		[previousCalls, previousDisputes]
	);
	const series = useMemo(
		() => disputeSeries(disputes, filters.granularity),
		[disputes, filters.granularity]
	);
	const byAgent = useMemo(
		() => disputesByAgent(calls, disputes),
		[calls, disputes]
	);

	const counted = (
		label: string,
		current: number,
		before: number
	): MetricTileProps => ({
		label,
		metricId: 'DISPUTE_COUNT',
		value: current.toLocaleString(),
		current,
		previous: compare ? before : null,
		neutral: true,
		compare,
	});

	const tiles: MetricTileProps[] = [
		counted(t('disputes.filed'), summary.total, previous.total),
		counted(t('disputes.open'), summary.open, previous.open),
		{
			label: t('disputes.acceptanceRate'),
			metricId: 'OPS_EFFECTIVE_CONTACT_RATE',
			value:
				summary.acceptanceRate === null
					? t('common.na')
					: `${Math.round(summary.acceptanceRate)}%`,
			current: summary.acceptanceRate,
			previous: compare ? previous.acceptanceRate : null,
			neutral: true,
			compare,
		},
		{
			label: t('disputes.resolutionDays'),
			metricId: 'OPS_CALLS_HANDLED',
			value:
				summary.avgResolutionDays === null
					? t('common.na')
					: t('disputes.days', { count: summary.avgResolutionDays }),
			current: summary.avgResolutionDays,
			previous: null,
			neutral: true,
			compare: false,
		},
		tile('DISPUTE_RATE', { hint: t('disputes.ratePer100') }),
	];

	const columns = useMemo(
		() =>
			[
				helper.accessor('agentName', {
					header: t('disputes.columns.agent'),
					cell: (info) => (
						<Text size='sm' fw={600}>
							{info.getValue()}
						</Text>
					),
				}),
				helper.accessor('team', { header: t('disputes.columns.team') }),
				helper.accessor('calls', { header: t('disputes.columns.calls') }),
				helper.accessor('filed', { header: t('disputes.columns.filed') }),
				helper.accessor('open', { header: t('disputes.columns.open') }),
				helper.accessor('accepted', {
					header: t('disputes.columns.accepted'),
				}),
				helper.accessor('rejected', {
					header: t('disputes.columns.rejected'),
				}),
				helper.accessor('acceptanceRate', {
					header: t('disputes.columns.acceptanceRate'),
					cell: (info) =>
						info.getValue() === null
							? t('common.na')
							: `${Math.round(info.getValue()!)}%`,
				}),
			] as BaseTableColumnDef<DisputesByAgentRow>[],
		[t]
	);

	return (
		<AreaLayout>
			<MetricTileRow tiles={tiles} columns={5} />
			<ChartCard
				title={t('disputes.trendTitle')}
				empty={series.length === 0}
				footer={t('charts.callsInPeriod', { count: calls.length })}
			>
				<TrendChart
					metricId='DISPUTE_COUNT'
					data={series.map((p) => ({ ...p }))}
					series={[
						{
							name: 'filed',
							label: t('disputes.filed'),
							color: SERIES_CURRENT,
						},
						{
							name: 'resolved',
							label: t('disputes.resolved'),
							color: SERIES[0],
						},
					]}
				/>
			</ChartCard>
			<Pair>
				<ChartCard
					title={t('disputes.byTypeTitle')}
					empty={summary.total === 0}
				>
					<BreakdownBars
						unit='COUNT'
						valueLabel={t('disputes.filed')}
						rows={summary.byType.map((row) => ({
							key: row.type,
							label: t(`disputes.types.${row.type}`),
							value: row.count,
						}))}
					/>
				</ChartCard>
				<ChartCard
					title={t('disputes.outcomeTitle')}
					empty={summary.total === 0}
				>
					<ShareBar
						segments={[
							{
								key: 'accepted',
								label: t('disputes.statuses.accepted'),
								value: summary.accepted,
								color: HEAT[4],
							},
							{
								key: 'partially-accepted',
								label: t('disputes.statuses.partially-accepted'),
								value: summary.partiallyAccepted,
								color: HEAT[3],
							},
							{
								key: 'rejected',
								label: t('disputes.statuses.rejected'),
								value: summary.rejected,
								color: HEAT[1],
							},
							{
								key: 'open',
								label: t('disputes.statuses.open'),
								value: summary.open,
								color: SERIES_OTHER,
							},
						]}
					/>
				</ChartCard>
			</Pair>
			<ChartCard
				title={t('disputes.byAgentTitle')}
				empty={byAgent.length === 0}
			>
				<BaseTable<DisputesByAgentRow>
					data={byAgent}
					columns={columns}
					getRowId={(row) => row.agentId}
					enablePagination
					showPaginationControls
					pageSize={25}
					density='compact'
				/>
			</ChartCard>
			<SegmentationView
				metricIds={VIEW_METRICS.disputes}
				primary={PRIMARY_METRIC.disputes}
			/>
		</AreaLayout>
	);
}
