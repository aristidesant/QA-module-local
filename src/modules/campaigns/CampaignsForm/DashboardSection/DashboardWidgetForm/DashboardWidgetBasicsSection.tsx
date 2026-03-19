import { SimpleGrid, Select, Textarea, TextInput } from '@mantine/core';
import { useTranslation } from 'react-i18next';
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

	return (
		<div className={styles.sectionCard}>
			<div className={styles.pillGroup}>
				{state.widgetTypeControlOptions.map((option) => (
					<button
						key={option.value}
						type='button'
						className={styles.pill}
						data-active={state.values.widgetType === option.value || undefined}
						disabled={option.disabled}
						onClick={() => state.handlers.handleWidgetTypeChange(option.value)}
					>
						{option.label}
					</button>
				))}
			</div>
			<SimpleGrid cols={{ base: 1, sm: 2 }} spacing='xs'>
				<TextInput
					key={state.titleInputRevision}
					label={t('dashboardBuilder.form.fields.widgetTitle')}
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
				<Select
					key={state.sizePreset}
					label={t('dashboardBuilder.form.fields.widgetSize')}
					size='sm'
					data={state.sizePresetOptions}
					value={state.sizePreset}
					onChange={state.handlers.handleSizePresetChange}
					allowDeselect={false}
				/>
			</SimpleGrid>
			<Textarea
				key={form.key('description')}
				label={t('dashboardBuilder.form.fields.widgetDescriptionShort')}
				minRows={1}
				autosize
				maxRows={2}
				size='sm'
				{...descriptionInputProps}
			/>
		</div>
	);
};

export default DashboardWidgetBasicsSection;
