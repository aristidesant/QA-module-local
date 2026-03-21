import {
	IconArrowDown,
	IconArrowUp,
	IconCircleCheck,
	IconHash,
	IconMath,
	IconSum,
} from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { DASHBOARD_WIDGET_FORM_SECTION_IDS } from './DashboardWidgetForm.constants';
import styles from './DashboardWidgetForm.module.css';
import { useDashboardWidgetFormState } from './DashboardWidgetForm.context';

const AGGREGATION_ICONS: Record<string, typeof IconHash> = {
	COUNT: IconHash,
	SUM: IconSum,
	AVG: IconMath,
	MIN: IconArrowDown,
	MAX: IconArrowUp,
};

const DashboardWidgetAggregationSection = () => {
	const { t } = useTranslation(['campaign.form.dashboards', 'common']);
	const state = useDashboardWidgetFormState();
	const aggregationComplete = Boolean(state.values.aggregationType);

	return (
		<div
			id={DASHBOARD_WIDGET_FORM_SECTION_IDS.aggregation}
			className={styles.sectionCard}
		>
			<div className={styles.sectionHeader}>
				<div
					className={styles.sectionHeaderIcon}
					data-complete={aggregationComplete}
				>
					{aggregationComplete ? (
						<IconCircleCheck
							size={16}
							color='var(--mantine-color-green-6)'
							stroke={1.75}
						/>
					) : (
						<span className={styles.sectionHeaderStep}>3</span>
					)}
				</div>
				<div className={styles.sectionHeaderText}>
					<span className={styles.sectionHeaderTitle}>
						{t('dashboardBuilder.form.sections.aggregationTitle')}
					</span>
					<span className={styles.sectionHeaderDescription}>
						{t('dashboardBuilder.form.sections.aggregationDescription')}
					</span>
				</div>
			</div>

			<div className={styles.aggregationGrid}>
				{state.aggregationOptions.map((option) => {
					const isActive = state.values.aggregationType === option.value;
					const Icon = AGGREGATION_ICONS[option.value] ?? IconHash;

					return (
						<button
							key={option.value}
							type='button'
							className={styles.aggregationCard}
							data-active={isActive || undefined}
							onClick={() =>
								state.handlers.handleAggregationTypeChange(option.value)
							}
						>
							<div className={styles.aggregationCardIcon}>
								<Icon
									size={16}
									stroke={1.75}
									color={
										isActive
											? 'var(--mantine-color-white)'
											: 'var(--mantine-color-gray-6)'
									}
								/>
							</div>
							<span className={styles.aggregationCardTitle}>
								{option.label}
							</span>
						</button>
					);
				})}
			</div>
		</div>
	);
};

export default DashboardWidgetAggregationSection;
