import { Textarea, TextInput } from '@mantine/core';
import { IconCircleCheck } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { DASHBOARD_WIDGET_FORM_SECTION_IDS } from './DashboardWidgetForm.constants';
import styles from './DashboardWidgetForm.module.css';
import {
	useDashboardWidgetFormContext,
	useDashboardWidgetFormState,
} from './DashboardWidgetForm.context';

const DashboardWidgetBasicsSection = () => {
	const { t } = useTranslation(['campaign.form.dashboards', 'common']);
	const form = useDashboardWidgetFormContext();
	const state = useDashboardWidgetFormState();

	const titleInputProps = form.getInputProps('title');
	const descriptionInputProps = form.getInputProps('description');

	const detailsComplete = (state.values.title?.trim().length ?? 0) > 0;

	return (
		<div
			id={DASHBOARD_WIDGET_FORM_SECTION_IDS.widgetDetails}
			className={styles.sectionCard}
		>
			<div className={styles.sectionHeader}>
				<div
					className={styles.sectionHeaderIcon}
					data-complete={detailsComplete}
				>
					{detailsComplete ? (
						<IconCircleCheck
							size={16}
							color='var(--mantine-color-green-6)'
							stroke={1.75}
						/>
					) : (
						<span className={styles.sectionHeaderStep}>5</span>
					)}
				</div>
				<div className={styles.sectionHeaderText}>
					<span className={styles.sectionHeaderTitle}>
						{t('dashboardBuilder.form.sections.widgetDetailsTitle')}
					</span>
					<span className={styles.sectionHeaderDescription}>
						{t('dashboardBuilder.form.sections.widgetDetailsDescription')}
					</span>
				</div>
			</div>

			<TextInput
				key={state.titleInputRevision}
				label={t('dashboardBuilder.form.fields.widgetTitle')}
				placeholder={t('dashboardBuilder.form.placeholders.widgetTitle')}
				size='sm'
				{...titleInputProps}
				onChange={(event) => {
					state.handlers.handleTitleChange(event.currentTarget.value);
				}}
				description={
					!state.titleTouched && state.guidedState.titleSuggestion
						? t('dashboardBuilder.form.autoTitleHint', {
								title: state.guidedState.titleSuggestion,
							})
						: undefined
				}
			/>

			<Textarea
				key={form.key('description')}
				label={t('dashboardBuilder.form.fields.widgetDescriptionShort')}
				placeholder={t('dashboardBuilder.form.placeholders.widgetDescription')}
				minRows={2}
				autosize
				maxRows={3}
				size='sm'
				{...descriptionInputProps}
			/>
		</div>
	);
};

export default DashboardWidgetBasicsSection;
