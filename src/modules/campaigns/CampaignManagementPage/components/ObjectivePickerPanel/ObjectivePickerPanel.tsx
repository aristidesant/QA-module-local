import { useMemo, useState } from 'react';
import {
	ActionIcon,
	Button,
	Collapse,
	Group,
	Text,
	Tooltip,
} from '@mantine/core';
import { IconPlus, IconX } from '@tabler/icons-react';
import type { ColumnDef } from '@tanstack/react-table';
import BaseTable from '~/components/BaseTable';
import PaginationControls from '~/components/PaginationControls';
import { useCampaignObjectivesWithFilters } from '~/modules/campaigns/hooks/useFilteredObjectives';
import { CampaignObjectivesFilters } from '~/modules/campaigns/CampaignManagementPage/Objectives/components/CampaignObjectivesFilters';
import type { CampaignObjectiveWithCategoryName } from '~/models/CampaignObjectiveModel';
import { CampaignObjectivesForm } from '~/modules/campaigns/CampaignManagementPage/Objectives/components/CampaignObjectivesForm/CampaignObjectivesForm';
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
				header: 'Objective',
				cell: ({ row }) => (
					<Text size='sm' fw={600}>
						{row.original.name}
					</Text>
				),
			},
			{
				accessorKey: 'categoryName',
				header: 'Category',
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
		[onSelect, selectedObjectiveId]
	);

	return (
		<div className={styles.panel} data-testid='objective-picker-panel'>
			<div className={styles.header}>
				<div className={styles.headerText}>
					<Text size='xs' fw={600}>
						Pick an objective
					</Text>
					<Text size='xs' c='dimmed'>
						Select an existing objective, or create a new one.
					</Text>
				</div>
				<Group gap='xs'>
					<Button
						size='xs'
						variant={showCreate ? 'filled' : 'light'}
						leftSection={<IconPlus size={14} />}
						onClick={() => setShowCreate((v) => !v)}
					>
						New objective
					</Button>
					{onClose && (
						<Tooltip label='Close' withArrow>
							<ActionIcon size='sm' variant='subtle' onClick={onClose}>
								<IconX size={16} />
							</ActionIcon>
						</Tooltip>
					)}
				</Group>
			</div>

			<Collapse in={showCreate}>
				<div className={styles.inlineForm}>
					<CampaignObjectivesForm
						onSuccess={() => setShowCreate(false)}
						onCancel={() => setShowCreate(false)}
					/>
				</div>
			</Collapse>

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
				itemLabel='objectives'
			/>
		</div>
	);
}
