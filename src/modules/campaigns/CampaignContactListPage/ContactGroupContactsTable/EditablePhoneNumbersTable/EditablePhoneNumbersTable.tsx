import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import {
	Group,
	Text,
	Badge,
	ActionIcon,
	Tooltip,
	TextInput,
	Button,
} from '@mantine/core';
import {
	IconPencil,
	IconCheck,
	IconX,
	IconAlertCircle,
	IconPlus,
} from '@tabler/icons-react';
import type { ColumnDef } from '@tanstack/react-table';
import { notifications } from '@mantine/notifications';
import BaseTable from '~/components/BaseTable';
import type { ContactPhoneNumber } from '~/models/ContactsModel';
import { useUpdateContactPhoneNumber } from '~/queries/contactsQueries';
import { useQueryClient } from '@tanstack/react-query';
import styles from './EditablePhoneNumbersTable.module.css';
import AddPhoneNumbersModal from './AddPhoneNumbersModal';
import usePermissions from '~/hooks/usePermissions';
import { ModuleEnum } from '~/contants/ModuleEnum';
import { PermissionEnum } from '~/contants/PermissionEnum';

interface EditablePhoneNumbersTableProps {
	contactId: number;
	contactGroupId: number;
	phoneNumbers: ContactPhoneNumber[];
	onAfterUpdate?: () => void;
}

interface RowShape extends ContactPhoneNumber {}

