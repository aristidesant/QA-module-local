import { Tabs } from '@mantine/core';
import {
	IconChecklist,
	IconChartBar,
	IconGalaxy,
	IconGitBranch,
	IconMicrophone,
	IconUser,
	IconList,
	IconLayoutDashboard,
} from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { useDispositionLabel } from '~/hooks/useDispositionLabel';
import { useCampaignsStore } from '~/stores/campaignsStore';

interface CampaignTabsProps {
	hasVoicesTab?: boolean;
}

const CampaignTabs = ({ hasVoicesTab = false }: CampaignTabsProps) => {
	const { selectedTab, setSelectedTab, setRightComponent } = useCampaignsStore(
		(state) => state
	);
	const { t } = useTranslation('campaign.form.shared');
	const dispositionLabel = useDispositionLabel();
	return (
		<Tabs
			value={selectedTab}
			onChange={(v) => {
				if (v) {
					setSelectedTab(v);
					setRightComponent?.(null);
				}
			}}
			variant='default'
			radius='md'
		>
			<Tabs.List>
				<Tabs.Tab leftSection={<IconUser />} value='agents'>
					{t('tabs.agents')}
				</Tabs.Tab>
				<Tabs.Tab leftSection={<IconList />} value='outcomes'>
					{dispositionLabel(t('tabs.outcomes'))}
				</Tabs.Tab>
				<Tabs.Tab leftSection={<IconChecklist />} value='params'>
					{t('tabs.params')}
				</Tabs.Tab>
				<Tabs.Tab leftSection={<IconChartBar />} value='analytics'>
					{t('tabs.analytics')}
				</Tabs.Tab>
				<Tabs.Tab leftSection={<IconLayoutDashboard />} value='dashboards'>
					{t('tabs.dashboards')}
				</Tabs.Tab>
				<Tabs.Tab leftSection={<IconGalaxy />} value='general'>
					{t('tabs.general')}
				</Tabs.Tab>
				{hasVoicesTab && (
					<Tabs.Tab leftSection={<IconMicrophone />} value='voices'>
						{t('tabs.voices')}
					</Tabs.Tab>
				)}
				<Tabs.Tab leftSection={<IconGitBranch />} value='versioning'>
					{t('tabs.versioning')}
				</Tabs.Tab>
			</Tabs.List>
		</Tabs>
	);
};

export default CampaignTabs;
