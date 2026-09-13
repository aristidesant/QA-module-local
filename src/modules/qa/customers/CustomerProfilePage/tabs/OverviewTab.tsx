import { Badge, Button, Group, Paper, Progress, SimpleGrid, Stack, Text } from '@mantine/core';
import { LineChart } from '@mantine/charts';
import { IconCheck, IconChartLine, IconClock, IconMinus, IconSettings, IconSparkles, IconTrendingDown, IconTrendingUp, IconX, IconCalendarEvent } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { SectionCard } from '~/components/SectionCard';
import { StatCard } from '~/components/StatCard';
import { EmptyState } from '~/components/EmptyState/EmptyState';
import { BUSINESS_SIGNAL_META, BUSINESS_SIGNAL_ORDER } from '~/modules/qa/team/constants';
import { formatDateTime, formatSeconds, sentimentColor } from '~/modules/qa/team/helpers';
import { useCustomersStore } from '~/stores/qa/customersStore';
import type { CustomerProfile } from '../../types';
import { CHANNEL_META } from '../../constants';
import { npsBand } from '../../helpers';
import { ContactWindowTiles } from '../../components/ContactWindowTiles';

interface OverviewTabProps {
	profile: CustomerProfile;
}

const DIRECTION_ICON = { up: IconTrendingUp, down: IconTrendingDown, flat: IconMinus } as const;
const DIRECTION_COLOR = { up: 'teal', down: 'red', flat: 'gray' } as const;

