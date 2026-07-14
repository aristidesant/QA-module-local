import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router';
import { ContentContainer } from '~/components/ContentContainer/ContentContainer';
import ConversationsList from '~/modules/conversations/ConversationsList';
import { ConversationDetailPage } from '~/modules/conversations/ConversationDetailPage/ConversationDetailPage';
import { usePagination } from '~/hooks/usePagination';
import type { ConversationFiltersType } from '~/modules/conversations/ConversationsList/ConversationFilters';
import type { SortingState } from '@tanstack/react-table';

type ConversationLocationState = {
	selectedConversationId?: number;
};

const DEFAULT_SORTING: SortingState = [{ id: 'createdAt', desc: true }];

const ConversationsPage = () => {
	const location = useLocation();
	const routeState = useMemo(
		() => (location.state as ConversationLocationState | null) ?? null,
		[location.state]
	);

	const [selectedId, setSelectedId] = useState<number | null>(
		routeState?.selectedConversationId ?? null
	);
	const [conversationIds, setConversationIds] = useState<number[]>([]);
	const pagination = usePagination({ initialItemsPerPage: 10 });
	const [filters, setFilters] = useState<ConversationFiltersType>({});
	const [sorting, setSorting] = useState<SortingState>(DEFAULT_SORTING);

	useEffect(() => {
		if (routeState?.selectedConversationId) {
			setSelectedId(routeState.selectedConversationId);
		}
	}, [routeState?.selectedConversationId]);

	const handleSelectConversation = (conversation: { id: number }) => {
		setSelectedId(conversation.id);
	};

	const handleNavigate = (id: number) => {
		setSelectedId(id);
	};

	const handleBack = () => {
		setSelectedId(null);
	};

	if (selectedId !== null) {
		return (
			<ConversationDetailPage
				conversationId={String(selectedId)}
				onBack={handleBack}
				conversationIds={conversationIds}
				onNavigate={handleNavigate}
			/>
		);
	}

	return (
		<ContentContainer>
			<ConversationsList
				onRowClick={handleSelectConversation}
				onListChange={setConversationIds}
				pagination={pagination}
				filters={filters}
				onFiltersChange={setFilters}
				sorting={sorting}
				onSortingChange={setSorting}
			/>
		</ContentContainer>
	);
};

export default ConversationsPage;
