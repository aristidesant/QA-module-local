import { Box, Card, Group, Stack, Text, ThemeIcon, rem } from '@mantine/core';
import { modals } from '@mantine/modals';
import {
	IconAlertTriangle,
	IconCheck,
	IconChevronRight,
} from '@tabler/icons-react';
import { ContactHeaderMapping } from '../../ContactHeaderMapping/ContactHeaderMapping';
import type { MappedResult } from '~/models/ContactFileSummary';
import styles from '../ContactLimits.module.css';

// Required fields that must be mapped for the form to be valid
export const REQUIRED_FIELDS = ['phoneNumber', 'firstName', 'lastName'];

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
}

function ColumnMappingCard({
	columnMappings,
	headers,
	onMappingChange,
	error,
	objectiveId,
	onSchemaSelected,
	selectedSchemaId,
}: ColumnMappingCardProps) {
	const mappedColumnsCount = Object.keys(columnMappings).length;
	const totalColumns = headers.length;
	const isAllMapped = mappedColumnsCount === totalColumns;

	const openMappingModal = () => {
		modals.open({
			modalId: 'match-columns-modal',
			title: 'Match Columns',
			size: '900px',
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
			<Text fw={500} mb={4}>
				Match Columns
			</Text>
			<Text c='dimmed' size='sm' mb='md'>
				Ensure each column from your document is correctly matched with the
				system's required fields.
			</Text>

			<Card
				withBorder
				radius='md'
				className={styles.matchCard}
				onClick={openMappingModal}
				style={{ cursor: 'pointer' }}
			>
				<Group justify='space-between' align='center'>
					<Group gap='md' align='center'>
						<ThemeIcon
							color={isAllMapped ? 'green' : 'orange'}
							variant='light'
							size='md'
							radius='xl'
						>
							{isAllMapped ? (
								<IconCheck size={16} />
							) : (
								<IconAlertTriangle size={16} />
							)}
						</ThemeIcon>

						<Box>
							<Text fw={600} size='lg'>
								{mappedColumnsCount}/{totalColumns}
							</Text>
							<Text size='sm' c='dimmed'>
								Mapped columns
							</Text>
						</Box>
					</Group>

					<IconChevronRight
						style={{ width: rem(20), height: rem(20) }}
						className={styles.chevron}
					/>
				</Group>
			</Card>

			{error && (
				<Text size='sm' c='red' mt={4}>
					{error}
				</Text>
			)}
		</Stack>
	);
}

export default ColumnMappingCard;
