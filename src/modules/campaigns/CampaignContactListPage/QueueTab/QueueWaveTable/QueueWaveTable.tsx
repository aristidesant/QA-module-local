import { useCallback, useMemo, useState } from 'react';
import { Button, Group, Text } from '@mantine/core';
import {
	IconPlayerPause,
	IconPlayerPlay,
	IconX,
	IconRefresh,
} from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { notifications } from '@mantine/notifications';
import { modals } from '@mantine/modals';
import BaseTable from '~/components/BaseTable/BaseTable';
import { PaginationControls } from '~/components/PaginationControls/PaginationControls';
import { usePagination } from '~/hooks/usePagination';
import { useGetOutboundCallTasks } from '~/queries/outboundQueries';
import {
	usePauseOutboundTask,
	useResumeOutboundTask,
	useCancelOutboundTask,
	useRetryOutboundTask,
	useBulkOutboundTaskAction,
} from '~/queries/outboundQueries';
import type { OutboundCallTask, BulkTaskAction } from '~/models/ContactsModel';
import { useQueueColumns } from '../useQueueColumns';
import { getErrorMessage } from '~/utils/httpClient';
import styles from './QueueWaveTable.module.css';

interface QueueWaveTableProps {
	contactGroupId: number;
	campaignId: number;
	waveNumber?: number;
	statusFilter?: string;
}

