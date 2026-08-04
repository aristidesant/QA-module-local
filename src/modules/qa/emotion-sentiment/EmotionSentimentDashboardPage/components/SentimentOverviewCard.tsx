import { Card, Group, Loader, Stack, Text } from '@mantine/core';
import { BarChart } from '@mantine/charts';
import { useTranslation } from 'react-i18next';
import type { SentimentOverview } from '../../utils/types';

interface SentimentOverviewCardProps {
	data: SentimentOverview | null;
	loading: boolean;
}

export default function SentimentOverviewCard({
	data,
	loading,
}: SentimentOverviewCardProps) {
	const { t } = useTranslation('qa.emotionSentiment');

	const chartData = data
		? [
				{
					sentiment: t('charts.sentimentOverview.labels.positive'),
					value: data.positive,
					fill: 'var(--mantine-color-green-6)',
				},
				{
					sentiment: t('charts.sentimentOverview.labels.neutral'),
					value: data.neutral,
					fill: 'var(--mantine-color-gray-6)',
				},
				{
					sentiment: t('charts.sentimentOverview.labels.negative'),
					value: data.negative,
					fill: 'var(--mantine-color-red-6)',
				},
			]
		: [];

	return (
		<Card withBorder radius='md' p='md' className='h-full'>
			<Stack gap='md' h='100%'>
				<Group justify='space-between' align='flex-start'>
					<div>
						<Text fw={600}>{t('charts.sentimentOverview.title')}</Text>
						<Text size='sm' c='dimmed'>
							{t('charts.sentimentOverview.subtitle')}
						</Text>
					</div>
					{loading && <Loader size='xs' />}
				</Group>

				{loading || !data ? (
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
						dataKey='sentiment'
						series={[{ name: 'value', label: 'Count' }]}
						withLegend={false}
						withTooltip
					/>
				)}
			</Stack>
		</Card>
	);
}
