import type { TFunction } from 'i18next';
import type {
	AnalyticsComparisonMode,
	AnalyticsTimeRange,
	DashboardWidget,
	DashboardWidgetComparisonData,
	DashboardWidgetDataConfig,
	DashboardWidgetDefaultFilter,
	DashboardWidgetFilterValue,
	DashboardWidgetMetricConfig,
	DashboardWidgetPreviewResponse,
	DashboardWidgetQueryConfig,
	DashboardWidgetType,
	DashboardWidgetViewConfig,
	MetricAggregationType,
	MetricResultType,
	MetricSourceType,
	MetricValueField,
	PreviewDashboardWidgetDto,
} from '~/models/AnalyticsDashboard';
import {
	DEFAULT_WIDGET_LAYOUT,
	DEFAULT_WIDGET_SIZE_PRESET,
	type DashboardWidgetSizePreset,
	getWidgetSizePreset,
	normalizeWidgetLayout,
} from '~/modules/campaigns/dashboardLayout';
import type {
	MetricColumnConfigEntry,
	MetricColumnsConfig,
	WidgetCompatibilityState,
	WidgetFilterFormRow,
	WidgetFilterValueType,
	WidgetFormValues,
	WidgetGuidedState,
	WidgetMetricDraft,
	WidgetMetricOption,
	WidgetPreviewModel,
	WidgetPreviewRow,
	WidgetTypeOption,
} from '../DashboardSection.types';
import { formatMetricValue } from '~/modules/campaigns/CampaignDashboardViewer/CampaignDashboardViewer.helpers';

const GROUPED_WIDGET_TYPES: DashboardWidgetType[] = [
	'BAR_CHART',
	'PIE_CHART',
	'DONUT_CHART',
	'TABLE',
];

const TIMESERIES_WIDGET_TYPES: DashboardWidgetType[] = ['LINE_CHART'];

const CONVERSATION_FIELDS_FALLBACK: MetricColumnConfigEntry[] = [
	{ label: 'Conversation ID', value: 'id', type: 'string' },
	{ label: 'Status', value: 'status', type: 'string' },
	{ label: 'Agent ID', value: 'agentId', type: 'string' },
	{ label: 'Campaign ID', value: 'campaignId', type: 'string' },
	{ label: 'Contact ID', value: 'contactId', type: 'string' },
	{ label: 'Created At', value: 'createdAt', type: 'date' },
	{ label: 'Start Date', value: 'startDate', type: 'date' },
	{ label: 'End Date', value: 'endDate', type: 'date' },
	{ label: 'Duration', value: 'duration', type: 'number' },
];

const DISPOSITION_FIELDS_FALLBACK: MetricColumnConfigEntry[] = [
	{ label: 'Disposition Name', value: 'dispositionName', type: 'string' },
	{ label: 'Call Status', value: 'callStatus', type: 'string' },
	{
		label: 'Requires Reschedule',
		value: 'requiresReschedule',
		type: 'boolean',
	},
	{ label: 'Is Voice Mail', value: 'isVoiceMail', type: 'boolean' },
	{ label: 'Do Not Call', value: 'doNotCall', type: 'boolean' },
	{ label: 'Status Contact', value: 'statusContact', type: 'string' },
	{ label: 'Created At', value: 'createdAt', type: 'date' },
];

const ATTRIBUTE_TYPED_GROUP_BY_FIELDS = [
	'value_string',
	'value_number',
	'value_boolean',
	'value_json',
];

const DEFAULT_PREVIEW_ACCENT = '#2f6fed';
export const DEFAULT_PREVIEW_TIME_RANGE: AnalyticsTimeRange = 'WEEK';
export const DEFAULT_PREVIEW_COMPARISON_MODE: AnalyticsComparisonMode =
	'PREVIOUS_PERIOD';

const VALUE_FIELD_RESULT_TYPE: Record<MetricValueField, MetricResultType> = {
	VALUE_STRING: 'STRING',
	VALUE_NUMBER: 'NUMBER',
	VALUE_BOOLEAN: 'BOOLEAN',
	VALUE_JSON: 'STRING',
};

const DEFAULT_SIZE_PRESET_BY_WIDGET: Record<
	DashboardWidgetType,
	DashboardWidgetSizePreset
> = {
	KPI: 'MEDIUM',
	LINE_CHART: 'FULL',
	BAR_CHART: 'LARGE',
	PIE_CHART: 'MEDIUM',
	DONUT_CHART: 'MEDIUM',
	TABLE: 'FULL',
	FUNNEL: 'LARGE',
};

const trimText = (value: string | null | undefined) =>
	typeof value === 'string' ? value.trim() : '';

export const isGroupByDerivedFromSourceField = (values: WidgetFormValues) =>
	supportsGroupedWidget(values.widgetType) && values.sourceType !== 'ATTRIBUTE';

