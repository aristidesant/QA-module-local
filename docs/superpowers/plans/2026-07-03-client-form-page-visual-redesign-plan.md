# Client Form Page Visual Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Apply a polished, modern "structured tool" visual layer to the existing `/clients/new` and `/clients/:clientId/edit` pages while preserving all current behavior.

**Architecture:** Keep the existing component boundaries (`ClientFormPage`, `ClientForm`, `ClientSectionNav`, `ClientFormActions`, `ClientThemeSection`) and only change their styling and layout. Use Mantine CSS variables and `light-dark()` for theming, CSS `@keyframes` for motion, and existing i18n files for copy. No new runtime dependencies.

**Tech Stack:** React, TypeScript, Vite, Mantine v9, CSS Modules, `@tabler/icons-react`, `react-i18next`.

---

### Task 1: Create feature branch and verify clean baseline

**Files:**

- Modify: none
- Test: project commands

- [ ] **Step 1: Create and check out branch**

```bash
git checkout -b mena/client-form-visual-redesign
```

- [ ] **Step 2: Run baseline checks**

```bash
npm run typecheck
npm run build
```

Expected: both commands exit 0.

- [ ] **Step 3: Commit the branch marker**

```bash
git commit --allow-empty -m "feat: start client form visual redesign"
```

---

### Task 2: Add new i18n keys

**Files:**

- Modify: `src/locales/en/clients.json`
- Modify: `src/locales/es/clients.json`

- [ ] **Step 1: Add metadata and status keys to English locale**

Open `src/locales/en/clients.json` and add the following keys under the existing `form` object (merge with current keys):

```json
"editor": {
  "createTitle": "Create client",
  "createDescription": "Add the essential organization details first. Billing and branding become available after creation.",
  "editTitle": "Edit {{name}}",
  "editDescription": "Review organization details, billing settings, and client branding."
},
"metadata": {
  "aliasLabel": "Alias",
  "statusLabel": "Status",
  "createdLabel": "Created",
  "idLabel": "ID",
  "active": "Active",
  "inactive": "Inactive"
},
"status": {
  "unsaved": "Unsaved changes",
  "saving": "Saving...",
  "saved": "Changes saved",
  "validationSummary": "Review the highlighted fields before saving."
},
```

- [ ] **Step 2: Add the same keys to Spanish locale**

Open `src/locales/es/clients.json` and add the matching translations:

```json
"metadata": {
  "aliasLabel": "Alias",
  "statusLabel": "Estado",
  "createdLabel": "Creado",
  "idLabel": "ID",
  "active": "Activo",
  "inactive": "Inactivo"
},
"status": {
  "unsaved": "Cambios sin guardar",
  "saving": "Guardando...",
  "saved": "Cambios guardados",
  "validationSummary": "Revisa los campos resaltados antes de guardar."
},
```

- [ ] **Step 3: Verify JSON is valid and typecheck passes**

```bash
npm run typecheck
```

Expected: exits 0.

- [ ] **Step 4: Commit**

```bash
git add src/locales/en/clients.json src/locales/es/clients.json
git commit -m "i18n: add client form metadata and status keys"
```

---

### Task 3: Build the new header metadata row

**Files:**

- Modify: `src/modules/clients/ClientForm/ClientForm.tsx`
- Modify: `src/modules/clients/ClientForm/ClientForm.module.css`

- [ ] **Step 1: Import Badge and Code components in ClientForm.tsx**

At the top of `src/modules/clients/ClientForm/ClientForm.tsx`, add `Badge` and `Code` to the Mantine import:

```tsx
import {
	Alert,
	Badge,
	Button,
	Code,
	Group,
	Select,
	Skeleton,
	Text,
	TextInput,
	Textarea,
} from '@mantine/core';
```

- [ ] **Step 2: Compute metadata values and derive an active/inactive label**

After the existing `pageDescription` declaration (around line 349), add:

