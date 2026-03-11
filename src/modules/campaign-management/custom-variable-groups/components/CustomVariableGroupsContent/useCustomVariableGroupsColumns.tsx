import { useMemo } from 'react';
import { ActionIcon, Badge, Group, Text, Tooltip } from '@mantine/core';
import { IconCopy, IconEdit, IconLink, IconTrash } from '@tabler/icons-react';
import type { ColumnDef } from '@tanstack/react-table';
import { useTranslation } from 'react-i18next';
import usePermissions from '~/hooks/usePermissions';
import { ModuleEnum } from '~/constants/ModuleEnum';
import { PermissionEnum } from '~/constants/PermissionEnum';
import type { CustomVariableTemplate } from '~/models/CustomVariableModel';
import styles from './CustomVariableGroupsContent.module.css';

interface UseCustomVariableGroupsColumnsProps {
	onEdit: (template: CustomVariableTemplate) => void;
	onDelete: (template: CustomVariableTemplate) => void;
	onClone: (template: CustomVariableTemplate) => void;
	onAssign: (template: CustomVariableTemplate) => void;
	isDeletePending: boolean;
	selectedTemplateId: number | null;
	onSelectTemplate: (templateId: number) => void;
}

export const useCustomVariableGroupsColumns = ({
	onEdit,
	onDelete,
	onClone,
	onAssign,
	isDeletePending,
	selectedTemplateId,
	onSelectTemplate,
}: UseCustomVariableGroupsColumnsProps) => {
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
	const canCreate = canPerformAction(
		ModuleEnum.SETTINGS,
		PermissionEnum.CREATE
	);

	return useMemo<ColumnDef<CustomVariableTemplate>[]>(
		() => [
			{
				accessorKey: 'name',
				header: t('customVariables.groups.table.headers.name'),
				cell: ({ row }) => {
					const isSelected = selectedTemplateId === row.original.id;
					return (
						<div className={styles.nameCell}>
							<Text size='sm' fw={600}>
								{row.original.name}
							</Text>
							<Group gap={6}>
								{row.original.clientId === null && (
									<Badge size='xs' variant='light' color='blue'>
										{t('customVariables.groups.badges.global')}
									</Badge>
								)}
								{row.original.campaignId && (
									<Badge size='xs' variant='light' color='teal'>
										{t('customVariables.groups.badges.campaignBound')}
									</Badge>
								)}
								{row.original.sourceTemplateId && (
									<Badge size='xs' variant='light' color='grape'>
										{t('customVariables.groups.badges.cloned')}
									</Badge>
								)}
								{isSelected && (
									<Badge size='xs' variant='filled' color='dark'>
										{t('customVariables.groups.badges.selected')}
									</Badge>
								)}
							</Group>
						</div>
					);
				},
			},
			{
				accessorKey: 'campaignId',
				header: t('customVariables.groups.table.headers.campaignId'),
				cell: ({ row }) => (
					<Text size='sm'>{row.original.campaignId ?? '--'}</Text>
				),
			},
			{
				accessorKey: 'sourceTemplateId',
				header: t('customVariables.groups.table.headers.sourceTemplateId'),
				cell: ({ row }) => (
					<Text size='sm'>{row.original.sourceTemplateId ?? '--'}</Text>
				),
			},
			{
				id: 'actions',
				header: t('customVariables.groups.table.headers.actions'),
				cell: ({ row }) => (
					<Group gap='xs' wrap='nowrap'>
						<Tooltip
							label={t('customVariables.groups.table.actions.select')}
							withArrow
						>
							<ActionIcon
								variant='light'
								color='indigo'
								size='sm'
								onClick={() => onSelectTemplate(row.original.id)}
							>
								<IconLink size={14} />
							</ActionIcon>
						</Tooltip>
						{canUpdate && (
							<Tooltip
								label={t('customVariables.groups.table.actions.edit')}
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
						{canCreate && (
							<>
								<Tooltip
									label={t('customVariables.groups.table.actions.clone')}
									withArrow
								>
									<ActionIcon
										variant='light'
										color='violet'
										size='sm'
										onClick={() => onClone(row.original)}
									>
										<IconCopy size={14} />
									</ActionIcon>
								</Tooltip>
								<Tooltip
									label={t(
										'customVariables.groups.table.actions.assignCampaign'
									)}
									withArrow
								>
									<ActionIcon
										variant='light'
										color='teal'
										size='sm'
										onClick={() => onAssign(row.original)}
									>
										<IconLink size={14} />
									</ActionIcon>
								</Tooltip>
							</>
						)}
						{canDelete && (
							<Tooltip
								label={t('customVariables.groups.table.actions.delete')}
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
		[
			t,
			canUpdate,
			canDelete,
			canCreate,
			onSelectTemplate,
			onEdit,
			onClone,
			onAssign,
			onDelete,
			isDeletePending,
			selectedTemplateId,
		]
	);
};
