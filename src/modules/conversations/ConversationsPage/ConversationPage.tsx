import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router';
import { ContentContainer } from '~/components/ContentContainer/ContentContainer';
import ConversationsList from '~/modules/conversations/ConversationsList';
import { ConversationDetailPage } from '~/modules/conversations/ConversationDetailPage/ConversationDetailPage';

type ConversationLocationState = {
	selectedConversationId?: number;
};

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
			/>
		</ContentContainer>
	);
};

export default ConversationsPage;
