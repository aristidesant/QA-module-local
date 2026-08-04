import { Card, Group, Loader, Stack, Text } from '@mantine/core';
import { BarChart } from '@mantine/charts';
import { useTranslation } from 'react-i18next';
import type { EmotionCount } from '../../utils/types';
import { getEmotionColor } from '../../utils/types';

interface EmotionDistributionCardProps {
	data: EmotionCount[];
	loading: boolean;
}

export default function EmotionDistributionCard({
	data,
	loading,
}: EmotionDistributionCardProps) {
	const { t } = useTranslation('qa.emotionSentiment');

	const chartData = data.map((emotion) => ({
		emotion: t(`emotions.${emotion.emotion}`),
		count: emotion.count,
		fill: getEmotionColor(emotion.valence),
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
					{loading && <Loader size='xs' />}
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
						series={[{ name: 'count', label: 'Count' }]}
						withLegend={false}
						withTooltip
					/>
				)}
			</Stack>
		</Card>
	);
}
