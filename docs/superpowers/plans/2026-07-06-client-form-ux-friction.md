# Client Form UX Friction Fixes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Focused single-card create flow at `/clients/new` and a sticky bottom save bar for `/clients/:clientId/edit`.

**Architecture:** All form logic (one `useForm`, validation, mutations, blockers) stays in `ClientForm.tsx`; only the rendered layout branches on `mode`. `ClientFormActions` is reworked from a header-corner action group into a sticky save bar rendered inside the scrollable content, visible only when dirty or submitting. Discard works by keeping `form.initialValues` in sync with the last saved baseline.

**Tech Stack:** React 18, Mantine v9 (`@mantine/core`, `@mantine/form`), react-i18next, CSS modules with Mantine tokens + `light-dark()`.

**Spec:** `docs/superpowers/specs/2026-07-06-client-form-ux-friction-design.md`

**Project rules that override defaults:** No tests (project CLAUDE.md: never create tests unless explicitly requested). Verification = `npm run typecheck` + browser preview. All copy via i18n (en + es). Every style must work in dark and light mode.

**⚠️ Working tree note:** `src/modules/clients/ClientForm/ClientForm.module.css` and `src/modules/clients/ClientSectionNav/ClientSectionNav.module.css` have small pre-existing uncommitted user edits. Do NOT revert them; they will ride along in the commits that touch those files.

---

## File Map

| File                                                                 | Action  | Responsibility                                                                            |
| -------------------------------------------------------------------- | ------- | ----------------------------------------------------------------------------------------- |
| `src/locales/en/clients.json`                                        | Modify  | New keys: discard action, optional-group toggle                                           |
| `src/locales/es/clients.json`                                        | Modify  | Same keys in Spanish                                                                      |
| `src/modules/clients/ClientForm/ClientForm.constants.ts`             | Modify  | `CLIENT_CREATE_OPTIONAL_FIELDS` list                                                      |
| `src/modules/clients/ClientForm/ClientForm.tsx`                      | Modify  | Baseline sync, discard handler, layout branch (create card vs edit grid), save-bar wiring |
| `src/modules/clients/ClientForm/ClientForm.module.css`               | Modify  | Create-layout styles                                                                      |
| `src/modules/clients/ClientFormActions/ClientFormActions.tsx`        | Rewrite | Sticky save bar component                                                                 |
| `src/modules/clients/ClientFormActions/ClientFormActions.module.css` | Rewrite | Sticky bar styles (desktop sticky, mobile fixed)                                          |

No new files. `ClientFormPage`, `ClientSectionNav`, helpers, queries: untouched.

---

### Task 1: i18n keys

**Files:**

- Modify: `src/locales/en/clients.json`
- Modify: `src/locales/es/clients.json`

- [ ] **Step 1: Add English keys**

In `src/locales/en/clients.json`, inside the existing `form.actions` object add `discard`, and add a new `form.createOptional` object as a sibling of `form.actions`:

```json
"actions": {
	"saveChanges": "Save changes",
	"createClient": "Create client",
	"discard": "Discard"
},
"createOptional": {
	"toggle": "Contact & location",
	"optional": "Optional",
	"hint": "You can also add these after creating the client."
},
```

- [ ] **Step 2: Add Spanish keys**

In `src/locales/es/clients.json`, mirror the structure:

```json
"actions": {
	"saveChanges": "Guardar cambios",
	"createClient": "Crear cliente",
	"discard": "Descartar"
},
"createOptional": {
	"toggle": "Contacto y ubicación",
	"optional": "Opcional",
	"hint": "También puedes agregarlos después de crear el cliente."
},
```

- [ ] **Step 3: Validate JSON parses**

Run: `python3 -c "import json; json.load(open('src/locales/en/clients.json')); json.load(open('src/locales/es/clients.json')); print('ok')"`
Expected: `ok`

- [ ] **Step 4: Commit**

