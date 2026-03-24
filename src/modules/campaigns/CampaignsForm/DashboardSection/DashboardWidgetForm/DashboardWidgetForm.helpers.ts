import type { TFunction } from 'i18next';
import type {
	AnalyticsComparisonMode,
	AnalyticsTimeRange,
	DashboardWidget,
	DashboardWidgetDataConfig,
	DashboardWidgetDefaultFilter,
	DashboardWidgetFilterValue,
	DashboardWidgetJoinConfig,
	DashboardWidgetJoinRelation,
	DashboardWidgetJoinType,
	DashboardWidgetMetricConfig,
	DashboardWidgetPreviewResponse,
	DashboardWidgetQueryConfig,
	DashboardWidgetType,
	DashboardWidgetVisibilityScope,
	DashboardWidgetViewConfig,
	MetricAggregationType,
	MetricResultType,
	MetricSourceType,
	MetricValueField,
	RuntimeFilter,
	RuntimeFilterOperator,
	PreviewDashboardWidgetDto,
	TimeSeriesPoint,
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
	WidgetRuntimeFilterFormRow,
	WidgetRuntimeFilterValue,
	WidgetTypeOption,
} from '../DashboardSection.types';
import { buildWidgetComparisonCopy } from '~/modules/campaigns/CampaignDashboardViewer/CampaignDashboardViewer.helpers';

const GROUPED_WIDGET_TYPES: DashboardWidgetType[] = [
	'BAR_CHART',
	'PIE_CHART',
	'DONUT_CHART',
	'TABLE',
];

const TIMESERIES_WIDGET_TYPES: DashboardWidgetType[] = ['LINE_CHART'];

const COMPARE_WITH_WIDGET_TYPES: DashboardWidgetType[] = ['KPI', 'LINE_CHART'];

const CONVERSATION_FIELDS_FALLBACK: MetricColumnConfigEntry[] = [
	{ label: 'Conversation ID', value: 'id', type: 'string' },
	{ label: 'Status', value: 'status', type: 'string' },
	{ label: 'Agent ID', value: 'agentId', type: 'string' },
	{ label: 'Campaign ID', value: 'campaignId', type: 'string' },
	{ label: 'Contact ID', value: 'contactId', type: 'string' },
	{ label: 'Created At', value: 'createdAt', type: 'date' },
	{ label: 'Start Date', value: 'startDate', type: 'date' },
	{ label: 'End Date', value: 'endDate', type: 'date' },
	{ label: 'Duration', value: 'duration', type: 'time' },
];

const DISPOSITION_FIELDS_FALLBACK: MetricColumnConfigEntry[] = [
	{ label: 'Outcome Name', value: 'dispositionName', type: 'string' },
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

const ATTRIBUTE_DEFAULT_FILTER_FIELDS = [
	...ATTRIBUTE_TYPED_GROUP_BY_FIELDS,
	'createdAt',
];

const ATTRIBUTE_RUNTIME_FILTER_FIELDS = [
	'metricKey',
	'valueString',
	'valueNumber',
	'valueBoolean',
	'valueJson',
	'createdAt',
];

const ATTRIBUTE_RUNTIME_FILTER_FIELD_OPTIONS: WidgetMetricOption[] = [
	...ATTRIBUTE_RUNTIME_FILTER_FIELDS,
].map((value) => ({
	value,
	label: value
		.replace(/([a-z0-9])([A-Z])/g, '$1 $2')
		.replace(/[_-]+/g, ' ')
		.trim()
		.replace(/\b\w/g, (character) => character.toUpperCase()),
}));

const FILTER_FIELD_ALIASES: Record<MetricSourceType, Record<string, string>> = {
	CONVERSATION: {
		agent_id: 'agentId',
		campaign_id: 'campaignId',
		contact_id: 'contactId',
		created_at: 'createdAt',
		end_date: 'endDate',
		start_date: 'startDate',
	},
	ATTRIBUTE: {
		created_at: 'createdAt',
		metric_key: 'metricKey',
		value_boolean: 'valueBoolean',
		value_json: 'valueJson',
		value_number: 'valueNumber',
		value_string: 'valueString',
	},
	DISPOSITION: {
		call_status: 'callStatus',
		created_at: 'createdAt',
		disposition_name: 'dispositionName',
		do_not_call: 'doNotCall',
		is_voice_mail: 'isVoiceMail',
		requires_reschedule: 'requiresReschedule',
		status_contact: 'statusContact',
	},
};

const RUNTIME_FILTER_FIELD_TYPES = {
	number: 'number',
	boolean: 'boolean',
	string: 'string',
} as const;

type RuntimeFilterFieldType =
	(typeof RUNTIME_FILTER_FIELD_TYPES)[keyof typeof RUNTIME_FILTER_FIELD_TYPES];

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
};

