import React, { useState, useMemo } from 'react';
import {
	Stack,
	Title,
	Text,
	SimpleGrid,
	Card,
	Group,
	ThemeIcon,
	Box,
} from '@mantine/core';
import {
	IconCircleCheck,
	IconMoodSmile,
	IconShieldCheck,
} from '@tabler/icons-react';
import ContentContainer from '~/components/ContentContainer';
import SectionCard from '~/components/SectionCard';
import RiskAlertPanel from './components/RiskAlertPanel';
import CriticalIssuesPanel from './components/CriticalIssuesPanel';
import SupervisorQualityTable from './components/SupervisorQualityTable';
import AnalyticsPanel from './components/AnalyticsPanel';
import AuditQueuePanel from './components/AuditQueuePanel';
import QAManagerQuickStatsWidget from './components/QAManagerQuickStatsWidget';
import {
	mockRiskAlerts,
	mockSupervisors,
	mockQAAnalytics,
	mockDisputes,
	mockDashboardKPIs,
} from './mockData';
import { mockCriticalIssuesQAManager } from './mockCriticalIssues';
import { DEMO_AGENT_CALLS } from '../../../AgentDashboard/mockData';
import type { Emotion } from '../../../components/SentimentAnalysisView/types';
import styles from './QAManagerDashboardPage.module.css';

const QAManagerDashboardPage: React.FC = () => {
	const [selectedSupervisor, setSelectedSupervisor] = useState<string | null>(
		null
	);
	const [selectedDateRange, setSelectedDateRange] = useState<
		'1w' | '2w' | '4w'
	>('4w');
	const [selectedCampaign, setSelectedCampaign] = useState<string | null>(null);

	// Calculate predominant emotion based on call scores
	const predominantEmotion = useMemo(() => {
		const emotionMap: Record<Emotion, number> = {
			satisfaction: 0,
			frustration: 0,
			anger: 0,
			neutral: 0,
			excitement: 0,
			sadness: 0,
		};

		DEMO_AGENT_CALLS.forEach((call) => {
			if (call.score === null) return;

			let emotion: Emotion = 'neutral';
			if (call.score >= 85) {
				emotion = Math.random() > 0.5 ? 'satisfaction' : 'excitement';
			} else if (call.score >= 70) {
				emotion = 'satisfaction';
			} else if (call.score >= 50) {
				emotion = 'neutral';
			} else if (call.score >= 30) {
				emotion = 'frustration';
			} else {
				emotion = 'anger';
			}

			emotionMap[emotion]++;
		});

		const total = Object.values(emotionMap).reduce((a, b) => a + b, 0);
		if (total === 0) return { emotion: 'neutral' as Emotion, percentage: 0 };

		const dominantEmotion = (Object.entries(emotionMap).sort(
			([, a], [, b]) => b - a
		)[0] || ['neutral', 0])[0] as Emotion;
		const percentage = Math.round((emotionMap[dominantEmotion] / total) * 100);

		return { emotion: dominantEmotion, percentage };
	}, []);

	return (
		<ContentContainer contentWidth='full'>
			<Stack gap='lg' className={styles.container}>
				<div className={styles.header}>
					<Title order={1} className={styles.headerTitle}>
						Welcome, Michael Rodriguez
					</Title>
					<Text className={styles.headerSubtitle}>
						Here's an overview of system-wide performance this week
					</Text>
					<Text size='xs' c='dimmed' fw={400}>
						This week's data
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
									Predominant Emotion
								</Text>
								<Text size='xl' fw={700}>
									{predominantEmotion.emotion.charAt(0).toUpperCase() +
										predominantEmotion.emotion.slice(1)}
								</Text>
								<Text size='xs' c='dimmed'>
									{predominantEmotion.percentage}% of calls
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

				<SimpleGrid cols={{ base: 1, md: 2 }} spacing='lg'>
					<SectionCard
						title='Quick Stats'
						description='Key metrics for this week'
					>
						<QAManagerQuickStatsWidget calls={DEMO_AGENT_CALLS} />
					</SectionCard>

					<Box>
						<RiskAlertPanel alerts={mockRiskAlerts} />
					</Box>
				</SimpleGrid>

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
