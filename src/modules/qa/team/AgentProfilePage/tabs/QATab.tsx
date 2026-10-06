import { Badge, Paper, SimpleGrid, Stack, Table, Text } from '@mantine/core';
import { BarChart } from '@mantine/charts';
import { IconClipboardList } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { SectionCard } from '~/components/SectionCard';
import { StatCard } from '~/components/StatCard';
import type { AgentProfile } from '../../types';
import { QA_ERROR_TYPE_META, QA_ERROR_TYPE_ORDER } from '../../constants';
import { NEUTRAL_BAR_SERIES, alertScoreColor } from '../../helpers';
import { TrendDelta } from '../../components/TrendDelta';
import { EvaluationHistoryTable } from '../../components/EvaluationHistoryTable';

interface QATabProps {
	profile: AgentProfile;
}

export function QATab({ profile }: QATabProps) {
	const { t } = useTranslation('qa.team');
	const { qa } = profile;

	return (
		<Stack gap='md'>
			<SimpleGrid cols={{ base: 2, md: 4 }} spacing='md'>
				<StatCard
					title={t('qa.kpi.average')}
					value={`${qa.averageScore}%`}
					color={alertScoreColor(qa.averageScore)}
				/>
				<StatCard title={t('qa.kpi.passRate')} value={`${qa.passRate}%`} />
				<StatCard title={t('qa.kpi.evaluations')} value={qa.evaluations} />
				<StatCard
					title={t('qa.kpi.autoFails')}
					value={qa.autoFails}
					color={qa.autoFails > 0 ? 'red' : undefined}
				/>
			</SimpleGrid>

			<SectionCard
				title={t('qa.errorTypes')}
				description={t('qa.errorTypesDescription')}
				icon={IconClipboardList}
			>
				<SimpleGrid cols={{ base: 2, md: 4 }} spacing='sm'>
					{QA_ERROR_TYPE_ORDER.map((code) => {
						const meta = QA_ERROR_TYPE_META[code];
						const entry = qa.errorTypes.find((e) => e.code === code)!;
						return (
							<Paper key={code} withBorder p='md' radius='md'>
								<Badge color='gray' variant='light'>
									{code}
								</Badge>
								<Text size='xs' c='dimmed' mt={4}>
									{meta.shortLabel}
								</Text>
								<Text fw={700} size='xl'>
									{entry.count}
								</Text>
								<Text size='xs' c='dimmed'>
									{t('qa.perCall', { value: entry.ratePerCall })}
								</Text>
								<TrendDelta
									delta={entry.delta}
									trend={
										entry.delta > 0 ? 'up' : entry.delta < 0 ? 'down' : 'flat'
									}
									unit=''
								/>
							</Paper>
						);
					})}
				</SimpleGrid>
			</SectionCard>

			<SectionCard title={t('qa.errorTrend')}>
				<BarChart
					h={260}
					data={qa.errorTrend}
					dataKey='label'
					type='stacked'
					series={[
						{ name: 'ECN', color: NEUTRAL_BAR_SERIES[0] },
						{ name: 'ENC', color: NEUTRAL_BAR_SERIES[1] },
						{ name: 'ECC', color: NEUTRAL_BAR_SERIES[2] },
						{ name: 'ECUF', color: NEUTRAL_BAR_SERIES[3] },
					]}
					withLegend
				/>
			</SectionCard>

			<SectionCard title={t('qa.topFailed')}>
				<Table striped highlightOnHover>
					<Table.Thead>
						<Table.Tr>
							<Table.Th>{t('qa.columns.item')}</Table.Th>
							<Table.Th>{t('qa.columns.aspect')}</Table.Th>
							<Table.Th>{t('qa.columns.errorType')}</Table.Th>
							<Table.Th>{t('qa.columns.count')}</Table.Th>
						</Table.Tr>
					</Table.Thead>
					<Table.Tbody>
						{qa.topFailedItems.map((item) => (
							<Table.Tr key={item.item}>
								<Table.Td>{item.item}</Table.Td>
								<Table.Td>{item.aspect}</Table.Td>
								<Table.Td>
									<Badge color='gray' variant='light' size='sm'>
										{item.errorType}
									</Badge>
								</Table.Td>
								<Table.Td>{item.count}</Table.Td>
							</Table.Tr>
						))}
					</Table.Tbody>
				</Table>
			</SectionCard>

			<SectionCard
				title={t('qa.history')}
				description={t('qa.historyDescription')}
			>
				<EvaluationHistoryTable rows={profile.evaluations} />
			</SectionCard>
		</Stack>
	);
}
