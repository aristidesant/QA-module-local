import { useMemo, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router';
import {
	Badge,
	Button,
	Group,
	SimpleGrid,
	Stack,
	Tabs,
	Text,
	Title,
} from '@mantine/core';
import {
	IconAlertTriangle,
	IconCalendarEvent,
	IconChartBar,
	IconLibrary,
	IconListCheck,
	IconMailForward,
	IconPlus,
	IconRoute,
} from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import ContentContainer from '~/components/ContentContainer';
import { StatCard } from '~/components/StatCard';
import type { LmsContent } from '~/models/qa';
import { agentProfilePath, roleFromPath } from '~/modules/qa/team/helpers';
import { TEAM_AGENTS } from '~/modules/qa/team/mockData';
import {
	useLmsStore,
	selectAssignments,
	selectContent,
	selectEnrollments,
	selectPaths,
} from '~/stores/qa/lmsStore';
import { useCoachingStore, selectRules } from '~/stores/qa/coachingStore';
import { agentContentPath } from '../constants';
import {
	managerKpis,
	managerPersona,
	managerScopeAgents,
	toAssignmentRows,
} from '../helpers';
import {
	AssignContentDrawer,
	type AssignPreset,
} from '../components/AssignContentDrawer';
import { ContentDetailDrawer } from '../components/ContentDetailDrawer';
import { PathDetailDrawer } from '../components/PathDetailDrawer';
import { AssignmentDetailDrawer } from '../components/AssignmentDetailDrawer';
import { LibraryTab } from './tabs/LibraryTab';
import { ManagerPathsTab } from './tabs/ManagerPathsTab';
import { ManagerAssignmentsTab } from './tabs/ManagerAssignmentsTab';
import { ReportsTab } from './tabs/ReportsTab';

type ManagerTab = 'library' | 'paths' | 'assignments' | 'reports';

export default function LmsManagerPage() {
	const { t } = useTranslation('qa.lms');
	const location = useLocation();
	const navigate = useNavigate();
	const [searchParams, setSearchParams] = useSearchParams();

	const role = roleFromPath(location.pathname);
	const persona = managerPersona(role);
	const scopeAgents = useMemo(() => managerScopeAgents(role), [role]);

	const content = useLmsStore(selectContent);
	const paths = useLmsStore(selectPaths);
	const assignments = useLmsStore(selectAssignments);
	const enrollments = useLmsStore(selectEnrollments);
	const rules = useCoachingStore(selectRules);

	const [assignState, setAssignState] = useState<{
		opened: boolean;
		preset?: AssignPreset;
	}>({ opened: false });
	const [contentId, setContentId] = useState<string | null>(null);
	const [pathId, setPathId] = useState<string | null>(null);
	const [assignmentId, setAssignmentId] = useState<string | null>(null);

	const contentById = useMemo(
		() =>
			Object.fromEntries(content.map((c) => [c.id, c])) as Record<
				string,
				LmsContent
			>,
		[content]
	);
	const rows = useMemo(
		() => toAssignmentRows(assignments, contentById, scopeAgents),
		[assignments, contentById, scopeAgents]
	);
	const scopeEnrollments = useMemo(
		() =>
			enrollments.filter((e) => scopeAgents.some((a) => a.id === e.agentId)),
		[enrollments, scopeAgents]
	);
	const enrolledCounts = useMemo(() => {
		const counts: Record<string, number> = {};
		for (const e of scopeEnrollments)
			counts[e.pathId] = (counts[e.pathId] ?? 0) + 1;
		return counts;
	}, [scopeEnrollments]);

	const kpis = managerKpis(rows, content);
	const openCount = rows.filter((r) => r.status !== 'COMPLETED').length;

	/** Coaching rules that assign the selected content, directly or through its path. */
	const linkedRules = useMemo(() => {
		if (!contentId) return [];
		return rules
			.filter((r) => {
				if (r.action.contentIds.includes(contentId)) return true;
				const path = r.action.pathId
					? paths.find((p) => p.id === r.action.pathId)
					: undefined;
				return !!path?.modules.some((m) => m.contentId === contentId);
			})
			.map((r) => ({ id: r.id, name: r.name }));
	}, [contentId, rules, paths]);

	const tab = (searchParams.get('tab') as ManagerTab | null) ?? 'library';
	const setTab = (value: string | null) => {
		setSearchParams(
			(prev) => {
				const next = new URLSearchParams(prev);
				if (value) next.set('tab', value);
				return next;
			},
			{ replace: true }
		);
	};

	const openAssign = (preset?: AssignPreset) =>
		setAssignState({ opened: true, preset });

	return (
		<ContentContainer contentWidth='full'>
			<Stack gap='lg'>
				<Group justify='space-between' align='flex-start'>
					<Stack gap={0} flex={1}>
						<Text size='xs' c='dimmed' tt='uppercase' fw={600}>
							{t(`manager.eyebrow.${role}`)}
						</Text>
						<Title order={1}>{t('manager.title')}</Title>
						<Text c='dimmed' size='sm'>
							{t('manager.description')}
						</Text>
					</Stack>
					<Button
						leftSection={<IconPlus size={16} />}
						onClick={() => openAssign()}
					>
						{t('manager.assignButton')}
					</Button>
				</Group>

				<SimpleGrid cols={{ base: 2, md: 6 }} spacing='md'>
					<StatCard
						title={t('manager.kpi.published')}
						value={kpis.published}
						variant='compact'
						icon={<IconLibrary size={18} />}
					/>
					<StatCard
						title={t('manager.kpi.activeAssignments')}
						value={kpis.activeAssignments}
						variant='compact'
						icon={<IconListCheck size={18} />}
					/>
					<StatCard
						title={t('manager.kpi.pendingAcceptance')}
						value={kpis.pendingAcceptance}
						color={
							kpis.pendingAcceptance > 0
								? 'var(--mantine-color-yellow-7)'
								: undefined
						}
						variant='compact'
						icon={<IconMailForward size={18} />}
					/>
					<StatCard
						title={t('manager.kpi.rescheduleRequests')}
						value={kpis.rescheduleRequests}
						color={
							kpis.rescheduleRequests > 0
								? 'var(--mantine-color-orange-7)'
								: undefined
						}
						variant='compact'
						icon={<IconCalendarEvent size={18} />}
					/>
					<StatCard
						title={t('manager.kpi.overdue')}
						value={kpis.overdue}
						color={kpis.overdue > 0 ? 'var(--mantine-color-red-7)' : undefined}
						variant='compact'
						icon={<IconAlertTriangle size={18} />}
					/>
					<StatCard
						title={t('manager.kpi.completionRate')}
						value={`${kpis.completionRate}%`}
						variant='compact'
						icon={<IconChartBar size={18} />}
					/>
				</SimpleGrid>

				<Tabs value={tab} onChange={setTab} keepMounted={false}>
					<Tabs.List>
						<Tabs.Tab
							value='library'
							leftSection={<IconLibrary size={16} />}
							rightSection={
								<Badge size='xs' variant='light'>
									{kpis.published}
								</Badge>
							}
						>
							{t('manager.tabs.library')}
						</Tabs.Tab>
						<Tabs.Tab
							value='paths'
							leftSection={<IconRoute size={16} />}
							rightSection={
								<Badge size='xs' variant='light'>
									{paths.length}
								</Badge>
							}
						>
							{t('manager.tabs.paths')}
						</Tabs.Tab>
						<Tabs.Tab
							value='assignments'
							leftSection={<IconListCheck size={16} />}
							rightSection={
								<Badge
									size='xs'
									variant='light'
									color={kpis.overdue > 0 ? 'red' : 'gray'}
								>
									{openCount}
								</Badge>
							}
						>
							{t('manager.tabs.assignments')}
						</Tabs.Tab>
						<Tabs.Tab value='reports' leftSection={<IconChartBar size={16} />}>
							{t('manager.tabs.reports')}
						</Tabs.Tab>
					</Tabs.List>

					<Tabs.Panel value='library' pt='md'>
						<LibraryTab
							content={content}
							role={role}
							onOpenContent={setContentId}
							onAssign={(id) => openAssign({ contentIds: [id] })}
							onPreview={(id) => navigate(agentContentPath(id))}
						/>
					</Tabs.Panel>

					<Tabs.Panel value='paths' pt='md'>
						<ManagerPathsTab
							paths={paths}
							enrolledCounts={enrolledCounts}
							onOpen={setPathId}
							onAssign={(id) => openAssign({ pathId: id })}
						/>
					</Tabs.Panel>

					<Tabs.Panel value='assignments' pt='md'>
						<ManagerAssignmentsTab
							rows={rows}
							role={role}
							onOpen={setAssignmentId}
						/>
					</Tabs.Panel>

					<Tabs.Panel value='reports' pt='md'>
						<ReportsTab rows={rows} />
					</Tabs.Panel>
				</Tabs>
			</Stack>

			<AssignContentDrawer
				opened={assignState.opened}
				onClose={() => setAssignState({ opened: false })}
				role={role}
				preset={assignState.preset}
			/>

			<ContentDetailDrawer
				content={contentId ? (contentById[contentId] ?? null) : null}
				rows={rows}
				paths={paths}
				linkedRules={linkedRules}
				opened={contentId !== null}
				onClose={() => setContentId(null)}
				onAssign={() => {
					if (contentId) openAssign({ contentIds: [contentId] });
					setContentId(null);
				}}
				onPreview={() => contentId && navigate(agentContentPath(contentId))}
				onOpenPath={(id) => {
					setContentId(null);
					setPathId(id);
				}}
			/>

			<PathDetailDrawer
				path={pathId ? (paths.find((p) => p.id === pathId) ?? null) : null}
				enrollments={scopeEnrollments}
				agents={scopeAgents}
				contentById={contentById}
				opened={pathId !== null}
				onClose={() => setPathId(null)}
				onAssign={() => {
					if (pathId) openAssign({ pathId });
					setPathId(null);
				}}
				onOpenContent={(id) => {
					setPathId(null);
					setContentId(id);
				}}
			/>

			<AssignmentDetailDrawer
				assignment={
					assignmentId
						? (rows.find((r) => r.id === assignmentId) ?? null)
						: null
				}
				persona={persona}
				opened={assignmentId !== null}
				onClose={() => setAssignmentId(null)}
				onOpenProfile={(agentId) => {
					const agent = TEAM_AGENTS.find((a) => a.id === agentId);
					if (agent) navigate(`${agentProfilePath(role, agent)}?tab=coaching`);
				}}
			/>
		</ContentContainer>
	);
}
