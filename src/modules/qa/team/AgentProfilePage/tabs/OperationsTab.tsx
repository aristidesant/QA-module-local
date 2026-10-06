import { SimpleGrid, Stack } from '@mantine/core';
import { LineChart, BarChart } from '@mantine/charts';
import { IconHeadset } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { SectionCard } from '~/components/SectionCard';
import type { AgentProfile } from '../../types';
import { OPERATIONAL_ORDER } from '../../constants';
import { formatSeconds, NEUTRAL_BAR_SERIES } from '../../helpers';
import { OperationalMetricCard } from '../../components/OperationalMetricCard';

interface OperationsTabProps {
	profile: AgentProfile;
}

export function OperationsTab({ profile }: OperationsTabProps) {
	const { t } = useTranslation('qa.team');
	const { operational, operationalTrend } = profile;

	return (
		<Stack gap='md'>
			<SectionCard
				title={t('ops.title')}
				description={t('ops.description')}
				icon={IconHeadset}
			>
				<SimpleGrid cols={{ base: 2, md: 5 }} spacing='md'>
					{OPERATIONAL_ORDER.map((key) => (
						<OperationalMetricCard
							key={key}
							metric={operational.find((m) => m.key === key)!}
						/>
					))}
				</SimpleGrid>
			</SectionCard>

			<SimpleGrid cols={{ base: 1, md: 2 }} spacing='md'>
				<SectionCard title={t('ops.ahtTrend')}>
					<LineChart
						h={240}
						data={operationalTrend}
						dataKey='label'
						series={[{ name: 'aht', color: 'gray.6' }]}
						withDots
						valueFormatter={formatSeconds}
					/>
				</SectionCard>
				<SectionCard title={t('ops.breakdown')}>
					<BarChart
						h={240}
						data={operationalTrend}
						dataKey='label'
						type='stacked'
						series={[
							{
								name: 'talk',
								label: t('ops.breakdownSeries.talk'),
								color: NEUTRAL_BAR_SERIES[0],
							},
							{
								name: 'hold',
								label: t('ops.breakdownSeries.hold'),
								color: NEUTRAL_BAR_SERIES[1],
							},
							{
								name: 'wrapUp',
								label: t('ops.breakdownSeries.wrapUp'),
								color: NEUTRAL_BAR_SERIES[3],
							},
						]}
						withLegend
						valueFormatter={formatSeconds}
					/>
				</SectionCard>
			</SimpleGrid>
		</Stack>
	);
}
