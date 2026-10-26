# Trigger rule editor: from right-side drawer to its own page

Target path for execution: `docs/superpowers/plans/2026-10-26-trigger-rule-editor-page.md`

## Context

In Triggers & Recognition (`/qa/{supervisor|qa-manager}/triggers`), "New alert", "New recognition", row-menu Edit, Duplicate, "Create rule for badge" and the detail page's Edit button all open `RuleEditorDrawer`, an `xl` right-side drawer with eight stacked sections and a sticky footer. The form is long, so the drawer scrolls inside a narrow panel and the preview panel scrolls away. The user wants these forms on an isolated page instead.

Decisions taken with the user (2026-10-26):

- **Scope: rules only.** The badge editor ("New badge", `BadgeEditorDrawer`) stays a drawer.
- **Type choice: keep the picker modal.** "New alert" / "New recognition" still open `RuleTypePickerModal`; choosing a type navigates to the page with the type in the URL.
- **Layout: single column**, the same shell as the Coaching rule page (`src/modules/qa/coaching/CoachingRulePage/CoachingRulePage.tsx`): breadcrumbs, `Title order={1}`, preview panel, sections stacked at 720px, sticky Save bar.

Constraints from `DESIGN_ROLE.md`: mockup quality, no dev server, no tests, no git write operations unless asked (use plain `mv` for the folder rename, not `git mv`). Both themes must work. `tsconfig` has `noUnusedLocals`.

Two existing defects get fixed on the way because the new flow touches them:

- "Create rule for badge" builds a `badgePreset` (`TriggersPage.tsx:242-246`) that the drawer never receives. The page passes it through router state.
- The drawer's discard confirmation is hard-coded English ("Are you sure you want to discard your changes?"). The form gets a locale key.

## Routes and paths

New routes in `src/routes.tsx`, inserted **before** each role's `triggers/rules/:ruleId` detail route (static segments win anyway; this mirrors the coaching block at lines 1443-1475). Each uses the same `I18nNamespaceLoader` + `Suspense` wrapper as the existing triggers routes (lines 1608-1649):

| path                                     | id                                 | element               |
| ---------------------------------------- | ---------------------------------- | --------------------- |
| `qa-manager/triggers/rules/new`          | `qa.qa-manager.triggers.rule-new`  | `<TriggerRulePage />` |
| `qa-manager/triggers/rules/:ruleId/edit` | `qa.qa-manager.triggers.rule-edit` | `<TriggerRulePage />` |
| `supervisor/triggers/rules/new`          | `qa.supervisor.triggers.rule-new`  | `<TriggerRulePage />` |
| `supervisor/triggers/rules/:ruleId/edit` | `qa.supervisor.triggers.rule-edit` | `<TriggerRulePage />` |

Lazy import next to `TriggersPage` / `TriggerRuleDetailPage` (lines 241-245):
`const TriggerRulePage = lazy(() => import('./modules/qa/triggers/TriggerRulePage'));`

`src/modules/qa/qaNamespaces.ts`, after line 227, four entries mapping each new id to `'qa.triggers'`. (`I18nNamespaceLoader` falls back to the id string as the namespace when an id is missing, which breaks every label on the page.)

`src/modules/qa/triggers/constants.ts`, after `triggerRulePath` (line 565):

```ts
/** The isolated page that creates a rule of one type (route `triggers/rules/new`). */
export const triggerRuleNewPath = (role: TriggersRole, type: RuleType) =>
	`${triggersBasePath(role)}/rules/new?type=${type}`;
/** The isolated page that edits one rule (route `triggers/rules/:ruleId/edit`). */
export const triggerRuleEditPath = (role: TriggersRole, ruleId: string) =>
	`${triggersBasePath(role)}/rules/${ruleId}/edit`;
```

`RuleType` is already imported in that file (check the import block at the top; add it to the `~/models/qa` type import if not).

No sidebar change: `isLinkActive` matches by prefix, so the Triggers item stays highlighted on the sub-pages.

