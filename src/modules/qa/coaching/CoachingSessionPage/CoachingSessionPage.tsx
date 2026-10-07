import { useMemo } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router';
import { Anchor, Breadcrumbs, Stack, Text, Title } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { ContentContainer } from '~/components/ContentContainer';
import type { CoachingSessionType, LmsContent } from '~/models/qa';
import { useCoachingStore, selectCohorts } from '~/stores/qa/coachingStore';
import {
	useLmsStore,
	selectAssignments,
	selectContent,
} from '~/stores/qa/lmsStore';
import { managerPersona, managerScopeAgents } from '~/modules/qa/lms/helpers';
import { roleFromPath } from '~/modules/qa/team/helpers';
import { coachingBasePath, SESSION_TYPES } from '../constants';
import { SessionForm, type SessionPreset } from '../components/SessionForm';

/**
 * Schedules a coaching session on its own page (route `sessions/new`). The agent,
 * learning group, type and topic can be preset with the `agent`, `cohort`,
 * `type` and `topic` query params.
 */
export default function CoachingSessionPage() {
	const { t } = useTranslation(['qa.coaching', 'qa.lms']);
	const location = useLocation();
	const navigate = useNavigate();
	const [searchParams] = useSearchParams();

	const role = roleFromPath(location.pathname);
	const persona = managerPersona(role);
	const allCohorts = useCoachingStore(selectCohorts);
	const assignments = useLmsStore(selectAssignments);
	const content = useLmsStore(selectContent);

	const scopeAgents = useMemo(() => managerScopeAgents(role), [role]);
	const cohorts = useMemo(
		() =>
			allCohorts.filter((c) =>
				c.agentIds.some((id) => scopeAgents.some((a) => a.id === id))
			),
		[allCohorts, scopeAgents]
	);
	const contentById = useMemo(
		() =>
			Object.fromEntries(content.map((c) => [c.id, c])) as Record<
				string,
				LmsContent
			>,
		[content]
	);

	const agent = searchParams.get('agent');
	const cohort = searchParams.get('cohort');
	const type = searchParams.get('type');
	const topic = searchParams.get('topic');
	// Stable identity: the form resets itself whenever the preset changes.
	const preset = useMemo<SessionPreset>(
		() => ({
			agentId: agent ?? undefined,
			cohortId: cohort ?? undefined,
			type: SESSION_TYPES.includes(type as CoachingSessionType)
				? (type as CoachingSessionType)
				: undefined,
			topic: topic ?? undefined,
		}),
		[agent, cohort, type, topic]
	);

	const backToSessions = () =>
		navigate(`${coachingBasePath(role)}?tab=sessions`);

	return (
		<ContentContainer contentWidth='full'>
			<Stack gap='lg' maw={960} mx='auto' px='md'>
				<Breadcrumbs>
					<Anchor size='sm' onClick={() => navigate(coachingBasePath(role))}>
						{t('title')}
					</Anchor>
					<Anchor size='sm' onClick={backToSessions}>
						{t('tabs.sessions')}
					</Anchor>
					<Text size='sm' c='dimmed'>
						{t('sessions.editor.createTitle')}
					</Text>
				</Breadcrumbs>

				<Title order={1}>{t('sessions.editor.createTitle')}</Title>

				<SessionForm
					role={role}
					persona={persona}
					preset={preset}
					cohorts={cohorts}
					assignments={assignments}
					contentById={contentById}
					onClose={backToSessions}
					onSaved={backToSessions}
				/>
			</Stack>
		</ContentContainer>
	);
}
