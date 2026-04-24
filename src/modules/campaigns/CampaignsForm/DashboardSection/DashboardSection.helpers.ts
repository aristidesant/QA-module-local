import type {
	DashboardDefinition,
	DashboardMainSlot,
	DashboardWidgetType,
} from '~/models/AnalyticsDashboard';
import type { DashboardFormValues } from './DashboardSection.types';

export const getWidgetTypeLabel = (
	t: (key: string) => string,
	widgetType: DashboardWidgetType
) => t(`dashboardBuilder.widgetTypes.${widgetType}`);

export const getDashboardMainSlotLabel = (
	t: (key: string) => string,
	mainSlot: DashboardMainSlot
) => t(`dashboardBuilder.mainSlots.${mainSlot}`);

export const dashboardFormValues = (
	dashboard?: DashboardDefinition | null
): DashboardFormValues => ({
	name: dashboard?.name ?? '',
	description: dashboard?.description ?? '',
	mainSlot: dashboard?.mainSlot ?? null,
	isDefault: dashboard?.isDefault ?? false,
});
