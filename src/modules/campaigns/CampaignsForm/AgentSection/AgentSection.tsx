import { useEffect } from 'react';
import { useCampaignsStore } from '~/stores/campaignsStore';
import AgentCampaignList from './AgentCampaignList';
import { Button, Flex, Stack } from '@mantine/core';
import CampaignConfigurationBasic from './CampaignConfigurationBasic/CampaignConfigurationBasic';
import CampaignConfigurationPrompt from './CampaignConfigurationPrompt/CampaignConfigurationPrompt';
import { IconDeviceFloppy } from '@tabler/icons-react';
import CampaignConfigurationTools from './CampaignConfigurationTools';
import CampaignConfigurationKnowledgeBase from './CampaignConfigurationKnowledgeBase';
import CampaignConfigurationPredefinedParams from './CampaignConfigurationPredefinedParams';
import CampaignConfigurationSystemTools from './CampaignConfigurationSystemTools';

const AgentSection: React.FC = () => {
	const { setRightComponent } = useCampaignsStore((state) => state);

	useEffect(() => {
		setRightComponent?.(<AgentCampaignList />); // Clear the right component when this section mounts
	}, []);

	return (
		<Stack>
			<CampaignConfigurationBasic />
			<CampaignConfigurationPrompt />
			<CampaignConfigurationPredefinedParams />
			<CampaignConfigurationSystemTools />
			{/* <CampaignConfigurationTemperatureControl /> */}
			<CampaignConfigurationTools />
			<CampaignConfigurationKnowledgeBase />

			<Flex>
				<Button leftSection={<IconDeviceFloppy size={16} />} type='submit'>
					Save
				</Button>
			</Flex>
		</Stack>
	);
};

export default AgentSection;
