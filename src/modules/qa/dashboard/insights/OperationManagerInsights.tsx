import { useMemo, useState } from 'react';
import { Button, Group, Pill, Text } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import EmptyState from '~/components/EmptyState';
import { teamCallsInWindow } from '~/modules/qa/calls/agentMetrics';
import { selectThresholds, useSettingsStore } from '~/stores/qa/settingsStore';
import {
	selectTriggerRules,
	useTriggerRulesStore,
} from '~/stores/qa/triggerRulesStore';
import { CampaignPerformanceTable } from '../components/CampaignPerformanceTable';
import {
	DASHBOARD_LINES_OF_BUSINESS,
	type DashboardLineOfBusiness,
} from '../lineOfBusiness';
import { OPERATION_MANAGER_ESG } from '../mockData';
import {
	OPERATION_MANAGER_TEAMS,
	buildCampaignPerformanceRows,
	buildTeamBurnoutSeries,
	buildTeamPerformanceSeries,
	platformBurnoutSummary,
	type TeamTrendMetric,
} from '../operationManagerMetrics';
import { ActivityHeatmap } from './charts/ActivityHeatmap';
import { BurnoutPanel } from './charts/BurnoutPanel';
import { CallFlowSankey } from './charts/CallFlowSankey';
import { CampaignTreemap } from './charts/CampaignTreemap';
import { EsgPolar } from './charts/EsgPolar';
import { HumanVsAiRadar } from './charts/HumanVsAiRadar';
import { KpiStrip } from './charts/KpiStrip';
import { QualityGauges } from './charts/QualityGauges';
import { TeamTrendChart } from './charts/TeamTrendChart';
import {
	EMPTY_FILTER,
	applyCrossFilter,
	isFiltered,
	toggleFilter,
	type CrossFilter,
} from './crossFilter';
import { InsightsTile } from './InsightsTile';
import {
	activityMatrix,
	buildKpis,
	callFlow,
	campaignTreemap,
	type ActivityMode,
} from './insightsMetrics';
import styles from './Insights.module.css';

interface OperationManagerInsightsProps {
	days: number;
	lineOfBusiness: DashboardLineOfBusiness | null;
	onLineOfBusinessChange: (value: DashboardLineOfBusiness | null) => void;
}

/**
 * The same operation data as the classic dashboard, laid out like a BI report:
 * a hero band of headline numbers, then linked visuals. A click on a team or a
 * campaign in any visual filters the rest; the visual that shows that dimension
 * keeps all of its items and highlights the chosen one instead.
 */
