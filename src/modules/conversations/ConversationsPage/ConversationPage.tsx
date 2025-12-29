import { ContentContainer } from '~/components/ContentContainer/ContentContainer';
import { useConversationStore } from '~/stores/useConversationStore';
import FallbackRightComponent from '~/components/FallbackRightComponent';
import { useEffect } from 'react';
import ConversationsList from '~/modules/conversations/ConversationsList';
import { useTranslation } from 'react-i18next';

const ConversationsPage = () => {
	const { t } = useTranslation(['conversations', 'common']);
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
			rightSection={
				selectionContent || (
					<FallbackRightComponent
						title={t('status.nothingSelected', { ns: 'common' })}
						description={t('page.fallback')}
					/>
				)
			}
		>
			<ConversationsList />
		</ContentContainer>
	);
};

export default ConversationsPage;
