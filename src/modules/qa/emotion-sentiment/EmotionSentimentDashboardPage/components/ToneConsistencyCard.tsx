import { Card, Group, Loader, Stack, Text, Flex } from '@mantine/core';
import { PieChart } from '@mantine/charts';
import { useTranslation } from 'react-i18next';
import type { ToneScore } from '../../utils/types';

interface ToneConsistencyCardProps {
	data: ToneScore | null;
	loading: boolean;
}

const TONE_COLORS = {
	polite: 'var(--mantine-color-blue-6)',
	professional: 'var(--mantine-color-grape-6)',
	empathetic: 'var(--mantine-color-teal-6)',
};

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
					color: TONE_COLORS.polite,
				},
				{
					name: t('charts.toneConsistency.labels.professional'),
					value: data.professional,
					color: TONE_COLORS.professional,
				},
				{
					name: t('charts.toneConsistency.labels.empathetic'),
					value: data.empathetic,
					color: TONE_COLORS.empathetic,
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
					<Stack gap='lg' align='center'>
						{/* inline-style-allow: pie chart centering */}
						<div
							style={{
								display: 'flex',
								justifyContent: 'center',
								width: '100%',
							}}
						>
							<PieChart h={250} data={chartData} withLabels />
						</div>

						{/* Legend */}
						<Flex gap='md' wrap='wrap' justify='center'>
							{chartData.map((item) => (
								<Flex key={item.name} gap='xs' align='center'>
									{/* inline-style-allow: legend color indicator */}
									<div
										style={{
											width: 12,
											height: 12,
											borderRadius: 2,
											backgroundColor: item.color,
										}}
									/>
									<Text size='sm'>{item.name}</Text>
								</Flex>
							))}
						</Flex>
					</Stack>
				)}
			</Stack>
		</Card>
	);
}
