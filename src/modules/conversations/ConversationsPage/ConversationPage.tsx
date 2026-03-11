import { ContentContainer } from '~/components/ContentContainer/ContentContainer';
import ConversationsList from '~/modules/conversations/ConversationsList';

const ConversationsPage = () => {
	return (
		<ContentContainer>
			<ConversationsList />
		</ContentContainer>
	);
};

export default ConversationsPage;
