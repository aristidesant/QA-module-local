import { useCallback, useEffect, useMemo, useState } from 'react';
import {
	Badge,
	Center,
	Group,
	Button,
	CloseButton,
	Paper,
	TextInput,
	Select,
	Stack,
	Text,
	Modal,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import {
	IconFilter,
	IconPhone,
	IconPlus,
	IconSearch,
	IconTrash,
} from '@tabler/icons-react';
import { useTranslation, Trans } from 'react-i18next';
import BaseTable from '~/components/BaseTable/BaseTable';
import {
	usePhoneNumbers,
	useDeletePhoneNumber,
	useBulkDeletePhoneNumbers,
} from '~/queries/phoneNumberQueries';
import { usePhoneNumberTableColumns } from './usePhoneNumberTableColumns';
import { PhoneNumber } from '~/models/PhoneNumber';
import styles from './PhoneNumberList.module.css';

interface PhoneNumberListProps {
	onEdit: (phoneNumber: PhoneNumber) => void;
	onCreate: () => void;
}

const PHONE_TYPE_OPTIONS = ['INBOUND', 'OUTBOUND', 'HYBRID'];

export function PhoneNumberList({ onEdit, onCreate }: PhoneNumberListProps) {
	const { t } = useTranslation('phone-numbers');
	const [page, setPage] = useState(1);
	const [limit, setLimit] = useState(10);
	const [search, setSearch] = useState('');
	const [typeFilter, setTypeFilter] = useState<string | null>(null);

	const activeFiltersCount = (search ? 1 : 0) + (typeFilter ? 1 : 0);
	const hasActiveFilters = activeFiltersCount > 0;

	// Filter out empty params
	const queryParams = {
		page,
		limit,
		...(search ? { label: search } : {}),
		...(typeFilter
			? { type: typeFilter as 'INBOUND' | 'OUTBOUND' | 'HYBRID' }
			: {}),
	};

	const { data, isLoading } = usePhoneNumbers(queryParams);
	const totalCount = data?.total ?? 0;
	const tableData = useMemo(() => data?.data || [], [data?.data]);

	const { mutate: deletePhoneNumber, isPending: isDeleting } =
		useDeletePhoneNumber();
	const [deleteModalOpen, { open: openDeleteModal, close: closeDeleteModal }] =
		useDisclosure(false);
	const [phoneToDelete, setPhoneToDelete] = useState<PhoneNumber | null>(null);

	const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
	const { mutate: bulkDelete, isPending: isBulkDeleting } =
		useBulkDeletePhoneNumbers();
	const [
		bulkDeleteModalOpen,
		{ open: openBulkDeleteModal, close: closeBulkDeleteModal },
	] = useDisclosure(false);

	const allVisibleSelected =
		tableData.length > 0 && tableData.every((row) => selectedIds.has(row.id));
	const someVisibleSelected = tableData.some((row) => selectedIds.has(row.id));

	const handleToggleSelect = useCallback((id: number) => {
		setSelectedIds((prev) => {
			const next = new Set(prev);
			if (next.has(id)) {
				next.delete(id);
			} else {
				next.add(id);
			}
			return next;
		});
	}, []);

	const handleSelectAll = useCallback(() => {
		if (allVisibleSelected) {
			setSelectedIds(
				(prev) =>
					new Set(
						[...prev].filter((id) => !tableData.some((row) => row.id === id))
					)
			);
		} else {
			setSelectedIds((prev) => {
				const next = new Set(prev);
				for (const row of tableData) {
					next.add(row.id);
				}
				return next;
			});
		}
	}, [allVisibleSelected, tableData]);

	const selectedCount = selectedIds.size;

	const handleDelete = (phoneNumber: PhoneNumber) => {
		setPhoneToDelete(phoneNumber);
		openDeleteModal();
	};

	const confirmDelete = () => {
		if (phoneToDelete) {
			deletePhoneNumber(phoneToDelete.id, {
				onSuccess: () => {
					notifications.show({
						title: t('list.notifications.deleteSuccess'),
						message: t('list.notifications.deleteSuccess'),
						color: 'green',
					});
					closeDeleteModal();
				},
				onError: () => {
					notifications.show({
						title: t('list.notifications.deleteError'),
						message: t('list.notifications.deleteError'),
						color: 'red',
					});
				},
			});
		}
	};

	const confirmBulkDelete = () => {
		bulkDelete([...selectedIds], {
			onSuccess: (result) => {
				if (result.failed.length === 0) {
					notifications.show({
						title: t('list.bulkDelete.success', {
							count: result.success.length,
						}),
						message: '',
						color: 'green',
					});
				} else if (result.success.length > 0) {
					notifications.show({
						title: t('list.bulkDelete.partial', {
							success: result.success.length,
							failed: result.failed.length,
						}),
						message: '',
						color: 'yellow',
					});
				} else {
					notifications.show({
						title: t('list.bulkDelete.error'),
						message: '',
						color: 'red',
					});
				}
				setSelectedIds(new Set());
				closeBulkDeleteModal();
			},
			onError: () => {
				notifications.show({
					title: t('list.bulkDelete.error'),
					message: '',
					color: 'red',
				});
			},
		});
	};

	// Keyboard shortcut: Delete to trigger bulk delete
	useEffect(() => {
		const handler = (e: KeyboardEvent) => {
			if (
				(e.key === 'Delete' || e.key === 'Backspace') &&
				selectedCount > 0 &&
				!isBulkDeleting &&
				!deleteModalOpen &&
				!bulkDeleteModalOpen
			) {
				openBulkDeleteModal();
			}
		};
		window.addEventListener('keydown', handler);
		return () => window.removeEventListener('keydown', handler);
	}, [
		selectedCount,
		isBulkDeleting,
		deleteModalOpen,
		bulkDeleteModalOpen,
		openBulkDeleteModal,
	]);

	const columns = usePhoneNumberTableColumns({
		onEdit,
		onDelete: handleDelete,
		selectedIds,
		onToggleSelect: handleToggleSelect,
		onSelectAll: handleSelectAll,
		allVisibleSelected,
		someVisibleSelected,
	});

	const showEmptyState =
		!isLoading && tableData.length === 0 && !hasActiveFilters;

	return (
		<Stack className={styles.listRoot}>
			<div className={styles.toolbar}>
				<div className={styles.toolbarMain}>
					<TextInput
						className={styles.searchInput}
						placeholder={t('list.searchPlaceholder')}
						aria-label={t('list.searchPlaceholder')}
						leftSection={<IconSearch size={16} />}
						value={search}
						rightSection={
							search ? (
								<CloseButton
									size='sm'
									onClick={() => setSearch('')}
									aria-label={t('list.clearSearch')}
								/>
							) : null
						}
						onChange={(event) => {
							setSearch(event.currentTarget.value);
							setPage(1);
						}}
						size='sm'
						radius='md'
					/>
					<Select
						className={styles.typeSelect}
						placeholder={t('list.filterType')}
						data={PHONE_TYPE_OPTIONS}
						value={typeFilter}
						onChange={(value) => {
							setTypeFilter(value);
							setPage(1);
						}}
						clearable
						size='sm'
						radius='md'
					/>
				</div>
				<div className={styles.toolbarMeta}>
					{hasActiveFilters && (
						<Badge
							leftSection={<IconFilter size={12} />}
							variant='light'
							color='blue'
							radius='sm'
							className={styles.badge}
						>
							{t('list.activeFilters', { count: activeFiltersCount })}
						</Badge>
					)}
					{!showEmptyState && (
						<Badge variant='light' color='gray' radius='sm'>
							{t('list.totalItems', { count: totalCount })}
						</Badge>
					)}
					{hasActiveFilters && (
						<Button
							variant='subtle'
							size='compact-sm'
							className={styles.clearButton}
							onClick={() => {
								setSearch('');
								setTypeFilter(null);
								setPage(1);
							}}
						>
							{t('list.clearFilters')}
						</Button>
					)}
				</div>
			</div>

			{selectedCount > 0 && (
				<Paper className={styles.bulkBar} withBorder>
					<Group justify='space-between' px='sm' py={6}>
						<Text size='sm' fw={500}>
							{t('list.bulkDelete.selected', { count: selectedCount })}
						</Text>
						<Button
							variant='light'
							color='red'
							size='compact-sm'
							leftSection={<IconTrash size={14} />}
							onClick={openBulkDeleteModal}
							loading={isBulkDeleting}
						>
							{t('list.bulkDelete.deleteButton', { count: selectedCount })}
						</Button>
					</Group>
				</Paper>
			)}

			{showEmptyState ? (
				<Center className={styles.emptyState}>
					<IconPhone size={48} stroke={1.5} className={styles.emptyIcon} />
					<Text size='md' fw={600}>
						{t('list.empty.title')}
					</Text>
					<Text size='sm' c='dimmed' className={styles.emptyDescription}>
						{t('list.empty.description')}
					</Text>
					<Button
						variant='filled'
						color='green'
						leftSection={<IconPlus size={16} />}
						onClick={onCreate}
						size='sm'
					>
						{t('list.addPhoneNumber')}
					</Button>
				</Center>
			) : (
				<div className={styles.tableFrame}>
					<BaseTable
						data={tableData}
						columns={columns}
						isLoading={isLoading}
						density='compact'
						pageIndex={page - 1}
						pageSize={limit}
						onPaginationChange={(idx, size) => {
							setPage(idx + 1);
							setLimit(size);
						}}
						pageCount={data?.totalPages || 0}
						filterMode='server'
						enablePagination
						showPaginationControls
					/>
				</div>
			)}

			<Modal
				opened={deleteModalOpen}
				onClose={closeDeleteModal}
				title={t('list.deleteModal.title')}
			>
				<Stack>
					<Text>
						<Trans
							i18nKey='list.deleteModal.message'
							t={t}
							values={{ phoneNumber: phoneToDelete?.phoneNumber }}
							components={{ b: <b /> }}
						/>
					</Text>
					<Group justify='flex-end'>
						<Button variant='default' onClick={closeDeleteModal}>
							{t('list.deleteModal.cancel')}
						</Button>
						<Button color='red' loading={isDeleting} onClick={confirmDelete}>
							{t('list.deleteModal.confirm')}
						</Button>
					</Group>
				</Stack>
			</Modal>

			<Modal
				opened={bulkDeleteModalOpen}
				onClose={closeBulkDeleteModal}
				title={t('list.bulkDelete.modalTitle', { count: selectedCount })}
			>
				<Stack>
					<Text size='sm'>{t('list.bulkDelete.modalMessage')}</Text>
					<Group justify='flex-end'>
						<Button variant='default' onClick={closeBulkDeleteModal}>
							{t('list.deleteModal.cancel')}
						</Button>
						<Button
							color='red'
							loading={isBulkDeleting}
							onClick={confirmBulkDelete}
						>
							{t('list.bulkDelete.confirm', { count: selectedCount })}
						</Button>
					</Group>
				</Stack>
			</Modal>
		</Stack>
	);
}
