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

interface DoNotCallFiltersProps {
	searchValue: string;
	onSearchChange: (value: string) => void;
	filters: {
		reason?: DoNotCallReason;
		status?: DoNotCallStatus;
	};
	onFiltersChange: (filters: DoNotCallFiltersProps['filters']) => void;
}

const reasonOptions = [
	{ value: 'CUSTOMER_REQUEST', label: 'Customer Request' },
	{ value: 'DISPOSITION_OUTCOME', label: 'Disposition Outcome' },
	{ value: 'REGULATORY_COMPLIANCE', label: 'Regulatory Compliance' },
	{ value: 'MANUAL_ADMIN_BLOCK', label: 'Manual Admin Block' },
];

const statusOptions = [
	{ value: 'active', label: 'Active' },
	{ value: 'expired', label: 'Expired' },
	{ value: 'all', label: 'All' },
];

export default function DoNotCallFilters({
	searchValue,
	onSearchChange,
	filters,
	onFiltersChange,
}: DoNotCallFiltersProps) {
	const [opened, setOpened] = useState(false);

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
					<Text className={styles.title}>Filters</Text>
					{hasActiveFilters && (
						<Badge size='sm' variant='light' className={styles.activeBadge}>
							{activeFiltersCount}
						</Badge>
					)}
				</Group>

				<div className={styles.controlsWrapper}>
					<TextInput
						placeholder='Search by phone number...'
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
						Advanced
					</Button>
				</div>
			</FilterContainer>

			<Collapse in={opened}>
				<div className={styles.advancedFilters}>
					<Stack gap='sm'>
						<Group gap='sm' grow>
							<Select
								label='Reason'
								placeholder='All reasons'
								data={reasonOptions}
								value={filters.reason}
								onChange={(value) =>
									handleFilterChange('reason', value as DoNotCallReason | null)
								}
								clearable
								size='sm'
							/>
							<Select
								label='Status'
								placeholder='All statuses'
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
								Clear all filters
							</Button>
						</Group>
					</Stack>
				</div>
			</Collapse>
		</div>
	);
}
