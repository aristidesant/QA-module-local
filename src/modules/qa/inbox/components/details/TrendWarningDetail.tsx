import React from 'react';
import { useTranslation } from 'react-i18next';
import { Badge, Group, SimpleGrid, Stack, Text } from '@mantine/core';
import { LineChart } from '@mantine/charts';
import { IconBolt } from '@tabler/icons-react';
import type { NotificationPayload } from '~/models/qa/notifications';
import { formatMetricValue } from '~/modules/qa/triggers/helpers';
import { chartDomain, datedSeries, windowDays } from '../../detailHelpers';
import { DeltaText, Fact } from './Fact';

type TrendWarningPayload = Extract<
	NotificationPayload,
	{ kind: 'TREND_WARNING' }
>;

/** A metric drifting over a period: where it was, where it is, and the dated slide between the two. */
export const TrendWarningDetail: React.FC<{ payload: TrendWarningPayload }> = ({
	payload,
}) => {
	const { t } = useTranslation('qa.inbox');
	const { t: tAnalytics } = useTranslation('qa.teamAnalytics');
	const metricLabel = tAnalytics(`metrics.${payload.metricId}`);
	const days = windowDays(payload.periodLabel);

	return (
		<Stack gap='md'>
			<SimpleGrid cols={{ base: 2, sm: 4 }} spacing='md'>
				<Fact label={t('details.trendWarning.from')}>
					{formatMetricValue(payload.metricId, payload.from)}
				</Fact>
				<Fact label={t('details.trendWarning.to')}>
					<Text span c='amber.8' fw={700} size='lg'>
						{formatMetricValue(payload.metricId, payload.to)}
					</Text>
				</Fact>
				<Fact label={t('details.trendWarning.change')}>
					<DeltaText value={payload.deltaPct} suffix='%' />
				</Fact>
				<Fact label={t('details.trendWarning.period')}>
					{payload.periodLabel}
				</Fact>
			</SimpleGrid>

			<LineChart
				h={200}
				data={datedSeries(payload.sparkline, days)}
				dataKey='label'
				series={[{ name: 'value', label: metricLabel, color: 'amber.6' }]}
				curveType='monotone'
				withDots
				strokeWidth={2}
				yAxisProps={{
					domain: chartDomain(payload.metricId, [
						...payload.sparkline,
						payload.from,
						payload.to,
					]),
				}}
				valueFormatter={(value) => formatMetricValue(payload.metricId, value)}
				referenceLines={[
					{
						y: payload.from,
						color: 'gray.6',
						strokeDasharray: '6 4',
						label: t('details.trendWarning.fromLine', {
							value: formatMetricValue(payload.metricId, payload.from),
						}),
						labelPosition: 'insideTopRight',
					},
				]}
			/>

			<Group gap='xs' wrap='wrap'>
				{payload.ruleName && (
					<Badge
						variant='light'
						color='gray'
						tt='none'
						leftSection={<IconBolt size={12} />}
					>
						{t('details.metricAlert.rule', { name: payload.ruleName })}
					</Badge>
				)}
				<Text size='xs' c='dimmed'>
					{t('details.metricAlert.caption', {
						metric: metricLabel,
						window: payload.periodLabel,
					})}
				</Text>
			</Group>
		</Stack>
	);
};

export default TrendWarningDetail;
