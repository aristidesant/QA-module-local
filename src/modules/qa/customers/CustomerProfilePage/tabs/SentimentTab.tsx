import { Badge, ColorSwatch, Group, Progress, SimpleGrid, Stack, Text, Tooltip } from '@mantine/core';
import { LineChart } from '@mantine/charts';
import { useTranslation } from 'react-i18next';
import { SectionCard } from '~/components/SectionCard';
import { EMOTION_META, SENTIMENT_CATEGORY_META, SENTIMENT_CATEGORY_ORDER } from '~/modules/qa/team/constants';
import { sentimentColor } from '~/modules/qa/team/helpers';
import { ScoreRing } from '~/modules/qa/team/components/ScoreRing';
import type { CustomerProfile } from '../../types';

interface SentimentTabProps {
	profile: CustomerProfile;
}

export function SentimentTab({ profile }: SentimentTabProps) {
	const { t } = useTranslation('qa.customers');
	const { kpis, sentimentSeries, categoryShare, topEmotions } = profile;

	const first = sentimentSeries[0];
	const latest = sentimentSeries[sentimentSeries.length - 1];
	const best = sentimentSeries.reduce((max, p) => (p.customer > (max?.customer ?? -Infinity) ? p : max), sentimentSeries[0]);
	const worst = sentimentSeries.reduce((min, p) => (p.customer < (min?.customer ?? Infinity) ? p : min), sentimentSeries[0]);

	return (
		<Stack gap='md'>
			<SimpleGrid cols={{ base: 1, md: 2 }} spacing='md'>
				<SectionCard title={t('sentiment.average')}>
					<Group gap='md'>
						<ScoreRing value={kpis.avgCustomerSentiment} max={5} label={kpis.avgCustomerSentiment.toFixed(1)} color={sentimentColor(kpis.avgCustomerSentiment)} />
						<SimpleGrid cols={2} spacing='xs' style={{ flex: 1 }}>
							<div>
								<Text size='xs' c='dimmed'>{t('sentiment.first')}</Text>
								<Text fw={600}>{first ? `${first.customer.toFixed(1)} · ${first.label}` : '—'}</Text>
							</div>
							<div>
								<Text size='xs' c='dimmed'>{t('sentiment.latest')}</Text>
								<Text fw={600}>{latest ? `${latest.customer.toFixed(1)} · ${latest.label}` : '—'}</Text>
							</div>
							<div>
								<Text size='xs' c='dimmed'>{t('sentiment.peak')}</Text>
								<Text fw={600}>{best ? `${best.customer.toFixed(1)} · ${best.label}` : '—'}</Text>
							</div>
							<div>
								<Text size='xs' c='dimmed'>{t('sentiment.low')}</Text>
								<Text fw={600}>{worst ? `${worst.customer.toFixed(1)} · ${worst.label}` : '—'}</Text>
							</div>
						</SimpleGrid>
					</Group>
				</SectionCard>

				<SectionCard title={t('sentiment.categories')}>
					<Progress.Root size='lg' mb='sm'>
						{SENTIMENT_CATEGORY_ORDER.map((key) => {
							const pct = categoryShare[key];
							if (!pct) return null;
							const meta = SENTIMENT_CATEGORY_META[key];
							return (
								<Tooltip key={key} label={`${meta.label} ${pct}%`}>
									<Progress.Section value={pct} color={meta.color} />
								</Tooltip>
							);
						})}
					</Progress.Root>
					<Group gap='sm' mb='md'>
						{SENTIMENT_CATEGORY_ORDER.map((key) => {
							const pct = categoryShare[key];
							if (!pct) return null;
							const meta = SENTIMENT_CATEGORY_META[key];
							return (
								<Group key={key} gap={4}>
									<ColorSwatch size={10} color={`var(--mantine-color-${meta.color}-6)`} />
									<Text size='xs'>{meta.label} {pct}%</Text>
								</Group>
							);
						})}
					</Group>
					<Text size='xs' fw={600} c='dimmed' tt='uppercase' mb='xs'>{t('sentiment.emotions')}</Text>
					<Stack gap={6}>
						{topEmotions.map(({ emotion, share }) => {
							const meta = EMOTION_META[emotion];
							return (
								<div key={emotion}>
									<Group justify='space-between' mb={4}>
										<Badge variant='light' color={meta.color}>{meta.label}</Badge>
										<Text size='xs' c='dimmed'>{share}%</Text>
									</Group>
									<Progress value={share} color={meta.color} size='xs' />
								</div>
							);
						})}
					</Stack>
				</SectionCard>
			</SimpleGrid>

			<SectionCard title={t('sentiment.trend')} description={t('sentiment.trendDescription')}>
				<LineChart
					h={280}
					data={sentimentSeries}
					dataKey='label'
					series={[
						{ name: 'customer', label: t('sentiment.customer'), color: 'orange.6' },
						{ name: 'agent', label: t('sentiment.agent'), color: 'blue.6' },
					]}
					yAxisProps={{ domain: [1, 5] }}
					withLegend
					withDots
				/>
				{first && latest && (
					<Text size='xs' c='dimmed' mt='xs'>
						{t('sentiment.first')}: {SENTIMENT_CATEGORY_META[first.category].label} · {t('sentiment.latest')}: {SENTIMENT_CATEGORY_META[latest.category].label}
					</Text>
				)}
			</SectionCard>
		</Stack>
	);
}
