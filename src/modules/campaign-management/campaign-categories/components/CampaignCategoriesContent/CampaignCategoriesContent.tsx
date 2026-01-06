import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Modal, ActionIcon } from '@mantine/core';
import { IconPlus, IconSearchOff, IconCategory } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import usePermissions from '~/hooks/usePermissions';
import { ModuleEnum } from '~/constants/ModuleEnum';
import { PermissionEnum } from '~/constants/PermissionEnum';
import BaseTable from '~/components/BaseTable';
import EmptyState from '~/components/EmptyState';
import PaginationControls from '~/components/PaginationControls';
import SectionCard from '~/components/SectionCard/SectionCard';
import { useDeleteCampaignCategory } from '~/queries/campaignCategoriesQueries';
import { CampaignCategory } from '~/models/CampaignCategoryModel';
import { CampaignCategoriesForm } from '../CampaignCategoriesForm/CampaignCategoriesForm';
import { CampaignCategoriesFilters } from '../CampaignCategoriesFilters';
import { useCampaignCategoriesWithFilters } from '~/modules/campaigns/hooks/useFilteredCategories';
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
	const { t } = useTranslation('campaign-management');
	const { canPerformAction, canAccessModule } = usePermissions();
	const [editModalOpened, setEditModalOpened] = useState(false);
	const [selectedCategory, setSelectedCategory] =
		useState<CampaignCategory | null>(null);

	const canCreate = canPerformAction(
		ModuleEnum.SETTINGS,
		PermissionEnum.CREATE
	);
	const canRead = canAccessModule(ModuleEnum.SETTINGS);

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
				title: t('status.success', { ns: 'common' }),
				message: t('setup.categories.deleteSuccess'),
				color: 'green',
			});
		} catch (error) {
			notifications.show({
				title: t('status.error', { ns: 'common' }),
				message: t('setup.categories.deleteError'),
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

	if (!canRead) return null;

	if (showEmptyState) {
		return (
			<div className={styles.container}>
				<EmptyState
					icon={<IconPlus size={48} />}
					message={t('setup.categories.noResults')}
					description={t('setup.categories.getStarted')}
					action={
						canCreate && (
							<Button
								leftSection={<IconPlus size={16} />}
								onClick={() => setCreateModalOpened(true)}
							>
								{t('setup.categories.create')}
							</Button>
						)
					}
				/>

				<Modal
					opened={createModalOpened}
					onClose={() => setCreateModalOpened(false)}
					title={t('setup.categories.create')}
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
				title={t('setup.categories.title')}
				description={t('setup.categories.sectionCardDescription')}
				padding='lg'
				headerActions={
					canCreate && (
						<ActionIcon
							variant='filled'
							color='blue'
							onClick={() => setCreateModalOpened(true)}
						>
							<IconPlus size={18} />
						</ActionIcon>
					)
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
							message={t('setup.categories.noResultsFilters')}
							description={t('setup.categories.noResultsFiltersDescription')}
							action={
								canCreate && (
									<Button
										leftSection={<IconPlus size={16} />}
										onClick={() => setCreateModalOpened(true)}
									>
										{t('setup.categories.create')}
									</Button>
								)
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
							itemLabel={t('setup.categories.pagination.itemLabel')}
						/>
					</>
				)}
			</SectionCard>

			{/* Create Modal */}
			<Modal
				opened={createModalOpened}
				onClose={() => setCreateModalOpened(false)}
				title={t('setup.categories.create')}
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
				title={t('setup.categories.edit')}
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
