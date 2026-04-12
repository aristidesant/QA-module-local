import {
	useState,
	forwardRef,
	useImperativeHandle,
	useCallback,
	useEffect,
	useRef,
} from 'react';
import { useTranslation } from 'react-i18next';
import {
	Loader,
	Center,
	Text,
	ActionIcon,
	Button,
	Modal,
	LoadingOverlay,
	TextInput,
	Group,
	Badge,
	CloseButton,
} from '@mantine/core';
import AppSegmentedControl from '~/components/ui/AppSegmentedControl';
import { useDebouncedValue } from '@mantine/hooks';
import {
	IconPlus,
	IconDatabase,
	IconSearch,
	IconFilter,
} from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { modals } from '@mantine/modals';
import type { SortingState } from '@tanstack/react-table';
import {
	useDispositionCatalogsPaged,
	useCreateDispositionCatalog,
	useUpdateDispositionCatalog,
	useReactivateDispositionCatalog,
	useDeactivateDispositionCatalog,
} from '~/queries/dispositionCatalogQueries';
import DispositionCatalogForm from '../DispositionCatalogForm';
import EmptyState from '~/components/EmptyState';
import { FilterContainer } from '~/components/FilterContainer';
import type { DispositionCatalogModel } from '~/models/DispositionCatalogModels';
import styles from './DispositionCatalogList.module.css';
import BaseTable from '~/components/BaseTable';
import SectionCard from '~/components/SectionCard/SectionCard';
import usePermissions from '~/hooks/usePermissions';
import { ModuleEnum } from '~/constants/ModuleEnum';
import { PermissionEnum } from '~/constants/PermissionEnum';
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

	const { t } = useTranslation('outcomes');
	const { canPerformAction } = usePermissions();
	const canCreate = canPerformAction(
		ModuleEnum.SETTINGS,
		PermissionEnum.CREATE
	);

	// Filter state
	const [searchValue, setSearchValue] = useState('');
	const [debouncedSearch] = useDebouncedValue(searchValue, 300);
	const [statusFilter, setStatusFilter] = useState<string>('all');

	const sortBy = sorting[0]?.id;
	const sortOrder = sorting[0]?.desc ? 'DESC' : 'ASC';
	const offset = pageIndex * pageSize;

	// Convert status filter to isActive boolean
	const isActiveFilter =
		statusFilter === 'all' ? undefined : statusFilter === 'active';

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
		search: debouncedSearch || undefined,
		isActive: isActiveFilter,
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
				title: t('list.modals.reactivate.title'),
				labels: {
					confirm: t('list.modals.reactivate.confirm'),
					cancel: t('actions.cancel', { ns: 'common' }),
				},
				children: <Text size='sm'>{t('list.modals.reactivate.message')}</Text>,
				confirmProps: { color: 'green' },
				onConfirm: () => {
					reactivateMutation.mutate(
						{ catalogId: catalog.id },
						{
							onSuccess: () => {
								notifications.show({
									title: t('list.notifications.catalogReactivated'),
									message: t('list.notifications.reactivateSuccess'),
									color: 'green',
								});
							},
							onError: (error: Error) => {
								notifications.show({
									title: t('list.notifications.reactivationFailed'),
									message:
										error?.message || t('list.notifications.reactivateError'),
									color: 'red',
								});
							},
						}
					);
				},
			});
		},
		[t, reactivateMutation]
	);

	const handleDeactivate = useCallback(
		(catalog: DispositionCatalogModel) => {
			modals.openConfirmModal({
				title: t('list.modals.deactivate.title'),
				labels: {
					confirm: t('list.modals.deactivate.confirm'),
					cancel: t('actions.cancel', { ns: 'common' }),
				},
				children: <Text size='sm'>{t('list.modals.deactivate.message')}</Text>,
				confirmProps: { color: 'red' },
				onConfirm: () => {
					deactivateMutation.mutate(
						{ catalogId: catalog.id },
						{
							onSuccess: () => {
								notifications.show({
									title: t('list.notifications.catalogDeactivated'),
									message: t('list.notifications.deactivateSuccess'),
									color: 'blue',
								});
							},
							onError: (error: Error) => {
								notifications.show({
									title: t('list.notifications.deactivationFailed'),
									message:
										error?.message || t('list.notifications.deactivateError'),
									color: 'red',
								});
							},
						}
					);
				},
			});
		},
		[deactivateMutation, t]
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
				<Text c='red'>{t('catalog.errorBanner')}</Text>
			</Center>
		);
	}

	return (
		<div className={styles.root}>
			<SectionCard
				icon={IconDatabase}
				title={t('list.title')}
				description={t('list.description')}
				padding='md'
				headerActions={
					canCreate && (
						<ActionIcon
							variant='light'
							color='blue'
							onClick={handleCreate}
							aria-label={t('list.addCatalog')}
						>
							<IconPlus size={18} />
						</ActionIcon>
					)
				}
			>
				<LoadingOverlay
					visible={isFetching && !isLoading}
					zIndex={100}
					overlayProps={{ radius: 'sm', blur: 2 }}
				/>

				{/* Filters */}
				<div className={styles.filtersContainer}>
					<FilterContainer>
						<Group gap='xs' className={styles.titleGroup}>
							<IconFilter size={16} className={styles.titleIcon} />
							<Text className={styles.title}>{t('filters.title')}</Text>
							{(searchValue || statusFilter !== 'all') && (
								<Badge size='xs' variant='light' className={styles.activeBadge}>
									{(searchValue ? 1 : 0) + (statusFilter !== 'all' ? 1 : 0)}
								</Badge>
							)}
						</Group>

						<div className={styles.controlsWrapper}>
							<TextInput
								placeholder={t('list.searchPlaceholder')}
								leftSection={
									<IconSearch size={14} className={styles.searchIcon} />
								}
								rightSection={
									searchValue && (
										<CloseButton
											size='xs'
											onClick={() => {
												setSearchValue('');
												setPageIndex(0);
											}}
											variant='subtle'
										/>
									)
								}
								value={searchValue}
								onChange={(e) => {
									setSearchValue(e.currentTarget.value);
									setPageIndex(0);
								}}
								size='sm'
								className={styles.searchInput}
							/>

							<AppSegmentedControl
								value={statusFilter}
								onChange={(value) => {
									setStatusFilter(value);
									setPageIndex(0);
								}}
								size='xs'
								className={styles.statusToggle}
								data={[
									{
										label: t('filters.allStatuses'),
										value: 'all',
									},
									{
										label: t('status.active', { ns: 'common' }),
										value: 'active',
									},
									{
										label: t('status.inactive', { ns: 'common' }),
										value: 'inactive',
									},
								]}
							/>
						</div>
					</FilterContainer>
				</div>

				{total === 0 ? (
					<div className={styles.emptyStateContainer}>
						<EmptyState
							icon={<IconPlus size={48} />}
							message={
								debouncedSearch || statusFilter !== 'all'
									? t('list.noMatchingCatalogs')
									: t('list.noCatalogsFound')
							}
							description={
								debouncedSearch || statusFilter !== 'all'
									? t('list.adjustSearch')
									: t('list.getStarted')
							}
							action={
								debouncedSearch || statusFilter !== 'all' ? (
									<Button
										variant='light'
										onClick={() => {
											setSearchValue('');
											setStatusFilter('all');
										}}
									>
										{t('list.clearFilters')}
									</Button>
								) : (
									canCreate && (
										<Button
											leftSection={<IconPlus size={16} />}
											onClick={handleCreate}
										>
											{t('list.addCatalog')}
										</Button>
									)
								)
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
				title={
					selectedCatalog
						? t('list.modalEditTitle')
						: t('list.modalCreateTitle')
				}
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
									title: t('list.notifications.catalogUpdated'),
									message: t('list.notifications.updateSuccess'),
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
									title: t('list.notifications.updateFailed'),
									message: errorMessage || t('list.notifications.updateError'),
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
									title: t('list.notifications.catalogCreated'),
									message: t('list.notifications.createSuccess'),
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
									title: t('list.notifications.createFailed'),
									message: errorMessage || t('list.notifications.createError'),
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
