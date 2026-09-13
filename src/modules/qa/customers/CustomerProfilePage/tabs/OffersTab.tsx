import { Badge, Group, SimpleGrid, Stack, Text } from '@mantine/core';
import { DonutChart } from '@mantine/charts';
import { IconBuildingStore, IconSparkles, IconTag } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { SectionCard } from '~/components/SectionCard';
import { StatCard } from '~/components/StatCard';
import { EmptyState } from '~/components/EmptyState/EmptyState';
import { BUSINESS_SIGNAL_META, BUSINESS_SIGNAL_ORDER, NON_CONVERSION_REASON_LABELS } from '~/modules/qa/team/constants';
import type { CustomerProfile } from '../../types';
import { OfferRow } from '../../components/OfferRow';

const REASON_COLORS = ['red.6', 'orange.6', 'yellow.6', 'grape.6', 'blue.6', 'gray.6'];

interface OffersTabProps {
	profile: CustomerProfile;
}

export function OffersTab({ profile }: OffersTabProps) {
	const { t } = useTranslation('qa.customers');
	const { kpis, offers, nonConversionReasons, competitors, objections, signalCounts } = profile;
	const answered = kpis.answered || 1;

	return (
		<Stack gap='md'>
			<SimpleGrid cols={{ base: 2, md: 4 }} spacing='md'>
				<StatCard title={t('offers.kpi.presented')} value={kpis.offersPresented} />
				<StatCard title={t('offers.kpi.accepted')} value={kpis.offersAccepted} color='green' />
				<StatCard title={t('offers.kpi.rejected')} value={kpis.offersRejected} color='red' />
				<StatCard title={t('offers.kpi.deferred')} value={offers.filter((o) => o.result === 'deferred').length} color='yellow' />
			</SimpleGrid>

			<SimpleGrid cols={{ base: 1, md: 2 }} spacing='md'>
				<SectionCard title={t('offers.history')} icon={IconTag}>
					{offers.length === 0 ? <EmptyState message={t('offers.noOffers')} /> : (
						<Stack gap='xs'>
							{[...offers].sort((a, b) => b.date.localeCompare(a.date)).map((offer) => <OfferRow key={offer.id} offer={offer} />)}
						</Stack>
					)}
				</SectionCard>
				<Stack gap='md'>
					<SectionCard title={t('offers.reasons')}>
						{nonConversionReasons.length === 0 ? <EmptyState message={t('offers.noOffers')} /> : (
							<>
								<DonutChart
									size={150}
									thickness={20}
									withLabels
									data={nonConversionReasons.map((r, i) => ({ name: NON_CONVERSION_REASON_LABELS[r.key], value: r.count, color: REASON_COLORS[i % REASON_COLORS.length] }))}
								/>
								<Stack gap={4} mt='sm'>
									{nonConversionReasons.map((r) => (
										<Text key={r.key} size='xs'>{NON_CONVERSION_REASON_LABELS[r.key]} — {r.count}</Text>
									))}
								</Stack>
							</>
						)}
					</SectionCard>
					<SectionCard title={t('offers.competitors')}>
						<Group gap='sm'>
							{competitors.filter((c) => c.count > 0).map((c) => (
								<Badge key={c.name} size='lg' variant='light' color='orange' leftSection={<IconBuildingStore size={14} />}>
									{c.name} · {t('offers.mentions', { count: c.count })}
								</Badge>
							))}
						</Group>
					</SectionCard>
					<SectionCard title={t('offers.objections')}>
						<Stack gap='xs'>
							{objections.map((o) => (
								<Group key={o.text} justify='space-between'>
									<Text size='sm'>&ldquo;{o.text}&rdquo;</Text>
									<Badge variant='outline'>{t('offers.times', { count: o.count })}</Badge>
								</Group>
							))}
						</Stack>
					</SectionCard>
				</Stack>
			</SimpleGrid>

			<SectionCard title={t('offers.signals')} description={t('offers.signalsDescription')} icon={IconSparkles}>
				<Stack gap='xs'>
					{BUSINESS_SIGNAL_ORDER.map((type) => {
						const meta = BUSINESS_SIGNAL_META[type];
						const entry = signalCounts.find((s) => s.type === type)!;
						const rate = Math.round((entry.count / answered) * 100);
						return (
							<Group key={type} justify='space-between'>
								<Badge variant='light' color={meta.tone === 'risk' ? 'orange' : 'teal'}>{meta.label}</Badge>
								<Text size='sm' fw={600}>{entry.count} ({rate}%)</Text>
							</Group>
						);
					})}
				</Stack>
			</SectionCard>
		</Stack>
	);
}
