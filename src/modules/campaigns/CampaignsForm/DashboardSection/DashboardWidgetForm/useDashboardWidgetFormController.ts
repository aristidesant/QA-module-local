import { useEffect, useMemo, useRef, useState } from 'react';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
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
import { getDataCollectionFromAgentConfig } from '~/modules/agent-details/AnalyticsSection/analyticsFormContext';
import { useGetCampaign } from '~/queries/campaignsQueries';
import { useGetClientConfig } from '~/queries/clientConfigQueries';
import { useGetAllRoles } from '~/queries/roleQueries';
import {
	useCreateDashboardWidget,
	useDashboardWidgets,
	useUpdateDashboardWidget,
} from '~/queries/analyticsDashboardsQueries';
import { getErrorMessage } from '~/utils/httpClient';
import type {
	WidgetFilterFormRow,
	WidgetFormValues,
	WidgetRuntimeFilterFormRow,
} from '../DashboardSection.types';
import {
	type DashboardWidgetFormCompatibility,
	type DashboardWidgetFormState,
} from './DashboardWidgetForm.context';
import {
	buildFieldOptions,
	buildGroupBySuggestions,
	buildGuidedState,
	buildWidgetDataConfig,
	buildViewConfigPayload,
	createEmptyFilterRow,
	createEmptyRuntimeFilterRow,
	getAggregationOptions,
	getDefaultWidgetSizePreset,
	getFilterKeySuggestions,
	getFilterValueTypeOptions,
	getInitialSizePreset,
	getMetricSourceOptions,
	getResultTypeOptions,
	getSizePresetOptions,
	buildRuntimeFilterFieldOptions,
	getValueFieldOptions,
	getViewValueFormatOptions,
	getWidgetTypeOptions,
	hasInvalidDefaultFilterRows,
	hasInvalidRuntimeFilterRows,
	inferFilterValueType,
	isGroupByDerivedFromSourceField,
	isMetricSelectionReady,
	parseMetricColumnsConfig,
	requiresValueField,
	sanitizeWidgetDefaultFilters,
	sanitizeWidgetRuntimeFilters,
	getResolvedGroupBy,
	getSourceFieldEntries,
	isAbandonedRateMetric,
	normalizeWidgetFilterValueForType,
	resetWidgetFilterRow,
	resetRuntimeFilterRow,
	sanitizeAbandonedRateRuntimeFilters,
	supportsCompareWithWidget,
	supportsGroupedWidget,
	supportsTimeSeriesWidget,
	widgetFormValues,
} from './DashboardWidgetForm.helpers';

const METRIC_COLUMNS_CONFIG_KEY = 'metric_columns';

type DashboardWidgetFormControllerProps = {
	campaignId: number | null;
	attributeMetricKeys?: string[];
	dashboardId: number;
	widget?: DashboardWidget | null;
	onCancel: () => void;
	onSuccess: () => void;
};