export const getResolvedGroupBy = (values: WidgetFormValues) =>
	isGroupByDerivedFromSourceField(values)
		? trimText(values.fieldName)
		: trimText(values.groupBy);

const toFilterValueType = (
	value: DashboardWidgetFilterValue
): WidgetFilterValueType => {
	if (value === null) return 'null';
	if (typeof value === 'number') return 'number';
	if (typeof value === 'boolean') return 'boolean';
	return 'string';
};

const toFilterValueString = (value: DashboardWidgetFilterValue): string => {
	if (value === null) return '';
	return String(value);
};

const parseFilterValue = (
	row: WidgetFilterFormRow
): DashboardWidgetFilterValue | undefined => {
	if (!trimText(row.key)) {
		return undefined;
	}

	if (row.valueType === 'null') {
		return null;
	}

	if (row.valueType === 'boolean') {
		if (row.value !== 'true' && row.value !== 'false') {
			return undefined;
		}

		return row.value === 'true';
	}

	if (row.valueType === 'number') {
		if (!trimText(row.value)) {
			return undefined;
		}

		const parsedValue = Number(row.value);
		return Number.isFinite(parsedValue) ? parsedValue : undefined;
	}

	return row.value;
};

const getSourceFieldEntries = (
	sourceType: MetricSourceType,
	conversationFields: MetricColumnConfigEntry[],
	dispositionFields: MetricColumnConfigEntry[]
) => {
	if (sourceType === 'CONVERSATION') {
		return conversationFields;
	}

	if (sourceType === 'DISPOSITION') {
		return dispositionFields;
	}

	return [];
};

const getSelectedFieldEntry = (
	values: WidgetFormValues,
	conversationFields: MetricColumnConfigEntry[],
	dispositionFields: MetricColumnConfigEntry[]
) =>
	getSourceFieldEntries(
		values.sourceType,
		conversationFields,
		dispositionFields
	).find((entry) => entry.value === values.fieldName);

const getSampleValue = (resultType: MetricResultType) => {
	switch (resultType) {
		case 'BOOLEAN':
			return true;
		case 'STRING':
			return 'A12';
		case 'TIME':
			return '01:24';
		case 'NUMBER':
		default:
			return 128;
	}
};

const getSampleRows = (t: TFunction): WidgetPreviewRow[] => [
	{
		label: t('dashboardBuilder.form.preview.samples.firstLabel'),
		value: 88,
	},
	{
		label: t('dashboardBuilder.form.preview.samples.secondLabel'),
		value: 64,
	},
	{
		label: t('dashboardBuilder.form.preview.samples.thirdLabel'),
		value: 37,
	},
];

export const isMetricSelectionReady = (values: WidgetFormValues) => {
	if (values.sourceType === 'ATTRIBUTE') {
		if (!trimText(values.metricKey)) {
			return false;
		}

		if (requiresValueField(values.sourceType, values.aggregationType)) {
			return Boolean(values.valueField);
		}

		return true;
	}

	return Boolean(trimText(values.fieldName));
};

const toTitleCase = (value: string) =>
	value
		.replace(/[_-]+/g, ' ')
		.trim()
		.replace(/\b\w/g, (character) => character.toUpperCase());

const getMetricLabel = (
	values: WidgetFormValues,
	metricKeyOptions: WidgetMetricOption[],
	conversationFields: MetricColumnConfigEntry[],
	dispositionFields: MetricColumnConfigEntry[],
	t: TFunction
) => {
	if (values.sourceType === 'ATTRIBUTE') {
		const selectedMetric = metricKeyOptions.find(
			(option) => option.value === values.metricKey
		);

		return selectedMetric?.label ?? trimText(values.metricKey);
	}

	const selectedField = getSelectedFieldEntry(
		values,
		conversationFields,
		dispositionFields
	);

	return (
		selectedField?.label ||
		trimText(values.fieldName) ||
		t(`dashboardBuilder.form.options.sourceType.${values.sourceType}`)
	);
};

const RESULT_TYPE_BY_FIELD_TYPE: Record<string, MetricResultType> = {
	number: 'NUMBER',
	boolean: 'BOOLEAN',
	date: 'TIME',
	datetime: 'TIME',
	time: 'TIME',
	string: 'STRING',
	text: 'STRING',
	url: 'STRING',
};

const getFieldResultType = (
	fieldType: string | undefined
): MetricResultType => {
	if (!fieldType) {
		return 'STRING';
	}

	return RESULT_TYPE_BY_FIELD_TYPE[fieldType.toLowerCase()] ?? 'STRING';
};

