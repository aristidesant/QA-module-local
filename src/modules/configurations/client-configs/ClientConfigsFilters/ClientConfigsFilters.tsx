import {
	Group,
	TextInput,
	Select,
	Badge,
	Text,
	ActionIcon,
} from '@mantine/core';
import { IconSearch, IconFilter, IconFilterOff } from '@tabler/icons-react';
import { useClientConfigsStore } from '~/stores/clientConfigsStore';
import styles from './ClientConfigsFilters.module.css';

const CONFIG_TYPE_OPTIONS = [
	{ value: '', label: 'All Types' },
	{ value: 'string', label: 'String' },
	{ value: 'number', label: 'Number' },
	{ value: 'boolean', label: 'Boolean' },
	{ value: 'json', label: 'JSON' },
	{ value: 'array', label: 'Array' },
];

const SORT_OPTIONS = [
	{ value: 'name-asc', label: 'Name A-Z' },
	{ value: 'name-desc', label: 'Name Z-A' },
	{ value: 'description-asc', label: 'Description A-Z' },
	{ value: 'description-desc', label: 'Description Z-A' },
	{ value: 'type-asc', label: 'Type A-Z' },
	{ value: 'type-desc', label: 'Type Z-A' },
	{ value: 'updatedAt-desc', label: 'Recently Updated' },
	{ value: 'updatedAt-asc', label: 'Oldest Updated' },
];

export function ClientConfigsFilters() {
	const { filters, setFilters, resetFilters } = useClientConfigsStore();

	const hasActiveFilters =
		filters.search !== '' ||
		filters.type !== null ||
		filters.sortBy !== 'name' ||
		filters.sortOrder !== 'asc';

	const handleFilterChange = (
		key: keyof typeof filters,
		value: string | null
	) => {
		setFilters({
			...filters,
			[key]: value,
		});
	};

	const handleSortChange = (value: string | null) => {
		if (value) {
			const [sortBy, sortOrder] = value.split('-') as [
				typeof filters.sortBy,
				typeof filters.sortOrder,
			];
			setFilters({
				...filters,
				sortBy,
				sortOrder,
			});
		}
	};

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
						placeholder='Search by name or description...'
						value={filters.search}
						onChange={(event) =>
							handleFilterChange('search', event.currentTarget.value)
						}
						leftSection={<IconSearch size={16} />}
						className={styles.searchInput}
					/>

					<Select
						placeholder='All Types'
						value={filters.type || ''}
						onChange={(value) => handleFilterChange('type', value || null)}
						data={CONFIG_TYPE_OPTIONS}
						className={styles.typeSelect}
					/>

					<Select
						placeholder='Sort by'
						value={sortValue}
						onChange={handleSortChange}
						data={SORT_OPTIONS}
						className={styles.sortSelect}
					/>

					{hasActiveFilters && (
						<ActionIcon
							variant='subtle'
							color='gray'
							onClick={resetFilters}
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
}
