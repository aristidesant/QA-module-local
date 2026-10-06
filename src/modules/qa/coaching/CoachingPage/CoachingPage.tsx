import { useEffect, useMemo, useState } from 'react';
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
	IconBook,
	IconCalendarEvent,
	IconPlus,
} from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import ContentContainer from '~/components/ContentContainer';
import { StatCard } from '~/components/StatCard';
import type { CoachingRule, LmsContent } from '~/models/qa';
import { notifySuccess, notifyWarning } from '~/modules/qa/utils/notifications';
import {
	useLmsStore,
	selectAssignments,
	selectContent,
	selectEnrollments,
	selectPaths,
} from '~/stores/qa/lmsStore';
import {
	useCoachingStore,
	selectCohorts,
	selectRules,
	selectSessions,
	selectSnoozed,
} from '~/stores/qa/coachingStore';
import { useTeamStore } from '~/stores/qa/teamStore';
import {
	useTriggerRulesStore,
	selectTriggerRules,
} from '~/stores/qa/triggerRulesStore';
import { withRuleBurnout } from '~/modules/qa/analytics/helpers';
import {
	daysUntil,
	isOverdue,
	managerPersona,
	managerScopeAgents,
	toAssignmentRows,
	today,
} from '~/modules/qa/lms/helpers';
import {
	AssignContentDrawer,
	type AssignPreset,
} from '~/modules/qa/lms/components/AssignContentDrawer';
import { roleFromPath } from '~/modules/qa/team/helpers';
import { SUPERVISOR_PERSONA } from '~/modules/qa/team/constants';
import {
	COACHING_TABS,
	coachingAgentPath,
	type CoachingTab,
} from '../constants';
import { buildQueue } from '../helpers';
import { AgentsTab, buildAgentRows } from './tabs/AgentsTab';
import { CohortsTab } from './tabs/CohortsTab';
import { RulesTab } from './tabs/RulesTab';
import { SessionsTab } from './tabs/SessionsTab';
import { ImpactTab } from './tabs/ImpactTab';
import { CohortDrawer } from '../components/CohortDrawer';
import { CreateCohortModal } from '../components/CreateCohortModal';
import { CoachingRuleEditorDrawer } from '../components/CoachingRuleEditorDrawer';
import { CoachingRuleDetailDrawer } from '../components/CoachingRuleDetailDrawer';
import {
	SessionEditorDrawer,
	type SessionPreset,
} from '../components/SessionEditorDrawer';
import { SessionDetailDrawer } from '../components/SessionDetailDrawer';

