import { useMemo } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { ActionIcon, Group, HoverCard, Menu, Stack, Text } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import {
	IconDotsVertical,
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

function dateTooltip(iso?: string | Date | null) {
	if (!iso) return '—';
	const date = typeof iso === 'string' ? new Date(iso) : iso;
	if (Number.isNaN(date.getTime())) return '—';
	return date.toLocaleString(undefined, {
		year: 'numeric',
		month: 'short',
		day: 'numeric',
		hour: '2-digit',
		minute: '2-digit',
	});
}

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
					return (
						<Text fz='sm' title={dateTooltip(value)}>
							{value ? timeAgo(value) : '—'}
						</Text>
					);
				},
				size: 100,
			},
			{
				id: 'actions',
				header: t('columns.actions'),
				cell: ({ row }) => {
					const role = row.original;

					return (
						<Group justify='flex-end' onClick={(e) => e.stopPropagation()}>
							<Menu shadow='sm' position='bottom-end' withinPortal>
								<Menu.Target>
									<ActionIcon
										variant='subtle'
										size='sm'
										aria-label={t('columns.actions')}
									>
										<IconDotsVertical size={15} />
									</ActionIcon>
								</Menu.Target>
								<Menu.Dropdown>
									<Menu.Item
										leftSection={<IconEye size={15} stroke={1.5} />}
										onClick={() => onView(role.id)}
									>
										{t('table.actions.view')}
									</Menu.Item>
									<Menu.Item
										leftSection={<IconPencil size={15} stroke={1.5} />}
										onClick={() => onEdit(role.id)}
									>
										{t('table.actions.edit')}
									</Menu.Item>
									<Menu.Divider />
									<Menu.Item
										leftSection={<IconTrash size={15} stroke={1.5} />}
										color='red'
										disabled={role.isSystem}
										onClick={() => onDelete(role)}
									>
										{role.isSystem
											? t('table.actions.deleteDisabled')
											: t('table.actions.delete')}
									</Menu.Item>
								</Menu.Dropdown>
							</Menu>
						</Group>
					);
				},
				size: 60,
			},
		],
		[onDelete, onEdit, onView, t]
	);
};
export default useRolesColumns;
