import { useState } from 'react';
import { Button } from '@mantine/core';
import { ContentContainer } from '~/components/ContentContainer/ContentContainer';
import { IconDatabase, IconPlus } from '@tabler/icons-react';
import CampaignSchemasContent from '~/modules/campaigns/CampaignManagementPage/Schemas/components/CampaignSchemasContent';

interface CampaignSchemasPageProps {
	embedded?: boolean;
}

export default function CampaignSchemasPage({
	embedded = false,
}: CampaignSchemasPageProps) {
	const [createModalOpened, setCreateModalOpened] = useState(false);

	const content = (
		<CampaignSchemasContent
			createModalOpened={createModalOpened}
			setCreateModalOpened={setCreateModalOpened}
		/>
	);

	if (embedded) {
		return content;
	}

	return (
		<ContentContainer
			title='Campaign Schemas'
			description='Define and manage contact data schemas for your campaigns'
			titleIcon={<IconDatabase size={24} />}
			titleRight={
				<Button
					leftSection={<IconPlus size={16} />}
					onClick={() => setCreateModalOpened(true)}
				>
					Create Schema
				</Button>
			}
		>
			{content}
		</ContentContainer>
	);
}
