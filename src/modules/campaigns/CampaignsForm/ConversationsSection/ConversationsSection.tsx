import React from 'react';
import { Text } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import SectionCard from '~/components/SectionCard';
import ConversationsList from '~/modules/conversations/ConversationsList';
import ConversationDetailDrawer from '~/modules/conversations/ConversationDetailDrawer';
import { useConversationDrawer } from '~/modules/conversations/ConversationDetailDrawer/useConversationDrawer';

interface ConversationsSectionProps {
	campaignId?: number | string;
}

const ConversationsSection: React.FC<ConversationsSectionProps> = ({
	campaignId,
}) => {
	const { t } = useTranslation('conversations');
	const {
		selectedConversationId,
		drawerOpened,
		openConversation,
		closeDrawer,
	} = useConversationDrawer();

	if (!campaignId) {
		return (
			<SectionCard
				title={t('section.title')}
				description={t('section.description')}
			>
				<Text size='sm' c='dimmed'>
					{t('section.notSaved')}
				</Text>
			</SectionCard>
		);
	}

	return (
		<>
			<ConversationsList
				campaignId={campaignId}
				onRowClick={openConversation}
			/>
			<ConversationDetailDrawer
				conversationId={selectedConversationId}
				opened={drawerOpened}
				onClose={closeDrawer}
			/>
		</>
	);
};

export default ConversationsSection;
