import { Group, SimpleGrid, Text, Tooltip } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { StatCard } from '~/components/StatCard';
import type { customerKpis } from '../helpers';

interface CustomerKpiStripProps {
	kpis: ReturnType<typeof customerKpis>;
}

/** Numbers stay neutral; the only colour is red on churn, and only when there is someone at high risk. */
export function CustomerKpiStrip({ kpis }: CustomerKpiStripProps) {
	const { t } = useTranslation('qa.customers');

	return (
		<SimpleGrid cols={{ base: 2, md: 5 }} spacing='md'>
			<StatCard
				title={t('list.kpi.total')}
				value={kpis.total}
				badge={
					<Group gap={8}>
						<Tooltip label={t('list.kpi.improving')}>
							<Text size='xs' c='dimmed'>
								↑ {kpis.improving}
							</Text>
						</Tooltip>
						<Tooltip label={t('list.kpi.declining')}>
							<Text size='xs' c='dimmed'>
								↓ {kpis.declining}
							</Text>
						</Tooltip>
					</Group>
				}
			/>
			<StatCard title={t('list.kpi.receptive')} value={kpis.receptive} />
			<StatCard
				title={t('list.kpi.churnHigh')}
				value={kpis.churnHigh}
				color={kpis.churnHigh > 0 ? 'var(--mantine-color-red-text)' : undefined}
			/>
			<StatCard title={t('list.kpi.doNotCall')} value={kpis.doNotCall} />
			<StatCard
				title={t('list.kpi.avgAcceptance')}
				value={`${kpis.avgAcceptance}%`}
			/>
		</SimpleGrid>
	);
}
