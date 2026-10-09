# Learning groups: quieter cards, and a group page that mirrors the rule page

## Context

The Coaching → Learning Groups tab (`src/modules/qa/coaching/CoachingPage/tabs/CohortsTab.tsx`) renders each group as a card built from the stock "AI dashboard" kit: a title + description pair, a stack of pastel initials avatars, a row mixing three badge styles (blue light badge with icon, outline primary "RULES: 1", gray dot badges in uppercase), then a "Completion" progress bar with a percentage and an "Improved: N" line. Three identical cards in a 3-up grid. The designer calls it AI slop, and it is: every element is decoration-first, nothing is the group's actual job (who is in it and whether their learning is on track).

Creating a group lives on `src/modules/qa/coaching/CoachingGroupPage/CoachingGroupPage.tsx`: a 960px page with a plain path `Select`, toast-only validation, a non-sticky footer, no edit mode and no way to pick materials. The rule page (`CoachingRulePage.tsx` + `components/CoachingRuleForm.tsx`) already has the pattern the user wants: 720px column, SectionCards, inline errors, a dirty-check on cancel, a sticky action bar, `PickerField` + `MaterialPickerModal` for materials and paths.

User decisions (2026-10-09): keep cards but make them quiet; the group page handles create and edit (new `groups/:cohortId/edit` route, Edit button in the drawer); materials picked on the page are stored on the group and assigned to every member on save with a "Due in (days)" value, the path keeps enrolling members as today.

Mode: Operate. Refinement inside the incumbent identity.

---

## Critique summary

### First impression

The eye goes to the colored avatar stacks and the green bars, not to the group names. The three cards read as one template stamped three times.

### Usability

| Finding                                                                                                                                           | Severity | Evidence                                             |
| ------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | ---------------------------------------------------- |
| No edit flow: a group's name, members or path cannot change after creation; `updateCohort` is never called                                        | 🔴       | `coachingStore.ts:697-700`, no route in `routes.tsx` |
| Materials cannot be chosen when the group is created; only a path, via a bare `Select`                                                            | 🔴       | `CoachingGroupPage.tsx:184-194`                      |
| Card is a clickable `Paper` with no `role`, no `tabIndex`, no keyboard handler                                                                    | 🟡       | `CohortsTab.tsx:64-71`                               |
| Validation is a toast; the field with the problem is not marked; no dirty-check on cancel                                                         | 🟡       | `CoachingGroupPage.tsx:70-78, 196-201`               |
| "Completion" is computed differently on the card (completed / all assignments) and in the drawer (average path progress), so the two can disagree | 🟡       | `CohortsTab.tsx:56-60` vs `CohortDrawer.tsx:88`      |
| `cohorts.members` has no singular form ("1 members")                                                                                              | 🟢       | `qa.coaching.json:250`                               |
| Add-team select hardcodes `'SUP-001'`                                                                                                             | 🟢       | `CoachingGroupPage.tsx:173`                          |

### Visual hierarchy

- **What draws the eye first**: the avatar colors (orange, violet, green, blue) and the saturated bar. Wrong: those are identity, not status.
- **Reading flow**: title → description → avatars → badge salad → bar → metric. Six rows of equal weight; the one number a supervisor wants (is the group on track) is the smallest text.
- **Emphasis**: badges carry zero information the meta line could not (path name, "1 rule", tags). The uppercase comes from Mantine's default Badge text-transform.

### Consistency

| Element        | Issue                                                  | Fix                                            |
| -------------- | ------------------------------------------------------ | ---------------------------------------------- |
| Badge variants | light + icon, outline (primary), dot (gray) in one row | no badges on the card                          |
| Avatar colors  | per-agent pastel from mock data                        | neutral gray initials                          |
| Progress color | primary green on the card, `grape` ring in the drawer  | thin gray bar on the card; drawer out of scope |
| Page width     | 960 here, 720 on the rule page                         | 720                                            |

### Accessibility

- Card needs `role='button'`, `tabIndex={0}`, Enter/Space, and a visible focus ring (reuse `.clickable` from `Cards.module.css` plus `:focus-visible`).
- Initials avatars need `title`/`aria-label` with the member's name.
- Inline errors under fields, not color alone.

### What works

- The group model is small and sound (`CoachingCohort`, `coaching.ts:219-230`); adding `contentIds` is one field.
- The rule page pattern is complete and recent: `PickerField`, `MaterialPickerModal`, sticky footer CSS, inline validation, dirty guard. The group page can copy it almost line for line.
- `CohortDrawer` already offers assign path / assign material / schedule group; it only lacks Edit.

