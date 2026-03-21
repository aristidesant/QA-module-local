import { Text } from '@mantine/core';
import {
	IconCircleCheck,
	IconLock,
	IconWorld,
	IconUsers,
} from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { getVisibilityScopeOptions } from './DashboardWidgetForm.helpers';
import { DASHBOARD_WIDGET_FORM_SECTION_IDS } from './DashboardWidgetForm.constants';
import styles from './DashboardWidgetForm.module.css';
import { useDashboardWidgetFormState } from './DashboardWidgetForm.context';

const VISIBILITY_SCOPE_ICONS = {
	GLOBAL: IconWorld,
	TEAM: IconUsers,
	PRIVATE: IconLock,
} as const;

const DashboardWidgetVisibilityScopeSection = () => {
	const { t } = useTranslation(['campaign.form.dashboards', 'common']);
	const state = useDashboardWidgetFormState();
	const options = getVisibilityScopeOptions(t);
	const visibilityScopeComplete = Boolean(state.values.visibilityScope);

	return (
		<div
			id={DASHBOARD_WIDGET_FORM_SECTION_IDS.visibilityScope}
			className={styles.sectionCard}
		>
			<div className={styles.sectionHeader}>
				<div
					className={styles.sectionHeaderIcon}
					data-complete={visibilityScopeComplete}
				>
					{visibilityScopeComplete ? (
						<IconCircleCheck
							size={16}
							color='var(--mantine-color-green-6)'
							stroke={1.75}
						/>
					) : (
						<span className={styles.sectionHeaderStep}>6</span>
					)}
				</div>
				<div className={styles.sectionHeaderText}>
					<span className={styles.sectionHeaderTitle}>
						{t('dashboardBuilder.form.sections.visibilityScopeTitle')}
					</span>
					<span className={styles.sectionHeaderDescription}>
						{t('dashboardBuilder.form.sections.visibilityScopeDescription')}
					</span>
				</div>
			</div>

			<div className={styles.choiceGrid}>
				{options.map((option) => {
					const Icon = VISIBILITY_SCOPE_ICONS[option.value] ?? IconWorld;
					const isActive = state.values.visibilityScope === option.value;

					return (
						<button
							key={option.value}
							type='button'
							className={styles.choiceCard}
							data-active={isActive || undefined}
							onClick={() =>
								state.handlers.handleVisibilityScopeChange(option.value)
							}
						>
							<Icon
								size={18}
								stroke={1.75}
								color={
									isActive
										? 'var(--mantine-color-blue-6)'
										: 'var(--mantine-color-gray-6)'
								}
							/>
							<div className={styles.choiceCardBody}>
								<span className={styles.choiceCardTitle}>{option.label}</span>
								<span className={styles.choiceCardDescription}>
									{option.description}
								</span>
							</div>
						</button>
					);
				})}
			</div>

			<Text size='xs' c='dimmed'>
				{t('dashboardBuilder.form.visibilityScopeHint')}
			</Text>
		</div>
	);
};

export default DashboardWidgetVisibilityScopeSection;
