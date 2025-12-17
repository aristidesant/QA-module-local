import {
	useMemo,
	useState,
	forwardRef,
	useImperativeHandle,
	useCallback,
	useEffect,
	useRef,
} from 'react';
import {
	Loader,
	Center,
	Text,
	Group,
	ActionIcon,
	Tooltip,
	Pagination,
	Badge,
	Button,
	Modal,
	LoadingOverlay,
} from '@mantine/core';
import {
	IconTrash,
	IconRefresh,
	IconBan,
	IconPlus,
	IconDatabase,
	IconListDetails,
	IconPencil,
} from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { modals } from '@mantine/modals';
import { useDispositionLabel } from '~/hooks/useDispositionLabel';
import {
	useDispositionCatalogs,
	useCreateDispositionCatalog,
	useUpdateDispositionCatalog,
	useDeleteDispositionCatalog,
	useReactivateDispositionCatalog,
	useDeactivateDispositionCatalog,
} from '~/queries/dispositionCatalogQueries';
import DispositionCatalogForm from '../DispositionCatalogForm';
import EmptyState from '~/components/EmptyState';
import { type ColumnDef } from '@tanstack/react-table';
import type { DispositionCatalogModel } from '~/models/DispositionCatalogModels';
import styles from './DispositionCatalogList.module.css';
import BaseTable from '~/components/BaseTable';
import SectionCard from '~/components/SectionCard/SectionCard';
import { useDispositionStore } from '../../dispositionRightComponentStore';

export interface DispositionCatalogListHandles {
	openCreateForm: () => void;
}

type DispositionCatalogListProps = {
	onEditNodes?: (catalog: DispositionCatalogModel) => void;
};

const DispositionCatalogList = forwardRef<
	DispositionCatalogListHandles,
	DispositionCatalogListProps
