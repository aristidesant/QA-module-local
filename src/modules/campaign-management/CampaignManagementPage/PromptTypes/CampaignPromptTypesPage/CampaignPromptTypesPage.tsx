import { useState } from 'react';
import { Button } from '@mantine/core';
import { IconMessageChatbot, IconPlus } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { ContentContainer } from '~/components/ContentContainer/ContentContainer';
import CampaignPromptTypesContent from '../components/CampaignPromptTypesContent';

interface CampaignPromptTypesPageProps {
	embedded?: boolean;
}

const CampaignPromptTypesPage: React.FC<CampaignPromptTypesPageProps> = ({
	embedded = false,
}) => {
	const { t } = useTranslation('campaign-management');
	const [createModalOpened, setCreateModalOpened] = useState(false);

	const content = (
		<CampaignPromptTypesContent
			createModalOpened={createModalOpened}
			setCreateModalOpened={setCreateModalOpened}
		/>
	);

	if (embedded) {
		return content;
	}

	return (
		<ContentContainer
			title={t('setup.promptTypes.title')}
			description={t('setup.promptTypes.description')}
			titleIcon={<IconMessageChatbot size={24} />}
			titleRight={
				<Button
					size='sm'
					leftSection={<IconPlus size={16} />}
					onClick={() => setCreateModalOpened(true)}
				>
					{t('setup.promptTypes.actions.create')}
				</Button>
			}
		>
			{content}
		</ContentContainer>
	);
};

export default CampaignPromptTypesPage;