---

## Direction

1. **The card is a name and one line of facts.** Name, then a dimmed meta line: `4 members · New agent onboarding · 1 rule`. A row of small neutral initials. A thin gray bar with `48% complete · 7 improved` under it. Tags, if any, as a dimmed lowercase line. No badges, no colors except the primary focus ring.
2. **The group page is the rule page.** Same shell (`ContentContainer` + `Stack maw={720}`), breadcrumbs, `Title`, sections Basics → Members → Learning → sticky footer. Create and edit, inline validation, dirty guard.
3. **Learning is picked, not typed.** Path and materials through `PickerField` + `MaterialPickerModal` (`mode='path'` / `mode='content'`), chosen materials as removable pills, one `Due in (days)` number input.
4. **Save does the work.** Group stored with `contentIds`; path enrols members, materials become assignments for every member. On edit, only newly added members (and newly added materials) get enrolled or assigned.

---

## Implementation plan

Execute in order; `npm run typecheck` after each phase.

### Phase 1 — Model, seeds, store, paths, routes

**1a. Model, `src/models/qa/coaching.ts:219-230`**: add `/** Materials every member is assigned when they join. */ contentIds: string[];` after `pathId`. Seeds in `src/modules/qa/coaching/mockData.ts` (`COACHING_COHORT_SEEDS`, three objects ~L937-975): add `contentIds: []` to each. `addCohort`'s `Omit<CoachingCohort, 'id' | 'createdAt'>` picks the field up automatically.

**1b. Paths, `src/modules/qa/coaching/constants.ts`** (next to `coachingGroupNewPath`, L183):

```ts
export const coachingGroupEditPath = (role: TeamRole, cohortId: string) =>
	`${coachingBasePath(role)}/groups/${cohortId}/edit`;
```

**1c. Routes, `src/routes.tsx`**: after each `…/coaching/groups/new` entry (qa-manager ~L1335, supervisor ~L1434) add its twin:

```tsx
{
	path: 'qa-manager/coaching/groups/:cohortId/edit',
	id: 'qa.qa-manager.coaching.group-edit',
	element: (
		<I18nNamespaceLoader>
			<Suspense fallback={<SuspenseFallback />}>
				<CoachingGroupPage />
			</Suspense>
		</I18nNamespaceLoader>
	),
},
```

and the same with `supervisor/…` and id `qa.supervisor.coaching.group-edit`.

### Phase 2 — Quiet cards (`CohortsTab.tsx`)

Replace the card body (`:63-131`) with:

```tsx
<Paper
	key={cohort.id}
	withBorder
	p='md'
	radius='md'
	className={styles.card}
	role='button'
	tabIndex={0}
	onClick={() => onOpen(cohort.id)}
	onKeyDown={(e) => {
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			onOpen(cohort.id);
		}
	}}
>
	<Stack gap='sm'>
		<Stack gap={2}>
			<Text size='sm' fw={600}>
				{cohort.name}
			</Text>
			<Text size='xs' c='dimmed' lineClamp={1}>
				{[
					t('cohorts.members', { count: members.length }),
					path?.title,
					cohort.ruleIds.length > 0
						? t('cohorts.rulesCount', { count: cohort.ruleIds.length })
						: null,
				]
					.filter(Boolean)
					.join(' · ')}
			</Text>
		</Stack>

		<Avatar.Group spacing='xs'>
			{members.slice(0, MAX_AVATARS).map((m) => (
				<Avatar key={m.id} size={24} radius='xl' color='gray' title={m.name}>
					{initials(m.name)}
				</Avatar>
			))}
			{members.length > MAX_AVATARS && (
				<Avatar size={24} radius='xl' color='gray'>
					+{members.length - MAX_AVATARS}
				</Avatar>
			)}
		</Avatar.Group>

		<Stack gap={4}>
			<Progress
				value={completion}
				size='xs'
				color='gray'
				aria-label={t('cohorts.progressLabel', { percent: completion })}
			/>
			<Text size='xs' c='dimmed'>
				{t('cohorts.progressLine', { percent: completion, improved })}
			</Text>
		</Stack>

		{cohort.tags.length > 0 && (
			<Text size='xs' c='dimmed'>
				{cohort.tags.join(' · ')}
			</Text>
		)}
	</Stack>
</Paper>
```

