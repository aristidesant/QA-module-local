import type {
	CreateMetricDefinitionDto,
	MetricDefinition,
	MetricValueField,
	UpdateMetricDefinitionDto,
} from '~/models/AnalyticsDashboard';
import { EMPTY_FORM_VALUES } from './MetricDefinitionForm.constants';
import type {
	MetricColumnsConfig,
	MetricDefinitionFormValues,
} from './MetricDefinitionForm.types';

export const isAttributeMetricSource = (
	sourceType: MetricDefinitionFormValues['sourceType']
): boolean => sourceType === 'ATTRIBUTE';

export const isDispositionMetricSource = (
	sourceType: MetricDefinitionFormValues['sourceType']
): boolean => sourceType === 'DISPOSITION';

export const isCampaignDependentSource = (
	sourceType: MetricDefinitionFormValues['sourceType']
): boolean => isAttributeMetricSource(sourceType);

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

const isMetricColumnConfigEntry = (
	value: unknown
): value is MetricColumnsConfig['conversation'][number] => {
	if (!value || typeof value !== 'object') {
		return false;
	}

	const entry = value as Record<string, unknown>;

	return (
		typeof entry.label === 'string' &&
		entry.label.trim().length > 0 &&
		typeof entry.value === 'string' &&
		entry.value.trim().length > 0 &&
		typeof entry.type === 'string' &&
		entry.type.trim().length > 0
	);
};

export const parseMetricColumnsConfig = (
	configValue?: string | null
): MetricColumnsConfig => {
	if (!configValue?.trim()) {
		return {
			disposition: [],
			conversation: [],
		};
	}

	try {
		const parsed = JSON.parse(configValue) as Record<string, unknown>;
		const disposition = Array.isArray(parsed.disposition)
			? parsed.disposition.filter(isMetricColumnConfigEntry)
			: [];
		const conversation = Array.isArray(parsed.conversation)
			? parsed.conversation.filter(isMetricColumnConfigEntry)
			: [];

		return {
			disposition,
			conversation,
		};
	} catch {
		return {
			disposition: [],
			conversation: [],
		};
	}
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