export const inferResultType = (
	values: WidgetFormValues,
	conversationFields: MetricColumnConfigEntry[],
	dispositionFields: MetricColumnConfigEntry[]
): MetricResultType => {
	if (
		values.aggregationType === 'COUNT' ||
		values.aggregationType === 'DISTINCT_COUNT'
	) {
		return 'NUMBER';
	}

	if (values.aggregationType === 'SUM' || values.aggregationType === 'AVG') {
		return 'NUMBER';
	}

	if (values.sourceType === 'ATTRIBUTE') {
		if (!values.valueField) {
			return 'STRING';
		}

		return VALUE_FIELD_RESULT_TYPE[values.valueField];
	}

	return getFieldResultType(
		getSelectedFieldEntry(values, conversationFields, dispositionFields)?.type
	);
};

const buildCompatibilityState = (
	values: WidgetFormValues,
	conversationFields: MetricColumnConfigEntry[],
	dispositionFields: MetricColumnConfigEntry[]
): WidgetCompatibilityState => {
	const isGroupedWidget = supportsGroupedWidget(values.widgetType);
	const inferredSupportsTimeSeries = supportsTimeSeriesWidget(
		values.widgetType
	);
	const inferredSupportsGroupBy = isGroupedWidget;

	return {
		isGroupedWidget,
		requiresValueField: requiresValueField(
			values.sourceType,
			values.aggregationType
		),
		inferredResultType: inferResultType(
			values,
			conversationFields,
			dispositionFields
		),
		inferredSupportsGroupBy,
		inferredSupportsTimeSeries,
		compatibilityNoticeKey:
			isGroupedWidget && !values.supportsGroupBy
				? 'dashboardBuilder.form.compatibility.groupByRequired'
				: inferredSupportsTimeSeries && !values.supportsTimeSeries
					? 'dashboardBuilder.form.compatibility.timeSeriesRequired'
					: undefined,
	};
};

const buildPreviewModel = (
	values: WidgetFormValues,
	metricLabel: string,
	sizePreset: DashboardWidgetSizePreset,
	compatibility: WidgetCompatibilityState,
	t: TFunction
): WidgetPreviewModel => {
	const accentColor = trimText(values.viewColor) || DEFAULT_PREVIEW_ACCENT;
	const subtitle = `${t(
		`dashboardBuilder.form.options.aggregationType.${values.aggregationType}`
	)} · ${t(`dashboardBuilder.form.options.sourceType.${values.sourceType}`)}`;
	const title =
		trimText(values.title) || t('dashboardBuilder.form.preview.untitled');
	const resolvedGroupBy = getResolvedGroupBy(values);

	if (!metricLabel.trim()) {
		return {
			kind: 'empty',
			title: t('dashboardBuilder.form.preview.emptyMetricTitle'),
			description: t('dashboardBuilder.form.preview.emptyMetricDescription'),
			sizePreset,
			accentColor,
		};
	}

	if (values.widgetType === 'KPI') {
		return {
			kind: 'kpi',
			title,
			subtitle,
			description: trimText(values.description) || undefined,
			sizePreset,
			accentColor,
			value: getSampleValue(compatibility.inferredResultType),
			comparison: {
				absoluteChange: -75,
				percentageChange: -46,
				trend: 'DOWN',
			},
			comparisonLabel: t('dashboard.comparison.vsPreviousMonth'),
			comparisonDetail: t('dashboard.comparison.previousMonthValue', {
				value: 163,
			}),
		};
	}

	if (!supportsGroupedWidget(values.widgetType)) {
		return {
			kind: 'empty',
			title: t('dashboardBuilder.form.preview.emptyWidgetTitle'),
			description: t('dashboardBuilder.form.preview.emptyWidgetDescription'),
			sizePreset,
			accentColor,
		};
	}

	if (!resolvedGroupBy) {
		return {
			kind: 'empty',
			title: t('dashboardBuilder.form.preview.emptyGroupByTitle'),
			description: t('dashboardBuilder.form.preview.emptyGroupByDescription'),
			sizePreset,
			accentColor,
		};
	}

	const groupedWidgetType = values.widgetType as Extract<
		DashboardWidgetType,
		'BAR_CHART' | 'PIE_CHART' | 'DONUT_CHART' | 'TABLE'
	>;

	return {
		kind: 'grouped',
		title,
		subtitle,
		description: trimText(values.description) || undefined,
		sizePreset,
		accentColor,
		widgetType: groupedWidgetType,
		groupByLabel: resolvedGroupBy,
		rows: getSampleRows(t),
		showLegend: values.viewLegend,
	};
};

const buildPreviewViewConfigPayload = (
	values: WidgetFormValues
): PreviewDashboardWidgetDto['viewConfig'] | null => {
	const payload = {
		...(trimText(values.viewValueFormat)
			? { valueFormat: trimText(values.viewValueFormat) }
			: {}),
		...(supportsGroupedWidget(values.widgetType)
			? { legend: values.viewLegend }
			: {}),
	};

	return Object.keys(payload).length ? payload : null;
};

