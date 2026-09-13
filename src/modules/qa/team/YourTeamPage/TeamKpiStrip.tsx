import { SimpleGrid, Badge, Tooltip, Group } from '@mantine/core';
import { IconAlertTriangle, IconCalendarEvent, IconChartBar, IconSchool } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { StatCard } from '~/components/StatCard';
import type { teamKpis } from '../helpers';
import { getScoreColor } from '../helpers';

interface TeamKpiStripProps {
	kpis: ReturnType<typeof teamKpis>;
}

export function TeamKpiStrip({ kpis }: TeamKpiStripProps) {
	const { t } = useTranslation('qa.team');

	return (
		<SimpleGrid cols={{ base: 2, md: 4 }} spacing='md'>
			<StatCard
				title={t('team.kpi.averageOverall')}
				value={kpis.averageOverall}
				color={getScoreColor(kpis.averageOverall)}
				icon={<IconChartBar size={18} />}
				badge={
					<Group gap={4}>
						<Tooltip label={t('team.kpi.improving')}>
							<Badge color='teal' variant='light'>↑{kpis.improving}</Badge>
						</Tooltip>
						<Tooltip label={t('team.kpi.declining')}>
							<Badge color='red' variant='light'>↓{kpis.declining}</Badge>
						</Tooltip>
					</Group>
				}
			/>
			<StatCard
				title={t('team.kpi.atRisk')}
				value={kpis.atRisk}
				subtitle={t('team.kpi.atRiskHint')}
				color={kpis.atRisk > 0 ? 'red' : undefined}
				icon={<IconAlertTriangle size={18} />}
			/>
			<StatCard
				title={t('team.kpi.overdueLms')}
				value={kpis.overdueLms}
				color={kpis.overdueLms > 0 ? 'orange' : undefined}
				icon={<IconSchool size={18} />}
			/>
			<StatCard
				title={t('team.kpi.openCoaching')}
				value={kpis.openCoaching}
				color='blue'
				icon={<IconCalendarEvent size={18} />}
			/>
		</SimpleGrid>
	);
}
