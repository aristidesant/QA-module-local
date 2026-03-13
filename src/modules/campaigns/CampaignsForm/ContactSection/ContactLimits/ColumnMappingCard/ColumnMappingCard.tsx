import { useMemo } from 'react';
import { Badge, Card, Group, Stack, Text } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { modals } from '@mantine/modals';
import { IconCheck, IconChevronRight } from '@tabler/icons-react';
import { ContactHeaderMapping } from '../../ContactHeaderMapping/ContactHeaderMapping';
import type { MappedResult } from '~/models/ContactFileSummary';
import { useGetClientConfig } from '~/queries/clientConfigQueries';
import styles from '../ContactLimits.module.css';

interface SystemColumn {
	name: string;
	label: string;
	type: string;
	isArray: boolean;
	required?: boolean;
}

/**
 * Count how many CSV columns are mapped in total.
 * This counts the actual CSV columns used across all mappings.
 */
export function countTotalMappedCsvColumns(
	columnMappings: MappedResult
): number {
	if (!columnMappings) return 0;

	let count = 0;
	for (const value of Object.values(columnMappings)) {
		if (Array.isArray(value)) {
			count += value.length;
		} else if (value) {
			count += 1;
		}
	}
	return count;
}

/**
 * Count how many required system fields are mapped.
 * Only counts fields that are in the systemFields list and not excluded.
 */
export function countMappedRequiredFields(
	columnMappings: MappedResult,
	systemFields: SystemColumn[]
): number {
	if (!columnMappings || !systemFields) return 0;

	const requiredFields = systemFields.filter((field) => field.required);

	// Count how many required fields have mappings
	return requiredFields.filter((field) => {
		const mapping = columnMappings[field.name];
		if (Array.isArray(mapping)) {
			return mapping.length > 0;
		}
		return !!mapping;
	}).length;
}

/**
 * Check if all required system fields are mapped.
 * Only system fields (non-dynamic) are required, except for phones.
 * Dynamic fields from schemas are optional.
 */
export function areAllSystemFieldsMapped(
	columnMappings: MappedResult,
	systemFields: SystemColumn[]
): boolean {
	if (!columnMappings || !systemFields) return false;

	const requiredFields = systemFields.filter((field) => field.required);

	// Check that each required field has a mapping
	return requiredFields.every((field) => {
		const mapping = columnMappings[field.name];
		if (Array.isArray(mapping)) {
			return mapping.length > 0;
		}
		return !!mapping;
	});
}

interface ColumnMappingCardProps {
	/** Current column mappings */
	columnMappings: MappedResult;

	/** Available CSV headers */
	headers: string[];

	/** Callback when mappings change */
	onMappingChange: (mapping: MappedResult) => void;

	/** Optional error message to display */
	error?: string;

	/** Optional objective ID to fetch schema fields */
	objectiveId?: number;

	/** Callback when a schema is selected for dynamic columns */
	onSchemaSelected?: (schemaId: number) => void;

	/** Currently selected schema ID for dynamic columns */
	selectedSchemaId?: number;

	/** Show error styling (red border) */
	showError?: boolean;
}

function ColumnMappingCard({
	columnMappings,
	headers,
	onMappingChange,
	error,
	objectiveId,
	onSchemaSelected,
	selectedSchemaId,
	showError,
}: ColumnMappingCardProps) {
	const { t } = useTranslation(['campaign.form.contacts', 'common']);

	// Fetch system columns from client config
	const { data: systemConfig } = useGetClientConfig('contact_columns');

	// Parse system columns from config
	const systemFields = useMemo<SystemColumn[]>(() => {
		if (!systemConfig?.value) return [];
		try {
			const parsed = JSON.parse(systemConfig.value) as SystemColumn[];
			return parsed.map((field) => ({
				...field,
				required: field.required ?? false,
			}));
		} catch {
			return [];
		}
	}, [systemConfig]);

	// Count total CSV columns mapped (for badge display)
	const totalMappedCsvColumns = useMemo(
		() => countTotalMappedCsvColumns(columnMappings),
		[columnMappings]
	);

	// Valid when all required system fields are mapped
	const isValid = useMemo(
		() => areAllSystemFieldsMapped(columnMappings, systemFields),
		[columnMappings, systemFields]
	);

	const openMappingModal = () => {
		modals.open({
			modalId: 'match-columns-modal',
			title: t('form.contacts.mapping.matchTitle'),
			size: '90%',
			children: (
				<ContactHeaderMapping
					result={columnMappings}
					documentColumns={headers}
					onMappingChange={onMappingChange}
					schemaFields={[]}
					onSchemaSelected={onSchemaSelected}
					objectiveId={objectiveId}
					selectedSchemaId={selectedSchemaId}
				/>
			),
		});
	};

	return (
		<Stack gap='xs'>
			<Group justify='space-between' align='center'>
				<Text fw={500} size='sm'>
					{t('form.contacts.mapping.title')}
				</Text>
				<Badge
					size='sm'
					variant='light'
					color={isValid ? 'green' : 'gray'}
					leftSection={isValid ? <IconCheck size={12} /> : null}
				>
					{totalMappedCsvColumns}/{headers.length}
				</Badge>
			</Group>

			<Card
				withBorder
				radius='md'
				className={`${styles.matchCard} ${showError ? styles.matchCardError : ''}`}
				onClick={openMappingModal}
				p='sm'
			>
				<Group justify='space-between' align='center'>
					<Stack gap={4}>
						<Text size='xs' c='dimmed'>
							{t('form.contacts.mapping.clickToConfigure')}
						</Text>
						{isValid && (
							<Text size='xs' c='green' fw={500}>
								{t('form.contacts.mapping.totalMapped', {
									count: totalMappedCsvColumns,
								})}
							</Text>
						)}
					</Stack>

					<IconChevronRight
						size={16}
						style={{ color: 'var(--mantine-color-gray-5)' }}
					/>
				</Group>
			</Card>

			{error && (
				<Text size='xs' c='red'>
					{error}
				</Text>
			)}
		</Stack>
	);
}

export default ColumnMappingCard;
