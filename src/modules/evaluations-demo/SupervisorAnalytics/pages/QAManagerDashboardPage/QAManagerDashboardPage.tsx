import React, { useState } from 'react';
import {
	Stack,
	Title,
	Text,
	SimpleGrid,
	Card,
	Group,
	ThemeIcon,
} from '@mantine/core';
import {
	IconCircleCheck,
	IconMoodSmile,
	IconShieldCheck,
} from '@tabler/icons-react';
import ContentContainer from '~/components/ContentContainer';
import RiskAlertPanel from './components/RiskAlertPanel';
import CriticalIssuesPanel from './components/CriticalIssuesPanel';
import SupervisorQualityTable from './components/SupervisorQualityTable';
import AnalyticsPanel from './components/AnalyticsPanel';
import AuditQueuePanel from './components/AuditQueuePanel';
import {
	mockRiskAlerts,
	mockSupervisors,
	mockQAAnalytics,
	mockDisputes,
	mockDashboardKPIs,
} from './mockData';
import { mockCriticalIssuesQAManager } from './mockCriticalIssues';
import styles from './QAManagerDashboardPage.module.css';

const QAManagerDashboardPage: React.FC = () => {
	const [selectedSupervisor, setSelectedSupervisor] = useState<string | null>(
		null
	);
	const [selectedDateRange, setSelectedDateRange] = useState<
		'1w' | '2w' | '4w'
	>('4w');
	const [selectedCampaign, setSelectedCampaign] = useState<string | null>(null);

	return (
		<ContentContainer contentWidth='full'>
			<Stack gap='lg' className={styles.container}>
				<div className={styles.header}>
					<Title order={1} className={styles.headerTitle}>
						QA Manager Analytics Dashboard
					</Title>
					<Text className={styles.headerSubtitle}>
						System-wide oversight: compliance, emotion, sentiment, audit queue
					</Text>
				</div>

				<SimpleGrid cols={{ base: 1, sm: 3 }} spacing='md'>
					<Card withBorder>
						<Group justify='space-between' align='flex-start'>
							<Stack gap='xs'>
								<Text size='sm' c='dimmed' fw={500}>
									General QA Score
								</Text>
								<Text size='xl' fw={700}>
									{mockDashboardKPIs.generalQAScore}
								</Text>
							</Stack>
							<ThemeIcon size='lg' radius='md' variant='light' color='blue'>
								<IconCircleCheck size={32} />
							</ThemeIcon>
						</Group>
					</Card>

					<Card withBorder>
						<Group justify='space-between' align='flex-start'>
							<Stack gap='xs'>
								<Text size='sm' c='dimmed' fw={500}>
									General Emotion & Sentiment Score
								</Text>
								<Text size='xl' fw={700}>
									{mockDashboardKPIs.generalEmotionSentimentScore}
								</Text>
							</Stack>
							<ThemeIcon size='lg' radius='md' variant='light' color='green'>
								<IconMoodSmile size={32} />
							</ThemeIcon>
						</Group>
					</Card>

					<Card withBorder>
						<Group justify='space-between' align='flex-start'>
							<Stack gap='xs'>
								<Text size='sm' c='dimmed' fw={500}>
									Compliance Score
								</Text>
								<Text size='xl' fw={700}>
									{mockDashboardKPIs.complianceScore}
								</Text>
							</Stack>
							<ThemeIcon size='lg' radius='md' variant='light' color='grape'>
								<IconShieldCheck size={32} />
							</ThemeIcon>
						</Group>
					</Card>
				</SimpleGrid>

				<CriticalIssuesPanel issues={mockCriticalIssuesQAManager} />

				<RiskAlertPanel alerts={mockRiskAlerts} />

				<SupervisorQualityTable
					supervisors={mockSupervisors}
					onSelectSupervisor={setSelectedSupervisor}
				/>

				<AnalyticsPanel
					analytics={mockQAAnalytics}
					dateRange={selectedDateRange}
					onDateRangeChange={setSelectedDateRange}
					selectedSupervisor={selectedSupervisor}
					selectedCampaign={selectedCampaign}
					onCampaignChange={setSelectedCampaign}
				/>

				<AuditQueuePanel disputes={mockDisputes} />
			</Stack>
		</ContentContainer>
	);
};

export default QAManagerDashboardPage;
