import { useLocation, useNavigate, useParams } from 'react-router';
import { Anchor, Breadcrumbs, Stack, Text, Title } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { ContentContainer } from '~/components/ContentContainer';
import { EmptyState } from '~/components/EmptyState/EmptyState';
import { useCoachingStore, selectRules } from '~/stores/qa/coachingStore';
import { managerPersona } from '~/modules/qa/lms/helpers';
import { roleFromPath } from '~/modules/qa/team/helpers';
import { coachingBasePath } from '../constants';
import { CoachingRuleForm } from '../components/CoachingRuleForm';

/** Create or edit one coaching rule on its own page (route `rules/new` or `rules/:ruleId/edit`). */
export default function CoachingRulePage() {
	const { t } = useTranslation(['qa.coaching', 'qa.lms']);
	const location = useLocation();
	const navigate = useNavigate();
	const { ruleId } = useParams<{ ruleId: string }>();

	const role = roleFromPath(location.pathname);
	const persona = managerPersona(role);
	const rules = useCoachingStore(selectRules);

	const mode = ruleId ? 'edit' : 'create';
	const rule = ruleId ? (rules.find((r) => r.id === ruleId) ?? null) : null;

	const backToRules = () => navigate(`${coachingBasePath(role)}?tab=rules`);

	if (mode === 'edit' && !rule) {
		return (
			<ContentContainer contentWidth='full'>
				<EmptyState message={t('rules.page.notFound')} />
			</ContentContainer>
		);
	}

	const title =
		mode === 'create'
			? t('rules.editor.createTitle')
			: t('rules.editor.editTitle');

	return (
		<ContentContainer contentWidth='full'>
			<Stack gap='lg'>
				<Breadcrumbs>
					<Anchor size='sm' onClick={() => navigate(coachingBasePath(role))}>
						{t('title')}
					</Anchor>
					<Anchor size='sm' onClick={backToRules}>
						{t('tabs.rules')}
					</Anchor>
					<Text size='sm' c='dimmed'>
						{mode === 'edit' && rule ? rule.name : title}
					</Text>
				</Breadcrumbs>

				<Title order={1}>{title}</Title>

				<CoachingRuleForm
					// A fresh form per rule, so switching rules never keeps stale values.
					key={rule?.id ?? 'new'}
					mode={mode}
					rule={rule}
					role={role}
					persona={persona}
					onClose={backToRules}
					onSaved={backToRules}
				/>
			</Stack>
		</ContentContainer>
	);
}
