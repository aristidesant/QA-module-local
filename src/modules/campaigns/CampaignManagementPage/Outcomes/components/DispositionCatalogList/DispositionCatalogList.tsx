import {
	useMemo,
	useState,
	forwardRef,
	useImperativeHandle,
	useCallback,
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
} from '@mantine/core';
import {
	IconTrash,
	IconRefresh,
	IconBan,
	IconPlus,
	IconDatabase,
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

const DispositionCatalogList = forwardRef<DispositionCatalogListHandles>(
	(_, ref) => {
		const { data, isLoading, isError } = useDispositionCatalogs();
		const { setRightComponent, setCatalog, clearCatalog } = useDispositionStore(
			(s) => s
		);
		const createMutation = useCreateDispositionCatalog();
		const updateMutation = useUpdateDispositionCatalog();
		const deleteMutation = useDeleteDispositionCatalog();
		const reactivateMutation = useReactivateDispositionCatalog();
		const deactivateMutation = useDeactivateDispositionCatalog();
		const dispositionLabel = useDispositionLabel();

		// Pagination state - must be declared before any early returns
		const [page, setPage] = useState(1);
		const pageSize = 10;

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
											reactivateMutation.isPending &&
											reactivateMutation.variables?.catalogId ===
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
											deactivateMutation.isPending &&
											deactivateMutation.variables?.catalogId ===
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
										deleteMutation.isPending &&
										deleteMutation.variables?.id === row.original.id
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
				deleteMutation.isPending,
				deleteMutation.variables,
				reactivateMutation.isPending,
				reactivateMutation.variables,
				deactivateMutation.isPending,
				deactivateMutation.variables,
			]
		);

		// Handler for reactivate
		const handleReactivate = (catalog: DispositionCatalogModel) => {
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
		};

		// Handler for deactivate
		const handleDeactivate = (catalog: DispositionCatalogModel) => {
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
		};

		// Handler for delete
		const handleDelete = (catalog: DispositionCatalogModel) => {
			deleteMutation.mutate(
				{ id: catalog.id },
				{
					onSuccess: () => {
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
		};

		// Paginated data
		const paginatedData = useMemo<DispositionCatalogModel[]>(() => {
			if (!data) return [];
			const start = (page - 1) * pageSize;
			return data.slice(start, start + pageSize);
		}, [data, page]);

		// Handler for create - wrapped in useCallback so it can be used by useImperativeHandle
		const handleCreate = useCallback(() => {
			clearCatalog();
			setRightComponent(
				<DispositionCatalogForm
					mode='create'
					loading={createMutation.isPending}
					onSubmit={(values) => createMutation.mutateAsync(values)}
					onSuccess={(_catalog) => {
						notifications.show({
							title: 'Catalog created',
							message: dispositionLabel(
								'Outcome catalog was created successfully.'
							),
							color: 'teal',
						});
						setRightComponent(null);
					}}
					onError={(error: any) => {
						notifications.show({
							title: 'Create failed',
							message: dispositionLabel(
								error?.message || 'Failed to create outcome catalog.'
							),
							color: 'red',
						});
					}}
				/>
			);
		}, [clearCatalog, setRightComponent, createMutation, dispositionLabel]);

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

		// Handler for edit
		const handleEdit = (catalog: DispositionCatalogModel) => {
			setCatalog(catalog);
			setRightComponent(
				<DispositionCatalogForm
					key={catalog.id}
					mode='edit'
					initialValues={catalog}
					loading={updateMutation.isPending}
					onSubmit={(values) =>
						updateMutation.mutateAsync({
							id: catalog.id,
							data: { ...values, isDefault: !!values.isDefault },
						})
					}
					onSuccess={(_updatedCatalog) => {
						notifications.show({
							title: 'Catalog updated',
							message: dispositionLabel(
								'Outcome catalog was updated successfully.'
							),
							color: 'teal',
						});
						setRightComponent(null);
					}}
					onError={(error: any) => {
						notifications.show({
							title: 'Update failed',
							message: dispositionLabel(
								error?.message || 'Failed to update outcome catalog.'
							),
							color: 'red',
						});
					}}
				/>
			);
		};

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
									onRowClick={(row) => handleEdit(row)}
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
			</div>
		);
	}
);

DispositionCatalogList.displayName = 'DispositionCatalogList';

export default DispositionCatalogList;
