import { useState } from 'react';
import { Tabs } from '@mantine/core';
import { IconUsers, IconUserOff } from '@tabler/icons-react';
import { ContactListContainer } from './ContactList';
import { useTranslation } from 'react-i18next';

export const ContactSection = () => {
	const { t } = useTranslation();
	const [activeTab, setActiveTab] = useState<string | null>('active');

	return (
		<Tabs
			value={activeTab}
			onChange={setActiveTab}
			variant='outline'
			keepMounted={false}
		>
			<Tabs.List>
				<Tabs.Tab value='active' leftSection={<IconUsers size={16} />}>
					{t('campaigns.form.contacts.tabs.active')}
				</Tabs.Tab>
				<Tabs.Tab value='inactive' leftSection={<IconUserOff size={16} />}>
					{t('campaigns.form.contacts.tabs.inactive')}
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
