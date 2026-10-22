import {
	Badge,
	Grid,
	Group,
	Paper,
	Progress,
	SimpleGrid,
	Stack,
	Text,
	ThemeIcon,
} from '@mantine/core';
import {
	IconArrowRight,
	IconFlame,
	IconHeadset,
	IconMicrophone2,
	IconTrendingDown,
	IconTrendingUp,
	IconUser,
	IconWaveSine,
	IconHeartHandshake,
} from '@tabler/icons-react';
import { useMemo } from 'react';
import { SectionCard } from '~/components/SectionCard';
import { assessBurnout } from '~/modules/qa/analytics/helpers';
import { BurnoutSignals } from '~/modules/qa/team/components/BurnoutSignals';
import { evaluateCallVoice } from '~/modules/qa/burnout/compute';
import { BurnoutRiskLevel } from '~/modules/qa/dashboard/types/burnoutRisk';
import {
	selectTriggerRules,
	useTriggerRulesStore,
} from '~/stores/qa/triggerRulesStore';
import { EMOTION_LABELS, SENTIMENT_CATEGORIES } from '../../constants';
import type { CallSentimentEvaluation } from '../../types';
import type { CallVoiceSignals } from '~/modules/qa/burnout/types';
import { selectThresholds, useSettingsStore } from '~/stores/qa/settingsStore';
import { formatDuration } from './scoreColor';
import {
	ALERT,
	NEUTRAL,
	flagTone,
	scoreTone,
	sentimentCategoryTone,
} from './tone';
import { EvidenceQuote } from './EvidenceQuote';

interface SentimentEmotionPanelProps {
	sentiment: CallSentimentEvaluation;
	/** The agent role does not see the burnout read of their own call. */
	showBurnout?: boolean;
	/** Agent of the call: their burnout level comes from the active burnout rules. */
	agentId?: string;
	/** What the voice analysis read on this call; compared with the agent's own usual level. */
	voice?: CallVoiceSignals;
}

/** Neutral unless the risk is high; red is the only hue on the page. */
const BURNOUT_LEVEL_META: Record<
	BurnoutRiskLevel,
	{ label: string; color: string }
> = {
	[BurnoutRiskLevel.LOW]: { label: 'Low risk', color: NEUTRAL },
	[BurnoutRiskLevel.MEDIUM]: { label: 'Medium risk', color: NEUTRAL },
	[BurnoutRiskLevel.HIGH]: { label: 'High risk', color: ALERT },
};

/** The score range of a level, from the cut-offs saved in Settings. */
const bandText = (
	level: BurnoutRiskLevel,
	cuts: { medium: number; high: number }
) =>
	level === BurnoutRiskLevel.LOW
		? `Low: below ${cuts.medium}`
		: level === BurnoutRiskLevel.MEDIUM
			? `Medium: ${cuts.medium} to ${cuts.high - 1}`
			: `High: ${cuts.high} or more`;

