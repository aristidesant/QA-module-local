import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Badge, Group, Stack, Text } from '@mantine/core';
import {
	IconHeadset,
	IconMoodSmile,
	IconShieldCheck,
	IconSparkles,
	IconUser,
} from '@tabler/icons-react';
import { ContentContainer } from '~/components/ContentContainer/ContentContainer';
import { TEAM_CALLS } from '~/modules/qa/analytics/mockData';
import {
	AGENT_PERSONA_ID,
	COMPLIANCE_AREA_META,
} from '~/modules/qa/team/constants';
import { TrendWidget } from './components/TrendWidget';
import { DEFAULT_ANALYTICS_PERIOD, type AnalyticsPeriod } from './constants';
import {
	buildComplianceSeries,
	buildOperationalSeries,
	buildSentimentSeries,
	predominantEmotions,
} from './helpers';

const AgentAnalyticsPage: React.FC = () => {
	const { t } = useTranslation('qa.agent.analytics');
	const calls = useMemo(
		() => TEAM_CALLS.filter((c) => c.agentId === AGENT_PERSONA_ID),
		[]
	);

	// Each widget owns its window — the user asked for the selector inside the widgets.
	const [opsPeriod, setOpsPeriod] = useState<AnalyticsPeriod>(
		DEFAULT_ANALYTICS_PERIOD
	);
	const [sentimentPeriod, setSentimentPeriod] = useState<AnalyticsPeriod>(
		DEFAULT_ANALYTICS_PERIOD
	);
	const [compliancePeriod, setCompliancePeriod] = useState<AnalyticsPeriod>(
		DEFAULT_ANALYTICS_PERIOD
	);

	const operational = useMemo(
		() => buildOperationalSeries(calls, opsPeriod),
		[calls, opsPeriod]
	);
	const sentiment = useMemo(
		() => buildSentimentSeries(calls, sentimentPeriod),
		[calls, sentimentPeriod]
	);
	const emotions = useMemo(
		() => predominantEmotions(calls, sentimentPeriod),
		[calls, sentimentPeriod]
	);
	const compliance = useMemo(
		() => buildComplianceSeries(calls, compliancePeriod),
		[calls, compliancePeriod]
	);

	return (
		<ContentContainer
			contentWidth='full'
			title={t('page.title')}
			description={t('page.subtitle')}
		>
			<Stack gap='lg'>
				<TrendWidget
					title={t('operational.title')}
					description={t('operational.description')}
					icon={IconHeadset}
					period={opsPeriod}
					onPeriodChange={setOpsPeriod}
					data={operational}
					series={[
						{
							name: 'calls',
							label: t('operational.series.calls'),
							color: 'blue.6',
						},
						{
							name: 'effective',
							label: t('operational.series.effective'),
							color: 'teal.6',
						},
						{
							name: 'nonEffective',
							label: t('operational.series.nonEffective'),
							color: 'orange.6',
						},
					]}
					yAxisProps={{ allowDecimals: false }}
				/>

				<TrendWidget
					title={t('sentiment.title')}
					description={t('sentiment.description')}
					icon={IconMoodSmile}
					period={sentimentPeriod}
					onPeriodChange={setSentimentPeriod}
					data={sentiment}
					series={[
						{
							name: 'agent',
							label: t('sentiment.series.agent'),
							color: 'blue.6',
						},
						{
							name: 'customer',
							label: t('sentiment.series.customer'),
							color: 'orange.6',
						},
					]}
					yAxisProps={{ domain: [1, 5] }}
					valueFormatter={(value) => value.toFixed(1)}
					extra={
						<Group gap='lg'>
							<Group gap='xs'>
								<Text size='sm' c='dimmed'>
									{t('sentiment.predominantAgent')}
								</Text>
								<Badge
									color='violet'
									variant='light'
									leftSection={<IconSparkles size={12} />}
								>
									{emotions.agent ?? t('sentiment.none')}
								</Badge>
							</Group>
							<Group gap='xs'>
								<Text size='sm' c='dimmed'>
									{t('sentiment.predominantCustomer')}
								</Text>
								<Badge
									color='violet'
									variant='light'
									leftSection={<IconUser size={12} />}
								>
									{emotions.customer ?? t('sentiment.none')}
								</Badge>
							</Group>
						</Group>
					}
				/>

				<TrendWidget
					title={t('compliance.title')}
					description={t('compliance.description')}
					icon={IconShieldCheck}
					period={compliancePeriod}
					onPeriodChange={setCompliancePeriod}
					data={compliance}
					series={[
						{
							name: 'security',
							label: t('compliance.series.security'),
							color: `${COMPLIANCE_AREA_META.security.color}.6`,
						},
						{
							name: 'regulatory',
							label: t('compliance.series.regulatory'),
							color: `${COMPLIANCE_AREA_META.regulatory.color}.6`,
						},
						{
							name: 'legal',
							label: t('compliance.series.legal'),
							color: `${COMPLIANCE_AREA_META.legal.color}.6`,
						},
					]}
					yAxisProps={{ domain: [50, 100] }}
					valueFormatter={(value) => `${value}%`}
				/>
			</Stack>
		</ContentContainer>
	);
};

export default AgentAnalyticsPage;
