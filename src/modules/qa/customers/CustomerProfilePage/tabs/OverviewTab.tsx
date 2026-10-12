import { Group, SimpleGrid, Stack, Text } from '@mantine/core';
import { LineChart } from '@mantine/charts';
import { useTranslation } from 'react-i18next';
import { SectionCard } from '~/components/SectionCard';
import { EmptyState } from '~/components/EmptyState/EmptyState';
import {
	BUSINESS_SIGNAL_META,
	BUSINESS_SIGNAL_ORDER,
} from '~/modules/qa/team/constants';
import { Caption } from '~/modules/qa/coaching/components/SessionBrief';
import { formatDate, formatSeconds } from '~/modules/qa/team/helpers';
import type { CustomerProfile } from '../../types';
import { ContactWindowTiles } from '../../components/ContactWindowTiles';

interface OverviewTabProps {
	profile: CustomerProfile;
}

/** The 1-5 sentiment scale and the dashboard band that names each step. */
const SENTIMENT_SCALE = [
	{ score: 1, band: 'veryNegative' },
	{ score: 2, band: 'negative' },
	{ score: 3, band: 'neutral' },
	{ score: 4, band: 'positive' },
	{ score: 5, band: 'veryPositive' },
] as const;

export function OverviewTab({ profile }: OverviewTabProps) {
	const { t } = useTranslation(['qa.customers', 'qa.dashboard']);
	const { kpis, sentimentSeries, bestWindows, worstWindows, signalCounts } =
		profile;

	const third = Math.max(1, Math.floor(sentimentSeries.length / 3));
	const delta =
		sentimentSeries.length >= 2
			? +(
					sentimentSeries.slice(-third).reduce((s, x) => s + x.customer, 0) /
						third -
					sentimentSeries.slice(0, third).reduce((s, x) => s + x.customer, 0) /
						third
				).toFixed(1)
			: 0;

	return (
		<Stack gap='md'>
			<SectionCard
				title={t('overview.activity')}
				description={t('overview.activityDescription', {
					first: formatDate(kpis.firstContactAt),
					last: formatDate(kpis.lastContactAt),
				})}
				padding='md'
			>
				<SimpleGrid cols={{ base: 2, sm: 3, md: 6 }} spacing='md'>
					{[
						{
							label: t('overview.kpi.contacts'),
							value: String(kpis.totalContacts),
						},
						{
							label: t('overview.kpi.answerRate'),
							value: `${kpis.answerRate}%`,
						},
						{
							label: t('overview.kpi.avgDuration'),
							value: formatSeconds(kpis.avgDurationSeconds),
						},
						{
							label: t('overview.kpi.agents'),
							value: String(kpis.agentsInvolved),
						},
						{
							label: t('overview.kpi.offers'),
							value: String(kpis.offersPresented),
						},
						{
							label: t('overview.kpi.acceptance'),
							value: `${kpis.acceptanceRate}%`,
						},
					].map((item) => (
						<Stack key={item.label} gap={2}>
							<Caption>{item.label}</Caption>
							<Text fw={700} size='lg' lh={1.1}>
								{item.value}
							</Text>
						</Stack>
					))}
				</SimpleGrid>
			</SectionCard>

			<SectionCard
				title={t('overview.sentimentTrend')}
				description={t('overview.sentimentTrendDescription')}
				headerActions={
					<Text size='sm' c='dimmed'>
						{t(`overview.direction.${kpis.sentimentTrend}`)}
					</Text>
				}
			>
				{sentimentSeries.length === 0 ? (
					<EmptyState message={t('overview.noSentiment')} />
				) : (
					<>
						<LineChart
							h={260}
							data={sentimentSeries}
							dataKey='label'
							series={[
								{
									name: 'customer',
									label: t('sentiment.customer'),
									color: 'gray.6',
								},
							]}
							yAxisProps={{
								domain: [1, 5],
								ticks: SENTIMENT_SCALE.map((s) => s.score),
								tickFormatter: (value: number) => {
									const step = SENTIMENT_SCALE.find((s) => s.score === value);
									return step
										? `${value} · ${t(`sentimentBands.${step.band}`, { ns: 'qa.dashboard' })}`
										: String(value);
								},
								width: 130,
							}}
							withDots
							curveType='monotone'
						/>
						<Text size='xs' c='dimmed' mt='xs'>
							{t('overview.directionHint', { delta })}
						</Text>
					</>
				)}
			</SectionCard>

			<SectionCard
				title={t('overview.windows')}
				description={t('overview.windowsDescription')}
			>
				<ContactWindowTiles best={bestWindows} worst={worstWindows} />
			</SectionCard>

			<SectionCard title={t('overview.signals')}>
				<Stack gap='xs'>
					{BUSINESS_SIGNAL_ORDER.map((type) => {
						const meta = BUSINESS_SIGNAL_META[type];
						const entry = signalCounts.find((s) => s.type === type)!;
						return (
							<Group key={type} justify='space-between'>
								<Text size='sm'>{meta.label}</Text>
								<Text fw={600} size='sm'>
									{entry.count}
								</Text>
							</Group>
						);
					})}
				</Stack>
			</SectionCard>
		</Stack>
	);
}
