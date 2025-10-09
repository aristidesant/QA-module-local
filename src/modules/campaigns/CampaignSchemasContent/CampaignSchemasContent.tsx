import React, { useState } from 'react';
import { Button, Group, Text, Modal, Badge, Tooltip } from '@mantine/core';
import {
	IconPlus,
	IconEdit,
	IconTrash,
	IconDatabase,
} from '@tabler/icons-react';
import BaseTable from '~/components/BaseTable';
import EmptyState from '~/components/EmptyState';
import { useDeleteCampaignContactSchema } from '~/queries/campaignContactSchemasQueries';
import { CampaignContactSchema } from '~/models/CampaignContactSchemaModel';
import { ColumnDef } from '@tanstack/react-table';
import { notifications } from '@mantine/notifications';
import { CampaignSchemasForm } from '../CampaignSchemasForm';
import PaginationControls from '~/components/PaginationControls';

import styles from './CampaignSchemasContent.module.css';
import { useCampaignSchemasWithFilters } from '../hooks/useFilteredSchemas';
import { CampaignSchemasFilters } from '../CampaignSchemasFilters';

interface CampaignSchemasContentProps {
	createModalOpened: boolean;
	setCreateModalOpened: (opened: boolean) => void;
}

export const CampaignSchemasContent: React.FC<CampaignSchemasContentProps> = ({
	createModalOpened,
	setCreateModalOpened,
}) => {
	const [editModalOpened, setEditModalOpened] = useState(false);
	const [selectedSchema, setSelectedSchema] =
		useState<CampaignContactSchema | null>(null);

	// Use the combined hook that handles both server and client filtering
	const { schemas, pagination, filters, setPagination, setFilters, isLoading } =
		useCampaignSchemasWithFilters();

	const deleteSchema = useDeleteCampaignContactSchema();

	const handleEdit = (schema: CampaignContactSchema) => {
		setSelectedSchema(schema);
		setEditModalOpened(true);
	};

	const handleDelete = async (id: number) => {
		try {
			await deleteSchema.mutateAsync(id);
			notifications.show({
				title: 'Success',
				message: 'Campaign schema deleted successfully',
				color: 'green',
			});
		} catch (error) {
			notifications.show({
				title: 'Error',
				message: 'Failed to delete campaign schema',
				color: 'red',
			});
		}
	};

	const columns: ColumnDef<CampaignContactSchema>[] = [
		{
			accessorKey: 'name',
			header: 'Name',
			cell: ({ row }) => (
				<Text className={styles.schemaName} fw={500}>
					{row.original.name}
				</Text>
			),
		},
		{
			accessorKey: 'code',
			header: 'Code',
			cell: ({ row }) => (
				<Text className={styles.schemaCode}>{row.original.code}</Text>
			),
		},
		{
			accessorKey: 'objective',
			header: 'Objective',
			cell: ({ row }) => (
				<Text className={styles.objectiveName}>
					{row.original.objective?.name || 'No objective'}
				</Text>
			),
		},
		{
			accessorKey: 'schemaFields',
			header: 'Fields Count',
			cell: ({ row }) => (
				<Badge variant='light' color='blue' size='sm'>
					{row.original.schemaFields?.length || 0} fields
				</Badge>
			),
		},
		{
			accessorKey: 'version',
			header: 'Version',
			cell: ({ row }) => (
				<Badge variant='light' size='sm'>
					v{row.original.version}
				</Badge>
			),
		},
		{
			id: 'actions',
			header: 'Actions',
			cell: ({ row }) => (
				<Group gap='xs' className={styles.actionsGroup}>
					<Tooltip label='Edit schema' withArrow>
						<Button
							size='xs'
							variant='subtle'
							onClick={() => handleEdit(row.original)}
							className={styles.actionButton}
						>
							<IconEdit size={14} />
						</Button>
					</Tooltip>
					<Tooltip label='Delete schema' withArrow>
						<Button
							size='xs'
							variant='subtle'
							color='red'
							onClick={() => handleDelete(row.original.id)}
							loading={deleteSchema.isPending}
							className={styles.actionButton}
						>
							<IconTrash size={14} />
						</Button>
					</Tooltip>
				</Group>
			),
		},
	];

	// Show empty state only if no schemas exist at all (not filtered)
	const showEmptyState = schemas.length === 0 && !isLoading;

	if (showEmptyState) {
		return (
			<div className={styles.container}>
				<EmptyState
					icon={<IconDatabase size={48} />}
					title='No schemas found'
					subtitle='Get started by creating your first campaign schema'
					button={
						<Button
							leftSection={<IconPlus size={16} />}
							onClick={() => setCreateModalOpened(true)}
						>
							Create Schema
						</Button>
					}
				/>

				<Modal
					opened={createModalOpened}
					onClose={() => setCreateModalOpened(false)}
					title='Create Campaign Schema'
					size='lg'
				>
					<CampaignSchemasForm
						onSuccess={() => setCreateModalOpened(false)}
						onCancel={() => setCreateModalOpened(false)}
					/>
				</Modal>
			</div>
		);
	}

	return (
		<div className={styles.container}>
			<CampaignSchemasFilters
				filters={filters}
				onFiltersChange={setFilters}
				resultsCount={pagination.total}
			/>

			{schemas.length === 0 && !isLoading ? (
				<div className={styles.noResultsContainer}>
					<Text size='lg' fw={500} ta='center'>
						No schemas match your filters
					</Text>
					<Text size='sm' c='dimmed' ta='center'>
						Try adjusting your search criteria or filters
					</Text>
				</div>
			) : (
				<div className={styles.tableWrapper}>
					<BaseTable
						data={schemas}
						columns={columns}
						isLoading={isLoading}
						className={styles.table}
					/>

					<PaginationControls
						currentPage={pagination.page}
						totalPages={Math.ceil(pagination.total / pagination.pageSize)}
						itemsPerPage={pagination.pageSize}
						totalItems={pagination.total}
						onPageChange={(page) => setPagination({ ...pagination, page })}
						onItemsPerPageChange={(value) => {
							if (value) {
								setPagination({
									...pagination,
									page: 1,
									pageSize: parseInt(value, 10),
								});
							}
						}}
						isLoading={isLoading}
						itemLabel='schemas'
					/>
				</div>
			)}

			{/* Create Modal */}
			<Modal
				opened={createModalOpened}
				onClose={() => setCreateModalOpened(false)}
				title='Create Campaign Schema'
				size='lg'
			>
				<CampaignSchemasForm
					onSuccess={() => setCreateModalOpened(false)}
					onCancel={() => setCreateModalOpened(false)}
				/>
			</Modal>

			{/* Edit Modal */}
			<Modal
				opened={editModalOpened}
				onClose={() => {
					setEditModalOpened(false);
					setSelectedSchema(null);
				}}
				title='Edit Campaign Schema'
				size='lg'
			>
				{selectedSchema && (
					<CampaignSchemasForm
						schema={selectedSchema}
						onSuccess={() => {
							setEditModalOpened(false);
							setSelectedSchema(null);
						}}
						onCancel={() => {
							setEditModalOpened(false);
							setSelectedSchema(null);
						}}
					/>
				)}
			</Modal>
		</div>
	);
};
