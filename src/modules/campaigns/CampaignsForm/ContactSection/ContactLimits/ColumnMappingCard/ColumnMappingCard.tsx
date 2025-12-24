import { Badge, Card, Group, Stack, Text } from '@mantine/core';
import { useTranslation } from 'react-i18next';
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
	const { t } = useTranslation();
	const mappedColumnsCount = Object.keys(columnMappings).length;
	const totalColumns = headers.length;
	const isAllMapped = mappedColumnsCount === totalColumns;

	const openMappingModal = () => {
		modals.open({
			modalId: 'match-columns-modal',
			title: t('campaigns.form.contacts.mapping.matchTitle'),
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
					{t('campaigns.form.contacts.mapping.title')}
				</Text>
				<Badge
					size='sm'
					variant='light'
					color={isAllMapped ? 'green' : 'orange'}
					leftSection={
						isAllMapped ? (
							<IconCheck size={12} />
						) : (
							<IconAlertTriangle size={12} />
						)
					}
				>
					{mappedColumnsCount}/{totalColumns}
				</Badge>
			</Group>

			<Card
				withBorder
				radius='md'
				className={styles.matchCard}
				onClick={openMappingModal}
				p='sm'
			>
				<Group justify='space-between' align='center'>
					<Stack gap={4}>
						<Text size='xs' c='dimmed'>
							{t('campaigns.form.contacts.mapping.clickToConfigure')}
						</Text>
						{!isAllMapped && (
							<Text size='xs' c='orange' fw={500}>
								{t('campaigns.form.contacts.mapping.unmapped', {
									count: totalColumns - mappedColumnsCount,
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
