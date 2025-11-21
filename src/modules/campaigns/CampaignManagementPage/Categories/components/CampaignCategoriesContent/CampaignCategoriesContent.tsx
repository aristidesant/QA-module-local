import React, { useState } from 'react';
import { Button, Modal, ActionIcon } from '@mantine/core';
import { IconPlus, IconSearchOff, IconCategory } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import BaseTable from '~/components/BaseTable';
import EmptyState from '~/components/EmptyState';
import PaginationControls from '~/components/PaginationControls';
import SectionCard from '~/components/SectionCard/SectionCard';
import { useDeleteCampaignCategory } from '~/queries/campaignCategoriesQueries';
import { CampaignCategory } from '~/models/CampaignCategoryModel';
import { CampaignCategoriesForm } from '../CampaignCategoriesForm/CampaignCategoriesForm';
import { CampaignCategoriesFilters } from '../CampaignCategoriesFilters';
import { useCampaignCategoriesWithFilters } from '../../../../hooks/useFilteredCategories';
import { useCampaignCategoriesColumns } from './useCampaignCategoriesColumns';
import styles from './CampaignCategoriesContent.module.css';

interface CampaignCategoriesContentProps {
	createModalOpened: boolean;
	setCreateModalOpened: (opened: boolean) => void;
}

const CampaignCategoriesContent: React.FC<CampaignCategoriesContentProps> = ({
	createModalOpened,
	setCreateModalOpened,
}) => {
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

	const columns = useCampaignCategoriesColumns({
		onEdit: handleEdit,
		onDelete: handleDelete,
		isDeletePending: deleteCategory.isPending,
	});

	// Show empty state only if no categories exist at all (not filtered)
	const showEmptyState = categories.length === 0 && !isLoading;

	if (showEmptyState) {
		return (
			<div className={styles.container}>
				<EmptyState
					icon={<IconPlus size={48} />}
					message='No categories found'
					description='Get started by creating your first campaign category'
					action={
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
			<SectionCard
				icon={IconCategory}
				title='Campaign Categories'
				description='Organize categories used to classify campaigns and apply filters.'
				padding='lg'
				headerActions={
					<ActionIcon
						variant='filled'
						color='blue'
						onClick={() => setCreateModalOpened(true)}
					>
						<IconPlus size={18} />
					</ActionIcon>
				}
			>
				<CampaignCategoriesFilters
					filters={filters}
					onFiltersChange={setFilters}
				/>

				{categories.length === 0 && !isLoading ? (
					<div className={styles.noResultsContainer}>
						<EmptyState
							icon={<IconSearchOff size={48} />}
							message='No categories match your filters'
							description='Try adjusting your search criteria or filters'
							action={
								<Button
									leftSection={<IconPlus size={16} />}
									onClick={() => setCreateModalOpened(true)}
								>
									Create Category
								</Button>
							}
						/>
					</div>
				) : (
					<>
						<BaseTable
							data={categories}
							columns={columns}
							isLoading={isLoading}
							className={styles.table}
							density='default'
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
							itemLabel='categories'
						/>
					</>
				)}
			</SectionCard>

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

export default CampaignCategoriesContent;
