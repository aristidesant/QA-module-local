import { useMemo } from 'react';
import { useNavigate } from 'react-router';
import {
	ActionIcon,
	Anchor,
	Badge,
	Button,
	Group,
	Progress,
	SimpleGrid,
	Stack,
	Text,
	ThemeIcon,
} from '@mantine/core';
import { AreaChart } from '@mantine/charts';
import { createColumnHelper } from '@tanstack/react-table';
import {
	IconCalendarEvent,
	IconExternalLink,
	IconFlame,
	IconHistory,
	IconMicrophone2,
	IconMinus,
	IconPhone,
	IconTrendingDown,
	IconTrendingUp,
	IconUsers,
} from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { SectionCard } from '~/components/SectionCard';
import { StatCard } from '~/components/StatCard';
import BaseTable, {
	type BaseTableColumnDef,
} from '~/components/BaseTable/BaseTable';
import {
	assessBurnout,
	buildActionHistory,
	burnoutEvidenceCalls,
	computeWorkload,
	type BurnoutEvidenceCall,
} from '~/modules/qa/analytics/helpers';
import { TEAM_CALLS } from '~/modules/qa/analytics/mockData';
import type { HistoryEntry } from '~/modules/qa/analytics/types';
import { BurnoutRiskLevel } from '~/modules/qa/dashboard/types/burnoutRisk';
import { day } from '~/modules/qa/lms/mockData';
import {
	useTriggerRulesStore,
	selectTriggerRules,
} from '~/stores/qa/triggerRulesStore';
import { useCoachingStore, selectSessions } from '~/stores/qa/coachingStore';
import {
	useLmsStore,
	selectAssignments,
	selectContent,
} from '~/stores/qa/lmsStore';
import {
	useTeamAnalyticsStore,
	selectBurnoutActions,
} from '~/stores/qa/teamAnalyticsStore';
import type { AgentProfile, TeamRole } from '../../types';
import { NOW_ISO } from '../../constants';
import { formatDate, formatSeconds } from '../../helpers';
import { BurnoutDrivers } from '../../components/BurnoutDrivers';
import { BurnoutSignals } from '../../components/BurnoutSignals';
import {
	BurnoutReviewActions,
	BurnoutReviewBanner,
} from '../../components/BurnoutReview';
import { managerPersona } from '~/modules/qa/lms/helpers';

interface BurnoutTabProps {
	profile: AgentProfile;
	role: TeamRole;
	onScheduleCoaching: () => void;
}

const LEVEL_COLOR: Record<BurnoutRiskLevel, string> = {
	[BurnoutRiskLevel.LOW]: 'green',
	[BurnoutRiskLevel.MEDIUM]: 'yellow',
	[BurnoutRiskLevel.HIGH]: 'red',
};

const TREND_META = {
	improving: { icon: IconTrendingDown, color: 'green' },
	stable: { icon: IconMinus, color: 'gray' },
	declining: { icon: IconTrendingUp, color: 'red' },
} as const;

const ACTION_STATUS_COLOR = {
	PLANNED: 'blue',
	IN_PROGRESS: 'yellow',
	DONE: 'green',
} as const;

/** Only a clearly worse value than the team earns the alert colour. */
const ALERT = 'var(--mantine-color-red-text)';
const WORSE_THAN_TEAM = 1.2;

const callHelper = createColumnHelper<BurnoutEvidenceCall>();
const historyHelper = createColumnHelper<HistoryEntry>();