## File structure

Rename the folder (filesystem `mv`, not git): `src/modules/qa/triggers/components/RuleEditorDrawer/` → `src/modules/qa/triggers/components/RuleEditorForm/`. Inside it:

- delete `RuleEditorDrawer.tsx` and `RuleEditorDrawer.module.css`
- new `RuleEditorForm.tsx` and `RuleEditorForm.module.css`
- `index.ts` becomes `export { RuleEditorForm } from './RuleEditorForm';`
- `sections/*` stay as they are. After the move run `rg "from '\.\./" src/modules/qa/triggers/components/RuleEditorForm/sections` and fix any relative import that pointed at the old folder name (sections import `~/modules/qa/triggers/...` absolute paths and `./` siblings today, so this is expected to find nothing).

New page: `src/modules/qa/triggers/TriggerRulePage/TriggerRulePage.tsx` (default export) + `index.ts` (`export { default } from './TriggerRulePage';`), matching `TriggersPage/index.ts`.

Modified: `TriggersPage/TriggersPage.tsx`, `TriggerRuleDetailPage/TriggerRuleDetailPage.tsx`, `triggers/constants.ts`, `routes.tsx`, `qaNamespaces.ts`, `locales/{en,es}/qa.triggers.json`.

## Task 1 — `RuleEditorForm` (the drawer body as a page form)

`src/modules/qa/triggers/components/RuleEditorForm/RuleEditorForm.module.css` (same recipe as `coaching/components/CoachingRuleForm.module.css`):

```css
/* Keeps Cancel / Save in view while the long form scrolls. Same recipe as CoachingRuleForm. */
.stickyActions {
	position: sticky;
	bottom: var(--mantine-spacing-xs);
	margin-top: var(--mantine-spacing-md);
	padding: var(--mantine-spacing-sm) var(--mantine-spacing-md);
	background: var(--surface-card);
	border: 1px solid var(--surface-border);
	border-radius: var(--mantine-radius-lg);
	box-shadow: var(--mantine-shadow-sm);
	z-index: 10;
}

@media (max-width: 48em) {
	.stickyActions {
		bottom: 0;
		padding: var(--mantine-spacing-sm);
	}
}
```

`RuleEditorForm.tsx`: port `RuleEditorDrawer.tsx` (quoted in full in the exploration; every section, prop and validation rule stays) with these changes only:

- Props: `{ mode: 'create' | 'edit'; type: RuleType; rule: TriggerRule | null; role: 'supervisor' | 'qaManager'; preset?: Partial<RuleFormValues>; onClose: () => void; onSaved: (rule: TriggerRule) => void; }`. No `opened`.
- `useForm` in the default controlled mode (drop `mode: 'uncontrolled'`); `initialValues: buildRuleFormValues(type, rule, templates, defaultSupervisorIds, preset)`. The 5th `preset` argument already exists in `helpers.ts:321`.
- Delete the `useEffect` re-initialisation (lines 82-94) and the `useEffect` import. The page remounts the form with a `key`.
- Replace the two save paths with one `handleSave(status: TriggerRule['status'])`:
  - `status === 'DRAFT'` (create only): no validation, as today.
  - otherwise: `form.validate()`, the RANGE check and the WEEKLY_SUMMARY time check exactly as lines 96-113.
  - build the rule as lines 115-124 with `status` = the argument (`'ACTIVE'` for Save & activate, `rule!.status` for Save changes), `addRule` / `updateRule`, the matching `notifySuccess`, then `onSaved(newRule)`.
- `handleClose`: keep the `form.isDirty()` confirm, but `title: t('editor.discard')`, `children: t('editor.discardDescription')`, `labels: { confirm: t('editor.discardConfirm'), cancel: t('common.cancel') }`, `confirmProps: { color: 'red' }`.
- Root is `<Stack gap='md'>` (no `AppDrawer`, no `classes.container`): `PreviewPanel`, then the sections in the same order and with the same props as lines 167-197, then the actions:

