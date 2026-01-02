import { useMemo, useState } from 'react';
import { ActionIcon, Button, Group, Text, Tooltip } from '@mantine/core';
import { IconPlus, IconX } from '@tabler/icons-react';
import type { ColumnDef } from '@tanstack/react-table';
import { useTranslation } from 'react-i18next';
import BaseTable from '~/components/BaseTable';
import PaginationControls from '~/components/PaginationControls';
import { useCampaignCategoriesWithFilters } from '~/modules/campaigns/hooks/useFilteredCategories';
import { CampaignCategoriesFilters } from '~/modules/campaign-management/campaign-categories/components/CampaignCategoriesFilters';
import type { CampaignCategory } from '~/models/CampaignCategoryModel';
import { CampaignCategoriesForm } from '~/modules/campaign-management/campaign-categories/components/CampaignCategoriesForm/CampaignCategoriesForm';
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
	const { t } = useTranslation('campaign-management');
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
				header: t('setup.categories.picker.table.headers.category'),
				cell: ({ row }) => (
					<Text size='sm' fw={600}>
						{row.original.name}
					</Text>
				),
			},
			{
				accessorKey: 'code',
				header: t('setup.categories.picker.table.headers.code'),
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
								{t(
									isSelected
										? 'setup.categories.picker.table.actions.selected'
										: 'setup.categories.picker.table.actions.select'
								)}
							</Button>
						</Group>
					);
				},
			},
		],
		[onSelect, selectedCategoryId, t]
	);

	return (
		<div className={styles.panel} data-testid='category-picker-panel'>
			<div className={styles.header}>
				<div className={styles.headerText}>
					<Text size='xs' fw={600}>
						{t('setup.categories.picker.title')}
					</Text>
					<Text size='xs' c='dimmed'>
						{t('setup.categories.picker.description')}
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
						{t('setup.categories.picker.newButton')}
					</Button>
					{onClose && (
						<Tooltip label={t('setup.categories.picker.closeLabel')} withArrow>
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
				itemLabel={t('setup.categories.pagination.itemLabel')}
			/>
		</div>
	);
}