export default function CoachingPage() {
	const { t } = useTranslation(['qa.coaching', 'qa.lms']);
	const location = useLocation();
	const navigate = useNavigate();
	const [searchParams, setSearchParams] = useSearchParams();

	const role = roleFromPath(location.pathname);
	const persona = managerPersona(role);
	const scopeAgents = useMemo(() => managerScopeAgents(role), [role]);

	const profilesMap = useTeamStore((s) => s.profiles);
	const content = useLmsStore(selectContent);
	const paths = useLmsStore(selectPaths);
	const assignments = useLmsStore(selectAssignments);
	const enrollments = useLmsStore(selectEnrollments);
	const rules = useCoachingStore(selectRules);
	const triggerRules = useTriggerRulesStore(selectTriggerRules);
	const sessions = useCoachingStore(selectSessions);
	const cohorts = useCoachingStore(selectCohorts);
	const snoozed = useCoachingStore(selectSnoozed);

	const [assignState, setAssignState] = useState<{
		opened: boolean;
		preset?: AssignPreset;
	}>({ opened: false });
	const [sessionEditor, setSessionEditor] = useState<{
		opened: boolean;
		preset?: SessionPreset;
	}>({ opened: false });
	const [ruleEditor, setRuleEditor] = useState<{
		opened: boolean;
		mode: 'create' | 'edit';
		rule: CoachingRule | null;
	}>({
		opened: false,
		mode: 'create',
		rule: null,
	});
	const [cohortId, setCohortId] = useState<string | null>(null);
	const [ruleId, setRuleId] = useState<string | null>(null);
	const [sessionId, setSessionId] = useState<string | null>(null);
	const [cohortModal, setCohortModal] = useState(false);

	// Burnout level follows the burnout rules in Triggers.
	const scopeProfiles = useMemo(
		() =>
			Object.values(profilesMap)
				.filter(
					(p) =>
						role === 'qa-manager' ||
						p.agent.supervisorId === SUPERVISOR_PERSONA.id
				)
				.map((p) => withRuleBurnout(p, triggerRules)),
		[profilesMap, role, triggerRules]
	);

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
	const scopeSessions = useMemo(
		() => sessions.filter((s) => scopeAgents.some((a) => a.id === s.agentId)),
		[sessions, scopeAgents]
	);
	const scopeAssignments = useMemo(
		() =>
			assignments.filter((a) => scopeAgents.some((x) => x.id === a.agentId)),
		[assignments, scopeAgents]
	);
	const scopeCohorts = useMemo(
		() =>
			cohorts.filter((c) =>
				c.agentIds.some((id) => scopeAgents.some((a) => a.id === id))
			),
		[cohorts, scopeAgents]
	);
	const scopeRules = useMemo(
		() =>
			rules.filter(
				(r) =>
					role === 'qa-manager' ||
					r.createdByRole === 'SUPERVISOR' ||
					r.scope.supervisorIds.includes('SUP-001') ||
					r.scope.supervisorIds.length === 0
			),
		[rules, role]
	);

	const queue = useMemo(
		() =>
			buildQueue(
				scopeProfiles,
				scopeAssignments,
				scopeSessions,
				content,
				t
			).filter(
				(item) => !snoozed[item.agentId] || snoozed[item.agentId] < today()
			),
		[scopeProfiles, scopeAssignments, scopeSessions, content, t, snoozed]
	);
	const agentRows = useMemo(
		() => buildAgentRows(scopeProfiles, scopeAssignments, scopeSessions, queue),
		[scopeProfiles, scopeAssignments, scopeSessions, queue]
	);

	const agentTeam = useMemo(
		() => Object.fromEntries(scopeAgents.map((a) => [a.id, a.team])),
		[scopeAgents]
	);
	const agentSupervisor = useMemo(
		() => Object.fromEntries(scopeAgents.map((a) => [a.id, a.supervisorId])),
		[scopeAgents]
	);

	const measured = scopeAssignments.filter(
		(a) => a.impact && a.impact.verdict !== 'PENDING'
	);
	const kpis = {
		attention: queue.filter((q) => q.priority !== 'LOW').length,
		activePlans: scopeAssignments.filter((a) => a.status !== 'COMPLETED')
			.length,
		pendingResponses: scopeAssignments.filter(
			(a) =>
				a.acceptance.status === 'PENDING' ||
				a.acceptance.status === 'NO_RESPONSE'
		).length,
		overdue: scopeAssignments.filter(isOverdue).length,
		improvedRate: measured.length
			? Math.round(
					(measured.filter((a) => a.impact?.verdict === 'IMPROVED').length /
						measured.length) *
						100
				)
			: 0,
		sessionsThisWeek: scopeSessions.filter(
			(s) =>
				s.status === 'SCHEDULED' &&
				daysUntil(s.date) >= 0 &&
				daysUntil(s.date) <= 7
		).length,
	};

	// Deep link from outside the page (e.g. the Burnout Risk widget): open the
	// schedule-session drawer preset for that agent, then drop the param.
	useEffect(() => {
		const scheduleAgentId = searchParams.get('schedule');
		if (!scheduleAgentId) return;
		setSessionEditor({ opened: true, preset: { agentId: scheduleAgentId } });
		setSearchParams(
			(prev) => {
				const next = new URLSearchParams(prev);
				next.delete('schedule');
				return next;
			},
			{ replace: true }
		);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [searchParams]);

	const tab = (searchParams.get('tab') as CoachingTab | null) ?? 'agents';
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

	const pathTitle = (id: string | null) =>
		paths.find((p) => p.id === id)?.title ?? '—';

	const handleRunNow = (rule: CoachingRule, agentIds: string[]) => {
		if (agentIds.length === 0) {
			notifyWarning(t('rules.notifications.noMatches'));
			return;
		}
		const count = useCoachingStore.getState().runRuleNow(rule.id, agentIds, {
			name: persona.name,
			role: persona.role,
		});
		notifySuccess(t('rules.notifications.ran', { count }));
		setRuleId(null);
	};

	return (
		<ContentContainer contentWidth='full'>
			<Stack gap='lg'>
				<Group justify='space-between' align='flex-start'>
					<Stack gap={0} flex={1}>
						<Text size='xs' c='dimmed' tt='uppercase' fw={600}>
							{t(`eyebrow.${role}`)}
						</Text>
						<Title order={1}>{t('title')}</Title>
						<Text c='dimmed' size='sm'>
							{t('description')}
						</Text>
					</Stack>
					<Group gap='xs'>
						<Button
							variant='default'
							leftSection={<IconBook size={16} />}
							onClick={() => setAssignState({ opened: true })}
						>
							{t('assign')}
						</Button>
						<Button
							variant='default'
							leftSection={<IconCalendarEvent size={16} />}
							onClick={() => setSessionEditor({ opened: true })}
						>
							{t('newSession')}
						</Button>
						<Button
							leftSection={<IconPlus size={16} />}
							onClick={() =>
								setRuleEditor({ opened: true, mode: 'create', rule: null })
							}
						>
							{t('newRule')}
						</Button>
					</Group>
				</Group>

				<SimpleGrid cols={{ base: 2, md: 6 }} spacing='md'>
					<StatCard
						title={t('kpi.attention')}
						value={kpis.attention}
						color={
							kpis.attention > 0 ? 'var(--mantine-color-red-7)' : undefined
						}
						icon={<IconAlertTriangle size={18} />}
						variant='compact'
					/>
					<StatCard
						title={t('kpi.activePlans')}
						value={kpis.activePlans}
						variant='compact'
					/>
					<StatCard
						title={t('kpi.pendingResponses')}
						value={kpis.pendingResponses}
						color={
							kpis.pendingResponses > 0
								? 'var(--mantine-color-yellow-7)'
								: undefined
						}
						variant='compact'
					/>
					<StatCard
						title={t('kpi.overdue')}
						value={kpis.overdue}
						color={kpis.overdue > 0 ? 'var(--mantine-color-red-7)' : undefined}
						variant='compact'
					/>
					<StatCard
						title={t('kpi.improvedRate')}
						value={`${kpis.improvedRate}%`}
						color='var(--mantine-color-green-7)'
						variant='compact'
					/>
					<StatCard
						title={t('kpi.sessionsThisWeek')}
						value={kpis.sessionsThisWeek}
						variant='compact'
					/>
				</SimpleGrid>

				<Tabs value={tab} onChange={setTab} keepMounted={false}>
					<Tabs.List>
						{COACHING_TABS.map(({ value, labelKey, icon: Icon }) => {
							const count =
								value === 'agents'
									? agentRows.length
									: value === 'cohorts'
										? scopeCohorts.length
										: value === 'rules'
											? scopeRules.filter((r) => r.status === 'ACTIVE').length
											: value === 'sessions'
												? scopeSessions.filter((s) => s.status === 'SCHEDULED')
														.length
												: measured.length;
							return (
								<Tabs.Tab
									key={value}
									value={value}
									leftSection={<Icon size={16} />}
									rightSection={
										<Badge size='xs' variant='light' color='gray'>
											{count}
										</Badge>
									}
								>
									{t(labelKey)}
								</Tabs.Tab>
							);
						})}
					</Tabs.List>

					<Tabs.Panel value='agents' pt='md'>
						<AgentsTab
							rows={agentRows}
							assignments={scopeAssignments}
							role={role}
							onOpen={(agentId) => navigate(coachingAgentPath(role, agentId))}
						/>
					</Tabs.Panel>

					<Tabs.Panel value='cohorts' pt='md'>
						<CohortsTab
							cohorts={scopeCohorts}
							paths={paths}
							assignments={assignments}
							onOpen={setCohortId}
							onCreate={() => setCohortModal(true)}
						/>
					</Tabs.Panel>

					<Tabs.Panel value='rules' pt='md'>
						<RulesTab
							rules={scopeRules}
							pathTitle={pathTitle}
							onCreate={() =>
								setRuleEditor({ opened: true, mode: 'create', rule: null })
							}
							onEdit={(rule) =>
								setRuleEditor({ opened: true, mode: 'edit', rule })
							}
							onOpen={setRuleId}
							onDuplicate={(rule) => {
								const copy = useCoachingStore.getState().duplicateRule(rule.id);
								if (copy) {
									notifySuccess(t('rules.notifications.duplicated'));
									setRuleEditor({ opened: true, mode: 'edit', rule: copy });
								}
							}}
							onDelete={(rule) => {
								useCoachingStore.getState().deleteRule(rule.id);
								notifySuccess(t('rules.notifications.deleted'));
							}}
							onToggle={(rule) => {
								const next = rule.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE';
								useCoachingStore.getState().setRuleStatus(rule.id, next);
								notifySuccess(
									t(
										next === 'ACTIVE'
											? 'rules.notifications.activated'
											: 'rules.notifications.paused'
									)
								);
							}}
							onRunNow={(rule) => setRuleId(rule.id)}
						/>
					</Tabs.Panel>

					<Tabs.Panel value='sessions' pt='md'>
						<SessionsTab
							sessions={scopeSessions}
							agentTeam={agentTeam}
							agentSupervisor={agentSupervisor}
							role={role}
							onOpen={setSessionId}
							onCreate={() => setSessionEditor({ opened: true })}
						/>
					</Tabs.Panel>

					<Tabs.Panel value='impact' pt='md'>
						<ImpactTab
							rows={rows}
							rules={scopeRules}
							contentById={contentById}
							role={role}
							onOpenAgent={(agentId) =>
								navigate(`${coachingAgentPath(role, agentId)}?tab=impact`)
							}
						/>
					</Tabs.Panel>
				</Tabs>
			</Stack>

			<AssignContentDrawer
				opened={assignState.opened}
				onClose={() => setAssignState({ opened: false })}
				role={role}
				preset={assignState.preset}
				cohorts={scopeCohorts}
			/>

			<SessionEditorDrawer
				opened={sessionEditor.opened}
				onClose={() => setSessionEditor({ opened: false })}
				role={role}
				persona={persona}
				preset={sessionEditor.preset}
				cohorts={scopeCohorts}
				assignments={scopeAssignments}
				contentById={contentById}
			/>

			<CoachingRuleEditorDrawer
				opened={ruleEditor.opened}
				mode={ruleEditor.mode}
				rule={ruleEditor.rule}
				role={role}
				persona={persona}
				onClose={() =>
					setRuleEditor({ opened: false, mode: 'create', rule: null })
				}
				onSaved={() =>
					setRuleEditor({ opened: false, mode: 'create', rule: null })
				}
			/>

			<CoachingRuleDetailDrawer
				rule={ruleId ? (scopeRules.find((r) => r.id === ruleId) ?? null) : null}
				rows={rows}
				contentById={contentById}
				pathTitle={pathTitle}
				opened={ruleId !== null}
				onClose={() => setRuleId(null)}
				onEdit={(rule) => {
					setRuleId(null);
					setRuleEditor({ opened: true, mode: 'edit', rule });
				}}
				onRunNow={handleRunNow}
			/>

			<CohortDrawer
				cohort={
					cohortId
						? (scopeCohorts.find((c) => c.id === cohortId) ?? null)
						: null
				}
				paths={paths}
				enrollments={enrollments}
				assignments={assignments}
				rules={rules}
				opened={cohortId !== null}
				onClose={() => setCohortId(null)}
				onAssignPath={() => {
					const cohort = scopeCohorts.find((c) => c.id === cohortId);
					if (cohort) {
						setAssignState({
							opened: true,
							preset: {
								cohortId: cohort.id,
								pathId: cohort.pathId ?? undefined,
							},
						});
						setCohortId(null);
					}
				}}
				onAssignMaterial={() => {
					if (cohortId) {
						setAssignState({ opened: true, preset: { cohortId } });
						setCohortId(null);
					}
				}}
				onScheduleGroup={() => {
					if (cohortId) {
						setSessionEditor({
							opened: true,
							preset: { cohortId, type: 'GROUP' },
						});
						setCohortId(null);
					}
				}}
				onDelete={() => {
					if (cohortId) {
						useCoachingStore.getState().deleteCohort(cohortId);
						notifySuccess(t('cohorts.drawer.deleted'));
						setCohortId(null);
					}
				}}
				onOpenRule={(id) => {
					setCohortId(null);
					setRuleId(id);
				}}
			/>

			<SessionDetailDrawer
				session={
					sessionId ? (sessions.find((s) => s.id === sessionId) ?? null) : null
				}
				profile={
					sessionId
						? profilesMap[
								sessions.find((s) => s.id === sessionId)?.agentId ?? ''
							]
						: undefined
				}
				assignments={assignments}
				contentById={contentById}
				opened={sessionId !== null}
				onClose={() => setSessionId(null)}
				onOpenCall={(callId) => navigate(`/qa/campaigns/1/calls/${callId}`)}
			/>

			<CreateCohortModal
				opened={cohortModal}
				onClose={() => setCohortModal(false)}
				role={role}
				persona={persona}
			/>
		</ContentContainer>
	);
}
