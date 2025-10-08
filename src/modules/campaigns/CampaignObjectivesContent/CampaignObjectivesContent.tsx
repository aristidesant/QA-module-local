import React, { useState, useEffect } from 'react';
import { Button, Group, Text, Modal, Badge, Tooltip } from '@mantine/core';
import { IconPlus, IconEdit, IconTrash, IconTag } from '@tabler/icons-react';
import BaseTable from '~/components/BaseTable';
import EmptyState from '~/components/EmptyState';
import { useDeleteCampaignObjective } from '~/queries/campaignObjectivesQueries';
import { CampaignObjective } from '~/models/CampaignObjectiveModel';
import { ColumnDef } from '@tanstack/react-table';
import { notifications } from '@mantine/notifications';
import { CampaignObjectivesForm } from '../CampaignObjectivesForm/CampaignObjectivesForm';
import { CampaignObjectivesFilters } from '../CampaignObjectivesFilters';
import { CampaignCategoriesPagination } from '../CampaignCategoriesPagination';
import { useCampaignObjectivesWithFilters } from '../hooks/useFilteredObjectives';
import styles from './CampaignObjectivesContent.module.css';

type EnrichedObjective = CampaignObjective & {
	categoryName: string;
};

export const CampaignObjectivesContent: React.FC = () => {
	const [createModalOpened, setCreateModalOpened] = useState(false);
	const [editModalOpened, setEditModalOpened] = useState(false);
	const [selectedObjective, setSelectedObjective] =
		useState<CampaignObjective | null>(null);

	// Listen for create modal event from parent
	useEffect(() => {
		const handleOpenCreateModal = () => setCreateModalOpened(true);
		window.addEventListener('openCreateObjectiveModal', handleOpenCreateModal);
		return () =>
			window.removeEventListener(
				'openCreateObjectiveModal',
				handleOpenCreateModal
			);
	}, []);

	// Use the combined hook that handles both server and client filtering
	const {
		objectives,
		pagination,
		filters,
		setPagination,
		setFilters,
		isLoading,
	} = useCampaignObjectivesWithFilters();

	const deleteObjective = useDeleteCampaignObjective();

	const handleEdit = (objective: CampaignObjective) => {
		setSelectedObjective(objective);
		setEditModalOpened(true);
	};

	const handleDelete = async (id: number) => {
		try {
			await deleteObjective.mutateAsync(id);
			notifications.show({
				title: 'Success',
				message: 'Campaign objective deleted successfully',
				color: 'green',
			});
		} catch (error) {
			notifications.show({
				title: 'Error',
				message: 'Failed to delete campaign objective',
				color: 'red',
			});
		}
	};

	const columns: ColumnDef<EnrichedObjective>[] = [
		{
			accessorKey: 'name',
			header: 'Name',
			cell: ({ row }) => (
				<Text fw={500} className={styles.objectiveName}>
					{row.original.name}
				</Text>
			),
		},
		{
			accessorKey: 'categoryName',
			header: 'Category',
			cell: ({ row }) => (
				<Group gap='xs'>
					<IconTag size={14} className={styles.categoryIcon} />
					<Text className={styles.categoryName}>
						{row.original.categoryName}
					</Text>
				</Group>
			),
		},
		{
			accessorKey: 'description',
			header: 'Description',
			cell: ({ row }) => (
				<Text className={styles.objectiveDescription}>
					{row.original.description || 'No description'}
				</Text>
			),
		},
		{
			accessorKey: 'active',
			header: 'Status',
			cell: ({ row }) => (
				<Badge
					variant='light'
					color={row.original.active ? 'green' : 'gray'}
					size='sm'
					className={styles.statusBadge}
				>
					{row.original.active ? 'Active' : 'Inactive'}
				</Badge>
			),
		},
		{
			id: 'actions',
			header: 'Actions',
			cell: ({ row }) => (
				<Group gap='xs' className={styles.actionsGroup}>
					<Tooltip label='Edit objective' withArrow>
						<Button
							size='xs'
							variant='subtle'
							onClick={() => handleEdit(row.original)}
							className={styles.actionButton}
						>
							<IconEdit size={14} />
						</Button>
					</Tooltip>
					<Tooltip label='Delete objective' withArrow>
						<Button
							size='xs'
							variant='subtle'
							color='red'
							onClick={() => handleDelete(row.original.id)}
							loading={deleteObjective.isPending}
							className={styles.actionButton}
						>
							<IconTrash size={14} />
						</Button>
					</Tooltip>
				</Group>
			),
		},
	];

	// Show empty state only if no objectives exist at all (not filtered)
	const showEmptyState = objectives.length === 0 && !isLoading;

	if (showEmptyState) {
		return (
			<div className={styles.container}>
				<EmptyState
					icon={<IconPlus size={48} />}
					title='No objectives found'
					subtitle='Get started by creating your first campaign objective'
					button={
						<Button
							leftSection={<IconPlus size={16} />}
							onClick={() => setCreateModalOpened(true)}
						>
							Create Objective
						</Button>
					}
				/>

				<Modal
					opened={createModalOpened}
					onClose={() => setCreateModalOpened(false)}
					title='Create Campaign Objective'
					size='md'
				>
					<CampaignObjectivesForm
						onSuccess={() => setCreateModalOpened(false)}
						onCancel={() => setCreateModalOpened(false)}
					/>
				</Modal>
			</div>
		);
	}

	return (
		<div className={styles.container}>
			<CampaignObjectivesFilters
				filters={filters}
				onFiltersChange={setFilters}
				resultsCount={pagination.total}
			/>

			{objectives.length === 0 && !isLoading ? (
				<div className={styles.noResultsContainer}>
					<Text size='lg' fw={500} ta='center'>
						No objectives match your filters
					</Text>
					<Text size='sm' c='dimmed' ta='center'>
						Try adjusting your search criteria or filters
					</Text>
				</div>
			) : (
				<>
					<BaseTable
						data={objectives}
						columns={columns}
						isLoading={isLoading}
						className={styles.table}
					/>

					<CampaignCategoriesPagination
						pagination={pagination}
						onPaginationChange={setPagination}
						disabled={false} // Now enabled with server-side pagination
					/>
				</>
			)}

			{/* Create Modal */}
			<Modal
				opened={createModalOpened}
				onClose={() => setCreateModalOpened(false)}
				title='Create Campaign Objective'
				size='md'
			>
				<CampaignObjectivesForm
					onSuccess={() => setCreateModalOpened(false)}
					onCancel={() => setCreateModalOpened(false)}
				/>
			</Modal>

			{/* Edit Modal */}
			<Modal
				opened={editModalOpened}
				onClose={() => {
					setEditModalOpened(false);
					setSelectedObjective(null);
				}}
				title='Edit Campaign Objective'
				size='md'
			>
				{selectedObjective && (
					<CampaignObjectivesForm
						objective={selectedObjective}
						onSuccess={() => {
							setEditModalOpened(false);
							setSelectedObjective(null);
						}}
						onCancel={() => {
							setEditModalOpened(false);
							setSelectedObjective(null);
						}}
					/>
				)}
			</Modal>
		</div>
	);
};
