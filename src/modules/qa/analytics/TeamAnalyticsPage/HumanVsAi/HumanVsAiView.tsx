import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Table, Text } from '@mantine/core';
import { BarChart } from '@mantine/charts';
import { createColumnHelper } from '@tanstack/react-table';
import BaseTable, {
	type BaseTableColumnDef,
} from '~/components/BaseTable/BaseTable';
import { useChartReady } from '~/modules/qa/hooks/useChartReady';
import { HUMAN_VS_AI_METRICS } from '../../constants';
import { aiShareSeries, formatMetric, humanVsAi } from '../../helpers';
import type { HumanVsAiAgentRow } from '../../types';
import SegmentationView from '../Segmentation/SegmentationView';
import { useTeamAnalyticsData } from '../TeamAnalyticsContext';
import {
	AreaLayout,
	ChartCard,
	MetricTileRow,
	Pair,
	SERIES,
	SERIES_CURRENT,
	TrendChart,
	type MetricTileProps,
} from '../charts';

const helper = createColumnHelper<HumanVsAiAgentRow>();

/** Humans and AI agents on the same metrics: volume share, an indexed comparison and the AI roster. */
export default function HumanVsAiView() {
	const { t } = useTranslation('qa.teamAnalytics');
	const { calls, filters } = useTeamAnalyticsData();
	const ready = useChartReady();

	const summary = useMemo(() => humanVsAi(calls), [calls]);
	const share = useMemo(
		() => aiShareSeries(calls, filters.granularity),
		[calls, filters.granularity]
	);

	const tile = (
		label: string,
		value: string,
		current: number | null
	): MetricTileProps => ({
		label,
		value,
		metricId: 'OPS_CALLS_HANDLED',
		current,
		previous: null,
		neutral: true,
		compare: false,
	});
	const tiles = [
		tile(
			t('humanVsAi.aiShare'),
			summary.aiShare === null ? t('common.na') : `${summary.aiShare}%`,
			summary.aiShare
		),
		tile(
			t('humanVsAi.humanCalls'),
			summary.humanCalls.toLocaleString(),
			summary.humanCalls
		),
		tile(
			t('humanVsAi.aiCalls'),
			summary.aiCalls.toLocaleString(),
			summary.aiCalls
		),
		tile(t('humanVsAi.aiAgents'), String(summary.aiAgents), summary.aiAgents),
	];

	const columns = useMemo(
		() =>
			[
				helper.accessor('agentName', {
					header: t('humanVsAi.columns.agent'),
					cell: (info) => (
						<Text size='sm' fw={600}>
							{info.getValue()}
						</Text>
					),
				}),
				helper.accessor('team', { header: t('humanVsAi.columns.team') }),
				helper.accessor('calls', { header: t('humanVsAi.columns.calls') }),
				helper.accessor('qa', {
					header: t('humanVsAi.columns.qa'),
					cell: (info) => formatMetric('QA_OVERALL_SCORE', info.getValue()),
				}),
				helper.accessor('compliance', {
					header: t('humanVsAi.columns.compliance'),
					cell: (info) =>
						formatMetric('COMPLIANCE_OVERALL_SCORE', info.getValue()),
				}),
				helper.accessor('sentiment', {
					header: t('humanVsAi.columns.sentiment'),
					cell: (info) =>
						formatMetric('CUSTOMER_SENTIMENT_SCORE', info.getValue()),
				}),
				helper.accessor('effective', {
					header: t('humanVsAi.columns.effective'),
					cell: (info) =>
						formatMetric('OPS_EFFECTIVE_CONTACT_RATE', info.getValue()),
				}),
			] as BaseTableColumnDef<HumanVsAiAgentRow>[],
		[t]
	);

	const chartHeight = summary.metrics.length * 52 + 40;

	return (
		<AreaLayout>
			<MetricTileRow tiles={tiles} columns={4} />
			<Pair>
				<ChartCard
					title={t('humanVsAi.comparisonTitle')}
					description={t('humanVsAi.comparisonDescription')}
					footer={t('humanVsAi.indexHint')}
				>
					{ready && (
						<BarChart
							h={chartHeight}
							dataKey='metric'
							orientation='vertical'
							data={summary.metrics.map((m) => ({
								metric: t(`metrics.${m.id}`),
								human: m.index.human,
								ai: m.index.ai,
							}))}
							series={[
								{
									name: 'human',
									label: t('humanVsAi.human'),
									color: SERIES_CURRENT,
								},
								{ name: 'ai', label: t('humanVsAi.ai'), color: SERIES[0] },
							]}
							withLegend
							legendProps={{ verticalAlign: 'top', height: 28 }}
							withBarValueLabel
							barProps={{ radius: 4 }}
							gridAxis='x'
							tickLine='none'
							yAxisProps={{ width: 150 }}
							xAxisProps={{ domain: [0, 100] }}
						/>
					)}
				</ChartCard>
				<ChartCard title={t('humanVsAi.rawTitle')}>
					<Table verticalSpacing='xs'>
						<Table.Thead>
							<Table.Tr>
								<Table.Th>{t('charts.metric')}</Table.Th>
								<Table.Th>{t('humanVsAi.human')}</Table.Th>
								<Table.Th>{t('humanVsAi.ai')}</Table.Th>
							</Table.Tr>
						</Table.Thead>
						<Table.Tbody>
							{summary.metrics.map((m) => (
								<Table.Tr key={m.id}>
									<Table.Td>{t(`metrics.${m.id}`)}</Table.Td>
									<Table.Td>{formatMetric(m.id, m.human)}</Table.Td>
									<Table.Td>{formatMetric(m.id, m.ai)}</Table.Td>
								</Table.Tr>
							))}
						</Table.Tbody>
					</Table>
				</ChartCard>
			</Pair>
			<Pair>
				<ChartCard
					title={t('humanVsAi.shareTrendTitle')}
					empty={share.length === 0}
				>
					<TrendChart
						metricId='OPS_EFFECTIVE_CONTACT_RATE'
						data={share.map((p) => ({ period: p.period, share: p.value }))}
						series={[
							{
								name: 'share',
								label: t('humanVsAi.aiShare'),
								color: SERIES[0],
							},
						]}
					/>
				</ChartCard>
				<ChartCard
					title={t('humanVsAi.agentsTitle')}
					empty={summary.byAgent.length === 0}
				>
					<BaseTable<HumanVsAiAgentRow>
						data={summary.byAgent}
						columns={columns}
						getRowId={(row) => row.agentId}
						density='compact'
					/>
				</ChartCard>
			</Pair>
			<SegmentationView
				metricIds={HUMAN_VS_AI_METRICS}
				primary='QA_OVERALL_SCORE'
				fixedGroupBy='agentType'
			/>
		</AreaLayout>
	);
}