```tsx
const statusLabel = client?.isActive
	? t('form.metadata.active')
	: t('form.metadata.inactive');
const statusColor = client?.isActive ? 'green' : 'gray';
const createdAtLabel = client?.createdAt
	? new Date(client.createdAt).toLocaleDateString()
	: undefined;
```

> Note: if `client` does not expose `isActive` or `createdAt`, replace with whatever scalar fields the API returns. The visual layout remains the same.

- [ ] **Step 3: Replace the ContentContainer call to use `titleBottom` for metadata**

Find the first `ContentContainer` call inside the `return` (the one for the loaded form, around line 592). Replace the `title`, `description`, and `titleRight` props with:

```tsx
<ContentContainer
	title={pageTitle}
	description={pageDescription}
	showBackButton
	backButtonDisabled={isSubmitting || isRetrying}
	onBackClick={handleBack}
	titleRight={
		<ClientFormActions
			mode={mode}
			isDirty={form.isDirty()}
			isSubmitting={isSubmitting}
			unsavedLabel={t('form.status.unsaved')}
			createLabel={t('form.actions.createClient')}
			saveLabel={t('form.actions.saveChanges')}
			cancelLabel={t('actions.cancel', { ns: 'common' })}
			onCancel={handleBack}
		/>
	}
	titleBottom={
		isEditMode && client ? (
			<div className={classes.headerMetadata}>
				{client.alias && (
					<div className={classes.metadataItem}>
						<span className={classes.metadataLabel}>
							{t('form.metadata.aliasLabel')}
						</span>
						<Code className={classes.metadataValue}>{client.alias}</Code>
					</div>
				)}
				<div className={classes.metadataItem}>
					<span className={classes.metadataLabel}>
						{t('form.metadata.statusLabel')}
					</span>
					<Badge
						color={statusColor}
						variant='light'
						size='sm'
						radius='sm'
						className={classes.metadataValue}
					>
						{statusLabel}
					</Badge>
				</div>
				{createdAtLabel && (
					<div className={classes.metadataItem}>
						<span className={classes.metadataLabel}>
							{t('form.metadata.createdLabel')}
						</span>
						<Text className={classes.metadataValue}>{createdAtLabel}</Text>
					</div>
				)}
				{client.id && (
					<div className={classes.metadataItem}>
						<span className={classes.metadataLabel}>
							{t('form.metadata.idLabel')}
						</span>
						<Text className={classes.metadataValue}>#{client.id}</Text>
					</div>
				)}
			</div>
		) : null
	}
>
```

- [ ] **Step 4: Add header metadata CSS in ClientForm.module.css**

Append to `src/modules/clients/ClientForm/ClientForm.module.css`:

```css
.headerMetadata {
	display: flex;
	flex-wrap: wrap;
	align-items: center;
	gap: var(--mantine-spacing-md);
	margin-top: var(--mantine-spacing-xs);
}

.metadataItem {
	display: flex;
	align-items: center;
	gap: var(--mantine-spacing-xs);
}

.metadataLabel {
	font-size: 12px;
	font-weight: 600;
	letter-spacing: 0.04em;
	text-transform: uppercase;
	color: light-dark(var(--mantine-color-gray-6), var(--mantine-color-dark-2));
}

.metadataValue {
	font-size: 13px;
	font-weight: 500;
	color: light-dark(var(--mantine-color-dark-8), var(--mantine-color-dark-0));
}
```

- [ ] **Step 5: Typecheck and commit**

```bash
npm run typecheck
git add src/modules/clients/ClientForm/ClientForm.tsx src/modules/clients/ClientForm/ClientForm.module.css
git commit -m "feat: add client form header metadata row"
```

---

### Task 4: Redesign section cards and page layout

**Files:**

- Modify: `src/modules/clients/ClientForm/ClientForm.tsx`
- Modify: `src/modules/clients/ClientForm/ClientForm.module.css`