```tsx
{
	/* Pinned to the viewport so the actions stay in reach on this long form. */
}
<Box className={classes.stickyActions}>
	<Group justify='flex-end' gap='xs'>
		<Button variant='subtle' onClick={handleClose}>
			{t('common.cancel')}
		</Button>
		{mode === 'create' ? (
			<>
				<Button variant='light' onClick={() => handleSave('DRAFT')}>
					{t('editor.footer.saveDraft')}
				</Button>
				<Button onClick={() => handleSave('ACTIVE')}>
					{t('editor.footer.saveActivate')}
				</Button>
			</>
		) : (
			<Button onClick={() => handleSave(rule?.status ?? 'ACTIVE')}>
				{t('editor.footer.save')}
			</Button>
		)}
	</Group>
</Box>;
```

Imports: `Box, Button, Group, Stack` from Mantine; drop `AppDrawer`. Everything else as the drawer.

Typecheck will fail until Task 4 removes the old `RuleEditorDrawer` imports; run it after Task 4.

## Task 2 — `TriggerRulePage`

`src/modules/qa/triggers/TriggerRulePage/TriggerRulePage.tsx`, modelled on `CoachingRulePage.tsx`:

```tsx
import {
	useLocation,
	useNavigate,
	useParams,
	useSearchParams,
} from 'react-router';
import { Anchor, Breadcrumbs, Stack, Text, Title } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import ContentContainer from '~/components/ContentContainer';
import EmptyState from '~/components/EmptyState';
import type { RuleType, TriggerRule } from '~/models/qa';
import { useTriggerRulesStore } from '~/stores/qa/triggerRulesStore';
import { RuleEditorForm } from '../components/RuleEditorForm';
import {
	RULE_TYPE_META,
	triggerRulePath,
	triggersBasePath,
	triggersRoleFromPath,
} from '../constants';
import type { RuleFormValues } from '../helpers';

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

	// Create: the type comes from the picker through the URL; edit: from the rule.
	const typeParam = searchParams.get('type');
	const type: RuleType | null =
		rule?.type ??
		(typeParam && typeParam in RULE_TYPE_META ? (typeParam as RuleType) : null);

	// "Create rule for badge" hands its prefilled conditions through router state.
	const preset = (location.state as { preset?: Partial<RuleFormValues> } | null)
		?.preset;

	const listTab = (kind: 'ALERT' | 'RECOGNITION') =>
		kind === 'ALERT' ? 'alerts' : 'recognition';
	const backToList = (kind: 'ALERT' | 'RECOGNITION') =>
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
```

Check two imports against the repo before pasting: `ContentContainer` and `EmptyState` are default exports in `TriggerRuleDetailPage.tsx` (copy its import lines). `RULE_TYPE_META` keys must be exactly the `RuleType` union (they are; it is `Record<RuleType, …>`).

After save: create goes back to the list on the matching tab; edit goes to the rule's detail page, which shows the saved values and is where the Edit button came from.

## Task 3 — Locale keys (`qa.triggers`, both languages)

Add under `editor` (en):

```json
"discard": "Discard changes?",
"discardDescription": "Your edits to this rule will be lost.",
"discardConfirm": "Discard"
```

es:

```json
"discard": "¿Descartar los cambios?",
"discardDescription": "Se perderán los cambios de esta regla.",
"discardConfirm": "Descartar"
```

Nothing is removed. `editor.footer.cancel` stays unused as today.

## Task 4 — Openers

`TriggersPage/TriggersPage.tsx`:

