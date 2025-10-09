import { useState } from 'react';
import { Button } from '@mantine/core';
import { ContentContainer } from '~/components/ContentContainer/ContentContainer';
import { CampaignObjectivesContent } from '../CampaignObjectivesContent';
import { IconTarget, IconPlus } from '@tabler/icons-react';

export default function CampaignObjectivesPage() {
	const [createModalOpened, setCreateModalOpened] = useState(false);

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
			<CampaignObjectivesContent
				createModalOpened={createModalOpened}
				setCreateModalOpened={setCreateModalOpened}
			/>
		</ContentContainer>
	);
}
