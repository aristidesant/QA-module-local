import { useMemo } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import {
	ActionIcon,
	Badge,
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
	IconShield,
	IconTrash,
} from '@tabler/icons-react';
import { timeAgo } from '~/utils/dateUtils';
import type { RoleModel } from '~/models/RoleModel';
import classes from '../RolesList/RolesList.module.css';

interface UseRolesColumnsParams {
	onView: (roleId: number) => void;
	onEdit: (roleId: number) => void;
	onDelete: (role: RoleModel) => void;
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

const useRolesColumns = ({
	onView,
	onEdit,
	onDelete,
}: UseRolesColumnsParams): ColumnDef<RoleModel>[] =>
	useMemo(
		() => [
			{
				id: 'name',
				header: 'Name',
				cell: ({ row }) => {
					const role = row.original;

					return (
						<Group gap='xs' align='center'>
							<HoverCard width={280} shadow='md'>
								<HoverCard.Target>
									<ActionIcon variant='subtle' size='sm'>
										<IconInfoCircle size={14} />
									</ActionIcon>
								</HoverCard.Target>
								<HoverCard.Dropdown>
									<Stack gap='xs'>
										<Text fz='xs'>
											<strong>Code:</strong> {role.code}
										</Text>
										{role.description && (
											<Text fz='xs'>
												<strong>Description:</strong> {role.description}
											</Text>
										)}
										<Text fz='xs'>
											<strong>Created:</strong> {formatDateTime(role.createdAt)}
										</Text>
									</Stack>
								</HoverCard.Dropdown>
							</HoverCard>
							<Group gap='xs'>
								<Text fz='sm' fw={500}>
									{role.name}
								</Text>
								{role.isSystem && (
									<Badge
										variant='light'
										color='grape'
										size='xs'
										leftSection={<IconShield size={10} />}
										className={classes.systemBadge}
									>
										System
									</Badge>
								)}
							</Group>
						</Group>
					);
				},
			},
			{
				accessorKey: 'code',
				header: 'Code',
				cell: ({ getValue }) => {
					const value = getValue<string>();
					return (
						<Text fz='xs' c='dimmed' ff='monospace'>
							{value}
						</Text>
					);
				},
			},
			{
				id: 'status',
				header: 'Status',
				cell: ({ row }) => {
					const role = row.original;
					return (
						<Badge
							variant='light'
							color={role.isActive ? 'green' : 'gray'}
							size='sm'
							className={classes.statusBadge}
						>
							{role.isActive ? 'Active' : 'Inactive'}
						</Badge>
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
					const role = row.original;

					return (
						<Group gap='xs' justify='flex-end' wrap='nowrap'>
							<Tooltip label='View role' withArrow>
								<ActionIcon
									onClick={(event) => {
										event.stopPropagation();
										onView(role.id);
									}}
									aria-label='View role'
								>
									<IconEye size={16} />
								</ActionIcon>
							</Tooltip>
							<Tooltip label='Edit role' withArrow>
								<ActionIcon
									onClick={(event) => {
										event.stopPropagation();
										onEdit(role.id);
									}}
									aria-label='Edit role'
								>
									<IconPencil size={16} />
								</ActionIcon>
							</Tooltip>
							<Tooltip
								label={
									role.isSystem
										? 'System roles cannot be deleted'
										: 'Delete role'
								}
								withArrow
							>
								<ActionIcon
									color='red'
									onClick={(event) => {
										event.stopPropagation();
										onDelete(role);
									}}
									aria-label='Delete role'
									disabled={role.isSystem}
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

export default useRolesColumns;
