import { useMemo } from 'react';
import { Grid, Stack } from '@mantine/core';
import type { DemoTranscriptTurn } from '../../mockData';
import { generateMockSentimentAnalysis } from './mockSentimentData';
import EmotionTimelineChart from './components/EmotionTimelineChart';
import EmotionDistributionCard from './components/EmotionDistributionCard';
import KeyMomentsCard from './components/KeyMomentsCard';
import TranscriptWithEmotions from './components/TranscriptWithEmotions';
import SentimentPolarityChart from './components/SentimentPolarityChart';
import ToneScoreCard from './components/ToneScoreCard';
import RecoveryMetricsCard from './components/RecoveryMetricsCard';
import AgentPerformanceCard from './components/AgentPerformanceCard';
import EmpathyIndicatorsCard from './components/EmpathyIndicatorsCard';
import SectionCard from '~/components/SectionCard';
import MockAudioPlayerBar from '../MockAudioPlayerBar';
import styles from './SentimentAnalysisView.module.css';

interface SentimentAnalysisViewProps {
	transcript: DemoTranscriptTurn[];
	durationSeconds?: number;
}

export default function SentimentAnalysisView(
	props: SentimentAnalysisViewProps
) {
	const sentimentData = useMemo(() => generateMockSentimentAnalysis(), []);

	return (
		<Grid gap='md' className={styles.grid}>
			<Grid.Col span={{ base: 12, lg: 4 }}>
				<Stack gap='md'>
					<MockAudioPlayerBar durationSeconds={props.durationSeconds ?? 180} />

					<SectionCard
						title={`Transcript · ${sentimentData.transcriptWithEmotions.length} turns`}
					>
						<TranscriptWithEmotions
							turns={sentimentData.transcriptWithEmotions}
						/>
					</SectionCard>
				</Stack>
			</Grid.Col>

			<Grid.Col span={{ base: 12, lg: 8 }}>
				<Stack gap='md'>
					<SectionCard>
						<EmotionTimelineChart
							data={sentimentData.agentEmotions}
							title='Agent Emotion Timeline'
							avgEmotion={sentimentData.agentAvgEmotion}
							trend={sentimentData.agentTrend}
						/>
					</SectionCard>

					<SectionCard>
						<EmotionTimelineChart
							data={sentimentData.customerEmotions}
							title='Customer Emotion Timeline'
							avgEmotion={sentimentData.customerAvgEmotion}
							trend={sentimentData.customerTrend}
						/>
					</SectionCard>

					<SectionCard>
						<SentimentPolarityChart
							polarity={sentimentData.sentimentPolarity}
						/>
					</SectionCard>

					<SectionCard>
						<ToneScoreCard scores={sentimentData.toneScores} />
					</SectionCard>

					<SectionCard>
						<EmotionDistributionCard
							distribution={sentimentData.emotionDistribution}
						/>
					</SectionCard>

					<SectionCard>
						<RecoveryMetricsCard metrics={sentimentData.recoveryMetrics} />
					</SectionCard>

					<SectionCard>
						<AgentPerformanceCard
							performance={sentimentData.agentPerformance}
						/>
					</SectionCard>

					<SectionCard>
						<EmpathyIndicatorsCard
							indicators={sentimentData.empathyIndicators}
						/>
					</SectionCard>

					<SectionCard>
						<KeyMomentsCard moments={sentimentData.keyMoments} />
					</SectionCard>
				</Stack>
			</Grid.Col>
		</Grid>
	);
}
