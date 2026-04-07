import { Select, SimpleGrid } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { DASHBOARD_WIDGET_FORM_SECTION_IDS } from './DashboardWidgetForm.constants';
import styles from './DashboardWidgetForm.module.css';
import {
	useDashboardWidgetFormContext,
	useDashboardWidgetFormState,
} from './DashboardWidgetForm.context';

const DashboardWidgetSourceFieldSection = () => {
	const { t } = useTranslation(['campaign.form.dashboards', 'common']);
	const form = useDashboardWidgetFormContext();
	const state = useDashboardWidgetFormState();
	const sourceFieldLabel = state.isAttributeMetric
		? t('dashboardBuilder.form.fields.metricKey')
		: t('dashboardBuilder.form.fields.fieldName');
	const sourceFieldPlaceholder = state.isAttributeMetric
		? state.campaignId
			? state.isCampaignLoading
				? t('dashboardBuilder.form.placeholders.loadingMetricKeys')
				: t('dashboardBuilder.form.placeholders.metricKey')
			: t('dashboardBuilder.form.placeholders.metricKeyUnavailable')
		: t('dashboardBuilder.form.placeholders.fieldName');

	return (
		<div
			id={DASHBOARD_WIDGET_FORM_SECTION_IDS.sourceField}
			className={styles.sectionInlinePanel}
		>
			{state.isAttributeMetric ? (
				<SimpleGrid
					cols={{ base: 1, sm: state.needsValueField ? 2 : 1 }}
					spacing='xs'
				>
					<Select
						key={form.key('metricKey')}
						label={sourceFieldLabel}
						data={state.metricKeyOptions}
						searchable
						clearable
						size='sm'
						disabled={!state.campaignId || state.isCampaignLoading}
						placeholder={sourceFieldPlaceholder}
						value={state.values.metricKey}
						onChange={(value) => state.handlers.handleMetricKeyChange(value)}
					/>
					{state.needsValueField ? (
						<Select
							key={form.key('valueField')}
							label={t('dashboardBuilder.form.fields.valueField')}
							data={state.valueFieldOptions}
							allowDeselect={false}
							clearable
							size='sm'
							value={state.values.valueField}
							onChange={(value) => state.handlers.handleValueFieldChange(value)}
						/>
					) : null}
				</SimpleGrid>
			) : (
				<Select
					key={form.key('fieldName')}
					label={sourceFieldLabel}
					data={state.fieldNameOptions}
					searchable
					clearable
					size='sm'
					disabled={state.isMetricColumnsLoading}
					placeholder={sourceFieldPlaceholder}
					value={state.values.fieldName}
					onChange={(value) => state.handlers.handleFieldNameChange(value)}
				/>
			)}
		</div>
	);
};

export default DashboardWidgetSourceFieldSection;
