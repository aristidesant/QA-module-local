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
import { useTranslation } from 'react-i18next';
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
}: UseUsersColumnsParams): ColumnDef<UserModel>[] => {
	const { t } = useTranslation('users');

	return useMemo(
		() => [
			{
				id: 'name',
				header: t('columns.name'),
				cell: ({ row }) => {
					const user = row.original;
					const firstName = user.firstName?.trim() || '';
					const lastName = user.lastName?.trim() || '';
					const name = `${firstName} ${lastName}`.trim() || '—';

					return (
						<Group gap='xs' align='center'>
							<HoverCard width={280} shadow='none'>
								<HoverCard.Target>
									<ActionIcon variant='subtle' size='sm'>
										<IconInfoCircle size={14} />
									</ActionIcon>
								</HoverCard.Target>
								<HoverCard.Dropdown>
									<Text fz='xs'>
										{t('table.user.usernameLabel')}: {user.username}
									</Text>
									<Text fz='xs'>
										{t('table.user.emailLabel')}: {user.email}
									</Text>
									<Text fz='xs'>
										{t('table.user.createdLabel')}:{' '}
										{formatDateTime(user.createdAt)}
									</Text>
								</HoverCard.Dropdown>
							</HoverCard>
							<Text fz='xs'>{name}</Text>
						</Group>
					);
				},
			},
			{
				id: 'client',
				header: t('columns.client'),
				cell: ({ row }) => {
					const { client, clientId } = row.original;

					if (!client) {
						return <Text fz='xs'>#{clientId ?? '—'}</Text>;
					}

					const clientName = client.name || `Client #${client.id}`;

					return (
						<HoverCard width={280} shadow='none'>
							<HoverCard.Target>
								<Text fz='xs'>{clientName}</Text>
							</HoverCard.Target>
							<HoverCard.Dropdown>
								<Stack gap={4}>
									<Text fz='xs'>
										{t('table.client.idLabel')}: #{client.id}
									</Text>
									<Text fz='xs'>
										{t('table.client.identifierLabel')}:{' '}
										{client.identifier || '—'}
									</Text>
									<Text fz='xs'>
										{t('table.client.emailLabel')}: {client.email || '—'}
									</Text>
								</Stack>
							</HoverCard.Dropdown>
						</HoverCard>
					);
				},
			},
			{
				accessorKey: 'lastLogin',
				header: t('columns.lastLogin'),
				cell: ({ getValue }) => {
					const value = getValue<string | Date | null | undefined>();
					return <Text fz='xs'>{value ? timeAgo(value) : '—'}</Text>;
				},
			},
			{
				accessorKey: 'updatedAt',
				header: t('columns.updated'),
				cell: ({ getValue }) => {
					const value = getValue<string | Date | null | undefined>();
					return <Text fz='xs'>{value ? timeAgo(value) : '—'}</Text>;
				},
			},
			{
				id: 'actions',
				header: t('columns.actions'),
				meta: {
					headerClassName: classes.actionsHeader,
					cellClassName: classes.actionsCell,
				},
				cell: ({ row }) => {
					const user = row.original;

					return (
						<Group gap='xs' justify='flex-end' wrap='nowrap'>
							<Tooltip label={t('table.actions.view')} withArrow>
								<ActionIcon
									variant='subtle'
									onClick={(event) => {
										event.stopPropagation();
										onView(user.id);
									}}
									aria-label={t('table.actions.view')}
								>
									<IconEye size={16} />
								</ActionIcon>
							</Tooltip>
							<Tooltip label={t('table.actions.edit')} withArrow>
								<ActionIcon
									variant='subtle'
									onClick={(event) => {
										event.stopPropagation();
										onEdit(user.id);
									}}
									aria-label={t('table.actions.edit')}
								>
									<IconPencil size={16} />
								</ActionIcon>
							</Tooltip>
							<Tooltip label={t('table.actions.delete')} withArrow>
								<ActionIcon
									variant='subtle'
									color='red'
									onClick={(event) => {
										event.stopPropagation();
										onDelete(user);
									}}
									aria-label={t('table.actions.delete')}
								>
									<IconTrash size={16} />
								</ActionIcon>
							</Tooltip>
						</Group>
					);
				},
			},
		],
		[onDelete, onEdit, onView, t]
	);
};

export default useUsersColumns;
