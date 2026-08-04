import { Card, Group, Loader, Stack, Text } from '@mantine/core';
import { LineChart } from '@mantine/charts';
import { useTranslation } from 'react-i18next';
import type { SentimentTrendPoint } from '../../utils/types';

interface SentimentTrendCardProps {
	data: SentimentTrendPoint[];
	loading: boolean;
}

export default function SentimentTrendCard({
	data,
	loading,
}: SentimentTrendCardProps) {
	const { t } = useTranslation('qa.emotionSentiment');

	const chartData = data.map((point) => ({
		date: point.date,
		sentiment: Math.round(point.sentiment * 100),
	}));

	return (
		<Card withBorder radius='md' p='md' className='h-full'>
			<Stack gap='md' h='100%'>
				<Group justify='space-between' align='flex-start'>
					<div>
						<Text fw={600}>{t('charts.sentimentTrend.title')}</Text>
						<Text size='sm' c='dimmed'>
							{t('charts.sentimentTrend.subtitle')}
						</Text>
					</div>
					{loading && <Loader size='xs' />}
				</Group>

				{loading ? (
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
					<LineChart
						h={300}
						data={chartData}
						dataKey='date'
						series={[
							{ name: 'sentiment', label: 'Sentiment Score', color: 'blue' },
						]}
						curveType='monotone'
						withLegend
						withTooltip
					/>
				)}
			</Stack>
		</Card>
	);
}
