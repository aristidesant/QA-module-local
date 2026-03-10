import { useState, useMemo, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
	Button,
	Card,
	Group,
	Text,
	Menu,
	ActionIcon,
	Badge,
	Stack,
	ScrollArea,
	Divider,
	ThemeIcon,
	Tooltip,
} from '@mantine/core';
import { useGetClientConfig } from '~/queries/clientConfigQueries';
import { useGetSchemaByObjectiveId } from '~/queries/campaignContactSchemasQueries';
import {
	IconPlus,
	IconCheck,
	IconLetterDSmall,
	IconRefresh,
	IconX,
	IconWand,
} from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import styles from './ContactHeaderMapping.module.css';
import { modals } from '@mantine/modals';
import type { MappedResult } from '~/models/ContactFileSummary';
import type {
	CampaignContactSchemaField,
	CampaignContactSchema,
} from '~/models/CampaignContactSchemaModel';
import { useCampaignsStore } from '~/stores/campaignsStore';

interface SystemColumn {
	name: string;
	label: string;
	type: string;
	isArray: boolean;
	isDynamic?: boolean;
	required?: boolean;
	matchPatterns?: string[];
}

interface ContactHeaderMappingProps {
	documentColumns: string[];
	onMappingChange: (mappings: MappedResult) => void;
	result?: MappedResult;
	schemaFields?: CampaignContactSchemaField[];
	onSchemaSelected?: (schemaId: number) => void;
	objectiveId?: number;
	selectedSchemaId?: number;
}

interface FieldMapping {
	systemField: string;
	documentField: string;
}

interface SelectedDynamicSchema {
	id: number;
	name: string;
	version: number;
}

