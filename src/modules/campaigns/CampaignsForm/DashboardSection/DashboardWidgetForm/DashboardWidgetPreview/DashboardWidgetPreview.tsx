import type { DashboardWidgetType } from '~/models/AnalyticsDashboard';
import type {
	WidgetFormValues,
	WidgetPreviewModel,
} from '../../DashboardSection.types';
import DashboardWidgetPreviewEmpty from './DashboardWidgetPreviewEmpty';
import DashboardWidgetPreviewGrouped from './DashboardWidgetPreviewGrouped';
import DashboardWidgetPreviewKpi from './DashboardWidgetPreviewKpi';
import DashboardWidgetPreviewLineChart from './DashboardWidgetPreviewLineChart';
import DashboardWidgetPreviewSkeleton from './DashboardWidgetPreviewSkeleton';
import useDashboardWidgetPreviewController from './useDashboardWidgetPreviewController';

type DashboardWidgetPreviewProps = {
	campaignId: number | null;
	fallbackPreview: WidgetPreviewModel;
	values: WidgetFormValues;
	widgetType: DashboardWidgetType;
};

const DashboardWidgetPreview = ({
	campaignId,
	fallbackPreview,
	values,
	widgetType,
}: DashboardWidgetPreviewProps) => {
	const { preview, isLoading, isRefreshing, statusMessage, statusTone } =
		useDashboardWidgetPreviewController({
			values,
			campaignId,
			fallbackPreview,
			widgetType,
		});

	if (isLoading || isRefreshing) {
		return (
			<DashboardWidgetPreviewSkeleton
				preview={preview}
				statusMessage={statusMessage}
				statusTone={statusTone}
			/>
		);
	}

	if (preview.kind === 'kpi') {
		return (
			<DashboardWidgetPreviewKpi
				preview={preview}
				statusMessage={statusMessage}
				statusTone={statusTone}
			/>
		);
	}

	if (preview.kind === 'empty') {
		return (
			<DashboardWidgetPreviewEmpty
				preview={preview}
				statusMessage={statusMessage}
				statusTone={statusTone}
			/>
		);
	}

	if (widgetType === 'LINE_CHART') {
		return (
			<DashboardWidgetPreviewLineChart
				preview={preview}
				statusMessage={statusMessage}
				statusTone={statusTone}
			/>
		);
	}

	if (
		widgetType !== 'BAR_CHART' &&
		widgetType !== 'PIE_CHART' &&
		widgetType !== 'DONUT_CHART' &&
		widgetType !== 'TABLE'
	) {
		return (
			<DashboardWidgetPreviewEmpty
				preview={preview}
				statusMessage={statusMessage}
				statusTone={statusTone}
			/>
		);
	}

	return (
		<DashboardWidgetPreviewGrouped
			preview={preview}
			widgetType={widgetType}
			statusMessage={statusMessage}
			statusTone={statusTone}
		/>
	);
};

export default DashboardWidgetPreview;
