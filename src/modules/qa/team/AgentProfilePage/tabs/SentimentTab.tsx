import {
	Badge,
	ColorSwatch,
	Group,
	Progress,
	SimpleGrid,
	Stack,
	Text,
	Tooltip,
} from '@mantine/core';
import { LineChart } from '@mantine/charts';
import {
	IconChartLine,
	IconHeadset,
	IconHeartHandshake,
	IconMessageHeart,
	IconUser,
} from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { SectionCard } from '~/components/SectionCard';
import { StatCard } from '~/components/StatCard';
import type { AgentProfile } from '../../types';
import {
	EMOTION_META,
	SENTIMENT_CATEGORY_META,
	SENTIMENT_CATEGORY_ORDER,
} from '../../constants';
import { alertSentimentColor, NEUTRAL_LINE_SERIES } from '../../helpers';
import { ScoreRing } from '../../components/ScoreRing';

/** Only the negative categories carry colour; the rest are greys, darker the more positive. */
const CATEGORY_TONE: Record<string, string> = {
	'very-negative': 'var(--mantine-color-red-6)',
	negative: 'var(--mantine-color-red-3)',
	neutral: 'var(--mantine-color-gray-3)',
	positive: 'var(--mantine-color-gray-5)',
	'very-positive': 'var(--mantine-color-gray-7)',
};

interface SentimentTabProps {
	profile: AgentProfile;
}

function SpeakerCard({
	title,
	icon: Icon,
	avg,
	categories,
	emotions,
}: {
	title: string;
	icon: typeof IconHeadset;
	avg: number;
	categories: Record<string, number>;
	emotions: { emotion: string; share: number }[];
}) {
	const { t } = useTranslation('qa.team');
	return (
		<SectionCard title={title} icon={Icon}>
			<Group gap='md' mb='md'>
				<ScoreRing
					value={avg}
					max={5}
					size={96}
					label={avg.toFixed(1)}
					color={alertSentimentColor(avg) ?? 'gray.6'}
				/>
				<Stack gap={4} style={{ flex: 1 }}>
					<Text size='xs' fw={600} c='dimmed' tt='uppercase'>
						{t('sentiment.categories')}
					</Text>
					<Progress.Root size='lg'>
						{SENTIMENT_CATEGORY_ORDER.map((key) => {
							const pct = categories[key];
							if (!pct) return null;
							const meta = SENTIMENT_CATEGORY_META[key];
							return (
								<Tooltip key={key} label={`${meta.label} ${pct}%`}>
									<Progress.Section value={pct} color={CATEGORY_TONE[key]} />
								</Tooltip>
							);
						})}
					</Progress.Root>
					<Group gap='sm'>
						{SENTIMENT_CATEGORY_ORDER.map((key) => {
							const pct = categories[key];
							if (!pct) return null;
							const meta = SENTIMENT_CATEGORY_META[key];
							return (
								<Group key={key} gap={4}>
									<ColorSwatch size={10} color={CATEGORY_TONE[key]} />
									<Text size='xs'>
										{meta.label} {pct}%
									</Text>
								</Group>
							);
						})}
					</Group>
				</Stack>
			</Group>
			<Text size='xs' fw={600} c='dimmed' tt='uppercase' mb='xs'>
				{t('sentiment.emotions')}
			</Text>
			<Stack gap={6}>
				{emotions.map(({ emotion, share }) => {
					const meta = EMOTION_META[emotion as keyof typeof EMOTION_META];
					return (
						<div key={emotion}>
							<Group justify='space-between' mb={4}>
								<Badge variant='light' color='gray'>
									{meta.label}
								</Badge>
								<Text size='xs' c='dimmed'>
									{share}%
								</Text>
							</Group>
							<Progress value={share} color='gray' size='xs' />
						</div>
					);
				})}
			</Stack>
		</SectionCard>
	);
}

export function SentimentTab({ profile }: SentimentTabProps) {
	const { t } = useTranslation('qa.team');
	const { sentiment } = profile;

	return (
		<Stack gap='md'>
			<SimpleGrid cols={{ base: 1, md: 2 }} spacing='md'>
				<SpeakerCard
					title={t('sentiment.agent')}
					icon={IconHeadset}
					avg={sentiment.agentAverage}
					categories={sentiment.agentCategories}
					emotions={sentiment.agentEmotions}
				/>
				<SpeakerCard
					title={t('sentiment.customer')}
					icon={IconUser}
					avg={sentiment.customerAverage}
					categories={sentiment.customerCategories}
					emotions={sentiment.customerEmotions}
				/>
			</SimpleGrid>

			<SectionCard
				title={t('sentiment.trend')}
				description={t('sentiment.trendDescription')}
				icon={IconChartLine}
			>
				<LineChart
					h={280}
					data={sentiment.trend}
					dataKey='label'
					series={[
						{
							name: 'agent',
							label: t('sentiment.agent'),
							...NEUTRAL_LINE_SERIES[0],
						},
						{
							name: 'customer',
							label: t('sentiment.customer'),
							...NEUTRAL_LINE_SERIES[1],
						},
					]}
					yAxisProps={{ domain: [1, 5] }}
					curveType='monotone'
					withLegend
					withDots
				/>
			</SectionCard>

			<SimpleGrid cols={{ base: 2 }} spacing='md'>
				<StatCard
					title={t('sentiment.recoveryRate')}
					value={`${sentiment.recoveryRate}%`}
					subtitle={t('sentiment.recoveryHint')}
					icon={<IconHeartHandshake size={18} />}
				/>
				<StatCard
					title={t('sentiment.empathy')}
					value={sentiment.empathyPhrasesPerCall}
					icon={<IconMessageHeart size={18} />}
				/>
			</SimpleGrid>
		</Stack>
	);
}
