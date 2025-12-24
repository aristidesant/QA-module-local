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
import { useMemo, useState, useEffect, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { notifications } from '@mantine/notifications';
import type { Contact } from '~/models/ContactsModel';
import BaseTable from '~/components/BaseTable';
import type { ColumnDef } from '@tanstack/react-table';
import { useExportContactGroupContactsWithPhoneValidationErrors } from '~/queries/contactsQueries';
import { useUpdateContactPhoneNumber } from '~/queries/contactsQueries';
import { useQueryClient } from '@tanstack/react-query';
import styles from './FaultyPhonesModal.module.css';
import usePermissions from '~/hooks/usePermissions';
import { ModuleEnum } from '~/constants/ModuleEnum';
import { PermissionEnum } from '~/constants/PermissionEnum';

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
	const { t } = useTranslation('campaigns');
	const { canPerformAction } = usePermissions();
	const canExportContacts = canPerformAction(
		ModuleEnum.CONTACTS,
		PermissionEnum.EXPORT
	);
	const canUpdateContacts = canPerformAction(
		ModuleEnum.CONTACTS,
		PermissionEnum.UPDATE
	);
	const exportQuery =
		useExportContactGroupContactsWithPhoneValidationErrors(contactGroupId);
	const updatePhoneMutation = useUpdateContactPhoneNumber();
	const queryClient = useQueryClient();

	const [editingPhoneId, setEditingPhoneId] = useState<number | null>(null);
	// Keep the current edited values in a ref map to avoid re-mounting inputs
	const editedValuesRef = useRef<Record<number, string>>({});
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

	const beginEdit = useCallback(
		(row: FaultyPhoneRow) => {
			if (!canUpdateContacts) return;
			setEditingPhoneId(row.phoneNumberId);
			editedValuesRef.current[row.phoneNumberId] = row.phoneNumber;
		},
		[canUpdateContacts]
	);

	const cancelEdit = useCallback(() => {
		setEditingPhoneId(null);
	}, []);

	useEffect(() => {
		if (!canUpdateContacts) {
			setEditingPhoneId(null);
		}
	}, [canUpdateContacts]);

	const saveEdit = useCallback(() => {
		if (!canUpdateContacts) return;
		if (editingPhoneId == null) return;
		const row = rows.find((r) => r.phoneNumberId === editingPhoneId);
		if (!row) return;
		const newValue = editedValuesRef.current[editingPhoneId] ?? row.phoneNumber;
		updatePhoneMutation.mutate(
			{
				contactId: row.contactId,
				phoneNumberId: row.phoneNumberId,
				phoneNumber: newValue,
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
						title: t(
							'contactListPage.faultyPhones.modal.notifications.updateSuccess'
						),
						message: t(
							'contactListPage.faultyPhones.modal.notifications.updateSuccess'
						),
						color: 'green',
					});
					cancelEdit();
					onAfterUpdate?.();
				},
				onError: (error) => {
					notifications.show({
						title: t(
							'contactListPage.faultyPhones.modal.notifications.updateFailed'
						),
						message:
							error instanceof Error
								? error.message
								: t(
										'contactListPage.faultyPhones.modal.notifications.updateFailed'
									),
						color: 'red',
					});
				},
			}
		);
	}, [
		editingPhoneId,
		rows,
		updatePhoneMutation,
		cancelEdit,
		onAfterUpdate,
		canUpdateContacts,
		t,
	]);

	// Small controlled input component to keep focus stable while typing
	const EditablePhoneInput = ({
		phoneNumberId,
		initialValue,
	}: {
		phoneNumberId: number;
		initialValue: string;
	}) => {
		const [value, setValue] = useState<string>(
			editedValuesRef.current[phoneNumberId] ?? initialValue
		);
		useEffect(() => {
			// Sync with ref when editing starts for this id
			if (editingPhoneId === phoneNumberId) {
				const current = editedValuesRef.current[phoneNumberId] ?? initialValue;
				setValue(current);
			}
			// eslint-disable-next-line react-hooks/exhaustive-deps
		}, [editingPhoneId, phoneNumberId]);

		const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
			const next = e.currentTarget.value;
			setValue(next);
			editedValuesRef.current[phoneNumberId] = next;
		};

		return (
			<TextInput
				value={value}
				onChange={onChange}
				size='xs'
				placeholder={t(
					'contactListPage.faultyPhones.modal.placeholders.enterPhone'
				)}
				className={styles.editInput}
				autoFocus
			/>
		);
	};

	const handleExport = async () => {
		if (!canExportContacts) return;
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
					title: t(
						'contactListPage.faultyPhones.modal.notifications.exportSuccess'
					),
					message: t(
						'contactListPage.faultyPhones.modal.notifications.exportSuccess'
					),
					color: 'green',
				});
			}
		} catch (error) {
			notifications.show({
				title: t(
					'contactListPage.faultyPhones.modal.notifications.exportFailed'
				),
				message:
					error instanceof Error
						? error.message
						: t(
								'contactListPage.faultyPhones.modal.notifications.exportFailed'
							),
				color: 'red',
			});
		}
	};

	const columns = useMemo<ColumnDef<FaultyPhoneRow>[]>(() => {
		const baseColumns: ColumnDef<FaultyPhoneRow>[] = [
			{
				accessorKey: 'contactName',
				header: t('contactListPage.faultyPhones.modal.columns.contact'),
				size: 160,
				cell: ({ getValue }) => (
					<Text size='sm' fw={500}>
						{getValue() as string}
					</Text>
				),
			},
			{
				accessorKey: 'phoneNumber',
				header: t('contactListPage.faultyPhones.modal.columns.phoneNumber'),
				size: 150,
				cell: ({ row }) => {
					const original = row.original;
					const isEditing = editingPhoneId === original.phoneNumberId;
					if (isEditing && canUpdateContacts) {
						return (
							<Group gap='xs'>
								<EditablePhoneInput
									phoneNumberId={original.phoneNumberId}
									initialValue={original.phoneNumber}
								/>
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
				header: t('contactListPage.faultyPhones.modal.columns.errorCode'),
				size: 120,
				cell: ({ getValue }) => (
					<Badge color='red' variant='light' size='sm'>
						{getValue() as string}
					</Badge>
				),
			},
			{
				accessorKey: 'errorMessage',
				header: t('contactListPage.faultyPhones.modal.columns.errorMessage'),
				size: 280, // constrain width
				cell: ({ getValue }) => (
					<Text size='sm' c='dimmed' className={styles.errorMessage}>
						{getValue() as string}
					</Text>
				),
			},
		];

		if (canUpdateContacts) {
			baseColumns.push({
				id: 'actions',
				header: t('contactListPage.faultyPhones.modal.columns.actions'),
				cell: ({ row }) => {
					const original = row.original;
					const isEditing = editingPhoneId === original.phoneNumberId;
					return (
						<Group gap='xs'>
							{!isEditing && (
								<Tooltip
									label={t('contactListPage.faultyPhones.modal.tooltips.edit')}
								>
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
			});
		}

		return baseColumns;
	}, [
		editingPhoneId,
		beginEdit,
		cancelEdit,
		saveEdit,
		updatePhoneMutation.isPending,
		canUpdateContacts,
		t,
	]);

	return (
		<Modal
			opened={opened}
			onClose={onClose}
			title={
				<Group gap='xs'>
					<IconAlertCircle size={20} color='var(--mantine-color-red-6)' />
					<Title order={4}>{t('contactListPage.faultyPhones.title')}</Title>
				</Group>
			}
			centered
			size='50vw'
		>
			<Stack gap='md'>
				<Text size='sm' c='dimmed'>
					{t('contactListPage.faultyPhones.modal.description')}
				</Text>

				{canExportContacts && (
					<Group justify='flex-end'>
						<Button
							variant='light'
							color='blue'
							size='sm'
							leftSection={<IconDownload size={16} />}
							onClick={handleExport}
							loading={exportQuery.isFetching}
						>
							{t('contactListPage.faultyPhones.modal.export')}
						</Button>
					</Group>
				)}

				<BaseTable data={rows} columns={columns} enablePagination={false} />

				<Text size='xs' c='dimmed' ta='center'>
					{t('contactListPage.faultyPhones.modal.total', {
						count: rows.length,
						unit: t(
							`contactListPage.faultyPhones.unit_${rows.length === 1 ? 'one' : 'other'}`
						),
					})}
				</Text>
			</Stack>
		</Modal>
	);
};

export default FaultyPhonesModal;