const getRemoteComparisonValue = (
	comparison?: DashboardWidgetComparisonData
) => {
	if (comparison?.previous?.kind !== 'single_value') {
		return undefined;
	}

	const previewValue = comparison.previous.valueFormat;
	return previewValue === null ||
		previewValue === undefined ||
		previewValue === ''
		? comparison.previous.value
		: previewValue;
};

export const hasInvalidDefaultFilterRows = (rows: WidgetFilterFormRow[]) =>
	rows.some((row) => {
		const hasAnyValue = trimText(row.key) || trimText(row.value);
		if (!hasAnyValue) {
			return false;
		}

		if (!trimText(row.key)) {
			return true;
		}

		return parseFilterValue(row) === undefined;
	});

export const createEmptyFilterRow = (): WidgetFilterFormRow => ({
	id: crypto.randomUUID(),
	key: null,
	value: null,
	valueType: null,
});

export const supportsGroupedWidget = (widgetType: DashboardWidgetType) =>
	GROUPED_WIDGET_TYPES.includes(widgetType);

export const supportsTimeSeriesWidget = (widgetType: DashboardWidgetType) =>
	TIMESERIES_WIDGET_TYPES.includes(widgetType);

export const requiresValueField = (
	sourceType: MetricSourceType,
	aggregationType: MetricAggregationType
) => sourceType === 'ATTRIBUTE' && aggregationType !== 'COUNT';

export const parseMetricColumnsConfig = (
	configValue?: string | null
): MetricColumnsConfig => {
	if (!configValue?.trim()) {
		return {
			conversation: CONVERSATION_FIELDS_FALLBACK,
			disposition: DISPOSITION_FIELDS_FALLBACK,
		};
	}

	try {
		const parsed = JSON.parse(configValue) as Record<string, unknown>;
		const disposition = Array.isArray(parsed.disposition)
			? (parsed.disposition as MetricColumnConfigEntry[])
			: DISPOSITION_FIELDS_FALLBACK;
		const conversation = Array.isArray(parsed.conversation)
			? (parsed.conversation as MetricColumnConfigEntry[])
			: CONVERSATION_FIELDS_FALLBACK;

		return {
			disposition: disposition.filter(
				(entry) =>
					typeof entry?.label === 'string' && typeof entry?.value === 'string'
			),
			conversation: conversation.filter(
				(entry) =>
					typeof entry?.label === 'string' && typeof entry?.value === 'string'
			),
		};
	} catch {
		return {
			conversation: CONVERSATION_FIELDS_FALLBACK,
			disposition: DISPOSITION_FIELDS_FALLBACK,
		};
	}
};

export const getMetricSourceOptions = (
	t: TFunction,
	isGlobalDashboard: boolean
) =>
	[
		{
			value: 'CONVERSATION',
			label: t('dashboardBuilder.form.options.sourceType.CONVERSATION'),
		},
		{
			value: 'ATTRIBUTE',
			label: t('dashboardBuilder.form.options.sourceType.ATTRIBUTE'),
			disabled: isGlobalDashboard,
		},
		{
			value: 'DISPOSITION',
			label: t('dashboardBuilder.form.options.sourceType.DISPOSITION'),
		},
	] satisfies Array<{
		value: MetricSourceType;
		label: string;
		disabled?: boolean;
	}>;

export const getAggregationOptions = (t: TFunction) =>
	['COUNT', 'SUM', 'AVG', 'MIN', 'MAX', 'DISTINCT_COUNT'].map((value) => ({
		value,
		label: t(`dashboardBuilder.form.options.aggregationType.${value}`),
	}));

export const getResultTypeOptions = (t: TFunction) =>
	[
		{ value: '', label: t('dashboardBuilder.form.options.resultType.EMPTY') },
		{
			value: 'NUMBER',
			label: t('dashboardBuilder.form.options.resultType.NUMBER'),
		},
		{
			value: 'BOOLEAN',
			label: t('dashboardBuilder.form.options.resultType.BOOLEAN'),
		},
		{
			value: 'STRING',
			label: t('dashboardBuilder.form.options.resultType.STRING'),
		},
		{
			value: 'TIME',
			label: t('dashboardBuilder.form.options.resultType.TIME'),
		},
	].map((option) => option);

export const getValueFieldOptions = (t: TFunction) =>
	['VALUE_STRING', 'VALUE_NUMBER', 'VALUE_BOOLEAN', 'VALUE_JSON'].map(
		(value) => ({
			value,
			label: t(`dashboardBuilder.form.options.valueField.${value}`),
		})
	);

export const getFilterValueTypeOptions = (t: TFunction) =>
	(['string', 'number', 'boolean', 'null'] as const).map((value) => ({
		value,
		label: t(`dashboardBuilder.form.options.filterValueType.${value}`),
	}));