export function SentimentEmotionPanel({
	sentiment,
	showBurnout = true,
	agentId,
	voice,
}: SentimentEmotionPanelProps) {
	const triggerRules = useTriggerRulesStore(selectTriggerRules);
	const burnoutSettings = useSettingsStore(selectThresholds).burnout;
	const burnoutAssessment = useMemo(
		() => (agentId ? assessBurnout(agentId, triggerRules) : null),
		[agentId, triggerRules, burnoutSettings]
	);
	// This call's signals against the agent's own baseline.
	const callSignals = useMemo(
		() =>
			agentId && voice
				? evaluateCallVoice(agentId, voice, burnoutSettings)
				: [],
		[agentId, voice, burnoutSettings]
	);
	const offUsual = callSignals.filter(
		(s) => s.status === 'ACTIVE' || s.status === 'NEAR'
	).length;

	const renderSpeakerCard = (speaker: 'agent' | 'customer') => {
		const data = speaker === 'agent' ? sentiment.agent : sentiment.customer;
		const categoryMeta = SENTIMENT_CATEGORIES[data.overallCategory];
		const Icon = categoryMeta.icon;

		return (
			<SectionCard
				key={speaker}
				title={speaker === 'agent' ? 'Agent' : 'Customer'}
				icon={speaker === 'agent' ? IconHeadset : IconUser}
			>
				{/* Headline */}
				<Group gap='md' align='center' mb='md'>
					<ThemeIcon
						size={48}
						radius='md'
						variant='light'
						color={sentimentCategoryTone(data.overallCategory)}
					>
						<Icon size={28} />
					</ThemeIcon>
					<Stack gap={0}>
						<Text fw={700} size='lg'>
							{categoryMeta.label}
						</Text>
						<Text size='sm' c='dimmed'>
							Score {data.overallScore.toFixed(1)} / 5.0 · Dominant:{' '}
							{EMOTION_LABELS[data.dominantEmotion]}
						</Text>
					</Stack>
				</Group>
			</SectionCard>
		);
	};

	return (
		<Stack gap='md'>
			{/* Speaker cards */}
			<SimpleGrid cols={{ base: 1, md: 2 }} spacing='md'>
				{renderSpeakerCard('agent')}
				{renderSpeakerCard('customer')}
			</SimpleGrid>

			{/* Agent burnout risk (hidden from the agent role) */}
			{showBurnout && burnoutAssessment && (
				<SectionCard
					title='Agent burnout risk'
					description="How the agent's voice in this call compares with their own usual level"
					icon={IconFlame}
					headerActions={
						<Badge
							color={BURNOUT_LEVEL_META[burnoutAssessment.level].color}
							variant='light'
							size='lg'
						>
							{BURNOUT_LEVEL_META[burnoutAssessment.level].label}
						</Badge>
					}
				>
					<Stack gap='sm'>
						<Progress
							value={burnoutAssessment.percentage}
							color={BURNOUT_LEVEL_META[burnoutAssessment.level].color}
							size='sm'
						/>
						<Text size='xs' c='dimmed'>
							Agent risk score {burnoutAssessment.percentage}% ·{' '}
							{bandText(burnoutAssessment.level, burnoutSettings.levelCuts)} ·{' '}
							{burnoutAssessment.voice.activeCount} signals active over the last{' '}
							{burnoutSettings.windowDays} days
						</Text>
						<Text size='sm' fw={500}>
							{offUsual} of {callSignals.length} signals in this call are off
							their usual level.
							{burnoutAssessment.voice.activeCount === 0 &&
								offUsual > 0 &&
								` One call is not a pattern: over the last ${burnoutSettings.windowDays} days the agent stays within their usual range.`}
						</Text>
						<BurnoutSignals
							signals={callSignals}
							scope='call'
							compact
							emptyLabel='No voice signal stands out in this call.'
						/>
					</Stack>
				</SectionCard>
			)}

			{/* Recovery & Empathy */}
			<SectionCard
				title='Recovery & Empathy'
				description="How the customer's sentiment evolved and how the agent responded"
				icon={IconHeartHandshake}
			>
				<Grid gap='md'>
					<Grid.Col span={{ base: 12, md: 7 }}>
						<Text size='sm' fw={600} mb='md'>
							Customer sentiment journey
						</Text>
						<Group gap='xs' align='center' wrap='nowrap'>
							{/* Start */}
							<Paper withBorder p='sm' radius='sm' style={{ flex: 1 }}>
								<Text size='xs' c='dimmed' mb={4}>
									Start
								</Text>
								<Badge
									color={sentimentCategoryTone(
										sentiment.recovery.startCategory
									)}
									variant='light'
									mb={4}
								>
									{SENTIMENT_CATEGORIES[sentiment.recovery.startCategory].label}
								</Badge>
								<Text fw={700}>{sentiment.recovery.startScore.toFixed(1)}</Text>
							</Paper>

							{/* Arrow */}
							<IconArrowRight
								size={16}
								style={{ color: 'var(--mantine-color-dimmed)' }}
							/>

							{/* Lowest */}
							<Paper withBorder p='sm' radius='sm' style={{ flex: 1 }}>
								<Text size='xs' c='dimmed' mb={4}>
									Lowest at {sentiment.recovery.lowestAt}
								</Text>
								<Badge
									color={sentimentCategoryTone(
										sentiment.recovery.lowestCategory
									)}
									variant='light'
									mb={4}
								>
									{
										SENTIMENT_CATEGORIES[sentiment.recovery.lowestCategory]
											.label
									}
								</Badge>
								<Text fw={700}>
									{sentiment.recovery.lowestScore.toFixed(1)}
								</Text>
							</Paper>

							{/* Arrow */}
							<IconArrowRight
								size={16}
								style={{ color: 'var(--mantine-color-dimmed)' }}
							/>

							{/* End */}
							<Paper withBorder p='sm' radius='sm' style={{ flex: 1 }}>
								<Text size='xs' c='dimmed' mb={4}>
									End
								</Text>
								<Badge
									color={sentimentCategoryTone(sentiment.recovery.endCategory)}
									variant='light'
									mb={4}
								>
									{SENTIMENT_CATEGORIES[sentiment.recovery.endCategory].label}
								</Badge>
								<Text fw={700}>{sentiment.recovery.endScore.toFixed(1)}</Text>
							</Paper>
						</Group>

						{/* Recovery stats */}
						<Group gap='xs' mt='sm' wrap='wrap'>
							<Badge
								color={sentiment.recovery.recovered ? 'gray' : 'red'}
								variant='light'
								leftSection={
									sentiment.recovery.recovered ? (
										<IconTrendingUp size={12} />
									) : (
										<IconTrendingDown size={12} />
									)
								}
							>
								{sentiment.recovery.recovered ? 'Recovered' : 'Not recovered'}
							</Badge>
							<Badge variant='light' color='gray'>
								Recovery time{' '}
								{formatDuration(sentiment.recovery.recoveryTimeSeconds)}
							</Badge>
							<Badge {...flagTone(sentiment.recovery.improvementDelta < 0)}>
								{sentiment.recovery.improvementDelta >= 0 ? '+' : ''}
								{sentiment.recovery.improvementDelta.toFixed(1)} pts
							</Badge>
						</Group>
					</Grid.Col>

					<Grid.Col span={{ base: 12, md: 5 }}>
						<Text size='xs' fw={600} c='dimmed' tt='uppercase' mb='sm'>
							Empathy phrases ({sentiment.empathyIndicators.length})
						</Text>
						<Stack gap='xs'>
							{sentiment.empathyIndicators.map((indicator, idx) => (
								<div key={idx}>
									<EvidenceQuote
										evidence={{
											timestamp: indicator.timestamp,
											speaker: 'agent',
											quote: indicator.phrase,
										}}
									/>
									<Text size='xs' c='dimmed' mt={4}>
										{indicator.context}
									</Text>
								</div>
							))}
						</Stack>
					</Grid.Col>
				</Grid>
			</SectionCard>

			{/* Agent Tone */}
			<SectionCard
				title='Agent Tone'
				description='Tone dimensions scored across the call'
				icon={IconMicrophone2}
			>
				<SimpleGrid cols={{ base: 2, md: 4 }} spacing='md'>
					{[
						{ key: 'polite', label: 'Polite' },
						{ key: 'professional', label: 'Professional' },
						{ key: 'empathetic', label: 'Empathetic' },
						{ key: 'consistency', label: 'Consistency' },
					].map(({ key, label }) => {
						const value = sentiment.tone[key as keyof typeof sentiment.tone];
						return (
							<Paper key={key} withBorder p='sm' radius='sm'>
								<Text size='xs' c='dimmed' mb={4}>
									{label}
								</Text>
								<Text fw={700} size='xl'>
									{value}
								</Text>
								<Progress
									value={value}
									color={scoreTone(value)}
									size='sm'
									mt={4}
								/>
							</Paper>
						);
					})}
				</SimpleGrid>
			</SectionCard>

			{/* Speech Patterns */}
			<SectionCard
				title='Speech Patterns'
				description='Talk time, silences and responsiveness'
				icon={IconWaveSine}
			>
				{/* Talk-time ratio */}
				<Text size='xs' fw={600} c='dimmed' tt='uppercase' mb='xs'>
					Talk time ratio
				</Text>
				<Progress.Root size='xl' mb='md'>
					<Progress.Section
						value={sentiment.speech.talkTimeRatio.agent}
						color='gray.7'
					>
						{' '}
						<Progress.Label c='white'>
							Agent {sentiment.speech.talkTimeRatio.agent}%
						</Progress.Label>
					</Progress.Section>
					<Progress.Section
						value={sentiment.speech.talkTimeRatio.customer}
						color='gray.3'
					>
						{' '}
						<Progress.Label c='dark'>
							Customer {sentiment.speech.talkTimeRatio.customer}%
						</Progress.Label>
					</Progress.Section>
				</Progress.Root>

				{/* Stats */}
				<SimpleGrid cols={{ base: 2, md: 3 }} spacing='sm'>
					<Paper withBorder p='sm' radius='sm'>
						<Text size='xs' c='dimmed' mb={4}>
							Silences
						</Text>
						<Text fw={700} size='lg'>
							{sentiment.speech.silenceCount}
						</Text>
						<Text size='xs' c='dimmed' mt={4}>
							{sentiment.speech.totalSilenceSeconds}s total · longest{' '}
							{sentiment.speech.longestSilenceSeconds}s
						</Text>
					</Paper>

					<Paper withBorder p='sm' radius='sm'>
						<Text size='xs' c='dimmed' mb={4}>
							Avg response latency
						</Text>
						<Text fw={700} size='lg'>
							{sentiment.speech.avgResponseLatencySeconds.toFixed(1)}s
						</Text>
					</Paper>

					<Paper withBorder p='sm' radius='sm'>
						<Text size='xs' c='dimmed' mb={4}>
							Interruptions
						</Text>
						<Text fw={700} size='lg'>
							{sentiment.speech.interruptions.byAgent +
								sentiment.speech.interruptions.byCustomer}
						</Text>
						<Text size='xs' c='dimmed' mt={4}>
							agent {sentiment.speech.interruptions.byAgent} · customer{' '}
							{sentiment.speech.interruptions.byCustomer}
						</Text>
					</Paper>

					<Paper withBorder p='sm' radius='sm'>
						<Text size='xs' c='dimmed' mb={4}>
							Agent pace
						</Text>
						<Text fw={700} size='lg'>
							{sentiment.speech.agentWordsPerMinute} wpm
						</Text>
					</Paper>
				</SimpleGrid>
			</SectionCard>
		</Stack>
	);
}
