import { Badge, Group, Text } from '@mantine/core';
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
	metricKeyOptions: WidgetMetricOption[];
	parsedMetricColumns: MetricColumnsConfig;
};

const DashboardWidgetPreviewPanel = ({
	campaignId,
	values,
	fallbackPreview,
	sizePreset,
	metricKeyOptions,
	parsedMetricColumns,
}: DashboardWidgetPreviewPanelProps) => {
	const { t } = useTranslation(['campaign.form.dashboards', 'common']);

	return (
		<div className={styles.previewPanel}>
			<Text className={styles.previewKicker} tt='uppercase' size='xs' fw={700}>
				{t('dashboardBuilder.form.preview.title')}
			</Text>
			<Group
				justify='space-between'
				align='center'
				className={styles.previewHeader}
			>
				<Text className={styles.previewWidgetType} size='xs' fw={600}>
					{t(`dashboardBuilder.widgetTypes.${values.widgetType}`)}
				</Text>
				<Badge variant='light' color='gray' size='sm' tt='uppercase'>
					{t(`dashboardBuilder.form.sizePresets.${sizePreset}`)}
				</Badge>
			</Group>
			<DashboardWidgetPreview
				campaignId={campaignId}
				values={values}
				fallbackPreview={fallbackPreview}
				metricKeyOptions={metricKeyOptions}
				parsedMetricColumns={parsedMetricColumns}
			/>
		</div>
	);
};

export default memo(DashboardWidgetPreviewPanel);
