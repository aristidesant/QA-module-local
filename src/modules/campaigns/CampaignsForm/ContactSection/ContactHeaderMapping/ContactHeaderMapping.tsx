import { useState, useMemo, useCallback, useEffect } from 'react';
import { Button, Card, Group, Text, Menu, ActionIcon } from '@mantine/core';
import { useGetClientConfig } from '~/queries/clientConfigQueries';
import { useGetSchemaByObjectiveId } from '~/queries/campaignContactSchemasQueries';
import { IconPlus } from '@tabler/icons-react';
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

	const storeObjectiveId =
		selectedCampaign?.objectiveId ?? selectedCampaign?.objective?.id;

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

	// Fetch schemas by objectiveId with fallback to prop if store is not set
	const enableSchemasQuery = storeObjectiveId ?? objectiveId;
	const effectiveObjectiveId = storeObjectiveId ?? objectiveId;
	const { data: schemasResponse } = useGetSchemaByObjectiveId(
		effectiveObjectiveId as number,
		enableSchemasQuery as any
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

	const getRadioClass = (isSelected: boolean) =>
		[styles.radio, isSelected ? styles.radioSelected : '']
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
			<div className={styles.columnsContainer}>
				{/* System Columns */}
				<div className={styles.column}>
					<Card withBorder className={styles.columnCard}>
						<Group justify='space-between' align='center' mb='xs'>
							<Text size='sm' fw={500}>
								System columns
							</Text>{' '}
							{!storeObjectiveId ? (
								<Text size='xs' c='yellow' style={{ fontStyle: 'italic' }}>
									Select an objective to add dynamic columns
								</Text>
							) : schemas && schemas.length > 0 ? (
								<Group gap='xs' align='center'>
									<Text size='xs' c='dimmed'>
										Add dynamic columns
									</Text>
									<Menu position='bottom-end' withArrow width={300}>
										<Menu.Target>
											<ActionIcon
												variant='light'
												size='sm'
												title='Load additional columns for mapping'
											>
												<IconPlus size={12} />
											</ActionIcon>
										</Menu.Target>
										<Menu.Dropdown>
											<Menu.Label>Available Column Sets</Menu.Label>
											{schemas.map((schema, index) => (
												<div key={schema.id}>
													<Menu.Item
														onClick={() => {
															handleAddDynamicColumns(
																schema.schemaFields,
																schema.id
															);
														}}
														style={{
															whiteSpace: 'normal',
															height: 'auto',
															padding: '12px 16px',
															marginBottom:
																index < schemas.length - 1 ? '8px' : '0',
														}}
													>
														<div>
															<Group gap={6} align='baseline' mb={4}>
																<Text size='sm' fw={500}>
																	{schema.name}
																</Text>
																<Text size='xs' c='dimmed'>
																	(v{schema.version || 1})
																</Text>
															</Group>
															<Text size='xs' c='dimmed' mb={6}>
																{schema.description || ''}
															</Text>
															<Text size='xs' fw={500} c='blue' mb={2}>
																Available fields ({schema.schemaFields.length}):
															</Text>
															<Text
																size='xs'
																c='dimmed'
																style={{ lineHeight: 1.3 }}
															>
																{schema.schemaFields
																	.map((field) => field.label || field.name)
																	.join(', ')}
															</Text>
														</div>
													</Menu.Item>
													{index < schemas.length - 1 && (
														<div
															style={{
																height: '1px',
																backgroundColor: 'var(--mantine-color-gray-3)',
																margin: '4px 8px',
															}}
														/>
													)}
												</div>
											))}
										</Menu.Dropdown>
									</Menu>
								</Group>
							) : null}
						</Group>
						<div className={styles.itemsContainer}>
							{isLoadingSystemColumns ? (
								<Text size='sm' c='dimmed'>
									Loading system columns...
								</Text>
							) : (
								availableSystemFields.map((column) => {
									const selected = isSelected('system', column.name);
									return (
										<Card
											key={`system-${column.name}`}
											withBorder
											className={getItemClass(selected)}
											onClick={() => handleFieldClick('system', column.name)}
											p='xs'
										>
											<Group gap='xs' wrap='nowrap'>
												<div className={getRadioClass(selected)} />
												<Text size='sm'>{column.label || column.name}</Text>
											</Group>
										</Card>
									);
								})
							)}
						</div>
					</Card>
				</div>

				{/* Document Columns */}
				<div className={styles.column}>
					<Card withBorder className={styles.columnCard}>
						<Text size='sm' fw={500} mb='xs'>
							Document columns
						</Text>
						{/* Toolbar for isArray fields */}
						{selectedSystemColumn?.isArray && (
							<div className={styles.arrayToolbar}>
								<Group justify='space-between' wrap='wrap'>
									<Text size='xs' c='dimmed'>
										Adding multiple values for{' '}
										{selectedSystemColumn.label || selectedSystemColumn.name}.
										Click Done when finished.
									</Text>
									<Button
										className={styles.doneButton}
										size='xs'
										variant='light'
										onClick={finalizeArrayField}
									>
										Done
									</Button>
								</Group>
							</div>
						)}
						<div className={styles.itemsContainer}>
							{availableDocumentFields.map((column) => (
								<Card
									key={`doc-${column}`}
									withBorder
									className={getItemClass(isSelected('document', column))}
									onClick={() => handleFieldClick('document', column)}
									p='xs'
								>
									<Group gap='xs' wrap='nowrap'>
										<div
											className={getRadioClass(isSelected('document', column))}
										/>
										<Text size='xs'>{column}</Text>
									</Group>
								</Card>
							))}
						</div>
					</Card>
				</div>

				{/* Mapped Results */}
				<div className={styles.column}>
					<Card withBorder className={styles.columnCard} h='100%'>
						<Text size='sm' fw={500} mb='xs'>
							Mapped Result
						</Text>
						<Text size='xs' c='dimmed' mb='sm'>
							The system field your data will be connected to
						</Text>
						<div className={styles.mappedResults}>
							{mappings.length > 0 ? (
								mappings.map((mapping) => {
									const systemField = systemColumns.find(
										(col) => col.name === mapping.systemField
									);
									if (!systemField) return null;

									return (
										<Card
											key={`mapped-${mapping.systemField}-${mapping.documentField}`}
											withBorder
											p='xs'
											mb={4}
											style={{ cursor: 'pointer' }}
											onClick={() => handleRemoveMapping(mapping)}
										>
											<Group justify='space-between' wrap='nowrap'>
												<Group gap={4} wrap='nowrap'>
													<div className={getRadioClass(true)} />
													<Text size='sm'>
														{systemField.label || systemField.name}
													</Text>
												</Group>
												<div className={styles.connector} />
												<Group gap={4} wrap='nowrap'>
													<div className={getRadioClass(true)} />
													<Text size='sm'>{mapping.documentField}</Text>
												</Group>
											</Group>
										</Card>
									);
								})
							) : (
								<Text size='sm' c='dimmed' ta='center' mt='md'>
									Select a system field and a document field to create a mapping
								</Text>
							)}
						</div>
					</Card>
				</div>
			</div>

			<Group justify='flex-end' mt='md'>
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
				>
					Save
				</Button>
			</Group>
		</div>
	);
}