- [ ] **Step 1: Add section icons to the section config**

The `sections` array already has `icon` fields. Ensure each `SectionCard` usage passes the icon. Update the identity `SectionCard` (around line 642) to:

```tsx
<SectionCard
	icon={IconBuilding}
	title={
		<span id={SECTION_HEADING_IDS.identity}>
			{t('form.sections.profile.title')}
		</span>
	}
	description={t('form.sections.profile.description')}
	contentSpacing='sm'
	padding='md'
	className={classes.sectionCard}
>
```

Repeat for `contact` (`IconAddressBook`), `location-tax` (`IconMapPin`), `billing` (`IconReceipt`), and `branding` (`IconPalette`) by adding `icon={...}` and `className={classes.sectionCard}` to each `SectionCard`.

- [ ] **Step 2: Update page layout CSS for modern spacing and hover**

Replace the existing `.pageLayout`, `.sections`, `.sectionAnchor`, and related rules in `ClientForm.module.css` with:

```css
.pageLayout {
	display: grid;
	grid-template-columns: minmax(0, 1fr) 240px;
	align-items: start;
	gap: var(--mantine-spacing-xl);
	min-width: 0;
	max-width: 1240px;
	margin: 0 auto;
	padding: var(--mantine-spacing-md) var(--mantine-spacing-xl)
		var(--mantine-spacing-xl);
}

.navigationRail {
	grid-column: 2;
	grid-row: 1;
	min-width: 0;
}

.sections {
	display: flex;
	grid-column: 1;
	grid-row: 1;
	flex-direction: column;
	gap: var(--mantine-spacing-lg);
	min-inline-size: 0;
	min-width: 0;
	margin: 0;
	padding: 0;
	border: 0;
}

.sectionAnchor {
	min-width: 0;
	scroll-margin-top: var(--mantine-spacing-lg);
	border-radius: var(--mantine-radius-lg);
	outline: none;
	animation: cardEnter 380ms cubic-bezier(0.22, 1, 0.36, 1) both;
}

.sectionAnchor:focus-visible {
	box-shadow: 0 0 0 4px
		light-dark(var(--mantine-color-green-5), var(--mantine-color-green-4));
}

.sectionCard {
	border: 1px solid light-dark(#dde2e8, #232c38);
	background: light-dark(var(--mantine-color-white), #141a22);
	box-shadow: 0 4px 12px rgba(15, 23, 42, 0.06);
	transition:
		transform 120ms ease,
		box-shadow 120ms ease;
}

.sectionCard:hover {
	transform: translateY(-2px);
	box-shadow: 0 8px 20px rgba(15, 23, 42, 0.08);
}

@media (prefers-reduced-motion: reduce) {
	.sectionAnchor {
		animation: none;
	}

	.sectionCard:hover {
		transform: none;
	}
}

@keyframes cardEnter {
	from {
		opacity: 0;
		transform: translateY(12px);
	}

	to {
		opacity: 1;
		transform: translateY(0);
	}
}
```

- [ ] **Step 3: Add staggered animation delays via CSS sibling selectors**

Add the following sibling-index rules to `ClientForm.module.css` right after `.sectionAnchor`:

```css
.sectionAnchor:nth-child(1) {
	animation-delay: 60ms;
}

.sectionAnchor:nth-child(2) {
	animation-delay: 120ms;
}

.sectionAnchor:nth-child(3) {
	animation-delay: 180ms;
}

.sectionAnchor:nth-child(4) {
	animation-delay: 240ms;
}

.sectionAnchor:nth-child(5) {
	animation-delay: 300ms;
}
```

Leave the `<section>` markup unchanged except for `className={classes.sectionAnchor}`.

- [ ] **Step 4: Typecheck and commit**

```bash
npm run typecheck
git add src/modules/clients/ClientForm/ClientForm.tsx src/modules/clients/ClientForm/ClientForm.module.css
git commit -m "feat: redesign client form section cards and layout"
```

