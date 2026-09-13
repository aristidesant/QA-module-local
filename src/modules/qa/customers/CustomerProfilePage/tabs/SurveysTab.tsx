import { SimpleGrid, Stack } from '@mantine/core';
import { LineChart } from '@mantine/charts';
import { useTranslation } from 'react-i18next';
import { SectionCard } from '~/components/SectionCard';
import { StatCard } from '~/components/StatCard';
import { EmptyState } from '~/components/EmptyState/EmptyState';
import type { CustomerProfile } from '../../types';
import { npsBand } from '../../helpers';
import { SurveyCard } from '../../components/SurveyCard';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const shortDate = (iso: string) => {
	const d = new Date(iso);
	return `${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}`;
};

interface SurveysTabProps {
	profile: CustomerProfile;
}

export function SurveysTab({ profile }: SurveysTabProps) {
	const { t } = useTranslation('qa.customers');
	const { kpis, surveys } = profile;

	const npsSurveys = [...surveys].filter((s) => s.type === 'NPS').sort((a, b) => a.date.localeCompare(b.date));
	const npsChartData = npsSurveys.map((s) => ({ label: shortDate(s.date), score: s.score }));
	const responseRate = kpis.answered > 0 ? Math.round((kpis.surveysAnswered / kpis.answered) * 100) : 0;

	return (
		<Stack gap='md'>
			<SimpleGrid cols={{ base: 2, md: 4 }} spacing='md'>
				<StatCard title={t('surveys.kpi.answered')} value={kpis.surveysAnswered} />
				<StatCard title={t('surveys.kpi.npsLatest')} value={kpis.npsLatest ?? '—'} color={kpis.npsLatest !== undefined ? npsBand(kpis.npsLatest).color : undefined} />
				<StatCard title={t('surveys.kpi.csatAvg')} value={kpis.csatAverage !== undefined ? `${kpis.csatAverage.toFixed(1)}/5` : '—'} />
				<StatCard title={t('surveys.kpi.responseRate')} value={`${responseRate}%`} />
			</SimpleGrid>

			<SimpleGrid cols={{ base: 1, md: 2 }} spacing='md'>
				<SectionCard title={t('surveys.npsTrend')}>
					{npsChartData.length === 0 ? <EmptyState message={t('surveys.noSurveys')} /> : (
						<LineChart h={220} data={npsChartData} dataKey='label' series={[{ name: 'score', color: 'teal.6' }]} yAxisProps={{ domain: [0, 10] }} withDots />
					)}
				</SectionCard>
				<SectionCard title={t('surveys.history')}>
					{surveys.length === 0 ? <EmptyState message={t('surveys.noSurveys')} /> : (
						<Stack gap='xs'>
							{[...surveys].sort((a, b) => b.date.localeCompare(a.date)).map((survey) => <SurveyCard key={survey.id} survey={survey} />)}
						</Stack>
					)}
				</SectionCard>
			</SimpleGrid>
		</Stack>
	);
}
