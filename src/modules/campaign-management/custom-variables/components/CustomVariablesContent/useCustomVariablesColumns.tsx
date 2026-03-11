import { useMemo } from 'react';
import { ActionIcon, Badge, Group, Text, Tooltip } from '@mantine/core';
import { IconEdit, IconTrash } from '@tabler/icons-react';
import type { ColumnDef } from '@tanstack/react-table';
import { useTranslation } from 'react-i18next';
import usePermissions from '~/hooks/usePermissions';
import { ModuleEnum } from '~/constants/ModuleEnum';
import { PermissionEnum } from '~/constants/PermissionEnum';
import type { CustomVariable } from '~/models/CustomVariableModel';

interface UseCustomVariablesColumnsProps {
	onEdit: (variable: CustomVariable) => void;
	onDelete: (variable: CustomVariable) => void;
	isDeletePending: boolean;
}

export const useCustomVariablesColumns = ({
	onEdit,
	onDelete,
	isDeletePending,
}: UseCustomVariablesColumnsProps) => {
	const { t } = useTranslation('campaign-management');
	const { canPerformAction } = usePermissions();

	const canUpdate = canPerformAction(
		ModuleEnum.SETTINGS,
		PermissionEnum.UPDATE
	);
	const canDelete = canPerformAction(
		ModuleEnum.SETTINGS,
		PermissionEnum.DELETE
	);

	return useMemo<ColumnDef<CustomVariable>[]>(
		() => [
			{
				accessorKey: 'label',
				header: t('customVariables.variables.table.headers.label'),
				cell: ({ row }) => (
					<div>
						<Text size='sm'>{row.original.label || row.original.name}</Text>
						<Text size='xs' c='dimmed' ff='monospace'>
							{row.original.name}
						</Text>
					</div>
				),
			},
			{
				accessorKey: 'categoryId',
				header: t('customVariables.variables.table.headers.categoryId'),
				cell: ({ row }) => (
					<Text size='sm'>{row.original.categoryId ?? '--'}</Text>
				),
			},
			{
				id: 'type',
				header: t('customVariables.variables.table.headers.type'),
				cell: ({ row }) => (
					<Badge size='xs' variant='light' color='blue'>
						{row.original.value.type}
					</Badge>
				),
			},
			{
				id: 'valueType',
				header: t('customVariables.variables.table.headers.valueType'),
				cell: ({ row }) => (
					<Badge size='xs' variant='light' color='grape'>
						{row.original.value.value_type || '--'}
					</Badge>
				),
			},
			{
				id: 'actions',
				header: t('customVariables.variables.table.headers.actions'),
				cell: ({ row }) => (
					<Group gap='xs' wrap='nowrap'>
						{canUpdate && (
							<Tooltip
								label={t('customVariables.variables.table.actions.edit')}
								withArrow
							>
								<ActionIcon
									variant='light'
									color='blue'
									size='sm'
									onClick={() => onEdit(row.original)}
								>
									<IconEdit size={14} />
								</ActionIcon>
							</Tooltip>
						)}
						{canDelete && (
							<Tooltip
								label={t('customVariables.variables.table.actions.delete')}
								withArrow
							>
								<ActionIcon
									variant='light'
									color='red'
									size='sm'
									onClick={() => onDelete(row.original)}
									loading={isDeletePending}
								>
									<IconTrash size={14} />
								</ActionIcon>
							</Tooltip>
						)}
					</Group>
				),
			},
		],
		[t, canUpdate, canDelete, onEdit, onDelete, isDeletePending]
	);
};
