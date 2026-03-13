import type {
	CreateMetricDefinitionDto,
	MetricDefinition,
	MetricValueField,
	UpdateMetricDefinitionDto,
} from '~/models/AnalyticsDashboard';
import { EMPTY_FORM_VALUES } from './MetricDefinitionForm.constants';
import type { MetricDefinitionFormValues } from './MetricDefinitionForm.types';

export const isAttributeMetricSource = (
	sourceType: MetricDefinitionFormValues['sourceType']
): boolean => sourceType === 'ATTRIBUTE';

export const requiresMetricValueField = (
	sourceType: MetricDefinitionFormValues['sourceType'],
	aggregationType: MetricDefinitionFormValues['aggregationType']
): boolean =>
	isAttributeMetricSource(sourceType) && aggregationType !== 'COUNT';

export const parseDefaultFilterJson = (
	defaultFilterJson: string
): Record<string, unknown> | null => {
	return defaultFilterJson.trim()
		? (JSON.parse(defaultFilterJson) as Record<string, unknown>)
		: null;
};

export const toFormValues = (
	metric?: MetricDefinition | null
): MetricDefinitionFormValues => {
	if (!metric) {
		return EMPTY_FORM_VALUES;
	}

	return {
		scope: metric.campaignId ? 'campaign' : 'global',
		campaignId: metric.campaignId ? String(metric.campaignId) : '',
		key: metric.key,
		name: metric.name,
		description: metric.description ?? '',
		sourceType: metric.sourceType,
		aggregationType: metric.aggregationType,
		fieldName: metric.fieldName ?? '',
		metricKey: metric.metricKey ?? '',
		valueField: metric.valueField ?? '',
		resultType: metric.resultType,
		supportsGroupBy: metric.supportsGroupBy,
		supportsTimeSeries: metric.supportsTimeSeries,
		defaultFilterJson: metric.defaultFilter
			? JSON.stringify(metric.defaultFilter, null, 2)
			: '',
	};
};

export const buildMetricDefinitionPayload = (
	values: MetricDefinitionFormValues
): CreateMetricDefinitionDto | UpdateMetricDefinitionDto => {
	const isAttributeSource = isAttributeMetricSource(values.sourceType);
	const requiresValueField = requiresMetricValueField(
		values.sourceType,
		values.aggregationType
	);

	return {
		campaignId: values.scope === 'campaign' ? Number(values.campaignId) : null,
		key: values.key.trim(),
		name: values.name.trim(),
		description: values.description.trim() || undefined,
		sourceType: values.sourceType,
		aggregationType: values.aggregationType,
		fieldName: isAttributeSource ? undefined : values.fieldName.trim(),
		metricKey: isAttributeSource ? values.metricKey.trim() : undefined,
		valueField: requiresValueField
			? (values.valueField as MetricValueField)
			: undefined,
		resultType: values.resultType,
		supportsGroupBy: values.supportsGroupBy,
		supportsTimeSeries: values.supportsTimeSeries,
		defaultFilter: parseDefaultFilterJson(values.defaultFilterJson),
	};
};
