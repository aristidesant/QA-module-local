import React from 'react';
import {
	Group,
	TextInput,
	Select,
	Badge,
	Text,
	ActionIcon,
} from '@mantine/core';
import { IconSearch, IconFilter, IconFilterOff } from '@tabler/icons-react';
import styles from './CampaignCategoriesFilters.module.css';

export interface CategoryFilters {
	search: string;
	status: 'all' | 'active' | 'inactive';
	sortBy: 'name' | 'code' | 'createdAt' | 'updatedAt';
	sortOrder: 'asc' | 'desc';
}

interface CampaignCategoriesFiltersProps {
	filters: CategoryFilters;
	onFiltersChange: (filters: CategoryFilters) => void;
}

export const CampaignCategoriesFilters: React.FC<
	CampaignCategoriesFiltersProps
> = ({ filters, onFiltersChange }) => {
	const hasActiveFilters =
		filters.search !== '' ||
		filters.status !== 'all' ||
		filters.sortBy !== 'name' ||
		filters.sortOrder !== 'asc';

	const handleFilterChange = (key: keyof CategoryFilters, value: string) => {
		onFiltersChange({
			...filters,
			[key]: value,
		});
	};

	const handleClearFilters = () => {
		onFiltersChange({
			search: '',
			status: 'all',
			sortBy: 'name',
			sortOrder: 'asc',
		});
	};

	const getActiveFiltersCount = () => {
		let count = 0;
		if (filters.search !== '') count++;
		if (filters.status !== 'all') count++;
		if (filters.sortBy !== 'name' || filters.sortOrder !== 'asc') count++;
		return count;
	};

	return (
		<div className={styles.filtersContainer}>
			<Group justify='space-between' className={styles.filtersHeader}>
				<Group gap='xs' className={styles.titleGroup}>
					<IconFilter size={16} className={styles.titleIcon} />
					<Text size='sm' fw={600} className={styles.title}>
						Filters
					</Text>
					{hasActiveFilters && (
						<Badge size='sm' variant='light' className={styles.activeBadge}>
							{getActiveFiltersCount()} active
						</Badge>
					)}
				</Group>

				<Group gap='xs' className={styles.controlsWrapper}>
					<TextInput
						placeholder='Search by name, code, or description...'
						value={filters.search}
						onChange={(event) =>
							handleFilterChange('search', event.currentTarget.value)
						}
						leftSection={<IconSearch size={16} className={styles.searchIcon} />}
						className={styles.searchInput}
					/>

					<Select
						placeholder='Status'
						value={filters.status}
						onChange={(value) => handleFilterChange('status', value || 'all')}
						data={[
							{ value: 'all', label: 'All Status' },
							{ value: 'active', label: 'Active' },
							{ value: 'inactive', label: 'Inactive' },
						]}
						className={styles.statusSelect}
					/>

					{hasActiveFilters && (
						<ActionIcon
							variant='subtle'
							color='gray'
							onClick={handleClearFilters}
							className={styles.clearButton}
							title='Clear all filters'
						>
							<IconFilterOff size={16} />
						</ActionIcon>
					)}
				</Group>
			</Group>
		</div>
	);
};
