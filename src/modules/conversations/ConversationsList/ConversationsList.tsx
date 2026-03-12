import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActionIcon, Center, Group, Text, Tooltip } from '@mantine/core';
import SectionCard from '~/components/SectionCard';
import AppDrawer from '~/components/AppDrawer';
import { modals } from '@mantine/modals';
import { IconMessages as IconMessagesTabler } from '@tabler/icons-react';
import {
	IconMessagesOff,
	IconRefresh,
	IconFileExcel,
} from '@tabler/icons-react';
import BaseTable from '~/components/BaseTable';
import EmptyState from '~/components/EmptyState';
import PaginationControls from '~/components/PaginationControls';
import { usePagination } from '~/hooks/usePagination';
import {
	useFailAndPauseConversation,
	useFetchAndProcessConversation,
	useGetConversations,
} from '~/queries/conversationsQueries';
import ConversationDetails from '~/modules/conversations/ConversationDetails';
import usePermissions from '~/hooks/usePermissions';
import { ModuleEnum } from '~/constants/ModuleEnum';
import { PermissionEnum } from '~/constants/PermissionEnum';
import { useConversationsColumns } from './useConversationsColumns';
import ExportToExcelModal from './components/ExportToExcelModal';
import ConversationFilters, {
	type ConversationFiltersType,
} from './ConversationFilters';
import AccessDenied from '~/components/AccessDenied';
import styles from './ConversationsList.module.css';
import type { SortingState } from '@tanstack/react-table';
import { useTranslation } from 'react-i18next';
import type { ConversationsModel } from '~/models/ConversationsModels';
import {
	type ConversationActionKey,
	getConversationActionDefinition,
} from '../ConversationDetails/ConversationActions/ConversationActions.helpers';

type ConversationsListProps = {
	campaignId?: number | string;
	contactGroupId?: number | string;
	className?: string;
	hiddenColumns?: string[];
};

