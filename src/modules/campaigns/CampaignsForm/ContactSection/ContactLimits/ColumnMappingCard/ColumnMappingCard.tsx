import { useMemo } from 'react';
import { Badge, Card, Group, Stack, Text } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { modals } from '@mantine/modals';
import { IconCheck, IconChevronRight } from '@tabler/icons-react';
import { ContactHeaderMapping } from '../../ContactHeaderMapping/ContactHeaderMapping';
import type { MappedResult } from '~/models/ContactFileSummary';
import styles from '../ContactLimits.module.css';

/**
 * Count how many CSV columns are mapped.
 * This counts the actual CSV columns used, not the system fields.
 */
export function countMappedCsvColumns(columnMappings: MappedResult): number {
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
 * Check if all CSV headers are mapped.
 * This is the smart validation - it checks that all CSV columns from the file
 * have been assigned to a system field. phoneNumber and other array fields
 * don't cause issues because we're counting CSV columns, not system fields.
 */
export function areAllColumnsMapped(
	columnMappings: MappedResult,
	totalHeaders: number
): boolean {
	return countMappedCsvColumns(columnMappings) >= totalHeaders;
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
	const { t } = useTranslation('campaigns');

	// Count total mapped CSV columns
	const totalMappedCsvColumns = useMemo(
		() => countMappedCsvColumns(columnMappings),
		[columnMappings]
	);

	// Valid when all CSV columns are mapped
	const isValid = totalMappedCsvColumns >= headers.length;

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