export const getViewValueFormatOptions = (t: TFunction) =>
	[
		{
			value: '',
			label: t('dashboardBuilder.form.placeholders.viewValueFormat'),
		},
		{
			value: 'compact',
			label: t('dashboardBuilder.form.options.valueFormat.compact'),
		},
		{
			value: 'standard',
			label: t('dashboardBuilder.form.options.valueFormat.standard'),
		},
	].map((option) => ({
		...option,
		disabled: option.value === '',
	}));

export const getWidgetTypeOptions = (t: TFunction): WidgetTypeOption[] => [
	{
		value: 'KPI',
		label: t('dashboardBuilder.widgetTypes.KPI'),
		description: t('dashboardBuilder.form.widgetTypeDescriptions.KPI'),
	},
	{
		value: 'LINE_CHART',
		label: `${t('dashboardBuilder.widgetTypes.LINE_CHART')} · ${t('dashboardBuilder.form.comingSoon')}`,
		description: t('dashboardBuilder.form.widgetTypeDescriptions.LINE_CHART'),
		disabled: true,
	},
	{
		value: 'BAR_CHART',
		label: t('dashboardBuilder.widgetTypes.BAR_CHART'),
		description: t('dashboardBuilder.form.widgetTypeDescriptions.BAR_CHART'),
	},
	{
		value: 'PIE_CHART',
		label: t('dashboardBuilder.widgetTypes.PIE_CHART'),
		description: t('dashboardBuilder.form.widgetTypeDescriptions.PIE_CHART'),
	},
	{
		value: 'DONUT_CHART',
		label: t('dashboardBuilder.widgetTypes.DONUT_CHART'),
		description: t('dashboardBuilder.form.widgetTypeDescriptions.DONUT_CHART'),
	},
	{
		value: 'TABLE',
		label: t('dashboardBuilder.widgetTypes.TABLE'),
		description: t('dashboardBuilder.form.widgetTypeDescriptions.TABLE'),
	},
	{
		value: 'FUNNEL',
		label: `${t('dashboardBuilder.widgetTypes.FUNNEL')} · ${t('dashboardBuilder.form.comingSoon')}`,
		description: t('dashboardBuilder.form.widgetTypeDescriptions.FUNNEL'),
		disabled: true,
	},
];

export const getSizePresetOptions = (
	t: TFunction,
	currentPreset: DashboardWidgetSizePreset
) =>
	(['SMALL', 'MEDIUM', 'LARGE', 'FULL', 'CUSTOM'] as const).map((value) => ({
		value,
		label: t(`dashboardBuilder.form.sizePresets.${value}`),
		disabled: value === 'CUSTOM' && currentPreset !== 'CUSTOM',
	}));

export const buildFieldOptions = (entries: MetricColumnConfigEntry[]) =>
	entries.map((entry) => ({
		value: entry.value,
		label: `${entry.label} (${entry.value})`,
	}));

export const buildGroupBySuggestions = (
	metric: WidgetMetricDraft,
	attributeMetricKeys: string[],
	conversationFields: string[],
	dispositionFields: string[]
) => {
	if (metric.sourceType === 'CONVERSATION') {
		return conversationFields;
	}

	if (metric.sourceType === 'DISPOSITION') {
		return dispositionFields;
	}

	return [...ATTRIBUTE_TYPED_GROUP_BY_FIELDS, ...attributeMetricKeys];
};

export const getFilterKeySuggestions = (
	values: WidgetFormValues,
	metricKeyOptions: WidgetMetricOption[],
	conversationFields: MetricColumnConfigEntry[],
	dispositionFields: MetricColumnConfigEntry[]
) => {
	if (values.sourceType === 'ATTRIBUTE') {
		return [
			...ATTRIBUTE_TYPED_GROUP_BY_FIELDS,
			...metricKeyOptions.map((option) => option.value),
		];
	}

	return getSourceFieldEntries(
		values.sourceType,
		conversationFields,
		dispositionFields
	).map((entry) => entry.value);
};

export const inferFilterValueType = (
	values: WidgetFormValues,
	filterKey: string,
	metricKeyOptions: WidgetMetricOption[],
	conversationFields: MetricColumnConfigEntry[],
	dispositionFields: MetricColumnConfigEntry[]
): WidgetFilterValueType | null => {
	if (!filterKey.trim()) {
		return null;
	}

	if (values.sourceType === 'ATTRIBUTE') {
		if (filterKey === 'value_number') return 'number';
		if (filterKey === 'value_boolean') return 'boolean';
		if (filterKey === 'value_json' || filterKey === 'value_string') {
			return 'string';
		}

		if (metricKeyOptions.some((option) => option.value === filterKey)) {
			return 'string';
		}

		return null;
	}

	const selectedEntry = getSourceFieldEntries(
		values.sourceType,
		conversationFields,
		dispositionFields
	).find((entry) => entry.value === filterKey);

	if (!selectedEntry) {
		return null;
	}

	if (selectedEntry.type === 'number') return 'number';
	if (selectedEntry.type === 'boolean') return 'boolean';
	return 'string';
};

