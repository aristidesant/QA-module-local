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
	const { t } = useTranslation('campaign-management');
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
					<Text className={styles.title}>
						{t('setup.schemas.filters.title')}
					</Text>
					{hasActiveFilters && (
						<Badge className={styles.activeBadge} size='xs'>
							{t('setup.schemas.filters.active')}
						</Badge>
					)}
				</Group>

				<Group gap='md' className={styles.controlsWrapper}>
					<TextInput
						placeholder={t('setup.schemas.filters.searchPlaceholder')}
						value={filters.search}
						onChange={(event) =>
							handleFilterChange('search', event.currentTarget.value)
						}
						leftSection={<IconSearch size={16} />}
						className={styles.searchInput}
					/>

					<Select
						placeholder={t('setup.schemas.filters.objectivePlaceholder')}
						value={filters.objectiveId?.toString() || null}
						onChange={(value) =>
							handleFilterChange('objectiveId', value ? parseInt(value) : null)
						}
						data={[
							{
								value: '',
								label: t('setup.schemas.filters.objectiveAllLabel'),
							},
							...objectiveOptions,
						]}
						className={styles.objectiveSelect}
					/>

					{hasActiveFilters && (
						<ActionIcon
							variant='subtle'
							color='gray'
							onClick={handleClearFilters}
							className={styles.clearButton}
							title={t('setup.schemas.filters.clear')}
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