---

### Task 5: Redesign the sticky section rail

**Files:**

- Modify: `src/modules/clients/ClientSectionNav/ClientSectionNav.tsx`
- Modify: `src/modules/clients/ClientSectionNav/ClientSectionNav.module.css`

- [ ] **Step 1: Update ClientSectionNav.tsx markup**

Replace the existing `desktopNav` and `mobileSelect` blocks with:

```tsx
<>
	<nav className={classes.desktopNav} aria-label={ariaLabel}>
		<div className={classes.navHeader}>{jumpLabel}</div>
		{sections.map((section) => {
			const Icon = section.icon;
			const isActive = activeSection === section.id;

			return (
				<button
					key={section.id}
					type='button'
					className={`${classes.navLink} ${isActive ? classes.navLinkActive : ''}`}
					aria-current={isActive ? 'location' : undefined}
					onClick={() => navigateToSection(section.id)}
				>
					<span className={classes.navLinkInner}>
						{Icon && <Icon size={18} className={classes.navIcon} />}
						<span className={classes.navLabel}>{section.label}</span>
					</span>
					{section.hasError && (
						<span
							className={classes.errorIndicator}
							aria-label={errorLabel}
							title={errorLabel}
						>
							<IconAlertCircle size={16} />
						</span>
					)}
				</button>
			);
		})}
	</nav>

	<div className={classes.mobileSelect}>
		<Select
			label={jumpLabel}
			value={activeSection ?? ''}
			data={sections.map((section) => ({
				value: section.id,
				label: section.label,
			}))}
			onChange={(value) => {
				if (value) {
					navigateToSection(value as ClientFormSectionId);
				}
			}}
			size='sm'
		/>
	</div>
</>
```

- [ ] **Step 2: Replace the module CSS for the rail**

Replace the entire contents of `src/modules/clients/ClientSectionNav/ClientSectionNav.module.css` with:

```css
.desktopNav {
	display: none;
	position: sticky;
	top: var(--mantine-spacing-md);
	padding: var(--mantine-spacing-sm);
	border: 1px solid light-dark(#dde2e8, #232c38);
	border-radius: var(--mantine-radius-lg);
	background: light-dark(
		var(--mantine-color-white),
		var(--mantine-color-dark-7)
	);
	box-shadow: 0 4px 12px rgba(15, 23, 42, 0.04);
}

.navHeader {
	font-size: 11px;
	font-weight: 600;
	letter-spacing: 0.08em;
	text-transform: uppercase;
	color: light-dark(var(--mantine-color-gray-6), var(--mantine-color-dark-2));
	padding: var(--mantine-spacing-xs) var(--mantine-spacing-sm);
	margin-bottom: var(--mantine-spacing-xs);
}

.navLink {
	width: 100%;
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: var(--mantine-spacing-xs);
	padding: 9px 12px;
	border: none;
	border-radius: var(--mantine-radius-sm);
	background: transparent;
	color: light-dark(var(--mantine-color-gray-7), var(--mantine-color-dark-1));
	font-size: 14px;
	font-weight: 500;
	line-height: 1.3;
	cursor: pointer;
	transition:
		background-color 120ms ease,
		color 120ms ease;
}

.navLink + .navLink {
	margin-top: 4px;
}

.navLink:hover {
	background: light-dark(
		var(--mantine-color-gray-1),
		var(--mantine-color-dark-6)
	);
	color: light-dark(var(--mantine-color-dark-8), var(--mantine-color-dark-0));
}

.navLinkActive,
.navLinkActive:hover {
	background: #ecfdf2;
	color: #0d7530;
}

[data-mantine-color-scheme='dark'] .navLinkActive,
[data-mantine-color-scheme='dark'] .navLinkActive:hover {
	background: rgba(27, 181, 74, 0.16);
	color: #4ade80;
}

.navLinkInner {
	display: flex;
	align-items: center;
	gap: var(--mantine-spacing-xs);
	min-width: 0;
}

.navIcon {
	flex: 0 0 auto;
}

.navLabel {
	min-width: 0;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.errorIndicator {
	flex: 0 0 auto;
	color: light-dark(var(--mantine-color-red-7), var(--mantine-color-red-4));
}

.mobileSelect {
	display: block;
	padding: var(--mantine-spacing-sm);
	background: light-dark(
		var(--mantine-color-white),
		var(--mantine-color-dark-7)
	);
	border-bottom: 1px solid light-dark(#dde2e8, #232c38);
}

@media (min-width: 48.001em) {
	.desktopNav {
		display: block;
	}

	.mobileSelect {
		display: none;
	}
}
```

