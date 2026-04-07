import { Alert } from '@mantine/core';
import {
	IconChartBar,
	IconChartDonut,
	IconChartLine,
	IconChartPie,
	IconCircleCheck,
	IconInfoCircle,
	IconHash,
	IconTable,
} from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import type { DashboardWidgetType } from '~/models/AnalyticsDashboard';
import { DASHBOARD_WIDGET_FORM_SECTION_IDS } from './DashboardWidgetForm.constants';
import { useDashboardWidgetFormState } from './DashboardWidgetForm.context';
import styles from './DashboardWidgetForm.module.css';

const WIDGET_TYPE_ICONS: Record<DashboardWidgetType, typeof IconHash> = {
	KPI: IconHash,
	BAR_CHART: IconChartBar,
	LINE_CHART: IconChartLine,
	PIE_CHART: IconChartPie,
	DONUT_CHART: IconChartDonut,
	TABLE: IconTable,
};

const DashboardWidgetTypeSection = () => {
	const { t } = useTranslation(['campaign.form.dashboards']);
	const state = useDashboardWidgetFormState();
	const typeComplete = !!state.values.widgetType;

	return (
		<div
			id={DASHBOARD_WIDGET_FORM_SECTION_IDS.widgetType}
			className={styles.sectionCard}
		>
			<div className={styles.sectionHeader}>
				<div className={styles.sectionHeaderIcon} data-complete={typeComplete}>
					{typeComplete ? (
						<IconCircleCheck
							size={16}
							color='var(--mantine-color-green-6)'
							stroke={1.75}
						/>
					) : (
						<span className={styles.sectionHeaderStep}>4</span>
					)}
				</div>
				<div className={styles.sectionHeaderText}>
					<span className={styles.sectionHeaderTitle}>
						{t('dashboardBuilder.form.sections.widgetTypeTitle')}
					</span>
					<span className={styles.sectionHeaderDescription}>
						{t('dashboardBuilder.form.sections.widgetTypeDescription')}
					</span>
				</div>
			</div>

			<div className={styles.widgetTypeGrid}>
				{state.widgetTypeOptions.map((option) => {
					const Icon =
						WIDGET_TYPE_ICONS[option.value as DashboardWidgetType] ?? IconHash;
					const isActive = state.values.widgetType === option.value;
					return (
						<button
							key={option.value}
							type='button'
							className={styles.widgetTypeCard}
							data-active={isActive || undefined}
							disabled={option.disabled}
							title={option.description}
							onClick={() =>
								state.handlers.handleWidgetTypeChange(option.value)
							}
						>
							<div className={styles.widgetTypeCardIcon}>
								<Icon
									size={16}
									stroke={1.75}
									color={
										isActive
											? 'var(--mantine-color-white)'
											: 'var(--mantine-color-gray-5)'
									}
								/>
							</div>
							<div className={styles.widgetTypeCardBody}>
								<span className={styles.widgetTypeCardLabel}>
									{option.label}
								</span>
							</div>
						</button>
					);
				})}
			</div>

			{state.guidedState.compatibility.compatibilityNoticeKey ? (
				<Alert variant='light' color='red' icon={<IconInfoCircle size={16} />}>
					{t(state.guidedState.compatibility.compatibilityNoticeKey)}
				</Alert>
			) : null}
		</div>
	);
};

export default DashboardWidgetTypeSection;
