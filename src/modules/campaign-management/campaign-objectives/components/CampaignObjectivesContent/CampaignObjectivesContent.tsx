import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Modal, ActionIcon } from '@mantine/core';
import { IconPlus, IconSearchOff, IconTarget } from '@tabler/icons-react';
import BaseTable from '~/components/BaseTable';
import EmptyState from '~/components/EmptyState';
import { useDeleteCampaignObjective } from '~/queries/campaignObjectivesQueries';
import { CampaignObjective } from '~/models/CampaignObjectiveModel';
import { useCampaignObjectivesColumns } from './useCampaignObjectivesColumns';
import { notifications } from '@mantine/notifications';
import { CampaignObjectivesForm } from '../CampaignObjectivesForm/CampaignObjectivesForm';
import { CampaignObjectivesFilters } from '../CampaignObjectivesFilters';
import PaginationControls from '~/components/PaginationControls';
import { useCampaignObjectivesWithFilters } from '~/modules/campaigns/hooks/useFilteredObjectives';
import styles from './CampaignObjectivesContent.module.css';
import SectionCard from '~/components/SectionCard/SectionCard';
import usePermissions from '~/hooks/usePermissions';
import { ModuleEnum } from '~/constants/ModuleEnum';
import { PermissionEnum } from '~/constants/PermissionEnum';

// EnrichedObjective type is provided by the columns hook and the data hook

interface CampaignObjectivesContentProps {
	createModalOpened: boolean;
	setCreateModalOpened: (opened: boolean) => void;
}

const CampaignObjectivesContent: React.FC<CampaignObjectivesContentProps> = ({
	createModalOpened,
	setCreateModalOpened,
}) => {
	const { t } = useTranslation('campaign-management');
	const { canPerformAction } = usePermissions();
	const [editModalOpened, setEditModalOpened] = useState(false);
	const [selectedObjective, setSelectedObjective] =
		useState<CampaignObjective | null>(null);

	const canCreate = canPerformAction(
		ModuleEnum.SETTINGS,
		PermissionEnum.CREATE
	);

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
				title: t('status.success', { ns: 'common' }),
				message: t('setup.objectives.deleteSuccess'),
				color: 'green',
			});
		} catch (error) {
			notifications.show({
				title: t('status.error', { ns: 'common' }),
				message: t('setup.objectives.deleteError'),
				color: 'red',
			});
		}
	};

	const columns = useCampaignObjectivesColumns({
		onEdit: handleEdit,
		onDelete: handleDelete,
		isDeletePending: deleteObjective.isPending,
	});

	// Show initial empty state (no objectives exist) only when default filters are active
	const defaultFiltersActive =
		filters.search === '' &&
		filters.status === 'all' &&
		filters.categoryId === null;
	const showInitialEmptyState =
		objectives.length === 0 && !isLoading && defaultFiltersActive;

	return (
		<div className={styles.container}>
			<SectionCard
				icon={IconTarget}
				title={t('setup.objectives.title')}
				description={t('setup.objectives.sectionCardDescription')}
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
				<CampaignObjectivesFilters
					filters={filters}
					onFiltersChange={setFilters}
				/>

				{showInitialEmptyState ? (
					<div className={styles.emptyStateContainer}>
						<EmptyState
							icon={<IconPlus size={48} />}
							message={t('setup.objectives.noResults')}
							description={t('setup.objectives.getStarted')}
							action={
								canCreate && (
									<Button
										leftSection={<IconPlus size={16} />}
										onClick={() => setCreateModalOpened(true)}
									>
										{t('setup.objectives.create')}
									</Button>
								)
							}
						/>
					</div>
				) : objectives.length === 0 && !isLoading ? (
					<div className={styles.noResultsContainer}>
						<EmptyState
							icon={<IconSearchOff size={48} />}
							message={t('setup.objectives.noResultsFilters')}
							description={t('setup.objectives.noResultsFiltersDescription')}
							action={
								canCreate && (
									<Button
										leftSection={<IconPlus size={16} />}
										onClick={() => setCreateModalOpened(true)}
									>
										{t('setup.objectives.create')}
									</Button>
								)
							}
						/>
					</div>
				) : (
					<>
						<BaseTable
							data={objectives}
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
							itemLabel={t('setup.objectives.pagination.itemLabel')}
						/>
					</>
				)}
			</SectionCard>

			{/* Create Modal */}
			<Modal
				opened={createModalOpened}
				onClose={() => setCreateModalOpened(false)}
				title={t('setup.objectives.create')}
				size='xl'
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
				title={t('setup.objectives.edit')}
				size='xl'
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

export default CampaignObjectivesContent;
