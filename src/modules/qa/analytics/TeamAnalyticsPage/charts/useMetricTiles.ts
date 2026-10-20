import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
	aggregateMetric,
	formatMetric,
	metricMeta,
	sparklineFor,
} from '../../helpers';
import type { AnalyticsMetricId } from '../../types';
import { useTeamAnalyticsData } from '../TeamAnalyticsContext';
import type { MetricTileProps } from './MetricTile';

interface TileOptions {
	label?: string;
	/** Volume and similar: no good or bad direction. */
	neutral?: boolean;
	hint?: string;
	sparkline?: boolean;
	onClick?: () => void;
}

/** Builds metric tiles from the filtered calls and the previous period, memoised per metric. */
export function useMetricTiles() {
	const { t } = useTranslation('qa.teamAnalytics');
	const { calls, previousCalls, filters, compare } = useTeamAnalyticsData();

	return useMemo(() => {
		const cache = new Map<
			AnalyticsMetricId,
			{ current: number | null; previous: number | null; spark: number[] }
		>();
		const measure = (id: AnalyticsMetricId) => {
			let hit = cache.get(id);
			if (!hit) {
				hit = {
					current: aggregateMetric(calls, id),
					previous: compare ? aggregateMetric(previousCalls, id) : null,
					spark: sparklineFor(calls, id, filters.from, filters.to, 12),
				};
				cache.set(id, hit);
			}
			return hit;
		};

		const tile = (
			metricId: AnalyticsMetricId,
			options: TileOptions = {}
		): MetricTileProps => {
			const { current, previous, spark } = measure(metricId);
			const isCount = metricMeta(metricId).unit === 'COUNT';
			return {
				label: options.label ?? t(`metrics.${metricId}`),
				value:
					current === null
						? t('common.na')
						: isCount
							? current.toLocaleString()
							: formatMetric(metricId, current),
				metricId,
				current,
				previous,
				neutral: options.neutral,
				sparkline: options.sparkline === false ? undefined : spark,
				compare,
				hint: options.hint,
				onClick: options.onClick,
			};
		};
		return { tile, measure };
	}, [calls, previousCalls, filters.from, filters.to, compare, t]);
}
