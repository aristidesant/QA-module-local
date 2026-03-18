import type { WidgetPreviewModel } from '../../DashboardSection.types';

export type DashboardWidgetPreviewKpiProps = {
	preview: Extract<WidgetPreviewModel, { kind: 'kpi' }>;
	statusMessage?: string;
	statusTone?: 'muted' | 'danger';
};
