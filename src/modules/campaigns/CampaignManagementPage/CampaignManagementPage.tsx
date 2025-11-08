import { Tabs } from '@mantine/core';
import { ContentContainer } from '~/components/ContentContainer/ContentContainer';
import { IconSettings } from '@tabler/icons-react';
import CampaignCategoriesPage from './Categories/CampaignCategoriesPage';
import CampaignObjectivesPage from './Objectives/CampaignObjectivesPage';
import CampaignSchemasPage from './Schemas/CampaignSchemasPage';
import DispositionPage from './Outcomes/DispositionPage';

export default function CampaignManagementPage() {
	return (
		<ContentContainer
			title='Campaign Management'
			description='Manage campaign categories, objectives, schemas, and outcomes'
			titleIcon={<IconSettings size={24} />}
		>
			<Tabs defaultValue='categories' keepMounted={false}>
				<Tabs.List>
					<Tabs.Tab value='categories'>Categories</Tabs.Tab>
					<Tabs.Tab value='objectives'>Objectives</Tabs.Tab>
					<Tabs.Tab value='schemas'>Schemas</Tabs.Tab>
					<Tabs.Tab value='outcomes'>Outcomes</Tabs.Tab>
				</Tabs.List>

				<Tabs.Panel value='categories' pt='md'>
					<CampaignCategoriesPage embedded />
				</Tabs.Panel>

				<Tabs.Panel value='objectives' pt='md'>
					<CampaignObjectivesPage embedded />
				</Tabs.Panel>

				<Tabs.Panel value='schemas' pt='md'>
					<CampaignSchemasPage embedded />
				</Tabs.Panel>

				<Tabs.Panel value='outcomes' pt='md'>
					<DispositionPage embedded />
				</Tabs.Panel>
			</Tabs>
		</ContentContainer>
	);
}
