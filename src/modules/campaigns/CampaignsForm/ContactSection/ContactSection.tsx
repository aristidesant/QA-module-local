import { useState } from 'react';
import { Tabs } from '@mantine/core';
import { IconUsers, IconUserOff } from '@tabler/icons-react';
import { ContactListContainer } from './ContactList';
import { useTranslation } from 'react-i18next';
import styles from './ContactSection.module.css';

export const ContactSection = () => {
	const { t } = useTranslation('campaign.view');
	const [activeTab, setActiveTab] = useState<string | null>('active');

	const handleTabChange = (value: string | null) => {
		setActiveTab(value);
	};

	return (
		<Tabs
			value={activeTab}
			onChange={handleTabChange}
			variant='outline'
			keepMounted={false}
			classNames={{
				root: styles.tabsRoot,
				list: styles.tabsList,
				tab: styles.tab,
				panel: styles.tabPanel,
			}}
		>
			<Tabs.List>
				<Tabs.Tab value='active' leftSection={<IconUsers size={16} />}>
					{t('contacts.tabs.active')}
				</Tabs.Tab>
				<Tabs.Tab value='inactive' leftSection={<IconUserOff size={16} />}>
					{t('contacts.tabs.inactive')}
				</Tabs.Tab>
			</Tabs.List>

			<Tabs.Panel value='active'>
				<ContactListContainer isActive={true} />
			</Tabs.Panel>

			<Tabs.Panel value='inactive'>
				<ContactListContainer isActive={false} />
			</Tabs.Panel>
		</Tabs>
	);
};
