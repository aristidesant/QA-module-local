import { useState } from 'react';
import {
	Group,
	Button,
	TextInput,
	Select,
	Stack,
	Text,
	Modal,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { IconSearch, IconPlus } from '@tabler/icons-react';
import { useTranslation, Trans } from 'react-i18next';
import BaseTable from '~/components/BaseTable/BaseTable';
import {
	usePhoneNumbers,
	useDeletePhoneNumber,
} from '~/queries/phoneNumberQueries';
import { usePhoneNumberTableColumns } from './usePhoneNumberTableColumns';
import { PhoneNumber } from '~/models/PhoneNumber';

interface PhoneNumberListProps {
	onCreate: () => void;
	onEdit: (phoneNumber: PhoneNumber) => void;
}

export function PhoneNumberList({ onCreate, onEdit }: PhoneNumberListProps) {
	const { t } = useTranslation('phone-numbers');
	const [page, setPage] = useState(1);
	const [limit, setLimit] = useState(10);
	const [search, setSearch] = useState('');
	const [typeFilter, setTypeFilter] = useState<string | null>(null);

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

	return (
		<Stack>
			<Group justify='space-between'>
				<Group>
					<TextInput
						placeholder={t('list.searchPlaceholder')}
						leftSection={<IconSearch size={16} />}
						value={search}
						onChange={(event) => setSearch(event.currentTarget.value)}
					/>
					<Select
						placeholder={t('list.filterType')}
						data={['INBOUND', 'OUTBOUND', 'HYBRID']}
						value={typeFilter}
						onChange={setTypeFilter}
						clearable
					/>
				</Group>
				<Button leftSection={<IconPlus size={16} />} onClick={onCreate}>
					{t('list.addPhoneNumber')}
				</Button>
			</Group>

			<BaseTable
				data={data?.data || []}
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