export function OverviewTab({ profile }: OverviewTabProps) {
	const { t } = useTranslation('qa.customers');
	const { customer, kpis, sentimentSeries, bestWindows, worstWindows, signalCounts, followUps } = profile;
	const completeFollowUp = useCustomersStore((s) => s.completeFollowUp);

	const DirIcon = DIRECTION_ICON[kpis.sentimentTrend];
	const total = signalCounts.reduce((s, x) => s + x.count, 0) || 1;
	const third = Math.max(1, Math.floor(sentimentSeries.length / 3));
	const delta = sentimentSeries.length >= 2
		? +(sentimentSeries.slice(-third).reduce((s, x) => s + x.customer, 0) / third - sentimentSeries.slice(0, third).reduce((s, x) => s + x.customer, 0) / third).toFixed(1)
		: 0;

	return (
		<Stack gap='md'>
			<SimpleGrid cols={{ base: 2, md: 4 }} spacing='md'>
				<StatCard title={t('overview.kpi.contacts')} value={kpis.totalContacts} subtitle={`${kpis.answerRate}% ${t('overview.kpi.answerRate').toLowerCase()}`} />
				<StatCard title={t('overview.kpi.avgDuration')} value={formatSeconds(kpis.avgDurationSeconds)} />
				<StatCard title={t('overview.kpi.agents')} value={kpis.agentsInvolved} />
				<StatCard title={t('overview.kpi.offers')} value={kpis.offersPresented} subtitle={`${kpis.acceptanceRate}% ${t('overview.kpi.acceptance').toLowerCase()}`} />
				<StatCard title={t('overview.kpi.sentiment')} value={`${kpis.avgCustomerSentiment.toFixed(1)}/5`} color={sentimentColor(kpis.avgCustomerSentiment)} />
				<StatCard title={t('overview.kpi.nps')} value={kpis.npsLatest ?? '—'} color={kpis.npsLatest !== undefined ? npsBand(kpis.npsLatest).color : undefined} />
			</SimpleGrid>

			<SectionCard
				title={t('overview.sentimentTrend')}
				description={t('overview.sentimentTrendDescription')}
				icon={IconChartLine}
				headerActions={(
					<Badge color={DIRECTION_COLOR[kpis.sentimentTrend]} variant='light' leftSection={<DirIcon size={12} />}>
						{t(`overview.direction.${kpis.sentimentTrend}`)}
					</Badge>
				)}
			>
				{sentimentSeries.length === 0 ? <EmptyState message={t('overview.windows')} /> : (
					<>
						<LineChart
							h={260}
							data={sentimentSeries}
							dataKey='label'
							series={[{ name: 'customer', label: t('sentiment.customer'), color: 'orange.6' }]}
							yAxisProps={{ domain: [1, 5] }}
							withDots
							curveType='monotone'
						/>
						<Text size='xs' c='dimmed' mt='xs'>{t('overview.directionHint', { delta })}</Text>
					</>
				)}
			</SectionCard>

			<SectionCard title={t('overview.windows')} description={t('overview.windowsDescription')} icon={IconClock}>
				<ContactWindowTiles best={bestWindows} worst={worstWindows} />
			</SectionCard>

			<SimpleGrid cols={{ base: 1, md: 2 }} spacing='md'>
				<SectionCard title={t('overview.signals')} icon={IconSparkles}>
					<Stack gap='xs'>
						{BUSINESS_SIGNAL_ORDER.map((type) => {
							const meta = BUSINESS_SIGNAL_META[type];
							const entry = signalCounts.find((s) => s.type === type)!;
							return (
								<div key={type}>
									<Group justify='space-between'>
										<Badge variant='light' color={meta.tone === 'risk' ? 'orange' : 'teal'}>{meta.label}</Badge>
										<Text fw={600} size='sm'>{entry.count}</Text>
									</Group>
									<Progress value={(entry.count / total) * 100} color={meta.tone === 'risk' ? 'orange' : 'teal'} size='xs' mt={4} />
								</div>
							);
						})}
					</Stack>
				</SectionCard>
				<SectionCard title={t('overview.followUps')} icon={IconCalendarEvent}>
					{followUps.length === 0 ? <EmptyState message={t('overview.noFollowUps')} /> : (
						<Stack gap='xs'>
							{followUps.map((f) => (
								<Paper key={f.id} withBorder p='sm'>
									<Group justify='space-between'>
										<Stack gap={2}>
											<Text fw={600} size='sm'>{f.reason}</Text>
											<Text size='xs' c='dimmed'>{f.assignedAgentName} · {formatDateTime(f.date)}</Text>
										</Stack>
										{f.status === 'scheduled' ? (
											<Button size='xs' variant='light' onClick={() => completeFollowUp(customer.id, f.id)}>{t('overview.markDone')}</Button>
										) : (
											<Badge color='green'>{t('overview.done')}</Badge>
										)}
									</Group>
								</Paper>
							))}
						</Stack>
					)}
				</SectionCard>
			</SimpleGrid>

			<SectionCard title={t('overview.preferences')} icon={IconSettings}>
				<SimpleGrid cols={{ base: 2, md: 4 }} spacing='md' mb='md'>
					<div>
						<Text size='xs' c='dimmed'>{t('overview.preferredChannel')}</Text>
						<Text fw={600} size='sm'>{t(CHANNEL_META[customer.preferredChannel].labelKey)}</Text>
					</div>
					<div>
						<Text size='xs' c='dimmed'>{t('overview.language')}</Text>
						<Text fw={600} size='sm'>{t(`header.language.${customer.language}`)}</Text>
					</div>
					<div>
						<Text size='xs' c='dimmed'>{t('header.consentRecording')}</Text>
						{customer.consent.recording ? <IconCheck size={16} color='var(--mantine-color-green-6)' /> : <IconX size={16} color='var(--mantine-color-gray-5)' />}
					</div>
					<div>
						<Text size='xs' c='dimmed'>{t('header.consentMarketing')}</Text>
						{customer.consent.marketing ? <IconCheck size={16} color='var(--mantine-color-green-6)' /> : <IconX size={16} color='var(--mantine-color-gray-5)' />}
					</div>
				</SimpleGrid>
				<Group gap='xs'>
					{customer.tags.map((tag) => <Badge key={tag} variant='light' color='indigo'>{tag}</Badge>)}
				</Group>
			</SectionCard>
		</Stack>
	);
}
