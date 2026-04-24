import React from 'react';
import { Card, Text, Stack, Group, ThemeIcon } from '@mantine/core';
import { IconPhone } from '@tabler/icons-react';
import styles from './ContactsList.module.css';
import type { ContactList } from '~/models/CampaignsModel';

interface ContactsListProps {
	contactList?: ContactList;
}

const ContactsList: React.FC<ContactsListProps> = ({ contactList }) => {
	// Mock data with fallbacks
	const mockContactLists: ContactList[] = contactList
		? [contactList]
		: [
				{
					id: 1,
					name: 'bancopopular_contactos',
					totalContacts: 2154,
					status: 'active',
					source: 'csv',
				},
				{
					id: 2,
					name: 'bancopopular_contactos',
					totalContacts: 2154,
					status: 'active',
					source: 'csv',
				},
			];

	// Mock metrics
	const boundRate = 82;
	const contactQuality = 28;

	return (
		<Stack gap='md' mt='sm'>
			<div>
				<Text fw={600} size='md' className={styles.title}>
					Contacts list
				</Text>
				<Text size='xs' c='dimmed' className={styles.subtitle}>
					These contacts have been selected for this campaign.
				</Text>
			</div>

			<Stack gap='xs' className={styles.contactsList}>
				{mockContactLists.map((list) => (
					<Card
						key={list.id}
						radius='md'
						padding='sm'
						withBorder
						className={styles.contactCard}
					>
						<Group gap='md' className={styles.contactItem}>
							<ThemeIcon
								size={32}
								radius='xl'
								variant='light'
								color='blue'
								className={styles.contactIcon}
							>
								<IconPhone size={16} />
							</ThemeIcon>
							<div className={styles.contactInfo}>
								<Text fw={500} size='sm' className={styles.contactCount}>
									{list.totalContacts.toLocaleString()}
								</Text>
								<Text size='xs' c='dimmed' className={styles.contactName}>
									{list.name}
								</Text>
							</div>
						</Group>
					</Card>
				))}

				<Group gap='xs' className={styles.metricsContainer}>
					<Card
						radius='md'
						padding='sm'
						withBorder
						className={styles.metricCard}
					>
						<div className={styles.metric}>
							<Text size='lg' fw={700} c='green' className={styles.metricValue}>
								{boundRate}/100
							</Text>
							<Text size='xs' fw={500} c='dark' className={styles.metricLabel}>
								Bound Rate
							</Text>
						</div>
					</Card>
					<Card
						radius='md'
						padding='sm'
						withBorder
						className={styles.metricCard}
					>
						<div className={styles.metric}>
							<Text size='lg' fw={700} c='green' className={styles.metricValue}>
								{contactQuality}%
							</Text>
							<Text size='xs' fw={500} c='dark' className={styles.metricLabel}>
								Contact Quality
							</Text>
						</div>
					</Card>
				</Group>
			</Stack>
		</Stack>
	);
};

export default ContactsList;
