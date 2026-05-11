import {
	Badge,
	Button,
	Group,
	Select,
	Switch,
	Text,
	TextInput,
	CloseButton,
} from '@mantine/core';
import { IconSearch, IconFilter } from '@tabler/icons-react';
import { FilterContainer } from '~/components/FilterContainer';
import styles from './CampaignFilters.module.css';
import { CampaignStatus, CampaignStatusConfig } from '~/models/CampaignStatus';
import { useTranslation } from 'react-i18next';

interface CampaignFiltersProps {
	searchValue: string;
	onSearchChange: (value: string) => void;
	filters: {
		type?: string;
		status?: CampaignStatus;
		includeInactive?: boolean;
	};
	onFiltersChange: (filters: CampaignFiltersProps['filters']) => void;
}

export default function CampaignFilters({
	searchValue,
	onSearchChange,
	filters,
	onFiltersChange,
}: CampaignFiltersProps) {
	const { t } = useTranslation('campaigns.list');

	const activeFiltersCount =
		Object.entries(filters).filter(([key, value]) => {
			if (key === 'includeInactive') {
				return value === false;
			}
			return value !== undefined && value !== null;
		}).length + (searchValue.trim() ? 1 : 0);
	const hasActiveFilters = activeFiltersCount > 0;

	const statusOptions = Object.values(CampaignStatus).map((status) => ({
		value: status,
		label: t(CampaignStatusConfig[status].label),
	}));

	const typeOptions = [
		{ value: 'OUTBOUND', label: t('filters.typeOptions.outbound') },
		{ value: 'INBOUND', label: t('filters.typeOptions.inbound') },
	];

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

	const handleClearFilters = () => {
		onSearchChange('');
		onFiltersChange({
			type: undefined,
			status: undefined,
			includeInactive: true,
		});
	};

	return (
		<div className={styles.filtersContainer}>
			<FilterContainer>
				<div className={styles.headerRow}>
					<div className={styles.titleBlock}>
						<Group gap='xs' className={styles.titleGroup}>
							<IconFilter size={18} className={styles.titleIcon} />
							<Text className={styles.title}>{t('filters.title')}</Text>
							{hasActiveFilters && (
								<Badge size='sm' variant='light' className={styles.activeBadge}>
									{activeFiltersCount}
								</Badge>
							)}
						</Group>
						<Text size='xs' c='dimmed' className={styles.subtitle}>
							{t('filters.description')}
						</Text>
					</div>

					<Button
						variant='subtle'
						size='xs'
						className={styles.resetButton}
						onClick={handleClearFilters}
						disabled={!hasActiveFilters}
					>
						{t('filters.clearAllFilters')}
					</Button>
				</div>

				<div className={styles.controlsGrid}>
					<TextInput
						label={t('filters.search')}
						placeholder={t('filters.searchPlaceholder')}
						value={searchValue}
						onChange={(event) => onSearchChange(event.currentTarget.value)}
						leftSection={<IconSearch size={16} className={styles.searchIcon} />}
						rightSection={
							searchValue ? (
								<CloseButton
									size='sm'
									onClick={() => onSearchChange('')}
									variant='subtle'
									aria-label={t('actions.close', { ns: 'common' })}
								/>
							) : null
						}
						size='sm'
						className={styles.searchInput}
					/>

					<Select
						label={t('filters.type')}
						placeholder={t('filters.allTypes')}
						data={typeOptions}
						value={filters.type}
						onChange={(value) =>
							handleFilterChange('type', value as string | null)
						}
						clearable
						size='sm'
						className={styles.typeSelect}
						comboboxProps={{ withinPortal: true }}
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
						className={styles.statusSelect}
						comboboxProps={{ withinPortal: true }}
					/>

					<Switch
						label={t('filters.includeInactive')}
						checked={filters.includeInactive !== false}
						onChange={(event) =>
							handleFilterChange(
								'includeInactive',
								event.currentTarget.checked ? true : false
							)
						}
						size='sm'
						className={styles.inactiveSwitch}
					/>
				</div>
			</FilterContainer>
		</div>
	);
}
