import React, { useState } from 'react';
import { Stack, Title, Text, SimpleGrid, Card, Progress } from '@mantine/core';
import ContentContainer from '~/components/ContentContainer';
import RiskAlertPanel from './components/RiskAlertPanel';
import SupervisorQualityTable from './components/SupervisorQualityTable';
import AnalyticsPanel from './components/AnalyticsPanel';
import AuditQueuePanel from './components/AuditQueuePanel';
import { mockRiskAlerts, mockSupervisors, mockQAAnalytics, mockDisputes, mockDashboardKPIs } from './mockData';
import styles from './QAManagerDashboardPage.module.css';

const QAManagerDashboardPage: React.FC = () => {
	const [selectedSupervisor, setSelectedSupervisor] = useState<string | null>(null);
	const [selectedDateRange, setSelectedDateRange] = useState<'1w' | '2w' | '4w'>('4w');
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
						<Text size='sm' c='dimmed' fw={500} mb='sm'>
							General QA Score
						</Text>
						<Text size='xl' fw={700} mb='sm'>
							{mockDashboardKPIs.generalQAScore}
						</Text>
						<Progress value={mockDashboardKPIs.generalQAScore} color='blue' size='sm' />
					</Card>

					<Card withBorder>
						<Text size='sm' c='dimmed' fw={500} mb='sm'>
							General Emotion & Sentiment Score
						</Text>
						<Text size='xl' fw={700} mb='sm'>
							{mockDashboardKPIs.generalEmotionSentimentScore}
						</Text>
						<Progress value={mockDashboardKPIs.generalEmotionSentimentScore} color='cyan' size='sm' />
					</Card>

					<Card withBorder>
						<Text size='sm' c='dimmed' fw={500} mb='sm'>
							Compliance Score
						</Text>
						<Text size='xl' fw={700} mb='sm'>
							{mockDashboardKPIs.complianceScore}
						</Text>
						<Progress value={mockDashboardKPIs.complianceScore} color='green' size='sm' />
					</Card>
				</SimpleGrid>

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
