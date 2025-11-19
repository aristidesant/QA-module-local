import {
	Modal,
	Title,
	Text,
	Badge,
	Group,
	Stack,
	Button,
	TextInput,
	ActionIcon,
	Tooltip,
} from '@mantine/core';
import {
	IconAlertCircle,
	IconDownload,
	IconPencil,
	IconX,
	IconCheck,
} from '@tabler/icons-react';
import { useMemo, useState, useEffect, useCallback } from 'react';
import { notifications } from '@mantine/notifications';
import type { Contact } from '~/models/ContactsModel';
import BaseTable from '~/components/BaseTable';
import type { ColumnDef } from '@tanstack/react-table';
import { useExportContactGroupContactsWithPhoneValidationErrors } from '~/queries/contactsQueries';
import { useUpdateContactPhoneNumber } from '~/queries/contactsQueries';
import { useQueryClient } from '@tanstack/react-query';
import styles from './FaultyPhonesModal.module.css';

interface FaultyPhonesModalProps {
	opened: boolean;
	onClose: () => void;
	contacts: Contact[];
	contactGroupId: number;
	onAfterUpdate?: () => void; // trigger parent refetch
}

interface FaultyPhoneRow {
	contactId: number;
	contactName: string;
	phoneNumberId: number;
	phoneNumber: string; // raw faulty phone number
	errorCode: string;
	errorMessage: string;
}

