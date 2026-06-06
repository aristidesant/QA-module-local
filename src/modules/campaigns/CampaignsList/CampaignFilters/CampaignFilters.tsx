import { Select, Switch, TextInput, CloseButton } from '@mantine/core';
import { IconSearch } from '@tabler/icons-react';
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
	isCollapsed: boolean;
	onToggleCollapse: () => void;
}

export default function CampaignFilters({
	searchValue,
	onSearchChange,
	filters,
	onFiltersChange,
	isCollapsed,
	onToggleCollapse,
}: CampaignFiltersProps) {
	const { t } = useTranslation('campaigns.list');
	void isCollapsed;
	void onToggleCollapse;

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

	return (
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
				onChange={(value) => handleFilterChange('type', value as string | null)}
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
	);
}
