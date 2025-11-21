import React from 'react';
import {
	ActionIcon,
	Badge,
	Group,
	Select,
	Text,
	TextInput,
} from '@mantine/core';
import {
	IconFilter,
	IconFilterOff,
	IconSearch,
	IconArrowsSort,
} from '@tabler/icons-react';
import styles from './CampaignPromptTypesFilters.module.css';

export interface PromptTypeFilters {
	search: string;
	sortBy: 'order' | 'name' | 'createdAt';
	sortOrder: 'asc' | 'desc';
}

interface CampaignPromptTypesFiltersProps {
	filters: PromptTypeFilters;
	onFiltersChange: (filters: PromptTypeFilters) => void;
}

const CampaignPromptTypesFilters: React.FC<CampaignPromptTypesFiltersProps> = ({
	filters,
	onFiltersChange,
}) => {
	const hasActiveFilters =
		filters.search !== '' ||
		filters.sortBy !== 'order' ||
		filters.sortOrder !== 'asc';

	const handleClearFilters = () => {
		onFiltersChange({
			search: '',
			sortBy: 'order',
			sortOrder: 'asc',
		});
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
							Active
						</Badge>
					)}
				</Group>

				<Group gap='xs' className={styles.controlsWrapper}>
					<TextInput
						placeholder='Search by name or icon...'
						value={filters.search}
						onChange={(event) =>
							onFiltersChange({ ...filters, search: event.currentTarget.value })
						}
						leftSection={<IconSearch size={16} className={styles.searchIcon} />}
						className={styles.searchInput}
					/>

					<Select
						placeholder='Sort by'
						value={`${filters.sortBy}-${filters.sortOrder}`}
						onChange={(value) => {
							if (value) {
								const [sortBy, sortOrder] = value.split('-') as [
									PromptTypeFilters['sortBy'],
									PromptTypeFilters['sortOrder'],
								];
								onFiltersChange({ ...filters, sortBy, sortOrder });
							}
						}}
						data={[
							{ value: 'order-asc', label: 'Order ascending' },
							{ value: 'order-desc', label: 'Order descending' },
							{ value: 'name-asc', label: 'Name A-Z' },
							{ value: 'name-desc', label: 'Name Z-A' },
							{ value: 'createdAt-desc', label: 'Newest first' },
							{ value: 'createdAt-asc', label: 'Oldest first' },
						]}
						leftSection={<IconArrowsSort size={16} />}
						className={styles.sortSelect}
					/>

					{hasActiveFilters && (
						<ActionIcon
							variant='subtle'
							color='gray'
							onClick={handleClearFilters}
							className={styles.clearButton}
							title='Clear filters'
						>
							<IconFilterOff size={16} />
						</ActionIcon>
					)}
				</Group>
			</Group>
		</div>
	);
};

export default CampaignPromptTypesFilters;
