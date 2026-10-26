import { useMemo, useState, type CSSProperties, type ReactNode } from 'react';
import { Button, Group, Pill } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import EmptyState from '~/components/EmptyState';
import { SectionCard } from '~/components/SectionCard';
import { teamCallsInWindow } from '~/modules/qa/calls/agentMetrics';
import { selectThresholds, useSettingsStore } from '~/stores/qa/settingsStore';
import {
	selectTriggerRules,
	useTriggerRulesStore,
} from '~/stores/qa/triggerRulesStore';
import { CampaignPerformanceTable } from '../components/CampaignPerformanceTable';
import { EsgScoreCard } from '../components/EsgScoreCard';
import { HumanVsAiCard } from '../components/HumanVsAiCard';
import type { DashboardLineOfBusiness } from '../lineOfBusiness';
import { HUMAN_VS_AI_PERFORMANCE, OPERATION_MANAGER_ESG } from '../mockData';
import {
	OPERATION_MANAGER_TEAMS,
	buildCampaignPerformanceRows,
	buildTeamBurnoutSeries,
	buildTeamPerformanceSeries,
	platformBurnoutSummary,
	type TeamTrendMetric,
} from '../operationManagerMetrics';
import { ActivityHeatmapCard } from './charts/ActivityHeatmapCard';
import { BurnoutCard } from './charts/BurnoutCard';
import { CallOutcomesCard } from './charts/CallOutcomesCard';
import { HeadlineTiles } from './charts/HeadlineTiles';
import { TeamTrendCard } from './charts/TeamTrendCard';
import {
	EMPTY_FILTER,
	applyCrossFilter,
	isFiltered,
	toggleFilter,
	type CrossFilter,
} from './crossFilter';
import {
	activityHeatmap,
	buildHeadlineKpis,
	teamOutcomes,
	type ActivityMode,
} from './insightsMetrics';
import styles from './Insights.module.css';

interface OperationManagerInsightsProps {
	days: number;
	lineOfBusiness: DashboardLineOfBusiness | null;
}

/** One grid cell: `span` columns out of 12 on a wide screen; `wide` takes the full row on tablets. */
function Cell({
	span,
	wide = false,
	children,
}: {
	span: number;
	wide?: boolean;
	children: ReactNode;
}) {
	return (
		<div
			className={[styles.cell, wide ? styles.wide : '']
				.filter(Boolean)
				.join(' ')}
			// inline-style-allow: the grid placement of each cell is a runtime value
			style={{ '--span': span } as CSSProperties}
		>
			{children}
		</div>
	);
}

/**
 * The operation's data as linked cards: headline numbers, then visuals that
 * share one filter. Picking a team (chips, outcome rows) or a campaign (table
 * row) narrows every other card; picking it again clears it.
 */
export function OperationManagerInsights({
	days,
	lineOfBusiness,
}: OperationManagerInsightsProps) {
	const { t } = useTranslation('qa.dashboard');
	const thresholds = useSettingsStore(selectThresholds);
	const triggerRules = useTriggerRulesStore(selectTriggerRules);
	const [rawFilter, setRawFilter] = useState<CrossFilter>(EMPTY_FILTER);
	const [teamMetric, setTeamMetric] =
		useState<TeamTrendMetric>('QA_OVERALL_SCORE');
	const [heatMode, setHeatMode] = useState<ActivityMode>('volume');
	const weekdays = t('operationManager.insights.weekdays', {
		returnObjects: true,
	}) as unknown as string[];

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

	// Every card honours the whole filter except the dimension it already shows.
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
		() => buildHeadlineKpis(calls, previous, days, thresholds),
		[calls, previous, days, thresholds]
	);
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
	const outcomes = useMemo(
		() => teamOutcomes(allTeams, OPERATION_MANAGER_TEAMS),
		[allTeams]
	);
	const heatmap = useMemo(
		() => activityHeatmap(calls, heatMode, weekdays),
		[calls, heatMode, weekdays]
	);
	const campaignRows = useMemo(
		() => buildCampaignPerformanceRows(allCampaigns, thresholds),
		[allCampaigns, thresholds]
	);

	const pickTeam = (team: string) =>
		setRawFilter((current) => toggleFilter(current, 'team', team));
	const pickCampaign = (campaignId: string) =>
		setRawFilter((current) => toggleFilter(current, 'campaignId', campaignId));
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
				<Cell span={12}>
					<HeadlineTiles kpis={kpis} />
				</Cell>
				<Cell span={8} wide>
					<TeamTrendCard
						data={teamSeries}
						teams={OPERATION_MANAGER_TEAMS}
						metric={teamMetric}
						onMetricChange={setTeamMetric}
						selectedTeam={filter.team}
						onTeamClick={pickTeam}
					/>
				</Cell>
				<Cell span={4}>
					<CallOutcomesCard
						rows={outcomes}
						selectedTeam={filter.team}
						onTeamClick={pickTeam}
					/>
				</Cell>
				<Cell span={7} wide>
					<ActivityHeatmapCard
						data={heatmap}
						mode={heatMode}
						onModeChange={setHeatMode}
					/>
				</Cell>
				<Cell span={5}>
					<SectionCard
						padding='md'
						fullHeight
						title={t('operationManager.insights.humanVsAi.title')}
						description={t('operationManager.insights.humanVsAi.subtitle')}
					>
						<HumanVsAiCard data={HUMAN_VS_AI_PERFORMANCE} />
					</SectionCard>
				</Cell>
				<Cell span={6}>
					<BurnoutCard
						summary={burnoutSummary}
						series={burnoutSeries}
						teams={OPERATION_MANAGER_TEAMS}
					/>
				</Cell>
				<Cell span={6}>
					<SectionCard
						padding='md'
						fullHeight
						title={t('operationManager.insights.esg.title')}
						description={t('operationManager.insights.esg.subtitle')}
					>
						<EsgScoreCard esg={OPERATION_MANAGER_ESG} />
					</SectionCard>
				</Cell>
				<Cell span={12}>
					<SectionCard
						padding='md'
						title={t('operationManager.insights.campaigns.title')}
						description={t('operationManager.insights.campaigns.subtitle')}
					>
						<CampaignPerformanceTable
							rows={campaignRows}
							activeId={filter.campaignId}
							onRowClick={(row) => pickCampaign(row.id)}
						/>
					</SectionCard>
				</Cell>
			</div>
		</div>
	);
}

export default OperationManagerInsights;