export function ContactHeaderMapping({
	documentColumns,
	onMappingChange,
	result,
	schemaFields = [],
	onSchemaSelected,
	objectiveId,
	selectedSchemaId,
}: ContactHeaderMappingProps) {
	const { t } = useTranslation('campaigns');
	// Read from campaign store and prefer store value (objectiveId or objective.id)
	const { selectedCampaign } = useCampaignsStore();

	// Determine the effective objective ID from multiple sources:
	// 1. objectiveId prop (from current form state)
	// 2. selectedCampaign.objectiveId (direct property)
	// 3. selectedCampaign.objective.id (nested object)
	const effectiveObjectiveId =
		objectiveId ??
		selectedCampaign?.objectiveId ??
		selectedCampaign?.objective?.id;

	const [selectedSystemField, setSelectedSystemField] = useState<string | null>(
		null
	);
	const [selectedDocumentField, setSelectedDocumentField] = useState<
		string | null
	>(null);
	const [mappings, setMappings] = useState<FieldMapping[]>([]);
	const [finalizedSystemFields, setFinalizedSystemFields] = useState<
		Set<string>
	>(new Set());
	const [additionalSchemaFields, setAdditionalSchemaFields] = useState<
		CampaignContactSchemaField[]
	>([]);
	const [selectedDynamicSchemaState, setSelectedDynamicSchemaState] =
		useState<SelectedDynamicSchema | null>(null);

	const { data: systemConfig, isLoading: isLoadingSystemColumns } =
		useGetClientConfig('contact_columns');

	// Always fetch schemas when we have a valid objectiveId (must be a positive number)
	// This ensures dynamic columns are available whenever an objective is set
	// The query will be disabled (not execute) if effectiveObjectiveId is undefined, null, or 0
	const { data: schemasResponse } = useGetSchemaByObjectiveId(
		effectiveObjectiveId as number,
		!!effectiveObjectiveId && effectiveObjectiveId > 0
	);
	// Extract schemas array from response, or empty array
	const schemas: CampaignContactSchema[] = schemasResponse?.data || [];

	// Transform and memoize system columns including schema fields
	const systemColumns = useMemo<SystemColumn[]>(() => {
		const baseColumns: SystemColumn[] = [];

		// Add system columns from config
		if (systemConfig?.value) {
			try {
				const parsed = JSON.parse(systemConfig.value) as SystemColumn[];
				baseColumns.push(
					...parsed.map((field) => ({
						...field,
						required: field.required ?? false,
					}))
				);
			} catch (error) {
				console.error('Error parsing contact headers:', error);
			}
		}

		// Add initial schema fields as system columns
		const initialSchemaColumns: SystemColumn[] = schemaFields.map((field) => ({
			name: field.name,
			label: field.label,
			type: field.type,
			isArray: field.isArray,
			required: false,
		}));

		// Add additional schema fields as system columns
		const additionalSchemaColumns: SystemColumn[] = additionalSchemaFields.map(
			(field) => ({
				name: field.name,
				label: field.label,
				type: field.type,
				isArray: field.isArray,
				isDynamic: true,
				required: false,
			})
		);

		return [
			...baseColumns,
			...initialSchemaColumns,
			...additionalSchemaColumns,
		];
	}, [systemConfig, schemaFields, additionalSchemaFields]);

	// Convert mappings to the expected result format (arrays for isArray fields)
	const getMappedResult = useCallback(
		(currentMappings: FieldMapping[]): MappedResult => {
			const grouped = currentMappings.reduce<Record<string, string[]>>(
				(acc, { systemField, documentField }) => {
					if (!acc[systemField]) acc[systemField] = [];
					acc[systemField].push(documentField);
					return acc;
				},
				{}
			);

			const resultAcc: MappedResult = {};
			for (const [systemField, docs] of Object.entries(grouped)) {
				const column = systemColumns.find((c) => c.name === systemField);
				if (column?.isArray) {
					resultAcc[systemField] = docs.map((d) => ({ csvField: d }));
				} else {
					resultAcc[systemField] = { csvField: docs[0] };
				}
			}
			return resultAcc;
		},
		[systemColumns]
	);

	// Handler to add dynamic columns (single selection only)
	const handleAddDynamicColumns = useCallback(
		(schema: CampaignContactSchema) => {
			const schemaFieldsParam = schema.schemaFields;
			const schemaId = schema.id;

			// Replace previously selected dynamic fields with the new selection
			setAdditionalSchemaFields(() => schemaFieldsParam);
			setSelectedDynamicSchemaState({
				id: schema.id,
				name: schema.name,
				version: schema.version || 1,
			});

			// Compute allowed system field names: base + initial + newly selected dynamic fields
			const prevAdditionalNames = new Set(
				additionalSchemaFields.map((f) => f.name)
			);
			const allowedNames = new Set(systemColumns.map((c) => c.name));
			// Remove old dynamic fields from allowed set
			prevAdditionalNames.forEach((n) => allowedNames.delete(n));
			// Add the new dynamic fields
			schemaFieldsParam.forEach((f) => allowedNames.add(f.name));

			// Prune mappings that reference fields no longer available
			const prunedMappings = mappings.filter((m) =>
				allowedNames.has(m.systemField)
			);
			setMappings(prunedMappings);

			// Reset selection if it referenced a removed field
			if (selectedSystemField && !allowedNames.has(selectedSystemField)) {
				setSelectedSystemField(null);
			}

			// Notify parent consumers
			onMappingChange(getMappedResult(prunedMappings));
			onSchemaSelected?.(schemaId);
		},
		[
			additionalSchemaFields,
			systemColumns,
			mappings,
			selectedSystemField,
			getMappedResult,
			onMappingChange,
			onSchemaSelected,
		]
	);

	// Initialize mappings when component mounts or when result prop changes
	useEffect(() => {
		if (result) {
			const initialMappings = Object.entries(result).flatMap(
				([systemField, value]) => {
					if (Array.isArray(value)) {
						return value.map((v) => ({
							systemField,
							documentField: v.csvField,
						}));
					}
					return [
						{
							systemField,
							documentField: (value as { csvField: string }).csvField,
						},
					];
				}
			);
			setMappings(initialMappings);

			// For isArray fields that already have mappings, mark them as finalized
			// so they don't re-appear in the system fields list when the modal reopens
			const mappedSystemFieldNames = new Set(
				Object.keys(result).filter((key) => {
					const value = result[key];
					if (Array.isArray(value)) return value.length > 0;
					return !!value;
				})
			);

			setFinalizedSystemFields((prev) => {
				const next = new Set(prev);
				for (const fieldName of mappedSystemFieldNames) {
					const column = systemColumns.find((c) => c.name === fieldName);
					if (column?.isArray) {
						next.add(fieldName);
					}
				}
				return next;
			});
		}
	}, [result, systemColumns]);

	// Restore selected schema fields when selectedSchemaId is provided
	useEffect(() => {
		if (selectedSchemaId && selectedSchemaId > 0 && schemas.length > 0) {
			const selectedSchema = schemas.find((s) => s.id === selectedSchemaId);
			if (selectedSchema) {
				setAdditionalSchemaFields(selectedSchema.schemaFields);
				setSelectedDynamicSchemaState({
					id: selectedSchema.id,
					name: selectedSchema.name,
					version: selectedSchema.version || 1,
				});
			}
		}
	}, [selectedSchemaId, schemas]);

	// Get available fields that aren't currently mapped
	const { availableSystemFields, availableDocumentFields } = useMemo(() => {
		const mappedSystemFields = new Set(mappings.map((m) => m.systemField));
		const mappedDocumentFields = new Set(mappings.map((m) => m.documentField));
		const filteredSystemFields = systemColumns.filter((field) => {
			if (finalizedSystemFields.has(field.name)) return false;
			return field.isArray ? true : !mappedSystemFields.has(field.name);
		});

		const prioritizedSystemFields = filteredSystemFields.filter(
			(field) => field.isDynamic || field.required
		);
		const remainingSystemFields = filteredSystemFields.filter(
			(field) => !field.isDynamic && !field.required
		);

		return {
			availableSystemFields: [
				...prioritizedSystemFields,
				...remainingSystemFields,
			],
			availableDocumentFields: documentColumns.filter(
				(field) => !mappedDocumentFields.has(field)
			),
		};
	}, [systemColumns, documentColumns, mappings, finalizedSystemFields]);

	const unmappedDynamicColumns = useMemo(
		() =>
			systemColumns.filter((field) => {
				if (!field.isDynamic) return false;
				return !mappings.some((mapping) => mapping.systemField === field.name);
			}),
		[systemColumns, mappings]
	);

	const hasSelectedDynamicSchema =
		selectedDynamicSchemaState !== null ||
		(selectedSchemaId !== undefined && selectedSchemaId > 0) ||
		additionalSchemaFields.length > 0;

	const selectedDynamicSchema = useMemo(() => {
		if (selectedDynamicSchemaState) {
			return selectedDynamicSchemaState;
		}

		const fallbackSchema = schemas.find(
			(schema) => schema.id === selectedSchemaId
		);
		if (!fallbackSchema) {
			return null;
		}

		return {
			id: fallbackSchema.id,
			name: fallbackSchema.name,
			version: fallbackSchema.version || 1,
		};
	}, [schemas, selectedSchemaId, selectedDynamicSchemaState]);

	const handleClearDynamicColumns = useCallback(() => {
		const dynamicFieldNames = new Set(
			additionalSchemaFields.map((field) => field.name)
		);

		if (dynamicFieldNames.size === 0 && selectedDynamicSchema) {
			const fallbackSchema = schemas.find(
				(schema) => schema.id === selectedDynamicSchema.id
			);
			fallbackSchema?.schemaFields.forEach((field) => {
				dynamicFieldNames.add(field.name);
			});
		}

		const clearedMappings = mappings.filter(
			(mapping) => !dynamicFieldNames.has(mapping.systemField)
		);

		setAdditionalSchemaFields([]);
		setSelectedDynamicSchemaState(null);
		setMappings(clearedMappings);
		setFinalizedSystemFields((prev) => {
			const next = new Set(prev);
			dynamicFieldNames.forEach((fieldName) => next.delete(fieldName));
			return next;
		});

		if (selectedSystemField && dynamicFieldNames.has(selectedSystemField)) {
			setSelectedSystemField(null);
		}

		onSchemaSelected?.(0);
		onMappingChange(getMappedResult(clearedMappings));
	}, [
		additionalSchemaFields,
		selectedDynamicSchema,
		schemas,
		mappings,
		selectedSystemField,
		onSchemaSelected,
		onMappingChange,
		getMappedResult,
	]);

	// Auto-match system columns to CSV columns using matchPatterns + fuzzy regex
	const handleAutoMatch = useCallback(() => {
		const currentMappedSystemFields = new Set(
			mappings.map((m) => m.systemField)
		);
		const currentMappedDocFields = new Set(
			mappings.map((m) => m.documentField)
		);
		const currentFinalizedFields = new Set(finalizedSystemFields);

		// Columns eligible for auto-match: not yet mapped (or isArray and not finalized)
		const unmappedColumns = systemColumns.filter((col) => {
			if (currentFinalizedFields.has(col.name)) return false;
			return col.isArray ? true : !currentMappedSystemFields.has(col.name);
		});

		const newMappings: FieldMapping[] = [];
		const newFinalizedArrayFields: string[] = [];

		/**
		 * Normalize a string for comparison:
		 * lowercase, trim, collapse whitespace, strip accents
		 */
		const normalize = (s: string) =>
			s
				.toLowerCase()
				.trim()
				.normalize('NFD')
				.replace(/[\u0300-\u036f]/g, '')
				.replace(/[\s_-]+/g, '');

		for (const col of unmappedColumns) {
			const patterns = col.matchPatterns ?? [];
			const normalizedPatterns = patterns.map(normalize);

			// Build a regex from the system field name + label for fuzzy fallback
			const nameParts = [col.name, col.label].filter(Boolean);
			const fuzzyRegex = new RegExp(
				nameParts.map((p) => normalize(p)).join('|'),
				'i'
			);

			// Get available CSV columns (not already mapped by previous iterations or existing mappings)
			const availableCsvCols = documentColumns.filter(
				(dc) => !currentMappedDocFields.has(dc)
			);

			const matched: string[] = [];

			for (const csvCol of availableCsvCols) {
				const normalizedCsv = normalize(csvCol);

				// 1. Exact match against matchPatterns
				const patternMatch = normalizedPatterns.some(
					(p) =>
						normalizedCsv === p ||
						normalizedCsv.includes(p) ||
						p.includes(normalizedCsv)
				);

				// 2. Fuzzy regex match against field name/label
				const regexMatch = fuzzyRegex.test(normalizedCsv);

				if (patternMatch || regexMatch) {
					matched.push(csvCol);
					if (!col.isArray) break; // For non-array fields, take first match
				}
			}

			for (const csvCol of matched) {
				newMappings.push({ systemField: col.name, documentField: csvCol });
				currentMappedDocFields.add(csvCol);
			}

			if (matched.length > 0) {
				currentMappedSystemFields.add(col.name);
				if (col.isArray) {
					newFinalizedArrayFields.push(col.name);
				}
			}
		}

		if (newMappings.length === 0) {
			notifications.show({
				title: t('form.contacts.headerMapping.autoMatch.noMatchTitle'),
				message: t('form.contacts.headerMapping.autoMatch.noMatchMessage'),
				color: 'yellow',
			});
			return;
		}

		const updatedMappings = [...mappings, ...newMappings];
		setMappings(updatedMappings);

		if (newFinalizedArrayFields.length > 0) {
			setFinalizedSystemFields((prev) => {
				const next = new Set(prev);
				newFinalizedArrayFields.forEach((f) => next.add(f));
				return next;
			});
		}

		onMappingChange(getMappedResult(updatedMappings));
		setSelectedSystemField(null);
		setSelectedDocumentField(null);

		notifications.show({
			title: t('form.contacts.headerMapping.autoMatch.successTitle'),
			message: t('form.contacts.headerMapping.autoMatch.successMessage', {
				count: newMappings.length,
			}),
			color: 'green',
		});
	}, [
		mappings,
		finalizedSystemFields,
		systemColumns,
		documentColumns,
		onMappingChange,
		getMappedResult,
		t,
	]);

	// Handle removing a mapping
	const handleRemoveMapping = (mappingToRemove: FieldMapping) => {
		const updatedMappings = mappings.filter(
			(m) =>
				m.systemField !== mappingToRemove.systemField ||
				m.documentField !== mappingToRemove.documentField
		);
		setMappings(updatedMappings);
		onMappingChange(getMappedResult(updatedMappings));

		// If this was the last mapping for an array field, un-finalize it
		// so it reappears in the system fields list for re-mapping
		const remainingForField = updatedMappings.filter(
			(m) => m.systemField === mappingToRemove.systemField
		);
		if (remainingForField.length === 0) {
			setFinalizedSystemFields((prev) => {
				const next = new Set(prev);
				next.delete(mappingToRemove.systemField);
				return next;
			});
		}
	};

	// Helper functions for UI
	const isSelected = (type: 'system' | 'document', value: string) => {
		return type === 'system'
			? selectedSystemField === value
			: selectedDocumentField === value;
	};

	const handleFieldClick = (type: 'system' | 'document', value: string) => {
		type === 'system'
			? setSelectedSystemField((prev) => (prev === value ? null : value))
			: setSelectedDocumentField((prev) => (prev === value ? null : value));
	};

	const getItemClass = (isSelected: boolean) =>
		[styles.itemCard, isSelected ? styles.selectedItem : '']
			.filter(Boolean)
			.join(' ');

	const finalizeArrayField = () => {
		if (!selectedSystemField) return;
		setFinalizedSystemFields((prev) => new Set(prev).add(selectedSystemField));
		setSelectedSystemField(null);
	};

	// Handle field selection and mapping
	useEffect(() => {
		if (selectedSystemField && selectedDocumentField) {
			const newMapping = {
				systemField: selectedSystemField,
				documentField: selectedDocumentField,
			};

			setMappings((prev) => [...prev, newMapping]);

			// Keep the system field selected if it supports multiple values
			const isArrayField = systemColumns.find(
				(c) => c.name === selectedSystemField
			)?.isArray;

			if (!isArrayField) {
				setSelectedSystemField(null);
			}
			setSelectedDocumentField(null);
			onMappingChange(getMappedResult([...mappings, newMapping]));
		}
	}, [
		selectedSystemField,
		selectedDocumentField,
		mappings,
		onMappingChange,
		systemColumns,
		getMappedResult,
	]);

	const selectedSystemColumn = useMemo(
		() => systemColumns.find((c) => c.name === selectedSystemField),
		[systemColumns, selectedSystemField]
	);

	return (
		<div className={styles.container}>
			<Card withBorder className={styles.builderCard} p={0}>
				<div className={styles.builderMeta}>
					<div>
						<Text size='sm' fw={600}>
							{t('form.contacts.headerMapping.title')}
						</Text>
						<Text size='xs' c='dimmed'>
							{t('form.contacts.headerMapping.description')}
						</Text>
					</div>
					<Group gap='xs'>
						<Tooltip label={t('form.contacts.headerMapping.autoMatch.tooltip')}>
							<Button
								variant='light'
								size='compact-xs'
								leftSection={<IconWand size={13} />}
								onClick={handleAutoMatch}
							>
								{t('form.contacts.headerMapping.autoMatch.button')}
							</Button>
						</Tooltip>
						<Badge size='xs' variant='light' color='blue'>
							{t('form.contacts.headerMapping.mappedBadge', {
								count: mappings.length,
							})}
						</Badge>
						<Badge size='xs' variant='light' color='gray'>
							{t('form.contacts.headerMapping.csvHeadersBadge', {
								count: documentColumns.length,
							})}
						</Badge>
					</Group>
				</div>
				{unmappedDynamicColumns.length > 0 && (
					<div
						style={{
							backgroundColor: 'var(--mantine-color-red-0)',
							borderLeft: '3px solid var(--mantine-color-red-6)',
							padding: 'var(--mantine-spacing-sm)',
						}}
					>
						<Group gap='xs' align='center'>
							<ThemeIcon size='sm' color='red' variant='light'>
								<IconLetterDSmall />
							</ThemeIcon>
							<Text size='xs' c='red' fw={500}>
								{t('form.contacts.headerMapping.dynamicFieldsRequired', {
									count: unmappedDynamicColumns.length,
								})}
							</Text>
							{selectedDynamicSchema && (
								<Badge size='xs' color='red' variant='light'>
									{t('form.contacts.headerMapping.selectedDynamicSet', {
										name: selectedDynamicSchema.name,
										version: selectedDynamicSchema.version || 1,
									})}
								</Badge>
							)}
						</Group>
					</div>
				)}
				<Divider />
				<div className={styles.contentWrapper}>
					<div className={styles.columnsLayout}>
						<div className={styles.listSection}>
							<div className={styles.sectionHeader}>
								<Group gap={8} align='center'>
									<Text size='sm' fw={600}>
										{t('form.contacts.headerMapping.systemFields')}
									</Text>
									<Badge size='xs' variant='light' color='gray'>
										{availableSystemFields.length}
									</Badge>
								</Group>
								<Group gap={6}>
									{!effectiveObjectiveId ? (
										<Badge size='xs' color='yellow' variant='light'>
											{t('form.contacts.headerMapping.selectObjective')}
										</Badge>
									) : schemas && schemas.length > 0 ? (
										<Group gap={4}>
											<Menu position='bottom-end' withArrow width={320}>
												<Menu.Target>
													<Tooltip
														label={
															hasSelectedDynamicSchema
																? t(
																		'form.contacts.headerMapping.changeDynamicColumns'
																	)
																: t(
																		'form.contacts.headerMapping.addDynamicColumns'
																	)
														}
													>
														<ActionIcon
															variant='light'
															size='sm'
															color={
																hasSelectedDynamicSchema ? 'orange' : 'blue'
															}
														>
															{hasSelectedDynamicSchema ? (
																<IconRefresh size={14} />
															) : (
																<IconPlus size={14} />
															)}
														</ActionIcon>
													</Tooltip>
												</Menu.Target>
												<Menu.Dropdown>
													<Menu.Label>
														{t('form.contacts.headerMapping.dynamicSetTitle')}
													</Menu.Label>
													{schemas.map((schema, index) => (
														<div key={schema.id}>
															<Menu.Item
																onClick={() => {
																	handleAddDynamicColumns(schema);
																}}
																className={styles.dynamicMenuItem}
															>
																<Stack gap={4}>
																	<Group gap={6} align='baseline'>
																		<Text size='sm' fw={500}>
																			{schema.name}
																		</Text>
																		<Badge size='xs' variant='light'>
																			{t(
																				'form.contacts.headerMapping.version',
																				{
																					version: schema.version || 1,
																				}
																			)}
																		</Badge>
																	</Group>
																	{schema.description && (
																		<Text size='xs' c='dimmed' lineClamp={2}>
																			{schema.description}
																		</Text>
																	)}
																	<Text size='xs' c='blue' fw={500}>
																		{t(
																			'scheduler.schedulerBuilder.fieldsCount',
																			{
																				count: schema.schemaFields.length,
																			}
																		)}
																	</Text>
																</Stack>
															</Menu.Item>
															{index < schemas.length - 1 && <Divider />}
														</div>
													))}
												</Menu.Dropdown>
											</Menu>
											{hasSelectedDynamicSchema && (
												<Tooltip
													label={t(
														'form.contacts.headerMapping.clearDynamicColumns'
													)}
												>
													<ActionIcon
														variant='light'
														size='sm'
														color='red'
														onClick={handleClearDynamicColumns}
													>
														<IconX size={14} />
													</ActionIcon>
												</Tooltip>
											)}
										</Group>
									) : null}
								</Group>
							</div>
							<ScrollArea
								className={styles.itemsScrollArea}
								scrollHideDelay={0}
								scrollbarSize={4}
							>
								<Stack gap={4} className={styles.itemsStack}>
									{isLoadingSystemColumns ? (
										<Text size='xs' c='dimmed' ta='center' mt='md'>
											{t('form.contacts.headerMapping.loadingColumns')}
										</Text>
									) : availableSystemFields.length === 0 ? (
										<div className={styles.emptyState}>
											<Text size='xs' c='dimmed'>
												{t('form.contacts.headerMapping.allMapped')}
											</Text>
										</div>
									) : (
										availableSystemFields.map((column) => {
											const selected = isSelected('system', column.name);
											return (
												<Card
													key={`system-${column.name}`}
													withBorder={false}
													className={getItemClass(selected)}
													onClick={() =>
														handleFieldClick('system', column.name)
													}
													p='xs'
												>
													<Group
														gap='xs'
														align='flex-start'
														justify='space-between'
													>
														<Stack gap={2} style={{ flex: 1, minWidth: 0 }}>
															<Group gap='xs' align='center' wrap='nowrap'>
																<Text
																	size='xs'
																	fw={selected ? 600 : 500}
																	style={{ wordBreak: 'break-word' }}
																>
																	{column.label || column.name}
																</Text>
																{column.required && (
																	<Badge size='xs' variant='light' color='red'>
																		{t(
																			'form.contacts.headerMapping.requiredBadge'
																		)}
																	</Badge>
																)}
																{column.isDynamic && (
																	<Tooltip
																		label={t(
																			'form.contacts.headerMapping.dynamicColumnTooltip'
																		)}
																	>
																		<ThemeIcon
																			variant='transparent'
																			size={'xs'}
																			color='red'
																		>
																			<IconLetterDSmall />
																		</ThemeIcon>
																	</Tooltip>
																)}
															</Group>
															{column.label && column.label !== column.name && (
																<Text size='xs' c='dimmed'>
																	{column.name}
																</Text>
															)}
														</Stack>
														{selected && (
															<IconCheck
																size={14}
																className={styles.checkIcon}
																style={{ flexShrink: 0 }}
															/>
														)}
													</Group>
												</Card>
											);
										})
									)}
								</Stack>
							</ScrollArea>
						</div>
						<div className={styles.listSection}>
							<div className={styles.sectionHeader}>
								<Group gap={8}>
									<Text size='sm' fw={600}>
										{t('form.contacts.headerMapping.csvColumns')}
									</Text>
									<Badge size='xs' variant='light' color='gray'>
										{availableDocumentFields.length}
									</Badge>
								</Group>
								{selectedSystemColumn?.isArray && (
									<Button
										size='xs'
										variant='light'
										onClick={finalizeArrayField}
									>
										{t('form.contacts.headerMapping.finishMultiSelect')}
									</Button>
								)}
							</div>
							{selectedSystemColumn?.isArray && (
								<div className={styles.arrayToolbar}>
									<Text size='xs' c='dimmed'>
										{t('form.contacts.headerMapping.multiSelectDescription', {
											field:
												selectedSystemColumn.label || selectedSystemColumn.name,
										})}
									</Text>
								</div>
							)}
							<ScrollArea
								className={styles.itemsScrollArea}
								scrollHideDelay={0}
								scrollbarSize={4}
							>
								<Stack gap={4} className={styles.itemsStack}>
									{availableDocumentFields.length === 0 ? (
										<div className={styles.emptyState}>
											<Text size='xs' c='dimmed'>
												{t('form.contacts.headerMapping.allCsvMapped')}
											</Text>
										</div>
									) : (
										availableDocumentFields.map((column) => (
											<Card
												key={`doc-${column}`}
												withBorder={false}
												className={getItemClass(isSelected('document', column))}
												onClick={() => handleFieldClick('document', column)}
												p='xs'
											>
												<Group
													gap='xs'
													align='flex-start'
													justify='space-between'
												>
													<Stack gap={2} style={{ flex: 1, minWidth: 0 }}>
														<Text
															size='xs'
															fw={isSelected('document', column) ? 600 : 500}
															style={{ wordBreak: 'break-word' }}
														>
															{column}
														</Text>
														<Text size='xs' c='dimmed'>
															{t('form.contacts.headerMapping.csvColumnLabel')}
														</Text>
													</Stack>
													{isSelected('document', column) && (
														<IconCheck
															size={14}
															className={styles.checkIcon}
															style={{ flexShrink: 0 }}
														/>
													)}
												</Group>
											</Card>
										))
									)}
								</Stack>
							</ScrollArea>
						</div>
						<div className={styles.listSection}>
							<div className={styles.sectionHeader}>
								<Group gap={6}>
									<Text size='sm' fw={600}>
										{t('form.contacts.headerMapping.currentMappings')}
									</Text>
									<Badge size='xs' variant='light' color='blue'>
										{mappings.length}
									</Badge>
								</Group>
								<Text size='xs' c='dimmed'>
									{t('form.contacts.headerMapping.clickToRemove')}
								</Text>
							</div>
							<ScrollArea
								className={styles.itemsScrollArea}
								scrollHideDelay={0}
								scrollbarSize={4}
							>
								<Stack gap={4} className={styles.itemsStack}>
									{mappings.length > 0 ? (
										mappings.map((mapping) => {
											const systemField = systemColumns.find(
												(col) => col.name === mapping.systemField
											);
											if (!systemField) return null;

											return (
												<Card
													key={`mapped-${mapping.systemField}-${mapping.documentField}`}
													withBorder={false}
													className={styles.itemCard}
													onClick={() => handleRemoveMapping(mapping)}
													p='xs'
													style={{
														borderColor: 'var(--mantine-color-gray-3)',
													}}
												>
													<Group
														gap='xs'
														align='flex-start'
														justify='space-between'
													>
														<Stack gap={2} style={{ flex: 1, minWidth: 0 }}>
															<Text
																size='xs'
																fw={600}
																style={{ wordBreak: 'break-word' }}
															>
																{systemField.label || systemField.name}
															</Text>
															{systemField.label &&
																systemField.label !== systemField.name && (
																	<Text size='xs' c='dimmed'>
																		{systemField.name}
																	</Text>
																)}
														</Stack>
														<Text
															size='xs'
															c='dimmed'
															mx='xs'
															style={{ flexShrink: 0 }}
														>
															&rarr;
														</Text>
														<Stack gap={2} style={{ flex: 1, minWidth: 0 }}>
															<Text
																size='xs'
																fw={500}
																style={{ wordBreak: 'break-word' }}
															>
																{mapping.documentField}
															</Text>
															<Text size='xs' c='dimmed'>
																{t(
																	'form.contacts.headerMapping.csvColumnLabel'
																)}
															</Text>
														</Stack>
													</Group>
												</Card>
											);
										})
									) : (
										<div className={styles.emptyState}>
											<Text size='xs' c='dimmed' ta='center'>
												{t('form.contacts.headerMapping.noMappings')}
											</Text>
											<Text size='xs' c='dimmed' ta='center' mt={4}>
												{t('form.contacts.headerMapping.noMappingsDescription')}
											</Text>
										</div>
									)}
								</Stack>
							</ScrollArea>
						</div>
					</div>
					<div className={styles.stickySelectionBar}>
						<Group gap={6} wrap='wrap' style={{ flex: 1 }}>
							{selectedSystemColumn ? (
								<Group gap={4} wrap='nowrap'>
									<Badge size='xs' variant='filled' color='blue'>
										{selectedSystemColumn.label || selectedSystemColumn.name}
									</Badge>
									<Text size='xs' c='dimmed'>
										{t('form.contacts.headerMapping.systemFieldLabel')}
									</Text>
									{selectedSystemColumn.isArray && (
										<Text size='xs' c='dimmed'>
											{t('form.contacts.headerMapping.multiSelectNote')}
										</Text>
									)}
								</Group>
							) : (
								<Text size='xs' c='dimmed'>
									{t('form.contacts.headerMapping.pickSystemField')}
								</Text>
							)}
							{selectedDocumentField ? (
								<Group gap={4} wrap='nowrap'>
									<Badge size='xs' variant='light'>
										{selectedDocumentField}
									</Badge>
									<Text size='xs' c='dimmed'>
										{t('form.contacts.headerMapping.selectedCsvLabel')}
									</Text>
								</Group>
							) : (
								<Text size='xs' c='dimmed'>
									{t('form.contacts.headerMapping.chooseMatchingCsv')}
								</Text>
							)}
						</Group>
						{(selectedSystemColumn || selectedDocumentField) && (
							<Button
								variant='subtle'
								size='xs'
								onClick={() => {
									setSelectedDocumentField(null);
									setSelectedSystemField(null);
								}}
							>
								{t('form.contacts.headerMapping.clearSelection')}
							</Button>
						)}
					</div>
				</div>
			</Card>

			<Group justify='space-between' mt='md'>
				<Text size='xs' c='dimmed'>
					{t('form.contacts.headerMapping.mappingsCreated', {
						count: mappings.length,
					})}
				</Text>
				<Group gap='xs'>
					<Button
						variant='default'
						size='sm'
						onClick={() => modals.close('match-columns-modal')}
					>
						{t('actions.cancel', { ns: 'common' })}
					</Button>
					<Button
						size='sm'
						onClick={() => {
							onMappingChange(getMappedResult(mappings));
							modals.close('match-columns-modal');
						}}
						disabled={
							mappings.length === 0 || unmappedDynamicColumns.length > 0
						}
					>
						{t('form.contacts.headerMapping.saveMappings')}
					</Button>
				</Group>
			</Group>
		</div>
	);
}
