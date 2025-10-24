import { useMemo } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import {
	ActionIcon,
	Group,
	HoverCard,
	Stack,
	Text,
	Tooltip,
} from '@mantine/core';
import {
	IconEye,
	IconInfoCircle,
	IconPencil,
	IconTrash,
} from '@tabler/icons-react';
import { timeAgo } from '~/utils/dateUtils';
import type { UserModel } from '~/models/UserModels';
import classes from '../UsersList/UsersList.module.css';

interface UseUsersColumnsParams {
	onView: (userId: number) => void;
	onEdit: (userId: number) => void;
	onDelete: (user: UserModel) => void;
}

const formatDateTime = (value: string | Date | null | undefined) => {
	if (!value) {
		return '—';
	}

	const date = typeof value === 'string' ? new Date(value) : value;
	if (Number.isNaN(date.getTime())) {
		return '—';
	}

	return date.toLocaleString();
};

const useUsersColumns = ({
	onView,
	onEdit,
	onDelete,
}: UseUsersColumnsParams): ColumnDef<UserModel>[] =>
	useMemo(
		() => [
			{
				id: 'name',
				header: 'Name',
				cell: ({ row }) => {
					const user = row.original;
					const firstName = user.firstName?.trim() || '';
					const lastName = user.lastName?.trim() || '';
					const name = `${firstName} ${lastName}`.trim() || '—';

					return (
						<Group gap='xs' align='center'>
							<HoverCard width={280} shadow='md'>
								<HoverCard.Target>
									<ActionIcon variant='subtle' size='sm'>
										<IconInfoCircle size={14} />
									</ActionIcon>
								</HoverCard.Target>
								<HoverCard.Dropdown>
									<Text fz='xs'>Username: {user.username}</Text>
									<Text fz='xs'>Email: {user.email}</Text>
									<Text fz='xs'>Created: {formatDateTime(user.createdAt)}</Text>
								</HoverCard.Dropdown>
							</HoverCard>
							<Text fz='xs'>{name}</Text>
						</Group>
					);
				},
			},
			{
				id: 'client',
				header: 'Client',
				cell: ({ row }) => {
					const { client, clientId } = row.original;

					if (!client) {
						return <Text fz='xs'>#{clientId ?? '—'}</Text>;
					}

					const clientName = client.name || `Client #${client.id}`;

					return (
						<HoverCard width={280} shadow='md'>
							<HoverCard.Target>
								<Text fz='xs'>{clientName}</Text>
							</HoverCard.Target>
							<HoverCard.Dropdown>
								<Stack gap={4}>
									<Text fz='xs'>ID: #{client.id}</Text>
									<Text fz='xs'>Identifier: {client.identifier || '—'}</Text>
									<Text fz='xs'>Email: {client.email || '—'}</Text>
								</Stack>
							</HoverCard.Dropdown>
						</HoverCard>
					);
				},
			},
			{
				accessorKey: 'updatedAt',
				header: 'Updated',
				cell: ({ getValue }) => {
					const value = getValue<string | Date | null | undefined>();
					return <Text fz='xs'>{value ? timeAgo(value) : '—'}</Text>;
				},
			},
			{
				id: 'actions',
				header: 'Actions',
				meta: {
					headerClassName: classes.actionsHeader,
					cellClassName: classes.actionsCell,
				},
				cell: ({ row }) => {
					const user = row.original;

					return (
						<Group gap='xs' justify='flex-end' wrap='nowrap'>
							<Tooltip label='View user' withArrow>
								<ActionIcon
									variant='subtle'
									onClick={(event) => {
										event.stopPropagation();
										onView(user.id);
									}}
									aria-label='View user'
								>
									<IconEye size={16} />
								</ActionIcon>
							</Tooltip>
							<Tooltip label='Edit user' withArrow>
								<ActionIcon
									variant='subtle'
									onClick={(event) => {
										event.stopPropagation();
										onEdit(user.id);
									}}
									aria-label='Edit user'
								>
									<IconPencil size={16} />
								</ActionIcon>
							</Tooltip>
							<Tooltip label='Delete user' withArrow>
								<ActionIcon
									variant='subtle'
									color='red'
									onClick={(event) => {
										event.stopPropagation();
										onDelete(user);
									}}
									aria-label='Delete user'
								>
									<IconTrash size={16} />
								</ActionIcon>
							</Tooltip>
						</Group>
					);
				},
			},
		],
		[onDelete, onEdit, onView]
	);

export default useUsersColumns;