const useDashboardWidgetFormController = ({
	campaignId,
	attributeMetricKeys = [],
	dashboardId,
	widget,
	onCancel,
	onSuccess,
}: DashboardWidgetFormControllerProps) => {
	const { t } = useTranslation(['campaign.form.dashboards', 'common']);
	const createDashboardWidget = useCreateDashboardWidget();
	const updateDashboardWidget = useUpdateDashboardWidget();
	const { data: existingWidgets = [] } = useDashboardWidgets(dashboardId);
	const { data: metricColumnsConfig, isLoading: isMetricColumnsLoading } =
		useGetClientConfig(METRIC_COLUMNS_CONFIG_KEY);
	const { data: roles = [], isLoading: isRolesLoading } = useGetAllRoles();
	const isEditing = Boolean(widget?.id);
	const isGlobalDashboard = campaignId === null;
	const initialValues = widgetFormValues(widget);
	const [values, setValues] = useState<WidgetFormValues>(initialValues);
	const [titleTouched, setTitleTouched] = useState(
		Boolean(widget?.title?.trim())
	);
	const [titleInputRevision, setTitleInputRevision] = useState(0);
	const [advancedOpened, setAdvancedOpened] = useState(false);
	const [sizePreset, setSizePreset] = useState<DashboardWidgetSizePreset>(
		getInitialSizePreset(widget)
	);
	const [sizePresetTouched, setSizePresetTouched] = useState(Boolean(widget));
	const [manualCompatibility, setManualCompatibility] =
		useState<DashboardWidgetFormCompatibility>({
			resultType: Boolean(widget),
			supportsGroupBy: Boolean(widget),
			supportsTimeSeries: Boolean(widget),
		});

	const form = useForm<WidgetFormValues>({
		mode: 'uncontrolled',
		initialValues,
		validate: {
			title: (value) =>
				value.trim() ? null : t('dashboardBuilder.form.validation.widgetTitle'),
			fieldName: (value, currentValues) =>
				!currentValues.presetEnabled &&
				currentValues.sourceType !== 'ATTRIBUTE' &&
				!(typeof value === 'string' ? value.trim() : '')
					? t('dashboardBuilder.form.validation.fieldNameRequired')
					: null,
			metricKey: (value, currentValues) =>
				!currentValues.presetEnabled &&
				currentValues.sourceType === 'ATTRIBUTE' &&
				!(typeof value === 'string' ? value.trim() : '')
					? t('dashboardBuilder.form.validation.metricKeyRequired')
					: null,
			valueField: (value, currentValues) =>
				!currentValues.presetEnabled &&
				requiresValueField(
					currentValues.sourceType,
					currentValues.aggregationType
				) &&
				!value
					? t('dashboardBuilder.form.validation.valueFieldRequired')
					: null,
			groupBy: (value, currentValues) =>
				!currentValues.presetEnabled &&
				supportsGroupedWidget(currentValues.widgetType) &&
				!getResolvedGroupBy({ ...currentValues, groupBy: value })
					? t('dashboardBuilder.form.validation.groupByRequired')
					: null,
			presetKind: (value, currentValues) =>
				currentValues.presetEnabled && !currentValues.presetAlias && !value
					? t('dashboardBuilder.form.validation.preset.kindRequired')
					: null,
			presetSource: (value, currentValues) =>
				currentValues.presetEnabled && !currentValues.presetAlias && !value
					? t('dashboardBuilder.form.validation.preset.sourceRequired')
					: null,
			presetField: (value, currentValues) =>
				currentValues.presetEnabled &&
				!currentValues.presetAlias &&
				!(typeof value === 'string' ? value.trim() : '')
					? t('dashboardBuilder.form.validation.preset.fieldRequired')
					: null,
			presetValues: (value, currentValues) =>
				currentValues.presetEnabled &&
				!currentValues.presetAlias &&
				currentValues.presetKind === 'COUNT' &&
				(!Array.isArray(value) || value.length === 0)
					? t('dashboardBuilder.form.validation.preset.valuesRequired')
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
		onValuesChange: setValues,
	});

	const sourceFieldSnapshotRef = useRef({
		sourceType: values.sourceType,
		fieldName: values.fieldName,
		metricKey: values.metricKey,
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
			enabled: Boolean(campaignId) && values.sourceType === 'ATTRIBUTE',
		});

	const metricKeyOptions = useMemo(() => {
		const campaignMetricKeys = selectedCampaign
			? Object.keys(
					getDataCollectionFromAgentConfig(
						selectedCampaign.agents?.find((a) => a.isPrincipal)?.agent
							?.config ??
							selectedCampaign.agents?.[0]?.agent?.config ??
							{}
					)
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
	const compareWithOptions = useMemo(
		() => [
			{
				value: 'LATEST',
				label: t('dashboardBuilder.form.options.compareWith.LATEST'),
			},
			{
				value: 'AVERAGE',
				label: t('dashboardBuilder.form.options.compareWith.AVERAGE'),
			},
		],
		[t]
	);
	const roleOptions = useMemo(
		() => [
			...roles
				.filter((role) => role.isActive)
				.map((role) => ({
					value: String(role.id),
					label: role.name,
				})),
			...((widget?.roles ?? [])
				.filter(
					(role) => !roles.some((loadedRole) => loadedRole.id === role.id)
				)
				.map((role) => ({
					value: String(role.id),
					label: role.name,
				})) ?? []),
		],
		[roles, widget?.roles]
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
			buildGuidedState(values, {
				metricKeyOptions,
				conversationFields: parsedMetricColumns.conversation,
				dispositionFields: parsedMetricColumns.disposition,
				sizePreset,
				isGlobalDashboard,
				t,
			}),
		[
			values,
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
					sourceType: values.sourceType,
					aggregationType: values.aggregationType,
					fieldName: values.fieldName,
					metricKey: values.metricKey,
					supportsGroupBy: values.supportsGroupBy,
					supportsTimeSeries: values.supportsTimeSeries,
				},
				metricKeyOptions.map((option) => option.value),
				conversationFieldValues,
				dispositionFieldValues
			),
		[
			conversationFieldValues,
			dispositionFieldValues,
			metricKeyOptions,
			values.aggregationType,
			values.fieldName,
			values.metricKey,
			values.sourceType,
			values.supportsGroupBy,
			values.supportsTimeSeries,
		]
	);

	const filterKeySuggestions = useMemo(
		() =>
			getFilterKeySuggestions(
				values,
				metricKeyOptions,
				parsedMetricColumns.conversation,
				parsedMetricColumns.disposition
			),
		[
			values,
			metricKeyOptions,
			parsedMetricColumns.conversation,
			parsedMetricColumns.disposition,
		]
	);

	const runtimeFilterFieldOptions = useMemo(
		() =>
			buildRuntimeFilterFieldOptions(
				values,
				metricKeyOptions,
				parsedMetricColumns.conversation,
				parsedMetricColumns.disposition
			),
		[
			values.sourceType,
			metricKeyOptions,
			parsedMetricColumns.conversation,
			parsedMetricColumns.disposition,
		]
	);

	const needsGroupedConfig = guidedState.compatibility.isGroupedWidget;
	const needsTimeSeriesMetric = supportsTimeSeriesWidget(values.widgetType);
	const needsValueField = guidedState.compatibility.requiresValueField;
	const groupByIsDerived = isGroupByDerivedFromSourceField(values);
	const isAttributeMetric = values.sourceType === 'ATTRIBUTE';
	const fieldNameOptions = isAttributeMetric
		? []
		: values.sourceType === 'DISPOSITION'
			? dispositionFieldOptions
			: conversationFieldOptions;

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
				{ width: values.width, height: values.height },
				widget?.id ? { excludeId: widget.id } : undefined
			),
		[existingWidgets, values.height, values.width, widget?.id]
	);

	const advancedSettingsCount = useMemo(() => {
		let count = 0;
		if (
			typeof values.viewValueFormat === 'string' &&
			values.viewValueFormat.trim()
		) {
			count += 1;
		}
		if (!values.enabled) count += 1;
		if (
			manualCompatibility.resultType &&
			values.resultType !== guidedState.compatibility.inferredResultType
		) {
			count += 1;
		}
		if (
			supportsCompareWithWidget(values.widgetType) &&
			values.compareWith !== 'LATEST'
		) {
			count += 1;
		}
		if (
			manualCompatibility.supportsGroupBy &&
			values.supportsGroupBy !==
				guidedState.compatibility.inferredSupportsGroupBy
		) {
			count += 1;
		}
		if (
			manualCompatibility.supportsTimeSeries &&
			values.supportsTimeSeries !==
				guidedState.compatibility.inferredSupportsTimeSeries
		) {
			count += 1;
		}
		count += values.runtimeFilters.filter((row) => {
			const hasField = (row.field ?? '').trim().length > 0;
			const hasValue = Array.isArray(row.value)
				? row.value.some((item) => item.trim().length > 0)
				: typeof row.value === 'string'
					? row.value.trim().length > 0
					: false;

			return hasField || Boolean(row.operator) || hasValue;
		}).length;
		return count;
	}, [manualCompatibility, guidedState.compatibility, values]);

	useEffect(() => {
		const nextValues = widgetFormValues(widget);
		const sanitizedValues = {
			...nextValues,
			defaultFilters: sanitizeWidgetDefaultFilters(
				nextValues,
				metricKeyOptions,
				parsedMetricColumns.conversation,
				parsedMetricColumns.disposition
			),
			runtimeFilters: sanitizeWidgetRuntimeFilters(
				nextValues,
				metricKeyOptions,
				parsedMetricColumns.conversation,
				parsedMetricColumns.disposition
			),
		};
		const shouldApplyTitleSuggestion =
			!Boolean(widget?.title?.trim()) && Boolean(guidedState.titleSuggestion);

		if (shouldApplyTitleSuggestion) {
			sanitizedValues.title = guidedState.titleSuggestion;
		}

		form.setValues(sanitizedValues);
		form.resetDirty(sanitizedValues);
		setTitleTouched(Boolean(widget?.title?.trim()));
		setTitleInputRevision((current) => current + 1);
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

		const nextPreset = getDefaultWidgetSizePreset(values.widgetType);
		const nextDimensions = getWidgetDimensionsForPreset(nextPreset);

		if (sizePreset !== nextPreset) {
			setSizePreset(nextPreset);
		}

		if (
			values.width !== nextDimensions.width ||
			values.height !== nextDimensions.height
		) {
			form.setValues({
				...values,
				width: nextDimensions.width,
				height: nextDimensions.height,
			});
		}
	}, [
		form,
		sizePreset,
		sizePresetTouched,
		values,
		values.height,
		values.widgetType,
		values.width,
	]);

	useEffect(() => {
		const previousSnapshot = sourceFieldSnapshotRef.current;
		const currentSnapshot = {
			sourceType: values.sourceType,
			fieldName: values.fieldName,
			metricKey: values.metricKey,
		};
		const sourceFieldChanged =
			previousSnapshot.sourceType !== currentSnapshot.sourceType ||
			previousSnapshot.fieldName !== currentSnapshot.fieldName ||
			previousSnapshot.metricKey !== currentSnapshot.metricKey;

		if (!sourceFieldChanged) {
			return;
		}

		sourceFieldSnapshotRef.current = currentSnapshot;
	}, [values.fieldName, values.metricKey, values.sourceType]);

	useEffect(() => {
		const nextValues: Partial<WidgetFormValues> = {};
		const effectiveSourceType =
			isGlobalDashboard && values.sourceType === 'ATTRIBUTE'
				? 'CONVERSATION'
				: values.sourceType;

		if (effectiveSourceType !== values.sourceType) {
			nextValues.sourceType = effectiveSourceType;
			nextValues.defaultFilters = [createEmptyFilterRow()];
		}

		if (effectiveSourceType === 'ATTRIBUTE') {
			if (values.fieldName !== null) {
				nextValues.fieldName = null;
			}
		} else if (values.metricKey !== null) {
			nextValues.metricKey = null;
		}

		if (!needsValueField && values.valueField !== null) {
			nextValues.valueField = null;
		}

		if (needsGroupedConfig) {
			const resolvedGroupBy = getResolvedGroupBy(values);
			const currentGroupBy =
				typeof values.groupBy === 'string' ? values.groupBy.trim() : '';

			if (currentGroupBy !== resolvedGroupBy) {
				nextValues.groupBy = resolvedGroupBy;
			}
		} else if (values.groupBy !== null) {
			nextValues.groupBy = null;
		}

		if (!needsGroupedConfig) {
			if (values.limit !== '') {
				nextValues.limit = '';
			}

			if (!values.viewLegend) {
				nextValues.viewLegend = true;
			}
		}

		if (
			!manualCompatibility.supportsGroupBy &&
			values.supportsGroupBy !==
				guidedState.compatibility.inferredSupportsGroupBy
		) {
			nextValues.supportsGroupBy =
				guidedState.compatibility.inferredSupportsGroupBy;
		}

		if (
			!manualCompatibility.supportsTimeSeries &&
			values.supportsTimeSeries !==
				guidedState.compatibility.inferredSupportsTimeSeries
		) {
			nextValues.supportsTimeSeries =
				guidedState.compatibility.inferredSupportsTimeSeries;
		}

		if (
			!manualCompatibility.resultType &&
			isMetricSelectionReady(values) &&
			values.resultType !== guidedState.compatibility.inferredResultType
		) {
			nextValues.resultType = guidedState.compatibility.inferredResultType;
		}

		if (
			!titleTouched &&
			guidedState.titleSuggestion &&
			values.title !== guidedState.titleSuggestion
		) {
			nextValues.title = guidedState.titleSuggestion;
			setTitleInputRevision((current) => current + 1);
		}

		if (Object.keys(nextValues).length === 0) {
			return;
		}

		form.setValues({
			...values,
			...nextValues,
		});
	}, [
		form,
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
		values,
	]);

	const updateFormValues = (patch: Partial<WidgetFormValues>) => {
		form.setValues({
			...form.getValues(),
			...patch,
		});
	};

	const handleSubmit = form.onSubmit(async (submitValues) => {
		if (!submitValues.presetEnabled) {
			if (isGlobalDashboard && submitValues.sourceType === 'ATTRIBUTE') {
				form.setFieldError(
					'sourceType',
					t('dashboardBuilder.form.validation.attributeNotAvailable')
				);
				return;
			}

			if (needsGroupedConfig && !submitValues.supportsGroupBy) {
				form.setFieldError(
					'groupBy',
					t('dashboardBuilder.form.validation.metricMustSupportGroupBy')
				);
				return;
			}

			if (needsTimeSeriesMetric && !submitValues.supportsTimeSeries) {
				form.setFieldError(
					'widgetType',
					t('dashboardBuilder.form.validation.metricMustSupportTimeSeries')
				);
				return;
			}

			if (hasInvalidDefaultFilterRows(submitValues.defaultFilters)) {
				notifications.show({
					title: t('dashboardBuilder.notifications.errorTitle'),
					message: t('dashboardBuilder.form.validation.defaultFilterInvalid'),
					color: 'red',
				});
				return;
			}

			if (
				hasInvalidRuntimeFilterRows(
					submitValues.runtimeFilters,
					submitValues,
					metricKeyOptions,
					parsedMetricColumns.conversation,
					parsedMetricColumns.disposition
				)
			) {
				notifications.show({
					title: t('dashboardBuilder.notifications.errorTitle'),
					message: t('dashboardBuilder.form.validation.runtimeFilterInvalid'),
					color: 'red',
				});
				return;
			}
		}

		const trimmedRoleIds = Array.from(new Set(submitValues.roleIds));
		const payload: CreateDashboardWidgetDto | UpdateDashboardWidgetDto = {
			...normalizeWidgetLayout({
				positionX: placementLayout.positionX,
				positionY: placementLayout.positionY,
				width: submitValues.width,
				height: submitValues.height,
			}),
			dashboardId,
			widgetType: submitValues.widgetType,
			title: submitValues.title.trim(),
			description: submitValues.description.trim() || undefined,
			enabled: submitValues.enabled,
			visibilityScope: submitValues.visibilityScope,
			dataConfig: buildWidgetDataConfig(submitValues, {
				metricKeyOptions,
				conversationFields: parsedMetricColumns.conversation,
				dispositionFields: parsedMetricColumns.disposition,
			}),
			viewConfig: buildViewConfigPayload(submitValues),
			...(isEditing || trimmedRoleIds.length > 0
				? { roleIds: trimmedRoleIds }
				: {}),
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

	const handleWidgetTypeChange = (value: string | null) => {
		if (!value) {
			return;
		}

		const nextWidgetType = value as WidgetFormValues['widgetType'];
		const nextValues: WidgetFormValues = {
			...form.getValues(),
			widgetType: nextWidgetType,
		};

		if (!supportsCompareWithWidget(nextWidgetType)) {
			nextValues.compareWith = 'LATEST';
		}

		if (!supportsGroupedWidget(nextWidgetType)) {
			nextValues.groupBy = null;
			nextValues.limit = '';
		}

		if (nextWidgetType !== 'KPI' && nextValues.presetEnabled) {
			nextValues.presetEnabled = false;
			nextValues.presetAlias = null;
			nextValues.presetKind = null;
			nextValues.presetSource = null;
			nextValues.presetField = null;
			nextValues.presetValues = [];
			nextValues.presetDisplayLabel = '';
			nextValues.includeChildren = false;
		}

		updateFormValues(nextValues);
	};

	const handlePresetEnabledChange = (enabled: boolean) => {
		const nextValues: WidgetFormValues = {
			...form.getValues(),
			presetEnabled: enabled,
		};
		if (enabled) {
			nextValues.fieldName = null;
			nextValues.metricKey = null;
			nextValues.valueField = null;
			nextValues.resultType = null;
			nextValues.defaultFilters = [createEmptyFilterRow()];
			nextValues.runtimeFilters = [createEmptyRuntimeFilterRow()];
			nextValues.includeChildren = true;
		} else {
			nextValues.presetAlias = null;
			nextValues.presetKind = null;
			nextValues.presetSource = null;
			nextValues.presetField = null;
			nextValues.presetValues = [];
			nextValues.presetDisplayLabel = '';
			nextValues.includeChildren = false;
		}
		updateFormValues(nextValues);
		setManualCompatibility({
			resultType: false,
			supportsGroupBy: false,
			supportsTimeSeries: false,
		});
	};

	const handlePresetAliasChange = (value: string | null) => {
		const nextValues: WidgetFormValues = {
			...form.getValues(),
			presetAlias: value as WidgetFormValues['presetAlias'],
			presetKind: null,
			presetSource: null,
			presetField: null,
			presetValues: [],
			includeChildren: false,
		};
		updateFormValues(nextValues);
	};

	const handlePresetKindChange = (value: string | null) => {
		form.setFieldValue(
			'presetKind',
			(value as WidgetFormValues['presetKind']) ?? null
		);
	};

	const handlePresetSourceChange = (value: string | null) => {
		const nextValues: WidgetFormValues = {
			...form.getValues(),
			presetSource: (value as WidgetFormValues['presetSource']) ?? null,
			presetField: null,
			presetValues: [],
			includeChildren: false,
		};
		updateFormValues(nextValues);
	};

	const handlePresetFieldChange = (value: string | null) => {
		const nextValues: WidgetFormValues = {
			...form.getValues(),
			presetField: value ?? null,
			presetValues: [],
			includeChildren: value === 'dispositionName',
		};
		updateFormValues(nextValues);
	};

	const handlePresetValuesChange = (values: string[]) => {
		form.setFieldValue('presetValues', values);
	};

	const handlePresetDisplayLabelChange = (value: string) => {
		form.setFieldValue('presetDisplayLabel', value);
	};

	const handlePresetIncludeChildrenChange = (checked: boolean) => {
		form.setFieldValue('includeChildren', checked);
	};

	const handleSourceTypeChange = (value: string | null) => {
		if (!value) {
			return;
		}

		const nextSourceType = value as WidgetFormValues['sourceType'];
		const nextValues: WidgetFormValues = {
			...form.getValues(),
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
			runtimeFilters: [createEmptyRuntimeFilterRow()],
		};

		updateFormValues(nextValues);
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
			...form.getValues(),
			aggregationType: nextAggregationType,
		};

		if (!requiresValueField(nextValues.sourceType, nextAggregationType)) {
			nextValues.valueField = null;
		}

		if (isAbandonedRateMetric(nextValues)) {
			nextValues.resultType = 'PERCENT';
		}

		nextValues.runtimeFilters = sanitizeAbandonedRateRuntimeFilters(nextValues);

		updateFormValues({
			...nextValues,
			defaultFilters: sanitizeWidgetDefaultFilters(
				nextValues,
				metricKeyOptions,
				parsedMetricColumns.conversation,
				parsedMetricColumns.disposition
			),
			runtimeFilters: sanitizeWidgetRuntimeFilters(
				nextValues,
				metricKeyOptions,
				parsedMetricColumns.conversation,
				parsedMetricColumns.disposition
			),
		});
		setManualCompatibility((current) => ({ ...current, resultType: false }));
	};

	const handleMetricKeyChange = (value: string | null) => {
		const nextMetricKey = value ?? null;
		const nextValues: WidgetFormValues = {
			...form.getValues(),
			metricKey: nextMetricKey,
		};

		updateFormValues({
			...nextValues,
			defaultFilters: sanitizeWidgetDefaultFilters(
				nextValues,
				metricKeyOptions,
				parsedMetricColumns.conversation,
				parsedMetricColumns.disposition
			),
			runtimeFilters: sanitizeWidgetRuntimeFilters(
				nextValues,
				metricKeyOptions,
				parsedMetricColumns.conversation,
				parsedMetricColumns.disposition
			),
		});
		setManualCompatibility((current) => ({ ...current, resultType: false }));
	};

	const handleFieldNameChange = (value: string | null) => {
		const nextFieldName = value ?? null;
		const nextValues: WidgetFormValues = {
			...form.getValues(),
			fieldName: nextFieldName,
		};

		const selectedEntry = getSourceFieldEntries(
			nextValues.sourceType,
			parsedMetricColumns.conversation,
			parsedMetricColumns.disposition
		).find((e) => e.value === nextFieldName);

		const isTimeField =
			selectedEntry !== undefined &&
			['time', 'datetime', 'timestamp', 'date'].includes(
				selectedEntry.type.toLowerCase()
			);

		const aggregationOverridesToNumber = nextValues.aggregationType === 'COUNT';

		if (isTimeField && aggregationOverridesToNumber) {
			nextValues.aggregationType = 'MIN';
		}

		if (isAbandonedRateMetric(nextValues)) {
			nextValues.resultType = 'PERCENT';
		}

		nextValues.runtimeFilters = sanitizeAbandonedRateRuntimeFilters(nextValues);

		updateFormValues({
			...nextValues,
			defaultFilters: sanitizeWidgetDefaultFilters(
				nextValues,
				metricKeyOptions,
				parsedMetricColumns.conversation,
				parsedMetricColumns.disposition
			),
			runtimeFilters: sanitizeWidgetRuntimeFilters(
				nextValues,
				metricKeyOptions,
				parsedMetricColumns.conversation,
				parsedMetricColumns.disposition
			),
		});
		setManualCompatibility((current) => ({ ...current, resultType: false }));
	};

	const handleValueFieldChange = (value: string | null) => {
		updateFormValues({
			valueField: (value ?? null) as WidgetFormValues['valueField'],
		});
		setManualCompatibility((current) => ({ ...current, resultType: false }));
	};

	const handleCompareWithChange = (value: string | null) => {
		updateFormValues({
			compareWith: (value ?? 'LATEST') as WidgetFormValues['compareWith'],
		});
	};

	const handleGroupByChange = (value: string | null) => {
		updateFormValues({
			groupBy: value ?? null,
		});
	};

	const handleResultTypeChange = (value: string | null) => {
		if (isAbandonedRateMetric(form.getValues())) {
			setManualCompatibility((current) => ({ ...current, resultType: true }));
			updateFormValues({
				resultType: 'PERCENT',
			});
			return;
		}

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
		const nextDefaultFilters = values.defaultFilters.map((row, rowIndex) => {
			if (rowIndex !== index) {
				return row;
			}

			if (!nextKey) {
				return resetWidgetFilterRow(row);
			}

			return {
				...row,
				key: nextKey,
			};
		});

		const nextValues: WidgetFormValues = {
			...form.getValues(),
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
				value: normalizeWidgetFilterValueForType(
					inferredValueType,
					nextDefaultFilters[index].value
				),
			};
		}

		updateFormValues({
			defaultFilters: nextDefaultFilters,
		});
	};

	const handleDefaultFilterTypeChange = (
		index: number,
		value: string | null
	) => {
		const nextValueType = value as WidgetFilterFormRow['valueType'] | null;
		const nextDefaultFilters = values.defaultFilters.map((row, rowIndex) => {
			if (rowIndex !== index) {
				return row;
			}

			if (nextValueType === null) {
				return resetWidgetFilterRow(row);
			}

			if (nextValueType === 'boolean') {
				return {
					...row,
					valueType: nextValueType,
					value: 'true',
				};
			}

			if (nextValueType === 'null') {
				return {
					...row,
					valueType: nextValueType,
					value: '',
				};
			}

			return {
				...row,
				valueType: nextValueType,
				value: normalizeWidgetFilterValueForType(nextValueType, row.value),
			};
		});

		updateFormValues({
			defaultFilters: nextDefaultFilters,
		});
	};

	const handleDefaultFilterValueChange = (
		index: number,
		value: string | null
	) => {
		const nextDefaultFilters = values.defaultFilters.map((row, rowIndex) => {
			if (rowIndex !== index) {
				return row;
			}

			return {
				...row,
				value: value ?? null,
			};
		});

		updateFormValues({
			defaultFilters: nextDefaultFilters,
		});
	};

	const handleRuntimeFilterFieldChange = (
		index: number,
		value: string | null
	) => {
		const nextField = typeof value === 'string' ? value.trim() || null : null;
		const nextRuntimeFilters = values.runtimeFilters.map((row, rowIndex) => {
			if (rowIndex !== index) {
				return row;
			}

			if (!nextField) {
				return resetRuntimeFilterRow(row);
			}

			return {
				...row,
				field: nextField,
			};
		});

		const nextValues: WidgetFormValues = {
			...form.getValues(),
			runtimeFilters: nextRuntimeFilters,
		};

		nextValues.runtimeFilters = sanitizeAbandonedRateRuntimeFilters(nextValues);

		updateFormValues({
			runtimeFilters: sanitizeWidgetRuntimeFilters(
				nextValues,
				metricKeyOptions,
				parsedMetricColumns.conversation,
				parsedMetricColumns.disposition
			),
		});
	};

	const handleRuntimeFilterOperatorChange = (
		index: number,
		value: string | null
	) => {
		const nextOperator = value as WidgetRuntimeFilterFormRow['operator'] | null;
		const nextRuntimeFilters = values.runtimeFilters.map((row, rowIndex) => {
			if (rowIndex !== index) {
				return row;
			}

			if (!nextOperator) {
				return {
					...row,
					field: row.field,
					operator: null,
					value: null,
				};
			}

			return {
				...row,
				operator: nextOperator,
			};
		});

		const nextValues: WidgetFormValues = {
			...form.getValues(),
			runtimeFilters: nextRuntimeFilters,
		};

		nextValues.runtimeFilters = sanitizeAbandonedRateRuntimeFilters(nextValues);

		updateFormValues({
			runtimeFilters: sanitizeWidgetRuntimeFilters(
				nextValues,
				metricKeyOptions,
				parsedMetricColumns.conversation,
				parsedMetricColumns.disposition
			),
		});
	};

	const handleRuntimeFilterValueChange = (
		index: number,
		value: string | string[] | null
	) => {
		const nextRuntimeFilters = values.runtimeFilters.map((row, rowIndex) => {
			if (rowIndex !== index) {
				return row;
			}

			return {
				...row,
				value,
			};
		});

		const nextValues: WidgetFormValues = {
			...form.getValues(),
			runtimeFilters: nextRuntimeFilters,
		};

		nextValues.runtimeFilters = sanitizeAbandonedRateRuntimeFilters(nextValues);

		updateFormValues({
			runtimeFilters: sanitizeWidgetRuntimeFilters(
				nextValues,
				metricKeyOptions,
				parsedMetricColumns.conversation,
				parsedMetricColumns.disposition
			),
		});
	};

	const addRuntimeFilterRow = () => {
		form.insertListItem('runtimeFilters', createEmptyRuntimeFilterRow());
	};

	const removeRuntimeFilterRow = (index: number) => {
		if (values.runtimeFilters.length === 1) {
			form.replaceListItem(
				'runtimeFilters',
				index,
				createEmptyRuntimeFilterRow()
			);
			return;
		}

		form.removeListItem('runtimeFilters', index);
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
			...form.getValues(),
			width: nextDimensions.width,
			height: nextDimensions.height,
		});
	};

	const handleEnabledChange = (checked: boolean) => {
		form.setFieldValue('enabled', checked);
	};

	const handleVisibilityScopeChange = (value: string | null) => {
		if (!value) {
			return;
		}

		form.setFieldValue(
			'visibilityScope',
			value as WidgetFormValues['visibilityScope']
		);
	};

	const handleRoleIdsChange = (value: string[]) => {
		form.setFieldValue(
			'roleIds',
			value.map((item) => Number(item)).filter(Number.isFinite)
		);
	};

	const handleSupportsGroupByChange = (checked: boolean) => {
		setManualCompatibility((current) => ({
			...current,
			supportsGroupBy: true,
		}));
		form.setFieldValue('supportsGroupBy', checked);
	};

	const handleSupportsTimeSeriesChange = (checked: boolean) => {
		setManualCompatibility((current) => ({
			...current,
			supportsTimeSeries: true,
		}));
		form.setFieldValue('supportsTimeSeries', checked);
	};

	const handleAggregateByContactChange = (checked: boolean) => {
		form.setFieldValue('aggregateByContact', checked);
	};

	const handleViewLegendChange = (checked: boolean) => {
		form.setFieldValue('viewLegend', checked);
	};

	const handleTitleChange = (value: string) => {
		setTitleTouched(true);
		form.setFieldValue('title', value);
	};

	const state = useMemo<DashboardWidgetFormState>(
		() => ({
			campaignId,
			dashboardId,
			attributeMetricKeys,
			isEditing,
			isGlobalDashboard,
			isAttributeMetric,
			needsGroupedConfig,
			needsTimeSeriesMetric,
			needsValueField,
			groupByIsDerived,
			titleTouched,
			titleInputRevision,
			advancedOpened,
			sizePreset,
			sizePresetTouched,
			manualCompatibility,
			values,
			parsedMetricColumns,
			isCampaignLoading,
			isMetricColumnsLoading,
			isRolesLoading,
			conversationFieldOptions,
			dispositionFieldOptions,
			conversationFieldValues,
			dispositionFieldValues,
			metricKeyOptions,
			fieldNameOptions,
			widgetTypeOptions,
			metricSourceOptions,
			aggregationOptions,
			resultTypeOptions,
			valueFieldOptions,
			filterValueTypeOptions,
			viewValueFormatOptions,
			compareWithOptions,
			roleOptions,
			sizePresetOptions,
			widgetTypeControlOptions,
			sourceTypeControlOptions,
			guidedState,
			groupBySuggestions,
			filterKeySuggestions,
			runtimeFilterFieldOptions,
			placementLayout,
			advancedSettingsCount,
			handlers: {
				setAdvancedOpened,
				setTitleTouched,
				handleWidgetTypeChange,
				handleSourceTypeChange,
				handleAggregationTypeChange,
				handleMetricKeyChange,
				handleFieldNameChange,
				handleValueFieldChange,
				handleCompareWithChange,
				handleGroupByChange,
				handleResultTypeChange,
				handleViewValueFormatChange,
				handleDefaultFilterKeyChange,
				handleDefaultFilterTypeChange,
				handleDefaultFilterValueChange,
				handleRuntimeFilterFieldChange,
				handleRuntimeFilterOperatorChange,
				handleRuntimeFilterValueChange,
				handleSizePresetChange,
				handleRoleIdsChange,
				addDefaultFilterRow: () => {
					form.insertListItem('defaultFilters', createEmptyFilterRow());
				},
				removeDefaultFilterRow: (index: number) => {
					if (values.defaultFilters.length === 1) {
						form.replaceListItem(
							'defaultFilters',
							index,
							createEmptyFilterRow()
						);
						return;
					}

					form.removeListItem('defaultFilters', index);
				},
				addRuntimeFilterRow,
				removeRuntimeFilterRow,
				handleEnabledChange,
				handleVisibilityScopeChange,
				handleSupportsGroupByChange,
				handleSupportsTimeSeriesChange,
				handleAggregateByContactChange,
				handleViewLegendChange,
				handleTitleChange,
				handlePresetEnabledChange,
				handlePresetAliasChange,
				handlePresetKindChange,
				handlePresetSourceChange,
				handlePresetFieldChange,
				handlePresetValuesChange,
				handlePresetDisplayLabelChange,
				handlePresetIncludeChildrenChange,
			},
		}),
		[
			advancedOpened,
			advancedSettingsCount,
			aggregationOptions,
			attributeMetricKeys,
			campaignId,
			conversationFieldOptions,
			conversationFieldValues,
			dashboardId,
			dispositionFieldOptions,
			dispositionFieldValues,
			fieldNameOptions,
			filterKeySuggestions,
			filterValueTypeOptions,
			runtimeFilterFieldOptions,
			guidedState,
			handleAggregationTypeChange,
			handleDefaultFilterKeyChange,
			handleDefaultFilterTypeChange,
			handleDefaultFilterValueChange,
			handleRuntimeFilterFieldChange,
			handleRuntimeFilterOperatorChange,
			handleRuntimeFilterValueChange,
			addRuntimeFilterRow,
			removeRuntimeFilterRow,
			handleEnabledChange,
			handleVisibilityScopeChange,
			handleFieldNameChange,
			handleGroupByChange,
			handleMetricKeyChange,
			handleResultTypeChange,
			handleSizePresetChange,
			handleSourceTypeChange,
			handleSupportsGroupByChange,
			handleSupportsTimeSeriesChange,
			handleAggregateByContactChange,
			handleTitleChange,
			handleValueFieldChange,
			handleCompareWithChange,
			handleViewLegendChange,
			handleViewValueFormatChange,
			handleWidgetTypeChange,
			handlePresetEnabledChange,
			handlePresetAliasChange,
			handlePresetKindChange,
			handlePresetSourceChange,
			handlePresetFieldChange,
			handlePresetValuesChange,
			handlePresetDisplayLabelChange,
			handlePresetIncludeChildrenChange,
			isAttributeMetric,
			isCampaignLoading,
			isEditing,
			isGlobalDashboard,
			isMetricColumnsLoading,
			isRolesLoading,
			groupByIsDerived,
			groupBySuggestions,
			manualCompatibility,
			metricKeyOptions,
			metricSourceOptions,
			needsGroupedConfig,
			needsTimeSeriesMetric,
			needsValueField,
			parsedMetricColumns,
			placementLayout,
			roleOptions,
			resultTypeOptions,
			sizePreset,
			sizePresetOptions,
			sizePresetTouched,
			sourceTypeControlOptions,
			titleTouched,
			titleInputRevision,
			valueFieldOptions,
			values,
			viewValueFormatOptions,
			compareWithOptions,
			widgetTypeControlOptions,
			widgetTypeOptions,
		]
	);

	return {
		form,
		state,
		handleSubmit,
		isSubmitting:
			createDashboardWidget.isPending || updateDashboardWidget.isPending,
		isEditing,
		onCancel,
	};
};

export default useDashboardWidgetFormController;
