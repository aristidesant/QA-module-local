import React, { useMemo, useEffect, useState } from 'react';
import {
	Badge,
	Button,
	Checkbox,
	Group,
	Text,
	TextInput,
	Center,
	Box,
	Tooltip,
} from '@mantine/core';
import AppSegmentedControl from '~/components/ui/AppSegmentedControl';
import { useTranslation } from 'react-i18next';
import { useDebouncedValue } from '@mantine/hooks';
import {
	IconFile,
	IconLink,
	IconPlus,
	IconSearch,
	IconTextRecognition,
} from '@tabler/icons-react';
import type { ColumnDef, SortingState } from '@tanstack/react-table';
import BaseTable from '~/components/BaseTable/BaseTable';
import type KnowledgeBaseModel from '~/models/KnowledgeBaseModel';
import { KnowledgeBaseType } from '~/models/KnowledgeBaseModel';
import { useKnowledgeBasesPaginated } from '~/queries/knowledgeBaseQueries';
import { useKnowledgeBaseSelectionStore } from '~/stores/knowledgeBaseSelectionStore';
import styles from './KnowledgeBaseSelectionTable.module.css';

type TypeFilter = 'ALL' | 'URL' | 'TEXT' | 'FILE';

/** Type badge configuration */
const typeConfig: Record<
	KnowledgeBaseType,
	{
		color: string;
		labelKey: string;
		icon: React.ComponentType<{ size?: number }>;
	}
> = {
	[KnowledgeBaseType.FILE]: {
		color: 'teal',
		labelKey: 'badges.file',
		icon: IconFile,
	},
	[KnowledgeBaseType.URL]: {
		color: 'blue',
		labelKey: 'badges.url',
		icon: IconLink,
	},
	[KnowledgeBaseType.TEXT]: {
		color: 'orange',
		labelKey: 'badges.text',
		icon: IconTextRecognition,
	},
};

/** Renders a type badge with icon */
const TypeBadge: React.FC<{ type: KnowledgeBaseType }> = ({ type }) => {
	const { t } = useTranslation('knowledgeBaseSelection');
	const config = typeConfig[type] || typeConfig[KnowledgeBaseType.FILE];
	const Icon = config.icon;
	return (
		<Badge
			variant='light'
			color={config.color}
			size='sm'
			leftSection={<Icon size={12} />}
			className={styles.typeBadge}
		>
			{t(config.labelKey)}
		</Badge>
	);
};

export interface KnowledgeBaseSelectionTableProps {
	/** Initial selected IDs (will initialize store on mount) */
	initialSelectedIds?: number[];
	/** Show "Create new" button */
	showCreateButton?: boolean;
	/** Handler when "Create new" is clicked */
	onCreateNew?: () => void;
	/** Handler for cancel action */
	onCancel?: () => void;
	/** Handler for save action with selected IDs */
	onSave?: (selectedIds: number[]) => void;
	/** Custom empty message */
	emptyMessage?: string;
	/** Whether to show footer with actions */
	showFooter?: boolean;
}

const KnowledgeBaseSelectionTable: React.FC<
	KnowledgeBaseSelectionTableProps
