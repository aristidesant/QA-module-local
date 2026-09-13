import { Badge, Group, SimpleGrid, Tooltip } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { StatCard } from '~/components/StatCard';
import type { customerKpis } from '../helpers';

interface CustomerKpiStripProps {
	kpis: ReturnType<typeof customerKpis>;
}

export function CustomerKpiStrip({ kpis }: CustomerKpiStripProps) {
	const { t } = useTranslation('qa.customers');

	return (
		<SimpleGrid cols={{ base: 2, md: 5 }} spacing='md'>
			<StatCard
				title={t('list.kpi.total')}
				value={kpis.total}
				badge={(
					<Group gap={4}>
						<Tooltip label={t('list.kpi.improving')}>
							<Badge color='teal' variant='light'>↑{kpis.improving}</Badge>
						</Tooltip>
						<Tooltip label={t('list.kpi.declining')}>
							<Badge color='red' variant='light'>↓{kpis.declining}</Badge>
						</Tooltip>
					</Group>
				)}
			/>
			<StatCard title={t('list.kpi.receptive')} value={kpis.receptive} color='green' />
			<StatCard title={t('list.kpi.churnHigh')} value={kpis.churnHigh} color={kpis.churnHigh > 0 ? 'red' : undefined} />
			<StatCard title={t('list.kpi.doNotCall')} value={kpis.doNotCall} color='gray' />
			<StatCard title={t('list.kpi.avgAcceptance')} value={`${kpis.avgAcceptance}%`} />
		</SimpleGrid>
	);
}