const trimText = (value: string | null | undefined) =>
	typeof value === 'string' ? value.trim() : '';

const SUPPORTED_JOIN_RELATIONS = new Set<DashboardWidgetJoinRelation>([
	'campaign',
]);

const SUPPORTED_JOIN_TYPES = new Set<DashboardWidgetJoinType>([
	'inner',
	'left',
]);

const isSupportedJoinRelation = (
	value: unknown
): value is DashboardWidgetJoinRelation =>
	typeof value === 'string' &&
	SUPPORTED_JOIN_RELATIONS.has(value as DashboardWidgetJoinRelation);

const isSupportedJoinType = (
	value: unknown
): value is DashboardWidgetJoinType =>
	typeof value === 'string' &&
	SUPPORTED_JOIN_TYPES.has(value as DashboardWidgetJoinType);

const normalizeMetricColumnJoin = (
	value: unknown
): DashboardWidgetJoinConfig | null => {
	if (!value || typeof value !== 'object') {
		return null;
	}

	const record = value as Record<string, unknown>;

	if (
		!isSupportedJoinRelation(record.relation) ||
		!isSupportedJoinType(record.type)
	) {
		return null;
	}

	return {
		relation: record.relation,
		type: record.type,
	};
};

const normalizeMetricColumnOptions = (value: unknown): string[] | null => {
	if (!Array.isArray(value)) {
		return null;
	}

	const normalizedOptions = [
		...new Set(
			value
				.map((item) => (typeof item === 'string' ? item.trim() : ''))
				.filter((item) => item.length > 0)
		),
	];

	return normalizedOptions.length ? normalizedOptions : null;
};

export const resetWidgetFilterRow = (
	row: WidgetFilterFormRow
): WidgetFilterFormRow => ({
	...row,
	key: null,
	value: null,
	valueType: null,
});

export const getWidgetActiveSourceField = (
	values: Pick<WidgetFormValues, 'sourceType' | 'fieldName' | 'metricKey'>
) => (values.sourceType === 'ATTRIBUTE' ? values.metricKey : values.fieldName);

export const normalizeWidgetFilterValueForType = (
	valueType: WidgetFilterFormRow['valueType'],
	value: string | null
) => {
	if (valueType === 'boolean') {
		return value === 'true' || value === 'false' ? value : 'true';
	}

	if (valueType === 'number') {
		return value && value.trim() && Number.isFinite(Number(value)) ? value : '';
	}

	if (valueType === 'null') {
		return '';
	}

	return value;
};

export const sanitizeWidgetDefaultFilters = (
	nextValues: WidgetFormValues,
	metricKeyOptions: WidgetMetricOption[],
	conversationFields: MetricColumnConfigEntry[],
	dispositionFields: MetricColumnConfigEntry[]
): WidgetFilterFormRow[] => {
	const allowedFilterKeys = new Set(
		getFilterKeySuggestions(
			nextValues,
			metricKeyOptions,
			conversationFields,
			dispositionFields
		)
	);

	return nextValues.defaultFilters.map((row) => {
		const trimmedKey = typeof row.key === 'string' ? row.key.trim() : '';
		const normalizedKey = normalizeFilterKey(
			nextValues.sourceType,
			trimmedKey,
			metricKeyOptions
		);

		if (!trimmedKey) {
			return row.value || row.valueType !== 'string'
				? resetWidgetFilterRow(row)
				: row;
		}

		if (!allowedFilterKeys.has(normalizedKey)) {
			return resetWidgetFilterRow(row);
		}

		const inferredValueType = inferFilterValueType(
			nextValues,
			normalizedKey,
			metricKeyOptions,
			conversationFields,
			dispositionFields
		);

		if (!inferredValueType || row.valueType === inferredValueType) {
			return {
				...row,
				key: normalizedKey,
			};
		}

		return {
			...row,
			key: normalizedKey,
			valueType: inferredValueType,
			value: normalizeWidgetFilterValueForType(inferredValueType, row.value),
		};
	});
};

const normalizeFilterKey = (
	sourceType: MetricSourceType,
	key: string,
	metricKeyOptions: WidgetMetricOption[]
) => {
	const trimmedKey = trimText(key);

	if (!trimmedKey) {
		return '';
	}

	const normalizedKey =
		FILTER_FIELD_ALIASES[sourceType][trimmedKey] ?? trimmedKey;

	if (
		sourceType === 'ATTRIBUTE' &&
		metricKeyOptions.some((option) => option.value === normalizedKey)
	) {
		return normalizedKey;
	}

	return normalizedKey;
};

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

