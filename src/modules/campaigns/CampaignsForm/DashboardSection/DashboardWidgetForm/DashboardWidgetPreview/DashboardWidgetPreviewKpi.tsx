import { Text } from '@mantine/core';
import KpiCard from '~/components/KpiCard';
import styles from './DashboardWidgetPreview.module.css';
import type { DashboardWidgetPreviewKpiProps } from './DashboardWidgetPreview.types';

const DashboardWidgetPreviewKpi = ({
	preview,
	statusMessage,
	statusTone = 'muted',
}: DashboardWidgetPreviewKpiProps) => {
	const statusColor = statusTone === 'danger' ? 'red' : 'dimmed';
	const comparisonVariant =
		preview.comparison && preview.comparisonDetail
			? preview.sizePreset === 'LARGE' || preview.sizePreset === 'FULL'
				? 'comparison-hero'
				: 'comparison-compact'
			: 'default';

	return (
		<div className={styles.previewFrame} data-size={preview.sizePreset}>
			<div className={styles.kpiWrapper}>
				<KpiCard
					title={preview.title}
					subtitle={preview.subtitle}
					value={preview.value}
					accentColor={preview.accentColor}
					comparison={preview.comparison}
					comparisonLabel={preview.comparisonLabel}
					comparisonDetail={preview.comparisonDetail}
					variant={comparisonVariant}
				/>
			</div>
			{statusMessage ? (
				<Text size='xs' c={statusColor} className={styles.statusText}>
					{statusMessage}
				</Text>
			) : null}
		</div>
	);
};

export default DashboardWidgetPreviewKpi;
