import { Badge, Stack, Table } from '@mantine/core';
import { BarChart } from '@mantine/charts';
import { IconHeadset } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { SectionCard } from '~/components/SectionCard';
import type { CustomerProfile } from '../../types';
import { ContactsTable } from '../../components/ContactsTable';

interface ContactsTabProps {
	profile: CustomerProfile;
}

export function ContactsTab({ profile }: ContactsTabProps) {
	const { t } = useTranslation('qa.customers');
	const { contacts, offers, sentimentByAgent } = profile;

	return (
		<Stack gap='md'>
			<SectionCard
				title={t('contacts.title')}
				description={t('contacts.description')}
				headerActions={<Badge variant='light'>{t('contacts.contactsCount', { count: contacts.length })}</Badge>}
			>
				<ContactsTable contacts={contacts} offers={offers} />
			</SectionCard>

			<SectionCard title={t('contacts.byAgent')} description={t('contacts.byAgentDescription')} icon={IconHeadset}>
				<BarChart
					h={200}
					data={sentimentByAgent}
					dataKey='agentName'
					series={[{ name: 'avgSentiment', color: 'orange.6' }]}
					yAxisProps={{ domain: [1, 5] }}
				/>
				<Table striped highlightOnHover mt='md'>
					<Table.Thead>
						<Table.Tr>
							<Table.Th>{t('contacts.columns.agent')}</Table.Th>
							<Table.Th>{t('list.columns.contacts')}</Table.Th>
							<Table.Th>{t('sentiment.average')}</Table.Th>
						</Table.Tr>
					</Table.Thead>
					<Table.Tbody>
						{sentimentByAgent.map((row) => (
							<Table.Tr key={row.agentName}>
								<Table.Td>{row.agentName}</Table.Td>
								<Table.Td>{row.contacts}</Table.Td>
								<Table.Td>{row.avgSentiment.toFixed(1)}/5</Table.Td>
							</Table.Tr>
						))}
					</Table.Tbody>
				</Table>
			</SectionCard>
		</Stack>
	);
}
