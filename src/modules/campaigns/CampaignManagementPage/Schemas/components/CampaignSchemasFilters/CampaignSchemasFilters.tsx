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
}

const CampaignSchemasFilters: React.FC<CampaignSchemasFiltersProps> = ({
	filters,
	onFiltersChange,
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

	const objectiveOptions = objectives.map((objective) => ({
		value: objective.id.toString(),
		label: objective.name,
	}));

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

export default CampaignSchemasFilters;
