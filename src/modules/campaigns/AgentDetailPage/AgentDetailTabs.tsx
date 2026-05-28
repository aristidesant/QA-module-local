import { Stack, Tabs } from '@mantine/core';
import {
	IconBrain,
	IconGitBranch,
	IconRoute,
	IconSettings,
} from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import VersioningSection from '../CampaignsForm/VersioningSection';
import CampaignConfigurationBasic from '../CampaignsForm/AgentSection/CampaignConfigurationBasic/CampaignConfigurationBasic';
import CampaignConfigurationPredefinedParams from '../CampaignsForm/AgentSection/CampaignConfigurationPredefinedParams';
import CampaignConfigurationPrompt from '../CampaignsForm/AgentSection/CampaignConfigurationPrompt/CampaignConfigurationPrompt';
import WorkflowSection from '../CampaignsForm/WorkflowSection/WorkflowSection';
import AdvancedTab from './AdvancedTab';
import styles from './AgentDetailPage.module.css';

export type AgentTabValue = 'setup' | 'workflow' | 'advanced' | 'versioning';

interface AgentDetailTabsProps {
	agentId: string;
	value: AgentTabValue;
	onChange: (value: AgentTabValue) => void;
}

const AgentDetailTabs = ({
	agentId,
	value,
	onChange,
}: AgentDetailTabsProps) => {
	const { t } = useTranslation(['campaign.form.agents']);

	return (
		<Tabs
			value={value}
			onChange={(nextValue) =>
				onChange((nextValue as AgentTabValue) || 'setup')
			}
			keepMounted
			classNames={{
				list: styles.tabList,
				tab: styles.tab,
				panel: styles.tabPanel,
			}}
		>
			<Tabs.List>
				<Tabs.Tab value='setup' leftSection={<IconBrain size={16} />}>
					{t('agentDetail.tabs.setup')}
				</Tabs.Tab>
				<Tabs.Tab value='workflow' leftSection={<IconRoute size={16} />}>
					{t('agentDetail.tabs.workflow')}
				</Tabs.Tab>
				<Tabs.Tab value='advanced' leftSection={<IconSettings size={16} />}>
					{t('agentDetail.tabs.advanced')}
				</Tabs.Tab>
				<Tabs.Tab value='versioning' leftSection={<IconGitBranch size={16} />}>
					{t('agentDetail.tabs.versioning')}
				</Tabs.Tab>
			</Tabs.List>

			<Tabs.Panel value='setup'>
				<Stack gap='sm'>
					<CampaignConfigurationPrompt />
					<CampaignConfigurationBasic />
					<CampaignConfigurationPredefinedParams />
				</Stack>
			</Tabs.Panel>

			<Tabs.Panel value='workflow'>
				<WorkflowSection showAgentSelector={false} />
			</Tabs.Panel>

			<Tabs.Panel value='advanced'>
				<AdvancedTab agentId={agentId} />
			</Tabs.Panel>

			<Tabs.Panel value='versioning'>
				<VersioningSection agentId={agentId} />
			</Tabs.Panel>
		</Tabs>
	);
};

export default AgentDetailTabs;
