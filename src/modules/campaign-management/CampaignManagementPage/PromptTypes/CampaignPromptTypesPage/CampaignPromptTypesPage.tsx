import { useState } from 'react';
import { Button } from '@mantine/core';
import { IconMessageChatbot, IconPlus } from '@tabler/icons-react';
import { ContentContainer } from '~/components/ContentContainer/ContentContainer';
import CampaignPromptTypesContent from '../components/CampaignPromptTypesContent';

interface CampaignPromptTypesPageProps {
	embedded?: boolean;
}

const CampaignPromptTypesPage: React.FC<CampaignPromptTypesPageProps> = ({
	embedded = false,
}) => {
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
			title='Campaign Prompt Types'
			description='Manage the prompt types that organize campaign prompts.'
			titleIcon={<IconMessageChatbot size={24} />}
			titleRight={
				<Button
					leftSection={<IconPlus size={16} />}
					onClick={() => setCreateModalOpened(true)}
				>
					Create Prompt Type
				</Button>
			}
		>
			{content}
		</ContentContainer>
	);
};

export default CampaignPromptTypesPage;