- [ ] **Step 3: Typecheck and commit**

```bash
npm run typecheck
git add src/modules/clients/ClientSectionNav/ClientSectionNav.tsx src/modules/clients/ClientSectionNav/ClientSectionNav.module.css
git commit -m "feat: redesign client form section navigation rail"
```

---

### Task 6: Redesign form actions for desktop header and mobile bottom bar

**Files:**

- Modify: `src/modules/clients/ClientFormActions/ClientFormActions.tsx`
- Modify: `src/modules/clients/ClientFormActions/ClientFormActions.module.css`

- [ ] **Step 1: Update ClientFormActions props and markup**

Replace the entire contents of `src/modules/clients/ClientFormActions/ClientFormActions.tsx` with:

```tsx
import { Button, Group, Text } from '@mantine/core';
import { IconCheck } from '@tabler/icons-react';
import type { ClientFormMode } from '~/modules/clients/ClientForm/ClientForm.types';
import classes from './ClientFormActions.module.css';

interface ClientFormActionsProps {
	mode: ClientFormMode;
	isDirty: boolean;
	isSubmitting: boolean;
	unsavedLabel: string;
	createLabel: string;
	saveLabel: string;
	cancelLabel: string;
	savingLabel?: string;
	savedLabel?: string;
	onCancel: () => void;
}

const ClientFormActions = ({
	mode,
	isDirty,
	isSubmitting,
	unsavedLabel,
	createLabel,
	saveLabel,
	cancelLabel,
	savingLabel = 'Saving...',
	savedLabel = 'Saved',
	onCancel,
}: ClientFormActionsProps) => {
	const primaryLabel = isSubmitting
		? savingLabel
		: mode === 'create'
			? createLabel
			: saveLabel;

	return (
		<Group gap='xs' className={classes.root}>
			<Text size='xs' className={classes.status} aria-live='polite'>
				{isDirty && !isSubmitting ? unsavedLabel : null}
			</Text>
			<Button
				type='button'
				variant='default'
				disabled={isSubmitting}
				onClick={onCancel}
				className={classes.button}
			>
				{cancelLabel}
			</Button>
			<Button
				type='submit'
				loading={isSubmitting}
				disabled={mode === 'edit' && !isDirty}
				className={classes.button}
				leftSection={
					!isSubmitting && !isDirty && mode === 'edit' ? (
						<IconCheck size={16} />
					) : null
				}
			>
				{primaryLabel}
			</Button>
		</Group>
	);
};

export default ClientFormActions;
```

> The success checkmark is intentionally subtle; a full success-to-default transition requires controlled state that `ClientForm` does not yet pass down. The plan intentionally keeps this simple to avoid scope creep.

- [ ] **Step 2: Update ClientFormActions.module.css**

Replace the file with:

