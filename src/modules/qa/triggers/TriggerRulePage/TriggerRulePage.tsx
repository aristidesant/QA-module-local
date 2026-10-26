import {
	useLocation,
	useNavigate,
	useParams,
	useSearchParams,
} from 'react-router';
import { Anchor, Breadcrumbs, Stack, Text, Title } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { ContentContainer } from '~/components/ContentContainer';
import EmptyState from '~/components/EmptyState';
import type { RuleKind, RuleType, TriggerRule } from '~/models/qa';
import { useTriggerRulesStore } from '~/stores/qa/triggerRulesStore';
import {
	RULE_TYPE_META,
	triggerRulePath,
	triggersBasePath,
	triggersRoleFromPath,
} from '../constants';
import type { RuleFormValues } from '../helpers';
import { RuleEditorForm } from '../components/RuleEditorForm';

const listTab = (kind: RuleKind) =>
	kind === 'ALERT' ? 'alerts' : 'recognition';

/** Create or edit one trigger rule on its own page (route `rules/new?type=` or `rules/:ruleId/edit`). */
export default function TriggerRulePage() {
	const { t } = useTranslation('qa.triggers');
	const location = useLocation();
	const navigate = useNavigate();
	const { ruleId } = useParams<{ ruleId: string }>();
	const [searchParams] = useSearchParams();

	const role = triggersRoleFromPath(location.pathname);
	const editorRole = role === 'supervisor' ? 'supervisor' : 'qaManager';
	const rules = useTriggerRulesStore((s) => s.rules);

	const mode = ruleId ? 'edit' : 'create';
	const rule: TriggerRule | null = ruleId
		? (rules.find((r) => r.id === ruleId) ?? null)
		: null;

	// Create: the type comes from the picker through the URL. Edit: from the rule.
	const typeParam = searchParams.get('type');
	const type: RuleType | null =
		rule?.type ??
		(typeParam && typeParam in RULE_TYPE_META ? (typeParam as RuleType) : null);

	// "Create rule for badge" hands its prefilled conditions through router state.
	const preset = (location.state as { preset?: Partial<RuleFormValues> } | null)
		?.preset;

	const backToList = (kind: RuleKind) =>
		navigate(`${triggersBasePath(role)}?tab=${listTab(kind)}`);

	if (!type || (mode === 'edit' && !rule)) {
		return (
			<ContentContainer contentWidth='full'>
				<EmptyState message={t('detail.notFound')} />
			</ContentContainer>
		);
	}

	const meta = RULE_TYPE_META[type];
	const title =
		mode === 'create'
			? t('editor.createTitle', { type: t(`types.${type}.label`) })
			: t('editor.editTitle');

	return (
		<ContentContainer contentWidth='full'>
			<Stack gap='lg' maw={720} mx='auto' px='md'>
				<Breadcrumbs>
					<Anchor size='sm' onClick={() => navigate(triggersBasePath(role))}>
						{t('page.title')}
					</Anchor>
					<Anchor size='sm' onClick={() => backToList(meta.kind)}>
						{t(`page.tabs.${listTab(meta.kind)}`)}
					</Anchor>
					<Text size='sm' c='dimmed'>
						{mode === 'edit' && rule ? rule.name : title}
					</Text>
				</Breadcrumbs>

				<Title order={1}>{title}</Title>

				<RuleEditorForm
					// A fresh form per rule or type, so switching never keeps stale values.
					key={rule?.id ?? type}
					mode={mode}
					type={type}
					rule={rule}
					role={editorRole}
					preset={mode === 'create' ? preset : undefined}
					onClose={() => backToList(meta.kind)}
					onSaved={(saved) =>
						mode === 'create'
							? backToList(saved.kind)
							: navigate(triggerRulePath(role, saved.id))
					}
				/>
			</Stack>
		</ContentContainer>
	);
}
