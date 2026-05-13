import {
	Badge,
	Button,
	Collapse,
	Group,
	Select,
	Stack,
	Text,
	TextInput,
	CloseButton,
} from '@mantine/core';
import { IconSearch, IconAdjustments, IconFilter } from '@tabler/icons-react';
import { useState } from 'react';
import { FilterContainer } from '~/components/FilterContainer';
import styles from './DoNotCallFilters.module.css';
import type { DoNotCallReason, DoNotCallStatus } from '~/models/DoNotCallModel';
import { useTranslation } from 'react-i18next';

interface DoNotCallFiltersProps {
	searchValue: string;
	onSearchChange: (value: string) => void;
	filters: {
		reason?: DoNotCallReason;
		status?: DoNotCallStatus;
	};
	onFiltersChange: (filters: DoNotCallFiltersProps['filters']) => void;
}

export default function DoNotCallFilters({
	searchValue,
	onSearchChange,
	filters,
	onFiltersChange,
}: DoNotCallFiltersProps) {
	const { t } = useTranslation('do-not-call');
	const [opened, setOpened] = useState(false);

	const reasonOptions = [
		{
			value: 'CUSTOMER_REQUEST',
			label: t('reasons.customerRequest'),
		},
		{
			value: 'DISPOSITION_OUTCOME',
			label: t('reasons.dispositionOutcome'),
		},
		{
			value: 'REGULATORY_COMPLIANCE',
			label: t('reasons.regulatoryCompliance'),
		},
		{
			value: 'MANUAL_ADMIN_BLOCK',
			label: t('reasons.manualAdminBlock'),
		},
	];

	const statusOptions = [
		{ value: 'active', label: t('statuses.active') },
		{ value: 'expired', label: t('statuses.expired') },
		{ value: 'all', label: t('statuses.all') },
	];

	const activeFiltersCount = Object.entries(filters).filter(([_, value]) => {
		return value !== undefined && value !== null;
	}).length;
	const hasActiveFilters = activeFiltersCount > 0;

	const handleFilterChange = <
		Key extends keyof DoNotCallFiltersProps['filters'],
	>(
		key: Key,
		value: DoNotCallFiltersProps['filters'][Key] | null
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
								/>
							)
						}
						size='sm'
						className={styles.searchInput}
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
				</div>
			</FilterContainer>

			<Collapse expanded={opened}>
				<div className={styles.advancedFilters}>
					<Stack gap='sm'>
						<Group gap='sm' grow>
							<Select
								label={t('filters.reason.label')}
								placeholder={t('filters.reason.placeholder')}
								data={reasonOptions}
								value={filters.reason}
								onChange={(value) =>
									handleFilterChange('reason', value as DoNotCallReason | null)
								}
								clearable
								size='sm'
							/>
							<Select
								label={t('filters.status.label')}
								placeholder={t('filters.status.placeholder')}
								data={statusOptions}
								value={filters.status}
								onChange={(value) =>
									handleFilterChange('status', value as DoNotCallStatus | null)
								}
								clearable
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
								{t('filters.clearAll')}
							</Button>
						</Group>
					</Stack>
				</div>
			</Collapse>
		</div>
	);
}
