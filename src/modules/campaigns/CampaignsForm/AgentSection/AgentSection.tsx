import { Button, Flex, Stack } from '@mantine/core';
import CampaignConfigurationBasic from './CampaignConfigurationBasic/CampaignConfigurationBasic';
import CampaignConfigurationPrompt from './CampaignConfigurationPrompt/CampaignConfigurationPrompt';
import { IconDeviceFloppy } from '@tabler/icons-react';
import CampaignConfigurationTools from './CampaignConfigurationTools';
import CampaignConfigurationKnowledgeBase from './CampaignConfigurationKnowledgeBase';
import CampaignConfigurationPredefinedParams from './CampaignConfigurationPredefinedParams';
import CampaignConfigurationSystemTools from './CampaignConfigurationSystemTools';
import CampaignConfigurationPhoneNumber from './CampaignConfigurationPhoneNumber/CampaignConfigurationPhoneNumber';
import { useTranslation } from 'react-i18next';

const AgentSection: React.FC = () => {
	const { t } = useTranslation(['campaigns', 'campaign.detail', 'common']);

	return (
		<Stack>
			<CampaignConfigurationBasic />
			<CampaignConfigurationPhoneNumber />
			<CampaignConfigurationPrompt />
			<CampaignConfigurationTools />
			<CampaignConfigurationSystemTools />
			<CampaignConfigurationKnowledgeBase />
			<CampaignConfigurationPredefinedParams />
			{/* <CampaignConfigurationTemperatureControl /> */}

			<Flex>
				<Button leftSection={<IconDeviceFloppy size={16} />} type='submit'>
					{t('actions.save', { ns: 'common' })}
				</Button>
			</Flex>
		</Stack>
	);
};

export default AgentSection;
