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
import { useGetCampaignObjectives } from '~/queries/campaignObjectivesQueries';
import styles from './CampaignSchemasFilters.module.css';

export interface SchemaFilters {
	search: string;
	objectiveId: number | null;
	sortBy: 'name' | 'code' | 'objectiveId' | 'createdAt' | 'updatedAt';
	sortOrder: 'asc' | 'desc';
}

interface CampaignSchemasFiltersProps {
	filters: SchemaFilters;
	onFiltersChange: (filters: SchemaFilters) => void;
	resultsCount: number;
}

export const CampaignSchemasFilters: React.FC<CampaignSchemasFiltersProps> = ({
	filters,
	onFiltersChange,
	resultsCount,
}) => {
	// Get objectives for the filter
	const { data: objectivesResponse } = useGetCampaignObjectives();
	const objectives = objectivesResponse?.data || [];

	const hasActiveFilters =
		filters.search !== '' ||
		filters.objectiveId !== null ||
		filters.sortBy !== 'name' ||
		filters.sortOrder !== 'asc';

	const handleFilterChange = (key: keyof SchemaFilters, value: any) => {
		onFiltersChange({
			...filters,
			[key]: value,
		});
	};

	const handleClearFilters = () => {
		onFiltersChange({
			search: '',
			objectiveId: null,
			sortBy: 'name',
			sortOrder: 'asc',
		});
	};

	const handleSortChange = (value: string | null) => {
		if (value) {
			const [sortBy, sortOrder] = value.split('-') as [
				SchemaFilters['sortBy'],
				SchemaFilters['sortOrder'],
			];
			onFiltersChange({
				...filters,
				sortBy,
				sortOrder,
			});
		}
	};

	const objectiveOptions = objectives.map((objective) => ({
		value: objective.id.toString(),
		label: objective.name,
	}));

	const sortValue = `${filters.sortBy}-${filters.sortOrder}`;

	return (
		<div className={styles.filtersContainer}>
			<Group justify='space-between' className={styles.filtersHeader}>
				<Group gap='xs' className={styles.titleGroup}>
					<IconFilter className={styles.titleIcon} size={16} />
					<Text className={styles.title}>Filters</Text>
					{hasActiveFilters && (
						<Badge className={styles.activeBadge} size='xs'>
							Active
						</Badge>
					)}
				</Group>

				<Group gap='md' className={styles.controlsWrapper}>
					<TextInput
						placeholder='Search by name or code...'
						value={filters.search}
						onChange={(event) =>
							handleFilterChange('search', event.currentTarget.value)
						}
						leftSection={<IconSearch size={16} />}
						className={styles.searchInput}
					/>

					<Select
						placeholder='All Objectives'
						value={filters.objectiveId?.toString() || null}
						onChange={(value) =>
							handleFilterChange('objectiveId', value ? parseInt(value) : null)
						}
						data={[{ value: '', label: 'All Objectives' }, ...objectiveOptions]}
						className={styles.objectiveSelect}
					/>

					<Select
						placeholder='Sort by'
						value={sortValue}
						onChange={handleSortChange}
						data={[
							{ value: 'name-asc', label: 'Name A-Z' },
							{ value: 'name-desc', label: 'Name Z-A' },
							{ value: 'code-asc', label: 'Code A-Z' },
							{ value: 'code-desc', label: 'Code Z-A' },
							{ value: 'objectiveId-asc', label: 'Objective A-Z' },
							{ value: 'objectiveId-desc', label: 'Objective Z-A' },
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
					{resultsCount} {resultsCount === 1 ? 'schema' : 'schemas'} found
				</Text>
			</Group>
		</div>
	);
};
