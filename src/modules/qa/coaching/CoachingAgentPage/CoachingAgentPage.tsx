import { useMemo, useState } from 'react';
import {
	useLocation,
	useNavigate,
	useParams,
	useSearchParams,
} from 'react-router';
import {
	Anchor,
	Breadcrumbs,
	Button,
	Group,
	Stack,
	Text,
	Title,
} from '@mantine/core';
import { IconBook, IconCalendarEvent } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { ContentContainer } from '~/components/ContentContainer';
import { EmptyState } from '~/components/EmptyState/EmptyState';
import type { LmsContent } from '~/models/qa';
import {
	useLmsStore,
	selectAssignments,
	selectContent,
} from '~/stores/qa/lmsStore';
import {
	useCoachingStore,
	selectCohorts,
	selectSessions,
} from '~/stores/qa/coachingStore';
import { useTeamStore } from '~/stores/qa/teamStore';
import {
	useTriggerRulesStore,
	selectTriggerRules,
} from '~/stores/qa/triggerRulesStore';
import { withRuleBurnout } from '~/modules/qa/analytics/helpers';
import { managerPersona } from '~/modules/qa/lms/helpers';
import { AssignContentDrawer } from '~/modules/qa/lms/components/AssignContentDrawer';
import { agentProfilePath, roleFromPath } from '~/modules/qa/team/helpers';
import { SUPERVISOR_PERSONA } from '~/modules/qa/team/constants';
import { coachingBasePath } from '../constants';
import { AgentCoachingPanel } from '../components/AgentCoachingPanel';
import { SessionEditorDrawer } from '../components/SessionEditorDrawer';
import { SessionDetailDrawer } from '../components/SessionDetailDrawer';

export default function CoachingAgentPage() {
	const { t } = useTranslation(['qa.coaching', 'qa.lms']);
	const location = useLocation();
	const navigate = useNavigate();
	const { agentId } = useParams<{ agentId: string }>();
	const [searchParams, setSearchParams] = useSearchParams();

	const role = roleFromPath(location.pathname);
	const persona = managerPersona(role);

	const profilesMap = useTeamStore((s) => s.profiles);
	const triggerRules = useTriggerRulesStore(selectTriggerRules);
	const content = useLmsStore(selectContent);
	const assignments = useLmsStore(selectAssignments);
	const sessions = useCoachingStore(selectSessions);
	const cohorts = useCoachingStore(selectCohorts);

	const [assignOpen, setAssignOpen] = useState(false);
	const [scheduleOpen, setScheduleOpen] = useState(false);
	const [sessionId, setSessionId] = useState<string | null>(null);

	const rawProfile = agentId ? profilesMap[agentId] : undefined;
	const visible =
		rawProfile &&
		(role === 'qa-manager' ||
			rawProfile.agent.supervisorId === SUPERVISOR_PERSONA.id);
	const profile = useMemo(
		() =>
			visible && rawProfile ? withRuleBurnout(rawProfile, triggerRules) : null,
		[visible, rawProfile, triggerRules]
	);

	const contentById = useMemo(
		() =>
			Object.fromEntries(content.map((c) => [c.id, c])) as Record<
				string,
				LmsContent
			>,
		[content]
	);
	const agentCohorts = useMemo(
		() => cohorts.filter((c) => agentId && c.agentIds.includes(agentId)),
		[cohorts, agentId]
	);

	// Stable presets: the editor drawers reset their form whenever the preset identity changes.
	const assignPreset = useMemo(
		() => ({ agentIds: agentId ? [agentId] : [] }),
		[agentId]
	);
	const schedulePreset = useMemo(() => ({ agentId }), [agentId]);

	const tab = searchParams.get('tab') ?? 'timeline';
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

	if (!profile || !agentId) {
		return (
			<ContentContainer contentWidth='full'>
				<EmptyState message={t('agents.page.notFound')} />
			</ContentContainer>
		);
	}

	return (
		<ContentContainer contentWidth='full'>
			<Stack gap='lg'>
				<Breadcrumbs>
					<Anchor size='sm' onClick={() => navigate(coachingBasePath(role))}>
						{t('title')}
					</Anchor>
					<Text size='sm' c='dimmed'>
						{profile.agent.name}
					</Text>
				</Breadcrumbs>

				<Group justify='space-between' align='flex-start'>
					<Stack gap={0}>
						<Title order={1}>{profile.agent.name}</Title>
						<Text c='dimmed' size='sm'>
							{profile.agent.team} · {profile.agent.supervisorName}
						</Text>
					</Stack>
					<Group gap='xs'>
						<Button
							variant='default'
							leftSection={<IconBook size={16} />}
							onClick={() => setAssignOpen(true)}
						>
							{t('agents.drawer.assign')}
						</Button>
						<Button
							variant='default'
							leftSection={<IconCalendarEvent size={16} />}
							onClick={() => setScheduleOpen(true)}
						>
							{t('agents.drawer.schedule')}
						</Button>
						<Button
							variant='subtle'
							onClick={() =>
								navigate(
									`${agentProfilePath(role, profile.agent)}?tab=coaching`
								)
							}
						>
							{t('agents.drawer.profile')}
						</Button>
					</Group>
				</Group>

				<AgentCoachingPanel
					profile={profile}
					assignments={assignments}
					sessions={sessions}
					contentById={contentById}
					tab={tab}
					onTabChange={setTab}
					onOpenSession={setSessionId}
				/>
			</Stack>

			<AssignContentDrawer
				opened={assignOpen}
				onClose={() => setAssignOpen(false)}
				role={role}
				preset={assignPreset}
				cohorts={agentCohorts}
			/>

			<SessionEditorDrawer
				opened={scheduleOpen}
				onClose={() => setScheduleOpen(false)}
				role={role}
				persona={persona}
				preset={schedulePreset}
				cohorts={agentCohorts}
				assignments={assignments}
				contentById={contentById}
			/>

			<SessionDetailDrawer
				session={
					sessionId ? (sessions.find((s) => s.id === sessionId) ?? null) : null
				}
				profile={profile}
				assignments={assignments}
				contentById={contentById}
				opened={sessionId !== null}
				onClose={() => setSessionId(null)}
				onOpenCall={(callId) => navigate(`/qa/campaigns/1/calls/${callId}`)}
			/>
		</ContentContainer>
	);
}