- Imports: drop `RuleEditorDrawer`; add `triggerRuleEditPath, triggerRuleNewPath` to the `../constants` import; drop the `TriggerRule`/`RuleType` types from `~/models/qa` only if nothing else in the file uses them after the edit (`RuleType` is still used by `handlePickerSelect`; `TriggerRule` by `handleEditRule`).
- Delete the `editorState` state (lines 74-80) and the `<RuleEditorDrawer …/>` block (lines 274-301).
- `const triggersRole = triggersRoleFromPath(location.pathname);` next to `role` (line 61).
- `handlePickerSelect`: `navigate(triggerRuleNewPath(triggersRole, type));` and nothing else (the tab switch happens when the user returns, through `?tab=`). Keep `useCallback` with `[navigate, triggersRole]`.
- `handleEditRule`: `navigate(triggerRuleEditPath(triggersRole, rule.id));`.
- `BadgesTab onCreateRuleForBadge`: `navigate(triggerRuleNewPath(triggersRole, 'BADGE_AWARD'), { state: { preset: { badgeId: badge.id, conditions: badge.conditions, conditionLogic: badge.conditionLogic } } });` using the same three fields the current `badgePreset` builds (lines 242-246). `RulesTab`'s Duplicate keeps calling `onEdit(copy)`, which now opens the edit page for the copy.
- Keep `TriggersPageContext`, the picker modal and the activity drawer as they are.

`TriggerRuleDetailPage/TriggerRuleDetailPage.tsx`:

- Imports: drop `RuleEditorDrawer`; add `triggerRuleEditPath` to the `../constants` import; drop `useState` only if `activityEntry` is the sole remaining state (it is not, keep `useState`).
- Delete `const [editing, setEditing] = useState(false);` (line 72) and `editorRole` (line 86).
- Edit button `onClick={() => navigate(triggerRuleEditPath(role, rule.id))}`.
- Delete the `<RuleEditorDrawer …/>` block (lines 490-498).

Then `rg "RuleEditorDrawer" src` must return nothing, and `npm run typecheck` must show no errors under `src/modules/qa/triggers`, `src/routes.tsx` or `src/locales`.

## Task 5 — Sweep

- `rg "RuleEditorDrawer" src` → 0 hits.
- `rg "Are you sure you want to discard" src` → 0 hits.
- `rg "style={{" src/modules/qa/triggers/TriggerRulePage src/modules/qa/triggers/components/RuleEditorForm/RuleEditorForm.tsx` → 0 hits.
- Every `t('…')` literal in `TriggerRulePage.tsx` and `RuleEditorForm.tsx` resolves in both `en` and `es` `qa.triggers.json` (reuse the key-check script from the My Learning work with the new file list).
- `npm run typecheck`: no errors in the touched files. The 9 errors in `dashboard/insights` and the ones in `src/views/Campaigns` are pre-existing and unrelated.

## Verification (manual, no dev server per DESIGN_ROLE.md)

- Triggers list → New alert → pick "Metric alert" → URL `/qa/qa-manager/triggers/rules/new?type=METRIC_ALERT`, breadcrumbs "Triggers & Recognition › Alerts › New Metric alert", preview panel on top, sections stacked, Save bar pinned at the bottom while scrolling. Cancel with edits asks "Discard changes?". Save & activate returns to the Alerts tab with the new rule listed.
- Row menu Edit and Duplicate open `/rules/:id/edit` with the rule's values; Save changes lands on the rule's detail page.
- Detail page Edit opens the same edit page; its Cancel returns to the list tab.
- Badges tab → "Create rule for badge" opens `/rules/new?type=BADGE_AWARD` with the badge and its conditions prefilled (this did not work in the drawer).
- `/rules/new` without `?type=` and `/rules/unknown/edit` show "Rule not found."
- Supervisor role: same flows under `/qa/supervisor/triggers/…`, Scope section defaults to SUP-001.
- Dark mode: the sticky bar uses `--surface-card` / `--surface-border`.

## Out of scope

- The badge editor drawer and the badge detail drawer (user's choice).
- Draft save still skips validation, as the drawer did.
- The duplicate `sections/VariableChips.tsx` + `sections/VariableChips/index.ts` files.
- Committing: everything from this session is uncommitted until the user fixes the pre-existing typecheck errors and asks.
