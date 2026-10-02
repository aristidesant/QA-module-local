import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Stack, Tabs, Text, Title } from '@mantine/core';
import {
	IconChartHistogram,
	IconClipboardCheck,
	IconMoodSmile,
	IconShieldCheck,
} from '@tabler/icons-react';
import ContentContainer from '~/components/ContentContainer';
import { BusinessTab } from './tabs/BusinessTab';
import { ComplianceTab } from './tabs/ComplianceTab';
import { QualityAssuranceTab } from './tabs/QualityAssuranceTab';
import { SentimentTab } from './tabs/SentimentTab';

/**
 * QA Manager Settings: the thresholds behind every label on the dashboards
 * (On target / Watch / At risk, sentiment bands, incidents).
 */
export const SettingsPage: React.FC = () => {
	const { t } = useTranslation('qa.settings');
	const [tab, setTab] = useState<string | null>('qa');

	return (
		<ContentContainer contentWidth='full'>
			<Stack gap='lg'>
				<Stack gap={0}>
					<Text size='xs' c='dimmed' tt='uppercase' fw={600}>
						{t('page.eyebrow')}
					</Text>
					<Title order={1}>{t('page.title')}</Title>
					<Text c='dimmed' size='sm'>
						{t('page.description')}
					</Text>
				</Stack>

				<Tabs value={tab} onChange={setTab}>
					<Tabs.List>
						<Tabs.Tab value='qa' leftSection={<IconClipboardCheck size={16} />}>
							{t('page.tabs.qa')}
						</Tabs.Tab>
						<Tabs.Tab
							value='compliance'
							leftSection={<IconShieldCheck size={16} />}
						>
							{t('page.tabs.compliance')}
						</Tabs.Tab>
						<Tabs.Tab
							value='sentiment'
							leftSection={<IconMoodSmile size={16} />}
						>
							{t('page.tabs.sentiment')}
						</Tabs.Tab>
						<Tabs.Tab
							value='business'
							leftSection={<IconChartHistogram size={16} />}
						>
							{t('page.tabs.business')}
						</Tabs.Tab>
					</Tabs.List>

					<Tabs.Panel value='qa' pt='lg'>
						<QualityAssuranceTab />
					</Tabs.Panel>
					<Tabs.Panel value='compliance' pt='lg'>
						<ComplianceTab />
					</Tabs.Panel>
					<Tabs.Panel value='sentiment' pt='lg'>
						<SentimentTab />
					</Tabs.Panel>
					<Tabs.Panel value='business' pt='lg'>
						<BusinessTab />
					</Tabs.Panel>
				</Tabs>
			</Stack>
		</ContentContainer>
	);
};

export default SettingsPage;