> = ({
	initialSelectedIds = [],
	showCreateButton = false,
	onCreateNew,
	onCancel,
	onSave,
	emptyMessage = '',
	showFooter = true,
}) => {
	const { t } = useTranslation('knowledgeBaseSelection');
	const resolvedEmptyMessage = emptyMessage || t('noKnowledgeBases');
	const {
		selectedIds,
		searchTerm,
		typeFilter,
		initializeSelection,
		toggleSelection,
		setSelected,
		selectAll,
		deselectAll,
		setSearchTerm,
		setTypeFilter,
		getSelectedArray,
	} = useKnowledgeBaseSelectionStore();

	const [debouncedSearch] = useDebouncedValue(searchTerm, 300);

	// Initialize selection on mount and when initialSelectedIds changes
	// Use a ref to track the previous IDs to avoid unnecessary re-initializations
	const prevInitialIdsRef = React.useRef<number[]>([]);
	useEffect(() => {
		// Only initialize if the IDs have actually changed (by value, not reference)
		const prevIds = prevInitialIdsRef.current;
		const idsChanged =
			prevIds.length !== initialSelectedIds.length ||
			initialSelectedIds.some((id, i) => id !== prevIds[i]);

		if (idsChanged) {
			initializeSelection(initialSelectedIds);
			prevInitialIdsRef.current = initialSelectedIds;
		}
	}, [initializeSelection, initialSelectedIds]);

	// Fetch knowledge bases
	const apiType =
		typeFilter === 'ALL'
			? undefined
			: (typeFilter as unknown as KnowledgeBaseType);
	// Server-side pagination state (1-based page for backend)
	const [pageIndex, setPageIndex] = useState(0); // 0-based in UI
	const [pageSize, setPageSize] = useState(10);

	// Server-side sorting state (single-column sort)
	const [sorting, setSorting] = useState<SortingState>([
		{ id: 'name', desc: false },
	]);

	const sortBy = sorting?.[0]?.id;
	const sortOrder = sorting?.[0]?.desc ? 'desc' : 'asc';

	// Reset to first page when filters change
	useEffect(() => {
		setPageIndex(0);
	}, [debouncedSearch, apiType, sorting]);

	const response = useKnowledgeBasesPaginated({
		search: debouncedSearch || undefined,
		type: apiType,
		sortBy,
		sortOrder,
		limit: pageSize,
		offset: pageIndex * pageSize,
	});
	const isLoading = response.isLoading;
	const data = response.data?.data ?? [];
	const total = response.data?.total ?? 0;
	const totalPages =
		response.data?.totalPages ?? Math.max(1, Math.ceil(total / pageSize));

	const allIds = useMemo(() => data.map((kb) => Number(kb.id)), [data]);
	const allSelected =
		allIds.length > 0 && allIds.every((id) => selectedIds.has(id));
	const someSelected = allIds.some((id) => selectedIds.has(id));

	// Define columns with checkbox
	const columns: ColumnDef<KnowledgeBaseModel, unknown>[] = useMemo(
		() => [
			{
				id: 'select',
				header: () => (
					<Checkbox
						size='xs'
						checked={allSelected}
						indeterminate={!allSelected && someSelected}
						onChange={(e) => {
							const checked = e.currentTarget.checked;
							if (checked) {
								selectAll(allIds);
							} else {
								deselectAll(allIds);
							}
						}}
						aria-label={t('aria.selectAll')}
					/>
				),
				cell: ({ row }) => (
					<div onClick={(e) => e.stopPropagation()}>
						<Checkbox
							size='xs'
							checked={selectedIds.has(Number(row.original.id))}
							onChange={(e) =>
								setSelected(row.original.id, e.currentTarget.checked)
							}
							aria-label={t('aria.selectItem', { name: row.original.name })}
						/>
					</div>
				),
				enableSorting: false,
				size: 48,
			},
			{
				id: 'name',
				header: t('columns.name'),
				accessorFn: (row) => row.name,
				enableSorting: true,
				cell: ({ row }) => {
					const kb = row.original;
					return (
						<div className={styles.nameCell}>
							<Text size='sm' fw={500} truncate>
								{kb.name}
							</Text>
						</div>
					);
				},
			},
			{
				id: 'description',
				header: t('columns.description'),
				accessorFn: (row) => row.description ?? '',
				enableSorting: true,
				cell: ({ row }) => {
					const kb = row.original;
					const fallback =
						kb.type === KnowledgeBaseType.URL
							? kb.sourceUrl
							: kb.type === KnowledgeBaseType.TEXT
								? t('fallbacks.textSnippet')
								: kb.file?.name || t('fallbacks.file');
					return (
						<Text
							size='xs'
							className={styles.description}
							title={kb.description || fallback || ''}
						>
							{kb.description || fallback || ''}
						</Text>
					);
				},
			},
			{
				id: 'type',
				header: t('columns.type'),
				accessorFn: (row) => row.type,
				enableSorting: true,
				cell: ({ row }) => <TypeBadge type={row.original.type} />,
			},
		],
		[
			allSelected,
			someSelected,
			selectedIds,
			allIds,
			selectAll,
			deselectAll,
			setSelected,
			t,
		]
	);

	const handleRowClick = (row: KnowledgeBaseModel) => {
		toggleSelection(row.id);
	};

	const handleSave = () => {
		onSave?.(getSelectedArray());
	};

	return (
		<div className={styles.root}>
			<div className={styles.controls}>
				<Group className={styles.filtersGroup}>
					<TextInput
						size='sm'
						leftSection={<IconSearch size={14} />}
						placeholder={t('filters.search.placeholder')}
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.currentTarget.value)}
						className={styles.searchInput}
					/>
					<div className={styles.filterSection}>
						<AppSegmentedControl
							size='xs'
							value={typeFilter}
							onChange={(v) => setTypeFilter(v as TypeFilter)}
							className={styles.typeFilter}
							data={[
								{ label: t('filters.types.all'), value: 'ALL' },
								{
									label: (
										<Tooltip
											label={t('filters.tooltips.url')}
											withArrow
											position='top'
										>
											<Center>
												<IconLink size={14} />
												<Box ml={4}>{t('filters.types.url')}</Box>
											</Center>
										</Tooltip>
									),
									value: 'URL',
								},
								{
									label: (
										<Tooltip
											label={t('filters.tooltips.text')}
											withArrow
											position='top'
										>
											<Center>
												<IconTextRecognition size={14} />
												<Box ml={4}>{t('filters.types.text')}</Box>
											</Center>
										</Tooltip>
									),
									value: 'TEXT',
								},
								{
									label: (
										<Tooltip
											label={t('filters.tooltips.file')}
											withArrow
											position='top'
										>
											<Center>
												<IconFile size={14} />
												<Box ml={4}>{t('filters.types.file')}</Box>
											</Center>
										</Tooltip>
									),
									value: 'FILE',
								},
							]}
						/>
					</div>
				</Group>
				{showCreateButton && onCreateNew && (
					<Button
						variant='light'
						size='sm'
						leftSection={<IconPlus size={14} />}
						onClick={onCreateNew}
					>
						{t('actions.createNew')}
					</Button>
				)}
			</div>

			<div className={styles.tableWrapper}>
				<BaseTable<KnowledgeBaseModel>
					data={data}
					columns={columns}
					density='compact'
					isLoading={isLoading}
					emptyMessage={resolvedEmptyMessage}
					filterMode='server'
					initialSort={sorting}
					onSortingChange={(newSorting) => {
						setSorting(newSorting);
					}}
					enablePagination
					showPaginationControls
					pageCount={totalPages}
					pageIndex={pageIndex}
					pageSize={pageSize}
					onPaginationChange={(nextPageIndex, nextPageSize) => {
						setPageIndex(nextPageIndex);
						setPageSize(nextPageSize);
					}}
					onRowClick={handleRowClick}
				/>
			</div>

			{showFooter && (
				<div className={styles.footer}>
					<Text className={styles.selectionCount}>
						{t('selection.count', { count: selectedIds.size })}
					</Text>
					<div className={styles.actions}>
						{onCancel && (
							<Button variant='default' size='sm' onClick={onCancel}>
								{t('actions.cancel', { ns: 'common' })}
							</Button>
						)}
						{onSave && (
							<Button size='sm' onClick={handleSave}>
								{t('actions.saveSelections')}
							</Button>
						)}
					</div>
				</div>
			)}
		</div>
	);
};

export default KnowledgeBaseSelectionTable;
