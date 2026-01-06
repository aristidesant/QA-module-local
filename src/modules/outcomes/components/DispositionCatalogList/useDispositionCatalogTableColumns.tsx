import { useMemo } from 'react';
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
				header: 'Name',
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
				header: 'Status',
				accessorKey: 'isActive',
				enableSorting: false,
				cell: ({ row }) => (
					<Badge
						size='sm'
						variant='dot'
						color={row.original.isActive ? 'green' : 'gray'}
					>
						{row.original.isActive ? 'Active' : 'Inactive'}
					</Badge>
				),
			},
			{
				accessorKey: 'createdAt',
				header: 'Created At',
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
				header: 'Actions',
				cell: ({ row }) => (
					<Group gap='xs'>
						<Tooltip label='Edit nodes' withArrow>
							<ActionIcon
								variant='light'
								size='sm'
								onClick={(e) => {
									e.stopPropagation();
									onEditNodes(row.original);
								}}
								aria-label='Edit nodes'
							>
								<IconListDetails size={16} />
							</ActionIcon>
						</Tooltip>
						{canUpdate && (
							<Tooltip label='Edit details' withArrow>
								<ActionIcon
									variant='light'
									size='sm'
									onClick={(e) => {
										e.stopPropagation();
										onEditDetails(row.original);
									}}
									aria-label='Edit details'
								>
									<IconPencil size={16} />
								</ActionIcon>
							</Tooltip>
						)}
						{canUpdate && !row.original.isActive && (
							<Tooltip label='Reactivate' withArrow>
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
									aria-label='Reactivate'
								>
									<IconRefresh size={16} />
								</ActionIcon>
							</Tooltip>
						)}
						{canUpdate && row.original.isActive && (
							<Tooltip label='Deactivate' withArrow>
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
									aria-label='Deactivate'
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
		]
	);
};
