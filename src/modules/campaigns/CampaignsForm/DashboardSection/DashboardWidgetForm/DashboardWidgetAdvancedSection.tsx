import {
	Autocomplete,
	ActionIcon,
	Badge,
	Button,
	Collapse,
	Group,
	NumberInput,
	MultiSelect,
	Select,
	SimpleGrid,
	Switch,
	Text,
	TextInput,
	TagsInput,
} from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';
import {
	IconChevronDown,
	IconChevronUp,
	IconCircleCheck,
	IconPlus,
	IconTrash,
} from '@tabler/icons-react';
import { memo, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DASHBOARD_WIDGET_FORM_SECTION_IDS } from './DashboardWidgetForm.constants';
import styles from './DashboardWidgetForm.module.css';
import {
	getRuntimeFilterOperatorOptions,
	getRuntimeFilterFieldOptions,
	getRuntimeFilterValueMode,
	getResolvedGroupBy,
	inferRuntimeFilterFieldType,
	supportsCompareWithWidget,
} from './DashboardWidgetForm.helpers';
import {
	useDashboardWidgetFormContext,
	useDashboardWidgetFormState,
} from './DashboardWidgetForm.context';
import type { WidgetRuntimeFilterFormRow } from '../DashboardSection.types';

const RUNTIME_FILTER_VALUE_DEBOUNCE_MS = 350;

type RuntimeFilterDraftState = {
	value: WidgetRuntimeFilterFormRow['value'];
};

const areRuntimeFilterValuesEqual = (
	left: WidgetRuntimeFilterFormRow['value'],
	right: WidgetRuntimeFilterFormRow['value']
) => {
	if (left === right) {
		return true;
	}

	if (Array.isArray(left) && Array.isArray(right)) {
		return (
			left.length === right.length &&
			left.every((item, index) => item === right[index])
		);
	}

	return false;
};

type FilterTableRowProps = {
	index: number;
	row: WidgetRuntimeFilterFormRow;
};

