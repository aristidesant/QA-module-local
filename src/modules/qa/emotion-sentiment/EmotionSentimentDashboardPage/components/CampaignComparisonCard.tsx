import { Card, Group, Loader, Stack, Text } from '@mantine/core';
import { BarChart } from '@mantine/charts';
import { useTranslation } from 'react-i18next';
import type { CampaignComparison } from '../../utils/types';

interface CampaignComparisonCardProps {
	data: CampaignComparison[];
	loading: boolean;
}

export default function CampaignComparisonCard({
	data,
	loading,
}: CampaignComparisonCardProps) {
	const { t } = useTranslation('qa.emotionSentiment');

	const chartData = data.map((campaign) => ({
		campaign: campaign.campaignName,
		sentiment: Math.round(campaign.avgSentiment * 100),
		positive: campaign.positivePercentage,
	}));

	return (
		<Card withBorder radius='md' p='md' className='h-full'>
			<Stack gap='md' h='100%'>
				<Group justify='space-between' align='flex-start'>
					<div>
						<Text fw={600}>{t('charts.campaignComparison.title')}</Text>
						<Text size='sm' c='dimmed'>
							{t('charts.campaignComparison.subtitle')}
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
						dataKey='campaign'
						series={[
							{ name: 'sentiment', label: 'Avg Sentiment', color: 'blue' },
							{ name: 'positive', label: 'Positive %', color: 'green' },
						]}
						withLegend
						withTooltip
					/>
				)}
			</Stack>
		</Card>
	);
}
