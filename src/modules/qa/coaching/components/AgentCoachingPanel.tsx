import { useMemo } from 'react';
import { Group, Stack, Tabs, Text } from '@mantine/core';
import { AreaChart } from '@mantine/charts';
import { createColumnHelper } from '@tanstack/react-table';
import { IconBook, IconChartBar, IconSchool } from '@tabler/icons-react';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import { SectionCard } from '~/components/SectionCard';
import BaseTable, {
	type BaseTableColumnDef,
} from '~/components/BaseTable/BaseTable';
import type {
	CoachingSessionRecord,
	LmsAssignment,
	LmsContent,
} from '~/models/qa';
import {
	AcceptanceBadge,
	AssignmentStatusBadge,
	FormatBadge,
	ImpactBadge,
} from '~/modules/qa/lms/components/Badges';
import { dueLabel } from '~/modules/qa/lms/helpers';
import type { AgentProfile, TeamRole } from '~/modules/qa/team/types';
import { buildPostCoachingSummary, rankMaterialImpact } from '../postCoaching';
import { AgentSessionsTable } from './AgentSessionsTable';
import { MaterialImpactRanking } from './MaterialImpactRanking';
import { PostCoachingCards } from './PostCoachingCards';

const assignmentHelper = createColumnHelper<LmsAssignment>();

interface AgentCoachingPanelProps {
	profile: AgentProfile;
	assignments: LmsAssignment[];
	sessions: CoachingSessionRecord[];
	contentById: Record<string, LmsContent>;
	role: TeamRole;
	tab: string;
	onTabChange: (tab: string | null) => void;
	onOpenSession: (sessionId: string) => void;
}

export function AgentCoachingPanel({
	profile,
	assignments,
	sessions,
	contentById,
	role,
	tab,
	onTabChange,
	onOpenSession,
}: AgentCoachingPanelProps) {
	const { t } = useTranslation(['qa.coaching', 'qa.lms', 'qa.triggers']);

	const mine = useMemo(
		() => assignments.filter((a) => a.agentId === profile.agent.id),
		[assignments, profile]
	);
	const mySessions = useMemo(
		() =>
			profile
				? sessions
						.filter(
							(s) =>
								s.agentId === profile.agent.id ||
								s.agentIds?.includes(profile.agent.id)
						)
						.sort((a, b) => b.date.localeCompare(a.date))
				: [],
		[sessions, profile]
	);
	const history = useMemo(
		() => [...mine].sort((a, b) => b.assignedAt.localeCompare(a.assignedAt)),
		[mine]
	);
	const ranked = useMemo(
		() => rankMaterialImpact(mine, contentById),
		[mine, contentById]
	);
	const summary = useMemo(
		() => buildPostCoachingSummary(profile.agent.id, sessions, assignments),
		[profile, sessions, assignments]
	);

	const performance = profile.performance.slice(-6).map((p) => ({
		label: p.label,
		overall: p.overall,
		qa: p.qa,
		sentiment: p.sentiment,
		compliance: p.compliance,
	}));

	const assignmentColumns: BaseTableColumnDef<LmsAssignment>[] = [
		assignmentHelper.accessor('contentId', {
			id: 'material',
			header: t('rules.detail.columns.material'),
			cell: (info) => {
				const c = contentById[info.getValue()];
				return (
					<Group gap='xs' wrap='nowrap'>
						<Text size='sm'>{c?.title ?? info.getValue()}</Text>
						{c && <FormatBadge format={c.format} size='xs' />}
					</Group>
				);
			},
		}) as BaseTableColumnDef<LmsAssignment>,
		assignmentHelper.accessor('assignedAt', {
			header: t('agents.assignmentsHistory.assigned'),
			cell: (info) => (
				<Text size='sm'>{dayjs(info.getValue()).format('D MMM YYYY')}</Text>
			),
		}) as BaseTableColumnDef<LmsAssignment>,
		assignmentHelper.accessor('dueDate', {
			header: t('columns.due', { ns: 'qa.lms', defaultValue: 'Due' }),
			cell: (info) => <Text size='sm'>{dueLabel(t, info.row.original)}</Text>,
		}) as BaseTableColumnDef<LmsAssignment>,
		assignmentHelper.display({
			id: 'acceptance',
			header: t('acceptance.PENDING', { ns: 'qa.lms' }),
			cell: (info) => (
				<AcceptanceBadge acceptance={info.row.original.acceptance} size='xs' />
			),
		}) as BaseTableColumnDef<LmsAssignment>,
		assignmentHelper.display({
			id: 'status',
			header: t('rules.detail.columns.status'),
			cell: (info) => (
				<AssignmentStatusBadge assignment={info.row.original} size='xs' />
			),
		}) as BaseTableColumnDef<LmsAssignment>,
		assignmentHelper.accessor('completedAt', {
			header: t('agents.assignmentsHistory.completed'),
			cell: (info) => (
				<Text size='sm'>
					{info.getValue() ? dayjs(info.getValue()).format('D MMM YYYY') : '—'}
				</Text>
			),
		}) as BaseTableColumnDef<LmsAssignment>,
		assignmentHelper.display({
			id: 'impact',
			header: t('rules.detail.columns.impact'),
			cell: (info) => (
				<ImpactBadge impact={info.row.original.impact} size='xs' />
			),
		}) as BaseTableColumnDef<LmsAssignment>,
	];

	return (
		<Stack gap='md'>
			<PostCoachingCards summary={summary} contentById={contentById} />

			<Tabs value={tab} onChange={onTabChange} keepMounted={false}>
				<Tabs.List>
					<Tabs.Tab value='assignments' leftSection={<IconBook size={14} />}>
						{t('agents.drawer.tabs.assignments')}
					</Tabs.Tab>
					<Tabs.Tab value='sessions' leftSection={<IconSchool size={14} />}>
						{t('agents.drawer.tabs.sessions')}
					</Tabs.Tab>
					<Tabs.Tab value='impact' leftSection={<IconChartBar size={14} />}>
						{t('agents.drawer.tabs.impact')}
					</Tabs.Tab>
				</Tabs.List>

				<Tabs.Panel value='assignments' pt='md'>
					<BaseTable<LmsAssignment>
						data={history}
						columns={assignmentColumns}
						getRowId={(r) => r.id}
						density='compact'
						enablePagination
						pageSize={10}
						showPaginationControls
						emptyMessage={t('agents.drawer.noAssignments')}
					/>
				</Tabs.Panel>

				<Tabs.Panel value='sessions' pt='md'>
					<AgentSessionsTable
						sessions={mySessions}
						role={role}
						onOpenSession={onOpenSession}
					/>
				</Tabs.Panel>

				<Tabs.Panel value='impact' pt='md'>
					<Stack gap='md'>
						<SectionCard title={t('agents.drawer.performance')} padding='md'>
							<AreaChart
								h={180}
								data={performance}
								dataKey='label'
								series={[
									{ name: 'overall', color: 'blue.6' },
									{ name: 'qa', color: 'orange.6' },
									{ name: 'compliance', color: 'green.6' },
									{ name: 'sentiment', color: 'violet.6' },
								]}
								curveType='monotone'
								withDots={false}
								withLegend
							/>
						</SectionCard>

						<MaterialImpactRanking rows={ranked} />
					</Stack>
				</Tabs.Panel>
			</Tabs>
		</Stack>
	);
}
