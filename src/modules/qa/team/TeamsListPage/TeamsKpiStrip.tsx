import { SimpleGrid } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { StatCard } from '~/components/StatCard';
import type { teamsListKpis } from '../helpers';

interface TeamsKpiStripProps {
	kpis: ReturnType<typeof teamsListKpis>;
}

/** Numbers stay neutral; only At risk and Unassigned turn red, and only when above zero. */
const ALERT = 'var(--mantine-color-red-text)';

export function TeamsKpiStrip({ kpis }: TeamsKpiStripProps) {
	const { t } = useTranslation('qa.team');

	return (
		<SimpleGrid cols={{ base: 2, md: 5 }} spacing='md'>
			<StatCard title={t('teams.list.kpi.teams')} value={kpis.teams} />
			<StatCard title={t('teams.list.kpi.agents')} value={kpis.agents} />
			<StatCard
				title={t('teams.list.kpi.averageOverall')}
				value={kpis.averageOverall}
			/>
			<StatCard
				title={t('teams.list.kpi.atRisk')}
				value={kpis.atRisk}
				subtitle={t('team.kpi.atRiskHint')}
				color={kpis.atRisk > 0 ? ALERT : undefined}
			/>
			<StatCard
				title={t('teams.list.kpi.unassigned')}
				value={kpis.unassigned}
				color={kpis.unassigned > 0 ? ALERT : undefined}
			/>
		</SimpleGrid>
	);
}