function EditablePhoneNumbersTable({
	contactId,
	contactGroupId,
	phoneNumbers,
	onAfterUpdate,
}: EditablePhoneNumbersTableProps) {
	const { canPerformAction } = usePermissions();
	const canUpdateContacts = canPerformAction(
		ModuleEnum.CONTACTS,
		PermissionEnum.UPDATE
	);
	const [editingId, setEditingId] = useState<number | null>(null);
	const editedValuesRef = useRef<Record<number, string>>({});
	const updateMutation = useUpdateContactPhoneNumber();
	// Creation handled in modal component
	const queryClient = useQueryClient();

	const [addModalOpen, setAddModalOpen] = useState<boolean>(false);

	const beginEdit = useCallback(
		(row: RowShape) => {
			if (!canUpdateContacts) return;
			setEditingId(row.id);
			editedValuesRef.current[row.id] = row.phoneNumber;
		},
		[canUpdateContacts]
	);

	const cancelEdit = useCallback(() => {
		setEditingId(null);
	}, []);

	useEffect(() => {
		if (!canUpdateContacts) {
			setEditingId(null);
		}
	}, [canUpdateContacts]);

	const saveEdit = useCallback(() => {
		if (!canUpdateContacts) return;
		if (editingId == null) return;
		const row = phoneNumbers.find((p) => p.id === editingId);
		if (!row) return;
		const nextValue = editedValuesRef.current[editingId] ?? row.phoneNumber;
		updateMutation.mutate(
			{ contactId, phoneNumberId: editingId, phoneNumber: nextValue },
			{
				onSuccess: () => {
					// Invalidate queries to refresh everything including faulty list
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
					queryClient.invalidateQueries({
						queryKey: ['contact', String(contactId)],
					});
					notifications.show({
						title: 'Updated',
						message: 'Phone number updated successfully',
						color: 'green',
					});
					setEditingId(null);
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
		editingId,
		phoneNumbers,
		contactId,
		contactGroupId,
		updateMutation,
		queryClient,
		onAfterUpdate,
		canUpdateContacts,
	]);

	const handlePhonesAdded = useCallback(() => {
		// Invalidate queries after modal save
		queryClient.invalidateQueries({
			queryKey: ['contactGroupContacts', contactGroupId],
		});
		queryClient.invalidateQueries({ queryKey: ['contacts'] });
		queryClient.invalidateQueries({
			queryKey: ['contact', String(contactId)],
		});
		onAfterUpdate?.();
	}, [queryClient, contactGroupId, contactId, onAfterUpdate]);

	const EditableInput = ({
		id,
		initialValue,
	}: {
		id: number;
		initialValue: string;
	}) => {
		const [value, setValue] = useState<string>(
			editedValuesRef.current[id] ?? initialValue
		);
		useEffect(() => {
			if (editingId === id) {
				setValue(editedValuesRef.current[id] ?? initialValue);
			}
			// eslint-disable-next-line react-hooks/exhaustive-deps
		}, [editingId, id]);

		const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
			const next = e.currentTarget.value;
			setValue(next);
			editedValuesRef.current[id] = next;
		};

		return (
			<TextInput
				value={value}
				onChange={onChange}
				size='xs'
				placeholder='Enter phone'
				className={styles.editInput}
				autoFocus
			/>
		);
	};

	const columns = useMemo<ColumnDef<RowShape>[]>(() => {
		const baseColumns: ColumnDef<RowShape>[] = [
			{
				accessorKey: 'phoneNumber',
				header: 'Phone Number',
				size: 160,
				cell: ({ row }) => {
					const original = row.original;
					const isEditing = editingId === original.id;
					const hasError = original.validationError;
					if (isEditing && canUpdateContacts) {
						return (
							<Group gap='xs'>
								<EditableInput
									id={original.id}
									initialValue={original.phoneNumber}
								/>
							</Group>
						);
					}
					return (
						<Group gap={6} wrap='nowrap'>
							<Text
								size='xs'
								ff='monospace'
								fw={hasError ? 600 : 400}
								c={hasError ? 'red' : undefined}
								className={styles.phoneNumber}
							>
								{original.phoneNumber}
							</Text>
							{hasError && (
								<Tooltip
									label={original.validationError?.message}
									multiline
									w={220}
									withArrow
								>
									<Badge
										color='red'
										variant='light'
										size='xs'
										leftSection={<IconAlertCircle size={12} />}
									>
										{original.validationError?.code}
									</Badge>
								</Tooltip>
							)}
						</Group>
					);
				},
			},
			{
				accessorKey: 'status',
				header: 'Status',
				size: 90,
				cell: ({ getValue }) => {
					const status = getValue() as string;
					return status ? (
						<Badge variant='light' size='xs'>
							{status}
						</Badge>
					) : (
						<Text size='xs' c='dimmed'>
							N/A
						</Text>
					);
				},
			},
			{
				accessorKey: 'retryCounter',
				header: 'Retries',
				size: 70,
				cell: ({ getValue }) => (
					<Text size='xs'>{(getValue() as number) ?? 0}</Text>
				),
			},
		];

		if (canUpdateContacts) {
			baseColumns.push({
				id: 'actions',
				header: 'Actions',
				size: 90,
				cell: ({ row }) => {
					const original = row.original;
					const isEditing = editingId === original.id;
					return (
						<Group gap={4} className={styles.actions}>
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
										size='sm'
										onClick={saveEdit}
										loading={updateMutation.isPending}
									>
										<IconCheck size={14} />
									</ActionIcon>
									<ActionIcon
										color='red'
										variant='subtle'
										size='sm'
										onClick={cancelEdit}
									>
										<IconX size={14} />
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
		beginEdit,
		cancelEdit,
		saveEdit,
		updateMutation.isPending,
		editingId,
		canUpdateContacts,
	]);

	return (
		<>
			{canUpdateContacts && (
				<Group justify='flex-end' className={styles.addBar}>
					<Tooltip label='Add phone numbers'>
						<Button
							variant='light'
							color='blue'
							size='xs'
							leftSection={<IconPlus size={14} />}
							onClick={() => setAddModalOpen(true)}
						>
							Add
						</Button>
					</Tooltip>
				</Group>
			)}
			<BaseTable
				data={phoneNumbers}
				columns={columns}
				enablePagination={false}
				density='compact'
				emptyMessage='No phone numbers available'
				className={styles.subTableRoot}
			/>
			{canUpdateContacts && addModalOpen && (
				<AddPhoneNumbersModal
					contactId={contactId}
					contactGroupId={contactGroupId}
					onClose={() => setAddModalOpen(false)}
					onSaved={() => {
						setAddModalOpen(false);
						handlePhonesAdded();
					}}
				/>
			)}
		</>
	);
}

export default EditablePhoneNumbersTable;
