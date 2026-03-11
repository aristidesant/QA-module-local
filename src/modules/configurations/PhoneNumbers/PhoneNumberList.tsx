import { useMemo, useState } from 'react';
import {
	Badge,
	Group,
	Button,
	CloseButton,
	TextInput,
	Select,
	Stack,
	Text,
	Modal,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { IconFilter, IconSearch } from '@tabler/icons-react';
import { useTranslation, Trans } from 'react-i18next';
import BaseTable from '~/components/BaseTable/BaseTable';
import {
	usePhoneNumbers,
	useDeletePhoneNumber,
} from '~/queries/phoneNumberQueries';
import { usePhoneNumberTableColumns } from './usePhoneNumberTableColumns';
import { PhoneNumber } from '~/models/PhoneNumber';
import styles from './PhoneNumberList.module.css';

interface PhoneNumberListProps {
	onEdit: (phoneNumber: PhoneNumber) => void;
}

const PHONE_TYPE_OPTIONS = ['INBOUND', 'OUTBOUND', 'HYBRID'];

export function PhoneNumberList({ onEdit }: PhoneNumberListProps) {
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

	const { mutate: deletePhoneNumber, isPending: isDeleting } =
		useDeletePhoneNumber();
	const [deleteModalOpen, { open: openDeleteModal, close: closeDeleteModal }] =
		useDisclosure(false);
	const [phoneToDelete, setPhoneToDelete] = useState<PhoneNumber | null>(null);

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

	const columns = usePhoneNumberTableColumns({
		onEdit,
		onDelete: handleDelete,
	});

	const totalCount = data?.total ?? 0;
	const tableData = useMemo(() => data?.data || [], [data?.data]);

	return (
		<Stack className={styles.listRoot}>
			<div className={styles.toolbar}>
				<div className={styles.toolbarMain}>
					<TextInput
						className={styles.searchInput}
						placeholder={t('list.searchPlaceholder')}
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
					<Badge
						leftSection={<IconFilter size={12} />}
						variant='light'
						color={hasActiveFilters ? 'blue' : 'gray'}
						radius='sm'
						className={styles.badge}
					>
						{hasActiveFilters
							? t('list.activeFilters', { count: activeFiltersCount })
							: t('list.noActiveFilters')}
					</Badge>
					<Badge variant='dot' color='gray' radius='sm'>
						{t('list.totalItems', { count: totalCount })}
					</Badge>
					{hasActiveFilters ? (
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
					) : null}
				</div>
			</div>

			<div className={styles.tableFrame}>
				<BaseTable
					data={tableData}
					columns={columns}
					isLoading={isLoading}
					pageIndex={page - 1} // BaseTable uses 0-indexed pageIndex
					pageSize={limit} // BaseTable uses pageSize
					onPaginationChange={(idx, size) => {
						setPage(idx + 1);
						setLimit(size);
					}}
					pageCount={data?.totalPages || 0}
					filterMode='server' // Explicitly set filterMode to server since we manage pagination manually
					enablePagination
					showPaginationControls
				/>
			</div>

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
		</Stack>
	);
}
