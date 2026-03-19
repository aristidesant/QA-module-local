import { useTranslation } from 'react-i18next';
import type {
	AnalyticsTimeRange,
	DashboardRenderWidget,
} from '~/models/AnalyticsDashboard';
import {
	isGroupedMetricResult,
	isTimeSeriesMetricResult,
} from '../CampaignDashboardViewer.helpers';
import type { ViewerWidgetLayout, WidgetComparisonData } from '../types';
import BarChartWidgetContent from './components/BarChartWidgetContent';
import DashboardWidgetCard from './components/DashboardWidgetCard';
import DonutChartWidgetContent from './components/DonutChartWidgetContent';
import KpiWidgetContent from './components/KpiWidgetContent';
import LineChartWidgetContent from './components/LineChartWidgetContent';
import PendingLineChartWidgetContent from './components/PendingLineChartWidgetContent';
import PieChartWidgetContent from './components/PieChartWidgetContent';
import TableWidgetContent from './components/TableWidgetContent';
import UnsupportedWidgetContent from './components/UnsupportedWidgetContent';
import { buildWidgetChartData } from './components/widgetContent.helpers';
import styles from './CampaignDashboardViewerWidgetContent.module.css';

interface CampaignDashboardViewerWidgetContentProps {
	widget: DashboardRenderWidget;
	accentColor: string;
	layout?: ViewerWidgetLayout;
	noDragClassName: string;
	comparisonData?: WidgetComparisonData;
	comparisonPeriodLabel?: string;
	selectedTimeRange?: AnalyticsTimeRange | null;
}

const CampaignDashboardViewerWidgetContent = ({
	widget,
	accentColor,
	layout,
	noDragClassName,
	comparisonData,
	comparisonPeriodLabel,
	selectedTimeRange,
}: CampaignDashboardViewerWidgetContentProps) => {
	const { t } = useTranslation('campaign.form.dashboards');

	if (widget.widgetType === 'KPI') {
		return (
			<KpiWidgetContent
				widget={widget}
				accentColor={accentColor}
				layout={layout}
				noDragClassName={noDragClassName}
				comparisonData={comparisonData}
				comparisonPeriodLabel={comparisonPeriodLabel}
				selectedTimeRange={selectedTimeRange}
			/>
		);
	}

	if (widget.widgetType === 'LINE_CHART') {
		if (isTimeSeriesMetricResult(widget)) {
			return (
				<LineChartWidgetContent
					widget={widget}
					accentColor={accentColor}
					layout={layout}
					noDragClassName={noDragClassName}
					comparisonData={comparisonData}
					selectedTimeRange={selectedTimeRange}
				/>
			);
		}

		return (
			<PendingLineChartWidgetContent
				widget={widget}
				accentColor={accentColor}
				layout={layout}
				noDragClassName={noDragClassName}
			/>
		);
	}

	if (!isGroupedMetricResult(widget)) {
		return (
			<UnsupportedWidgetContent
				widget={widget}
				accentColor={accentColor}
				layout={layout}
				noDragClassName={noDragClassName}
			/>
		);
	}

	const chartData = buildWidgetChartData(widget.result.rows, t);

	if (chartData.length === 0) {
		return (
			<DashboardWidgetCard
				title={widget.title}
				accentColor={accentColor}
				groupByLabel={widget.result.meta.groupBy}
			>
				<div className={styles.emptyWidgetState}>
					<span>{t('dashboard.emptyWidgetData')}</span>
				</div>
			</DashboardWidgetCard>
		);
	}

	if (widget.widgetType === 'BAR_CHART') {
		return (
			<BarChartWidgetContent
				widget={widget}
				accentColor={accentColor}
				layout={layout}
				noDragClassName={noDragClassName}
				chartData={chartData}
			/>
		);
	}

	if (widget.widgetType === 'PIE_CHART') {
		return (
			<PieChartWidgetContent
				widget={widget}
				accentColor={accentColor}
				layout={layout}
				noDragClassName={noDragClassName}
				chartData={chartData}
			/>
		);
	}

	if (widget.widgetType === 'DONUT_CHART') {
		return (
			<DonutChartWidgetContent
				widget={widget}
				accentColor={accentColor}
				layout={layout}
				noDragClassName={noDragClassName}
				chartData={chartData}
			/>
		);
	}

	if (widget.widgetType === 'TABLE') {
		return (
			<TableWidgetContent
				widget={widget}
				accentColor={accentColor}
				layout={layout}
				noDragClassName={noDragClassName}
				chartData={chartData}
			/>
		);
	}

	return (
		<UnsupportedWidgetContent
			widget={widget}
			accentColor={accentColor}
			layout={layout}
			noDragClassName={noDragClassName}
		/>
	);
};

export default CampaignDashboardViewerWidgetContent;