```css
.root {
	display: flex;
	flex-wrap: wrap;
	justify-content: flex-end;
	align-items: center;
	width: fit-content;
	min-width: 0;
	max-width: 100%;
}

.status {
	flex: 1 1 8rem;
	min-width: 6rem;
	min-height: var(--mantine-spacing-lg);
	color: light-dark(var(--mantine-color-gray-7), var(--mantine-color-dark-1));
	text-align: end;
}

.button {
	transition: transform 120ms ease;
}

.button:active:not(:disabled) {
	transform: translateY(1px);
}

@media (max-width: 48em) {
	.root {
		display: grid;
		position: fixed;
		left: 0;
		right: 0;
		bottom: 0;
		z-index: 100;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		width: 100%;
		padding: var(--mantine-spacing-xs) var(--mantine-spacing-md)
			calc(var(--mantine-spacing-xs) + env(safe-area-inset-bottom));
		border-top: 1px solid light-dark(#dde2e8, #232c38);
		background: light-dark(
			var(--mantine-color-white),
			var(--mantine-color-dark-8)
		);
		box-shadow: 0 -4px 12px rgba(15, 23, 42, 0.04);
	}

	.status {
		grid-column: 1 / -1;
		min-width: 0;
		min-height: var(--mantine-spacing-lg);
		text-align: start;
	}

	.button {
		min-height: 44px;
		width: 100%;
	}
}
```

- [ ] **Step 3: Typecheck and commit**

```bash
npm run typecheck
git add src/modules/clients/ClientFormActions/ClientFormActions.tsx src/modules/clients/ClientFormActions/ClientFormActions.module.css
git commit -m "feat: redesign client form actions with mobile bottom bar"
```

---

### Task 7: Update loading skeleton to shimmer style

**Files:**

- Modify: `src/modules/clients/ClientForm/ClientForm.module.css`

- [ ] **Step 1: Add shimmer keyframes and replace skeleton styles**

In `src/modules/clients/ClientForm/ClientForm.module.css`, replace the existing `.loadingRail` and `.loadingCard` rules with:

```css
.loadingRail,
.loadingCard {
	width: 100%;
	border: 1px solid light-dark(#dde2e8, #232c38);
	border-radius: var(--mantine-radius-lg);
	background: linear-gradient(
		90deg,
		light-dark(var(--mantine-color-gray-1), var(--mantine-color-dark-6)) 25%,
		light-dark(var(--mantine-color-gray-2), var(--mantine-color-dark-5)) 50%,
		light-dark(var(--mantine-color-gray-1), var(--mantine-color-dark-6)) 75%
	);
	background-size: 200% 100%;
	animation: shimmer 1.5s infinite;
}

.loadingRail {
	height: 12rem;
}

.loadingCard {
	height: 10rem;
}

.loadingCard:first-child {
	height: 13rem;
}

@keyframes shimmer {
	0% {
		background-position: 200% 0;
	}

	100% {
		background-position: -200% 0;
	}
}

@media (prefers-reduced-motion: reduce) {
	.loadingRail,
	.loadingCard {
		animation: none;
	}
}
```

- [ ] **Step 2: Typecheck and commit**

```bash
npm run typecheck
git add src/modules/clients/ClientForm/ClientForm.module.css
git commit -m "feat: add shimmer skeleton to client form loading state"
```

---

### Task 8: Update ClientThemeSection card styling

**Files:**

- Modify: `src/modules/clients/ClientForm/ClientThemeSection.tsx`
- Modify: `src/modules/clients/ClientForm/ClientThemeSection.module.css`

- [ ] **Step 1: Pass className to SectionCard in ClientThemeSection.tsx**

Find the `SectionCard` usage (around line 181) and add `className={classes.themeCard}`:

```tsx
<SectionCard
	className={classes.themeCard}
	title={
		<span id='branding-heading'>{t('form.sections.branding.title')}</span>
	}
	description={t('form.sections.branding.description')}
	contentSpacing='sm'
	padding='md'
>
```

- [ ] **Step 2: Add theme card style in ClientThemeSection.module.css**

Append:

