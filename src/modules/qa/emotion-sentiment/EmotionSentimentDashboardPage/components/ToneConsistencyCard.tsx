import { Card, Group, Loader, Stack, Text } from '@mantine/core';
import { PieChart } from '@mantine/charts';
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
					name: t('charts.toneConsistency.labels.polite'),
					value: data.polite,
					color: 'var(--mantine-color-blue-6)',
				},
				{
					name: t('charts.toneConsistency.labels.professional'),
					value: data.professional,
					color: 'var(--mantine-color-grape-6)',
				},
				{
					name: t('charts.toneConsistency.labels.empathetic'),
					value: data.empathetic,
					color: 'var(--mantine-color-teal-6)',
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
					<PieChart h={300} data={chartData} />
				)}
			</Stack>
		</Card>
	);
}
