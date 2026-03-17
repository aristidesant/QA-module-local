import { useEffect, useMemo, useState } from 'react';
import {
	ActionIcon,
	Alert,
	Autocomplete,
	Badge,
	Button,
	Collapse,
	Divider,
	Group,
	NumberInput,
	SegmentedControl,
	Select,
	SimpleGrid,
	Stack,
	Switch,
	Text,
	Textarea,
	TextInput,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import {
	IconChevronDown,
	IconChevronUp,
	IconInfoCircle,
	IconPlus,
	IconTrash,
} from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import type {
	CreateDashboardWidgetDto,
	DashboardWidget,
	UpdateDashboardWidgetDto,
} from '~/models/AnalyticsDashboard';
import {
	findNextAvailableWidgetLayout,
	getWidgetDimensionsForPreset,
	type DashboardWidgetSizePreset,
	normalizeWidgetLayout,
} from '~/modules/campaigns/dashboardLayout';
import { getDataCollectionFromAgentConfig } from '~/modules/campaigns/CampaignsForm/AnalyticsSection/analyticsFormContext';
import { useGetCampaign } from '~/queries/campaignsQueries';
import { useGetClientConfig } from '~/queries/clientConfigQueries';
import {
	useCreateDashboardWidget,
	useDashboardWidgets,
	useUpdateDashboardWidget,
} from '~/queries/analyticsDashboardsQueries';
import { getErrorMessage } from '~/utils/httpClient';
import type {
	WidgetFilterFormRow,
	WidgetFormValues,
} from '../DashboardSection.types';
import DashboardWidgetPreview from './DashboardWidgetPreview';
import {
	buildFieldOptions,
	buildGroupBySuggestions,
	buildGuidedState,
	buildMetricPayload,
	buildQueryPayload,
	buildViewConfigPayload,
	createEmptyFilterRow,
	getAggregationOptions,
	getDefaultWidgetSizePreset,
	getFilterKeySuggestions,
	getFilterValueTypeOptions,
	getInitialSizePreset,
	getMetricSourceOptions,
	getResultTypeOptions,
	getSizePresetOptions,
	getValueFieldOptions,
	getViewValueFormatOptions,
	getWidgetTypeOptions,
	hasInvalidDefaultFilterRows,
	inferFilterValueType,
	getResolvedGroupBy,
	isGroupByDerivedFromSourceField,
	isMetricSelectionReady,
	parseMetricColumnsConfig,
	requiresValueField,
	supportsGroupedWidget,
	supportsTimeSeriesWidget,
	widgetFormValues,
} from './DashboardWidgetForm.helpers';
import styles from './DashboardWidgetForm.module.css';

type DashboardWidgetFormProps = {
	campaignId: number | null;
	attributeMetricKeys?: string[];
	dashboardId: number;
	widget?: DashboardWidget | null;
	onCancel: () => void;
	onSuccess: () => void;
};

const METRIC_COLUMNS_CONFIG_KEY = 'metric_columns';
const resetFilterRow = (row: WidgetFilterFormRow): WidgetFilterFormRow => ({
	...row,
	key: null,
	value: null,
	valueType: null,
});

const DashboardWidgetForm = ({
	campaignId,
	attributeMetricKeys = [],
	dashboardId,
	widget,
	onCancel,
	onSuccess,
}: DashboardWidgetFormProps) => {
	const { t } = useTranslation(['campaign.form.dashboards', 'common']);
	const createDashboardWidget = useCreateDashboardWidget();
	const updateDashboardWidget = useUpdateDashboardWidget();
	const { data: existingWidgets = [] } = useDashboardWidgets(dashboardId);
	const { data: metricColumnsConfig, isLoading: isMetricColumnsLoading } =
		useGetClientConfig(METRIC_COLUMNS_CONFIG_KEY);
	const isEditing = Boolean(widget?.id);
	const isGlobalDashboard = campaignId === null;
	const [titleTouched, setTitleTouched] = useState(
		Boolean(widget?.title?.trim())
	);
	const [advancedOpened, setAdvancedOpened] = useState(false);
	const [sizePreset, setSizePreset] = useState<DashboardWidgetSizePreset>(
		getInitialSizePreset(widget)
	);
	const [sizePresetTouched, setSizePresetTouched] = useState(Boolean(widget));
	const [manualCompatibility, setManualCompatibility] = useState({
		resultType: Boolean(widget),
		supportsGroupBy: Boolean(widget),
		supportsTimeSeries: Boolean(widget),
	});

	const form = useForm<WidgetFormValues>({
		initialValues: widgetFormValues(widget),
		validate: {
			title: (value) =>
				value.trim() ? null : t('dashboardBuilder.form.validation.widgetTitle'),
			fieldName: (value, values) =>
				values.sourceType !== 'ATTRIBUTE' &&
				!(typeof value === 'string' ? value.trim() : '')
					? t('dashboardBuilder.form.validation.fieldNameRequired')
					: null,
			metricKey: (value, values) =>
				values.sourceType === 'ATTRIBUTE' &&
				!(typeof value === 'string' ? value.trim() : '')
					? t('dashboardBuilder.form.validation.metricKeyRequired')
					: null,
			valueField: (value, values) =>
				requiresValueField(values.sourceType, values.aggregationType) && !value
					? t('dashboardBuilder.form.validation.valueFieldRequired')
					: null,
			groupBy: (value, values) =>
				supportsGroupedWidget(values.widgetType) &&
				!getResolvedGroupBy({ ...values, groupBy: value })
					? t('dashboardBuilder.form.validation.groupByRequired')
					: null,
			limit: (value) =>
				value === '' || value >= 1
					? null
					: t('dashboardBuilder.form.validation.minSize'),
			width: (value) =>
				value >= 1 ? null : t('dashboardBuilder.form.validation.minSize'),
			height: (value) =>
				value >= 1 ? null : t('dashboardBuilder.form.validation.minSize'),
		},
	});

	const parsedMetricColumns = useMemo(
		() => parseMetricColumnsConfig(metricColumnsConfig?.value),
		[metricColumnsConfig?.value]
	);

	const conversationFieldOptions = useMemo(
		() => buildFieldOptions(parsedMetricColumns.conversation),
		[parsedMetricColumns.conversation]
	);
	const dispositionFieldOptions = useMemo(
		() => buildFieldOptions(parsedMetricColumns.disposition),
		[parsedMetricColumns.disposition]
	);
	const conversationFieldValues = useMemo(
		() => conversationFieldOptions.map((option) => option.value),
		[conversationFieldOptions]
	);
	const dispositionFieldValues = useMemo(
		() => dispositionFieldOptions.map((option) => option.value),
		[dispositionFieldOptions]
	);

	const { data: selectedCampaign, isLoading: isCampaignLoading } =
		useGetCampaign(String(campaignId ?? ''), {
			enabled: Boolean(campaignId) && form.values.sourceType === 'ATTRIBUTE',
		});

	const metricKeyOptions = useMemo(() => {
		const campaignMetricKeys = selectedCampaign
			? Object.keys(
					getDataCollectionFromAgentConfig(selectedCampaign.agentConfig)
				)
			: [];

		return [...new Set([...campaignMetricKeys, ...attributeMetricKeys])]
			.filter((key) => key.trim().length > 0)
			.sort()
			.map((key) => ({
				value: key,
				label: key,
			}));
	}, [attributeMetricKeys, selectedCampaign]);

	const widgetTypeOptions = useMemo(() => getWidgetTypeOptions(t), [t]);
	const metricSourceOptions = useMemo(
		() => getMetricSourceOptions(t, isGlobalDashboard),
		[isGlobalDashboard, t]
	);
	const aggregationOptions = useMemo(() => getAggregationOptions(t), [t]);
	const resultTypeOptions = useMemo(() => getResultTypeOptions(t), [t]);
	const valueFieldOptions = useMemo(() => getValueFieldOptions(t), [t]);
	const filterValueTypeOptions = useMemo(
		() => getFilterValueTypeOptions(t),
		[t]
	);
	const viewValueFormatOptions = useMemo(
		() => getViewValueFormatOptions(t),
		[t]
	);
	const sizePresetOptions = useMemo(
		() => getSizePresetOptions(t, sizePreset),
		[sizePreset, t]
	);
	const widgetTypeControlOptions = useMemo(
		() =>
			widgetTypeOptions.map((option) => ({
				value: option.value,
				label: t(`dashboardBuilder.widgetTypes.${option.value}`),
				disabled: option.disabled,
			})),
		[t, widgetTypeOptions]
	);
	const sourceTypeControlOptions = useMemo(
		() =>
			metricSourceOptions.map((option) => ({
				value: option.value,
				label: t(`dashboardBuilder.form.options.sourceType.${option.value}`),
				disabled: option.disabled,
			})),
		[metricSourceOptions, t]
	);

	const guidedState = useMemo(
		() =>
			buildGuidedState(form.values, {
				metricKeyOptions,
				conversationFields: parsedMetricColumns.conversation,
				dispositionFields: parsedMetricColumns.disposition,
				sizePreset,
				isGlobalDashboard,
				t,
			}),
		[
			form.values,
			isGlobalDashboard,
			metricKeyOptions,
			parsedMetricColumns.conversation,
			parsedMetricColumns.disposition,
			sizePreset,
			t,
		]
	);

	const groupBySuggestions = useMemo(
		() =>
			buildGroupBySuggestions(
				{
					sourceType: form.values.sourceType,
					aggregationType: form.values.aggregationType,
					fieldName: form.values.fieldName,
					metricKey: form.values.metricKey,
					supportsGroupBy: form.values.supportsGroupBy,
					supportsTimeSeries: form.values.supportsTimeSeries,
				},
				metricKeyOptions.map((option) => option.value),
				conversationFieldValues,
				dispositionFieldValues
			),
		[
			conversationFieldValues,
			dispositionFieldValues,
			form.values.aggregationType,
			form.values.fieldName,
			form.values.metricKey,
			form.values.sourceType,
			form.values.supportsGroupBy,
			form.values.supportsTimeSeries,
			metricKeyOptions,
		]
	);

	const needsGroupedConfig = guidedState.compatibility.isGroupedWidget;
	const needsTimeSeriesMetric = supportsTimeSeriesWidget(
		form.values.widgetType
	);
	const needsValueField = guidedState.compatibility.requiresValueField;
	const groupByIsDerived = isGroupByDerivedFromSourceField(form.values);
	const isAttributeMetric = form.values.sourceType === 'ATTRIBUTE';
	const fieldNameOptions = isAttributeMetric
		? []
		: form.values.sourceType === 'DISPOSITION'
			? dispositionFieldOptions
			: conversationFieldOptions;
	const filterKeySuggestions = useMemo(
		() =>
			getFilterKeySuggestions(
				form.values,
				metricKeyOptions,
				parsedMetricColumns.conversation,
				parsedMetricColumns.disposition
			),
		[
			form.values,
			metricKeyOptions,
			parsedMetricColumns.conversation,
			parsedMetricColumns.disposition,
		]
	);
	const placementLayout = useMemo(
		() =>
			findNextAvailableWidgetLayout(
				existingWidgets.map((item) => ({
					id: item.id,
					positionX: item.positionX,
					positionY: item.positionY,
					width: item.width,
					height: item.height,
				})),
				{ width: form.values.width, height: form.values.height },
				widget?.id ? { excludeId: widget.id } : undefined
			),
		[existingWidgets, form.values.height, form.values.width, widget?.id]
	);

	const advancedSettingsCount = useMemo(() => {
		let count = 0;
		if (
			typeof form.values.viewColor === 'string' &&
			form.values.viewColor.trim()
		) {
			count += 1;
		}
		if (
			typeof form.values.viewValueFormat === 'string' &&
			form.values.viewValueFormat.trim()
		) {
			count += 1;
		}
		if (!form.values.enabled) count += 1;
		if (
			manualCompatibility.resultType &&
			form.values.resultType !== guidedState.compatibility.inferredResultType
		)
			count += 1;
		if (
			manualCompatibility.supportsGroupBy &&
			form.values.supportsGroupBy !==
				guidedState.compatibility.inferredSupportsGroupBy
		)
			count += 1;
		if (
			manualCompatibility.supportsTimeSeries &&
			form.values.supportsTimeSeries !==
				guidedState.compatibility.inferredSupportsTimeSeries
		)
			count += 1;
		count += form.values.defaultFilters.filter(
			(row) => (row.key ?? '').trim().length > 0
		).length;
		return count;
	}, [
		form.values.viewColor,
		form.values.viewValueFormat,
		form.values.enabled,
		form.values.supportsGroupBy,
		form.values.supportsTimeSeries,
		form.values.defaultFilters,
		manualCompatibility,
		guidedState.compatibility,
	]);

	useEffect(() => {
		const nextValues = widgetFormValues(widget);

		form.setValues(nextValues);
		form.resetDirty(nextValues);
		setTitleTouched(Boolean(widget?.title?.trim()));
		setAdvancedOpened(false);
		setSizePreset(getInitialSizePreset(widget));
		setSizePresetTouched(Boolean(widget));
		setManualCompatibility({
			resultType: Boolean(widget),
			supportsGroupBy: Boolean(widget),
			supportsTimeSeries: Boolean(widget),
		});
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [widget]);

	useEffect(() => {
		if (sizePresetTouched) {
			return;
		}

		const nextPreset = getDefaultWidgetSizePreset(form.values.widgetType);
		const nextDimensions = getWidgetDimensionsForPreset(nextPreset);

		if (sizePreset !== nextPreset) {
			setSizePreset(nextPreset);
		}

		if (
			form.values.width !== nextDimensions.width ||
			form.values.height !== nextDimensions.height
		) {
			form.setValues({
				...form.values,
				width: nextDimensions.width,
				height: nextDimensions.height,
			});
		}
	}, [
		form,
		form.values,
		form.values.widgetType,
		sizePreset,
		sizePresetTouched,
	]);

	useEffect(() => {
		const nextValues: Partial<WidgetFormValues> = {};
		const effectiveSourceType =
			isGlobalDashboard && form.values.sourceType === 'ATTRIBUTE'
				? 'CONVERSATION'
				: form.values.sourceType;

		if (effectiveSourceType !== form.values.sourceType) {
			nextValues.sourceType = effectiveSourceType;
			nextValues.defaultFilters = [createEmptyFilterRow()];
		}

		if (effectiveSourceType === 'ATTRIBUTE') {
			if (form.values.fieldName !== null) {
				nextValues.fieldName = null;
			}
		} else if (form.values.metricKey !== null) {
			nextValues.metricKey = null;
		}

		if (!needsValueField && form.values.valueField !== null) {
			nextValues.valueField = null;
		}

		if (needsGroupedConfig) {
			const resolvedGroupBy = getResolvedGroupBy(form.values);
			const currentGroupBy =
				typeof form.values.groupBy === 'string'
					? form.values.groupBy.trim()
					: '';

			if (currentGroupBy !== resolvedGroupBy) {
				nextValues.groupBy = resolvedGroupBy;
			}
		} else if (form.values.groupBy !== null) {
			nextValues.groupBy = null;
		}

		if (!needsGroupedConfig) {
			if (form.values.limit !== '') {
				nextValues.limit = '';
			}

			if (!form.values.viewLegend) {
				nextValues.viewLegend = true;
			}
		}

		if (
			!manualCompatibility.supportsGroupBy &&
			form.values.supportsGroupBy !==
				guidedState.compatibility.inferredSupportsGroupBy
		) {
			nextValues.supportsGroupBy =
				guidedState.compatibility.inferredSupportsGroupBy;
		}

		if (
			!manualCompatibility.supportsTimeSeries &&
			form.values.supportsTimeSeries !==
				guidedState.compatibility.inferredSupportsTimeSeries
		) {
			nextValues.supportsTimeSeries =
				guidedState.compatibility.inferredSupportsTimeSeries;
		}

		if (
			!manualCompatibility.resultType &&
			isMetricSelectionReady(form.values) &&
			form.values.resultType !== guidedState.compatibility.inferredResultType
		) {
			nextValues.resultType = guidedState.compatibility.inferredResultType;
		}

		if (
			!titleTouched &&
			guidedState.titleSuggestion &&
			form.values.title !== guidedState.titleSuggestion
		) {
			nextValues.title = guidedState.titleSuggestion;
		}

		if (Object.keys(nextValues).length === 0) {
			return;
		}

		form.setValues({
			...form.values,
			...nextValues,
		});
	}, [
		form,
		form.values,
		guidedState.compatibility.inferredResultType,
		guidedState.compatibility.inferredSupportsGroupBy,
		guidedState.compatibility.inferredSupportsTimeSeries,
		guidedState.titleSuggestion,
		isGlobalDashboard,
		manualCompatibility.resultType,
		manualCompatibility.supportsGroupBy,
		manualCompatibility.supportsTimeSeries,
		needsGroupedConfig,
		needsValueField,
		titleTouched,
	]);

	const handleSubmit = form.onSubmit(async (values) => {
		if (isGlobalDashboard && values.sourceType === 'ATTRIBUTE') {
			form.setFieldError(
				'sourceType',
				t('dashboardBuilder.form.validation.attributeNotAvailable')
			);
			return;
		}

		if (needsGroupedConfig && !values.supportsGroupBy) {
			form.setFieldError(
				'groupBy',
				t('dashboardBuilder.form.validation.metricMustSupportGroupBy')
			);
			return;
		}

		if (needsTimeSeriesMetric && !values.supportsTimeSeries) {
			form.setFieldError(
				'widgetType',
				t('dashboardBuilder.form.validation.metricMustSupportTimeSeries')
			);
			return;
		}

		if (hasInvalidDefaultFilterRows(values.defaultFilters)) {
			notifications.show({
				title: t('dashboardBuilder.notifications.errorTitle'),
				message: t('dashboardBuilder.form.validation.defaultFilterInvalid'),
				color: 'red',
			});
			return;
		}

		const payload: CreateDashboardWidgetDto | UpdateDashboardWidgetDto = {
			...normalizeWidgetLayout({
				positionX: placementLayout.positionX,
				positionY: placementLayout.positionY,
				width: values.width,
				height: values.height,
			}),
			dashboardId,
			widgetType: values.widgetType,
			title: values.title.trim(),
			description: values.description.trim() || undefined,
			enabled: values.enabled,
			dataConfig: {
				metric: buildMetricPayload(values, {
					conversationFields: parsedMetricColumns.conversation,
					dispositionFields: parsedMetricColumns.disposition,
				}),
				query: buildQueryPayload(values),
			},
			viewConfig: buildViewConfigPayload(values),
		};

		try {
			if (isEditing && widget) {
				await updateDashboardWidget.mutateAsync({
					id: widget.id,
					data: payload,
				});
			} else {
				await createDashboardWidget.mutateAsync(
					payload as CreateDashboardWidgetDto
				);
			}

			notifications.show({
				title: isEditing
					? t('dashboardBuilder.notifications.widgetUpdatedTitle')
					: t('dashboardBuilder.notifications.widgetCreatedTitle'),
				message: isEditing
					? t('dashboardBuilder.notifications.widgetUpdatedMessage')
					: t('dashboardBuilder.notifications.widgetCreatedMessage'),
				color: 'green',
			});

			onSuccess();
		} catch (error) {
			notifications.show({
				title: t('dashboardBuilder.notifications.errorTitle'),
				message: getErrorMessage(error),
				color: 'red',
			});
		}
	});

	const addDefaultFilterRow = () => {
		form.insertListItem('defaultFilters', createEmptyFilterRow());
	};

	const removeDefaultFilterRow = (index: number) => {
		if (form.values.defaultFilters.length === 1) {
			form.replaceListItem('defaultFilters', index, createEmptyFilterRow());
			return;
		}

		form.removeListItem('defaultFilters', index);
	};

	const updateFormValues = (patch: Partial<WidgetFormValues>) => {
		form.setValues({
			...form.values,
			...patch,
		});
	};

	const normalizeFilterValueForType = (
		valueType: WidgetFilterFormRow['valueType'],
		value: string | null
	) => {
		if (valueType === 'boolean') {
			return value === 'true' || value === 'false' ? value : 'true';
		}

		if (valueType === 'number') {
			return value && value.trim() && Number.isFinite(Number(value))
				? value
				: '';
		}

		if (valueType === 'null') {
			return '';
		}

		return value;
	};

	const sanitizeDefaultFilters = (
		nextValues: WidgetFormValues
	): WidgetFilterFormRow[] => {
		const allowedFilterKeys = new Set(
			getFilterKeySuggestions(
				nextValues,
				metricKeyOptions,
				parsedMetricColumns.conversation,
				parsedMetricColumns.disposition
			)
		);

		return nextValues.defaultFilters.map((row) => {
			const trimmedKey = typeof row.key === 'string' ? row.key.trim() : '';

			if (!trimmedKey) {
				return row.value || row.valueType !== 'string'
					? resetFilterRow(row)
					: row;
			}

			if (!allowedFilterKeys.has(trimmedKey)) {
				return resetFilterRow(row);
			}

			const inferredValueType = inferFilterValueType(
				nextValues,
				trimmedKey,
				metricKeyOptions,
				parsedMetricColumns.conversation,
				parsedMetricColumns.disposition
			);

			if (!inferredValueType || row.valueType === inferredValueType) {
				return {
					...row,
					key: trimmedKey,
				};
			}

			return {
				...row,
				key: trimmedKey,
				valueType: inferredValueType,
				value: normalizeFilterValueForType(inferredValueType, row.value),
			};
		});
	};

	const handleWidgetTypeChange = (value: string | null) => {
		if (!value) {
			return;
		}

		const nextWidgetType = value as WidgetFormValues['widgetType'];
		const nextValues: WidgetFormValues = {
			...form.values,
			widgetType: nextWidgetType,
		};

		if (!supportsGroupedWidget(nextWidgetType)) {
			nextValues.groupBy = null;
			nextValues.limit = '';
		}

		updateFormValues(nextValues);
	};

	const handleSourceTypeChange = (value: string | null) => {
		if (!value) {
			return;
		}

		const nextSourceType = value as WidgetFormValues['sourceType'];
		if (import.meta.env.DEV) {
			console.groupCollapsed('[Dashboard widget form] source type changed');
			console.log('sourceType:', nextSourceType);
			console.log('previous values:', {
				sourceType: form.values.sourceType,
				fieldName: form.values.fieldName,
				metricKey: form.values.metricKey,
				valueField: form.values.valueField,
				resultType: form.values.resultType,
				groupBy: form.values.groupBy,
				limit: form.values.limit,
				viewColor: form.values.viewColor,
				viewValueFormat: form.values.viewValueFormat,
				supportsGroupBy: form.values.supportsGroupBy,
				supportsTimeSeries: form.values.supportsTimeSeries,
				defaultFilters: form.values.defaultFilters,
			});
			console.groupEnd();
		}
		const nextValues: WidgetFormValues = {
			...form.values,
			sourceType: nextSourceType,
			fieldName: null,
			metricKey: null,
			valueField: null,
			resultType: null,
			groupBy: null,
			limit: '',
			viewColor: '',
			viewValueFormat: null,
			supportsGroupBy: false,
			supportsTimeSeries: true,
			defaultFilters: [createEmptyFilterRow()],
		};

		updateFormValues({
			...nextValues,
		});
		setManualCompatibility({
			resultType: false,
			supportsGroupBy: false,
			supportsTimeSeries: false,
		});
	};

	const handleAggregationTypeChange = (value: string | null) => {
		if (!value) {
			return;
		}

		const nextAggregationType = value as WidgetFormValues['aggregationType'];
		const nextValues: WidgetFormValues = {
			...form.values,
			aggregationType: nextAggregationType,
		};

		if (!requiresValueField(nextValues.sourceType, nextAggregationType)) {
			nextValues.valueField = null;
		}

		updateFormValues({
			...nextValues,
			defaultFilters: sanitizeDefaultFilters(nextValues),
		});
		setManualCompatibility((current) => ({ ...current, resultType: false }));
	};

	const handleMetricKeyChange = (value: string | null) => {
		const nextMetricKey = value ?? null;
		const nextValues: WidgetFormValues = {
			...form.values,
			metricKey: nextMetricKey,
		};

		updateFormValues({
			...nextValues,
			defaultFilters: sanitizeDefaultFilters(nextValues),
		});
		setManualCompatibility((current) => ({ ...current, resultType: false }));
	};

	const handleFieldNameChange = (value: string | null) => {
		const nextFieldName = value ?? null;
		const nextValues: WidgetFormValues = {
			...form.values,
			fieldName: nextFieldName,
		};

		updateFormValues({
			...nextValues,
			defaultFilters: sanitizeDefaultFilters(nextValues),
		});
		setManualCompatibility((current) => ({ ...current, resultType: false }));
	};

	const handleValueFieldChange = (value: string | null) => {
		updateFormValues({
			valueField: (value ?? null) as WidgetFormValues['valueField'],
		});
		setManualCompatibility((current) => ({ ...current, resultType: false }));
	};

	const handleGroupByChange = (value: string | null) => {
		updateFormValues({
			groupBy: value ?? null,
		});
	};

	const handleResultTypeChange = (value: string | null) => {
		if (!value) {
			setManualCompatibility((current) => ({ ...current, resultType: false }));
			updateFormValues({
				resultType: null,
			});
			return;
		}

		setManualCompatibility((current) => ({ ...current, resultType: true }));
		updateFormValues({
			resultType: value as WidgetFormValues['resultType'],
		});
	};

	const handleViewValueFormatChange = (value: string | null) => {
		updateFormValues({
			viewValueFormat: value ?? null,
		});
	};

	const handleDefaultFilterKeyChange = (
		index: number,
		value: string | null
	) => {
		const nextKey = typeof value === 'string' ? value.trim() || null : null;
		const nextDefaultFilters = form.values.defaultFilters.map(
			(row, rowIndex) => {
				if (rowIndex !== index) {
					return row;
				}

				if (!nextKey) {
					return resetFilterRow(row);
				}

				return {
					...row,
					key: nextKey,
				};
			}
		);

		const nextValues: WidgetFormValues = {
			...form.values,
			defaultFilters: nextDefaultFilters,
		};
		const inferredValueType = nextKey
			? inferFilterValueType(
					nextValues,
					nextKey,
					metricKeyOptions,
					parsedMetricColumns.conversation,
					parsedMetricColumns.disposition
				)
			: null;

		if (inferredValueType) {
			nextDefaultFilters[index] = {
				...nextDefaultFilters[index],
				valueType: inferredValueType,
				value: normalizeFilterValueForType(
					inferredValueType,
					nextDefaultFilters[index].value
				),
			};
		}

		updateFormValues({
			defaultFilters: nextDefaultFilters,
		});
	};

	const handleSizePresetChange = (nextPreset: string | null) => {
		if (!nextPreset) {
			return;
		}

		setSizePreset(nextPreset as DashboardWidgetSizePreset);
		setSizePresetTouched(true);

		if (nextPreset === 'CUSTOM') {
			return;
		}

		const nextDimensions = getWidgetDimensionsForPreset(
			nextPreset as DashboardWidgetSizePreset
		);

		form.setValues({
			...form.values,
			width: nextDimensions.width,
			height: nextDimensions.height,
		});
	};

	const renderFilterValueInput = (row: WidgetFilterFormRow, index: number) => {
		if (row.valueType === 'boolean') {
			return (
				<Select
					label={t('dashboardBuilder.form.fields.defaultFilterValue')}
					data={[
						{
							value: 'true',
							label: t('dashboardBuilder.form.options.boolean.true'),
						},
						{
							value: 'false',
							label: t('dashboardBuilder.form.options.boolean.false'),
						},
					]}
					allowDeselect={false}
					clearable
					value={form.values.defaultFilters[index]?.value ?? null}
					onChange={(value) =>
						form.setFieldValue(`defaultFilters.${index}.value`, value ?? null)
					}
				/>
			);
		}

		return (
			<TextInput
				label={t('dashboardBuilder.form.fields.defaultFilterValue')}
				disabled={row.valueType === 'null'}
				placeholder={t('dashboardBuilder.form.placeholders.defaultFilterValue')}
				value={form.values.defaultFilters[index]?.value ?? ''}
				onChange={(event) =>
					form.setFieldValue(
						`defaultFilters.${index}.value`,
						event.currentTarget.value
					)
				}
			/>
		);
	};

	const dividerLabelStyles = {
		label: {
			fontSize: '0.72rem',
			fontWeight: 600 as const,
			color: 'var(--mantine-color-gray-5)',
			letterSpacing: '0.04em',
			textTransform: 'uppercase' as const,
			paddingRight: '0.5rem',
		},
	};

	return (
		<form onSubmit={handleSubmit} className={styles.modalForm}>
			<div className={styles.layout}>
				{/* ── LEFT COLUMN ── */}
				<Stack gap={0} className={styles.formColumn}>
					{/* Widget section */}
					<div className={styles.compactSection}>
						<SegmentedControl
							value={form.values.widgetType}
							onChange={handleWidgetTypeChange}
							data={widgetTypeControlOptions}
							size='xs'
							radius='md'
							fullWidth
							withItemsBorders={false}
							transitionDuration={140}
							transitionTimingFunction='ease'
							classNames={{
								root: styles.segmentedRoot,
								control: styles.segmentedControl,
								label: styles.segmentedLabel,
								indicator: styles.segmentedIndicator,
							}}
						/>
						<SimpleGrid cols={{ base: 1, sm: 2 }} spacing='xs'>
							<TextInput
								label={t('dashboardBuilder.form.fields.widgetTitle')}
								value={form.values.title}
								size='sm'
								onChange={(event) => {
									setTitleTouched(true);
									form.setFieldValue('title', event.currentTarget.value);
								}}
								description={
									!titleTouched && guidedState.titleSuggestion
										? t('dashboardBuilder.form.autoTitleHint', {
												title: guidedState.titleSuggestion,
											})
										: undefined
								}
							/>
							<Select
								label={t('dashboardBuilder.form.fields.widgetSize')}
								data={sizePresetOptions}
								allowDeselect={false}
								value={sizePreset}
								size='sm'
								onChange={handleSizePresetChange}
							/>
						</SimpleGrid>
						<Textarea
							label={t('dashboardBuilder.form.fields.widgetDescriptionShort')}
							minRows={1}
							autosize
							maxRows={2}
							size='sm'
							{...form.getInputProps('description')}
						/>
					</div>

					{/* Data source section */}
					<Divider
						label={t('dashboardBuilder.form.guidedSections.metricTitle')}
						labelPosition='left'
						className={styles.sectionDivider}
						styles={dividerLabelStyles}
					/>
					<div className={styles.compactSection}>
						<SegmentedControl
							value={form.values.sourceType}
							onChange={handleSourceTypeChange}
							data={sourceTypeControlOptions}
							size='xs'
							radius='md'
							fullWidth
							withItemsBorders={false}
							transitionDuration={140}
							transitionTimingFunction='ease'
							classNames={{
								root: styles.segmentedRoot,
								control: styles.segmentedControl,
								label: styles.segmentedLabel,
								indicator: styles.segmentedIndicator,
							}}
						/>
						<SimpleGrid
							cols={{ base: 1, sm: needsValueField ? 3 : 2 }}
							spacing='xs'
						>
							<Select
								label={t('dashboardBuilder.form.fields.aggregationType')}
								data={aggregationOptions}
								allowDeselect={false}
								size='sm'
								value={form.values.aggregationType}
								onChange={handleAggregationTypeChange}
							/>
							{isAttributeMetric ? (
								<Select
									label={t('dashboardBuilder.form.fields.metricKey')}
									data={metricKeyOptions}
									searchable
									clearable
									size='sm'
									disabled={!campaignId || isCampaignLoading}
									placeholder={
										campaignId
											? isCampaignLoading
												? t(
														'dashboardBuilder.form.placeholders.loadingMetricKeys'
													)
												: t('dashboardBuilder.form.placeholders.metricKey')
											: t(
													'dashboardBuilder.form.placeholders.metricKeyUnavailable'
												)
									}
									value={form.values.metricKey}
									onChange={handleMetricKeyChange}
								/>
							) : (
								<Select
									label={t('dashboardBuilder.form.fields.fieldName')}
									data={fieldNameOptions}
									searchable
									clearable
									size='sm'
									disabled={isMetricColumnsLoading}
									placeholder={t(
										'dashboardBuilder.form.placeholders.fieldName'
									)}
									value={form.values.fieldName}
									onChange={handleFieldNameChange}
								/>
							)}
							{needsValueField ? (
								<Select
									label={t('dashboardBuilder.form.fields.valueField')}
									data={valueFieldOptions}
									allowDeselect={false}
									size='sm'
									value={form.values.valueField}
									onChange={handleValueFieldChange}
								/>
							) : null}
						</SimpleGrid>
						<Group gap='xs'>
							<Badge variant='light' color='gray'>
								{guidedState.sourceLabel}
							</Badge>
							<Badge variant='light' color='gray'>
								{guidedState.aggregationLabel}
							</Badge>
							{guidedState.metricLabel ? (
								<Badge variant='light' color='dark'>
									{guidedState.metricLabel}
								</Badge>
							) : null}
						</Group>
					</div>

					{/* Breakdown section (conditional) */}
					{needsGroupedConfig ? (
						<>
							<Divider
								label={t('dashboardBuilder.form.guidedSections.breakdownTitle')}
								labelPosition='left'
								className={styles.sectionDivider}
								styles={dividerLabelStyles}
							/>
							<div className={styles.compactSection}>
								<SimpleGrid cols={{ base: 1, sm: 2 }} spacing='xs'>
									<Autocomplete
										label={t('dashboardBuilder.form.fields.groupBy')}
										placeholder={
											isAttributeMetric
												? t(
														'dashboardBuilder.form.placeholders.groupByAttribute'
													)
												: t('dashboardBuilder.form.placeholders.groupBy')
										}
										data={groupBySuggestions}
										clearable
										size='sm'
										disabled={groupByIsDerived}
										value={
											groupByIsDerived
												? getResolvedGroupBy(form.values)
												: (form.values.groupBy ?? '')
										}
										onChange={handleGroupByChange}
									/>
									<NumberInput
										label={t('dashboardBuilder.form.fields.limit')}
										placeholder={t('dashboardBuilder.form.placeholders.limit')}
										min={1}
										size='sm'
										{...form.getInputProps('limit')}
									/>
								</SimpleGrid>
								{guidedState.compatibility.compatibilityNoticeKey ? (
									<Alert
										variant='light'
										color='red'
										icon={<IconInfoCircle size={16} />}
									>
										{t(guidedState.compatibility.compatibilityNoticeKey)}
									</Alert>
								) : null}
							</div>
						</>
					) : null}

					{/* Advanced section */}
					<Divider
						label={
							<Group gap={6} align='center'>
								<Button
									type='button'
									variant='subtle'
									size='compact-xs'
									rightSection={
										advancedOpened ? (
											<IconChevronUp size={11} />
										) : (
											<IconChevronDown size={11} />
										)
									}
									onClick={() => setAdvancedOpened((current) => !current)}
									px={4}
									c='gray.6'
								>
									{t('dashboardBuilder.form.guidedSections.advancedTitle')}
								</Button>
								{advancedSettingsCount > 0 && !advancedOpened ? (
									<Badge size='xs' variant='filled' color='blue' circle>
										{advancedSettingsCount}
									</Badge>
								) : null}
							</Group>
						}
						labelPosition='left'
						className={styles.sectionDivider}
					/>
					<Collapse in={advancedOpened}>
						<div className={styles.compactSection}>
							<SimpleGrid cols={{ base: 1, sm: 2 }} spacing='xs'>
								<Select
									label={t('dashboardBuilder.form.fields.resultType')}
									data={resultTypeOptions}
									allowDeselect={false}
									clearable
									size='sm'
									value={form.values.resultType ?? ''}
									onChange={handleResultTypeChange}
								/>
								<TextInput
									label={t('dashboardBuilder.form.fields.viewColor')}
									placeholder={t(
										'dashboardBuilder.form.placeholders.viewColor'
									)}
									size='sm'
									{...form.getInputProps('viewColor')}
								/>
							</SimpleGrid>
							<SimpleGrid cols={{ base: 1, sm: 3 }} spacing='xs'>
								<Switch
									label={t('dashboardBuilder.form.fields.supportsGroupBy')}
									checked={form.values.supportsGroupBy}
									onChange={(event) => {
										setManualCompatibility((current) => ({
											...current,
											supportsGroupBy: true,
										}));
										form.setFieldValue(
											'supportsGroupBy',
											event.currentTarget.checked
										);
									}}
								/>
								<Switch
									label={t('dashboardBuilder.form.fields.supportsTimeSeries')}
									checked={form.values.supportsTimeSeries}
									onChange={(event) => {
										setManualCompatibility((current) => ({
											...current,
											supportsTimeSeries: true,
										}));
										form.setFieldValue(
											'supportsTimeSeries',
											event.currentTarget.checked
										);
									}}
								/>
								<Switch
									label={t('dashboardBuilder.form.fields.enabled')}
									checked={form.values.enabled}
									onChange={(event) =>
										form.setFieldValue('enabled', event.currentTarget.checked)
									}
								/>
							</SimpleGrid>
							<SimpleGrid cols={{ base: 1, sm: 2 }} spacing='xs'>
								<Select
									label={t('dashboardBuilder.form.fields.viewValueFormat')}
									data={viewValueFormatOptions}
									clearable
									size='sm'
									placeholder={t(
										'dashboardBuilder.form.placeholders.viewValueFormat'
									)}
									value={form.values.viewValueFormat}
									onChange={handleViewValueFormatChange}
								/>
								{needsGroupedConfig ? (
									<Switch
										label={t('dashboardBuilder.form.fields.viewLegend')}
										checked={form.values.viewLegend}
										onChange={(event) =>
											form.setFieldValue(
												'viewLegend',
												event.currentTarget.checked
											)
										}
									/>
								) : (
									<div />
								)}
							</SimpleGrid>

							<div className={styles.advancedFilters}>
								<Group justify='space-between' align='center'>
									<Text fw={600} size='sm'>
										{t('dashboardBuilder.form.sections.filtersTitle')}
									</Text>
									<Button
										type='button'
										variant='subtle'
										size='compact-sm'
										leftSection={<IconPlus size={14} />}
										onClick={addDefaultFilterRow}
									>
										{t('dashboardBuilder.form.actions.addFilter')}
									</Button>
								</Group>
								<Stack gap='xs'>
									{form.values.defaultFilters.map((row, index) => (
										<div key={row.id} className={styles.filterRow}>
											<SimpleGrid cols={{ base: 1, sm: 4 }} spacing='xs'>
												<Autocomplete
													label={t(
														'dashboardBuilder.form.fields.defaultFilterKey'
													)}
													data={filterKeySuggestions}
													clearable
													placeholder={t(
														'dashboardBuilder.form.placeholders.defaultFilterKey'
													)}
													value={row.key ?? ''}
													onChange={(value) =>
														handleDefaultFilterKeyChange(index, value)
													}
												/>
												<Select
													label={t(
														'dashboardBuilder.form.fields.defaultFilterType'
													)}
													data={filterValueTypeOptions}
													allowDeselect={false}
													clearable
													value={row.valueType ?? undefined}
													onChange={(value) => {
														const nextValueType =
															(value as
																| WidgetFilterFormRow['valueType']
																| null) ?? null;
														form.setFieldValue(
															`defaultFilters.${index}.valueType`,
															nextValueType
														);
														if (nextValueType === 'boolean') {
															form.setFieldValue(
																`defaultFilters.${index}.value`,
																'true'
															);
														}
														if (
															nextValueType === 'null' ||
															nextValueType === null
														) {
															form.setFieldValue(
																`defaultFilters.${index}.value`,
																null
															);
														}
														if (nextValueType === 'number') {
															const currentValue =
																form.values.defaultFilters[index]?.value ?? '';
															if (
																!currentValue.trim() ||
																!Number.isFinite(Number(currentValue))
															) {
																form.setFieldValue(
																	`defaultFilters.${index}.value`,
																	null
																);
															}
														}
													}}
												/>
												{renderFilterValueInput(row, index)}
												<Group justify='flex-end' align='end'>
													<ActionIcon
														type='button'
														variant='subtle'
														color='red'
														onClick={() => removeDefaultFilterRow(index)}
														aria-label={t(
															'dashboardBuilder.form.actions.removeFilter'
														)}
													>
														<IconTrash size={16} />
													</ActionIcon>
												</Group>
											</SimpleGrid>
										</div>
									))}
								</Stack>
							</div>
						</div>
					</Collapse>
				</Stack>

				{/* ── RIGHT COLUMN: Preview panel ── */}
				<div className={`${styles.previewColumn} ${styles.previewPanel}`}>
					<div className={styles.metaBadges}>
						<Badge variant='light' color='gray' size='sm'>
							{t(`dashboardBuilder.form.sizePresets.${sizePreset}`)}
						</Badge>
						<Badge variant='light' color='gray' size='sm'>
							{t(`dashboardBuilder.widgetTypes.${form.values.widgetType}`)}
						</Badge>
					</div>
					<DashboardWidgetPreview
						campaignId={campaignId}
						fallbackPreview={guidedState.preview}
						values={form.values}
						widgetType={form.values.widgetType}
					/>
					<Text size='xs' c='dimmed'>
						{t('dashboardBuilder.form.layoutPlacement', {
							column: placementLayout.positionX + 1,
							row: placementLayout.positionY + 1,
						})}
					</Text>
				</div>
			</div>

			<div className={styles.formFooter}>
				<Group justify='flex-end' gap='xs'>
					<Button type='button' variant='default' size='sm' onClick={onCancel}>
						{t('dashboardBuilder.form.actions.cancel')}
					</Button>
					<Button
						type='submit'
						size='sm'
						loading={
							createDashboardWidget.isPending || updateDashboardWidget.isPending
						}
					>
						{isEditing
							? t('dashboardBuilder.form.actions.saveWidget')
							: t('dashboardBuilder.form.actions.createWidget')}
					</Button>
				</Group>
			</div>
		</form>
	);
};

export default DashboardWidgetForm;
