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
import { useTranslation } from 'react-i18next';
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
	const { t } = useTranslation('campaign-management');
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
						{t('setup.promptTypes.filters.title')}
					</Text>
					{hasActiveFilters && (
						<Badge size='sm' variant='light' className={styles.activeBadge}>
							{t('setup.promptTypes.filters.active')}
						</Badge>
					)}
				</Group>

				<Group gap='xs' className={styles.controlsWrapper}>
					<TextInput
						placeholder={t('setup.promptTypes.filters.searchPlaceholder')}
						value={filters.search}
						onChange={(event) =>
							onFiltersChange({ ...filters, search: event.currentTarget.value })
						}
						leftSection={<IconSearch size={16} className={styles.searchIcon} />}
						className={styles.searchInput}
					/>

					<Select
						placeholder={t('setup.promptTypes.filters.sortPlaceholder')}
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
							{
								value: 'order-asc',
								label: t('setup.promptTypes.filters.sortOptions.orderAsc'),
							},
							{
								value: 'order-desc',
								label: t('setup.promptTypes.filters.sortOptions.orderDesc'),
							},
							{
								value: 'name-asc',
								label: t('setup.promptTypes.filters.sortOptions.nameAsc'),
							},
							{
								value: 'name-desc',
								label: t('setup.promptTypes.filters.sortOptions.nameDesc'),
							},
							{
								value: 'createdAt-desc',
								label: t('setup.promptTypes.filters.sortOptions.createdDesc'),
							},
							{
								value: 'createdAt-asc',
								label: t('setup.promptTypes.filters.sortOptions.createdAsc'),
							},
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
							title={t('setup.promptTypes.filters.clear')}
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
