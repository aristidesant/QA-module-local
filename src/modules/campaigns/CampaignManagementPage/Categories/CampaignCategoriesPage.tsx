import { useState } from 'react';
import { Button } from '@mantine/core';
import { ContentContainer } from '~/components/ContentContainer/ContentContainer';
import { CampaignCategoriesContent } from '~/modules/campaigns/CampaignCategoriesContent';
import { IconCategory, IconPlus } from '@tabler/icons-react';

interface CampaignCategoriesPageProps {
	embedded?: boolean;
}

export default function CampaignCategoriesPage({
	embedded = false,
}: CampaignCategoriesPageProps) {
	const [createModalOpened, setCreateModalOpened] = useState(false);

	const content = (
		<CampaignCategoriesContent
			createModalOpened={createModalOpened}
			setCreateModalOpened={setCreateModalOpened}
		/>
	);

	if (embedded) {
		return content;
	}

	return (
		<ContentContainer
			title='Campaign Categories'
			description='Organize and manage campaign categories to better structure your campaigns'
			titleIcon={<IconCategory size={24} />}
			titleRight={
				<Button
					leftSection={<IconPlus size={16} />}
					onClick={() => setCreateModalOpened(true)}
				>
					Create Category
				</Button>
			}
		>
			{content}
		</ContentContainer>
	);
}
