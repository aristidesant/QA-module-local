import { Badge, Group, Paper, Progress, SimpleGrid, Stack, Text, ThemeIcon } from '@mantine/core';
import { DonutChart, LineChart } from '@mantine/charts';
import { IconAlertCircle, IconBuildingStore, IconBulb, IconSparkles } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { SectionCard } from '~/components/SectionCard';
import { StatCard } from '~/components/StatCard';
import type { AgentProfile } from '../../types';
import { BUSINESS_SIGNAL_META, BUSINESS_SIGNAL_ORDER, NON_CONVERSION_REASON_LABELS } from '../../constants';
import { getScoreColor } from '../../helpers';
import { TrendDelta } from '../../components/TrendDelta';

const REASON_COLORS = ['red.6', 'orange.6', 'yellow.6', 'grape.6', 'blue.6', 'gray.6'];

interface BusinessTabProps {
	profile: AgentProfile;
}

export function BusinessTab({ profile }: BusinessTabProps) {
	const { t } = useTranslation('qa.team');
	const { business } = profile;

	return (
		<Stack gap='md'>
			<SimpleGrid cols={{ base: 2, md: 4 }} spacing='md'>
				<StatCard title={t('business.kpi.conversion')} value={`${business.conversionRate}%`} color={getScoreColor(Math.min(100, business.conversionRate * 2.5))} />
				<StatCard title={t('business.kpi.offers')} value={business.offersPresented} />
				<StatCard title={t('business.kpi.converted')} value={business.converted} color='green' />
				<StatCard title={t('business.kpi.followUps')} value={business.followUpsScheduled} />
			</SimpleGrid>

			<SectionCard title={t('business.signals')} description={t('business.signalsDescription')} icon={IconSparkles}>
				<Stack gap='xs'>
					{BUSINESS_SIGNAL_ORDER.map((type) => {
						const meta = BUSINESS_SIGNAL_META[type];
						const signal = business.signals.find((s) => s.type === type)!;
						return (
							<Paper key={type} withBorder p='sm' radius='sm'>
								<Group justify='space-between'>
									<Group gap='xs'>
										<ThemeIcon size='sm' radius='xl' variant='light' color={meta.tone === 'risk' ? 'orange' : 'teal'}>
											{meta.tone === 'risk' ? <IconAlertCircle size={12} /> : <IconBulb size={12} />}
										</ThemeIcon>
										<Text fw={600} size='sm'>{meta.label}</Text>
										<Badge size='xs' variant='outline'>{t(`business.tone.${meta.tone}`)}</Badge>
									</Group>
									<Group gap='sm'>
										<Text fw={600} size='sm'>{signal.count}</Text>
										<Text size='xs' c='dimmed'>{t('qa.perCall', { value: signal.ratePerCall })}</Text>
										<TrendDelta delta={signal.delta} trend={signal.delta > 0 ? 'up' : signal.delta < 0 ? 'down' : 'flat'} unit='' betterWhen={meta.tone === 'risk' ? 'lower' : 'higher'} />
									</Group>
								</Group>
								<Progress value={signal.ratePerCall} color={meta.tone === 'risk' ? 'orange' : 'teal'} size='xs' mt='xs' />
							</Paper>
						);
					})}
				</Stack>
			</SectionCard>

			<SimpleGrid cols={{ base: 1, md: 2 }} spacing='md'>
				<SectionCard title={t('business.conversionTrend')}>
					<LineChart
						h={240}
						data={business.conversionTrend}
						dataKey='label'
						series={[{ name: 'conversionRate', color: 'blue.6' }]}
						yAxisProps={{ domain: [0, 100] }}
						withDots
					/>
				</SectionCard>
				<SectionCard title={t('business.reasons')}>
					<DonutChart
						size={160}
						thickness={22}
						withLabelsLine
						withLabels
						data={business.nonConversionReasons.map((r, i) => ({
							name: NON_CONVERSION_REASON_LABELS[r.key],
							value: r.count,
							color: REASON_COLORS[i % REASON_COLORS.length],
						}))}
					/>
				</SectionCard>
			</SimpleGrid>

			<SectionCard title={t('business.competitors')}>
				<Group gap='sm'>
					{business.competitorMentions.map((c) => (
						<Badge key={c.name} size='lg' variant='light' color='orange' leftSection={<IconBuildingStore size={14} />}>
							{c.name} · {t('business.mentions', { count: c.count })}
						</Badge>
					))}
				</Group>
			</SectionCard>
		</Stack>
	);
}
