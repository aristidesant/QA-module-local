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
import { useGetCampaignCategories } from '~/queries/campaignCategoriesQueries';
import styles from './CampaignObjectivesFilters.module.css';

export interface ObjectiveFilters {
	search: string;
	status: 'all' | 'active' | 'inactive';
	categoryId: number | null;
	sortBy: 'name' | 'categoryId' | 'createdAt' | 'updatedAt';
	sortOrder: 'asc' | 'desc';
}

interface CampaignObjectivesFiltersProps {
	filters: ObjectiveFilters;
	onFiltersChange: (filters: ObjectiveFilters) => void;
	resultsCount: number;
}

export const CampaignObjectivesFilters: React.FC<
	CampaignObjectivesFiltersProps
> = ({ filters, onFiltersChange, resultsCount }) => {
	// Get categories for the category filter
	const { data: categoriesResponse } = useGetCampaignCategories();
	const categories = categoriesResponse?.data || [];

	const hasActiveFilters =
		filters.search !== '' ||
		filters.status !== 'all' ||
		filters.categoryId !== null ||
		filters.sortBy !== 'name' ||
		filters.sortOrder !== 'asc';

	const handleFilterChange = (key: keyof ObjectiveFilters, value: any) => {
		onFiltersChange({
			...filters,
			[key]: value,
		});
	};

	const handleClearFilters = () => {
		onFiltersChange({
			search: '',
			status: 'all',
			categoryId: null,
			sortBy: 'name',
			sortOrder: 'asc',
		});
	};

	const getActiveFiltersCount = () => {
		let count = 0;
		if (filters.search !== '') count++;
		if (filters.status !== 'all') count++;
		if (filters.categoryId !== null) count++;
		if (filters.sortBy !== 'name' || filters.sortOrder !== 'asc') count++;
		return count;
	};

	// Transform categories for select options
	const categoryOptions = [
		{ value: '', label: 'All Categories' },
		...categories.map((category) => ({
			value: category.id.toString(),
			label: category.name,
		})),
	];

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

				<Group gap='md' className={styles.controlsWrapper}>
					<TextInput
						placeholder='Search by name or description...'
						value={filters.search}
						onChange={(event) =>
							handleFilterChange('search', event.currentTarget.value)
						}
						leftSection={<IconSearch size={16} className={styles.searchIcon} />}
						className={styles.searchInput}
					/>

					<Select
						placeholder='Category'
						value={filters.categoryId?.toString() || ''}
						onChange={(value) =>
							handleFilterChange('categoryId', value ? parseInt(value) : null)
						}
						data={categoryOptions}
						className={styles.categorySelect}
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

					<Select
						placeholder='Sort by'
						value={`${filters.sortBy}-${filters.sortOrder}`}
						onChange={(value) => {
							if (value) {
								const [sortBy, sortOrder] = value.split('-') as [
									ObjectiveFilters['sortBy'],
									ObjectiveFilters['sortOrder'],
								];
								onFiltersChange({
									...filters,
									sortBy,
									sortOrder,
								});
							}
						}}
						data={[
							{ value: 'name-asc', label: 'Name A-Z' },
							{ value: 'name-desc', label: 'Name Z-A' },
							{ value: 'categoryId-asc', label: 'Category A-Z' },
							{ value: 'categoryId-desc', label: 'Category Z-A' },
							{ value: 'createdAt-desc', label: 'Newest First' },
							{ value: 'createdAt-asc', label: 'Oldest First' },
							{ value: 'updatedAt-desc', label: 'Recently Updated' },
						]}
						className={styles.sortSelect}
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

			<Group justify='space-between' className={styles.resultsInfo}>
				<Text size='sm' c='dimmed'>
					{resultsCount} {resultsCount === 1 ? 'objective' : 'objectives'} found
				</Text>
			</Group>
		</div>
	);
};
