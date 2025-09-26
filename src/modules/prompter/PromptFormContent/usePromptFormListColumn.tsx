import { useMemo, useCallback } from 'react';
import { Text, Badge, Group, ActionIcon } from '@mantine/core';
import type { ColumnDef } from '@tanstack/react-table';
import type { PromptForm } from '~/models/PromptFormModel';
import { PromptFormForm } from '../../prompt-form/PromptFormForm';
import { modals } from '@mantine/modals';
import styles from './PromptFormContent.module.css';
import usePromptFormStore from '../../prompt-form/usePromptFormStore';
import {
	useDeletePromptForm,
	useUpdatePromptForm,
} from '../../../queries/promptFormQueries';
import { IconPencil, IconTrash } from '@tabler/icons-react';

export default function usePromptFormListColumn() {
	const { setRightComponent } = usePromptFormStore((s) => s);
	const { mutateAsync: updatePromptForm } = useUpdatePromptForm();
	const { mutateAsync: deletePromptForm } = useDeletePromptForm();

	const handleOnUpdate = useCallback(
		async (values: PromptForm) => {
			try {
				await updatePromptForm({ id: String(values.id), data: values });
				setRightComponent(null);
			} catch (error) {
				// eslint-disable-next-line no-console
				console.error('Error updating prompt form:', error);
			}
		},
		[setRightComponent, updatePromptForm]
	);

	const confirmDelete = useCallback(
		(id: string) => {
			modals.openConfirmModal({
				title: 'Delete Prompt Form',
				children: (
					<Text size='sm'>
						Are you sure you want to delete this prompt form? This action is
						irreversible.
					</Text>
				),
				labels: { confirm: 'Delete', cancel: 'Cancel' },
				confirmProps: { color: 'red' },
				onConfirm: async () => {
					try {
						await deletePromptForm(id);
					} catch (error) {
						// eslint-disable-next-line no-console
						console.error('Error deleting prompt form:', error);
					}
				},
			});
		},
		[deletePromptForm]
	);

	const openEditForm = useCallback(
		(values: PromptForm) => {
			setRightComponent(
				<PromptFormForm onSubmit={handleOnUpdate} initialValues={values} />
			);
		},
		[handleOnUpdate, setRightComponent]
	);

	const columns = useMemo<ColumnDef<PromptForm>[]>(
		() => [
			{
				accessorKey: 'name',
				header: 'Name',
				cell: ({ row }) => (
					<div className={styles.nameCell}>
						<Text fw={500} size='sm'>
							{row.original.name}
						</Text>
					</div>
				),
			},
			{
				id: 'type',
				header: 'Type',
				cell: ({ row }) =>
					row.original.type?.name ? (
						<Badge
							size='sm'
							radius='sm'
							variant='light'
							className={styles.typeBadge}
						>
							{row.original.type.name}
						</Badge>
					) : (
						<Text size='xs' c='dimmed'>
							Unassigned
						</Text>
					),
			},
			{
				accessorKey: 'createdAt',
				header: 'Created',
				cell: ({ row }) => (
					<Text size='xs' c='dimmed'>
						{row.original.createdAt
							? new Date(row.original.createdAt).toLocaleDateString(undefined, {
									year: 'numeric',
									month: 'short',
									day: 'numeric',
								})
							: 'Unknown'}
					</Text>
				),
			},
			{
				accessorKey: 'updatedAt',
				header: 'Updated',
				cell: ({ row }) => (
					<Text size='xs' c='dimmed'>
						{row.original.updatedAt
							? new Date(row.original.updatedAt).toLocaleDateString(undefined, {
									year: 'numeric',
									month: 'short',
									day: 'numeric',
								})
							: 'Unknown'}
					</Text>
				),
			},
			{
				id: 'actions',
				header: 'Actions',
				cell: ({ row }) => (
					<Group justify='flex-end' className={styles.actions} gap='xs'>
						<ActionIcon
							size='sm'
							variant='light'
							onClick={(e) => {
								e.stopPropagation();
								openEditForm(row.original);
							}}
							aria-label='Edit form'
						>
							<IconPencil size={16} />
						</ActionIcon>
						<ActionIcon
							size='sm'
							variant='light'
							color='red'
							onClick={(e) => {
								e.stopPropagation();
								confirmDelete(String(row.original.id));
							}}
							aria-label='Delete form'
						>
							<IconTrash size={16} />
						</ActionIcon>
					</Group>
				),
				enableSorting: false,
			},
		],
		[confirmDelete, openEditForm]
	);

	return { columns, openEditForm };
}
