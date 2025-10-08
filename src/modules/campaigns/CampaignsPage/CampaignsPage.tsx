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
		selectedCampaign?.id ? `${selectedCampaign?.id}` : ''
	);

	// Only campaigns tab needs special handling (form vs list). Other tabs just render content.
	const renderCampaignsContent = () => {
		if (editCampaign && campaign)
			return <CampaignsForm campaign={campaign as Campaign} />;
		return <CampaignsList />; // This component already provides its own ContentContainer with rightSection scrolling
	};

	return (
		// For categories/objectives we still want a shell, so we keep one top-level container
		<ContentContainer
			title='Campaigns'
			description='Manage your campaigns, organize them with categories, and define objectives'
			mainScroll={activeTab !== 'campaigns'}
		>
			<Tabs
				value={activeTab}
				onChange={setActiveTab}
				className={styles.tabsSimplified}
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

				<Tabs.Panel value='campaigns' className={styles.tabPanelNoScroll}>
					{renderCampaignsContent()}
				</Tabs.Panel>
				<Tabs.Panel value='categories' className={styles.tabPanelShell}>
					<CampaignCategoriesContent />
				</Tabs.Panel>
				<Tabs.Panel value='objectives' className={styles.tabPanelShell}>
					<CampaignObjectivesContent />
				</Tabs.Panel>
			</Tabs>
		</ContentContainer>
	);
}