export const getDefaultWidgetSizePreset = (
	widgetType: DashboardWidgetType
): DashboardWidgetSizePreset => DEFAULT_SIZE_PRESET_BY_WIDGET[widgetType];

export const getInitialSizePreset = (
	widget?: DashboardWidget | null
): DashboardWidgetSizePreset => {
	if (!widget) {
		return DEFAULT_WIDGET_SIZE_PRESET;
	}

	return getWidgetSizePreset(widget.width, widget.height);
};

export const buildTitleSuggestion = (
	values: WidgetFormValues,
	metricKeyOptions: WidgetMetricOption[],
	conversationFields: MetricColumnConfigEntry[],
	dispositionFields: MetricColumnConfigEntry[],
	t: TFunction
) => {
	const aggregationLabel = t(
		`dashboardBuilder.form.options.aggregationType.${values.aggregationType}`
	);
	const sourceLabel = t(
		`dashboardBuilder.form.options.sourceType.${values.sourceType}`
	);
	const metricLabel =
		getMetricLabel(
			values,
			metricKeyOptions,
			conversationFields,
			dispositionFields,
			t
		) || sourceLabel;
	const resolvedGroupBy = getResolvedGroupBy(values);

	const baseMetric =
		values.aggregationType === 'COUNT'
			? t('dashboardBuilder.form.titleTemplates.countSource', {
					source: metricLabel,
				})
			: t('dashboardBuilder.form.titleTemplates.aggregatedMetric', {
					aggregation: aggregationLabel,
					metric: metricLabel,
				});

	if (supportsGroupedWidget(values.widgetType) && resolvedGroupBy) {
		return t('dashboardBuilder.form.titleTemplates.grouped', {
			metric: baseMetric,
			groupBy: toTitleCase(resolvedGroupBy),
		});
	}

	return baseMetric;
};

export const buildGuidedState = (
	values: WidgetFormValues,
	options: {
		metricKeyOptions: WidgetMetricOption[];
		conversationFields: MetricColumnConfigEntry[];
		dispositionFields: MetricColumnConfigEntry[];
		sizePreset: DashboardWidgetSizePreset;
		isGlobalDashboard: boolean;
		t: TFunction;
	}
): WidgetGuidedState => {
	const metricLabel = getMetricLabel(
		values,
		options.metricKeyOptions,
		options.conversationFields,
		options.dispositionFields,
		options.t
	);
	const sourceLabel = options.t(
		`dashboardBuilder.form.options.sourceType.${values.sourceType}`
	);
	const aggregationLabel = options.t(
		`dashboardBuilder.form.options.aggregationType.${values.aggregationType}`
	);
	const compatibility = buildCompatibilityState(
		values,
		options.conversationFields,
		options.dispositionFields
	);

	return {
		titleSuggestion: buildTitleSuggestion(
			values,
			options.metricKeyOptions,
			options.conversationFields,
			options.dispositionFields,
			options.t
		),
		metricLabel,
		sourceLabel,
		aggregationLabel,
		compatibility,
		preview: buildPreviewModel(
			values,
			metricLabel,
			options.sizePreset,
			compatibility,
			options.t
		),
		filterKeySuggestions: getFilterKeySuggestions(
			values,
			options.metricKeyOptions,
			options.conversationFields,
			options.dispositionFields
		),
	};
};

export const isWidgetPreviewReady = (values: WidgetFormValues) => {
	if (!isMetricSelectionReady(values)) {
		return false;
	}

	if (hasInvalidDefaultFilterRows(values.defaultFilters)) {
		return false;
	}

	if (supportsGroupedWidget(values.widgetType) && !getResolvedGroupBy(values)) {
		return false;
	}

	return true;
};

export const buildPreviewRequestPayload = (
	values: WidgetFormValues,
	campaignId: number | null
): PreviewDashboardWidgetDto | null => {
	if (!isWidgetPreviewReady(values)) {
		return null;
	}

	const viewConfig = buildPreviewViewConfigPayload(values);

	return {
		...(campaignId == null ? {} : { campaignId }),
		widgetType: values.widgetType,
		dataConfig: {
			metric: buildMetricPayload(values),
			query: buildQueryPayload(values) ?? undefined,
		},
		...(viewConfig ? { viewConfig } : {}),
		timeRange: DEFAULT_PREVIEW_TIME_RANGE,
		comparisonMode: DEFAULT_PREVIEW_COMPARISON_MODE,
	};
};

