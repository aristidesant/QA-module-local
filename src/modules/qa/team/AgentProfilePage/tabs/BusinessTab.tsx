import {
	Badge,
	Group,
	Paper,
	Progress,
	SimpleGrid,
	Stack,
	Text,
	ThemeIcon,
} from '@mantine/core';
import { DonutChart, LineChart } from '@mantine/charts';
import {
	IconAlertCircle,
	IconBulb,
	IconSparkles,
	IconThumbDown,
	IconThumbUp,
} from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { SectionCard } from '~/components/SectionCard';
import { StatCard } from '~/components/StatCard';
import { EmptyState } from '~/components/EmptyState/EmptyState';
import type { AgentProfile, ProductPerformance } from '../../types';
import { BUSINESS_SIGNAL_META, BUSINESS_SIGNAL_ORDER } from '../../constants';
import { alertScoreColor } from '../../helpers';
import { TrendDelta } from '../../components/TrendDelta';

const REASON_COLORS = ['var(--mantine-color-text)', 'gray.6', 'gray.4'];

function ProductCard({
	title,
	icon,
	product,
}: {
	title: string;
	icon: typeof IconThumbUp;
	product: ProductPerformance;
}) {
	const { t } = useTranslation('qa.team');
	return (
		<SectionCard title={title} icon={icon}>
			<Stack gap={4}>
				<Text fw={700} size='lg'>
					{product.name}
				</Text>
				<Text size='sm' c='dimmed'>
					{t('business.products.price', { value: product.price })}
				</Text>
				<Group gap='xs' mt='xs'>
					<Badge variant='light' color='gray'>
						{t('business.products.sold', {
							sold: product.sold,
							offered: product.offered,
						})}
					</Badge>
					<Badge variant='light' color='gray'>
						{t('business.products.rate', { value: product.conversionRate })}
					</Badge>
				</Group>
			</Stack>
		</SectionCard>
	);
}

interface BusinessTabProps {
	profile: AgentProfile;
}

export function BusinessTab({ profile }: BusinessTabProps) {
	const { t } = useTranslation('qa.team');
	const { business } = profile;
	// Best and worst by units sold; conversion rate breaks ties.
	const ranked = [...business.products].sort(
		(a, b) => b.sold - a.sold || b.conversionRate - a.conversionRate
	);
	const best = ranked[0];
	const worst = ranked.length > 1 ? ranked[ranked.length - 1] : undefined;

	return (
		<Stack gap='md'>
			<SimpleGrid cols={{ base: 2, md: 4 }} spacing='md'>
				<StatCard
					title={t('business.kpi.conversion')}
					value={`${business.conversionRate}%`}
					color={alertScoreColor(Math.min(100, business.conversionRate * 2.5))}
				/>
				<StatCard
					title={t('business.kpi.offers')}
					value={business.offersPresented}
				/>
				<StatCard
					title={t('business.kpi.converted')}
					value={business.converted}
				/>
				<StatCard
					title={t('business.kpi.followUps')}
					value={business.followUpsScheduled}
				/>
			</SimpleGrid>

			{best ? (
				<SimpleGrid cols={{ base: 1, md: 2 }} spacing='md'>
					<ProductCard
						title={t('business.products.best')}
						icon={IconThumbUp}
						product={best}
					/>
					{worst && (
						<ProductCard
							title={t('business.products.worst')}
							icon={IconThumbDown}
							product={worst}
						/>
					)}
				</SimpleGrid>
			) : (
				<SectionCard title={t('business.products.best')} icon={IconThumbUp}>
					<EmptyState message={t('business.products.empty')} />
				</SectionCard>
			)}

			<SectionCard
				title={t('business.signals')}
				description={t('business.signalsDescription')}
				icon={IconSparkles}
			>
				<Stack gap='xs'>
					{BUSINESS_SIGNAL_ORDER.map((type) => {
						const meta = BUSINESS_SIGNAL_META[type];
						const signal = business.signals.find((s) => s.type === type)!;
						return (
							<Paper key={type} withBorder p='sm' radius='sm'>
								<Group justify='space-between'>
									<Group gap='xs'>
										<ThemeIcon
											size='sm'
											radius='xl'
											variant='light'
											color={meta.tone === 'risk' ? 'orange' : 'gray'}
										>
											{meta.tone === 'risk' ? (
												<IconAlertCircle size={12} />
											) : (
												<IconBulb size={12} />
											)}
										</ThemeIcon>
										<Text fw={600} size='sm'>
											{meta.label}
										</Text>
										<Badge size='xs' variant='outline'>
											{t(`business.tone.${meta.tone}`)}
										</Badge>
									</Group>
									<Group gap='sm'>
										<Text fw={600} size='sm'>
											{signal.count}
										</Text>
										<Text size='xs' c='dimmed'>
											{t('qa.perCall', { value: signal.ratePerCall })}
										</Text>
										<TrendDelta
											delta={signal.delta}
											trend={
												signal.delta > 0
													? 'up'
													: signal.delta < 0
														? 'down'
														: 'flat'
											}
											unit=''
										/>
									</Group>
								</Group>
								<Progress
									value={signal.ratePerCall}
									color={meta.tone === 'risk' ? 'orange' : 'gray'}
									size='xs'
									mt='xs'
								/>
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
						series={[{ name: 'conversionRate', color: 'gray.6' }]}
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
							name: t(`business.causes.${r.key}`),
							value: r.count,
							color: REASON_COLORS[i % REASON_COLORS.length],
						}))}
					/>
				</SectionCard>
			</SimpleGrid>
		</Stack>
	);
}
