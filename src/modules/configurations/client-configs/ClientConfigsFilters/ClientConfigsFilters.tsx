import {
	Group,
	TextInput,
	Select,
	Badge,
	Text,
	ActionIcon,
} from '@mantine/core';
import { IconSearch, IconFilter, IconFilterOff } from '@tabler/icons-react';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useClientConfigsStore } from '~/stores/clientConfigsStore';
import styles from './ClientConfigsFilters.module.css';

export function ClientConfigsFilters() {
	const { filters, setFilters, resetFilters } = useClientConfigsStore();
	const { t } = useTranslation('client-configs');

	const configTypeOptions = useMemo(
		() => [
			{ value: '', label: t('filters.type.options.all') },
			{ value: 'string', label: t('form.fields.type.options.string') },
			{ value: 'number', label: t('form.fields.type.options.number') },
			{ value: 'boolean', label: t('form.fields.type.options.boolean') },
			{ value: 'json', label: t('form.fields.type.options.json') },
			{ value: 'array', label: t('form.fields.type.options.array') },
		],
		[t]
	);

	const sortOptions = useMemo(
		() => [
			{ value: 'name-asc', label: t('filters.sort.options.nameAsc') },
			{ value: 'name-desc', label: t('filters.sort.options.nameDesc') },
			{
				value: 'description-asc',
				label: t('filters.sort.options.descriptionAsc'),
			},
			{
				value: 'description-desc',
				label: t('filters.sort.options.descriptionDesc'),
			},
			{ value: 'type-asc', label: t('filters.sort.options.typeAsc') },
			{ value: 'type-desc', label: t('filters.sort.options.typeDesc') },
			{
				value: 'updatedAt-desc',
				label: t('filters.sort.options.updatedAtDesc'),
			},
			{ value: 'updatedAt-asc', label: t('filters.sort.options.updatedAtAsc') },
		],
		[t]
	);

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
					<Text className={styles.title}>{t('filters.title')}</Text>
					{hasActiveFilters && (
						<Badge className={styles.activeBadge} size='xs'>
							{t('filters.active')}
						</Badge>
					)}
				</Group>

				<Group gap='md' className={styles.controlsWrapper}>
					<TextInput
						placeholder={t('filters.search.placeholder')}
						value={filters.search}
						onChange={(event) =>
							handleFilterChange('search', event.currentTarget.value)
						}
						leftSection={<IconSearch size={16} />}
						className={styles.searchInput}
					/>

					<Select
						placeholder={t('filters.type.placeholder')}
						value={filters.type || ''}
						onChange={(value) => handleFilterChange('type', value || null)}
						data={configTypeOptions}
						className={styles.typeSelect}
					/>

					<Select
						placeholder={t('filters.sort.placeholder')}
						value={sortValue}
						onChange={handleSortChange}
						data={sortOptions}
						className={styles.sortSelect}
					/>

					{hasActiveFilters && (
						<ActionIcon
							variant='light'
							color='gray'
							size='sm'
							radius='md'
							onClick={resetFilters}
							className={styles.clearButton}
							title={t('filters.actions.clear')}
						>
							<IconFilterOff size={16} />
						</ActionIcon>
					)}
				</Group>
			</Group>
		</div>
	);
}
