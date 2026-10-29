import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import { Badge, Box, Highlight, Paper, Stack, Text } from '@mantine/core';
import { BarChart, ScatterChart } from '@mantine/charts';
import { createColumnHelper } from '@tanstack/react-table';
import BaseTable, {
	type BaseTableColumnDef,
} from '~/components/BaseTable/BaseTable';
import { useChartReady } from '~/modules/qa/hooks/useChartReady';
import type { SentimentCauseKey } from '~/modules/qa/sentimentCauses/types';
import { useCauseLabel } from '~/modules/qa/sentimentCauses/useCauseSettings';
import { isStrengthKey } from '~/modules/qa/surveys/constants';
import { aggregateSurveys } from '~/modules/qa/surveys/helpers';
import type {
	QaBandKey,
	SurveyAgentPoint,
	SurveyComment,
} from '~/modules/qa/surveys/types';
import { selectThresholds, useSettingsStore } from '~/stores/qa/settingsStore';
import { PRIMARY_METRIC, VIEW_METRICS } from '../../constants';
import { formatMetric } from '../../helpers';
import SegmentationView from '../Segmentation/SegmentationView';
import CommentarySection from './CommentarySection';
import { useTeamAnalyticsData } from '../TeamAnalyticsContext';
import {
	AreaLayout,
	ChartCard,
	MetricTileRow,
	Pair,
	SERIES,
	TrendSection,
	useMetricTiles,
} from '../charts';
import classes from '../charts/charts.module.css';

const commentHelper = createColumnHelper<SurveyComment>();

/** The tooltip names the agent; the chart itself only has the two scores. */
const AgentTooltip = ({
	point,
	labels,
}: {
	point?: SurveyAgentPoint;
	labels: { qa: string; nps: string; responses: string };
}) => {
	if (!point) return null;
	return (
		<Paper withBorder shadow='md' p='xs' radius='md'>
			<Text size='sm' fw={600}>
				{point.agentName}
			</Text>
			<Text size='xs' c='dimmed'>
				{labels.qa}: {Math.round(point.qa)}
			</Text>
			<Text size='xs' c='dimmed'>
				{labels.nps}: {formatMetric('SURVEY_NPS', point.nps)}
			</Text>
			<Text size='xs' c='dimmed'>
				{labels.responses}: {point.responses}
			</Text>
		</Paper>
	);
};

