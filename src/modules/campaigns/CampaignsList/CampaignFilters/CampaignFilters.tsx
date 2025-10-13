import {
	Badge,
	Button,
	Collapse,
	Group,
	Select,
	Stack,
	Switch,
	Text,
	TextInput,
	CloseButton,
} from '@mantine/core';
import { IconSearch, IconAdjustments, IconFilter } from '@tabler/icons-react';
import { useState } from 'react';
import { FilterContainer } from '~/components/FilterContainer';
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
		includeCompleted?: boolean;
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

	const activeFiltersCount = Object.entries(filters).filter(([key, value]) => {
		if (key === 'includeCompleted') {
			return value === true;
		}
		return value !== undefined && value !== null && value !== '';
	}).length;
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
			<FilterContainer>
				<Group gap='xs' className={styles.titleGroup}>
					<IconFilter size={18} className={styles.titleIcon} />
					<Text className={styles.title}>Filters</Text>
					{hasActiveFilters && (
						<Badge size='sm' variant='light' className={styles.activeBadge}>
							{activeFiltersCount}
						</Badge>
					)}
				</Group>

				<div className={styles.controlsWrapper}>
					<TextInput
						placeholder='Search campaigns...'
						value={searchValue}
						onChange={(event) => onSearchChange(event.currentTarget.value)}
						leftSection={<IconSearch size={16} className={styles.searchIcon} />}
						rightSection={
							searchValue && (
								<CloseButton
									size='sm'
									onClick={() => onSearchChange('')}
									variant='subtle'
								/>
							)
						}
						size='sm'
						className={styles.searchInput}
					/>

					<Select
						value={sortBy}
						onChange={(value) => onSortChange(value || 'createdAt')}
						data={sortOptions}
						placeholder='Sort by'
						className={styles.sortSelect}
						size='sm'
						comboboxProps={{ withinPortal: true }}
					/>

					<Button
						size='sm'
						leftSection={<IconAdjustments size={16} />}
						className={styles.filtersButton}
						onClick={() => setOpened((prev) => !prev)}
						variant={opened ? 'light' : 'default'}
					>
						Advanced
					</Button>
				</div>
			</FilterContainer>

			<Collapse in={opened}>
				<div className={styles.advancedFilters}>
					<Stack gap='sm'>
						<Group gap='sm' grow>
							<Select
								label='Type'
								placeholder='All types'
								data={typeOptions}
								value={filters.type}
								onChange={(value) => handleFilterChange('type', value)}
								clearable
								size='sm'
							/>
							<Select
								label='Execution Type'
								placeholder='All execution types'
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
								placeholder='All statuses'
								data={statusOptions}
								value={filters.status}
								onChange={(value) => handleFilterChange('status', value)}
								clearable
								size='sm'
							/>
						</Group>

						<Group>
							<Switch
								label='Include completed'
								checked={filters.includeCompleted === true}
								onChange={(event) =>
									handleFilterChange(
										'includeCompleted',
										event.currentTarget.checked ? true : false
									)
								}
								size='sm'
							/>
						</Group>

						<Group justify='flex-end'>
							<Button
								variant='subtle'
								size='xs'
								className={styles.resetButton}
								onClick={() => onFiltersChange({})}
								disabled={!hasActiveFilters}
							>
								Clear all filters
							</Button>
						</Group>
					</Stack>
				</div>
			</Collapse>
		</div>
	);
}
