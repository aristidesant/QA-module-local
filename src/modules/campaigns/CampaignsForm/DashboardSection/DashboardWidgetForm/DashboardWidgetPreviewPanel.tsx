import { Badge, Text } from '@mantine/core';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import type {
	MetricColumnsConfig,
	WidgetMetricOption,
	WidgetFormValues,
	WidgetPreviewModel,
} from '../DashboardSection.types';
import type { DashboardWidgetSizePreset } from '~/modules/campaigns/dashboardLayout';
import DashboardWidgetPreview from './DashboardWidgetPreview';
import styles from './DashboardWidgetForm.module.css';

type DashboardWidgetPreviewPanelProps = {
	campaignId: number | null;
	values: WidgetFormValues;
	fallbackPreview: WidgetPreviewModel;
	sizePreset: DashboardWidgetSizePreset;
	placementLayout: {
		positionX: number;
		positionY: number;
		width: number;
		height: number;
	};
	metricKeyOptions: WidgetMetricOption[];
	parsedMetricColumns: MetricColumnsConfig;
};

const DashboardWidgetPreviewPanel = ({
	campaignId,
	values,
	fallbackPreview,
	sizePreset,
	placementLayout,
	metricKeyOptions,
	parsedMetricColumns,
}: DashboardWidgetPreviewPanelProps) => {
	const { t } = useTranslation(['campaign.form.dashboards', 'common']);

	return (
		<div className={`${styles.previewColumn} ${styles.previewPanel}`}>
			<div className={styles.previewHeader}>
				<Text
					size='xs'
					fw={600}
					c='gray.5'
					tt='uppercase'
					style={{ letterSpacing: '0.04em' }}
				>
					{t(`dashboardBuilder.widgetTypes.${values.widgetType}`)}
				</Text>
				<Badge variant='dot' color='gray' size='sm'>
					{t(`dashboardBuilder.form.sizePresets.${sizePreset}`)}
				</Badge>
			</div>
			<DashboardWidgetPreview
				campaignId={campaignId}
				values={values}
				fallbackPreview={fallbackPreview}
				metricKeyOptions={metricKeyOptions}
				parsedMetricColumns={parsedMetricColumns}
			/>
			<Text size='xs' c='dimmed'>
				{t('dashboardBuilder.form.layoutPlacement', {
					column: placementLayout.positionX + 1,
					row: placementLayout.positionY + 1,
				})}
			</Text>
		</div>
	);
};

export default memo(DashboardWidgetPreviewPanel);