- `const MAX_AVATARS = 4;` at the top. Drop the `Badge`, `Group`, `IconRoute` imports.
- `styles` = a new `CohortsTab.module.css`:
  ```css
  /* A group card is a link to its drawer: pointer, quiet hover, visible focus. */
  .card {
  	cursor: pointer;
  	transition: border-color 120ms ease;
  }
  .card:hover {
  	border-color: light-dark(
  		var(--mantine-color-gray-5),
  		var(--mantine-color-dark-3)
  	);
  }
  .card:focus-visible {
  	outline: 2px solid var(--mantine-primary-color-filled);
  	outline-offset: 2px;
  }
  ```
- Move the `initials` helper to `src/modules/qa/team/helpers.ts` as `export const initials = …` (the tab, `PodiumStrip.tsx:18`, `ReactionsTab.tsx:33` and `ReportCover.tsx:14` each have a copy; only this tab switches to the shared one in this plan).
- Keep the completion math as it is (shared helper is a follow-up); keep the empty state, the SectionCard and the "New learning group" button.

### Phase 3 — Group page as the rule page

Rewrite `src/modules/qa/coaching/CoachingGroupPage/CoachingGroupPage.tsx` into a thin page plus `src/modules/qa/coaching/components/CoachingGroupForm.tsx` (mirrors `CoachingRulePage.tsx` / `CoachingRuleForm.tsx`).

**3a. Page.**

```tsx
const { cohortId } = useParams<{ cohortId: string }>();
const mode = cohortId ? 'edit' : 'create';
const cohorts = useCoachingStore(selectCohorts);
const cohort = cohortId
	? (cohorts.find((c) => c.id === cohortId) ?? null)
	: null;
if (mode === 'edit' && !cohort)
	return (
		<ContentContainer contentWidth='full'>
			<EmptyState message={t('cohorts.page.notFound')} />
		</ContentContainer>
	);
```

Shell: `ContentContainer contentWidth='full'` → `Stack gap='lg' maw={720} mx='auto' px='md'` → breadcrumbs (Coaching → Learning Groups → `cohort?.name ?? title`) → `Title order={1}` (`cohorts.create.title` or `cohorts.edit.title`) → `<CoachingGroupForm key={cohort?.id ?? 'new'} mode cohort role persona onClose={backToGroups} onSaved={backToGroups} />`.

**3b. Form values.**

```ts
interface GroupFormValues {
	name: string;
	description: string;
	tags: string[];
	agentIds: string[];
	pathId: string | null;
	contentIds: string[];
	dueInDays: number; // default 14
}
```

Initial values from `cohort` in a `useEffect` keyed on `cohort?.id`, then `form.resetDirty()` (same as `CoachingRuleForm.tsx:155-213`). `dueInDays` defaults to 14 in both modes.

**3c. Sections** (`SectionCard padding='md'`, in this order):

1. **Basics** (`cohorts.create.sections.basics`): `TextInput maw={480}` name (with `error={form.errors.name}`, `clearFieldError` on change), `Textarea autosize minRows={2}` description, `TagsInput` tags.
2. **Members** (`cohorts.create.sections.members`, description `membersHint`): `MultiSelect searchable clearable` with `error={form.errors.agentIds}`; "Add team" `Select` kept (replace the hardcoded `'SUP-001'` with `persona.id`: `s.id === persona.id`). Under the select, a dimmed line `t('cohorts.members', { count })`.
3. **Learning** (`cohorts.create.sections.learning`, description `learningHint`), `Stack gap='sm'`:
   - `Group align='flex-start' gap='md' wrap='nowrap'` → `Box flex={1} miw={0}` with `<PickerField label={t('cohorts.create.path')} placeholder={t('cohorts.picker.pathPlaceholder')} summary={paths.find((p) => p.id === form.values.pathId)?.title ?? null} onOpen={() => setPicker('path')} />`, beside `NumberInput w={140} min={1} max={90} label={t('cohorts.create.dueInDays')} error={form.errors.dueInDays}`.
   - `<PickerField label={t('cohorts.create.materials')} placeholder={t('cohorts.picker.contentPlaceholder')} summary={count ? t('rules.editor.picker.selected', { count }) : null} onOpen={() => setPicker('content')} />` then the chosen materials as `Pill size='md' withRemoveButton` (copy `CoachingRuleForm.tsx:560-580`, titles from `useLmsStore(selectContent)`).
   - When a path is chosen, show a small dimmed line under the path field: `t('cohorts.create.pathClear')` with a `Button variant='subtle' size='compact-xs'` "Remove" that sets `pathId` to null (the picker modal cannot deselect).