export const getSourceFieldEntries = (
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

const getFilterFieldType = (
	values: Pick<WidgetFormValues, 'sourceType'>,
	filterKey: string,
	metricKeyOptions: WidgetMetricOption[],
	conversationFields: MetricColumnConfigEntry[],
	dispositionFields: MetricColumnConfigEntry[]
): RuntimeFilterFieldType | null => {
	if (!filterKey.trim()) {
		return null;
	}

	if (values.sourceType === 'ATTRIBUTE') {
		if (
			filterKey === 'metricKey' ||
			metricKeyOptions.some((option) => option.value === filterKey) ||
			filterKey === 'valueString' ||
			filterKey === 'valueJson' ||
			filterKey === 'createdAt'
		) {
			return RUNTIME_FILTER_FIELD_TYPES.string;
		}

		if (filterKey === 'valueNumber') {
			return RUNTIME_FILTER_FIELD_TYPES.number;
		}

		if (filterKey === 'valueBoolean') {
			return RUNTIME_FILTER_FIELD_TYPES.boolean;
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

	if (selectedEntry.type === 'number' || selectedEntry.type === 'time') {
		return RUNTIME_FILTER_FIELD_TYPES.number;
	}

	if (selectedEntry.type === 'boolean') {
		return RUNTIME_FILTER_FIELD_TYPES.boolean;
	}

	return RUNTIME_FILTER_FIELD_TYPES.string;
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
	integer: 'NUMBER',
	int: 'NUMBER',
	float: 'NUMBER',
	decimal: 'NUMBER',
	bigint: 'NUMBER',
	boolean: 'BOOLEAN',
	bool: 'BOOLEAN',
	date: 'TIME',
	datetime: 'TIME',
	timestamp: 'TIME',
	time: 'TIME',
	string: 'STRING',
	text: 'STRING',
	varchar: 'STRING',
	char: 'STRING',
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
	if (values.aggregationType === 'COUNT') {
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
		const comparisonCopy = buildWidgetComparisonCopy(
			values.compareWith,
			DEFAULT_PREVIEW_TIME_RANGE,
			163,
			t
		);

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
			comparisonLabel: comparisonCopy.label,
			comparisonDetail: comparisonCopy.detail,
		};
	}

	if (supportsTimeSeriesWidget(values.widgetType)) {
		const comparisonCopy = buildWidgetComparisonCopy(
			values.compareWith,
			DEFAULT_PREVIEW_TIME_RANGE,
			undefined,
			t
		);

		return {
			kind: 'line_chart',
			title,
			subtitle,
			description: trimText(values.description) || undefined,
			sizePreset,
			accentColor,
			points: [] as TimeSeriesPoint[],
			comparisonLabel: comparisonCopy.label,
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

export const supportsCompareWithWidget = (widgetType: DashboardWidgetType) =>
	COMPARE_WITH_WIDGET_TYPES.includes(widgetType);

export const requiresValueField = (
	sourceType: MetricSourceType,
	aggregationType: MetricAggregationType
) => sourceType === 'ATTRIBUTE' && aggregationType !== 'COUNT';

const normalizeMetricColumnEntry = (
	entry: unknown
): MetricColumnConfigEntry | null => {
	if (!entry || typeof entry !== 'object') {
		return null;
	}

	const record = entry as Record<string, unknown>;
	const label = record.label;
	const value = record.value;
	const type = record.type;

	if (
		typeof label !== 'string' ||
		typeof value !== 'string' ||
		typeof type !== 'string'
	) {
		return null;
	}

	const normalizedEntry: MetricColumnConfigEntry = {
		label,
		value,
		type,
	};
	const join = normalizeMetricColumnJoin(record.join);
	const options = normalizeMetricColumnOptions(record.options);

	if (join) {
		normalizedEntry.join = join;
	}

	if (options) {
		normalizedEntry.options = options;
	}

	return normalizedEntry;
};

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
			? parsed.disposition
					.map(normalizeMetricColumnEntry)
					.filter((entry): entry is MetricColumnConfigEntry => entry !== null)
			: DISPOSITION_FIELDS_FALLBACK;
		const conversation = Array.isArray(parsed.conversation)
			? parsed.conversation
					.map(normalizeMetricColumnEntry)
					.filter((entry): entry is MetricColumnConfigEntry => entry !== null)
			: CONVERSATION_FIELDS_FALLBACK;

		return {
			disposition: disposition.filter(
				(entry) =>
					typeof entry?.label === 'string' &&
					typeof entry?.value === 'string' &&
					typeof entry?.type === 'string'
			),
			conversation: conversation.filter(
				(entry) =>
					typeof entry?.label === 'string' &&
					typeof entry?.value === 'string' &&
					typeof entry?.type === 'string'
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
	['COUNT', 'SUM', 'AVG', 'MIN', 'MAX'].map((value) => ({
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
		label: t('dashboardBuilder.widgetTypes.LINE_CHART'),
		description: t('dashboardBuilder.form.widgetTypeDescriptions.LINE_CHART'),
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

export const getVisibilityScopeOptions = (t: TFunction) =>
	(['GLOBAL', 'TEAM', 'PRIVATE'] as const).map((value) => ({
		value,
		label: t(`dashboardBuilder.form.options.visibilityScope.${value}.label`),
		description: t(
			`dashboardBuilder.form.options.visibilityScope.${value}.description`
		),
	})) satisfies Array<{
		value: DashboardWidgetVisibilityScope;
		label: string;
		description: string;
	}>;

export const getVisibilityScopeLabel = (
	t: TFunction,
	value?: DashboardWidgetVisibilityScope | null
) => {
	const scope = value ?? 'TEAM';

	return t(`dashboardBuilder.form.options.visibilityScope.${scope}.label`);
};

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
			...new Set([
				...ATTRIBUTE_DEFAULT_FILTER_FIELDS,
				...metricKeyOptions.map((option) => option.value),
			]),
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

	if (selectedEntry.type === 'number' || selectedEntry.type === 'time') {
		return 'number';
	}
	if (selectedEntry.type === 'boolean') return 'boolean';
	return 'string';
};

const getRuntimeFilterAllowedOperators = (
	fieldType: RuntimeFilterFieldType | null
): RuntimeFilterOperator[] => {
	if (fieldType === RUNTIME_FILTER_FIELD_TYPES.number) {
		return [
			'eq',
			'neq',
			'gt',
			'gte',
			'lt',
			'lte',
			'in',
			'not_in',
			'is_null',
			'is_not_null',
		];
	}

	if (fieldType === RUNTIME_FILTER_FIELD_TYPES.boolean) {
		return ['eq', 'neq', 'in', 'not_in', 'is_null', 'is_not_null'];
	}

	return ['eq', 'neq', 'in', 'not_in', 'is_null', 'is_not_null'];
};

export const getRuntimeFilterOperatorOptions = (
	t: TFunction,
	fieldType: RuntimeFilterFieldType | null
) =>
	getRuntimeFilterAllowedOperators(fieldType).map((value) => ({
		value,
		label: t(`dashboardBuilder.form.options.runtimeFilterOperator.${value}`),
	}));

export const getRuntimeFilterFieldSuggestions = (
	values: WidgetFormValues,
	metricKeyOptions: WidgetMetricOption[],
	conversationFields: MetricColumnConfigEntry[],
	dispositionFields: MetricColumnConfigEntry[]
) => {
	if (values.sourceType === 'ATTRIBUTE') {
		return [
			...new Set([
				...ATTRIBUTE_RUNTIME_FILTER_FIELDS,
				...metricKeyOptions.map((option) => option.value),
			]),
		];
	}

	return getSourceFieldEntries(
		values.sourceType,
		conversationFields,
		dispositionFields
	).map((entry) => entry.value);
};

export const buildRuntimeFilterFieldOptions = (
	values: WidgetFormValues,
	metricKeyOptions: WidgetMetricOption[],
	conversationFields: MetricColumnConfigEntry[],
	dispositionFields: MetricColumnConfigEntry[]
) => {
	if (values.sourceType === 'ATTRIBUTE') {
		return [
			...new Map(
				[...ATTRIBUTE_RUNTIME_FILTER_FIELD_OPTIONS, ...metricKeyOptions].map(
					(option) => [option.value, option] as const
				)
			).values(),
		];
	}

	return getSourceFieldEntries(
		values.sourceType,
		conversationFields,
		dispositionFields
	).map((entry) => ({
		value: entry.value,
		label: entry.label,
	}));
};

export const inferRuntimeFilterFieldType = (
	values: WidgetFormValues,
	filterKey: string,
	metricKeyOptions: WidgetMetricOption[],
	conversationFields: MetricColumnConfigEntry[],
	dispositionFields: MetricColumnConfigEntry[]
): RuntimeFilterFieldType | null => {
	const normalizedKey = normalizeFilterKey(
		values.sourceType,
		filterKey,
		metricKeyOptions
	);

	return getFilterFieldType(
		values,
		normalizedKey,
		metricKeyOptions,
		conversationFields,
		dispositionFields
	);
};

export const getRuntimeFilterFieldEntry = (
	values: WidgetFormValues,
	filterKey: string,
	metricKeyOptions: WidgetMetricOption[],
	conversationFields: MetricColumnConfigEntry[],
	dispositionFields: MetricColumnConfigEntry[]
) => {
	const normalizedKey = normalizeFilterKey(
		values.sourceType,
		filterKey,
		metricKeyOptions
	);

	if (values.sourceType === 'ATTRIBUTE') {
		return null;
	}

	return (
		getSourceFieldEntries(
			values.sourceType,
			conversationFields,
			dispositionFields
		).find((entry) => entry.value === normalizedKey) ?? null
	);
};

export const getRuntimeFilterFieldOptions = (
	values: WidgetFormValues,
	filterKey: string,
	metricKeyOptions: WidgetMetricOption[],
	conversationFields: MetricColumnConfigEntry[],
	dispositionFields: MetricColumnConfigEntry[]
) =>
	getRuntimeFilterFieldEntry(
		values,
		filterKey,
		metricKeyOptions,
		conversationFields,
		dispositionFields
	)?.options ?? null;

export const getRuntimeFilterValueMode = (
	operator: RuntimeFilterOperator | null,
	fieldType: RuntimeFilterFieldType | null
) => {
	if (!operator) {
		return 'single' as const;
	}

	if (operator === 'is_null' || operator === 'is_not_null') {
		return 'none' as const;
	}

	if (operator === 'in' || operator === 'not_in') {
		return 'multi' as const;
	}

	if (fieldType === RUNTIME_FILTER_FIELD_TYPES.number) {
		return 'number' as const;
	}

	if (fieldType === RUNTIME_FILTER_FIELD_TYPES.boolean) {
		return 'boolean' as const;
	}

	return 'single' as const;
};

const normalizeRuntimeFilterValue = (
	value: WidgetRuntimeFilterValue,
	valueMode: ReturnType<typeof getRuntimeFilterValueMode>,
	options: string[] | null = null
): WidgetRuntimeFilterValue => {
	const allowedOptions = options?.length ? new Set(options) : null;

	if (valueMode === 'none') {
		return null;
	}

	if (valueMode === 'multi') {
		if (Array.isArray(value)) {
			return value.map((item) => item.trim()).filter((item) => item.length > 0);
		}

		if (typeof value === 'string') {
			const trimmedValue = value.trim();
			if (!trimmedValue) {
				return [];
			}

			if (allowedOptions && !allowedOptions.has(trimmedValue)) {
				return [];
			}

			return [trimmedValue];
		}

		return [];
	}

	if (Array.isArray(value)) {
		const firstValue = value[0]?.trim() ?? '';

		if (!firstValue) {
			return null;
		}

		if (allowedOptions && !allowedOptions.has(firstValue)) {
			return null;
		}

		return firstValue;
	}

	const normalizedValue = typeof value === 'string' ? value.trim() : '';

	if (!normalizedValue) {
		return null;
	}

	if (allowedOptions && !allowedOptions.has(normalizedValue)) {
		return null;
	}

	return normalizedValue;
};

const parseRuntimeFilterValue = (
	value: WidgetRuntimeFilterValue,
	valueMode: ReturnType<typeof getRuntimeFilterValueMode>,
	fieldType: RuntimeFilterFieldType | null,
	options: string[] | null = null
): RuntimeFilter['value'] | undefined => {
	const allowedOptions = options?.length ? new Set(options) : null;

	if (valueMode === 'none') {
		return undefined;
	}

	if (valueMode === 'multi') {
		const values = Array.isArray(value)
			? value
			: typeof value === 'string'
				? [value]
				: [];
		const normalizedValues = values.map((item) => item.trim()).filter(Boolean);

		if (!normalizedValues.length) {
			return undefined;
		}

		if (allowedOptions) {
			if (normalizedValues.some((item) => !allowedOptions.has(item))) {
				return undefined;
			}

			return normalizedValues;
		}

		if (fieldType === RUNTIME_FILTER_FIELD_TYPES.number) {
			const parsedValues = normalizedValues.map((item) => Number(item));

			if (parsedValues.some((item) => !Number.isFinite(item))) {
				return undefined;
			}

			return parsedValues;
		}

		if (fieldType === RUNTIME_FILTER_FIELD_TYPES.boolean) {
			const parsedValues = normalizedValues.map((item) => {
				if (item === 'true') {
					return true;
				}

				if (item === 'false') {
					return false;
				}

				return null;
			});

			if (parsedValues.some((item) => item === null)) {
				return undefined;
			}

			return parsedValues as boolean[];
		}

		return normalizedValues;
	}

	const normalizedValue = Array.isArray(value)
		? (value[0]?.trim() ?? '')
		: typeof value === 'string'
			? value.trim()
			: '';

	if (!normalizedValue) {
		return undefined;
	}

	if (allowedOptions) {
		return allowedOptions.has(normalizedValue) ? normalizedValue : undefined;
	}

	if (fieldType === RUNTIME_FILTER_FIELD_TYPES.number) {
		const parsedValue = Number(normalizedValue);
		return Number.isFinite(parsedValue) ? parsedValue : undefined;
	}

	if (fieldType === RUNTIME_FILTER_FIELD_TYPES.boolean) {
		if (normalizedValue === 'true') {
			return true;
		}

		if (normalizedValue === 'false') {
			return false;
		}

		return undefined;
	}

	return normalizedValue;
};

export const createEmptyRuntimeFilterRow = (): WidgetRuntimeFilterFormRow => ({
	id: crypto.randomUUID(),
	field: null,
	operator: null,
	value: null,
});

export const resetRuntimeFilterRow = (
	row: WidgetRuntimeFilterFormRow
): WidgetRuntimeFilterFormRow => ({
	...row,
	field: null,
	operator: null,
	value: null,
});

export const sanitizeWidgetRuntimeFilters = (
	nextValues: WidgetFormValues,
	metricKeyOptions: WidgetMetricOption[],
	conversationFields: MetricColumnConfigEntry[],
	dispositionFields: MetricColumnConfigEntry[]
): WidgetRuntimeFilterFormRow[] => {
	const allowedFilterKeys = new Set(
		getRuntimeFilterFieldSuggestions(
			nextValues,
			metricKeyOptions,
			conversationFields,
			dispositionFields
		)
	);

	return nextValues.runtimeFilters.map((row) => {
		const trimmedField = typeof row.field === 'string' ? row.field.trim() : '';

		if (!trimmedField) {
			return row.operator || row.value ? resetRuntimeFilterRow(row) : row;
		}

		const normalizedField = normalizeFilterKey(
			nextValues.sourceType,
			trimmedField,
			metricKeyOptions
		);

		if (!allowedFilterKeys.has(normalizedField)) {
			return resetRuntimeFilterRow(row);
		}

		const fieldType = inferRuntimeFilterFieldType(
			nextValues,
			normalizedField,
			metricKeyOptions,
			conversationFields,
			dispositionFields
		);
		const fieldOptions = getRuntimeFilterFieldOptions(
			nextValues,
			normalizedField,
			metricKeyOptions,
			conversationFields,
			dispositionFields
		);
		const allowedOperators = getRuntimeFilterAllowedOperators(fieldType);
		const nextOperator =
			row.operator && allowedOperators.includes(row.operator)
				? row.operator
				: null;

		if (!nextOperator) {
			return {
				...row,
				field: normalizedField,
				operator: null,
				value: null,
			};
		}

		const valueMode = getRuntimeFilterValueMode(nextOperator, fieldType);

		return {
			...row,
			field: normalizedField,
			operator: nextOperator,
			value: normalizeRuntimeFilterValue(row.value, valueMode, fieldOptions),
		};
	});
};

export const hasInvalidRuntimeFilterRows = (
	rows: WidgetRuntimeFilterFormRow[],
	values: WidgetFormValues,
	metricKeyOptions: WidgetMetricOption[],
	conversationFields: MetricColumnConfigEntry[],
	dispositionFields: MetricColumnConfigEntry[]
) =>
	rows.some((row) => {
		const trimmedField = typeof row.field === 'string' ? row.field.trim() : '';
		const hasAnyValue =
			trimmedField.length > 0 ||
			Boolean(row.operator) ||
			(Array.isArray(row.value)
				? row.value.some((item) => item.trim().length > 0)
				: typeof row.value === 'string'
					? row.value.trim().length > 0
					: false);

		if (!hasAnyValue) {
			return false;
		}

		if (!trimmedField || !row.operator) {
			return true;
		}

		const normalizedField = normalizeFilterKey(
			values.sourceType,
			trimmedField,
			metricKeyOptions
		);
		const fieldType = inferRuntimeFilterFieldType(
			values,
			normalizedField,
			metricKeyOptions,
			conversationFields,
			dispositionFields
		);
		const fieldOptions = getRuntimeFilterFieldOptions(
			values,
			normalizedField,
			metricKeyOptions,
			conversationFields,
			dispositionFields
		);

		if (!fieldType) {
			return true;
		}

		const valueMode = getRuntimeFilterValueMode(row.operator, fieldType);
		if (valueMode === 'none') {
			return false;
		}

		return (
			parseRuntimeFilterValue(row.value, valueMode, fieldType, fieldOptions) ===
			undefined
		);
	});

export const buildRuntimeFilters = (
	rows: WidgetRuntimeFilterFormRow[],
	values: WidgetFormValues,
	metricKeyOptions: WidgetMetricOption[],
	conversationFields: MetricColumnConfigEntry[],
	dispositionFields: MetricColumnConfigEntry[]
): RuntimeFilter[] | null => {
	const entries = rows.reduce<RuntimeFilter[]>((acc, row) => {
		const trimmedField = typeof row.field === 'string' ? row.field.trim() : '';

		if (!trimmedField || !row.operator) {
			return acc;
		}

		const normalizedField = normalizeFilterKey(
			values.sourceType,
			trimmedField,
			metricKeyOptions
		);
		const fieldType = inferRuntimeFilterFieldType(
			values,
			normalizedField,
			metricKeyOptions,
			conversationFields,
			dispositionFields
		);
		const fieldOptions = getRuntimeFilterFieldOptions(
			values,
			normalizedField,
			metricKeyOptions,
			conversationFields,
			dispositionFields
		);

		if (!fieldType) {
			return acc;
		}

		const valueMode = getRuntimeFilterValueMode(row.operator, fieldType);
		const parsedValue = parseRuntimeFilterValue(
			row.value,
			valueMode,
			fieldType,
			fieldOptions
		);

		if (
			parsedValue === undefined &&
			row.operator !== 'is_null' &&
			row.operator !== 'is_not_null'
		) {
			return acc;
		}

		acc.push({
			field: normalizedField,
			operator: row.operator,
			...(parsedValue === undefined ? {} : { value: parsedValue }),
		});
		return acc;
	}, []);

	return entries.length ? entries : null;
};

const getJoinForFieldKey = (
	sourceType: MetricSourceType,
	fieldKey: string | null | undefined,
	conversationFields: MetricColumnConfigEntry[],
	dispositionFields: MetricColumnConfigEntry[]
): DashboardWidgetJoinConfig | null => {
	const trimmedFieldKey = trimText(fieldKey);

	if (!trimmedFieldKey || sourceType === 'ATTRIBUTE') {
		return null;
	}

	const selectedEntry = getSourceFieldEntries(
		sourceType,
		conversationFields,
		dispositionFields
	).find((entry) => entry.value === trimmedFieldKey);

	return selectedEntry?.join ?? null;
};

const mergeJoinConfig = (
	current: DashboardWidgetJoinConfig | undefined,
	next: DashboardWidgetJoinConfig
): DashboardWidgetJoinConfig => {
	if (!current) {
		return next;
	}

	if (current.relation !== next.relation) {
		return current;
	}

	if (current.type === 'inner' || next.type === 'inner') {
		return {
			relation: next.relation,
			type: 'inner',
		};
	}

	return current;
};

const collectWidgetJoins = (
	values: WidgetFormValues,
	conversationFields: MetricColumnConfigEntry[],
	dispositionFields: MetricColumnConfigEntry[]
): DashboardWidgetJoinConfig[] => {
	if (values.sourceType === 'ATTRIBUTE') {
		return [];
	}

	const joins = new Map<
		DashboardWidgetJoinRelation,
		DashboardWidgetJoinConfig
	>();

	const recordJoin = (join: DashboardWidgetJoinConfig | null) => {
		if (!join) {
			return;
		}

		const currentJoin = joins.get(join.relation);
		joins.set(join.relation, mergeJoinConfig(currentJoin, join));
	};

	recordJoin(
		getJoinForFieldKey(
			values.sourceType,
			values.fieldName,
			conversationFields,
			dispositionFields
		)
	);

	for (const row of values.defaultFilters) {
		recordJoin(
			getJoinForFieldKey(
				values.sourceType,
				row.key,
				conversationFields,
				dispositionFields
			)
		);
	}

	for (const row of values.runtimeFilters) {
		recordJoin(
			getJoinForFieldKey(
				values.sourceType,
				row.field,
				conversationFields,
				dispositionFields
			)
		);
	}

	return [...joins.values()];
};

export const buildWidgetDataConfig = (
	values: WidgetFormValues,
	options: {
		metricKeyOptions?: WidgetMetricOption[];
		conversationFields?: MetricColumnConfigEntry[];
		dispositionFields?: MetricColumnConfigEntry[];
	} = {}
): DashboardWidgetDataConfig => {
	const conversationFields = options.conversationFields ?? [];
	const dispositionFields = options.dispositionFields ?? [];
	const metricKeyOptions = options.metricKeyOptions ?? [];
	const joins = collectWidgetJoins(
		values,
		conversationFields,
		dispositionFields
	);

	return {
		metric: buildMetricPayload(values, {
			conversationFields,
			dispositionFields,
		}),
		query: buildQueryPayload(values),
		runtimeFilters: buildRuntimeFilters(
			values.runtimeFilters,
			values,
			metricKeyOptions,
			conversationFields,
			dispositionFields
		),
		joins: joins.length ? joins : null,
	};
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
		visibilityScopeLabel: getVisibilityScopeLabel(
			options.t,
			values.visibilityScope
		),
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
	campaignId: number | null,
	options: {
		metricKeyOptions?: WidgetMetricOption[];
		conversationFields?: MetricColumnConfigEntry[];
		dispositionFields?: MetricColumnConfigEntry[];
	} = {}
): PreviewDashboardWidgetDto | null => {
	if (!isWidgetPreviewReady(values)) {
		return null;
	}

	if (
		hasInvalidRuntimeFilterRows(
			values.runtimeFilters,
			values,
			options.metricKeyOptions ?? [],
			options.conversationFields ?? [],
			options.dispositionFields ?? []
		)
	) {
		return null;
	}

	const viewConfig = buildPreviewViewConfigPayload(values);

	return {
		...(campaignId == null ? {} : { campaignId }),
		widgetType: values.widgetType,
		dataConfig: buildWidgetDataConfig(values, {
			metricKeyOptions: options.metricKeyOptions,
			conversationFields: options.conversationFields,
			dispositionFields: options.dispositionFields,
		}),
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
		const comparisonLabel =
			fallbackPreview.kind === 'kpi'
				? fallbackPreview.comparisonLabel
				: undefined;
		const comparisonDetail =
			fallbackPreview.kind === 'kpi'
				? fallbackPreview.comparisonDetail
				: undefined;

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
			comparisonLabel,
			comparisonDetail,
		};
	}

	if (widget.result.kind === 'time_series') {
		const comparisonLabel =
			fallbackPreview.kind === 'line_chart'
				? fallbackPreview.comparisonLabel
				: undefined;

		return {
			kind: 'line_chart',
			title:
				fallbackPreview.kind === 'line_chart'
					? fallbackPreview.title
					: widget.title,
			subtitle:
				fallbackPreview.kind === 'line_chart'
					? fallbackPreview.subtitle
					: undefined,
			description:
				fallbackPreview.kind === 'line_chart'
					? fallbackPreview.description
					: undefined,
			sizePreset: fallbackPreview.sizePreset,
			accentColor: fallbackPreview.accentColor,
			points: widget.result.points,
			comparisonLabel,
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
	...(!supportsCompareWithWidget(values.widgetType) ||
	values.compareWith === 'LATEST'
		? {}
		: { compareWith: values.compareWith }),
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

const mapRuntimeFilters = (
	runtimeFilters?: RuntimeFilter[] | null
): WidgetRuntimeFilterFormRow[] => {
	if (!runtimeFilters?.length) {
		return [createEmptyRuntimeFilterRow()];
	}

	const rows = runtimeFilters.map((filter) => ({
		id: crypto.randomUUID(),
		field: filter.field,
		operator: filter.operator,
		value: Array.isArray(filter.value)
			? filter.value.map((item) => String(item))
			: filter.value === null || filter.value === undefined
				? null
				: String(filter.value),
	}));

	return rows.length ? rows : [createEmptyRuntimeFilterRow()];
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
		compareWith: supportsCompareWithWidget(widget?.widgetType ?? 'KPI')
			? (metric?.compareWith ?? 'LATEST')
			: 'LATEST',
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
		visibilityScope: widget?.visibilityScope ?? 'TEAM',
		width: normalizedLayout.width,
		height: normalizedLayout.height,
		enabled: widget?.enabled ?? true,
		defaultFilters: mapDefaultFilters(metric?.defaultFilter),
		runtimeFilters: mapRuntimeFilters(dataConfig?.runtimeFilters),
	};
};