>(({ onEditNodes }, ref) => {
	const { data, isLoading, isError, isFetching } = useDispositionCatalogs();
	const setCatalog = useDispositionStore((state) => state.setCatalog);
	const clearCatalog = useDispositionStore((state) => state.clearCatalog);
	const selectedCatalogId = useDispositionStore(
		(state) => state.catalog?.id ?? null
	);
	const createMutation = useCreateDispositionCatalog();
	const updateMutation = useUpdateDispositionCatalog();
	const deleteMutation = useDeleteDispositionCatalog();
	const reactivateMutation = useReactivateDispositionCatalog();
	const deactivateMutation = useDeactivateDispositionCatalog();
	const dispositionLabel = useDispositionLabel();

	const [isModalOpen, setIsModalOpen] = useState(false);
	const [selectedCatalog, setSelectedCatalog] =
		useState<DispositionCatalogModel | null>(null);

	// Pagination state - must be declared before any early returns
	const [page, setPage] = useState(1);
	const pageSize = 10;

	const selectedCatalogIdRef = useRef<number | null>(selectedCatalogId);
	useEffect(() => {
		selectedCatalogIdRef.current = selectedCatalogId;
	}, [selectedCatalogId]);

	type CatalogIdVariables = { catalogId: number } | undefined;
	type DeleteVariables = { id: number } | undefined;

	const reactivateStateRef = useRef<{
		isPending: boolean;
		variables: CatalogIdVariables;
	}>({ isPending: false, variables: undefined });
	reactivateStateRef.current = {
		isPending: reactivateMutation.isPending,
		variables: reactivateMutation.variables as CatalogIdVariables,
	};

	const deactivateStateRef = useRef<{
		isPending: boolean;
		variables: CatalogIdVariables;
	}>({ isPending: false, variables: undefined });
	deactivateStateRef.current = {
		isPending: deactivateMutation.isPending,
		variables: deactivateMutation.variables as CatalogIdVariables,
	};

	const deleteStateRef = useRef<{
		isPending: boolean;
		variables: DeleteVariables;
	}>({ isPending: false, variables: undefined });
	deleteStateRef.current = {
		isPending: deleteMutation.isPending,
		variables: deleteMutation.variables as DeleteVariables,
	};

	const handleSelectCatalog = useCallback(
		(catalog: DispositionCatalogModel) => {
			setCatalog(catalog);
			onEditNodes?.(catalog);
		},
		[onEditNodes, setCatalog]
	);

	const handleEditDetails = useCallback((catalog: DispositionCatalogModel) => {
		setSelectedCatalog(catalog);
		setIsModalOpen(true);
	}, []);

	const handleReactivate = useCallback(
		(catalog: DispositionCatalogModel) => {
			modals.openConfirmModal({
				title: dispositionLabel('Reactivate Outcome Catalog'),
				labels: {
					confirm: dispositionLabel('Reactivate'),
					cancel: dispositionLabel('Cancel'),
				},
				children: (
					<Text size='sm'>
						{dispositionLabel(
							'Are you sure you want to reactivate this outcome catalog? It will become available for campaign configuration again.'
						)}
					</Text>
				),
				confirmProps: { color: 'green' },
				onConfirm: () => {
					reactivateMutation.mutate(
						{ catalogId: catalog.id },
						{
							onSuccess: () => {
								notifications.show({
									title: dispositionLabel('Catalog reactivated'),
									message: dispositionLabel(
										'Outcome catalog was reactivated successfully.'
									),
									color: 'green',
								});
							},
							onError: (error: any) => {
								notifications.show({
									title: dispositionLabel('Reactivation failed'),
									message: dispositionLabel(
										error?.message || 'Failed to reactivate outcome catalog.'
									),
									color: 'red',
								});
							},
						}
					);
				},
			});
		},
		[dispositionLabel, reactivateMutation]
	);

	const handleDeactivate = useCallback(
		(catalog: DispositionCatalogModel) => {
			modals.openConfirmModal({
				title: dispositionLabel('Deactivate Outcome Catalog'),
				labels: {
					confirm: dispositionLabel('Deactivate'),
					cancel: dispositionLabel('Cancel'),
				},
				children: (
					<Text size='sm'>
						{dispositionLabel(
							'Are you sure you want to deactivate this outcome catalog and all its nodes? They will no longer be available for campaign configuration.'
						)}
					</Text>
				),
				confirmProps: { color: 'red' },
				onConfirm: () => {
					deactivateMutation.mutate(
						{ catalogId: catalog.id },
						{
							onSuccess: () => {
								notifications.show({
									title: dispositionLabel('Catalog deactivated'),
									message: dispositionLabel(
										'Outcome catalog was deactivated successfully.'
									),
									color: 'blue',
								});
							},
							onError: (error: any) => {
								notifications.show({
									title: dispositionLabel('Deactivation failed'),
									message: dispositionLabel(
										error?.message || 'Failed to deactivate outcome catalog.'
									),
									color: 'red',
								});
							},
						}
					);
				},
			});
		},
		[deactivateMutation, dispositionLabel]
	);

	const handleDelete = useCallback(
		(catalog: DispositionCatalogModel) => {
			deleteMutation.mutate(
				{ id: catalog.id },
				{
					onSuccess: () => {
						if (selectedCatalogIdRef.current === catalog.id) {
							clearCatalog();
						}
						notifications.show({
							title: 'Catalog deleted',
							message: dispositionLabel(
								'Outcome catalog was deleted successfully.'
							),
							color: 'teal',
						});
					},
					onError: (error: any) => {
						notifications.show({
							title: 'Delete failed',
							message: dispositionLabel(
								error?.message || 'Failed to delete outcome catalog.'
							),
							color: 'red',
						});
					},
				}
			);
		},
		[clearCatalog, deleteMutation, dispositionLabel]
	);

	// Table columns definition
	const columns = useMemo<ColumnDef<DispositionCatalogModel>[]>(
		() => [
			{
				id: 'nameAndDescription',
				header: 'Name',
				cell: ({ row }) => {
					const name = row.original.name;
					const description = row.original.description;
					const type = row.original.type;
					return (
						<div className={styles.nameCell}>
							<div className={styles.nameRow}>
								<Text fw={600} className={styles.nameText}>
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
				cell: (info) =>
					info.getValue()
						? new Date(info.getValue() as string).toLocaleString()
						: '-',
			},
			{
				id: 'actions',
				header: 'Actions',
				cell: ({ row }) => (
					<Group gap={4}>
						<Tooltip label='Edit nodes' withArrow>
							<ActionIcon
								variant='light'
								size='sm'
								onClick={(e) => {
									e.stopPropagation();
									handleSelectCatalog(row.original);
								}}
								aria-label='Edit nodes'
							>
								<IconListDetails size={16} />
							</ActionIcon>
						</Tooltip>
						<Tooltip label='Edit details' withArrow>
							<ActionIcon
								variant='light'
								size='sm'
								onClick={(e) => {
									e.stopPropagation();
									handleEditDetails(row.original);
								}}
								aria-label='Edit details'
							>
								<IconPencil size={16} />
							</ActionIcon>
						</Tooltip>
						{!row.original.isActive && (
							<Tooltip label='Reactivate' withArrow>
								<ActionIcon
									color='green'
									variant='light'
									size='sm'
									onClick={(e) => {
										e.stopPropagation();
										handleReactivate(row.original);
									}}
									loading={
										reactivateStateRef.current.isPending &&
										reactivateStateRef.current.variables?.catalogId ===
											row.original.id
									}
									aria-label='Reactivate'
								>
									<IconRefresh size={16} />
								</ActionIcon>
							</Tooltip>
						)}
						{row.original.isActive && (
							<Tooltip label='Deactivate' withArrow>
								<ActionIcon
									color='orange'
									variant='light'
									size='sm'
									onClick={(e) => {
										e.stopPropagation();
										handleDeactivate(row.original);
									}}
									loading={
										deactivateStateRef.current.isPending &&
										deactivateStateRef.current.variables?.catalogId ===
											row.original.id
									}
									aria-label='Deactivate'
								>
									<IconBan size={16} />
								</ActionIcon>
							</Tooltip>
						)}
						<Tooltip label='Delete' withArrow>
							<ActionIcon
								color='red'
								variant='light'
								size='sm'
								onClick={(e) => {
									e.stopPropagation();
									handleDelete(row.original);
								}}
								loading={
									deleteStateRef.current.isPending &&
									deleteStateRef.current.variables?.id === row.original.id
								}
								aria-label='Delete'
							>
								<IconTrash size={16} />
							</ActionIcon>
						</Tooltip>
					</Group>
				),
				enableSorting: false,
			},
		],
		[
			handleEditDetails,
			handleSelectCatalog,
			handleReactivate,
			handleDeactivate,
			handleDelete,
		]
	);

	// Paginated data
	const paginatedData = useMemo<DispositionCatalogModel[]>(() => {
		if (!data) return [];
		const start = (page - 1) * pageSize;
		return data.slice(start, start + pageSize);
	}, [data, page]);

	// Handler for create - wrapped in useCallback so it can be used by useImperativeHandle
	const handleCreate = useCallback(() => {
		setSelectedCatalog(null);
		setIsModalOpen(true);
	}, []);

	// Expose imperative handle so parent can open the create form
	useImperativeHandle(
		ref,
		() => ({
			openCreateForm: handleCreate,
		}),
		[handleCreate]
	);

	if (isLoading) {
		return (
			<Center>
				<Loader />
			</Center>
		);
	}

	if (isError) {
		return (
			<Center>
				<Text c='red'>Failed to load disposition catalogs.</Text>
			</Center>
		);
	}

	return (
		<div className={styles.root}>
			<SectionCard
				icon={IconDatabase}
				title='Outcome Catalogs'
				description='Create and manage outcome catalogs to group disposition nodes for campaigns.'
				padding='lg'
				headerActions={
					<ActionIcon variant='filled' color='blue' onClick={handleCreate}>
						<IconPlus size={18} />
					</ActionIcon>
				}
			>
				<LoadingOverlay
					visible={isFetching && !isLoading}
					zIndex={100}
					overlayProps={{ radius: 'sm', blur: 2 }}
				/>
				{!data || data.length === 0 ? (
					<div className={styles.emptyStateContainer}>
						<EmptyState
							icon={<IconPlus size={48} />}
							message='No outcome catalogs found'
							description='Get started by creating your first outcome catalog'
							action={
								<Button
									leftSection={<IconPlus size={16} />}
									onClick={handleCreate}
								>
									Create Catalog
								</Button>
							}
						/>
					</div>
				) : (
					<>
						<div className={styles.table}>
							<BaseTable
								data={paginatedData}
								columns={columns}
								onRowClick={(row) => handleSelectCatalog(row)}
								className={styles.table}
								density='default'
							/>
						</div>
						{data.length > pageSize && (
							<Center mt='md'>
								<Pagination
									total={Math.ceil(data.length / pageSize)}
									value={page}
									onChange={setPage}
									size='sm'
									withEdges
								/>
							</Center>
						)}
					</>
				)}
			</SectionCard>

			<Modal
				opened={isModalOpen}
				onClose={() => setIsModalOpen(false)}
				title={selectedCatalog ? 'Edit Catalog' : 'Create Catalog'}
				size='lg'
			>
				{isModalOpen && (
					<DispositionCatalogForm
						key={selectedCatalog?.id || 'create'}
						mode={(selectedCatalog ? 'edit' : 'create') as any}
						initialValues={selectedCatalog || undefined}
						loading={
							selectedCatalog
								? updateMutation.isPending
								: createMutation.isPending
						}
						onSubmit={(values) =>
							selectedCatalog
								? updateMutation.mutateAsync({
										id: selectedCatalog.id,
										data: { ...values, isDefault: !!values.isDefault },
									})
								: createMutation.mutateAsync(values)
						}
						onSuccess={() => {
							notifications.show({
								title: selectedCatalog ? 'Catalog updated' : 'Catalog created',
								message: dispositionLabel(
									selectedCatalog
										? 'Outcome catalog was updated successfully.'
										: 'Outcome catalog was created successfully.'
								),
								color: 'teal',
							});
							setIsModalOpen(false);
						}}
						onError={(error: any) => {
							notifications.show({
								title: selectedCatalog ? 'Update failed' : 'Create failed',
								message: dispositionLabel(
									error?.message ||
										(selectedCatalog
											? 'Failed to update outcome catalog.'
											: 'Failed to create outcome catalog.')
								),
								color: 'red',
							});
						}}
					/>
				)}
			</Modal>
		</div>
	);
});

DispositionCatalogList.displayName = 'DispositionCatalogList';

export default DispositionCatalogList;
