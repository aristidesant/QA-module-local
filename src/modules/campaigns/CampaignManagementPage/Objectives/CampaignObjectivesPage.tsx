import { useState } from 'react';
import { Button } from '@mantine/core';
import { ContentContainer } from '~/components/ContentContainer/ContentContainer';
import { CampaignObjectivesContent } from '~/modules/campaigns/CampaignObjectivesContent';
import { IconTarget, IconPlus } from '@tabler/icons-react';

interface CampaignObjectivesPageProps {
	embedded?: boolean;
}

export default function CampaignObjectivesPage({
	embedded = false,
}: CampaignObjectivesPageProps) {
	const [createModalOpened, setCreateModalOpened] = useState(false);

	const content = (
		<CampaignObjectivesContent
			createModalOpened={createModalOpened}
			setCreateModalOpened={setCreateModalOpened}
		/>
	);

	if (embedded) {
		return content;
	}

	return (
		<ContentContainer
			title='Campaign Objectives'
			description='Define and manage objectives to guide your campaign strategies and measure success'
			titleIcon={<IconTarget size={24} />}
			titleRight={
				<Button
					leftSection={<IconPlus size={16} />}
					onClick={() => setCreateModalOpened(true)}
				>
					Create Objective
				</Button>
			}
		>
			{content}
		</ContentContainer>
	);
}
