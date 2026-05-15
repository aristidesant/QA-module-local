import { Tabs } from '@mantine/core';
import { ContentContainer } from '~/components/ContentContainer/ContentContainer';
import {
	IconSettings,
	IconClipboardCheck,
	IconAdjustments,
	IconDatabase,
} from '@tabler/icons-react';
import DispositionPage from '~/modules/outcomes/DispositionPage';
import CampaignTaxonomySetupTab from './Setup/CampaignTaxonomySetupTab';
import DataCollectionTemplatesSetupTab from './Setup/DataCollectionTemplatesSetupTab';
import { useTranslation } from 'react-i18next';

export default function CampaignManagementPage() {
	const { t } = useTranslation('campaign-management');
	return (
		<ContentContainer
			title={t('title')}
			description={t('description')}
			titleIcon={<IconSettings size={24} />}
		>
			<Tabs defaultValue='setup' keepMounted={false}>
				<Tabs.List>
					<Tabs.Tab value='setup' leftSection={<IconAdjustments size={16} />}>
						{t('tabs.setup')}
					</Tabs.Tab>
					<Tabs.Tab
						value='data-collection-templates'
						leftSection={<IconDatabase size={16} />}
					>
						{t('tabs.customVariables')}
					</Tabs.Tab>
					<Tabs.Tab
						value='outcomes'
						leftSection={<IconClipboardCheck size={16} />}
					>
						{t('tabs.outcomes')}
					</Tabs.Tab>
				</Tabs.List>

				<Tabs.Panel value='setup' py='xs'>
					<CampaignTaxonomySetupTab />
				</Tabs.Panel>

				<Tabs.Panel value='data-collection-templates' py='xs'>
					<DataCollectionTemplatesSetupTab />
				</Tabs.Panel>

				<Tabs.Panel value='outcomes' py='xs'>
					<DispositionPage />
				</Tabs.Panel>
			</Tabs>
		</ContentContainer>
	);
}
