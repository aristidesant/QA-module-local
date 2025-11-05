import { useState } from 'react';
import { Button, Collapse } from '@mantine/core';
import { IconChevronDown, IconChevronUp } from '@tabler/icons-react';
import { ContactListContainer } from './ContactList';

export const ContactSection = () => {
	const [inactiveCollapsed, setInactiveCollapsed] = useState(true);

	return (
		<>
			<ContactListContainer isActive={true} />
			<Button
				variant='subtle'
				leftSection={
					inactiveCollapsed ? (
						<IconChevronDown size={16} />
					) : (
						<IconChevronUp size={16} />
					)
				}
				onClick={() => setInactiveCollapsed(!inactiveCollapsed)}
				style={{ marginBottom: '1rem' }}
			>
				{inactiveCollapsed ? 'Show' : 'Hide'} Inactive Contact Lists
			</Button>
			<Collapse in={!inactiveCollapsed}>
				<ContactListContainer isActive={false} />
			</Collapse>
		</>
	);
};
