import { Tabs } from '@mantine/core';
import { ContentContainer } from '~/components/ContentContainer/ContentContainer';
import {
	IconSettings,
	IconCategory,
	IconTarget,
	IconSchema,
	IconClipboardCheck,
	IconMessageChatbot,
} from '@tabler/icons-react';
import CampaignCategoriesPage from './Categories/CampaignCategoriesPage';
import CampaignObjectivesPage from './Objectives/CampaignObjectivesPage';
import CampaignSchemasPage from './Schemas/CampaignSchemasPage';
import DispositionPage from './Outcomes/DispositionPage';
import CampaignPromptTypesPage from './PromptTypes';
import classes from './CampaignManagementPage.module.css';

export default function CampaignManagementPage() {
	return (
		<ContentContainer
			title='Campaign Management'
			description='Manage campaign categories, objectives, schemas, prompt types, and outcomes'
			titleIcon={<IconSettings size={24} />}
		>
			<Tabs
				defaultValue='categories'
				keepMounted={false}
				variant='outline'
				radius='md'
				classNames={{ tab: classes.tab }}
			>
				<Tabs.List>
					<Tabs.Tab value='categories' leftSection={<IconCategory size={16} />}>
						Categories
					</Tabs.Tab>
					<Tabs.Tab value='objectives' leftSection={<IconTarget size={16} />}>
						Objectives
					</Tabs.Tab>

					<Tabs.Tab value='schemas' leftSection={<IconSchema size={16} />}>
						Schemas
					</Tabs.Tab>
					<Tabs.Tab
						value='outcomes'
						leftSection={<IconClipboardCheck size={16} />}
					>
						Outcomes
					</Tabs.Tab>
					<Tabs.Tab
						value='promptTypes'
						leftSection={<IconMessageChatbot size={16} />}
					>
						Prompt Types
					</Tabs.Tab>
				</Tabs.List>

				<Tabs.Panel value='categories' py='xs'>
					<CampaignCategoriesPage embedded />
				</Tabs.Panel>

				<Tabs.Panel value='objectives' py='xs'>
					<CampaignObjectivesPage embedded />
				</Tabs.Panel>

				<Tabs.Panel value='promptTypes' py='xs'>
					<CampaignPromptTypesPage embedded />
				</Tabs.Panel>

				<Tabs.Panel value='schemas' py='xs'>
					<CampaignSchemasPage embedded />
				</Tabs.Panel>

				<Tabs.Panel value='outcomes' py='xs'>
					<DispositionPage embedded />
				</Tabs.Panel>
			</Tabs>
		</ContentContainer>
	);
}
