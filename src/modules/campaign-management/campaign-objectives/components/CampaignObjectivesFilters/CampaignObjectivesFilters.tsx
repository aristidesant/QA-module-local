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
import { useTranslation } from 'react-i18next';
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
}

export const CampaignObjectivesFilters: React.FC<
	CampaignObjectivesFiltersProps
> = ({ filters, onFiltersChange }) => {
	const { t } = useTranslation('campaign-management');
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
		{ value: '', label: t('setup.objectives.filters.categories.all') },
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
						{t('setup.objectives.filters.title')}
					</Text>
					{hasActiveFilters && (
						<Badge size='sm' variant='light' className={styles.activeBadge}>
							{t('setup.objectives.filters.activeCount', {
								count: getActiveFiltersCount(),
							})}
						</Badge>
					)}
				</Group>

				<Group gap='md' className={styles.controlsWrapper}>
					<TextInput
						placeholder={t('setup.objectives.filters.searchPlaceholder')}
						value={filters.search}
						onChange={(event) =>
							handleFilterChange('search', event.currentTarget.value)
						}
						leftSection={<IconSearch size={16} className={styles.searchIcon} />}
						className={styles.searchInput}
					/>

					<Select
						placeholder={t('setup.objectives.filters.categoryPlaceholder')}
						value={filters.categoryId?.toString() || ''}
						onChange={(value) =>
							handleFilterChange('categoryId', value ? parseInt(value) : null)
						}
						data={categoryOptions}
						className={styles.categorySelect}
					/>

					<Select
						placeholder={t('setup.objectives.filters.statusPlaceholder')}
						value={filters.status}
						onChange={(value) => handleFilterChange('status', value || 'all')}
						data={[
							{
								value: 'all',
								label: t('setup.objectives.filters.statusOptions.all'),
							},
							{
								value: 'active',
								label: t('setup.objectives.filters.statusOptions.active'),
							},
							{
								value: 'inactive',
								label: t('setup.objectives.filters.statusOptions.inactive'),
							},
						]}
						className={styles.statusSelect}
					/>

					{hasActiveFilters && (
						<ActionIcon
							variant='subtle'
							color='gray'
							onClick={handleClearFilters}
							className={styles.clearButton}
							title={t('setup.objectives.filters.clear')}
						>
							<IconFilterOff size={16} />
						</ActionIcon>
					)}
				</Group>
			</Group>
		</div>
	);
};
