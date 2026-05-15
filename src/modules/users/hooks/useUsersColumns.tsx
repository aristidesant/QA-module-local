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
import { IconInfoCircle, IconPencil, IconTrash } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { timeAgo } from '~/utils/dateUtils';
import type { UserModel } from '~/models/UserModels';
import classes from '../UsersList/UsersList.module.css';

interface UseUsersColumnsParams {
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
						<Group gap='xs' align='flex-start' wrap='nowrap'>
							<HoverCard width={280} shadow='md' openDelay={200}>
								<HoverCard.Target>
									<ActionIcon variant='subtle' color='gray' size='xs' mt={2}>
										<IconInfoCircle size={13} />
									</ActionIcon>
								</HoverCard.Target>
								<HoverCard.Dropdown>
									<Stack gap='xs'>
										<Text fz='xs'>
											<strong>{t('table.user.usernameLabel')}:</strong>{' '}
											{user.username}
										</Text>
										<Text fz='xs'>
											<strong>{t('table.user.emailLabel')}:</strong>{' '}
											{user.email}
										</Text>
										<Text fz='xs'>
											<strong>{t('table.user.createdLabel')}:</strong>{' '}
											{formatDateTime(user.createdAt)}
										</Text>
									</Stack>
								</HoverCard.Dropdown>
							</HoverCard>
							<div className={classes.nameCell}>
								<Text fz='sm' fw={600} className={classes.nameText}>
									{name}
								</Text>
								<Text fz='xs' c='dimmed' className={classes.nameEmail}>
									{user.email}
								</Text>
							</div>
						</Group>
					);
				},
			},
			{
				accessorKey: 'status',
				header: t('columns.status'),
				cell: ({ getValue }) => {
					const value = getValue<string | null | undefined>();
					const statusKey = value?.toLowerCase?.() ?? '';
					const label = statusKey
						? t(`status.${statusKey}`, { defaultValue: value ?? '—' })
						: '—';
					const statusClass =
						classes[`status_${statusKey}`] ?? classes.status_inactive;

					return (
						<span className={statusClass}>
							<span className={classes.statusDot} />
							{label}
						</span>
					);
				},
			},
			{
				accessorKey: 'lastLogin',
				header: t('columns.lastLogin'),
				enableSorting: false,
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
						<Group
							gap={4}
							justify='flex-end'
							wrap='nowrap'
							className={classes.actionsGroup}
						>
							<Tooltip label={t('table.actions.edit')} withArrow>
								<ActionIcon
									variant='subtle'
									color='gray'
									size='sm'
									onClick={(event) => {
										event.stopPropagation();
										onEdit(user.id);
									}}
									aria-label={t('table.actions.edit')}
								>
									<IconPencil size={15} />
								</ActionIcon>
							</Tooltip>
							<Tooltip label={t('table.actions.delete')} withArrow>
								<ActionIcon
									variant='subtle'
									color='red'
									size='sm'
									onClick={(event) => {
										event.stopPropagation();
										onDelete(user);
									}}
									aria-label={t('table.actions.delete')}
								>
									<IconTrash size={15} />
								</ActionIcon>
							</Tooltip>
						</Group>
					);
				},
			},
		],
		[onDelete, onEdit, t]
	);
};

export default useUsersColumns;
