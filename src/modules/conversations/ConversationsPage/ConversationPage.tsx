import { ContentContainer } from '~/components/ContentContainer/ContentContainer';
import { useConversationStore } from '~/stores/useConversationStore';
import FallbackRightComponent from '~/components/FallbackRightComponent';
import { useEffect } from 'react';
import ConversationsList from '~/modules/conversations/ConversationsList';

const ConversationsPage = () => {
	const { selectionContent, clearSelection } = useConversationStore(
		(state) => state
	);

	useEffect(() => {
		return () => {
			clearSelection?.();
		};
	}, [clearSelection]);

	return (
		<ContentContainer
			description='Manage, review, and take action on conversations across your campaigns. Select a conversation to view transcripts, agent notes, and next steps.'
			title='Conversations'
			rightSection={
				selectionContent || (
					<FallbackRightComponent description='No conversation selected. Choose a conversation to view transcripts, notes, and associated actions.' />
				)
			}
		>
			<ConversationsList />
		</ContentContainer>
	);
};

export default ConversationsPage;