/** The evidence behind the agent's burnout level: rule drivers, workload, flagged calls, trend and actions taken. */
export function BurnoutTab({
	profile,
	role,
	onScheduleCoaching,
}: BurnoutTabProps) {
	const { t } = useTranslation('qa.team');
	const navigate = useNavigate();
	const agentId = profile.agent.id;

	const rules = useTriggerRulesStore(selectTriggerRules);
	const burnoutActions = useTeamAnalyticsStore(selectBurnoutActions);
	const sessions = useCoachingStore(selectSessions);
	const assignments = useLmsStore(selectAssignments);
	const content = useLmsStore(selectContent);

	const assessment = useMemo(
		() => assessBurnout(agentId, rules),
		[agentId, rules]
	);
	const workload = useMemo(
		() =>
			computeWorkload(
				agentId,
				TEAM_CALLS,
				TEAM_CALLS.filter((c) => c.team === profile.agent.team)
			),
		[agentId, profile.agent.team]
	);
	const evidenceCalls = useMemo(() => burnoutEvidenceCalls(agentId), [agentId]);
	const history = useMemo(
		() =>
			buildActionHistory(
				burnoutActions.filter((a) => a.agentId === agentId),
				sessions.filter((s) => s.agentId === agentId),
				assignments.filter((a) => a.agentId === agentId),
				day(NOW_ISO.slice(0, 10), -90),
				{
					coaching: t('burnoutTab.history.coaching'),
					lms: t('burnoutTab.history.lms'),
					contentTitle: (id) => content.find((c) => c.id === id)?.title ?? id,
				}
			),
		[burnoutActions, sessions, assignments, content, agentId, t]
	);

	const color = LEVEL_COLOR[assessment.level];
	const trend = TREND_META[profile.risk.burnout.trend];
	const TrendIcon = trend.icon;
	const worse = (value: number, team: number) =>
		team > 0 && value > team * WORSE_THAN_TEAM;

	const callColumns: BaseTableColumnDef<BurnoutEvidenceCall>[] = [
		callHelper.display({
			id: 'date',
			header: t('burnoutTab.calls.columns.date'),
			cell: (info) => (
				<Text size='sm'>{formatDate(info.row.original.call.date)}</Text>
			),
		}) as BaseTableColumnDef<BurnoutEvidenceCall>,
		callHelper.display({
			id: 'call',
			header: t('burnoutTab.calls.columns.call'),
			cell: (info) => (
				<Group gap={6} wrap='nowrap'>
					<IconPhone size={14} />
					<Text size='sm'>{info.row.original.call.id}</Text>
				</Group>
			),
		}) as BaseTableColumnDef<BurnoutEvidenceCall>,
		callHelper.display({
			id: 'reasons',
			header: t('burnoutTab.calls.columns.reasons'),
			cell: (info) => (
				<Group gap={4} wrap='wrap'>
					{info.row.original.reasons.map((reason) => (
						<Badge key={reason} size='xs' variant='light' color='gray'>
							{t(`burnoutTab.callReason.${reason}`)}
						</Badge>
					))}
				</Group>
			),
		}) as BaseTableColumnDef<BurnoutEvidenceCall>,
		callHelper.display({
			id: 'open',
			header: '',
			cell: (info) => (
				<ActionIcon
					variant='subtle'
					color='gray'
					aria-label={t('burnoutTab.calls.open')}
					onClick={() =>
						navigate(
							`/qa/campaigns/${info.row.original.call.campaignId}/calls/${info.row.original.call.id}`
						)
					}
				>
					<IconExternalLink size={16} />
				</ActionIcon>
			),
		}) as BaseTableColumnDef<BurnoutEvidenceCall>,
	];

	const historyColumns: BaseTableColumnDef<HistoryEntry>[] = [
		historyHelper.accessor('at', {
			header: t('burnoutTab.history.columns.date'),
			cell: (info) => <Text size='sm'>{formatDate(info.getValue())}</Text>,
		}) as BaseTableColumnDef<HistoryEntry>,
		historyHelper.accessor('title', {
			header: t('burnoutTab.history.columns.action'),
			cell: (info) => (
				<Stack gap={0}>
					<Text size='sm'>{info.getValue()}</Text>
					<Text size='xs' c='dimmed'>
						{info.row.original.detail}
					</Text>
				</Stack>
			),
		}) as BaseTableColumnDef<HistoryEntry>,
		historyHelper.accessor('by', {
			header: t('burnoutTab.history.columns.by'),
			cell: (info) => <Text size='sm'>{info.getValue()}</Text>,
		}) as BaseTableColumnDef<HistoryEntry>,
		historyHelper.accessor('status', {
			header: t('burnoutTab.history.columns.status'),
			cell: (info) => (
				<Badge
					size='xs'
					variant='light'
					color={ACTION_STATUS_COLOR[info.getValue()]}
				>
					{t(`burnoutTab.history.status.${info.getValue()}`)}
				</Badge>
			),
		}) as BaseTableColumnDef<HistoryEntry>,
	];

	return (
		<Stack gap='md'>
			<SectionCard
				title={t('burnoutTab.title')}
				description={t('burnoutTab.summary', {
					active: assessment.voice.activeCount,
					near: assessment.voice.nearCount,
					days: assessment.voice.persistenceDays,
				})}
				icon={IconFlame}
				headerActions={
					<Group gap='xs' wrap='nowrap'>
						{assessment.level !== BurnoutRiskLevel.LOW && (
							<BurnoutReviewActions
								agentId={agentId}
								reviewer={managerPersona(role).name}
							/>
						)}
						<Button
							variant='default'
							size='xs'
							leftSection={<IconCalendarEvent size={14} />}
							onClick={onScheduleCoaching}
						>
							{t('burnoutTab.scheduleCoaching')}
						</Button>
					</Group>
				}
			>
				<Stack gap='xs'>
					<BurnoutReviewBanner agentId={agentId} />
					<Group justify='space-between'>
						<Badge color={color} variant='light'>
							{t(`burnout.${assessment.level}`)}
						</Badge>
						<Group gap='xs'>
							<Text fw={600}>{assessment.percentage}%</Text>
							<ThemeIcon size='sm' variant='light' color={trend.color}>
								<TrendIcon size={12} />
							</ThemeIcon>
						</Group>
					</Group>
					<Progress
						value={assessment.percentage}
						color={color}
						size='lg'
						radius='md'
					/>
				</Stack>
			</SectionCard>

			<SectionCard
				title={t('burnoutTab.signals.title')}
				description={t('burnoutTab.signals.description')}
				icon={IconMicrophone2}
			>
				<BurnoutSignals signals={assessment.voice.signals} />
			</SectionCard>

			<SectionCard
				title={t('burnoutTab.drivers.title')}
				description={t('burnoutTab.drivers.description')}
				headerActions={
					<Anchor size='xs' onClick={() => navigate(`/qa/${role}/triggers`)}>
						{t('burnoutTab.drivers.manageRules')}
					</Anchor>
				}
			>
				<BurnoutDrivers assessment={assessment} rules={rules} />
			</SectionCard>

			<SectionCard
				title={t('burnoutTab.workload.title')}
				description={t('burnoutTab.workload.description')}
				icon={IconUsers}
			>
				<SimpleGrid cols={{ base: 2, md: 3 }} spacing='md'>
					<StatCard
						variant='compact'
						title={t('burnoutTab.workload.callsPerDay')}
						value={workload.callsPerDay}
						subtitle={t('burnoutTab.workload.team', {
							value: workload.teamCallsPerDay,
						})}
						color={
							worse(workload.callsPerDay, workload.teamCallsPerDay)
								? ALERT
								: undefined
						}
					/>
					<StatCard
						variant='compact'
						title={t('burnoutTab.workload.aht')}
						value={formatSeconds(workload.avgHandleTimeSeconds)}
						subtitle={t('burnoutTab.workload.team', {
							value: formatSeconds(workload.teamAvgHandleTimeSeconds),
						})}
						color={
							worse(
								workload.avgHandleTimeSeconds,
								workload.teamAvgHandleTimeSeconds
							)
								? ALERT
								: undefined
						}
					/>
					<StatCard
						variant='compact'
						title={t('burnoutTab.workload.afterHours')}
						value={`${workload.afterHoursShare}%`}
					/>
					<StatCard
						variant='compact'
						title={t('burnoutTab.workload.consecutiveDays')}
						value={workload.consecutiveDays}
					/>
					<StatCard
						variant='compact'
						title={t('burnoutTab.workload.negativeEmotion')}
						value={`${workload.negativeEmotionShare}%`}
					/>
					<StatCard
						variant='compact'
						title={t('burnoutTab.workload.recovery')}
						value={`${workload.recoveryRate}%`}
					/>
				</SimpleGrid>
			</SectionCard>

			<SectionCard
				title={t('burnoutTab.calls.title')}
				description={t('burnoutTab.calls.description')}
				icon={IconPhone}
			>
				<BaseTable<BurnoutEvidenceCall>
					data={evidenceCalls}
					columns={callColumns}
					getRowId={(r) => r.call.id}
					density='compact'
					emptyMessage={t('burnoutTab.calls.empty')}
				/>
			</SectionCard>

			<SectionCard title={t('burnoutTab.trend')}>
				<AreaChart
					h={160}
					data={profile.risk.burnoutTrend}
					dataKey='label'
					series={[{ name: 'percentage', color: 'gray.6' }]}
					withXAxis={false}
					withYAxis={false}
					withTooltip
					curveType='monotone'
				/>
			</SectionCard>

			<SectionCard
				title={t('burnoutTab.history.title')}
				description={t('burnoutTab.history.description')}
				icon={IconHistory}
			>
				<BaseTable<HistoryEntry>
					data={history}
					columns={historyColumns}
					getRowId={(r) => r.id}
					density='compact'
					emptyMessage={t('burnoutTab.history.empty')}
				/>
			</SectionCard>
		</Stack>
	);
}
