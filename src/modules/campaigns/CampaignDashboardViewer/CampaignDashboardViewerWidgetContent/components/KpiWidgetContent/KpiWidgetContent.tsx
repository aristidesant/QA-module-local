import { useTranslation } from 'react-i18next';
import KpiCard from '~/components/KpiCard';
import { formatMetricValue } from '~/modules/campaigns/CampaignDashboardViewer/CampaignDashboardViewer.helpers';
import type { WidgetContentBaseProps } from '../widgetContent.types';
import styles from '../../CampaignDashboardViewerWidgetContent.module.css';

const RANGE_KEYS: Record<string, { detailKey: string; labelKey: string }> = {
	TODAY: {
		detailKey: 'dashboard.comparison.yesterdayValue',
		labelKey: 'dashboard.comparison.vsPreviousDay',
	},
	WEEK: {
		detailKey: 'dashboard.comparison.previousWeekValue',
		labelKey: 'dashboard.comparison.vsPreviousWeek',
	},
	MONTH: {
		detailKey: 'dashboard.comparison.previousMonthValue',
		labelKey: 'dashboard.comparison.vsPreviousMonth',
	},
	YEAR: {
		detailKey: 'dashboard.comparison.previousYearValue',
		labelKey: 'dashboard.comparison.vsPreviousYear',
	},
};

const DEFAULT_SELECTED_TIME_RANGE: keyof typeof RANGE_KEYS = 'WEEK';

const KpiWidgetContent = ({
	widget,
	accentColor,
	layout,
	comparisonData,
	selectedTimeRange,
}: WidgetContentBaseProps) => {
	const { t } = useTranslation('campaign.form.dashboards');
	const currentValue =
		widget.result?.kind === 'single_value'
			? widget.result.valueFormat !== undefined &&
				widget.result.valueFormat !== null &&
				widget.result.valueFormat !== ''
				? widget.result.valueFormat
				: widget.result.value
			: null;
	const previousValue =
		comparisonData?.previous?.kind === 'single_value'
			? comparisonData.previous.value
			: undefined;
	const previousDisplayValue =
		comparisonData?.previous?.kind === 'single_value'
			? comparisonData.previous.valueFormat !== undefined &&
				comparisonData.previous.valueFormat !== null &&
				comparisonData.previous.valueFormat !== ''
				? comparisonData.previous.valueFormat
				: comparisonData.previous.value
			: undefined;
	const hasComparisonContent =
		Boolean(comparisonData?.comparison) && previousValue !== undefined;
	const variant = hasComparisonContent
		? layout && layout.height >= 3
			? 'comparison-hero'
			: 'comparison-compact'
		: 'default';
	const subtitle = selectedTimeRange
		? t(`dashboard.timeRange.${selectedTimeRange}`)
		: undefined;
	const rangeKeys =
		(selectedTimeRange && RANGE_KEYS[selectedTimeRange]) ??
		RANGE_KEYS[DEFAULT_SELECTED_TIME_RANGE];
	const comparisonDetail =
		previousDisplayValue !== undefined
			? t(rangeKeys.detailKey, {
					value: formatMetricValue(previousDisplayValue),
				})
			: undefined;
	const comparisonLabel = hasComparisonContent
		? t(rangeKeys.labelKey)
		: undefined;

	return (
		<KpiCard
			title={widget.title}
			subtitle={subtitle}
			value={currentValue}
			accentColor={accentColor}
			isLive={Boolean(widget.result)}
			liveLabel={t('dashboard.liveBadge')}
			isUnsupported={widget.result?.kind !== 'single_value'}
			unsupportedMessage={widget.message || t('dashboard.unsupportedMessage')}
			className={styles.kpiCard}
			comparison={comparisonData?.comparison}
			variant={variant}
			comparisonLabel={comparisonLabel}
			comparisonDetail={comparisonDetail}
		/>
	);
};

export default KpiWidgetContent;