const QueueWaveTable = ({
	contactGroupId,
	campaignId,
	waveNumber,
	statusFilter,
}: QueueWaveTableProps) => {
	const { t } = useTranslation('campaign.contact-list');
	const pagination = usePagination({ initialItemsPerPage: 20 });
	const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

	const pauseMutation = usePauseOutboundTask();
	const resumeMutation = useResumeOutboundTask();
	const cancelMutation = useCancelOutboundTask();
	const retryMutation = useRetryOutboundTask();
	const bulkMutation = useBulkOutboundTaskAction();

	const queryParams = useMemo(
		() => ({
			contactGroupId,
			campaignId,
			...(waveNumber != null ? { waveNumber } : {}),
			...(statusFilter ? { status: statusFilter } : {}),
			limit: pagination.itemsPerPage,
			offset: (pagination.currentPage - 1) * pagination.itemsPerPage,
			sortBy: 'orderIndex',
			sortOrder: 'ASC' as const,
		}),
		[
			contactGroupId,
			campaignId,
			waveNumber,
			statusFilter,
			pagination.currentPage,
			pagination.itemsPerPage,
		]
	);

	const tasksQuery = useGetOutboundCallTasks(queryParams);
	const tasks = tasksQuery.data?.data ?? [];
	const totalItems = tasksQuery.data?.total ?? 0;
	const totalPages = pagination.calculateTotalPages(totalItems);
	const allTaskIds = useMemo(() => tasks.map((t) => t.id), [tasks]);

	const handleToggleSelect = useCallback((id: number) => {
		setSelectedIds((prev) => {
			const next = new Set(prev);
			if (next.has(id)) next.delete(id);
			else next.add(id);
			return next;
		});
	}, []);

	const handleToggleSelectAll = useCallback((taskIds: number[]) => {
		setSelectedIds((prev) => {
			const allSelected = taskIds.every((id) => prev.has(id));
			if (allSelected) {
				const next = new Set(prev);
				taskIds.forEach((id) => next.delete(id));
				return next;
			}
			return new Set([...prev, ...taskIds]);
		});
	}, []);

	const showSuccess = useCallback(
		(message: string) => {
			notifications.show({
				title: t('actions.success'),
				message,
				color: 'green',
			});
		},
		[t]
	);

	const showError = useCallback(
		(error: unknown) => {
			notifications.show({
				title: t('queue.actions.error'),
				message: getErrorMessage(error),
				color: 'red',
			});
		},
		[t]
	);

	const handlePause = useCallback(
		(task: OutboundCallTask) => {
			pauseMutation.mutate(
				{ id: task.id, reason: 'manual_pause' },
				{
					onSuccess: () => showSuccess(t('queue.actions.pauseSuccess')),
					onError: showError,
				}
			);
		},
		[pauseMutation, showSuccess, showError, t]
	);

	const handleResume = useCallback(
		(task: OutboundCallTask) => {
			resumeMutation.mutate(task.id, {
				onSuccess: () => showSuccess(t('queue.actions.resumeSuccess')),
				onError: showError,
			});
		},
		[resumeMutation, showSuccess, showError, t]
	);

	const handleCancel = useCallback(
		(task: OutboundCallTask) => {
			modals.openConfirmModal({
				title: t('queue.actions.confirmCancelTitle'),
				children: <Text size='sm'>{t('queue.actions.confirmCancel')}</Text>,
				labels: { confirm: t('queue.actions.cancel'), cancel: t('actions.no') },
				confirmProps: { color: 'red' },
				onConfirm: () => {
					cancelMutation.mutate(task.id, {
						onSuccess: () => showSuccess(t('queue.actions.cancelSuccess')),
						onError: showError,
					});
				},
			});
		},
		[cancelMutation, showSuccess, showError, t]
	);

	const handleRetry = useCallback(
		(task: OutboundCallTask) => {
			retryMutation.mutate(
				{ id: task.id },
				{
					onSuccess: () => showSuccess(t('queue.actions.retrySuccess')),
					onError: showError,
				}
			);
		},
		[retryMutation, showSuccess, showError, t]
	);

	const handleBulkAction = useCallback(
		(action: BulkTaskAction) => {
			const ids = [...selectedIds];
			if (ids.length === 0) return;

			const doAction = () => {
				bulkMutation.mutate(
					{
						taskIds: ids,
						action,
						...(action === 'pause' ? { pauseReason: 'manual_pause' } : {}),
					},
					{
						onSuccess: (result) => {
							notifications.show({
								title: t('actions.success'),
								message: t('queue.bulk.success', {
									successful: result.successful,
									failed: result.failed,
								}),
								color: result.failed > 0 ? 'yellow' : 'green',
							});
							setSelectedIds(new Set());
						},
						onError: (error) => {
							notifications.show({
								title: t('queue.bulk.error'),
								message: getErrorMessage(error),
								color: 'red',
							});
						},
					}
				);
			};

			if (action === 'cancel') {
				modals.openConfirmModal({
					title: t('queue.bulk.confirmCancelTitle'),
					children: (
						<Text size='sm'>
							{t('queue.bulk.confirmCancel', { count: ids.length })}
						</Text>
					),
					labels: {
						confirm: t('queue.actions.cancel'),
						cancel: t('actions.no'),
					},
					confirmProps: { color: 'red' },
					onConfirm: doAction,
				});
			} else {
				doAction();
			}
		},
		[selectedIds, bulkMutation, t]
	);

	const columns = useQueueColumns({
		onPause: handlePause,
		onResume: handleResume,
		onCancel: handleCancel,
		onRetry: handleRetry,
		selectedIds,
		onToggleSelect: handleToggleSelect,
		onToggleSelectAll: handleToggleSelectAll,
		allTaskIds,
	});

	const handleItemsPerPageChange = useCallback(
		(value: string | null) => {
			if (value) pagination.setItemsPerPage(parseInt(value, 10));
		},
		[pagination]
	);

	return (
		<>
			{selectedIds.size > 0 && (
				<Group className={styles.toolbar}>
					<Text size='sm' className={styles.selectedInfo}>
						{t('queue.bulk.selected', { count: selectedIds.size })}
					</Text>
					<Group gap='xs'>
						<Button
							size='xs'
							variant='light'
							color='yellow'
							leftSection={<IconPlayerPause size={14} />}
							onClick={() => handleBulkAction('pause')}
							loading={bulkMutation.isPending}
						>
							{t('queue.bulk.pause')}
						</Button>
						<Button
							size='xs'
							variant='light'
							color='green'
							leftSection={<IconPlayerPlay size={14} />}
							onClick={() => handleBulkAction('resume')}
							loading={bulkMutation.isPending}
						>
							{t('queue.bulk.resume')}
						</Button>
						<Button
							size='xs'
							variant='light'
							color='red'
							leftSection={<IconX size={14} />}
							onClick={() => handleBulkAction('cancel')}
							loading={bulkMutation.isPending}
						>
							{t('queue.bulk.cancel')}
						</Button>
						<Button
							size='xs'
							variant='light'
							color='violet'
							leftSection={<IconRefresh size={14} />}
							onClick={() => handleBulkAction('retry')}
							loading={bulkMutation.isPending}
						>
							{t('queue.bulk.retry')}
						</Button>
					</Group>
				</Group>
			)}

			<BaseTable
				data={tasks}
				columns={columns}
				isLoading={tasksQuery.isLoading}
				emptyMessage={t('queue.emptyState')}
				density='compact'
				filterMode='server'
				getRowId={(row) => row.id}
			/>

			{totalPages > 1 && (
				<PaginationControls
					currentPage={pagination.currentPage}
					totalPages={totalPages}
					itemsPerPage={pagination.itemsPerPage}
					totalItems={totalItems}
					onPageChange={pagination.setCurrentPage}
					onItemsPerPageChange={handleItemsPerPageChange}
					isLoading={tasksQuery.isFetching}
				/>
			)}
		</>
	);
};

export default QueueWaveTable;