const FilterTableRow = memo(({ index, row }: FilterTableRowProps) => {
	const { t } = useTranslation(['campaign.form.dashboards', 'common']);
	const state = useDashboardWidgetFormState();
	const [draftValue, setDraftValue] = useState<
		RuntimeFilterDraftState['value']
	>(row.value);
	const [debouncedDraftValue] = useDebouncedValue(
		draftValue,
		RUNTIME_FILTER_VALUE_DEBOUNCE_MS
	);

	const fieldType = inferRuntimeFilterFieldType(
		state.values,
		row.field ?? '',
		state.metricKeyOptions,
		state.parsedMetricColumns.conversation,
		state.parsedMetricColumns.disposition
	);
	const fieldOptions = getRuntimeFilterFieldOptions(
		state.values,
		row.field ?? '',
		state.metricKeyOptions,
		state.parsedMetricColumns.conversation,
		state.parsedMetricColumns.disposition
	);
	const hasFieldOptions = Boolean(fieldOptions?.length);
	const runtimeFilterFieldOptions = useMemo(() => {
		const options = state.runtimeFilterFieldOptions;

		if (!row.field || options.some((option) => option.value === row.field)) {
			return options;
		}

		return [
			...options,
			{
				value: row.field,
				label: row.field,
			},
		];
	}, [row.field, state.runtimeFilterFieldOptions]);

	const operatorOptions = getRuntimeFilterOperatorOptions(t, fieldType);

	useEffect(() => {
		setDraftValue((prev) =>
			areRuntimeFilterValuesEqual(prev, row.value) ? prev : row.value
		);
	}, [row.field, row.operator, row.value]);

	useEffect(() => {
		if (!row.field || !row.operator) {
			return;
		}

		if (areRuntimeFilterValuesEqual(debouncedDraftValue, row.value)) {
			return;
		}

		// debouncedDraftValue is stale by 350ms after operator/field changes reset draftValue.
		// If draftValue already matches row.value, the debounce is just catching up — skip.
		if (areRuntimeFilterValuesEqual(draftValue, row.value)) {
			return;
		}

		state.handlers.handleRuntimeFilterValueChange(index, debouncedDraftValue);
	}, [
		debouncedDraftValue,
		draftValue,
		index,
		row.field,
		row.operator,
		row.value,
		state.handlers,
	]);

	const handleDraftValueBlur = () => {
		if (!row.field || !row.operator) {
			return;
		}

		if (!areRuntimeFilterValuesEqual(draftValue, row.value)) {
			state.handlers.handleRuntimeFilterValueChange(index, draftValue);
		}
	};

	const renderValueInput = () => {
		if (!row.operator) {
			return (
				<TextInput
					placeholder={t(
						'dashboardBuilder.form.placeholders.runtimeFilterValueDisabled'
					)}
					disabled
					size='xs'
					value=''
				/>
			);
		}

		const valueMode = getRuntimeFilterValueMode(row.operator, fieldType);

		if (valueMode === 'none') {
			return (
				<TextInput
					placeholder={t(
						'dashboardBuilder.form.placeholders.runtimeFilterValueDisabled'
					)}
					disabled
					size='xs'
					value=''
				/>
			);
		}

		if (valueMode === 'multi') {
			if (hasFieldOptions) {
				return (
					<MultiSelect
						data={fieldOptions ?? []}
						placeholder={t(
							'dashboardBuilder.form.placeholders.runtimeFilterValues'
						)}
						value={Array.isArray(draftValue) ? draftValue : []}
						onChange={(value) => setDraftValue(value)}
						size='xs'
						onBlur={handleDraftValueBlur}
					/>
				);
			}

			return (
				<TagsInput
					placeholder={t(
						'dashboardBuilder.form.placeholders.runtimeFilterValues'
					)}
					value={Array.isArray(draftValue) ? draftValue : []}
					onChange={(value) => setDraftValue(value)}
					size='xs'
					onBlur={handleDraftValueBlur}
				/>
			);
		}

		if (valueMode === 'number') {
			if (hasFieldOptions) {
				return (
					<Select
						data={fieldOptions ?? []}
						placeholder={t(
							'dashboardBuilder.form.placeholders.runtimeFilterValue'
						)}
						clearable
						value={typeof draftValue === 'string' ? draftValue : null}
						onChange={(value) => setDraftValue(value)}
						size='xs'
						onBlur={handleDraftValueBlur}
					/>
				);
			}

			return (
				<NumberInput
					placeholder={t(
						'dashboardBuilder.form.placeholders.runtimeFilterValueNumber'
					)}
					value={typeof draftValue === 'string' ? draftValue : ''}
					onChange={(value) =>
						setDraftValue(
							typeof value === 'number'
								? String(value)
								: typeof value === 'string'
									? value
									: null
						)
					}
					size='xs'
					onBlur={handleDraftValueBlur}
				/>
			);
		}

		if (valueMode === 'boolean') {
			if (hasFieldOptions) {
				return (
					<Select
						data={fieldOptions ?? []}
						placeholder={t(
							'dashboardBuilder.form.placeholders.runtimeFilterValue'
						)}
						allowDeselect={false}
						clearable
						value={typeof draftValue === 'string' ? draftValue : null}
						onChange={(value) => setDraftValue(value)}
						size='xs'
						onBlur={handleDraftValueBlur}
					/>
				);
			}

			return (
				<Select
					data={[
						{
							value: 'true',
							label: t('dashboardBuilder.form.options.boolean.true'),
						},
						{
							value: 'false',
							label: t('dashboardBuilder.form.options.boolean.false'),
						},
					]}
					allowDeselect={false}
					clearable
					value={typeof draftValue === 'string' ? draftValue : null}
					onChange={(value) => setDraftValue(value)}
					size='xs'
					onBlur={handleDraftValueBlur}
				/>
			);
		}

		if (hasFieldOptions) {
			return (
				<Select
					data={fieldOptions ?? []}
					placeholder={t(
						'dashboardBuilder.form.placeholders.runtimeFilterValue'
					)}
					clearable
					value={typeof draftValue === 'string' ? draftValue : null}
					onChange={(value) => setDraftValue(value)}
					size='xs'
					onBlur={handleDraftValueBlur}
				/>
			);
		}

		return (
			<TextInput
				placeholder={t('dashboardBuilder.form.placeholders.runtimeFilterValue')}
				value={typeof draftValue === 'string' ? draftValue : ''}
				onChange={(event) => setDraftValue(event.currentTarget.value)}
				size='xs'
				onBlur={handleDraftValueBlur}
			/>
		);
	};

	return (
		<div className={styles.filterTableRow}>
			<Select
				data={runtimeFilterFieldOptions}
				searchable
				clearable
				size='xs'
				placeholder={t('dashboardBuilder.form.placeholders.runtimeFilterField')}
				value={row.field}
				onChange={(value) =>
					state.handlers.handleRuntimeFilterFieldChange(index, value)
				}
			/>
			<Select
				data={operatorOptions}
				allowDeselect={false}
				clearable
				disabled={!row.field}
				placeholder={t(
					'dashboardBuilder.form.placeholders.runtimeFilterOperator'
				)}
				value={row.operator}
				onChange={(value) =>
					state.handlers.handleRuntimeFilterOperatorChange(index, value)
				}
				size='xs'
			/>
			{renderValueInput()}
			<ActionIcon
				type='button'
				variant='subtle'
				color='red'
				size='sm'
				mt={2}
				onClick={() => state.handlers.removeRuntimeFilterRow(index)}
				aria-label={t('dashboardBuilder.form.actions.removeFilter')}
			>
				<IconTrash size={14} />
			</ActionIcon>
		</div>
	);
});

