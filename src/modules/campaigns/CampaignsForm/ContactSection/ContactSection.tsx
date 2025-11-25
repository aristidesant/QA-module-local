import { useState } from 'react';
import { Tabs } from '@mantine/core';
import { IconUsers, IconUserOff } from '@tabler/icons-react';
import { ContactListContainer } from './ContactList';

export const ContactSection = () => {
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
					Active Lists
				</Tabs.Tab>
				<Tabs.Tab value='inactive' leftSection={<IconUserOff size={16} />}>
					Inactive Lists
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
