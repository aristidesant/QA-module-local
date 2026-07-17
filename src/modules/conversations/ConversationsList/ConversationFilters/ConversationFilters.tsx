import {
	Badge,
	Button,
	Collapse,
	CloseButton,
	Select,
	Text,
	TextInput,
} from '@mantine/core';
import { useDebouncedCallback } from '@mantine/hooks';
import {
	IconAdjustments,
	IconChartDots,
	IconPhone,
	IconSearch,
	IconUser,
} from '@tabler/icons-react';
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
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
	resultCount?: number;
	isLoading?: boolean;
	actions?: ReactNode;
}

const DEBOUNCE_MS = 500;

export default function ConversationFilters({
	filters,
	onFiltersChange,
	resultCount,
	isLoading = false,
	actions,
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

	const filtersRef = useRef(filters);
	useEffect(() => {
		filtersRef.current = filters;
	}, [filters]);

	const queueTextFilters = useDebouncedCallback(
		(next: {
			identifier: string;
			contactName: string;
			contactPhoneNumber: string;
			dispositionName: string;
		}) => {
			onFiltersChange({
				...filtersRef.current,
				identifier: next.identifier || undefined,
				contactName: next.contactName || undefined,
				contactPhoneNumber: next.contactPhoneNumber || undefined,
				dispositionName: next.dispositionName || undefined,
			});
		},
		DEBOUNCE_MS
	);

	const updateTextFilter = (
		key:
			| 'identifier'
			| 'contactName'
			| 'contactPhoneNumber'
			| 'dispositionName',
		value: string
	) => {
		if (key === 'identifier') setLocalIdentifier(value);
		if (key === 'contactName') setLocalContactName(value);
		if (key === 'contactPhoneNumber') setLocalPhoneNumber(value);
		if (key === 'dispositionName') setLocalDisposition(value);

		queueTextFilters({
			identifier: key === 'identifier' ? value : localIdentifier,
			contactName: key === 'contactName' ? value : localContactName,
			contactPhoneNumber:
				key === 'contactPhoneNumber' ? value : localPhoneNumber,
			dispositionName: key === 'dispositionName' ? value : localDisposition,
		});
	};

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
	const advancedFiltersCount = [
		filters.contactName,
		filters.contactPhoneNumber,
		filters.dispositionName,
	].filter(Boolean).length;
	const hasActiveFilters = activeFiltersCount > 0;

	const handleStatusChange = (value: string | null) => {
		onFiltersChange({
			...filters,
			status: value ?? undefined,
		});
	};

	const handleClearFilters = () => {
		queueTextFilters.cancel();
		setLocalIdentifier('');
		setLocalContactName('');
		setLocalPhoneNumber('');
		setLocalDisposition('');
		onFiltersChange({});
	};

	const handleRemoveFilter = (key: keyof ConversationFiltersType) => {
		queueTextFilters.cancel();
		if (key === 'identifier') setLocalIdentifier('');
		if (key === 'contactName') setLocalContactName('');
		if (key === 'contactPhoneNumber') setLocalPhoneNumber('');
		if (key === 'dispositionName') setLocalDisposition('');

		onFiltersChange({
			...filters,
			[key]: undefined,
		});
	};

	const filterChips = useMemo(
		() =>
			(
				[
					['identifier', t('filters.identifier'), filters.identifier],
					['contactName', t('filters.contactName'), filters.contactName],
					[
						'contactPhoneNumber',
						t('filters.phoneNumber'),
						filters.contactPhoneNumber,
					],
					['dispositionName', t('filters.outcome'), filters.dispositionName],
					[
						'status',
						t('filters.status'),
						statusOptions.find((option) => option.value === filters.status)
							?.label,
					],
				] as const
			).filter(([, , value]) => Boolean(value)),
		[filters, statusOptions, t]
	);

	return (
		<div className={styles.filtersContainer}>
			<div className={styles.toolbar}>
				<div className={styles.primaryControls}>
					<TextInput
						placeholder={t('filters.identifierPlaceholder')}
						aria-label={t('filters.identifier')}
						value={localIdentifier}
						onChange={(event) =>
							updateTextFilter('identifier', event.currentTarget.value)
						}
						leftSection={<IconSearch size={16} className={styles.searchIcon} />}
						rightSection={
							localIdentifier && (
								<CloseButton
									size='sm'
									onClick={() => updateTextFilter('identifier', '')}
									variant='subtle'
									aria-label={t('actions.close', { ns: 'common' })}
								/>
							)
						}
						size='sm'
						className={styles.searchInput}
					/>
					<Select
						placeholder={t('filters.allStatuses')}
						aria-label={t('filters.status')}
						data={statusOptions}
						value={filters.status || null}
						onChange={handleStatusChange}
						clearable
						size='sm'
						className={styles.statusSelect}
						comboboxProps={{ withinPortal: true }}
					/>

					<Button
						size='sm'
						leftSection={<IconAdjustments size={16} />}
						className={styles.filtersButton}
						onClick={() => setOpened((prev) => !prev)}
						variant={opened || advancedFiltersCount > 0 ? 'light' : 'default'}
					>
						{t('filters.advanced')}
						{advancedFiltersCount > 0 && (
							<Badge size='xs' variant='filled' className={styles.filterCount}>
								{advancedFiltersCount}
							</Badge>
						)}
					</Button>
				</div>

				<div className={styles.toolbarMeta}>
					{typeof resultCount === 'number' && (
						<Text size='xs' className={styles.resultCount} aria-live='polite'>
							{isLoading
								? t('list.loading')
								: t('list.resultCount', { count: resultCount })}
						</Text>
					)}
					{actions}
				</div>
			</div>

			{hasActiveFilters && (
				<div className={styles.activeFilters}>
					<Text size='xs' fw={600} className={styles.activeFiltersLabel}>
						{t('filters.active')}
					</Text>
					<div className={styles.filterChips}>
						{filterChips.map(([key, label, value]) => (
							<div className={styles.filterChip} key={key}>
								<Text component='span' size='xs'>
									{label}: <strong>{value}</strong>
								</Text>
								<CloseButton
									size='xs'
									onClick={() => handleRemoveFilter(key)}
									aria-label={t('filters.remove', { label })}
								/>
							</div>
						))}
					</div>
					<Button
						variant='subtle'
						size='compact-xs'
						className={styles.clearButton}
						onClick={handleClearFilters}
					>
						{t('filters.clear')}
					</Button>
				</div>
			)}

			<Collapse expanded={opened}>
				<div className={styles.advancedFilters}>
					<div className={styles.advancedGrid}>
						<TextInput
							label={t('filters.contactName')}
							placeholder={t('filters.contactNamePlaceholder')}
							value={localContactName}
							onChange={(event) =>
								updateTextFilter('contactName', event.currentTarget.value)
							}
							leftSection={<IconUser size={16} className={styles.searchIcon} />}
							rightSection={
								localContactName && (
									<CloseButton
										size='sm'
										onClick={() => updateTextFilter('contactName', '')}
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
								updateTextFilter(
									'contactPhoneNumber',
									event.currentTarget.value
								)
							}
							leftSection={
								<IconPhone size={16} className={styles.searchIcon} />
							}
							size='sm'
						/>
						<TextInput
							label={t('filters.outcome')}
							placeholder={t('filters.outcomePlaceholder')}
							value={localDisposition}
							onChange={(event) =>
								updateTextFilter('dispositionName', event.currentTarget.value)
							}
							leftSection={
								<IconChartDots size={16} className={styles.searchIcon} />
							}
							size='sm'
						/>
					</div>
				</div>
			</Collapse>
		</div>
	);
}
