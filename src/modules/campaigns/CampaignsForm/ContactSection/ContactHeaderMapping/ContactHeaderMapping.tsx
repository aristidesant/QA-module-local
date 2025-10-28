import { useState, useMemo, useCallback, useEffect } from 'react';
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
} from '@mantine/core';
import { useGetClientConfig } from '~/queries/clientConfigQueries';
import { useGetSchemaByObjectiveId } from '~/queries/campaignContactSchemasQueries';
import { IconPlus, IconTrash, IconCheck } from '@tabler/icons-react';
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
}

interface ContactHeaderMappingProps {
	documentColumns: string[];
	onMappingChange: (mappings: MappedResult) => void;
	result?: MappedResult;
	schemaFields?: CampaignContactSchemaField[];
	onSchemaSelected?: (schemaId: number) => void;
	objectiveId?: number;
}

interface FieldMapping {
	systemField: string;
	documentField: string;
}

export function ContactHeaderMapping({
	documentColumns,
	onMappingChange,
	result,
	schemaFields = [],
	onSchemaSelected,
	objectiveId,
}: ContactHeaderMappingProps) {
	// Read from campaign store and prefer store value (objectiveId or objective.id)
	const { selectedCampaign } = useCampaignsStore();

	// Determine the effective objective ID from multiple sources:
	// 1. selectedCampaign.objectiveId (direct property)
	// 2. selectedCampaign.objective.id (nested object)
	// 3. objectiveId prop (fallback from parent component)
	const effectiveObjectiveId =
		selectedCampaign?.objectiveId ??
		selectedCampaign?.objective?.id ??
		objectiveId;

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
				baseColumns.push(...(JSON.parse(systemConfig.value) as SystemColumn[]));
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
		}));

		// Add additional schema fields as system columns
		const additionalSchemaColumns: SystemColumn[] = additionalSchemaFields.map(
			(field) => ({
				name: field.name,
				label: field.label,
				type: field.type,
				isArray: field.isArray,
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
		(schemaFieldsParam: CampaignContactSchemaField[], schemaId: number) => {
			// Replace previously selected dynamic fields with the new selection
			setAdditionalSchemaFields(() => schemaFieldsParam);

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
		}
	}, [result]);

	// Get available fields that aren't currently mapped
	const { availableSystemFields, availableDocumentFields } = useMemo(() => {
		const mappedSystemFields = new Set(mappings.map((m) => m.systemField));
		const mappedDocumentFields = new Set(mappings.map((m) => m.documentField));

		return {
			availableSystemFields: systemColumns.filter((field) => {
				if (finalizedSystemFields.has(field.name)) return false;
				return field.isArray ? true : !mappedSystemFields.has(field.name);
			}),
			availableDocumentFields: documentColumns.filter(
				(field) => !mappedDocumentFields.has(field)
			),
		};
	}, [systemColumns, documentColumns, mappings, finalizedSystemFields]);

	// Handle removing a mapping
	const handleRemoveMapping = (mappingToRemove: FieldMapping) => {
		const updatedMappings = mappings.filter(
			(m) =>
				m.systemField !== mappingToRemove.systemField ||
				m.documentField !== mappingToRemove.documentField
		);
		setMappings(updatedMappings);
		onMappingChange(getMappedResult(updatedMappings));
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
							Map CSV headers to system fields
						</Text>
						<Text size='xs' c='dimmed'>
							Choose a system field and then pick the CSV column it should use.
						</Text>
					</div>
					<Group gap='xs'>
						<Badge size='xs' variant='light' color='blue'>
							{mappings.length} mapped
						</Badge>
						<Badge size='xs' variant='light' color='gray'>
							{documentColumns.length} csv headers
						</Badge>
					</Group>
				</div>
				{(selectedSystemColumn || selectedDocumentField) && (
					<div className={styles.selectionSummary}>
						<Group gap={6} wrap='wrap'>
							{selectedSystemColumn ? (
								<Group gap={4} wrap='nowrap'>
									<Badge size='xs' variant='filled' color='blue'>
										{selectedSystemColumn.label || selectedSystemColumn.name}
									</Badge>
									<Text size='xs' c='dimmed'>
										system field
									</Text>
									{selectedSystemColumn.isArray && (
										<Text size='xs' c='dimmed'>
											(accepts multiple CSV columns)
										</Text>
									)}
								</Group>
							) : (
								<Text size='xs' c='dimmed'>
									Pick a system field to start mapping
								</Text>
							)}
							{selectedDocumentField ? (
								<Group gap={4} wrap='nowrap'>
									<Badge size='xs' variant='light'>
										{selectedDocumentField}
									</Badge>
									<Text size='xs' c='dimmed'>
										selected CSV column
									</Text>
								</Group>
							) : (
								<Text size='xs' c='dimmed'>
									Choose the matching CSV column
								</Text>
							)}
						</Group>
						<Button
							variant='subtle'
							size='xs'
							onClick={() => {
								setSelectedDocumentField(null);
								setSelectedSystemField(null);
							}}
						>
							Clear selection
						</Button>
					</div>
				)}
				<Divider />
				<div className={styles.columnsLayout}>
					<div className={styles.listSection}>
						<div className={styles.sectionHeader}>
							<Group gap={8} align='center'>
								<Text size='sm' fw={600}>
									System fields
								</Text>
								<Badge size='xs' variant='light' color='gray'>
									{availableSystemFields.length}
								</Badge>
							</Group>
							<Group gap={6}>
								{!effectiveObjectiveId ? (
									<Badge size='xs' color='yellow' variant='light'>
										Select objective
									</Badge>
								) : schemas && schemas.length > 0 ? (
									<Menu position='bottom-end' withArrow width={320}>
										<Menu.Target>
											<ActionIcon
												variant='light'
												size='sm'
												color='blue'
												title='Add dynamic columns'
											>
												<IconPlus size={14} />
											</ActionIcon>
										</Menu.Target>
										<Menu.Dropdown>
											<Menu.Label>Dynamic column sets</Menu.Label>
											{schemas.map((schema, index) => (
												<div key={schema.id}>
													<Menu.Item
														onClick={() => {
															handleAddDynamicColumns(
																schema.schemaFields,
																schema.id
															);
														}}
														className={styles.dynamicMenuItem}
													>
														<Stack gap={4}>
															<Group gap={6} align='baseline'>
																<Text size='sm' fw={500}>
																	{schema.name}
																</Text>
																<Badge size='xs' variant='light'>
																	v{schema.version || 1}
																</Badge>
															</Group>
															{schema.description && (
																<Text size='xs' c='dimmed' lineClamp={2}>
																	{schema.description}
																</Text>
															)}
															<Text size='xs' c='blue' fw={500}>
																{schema.schemaFields.length} fields
															</Text>
														</Stack>
													</Menu.Item>
													{index < schemas.length - 1 && <Divider />}
												</div>
											))}
										</Menu.Dropdown>
									</Menu>
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
										Loading columns...
									</Text>
								) : availableSystemFields.length === 0 ? (
									<div className={styles.emptyState}>
										<Text size='xs' c='dimmed'>
											All system fields mapped
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
												onClick={() => handleFieldClick('system', column.name)}
												p='xs'
											>
												<Group gap='xs' align='center' justify='space-between'>
													<Text
														size='xs'
														fw={selected ? 600 : 500}
														style={{ flex: 1, wordBreak: 'break-word' }}
													>
														{column.label || column.name}
													</Text>
													{selected && (
														<IconCheck size={14} className={styles.checkIcon} />
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
									CSV columns
								</Text>
								<Badge size='xs' variant='light' color='gray'>
									{availableDocumentFields.length}
								</Badge>
							</Group>
							{selectedSystemColumn?.isArray && (
								<Button size='xs' variant='light' onClick={finalizeArrayField}>
									Finish multi-select
								</Button>
							)}
						</div>
						{selectedSystemColumn?.isArray && (
							<div className={styles.arrayToolbar}>
								<Text size='xs' c='dimmed'>
									Add all CSV columns that should populate{' '}
									<strong>
										{selectedSystemColumn.label || selectedSystemColumn.name}
									</strong>
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
											All CSV columns mapped
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
											<Group gap='xs' align='center' justify='space-between'>
												<Text
													size='xs'
													fw={isSelected('document', column) ? 600 : 500}
													style={{ flex: 1, wordBreak: 'break-word' }}
												>
													{column}
												</Text>
												{isSelected('document', column) && (
													<IconCheck size={14} className={styles.checkIcon} />
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
									Current mappings
								</Text>
								<Badge size='xs' variant='light' color='blue'>
									{mappings.length}
								</Badge>
							</Group>
							<Text size='xs' c='dimmed'>
								Click to remove
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
												<Group gap='xs' align='center' justify='space-between'>
													<Text
														size='xs'
														fw={600}
														style={{ flex: 1, wordBreak: 'break-word' }}
													>
														{systemField.label || systemField.name}
													</Text>
													<Text size='xs' c='dimmed'>
														&rarr;
													</Text>
													<Text
														size='xs'
														style={{ flex: 1, wordBreak: 'break-word' }}
													>
														{mapping.documentField}
													</Text>
													<ActionIcon
														size='xs'
														variant='subtle'
														color='red'
														onClick={(e) => {
															e.stopPropagation();
															handleRemoveMapping(mapping);
														}}
													>
														<IconTrash size={12} />
													</ActionIcon>
												</Group>
											</Card>
										);
									})
								) : (
									<div className={styles.emptyState}>
										<Text size='xs' c='dimmed' ta='center'>
											No mappings yet
										</Text>
										<Text size='xs' c='dimmed' ta='center' mt={4}>
											Select a system field and CSV column to add your first
											mapping.
										</Text>
									</div>
								)}
							</Stack>
						</ScrollArea>
					</div>
				</div>
			</Card>

			<Group justify='space-between' mt='md'>
				<Text size='xs' c='dimmed'>
					{mappings.length} mapping{mappings.length !== 1 ? 's' : ''} created
				</Text>
				<Group gap='xs'>
					<Button
						variant='default'
						size='sm'
						onClick={() => modals.close('match-columns-modal')}
					>
						Cancel
					</Button>
					<Button
						size='sm'
						onClick={() => {
							onMappingChange(getMappedResult(mappings));
							modals.close('match-columns-modal');
						}}
						disabled={mappings.length === 0}
					>
						Save Mappings
					</Button>
				</Group>
			</Group>
		</div>
	);
}
