import type {
	DashboardDefinition,
	DashboardWidgetType,
} from '~/models/AnalyticsDashboard';
import type { DashboardFormValues } from './DashboardSection.types';

export const getWidgetTypeLabel = (
	t: (key: string) => string,
	widgetType: DashboardWidgetType
) => t(`dashboardBuilder.widgetTypes.${widgetType}`);

export const dashboardFormValues = (
	dashboard?: DashboardDefinition | null
): DashboardFormValues => ({
	name: dashboard?.name ?? '',
	description: dashboard?.description ?? '',
	isDefault: dashboard?.isDefault ?? false,
});