export function OperationManagerInsights({
	days,
	lineOfBusiness,
	onLineOfBusinessChange,
}: OperationManagerInsightsProps) {
	const { t } = useTranslation('qa.dashboard');
	const thresholds = useSettingsStore(selectThresholds);
	const triggerRules = useTriggerRulesStore(selectTriggerRules);
	const [rawFilter, setRawFilter] = useState<CrossFilter>(EMPTY_FILTER);
	const [teamMetric, setTeamMetric] =
		useState<TeamTrendMetric>('QA_OVERALL_SCORE');
	const [heatMode, setHeatMode] = useState<ActivityMode>('volume');

	const windowCalls = useMemo(
		() => teamCallsInWindow('qa-manager', days, lineOfBusiness),
		[days, lineOfBusiness]
	);
	const previousCalls = useMemo(
		() => teamCallsInWindow('qa-manager', days, lineOfBusiness, days),
		[days, lineOfBusiness]
	);

	// A campaign picked before the line of business changed may have left the window; then it no longer filters.
	const filter = useMemo<CrossFilter>(
		() => ({
			...rawFilter,
			campaignId: windowCalls.some(
				(call) => call.campaignId === rawFilter.campaignId
			)
				? rawFilter.campaignId
				: null,
		}),
		[rawFilter, windowCalls]
	);

	// Every visual honours the whole filter except the dimension it already shows.
	const calls = useMemo(
		() => applyCrossFilter(windowCalls, filter),
		[windowCalls, filter]
	);
	const previous = useMemo(
		() => applyCrossFilter(previousCalls, filter),
		[previousCalls, filter]
	);
	const allTeams = useMemo(
		() => applyCrossFilter(windowCalls, { ...filter, team: null }),
		[windowCalls, filter]
	);
	const allCampaigns = useMemo(
		() => applyCrossFilter(windowCalls, { ...filter, campaignId: null }),
		[windowCalls, filter]
	);

	const kpis = useMemo(
		() => buildKpis(calls, previous, days, thresholds),
		[calls, previous, days, thresholds]
	);
	const kpiValue = (key: string) =>
		kpis.find((kpi) => kpi.key === key)?.value ?? 0;
	const teamSeries = useMemo(
		() => buildTeamPerformanceSeries(allTeams, days, teamMetric),
		[allTeams, days, teamMetric]
	);
	const burnoutSeries = useMemo(
		() => buildTeamBurnoutSeries(allTeams, days),
		[allTeams, days]
	);
	const burnoutSummary = useMemo(
		() => platformBurnoutSummary(triggerRules),
		[triggerRules]
	);
	const treemap = useMemo(() => campaignTreemap(allCampaigns), [allCampaigns]);
	const flow = useMemo(() => callFlow(allTeams), [allTeams]);
	const matrix = useMemo(
		() => activityMatrix(calls, heatMode),
		[calls, heatMode]
	);
	const campaignRows = useMemo(
		() => buildCampaignPerformanceRows(allCampaigns, thresholds),
		[allCampaigns, thresholds]
	);

	const pickTeam = (team: string) =>
		setRawFilter((current) => toggleFilter(current, 'team', team));
	const pickCampaign = (campaignId: string) =>
		setRawFilter((current) => toggleFilter(current, 'campaignId', campaignId));
	const pickLine = (line: string) => {
		if (!DASHBOARD_LINES_OF_BUSINESS.includes(line as DashboardLineOfBusiness))
			return;
		onLineOfBusinessChange(
			lineOfBusiness === line ? null : (line as DashboardLineOfBusiness)
		);
	};
	const campaignName = (id: string) =>
		windowCalls.find((call) => call.campaignId === id)?.campaignName ?? id;

	if (windowCalls.length === 0) {
		return <EmptyState message={t('operationManager.insights.empty')} />;
	}

	return (
		<div>
			{isFiltered(filter) && (
				<Group gap='xs' mb='md' wrap='wrap'>
					{filter.team && (
						<Pill
							withRemoveButton
							onRemove={() => setRawFilter((f) => ({ ...f, team: null }))}
						>
							{t('operationManager.insights.filters.team', {
								name: filter.team,
							})}
						</Pill>
					)}
					{filter.campaignId && (
						<Pill
							withRemoveButton
							onRemove={() => setRawFilter((f) => ({ ...f, campaignId: null }))}
						>
							{t('operationManager.insights.filters.campaign', {
								name: campaignName(filter.campaignId),
							})}
						</Pill>
					)}
					<Button
						variant='subtle'
						size='compact-xs'
						onClick={() => setRawFilter(EMPTY_FILTER)}
					>
						{t('operationManager.insights.filters.clear')}
					</Button>
				</Group>
			)}

			<div className={styles.grid}>
				<KpiStrip kpis={kpis} index={0} />
				<TeamTrendChart
					index={1}
					data={teamSeries}
					teams={OPERATION_MANAGER_TEAMS}
					metric={teamMetric}
					onMetricChange={setTeamMetric}
					selectedTeam={filter.team}
					onTeamClick={pickTeam}
				/>
				<QualityGauges
					index={2}
					qa={kpiValue('qa')}
					compliance={kpiValue('compliance')}
					sentiment={kpiValue('sentiment')}
				/>
				<CampaignTreemap
					index={3}
					nodes={treemap}
					selectedCampaign={filter.campaignId}
					selectedLine={lineOfBusiness}
					onCampaignClick={pickCampaign}
					onLineClick={pickLine}
				/>
				<CallFlowSankey
					index={4}
					flow={flow}
					teams={OPERATION_MANAGER_TEAMS}
					selectedTeam={filter.team}
					onTeamClick={pickTeam}
				/>
				<ActivityHeatmap
					index={5}
					matrix={matrix}
					mode={heatMode}
					onModeChange={setHeatMode}
				/>
				<HumanVsAiRadar index={6} />
				<BurnoutPanel
					index={7}
					summary={burnoutSummary}
					series={burnoutSeries}
					teams={OPERATION_MANAGER_TEAMS}
					selectedTeam={filter.team}
					onTeamClick={pickTeam}
				/>
				<EsgPolar index={8} esg={OPERATION_MANAGER_ESG} />
				<InsightsTile
					span={12}
					index={9}
					title={t('operationManager.insights.campaigns.title')}
					subtitle={t('operationManager.insights.campaigns.subtitle')}
				>
					<CampaignPerformanceTable
						rows={campaignRows}
						activeId={filter.campaignId}
						onRowClick={(row) => pickCampaign(row.id)}
					/>
				</InsightsTile>
			</div>

			<Text size='xs' c='dimmed' mt='md'>
				{t('operationManager.insights.hint')}
			</Text>
		</div>
	);
}

export default OperationManagerInsights;
