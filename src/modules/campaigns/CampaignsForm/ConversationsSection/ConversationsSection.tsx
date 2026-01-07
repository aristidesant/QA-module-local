import React, { useCallback, useEffect } from 'react';
import { Text } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import SectionCard from '~/components/SectionCard';
import ConversationsList from '~/modules/conversations/ConversationsList';
import ConversationDetails from '~/modules/conversations/ConversationDetails';
import type { ConversationsModel } from '~/models/ConversationsModels';
import { useCampaignsStore } from '~/stores/campaignsStore';

interface ConversationsSectionProps {
	campaignId?: number | string;
}

const ConversationsSection: React.FC<ConversationsSectionProps> = ({
	campaignId,
}) => {
	const { t } = useTranslation('conversations');
	const setRightComponent = useCampaignsStore(
		(state) => state.setRightComponent
	);

	useEffect(() => {
		setRightComponent(null);
		return () => setRightComponent(null);
	}, [campaignId, setRightComponent]);

	const handleConversationClick = useCallback(
		(conversation: ConversationsModel) => {
			setRightComponent(<ConversationDetails id={conversation.id} />);
		},
		[setRightComponent]
	);

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
		<SectionCard
			title={t('section.title')}
			description={t('section.description')}
		>
			<ConversationsList
				campaignId={campaignId}
				onConversationClick={handleConversationClick}
			/>
		</SectionCard>
	);
};

export default ConversationsSection;
