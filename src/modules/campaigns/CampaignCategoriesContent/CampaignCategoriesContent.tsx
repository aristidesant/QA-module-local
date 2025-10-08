import React, { useState } from 'react';
import { Button, Group, Text, Modal, Badge } from '@mantine/core';
import { IconPlus, IconEdit, IconTrash } from '@tabler/icons-react';
import BaseTable from '~/components/BaseTable';
import EmptyState from '~/components/EmptyState';
import { useDeleteCampaignCategory } from '~/queries/campaignCategoriesQueries';
import { CampaignCategory } from '~/models/CampaignCategoryModel';
import { ColumnDef } from '@tanstack/react-table';
import { notifications } from '@mantine/notifications';
import { CampaignCategoriesForm } from '../CampaignCategoriesForm/CampaignCategoriesForm';
import { CampaignCategoriesFilters } from '../CampaignCategoriesFilters';
import { CampaignCategoriesPagination } from '../CampaignCategoriesPagination';
import { useCampaignCategoriesWithFilters } from '../hooks/useFilteredCategories';
import styles from './CampaignCategoriesContent.module.css';

export const CampaignCategoriesContent: React.FC = () => {
	const [createModalOpened, setCreateModalOpened] = useState(false);
	const [editModalOpened, setEditModalOpened] = useState(false);
	const [selectedCategory, setSelectedCategory] =
		useState<CampaignCategory | null>(null);

	// Use the combined hook that handles both server and client filtering
	const {
		categories,
		pagination,
		filters,
		setPagination,
		setFilters,
		isLoading,
	} = useCampaignCategoriesWithFilters();

	const deleteCategory = useDeleteCampaignCategory();

	const handleEdit = (category: CampaignCategory) => {
		setSelectedCategory(category);
		setEditModalOpened(true);
	};

	const handleDelete = async (id: number) => {
		try {
			await deleteCategory.mutateAsync(id);
			notifications.show({
				title: 'Success',
				message: 'Campaign category deleted successfully',
				color: 'green',
			});
		} catch (error) {
			notifications.show({
				title: 'Error',
				message: 'Failed to delete campaign category',
				color: 'red',
			});
		}
	};

	const columns: ColumnDef<CampaignCategory>[] = [
		{
			accessorKey: 'name',
			header: 'Name',
			cell: ({ row }) => (
				<Text fw={500} className={styles.categoryName}>
					{row.original.name}
				</Text>
			),
		},
		{
			accessorKey: 'code',
			header: 'Code',
			cell: ({ row }) => (
				<Text c='dimmed' className={styles.categoryCode}>
					{row.original.code}
				</Text>
			),
		},
		{
			accessorKey: 'description',
			header: 'Description',
			cell: ({ row }) => (
				<Text className={styles.categoryDescription}>
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
					<Button
						size='xs'
						variant='subtle'
						leftSection={<IconEdit size={14} />}
						onClick={() => handleEdit(row.original)}
						className={styles.actionButton}
					>
						Edit
					</Button>
					<Button
						size='xs'
						variant='subtle'
						color='red'
						leftSection={<IconTrash size={14} />}
						onClick={() => handleDelete(row.original.id)}
						loading={deleteCategory.isPending}
						className={styles.actionButton}
					>
						Delete
					</Button>
				</Group>
			),
		},
	];

	// Show empty state only if no categories exist at all (not filtered)
	const showEmptyState = categories.length === 0 && !isLoading;

	if (showEmptyState) {
		return (
			<div className={styles.container}>
				<Group justify='space-between' className={styles.header}>
					<div>
						<Text size='lg' fw={600}>
							Campaign Categories
						</Text>
						<Text size='sm' c='dimmed'>
							Organize your campaigns with custom categories
						</Text>
					</div>
					<Button
						leftSection={<IconPlus size={16} />}
						onClick={() => setCreateModalOpened(true)}
						className={styles.createButton}
					>
						Create Category
					</Button>
				</Group>

				<EmptyState
					icon={<IconPlus size={48} />}
					title='No categories found'
					subtitle='Get started by creating your first campaign category'
					button={
						<Button
							leftSection={<IconPlus size={16} />}
							onClick={() => setCreateModalOpened(true)}
						>
							Create Category
						</Button>
					}
				/>

				<Modal
					opened={createModalOpened}
					onClose={() => setCreateModalOpened(false)}
					title='Create Campaign Category'
					size='md'
				>
					<CampaignCategoriesForm
						onSuccess={() => setCreateModalOpened(false)}
						onCancel={() => setCreateModalOpened(false)}
					/>
				</Modal>
			</div>
		);
	}

	return (
		<div className={styles.container}>
			<Group justify='space-between' className={styles.header}>
				<div>
					<Text size='lg' fw={600}>
						Campaign Categories
					</Text>
					<Text size='sm' c='dimmed'>
						Organize your campaigns with custom categories
					</Text>
				</div>
				<Button
					leftSection={<IconPlus size={16} />}
					onClick={() => setCreateModalOpened(true)}
					className={styles.createButton}
				>
					Create Category
				</Button>
			</Group>

			<CampaignCategoriesFilters
				filters={filters}
				onFiltersChange={setFilters}
				resultsCount={pagination.total}
			/>

			{categories.length === 0 && !isLoading ? (
				<div className={styles.noResultsContainer}>
					<Text size='lg' fw={500} ta='center'>
						No categories match your filters
					</Text>
					<Text size='sm' c='dimmed' ta='center'>
						Try adjusting your search criteria or filters
					</Text>
				</div>
			) : (
				<>
					<BaseTable
						data={categories}
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
				title='Create Campaign Category'
				size='md'
			>
				<CampaignCategoriesForm
					onSuccess={() => setCreateModalOpened(false)}
					onCancel={() => setCreateModalOpened(false)}
				/>
			</Modal>

			{/* Edit Modal */}
			<Modal
				opened={editModalOpened}
				onClose={() => {
					setEditModalOpened(false);
					setSelectedCategory(null);
				}}
				title='Edit Campaign Category'
				size='md'
			>
				{selectedCategory && (
					<CampaignCategoriesForm
						category={selectedCategory}
						onSuccess={() => {
							setEditModalOpened(false);
							setSelectedCategory(null);
						}}
						onCancel={() => {
							setEditModalOpened(false);
							setSelectedCategory(null);
						}}
					/>
				)}
			</Modal>
		</div>
	);
};
