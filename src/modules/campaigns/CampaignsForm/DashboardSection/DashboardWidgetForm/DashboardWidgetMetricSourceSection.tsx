import { Select, SimpleGrid } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import styles from './DashboardWidgetForm.module.css';
import {
	useDashboardWidgetFormContext,
	useDashboardWidgetFormState,
} from './DashboardWidgetForm.context';

const DashboardWidgetMetricSourceSection = () => {
	const { t } = useTranslation(['campaign.form.dashboards', 'common']);
	const form = useDashboardWidgetFormContext();
	const state = useDashboardWidgetFormState();

	const aggregationInputProps = form.getInputProps('aggregationType');
	const metricKeyInputProps = form.getInputProps('metricKey');
	const fieldNameInputProps = form.getInputProps('fieldName');
	const valueFieldInputProps = form.getInputProps('valueField');

	return (
		<div className={styles.sectionCard}>
			<span className={styles.sectionTitle}>
				{t('dashboardBuilder.form.guidedSections.metricTitle')}
			</span>
			<div className={styles.pillGroup}>
				{state.sourceTypeControlOptions.map((option) => (
					<button
						key={option.value}
						type='button'
						className={styles.pill}
						data-active={state.values.sourceType === option.value || undefined}
						disabled={option.disabled}
						onClick={() => state.handlers.handleSourceTypeChange(option.value)}
					>
						{option.label}
					</button>
				))}
			</div>
			<SimpleGrid
				cols={{ base: 1, sm: state.needsValueField ? 3 : 2 }}
				spacing='xs'
			>
				<Select
					key={form.key('aggregationType')}
					label={t('dashboardBuilder.form.fields.aggregationType')}
					data={state.aggregationOptions}
					allowDeselect={false}
					size='sm'
					{...aggregationInputProps}
					onChange={(value) =>
						state.handlers.handleAggregationTypeChange(value)
					}
				/>
				{state.isAttributeMetric ? (
					<Select
						key={form.key('metricKey')}
						label={t('dashboardBuilder.form.fields.metricKey')}
						data={state.metricKeyOptions}
						searchable
						clearable
						size='sm'
						disabled={!state.campaignId || state.isCampaignLoading}
						placeholder={
							state.campaignId
								? state.isCampaignLoading
									? t('dashboardBuilder.form.placeholders.loadingMetricKeys')
									: t('dashboardBuilder.form.placeholders.metricKey')
								: t('dashboardBuilder.form.placeholders.metricKeyUnavailable')
						}
						{...metricKeyInputProps}
						onChange={(value) => state.handlers.handleMetricKeyChange(value)}
					/>
				) : (
					<Select
						key={form.key('fieldName')}
						label={t('dashboardBuilder.form.fields.fieldName')}
						data={state.fieldNameOptions}
						searchable
						clearable
						size='sm'
						disabled={state.isMetricColumnsLoading}
						placeholder={t('dashboardBuilder.form.placeholders.fieldName')}
						{...fieldNameInputProps}
						onChange={(value) => state.handlers.handleFieldNameChange(value)}
					/>
				)}
				{state.needsValueField ? (
					<Select
						key={form.key('valueField')}
						label={t('dashboardBuilder.form.fields.valueField')}
						data={state.valueFieldOptions}
						allowDeselect={false}
						size='sm'
						{...valueFieldInputProps}
						onChange={(value) => state.handlers.handleValueFieldChange(value)}
					/>
				) : null}
			</SimpleGrid>
			<div className={styles.selectionSummary}>
				<span className={styles.selectionSummaryChip}>
					{state.guidedState.sourceLabel}
				</span>
				<span className={styles.selectionSummaryDot}>·</span>
				<span className={styles.selectionSummaryChip}>
					{state.guidedState.aggregationLabel}
				</span>
				{state.guidedState.metricLabel ? (
					<>
						<span className={styles.selectionSummaryDot}>·</span>
						<span className={styles.selectionSummaryChip}>
							{state.guidedState.metricLabel}
						</span>
					</>
				) : null}
			</div>
		</div>
	);
};

export default DashboardWidgetMetricSourceSection;
