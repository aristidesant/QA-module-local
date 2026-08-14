import { useMemo } from 'react';
import { Grid, Stack } from '@mantine/core';
import type { DemoTranscriptTurn } from '../../mockData';
import { generateMockSentimentAnalysis } from './mockSentimentData';
import EmotionDistributionCard from './components/EmotionDistributionCard';
import KeyMomentsCard from './components/KeyMomentsCard';
import TranscriptWithEmotions from './components/TranscriptWithEmotions';
import SentimentPolarityChart from './components/SentimentPolarityChart';
import ToneScoreCard from './components/ToneScoreCard';
import RecoveryMetricsCard from './components/RecoveryMetricsCard';
import AgentPerformanceCard from './components/AgentPerformanceCard';
import EmpathyTimelineCard from './components/EmpathyTimelineCard';
import EmotionDisplay from './components/EmotionDisplay';
import SpeechPatternsCard from './components/SpeechPatternsCard';
import SentimentInflectionPointsCard from './components/SentimentInflectionPointsCard';
import SectionCard from '~/components/SectionCard';
import MockAudioPlayerBar from '../MockAudioPlayerBar';
import styles from './SentimentAnalysisView.module.css';

interface SentimentAnalysisData {
	status: string;
	agent: {
		emotion: string;
		confidence: number;
	};
	customer: {
		emotion: string;
		confidence: number;
	};
}

interface SentimentAnalysisViewProps {
	transcript: DemoTranscriptTurn[];
	durationSeconds?: number;
	sentimentAnalysis?: SentimentAnalysisData;
}

export default function SentimentAnalysisView(
	props: SentimentAnalysisViewProps
) {
	const sentimentData = useMemo(() => generateMockSentimentAnalysis(), []);

	// Use provided sentiment analysis data or fallback to mock data
	const sentiment = props.sentimentAnalysis || {
		status: 'COMPLETED',
		agent: { emotion: 'NEUTRAL', confidence: 0.85 },
		customer: { emotion: 'FRUSTRATION', confidence: 0.9 },
	};

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
				{/* Emotion Cards - Horizontal Layout */}
				<Grid gap='md' mb='md'>
					<Grid.Col span={{ base: 12, sm: 6 }}>
						<EmotionDisplay
							type='agent'
							emotion={sentiment.agent.emotion as any}
							confidence={sentiment.agent.confidence}
							status='idle'
						/>
					</Grid.Col>
					<Grid.Col span={{ base: 12, sm: 6 }}>
						<EmotionDisplay
							type='customer'
							emotion={sentiment.customer.emotion as any}
							confidence={sentiment.customer.confidence}
							status='idle'
						/>
					</Grid.Col>
				</Grid>

				<Stack gap='md'>
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
						<SpeechPatternsCard metrics={sentimentData.speechMetrics} />
					</SectionCard>

					<SectionCard>
						<AgentPerformanceCard
							performance={sentimentData.agentPerformance}
						/>
					</SectionCard>

					<SectionCard>
						<EmpathyTimelineCard
							indicators={sentimentData.empathyIndicators}
							recoveryDelta={sentimentData.recoveryMetrics.improvementDelta}
							callDuration={props.durationSeconds ?? 180}
						/>
					</SectionCard>

					<SectionCard>
						<SentimentInflectionPointsCard
							inflectionPoints={sentimentData.sentimentInflectionPoints}
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