const ConversationsList: React.FC<ConversationsListProps> = ({
	campaignId,
	contactGroupId,
	className,
	hiddenColumns,
}) => {
	const { t } = useTranslation(['conversations', 'common']);
	const pagination = usePagination({
		initialItemsPerPage: 10,
	});
	const { canAccessModule, canPerformAction } = usePermissions();
	const canViewConversations = canAccessModule(ModuleEnum.CONVERSATIONS);
	const canExportConversations = canPerformAction(
		ModuleEnum.CONVERSATIONS,
		PermissionEnum.EXPORT
	);
	const canExecuteConversations = canPerformAction(
		ModuleEnum.CONVERSATIONS,
		PermissionEnum.EXECUTE
	);

	const { limit, offset } = pagination.getApiParams();

	const [sorting, setSorting] = useState<SortingState>([
		{ id: 'createdAt', desc: true },
	]);
	const sortBy = sorting?.[0]?.id;
	const sortOrder = sorting?.[0]?.desc ? 'DESC' : 'ASC';

	const [filters, setFilters] = useState<ConversationFiltersType>({});
	const [selectedConversationId, setSelectedConversationId] = useState<
		number | null
	>(null);
	const [drawerOpened, setDrawerOpened] = useState(false);
	const [exportModalOpened, setExportModalOpened] = useState(false);
	const [pendingAction, setPendingAction] = useState<{
		id: number;
		key: ConversationActionKey;
	} | null>(null);

	const failAndPauseMutation = useFailAndPauseConversation();
	const fetchAndProcessMutation = useFetchAndProcessConversation();

	useEffect(() => {
		pagination.setCurrentPage(1);
	}, [filters]);

	useEffect(() => {
		setSelectedConversationId(null);
		setDrawerOpened(false);
	}, [campaignId, contactGroupId]);

	const { data, isLoading, isFetching, isError, error, refetch } =
		useGetConversations({
			campaignId,
			contactGroupId,
			limit,
			offset,
			...filters,
			sortBy,
			sortOrder,
		});

	const conversations = data?.data ?? [];
	const totalItems = data?.total ?? 0;

	const totalPages = useMemo(() => {
		return pagination.calculateTotalPages(totalItems);
	}, [pagination, totalItems]);

	const isTableLoading = isLoading || isFetching;

	const userTimezone = useMemo(() => {
		return 'America/Puerto_Rico';
	}, []);

	const handleRowClick = useCallback((conversation: { id: number }) => {
		setSelectedConversationId(conversation.id);
		setDrawerOpened(true);
	}, []);

	const handleCloseDrawer = useCallback(() => {
		setDrawerOpened(false);
		setSelectedConversationId(null);
	}, []);

	const runConversationAction = useCallback(
		(conversation: ConversationsModel) => {
			const action = getConversationActionDefinition(conversation, t);
			const mutation =
				action.key === 'reprocess'
					? failAndPauseMutation
					: fetchAndProcessMutation;

			setPendingAction({ id: conversation.id, key: action.key });
			mutation.mutate(`${conversation.id}`, {
				onSuccess: () => {
					void refetch();
				},
				onSettled: () => {
					setPendingAction((current) =>
						current?.id === conversation.id ? null : current
					);
				},
			});
		},
		[failAndPauseMutation, fetchAndProcessMutation, refetch, t]
	);

	const handleActionClick = useCallback(
		(
			event: React.MouseEvent<HTMLButtonElement>,
			conversation: ConversationsModel
		) => {
			event.stopPropagation();
			const action = getConversationActionDefinition(conversation, t);

			modals.openConfirmModal({
				title: t('actions.confirmTitle'),
				children: action.confirmMessage,
				labels: {
					confirm: action.confirmLabel,
					cancel: t('actions.cancel', { ns: 'common' }),
				},
				onConfirm: () => runConversationAction(conversation),
			});
		},
		[runConversationAction, t]
	);

	const isActionLoading = useCallback(
		(conversation: ConversationsModel) =>
			pendingAction?.id === conversation.id &&
			(pendingAction.key === 'reprocess'
				? failAndPauseMutation.isPending
				: fetchAndProcessMutation.isPending),
		[
			pendingAction,
			failAndPauseMutation.isPending,
			fetchAndProcessMutation.isPending,
		]
	);

	const handleItemsPerPageChange = (value: string | null) => {
		if (value) {
			pagination.setItemsPerPage(parseInt(value, 10));
		}
	};

	const columns = useConversationsColumns(userTimezone, hiddenColumns, {
		canExecuteConversations,
		onActionClick: handleActionClick,
		isActionLoading,
	});

	if (!canViewConversations) {
		return <AccessDenied description={t('list.error')} />;
	}

	return (
		<div className={`${styles.root} ${className ?? ''}`}>
			<SectionCard
				id='conversations-list'
				title={t('list.title')}
				description={t('list.description')}
				icon={IconMessagesTabler}
				contentSpacing='sm'
				padding='sm'
				headerActions={
					<Group className={styles.actions}>
						<Tooltip label={t('list.refresh')} withArrow>
							<ActionIcon
								variant='default'
								size='sm'
								onClick={() => refetch()}
								aria-label={t('list.refresh')}
								loading={isFetching}
								disabled={isFetching}
							>
								<IconRefresh size={16} />
							</ActionIcon>
						</Tooltip>
						{canExportConversations && (
							<Tooltip label={t('list.export')} withArrow>
								<ActionIcon
									variant='default'
									size='sm'
									onClick={() => setExportModalOpened(true)}
									aria-label={t('list.export')}
								>
									<IconFileExcel size={16} />
								</ActionIcon>
							</Tooltip>
						)}
					</Group>
				}
				footer={
					<PaginationControls
						currentPage={pagination.currentPage}
						totalPages={totalPages}
						itemsPerPage={pagination.itemsPerPage}
						totalItems={totalItems}
						onPageChange={pagination.setCurrentPage}
						onItemsPerPageChange={handleItemsPerPageChange}
						isLoading={isTableLoading}
						itemLabel={t('list.itemLabel')}
					/>
				}
			>
				<ConversationFilters filters={filters} onFiltersChange={setFilters} />

				{isError ? (
					<Center className={styles.emptyWrapper}>
						<Text size='sm' c='red'>
							{error instanceof Error ? error.message : t('list.error')}
						</Text>
					</Center>
				) : conversations.length === 0 && !isTableLoading ? (
					<div className={styles.emptyWrapper}>
						<EmptyState
							icon={<IconMessagesOff size={48} stroke={1.2} />}
							message={t('list.empty.message')}
							description={t('list.empty.description')}
						/>
					</div>
				) : (
					<div className={styles.tableWrapper}>
						<BaseTable
							data={conversations}
							columns={columns}
							isLoading={isTableLoading}
							density='compact'
							filterMode='server'
							onRowClick={handleRowClick}
							initialSort={sorting}
							onSortingChange={(newSorting) => {
								setSorting(newSorting);
								pagination.setCurrentPage(1);
							}}
							getRowClassName={(row) => {
								const classes = [styles.tableRow];
								if (row.original.id === selectedConversationId) {
									classes.push(styles.selectedRow);
								}
								return classes.join(' ');
							}}
						/>
					</div>
				)}
			</SectionCard>

			<AppDrawer
				opened={drawerOpened && selectedConversationId !== null}
				onClose={handleCloseDrawer}
				title={t('details.title')}
				size='lg'
				classNames={{
					content: styles.detailsDrawerContent,
					body: styles.detailsDrawerBody,
				}}
			>
				{selectedConversationId !== null ? (
					<ConversationDetails id={selectedConversationId} />
				) : null}
			</AppDrawer>

			{canExportConversations && (
				<ExportToExcelModal
					opened={exportModalOpened}
					onClose={() => setExportModalOpened(false)}
				/>
			)}
		</div>
	);
};

export default ConversationsList;
