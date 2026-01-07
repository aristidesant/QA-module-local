import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Text, Badge, Group, Tooltip, ActionIcon } from '@mantine/core';
import {
	IconListDetails,
	IconPencil,
	IconRefresh,
	IconBan,
} from '@tabler/icons-react';
import { type ColumnDef } from '@tanstack/react-table';
import type { DispositionCatalogModel } from '~/models/DispositionCatalogModels';
import usePermissions from '~/hooks/usePermissions';
import { ModuleEnum } from '~/constants/ModuleEnum';
import { PermissionEnum } from '~/constants/PermissionEnum';
import styles from './DispositionCatalogList.module.css';

type UseDispositionCatalogTableColumnsProps = {
	onEditNodes: (catalog: DispositionCatalogModel) => void;
	onEditDetails: (catalog: DispositionCatalogModel) => void;
	onReactivate: (catalog: DispositionCatalogModel) => void;
	onDeactivate: (catalog: DispositionCatalogModel) => void;
	reactivateState: {
		isPending: boolean;
		variables: { catalogId: number } | undefined;
	};
	deactivateState: {
		isPending: boolean;
		variables: { catalogId: number } | undefined;
	};
};

export const useDispositionCatalogTableColumns = ({
	onEditNodes,
	onEditDetails,
	onReactivate,
	onDeactivate,
	reactivateState,
	deactivateState,
}: UseDispositionCatalogTableColumnsProps) => {
	const { t } = useTranslation('outcomes');
	const { canPerformAction } = usePermissions();

	const canUpdate = useMemo(
		() => canPerformAction(ModuleEnum.SETTINGS, PermissionEnum.UPDATE),
		[canPerformAction]
	);

	return useMemo<ColumnDef<DispositionCatalogModel>[]>(
		() => [
			{
				id: 'name',
				accessorKey: 'name',
				header: t('columns.name'),
				cell: ({ row }) => {
					const name = row.original.name;
					const description = row.original.description;
					const type = row.original.type;
					return (
						<div className={styles.nameCell}>
							<div className={styles.nameRow}>
								<Text size='sm' fw={600} className={styles.nameText}>
									{name}
								</Text>
								{type && (
									<div className={styles.typeBadge}>
										<Badge
											size='xs'
											variant='light'
											color={type === 'INBOUND' ? 'blue' : 'green'}
										>
											{type}
										</Badge>
									</div>
								)}
							</div>
							{description && (
								<Text size='sm' c='dimmed' className={styles.descriptionText}>
									{description}
								</Text>
							)}
						</div>
					);
				},
			},
			{
				id: 'status',
				header: t('columns.status'),
				accessorKey: 'isActive',
				enableSorting: false,
				cell: ({ row }) => (
					<Badge
						size='sm'
						variant='dot'
						color={row.original.isActive ? 'green' : 'gray'}
					>
						{row.original.isActive
							? t('status.active', { ns: 'common' })
							: t('status.inactive', { ns: 'common' })}
					</Badge>
				),
			},
			{
				accessorKey: 'createdAt',
				header: t('columns.createdAt'),
				cell: (info) => (
					<Text size='sm'>
						{info.getValue()
							? new Date(info.getValue() as string).toLocaleString()
							: '-'}
					</Text>
				),
			},
			{
				id: 'actions',
				header: t('columns.actions'),
				cell: ({ row }) => (
					<Group gap='xs'>
						<Tooltip label={t('columns.editNodes')} withArrow>
							<ActionIcon
								variant='light'
								size='sm'
								onClick={(e) => {
									e.stopPropagation();
									onEditNodes(row.original);
								}}
								aria-label={t('columns.editNodes')}
							>
								<IconListDetails size={16} />
							</ActionIcon>
						</Tooltip>
						{canUpdate && (
							<Tooltip label={t('columns.editDetails')} withArrow>
								<ActionIcon
									variant='light'
									size='sm'
									onClick={(e) => {
										e.stopPropagation();
										onEditDetails(row.original);
									}}
									aria-label={t('columns.editDetails')}
								>
									<IconPencil size={16} />
								</ActionIcon>
							</Tooltip>
						)}
						{canUpdate && !row.original.isActive && (
							<Tooltip label={t('columns.reactivate')} withArrow>
								<ActionIcon
									color='green'
									variant='light'
									size='sm'
									onClick={(e) => {
										e.stopPropagation();
										onReactivate(row.original);
									}}
									loading={
										reactivateState.isPending &&
										reactivateState.variables?.catalogId === row.original.id
									}
									aria-label={t('columns.reactivate')}
								>
									<IconRefresh size={16} />
								</ActionIcon>
							</Tooltip>
						)}
						{canUpdate && row.original.isActive && (
							<Tooltip label={t('columns.deactivate')} withArrow>
								<ActionIcon
									color='orange'
									variant='light'
									size='sm'
									onClick={(e) => {
										e.stopPropagation();
										onDeactivate(row.original);
									}}
									loading={
										deactivateState.isPending &&
										deactivateState.variables?.catalogId === row.original.id
									}
									aria-label={t('columns.deactivate')}
								>
									<IconBan size={16} />
								</ActionIcon>
							</Tooltip>
						)}
					</Group>
				),
				enableSorting: false,
			},
		],
		[
			onEditNodes,
			onEditDetails,
			onReactivate,
			onDeactivate,
			reactivateState,
			deactivateState,
			canUpdate,
			t,
		]
	);
};
