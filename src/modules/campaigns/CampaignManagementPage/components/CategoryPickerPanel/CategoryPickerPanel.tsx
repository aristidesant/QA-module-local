import { useMemo, useState } from 'react';
import { ActionIcon, Button, Group, Text, Tooltip } from '@mantine/core';
import { IconPlus, IconX } from '@tabler/icons-react';
import type { ColumnDef } from '@tanstack/react-table';
import BaseTable from '~/components/BaseTable';
import PaginationControls from '~/components/PaginationControls';
import { useCampaignCategoriesWithFilters } from '~/modules/campaigns/hooks/useFilteredCategories';
import { CampaignCategoriesFilters } from '~/modules/campaigns/CampaignManagementPage/Categories/components/CampaignCategoriesFilters';
import type { CampaignCategory } from '~/models/CampaignCategoryModel';
import { CampaignCategoriesForm } from '~/modules/campaigns/CampaignManagementPage/Categories/components/CampaignCategoriesForm/CampaignCategoriesForm';
import styles from './CategoryPickerPanel.module.css';

export interface CategoryPickerPanelProps {
	selectedCategoryId?: number | null;
	onSelect: (category: Pick<CampaignCategory, 'id' | 'name'>) => void;
	onClose?: () => void;
}

export default function CategoryPickerPanel({
	selectedCategoryId = null,
	onSelect,
	onClose,
}: CategoryPickerPanelProps) {
	const [showCreate, setShowCreate] = useState(false);
	const {
		categories,
		pagination,
		filters,
		setPagination,
		setFilters,
		isLoading,
	} = useCampaignCategoriesWithFilters();

	const columns = useMemo<ColumnDef<CampaignCategory>[]>(
		() => [
			{
				accessorKey: 'name',
				header: 'Category',
				cell: ({ row }) => (
					<Text size='sm' fw={600}>
						{row.original.name}
					</Text>
				),
			},
			{
				accessorKey: 'code',
				header: 'Code',
				size: 140,
				cell: ({ row }) => (
					<Text size='sm' c='dimmed'>
						{row.original.code}
					</Text>
				),
			},
			{
				id: 'pick',
				header: '',
				size: 120,
				cell: ({ row }) => {
					const isSelected = row.original.id === selectedCategoryId;
					return (
						<Group justify='flex-end' gap='xs'>
							<Button
								size='xs'
								variant={isSelected ? 'filled' : 'light'}
								type='button'
								onClick={() =>
									onSelect({ id: row.original.id, name: row.original.name })
								}
							>
								{isSelected ? 'Selected' : 'Select'}
							</Button>
						</Group>
					);
				},
			},
		],
		[onSelect, selectedCategoryId]
	);

	return (
		<div className={styles.panel} data-testid='category-picker-panel'>
			<div className={styles.header}>
				<div className={styles.headerText}>
					<Text size='xs' fw={600}>
						Pick a category
					</Text>
					<Text size='xs' c='dimmed'>
						Select an existing category, or create a new one.
					</Text>
				</div>
				<Group gap='xs'>
					<Button
						size='xs'
						variant={showCreate ? 'filled' : 'light'}
						leftSection={<IconPlus size={14} />}
						type='button'
						onClick={() => setShowCreate((v) => !v)}
					>
						New category
					</Button>
					{onClose && (
						<Tooltip label='Close' withArrow>
							<ActionIcon
								size='sm'
								variant='subtle'
								type='button'
								onClick={onClose}
							>
								<IconX size={16} />
							</ActionIcon>
						</Tooltip>
					)}
				</Group>
			</div>

			{showCreate && (
				<div className={styles.inlineForm}>
					<CampaignCategoriesForm
						withinParentForm
						onSuccess={() => setShowCreate(false)}
						onCancel={() => setShowCreate(false)}
					/>
				</div>
			)}

			<CampaignCategoriesFilters
				filters={filters}
				onFiltersChange={setFilters}
			/>

			<div className={styles.tableWrap}>
				<BaseTable
					data={categories}
					columns={columns}
					isLoading={isLoading}
					density='default'
				/>
			</div>

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
		</div>
	);
}
