import { Tabs, rem } from '@mantine/core';
import {
	IconSettings,
	IconList,
	IconGlobe,
	IconPhoneOff,
	IconLibrary,
} from '@tabler/icons-react';
import { Outlet, useLocation, useNavigate } from 'react-router';
import styles from './ConfigurationsPage.module.css';
export default function ConfigurationsPage() {
	const location = useLocation();
	const navigate = useNavigate();

	const getActiveTab = () => {
		if (location.pathname.includes('client-configs')) return 'client-configs';
		if (location.pathname.includes('campaign-predefined-params'))
			return 'campaign-predefined-params';
		if (location.pathname.includes('regional-settings-params'))
			return 'regional-settings-params';
		if (location.pathname.includes('do-not-call')) return 'do-not-call';
		if (location.pathname.includes('knowledge-bases')) return 'knowledge-bases';
		return 'client-configs';
	};

	return (
		<div className={styles.container}>
			<Tabs value={getActiveTab()} variant='outline'>
				<Tabs.List>
					<Tabs.Tab
						value='client-configs'
						leftSection={
							<IconSettings style={{ width: rem(16), height: rem(16) }} />
						}
						onClick={() => navigate('/configurations/client-configs')}
					>
						Global
					</Tabs.Tab>
					<Tabs.Tab
						value='campaign-predefined-params'
						leftSection={
							<IconList style={{ width: rem(16), height: rem(16) }} />
						}
						onClick={() =>
							navigate('/configurations/campaign-predefined-params')
						}
					>
						Campaign
					</Tabs.Tab>
					<Tabs.Tab
						value='regional-settings-params'
						leftSection={
							<IconGlobe style={{ width: rem(16), height: rem(16) }} />
						}
						onClick={() => navigate('/configurations/regional-settings-params')}
					>
						Regional
					</Tabs.Tab>
					<Tabs.Tab
						value='do-not-call'
						leftSection={
							<IconPhoneOff style={{ width: rem(16), height: rem(16) }} />
						}
						onClick={() => navigate('/configurations/do-not-call')}
					>
						Do Not Call
					</Tabs.Tab>
					<Tabs.Tab
						value='knowledge-bases'
						leftSection={
							<IconLibrary style={{ width: rem(16), height: rem(16) }} />
						}
						onClick={() => navigate('/configurations/knowledge-bases')}
					>
						Knowledge Base
					</Tabs.Tab>
				</Tabs.List>

				<Tabs.Panel value={getActiveTab()}>
					<Outlet />
				</Tabs.Panel>
			</Tabs>
		</div>
	);
}
