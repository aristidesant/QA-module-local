import { Tabs } from '@mantine/core';
import {
	IconChecklist,
	IconGalaxy,
	IconUser,
	IconUsersGroup,
	IconList,
	IconMessages,
	IconPhoneOff,
} from '@tabler/icons-react';
import { useDispositionLabel } from '~/hooks/useDispositionLabel';
import { useCampaignsStore } from '~/stores/campaignsStore';

const CampaignTabs = () => {
	const { selectedTab, selectedCampaign, setSelectedTab, setRightComponent } =
		useCampaignsStore((state) => state);
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
				<Tabs.Tab leftSection={<IconGalaxy />} value='general'>
					General
				</Tabs.Tab>
				<Tabs.Tab leftSection={<IconUser />} value='agents'>
					Agents
				</Tabs.Tab>
				{selectedCampaign?.type === 'OUTBOUND' && (
					<Tabs.Tab leftSection={<IconUsersGroup />} value='contacts'>
						Contacts
					</Tabs.Tab>
				)}
				<Tabs.Tab leftSection={<IconList />} value='outcomes'>
					{dispositionLabel('Outcomes')}
				</Tabs.Tab>
				<Tabs.Tab leftSection={<IconMessages />} value='conversations'>
					Conversations
				</Tabs.Tab>
				<Tabs.Tab leftSection={<IconPhoneOff />} value='do-not-call'>
					Do Not Call
				</Tabs.Tab>
				<Tabs.Tab leftSection={<IconChecklist />} value='params'>
					Params
				</Tabs.Tab>
			</Tabs.List>
		</Tabs>
	);
};

export default CampaignTabs;
