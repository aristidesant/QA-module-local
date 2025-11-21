import { useEffect, useMemo, useState } from 'react';
import { ActionIcon, Button, Modal } from '@mantine/core';
import { IconPlus, IconSearchOff, IconSparkles } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import BaseTable from '~/components/BaseTable';
import EmptyState from '~/components/EmptyState';
import PaginationControls from '~/components/PaginationControls';
import SectionCard from '~/components/SectionCard/SectionCard';
import {
	useDeleteCampaignPromptType,
	useGetAllCampaignPromptTypes,
} from '~/queries/campaignPromptTypeQueries';
import type { CampaignPromptTypeModel } from '~/models/CampaignPromptTypeModel';
import CampaignPromptTypesFilters, {
	PromptTypeFilters,
} from '../CampaignPromptTypesFilters';
import CampaignPromptTypesForm from '../CampaignPromptTypesForm';
import { useCampaignPromptTypesColumns } from './useCampaignPromptTypesColumns';
import styles from './CampaignPromptTypesContent.module.css';

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
	const { data: promptTypesData, isLoading } = useGetAllCampaignPromptTypes();
	const deletePromptType = useDeleteCampaignPromptType();

	const [editModalOpened, setEditModalOpened] = useState(false);
	const [selectedPromptType, setSelectedPromptType] =
		useState<CampaignPromptTypeModel | null>(null);
	const [filters, setFilters] = useState<PromptTypeFilters>(defaultFilters);
	const [pagination, setPagination] = useState<PaginationState>({
		page: 1,
		pageSize: 10,
	});

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

	const handleDelete = async (id: number) => {
		try {
			await deletePromptType.mutateAsync(id);
			notifications.show({
				title: 'Success',
				message: 'Campaign prompt type deleted successfully',
				color: 'green',
			});
		} catch (error) {
			notifications.show({
				title: 'Error',
				message: 'Failed to delete campaign prompt type',
				color: 'red',
			});
			console.error(error);
		}
	};

	const columns = useCampaignPromptTypesColumns({
		onEdit: handleEdit,
		onDelete: handleDelete,
		isDeletePending: deletePromptType.isPending,
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
					message='No prompt types found'
					description='Define your first campaign prompt type to start organizing prompts.'
					action={
						<Button
							leftSection={<IconPlus size={16} />}
							onClick={() => setCreateModalOpened(true)}
						>
							Create Prompt Type
						</Button>
					}
				/>

				<Modal
					opened={createModalOpened}
					onClose={() => setCreateModalOpened(false)}
					title='Create Campaign Prompt Type'
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
				title='Prompt Types'
				description='Label and organize the prompt templates used by campaigns.'
				padding='lg'
				headerActions={
					<ActionIcon
						variant='filled'
						onClick={() => setCreateModalOpened(true)}
						size='xs'
					>
						<IconPlus size={16} />
					</ActionIcon>
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
							message='No prompt types match your filters'
							description='Try adjusting your search or sorting options.'
							action={
								<Button
									leftSection={<IconPlus size={16} />}
									onClick={() => setCreateModalOpened(true)}
								>
									Create Prompt Type
								</Button>
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
							itemLabel='prompt types'
						/>
					</>
				)}
			</SectionCard>

			<Modal
				opened={createModalOpened}
				onClose={() => setCreateModalOpened(false)}
				title='Create Campaign Prompt Type'
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
				title='Edit Campaign Prompt Type'
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
		</div>
	);
};

export default CampaignPromptTypesContent;
