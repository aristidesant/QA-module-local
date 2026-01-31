import { Tabs } from '@mantine/core';
import {
	IconChecklist,
	IconGalaxy,
	IconRoute,
	IconUser,
	IconList,
} from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { useDispositionLabel } from '~/hooks/useDispositionLabel';
import { useCampaignsStore } from '~/stores/campaignsStore';

const CampaignTabs = () => {
	const { selectedTab, setSelectedTab, setRightComponent } = useCampaignsStore(
		(state) => state
	);
	const { t } = useTranslation('campaigns');
	const dispositionLabel = useDispositionLabel();
	return (
		<Tabs
			value={selectedTab}
			onChange={(v) => {
				if (v) {
					setSelectedTab(v);
					setRightComponent?.(undefined);
				}
			}}
			variant='default'
			radius='md'
		>
			<Tabs.List>
				<Tabs.Tab leftSection={<IconUser />} value='agents'>
					{t('list.tabs.agents')}
				</Tabs.Tab>
				<Tabs.Tab leftSection={<IconRoute />} value='workflow'>
					{t('list.tabs.workflow')}
				</Tabs.Tab>
				<Tabs.Tab leftSection={<IconList />} value='outcomes'>
					{dispositionLabel(t('list.tabs.outcomes'))}
				</Tabs.Tab>
				<Tabs.Tab leftSection={<IconChecklist />} value='params'>
					{t('list.tabs.params')}
				</Tabs.Tab>
				<Tabs.Tab leftSection={<IconGalaxy />} value='general'>
					{t('list.tabs.general')}
				</Tabs.Tab>
			</Tabs.List>
		</Tabs>
	);
};

export default CampaignTabs;
