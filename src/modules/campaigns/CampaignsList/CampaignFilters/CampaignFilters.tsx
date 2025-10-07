import {
	Badge,
	Button,
	Collapse,
	Divider,
	Group,
	Select,
	SimpleGrid,
	Text,
	TextInput,
	CloseButton,
} from '@mantine/core';
import { IconSearch, IconAdjustments } from '@tabler/icons-react';
import { useState } from 'react';
import styles from './CampaignFilters.module.css';

interface CampaignFiltersProps {
	searchValue: string;
	onSearchChange: (value: string) => void;
	sortBy: string;
	onSortChange: (value: string) => void;
	filters: {
		type?: string;
		campaignExecutionType?: string;
		status?: string;
		budgetMin?: number;
		budgetMax?: number;
		spentMin?: number;
		spentMax?: number;
		userId?: number;
	};
	onFiltersChange: (filters: CampaignFiltersProps['filters']) => void;
}

const sortOptions = [
	{ value: 'createdAt', label: 'Creation date' },
	{ value: 'name', label: 'Name' },
	{ value: 'status', label: 'Status' },
	{ value: 'lastActivity', label: 'Last activity' },
];

const typeOptions = [
	{ value: 'OUTBOUND', label: 'Outbound' },
	{ value: 'INBOUND', label: 'Inbound' },
];

const statusOptions = [
	{ value: 'ACTIVE', label: 'Active' },
	{ value: 'INACTIVE', label: 'Inactive' },
	{ value: 'PAUSED', label: 'Paused' },
	{ value: 'COMPLETED', label: 'Completed' },
	{ value: 'RUNNING', label: 'Running' },
];
export default function CampaignFilters({
	searchValue,
	onSearchChange,
	sortBy,
	onSortChange,
	filters,
	onFiltersChange,
}: CampaignFiltersProps) {
	const [opened, setOpened] = useState(false);

	const activeFiltersCount = Object.values(filters).filter(
		(value) => value !== undefined && value !== null && value !== ''
	).length;
	const hasActiveFilters = activeFiltersCount > 0;

	const executionTypeOptions = [{ value: 'TIME_BASED', label: 'Time Based' }];

	const handleFilterChange = <
		Key extends keyof CampaignFiltersProps['filters'],
	>(
		key: Key,
		value: CampaignFiltersProps['filters'][Key] | null
	) => {
		onFiltersChange({
			...filters,
			[key]: value ?? undefined,
		});
	};

	return (
		<div className={styles.filtersContainer}>
			<div className={styles.toolbar}>
				<div className={styles.fieldGroup}>
					<Text className={styles.title} component='span'>
						Campaign filters
					</Text>
					{hasActiveFilters && (
						<Badge size='sm' className={styles.activeBadge}>
							{activeFiltersCount} active
						</Badge>
					)}
				</div>

				<Group gap='xs' wrap='nowrap' className={styles.sortBlock}>
					<span className={styles.sortLabel}>Sort by</span>
					<Select
						value={sortBy}
						onChange={(value) => onSortChange(value || 'createdAt')}
						data={sortOptions}
						className={styles.sortSelect}
						size='sm'
						variant='filled'
						comboboxProps={{ withinPortal: true }}
					/>
				</Group>

				<div className={styles.searchBlock}>
					<TextInput
						placeholder='Search campaigns...'
						value={searchValue}
						onChange={(event) => onSearchChange(event.currentTarget.value)}
						rightSection={
							searchValue ? (
								<CloseButton
									size='sm'
									onClick={() => onSearchChange('')}
									variant='subtle'
								/>
							) : (
								<IconSearch size={16} className={styles.searchIcon} />
							)
						}
						radius='md'
						className={styles.searchInput}
					/>
				</div>

				<Button
					size='sm'
					leftSection={<IconAdjustments size={16} />}
					className={styles.filtersButton}
					onClick={() => setOpened((prev) => !prev)}
					variant={hasActiveFilters ? 'filled' : 'light'}
				>
					{hasActiveFilters ? `Filters (${activeFiltersCount})` : 'Filters'}
				</Button>
			</div>
			{opened && <Divider className={styles.divider} />}

			<Collapse in={opened}>
				<SimpleGrid
					cols={{ base: 1, sm: 2, lg: 4 }}
					spacing='md'
					className={styles.filtersGrid}
				>
					<Select
						label='Type'
						placeholder='Select type'
						data={typeOptions}
						value={filters.type}
						onChange={(value) => handleFilterChange('type', value)}
						clearable
						size='sm'
					/>
					<Select
						label='Execution Type'
						placeholder='Select execution type'
						data={executionTypeOptions}
						value={filters.campaignExecutionType}
						onChange={(value) =>
							handleFilterChange('campaignExecutionType', value)
						}
						clearable
						size='sm'
					/>
					<Select
						label='Status'
						placeholder='Select status'
						data={statusOptions}
						value={filters.status}
						onChange={(value) => handleFilterChange('status', value)}
						clearable
						size='sm'
					/>
				</SimpleGrid>

				<Group justify='space-between' mt='md' className={styles.actionsRow}>
					<Text size='sm' className={styles.hint}>
						Narrow down campaigns by combining filters.
					</Text>
					<Button
						variant='subtle'
						size='sm'
						className={styles.resetButton}
						onClick={() => onFiltersChange({})}
						disabled={!hasActiveFilters}
					>
						Reset filters
					</Button>
				</Group>
			</Collapse>
		</div>
	);
}
