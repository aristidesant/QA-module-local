import { Group, SimpleGrid, Stack, Text } from '@mantine/core';
import { LineChart } from '@mantine/charts';
import { useTranslation } from 'react-i18next';
import { SectionCard } from '~/components/SectionCard';
import { StatCard } from '~/components/StatCard';
import { EmptyState } from '~/components/EmptyState/EmptyState';
import {
	BUSINESS_SIGNAL_META,
	BUSINESS_SIGNAL_ORDER,
} from '~/modules/qa/team/constants';
import { formatSeconds } from '~/modules/qa/team/helpers';
import { useSettingsStore, selectThresholds } from '~/stores/qa/settingsStore';
import type { CustomerProfile } from '../../types';
import { ContactWindowTiles } from '../../components/ContactWindowTiles';

interface OverviewTabProps {
	profile: CustomerProfile;
}

/** Red text is the only colour on this tab, and only for what needs attention. Adapts to light and dark. */
const ALERT = 'var(--mantine-color-red-text)';
/** Detractors (0-6) are the only NPS scores worth flagging. */
const NPS_DETRACTOR_MAX = 6;

export function OverviewTab({ profile }: OverviewTabProps) {
	const { t } = useTranslation('qa.customers');
	const { kpis, sentimentSeries, bestWindows, worstWindows, signalCounts } =
		profile;

	const lowSentiment =
		useSettingsStore(selectThresholds).sentiment.lowSentimentIncident;
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
			<SimpleGrid cols={{ base: 2, md: 4 }} spacing='md'>
				<StatCard
					title={t('overview.kpi.contacts')}
					value={kpis.totalContacts}
					subtitle={`${kpis.answerRate}% ${t('overview.kpi.answerRate').toLowerCase()}`}
				/>
				<StatCard
					title={t('overview.kpi.avgDuration')}
					value={formatSeconds(kpis.avgDurationSeconds)}
				/>
				<StatCard
					title={t('overview.kpi.agents')}
					value={kpis.agentsInvolved}
				/>
				<StatCard
					title={t('overview.kpi.offers')}
					value={kpis.offersPresented}
					subtitle={`${kpis.acceptanceRate}% ${t('overview.kpi.acceptance').toLowerCase()}`}
				/>
				<StatCard
					title={t('overview.kpi.sentiment')}
					value={`${kpis.avgCustomerSentiment.toFixed(1)}/5`}
					color={kpis.avgCustomerSentiment < lowSentiment ? ALERT : undefined}
				/>
				<StatCard
					title={t('overview.kpi.nps')}
					value={kpis.npsLatest ?? '—'}
					color={
						kpis.npsLatest !== undefined && kpis.npsLatest <= NPS_DETRACTOR_MAX
							? ALERT
							: undefined
					}
				/>
			</SimpleGrid>

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
					<EmptyState message={t('overview.windows')} />
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
							yAxisProps={{ domain: [1, 5] }}
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
