import { Card, Group, Loader, Stack, Text } from '@mantine/core';
import { AreaChart } from '@mantine/charts';
import { useTranslation } from 'react-i18next';
import type { ToneScore } from '../../utils/types';

interface ToneConsistencyCardProps {
	data: ToneScore | null;
	loading: boolean;
}

export default function ToneConsistencyCard({
	data,
	loading,
}: ToneConsistencyCardProps) {
	const { t } = useTranslation('qa.emotionSentiment');

	const chartData = data
		? [
				{
					tone: t('charts.toneConsistency.labels.polite'),
					polite: data.polite,
					professional: data.professional,
					empathetic: data.empathetic,
				},
			]
		: [];

	return (
		<Card withBorder radius='md' p='md' className='h-full'>
			<Stack gap='md' h='100%'>
				<Group justify='space-between' align='flex-start'>
					<div>
						<Text fw={600}>{t('charts.toneConsistency.title')}</Text>
						<Text size='sm' c='dimmed'>
							{t('charts.toneConsistency.subtitle')}
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
					<AreaChart
						h={300}
						data={chartData}
						dataKey='tone'
						series={[
							{
								name: 'polite',
								label: t('charts.toneConsistency.labels.polite'),
								color: 'blue',
							},
							{
								name: 'professional',
								label: t('charts.toneConsistency.labels.professional'),
								color: 'grape',
							},
							{
								name: 'empathetic',
								label: t('charts.toneConsistency.labels.empathetic'),
								color: 'teal',
							},
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
