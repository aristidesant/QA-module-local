import {
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
	ActionIcon,
	Button,
	Modal,
	LoadingOverlay,
} from '@mantine/core';
import { IconPlus, IconDatabase } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { modals } from '@mantine/modals';
import type { SortingState } from '@tanstack/react-table';
import { useDispositionLabel } from '~/hooks/useDispositionLabel';
import {
	useDispositionCatalogsPaged,
	useCreateDispositionCatalog,
	useUpdateDispositionCatalog,
	useReactivateDispositionCatalog,
	useDeactivateDispositionCatalog,
} from '~/queries/dispositionCatalogQueries';
import DispositionCatalogForm from '../DispositionCatalogForm';
import EmptyState from '~/components/EmptyState';
import type { DispositionCatalogModel } from '~/models/DispositionCatalogModels';
import styles from './DispositionCatalogList.module.css';
import BaseTable from '~/components/BaseTable';
import SectionCard from '~/components/SectionCard/SectionCard';
import { useDispositionStore } from '../../dispositionRightComponentStore';
import { useDispositionCatalogTableColumns } from './useDispositionCatalogTableColumns';

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
	const [pageIndex, setPageIndex] = useState(0);
	const [pageSize, setPageSize] = useState(10);
	const [sorting, setSorting] = useState<SortingState>([
		{ id: 'createdAt', desc: true },
	]);

	const sortBy = sorting[0]?.id;
	const sortOrder = sorting[0]?.desc ? 'DESC' : 'ASC';
	const offset = pageIndex * pageSize;

	const {
		data: paginatedResponse,
		isLoading,
		isError,
		isFetching,
	} = useDispositionCatalogsPaged({
		limit: pageSize,
		offset,
		sortBy,
		sortOrder,
	});

	const data = paginatedResponse?.data ?? [];
	const total = paginatedResponse?.total ?? 0;
	const pageCount = total > 0 ? Math.ceil(total / pageSize) : 0;
	const setCatalog = useDispositionStore((state) => state.setCatalog);
	const selectedCatalogId = useDispositionStore(
		(state) => state.catalog?.id ?? null
	);
	const createMutation = useCreateDispositionCatalog();
	const updateMutation = useUpdateDispositionCatalog();
	const reactivateMutation = useReactivateDispositionCatalog();
	const deactivateMutation = useDeactivateDispositionCatalog();
	const dispositionLabel = useDispositionLabel();

	const [isModalOpen, setIsModalOpen] = useState(false);
	const [selectedCatalog, setSelectedCatalog] =
		useState<DispositionCatalogModel | null>(null);

	const selectedCatalogIdRef = useRef<number | null>(selectedCatalogId);
	useEffect(() => {
		selectedCatalogIdRef.current = selectedCatalogId;
	}, [selectedCatalogId]);

	type CatalogIdVariables = { catalogId: number } | undefined;

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
							onError: (error: Error) => {
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
							onError: (error: Error) => {
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

	// Table columns definition
	const columns = useDispositionCatalogTableColumns({
		onEditNodes: handleSelectCatalog,
		onEditDetails: handleEditDetails,
		onReactivate: handleReactivate,
		onDeactivate: handleDeactivate,
		reactivateState: reactivateStateRef.current,
		deactivateState: deactivateStateRef.current,
	});

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
				padding='xs'
				headerActions={
					<ActionIcon variant='light' color='blue' onClick={handleCreate}>
						<IconPlus size={18} />
					</ActionIcon>
				}
			>
				<LoadingOverlay
					visible={isFetching && !isLoading}
					zIndex={100}
					overlayProps={{ radius: 'sm', blur: 2 }}
				/>
				{total === 0 ? (
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
								data={data}
								columns={columns}
								onRowClick={(row) => handleSelectCatalog(row)}
								className={styles.table}
								density='compact'
								filterMode='server'
								enablePagination
								showPaginationControls
								pageCount={pageCount}
								pageIndex={pageIndex}
								pageSize={pageSize}
								initialSort={sorting}
								onPaginationChange={(nextPageIndex, nextPageSize) => {
									setPageIndex(nextPageIndex);
									setPageSize(nextPageSize);
								}}
								onSortingChange={(nextSorting) => {
									setSorting(nextSorting);
									setPageIndex(0);
								}}
							/>
						</div>
					</>
				)}
			</SectionCard>

			<Modal
				opened={isModalOpen}
				onClose={() => setIsModalOpen(false)}
				title={selectedCatalog ? 'Edit Catalog' : 'Create Catalog'}
				size='lg'
			>
				{isModalOpen &&
					(selectedCatalog ? (
						<DispositionCatalogForm
							key={selectedCatalog.id}
							mode={'edit' as const}
							initialValues={selectedCatalog}
							loading={updateMutation.isPending}
							onSubmit={(values) =>
								updateMutation.mutateAsync({
									id: selectedCatalog.id,
									data: { ...values, isDefault: !!values.isDefault },
								})
							}
							onSuccess={() => {
								notifications.show({
									title: 'Catalog updated',
									message: dispositionLabel(
										'Outcome catalog was updated successfully.'
									),
									color: 'teal',
								});
								setIsModalOpen(false);
							}}
							onError={(error: unknown) => {
								const errorMessage =
									error instanceof Error
										? error.message
										: (error as { message: string })?.message;
								notifications.show({
									title: 'Update failed',
									message: dispositionLabel(
										errorMessage || 'Failed to update outcome catalog.'
									),
									color: 'red',
								});
							}}
						/>
					) : (
						<DispositionCatalogForm
							key='create'
							mode={'create' as const}
							initialValues={undefined}
							loading={createMutation.isPending}
							onSubmit={(values) => createMutation.mutateAsync(values)}
							onSuccess={() => {
								notifications.show({
									title: 'Catalog created',
									message: dispositionLabel(
										'Outcome catalog was created successfully.'
									),
									color: 'teal',
								});
								setIsModalOpen(false);
							}}
							onError={(error: unknown) => {
								const errorMessage =
									error instanceof Error
										? error.message
										: (error as { message: string })?.message;
								notifications.show({
									title: 'Create failed',
									message: dispositionLabel(
										errorMessage || 'Failed to create outcome catalog.'
									),
									color: 'red',
								});
							}}
						/>
					))}
			</Modal>
		</div>
	);
});

DispositionCatalogList.displayName = 'DispositionCatalogList';

export default DispositionCatalogList;
