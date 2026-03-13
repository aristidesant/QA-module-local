import type { TFunction } from 'i18next';
import type {
	MetricAggregationType,
	MetricResultType,
	MetricSourceType,
	MetricValueField,
} from '~/models/AnalyticsDashboard';
import type { MetricCatalogOption } from './MetricCatalogPage.types';

export const getMetricSourceOptions = (
	t: TFunction<'metric-catalog'>
): MetricCatalogOption[] => [
	{ value: 'CONVERSATION', label: t('options.sourceType.CONVERSATION') },
	{ value: 'ATTRIBUTE', label: t('options.sourceType.ATTRIBUTE') },
	{ value: 'DISPOSITION', label: t('options.sourceType.DISPOSITION') },
];

export const getMetricAggregationOptions = (
	t: TFunction<'metric-catalog'>
): MetricCatalogOption[] => [
	{ value: 'COUNT', label: t('options.aggregationType.COUNT') },
	{ value: 'SUM', label: t('options.aggregationType.SUM') },
	{ value: 'AVG', label: t('options.aggregationType.AVG') },
	{ value: 'MIN', label: t('options.aggregationType.MIN') },
	{ value: 'MAX', label: t('options.aggregationType.MAX') },
	{
		value: 'DISTINCT_COUNT',
		label: t('options.aggregationType.DISTINCT_COUNT'),
	},
];

export const getMetricResultTypeOptions = (
	t: TFunction<'metric-catalog'>
): MetricCatalogOption[] => [
	{ value: 'NUMBER', label: t('options.resultType.NUMBER') },
	{ value: 'BOOLEAN', label: t('options.resultType.BOOLEAN') },
	{ value: 'STRING', label: t('options.resultType.STRING') },
];

export const getMetricValueFieldOptions = (
	t: TFunction<'metric-catalog'>
): MetricCatalogOption[] => [
	{ value: 'VALUE_STRING', label: t('options.valueField.VALUE_STRING') },
	{ value: 'VALUE_NUMBER', label: t('options.valueField.VALUE_NUMBER') },
	{ value: 'VALUE_BOOLEAN', label: t('options.valueField.VALUE_BOOLEAN') },
	{ value: 'VALUE_JSON', label: t('options.valueField.VALUE_JSON') },
];

export const getMetricScopeOptions = (
	t: TFunction<'metric-catalog'>
): MetricCatalogOption[] => [
	{ value: 'global', label: t('form.scope.global') },
	{ value: 'campaign', label: t('form.scope.campaign') },
];

export const getMetricScopeFilterOptions = (
	t: TFunction<'metric-catalog'>
): MetricCatalogOption[] => [
	{ value: 'all', label: t('filters.allScopes') },
	{ value: 'global', label: t('filters.global') },
	{ value: 'campaign', label: t('filters.campaign') },
];

export const getMetricSourceFilterOptions = (
	t: TFunction<'metric-catalog'>
): MetricCatalogOption[] => [
	{ value: 'all', label: t('filters.allSources') },
	...getMetricSourceOptions(t),
];

export const getMetricSourceTypeBadgeColor = (
	value: MetricSourceType
): string => {
	const colors: Record<MetricSourceType, string> = {
		CONVERSATION: 'blue',
		ATTRIBUTE: 'violet',
		DISPOSITION: 'orange',
	};
	return colors[value] ?? 'gray';
};

export const getMetricAggregationTypeBadgeColor = (
	value: MetricAggregationType
): string => {
	const colors: Record<MetricAggregationType, string> = {
		COUNT: 'gray',
		SUM: 'teal',
		AVG: 'cyan',
		MIN: 'indigo',
		MAX: 'grape',
		DISTINCT_COUNT: 'pink',
	};
	return colors[value] ?? 'gray';
};

export const getMetricResultTypeBadgeColor = (
	value: MetricResultType
): string => {
	const colors: Record<MetricResultType, string> = {
		NUMBER: 'blue',
		BOOLEAN: 'green',
		STRING: 'orange',
	};
	return colors[value] ?? 'gray';
};

export const getMetricSourceTypeLabel = (
	t: TFunction<'metric-catalog'>,
	value: MetricSourceType
): string => t(`options.sourceType.${value}`);

export const getMetricAggregationTypeLabel = (
	t: TFunction<'metric-catalog'>,
	value: MetricAggregationType
): string => t(`options.aggregationType.${value}`);

export const getMetricResultTypeLabel = (
	t: TFunction<'metric-catalog'>,
	value: MetricResultType
): string => t(`options.resultType.${value}`);

export const getMetricValueFieldLabel = (
	t: TFunction<'metric-catalog'>,
	value: MetricValueField
): string => t(`options.valueField.${value}`);
