import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
	ActionIcon,
	Center,
	Group,
	Text,
	TextInput,
	Tooltip,
} from '@mantine/core';
import {
	IconMessagesOff,
	IconRefresh,
	IconSearch,
	IconFileExcel,
} from '@tabler/icons-react';
import BaseTable from '~/components/BaseTable';
import EmptyState from '~/components/EmptyState';
import PaginationControls from '~/components/PaginationControls';
import { usePagination } from '~/hooks/usePagination';
import { useGetConversations } from '~/queries/conversationsQueries';
import { useConversationStore } from '~/stores/useConversationStore';
import ConversationDetails from '~/modules/conversations/ConversationDetails';
import type { ConversationsModel } from '~/models/ConversationsModels';
import { useConversationsColumns } from './useConversationsColumns';
import ExportToExcelModal from './components/ExportToExcelModal';
import styles from './ConversationsList.module.css';

type ConversationsListProps = {
	campaignId?: number | string;
	contactGroupId?: number | string;
	onConversationClick?: (conversation: ConversationsModel) => void;
	selectedConversationId?: number | null;
	searchPlaceholder?: string;
	className?: string;
};

const ConversationsList: React.FC<ConversationsListProps> = ({
	campaignId,
	contactGroupId,
	onConversationClick,
	selectedConversationId,
	searchPlaceholder = 'Search conversations',
	className,
}) => {
	const pagination = usePagination({
		initialItemsPerPage: 10,
		searchDebounceMs: 400,
	});
	const paginationParams = pagination.getApiParams() as {
		limit: number;
		offset: number;
		name?: string;
	};

	const { limit, offset, name } = paginationParams;

	const { data, isLoading, isFetching, isError, error, refetch } =
		useGetConversations({
			campaignId,
			contactGroupId,
			limit,
			offset,
			search: name,
		});

	const { selectedId, setSelection } = useConversationStore();
	const [internalSelectedId, setInternalSelectedId] = useState<number | null>(
		null
	);
	const [exportModalOpened, setExportModalOpened] = useState(false);

	useEffect(() => {
		setInternalSelectedId(null);
	}, [campaignId]);

	const conversations = data?.data ?? [];
	const totalItems = data?.total ?? 0;

	const totalPages = useMemo(() => {
		return pagination.calculateTotalPages(totalItems);
	}, [pagination, totalItems]);

	const isTableLoading = isLoading || isFetching;

	const effectiveSelectedId =
		selectedConversationId ??
		(onConversationClick ? internalSelectedId : selectedId);

	const userTimezone = useMemo(() => {
		// Hardcode to AST (Atlantic Standard Time, UTC-4) as requested
		return 'America/Puerto_Rico';
	}, []);

	const handleRowClick = useCallback(
		(conversation: ConversationsModel) => {
			if (onConversationClick) {
				setInternalSelectedId(conversation.id);
				onConversationClick(conversation);
				return;
			}

			setSelection(
				conversation.id,
				<ConversationDetails onReload={refetch} id={conversation.id} />
			);
		},
		[onConversationClick, setSelection]
	);

	const handleItemsPerPageChange = (value: string | null) => {
		if (value) {
			pagination.setItemsPerPage(parseInt(value, 10));
		}
	};

	const columns = useConversationsColumns(userTimezone);

	return (
		<div className={`${styles.root} ${className ?? ''}`}>
			<Group className={styles.toolbar}>
				<TextInput
					className={styles.searchInput}
					placeholder={searchPlaceholder}
					value={pagination.searchValue}
					onChange={(event) =>
						pagination.setSearchValue(event.currentTarget.value)
					}
					leftSection={<IconSearch size={16} />}
				/>
				<div className={styles.actions}>
					<Tooltip label='Refresh conversations' withArrow>
						<ActionIcon
							variant='default'
							size='md'
							onClick={() => refetch()}
							aria-label='Refresh conversations'
							loading={isFetching}
							disabled={isFetching}
						>
							<IconRefresh size={16} />
						</ActionIcon>
					</Tooltip>
					<Tooltip label='Export conversations' withArrow>
						<ActionIcon
							variant='default'
							size='md'
							onClick={() => setExportModalOpened(true)}
							aria-label='Export conversations'
						>
							<IconFileExcel size={16} />
						</ActionIcon>
					</Tooltip>
				</div>
			</Group>

			{isError ? (
				<Center className={styles.emptyWrapper}>
					<Text size='sm' c='red'>
						{error instanceof Error
							? error.message
							: 'Unable to load conversations. Please try again.'}
					</Text>
				</Center>
			) : conversations.length === 0 && !isTableLoading ? (
				<div className={styles.emptyWrapper}>
					<EmptyState
						icon={<IconMessagesOff size={48} stroke={1.2} />}
						message='No conversations yet'
						description='We will display conversations as soon as they are available.'
					/>
				</div>
			) : (
				<div className={styles.tableWrapper}>
					<BaseTable
						data={conversations}
						columns={columns}
						isLoading={isTableLoading}
						density='compact'
						onRowClick={handleRowClick}
						getRowClassName={(row) => {
							const classes = [styles.tableRow];
							if (row.original.id === effectiveSelectedId) {
								classes.push(styles.selectedRow);
							}
							return classes.join(' ');
						}}
					/>
				</div>
			)}

			<PaginationControls
				currentPage={pagination.currentPage}
				totalPages={totalPages}
				itemsPerPage={pagination.itemsPerPage}
				totalItems={totalItems}
				onPageChange={pagination.setCurrentPage}
				onItemsPerPageChange={handleItemsPerPageChange}
				searchTerm={pagination.debouncedSearch}
				isLoading={isTableLoading}
				itemLabel='conversations'
			/>
			<ExportToExcelModal
				opened={exportModalOpened}
				onClose={() => setExportModalOpened(false)}
			/>
		</div>
	);
};

export default ConversationsList;
