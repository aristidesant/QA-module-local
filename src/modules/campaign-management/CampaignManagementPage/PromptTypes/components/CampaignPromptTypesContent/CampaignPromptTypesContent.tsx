import { useEffect, useMemo, useState } from 'react';
import { ActionIcon, Button, Modal, Text } from '@mantine/core';
import { modals } from '@mantine/modals';
import { IconPlus, IconSearchOff, IconSparkles } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { useTranslation } from 'react-i18next';
import BaseTable from '~/components/BaseTable';
import EmptyState from '~/components/EmptyState';
import PaginationControls from '~/components/PaginationControls';
import SectionCard from '~/components/SectionCard/SectionCard';
import usePermissions from '~/hooks/usePermissions';
import { ModuleEnum } from '~/constants/ModuleEnum';
import { PermissionEnum } from '~/constants/PermissionEnum';
import {
	useDeleteCampaignPromptType,
	useGetAllCampaignPromptTypes,
} from '~/queries/campaignPromptTypeQueries';
import campaignPromptsApi from '~/api/campaignPromptApi';
import type { CampaignPromptTypeModel } from '~/models/CampaignPromptTypeModel';
import CampaignPromptTypesFilters, {
	PromptTypeFilters,
} from '../CampaignPromptTypesFilters';
import CampaignPromptTypesForm from '../CampaignPromptTypesForm';
import { useCampaignPromptTypesColumns } from './useCampaignPromptTypesColumns';
import styles from './CampaignPromptTypesContent.module.css';
import ReassignPromptTypeModal from '../ReassignPromptTypeModal';
import type { CampaignPromptUsageModel } from '~/models/CampaignPromptUsageModel';

interface CampaignPromptTypesContentProps {
	createModalOpened: boolean;
	setCreateModalOpened: (opened: boolean) => void;
}

type PaginationState = {
	page: number;
	pageSize: number;
};

const defaultFilters: PromptTypeFilters = {
	search: '',
	sortBy: 'order',
	sortOrder: 'asc',
};

