import {
	ActionIcon,
	Badge,
	Button,
	Collapse,
	Group,
	NumberInput,
	Select,
	SimpleGrid,
	Stack,
	Switch,
	Text,
	TextInput,
	Autocomplete,
	TagsInput,
} from '@mantine/core';
import {
	IconChevronDown,
	IconChevronUp,
	IconPlus,
	IconTrash,
} from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import styles from './DashboardWidgetForm.module.css';
import {
	getRuntimeFilterOperatorOptions,
	getRuntimeFilterValueMode,
	inferRuntimeFilterFieldType,
} from './DashboardWidgetForm.helpers';
import {
	useDashboardWidgetFormContext,
	useDashboardWidgetFormState,
} from './DashboardWidgetForm.context';

const DashboardWidgetAdvancedSection = () => {
	const { t } = useTranslation(['campaign.form.dashboards', 'common']);
	const form = useDashboardWidgetFormContext();
	const state = useDashboardWidgetFormState();

	const resultTypeInputProps = form.getInputProps('resultType');
	const viewColorInputProps = form.getInputProps('viewColor');
	const viewValueFormatInputProps = form.getInputProps('viewValueFormat');

	const renderFilterValueInput = (index: number) => {
		const row = state.values.defaultFilters[index];

		if (!row) {
			return null;
		}

		if (row.valueType === 'boolean') {
			return (
				<Select
					key={form.key(`defaultFilters.${index}.value`)}
					label={t('dashboardBuilder.form.fields.defaultFilterValue')}
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
					value={row.value ?? null}
					onChange={(value) =>
						state.handlers.handleDefaultFilterValueChange(index, value)
					}
				/>
			);
		}

		return (
			<TextInput
				key={form.key(`defaultFilters.${index}.value`)}
				label={t('dashboardBuilder.form.fields.defaultFilterValue')}
				disabled={row.valueType === 'null'}
				placeholder={t('dashboardBuilder.form.placeholders.defaultFilterValue')}
				value={row.value ?? ''}
				onChange={(event) =>
					state.handlers.handleDefaultFilterValueChange(
						index,
						event.currentTarget.value
					)
				}
			/>
		);
	};

	const renderRuntimeFilterValueInput = (index: number) => {
		const row = state.values.runtimeFilters[index];

		if (!row) {
			return null;
		}

		const fieldType = inferRuntimeFilterFieldType(
			state.values,
			row.field ?? '',
			state.metricKeyOptions,
			state.parsedMetricColumns.conversation,
			state.parsedMetricColumns.disposition
		);

		if (!row.operator) {
			return (
				<TextInput
					key={form.key(`runtimeFilters.${index}.value`)}
					label={t('dashboardBuilder.form.fields.runtimeFilterValue')}
					placeholder={t(
						'dashboardBuilder.form.placeholders.runtimeFilterValueDisabled'
					)}
					disabled
					size='sm'
					value=''
				/>
			);
		}

		const valueMode = getRuntimeFilterValueMode(row.operator, fieldType);

		if (valueMode === 'none') {
			return (
				<TextInput
					key={form.key(`runtimeFilters.${index}.value`)}
					label={t('dashboardBuilder.form.fields.runtimeFilterValue')}
					placeholder={t(
						'dashboardBuilder.form.placeholders.runtimeFilterValueDisabled'
					)}
					disabled
					size='sm'
					value=''
				/>
			);
		}

		if (valueMode === 'multi') {
			return (
				<TagsInput
					key={form.key(`runtimeFilters.${index}.value`)}
					label={t('dashboardBuilder.form.fields.runtimeFilterValue')}
					placeholder={t(
						'dashboardBuilder.form.placeholders.runtimeFilterValues'
					)}
					value={Array.isArray(row.value) ? row.value : []}
					onChange={(value) =>
						state.handlers.handleRuntimeFilterValueChange(index, value)
					}
					size='sm'
				/>
			);
		}

		if (valueMode === 'number') {
			return (
				<NumberInput
					key={form.key(`runtimeFilters.${index}.value`)}
					label={t('dashboardBuilder.form.fields.runtimeFilterValue')}
					placeholder={t(
						'dashboardBuilder.form.placeholders.runtimeFilterValueNumber'
					)}
					value={typeof row.value === 'string' ? row.value : ''}
					onChange={(value) =>
						state.handlers.handleRuntimeFilterValueChange(
							index,
							typeof value === 'number'
								? String(value)
								: typeof value === 'string'
									? value
									: null
						)
					}
					size='sm'
				/>
			);
		}

		if (valueMode === 'boolean') {
			return (
				<Select
					key={form.key(`runtimeFilters.${index}.value`)}
					label={t('dashboardBuilder.form.fields.runtimeFilterValue')}
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
					value={typeof row.value === 'string' ? row.value : null}
					onChange={(value) =>
						state.handlers.handleRuntimeFilterValueChange(index, value)
					}
					size='sm'
				/>
			);
		}

		return (
			<TextInput
				key={form.key(`runtimeFilters.${index}.value`)}
				label={t('dashboardBuilder.form.fields.runtimeFilterValue')}
				placeholder={t('dashboardBuilder.form.placeholders.runtimeFilterValue')}
				value={typeof row.value === 'string' ? row.value : ''}
				onChange={(event) =>
					state.handlers.handleRuntimeFilterValueChange(
						index,
						event.currentTarget.value
					)
				}
				size='sm'
			/>
		);
	};

	return (
		<>
			<div className={styles.advancedToggleRow}>
				<Text
					size='xs'
					fw={600}
					c='gray.5'
					tt='uppercase'
					style={{ letterSpacing: '0.04em' }}
				>
					{t('dashboardBuilder.form.guidedSections.advancedTitle')}
				</Text>
				<Group gap={6} align='center'>
					{state.advancedSettingsCount > 0 && !state.advancedOpened ? (
						<Badge size='xs' variant='filled' color='blue' circle>
							{state.advancedSettingsCount}
						</Badge>
					) : null}
					<ActionIcon
						type='button'
						variant='subtle'
						color='gray'
						size='sm'
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
			<Collapse in={state.advancedOpened}>
				<div className={styles.sectionCard} style={{ marginTop: '0.375rem' }}>
					<SimpleGrid cols={{ base: 1, sm: 3 }} spacing='xs'>
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
						<Select
							key={form.key('viewValueFormat')}
							label={t('dashboardBuilder.form.fields.viewValueFormat')}
							data={state.viewValueFormatOptions}
							clearable
							size='sm'
							placeholder={t(
								'dashboardBuilder.form.placeholders.viewValueFormat'
							)}
							{...viewValueFormatInputProps}
							onChange={(value) =>
								state.handlers.handleViewValueFormatChange(value)
							}
						/>
						<TextInput
							key={form.key('viewColor')}
							label={t('dashboardBuilder.form.fields.viewColor')}
							placeholder={t('dashboardBuilder.form.placeholders.viewColor')}
							size='sm'
							{...viewColorInputProps}
						/>
					</SimpleGrid>
					<SimpleGrid cols={{ base: 1, sm: 2 }} spacing='xs'>
						<div className={styles.switchTile}>
							<Switch
								label={t('dashboardBuilder.form.fields.supportsGroupBy')}
								checked={state.values.supportsGroupBy}
								onChange={(event) =>
									state.handlers.handleSupportsGroupByChange(
										event.currentTarget.checked
									)
								}
							/>
						</div>
						<div className={styles.switchTile}>
							<Switch
								label={t('dashboardBuilder.form.fields.supportsTimeSeries')}
								checked={state.values.supportsTimeSeries}
								onChange={(event) =>
									state.handlers.handleSupportsTimeSeriesChange(
										event.currentTarget.checked
									)
								}
							/>
						</div>
						<div className={styles.switchTile}>
							<Switch
								label={t('dashboardBuilder.form.fields.enabled')}
								checked={state.values.enabled}
								onChange={(event) =>
									state.handlers.handleEnabledChange(
										event.currentTarget.checked
									)
								}
							/>
						</div>
						{state.needsGroupedConfig ? (
							<div className={styles.switchTile}>
								<Switch
									label={t('dashboardBuilder.form.fields.viewLegend')}
									checked={state.values.viewLegend}
									onChange={(event) =>
										state.handlers.handleViewLegendChange(
											event.currentTarget.checked
										)
									}
								/>
							</div>
						) : null}
					</SimpleGrid>

					<div className={styles.advancedFilters}>
						<Group justify='space-between' align='center'>
							<Text fw={600} size='sm'>
								{t('dashboardBuilder.form.sections.filtersTitle')}
							</Text>
							<Button
								type='button'
								variant='subtle'
								size='compact-sm'
								leftSection={<IconPlus size={14} />}
								onClick={state.handlers.addDefaultFilterRow}
							>
								{t('dashboardBuilder.form.actions.addFilter')}
							</Button>
						</Group>
						<Stack gap='xs'>
							{state.values.defaultFilters.map((row, index) => (
								<div key={row.id} className={styles.filterRow}>
									<SimpleGrid cols={{ base: 1, sm: 4 }} spacing='xs'>
										<Autocomplete
											label={t('dashboardBuilder.form.fields.defaultFilterKey')}
											data={state.filterKeySuggestions}
											clearable
											placeholder={t(
												'dashboardBuilder.form.placeholders.defaultFilterKey'
											)}
											value={row.key ?? ''}
											onChange={(value) =>
												state.handlers.handleDefaultFilterKeyChange(
													index,
													value
												)
											}
										/>
										<Select
											label={t(
												'dashboardBuilder.form.fields.defaultFilterType'
											)}
											data={state.filterValueTypeOptions}
											allowDeselect={false}
											clearable
											value={row.valueType ?? null}
											onChange={(value) =>
												state.handlers.handleDefaultFilterTypeChange(
													index,
													value
												)
											}
										/>
										{renderFilterValueInput(index)}
										<Group justify='flex-end' align='end'>
											<ActionIcon
												type='button'
												variant='subtle'
												color='red'
												onClick={() =>
													state.handlers.removeDefaultFilterRow(index)
												}
												aria-label={t(
													'dashboardBuilder.form.actions.removeFilter'
												)}
											>
												<IconTrash size={16} />
											</ActionIcon>
										</Group>
									</SimpleGrid>
								</div>
							))}
						</Stack>
					</div>

					<div className={styles.advancedFilters}>
						<Group justify='space-between' align='center'>
							<Text fw={600} size='sm'>
								{t('dashboardBuilder.form.sections.runtimeFiltersTitle')}
							</Text>
							<Button
								type='button'
								variant='subtle'
								size='compact-sm'
								leftSection={<IconPlus size={14} />}
								onClick={state.handlers.addRuntimeFilterRow}
							>
								{t('dashboardBuilder.form.actions.addRuntimeFilter')}
							</Button>
						</Group>
						<Text size='xs' c='dimmed'>
							{t(
								'dashboardBuilder.form.guidedSections.runtimeFiltersDescription'
							)}
						</Text>
						<Stack gap='xs'>
							{state.values.runtimeFilters.map((row, index) => {
								const fieldType = inferRuntimeFilterFieldType(
									state.values,
									row.field ?? '',
									state.metricKeyOptions,
									state.parsedMetricColumns.conversation,
									state.parsedMetricColumns.disposition
								);
								const operatorOptions = getRuntimeFilterOperatorOptions(
									t,
									fieldType
								);

								return (
									<div key={row.id} className={styles.filterRow}>
										<SimpleGrid cols={{ base: 1, sm: 4 }} spacing='xs'>
											<Autocomplete
												label={t(
													'dashboardBuilder.form.fields.runtimeFilterField'
												)}
												data={state.runtimeFilterFieldSuggestions}
												clearable
												size='sm'
												placeholder={t(
													'dashboardBuilder.form.placeholders.runtimeFilterField'
												)}
												value={row.field ?? ''}
												onChange={(value) =>
													state.handlers.handleRuntimeFilterFieldChange(
														index,
														value
													)
												}
											/>
											<Select
												label={t(
													'dashboardBuilder.form.fields.runtimeFilterOperator'
												)}
												data={operatorOptions}
												allowDeselect={false}
												clearable
												disabled={!row.field}
												placeholder={t(
													'dashboardBuilder.form.placeholders.runtimeFilterOperator'
												)}
												value={row.operator}
												onChange={(value) =>
													state.handlers.handleRuntimeFilterOperatorChange(
														index,
														value
													)
												}
												size='sm'
											/>
											{renderRuntimeFilterValueInput(index)}
											<Group justify='flex-end' align='end'>
												<ActionIcon
													type='button'
													variant='subtle'
													color='red'
													onClick={() =>
														state.handlers.removeRuntimeFilterRow(index)
													}
													aria-label={t(
														'dashboardBuilder.form.actions.removeFilter'
													)}
												>
													<IconTrash size={16} />
												</ActionIcon>
											</Group>
										</SimpleGrid>
									</div>
								);
							})}
						</Stack>
					</div>
				</div>
			</Collapse>
		</>
	);
};

export default DashboardWidgetAdvancedSection;
