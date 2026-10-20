import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router';
import { Badge, Text } from '@mantine/core';
import { createColumnHelper } from '@tanstack/react-table';
import BaseTable, {
	type BaseTableColumnDef,
} from '~/components/BaseTable/BaseTable';
import {
	selectTriggerRules,
	useTriggerRulesStore,
} from '~/stores/qa/triggerRulesStore';
import { VIEW_PARAM } from '../../constants';
import {
	aggregateDisputes,
	alignedComparisonSeries,
	burnoutSummary,
	formatMetric,
	overviewExceptions,
} from '../../helpers';
import type { OverviewException, TeamAnalyticsView } from '../../types';
import { useTeamAnalyticsData } from '../TeamAnalyticsContext';
import {
	AreaLayout,
	ChartCard,
	MetricTileRow,
	Pair,
	SERIES_CURRENT,
	SERIES_PREVIOUS,
	TrendChart,
	useMetricTiles,
	type MetricTileProps,
	type TrendSeries,
} from '../charts';

const helper = createColumnHelper<OverviewException>();

/** One headline tile per area, the calls volume and what needs attention; every tile opens its tab. */
export default function OverviewView() {
	const { t } = useTranslation('qa.teamAnalytics');
	const navigate = useNavigate();
	const location = useLocation();
	const {
		role,
		calls,
		previousCalls,
		filters,
		compare,
		disputes,
		previousDisputes,
	} = useTeamAnalyticsData();
	const { tile } = useMetricTiles();
	const rules = useTriggerRulesStore(selectTriggerRules);
	const burnout = useMemo(() => burnoutSummary(role, rules), [role, rules]);

	const go = (view: TeamAnalyticsView) => () => {
		const next = new URLSearchParams(location.search);
		next.set(VIEW_PARAM, view);
		navigate(`${location.pathname}?${next.toString()}`);
	};

	const disputeSummary = useMemo(
		() => aggregateDisputes(calls, disputes),
		[calls, disputes]
	);
	const previousDisputeSummary = useMemo(
		() => aggregateDisputes(previousCalls, previousDisputes),
		[previousCalls, previousDisputes]
	);

	const tiles: MetricTileProps[] = [
		tile('OPS_CALLS_HANDLED', {
			label: t('overviewView.calls'),
			neutral: true,
			onClick: go('operational'),
		}),
		tile('OPS_EFFECTIVE_CONTACT_RATE', {
			label: t('overviewView.effective'),
			onClick: go('operational'),
		}),
		tile('QA_OVERALL_SCORE', { onClick: go('qa') }),
		tile('COMPLIANCE_OVERALL_SCORE', { onClick: go('compliance') }),
		tile('CUSTOMER_SENTIMENT_SCORE', { onClick: go('sentiment') }),
		tile('BI_CONVERSION_RATE', { onClick: go('business') }),
		{
			label: t('overviewView.openDisputes'),
			metricId: 'DISPUTE_COUNT',
			value: String(disputeSummary.open),
			current: disputeSummary.open,
			previous: compare ? previousDisputeSummary.open : null,
			neutral: true,
			compare,
			onClick: go('disputes'),
		},
		{
			label: t('overviewView.atRisk'),
			metricId: 'OPS_CALLS_HANDLED',
			value: String(burnout.high + burnout.medium),
			current: burnout.high + burnout.medium,
			previous: null,
			neutral: true,
			compare: false,
			hint: t('overviewView.burnoutHint'),
			onClick: go('burnout'),
		},
	];

	const volume = useMemo(
		() =>
			alignedComparisonSeries(
				calls,
				previousCalls,
				'OPS_CALLS_HANDLED',
				filters
			).map((p) => ({
				period: p.period,
				current: p.current,
				previous: compare ? p.previous : null,
			})),
		[calls, previousCalls, filters, compare]
	);
	const volumeSeries: TrendSeries[] = [
		{ name: 'current', label: t('charts.current'), color: SERIES_CURRENT },
		...(compare
			? [
					{
						name: 'previous',
						label: t('charts.previous'),
						color: SERIES_PREVIOUS,
						dashed: true,
					},
				]
			: []),
	];

	const exceptions = useMemo(
		() =>
			overviewExceptions(
				calls,
				previousCalls,
				'agent',
				filters.minCalls,
				compare
			),
		[calls, previousCalls, filters.minCalls, compare]
	);

	const columns = useMemo(
		() =>
			[
				helper.display({
					id: 'area',
					header: t('overviewView.columns.area'),
					cell: (info) => (
						<Badge variant='light' color='gray'>
							{t(`areas.${info.row.original.area}`)}
						</Badge>
					),
				}),
				helper.display({
					id: 'segment',
					header: t('overviewView.columns.segment'),
					cell: (info) => (
						<Text size='sm' fw={600}>
							{info.row.original.segmentLabel}
						</Text>
					),
				}),
				helper.display({
					id: 'value',
					header: t('overviewView.columns.value'),
					cell: (info) => {
						const row = info.row.original;
						return (
							<Text size='sm'>
								{formatMetric(row.metricId, row.value)}{' '}
								<Text span size='xs' c='dimmed'>
									{t(`metrics.${row.metricId}`)}
								</Text>
							</Text>
						);
					},
				}),
				helper.display({
					id: 'why',
					header: t('overviewView.columns.why'),
					cell: (info) => {
						const row = info.row.original;
						return (
							<Text size='sm' c='dimmed'>
								{row.reason === 'BELOW_TARGET'
									? t('overviewView.belowTarget', {
											target: formatMetric(row.metricId, row.target),
										})
									: t('overviewView.worsened', {
											previous: formatMetric(row.metricId, row.previous),
										})}
							</Text>
						);
					},
				}),
			] as BaseTableColumnDef<OverviewException>[],
		[t]
	);

	return (
		<AreaLayout>
			<MetricTileRow tiles={tiles} columns={4} />
			<Pair>
				<ChartCard
					title={t('overviewView.volumeTitle')}
					empty={volume.length === 0}
					footer={t('charts.callsInPeriod', { count: calls.length })}
				>
					<TrendChart
						data={volume}
						series={volumeSeries}
						metricId='OPS_CALLS_HANDLED'
					/>
				</ChartCard>
				<ChartCard
					title={t('overviewView.attentionTitle')}
					description={t('overviewView.attentionDescription')}
				>
					<BaseTable<OverviewException>
						data={exceptions}
						columns={columns}
						getRowId={(row) => `${row.metricId}-${row.segmentKey}`}
						density='compact'
						emptyMessage={t('overviewView.none')}
						onRowClick={(row) => go(row.view)()}
					/>
				</ChartCard>
			</Pair>
		</AreaLayout>
	);
}
