import { useState } from 'react';
import { Tabs } from '@mantine/core';
import { IconRocket, IconCategory, IconTarget } from '@tabler/icons-react';
import { ContentContainer } from '~/components/ContentContainer/ContentContainer';
import CampaignsList from '../CampaignsList';
import { useCampaignsStore } from '~/stores/campaignsStore';
import { CampaignsForm } from '../CampaignsForm/CampaignsForm';
import { CampaignCategoriesContent } from '../CampaignCategoriesContent';
import { CampaignObjectivesContent } from '../CampaignObjectivesContent';
import { Campaign } from '~/models/CampaignsModel';
import { useGetCampaign } from '~/queries/campaignsQueries';
import styles from './CampaignsPage.module.css';

export default function CampaignsPage() {
	const [activeTab, setActiveTab] = useState<string | null>('campaigns');

	const { selectedCampaign, editCampaign } = useCampaignsStore(
		(state) => state
	);
	const { data: campaign } = useGetCampaign(
		selectedCampaign?.id ? `${selectedCampaign?.id}` : ``
	); // Ensure campaign data is fresh

	// Determine the right section based on the state
	const getRightSection = () => {
		if (activeTab === 'campaigns' && editCampaign && campaign) {
			return null; // CampaignsForm will handle its own layout
		}
		return null;
	};

	// Render campaigns content based on state
	const renderCampaignsContent = () => {
		if (editCampaign && campaign) {
			return <CampaignsForm campaign={campaign as Campaign} />;
		}
		return <CampaignsList />;
	};

	return (
		<ContentContainer
			title='Campaigns'
			description='Manage your campaigns, organize them with categories, and define objectives'
			rightSection={getRightSection()}
		>
			<Tabs
				value={activeTab}
				onChange={setActiveTab}
				className={styles.tabs}
				keepMounted={false}
				variant='default'
			>
				<Tabs.List className={styles.tabsList} grow>
					<Tabs.Tab
						value='campaigns'
						leftSection={<IconRocket size={18} />}
						className={styles.tab}
					>
						Campaign List
					</Tabs.Tab>
					<Tabs.Tab
						value='categories'
						leftSection={<IconCategory size={18} />}
						className={styles.tab}
					>
						Campaign Categories
					</Tabs.Tab>
					<Tabs.Tab
						value='objectives'
						leftSection={<IconTarget size={18} />}
						className={styles.tab}
					>
						Campaign Objectives
					</Tabs.Tab>
				</Tabs.List>

				<Tabs.Panel value='campaigns' className={styles.tabPanel}>
					{renderCampaignsContent()}
				</Tabs.Panel>

				<Tabs.Panel value='categories' className={styles.tabPanel}>
					<CampaignCategoriesContent />
				</Tabs.Panel>

				<Tabs.Panel value='objectives' className={styles.tabPanel}>
					<CampaignObjectivesContent />
				</Tabs.Panel>
			</Tabs>
		</ContentContainer>
	);
}
