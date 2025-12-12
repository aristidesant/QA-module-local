import { Tabs } from '@mantine/core';
import { ContentContainer } from '~/components/ContentContainer/ContentContainer';
import {
	IconSettings,
	IconClipboardCheck,
	IconMessageChatbot,
	IconAdjustments,
} from '@tabler/icons-react';
import DispositionPage from './Outcomes/DispositionPage';
import CampaignPromptTypesPage from './PromptTypes';
import CampaignTaxonomySetupTab from './Setup/CampaignTaxonomySetupTab';
import classes from './CampaignManagementPage.module.css';

export default function CampaignManagementPage() {
	return (
		<ContentContainer
			title='Campaign Management'
			description='Manage campaign categories, objectives, schemas, prompt types, and outcomes'
			titleIcon={<IconSettings size={24} />}
		>
			<Tabs
				defaultValue='setup'
				keepMounted={false}
				variant='outline'
				radius='md'
				classNames={{ tab: classes.tab }}
			>
				<Tabs.List>
					<Tabs.Tab value='setup' leftSection={<IconAdjustments size={16} />}>
						Campaign Setup
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

				<Tabs.Panel value='setup' py='xs'>
					<CampaignTaxonomySetupTab />
				</Tabs.Panel>

				<Tabs.Panel value='promptTypes' py='xs'>
					<CampaignPromptTypesPage embedded />
				</Tabs.Panel>

				<Tabs.Panel value='outcomes' py='xs'>
					<DispositionPage embedded />
				</Tabs.Panel>
			</Tabs>
		</ContentContainer>
	);
}