/** Customer surveys tied to the QA score: NPS, CSAT and comments, by QA band and by agent. */
const SurveysView = () => {
	const { t } = useTranslation('qa.teamAnalytics');
	const { calls, previousCalls, filters, compare } = useTeamAnalyticsData();
	const { tile } = useMetricTiles();
	const ready = useChartReady();
	const causeLabel = useCauseLabel();
	const qaBands = useSettingsStore(selectThresholds).qa.scoreBands;

	const summary = useMemo(
		() => aggregateSurveys(calls, previousCalls, qaBands, filters.granularity),
		[calls, previousCalls, qaBands, filters.granularity]
	);

	const bandLabel = (key: QaBandKey) =>
		t(`surveysView.bands.${key}`, {
			watch: qaBands.watch,
			top: qaBands.onTarget - 1,
			onTarget: qaBands.onTarget,
		});
	const bandData = summary.bands.map((band) => ({
		label: `${bandLabel(band.key)} · ${band.responses}`,
		value: band.nps ?? 0,
	}));
	const hasBands = summary.bands.some((band) => band.nps !== null);

	const scatterLabels = {
		qa: t('surveysView.scatterX'),
		nps: t('surveysView.scatterY'),
		responses: t('surveysView.responses'),
	};

	const commentColumns = useMemo(
		() =>
			[
				commentHelper.accessor('date', {
					header: t('surveysView.columns.date'),
					cell: (info) => dayjs(info.getValue()).format('DD MMM'),
				}),
				commentHelper.accessor('agentName', {
					header: t('surveysView.columns.agent'),
					cell: (info) => (
						<Text size='sm' fw={600}>
							{info.getValue()}
						</Text>
					),
				}),
				commentHelper.display({
					id: 'response',
					header: t('surveysView.columns.response'),
					cell: (info) => {
						const row = info.row.original;
						return (
							<Badge
								size='sm'
								variant='light'
								tt='none'
								color={row.detractor ? 'red' : 'gray'}
							>
								{row.type} {row.score}
							</Badge>
						);
					},
				}),
				commentHelper.display({
					id: 'theme',
					header: t('surveysView.commentary.themeColumn'),
					cell: (info) => {
						const key = info.row.original.theme;
						if (!key)
							return (
								<Text size='sm' c='dimmed'>
									{t('surveysView.commentary.noTheme')}
								</Text>
							);
						return (
							<Badge size='sm' variant='outline' color='gray' tt='none'>
								{isStrengthKey(key)
									? t(`surveysView.strengths.${key}`)
									: causeLabel(key as SentimentCauseKey)}
							</Badge>
						);
					},
				}),
				commentHelper.display({
					id: 'comment',
					header: t('surveysView.columns.comment'),
					cell: (info) => {
						const row = info.row.original;
						// The words that carry the theme stand out; everything else reads as plain text.
						return (
							<Highlight highlight={row.highlight ?? ''} color='gray' size='sm'>
								{row.verbatim}
							</Highlight>
						);
					},
				}),
			] as BaseTableColumnDef<SurveyComment>[],
		[t, causeLabel]
	);

	return (
		<AreaLayout>
			<MetricTileRow
				tiles={[
					tile('SURVEY_NPS'),
					tile('SURVEY_CSAT_AVG'),
					tile('SURVEY_RESPONSE_RATE'),
					tile('SURVEY_DETRACTOR_SHARE'),
					tile('SURVEY_RESPONSE_COUNT', { neutral: true }),
				]}
			/>
			<TrendSection
				metricIds={VIEW_METRICS.surveys}
				primary={PRIMARY_METRIC.surveys}
			/>
			<Pair>
				<ChartCard
					title={t('surveysView.bandsTitle')}
					description={t('surveysView.bandsDescription')}
					empty={!hasBands}
				>
					{ready ? (
						<BarChart
							h={summary.bands.length * 52 + 32}
							data={bandData}
							dataKey='label'
							orientation='vertical'
							series={[
								{
									name: 'value',
									label: t('metrics.SURVEY_NPS'),
									color: SERIES[0],
								},
							]}
							withBarValueLabel
							valueFormatter={(value) => formatMetric('SURVEY_NPS', value)}
							barProps={{ radius: 4 }}
							gridAxis='x'
							tickLine='none'
							yAxisProps={{ width: 150 }}
							xAxisProps={{ domain: [-100, 100] }}
						/>
					) : (
						<Box h={200} className={classes.chartPlaceholder} />
					)}
				</ChartCard>
				<ChartCard
					title={t('surveysView.scatterTitle')}
					description={t('surveysView.scatterDescription')}
					empty={summary.byAgent.length === 0}
				>
					{ready ? (
						<Stack gap='xs'>
							<ScatterChart
								h={260}
								data={[
									{
										name: t('surveysView.scatterTitle'),
										color: SERIES[0],
										// Numbers only: the agent is looked up by index in the tooltip.
										data: summary.byAgent.map((point, index) => ({
											qa: Math.round(point.qa),
											nps: point.nps,
											responses: point.responses,
											index,
										})),
									},
								]}
								dataKey={{ x: 'qa', y: 'nps' }}
								xAxisLabel={scatterLabels.qa}
								yAxisLabel={scatterLabels.nps}
								xAxisProps={{ domain: [0, 100] }}
								yAxisProps={{ domain: [-100, 100] }}
								valueFormatter={{
									y: (value) => formatMetric('SURVEY_NPS', value),
								}}
								gridAxis='xy'
								tooltipProps={{
									content: (props) => {
										const row = props.payload?.[0]?.payload as unknown as
											| { index: number }
											| undefined;
										return (
											<AgentTooltip
												point={row ? summary.byAgent[row.index] : undefined}
												labels={scatterLabels}
											/>
										);
									},
								}}
							/>
							<Text size='xs' c='dimmed'>
								{t('surveysView.minResponses', { count: 5 })}
							</Text>
						</Stack>
					) : (
						<Box h={260} className={classes.chartPlaceholder} />
					)}
				</ChartCard>
			</Pair>
			<CommentarySection commentary={summary.commentary} compare={compare} />
			<ChartCard
				title={t('surveysView.commentsTitle')}
				description={t('surveysView.commentsDescription')}
				empty={summary.comments.length === 0}
			>
				<BaseTable<SurveyComment>
					data={summary.comments}
					columns={commentColumns}
					getRowId={(row) => row.id}
					density='compact'
				/>
			</ChartCard>
			<SegmentationView
				metricIds={VIEW_METRICS.surveys}
				primary={PRIMARY_METRIC.surveys}
			/>
		</AreaLayout>
	);
};

export default SurveysView;
