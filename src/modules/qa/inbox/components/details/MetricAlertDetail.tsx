import React from 'react';
import { useTranslation } from 'react-i18next';
import { Badge, Group, SimpleGrid, Stack, Text } from '@mantine/core';
import { LineChart } from '@mantine/charts';
import { IconBolt } from '@tabler/icons-react';
import type { NotificationPayload } from '~/models/qa/notifications';
import { formatMetricValue } from '~/modules/qa/triggers/helpers';
import {
	chartDomain,
	datedSeries,
	gapText,
	windowDays,
} from '../../detailHelpers';
import { Fact } from './Fact';

type MetricAlertPayload = Extract<
	NotificationPayload,
	{ kind: 'METRIC_ALERT' }
>;

/** A metric that crossed its threshold: the reading against the floor, then the dated path that led there. */
export const MetricAlertDetail: React.FC<{ payload: MetricAlertPayload }> = ({
	payload,
}) => {
	const { t } = useTranslation('qa.inbox');
	const { t: tAnalytics } = useTranslation('qa.teamAnalytics');
	const metricLabel = tAnalytics(`metrics.${payload.metricId}`);
	const days = windowDays(payload.windowLabel);
	const gapKey =
		payload.direction === 'BELOW'
			? 'details.metricAlert.gapBelow'
			: 'details.metricAlert.gapAbove';

	return (
		<Stack gap='md'>
			<SimpleGrid cols={{ base: 2, sm: 4 }} spacing='md'>
				<Fact label={t('details.metricAlert.current')}>
					<Text span c='danger.7' fw={700} size='lg'>
						{formatMetricValue(payload.metricId, payload.value)}
					</Text>
				</Fact>
				<Fact label={t('details.metricAlert.threshold')}>
					{formatMetricValue(payload.metricId, payload.threshold)}
				</Fact>
				<Fact label={t('details.metricAlert.gap')}>
					{t(gapKey, {
						gap: gapText(payload.metricId, payload.value, payload.threshold),
					})}
				</Fact>
				<Fact label={t('details.metricAlert.window')}>
					{payload.windowLabel}
				</Fact>
			</SimpleGrid>

			<LineChart
				h={200}
				data={datedSeries(payload.sparkline, days)}
				dataKey='label'
				series={[{ name: 'value', label: metricLabel, color: 'danger.6' }]}
				curveType='monotone'
				withDots
				strokeWidth={2}
				yAxisProps={{
					domain: chartDomain(payload.metricId, [
						...payload.sparkline,
						payload.threshold,
					]),
				}}
				valueFormatter={(value) => formatMetricValue(payload.metricId, value)}
				referenceLines={[
					{
						y: payload.threshold,
						color: 'gray.6',
						strokeDasharray: '6 4',
						label: t('details.metricAlert.thresholdLine', {
							value: formatMetricValue(payload.metricId, payload.threshold),
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
						window: payload.windowLabel,
					})}
				</Text>
			</Group>
		</Stack>
	);
};

export default MetricAlertDetail;
