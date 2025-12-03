import React, { useMemo, useEffect } from 'react';
import {
	Badge,
	Button,
	Checkbox,
	Group,
	SegmentedControl,
	Text,
	TextInput,
} from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';
import {
	IconFile,
	IconLink,
	IconPlus,
	IconSearch,
	IconTextRecognition,
} from '@tabler/icons-react';
import type { ColumnDef } from '@tanstack/react-table';
import BaseTable from '~/components/BaseTable/BaseTable';
import type KnowledgeBaseModel from '~/models/KnowledgeBaseModel';
import { KnowledgeBaseType } from '~/models/KnowledgeBaseModel';
import { useKnowledgeBases } from '~/queries/knowledgeBaseQueries';
import { useKnowledgeBaseSelectionStore } from '~/stores/knowledgeBaseSelectionStore';
import styles from './KnowledgeBaseSelectionTable.module.css';

type TypeFilter = 'ALL' | 'URL' | 'TEXT' | 'FILE';

/** Type badge configuration */
const typeConfig: Record<
	KnowledgeBaseType,
	{ color: string; label: string; icon: React.ComponentType<{ size?: number }> }
> = {
	[KnowledgeBaseType.FILE]: {
		color: 'teal',
		label: 'FILE',
		icon: IconFile,
	},
	[KnowledgeBaseType.URL]: {
		color: 'blue',
		label: 'URL',
		icon: IconLink,
	},
	[KnowledgeBaseType.TEXT]: {
		color: 'orange',
		label: 'TEXT',
		icon: IconTextRecognition,
	},
};

/** Renders a type badge with icon */
const TypeBadge: React.FC<{ type: KnowledgeBaseType }> = ({ type }) => {
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
			{config.label}
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
	emptyMessage = 'No knowledge bases found',
	showFooter = true,
}) => {
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

	// Initialize selection on mount
	useEffect(() => {
		initializeSelection(initialSelectedIds);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	// Fetch knowledge bases
	const apiType =
		typeFilter === 'ALL'
			? undefined
			: (typeFilter as unknown as KnowledgeBaseType);
	const { data = [], isLoading } = useKnowledgeBases({
		search: debouncedSearch || undefined,
		type: apiType,
	});

	const allIds = useMemo(() => data.map((kb) => kb.id), [data]);
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
						aria-label='Select all'
					/>
				),
				cell: ({ row }) => (
					<div onClick={(e) => e.stopPropagation()}>
						<Checkbox
							size='xs'
							checked={selectedIds.has(row.original.id)}
							onChange={(e) =>
								setSelected(row.original.id, e.currentTarget.checked)
							}
							aria-label={`Select ${row.original.name}`}
						/>
					</div>
				),
				enableSorting: false,
				size: 48,
			},
			{
				id: 'name',
				header: 'Name',
				accessorFn: (row) => row.name,
				enableSorting: false,
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
				header: 'Description',
				accessorFn: (row) => row.description ?? '',
				enableSorting: false,
				cell: ({ row }) => {
					const kb = row.original;
					const fallback =
						kb.type === KnowledgeBaseType.URL
							? kb.sourceUrl
							: kb.type === KnowledgeBaseType.TEXT
								? 'Text snippet'
								: kb.file?.name || 'File';
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
				header: 'Type',
				accessorFn: (row) => row.type,
				enableSorting: false,
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
						placeholder='Search knowledge bases'
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.currentTarget.value)}
					/>
					<SegmentedControl
						size='xs'
						value={typeFilter}
						onChange={(v) => setTypeFilter(v as TypeFilter)}
						data={[
							{ label: 'All', value: 'ALL' },
							{ label: 'URL', value: 'URL' },
							{ label: 'Text', value: 'TEXT' },
							{ label: 'File', value: 'FILE' },
						]}
					/>
				</Group>
				{showCreateButton && onCreateNew && (
					<Button
						variant='light'
						size='sm'
						leftSection={<IconPlus size={14} />}
						onClick={onCreateNew}
					>
						Create new
					</Button>
				)}
			</div>

			<div className={styles.tableWrapper}>
				<BaseTable<KnowledgeBaseModel>
					data={data}
					columns={columns}
					density='compact'
					isLoading={isLoading}
					emptyMessage={emptyMessage}
					enablePagination
					enableFiltering={false}
					showPaginationControls
					onRowClick={handleRowClick}
				/>
			</div>

			{showFooter && (
				<div className={styles.footer}>
					<Text className={styles.selectionCount}>
						{selectedIds.size} selected
					</Text>
					<div className={styles.actions}>
						{onCancel && (
							<Button variant='default' size='sm' onClick={onCancel}>
								Cancel
							</Button>
						)}
						{onSave && (
							<Button size='sm' onClick={handleSave}>
								Save Selections
							</Button>
						)}
					</div>
				</div>
			)}
		</div>
	);
};

export default KnowledgeBaseSelectionTable;