```bash
git add src/locales/en/clients.json src/locales/es/clients.json
git commit -m "feat(client-form): add i18n keys for discard and optional create group"
```

---

### Task 2: Saved-baseline sync + discard handler

Make `form.initialValues` always equal the last saved baseline so `form.reset()` restores saved data (not an empty form).

**Files:**

- Modify: `src/modules/clients/ClientForm/ClientForm.tsx`

- [ ] **Step 1: Sync initial values on hydrate**

In the hydrate effect (~line 191), change:

```tsx
const hydratedValues = hydrateClientFormValues(client, clientTheme);
form.setValues(hydratedValues);
form.resetDirty(hydratedValues);
```

to:

```tsx
const hydratedValues = hydrateClientFormValues(client, clientTheme);
form.setInitialValues(hydratedValues);
form.setValues(hydratedValues);
form.resetDirty(hydratedValues);
```

- [ ] **Step 2: Sync initial values after partial save**

In `handleSubmit`'s theme-patch `catch` block (~line 468), change:

```tsx
form.resetDirty(buildCoreSavedBaseline(values, clientTheme));
```

to:

```tsx
const partialBaseline = buildCoreSavedBaseline(values, clientTheme);
form.setInitialValues(partialBaseline);
form.resetDirty(partialBaseline);
```

- [ ] **Step 3: Sync initial values after full edit save**

Just after the theme-patch block, change:

```tsx
form.resetDirty(values);
setFailedSection(null);
```

to:

```tsx
form.setInitialValues(values);
form.resetDirty(values);
setFailedSection(null);
```

(Leave the create-path `form.resetDirty(values)` before navigation as is — the component unmounts.)

- [ ] **Step 4: Add discard handler**

Below `handleBack` (~line 436), add:

```tsx
const handleDiscard = () => {
	form.reset();
	setFailedSection(null);
	setValidationSummary('');
	setSaveAnnouncement('');
};
```

`form.reset()` restores `initialValues` (now the saved baseline), clears errors, and clears dirty state.

- [ ] **Step 5: Typecheck**

