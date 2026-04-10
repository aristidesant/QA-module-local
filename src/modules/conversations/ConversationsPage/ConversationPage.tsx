import { useState } from 'react';
import { useSearchParams } from 'react-router';
import { ContentContainer } from '~/components/ContentContainer/ContentContainer';
import ConversationsList from '~/modules/conversations/ConversationsList';
import { ConversationDetailPage } from '~/modules/conversations/ConversationDetailPage/ConversationDetailPage';

const ConversationsPage = () => {
	const [searchParams, setSearchParams] = useSearchParams();
	const paramId = searchParams.get('id');

	const [selectedId, setSelectedId] = useState<number | null>(
		paramId ? Number(paramId) : null
	);
	const [conversationIds, setConversationIds] = useState<number[]>([]);

	const handleSelectConversation = (conversation: { id: number }) => {
		setSelectedId(conversation.id);
	};

	const handleNavigate = (id: number) => {
		setSelectedId(id);
	};

	const handleBack = () => {
		setSelectedId(null);
		if (searchParams.has('id')) {
			searchParams.delete('id');
			setSearchParams(searchParams, { replace: true });
		}
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