4. **Sticky footer**: `<Box className={styles.stickyActions}>` (reuse `CoachingRuleForm.module.css` by importing it: `import styles from './CoachingRuleForm.module.css'`) → `Group justify='flex-end' gap='xs'`: Cancel (`variant='subtle'`, dirty-check confirm modal like `CoachingRuleForm.tsx:321-332`), then `Create learning group` or `Save`.

`<MaterialPickerModal opened={picker !== null} onClose={() => setPicker(null)} mode={picker ?? 'content'} selectedIds={picker === 'path' ? (pathId ? [pathId] : []) : contentIds} initialArea={null} onConfirm={(ids) => picker === 'path' ? setFieldValue('pathId', ids[0] ?? null) : setFieldValue('contentIds', ids)} />` with `const [picker, setPicker] = useState<'path' | 'content' | null>(null)`.

**3d. Validation** (inline, `form.setErrors`): name required; `agentIds.length >= 2`; `dueInDays` 1-90 when a path or materials are chosen. `handleSave`: `if (!validate()) { notifyWarning(t('cohorts.create.validation.fixFields')); return; }`.

**3e. Save.**

```ts
const dueDate = day(today(), form.values.dueInDays); // '~/modules/qa/lms/mockData' day, '~/modules/qa/lms/helpers' today (as coachingStore.ts snoozeAgent uses)
const lms = useLmsStore.getState();
const enrolAndAssign = (
	agentIds: string[],
	contentIds: string[],
	pathId: string | null
) => {
	if (pathId && agentIds.length)
		lms.enroll(agentIds, pathId, persona.name, 'MANUAL', dueDate);
	if (contentIds.length && agentIds.length)
		lms.assign({
			agentIds,
			contentIds,
			pathId: null,
			dueDate,
			mandatory: false,
			requireAcceptance: false,
			reason: t('cohorts.assignReason', { name }),
			source: 'MANUAL',
			assignedBy: persona.name,
			assignedByRole: persona.role,
		});
};
if (mode === 'create') {
	const created = addCohort({
		name,
		description,
		tags,
		agentIds,
		pathId,
		contentIds,
		ruleIds: [],
		createdBy: persona.name,
		createdByRole: persona.role,
	});
	enrolAndAssign(agentIds, contentIds, pathId);
	notifySuccess(t('cohorts.create.success', { name: created.name }));
} else {
	updateCohort({
		...cohort,
		name,
		description,
		tags,
		agentIds,
		pathId,
		contentIds,
	});
	const newMembers = agentIds.filter((id) => !cohort.agentIds.includes(id));
	const newMaterials = contentIds.filter(
		(id) => !cohort.contentIds.includes(id)
	);
	// New members get everything; existing members get only what was added.
	enrolAndAssign(newMembers, contentIds, pathId);
	enrolAndAssign(
		cohort.agentIds.filter((id) => agentIds.includes(id)),
		newMaterials,
		pathId !== cohort.pathId ? pathId : null
	);
	notifySuccess(t('cohorts.edit.success', { name }));
}
onSaved();
```

Confirm `AssignInput.assignedByRole` accepts `persona.role` (both are `'SUPERVISOR' | 'QA_MANAGER'`; if `LmsAssignerRole` differs, map it). `lms.assign` already skips agents who have the material open.

**3f. Drawer Edit button.** `CohortDrawer.tsx` props: add `onEdit: () => void`; in `headerActions` (`:139-150`) prepend `<Button size='xs' variant='default' leftSection={<IconPencil size={14} />} onClick={onEdit}>{t('cohorts.drawer.edit')}</Button>`. `CoachingPage.tsx` (`:421-471`): `onEdit={() => { if (cohortId) { navigate(coachingGroupEditPath(role, cohortId)); setCohortId(null); } }}`.

### Phase 4 — Copy (`src/locales/{en,es}/qa.coaching.json`, under `cohorts`)

en:

