import { Button } from '@mantine/core';
import { ContentContainer } from '~/components/ContentContainer/ContentContainer';
import { CampaignObjectivesContent } from '../CampaignObjectivesContent';
import { IconTarget, IconPlus } from '@tabler/icons-react';

export default function CampaignObjectivesPage() {
	return (
		<ContentContainer
			title='Campaign Objectives'
			description='Define and manage objectives to guide your campaign strategies and measure success'
			titleIcon={<IconTarget size={24} />}
			titleRight={
				<Button
					leftSection={<IconPlus size={16} />}
					onClick={() => {
						// This will be handled by the child component
						const event = new CustomEvent('openCreateObjectiveModal');
						window.dispatchEvent(event);
					}}
				>
					Create Objective
				</Button>
			}
		>
			<CampaignObjectivesContent />
		</ContentContainer>
	);
}
