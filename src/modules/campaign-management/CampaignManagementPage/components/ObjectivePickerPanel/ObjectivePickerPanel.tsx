import { useMemo, useState } from 'react';
import { ActionIcon, Button, Group, Text, Tooltip } from '@mantine/core';
import { IconPlus, IconX } from '@tabler/icons-react';
import type { ColumnDef } from '@tanstack/react-table';
import { useTranslation } from 'react-i18next';
import BaseTable from '~/components/BaseTable';
import PaginationControls from '~/components/PaginationControls';
import { useCampaignObjectivesWithFilters } from '~/modules/campaigns/hooks/useFilteredObjectives';
import { CampaignObjectivesFilters } from '~/modules/campaign-management/campaign-objectives/components/CampaignObjectivesFilters';
import type { CampaignObjectiveWithCategoryName } from '~/models/CampaignObjectiveModel';
import { CampaignObjectivesForm } from '~/modules/campaign-management/campaign-objectives/components/CampaignObjectivesForm/CampaignObjectivesForm';
import styles from './ObjectivePickerPanel.module.css';

export interface ObjectivePickerPanelProps {
	selectedObjectiveId?: number | null;
	onSelect: (
		objective: Pick<CampaignObjectiveWithCategoryName, 'id' | 'name'>
	) => void;
	onClose?: () => void;
}

export default function ObjectivePickerPanel({
	selectedObjectiveId = null,
	onSelect,
	onClose,
}: ObjectivePickerPanelProps) {
	const { t } = useTranslation('campaign-management');
	const [showCreate, setShowCreate] = useState(false);
	const {
		objectives,
		pagination,
		filters,
		setPagination,
		setFilters,
		isLoading,
	} = useCampaignObjectivesWithFilters();

	const columns = useMemo<ColumnDef<CampaignObjectiveWithCategoryName>[]>(
		() => [
			{
				accessorKey: 'name',
				header: t('setup.objectives.picker.table.headers.objective'),
				cell: ({ row }) => (
					<Text size='sm' fw={600}>
						{row.original.name}
					</Text>
				),
			},
			{
				accessorKey: 'categoryName',
				header: t('setup.objectives.picker.table.headers.category'),
				size: 160,
				cell: ({ row }) => (
					<Text size='sm' c='dimmed'>
						{row.original.categoryName}
					</Text>
				),
			},
			{
				id: 'pick',
				header: '',
				size: 120,
				cell: ({ row }) => {
					const isSelected = row.original.id === selectedObjectiveId;
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
										? 'setup.objectives.picker.table.actions.selected'
										: 'setup.objectives.picker.table.actions.select'
								)}
							</Button>
						</Group>
					);
				},
			},
		],
		[onSelect, selectedObjectiveId, t]
	);

	return (
		<div className={styles.panel} data-testid='objective-picker-panel'>
			<div className={styles.header}>
				<div className={styles.headerText}>
					<Text size='xs' fw={600}>
						{t('setup.objectives.picker.title')}
					</Text>
					<Text size='xs' c='dimmed'>
						{t('setup.objectives.picker.description')}
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
						{t('setup.objectives.picker.newButton')}
					</Button>
					{onClose && (
						<Tooltip label={t('setup.objectives.picker.closeLabel')} withArrow>
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
					<CampaignObjectivesForm
						withinParentForm
						onSuccess={() => setShowCreate(false)}
						onCancel={() => setShowCreate(false)}
					/>
				</div>
			)}

			<CampaignObjectivesFilters
				filters={filters}
				onFiltersChange={setFilters}
			/>

			<div className={styles.tableWrap}>
				<BaseTable
					data={objectives}
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
				itemLabel={t('setup.objectives.pagination.itemLabel')}
			/>
		</div>
	);
}
