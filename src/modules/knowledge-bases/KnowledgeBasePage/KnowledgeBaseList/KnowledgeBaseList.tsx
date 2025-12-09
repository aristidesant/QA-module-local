import { useEffect, useState } from 'react';
import styles from './KnowledgeBaseList.module.css';
import { Button, Text, Skeleton, Stack } from '@mantine/core';
import { IconPlus, IconFileText } from '@tabler/icons-react';
import type { SortingState } from '@tanstack/react-table';
import { useDebouncedValue } from '@mantine/hooks';
import {
	useKnowledgeBasesPaginated,
	useDeleteKnowledgeBase,
	useRetryKnowledgeBase,
} from '~/queries/knowledgeBaseQueries';
import useKnowledgeBaseStore from '../store/knowledgeBaseStore';
import KnowledgeBaseForm from '../KnowledgeBaseForm/KnowledgeBaseForm';
import { type KnowledgeBaseModel } from '~/models/KnowledgeBaseModel';
import BaseTable from '~/components/BaseTable';
import { useKnowledgeBaseColumns } from './useKnowledgeBaseColumns';
import KnowledgeBaseFilter from './KnowledgeBaseFilter';

const KnowledgeBaseList = () => {
	const setRight = useKnowledgeBaseStore((s) => s.setRightComponent);
	// Server-side sorting state (single-column sort)
	const [sorting, setSorting] = useState<SortingState>([
		{ id: 'name', desc: false },
	]);

	const sortBy = sorting?.[0]?.id;
	const sortOrder = sorting?.[0]?.desc ? 'desc' : 'asc';
	const deleteMutation = useDeleteKnowledgeBase();
	const retryMutation = useRetryKnowledgeBase();

	const [query, setQuery] = useState('');
	const [statusFilter, setStatusFilter] = useState<string | null>(null);
	const [typeFilter, setTypeFilter] = useState<string | null>(null);
	const [debouncedQuery] = useDebouncedValue(query, 300);

	// Pagination state (server-side)
	const [pageIndex, setPageIndex] = useState(0); // 0-based
	const [pageSize, setPageSize] = useState(10);

	// Reset to first page when filters/sorting change
	useEffect(() => {
		setPageIndex(0);
	}, [debouncedQuery, statusFilter, typeFilter, sorting]);

	const { data, isLoading, refetch } = useKnowledgeBasesPaginated({
		search: debouncedQuery || undefined,
		status: statusFilter || undefined,
		type: typeFilter || undefined,
		sortBy,
		sortOrder,
		limit: pageSize,
		offset: pageIndex * pageSize,
	});
	const items = data?.data ?? [];

	// Server-side filtering: current page items only
	const filtered = items;

	const columns = useKnowledgeBaseColumns(
		retryMutation,
		deleteMutation,
		setRight,
		refetch
	);

	const total = data?.total ?? 0; // total matching filters
	const count = filtered.length; // items in current page

	return (
		<Stack gap={'xs'}>
			<KnowledgeBaseFilter
				query={query}
				setQuery={setQuery}
				statusFilter={statusFilter}
				setStatusFilter={setStatusFilter}
				typeFilter={typeFilter}
				setTypeFilter={setTypeFilter}
				total={total}
				count={count}
				refetch={refetch}
			/>

			{isLoading ? (
				<div className={styles.skeletonWrap}>
					{Array.from({ length: 5 }).map((_, idx) => (
						<Skeleton key={idx} height={64} mb={12} radius='md' />
					))}
				</div>
			) : filtered.length === 0 ? (
				<div className={styles.emptyState}>
					<div className={styles.emptyContent}>
						<IconFileText size={48} className={styles.emptyIcon} />
						<Text fw={600} size='lg' className={styles.emptyTitle}>
							No knowledge bases found
						</Text>
						<Text size='sm' c='dimmed' className={styles.emptyDescription}>
							Create your first knowledge base to surface documents to agents.
						</Text>
						<Button
							mt='lg'
							onClick={() => setRight(<KnowledgeBaseForm />)}
							leftSection={<IconPlus size={18} />}
							size='md'
						>
							Create Knowledge Base
						</Button>
					</div>
				</div>
			) : (
				<div>
					<BaseTable<KnowledgeBaseModel>
						data={filtered}
						columns={columns}
						initialSort={sorting}
						onRowClick={(row) =>
							setRight(<KnowledgeBaseForm id={Number(row.id)} />)
						}
						density='default'
						filterMode='server'
						onSortingChange={(newSorting) => {
							setSorting(newSorting);
						}}
						// Server-side pagination controls
						enablePagination
						showPaginationControls
						pageCount={Math.max(1, Math.ceil((data?.total ?? 0) / pageSize))}
						pageIndex={pageIndex}
						pageSize={pageSize}
						onPaginationChange={(nextPageIndex, nextPageSize) => {
							setPageIndex(nextPageIndex);
							setPageSize(nextPageSize);
						}}
					/>
				</div>
			)}
		</Stack>
	);
};

export default KnowledgeBaseList;
