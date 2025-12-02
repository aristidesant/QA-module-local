import React from 'react';
import {
	Button,
	Checkbox,
	Group,
	SegmentedControl,
	TextInput,
} from '@mantine/core';
import { IconSearch } from '@tabler/icons-react';
import { useDebouncedValue } from '@mantine/hooks';
import BaseTable from '~/components/BaseTable/BaseTable';
import type KnowledgeBaseModel from '~/models/KnowledgeBaseModel';
import { KnowledgeBaseType } from '~/models/KnowledgeBaseModel';
import { useKnowledgeBases } from '~/queries/knowledgeBaseQueries';
import useKnowledgeBaseTableColumns from './useKnowledgeBaseTableColumns';
import styles from './KnowledgeBaseSelector.module.css';

type TypeFilter = 'ALL' | 'URL' | 'TEXT' | 'FILE';

export type KnowledgeBaseSelectorProps = {
	initialSelectedIds: number[];
	onCancel: () => void;
	onSave: (ids: number[]) => void;
};

const KnowledgeBaseSelector: React.FC<KnowledgeBaseSelectorProps> = ({
	initialSelectedIds,
	onCancel,
	onSave,
}) => {
	const [search, setSearch] = React.useState('');
	const [debouncedSearch] = useDebouncedValue(search, 300);
	const [type, setType] = React.useState<TypeFilter>('ALL');
	const [selected, setSelected] = React.useState<Set<number>>(
		new Set(initialSelectedIds)
	);

	const apiType =
		type === 'ALL' ? undefined : (type as unknown as KnowledgeBaseType);
	const { data = [], isLoading } = useKnowledgeBases({
		search: debouncedSearch || undefined,
		type: apiType,
	});

	const filteredData: KnowledgeBaseModel[] = React.useMemo(() => {
		return data || [];
	}, [data]);

	const toggleSelect = (id: number, value: boolean) => {
		setSelected((prev) => {
			const next = new Set(prev);
			if (value) next.add(id);
			else next.delete(id);
			return next;
		});
	};

	const allIds = filteredData.map((kb) => kb.id);
	const allSelected =
		allIds.length > 0 && allIds.every((id) => selected.has(id));
	const someSelected = allIds.some((id) => selected.has(id));

	const columns = React.useMemo(() => {
		const base = useKnowledgeBaseTableColumns();
		return [
			{
				id: 'select',
				header: () => (
					<Checkbox
						size='xs'
						checked={allSelected}
						indeterminate={!allSelected && someSelected}
						onChange={(e) => {
							const checked = e.currentTarget.checked;
							setSelected((prev) => {
								const next = new Set(prev);
								if (checked) allIds.forEach((id) => next.add(id));
								else allIds.forEach((id) => next.delete(id));
								return next;
							});
						}}
					/>
				),
				cell: ({ row }: any) => (
					<div
						onClick={(e) => {
							// Avoid triggering row click when toggling via checkbox
							e.stopPropagation();
						}}
					>
						<Checkbox
							size='xs'
							checked={selected.has(row.original.id)}
							onChange={(e) =>
								toggleSelect(row.original.id, e.currentTarget.checked)
							}
						/>
					</div>
				),
				meta: { headerClassName: '' },
			},
			...base,
		];
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [allSelected, someSelected, filteredData, selected]);

	return (
		<div className={styles.root}>
			<div className={styles.controls}>
				<TextInput
					size='sm'
					leftSection={<IconSearch size={14} />}
					placeholder='Search knowledge bases'
					value={search}
					onChange={(e) => setSearch(e.currentTarget.value)}
				/>
				<SegmentedControl
					size='xs'
					value={type}
					onChange={(v) => setType(v as TypeFilter)}
					data={[
						{ label: 'All', value: 'ALL' },
						{ label: 'URL', value: 'URL' },
						{ label: 'Text', value: 'TEXT' },
						{ label: 'File', value: 'FILE' },
					]}
				/>
			</div>

			<div className={styles.tableWrapper}>
				<BaseTable<KnowledgeBaseModel>
					data={filteredData}
					columns={columns as any}
					density='compact'
					isLoading={isLoading}
					emptyMessage='No knowledge bases found'
					enablePagination
					enableFiltering={false}
					showPaginationControls
					onRowClick={(row) => {
						const id = row.id;
						setSelected((prev) => {
							const next = new Set(prev);
							if (next.has(id)) next.delete(id);
							else next.add(id);
							return next;
						});
					}}
				/>
			</div>

			<Group className={styles.footer} mt='xs'>
				<Button variant='default' size='sm' onClick={onCancel}>
					Cancel
				</Button>
				<Button size='sm' onClick={() => onSave(Array.from(selected))}>
					Save Selections
				</Button>
			</Group>
		</div>
	);
};

export default KnowledgeBaseSelector;
