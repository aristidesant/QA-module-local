import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router';
import { useTranslation } from 'react-i18next';
import { createColumnHelper } from '@tanstack/react-table';
import {
	Button,
	Group,
	MultiSelect,
	SegmentedControl,
	Select,
	Stack,
	Text,
} from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { IconX } from '@tabler/icons-react';
import { ContentContainer } from '~/components/ContentContainer';
import { SectionCard } from '~/components/SectionCard';
import BaseTable from '~/components/BaseTable/BaseTable';
import type { BaseTableColumnDef } from '~/components/BaseTable/BaseTable';
import { scopeAgents } from '~/modules/qa/analytics/helpers';
import IssueBadges from '~/modules/qa/calls/components/IssueBadges';
import { buildTeamCalls } from '~/modules/qa/calls/helpers';
import {
	CALL_ISSUES,
	CALL_ISSUE_ASPECTS,
	CALL_ISSUE_BY_KEY,
	parseIssueParam,
	type CallIssueAspect,
	type CallIssueKey,
} from '~/modules/qa/calls/issues';
import type { TeamCallRow } from '~/modules/qa/calls/types';
import {
	DEFAULT_PERFORMANCE_SCORE_PERIOD,
	PERFORMANCE_SCORE_PERIODS,
	performanceScoreDays,
	type PerformanceScorePeriod,
} from '~/modules/qa/dashboard/constants';
import {
	DASHBOARD_LINES_OF_BUSINESS,
	type DashboardLineOfBusiness,
} from '~/modules/qa/dashboard/lineOfBusiness';
import { TEAM_CAMPAIGNS } from '~/modules/qa/team/mockData';
import {
	formatDateTime,
	formatSeconds,
	roleFromPath,
} from '~/modules/qa/team/helpers';
import { selectThresholds, useSettingsStore } from '~/stores/qa/settingsStore';
import styles from './ConversationsPage.module.css';

const helper = createColumnHelper<TeamCallRow>();

interface FiltersState {
	period: PerformanceScorePeriod;
	from: Date | null;
	to: Date | null;
	/** 'all' or an agent id. */
	agentId: string;
	/** 'all' or a roster campaign id ('camp-00N'). */
	campaignId: string;
	lineOfBusiness: DashboardLineOfBusiness | null;
	aspect: CallIssueAspect | 'all';
	issues: CallIssueKey[];
}

const DEFAULT_FILTERS: FiltersState = {
	period: DEFAULT_PERFORMANCE_SCORE_PERIOD,
	from: null,
	to: null,
	agentId: 'all',
	campaignId: 'all',
	lineOfBusiness: null,
	aspect: 'all',
	issues: [],
};

/** TEAM_CALLS spans 180 days; a custom date range is cut from that history. */
const FULL_HISTORY_DAYS = 180;

const isPerformancePeriod = (
	value: string | null
): value is PerformanceScorePeriod =>
	PERFORMANCE_SCORE_PERIODS.some((p) => p.value === value);

const isLineOfBusiness = (
	value: string | null
): value is DashboardLineOfBusiness =>
	DASHBOARD_LINES_OF_BUSINESS.includes(value as DashboardLineOfBusiness);

const toDay = (date: Date) => date.toISOString().slice(0, 10);

/**
 * Every call of the supervisor's team (or of the whole platform for a QA
 * manager). The Performance Score cards open it pre-filtered, so the rows
 * match the number on the card they came from.
 */
