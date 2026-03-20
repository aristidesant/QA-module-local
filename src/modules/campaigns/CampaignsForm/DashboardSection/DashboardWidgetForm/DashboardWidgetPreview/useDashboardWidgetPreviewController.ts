import { useDebouncedValue } from '@mantine/hooks';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import type { DashboardWidgetType } from '~/models/AnalyticsDashboard';
import {
	normalizePreviewPayload,
	useDashboardWidgetPreview,
} from '~/queries/analyticsDashboardsQueries';
import type {
	MetricColumnsConfig,
	WidgetMetricOption,
	WidgetFormValues,
	WidgetPreviewModel,
} from '../../DashboardSection.types';
import {
	buildPreviewModelFromResponse,
	buildPreviewRequestPayload,
	hasInvalidRuntimeFilterRows,
	isWidgetPreviewReady,
	supportsGroupedWidget,
} from '../DashboardWidgetForm.helpers';

type UseDashboardWidgetPreviewControllerParams = {
	values: WidgetFormValues;
	campaignId: number | null;
	fallbackPreview: WidgetPreviewModel;
	widgetType: DashboardWidgetType;
	metricKeyOptions: WidgetMetricOption[];
	parsedMetricColumns: MetricColumnsConfig;
};

type UseDashboardWidgetPreviewControllerResult = {
	preview: WidgetPreviewModel;
	isLoading: boolean;
	isRefreshing: boolean;
	statusMessage?: string;
	statusTone: 'muted' | 'danger';
};

const useDashboardWidgetPreviewController = ({
	values,
	campaignId,
	fallbackPreview,
	widgetType,
	metricKeyOptions,
	parsedMetricColumns,
}: UseDashboardWidgetPreviewControllerParams): UseDashboardWidgetPreviewControllerResult => {
	const { t } = useTranslation('campaign.form.dashboards');
	const previewRequestPayload = useMemo(() => {
		const payload = buildPreviewRequestPayload(values, campaignId, {
			metricKeyOptions,
			conversationFields: parsedMetricColumns.conversation,
			dispositionFields: parsedMetricColumns.disposition,
		});
		return payload ? normalizePreviewPayload(payload) : null;
	}, [
		campaignId,
		metricKeyOptions,
		parsedMetricColumns.conversation,
		parsedMetricColumns.disposition,
		values,
	]);
	const [debouncedPreviewRequestPayload] = useDebouncedValue(
		previewRequestPayload,
		400
	);
	const widgetPreviewQuery = useDashboardWidgetPreview(
		debouncedPreviewRequestPayload,
		Boolean(debouncedPreviewRequestPayload)
	);
	const previewReady = useMemo(
		() =>
			isWidgetPreviewReady(values) &&
			!hasInvalidRuntimeFilterRows(
				values.runtimeFilters,
				values,
				metricKeyOptions,
				parsedMetricColumns.conversation,
				parsedMetricColumns.disposition
			),
		[
			metricKeyOptions,
			parsedMetricColumns.conversation,
			parsedMetricColumns.disposition,
			values,
		]
	);
	const previewShapeMismatch = useMemo(() => {
		const widget = widgetPreviewQuery.data?.widget;

		if (!widget || widget.status !== 'SUCCESS' || !widget.result) {
			return false;
		}

		if (widget.result.kind === 'single_value') {
			return widgetType !== 'KPI';
		}

		return !supportsGroupedWidget(widgetType);
	}, [widgetType, widgetPreviewQuery.data]);
	const preview = useMemo(() => {
		if (!widgetPreviewQuery.data || previewShapeMismatch) {
			return fallbackPreview;
		}

		return buildPreviewModelFromResponse(
			widgetPreviewQuery.data,
			fallbackPreview,
			t
		);
	}, [fallbackPreview, previewShapeMismatch, t, widgetPreviewQuery.data]);
	const statusMessage = useMemo(() => {
		if (previewShapeMismatch) {
			return t('dashboardBuilder.form.preview.requestError');
		}

		if (!previewReady) {
			return t('dashboardBuilder.form.preview.statusIncomplete');
		}

		if (widgetPreviewQuery.isLoading && !widgetPreviewQuery.data) {
			return t('dashboardBuilder.form.preview.statusLoading');
		}

		if (widgetPreviewQuery.isError && widgetPreviewQuery.data) {
			return t('dashboardBuilder.form.preview.statusStale');
		}

		if (widgetPreviewQuery.isError) {
			return t('dashboardBuilder.form.preview.statusError');
		}

		if (widgetPreviewQuery.isFetching) {
			return t('dashboardBuilder.form.preview.statusRefreshing');
		}

		if (widgetPreviewQuery.data) {
			return t('dashboardBuilder.form.preview.statusLive');
		}

		return t('dashboardBuilder.form.preview.statusLocal');
	}, [
		previewShapeMismatch,
		previewReady,
		t,
		widgetPreviewQuery.data,
		widgetPreviewQuery.isError,
		widgetPreviewQuery.isFetching,
		widgetPreviewQuery.isLoading,
	]);
	const statusTone =
		widgetPreviewQuery.isError && !widgetPreviewQuery.data
			? 'danger'
			: previewShapeMismatch
				? 'danger'
				: 'muted';

	return {
		preview,
		isLoading: widgetPreviewQuery.isLoading && !widgetPreviewQuery.data,
		isRefreshing: widgetPreviewQuery.isFetching,
		statusMessage,
		statusTone,
	};
};

export default useDashboardWidgetPreviewController;
