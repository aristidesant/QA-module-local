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
	Tooltip,
} from '@mantine/core';
import {
	IconSearch,
	IconAdjustments,
	IconFilter,
	IconBug,
} from '@tabler/icons-react';
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
		includeInactive?: boolean;
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
	const { t } = useTranslation('campaigns.list');
	const [opened, setOpened] = useState(false);

	const sortOptions = [
		{ value: 'updatedAt', label: t('filters.sortOptions.updatedAt') },
		{ value: 'createdAt', label: t('filters.sortOptions.createdAt') },
		{ value: 'name', label: t('filters.sortOptions.name') },
		{ value: 'status', label: t('filters.sortOptions.status') },
		{ value: 'lastActivity', label: t('filters.sortOptions.lastActivity') },
	];

	const typeOptions = [
		{ value: 'OUTBOUND', label: t('filters.typeOptions.outbound') },
		{ value: 'INBOUND', label: t('filters.typeOptions.inbound') },
	];

	const executionTypeOptions = [
		{ value: 'TIME_BASED', label: t('filters.executionTypeOptions.timeBased') },
	];

	const activeFiltersCount = Object.entries(filters).filter(([key, value]) => {
		if (key === 'includeInactive') {
			return value === true;
		}
		return value !== undefined && value !== null && value !== '';
	}).length;
	const hasActiveFilters = activeFiltersCount > 0;

	const statusOptions = Object.values(CampaignStatus).map((status) => ({
		value: status,
		label: t(CampaignStatusConfig[status].label),
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
					<Text className={styles.title}>{t('filters.title')}</Text>
					{hasActiveFilters && (
						<Badge size='sm' variant='light' className={styles.activeBadge}>
							{activeFiltersCount}
						</Badge>
					)}
				</Group>

				<div className={styles.controlsWrapper}>
					<TextInput
						placeholder={t('filters.searchPlaceholder')}
						value={searchValue}
						onChange={(event) => onSearchChange(event.currentTarget.value)}
						leftSection={<IconSearch size={16} className={styles.searchIcon} />}
						rightSection={
							searchValue && (
								<CloseButton
									size='sm'
									onClick={() => onSearchChange('')}
									variant='subtle'
									aria-label={t('actions.close', { ns: 'common' })}
								/>
							)
						}
						size='sm'
						className={styles.searchInput}
					/>

					<Select
						value={sortBy}
						onChange={(value) => onSortChange(value || 'updatedAt')}
						data={sortOptions}
						placeholder={t('filters.sortBy')}
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
						{t('filters.advanced')}
					</Button>
					{window.location.hostname === 'localhost' && (
						<Tooltip
							label='Dev purposes only — toggles includeInactive API param'
							withArrow
							position='bottom'
						>
							<Group gap={4} align='center' wrap='nowrap'>
								<IconBug size={14} color='var(--mantine-color-orange-5)' />
								<Switch
									label='Include inactive'
									checked={filters.includeInactive === true}
									onChange={(event) =>
										handleFilterChange(
											'includeInactive',
											event.currentTarget.checked ? true : false
										)
									}
									size='xs'
									styles={{
										label: { fontSize: 'var(--mantine-font-size-xs)' },
									}}
								/>
							</Group>
						</Tooltip>
					)}
				</div>
			</FilterContainer>

			<Collapse in={opened}>
				<div className={styles.advancedFilters}>
					<Stack gap='sm'>
						<Group gap='sm' grow>
							<Select
								label={t('filters.type')}
								placeholder={t('filters.allTypes')}
								data={typeOptions}
								value={filters.type}
								onChange={(value) => handleFilterChange('type', value)}
								clearable
								size='sm'
							/>
							<Select
								label={t('filters.executionType')}
								placeholder={t('filters.allExecutionTypes')}
								data={executionTypeOptions}
								value={filters.campaignExecutionType}
								onChange={(value) =>
									handleFilterChange('campaignExecutionType', value)
								}
								clearable
								size='sm'
							/>
							<Select
								label={t('filters.status')}
								placeholder={t('filters.allStatuses')}
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
								label={t('filters.includeInactive')}
								checked={filters.includeInactive === true}
								onChange={(event) =>
									handleFilterChange(
										'includeInactive',
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
								{t('filters.clearAllFilters')}
							</Button>
						</Group>
					</Stack>
				</div>
			</Collapse>
		</div>
	);
}
