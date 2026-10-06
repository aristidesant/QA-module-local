import { SimpleGrid } from '@mantine/core';
import {
	IconAlertTriangle,
	IconCalendarEvent,
	IconSchool,
} from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { StatCard } from '~/components/StatCard';
import type { teamKpis } from '../helpers';

interface TeamKpiStripProps {
	kpis: ReturnType<typeof teamKpis>;
}

export function TeamKpiStrip({ kpis }: TeamKpiStripProps) {
	const { t } = useTranslation('qa.team');

	return (
		<SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing='md'>
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
				color={kpis.overdueLms > 0 ? 'red' : undefined}
				icon={<IconSchool size={18} />}
			/>
			<StatCard
				title={t('team.kpi.openCoaching')}
				value={kpis.openCoaching}
				icon={<IconCalendarEvent size={18} />}
			/>
		</SimpleGrid>
	);
}
