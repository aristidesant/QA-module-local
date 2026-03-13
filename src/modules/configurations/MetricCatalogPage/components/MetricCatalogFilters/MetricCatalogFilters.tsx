import { memo, useMemo } from 'react';
import { Group, Select } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import {
	getMetricScopeFilterOptions,
	getMetricSourceFilterOptions,
} from '../../MetricCatalogPage.helpers';
import type {
	MetricCatalogOption,
	ScopeFilter,
} from '../../MetricCatalogPage.types';
import useMetricCatalogStore, {
	type TimeSeriesFilter,
} from '../../store/useMetricCatalogStore';
import styles from './MetricCatalogFilters.module.css';

type MetricCatalogFiltersProps = {
	campaignOptions: MetricCatalogOption[];
};

const MetricCatalogFilters = ({
	campaignOptions,
}: MetricCatalogFiltersProps) => {
	const { t } = useTranslation('metric-catalog');
	const scopeFilter = useMetricCatalogStore((state) => state.scopeFilter);
	const sourceFilter = useMetricCatalogStore((state) => state.sourceFilter);
	const campaignFilter = useMetricCatalogStore((state) => state.campaignFilter);
	const timeSeriesFilter = useMetricCatalogStore(
		(state) => state.timeSeriesFilter
	);
	const setScopeFilter = useMetricCatalogStore((state) => state.setScopeFilter);
	const setSourceFilter = useMetricCatalogStore(
		(state) => state.setSourceFilter
	);
	const setCampaignFilter = useMetricCatalogStore(
		(state) => state.setCampaignFilter
	);
	const setTimeSeriesFilter = useMetricCatalogStore(
		(state) => state.setTimeSeriesFilter
	);

	const scopeOptions = useMemo(() => getMetricScopeFilterOptions(t), [t]);
	const sourceOptions = useMemo(() => getMetricSourceFilterOptions(t), [t]);
	const timeSeriesOptions = useMemo(
		() => [
			{ value: 'all', label: t('filters.timeSeries.all') },
			{ value: 'supported', label: t('filters.timeSeries.supported') },
			{ value: 'unsupported', label: t('filters.timeSeries.unsupported') },
		],
		[t]
	);

	return (
		<Group className={styles.filtersRow} align='flex-end'>
			<Select
				label={t('filters.scope')}
				className={styles.filterField}
				value={scopeFilter}
				allowDeselect={false}
				onChange={(value) => setScopeFilter((value as ScopeFilter) || 'all')}
				data={scopeOptions}
			/>
			<Select
				label={t('filters.source')}
				className={styles.filterField}
				value={sourceFilter}
				allowDeselect={false}
				onChange={(value) => setSourceFilter(value || 'all')}
				data={sourceOptions}
			/>
			<Select
				label={t('filters.timeSeries.label')}
				className={styles.filterField}
				value={timeSeriesFilter}
				allowDeselect={false}
				onChange={(value) =>
					setTimeSeriesFilter((value as TimeSeriesFilter) || 'all')
				}
				data={timeSeriesOptions}
			/>
			<Select
				label={t('filters.campaignLabel')}
				className={styles.filterField}
				value={campaignFilter}
				onChange={setCampaignFilter}
				data={campaignOptions}
				searchable
				clearable
				placeholder={t('filters.anyCampaign')}
			/>
		</Group>
	);
};

export default memo(MetricCatalogFilters);
