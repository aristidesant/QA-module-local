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
import { useTranslation } from 'react-i18next';

const AgentSection: React.FC = () => {
	const { setRightComponent } = useCampaignsStore((state) => state);
	const { t } = useTranslation();

	useEffect(() => {
		setRightComponent?.(<AgentCampaignList />);
	}, [setRightComponent]);

	return (
		<Stack>
			<CampaignConfigurationBasic />
			<CampaignConfigurationPrompt />
			<CampaignConfigurationTools />
			<CampaignConfigurationSystemTools />
			<CampaignConfigurationKnowledgeBase />
			<CampaignConfigurationPredefinedParams />
			{/* <CampaignConfigurationTemperatureControl /> */}

			<Flex>
				<Button leftSection={<IconDeviceFloppy size={16} />} type='submit'>
					{t('common.save')}
				</Button>
			</Flex>
		</Stack>
	);
};

export default AgentSection;
