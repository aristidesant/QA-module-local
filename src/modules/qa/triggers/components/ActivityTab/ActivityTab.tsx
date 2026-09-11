import {
	Button, Stack,
} from '@mantine/core';
import { IconDownload } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { useMemo, useState } from 'react';
import type { TriggerActivityEntry } from '~/models/qa';
import { SectionCard } from '~/components/SectionCard';
import PaginationControls from '~/components/PaginationControls';
import EmptyState from '~/components/EmptyState';
import { notifySuccess } from '~/modules/qa/utils/notifications';
import { useTriggerRulesStore } from '~/stores/qa/triggerRulesStore';
import ActivityFilters, { type ActivityFiltersValues } from '../ActivityFilters';
import ActivityTable from '../ActivityTable';

interface ActivityTabProps {
	onOpenEntry: (entry: TriggerActivityEntry) => void;
	inboxPath: string;
}

export default function ActivityTab({ onOpenEntry }: ActivityTabProps) {
	const { t } = useTranslation('qa.triggers');
	const [page, setPage] = useState(1);
	const [pageSize, setPageSize] = useState(10);
	const activity = useTriggerRulesStore((s) => s.activity);
	const acknowledgeActivity = useTriggerRulesStore((s) => s.acknowledgeActivity);

	const [filters, setFilters] = useState<ActivityFiltersValues>({
		search: '',
		kind: 'ALL',
		ruleId: null,
		agentId: null,
		status: null,
		from: null,
		to: null,
	});

	const filteredEntries = useMemo(() => {
		const results = activity.filter((entry) => {
			// Search filter
			if (filters.search) {
				const search = filters.search.toLowerCase();
				if (
					!entry.agentName.toLowerCase().includes(search)
					&& !entry.ruleName.toLowerCase().includes(search)
				) {
					return false;
				}
			}

			// Kind filter
			if (filters.kind !== 'ALL' && entry.kind !== filters.kind) {
				return false;
			}

			// Rule filter
			if (filters.ruleId && entry.ruleId !== filters.ruleId) {
				return false;
			}

			// Agent filter
			if (filters.agentId && entry.agentId !== filters.agentId) {
				return false;
			}

			// Status filter
			if (filters.status && entry.status !== filters.status) {
				return false;
			}

			// Date range filter
			const firedDate = new Date(entry.firedAt);
			if (filters.from && firedDate < filters.from) {
				return false;
			}
			if (filters.to) {
				const toDate = new Date(filters.to);
				toDate.setHours(23, 59, 59, 999);
				if (firedDate > toDate) {
					return false;
				}
			}

			return true;
		});

		// Sort newest first
		return results.sort((a, b) => new Date(b.firedAt).getTime() - new Date(a.firedAt).getTime());
	}, [activity, filters]);

	const paginatedEntries = filteredEntries.slice((page - 1) * pageSize, page * pageSize);
	const totalPages = Math.ceil(filteredEntries.length / pageSize);

	const handleClearFilters = () => {
		setFilters({
			search: '',
			kind: 'ALL',
			ruleId: null,
			agentId: null,
			status: null,
			from: null,
			to: null,
		});
		setPage(1);
	};

	const handleExport = () => {
		notifySuccess(t('activity.exportStarted'));
	};

	const handleAcknowledge = (entry: TriggerActivityEntry) => {
		acknowledgeActivity(entry.id);
		notifySuccess(t('activity.notifications.acknowledged'));
	};

	return (
		<SectionCard
			title={t('activity.title')}
			description={t('activity.description')}
			headerActions={
				<Button
					variant="light"
					size="sm"
					leftSection={<IconDownload size={16} />}
					onClick={handleExport}
				>
					{t('activity.export')}
				</Button>
			}
		>
			<Stack gap="md">
				<ActivityFilters
					values={filters}
					onChange={setFilters}
					onClear={handleClearFilters}
				/>

				{filteredEntries.length === 0 ? (
					<EmptyState
						message={filters.search || filters.kind !== 'ALL' || filters.ruleId || filters.agentId || filters.status || filters.from || filters.to
							? t('activity.empty.noMatches')
							: t('activity.empty.title')}
						description={filters.search || filters.kind !== 'ALL' || filters.ruleId || filters.agentId || filters.status || filters.from || filters.to
							? undefined
							: t('activity.empty.description')}
						action={
							(filters.search || filters.kind !== 'ALL' || filters.ruleId || filters.agentId || filters.status || filters.from || filters.to) ? (
								<Button variant="light" size="sm" onClick={handleClearFilters}>
									{t('activity.filters.clear')}
								</Button>
							) : undefined
						}
					/>
				) : (
					<>
						<ActivityTable
							entries={paginatedEntries}
							onOpen={onOpenEntry}
							onAcknowledge={handleAcknowledge}
						/>
						{totalPages > 1 && (
							<PaginationControls
								currentPage={page}
								totalPages={totalPages}
								itemsPerPage={pageSize}
								totalItems={filteredEntries.length}
								onPageChange={setPage}
								onItemsPerPageChange={(value: string | null) => {
									if (value) {
										setPageSize(Number(value));
										setPage(1);
									}
								}}
							/>
						)}
					</>
				)}
			</Stack>
		</SectionCard>
	);
}