const CampaignPromptTypesContent: React.FC<CampaignPromptTypesContentProps> = ({
	createModalOpened,
	setCreateModalOpened,
}) => {
	const { t } = useTranslation('campaign-management');
	const { canPerformAction } = usePermissions();
	const { data: promptTypesData, isLoading } = useGetAllCampaignPromptTypes();
	const deletePromptType = useDeleteCampaignPromptType();

	const canCreate = canPerformAction(
		ModuleEnum.SETTINGS,
		PermissionEnum.CREATE
	);
	const canUpdate = canPerformAction(
		ModuleEnum.SETTINGS,
		PermissionEnum.UPDATE
	);
	const canDelete = canPerformAction(
		ModuleEnum.SETTINGS,
		PermissionEnum.DELETE
	);

	const [editModalOpened, setEditModalOpened] = useState(false);
	const [selectedPromptType, setSelectedPromptType] =
		useState<CampaignPromptTypeModel | null>(null);
	const [filters, setFilters] = useState<PromptTypeFilters>(defaultFilters);
	const [pagination, setPagination] = useState<PaginationState>({
		page: 1,
		pageSize: 10,
	});

	const [reassignModalOpened, setReassignModalOpened] = useState(false);
	const [affectedCampaigns, setAffectedCampaigns] = useState<
		CampaignPromptUsageModel[]
	>([]);
	const [typeToDelete, setTypeToDelete] =
		useState<CampaignPromptTypeModel | null>(null);

	const promptTypes = promptTypesData ?? [];

	const filteredTypes = useMemo(() => {
		const search = filters.search.trim().toLowerCase();

		let result = [...promptTypes];

		if (search) {
			result = result.filter(
				(type) =>
					type.name.toLowerCase().includes(search) ||
					type.icon?.toLowerCase().includes(search)
			);
		}

		result.sort((a, b) => {
			let comparison = 0;

			if (filters.sortBy === 'order') {
				comparison = (a.order ?? 0) - (b.order ?? 0);
			} else if (filters.sortBy === 'name') {
				comparison = a.name.localeCompare(b.name);
			} else if (filters.sortBy === 'createdAt') {
				const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
				const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
				comparison = dateA - dateB;
			}

			return filters.sortOrder === 'asc' ? comparison : -comparison;
		});

		return result;
	}, [filters.search, filters.sortBy, filters.sortOrder, promptTypes]);

	useEffect(() => {
		const maxPage = Math.max(
			1,
			Math.ceil(filteredTypes.length / pagination.pageSize)
		);
		if (pagination.page > maxPage) {
			setPagination((prev) => ({ ...prev, page: maxPage }));
		}
	}, [filteredTypes.length, pagination.page, pagination.pageSize]);

	const paginatedTypes = useMemo(() => {
		const start = (pagination.page - 1) * pagination.pageSize;
		return filteredTypes.slice(start, start + pagination.pageSize);
	}, [filteredTypes, pagination.page, pagination.pageSize]);

	const handleEdit = (promptType: CampaignPromptTypeModel) => {
		setSelectedPromptType(promptType);
		setEditModalOpened(true);
	};

	const performDelete = async (id: number) => {
		try {
			await deletePromptType.mutateAsync(id);
			notifications.show({
				title: t('status.success', { ns: 'common' }),
				message: t('setup.promptTypes.notifications.deleteSuccess'),
				color: 'green',
			});
		} catch (error) {
			notifications.show({
				title: t('status.error', { ns: 'common' }),
				message: t('setup.promptTypes.notifications.deleteError'),
				color: 'red',
			});
			console.error(error);
		}
	};

	const handleDelete = async (id: number) => {
		try {
			const affected = await campaignPromptsApi().getCampaignPromptsByType(id);

			if (affected.length > 0) {
				const type = promptTypes.find((t) => t.id === id);
				if (type) {
					setTypeToDelete(type);
					setAffectedCampaigns(affected);
					setReassignModalOpened(true);
				}
			} else {
				modals.openConfirmModal({
					title: t('setup.promptTypes.confirmDelete.title'),
					children: (
						<Text size='sm'>
							{t('setup.promptTypes.confirmDelete.message')}
						</Text>
					),
					labels: {
						confirm: t('actions.delete', { ns: 'common' }),
						cancel: t('actions.cancel', { ns: 'common' }),
					},
					confirmProps: { color: 'red' },
					onConfirm: () => performDelete(id),
				});
			}
		} catch (error) {
			console.error(error);
			notifications.show({
				title: t('status.error', { ns: 'common' }),
				message: t('setup.promptTypes.notifications.usageError'),
				color: 'red',
			});
		}
	};

	const columns = useCampaignPromptTypesColumns({
		onEdit: handleEdit,
		onDelete: handleDelete,
		isDeletePending: deletePromptType.isPending,
		canUpdate,
		canDelete,
	});

	const handleFiltersChange = (nextFilters: PromptTypeFilters) => {
		setFilters(nextFilters);
		setPagination((prev) => ({ ...prev, page: 1 }));
	};

	const handleItemsPerPageChange = (value: string | null) => {
		const nextValue = value ? parseInt(value, 10) : pagination.pageSize;
		setPagination((prev) => ({
			...prev,
			page: 1,
			pageSize: nextValue,
		}));
	};

	const showInitialEmptyState = promptTypes.length === 0 && !isLoading;
	const showFilteredEmptyState =
		promptTypes.length > 0 && filteredTypes.length === 0 && !isLoading;

	if (showInitialEmptyState) {
		return (
			<div className={styles.container}>
				<EmptyState
					icon={<IconSparkles size={48} />}
					message={t('setup.promptTypes.emptyState.message')}
					description={t('setup.promptTypes.emptyState.description')}
					action={
						canCreate && (
							<Button
								leftSection={<IconPlus size={16} />}
								onClick={() => setCreateModalOpened(true)}
							>
								{t('setup.promptTypes.actions.create')}
							</Button>
						)
					}
				/>

				<Modal
					opened={createModalOpened}
					onClose={() => setCreateModalOpened(false)}
					title={t('setup.promptTypes.modals.createTitle')}
					size='md'
				>
					<CampaignPromptTypesForm
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
				icon={IconSparkles}
				title={t('setup.promptTypes.title')}
				description={t('setup.promptTypes.description')}
				padding='lg'
				headerActions={
					canCreate && (
						<ActionIcon
							variant='filled'
							onClick={() => setCreateModalOpened(true)}
							size='xs'
						>
							<IconPlus size={16} />
						</ActionIcon>
					)
				}
			>
				<CampaignPromptTypesFilters
					filters={filters}
					onFiltersChange={handleFiltersChange}
				/>

				{showFilteredEmptyState ? (
					<div className={styles.noResultsContainer}>
						<EmptyState
							icon={<IconSearchOff size={48} />}
							message={t('setup.promptTypes.filteredEmpty.message')}
							description={t('setup.promptTypes.filteredEmpty.description')}
							action={
								canCreate && (
									<Button
										leftSection={<IconPlus size={16} />}
										onClick={() => setCreateModalOpened(true)}
									>
										{t('setup.promptTypes.actions.create')}
									</Button>
								)
							}
						/>
					</div>
				) : (
					<>
						<BaseTable
							data={paginatedTypes}
							columns={columns}
							isLoading={isLoading}
							className={styles.table}
							density='default'
						/>

						<PaginationControls
							currentPage={pagination.page}
							totalPages={Math.max(
								1,
								Math.ceil(filteredTypes.length / pagination.pageSize)
							)}
							itemsPerPage={pagination.pageSize}
							totalItems={filteredTypes.length}
							onPageChange={(page) => setPagination({ ...pagination, page })}
							onItemsPerPageChange={handleItemsPerPageChange}
							searchTerm={filters.search}
							isLoading={isLoading}
							itemLabel={t('setup.promptTypes.pagination.itemLabel')}
						/>
					</>
				)}
			</SectionCard>

			<Modal
				opened={createModalOpened}
				onClose={() => setCreateModalOpened(false)}
				title={t('setup.promptTypes.modals.createTitle')}
				size='md'
			>
				<CampaignPromptTypesForm
					onSuccess={() => setCreateModalOpened(false)}
					onCancel={() => setCreateModalOpened(false)}
				/>
			</Modal>

			<Modal
				opened={editModalOpened}
				onClose={() => {
					setEditModalOpened(false);
					setSelectedPromptType(null);
				}}
				title={t('setup.promptTypes.modals.editTitle')}
				size='md'
			>
				{selectedPromptType && (
					<CampaignPromptTypesForm
						promptType={selectedPromptType}
						onSuccess={() => {
							setEditModalOpened(false);
							setSelectedPromptType(null);
						}}
						onCancel={() => {
							setEditModalOpened(false);
							setSelectedPromptType(null);
						}}
					/>
				)}
			</Modal>

			{typeToDelete && (
				<ReassignPromptTypeModal
					opened={reassignModalOpened}
					onClose={() => {
						setReassignModalOpened(false);
						setTypeToDelete(null);
						setAffectedCampaigns([]);
					}}
					typeToDelete={typeToDelete}
					affectedCampaigns={affectedCampaigns}
					onDeleteType={performDelete}
				/>
			)}
		</div>
	);
};

export default CampaignPromptTypesContent;
