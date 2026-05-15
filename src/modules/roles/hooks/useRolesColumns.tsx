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
import { useTranslation } from 'react-i18next';
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
}: UseRolesColumnsParams): ColumnDef<RoleModel>[] => {
	const { t } = useTranslation('roles');

	return useMemo(
		() => [
			{
				id: 'name',
				header: t('columns.name'),
				cell: ({ row }) => {
					const role = row.original;

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
											<strong>{t('table.role.codeLabel')}:</strong> {role.code}
										</Text>
										{role.description && (
											<Text fz='xs'>
												<strong>{t('table.role.descriptionLabel')}:</strong>{' '}
												{role.description}
											</Text>
										)}
										<Text fz='xs'>
											<strong>{t('table.role.createdLabel')}:</strong>{' '}
											{formatDateTime(role.createdAt)}
										</Text>
									</Stack>
								</HoverCard.Dropdown>
							</HoverCard>
							<div className={classes.nameCell}>
								<div className={classes.nameRow}>
									<Text fz='sm' fw={600} className={classes.nameText}>
										{role.name}
									</Text>
									{role.isSystem && (
										<span className={classes.systemBadge}>
											<IconShield size={10} />
											{t('table.role.systemBadge')}
										</span>
									)}
								</div>
								<Text
									fz='xs'
									c='dimmed'
									className={classes.nameDescription}
									fs={role.description ? undefined : 'italic'}
								>
									{role.description || t('table.role.noDescription')}
								</Text>
							</div>
						</Group>
					);
				},
			},
			{
				accessorKey: 'code',
				header: t('columns.code'),
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
				header: t('columns.status'),
				cell: ({ row }) => {
					const role = row.original;
					return (
						<span
							className={
								role.isActive ? classes.statusActive : classes.statusInactive
							}
						>
							<span className={classes.statusDot} />
							{role.isActive ? t('status.active') : t('status.inactive')}
						</span>
					);
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
				cell: ({ row }) => {
					const role = row.original;

					return (
						<Group gap={4} wrap='nowrap' className={classes.actionsGroup}>
							<Tooltip label={t('table.actions.view')} withArrow>
								<ActionIcon
									variant='subtle'
									color='gray'
									size='sm'
									onClick={(event) => {
										event.stopPropagation();
										onView(role.id);
									}}
									aria-label={t('table.actions.view')}
								>
									<IconEye size={15} />
								</ActionIcon>
							</Tooltip>
							<Tooltip label={t('table.actions.edit')} withArrow>
								<ActionIcon
									variant='subtle'
									color='gray'
									size='sm'
									onClick={(event) => {
										event.stopPropagation();
										onEdit(role.id);
									}}
									aria-label={t('table.actions.edit')}
								>
									<IconPencil size={15} />
								</ActionIcon>
							</Tooltip>
							<Tooltip
								label={
									role.isSystem
										? t('table.actions.deleteDisabled')
										: t('table.actions.delete')
								}
								withArrow
							>
								<ActionIcon
									variant='subtle'
									color='red'
									size='sm'
									onClick={(event) => {
										event.stopPropagation();
										onDelete(role);
									}}
									aria-label={t('table.actions.delete')}
									disabled={role.isSystem}
								>
									<IconTrash size={15} />
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
export default useRolesColumns;