export const buildPreviewModelFromResponse = (
	response: DashboardWidgetPreviewResponse,
	fallbackPreview: WidgetPreviewModel,
	t: TFunction
): WidgetPreviewModel => {
	const widget =
		'widget' in response && response.widget
			? response.widget
			: (response as never);
	const comparison =
		'comparison' in response && response.comparison
			? response.comparison
			: undefined;

	if (!widget || typeof widget !== 'object' || !('status' in widget)) {
		return {
			kind: 'empty',
			title: fallbackPreview.title,
			description: t('dashboardBuilder.form.preview.requestError'),
			sizePreset: fallbackPreview.sizePreset,
			accentColor: fallbackPreview.accentColor,
		};
	}

	if (widget.status !== 'SUCCESS' || !widget.result) {
		return {
			kind: 'empty',
			title:
				fallbackPreview.kind === 'empty'
					? fallbackPreview.title
					: fallbackPreview.title,
			description:
				widget.message || t('dashboardBuilder.form.preview.requestError'),
			sizePreset: fallbackPreview.sizePreset,
			accentColor: fallbackPreview.accentColor,
		};
	}

	if (widget.result.kind === 'single_value') {
		if (widget.widgetType !== 'KPI') {
			return fallbackPreview;
		}

		const resultValue =
			widget.result.valueFormat === null ||
			widget.result.valueFormat === undefined ||
			widget.result.valueFormat === ''
				? widget.result.value
				: widget.result.valueFormat;
		const previousValue = getRemoteComparisonValue(comparison);

		return {
			kind: 'kpi',
			title:
				fallbackPreview.kind === 'empty' ? widget.title : fallbackPreview.title,
			subtitle:
				fallbackPreview.kind === 'kpi' || fallbackPreview.kind === 'grouped'
					? fallbackPreview.subtitle
					: undefined,
			description:
				fallbackPreview.kind === 'kpi' || fallbackPreview.kind === 'grouped'
					? fallbackPreview.description
					: undefined,
			sizePreset: fallbackPreview.sizePreset,
			accentColor: fallbackPreview.accentColor,
			value: resultValue,
			comparison: comparison?.comparison,
			comparisonLabel: t('dashboard.comparison.vsPreviousWeek'),
			comparisonDetail:
				previousValue === undefined
					? undefined
					: t('dashboard.comparison.previousWeekValue', {
							value: formatMetricValue(previousValue),
						}),
		};
	}

	if (!supportsGroupedWidget(widget.widgetType)) {
		return fallbackPreview;
	}

	if (fallbackPreview.kind !== 'grouped' && fallbackPreview.kind !== 'empty') {
		return fallbackPreview;
	}

	const groupedWidgetType =
		fallbackPreview.kind === 'grouped'
			? fallbackPreview.widgetType
			: widget.widgetType === 'TABLE' ||
				  widget.widgetType === 'BAR_CHART' ||
				  widget.widgetType === 'PIE_CHART' ||
				  widget.widgetType === 'DONUT_CHART'
				? widget.widgetType
				: 'BAR_CHART';

	if (import.meta.env.DEV) {
		console.groupCollapsed('[Dashboard preview] grouped rows', {
			widgetId: widget.widgetId,
			widgetType: widget.widgetType,
			sourceType: widget.result.meta.sourceType,
			aggregationType: widget.result.meta.aggregationType,
			groupBy: widget.result.meta.groupBy,
		});
		widget.result.rows.forEach((row, index) => {
			console.log(`[row ${index}]`, {
				label: row.label,
				value: row.value,
				valueType: typeof row.value,
			});
		});
		console.groupEnd();
	}

	return {
		kind: 'grouped',
		title:
			fallbackPreview.kind === 'grouped' ? fallbackPreview.title : widget.title,
		subtitle:
			fallbackPreview.kind === 'grouped' ? fallbackPreview.subtitle : undefined,
		description:
			fallbackPreview.kind === 'grouped'
				? fallbackPreview.description
				: undefined,
		sizePreset: fallbackPreview.sizePreset,
		accentColor: fallbackPreview.accentColor,
		widgetType: groupedWidgetType,
		groupByLabel: widget.result.meta.groupBy,
		rows: widget.result.rows.map((row) => ({
			label: row.label,
			value: row.value,
		})),
		showLegend:
			fallbackPreview.kind === 'grouped' ? fallbackPreview.showLegend : true,
	};
};

export const buildDefaultFilter = (
	rows: WidgetFilterFormRow[]
): DashboardWidgetDefaultFilter | null => {
	const entries = rows.reduce<Array<[string, DashboardWidgetFilterValue]>>(
		(acc, row) => {
			const trimmedKey = trimText(row.key);
			const parsedValue = parseFilterValue(row);

			if (!trimmedKey || parsedValue === undefined) {
				return acc;
			}

			acc.push([trimmedKey, parsedValue]);
			return acc;
		},
		[]
	);

	return entries.length ? Object.fromEntries(entries) : null;
};

