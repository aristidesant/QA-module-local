import { useMemo } from 'react';
import { Group, SimpleGrid, Stack, Tabs, Text } from '@mantine/core';
import { AreaChart } from '@mantine/charts';
import { createColumnHelper } from '@tanstack/react-table';
import { IconBook, IconChartBar, IconSchool } from '@tabler/icons-react';
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
import { ImpactSparkline } from '~/modules/qa/lms/components/ImpactSparkline';
import { dueLabel } from '~/modules/qa/lms/helpers';
import { DimensionScoreCard } from '~/modules/qa/team/components/DimensionScoreCard';
import type { AgentProfile, TeamRole } from '~/modules/qa/team/types';
import { AgentSessionsTable } from './AgentSessionsTable';

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
	const measured = useMemo(() => mine.filter((a) => a.impact), [mine]);

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
			<SimpleGrid cols={{ base: 2, md: 4 }} spacing='sm'>
				{profile.dimensions.map((d) => (
					<DimensionScoreCard key={d.key} dimension={d} />
				))}
			</SimpleGrid>

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
						data={mine}
						columns={assignmentColumns}
						getRowId={(r) => r.id}
						density='compact'
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

						{measured.length === 0 ? (
							<Text size='sm' c='dimmed'>
								{t('agents.drawer.noImpact')}
							</Text>
						) : (
							measured.map((a) => (
								<SectionCard
									key={a.id}
									title={contentById[a.contentId]?.title ?? a.contentId}
									padding='md'
								>
									<Stack gap='sm'>
										<Group gap='xs'>
											<ImpactBadge impact={a.impact} size='xs' />
											<Text size='xs' c='dimmed'>
												{a.impact &&
													t(`metrics.${a.impact.metricId}`, {
														ns: 'qa.triggers',
													})}
											</Text>
										</Group>
										{a.impact && (
											<ImpactSparkline impact={a.impact} height={70} />
										)}
									</Stack>
								</SectionCard>
							))
						)}
					</Stack>
				</Tabs.Panel>
			</Tabs>
		</Stack>
	);
}
