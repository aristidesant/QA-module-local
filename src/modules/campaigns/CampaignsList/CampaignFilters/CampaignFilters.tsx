import {
	Badge,
	Button,
	Collapse,
	Group,
	Select,
	Stack,
	Switch,
	Text,
	TextInput,
	CloseButton,
} from '@mantine/core';
import { IconSearch, IconAdjustments, IconFilter } from '@tabler/icons-react';
import { useState } from 'react';
import { FilterContainer } from '~/components/FilterContainer';
import styles from './CampaignFilters.module.css';
import { CampaignStatus, CampaignStatusConfig } from '~/models/CampaignStatus';
import { useTranslation } from 'react-i18next';

interface CampaignFiltersProps {
	searchValue: string;
	onSearchChange: (value: string) => void;
	sortBy: string;
	onSortChange: (value: string) => void;
	filters: {
		type?: string;
		campaignExecutionType?: string;
		status?: CampaignStatus;
		budgetMin?: number;
		budgetMax?: number;
		spentMin?: number;
		spentMax?: number;
		userId?: number;
		includeCompleted?: boolean;
	};
	onFiltersChange: (filters: CampaignFiltersProps['filters']) => void;
}

export default function CampaignFilters({
	searchValue,
	onSearchChange,
	sortBy,
	onSortChange,
	filters,
	onFiltersChange,
}: CampaignFiltersProps) {
	const { t } = useTranslation();
	const [opened, setOpened] = useState(false);

	const sortOptions = [
		{ value: 'createdAt', label: t('campaigns.filters.sortOptions.createdAt') },
		{ value: 'name', label: t('campaigns.filters.sortOptions.name') },
		{ value: 'status', label: t('campaigns.filters.sortOptions.status') },
		{ value: 'lastActivity', label: t('campaigns.filters.sortOptions.lastActivity') },
	];

	const typeOptions = [
		{ value: 'OUTBOUND', label: t('campaigns.filters.typeOptions.outbound') },
		{ value: 'INBOUND', label: t('campaigns.filters.typeOptions.inbound') },
	];

	const executionTypeOptions = [
		{ value: 'TIME_BASED', label: t('campaigns.filters.executionTypeOptions.timeBased') }
	];

	const activeFiltersCount = Object.entries(filters).filter(([key, value]) => {
		if (key === 'includeCompleted') {
			return value === true;
		}
		return value !== undefined && value !== null && value !== '';
	}).length;
	const hasActiveFilters = activeFiltersCount > 0;

	const statusOptions = Object.values(CampaignStatus).map((status) => ({
		value: status,
		label: CampaignStatusConfig[status].label,
	}));

	const handleFilterChange = <
		Key extends keyof CampaignFiltersProps['filters'],
	>(
		key: Key,
		value: CampaignFiltersProps['filters'][Key] | null
	) => {
		onFiltersChange({
			...filters,
			[key]: value ?? undefined,
		});
	};

	return (
		<div className={styles.filtersContainer}>
			<FilterContainer>
				<Group gap='xs' className={styles.titleGroup}>
					<IconFilter size={18} className={styles.titleIcon} />
					<Text className={styles.title}>{t('campaigns.filters.title')}</Text>
					{hasActiveFilters && (
						<Badge size='sm' variant='light' className={styles.activeBadge}>
							{activeFiltersCount}
						</Badge>
					)}
				</Group>

				<div className={styles.controlsWrapper}>
					<TextInput
						placeholder={t('campaigns.filters.searchPlaceholder')}
						value={searchValue}
						onChange={(event) => onSearchChange(event.currentTarget.value)}
						leftSection={<IconSearch size={16} className={styles.searchIcon} />}
						rightSection={
							searchValue && (
								<CloseButton
									size='sm'
									onClick={() => onSearchChange('')}
									variant='subtle'
								/>
							)
						}
						size='sm'
						className={styles.searchInput}
					/>

					<Select
						value={sortBy}
						onChange={(value) => onSortChange(value || 'createdAt')}
						data={sortOptions}
						placeholder={t('campaigns.filters.sortBy')}
						className={styles.sortSelect}
						size='sm'
						comboboxProps={{ withinPortal: true }}
					/>

					<Button
						size='sm'
						leftSection={<IconAdjustments size={16} />}
						className={styles.filtersButton}
						onClick={() => setOpened((prev) => !prev)}
						variant={opened ? 'light' : 'default'}
					>
						{t('campaigns.filters.advanced')}
					</Button>
				</div>
			</FilterContainer>

			<Collapse in={opened}>
				<div className={styles.advancedFilters}>
					<Stack gap='sm'>
						<Group gap='sm' grow>
							<Select
								label={t('campaigns.filters.type')}
								placeholder={t('campaigns.filters.allTypes')}
								data={typeOptions}
								value={filters.type}
								onChange={(value) => handleFilterChange('type', value)}
								clearable
								size='sm'
							/>
							<Select
								label={t('campaigns.filters.executionType')}
								placeholder={t('campaigns.filters.allExecutionTypes')}
								data={executionTypeOptions}
								value={filters.campaignExecutionType}
								onChange={(value) =>
									handleFilterChange('campaignExecutionType', value)
								}
								clearable
								size='sm'
							/>
							<Select
								label={t('campaigns.filters.status')}
								placeholder={t('campaigns.filters.allStatuses')}
								data={statusOptions}
								value={filters.status}
								onChange={(value) =>
									handleFilterChange('status', value as CampaignStatus | null)
								}
								clearable
								size='sm'
							/>
						</Group>

						<Group>
							<Switch
								label={t('campaigns.filters.includeCompleted')}
								checked={filters.includeCompleted === true}
								onChange={(event) =>
									handleFilterChange(
										'includeCompleted',
										event.currentTarget.checked ? true : false
									)
								}
								size='sm'
							/>
						</Group>

						<Group justify='flex-end'>
							<Button
								variant='subtle'
								size='xs'
								className={styles.resetButton}
								onClick={() => onFiltersChange({})}
								disabled={!hasActiveFilters}
							>
								{t('campaigns.filters.clearAllFilters')}
							</Button>
						</Group>
					</Stack>
				</div>
			</Collapse>
		</div>
	);
}
