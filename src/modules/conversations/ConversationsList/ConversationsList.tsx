import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import {
	ActionIcon,
	Button,
	Center,
	Group,
	Text,
	Tooltip,
} from '@mantine/core';
import SectionCard from '~/components/SectionCard';
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
import { usePagination, type UsePaginationReturn } from '~/hooks/usePagination';
import {
	useFailAndPauseConversation,
	useFetchAndProcessConversation,
	useGetConversations,
} from '~/queries/conversationsQueries';
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
import ConversationListItem from './components/ConversationListItem';

type ConversationsListProps = {
	variant?: 'embedded' | 'page';
	campaignId?: number | string;
	contactGroupId?: number | string;
	className?: string;
	hiddenColumns?: string[];
	onRowClick?: (conversation: { id: number }) => void;
	onListChange?: (ids: number[]) => void;
	pagination?: UsePaginationReturn;
	filters?: ConversationFiltersType;
	onFiltersChange?: (filters: ConversationFiltersType) => void;
	sorting?: SortingState;
	onSortingChange?: (sorting: SortingState) => void;
};

const DEFAULT_SORTING: SortingState = [{ id: 'createdAt', desc: true }];

const areFiltersEqual = (
	current: ConversationFiltersType,
	next: ConversationFiltersType
) =>
	current.identifier === next.identifier &&
	current.contactName === next.contactName &&
	current.contactPhoneNumber === next.contactPhoneNumber &&
	current.dispositionName === next.dispositionName &&
	current.status === next.status;

const ConversationsList: React.FC<ConversationsListProps> = ({
	variant = 'embedded',
	campaignId,
	contactGroupId,
	className,
	hiddenColumns,
	onRowClick: onRowClickProp,
	onListChange,
	pagination: paginationProp,
	filters: filtersProp,
	onFiltersChange: onFiltersChangeProp,
	sorting: sortingProp,
	onSortingChange: onSortingChangeProp,
}) => {
	const { t } = useTranslation(['conversations', 'common']);
	const navigate = useNavigate();
	const internalPagination = usePagination({
		initialItemsPerPage: 10,
	});
	const pagination = paginationProp ?? internalPagination;
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

	const [internalSorting, setInternalSorting] =
		useState<SortingState>(DEFAULT_SORTING);
	const sorting = sortingProp ?? internalSorting;
	const sortBy = sorting?.[0]?.id;
	const sortOrder = sorting?.[0]?.desc ? 'DESC' : 'ASC';

	const [internalFilters, setInternalFilters] =
		useState<ConversationFiltersType>({});
	const filters = filtersProp ?? internalFilters;
	const [exportModalOpened, setExportModalOpened] = useState(false);
	const [pendingAction, setPendingAction] = useState<{
		id: number;
		key: ConversationActionKey;
	} | null>(null);

	const failAndPauseMutation = useFailAndPauseConversation();
	const fetchAndProcessMutation = useFetchAndProcessConversation();

	const handleFiltersChange = useCallback(
		(nextFilters: ConversationFiltersType) => {
			if (areFiltersEqual(filters, nextFilters)) return;

			if (onFiltersChangeProp) {
				onFiltersChangeProp(nextFilters);
			} else {
				setInternalFilters(nextFilters);
			}
			pagination.setCurrentPage(1);
		},
		[filters, onFiltersChangeProp, pagination.setCurrentPage]
	);

	const handleSortingChange = useCallback(
		(nextSorting: SortingState) => {
			if (onSortingChangeProp) {
				onSortingChangeProp(nextSorting);
			} else {
				setInternalSorting(nextSorting);
			}
			pagination.setCurrentPage(1);
		},
		[onSortingChangeProp, pagination.setCurrentPage]
	);

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

	useEffect(() => {
		if (onListChange) {
			onListChange((data?.data ?? []).map((c) => c.id));
		}
	}, [data, onListChange]);

	const totalPages = pagination.calculateTotalPages(totalItems);

	const isTableLoading = isLoading || isFetching;

	const userTimezone = 'America/Puerto_Rico';

	const handleRowClick = useCallback(
		(conversation: { id: number }) => {
			if (onRowClickProp) {
				onRowClickProp(conversation);
			} else {
				navigate('/conversations', {
					state: {
						selectedConversationId: conversation.id,
					},
				});
			}
		},
		[navigate, onRowClickProp]
	);

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
		combineContactDetails: variant === 'page',
	});
	const isPageVariant = variant === 'page';

	const toolbarActions = (
		<Group className={styles.actions} wrap='nowrap'>
			<Tooltip label={t('list.refresh')} withArrow>
				<ActionIcon
					variant='default'
					size='lg'
					onClick={() => refetch()}
					aria-label={t('list.refresh')}
					loading={isFetching}
					disabled={isFetching}
					className={styles.refreshButton}
				>
					<IconRefresh size={17} />
				</ActionIcon>
			</Tooltip>
			{canExportConversations && (
				<Button
					variant='default'
					size='sm'
					leftSection={<IconFileExcel size={16} />}
					onClick={() => setExportModalOpened(true)}
					className={styles.exportButton}
				>
					{t('list.export')}
				</Button>
			)}
		</Group>
	);

	if (!canViewConversations) {
		return <AccessDenied description={t('list.error')} />;
	}

	return (
		<div
			className={`${styles.root} ${isPageVariant ? styles.pageRoot : ''} ${className ?? ''}`}
		>
			<SectionCard
				id='conversations-list'
				title={isPageVariant ? undefined : t('list.title')}
				description={isPageVariant ? undefined : t('list.description')}
				icon={isPageVariant ? undefined : IconMessagesTabler}
				contentSpacing='sm'
				padding={isPageVariant ? 0 : 'sm'}
				className={isPageVariant ? styles.pageCard : undefined}
				contentClassName={isPageVariant ? styles.pageCardContent : undefined}
				headerActions={isPageVariant ? undefined : toolbarActions}
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
				<ConversationFilters
					filters={filters}
					onFiltersChange={handleFiltersChange}
					resultCount={totalItems}
					isLoading={isTableLoading}
					actions={isPageVariant ? toolbarActions : undefined}
				/>

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
					<>
						<div className={styles.tableWrapper}>
							<BaseTable
								data={conversations}
								columns={columns}
								isLoading={isTableLoading}
								density='compact'
								filterMode='server'
								onRowClick={handleRowClick}
								initialSort={sorting}
								onSortingChange={handleSortingChange}
								getRowClassName={() => styles.tableRow}
								className={
									isPageVariant ? styles.conversationsTable : undefined
								}
							/>
						</div>
						{isPageVariant && (
							<div className={styles.mobileList}>
								{conversations.map((conversation) => (
									<ConversationListItem
										key={conversation.id}
										conversation={conversation}
										userTimezone={userTimezone}
										onClick={() => handleRowClick(conversation)}
										canExecute={canExecuteConversations}
										onActionClick={handleActionClick}
										isActionLoading={isActionLoading(conversation)}
									/>
								))}
							</div>
						)}
					</>
				)}
			</SectionCard>

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
