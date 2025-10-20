import { useState } from 'react';
import { Button, Group, Text, Modal, Badge, Tooltip } from '@mantine/core';
import {
	IconPlus,
	IconEdit,
	IconTrash,
	IconSettings,
} from '@tabler/icons-react';
import BaseTable from '~/components/BaseTable';
import EmptyState from '~/components/EmptyState';
import PaginationControls from '~/components/PaginationControls';
import { useDeleteClientConfig } from '~/queries/useClientConfigs';
import type { ClientConfig } from '~/models/ClientConfig';
import type { ColumnDef } from '@tanstack/react-table';
import { notifications } from '@mantine/notifications';
import { useClientConfigsStore } from '~/stores/clientConfigsStore';
import { useFilteredClientConfigs } from '../hooks';
import { ClientConfigsFilters } from '../ClientConfigsFilters';

import styles from './ClientConfigsContent.module.css';
import { ClientConfigsForm } from '../ClientConfigsForm';

interface ClientConfigsContentProps {
	createModalOpened: boolean;
	setCreateModalOpened: (opened: boolean) => void;
}

export function ClientConfigsContent({
	createModalOpened,
	setCreateModalOpened,
}: ClientConfigsContentProps) {
	const [editModalOpened, setEditModalOpened] = useState(false);
	const [deleteModalOpened, setDeleteModalOpened] = useState(false);
	const [selectedConfig, setSelectedConfig] = useState<ClientConfig | null>(
		null
	);
	const [configToDelete, setConfigToDelete] = useState<ClientConfig | null>(
		null
	);

	const { pagination, setPagination } = useClientConfigsStore();
	const { configs, totalConfigs, allConfigsCount, isLoading } =
		useFilteredClientConfigs();
	const deleteConfig = useDeleteClientConfig();

	const handleEdit = (config: ClientConfig) => {
		setSelectedConfig(config);
		setEditModalOpened(true);
	};

	const handleDeleteClick = (config: ClientConfig) => {
		setConfigToDelete(config);
		setDeleteModalOpened(true);
	};

	const handleDeleteConfirm = async () => {
		if (!configToDelete) return;

		try {
			await deleteConfig.mutateAsync(configToDelete.name);
			notifications.show({
				title: 'Success',
				message: 'Configuration deleted successfully',
				color: 'green',
			});
			setDeleteModalOpened(false);
			setConfigToDelete(null);
		} catch (error) {
			notifications.show({
				title: 'Error',
				message: 'Failed to delete configuration',
				color: 'red',
			});
		}
	};

	const columns: ColumnDef<ClientConfig>[] = [
		{
			accessorKey: 'name',
			header: 'Name',
			cell: ({ row }) => (
				<Text className={styles.configName} fw={500}>
					{row.original.name}
				</Text>
			),
		},
		{
			accessorKey: 'description',
			header: 'Description',
			cell: ({ row }) => (
				<Text className={styles.description}>{row.original.description}</Text>
			),
		},
		{
			accessorKey: 'type',
			header: 'Type',
			cell: ({ row }) => (
				<Badge variant='light' size='sm'>
					{row.original.type}
				</Badge>
			),
		},
		{
			accessorKey: 'value',
			header: 'Value',
			cell: ({ row }) => (
				<Text className={styles.value} lineClamp={1}>
					{row.original.value}
				</Text>
			),
		},
		{
			accessorKey: 'updatedAt',
			header: 'Last Updated',
			cell: ({ row }) => (
				<Text className={styles.dateText}>
					{new Date(row.original.updatedAt).toLocaleDateString()}
				</Text>
			),
		},
		{
			id: 'actions',
			header: 'Actions',
			cell: ({ row }) => (
				<Group gap='xs' className={styles.actionsGroup}>
					<Tooltip label='Edit configuration' withArrow>
						<Button
							size='xs'
							variant='subtle'
							onClick={() => handleEdit(row.original)}
							className={styles.actionButton}
						>
							<IconEdit size={14} />
						</Button>
					</Tooltip>
					<Tooltip label='Delete configuration' withArrow>
						<Button
							size='xs'
							variant='subtle'
							color='red'
							onClick={() => handleDeleteClick(row.original)}
							className={styles.actionButton}
						>
							<IconTrash size={14} />
						</Button>
					</Tooltip>
				</Group>
			),
		},
	];

	// Show empty state only when there are NO configs at all (not when filters don't match)
	const showEmptyState = allConfigsCount === 0 && !isLoading;

	if (showEmptyState) {
		return (
			<div className={styles.container}>
				<EmptyState
					icon={<IconSettings size={48} />}
					message='No configurations found'
					description='Get started by creating your first client configuration'
					action={
						<Button
							leftSection={<IconPlus size={16} />}
							onClick={() => setCreateModalOpened(true)}
						>
							Create Configuration
						</Button>
					}
				/>

				<Modal
					opened={createModalOpened}
					onClose={() => setCreateModalOpened(false)}
					title='Create Client Configuration'
					size='lg'
				>
					<ClientConfigsForm
						onSuccess={() => setCreateModalOpened(false)}
						onCancel={() => setCreateModalOpened(false)}
					/>
				</Modal>
			</div>
		);
	}

	return (
		<div className={styles.container}>
			<ClientConfigsFilters />

			{configs.length === 0 && !isLoading ? (
				<div className={styles.noResultsContainer}>
					<Text size='lg' fw={500} ta='center'>
						No configurations match your filters
					</Text>
					<Text size='sm' c='dimmed' ta='center'>
						Try adjusting your search criteria or filters
					</Text>
				</div>
			) : (
				<>
					<BaseTable
						data={configs}
						columns={columns}
						isLoading={isLoading}
						className={styles.table}
					/>

					<PaginationControls
						currentPage={pagination.page}
						totalPages={Math.ceil(totalConfigs / pagination.pageSize)}
						itemsPerPage={pagination.pageSize}
						totalItems={totalConfigs}
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
						itemLabel='configurations'
					/>
				</>
			)}

			{/* Create Modal */}
			<Modal
				opened={createModalOpened}
				onClose={() => setCreateModalOpened(false)}
				title='Create Client Configuration'
				size='90%'
			>
				<ClientConfigsForm
					onSuccess={() => setCreateModalOpened(false)}
					onCancel={() => setCreateModalOpened(false)}
				/>
			</Modal>

			{/* Edit Modal */}
			<Modal
				opened={editModalOpened}
				onClose={() => {
					setEditModalOpened(false);
					setSelectedConfig(null);
				}}
				title='Edit Client Configuration'
				size='90%'
			>
				{selectedConfig && (
					<ClientConfigsForm
						config={selectedConfig}
						onSuccess={() => {
							setEditModalOpened(false);
							setSelectedConfig(null);
						}}
						onCancel={() => {
							setEditModalOpened(false);
							setSelectedConfig(null);
						}}
					/>
				)}
			</Modal>

			{/* Delete Confirmation Modal */}
			<Modal
				opened={deleteModalOpened}
				onClose={() => {
					setDeleteModalOpened(false);
					setConfigToDelete(null);
				}}
				title='Delete Configuration'
				size='sm'
			>
				<Text size='sm' mb='md'>
					Are you sure you want to delete the configuration{' '}
					<Text component='span' fw={700}>
						{configToDelete?.name}
					</Text>
					? This action cannot be undone.
				</Text>
				<Group justify='flex-end' gap='xs'>
					<Button
						variant='subtle'
						onClick={() => {
							setDeleteModalOpened(false);
							setConfigToDelete(null);
						}}
					>
						Cancel
					</Button>
					<Button
						color='red'
						onClick={handleDeleteConfirm}
						loading={deleteConfig.isPending}
					>
						Delete
					</Button>
				</Group>
			</Modal>
		</div>
	);
}
