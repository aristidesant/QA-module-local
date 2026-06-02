import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Badge, ActionIcon, Loader, Menu, Text, Tooltip } from '@mantine/core';
import {
	IconCopy,
	IconInfoCircle,
	IconListDetails,
	IconPencil,
	IconRefresh,
	IconBan,
	IconDotsVertical,
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
	onCopyJson: (catalog: DispositionCatalogModel) => void;
	onReactivate: (catalog: DispositionCatalogModel) => void;
	onDeactivate: (catalog: DispositionCatalogModel) => void;
	copyState: {
		isPending: boolean;
		variables: { catalogId: number | string } | undefined;
	};
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
	onCopyJson,
	onReactivate,
	onDeactivate,
	copyState,
	reactivateState,
	deactivateState,
}: UseDispositionCatalogTableColumnsProps) => {
	const { t } = useTranslation('outcomes');
	const { canPerformAction } = usePermissions();

	const canUpdate = useMemo(
		() => canPerformAction(ModuleEnum.SETTINGS, PermissionEnum.UPDATE),
		[canPerformAction]
	);

	const renderTypeBadge = (type?: DispositionCatalogModel['type']) =>
		type ? (
			<Badge
				size='xs'
				variant='light'
				color={type === 'INBOUND' ? 'blue' : 'green'}
			>
				{type === 'INBOUND'
					? t('columns.typeInbound')
					: t('columns.typeOutbound')}
			</Badge>
		) : null;

	return useMemo<ColumnDef<DispositionCatalogModel>[]>(
		() => [
			{
				id: 'name',
				accessorKey: 'name',
				size: 320,
				header: t('columns.name'),
				cell: ({ row }) => {
					const name = row.original.name;
					const description = row.original.description;
					return (
						<div className={styles.nameCell}>
							<div className={styles.nameRow}>
								<Text size='sm' fw={600} className={styles.nameText}>
									{name}
								</Text>
								{description ? (
									<Tooltip
										label={description}
										withArrow
										multiline
										withinPortal
										openDelay={150}
										events={{ hover: true, focus: true, touch: true }}
									>
										<ActionIcon
											variant='subtle'
											color='gray'
											size='xs'
											aria-label={t('columns.descriptionInfo')}
										>
											<IconInfoCircle size={13} />
										</ActionIcon>
									</Tooltip>
								) : null}
							</div>
						</div>
					);
				},
			},
			{
				id: 'type',
				header: t('columns.type'),
				accessorKey: 'type',
				size: 120,
				enableSorting: false,
				cell: ({ row }) => (
					<div className={styles.typeCell}>
						{renderTypeBadge(row.original.type)}
					</div>
				),
			},
			{
				id: 'status',
				header: t('columns.status'),
				accessorKey: 'isActive',
				size: 120,
				enableSorting: false,
				cell: ({ row }) => (
					<span
						className={
							row.original.isActive
								? styles.statusBadgeActive
								: styles.statusBadgeInactive
						}
					>
						<span className={styles.statusDot} />
						{row.original.isActive
							? t('status.active', { ns: 'common' })
							: t('status.inactive', { ns: 'common' })}
					</span>
				),
			},
			{
				id: 'actions',
				header: t('columns.actions'),
				size: 88,
				meta: {
					headerClassName: styles.actionsHeader,
					cellClassName: styles.actionsCell,
				},
				cell: ({ row }) => (
					<Menu shadow='sm' position='bottom-end' withArrow withinPortal>
						<Menu.Target>
							<ActionIcon
								variant='subtle'
								color='gray'
								size='sm'
								onClick={(event) => event.stopPropagation()}
								aria-label={t('columns.actions')}
							>
								<IconDotsVertical size={15} />
							</ActionIcon>
						</Menu.Target>
						<Menu.Dropdown onClick={(event) => event.stopPropagation()}>
							<Menu.Item
								leftSection={<IconListDetails size={14} />}
								onClick={() => onEditNodes(row.original)}
							>
								{t('columns.editNodes')}
							</Menu.Item>
							<Menu.Item
								leftSection={
									copyState.isPending &&
									copyState.variables?.catalogId === row.original.id ? (
										<Loader size={12} />
									) : (
										<IconCopy size={14} />
									)
								}
								onClick={() => onCopyJson(row.original)}
								disabled={!row.original.isActive}
							>
								{t('columns.copyJson')}
							</Menu.Item>
							{canUpdate && (
								<>
									<Menu.Divider />
									<Menu.Item
										leftSection={<IconPencil size={14} />}
										onClick={() => onEditDetails(row.original)}
									>
										{t('columns.editDetails')}
									</Menu.Item>
									{row.original.isActive ? (
										<Menu.Item
											color='red'
											leftSection={
												deactivateState.isPending &&
												deactivateState.variables?.catalogId ===
													row.original.id ? (
													<Loader size={12} />
												) : (
													<IconBan size={14} />
												)
											}
											onClick={() => onDeactivate(row.original)}
											disabled={
												deactivateState.isPending &&
												deactivateState.variables?.catalogId === row.original.id
											}
										>
											{t('columns.deactivate')}
										</Menu.Item>
									) : (
										<Menu.Item
											color='green'
											leftSection={
												reactivateState.isPending &&
												reactivateState.variables?.catalogId ===
													row.original.id ? (
													<Loader size={12} />
												) : (
													<IconRefresh size={14} />
												)
											}
											onClick={() => onReactivate(row.original)}
											disabled={
												reactivateState.isPending &&
												reactivateState.variables?.catalogId === row.original.id
											}
										>
											{t('columns.reactivate')}
										</Menu.Item>
									)}
								</>
							)}
						</Menu.Dropdown>
					</Menu>
				),
				enableSorting: false,
			},
		],
		[
			onEditNodes,
			onEditDetails,
			onCopyJson,
			onReactivate,
			onDeactivate,
			copyState,
			reactivateState,
			deactivateState,
			canUpdate,
			t,
		]
	);
};
