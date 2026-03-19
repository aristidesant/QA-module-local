import { Alert, Autocomplete, NumberInput, SimpleGrid } from '@mantine/core';
import { IconInfoCircle } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { getResolvedGroupBy } from './DashboardWidgetForm.helpers';
import styles from './DashboardWidgetForm.module.css';
import {
	useDashboardWidgetFormContext,
	useDashboardWidgetFormState,
} from './DashboardWidgetForm.context';

const DashboardWidgetBreakdownSection = () => {
	const { t } = useTranslation(['campaign.form.dashboards', 'common']);
	const form = useDashboardWidgetFormContext();
	const state = useDashboardWidgetFormState();

	const groupByInputProps = form.getInputProps('groupBy');
	const limitInputProps = form.getInputProps('limit');

	if (!state.needsGroupedConfig) {
		return null;
	}

	return (
		<div className={styles.sectionCard}>
			<span className={styles.sectionTitle}>
				{t('dashboardBuilder.form.guidedSections.breakdownTitle')}
			</span>
			<SimpleGrid cols={{ base: 1, sm: 2 }} spacing='xs'>
				{state.groupByIsDerived ? (
					<Autocomplete
						key={form.key('groupBy')}
						label={t('dashboardBuilder.form.fields.groupBy')}
						placeholder={
							state.isAttributeMetric
								? t('dashboardBuilder.form.placeholders.groupByAttribute')
								: t('dashboardBuilder.form.placeholders.groupBy')
						}
						data={state.groupBySuggestions}
						clearable
						size='sm'
						disabled
						value={getResolvedGroupBy(state.values)}
						readOnly
					/>
				) : (
					<Autocomplete
						key={form.key('groupBy')}
						label={t('dashboardBuilder.form.fields.groupBy')}
						placeholder={
							state.isAttributeMetric
								? t('dashboardBuilder.form.placeholders.groupByAttribute')
								: t('dashboardBuilder.form.placeholders.groupBy')
						}
						data={state.groupBySuggestions}
						clearable
						size='sm'
						{...groupByInputProps}
						onChange={(value) => state.handlers.handleGroupByChange(value)}
					/>
				)}
				<NumberInput
					key={form.key('limit')}
					label={t('dashboardBuilder.form.fields.limit')}
					placeholder={t('dashboardBuilder.form.placeholders.limit')}
					min={1}
					size='sm'
					{...limitInputProps}
				/>
			</SimpleGrid>
			{state.guidedState.compatibility.compatibilityNoticeKey ? (
				<Alert variant='light' color='red' icon={<IconInfoCircle size={16} />}>
					{t(state.guidedState.compatibility.compatibilityNoticeKey)}
				</Alert>
			) : null}
		</div>
	);
};

export default DashboardWidgetBreakdownSection;
