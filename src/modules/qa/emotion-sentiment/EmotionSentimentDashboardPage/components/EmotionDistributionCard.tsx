import { Card, Group, Loader, Stack, Text, Badge } from '@mantine/core';
import { BarChart } from '@mantine/charts';
import { useTranslation } from 'react-i18next';
import type { EmotionCount } from '../../utils/types';
import { getEmotionDetails } from '../../utils/types';

interface EmotionDistributionCardProps {
	data: EmotionCount[];
	loading: boolean;
}

export default function EmotionDistributionCard({
	data,
	loading,
}: EmotionDistributionCardProps) {
	const { t } = useTranslation('qa.emotionSentiment');

	const emotionMap = new Map(
		data.map((emotion) => {
			const { color, emoji } = getEmotionDetails(emotion.emotion);
			return [
				emotion.emotion,
				{
					count: emotion.count,
					color,
					emoji,
					label: t(`emotions.${emotion.emotion}`),
				},
			];
		})
	);

	const chartData = [
		{
			emotion: 'emotions',
			satisfaction: emotionMap.get('satisfaction')?.count || 0,
			excitement: emotionMap.get('excitement')?.count || 0,
			frustration: emotionMap.get('frustration')?.count || 0,
			anger: emotionMap.get('anger')?.count || 0,
			sadness: emotionMap.get('sadness')?.count || 0,
			neutral: emotionMap.get('neutral')?.count || 0,
		},
	];

	const series = Array.from(emotionMap.entries()).map(([emotion, details]) => ({
		name: emotion,
		label: `${details.emoji} ${details.label}`,
		color: details.color,
	}));

	return (
		<Card withBorder radius='md' p='md' className='h-full'>
			<Stack gap='md' h='100%'>
				<Group justify='space-between' align='flex-start'>
					<div>
						<Text fw={600}>{t('charts.emotionDistribution.title')}</Text>
						<Text size='sm' c='dimmed'>
							{t('charts.emotionDistribution.subtitle')}
						</Text>
					</div>
					<Badge variant='light' color='blue' size='sm'>
						Client Data Only
					</Badge>
				</Group>

				{loading || data.length === 0 ? (
					// inline-style-allow: flex centering for loader
					<div
						style={{
							height: 300,
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
						}}
					>
						<Loader />
					</div>
				) : (
					<BarChart
						h={300}
						data={chartData}
						dataKey='emotion'
						series={series}
						withLegend
						withTooltip
					/>
				)}
			</Stack>
		</Card>
	);
}
