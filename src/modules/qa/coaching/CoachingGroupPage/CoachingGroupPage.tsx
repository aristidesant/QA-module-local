import { useLocation, useNavigate, useParams } from 'react-router';
import { Anchor, Breadcrumbs, Stack, Text, Title } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { ContentContainer } from '~/components/ContentContainer';
import { EmptyState } from '~/components/EmptyState/EmptyState';
import { managerLmsPath } from '~/modules/qa/lms/constants';
import { managerPersona } from '~/modules/qa/lms/helpers';
import { roleFromPath } from '~/modules/qa/team/helpers';
import { selectCohorts, useCoachingStore } from '~/stores/qa/coachingStore';
import { CoachingGroupForm } from '../components/CoachingGroupForm';

/** Create or edit one learning group on its own page (route `groups/new` or `groups/:cohortId/edit`). */
export default function CoachingGroupPage() {
	const { t } = useTranslation(['qa.coaching', 'qa.lms']);
	const location = useLocation();
	const navigate = useNavigate();
	const { cohortId } = useParams<{ cohortId: string }>();

	const role = roleFromPath(location.pathname);
	const persona = managerPersona(role);
	const cohorts = useCoachingStore(selectCohorts);

	const mode = cohortId ? 'edit' : 'create';
	const cohort = cohortId
		? (cohorts.find((c) => c.id === cohortId) ?? null)
		: null;

	const backToGroups = () => navigate(`${managerLmsPath(role)}?tab=groups`);

	if (mode === 'edit' && !cohort) {
		return (
			<ContentContainer contentWidth='full'>
				<EmptyState message={t('cohorts.page.notFound')} />
			</ContentContainer>
		);
	}

	const title =
		mode === 'create' ? t('cohorts.create.title') : t('cohorts.edit.title');

	return (
		<ContentContainer contentWidth='full'>
			<Stack gap='lg' maw={720} mx='auto' px='md'>
				<Breadcrumbs>
					<Anchor size='sm' onClick={() => navigate(managerLmsPath(role))}>
						{t('manager.title', { ns: 'qa.lms' })}
					</Anchor>
					<Anchor size='sm' onClick={backToGroups}>
						{t('manager.tabs.groups', { ns: 'qa.lms' })}
					</Anchor>
					<Text size='sm' c='dimmed'>
						{mode === 'edit' && cohort ? cohort.name : title}
					</Text>
				</Breadcrumbs>

				<Title order={1}>{title}</Title>

				<CoachingGroupForm
					// A fresh form per group, so switching groups never keeps stale values.
					key={cohort?.id ?? 'new'}
					mode={mode}
					cohort={cohort}
					role={role}
					persona={persona}
					onClose={backToGroups}
					onSaved={backToGroups}
				/>
			</Stack>
		</ContentContainer>
	);
}
