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
import { useDebouncedValue } from '@mantine/hooks';
import { IconUser, IconAdjustments, IconFilter } from '@tabler/icons-react';
import { useState, useEffect } from 'react';
import { FilterContainer } from '~/components/FilterContainer';
import styles from './ConversationFilters.module.css';

export interface ConversationFiltersType {
	contactName?: string;
	contactPhoneNumber?: string;
	dispositionName?: string;
	status?: string;
}

interface ConversationFiltersProps {
	filters: ConversationFiltersType;
	onFiltersChange: (filters: ConversationFiltersType) => void;
}

const statusOptions = [
	{ value: 'initiated', label: 'Initiated' },
	{ value: 'in-progress', label: 'In Progress' },
	{ value: 'done', label: 'Done' },
	{ value: 'failed', label: 'Failed' },
];

const DEBOUNCE_MS = 500;

export default function ConversationFilters({
	filters,
	onFiltersChange,
}: ConversationFiltersProps) {
	const [opened, setOpened] = useState(false);

	// Local state for text inputs (to allow immediate UI updates)
	const [localContactName, setLocalContactName] = useState(
		filters.contactName || ''
	);
	const [localPhoneNumber, setLocalPhoneNumber] = useState(
		filters.contactPhoneNumber || ''
	);
	const [localDisposition, setLocalDisposition] = useState(
		filters.dispositionName || ''
	);

	// Debounced values
	const [debouncedContactName] = useDebouncedValue(
		localContactName,
		DEBOUNCE_MS
	);
	const [debouncedPhoneNumber] = useDebouncedValue(
		localPhoneNumber,
		DEBOUNCE_MS
	);
	const [debouncedDisposition] = useDebouncedValue(
		localDisposition,
		DEBOUNCE_MS
	);

	// Sync debounced values to filters
	useEffect(() => {
		onFiltersChange({
			...filters,
			contactName: debouncedContactName || undefined,
		});
	}, [debouncedContactName]);

	useEffect(() => {
		onFiltersChange({
			...filters,
			contactPhoneNumber: debouncedPhoneNumber || undefined,
		});
	}, [debouncedPhoneNumber]);

	useEffect(() => {
		onFiltersChange({
			...filters,
			dispositionName: debouncedDisposition || undefined,
		});
	}, [debouncedDisposition]);

	// Sync external filter changes to local state
	useEffect(() => {
		setLocalContactName(filters.contactName || '');
	}, [filters.contactName]);

	useEffect(() => {
		setLocalPhoneNumber(filters.contactPhoneNumber || '');
	}, [filters.contactPhoneNumber]);

	useEffect(() => {
		setLocalDisposition(filters.dispositionName || '');
	}, [filters.dispositionName]);

	const activeFiltersCount = Object.entries(filters).filter(
		([, value]) => value !== undefined && value !== null && value !== ''
	).length;
	const hasActiveFilters = activeFiltersCount > 0;

	const handleStatusChange = (value: string | null) => {
		onFiltersChange({
			...filters,
			status: value ?? undefined,
		});
	};

	const handleClearFilters = () => {
		setLocalContactName('');
		setLocalPhoneNumber('');
		setLocalDisposition('');
		onFiltersChange({});
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
						placeholder='Filter by contact name...'
						value={localContactName}
						onChange={(event) => setLocalContactName(event.currentTarget.value)}
						leftSection={<IconUser size={16} className={styles.searchIcon} />}
						rightSection={
							localContactName && (
								<CloseButton
									size='sm'
									onClick={() => setLocalContactName('')}
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
							<TextInput
								label='Phone Number'
								placeholder='Filter by phone number'
								value={localPhoneNumber}
								onChange={(event) =>
									setLocalPhoneNumber(event.currentTarget.value)
								}
								size='sm'
							/>
							<TextInput
								label='Disposition'
								placeholder='Filter by disposition'
								value={localDisposition}
								onChange={(event) =>
									setLocalDisposition(event.currentTarget.value)
								}
								size='sm'
							/>
							<Select
								label='Status'
								placeholder='All statuses'
								data={statusOptions}
								value={filters.status || null}
								onChange={handleStatusChange}
								clearable
								size='sm'
							/>
						</Group>

						<Group justify='flex-end'>
							<Button
								variant='subtle'
								size='xs'
								className={styles.resetButton}
								onClick={handleClearFilters}
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
