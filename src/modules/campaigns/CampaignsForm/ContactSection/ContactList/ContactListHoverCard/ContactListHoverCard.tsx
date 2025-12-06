import { Badge, HoverCard, Stack, Text, ThemeIcon } from '@mantine/core';
import { IconInfoCircle } from '@tabler/icons-react';
import type ContactGroup from '~/models/ContactGroup';

interface ContactListHoverCardProps {
	contactGroup: ContactGroup;
}

export const ContactListHoverCard = ({
	contactGroup,
}: ContactListHoverCardProps) => {
	return (
		<HoverCard shadow='md' radius='md' withArrow>
			<HoverCard.Target>
				<ThemeIcon variant='transparent' style={{ cursor: 'pointer' }}>
					<IconInfoCircle size={16} />
				</ThemeIcon>
			</HoverCard.Target>
			<HoverCard.Dropdown>
				<Stack gap='xs'>
					<div>
						<Text size='sm' fw={500}>
							{contactGroup.name}
						</Text>
						{contactGroup.description && (
							<Text size='xs' c='dimmed' mt={4}>
								{contactGroup.description}
							</Text>
						)}
					</div>
					<Text size='xs'>
						<strong>Contacts:</strong> {contactGroup.contactCount}
					</Text>
					<Text size='xs'>
						<strong>Queue Status:</strong> {contactGroup.queueStatus}
					</Text>
					<Text size='xs'>
						<strong>Waves:</strong>{' '}
						{contactGroup.maxWaves
							? `${contactGroup.currentWave ?? 1} / ${contactGroup.maxWaves}`
							: 'Not set'}
					</Text>
					<Text size='xs'>
						<strong>Max Calls per Contact:</strong>{' '}
						{contactGroup.maxCallsPerContact}
					</Text>
					<Text size='xs'>
						<strong>Max Calls per List:</strong> {contactGroup.maxCallsPerList}
					</Text>
					<Badge size='sm' variant='light'>
						{contactGroup.isActive ? 'Active' : 'Inactive'}
					</Badge>
				</Stack>
			</HoverCard.Dropdown>
		</HoverCard>
	);
};

export default ContactListHoverCard;