FilterTableRow.displayName = 'FilterTableRow';

const DashboardWidgetAdvancedSection = () => {
	const { t } = useTranslation(['campaign.form.dashboards', 'common']);
	const form = useDashboardWidgetFormContext();
	const state = useDashboardWidgetFormState();

	const resultTypeInputProps = form.getInputProps('resultType');
	const compareWithInputProps = form.getInputProps('compareWith');
	const advancedComplete = state.advancedSettingsCount > 0;
	const canCompareWith = supportsCompareWithWidget(state.values.widgetType);

	return (
		<div
			id={DASHBOARD_WIDGET_FORM_SECTION_IDS.advanced}
			className={styles.sectionCard}
		>
			<div className={styles.sectionHeader}>
				<div
					className={styles.sectionHeaderIcon}
					data-complete={advancedComplete}
				>
					{advancedComplete ? (
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
						{t('dashboardBuilder.form.guidedSections.advancedTitle')}
					</span>
					<span className={styles.sectionHeaderDescription}>
						{t('dashboardBuilder.form.guidedSections.advancedDescription')}
					</span>
				</div>
				<Group gap={6} align='center' className={styles.sectionHeaderActions}>
					{state.advancedSettingsCount > 0 ? (
						<Badge size='xs' variant='light' color='blue'>
							{state.advancedSettingsCount}
						</Badge>
					) : (
						<Badge size='xs' variant='light' color='gray'>
							{t('common:optional')}
						</Badge>
					)}
					<ActionIcon
						type='button'
						variant='subtle'
						color='gray'
						size='sm'
						aria-label={
							state.advancedOpened
								? t('dashboardBuilder.form.actions.hideAdvanced')
								: t('dashboardBuilder.form.actions.showAdvanced')
						}
						onClick={() =>
							state.handlers.setAdvancedOpened((current) => !current)
						}
					>
						{state.advancedOpened ? (
							<IconChevronUp size={13} />
						) : (
							<IconChevronDown size={13} />
						)}
					</ActionIcon>
				</Group>
			</div>

			<Collapse expanded={state.advancedOpened}>
				<div className={styles.advancedContent}>
					{state.needsGroupedConfig ? (
						<div className={styles.sectionInlinePanel}>
							<div className={styles.sectionInlinePanelHeader}>
								<div>
									<Text fw={600} size='sm'>
										{t('dashboardBuilder.form.guidedSections.breakdownTitle')}
									</Text>
									<Text size='xs' c='dimmed'>
										{t(
											'dashboardBuilder.form.guidedSections.breakdownDescription'
										)}
									</Text>
								</div>
							</div>
							<SimpleGrid cols={{ base: 1, sm: 2 }} spacing='xs'>
								{state.groupByIsDerived ? (
									<Autocomplete
										key={form.key('groupBy')}
										label={t('dashboardBuilder.form.fields.groupBy')}
										placeholder={
											state.isAttributeMetric
												? t(
														'dashboardBuilder.form.placeholders.groupByAttribute'
													)
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
												? t(
														'dashboardBuilder.form.placeholders.groupByAttribute'
													)
												: t('dashboardBuilder.form.placeholders.groupBy')
										}
										data={state.groupBySuggestions}
										clearable
										size='sm'
										{...form.getInputProps('groupBy')}
										onChange={(value) =>
											state.handlers.handleGroupByChange(value)
										}
									/>
								)}
								<NumberInput
									key={form.key('limit')}
									label={t('dashboardBuilder.form.fields.limit')}
									placeholder={t('dashboardBuilder.form.placeholders.limit')}
									min={1}
									size='sm'
									{...form.getInputProps('limit')}
								/>
							</SimpleGrid>
						</div>
					) : null}

					<div className={styles.sectionInlinePanel}>
						<Select
							key={form.key('resultType')}
							label={t('dashboardBuilder.form.fields.resultType')}
							data={state.resultTypeOptions}
							allowDeselect={false}
							clearable
							size='sm'
							{...resultTypeInputProps}
							onChange={(value) => state.handlers.handleResultTypeChange(value)}
						/>

						{canCompareWith ? (
							<Select
								key={form.key('compareWith')}
								label={t('dashboardBuilder.form.fields.compareWith')}
								description={t(
									'dashboardBuilder.form.fields.compareWithDescription'
								)}
								data={state.compareWithOptions}
								allowDeselect={false}
								clearable={false}
								size='sm'
								{...compareWithInputProps}
								onChange={(value) =>
									state.handlers.handleCompareWithChange(value)
								}
							/>
						) : null}

						<SimpleGrid cols={{ base: 1, sm: 2 }} spacing='xs'>
							<div
								className={styles.switchTile}
								onClick={() =>
									state.handlers.handleSupportsGroupByChange(
										!state.values.supportsGroupBy
									)
								}
							>
								<Switch
									labelPosition='left'
									label={t('dashboardBuilder.form.fields.supportsGroupBy')}
									checked={state.values.supportsGroupBy}
									onChange={(event) =>
										state.handlers.handleSupportsGroupByChange(
											event.currentTarget.checked
										)
									}
									classNames={{ body: styles.switchBody }}
								/>
							</div>
							<div
								className={styles.switchTile}
								onClick={() =>
									state.handlers.handleSupportsTimeSeriesChange(
										!state.values.supportsTimeSeries
									)
								}
							>
								<Switch
									labelPosition='left'
									label={t('dashboardBuilder.form.fields.supportsTimeSeries')}
									checked={state.values.supportsTimeSeries}
									onChange={(event) =>
										state.handlers.handleSupportsTimeSeriesChange(
											event.currentTarget.checked
										)
									}
									classNames={{ body: styles.switchBody }}
								/>
							</div>
							<div
								className={styles.switchTile}
								onClick={() =>
									state.handlers.handleEnabledChange(!state.values.enabled)
								}
							>
								<Switch
									labelPosition='left'
									label={t('dashboardBuilder.form.fields.enabled')}
									checked={state.values.enabled}
									onChange={(event) =>
										state.handlers.handleEnabledChange(
											event.currentTarget.checked
										)
									}
									classNames={{ body: styles.switchBody }}
								/>
							</div>
							<div
								className={styles.switchTile}
								onClick={() =>
									state.handlers.handleAggregateByContactChange(
										!state.values.aggregateByContact
									)
								}
							>
								<Switch
									labelPosition='left'
									label={t('dashboardBuilder.form.fields.aggregateByContact')}
									description={t(
										'dashboardBuilder.form.aggregateByContactHint'
									)}
									checked={state.values.aggregateByContact}
									onChange={(event) =>
										state.handlers.handleAggregateByContactChange(
											event.currentTarget.checked
										)
									}
									classNames={{ body: styles.switchBody }}
								/>
							</div>
							{state.needsGroupedConfig ? (
								<div
									className={styles.switchTile}
									onClick={() =>
										state.handlers.handleViewLegendChange(
											!state.values.viewLegend
										)
									}
								>
									<Switch
										labelPosition='left'
										label={t('dashboardBuilder.form.fields.viewLegend')}
										checked={state.values.viewLegend}
										onChange={(event) =>
											state.handlers.handleViewLegendChange(
												event.currentTarget.checked
											)
										}
										classNames={{ body: styles.switchBody }}
									/>
								</div>
							) : null}
						</SimpleGrid>

						<div className={styles.advancedFilters}>
							<div className={styles.filterContainer}>
								<div className={styles.filterContainerHeader}>
									<Text size='xs' fw={600} className={styles.filterTitle}>
										{t('dashboardBuilder.form.sections.filtersTitle')}
									</Text>
									<Button
										type='button'
										variant='subtle'
										size='compact-xs'
										leftSection={<IconPlus size={12} />}
										onClick={state.handlers.addRuntimeFilterRow}
									>
										{t('dashboardBuilder.form.actions.addFilter')}
									</Button>
								</div>

								{state.values.runtimeFilters.length === 0 ? (
									<div className={styles.filterEmptyState}>
										<Text size='xs' c='dimmed'>
											{t(
												'dashboardBuilder.form.guidedSections.filtersDescription'
											)}
										</Text>
									</div>
								) : (
									state.values.runtimeFilters.map((row, index) => (
										<FilterTableRow key={row.id} index={index} row={row} />
									))
								)}
							</div>
						</div>
					</div>
				</div>
			</Collapse>
		</div>
	);
};

export default DashboardWidgetAdvancedSection;