export const buildMetricPayload = (
	values: WidgetFormValues,
	options: {
		conversationFields?: MetricColumnConfigEntry[];
		dispositionFields?: MetricColumnConfigEntry[];
	} = {}
): DashboardWidgetMetricConfig => ({
	sourceType: values.sourceType,
	aggregationType: values.aggregationType,
	fieldName:
		values.sourceType === 'ATTRIBUTE' ? undefined : trimText(values.fieldName),
	metricKey:
		values.sourceType === 'ATTRIBUTE' ? trimText(values.metricKey) : undefined,
	valueField: requiresValueField(values.sourceType, values.aggregationType)
		? (values.valueField ?? undefined)
		: undefined,
	defaultFilter: buildDefaultFilter(values.defaultFilters),
	supportsGroupBy: values.supportsGroupBy,
	supportsTimeSeries: values.supportsTimeSeries,
	resultType:
		values.resultType ??
		inferResultType(
			values,
			options.conversationFields ?? [],
			options.dispositionFields ?? []
		),
});

export const buildQueryPayload = (
	values: WidgetFormValues
): DashboardWidgetQueryConfig | null => {
	if (!supportsGroupedWidget(values.widgetType)) {
		return null;
	}

	return {
		groupBy: getResolvedGroupBy(values),
		...(values.limit === '' ? {} : { limit: values.limit }),
	};
};

export const buildViewConfigPayload = (
	values: WidgetFormValues
): DashboardWidgetViewConfig | null => {
	const payload: DashboardWidgetViewConfig = {
		...(trimText(values.viewColor)
			? { color: trimText(values.viewColor) }
			: {}),
		...(trimText(values.viewValueFormat)
			? { valueFormat: trimText(values.viewValueFormat) }
			: {}),
		...(supportsGroupedWidget(values.widgetType)
			? { legend: values.viewLegend }
			: {}),
	};

	return Object.keys(payload).length ? payload : null;
};

const mapDefaultFilters = (
	defaultFilter?: DashboardWidgetDefaultFilter | null
): WidgetFilterFormRow[] => {
	if (!defaultFilter) {
		return [createEmptyFilterRow()];
	}

	const rows = Object.entries(defaultFilter).map(([key, value]) => ({
		id: crypto.randomUUID(),
		key,
		value: toFilterValueString(value),
		valueType: toFilterValueType(value),
	}));

	return rows.length ? rows : [createEmptyFilterRow()];
};

export const widgetFormValues = (
	widget?: DashboardWidget | null
): WidgetFormValues => {
	const normalizedLayout = normalizeWidgetLayout({
		positionX: widget?.positionX ?? DEFAULT_WIDGET_LAYOUT.positionX,
		positionY: widget?.positionY ?? DEFAULT_WIDGET_LAYOUT.positionY,
		width: widget?.width ?? DEFAULT_WIDGET_LAYOUT.width,
		height: widget?.height ?? DEFAULT_WIDGET_LAYOUT.height,
	});
	const dataConfig: DashboardWidgetDataConfig | undefined = widget?.dataConfig;
	const metric = dataConfig?.metric;
	const query = dataConfig?.query;
	const viewConfig = widget?.viewConfig;

	return {
		widgetType: widget?.widgetType ?? 'KPI',
		title: widget?.title ?? '',
		description: widget?.description ?? '',
		sourceType: metric?.sourceType ?? 'CONVERSATION',
		aggregationType: metric?.aggregationType ?? 'COUNT',
		fieldName: metric?.fieldName ?? null,
		metricKey: metric?.metricKey ?? null,
		valueField: metric?.valueField ?? null,
		resultType: metric?.resultType ?? null,
		supportsGroupBy: metric?.supportsGroupBy ?? false,
		supportsTimeSeries: metric?.supportsTimeSeries ?? true,
		groupBy:
			metric?.sourceType === 'ATTRIBUTE'
				? (query?.groupBy ?? null)
				: (metric?.fieldName ?? query?.groupBy ?? null),
		limit: typeof query?.limit === 'number' ? query.limit : '',
		viewColor: typeof viewConfig?.color === 'string' ? viewConfig.color : '',
		viewValueFormat:
			typeof viewConfig?.valueFormat === 'string'
				? viewConfig.valueFormat
				: null,
		viewLegend:
			typeof viewConfig?.legend === 'boolean' ? viewConfig.legend : true,
		width: normalizedLayout.width,
		height: normalizedLayout.height,
		enabled: widget?.enabled ?? true,
		defaultFilters: mapDefaultFilters(metric?.defaultFilter),
	};
};