export default function ConversationsPage() {
	const { t } = useTranslation('qa.calls');
	const { t: tDashboard } = useTranslation('qa.dashboard');
	const navigate = useNavigate();
	const role = roleFromPath(useLocation().pathname);
	const thresholds = useSettingsStore(selectThresholds);
	const [searchParams, setSearchParams] = useSearchParams();
	const [filters, setFilters] = useState<FiltersState>(DEFAULT_FILTERS);
	const [fromDashboard, setFromDashboard] = useState(false);

	// Dashboard drill-down: ?issue=a,b&period=month&lob=Collections seeds the filters once.
	const issueParam = searchParams.get('issue');
	const periodParam = searchParams.get('period');
	const lobParam = searchParams.get('lob');
	useEffect(() => {
		if (!issueParam && !periodParam && !lobParam) return;
		setFromDashboard(true);
		setFilters((f) => ({
			...f,
			issues: parseIssueParam(issueParam),
			aspect: 'all',
			period: isPerformancePeriod(periodParam) ? periodParam : f.period,
			lineOfBusiness: isLineOfBusiness(lobParam) ? lobParam : null,
			from: null,
			to: null,
		}));
	}, [issueParam, periodParam, lobParam]);

	const customRange = Boolean(filters.from || filters.to);

	// The same window the dashboard cards count, so the totals agree.
	const baseRows = useMemo(
		() =>
			buildTeamCalls(
				role,
				customRange ? FULL_HISTORY_DAYS : performanceScoreDays(filters.period),
				filters.lineOfBusiness
			),
		[role, customRange, filters.period, filters.lineOfBusiness]
	);

	const filteredRows = useMemo(() => {
		let result = baseRows;
		if (filters.from) {
			const from = toDay(filters.from);
			result = result.filter((r) => r.date.slice(0, 10) >= from);
		}
		if (filters.to) {
			const to = toDay(filters.to);
			result = result.filter((r) => r.date.slice(0, 10) <= to);
		}
		if (filters.agentId !== 'all') {
			result = result.filter((r) => r.agentId === filters.agentId);
		}
		if (filters.campaignId !== 'all') {
			result = result.filter((r) => r.rosterCampaignId === filters.campaignId);
		}
		if (filters.aspect !== 'all') {
			result = result.filter((r) =>
				r.issues.some((k) => CALL_ISSUE_BY_KEY[k].aspect === filters.aspect)
			);
		}
		if (filters.issues.length > 0) {
			result = result.filter((r) =>
				filters.issues.some((k) => r.issues.includes(k))
			);
		}
		return result;
	}, [baseRows, filters]);

	const agentOptions = useMemo(
		() => [
			{ value: 'all', label: t('conversations.allAgents') },
			...scopeAgents(role).map((a) => ({ value: a.id, label: a.name })),
		],
		[role, t]
	);

	/** Issue options grouped by aspect; narrowed to the selected aspect. */
	const issueOptions = CALL_ISSUE_ASPECTS.filter(
		(aspect) => filters.aspect === 'all' || aspect === filters.aspect
	).map((aspect) => ({
		group: t(`issues.aspect.${aspect}`),
		items: CALL_ISSUES.filter((issue) => issue.aspect === aspect).map(
			(issue) => ({
				value: issue.key,
				label: t(`issues.${issue.key}`),
			})
		),
	}));

	const clearFilters = () => {
		setFilters(DEFAULT_FILTERS);
		setFromDashboard(false);
		setSearchParams({}, { replace: true });
	};

	const columns: BaseTableColumnDef<TeamCallRow>[] = [
		helper.accessor('date', {
			header: t('teamConversations.columns.date'),
			cell: (info) => (
				<Stack gap={0}>
					<Text size='sm' fw={600}>
						{formatDateTime(info.getValue())}
					</Text>
					<Text size='xs' c='dimmed'>
						{info.row.original.campaignName}
					</Text>
				</Stack>
			),
		}) as BaseTableColumnDef<TeamCallRow>,
		helper.accessor('agentName', {
			header: t('teamConversations.columns.agent'),
			cell: (info) => (
				<Stack gap={0}>
					<Text size='sm' fw={600}>
						{info.getValue()}
					</Text>
					<Text size='xs' c='dimmed'>
						{info.row.original.team}
					</Text>
				</Stack>
			),
		}) as BaseTableColumnDef<TeamCallRow>,
		helper.accessor('durationSeconds', {
			header: t('teamConversations.columns.duration'),
			size: 110,
			cell: (info) => <Text size='sm'>{formatSeconds(info.getValue())}</Text>,
		}) as BaseTableColumnDef<TeamCallRow>,
		helper.accessor('qaScore', {
			header: t('teamConversations.columns.qaScore'),
			size: 100,
			cell: (info) => (
				<Text
					c={
						info.getValue() < thresholds.qa.lowScoreIncident ? 'red' : undefined
					}
					fw={600}
					size='sm'
				>
					{info.getValue()}
				</Text>
			),
		}) as BaseTableColumnDef<TeamCallRow>,
		helper.accessor('issues', {
			header: t('teamConversations.columns.issues'),
			enableSorting: false,
			cell: (info) => (
				<IssueBadges
					autoFailCount={info.row.original.autoFailCount}
					issues={info.getValue()}
				/>
			),
		}) as BaseTableColumnDef<TeamCallRow>,
	];

	return (
		<ContentContainer
			contentWidth='full'
			description={t(
				role === 'qa-manager'
					? 'teamConversations.descriptionQaManager'
					: 'teamConversations.description'
			)}
			title={t('teamConversations.title')}
		>
			<Stack gap='lg'>
				<SectionCard>
					<Stack gap='xs'>
						<Group className={styles.filters}>
							<SegmentedControl
								data={PERFORMANCE_SCORE_PERIODS.map((p) => ({
									value: p.value,
									label: tDashboard(p.labelKey),
								}))}
								disabled={customRange}
								onChange={(value) =>
									setFilters((f) => ({
										...f,
										period: value as PerformanceScorePeriod,
										from: null,
										to: null,
									}))
								}
								value={filters.period}
							/>
							<DateInput
								clearable
								label={t('teamConversations.filters.dateFrom')}
								onChange={(value: string | null) =>
									setFilters((f) => ({
										...f,
										from: value ? new Date(value) : null,
									}))
								}
								placeholder={t('teamConversations.filters.dateFrom')}
								size='sm'
								value={filters.from}
							/>
							<DateInput
								clearable
								label={t('teamConversations.filters.dateTo')}
								onChange={(value: string | null) =>
									setFilters((f) => ({
										...f,
										to: value ? new Date(value) : null,
									}))
								}
								placeholder={t('teamConversations.filters.dateTo')}
								size='sm'
								value={filters.to}
							/>
							<Select
								allowDeselect={false}
								data={agentOptions}
								label={t('conversations.agentFilter')}
								onChange={(value) =>
									setFilters((f) => ({ ...f, agentId: value ?? 'all' }))
								}
								searchable
								size='sm'
								value={filters.agentId}
								w={220}
							/>
							<Select
								allowDeselect={false}
								data={[
									{
										value: 'all',
										label: t('teamConversations.filters.allCampaigns'),
									},
									...TEAM_CAMPAIGNS.map((c) => ({
										value: c.id,
										label: c.name,
									})),
								]}
								label={t('teamConversations.filters.campaign')}
								onChange={(value) =>
									setFilters((f) => ({ ...f, campaignId: value ?? 'all' }))
								}
								size='sm'
								value={filters.campaignId}
								w={220}
							/>
							<Select
								clearable
								data={DASHBOARD_LINES_OF_BUSINESS}
								label={t('teamConversations.filters.lineOfBusiness')}
								onChange={(value) =>
									setFilters((f) => ({
										...f,
										lineOfBusiness: isLineOfBusiness(value) ? value : null,
									}))
								}
								placeholder={tDashboard('roleDashboard.filters.allLines')}
								size='sm'
								value={filters.lineOfBusiness}
								w={200}
							/>
							<Select
								allowDeselect={false}
								data={[
									{ value: 'all', label: t('issues.aspect.all') },
									...CALL_ISSUE_ASPECTS.map((a) => ({
										value: a,
										label: t(`issues.aspect.${a}`),
									})),
								]}
								label={t('teamConversations.filters.aspect')}
								onChange={(value) => {
									const aspect = (value as CallIssueAspect | 'all') ?? 'all';
									setFilters((f) => ({
										...f,
										aspect,
										// Drop selected issues that no longer belong to the aspect.
										issues:
											aspect === 'all'
												? f.issues
												: f.issues.filter(
														(k) => CALL_ISSUE_BY_KEY[k].aspect === aspect
													),
									}));
								}}
								size='sm'
								value={filters.aspect}
								w={190}
							/>
							<MultiSelect
								clearable
								data={issueOptions}
								label={t('teamConversations.filters.issues')}
								onChange={(value) =>
									setFilters((f) => ({
										...f,
										issues: value as CallIssueKey[],
									}))
								}
								placeholder={
									filters.issues.length === 0
										? t('teamConversations.filters.issuesPlaceholder')
										: undefined
								}
								searchable
								size='sm'
								value={filters.issues}
								w={320}
							/>
							<Button
								leftSection={<IconX size={14} />}
								onClick={clearFilters}
								variant='subtle'
							>
								{t('teamConversations.filters.clear')}
							</Button>
						</Group>
						{fromDashboard ? (
							<Text c='dimmed' size='xs'>
								{t('teamConversations.filters.drilldown')}
							</Text>
						) : null}
					</Stack>
				</SectionCard>

				<SectionCard
					headerActions={
						<Text c='dimmed' size='sm'>
							{t('teamConversations.rowsCount', { count: filteredRows.length })}
						</Text>
					}
				>
					<BaseTable<TeamCallRow>
						columns={columns}
						data={filteredRows}
						density='compact'
						emptyMessage={t('teamConversations.empty')}
						enablePagination
						getRowId={(r) => r.id}
						initialSort={[{ id: 'date', desc: true }]}
						onRowClick={(r) =>
							navigate(`/qa/campaigns/${r.mockCampaignId}/calls/${r.callId}`)
						}
						pageSize={10}
						showPaginationControls
					/>
				</SectionCard>
			</Stack>
		</ContentContainer>
	);
}