const FaultyPhonesModal = ({
	opened,
	onClose,
	contacts,
	contactGroupId,
	onAfterUpdate,
}: FaultyPhonesModalProps) => {
	const exportQuery =
		useExportContactGroupContactsWithPhoneValidationErrors(contactGroupId);
	const updatePhoneMutation = useUpdateContactPhoneNumber();
	const queryClient = useQueryClient();

	const [editingPhoneId, setEditingPhoneId] = useState<number | null>(null);
	const [editedValue, setEditedValue] = useState<string>('');
	const [rows, setRows] = useState<FaultyPhoneRow[]>([]);

	const faultyPhoneRows = useMemo(() => {
		const collection: FaultyPhoneRow[] = [];
		contacts.forEach((contact) => {
			contact.phoneNumbers?.forEach((phoneEntry) => {
				if (phoneEntry.validationError) {
					collection.push({
						contactId: contact.id,
						contactName: `${contact.firstName} ${contact.lastName}`,
						phoneNumberId: (phoneEntry as any).id,
						phoneNumber: phoneEntry.validationError.rawPhone,
						errorCode: phoneEntry.validationError.code,
						errorMessage: phoneEntry.validationError.message,
					});
				}
			});
		});
		return collection;
	}, [contacts]);

	useEffect(() => {
		setRows(faultyPhoneRows);
	}, [faultyPhoneRows]);

	const beginEdit = useCallback((row: FaultyPhoneRow) => {
		setEditingPhoneId(row.phoneNumberId);
		setEditedValue(row.phoneNumber);
	}, []);

	const cancelEdit = useCallback(() => {
		setEditingPhoneId(null);
		setEditedValue('');
	}, []);

	const saveEdit = useCallback(() => {
		if (editingPhoneId == null) return;
		const row = rows.find((r) => r.phoneNumberId === editingPhoneId);
		if (!row) return;
		updatePhoneMutation.mutate(
			{
				contactId: row.contactId,
				phoneNumberId: row.phoneNumberId,
				phoneNumber: editedValue,
			},
			{
				onSuccess: () => {
					// Optimistically remove row (assume now valid)
					setRows((prev) =>
						prev.filter((r) => r.phoneNumberId !== editingPhoneId)
					);
					// Invalidate related queries so contacts table & alert refresh
					queryClient.invalidateQueries({
						queryKey: [
							'contactGroupContactsWithPhoneValidationErrors',
							contactGroupId,
						],
					});
					queryClient.invalidateQueries({
						queryKey: ['contactGroupContacts', contactGroupId],
					});
					queryClient.invalidateQueries({ queryKey: ['contacts'] });
					notifications.show({
						title: 'Updated',
						message: 'Phone number updated successfully',
						color: 'green',
					});
					cancelEdit();
					onAfterUpdate?.();
				},
				onError: (error) => {
					notifications.show({
						title: 'Update Failed',
						message:
							error instanceof Error
								? error.message
								: 'Failed to update phone number',
						color: 'red',
					});
				},
			}
		);
	}, [
		editingPhoneId,
		rows,
		editedValue,
		updatePhoneMutation,
		cancelEdit,
		onAfterUpdate,
	]);

	const handleExport = async () => {
		try {
			const result = await exportQuery.refetch();
			if (result.data) {
				// Create a Blob from the CSV content
				const blob = new Blob([result.data], {
					type: 'text/csv;charset=utf-8;',
				});
				const url = URL.createObjectURL(blob);

				// Create a temporary link and trigger download
				const link = document.createElement('a');
				link.href = url;
				link.download = `faulty-contacts-${contactGroupId}.csv`;
				document.body.appendChild(link);
				link.click();
				document.body.removeChild(link);

				// Clean up the URL object
				URL.revokeObjectURL(url);

				notifications.show({
					title: 'Export Successful',
					message: 'Faulty phone numbers exported successfully',
					color: 'green',
				});
			}
		} catch (error) {
			notifications.show({
				title: 'Export Failed',
				message:
					error instanceof Error
						? error.message
						: 'Failed to export faulty phone numbers',
				color: 'red',
			});
		}
	};

	const columns = useMemo<ColumnDef<FaultyPhoneRow>[]>(
		() => [
			{
				accessorKey: 'contactName',
				header: 'Contact',
				size: 160,
				cell: ({ getValue }) => (
					<Text size='sm' fw={500}>
						{getValue() as string}
					</Text>
				),
			},
			{
				accessorKey: 'phoneNumber',
				header: 'Phone Number',
				size: 150,
				cell: ({ row }) => {
					const original = row.original;
					const isEditing = editingPhoneId === original.phoneNumberId;
					if (isEditing) {
						return (
							<Group gap='xs'>
								<TextInput
									value={editedValue}
									onChange={(e) => setEditedValue(e.currentTarget.value)}
									size='xs'
									placeholder='Enter phone'
									className={styles.editInput}
									data-autofocus
								/>
								<ActionIcon
									color='green'
									variant='light'
									onClick={saveEdit}
									loading={updatePhoneMutation.isPending}
								>
									<IconCheck size={16} />
								</ActionIcon>
								<ActionIcon color='red' variant='subtle' onClick={cancelEdit}>
									<IconX size={16} />
								</ActionIcon>
							</Group>
						);
					}
					return (
						<Text size='sm' c='red' fw={600} className={styles.phoneNumber}>
							{original.phoneNumber}
						</Text>
					);
				},
			},

			{
				accessorKey: 'errorCode',
				header: 'Error Code',
				size: 120,
				cell: ({ getValue }) => (
					<Badge color='red' variant='light' size='sm'>
						{getValue() as string}
					</Badge>
				),
			},
			{
				accessorKey: 'errorMessage',
				header: 'Error Message',
				size: 280, // constrain width
				cell: ({ getValue }) => (
					<Text size='sm' c='dimmed' className={styles.errorMessage}>
						{getValue() as string}
					</Text>
				),
			},
			{
				id: 'actions',
				header: 'Actions',
				cell: ({ row }) => {
					const original = row.original;
					const isEditing = editingPhoneId === original.phoneNumberId;
					return (
						<Group gap='xs'>
							{!isEditing && (
								<Tooltip label='Edit phone number'>
									<ActionIcon
										variant='subtle'
										color='blue'
										size='sm'
										onClick={() => beginEdit(original)}
									>
										<IconPencil size={14} />
									</ActionIcon>
								</Tooltip>
							)}
							{isEditing && (
								<Group gap={4}>
									<ActionIcon
										color='green'
										variant='light'
										onClick={saveEdit}
										loading={updatePhoneMutation.isPending}
									>
										<IconCheck size={16} />
									</ActionIcon>
									<ActionIcon color='red' variant='subtle' onClick={cancelEdit}>
										<IconX size={16} />
									</ActionIcon>
								</Group>
							)}
						</Group>
					);
				},
			},
		],
		[
			editingPhoneId,
			editedValue,
			beginEdit,
			cancelEdit,
			saveEdit,
			updatePhoneMutation.isPending,
		]
	);

	return (
		<Modal
			opened={opened}
			onClose={onClose}
			title={
				<Group gap='xs'>
					<IconAlertCircle size={20} color='var(--mantine-color-red-6)' />
					<Title order={4}>Faulty Phone Numbers</Title>
				</Group>
			}
			centered
			size='50vw'
		>
			<Stack gap='md'>
				<Text size='sm' c='dimmed'>
					The following phone numbers have validation errors and need attention.
					These contacts may not receive calls until the phone numbers are
					corrected.
				</Text>

				<Group justify='flex-end'>
					<Button
						variant='light'
						color='blue'
						size='sm'
						leftSection={<IconDownload size={16} />}
						onClick={handleExport}
						loading={exportQuery.isFetching}
					>
						Export
					</Button>
				</Group>

				<BaseTable data={rows} columns={columns} enablePagination={false} />

				<Text size='xs' c='dimmed' ta='center'>
					Total: {rows.length} faulty phone{' '}
					{rows.length === 1 ? 'number' : 'numbers'}
				</Text>
			</Stack>
		</Modal>
	);
};

export default FaultyPhonesModal;
