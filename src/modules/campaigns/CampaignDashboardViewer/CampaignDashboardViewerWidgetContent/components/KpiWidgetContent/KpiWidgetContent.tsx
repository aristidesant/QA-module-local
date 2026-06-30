import { Text } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import KpiCard from '~/components/KpiCard';
import {
	buildWidgetComparisonCopy,
	resolveMetricDisplayValue,
} from '~/modules/campaigns/CampaignDashboardViewer/CampaignDashboardViewer.helpers';
import type { WidgetContentBaseProps } from '../widgetContent.types';
import styles from '../../CampaignDashboardViewerWidgetContent.module.css';

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
			? resolveMetricDisplayValue(
					widget.result.value,
					widget.result.valueFormat
				)
			: null;
	const rateCaption =
		widget.result?.kind === 'single_value' &&
		typeof widget.result.meta.matched === 'number' &&
		typeof widget.result.meta.total === 'number'
			? t('dashboard.rateCaption', {
					matched: widget.result.meta.matched,
					total: widget.result.meta.total,
				})
			: null;
	const previousValue =
		comparisonData?.previous?.kind === 'single_value'
			? comparisonData.previous.value
			: undefined;
	const previousDisplayValue =
		comparisonData?.previous?.kind === 'single_value'
			? resolveMetricDisplayValue(
					comparisonData.previous.value,
					comparisonData.previous.valueFormat
				)
			: undefined;
	const hasComparisonContent =
		Boolean(comparisonData?.comparison) && previousValue !== undefined;
	const comparisonCompareWith =
		comparisonData?.compareWith ?? widget.result?.meta.compareWith;
	const comparisonCopy = buildWidgetComparisonCopy(
		widget.result?.kind === 'single_value' ? comparisonCompareWith : undefined,
		selectedTimeRange,
		previousDisplayValue,
		t
	);
	const variant = hasComparisonContent
		? layout && layout.height >= 3
			? 'comparison-hero'
			: 'comparison-compact'
		: 'default';
	const showCompactComparisonTooltip =
		variant === 'comparison-compact' && layout?.height === 1;
	const subtitle = selectedTimeRange
		? t(`dashboard.timeRange.${selectedTimeRange}`)
		: undefined;
	const comparisonDetail = hasComparisonContent
		? comparisonCopy.detail
		: undefined;
	const comparisonLabel = hasComparisonContent
		? comparisonCopy.label
		: undefined;

	return (
		<>
			<KpiCard
				title={widget.title}
				subtitle={subtitle}
				value={currentValue}
				accentColor={accentColor}
				isUnsupported={widget.result?.kind !== 'single_value'}
				unsupportedMessage={widget.message || t('dashboard.unsupportedMessage')}
				className={styles.kpiCard}
				comparison={comparisonData?.comparison}
				variant={variant}
				comparisonLabel={comparisonLabel}
				comparisonDetail={comparisonDetail}
				showCompactComparisonTooltip={showCompactComparisonTooltip}
			/>
			{rateCaption && (
				<Text
					size='xs'
					c='dimmed'
					ta='center'
					className={styles.kpiRateCaption}
				>
					{rateCaption}
				</Text>
			)}
		</>
	);
};

export default KpiWidgetContent;
