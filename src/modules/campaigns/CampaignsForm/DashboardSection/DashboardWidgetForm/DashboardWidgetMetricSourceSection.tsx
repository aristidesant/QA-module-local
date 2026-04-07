import { ThemeIcon } from '@mantine/core';
import {
	IconCircleCheck,
	IconMessageCircle,
	IconTag,
	IconTargetArrow,
} from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { DASHBOARD_WIDGET_FORM_SECTION_IDS } from './DashboardWidgetForm.constants';
import styles from './DashboardWidgetForm.module.css';
import { useDashboardWidgetFormState } from './DashboardWidgetForm.context';
import DashboardWidgetSourceFieldSection from './DashboardWidgetSourceFieldSection';

type SourceTypeKey = 'ATTRIBUTE' | 'CONVERSATION' | 'DISPOSITION';

const SOURCE_TYPE_ICONS: Record<SourceTypeKey, typeof IconTag> = {
	ATTRIBUTE: IconTag,
	CONVERSATION: IconMessageCircle,
	DISPOSITION: IconTargetArrow,
};

const DashboardWidgetMetricSourceSection = () => {
	const { t } = useTranslation(['campaign.form.dashboards', 'common']);
	const state = useDashboardWidgetFormState();
	const sourceComplete = Boolean(state.values.sourceType);

	return (
		<div
			id={DASHBOARD_WIDGET_FORM_SECTION_IDS.sourceType}
			className={styles.sectionCard}
		>
			<div className={styles.sectionHeader}>
				<div
					className={styles.sectionHeaderIcon}
					data-complete={sourceComplete}
				>
					{sourceComplete ? (
						<IconCircleCheck
							size={16}
							color='var(--mantine-color-green-6)'
							stroke={1.75}
						/>
					) : (
						<span className={styles.sectionHeaderStep}>1</span>
					)}
				</div>
				<div className={styles.sectionHeaderText}>
					<span className={styles.sectionHeaderTitle}>
						{t('dashboardBuilder.form.sections.sourceTypeTitle')}
					</span>
					<span className={styles.sectionHeaderDescription}>
						{t('dashboardBuilder.form.sections.sourceTypeDescription')}
					</span>
				</div>
			</div>

			<div className={styles.choiceGrid}>
				{state.sourceTypeControlOptions.map((option) => {
					const Icon =
						SOURCE_TYPE_ICONS[option.value as SourceTypeKey] ?? IconTag;
					const isActive = state.values.sourceType === option.value;
					const description = t(
						`dashboardBuilder.form.sourceTypeDescriptions.${option.value}`,
						{ defaultValue: '' }
					);
					return (
						<button
							key={option.value}
							type='button'
							className={styles.choiceCard}
							data-active={isActive || undefined}
							disabled={option.disabled}
							onClick={() =>
								state.handlers.handleSourceTypeChange(option.value)
							}
						>
							<ThemeIcon
								variant={isActive ? 'light' : 'default'}
								color={isActive ? 'blue' : 'gray'}
								size='md'
								radius='sm'
							>
								<Icon size={14} stroke={1.75} />
							</ThemeIcon>
							<div className={styles.choiceCardBody}>
								<span className={styles.choiceCardTitle}>{option.label}</span>
								{description && (
									<span className={styles.choiceCardDescription}>
										{description}
									</span>
								)}
							</div>
						</button>
					);
				})}
			</div>

			<DashboardWidgetSourceFieldSection />
		</div>
	);
};

export default DashboardWidgetMetricSourceSection;
