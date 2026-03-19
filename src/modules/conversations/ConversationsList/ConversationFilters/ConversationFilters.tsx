import {
	Badge,
	Button,
	Collapse,
	CloseButton,
	Group,
	Select,
	Stack,
	Text,
	TextInput,
} from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';
import {
	IconAdjustments,
	IconFilter,
	IconSearch,
	IconUser,
} from '@tabler/icons-react';
import { useEffect, useMemo, useState } from 'react';
import { FilterContainer } from '~/components/FilterContainer';
import styles from './ConversationFilters.module.css';
import { useTranslation } from 'react-i18next';

export interface ConversationFiltersType {
	identifier?: string;
	contactName?: string;
	contactPhoneNumber?: string;
	dispositionName?: string;
	status?: string;
}

interface ConversationFiltersProps {
	filters: ConversationFiltersType;
	onFiltersChange: (filters: ConversationFiltersType) => void;
}

const DEBOUNCE_MS = 500;

export default function ConversationFilters({
	filters,
	onFiltersChange,
}: ConversationFiltersProps) {
	const { t } = useTranslation(['conversations', 'common']);
	const [opened, setOpened] = useState(false);

	const statusOptions = useMemo(
		() => [
			{ value: 'initiated', label: t('list.status.pending') },
			{
				value: 'in-progress',
				label: t('list.status.inProgress'),
			},
			{ value: 'done', label: t('list.status.done') },
			{ value: 'failed', label: t('list.status.failed') },
		],
		[t]
	);

	const [localIdentifier, setLocalIdentifier] = useState(
		filters.identifier || ''
	);
	const [localContactName, setLocalContactName] = useState(
		filters.contactName || ''
	);
	const [localPhoneNumber, setLocalPhoneNumber] = useState(
		filters.contactPhoneNumber || ''
	);
	const [localDisposition, setLocalDisposition] = useState(
		filters.dispositionName || ''
	);

	const [debouncedIdentifier] = useDebouncedValue(localIdentifier, DEBOUNCE_MS);
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

	useEffect(() => {
		onFiltersChange({
			...filters,
			identifier: debouncedIdentifier || undefined,
			contactName: debouncedContactName || undefined,
			contactPhoneNumber: debouncedPhoneNumber || undefined,
			dispositionName: debouncedDisposition || undefined,
		});
	}, [
		debouncedIdentifier,
		debouncedContactName,
		debouncedPhoneNumber,
		debouncedDisposition,
	]);

	useEffect(() => {
		setLocalIdentifier(filters.identifier || '');
	}, [filters.identifier]);

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
		setLocalIdentifier('');
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
					<Text className={styles.title}>{t('filters.title')}</Text>
					{hasActiveFilters && (
						<Badge size='sm' variant='light' className={styles.activeBadge}>
							{activeFiltersCount}
						</Badge>
					)}
				</Group>

				<div className={styles.controlsWrapper}>
					<TextInput
						placeholder={t('filters.identifierPlaceholder')}
						aria-label={t('filters.identifier')}
						value={localIdentifier}
						onChange={(event) => setLocalIdentifier(event.currentTarget.value)}
						leftSection={<IconSearch size={16} className={styles.searchIcon} />}
						rightSection={
							localIdentifier && (
								<CloseButton
									size='sm'
									onClick={() => setLocalIdentifier('')}
									variant='subtle'
									aria-label={t('actions.close', { ns: 'common' })}
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

			<Collapse in={opened}>
				<div className={styles.advancedFilters}>
					<Stack gap='sm'>
						<Group gap='sm' grow>
							<TextInput
								label={t('filters.contactName')}
								placeholder={t('filters.contactNamePlaceholder')}
								value={localContactName}
								onChange={(event) =>
									setLocalContactName(event.currentTarget.value)
								}
								leftSection={
									<IconUser size={16} className={styles.searchIcon} />
								}
								rightSection={
									localContactName && (
										<CloseButton
											size='sm'
											onClick={() => setLocalContactName('')}
											variant='subtle'
											aria-label={t('actions.close', { ns: 'common' })}
										/>
									)
								}
								size='sm'
							/>
							<TextInput
								label={t('filters.phoneNumber')}
								placeholder={t('filters.phoneNumberPlaceholder')}
								value={localPhoneNumber}
								onChange={(event) =>
									setLocalPhoneNumber(event.currentTarget.value)
								}
								size='sm'
							/>
						</Group>

						<Group gap='sm' grow>
							<TextInput
								label={t('filters.outcome')}
								placeholder={t('filters.outcomePlaceholder')}
								value={localDisposition}
								onChange={(event) =>
									setLocalDisposition(event.currentTarget.value)
								}
								size='sm'
							/>
							<Select
								label={t('filters.status')}
								placeholder={t('filters.allStatuses')}
								data={statusOptions}
								value={filters.status || null}
								onChange={handleStatusChange}
								clearable
								size='sm'
								comboboxProps={{ withinPortal: true }}
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
								{t('filters.clear')}
							</Button>
						</Group>
					</Stack>
				</div>
			</Collapse>
		</div>
	);
}
