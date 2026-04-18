import { MultiSelect, Text } from '@mantine/core';
import { IconCircleCheck, IconUsersGroup } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { DASHBOARD_WIDGET_FORM_SECTION_IDS } from './DashboardWidgetForm.constants';
import styles from './DashboardWidgetForm.module.css';
import { useDashboardWidgetFormState } from './DashboardWidgetForm.context';

const DashboardWidgetRoleAccessSection = () => {
	const { t } = useTranslation(['campaign.form.dashboards', 'common']);
	const state = useDashboardWidgetFormState();
	const hasRestrictions = state.values.roleIds.length > 0;

	return (
		<div
			id={DASHBOARD_WIDGET_FORM_SECTION_IDS.widgetRoles}
			className={styles.sectionCard}
		>
			<div className={styles.sectionHeader}>
				<div
					className={styles.sectionHeaderIcon}
					data-complete={hasRestrictions}
				>
					{hasRestrictions ? (
						<IconCircleCheck
							size={16}
							color='var(--mantine-color-green-6)'
							stroke={1.75}
						/>
					) : (
						<span className={styles.sectionHeaderStep}>7</span>
					)}
				</div>
				<div className={styles.sectionHeaderText}>
					<span className={styles.sectionHeaderTitle}>
						{t('dashboardBuilder.form.sections.widgetRolesTitle')}
					</span>
					<span className={styles.sectionHeaderDescription}>
						{t('dashboardBuilder.form.sections.widgetRolesDescription')}
					</span>
				</div>
			</div>

			<div className={styles.sectionSummary}>
				<span className={styles.sectionSummaryChip}>
					{state.guidedState.rolesSummaryLabel}
				</span>
			</div>

			<MultiSelect
				label={t('dashboardBuilder.form.fields.widgetRoles')}
				placeholder={t('dashboardBuilder.form.placeholders.widgetRoles')}
				data={state.roleOptions}
				value={state.values.roleIds.map(String)}
				onChange={state.handlers.handleRoleIdsChange}
				leftSection={<IconUsersGroup size={16} />}
				searchable
				clearable
				nothingFoundMessage={t('dashboardBuilder.form.roleAccess.noRolesFound')}
				disabled={state.isRolesLoading}
				size='sm'
			/>

			<Text size='xs' c='dimmed'>
				{t('dashboardBuilder.form.roleAccess.hint')}
			</Text>
		</div>
	);
};

export default DashboardWidgetRoleAccessSection;
