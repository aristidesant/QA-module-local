import type { TFunction } from 'i18next';
import {
	ACCENT_COLORS,
	getNumericValue,
	resolveLabel,
} from '../../CampaignDashboardViewer.helpers';
import type {
	GroupedWidgetContentProps,
	WidgetChartDatum,
} from './widgetContent.types';

export const buildWidgetChartData = (
	rows: GroupedWidgetContentProps['widget']['result']['rows'],
	t: TFunction
): WidgetChartDatum[] =>
	rows.map((row, index) => ({
		name: resolveLabel(row.label, t('dashboard.unknownLabel')),
		value: getNumericValue(row.value),
		color: ACCENT_COLORS[index % ACCENT_COLORS.length],
	}));