```json
"members_one": "{{count}} member",
"members_other": "{{count}} members",
"rulesCount_one": "{{count}} rule",
"rulesCount_other": "{{count}} rules",
"progressLabel": "{{percent}}% complete",
"progressLine": "{{percent}}% complete · {{improved}} improved",
"assignReason": "Learning group: {{name}}",
"page": { "notFound": "This learning group is not available in your scope." },
"edit": { "title": "Edit learning group", "submit": "Save", "success": "Learning group {{name}} updated" },
"picker": { "pathPlaceholder": "Browse and choose a learning path", "contentPlaceholder": "Browse and choose material" },
"create.sections.learning": "Learning",
"create.sections.learningHint": "What every member is enrolled in and assigned when they join.",
"create.materials": "Material",
"create.dueInDays": "Due in (days)",
"create.pathClear": "Remove path",
"create.validation.fixFields": "Fix the highlighted fields",
"create.validation.due": "Due must be between 1 and 90 days",
"drawer.edit": "Edit"
```

Remove `cohorts.members` (replaced by `_one/_other`), `cohorts.path`, `cohorts.completion`, `cohorts.improved`, `cohorts.create.sections.path`, `cohorts.drawer.progress` if a grep confirms they are unreferenced after the change (`cohorts.members` is still used by the drawer: keep the plural pair under the same key, i18next resolves `cohorts.members` with `count`).

es:

```json
"members_one": "{{count}} miembro",
"members_other": "{{count}} miembros",
"rulesCount_one": "{{count}} regla",
"rulesCount_other": "{{count}} reglas",
"progressLabel": "{{percent}}% completado",
"progressLine": "{{percent}}% completado · {{improved}} mejoraron",
"assignReason": "Grupo de aprendizaje: {{name}}",
"page": { "notFound": "Este grupo de aprendizaje no está disponible en tu alcance." },
"edit": { "title": "Editar grupo de aprendizaje", "submit": "Guardar", "success": "Grupo de aprendizaje {{name}} actualizado" },
"picker": { "pathPlaceholder": "Explora y elige una ruta de aprendizaje", "contentPlaceholder": "Explora y elige material" },
"create.sections.learning": "Aprendizaje",
"create.sections.learningHint": "En qué se inscribe y qué se asigna a cada miembro al entrar.",
"create.materials": "Material",
"create.dueInDays": "Vence en (días)",
"create.pathClear": "Quitar ruta",
"create.validation.fixFields": "Corrige los campos marcados",
"create.validation.due": "El vencimiento debe estar entre 1 y 90 días",
"drawer.edit": "Editar"
```

---

## Files touched

- `src/models/qa/coaching.ts`, `src/modules/qa/coaching/mockData.ts` (1a)
- `src/modules/qa/coaching/constants.ts`, `src/routes.tsx` (1b, 1c)
- `src/modules/qa/coaching/CoachingPage/tabs/CohortsTab.tsx` + new `CohortsTab.module.css`, `src/modules/qa/team/helpers.ts` (2)
- `src/modules/qa/coaching/CoachingGroupPage/CoachingGroupPage.tsx`, new `src/modules/qa/coaching/components/CoachingGroupForm.tsx` (3)
- `src/modules/qa/coaching/components/CohortDrawer.tsx`, `src/modules/qa/coaching/CoachingPage/CoachingPage.tsx` (3f)
- `src/locales/{en,es}/qa.coaching.json` (4)

Reused unchanged: `PickerField`, `MaterialPickerModal`, `CoachingRuleForm.module.css` (sticky footer), `SectionCard`, `AppDrawer`, `EmptyState`.

## Out of scope (noted)

- The drawer's `grape` ring and its different completion formula.
- A shared `cohortProgress` helper for card and drawer.
- Linking rules to a group from the page (`ruleIds` stays as is).

## Verification

Per DESIGN_ROLE.md the dev server runs only if asked.

1. `npm run typecheck` passes.
2. `/qa/supervisor/coaching?tab=cohorts`: three cards, each with name, one dimmed meta line, gray initials, a thin gray bar with "48% complete · 7 improved", tags as dimmed text. No badges. Tab to a card: a focus ring; Enter opens the drawer.
3. Drawer header has "Edit"; it opens `/groups/coh-001/edit` with the form pre-filled; the breadcrumb ends with the group name.
4. "New learning group": a 720px page with Basics → Members → Learning, a sticky footer. Material opens the library modal; chosen items appear as pills. Learning path opens the modal in path mode and shows the title; "Remove path" clears it.
5. Save with no name and one member: Name and Members show inline errors, one toast. Save a valid group with a path and two materials: members are enrolled and assigned (the Agents tab or the group drawer shows the new assignments due in 14 days).
6. Dark mode and narrow viewport: cards stack, the footer stays pinned, the modal is full screen.
