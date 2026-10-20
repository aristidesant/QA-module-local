import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Group, Select } from '@mantine/core';
import { MAX_LINE_SERIES } from '../../constants';
import {
	alignedComparisonSeries,
	buildSegmentSeries,
	buildSegments,
} from '../../helpers';
import type { SegmentMetricId } from '../../types';
import GroupBySelector from '../Segmentation/GroupBySelector';
import { useSegmentLabel } from '../Segmentation/segmentLabels';
import { useTeamAnalyticsData } from '../TeamAnalyticsContext';
import ChartCard from './ChartCard';
import SmallMultiples from './SmallMultiples';
import TrendChart, { type TrendSeries } from './TrendChart';
import { SERIES_CURRENT, SERIES_PREVIOUS, seriesColorAt } from './seriesColors';

interface TrendSectionProps {
	metricIds: SegmentMetricId[];
	primary: SegmentMetricId;
	/** Target line for a metric (e.g. the configured QA threshold), if it has one. */
	targetOf?: (id: SegmentMetricId) => number | null;
}

/**
 * The trend block every area tab shares: a metric picker and a group-by on top of one chart.
 * Ungrouped it plots current against the previous period; grouped it plots one line per
 * segment (up to four) and switches to one small chart per segment beyond that.
 */
export default function TrendSection({
	metricIds,
	primary,
	targetOf,
}: TrendSectionProps) {
	const { t } = useTranslation('qa.teamAnalytics');
	const { role, calls, previousCalls, filters, groupBy, compare } =
		useTeamAnalyticsData();
	const [metricId, setMetricId] = useState<SegmentMetricId>(primary);
	useEffect(() => setMetricId(primary), [primary]);
	const labelOf = useSegmentLabel(groupBy);
	const granularity = filters.granularity;

	const model = useMemo(() => {
		if (groupBy === 'none') {
			const points = alignedComparisonSeries(
				calls,
				previousCalls,
				metricId,
				filters
			);
			return {
				kind: 'single' as const,
				data: points.map((p) => ({
					period: p.period,
					current: p.current,
					previous: compare ? p.previous : null,
				})),
			};
		}
		const rows = buildSegments(
			calls,
			previousCalls,
			groupBy,
			[metricId],
			filters.from,
			filters.to,
			filters.minCalls
		);
		const points = buildSegmentSeries(
			calls,
			groupBy,
			metricId,
			filters.from,
			filters.to,
			granularity,
			rows.map((r) => r.key)
		);
		return { kind: 'segments' as const, rows, points };
	}, [calls, previousCalls, filters, groupBy, granularity, metricId, compare]);

	const metricLabel = t(`metrics.${metricId}`);
	const target = targetOf ? targetOf(metricId) : null;

	let body;
	let empty = false;
	if (model.kind === 'single') {
		empty = model.data.length === 0;
		const series: TrendSeries[] = [
			{ name: 'current', label: t('charts.current'), color: SERIES_CURRENT },
		];
		if (compare)
			series.push({
				name: 'previous',
				label: t('charts.previous'),
				color: SERIES_PREVIOUS,
				dashed: true,
			});
		body = (
			<TrendChart
				data={model.data}
				series={series}
				metricId={metricId}
				target={target}
			/>
		);
	} else if (model.rows.length === 0 || model.points.length === 0) {
		empty = true;
	} else if (model.rows.length <= MAX_LINE_SERIES) {
		body = (
			<TrendChart
				data={model.points.map((p) => ({ ...p }))}
				series={model.rows.map((row, i) => ({
					name: row.key,
					label: labelOf(row),
					color: seriesColorAt(i, row.key),
				}))}
				metricId={metricId}
				target={target}
			/>
		);
	} else {
		body = (
			<SmallMultiples
				metricId={metricId}
				items={model.rows.map((row) => ({
					key: row.key,
					label: labelOf(row),
					data: model.points.map((p) => ({
						period: p.period,
						value:
							typeof p[row.key] === 'number' ? (p[row.key] as number) : null,
					})),
				}))}
			/>
		);
	}

	return (
		<ChartCard
			title={t('charts.trendTitle', { metric: metricLabel })}
			description={
				model.kind === 'segments' && model.rows.length > MAX_LINE_SERIES
					? t('charts.smallMultiplesHint', { count: MAX_LINE_SERIES })
					: undefined
			}
			empty={empty}
			controls={
				<Group gap='sm'>
					<Select
						size='xs'
						aria-label={t('charts.metric')}
						data={metricIds.map((id) => ({
							value: id,
							label: t(`metrics.${id}`),
						}))}
						value={metricId}
						onChange={(value) => value && setMetricId(value as SegmentMetricId)}
						allowDeselect={false}
						comboboxProps={{ withinPortal: true }}
					/>
					<GroupBySelector role={role} />
				</Group>
			}
			footer={t('charts.callsInPeriod', { count: calls.length })}
		>
			{body}
		</ChartCard>
	);
}
