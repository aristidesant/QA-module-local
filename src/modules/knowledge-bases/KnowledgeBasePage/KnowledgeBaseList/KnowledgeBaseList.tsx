import { useMemo, useState } from 'react';
import styles from './KnowledgeBaseList.module.css';
import { Button, Text, Skeleton, Stack } from '@mantine/core';
import { IconPlus, IconFileText } from '@tabler/icons-react';
import {
	useKnowledgeBases,
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
	const { data: items = [], isLoading, refetch } = useKnowledgeBases();
	const deleteMutation = useDeleteKnowledgeBase();
	const retryMutation = useRetryKnowledgeBase();

	const [query, setQuery] = useState('');
	const [statusFilter, setStatusFilter] = useState<string | null>(null);
	const [typeFilter, setTypeFilter] = useState<string | null>(null);

	const filtered = useMemo(() => {
		const q = query.trim().toLowerCase();
		return (items || []).filter((i: KnowledgeBaseModel) => {
			const matchesQuery =
				!q ||
				(i.name || '').toLowerCase().includes(q) ||
				(i.description || '').toLowerCase().includes(q);
			const matchesStatus = !statusFilter || i.status === statusFilter;
			const matchesType = !typeFilter || i.type === typeFilter;
			return matchesQuery && matchesStatus && matchesType;
		});
	}, [items, query, statusFilter, typeFilter]);

	const columns = useKnowledgeBaseColumns(
		retryMutation,
		deleteMutation,
		setRight,
		refetch
	);

	const total = items?.length ?? 0;
	const count = filtered.length;

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
						initialSort={[{ id: 'name', desc: false }]}
						onRowClick={(row) =>
							setRight(<KnowledgeBaseForm id={Number(row.id)} />)
						}
						density='default'
					/>
				</div>
			)}
		</Stack>
	);
};

export default KnowledgeBaseList;