Run: `npm run typecheck`
Expected: exit 0 (note: `handleDiscard` is unused until Task 3 — if the linter flags unused vars during typecheck, proceed; it is consumed in the next task's same-session commit only if needed. If `npm run typecheck` fails on unused local, defer this step's commit and fold it into Task 3's commit.)

- [ ] **Step 6: Commit**

```bash
git add src/modules/clients/ClientForm/ClientForm.tsx
git commit -m "feat(client-form): keep form baseline in sync with last saved values"
```

---

### Task 3: Sticky save bar (rework ClientFormActions + wire into edit layout)

**Files:**

- Rewrite: `src/modules/clients/ClientFormActions/ClientFormActions.tsx`
- Rewrite: `src/modules/clients/ClientFormActions/ClientFormActions.module.css`
- Modify: `src/modules/clients/ClientForm/ClientForm.tsx`

- [ ] **Step 1: Rewrite the component**

Replace the entire contents of `src/modules/clients/ClientFormActions/ClientFormActions.tsx` with:

```tsx
import { Button, Text } from '@mantine/core';
import classes from './ClientFormActions.module.css';

interface ClientFormActionsProps {
	visible: boolean;
	isSubmitting: boolean;
	unsavedLabel: string;
	saveLabel: string;
	savingLabel: string;
	discardLabel: string;
	onDiscard: () => void;
}

const ClientFormActions = ({
	visible,
	isSubmitting,
	unsavedLabel,
	saveLabel,
	savingLabel,
	discardLabel,
	onDiscard,
}: ClientFormActionsProps) => {
	if (!visible) return null;

	return (
		<div className={classes.saveBar}>
			<Text size='sm' className={classes.status} aria-live='polite'>
				<span className={classes.dot} aria-hidden='true' />
				{unsavedLabel}
			</Text>
			<div className={classes.buttons}>
				<Button
					type='button'
					variant='default'
					disabled={isSubmitting}
					onClick={onDiscard}
					className={classes.button}
				>
					{discardLabel}
				</Button>
				<Button type='submit' loading={isSubmitting} className={classes.button}>
					{isSubmitting ? savingLabel : saveLabel}
				</Button>
			</div>
		</div>
	);
};

export default ClientFormActions;
```

- [ ] **Step 2: Rewrite the styles**

Replace the entire contents of `src/modules/clients/ClientFormActions/ClientFormActions.module.css` with:

```css
.saveBar {
	position: sticky;
	bottom: 0;
	z-index: 20;
	display: flex;
	flex-wrap: wrap;
	align-items: center;
	justify-content: space-between;
	gap: var(--mantine-spacing-sm);
	max-width: 1240px;
	margin: 0 auto;
	padding: var(--mantine-spacing-sm) var(--mantine-spacing-lg);
	border: 1px solid var(--surface-border);
	border-bottom: 0;
	border-radius: var(--mantine-radius-lg) var(--mantine-radius-lg) 0 0;
	background: light-dark(
		var(--mantine-color-white),
		var(--mantine-color-dark-8)
	);
	box-shadow: light-dark(
		0 -8px 24px rgba(0, 0, 0, 0.08),
		0 -8px 24px rgba(0, 0, 0, 0.45)
	);
}

@media (prefers-reduced-motion: no-preference) {
	.saveBar {
		animation: barEnter 240ms cubic-bezier(0.22, 1, 0.36, 1);
	}

	.button {
		transition: transform 120ms cubic-bezier(0.22, 1, 0.36, 1);
	}
}

@keyframes barEnter {
	from {
		transform: translateY(100%);
		opacity: 0;
	}

	to {
		transform: translateY(0);
		opacity: 1;
	}
}

.status {
	display: inline-flex;
	align-items: center;
	min-width: 0;
	color: light-dark(var(--mantine-color-gray-7), var(--mantine-color-dark-1));
}

.dot {
	display: inline-block;
	width: 8px;
	height: 8px;
	margin-right: var(--mantine-spacing-xs);
	border-radius: 50%;
	background: light-dark(
		var(--mantine-color-yellow-6),
		var(--mantine-color-yellow-4)
	);
}

.buttons {
	display: flex;
	gap: var(--mantine-spacing-xs);
}

.button:active:not(:disabled) {
	transform: translateY(1px);
}

@media (max-width: 48em) {
	.saveBar {
		position: fixed;
		left: 0;
		right: 0;
		bottom: 0;
		z-index: var(--mantine-z-index-app);
		max-width: none;
		border: 0;
		border-top: 1px solid var(--surface-border);
		border-radius: 0;
		padding: var(--mantine-spacing-xs) var(--mantine-spacing-md)
			calc(var(--mantine-spacing-xs) + env(safe-area-inset-bottom));
	}

	.status {
		flex: 1 1 100%;
	}

	.buttons {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		width: 100%;
	}

	.button {
		min-height: 44px;
		width: 100%;
	}
}
```

- [ ] **Step 3: Rewire ClientForm — remove header actions, add bar after the grid**

In `src/modules/clients/ClientForm/ClientForm.tsx`:

3a. Delete the whole `titleRight={...}` prop (the `<ClientFormActions ... />` block, ~lines 607–619) from the main-return `<ContentContainer>`.

3b. Immediately after the closing `</div>` of `classes.pageLayout` (before `</ContentContainer>`), add:

```tsx
{
	isEditMode && (
		<ClientFormActions
			visible={form.isDirty() || isSubmitting}
			isSubmitting={isSubmitting}
			unsavedLabel={t('form.status.unsaved')}
			saveLabel={t('form.actions.saveChanges')}
			savingLabel={t('form.status.saving')}
			discardLabel={t('form.actions.discard')}
			onDiscard={handleDiscard}
		/>
	);
}
```

- [ ] **Step 4: Typecheck**

Run: `npm run typecheck`
Expected: exit 0. (Create mode temporarily has no visible submit button in the UI — restored in Task 4; acceptable mid-plan state, do not ship between tasks.)

- [ ] **Step 5: Commit**

```bash
git add src/modules/clients/ClientFormActions/ src/modules/clients/ClientForm/ClientForm.tsx
git commit -m "feat(client-form): replace header actions with sticky save bar in edit mode"
```

---

### Task 4: Focused create card

**Files:**

- Modify: `src/modules/clients/ClientForm/ClientForm.constants.ts`
- Modify: `src/modules/clients/ClientForm/ClientForm.tsx`
- Modify: `src/modules/clients/ClientForm/ClientForm.module.css`

- [ ] **Step 1: Add optional-field list to constants**

At the end of `src/modules/clients/ClientForm/ClientForm.constants.ts`:

```ts
export const CLIENT_CREATE_OPTIONAL_FIELDS: readonly ClientFormField[] = [
	'email',
	'phone',
	'address',
	'rnc',
];
```

- [ ] **Step 2: New imports + state in ClientForm.tsx**

2a. Extend the `@mantine/core` import with `Badge` (already imported), `Collapse`, and `UnstyledButton`; extend the tabler import with `IconChevronRight`:

```tsx
import {
	Alert,
	Badge,
	Button,
	Code,
	Collapse,
	Group,
	Select,
	Text,
	TextInput,
	Textarea,
	UnstyledButton,
} from '@mantine/core';
```

```tsx
import {
	IconAddressBook,
	IconAlertTriangle,
	IconBuilding,
	IconChevronRight,
	IconInfoCircle,
	IconMapPin,
	IconPalette,
	IconReceipt,
} from '@tabler/icons-react';
```

2b. Import the new constant (extend existing constants import):

```tsx
import {
	CLIENT_CREATE_OPTIONAL_FIELDS,
	CLIENT_FORM_FIELD_IDS,
	CLIENT_FORM_FIELD_ORDER,
	CLIENT_FORM_ID,
	CLIENT_FORM_INITIAL_VALUES,
	CLIENT_SECTION_FIELDS,
} from './ClientForm.constants';
```

2c. Add state next to `isAliasManuallyEdited`:

```tsx
const [isOptionalOpen, setIsOptionalOpen] = useState(false);
```

2d. Add an effect (after the alias-suggestion effect) that auto-opens the group when a hidden field errors:

```tsx
const hasOptionalFieldError = CLIENT_CREATE_OPTIONAL_FIELDS.some((field) =>
	Boolean(form.errors[field])
);

useEffect(() => {
	if (!isEditMode && hasOptionalFieldError) {
		setIsOptionalOpen(true);
	}
}, [hasOptionalFieldError, isEditMode]);
```

- [ ] **Step 3: Branch the layout**

In the main return, wrap the current `<div className={classes.pageLayout}>...</div>` so it only renders in edit mode, and add the create layout for create mode. The structure inside `<ContentContainer>` becomes:

```tsx
{failedSection === 'branding' && (
	/* existing Alert unchanged */
)}
{isEditMode ? (
	<>
		<div className={classes.pageLayout}>
			{/* existing navigationRail + fieldset content, unchanged */}
		</div>
		<ClientFormActions
			visible={form.isDirty() || isSubmitting}
			isSubmitting={isSubmitting}
			unsavedLabel={t('form.status.unsaved')}
			saveLabel={t('form.actions.saveChanges')}
			savingLabel={t('form.status.saving')}
			discardLabel={t('form.actions.discard')}
			onDiscard={handleDiscard}
		/>
	</>
) : (
	<div className={classes.createLayout}>
		<SectionCard
			icon={IconBuilding}
			title={t('form.sections.profile.title')}
			description={t('form.sections.profile.description')}
			contentSpacing='sm'
			padding='md'
			className={classes.sectionCard}
			footer={
				<div className={classes.createFooter}>
					<Button type='submit' fullWidth loading={isSubmitting}>
						{isSubmitting
							? t('form.status.saving')
							: t('form.actions.createClient')}
					</Button>
					<Button
						type='button'
						variant='subtle'
						color='gray'
						fullWidth
						disabled={isSubmitting}
						onClick={handleBack}
					>
						{t('actions.cancel', { ns: 'common' })}
					</Button>
				</div>
			}
		>
			<fieldset
				className={classes.createFields}
				disabled={isSubmitting}
				aria-busy={isSubmitting}
			>
				<TextInput
					id={CLIENT_FORM_FIELD_IDS.name}
					required
					label={t('form.fields.name.label')}
					placeholder={t('form.fields.name.placeholder')}
					size='sm'
					{...form.getInputProps('name')}
				/>
				<TextInput
					id={CLIENT_FORM_FIELD_IDS.alias}
					required
					label={t('form.fields.alias.label')}
					placeholder={t('form.fields.alias.placeholder')}
					description={t('form.fields.alias.description')}
					size='sm'
					value={form.values.alias}
					onChange={(event) => {
						setIsAliasManuallyEdited(true);
						form.setFieldValue('alias', event.currentTarget.value);
					}}
					error={form.errors.alias}
				/>
				<Textarea
					id={CLIENT_FORM_FIELD_IDS.description}
					label={t('form.fields.description.label')}
					placeholder={t('form.fields.description.placeholder')}
					size='sm'
					minRows={3}
					{...form.getInputProps('description')}
				/>
				<div className={classes.createOptionalGroup}>
					<UnstyledButton
						type='button'
						className={classes.optionalToggle}
						onClick={() => setIsOptionalOpen((open) => !open)}
						aria-expanded={isOptionalOpen}
						aria-controls='client-create-optional-fields'
					>
						<IconChevronRight
							size={16}
							className={`${classes.optionalChevron} ${
								isOptionalOpen ? classes.optionalChevronOpen : ''
							}`}
							aria-hidden='true'
						/>
						<span className={classes.optionalToggleLabel}>
							{t('form.createOptional.toggle')}
						</span>
						<Badge variant='light' color='gray' size='sm' radius='sm'>
							{t('form.createOptional.optional')}
						</Badge>
					</UnstyledButton>
					<Collapse
						in={isOptionalOpen}
						id='client-create-optional-fields'
						transitionDuration={reducedMotion ? 0 : 200}
					>
						<div className={classes.createOptionalFields}>
							<Text size='xs' c='dimmed'>
								{t('form.createOptional.hint')}
							</Text>
							<TextInput
								id={CLIENT_FORM_FIELD_IDS.email}
								label={t('form.fields.email.label')}
								placeholder={t('form.fields.email.placeholder')}
								size='sm'
								{...form.getInputProps('email')}
							/>
							<TextInput
								id={CLIENT_FORM_FIELD_IDS.phone}
								label={t('form.fields.phone.label')}
								placeholder={t('form.fields.phone.placeholder')}
								size='sm'
								{...form.getInputProps('phone')}
							/>
							<TextInput
								id={CLIENT_FORM_FIELD_IDS.address}
								label={t('form.fields.address.label')}
								placeholder={t('form.fields.address.placeholder')}
								size='sm'
								{...form.getInputProps('address')}
							/>
							<TextInput
								id={CLIENT_FORM_FIELD_IDS.rnc}
								label={t('form.fields.rnc.label')}
								placeholder={t('form.fields.rnc.placeholder')}
								size='sm'
								{...form.getInputProps('rnc')}
							/>
						</div>
					</Collapse>
				</div>
			</fieldset>
		</SectionCard>
	</div>
)}
```

Note: this moves the Task 3 `<ClientFormActions />` inside the edit-mode fragment (it must not render on create).

3b. In the validation-failure branch of `handleSubmit` (the second `form.onSubmit` callback), open the optional group before focusing, by adding as the first line:

```tsx
(errors) => {
	if (!isEditMode) setIsOptionalOpen(true);
	setSaveAnnouncement('');
	/* rest unchanged */
```

- [ ] **Step 4: Create-layout CSS**

Append to `src/modules/clients/ClientForm/ClientForm.module.css`:

```css
.createLayout {
	max-width: 560px;
	margin: 0 auto;
	padding: var(--mantine-spacing-md) var(--mantine-spacing-md)
		var(--mantine-spacing-xl);
}

.createLayout .sectionCard {
	border: 1px solid var(--surface-border);
	background: light-dark(
		var(--mantine-color-white),
		var(--mantine-color-dark-8)
	);
	box-shadow: var(--mantine-shadow-md);
}

.createFields {
	display: flex;
	flex-direction: column;
	gap: var(--mantine-spacing-sm);
	min-width: 0;
	margin: 0;
	padding: 0;
	border: 0;
}

.createOptionalGroup {
	margin-top: var(--mantine-spacing-xs);
	border-top: 1px solid var(--surface-border);
	padding-top: var(--mantine-spacing-sm);
}

.optionalToggle {
	display: flex;
	align-items: center;
	gap: var(--mantine-spacing-xs);
	width: 100%;
	color: light-dark(var(--mantine-color-gray-7), var(--mantine-color-dark-1));
}

.optionalToggle:hover .optionalToggleLabel {
	color: light-dark(var(--mantine-color-dark-8), var(--mantine-color-dark-0));
}

.optionalToggleLabel {
	font-size: var(--mantine-font-size-sm);
	font-weight: 600;
}

.optionalChevron {
	flex-shrink: 0;
	transition: transform 160ms ease;
}

.optionalChevronOpen {
	transform: rotate(90deg);
}

@media (prefers-reduced-motion: reduce) {
	.optionalChevron {
		transition: none;
	}
}

.createOptionalFields {
	display: flex;
	flex-direction: column;
	gap: var(--mantine-spacing-sm);
	padding-top: var(--mantine-spacing-sm);
}

.createFooter {
	display: flex;
	flex-direction: column;
	gap: var(--mantine-spacing-xs);
}
```

- [ ] **Step 5: Typecheck**

Run: `npm run typecheck`
Expected: exit 0.

- [ ] **Step 6: Commit**

```bash
git add src/modules/clients/ClientForm/
git commit -m "feat(client-form): focused single-card create layout with optional group"
```

---

### Task 5: Verification (preview)

- [ ] **Step 1: Build**

Run: `npm run build`
Expected: exit 0.

- [ ] **Step 2: Preview `/clients/new`**

Start dev server via preview tooling. Verify:

- Centered narrow card, no nav rail, no header-corner buttons.
- Name/alias/description visible; "Contact & location — Optional" toggle collapsed.
- Toggle expands/collapses; chevron rotates.
- Enter invalid email while group collapsed → submit → group auto-opens, focus lands on email.
- Empty name/alias → submit → errors + focus first invalid.
- Create button full width; Cancel below.

- [ ] **Step 3: Preview `/clients/:id/edit`**

Verify:

- No save buttons in header.
- Pristine form → no bar. Type in any field → bar slides in at bottom with dot + "Unsaved changes" + Discard + Save.
- Discard → values revert to saved data, bar disappears.
- Save → success notification, bar disappears.
- Scroll mid-form with dirty state → bar stays pinned at viewport bottom.

- [ ] **Step 4: Dark mode + mobile**

- Toggle dark color scheme: card, bar, toggle, dot all keep contrast.
- Resize to 375px: bar becomes full-width fixed with 2-column buttons and safe-area padding; create card fits without horizontal scroll.

- [ ] **Step 5: Screenshot proof to user**

Share screenshots of create (light) and edit-with-bar (dark).
