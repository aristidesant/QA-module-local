import { useMemo } from 'react';
import type { MetricDefinition } from '~/models/AnalyticsDashboard';
import type { ScopeFilter } from '../MetricCatalogPage.types';
import type { TimeSeriesFilter } from '../store/useMetricCatalogStore';

type UseFilteredMetricDefinitionsParams = {
	metrics: MetricDefinition[];
	scopeFilter: ScopeFilter;
	sourceFilter: string;
	campaignFilter: string | null;
	timeSeriesFilter: TimeSeriesFilter;
};

const useFilteredMetricDefinitions = ({
	metrics,
	scopeFilter,
	sourceFilter,
	campaignFilter,
	timeSeriesFilter,
}: UseFilteredMetricDefinitionsParams): MetricDefinition[] => {
	return useMemo(() => {
		return metrics.filter((metric) => {
			if (scopeFilter === 'global' && metric.campaignId !== null) return false;
			if (scopeFilter === 'campaign' && metric.campaignId === null)
				return false;
			if (sourceFilter !== 'all' && metric.sourceType !== sourceFilter)
				return false;
			if (
				campaignFilter &&
				String(metric.campaignId ?? '') !== campaignFilter
			) {
				return false;
			}
			if (timeSeriesFilter === 'supported' && !metric.supportsTimeSeries)
				return false;
			if (timeSeriesFilter === 'unsupported' && metric.supportsTimeSeries)
				return false;

			return true;
		});
	}, [campaignFilter, metrics, scopeFilter, sourceFilter, timeSeriesFilter]);
};

export default useFilteredMetricDefinitions;