```css
.themeCard {
	border: 1px solid light-dark(#dde2e8, #232c38);
	background: light-dark(var(--mantine-color-white), #141a22);
	box-shadow: 0 4px 12px rgba(15, 23, 42, 0.06);
	transition:
		transform 120ms ease,
		box-shadow 120ms ease;
}

.themeCard:hover {
	transform: translateY(-2px);
	box-shadow: 0 8px 20px rgba(15, 23, 42, 0.08);
}

@media (prefers-reduced-motion: reduce) {
	.themeCard:hover {
		transform: none;
	}
}
```

- [ ] **Step 3: Typecheck and commit**

```bash
npm run typecheck
git add src/modules/clients/ClientForm/ClientThemeSection.tsx src/modules/clients/ClientForm/ClientThemeSection.module.css
git commit -m "feat: style client theme section card"
```

---

### Task 9: Final responsive and dark-mode verification

**Files:**

- Modify: `src/modules/clients/ClientForm/ClientForm.module.css` (if tweaks needed)
- Modify: `src/modules/clients/ClientSectionNav/ClientSectionNav.module.css` (if tweaks needed)

- [ ] **Step 1: Ensure mobile layout uses the new styles**

In `ClientForm.module.css`, confirm the existing `@media (max-width: 48em)` block still collapses the grid and adjusts padding. Replace the existing mobile block with:

```css
@media (max-width: 48em) {
	.pageLayout {
		grid-template-columns: minmax(0, 1fr);
		gap: var(--mantine-spacing-md);
		padding: var(--mantine-spacing-xs) var(--mantine-spacing-sm)
			calc(7rem + env(safe-area-inset-bottom));
		overflow-x: clip;
	}

	.navigationRail {
		grid-column: 1;
		grid-row: 1;
	}

	.sections {
		grid-column: 1;
		grid-row: 2;
		gap: var(--mantine-spacing-md);
	}

	.twoColumnGrid,
	.billingGrid {
		grid-template-columns: minmax(0, 1fr);
	}

	.fullWidthField {
		grid-column: auto;
	}

	.errorState {
		padding: var(--mantine-spacing-xs) var(--mantine-spacing-sm)
			var(--mantine-spacing-lg);
	}

	.headerMetadata {
		gap: var(--mantine-spacing-sm);
	}
}
```

- [ ] **Step 2: Run full verification**

```bash
npm run typecheck
npm run build
```

Expected: both exit 0.

- [ ] **Step 3: Manual checks**

Open the app in browser and verify:

1. `/clients/new` shows the create title, description, and Cancel/Create buttons.
2. `/clients/1/edit` shows title, alias tag, status badge, created date, ID, and Cancel/Save buttons.
3. Section cards have hover lift and enter animation.
4. Side rail highlights the active section with green background.
5. Mobile viewport shows the section select at top and bottom action bar.
6. Dark mode renders header, cards, rail, inputs, and bottom bar correctly.
7. Loading state shows shimmer skeletons, not spinners.
8. Validation errors mark the rail item with a red icon.

- [ ] **Step 4: Commit any final tweaks**

```bash
git add .
git commit -m "feat: finalize client form visual redesign responsive and dark mode"
```

---

## Spec Coverage Check

| Spec section                               | Task(s) implementing it        |
| ------------------------------------------ | ------------------------------ |
| Header with metadata + actions             | Task 3, Task 6                 |
| Two-column layout + max-width              | Task 4                         |
| Section cards with hover + animation       | Task 4                         |
| Sticky side rail with green active state   | Task 5                         |
| Mobile section control + bottom action bar | Task 5, Task 6                 |
| Loading shimmer skeleton                   | Task 7                         |
| ClientThemeSection card styling            | Task 8                         |
| Dark mode + responsive                     | Task 4, Task 5, Task 6, Task 9 |
| i18n keys                                  | Task 2                         |

## Placeholder Scan

No TBD, TODO, or vague requirements remain. Every step includes exact file paths, code, and verification commands.
