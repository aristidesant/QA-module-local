import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Badge, Group, Stack, Text } from '@mantine/core';
import { createColumnHelper } from '@tanstack/react-table';
import BaseTable, {
	type BaseTableColumnDef,
} from '~/components/BaseTable/BaseTable';
import { PRIMARY_METRIC, VIEW_METRICS } from '../../constants';
import { aggregateBusiness } from '../../helpers';
import type { BusinessSummary, SignalsByAgentRow } from '../../types';
import SegmentationView from '../Segmentation/SegmentationView';
import { useTeamAnalyticsData } from '../TeamAnalyticsContext';
import {
	AreaLayout,
	BreakdownBars,
	ChartCard,
	MetricTileRow,
	Pair,
	TrendSection,
	useMetricTiles,
} from '../charts';

type ProductRow = BusinessSummary['products'][number];
const productHelper = createColumnHelper<ProductRow>();
const agentHelper = createColumnHelper<SignalsByAgentRow>();

/** Offers, conversion and the objection signals behind lost sales. */
const BusinessView = () => {
	const { t } = useTranslation('qa.teamAnalytics');
	const { calls, previousCalls, filters } = useTeamAnalyticsData();
	const { tile } = useMetricTiles();

	const summary = useMemo(
		() => aggregateBusiness(calls, previousCalls, filters.granularity),
		[calls, previousCalls, filters.granularity]
	);
	const offered = summary.conversionTrend.reduce((s, p) => s + p.offered, 0);
	const converted = summary.conversionTrend.reduce(
		(s, p) => s + p.converted,
		0
	);
	const na = t('common.na');

	const productColumns = useMemo(
		() =>
			[
				productHelper.accessor('product', {
					header: t('business.columns.product'),
					cell: (info) => (
						<Text size='sm' fw={600}>
							{info.getValue()}
						</Text>
					),
				}),
				productHelper.accessor('offered', {
					header: t('business.columns.offered'),
				}),
				productHelper.accessor('converted', {
					header: t('business.columns.converted'),
				}),
				productHelper.accessor('rate', {
					header: t('business.columns.rate'),
					cell: (info) => `${info.getValue()}%`,
				}),
			] as BaseTableColumnDef<ProductRow>[],
		[t]
	);

	const agentColumns = useMemo(
		() =>
			[
				agentHelper.accessor('agentName', {
					header: t('business.columns.agent'),
					cell: (info) => (
						<Text size='sm' fw={600}>
							{info.getValue()}
						</Text>
					),
				}),
				agentHelper.accessor('team', { header: t('business.columns.team') }),
				agentHelper.accessor('calls', { header: t('business.columns.calls') }),
				agentHelper.accessor('early', {
					header: t('business.columns.early'),
					cell: (info) => `${info.getValue()}%`,
				}),
				agentHelper.accessor('unhandled', {
					header: t('business.columns.unhandled'),
					cell: (info) => `${info.getValue()}%`,
				}),
				agentHelper.accessor('competitor', {
					header: t('business.columns.competitor'),
					cell: (info) => `${info.getValue()}%`,
				}),
				agentHelper.accessor('mistargeted', {
					header: t('business.columns.mistargeted'),
					cell: (info) => `${info.getValue()}%`,
				}),
				agentHelper.accessor('conversion', {
					header: t('business.columns.conversion'),
					cell: (info) =>
						info.getValue() === null ? na : `${info.getValue()}%`,
				}),
			] as BaseTableColumnDef<SignalsByAgentRow>[],
		[t, na]
	);

	return (
		<AreaLayout>
			<MetricTileRow
				tiles={[
					{
						label: t('businessView.offered'),
						metricId: 'OPS_CALLS_HANDLED',
						value: offered.toLocaleString(),
						current: offered,
						previous: null,
						neutral: true,
						compare: false,
						hint: summary.bestTimeSlot
							? `${t('business.bestSlot')}: ${summary.bestTimeSlot.slot}`
							: undefined,
					},
					{
						label: t('businessView.converted'),
						metricId: 'OPS_CALLS_HANDLED',
						value: converted.toLocaleString(),
						current: converted,
						previous: null,
						neutral: true,
						compare: false,
					},
					tile('BI_CONVERSION_RATE'),
					tile('BI_EARLY_OBJECTION_RATE'),
					tile('BI_UNHANDLED_OBJECTION_RATE'),
					tile('BI_COMPETITOR_PLUS_COST_RATE'),
				]}
			/>
			<TrendSection
				metricIds={VIEW_METRICS.business}
				primary={PRIMARY_METRIC.business}
			/>
			<Pair>
				<ChartCard
					title={t('businessView.reasonsTitle')}
					empty={summary.reasons.length === 0}
				>
					<BreakdownBars
						unit='PERCENT'
						valueLabel={t('charts.share')}
						rows={summary.reasons.map((reason) => ({
							key: reason.key,
							label: t(`business.reasonLabels.${reason.key}`),
							value: reason.share,
						}))}
					/>
				</ChartCard>
				<ChartCard
					title={t('businessView.productsTitle')}
					empty={summary.products.length === 0}
				>
					<Stack gap='sm'>
						<BaseTable<ProductRow>
							data={summary.products}
							columns={productColumns}
							getRowId={(row) => row.product}
							density='compact'
						/>
						{summary.competitors.length > 0 && (
							<Group gap='xs'>
								<Text size='xs' c='dimmed'>
									{t('businessView.competitorsTitle')}
								</Text>
								{summary.competitors.map((c) => (
									<Badge key={c.name} variant='light' color='gray' tt='none'>
										{c.name} · {c.count}
									</Badge>
								))}
							</Group>
						)}
					</Stack>
				</ChartCard>
			</Pair>
			<ChartCard
				title={t('business.byAgentTitle')}
				description={t('business.byAgentDescription')}
				empty={summary.byAgent.length === 0}
			>
				<BaseTable<SignalsByAgentRow>
					data={summary.byAgent}
					columns={agentColumns}
					getRowId={(row) => row.agentId}
					enablePagination
					showPaginationControls
					pageSize={25}
					density='compact'
				/>
			</ChartCard>
			<SegmentationView
				metricIds={VIEW_METRICS.business}
				primary={PRIMARY_METRIC.business}
			/>
		</AreaLayout>
	);
};

export default BusinessView;
