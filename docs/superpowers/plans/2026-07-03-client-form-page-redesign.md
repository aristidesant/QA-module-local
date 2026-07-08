# Client Form Page Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace modal-based client creation and editing with responsive dedicated pages that expose continuous form sections, persistent actions, section-aware validation, and safe dirty-state handling.

**Architecture:** Keep the existing client APIs and React Query hooks. Add a thin routed `ClientFormPage`, move navigation from the clients table into React Router, and refactor `ClientForm` into a full-height page form that owns Mantine Form state, mutation sequencing, dirty baselines, and page states. Add focused local components for section navigation and persistent actions so layout concerns remain separate from API and validation logic.

**Tech Stack:** React 19, TypeScript 6, React Router v7, Mantine v9, TanStack React Query v5, CSS Modules, react-i18next, Tabler Icons

**Design spec:** `docs/superpowers/specs/2026-07-03-client-form-page-redesign-design.md`

**Testing constraint:** Do not create automated tests. Validate with `typecheck`, production build, and the manual matrix in Task 7, as required by the repository instructions.

---

## File Map

### Create

- `src/modules/clients/ClientFormPage/ClientFormPage.tsx`: resolve route mode and client ID, then render the form page.
- `src/modules/clients/ClientFormPage/ClientFormPage.module.css`: full-height routed-page shell.
- `src/modules/clients/ClientFormPage/index.ts`: barrel export.
- `src/modules/clients/ClientForm/ClientForm.types.ts`: form values, modes, section IDs, and navigation item types.
- `src/modules/clients/ClientForm/ClientForm.constants.ts`: initial values, section field maps, field focus order, and DOM IDs.
- `src/modules/clients/ClientForm/ClientForm.helpers.ts`: hydration, payload, theme-patch, and partial-save baseline helpers.
- `src/modules/clients/ClientSectionNav/ClientSectionNav.tsx`: active-section observation, anchor navigation, and error markers.
- `src/modules/clients/ClientSectionNav/ClientSectionNav.module.css`: desktop rail and mobile selector styles.
- `src/modules/clients/ClientSectionNav/index.ts`: barrel export.
- `src/modules/clients/ClientFormActions/ClientFormActions.tsx`: dirty state, cancel, and submit controls.
- `src/modules/clients/ClientFormActions/ClientFormActions.module.css`: desktop header and mobile sticky-action styles.
- `src/modules/clients/ClientFormActions/index.ts`: barrel export.

### Modify

- `src/routes.tsx`: register `/clients/new` and `/clients/:clientId/edit` under the existing clients guard.
- `src/modules/clients/ClientsPage/ClientsPage.tsx`: navigate to routed forms instead of opening create/edit modals.
- `src/modules/clients/ClientForm/ClientForm.tsx`: convert the modal form into the routed page experience.
- `src/modules/clients/ClientForm/ClientForm.module.css`: replace modal shell styles with page, section, rail, and responsive styles.
- `src/modules/clients/ClientForm/ClientThemeSection.tsx`: add stable field IDs for validation focus.
- `src/modules/clients/ClientForm/ClientThemeSection.module.css`: make logo controls responsive and theme-safe inside the full page.
- `src/modules/clients/index.ts`: export the routed page.
- `src/locales/en/clients.json`: add routed-page, navigation, dirty-state, validation-summary, and partial-save copy.
- `src/locales/es/clients.json`: add the matching Spanish copy.

---

### Task 1: Define stable client-form contracts and transformation helpers

**Files:**

- Create: `src/modules/clients/ClientForm/ClientForm.types.ts`
- Create: `src/modules/clients/ClientForm/ClientForm.constants.ts`
- Create: `src/modules/clients/ClientForm/ClientForm.helpers.ts`
- Reference: `src/models/ClientModel.ts`
- Reference: `src/models/ClientTheme.ts`

- [ ] **Step 1: Move the form value and section contracts into `ClientForm.types.ts`**

```ts
import type { TablerIcon } from '@tabler/icons-react';

export type ClientFormMode = 'create' | 'edit';

export interface ClientFormValues {
	name: string;
	alias: string;
	description: string;
	email: string;
	phone: string;
	address: string;
	rnc: string;
	userId: number | null;
	countryId: number | null;
	website: string;
	pocUserId: number | null;
	invoiceTemplateFileId: number | null;
	brandName: string;
	primaryColor: string;
	secondaryColor: string;
	logoFileId: number | null;
	logoUrl: string | null;
}

export type ClientFormField = keyof ClientFormValues;

export type ClientFormSectionId =
	| 'identity'
	| 'contact'
	| 'location-tax'
	| 'billing'
	| 'branding';

export interface ClientFormSectionItem {
	id: ClientFormSectionId;
	label: string;
	icon: TablerIcon;
	hasError: boolean;
}
```

- [ ] **Step 2: Add form defaults, stable DOM IDs, section field ownership, and focus order to `ClientForm.constants.ts`**

```ts
import {
	DEFAULT_PRIMARY_COLOR,
	DEFAULT_SECONDARY_COLOR,
} from '~/utils/clientTheme';
import type {
	ClientFormField,
	ClientFormSectionId,
	ClientFormValues,
} from './ClientForm.types';

export const CLIENT_FORM_ID = 'client-form';

export const CLIENT_FORM_INITIAL_VALUES: ClientFormValues = {
	name: '',
	alias: '',
	description: '',
	email: '',
	phone: '',
	address: '',
	rnc: '',
	userId: null,
	countryId: null,
	website: '',
	pocUserId: null,
	invoiceTemplateFileId: null,
	brandName: '',
	primaryColor: DEFAULT_PRIMARY_COLOR,
	secondaryColor: DEFAULT_SECONDARY_COLOR,
	logoFileId: null,
	logoUrl: null,
};

export const CLIENT_FORM_FIELD_IDS: Record<ClientFormField, string> = {
	name: 'client-name',
	alias: 'client-alias',
	description: 'client-description',
	email: 'client-email',
	phone: 'client-phone',
	address: 'client-address',
	rnc: 'client-rnc',
	userId: 'client-user-id',
	countryId: 'client-country-id',
	website: 'client-website',
	pocUserId: 'client-poc-user-id',
	invoiceTemplateFileId: 'client-invoice-template-file-id',
	brandName: 'client-brand-name',
	primaryColor: 'client-primary-color',
	secondaryColor: 'client-secondary-color',
	logoFileId: 'client-logo-file-id',
	logoUrl: 'client-logo-url',
};

export const CLIENT_FORM_FIELD_ORDER: ClientFormField[] = [
	'name',
	'alias',
	'description',
	'email',
	'phone',
	'address',
	'rnc',
	'website',
	'pocUserId',
	'invoiceTemplateFileId',
	'brandName',
	'primaryColor',
	'secondaryColor',
];

export const CLIENT_SECTION_FIELDS: Record<
	ClientFormSectionId,
	readonly ClientFormField[]
> = {
	identity: ['name', 'alias', 'description'],
	contact: ['email', 'phone'],
	'location-tax': ['address', 'rnc'],
	billing: ['website', 'pocUserId', 'invoiceTemplateFileId'],
	branding: ['brandName', 'primaryColor', 'secondaryColor', 'logoFileId'],
};
```

- [ ] **Step 3: Extract hydration and payload builders into `ClientForm.helpers.ts`**

Implement these named exports so `ClientForm.tsx` contains orchestration rather than object-shaping logic:

```ts
import type {
	ClientModel,
	CreateClientRequest,
	UpdateClientRequest,
} from '~/models/ClientModel';
import type {
	ClientThemeModel,
	UpdateClientThemeRequest,
} from '~/models/ClientTheme';
import {
	DEFAULT_PRIMARY_COLOR,
	DEFAULT_SECONDARY_COLOR,
} from '~/utils/clientTheme';
import { CLIENT_FORM_INITIAL_VALUES } from './ClientForm.constants';
import type { ClientFormValues } from './ClientForm.types';

export const hydrateClientFormValues = (
	client: ClientModel,
	theme?: ClientThemeModel
): ClientFormValues => ({
	...CLIENT_FORM_INITIAL_VALUES,
	name: client.name,
	alias: client.alias ?? '',
	description: client.description ?? '',
	email: client.email ?? '',
	phone: client.phone ?? '',
	address: client.address ?? '',
	rnc: client.rnc ?? '',
	userId: client.userId ?? null,
	countryId: client.countryId ?? null,
	website: client.website ?? '',
	pocUserId: client.pocUserId ?? null,
	invoiceTemplateFileId: client.invoiceTemplateFileId ?? null,
	brandName: theme?.brandName ?? '',
	primaryColor: theme?.primaryColor || DEFAULT_PRIMARY_COLOR,
	secondaryColor: theme?.secondaryColor || DEFAULT_SECONDARY_COLOR,
	logoFileId: theme?.logoFileId ?? null,
	logoUrl: theme?.logoUrl ?? null,
});

export const buildCreateClientPayload = (
	values: ClientFormValues
): CreateClientRequest => ({
	name: values.name.trim(),
	alias: values.alias.trim(),
	description: values.description || undefined,
	email: values.email || undefined,
	phone: values.phone || undefined,
	address: values.address || undefined,
	rnc: values.rnc || undefined,
	userId: values.userId,
	countryId: values.countryId,
});

export const buildUpdateClientPayload = (
	values: ClientFormValues
): UpdateClientRequest => ({
	...buildCreateClientPayload(values),
	website: values.website || null,
	pocUserId: values.pocUserId,
	invoiceTemplateFileId: values.invoiceTemplateFileId,
});

export const buildClientThemePatch = (
	values: ClientFormValues,
	original?: ClientThemeModel
): UpdateClientThemeRequest | null => {
	const patch: UpdateClientThemeRequest = {};
	const nextBrandName = values.brandName.trim() || null;

	if (nextBrandName !== (original?.brandName ?? null)) {
		patch.brandName = nextBrandName;
	}
	if ((values.primaryColor || null) !== (original?.primaryColor ?? null)) {
		patch.primaryColor = values.primaryColor || null;
	}
	if ((values.secondaryColor || null) !== (original?.secondaryColor ?? null)) {
		patch.secondaryColor = values.secondaryColor || null;
	}
	if (values.logoFileId !== (original?.logoFileId ?? null)) {
		patch.logoFileId = values.logoFileId;
	}

	return Object.keys(patch).length > 0 ? patch : null;
};

export const buildCoreSavedBaseline = (
	values: ClientFormValues,
	originalTheme?: ClientThemeModel
): ClientFormValues => ({
	...values,
	brandName: originalTheme?.brandName ?? '',
	primaryColor: originalTheme?.primaryColor || DEFAULT_PRIMARY_COLOR,
	secondaryColor: originalTheme?.secondaryColor || DEFAULT_SECONDARY_COLOR,
	logoFileId: originalTheme?.logoFileId ?? null,
	logoUrl: originalTheme?.logoUrl ?? null,
});
```

- [ ] **Step 4: Run typecheck before wiring consumers**

Run: `rtk npm run typecheck`

Expected: the new modules compile without TypeScript errors and have no runtime consumers yet.

- [ ] **Step 5: Commit the form contracts**

```bash
rtk git add src/modules/clients/ClientForm/ClientForm.types.ts src/modules/clients/ClientForm/ClientForm.constants.ts src/modules/clients/ClientForm/ClientForm.helpers.ts
rtk git commit -m "refactor: define client form contracts"
```

### Task 2: Build section navigation and persistent action components

**Files:**

- Create: `src/modules/clients/ClientSectionNav/ClientSectionNav.tsx`
- Create: `src/modules/clients/ClientSectionNav/ClientSectionNav.module.css`
- Create: `src/modules/clients/ClientSectionNav/index.ts`
- Create: `src/modules/clients/ClientFormActions/ClientFormActions.tsx`
- Create: `src/modules/clients/ClientFormActions/ClientFormActions.module.css`
- Create: `src/modules/clients/ClientFormActions/index.ts`

- [ ] **Step 1: Implement `ClientSectionNav` with active-section observation**

The component receives only translated section items and an accessible label. It owns the current active section and observes the actual section wrappers by ID.

```tsx
import { useEffect, useMemo, useState } from 'react';
import { NavLink, Select, Stack, Text, ThemeIcon } from '@mantine/core';
import { useReducedMotion } from '@mantine/hooks';
import { IconAlertCircle } from '@tabler/icons-react';
import type {
	ClientFormSectionId,
	ClientFormSectionItem,
} from '../ClientForm/ClientForm.types';
import classes from './ClientSectionNav.module.css';

interface ClientSectionNavProps {
	sections: ClientFormSectionItem[];
	ariaLabel: string;
	jumpLabel: string;
	errorLabel: string;
}

const ClientSectionNav: React.FC<ClientSectionNavProps> = ({
	sections,
	ariaLabel,
	jumpLabel,
	errorLabel,
}) => {
	const reduceMotion = useReducedMotion();
	const [activeSection, setActiveSection] = useState<ClientFormSectionId>(
		sections[0]?.id ?? 'identity'
	);

	useEffect(() => {
		const elements = sections
			.map((section) => document.getElementById(section.id))
			.filter((element): element is HTMLElement => Boolean(element));

		const observer = new IntersectionObserver(
			(entries) => {
				const visible = entries
					.filter((entry) => entry.isIntersecting)
					.sort(
						(left, right) =>
							left.boundingClientRect.top - right.boundingClientRect.top
					);
				const next = visible[0]?.target.id as ClientFormSectionId | undefined;
				if (next) setActiveSection(next);
			},
			{ rootMargin: '-15% 0px -70% 0px', threshold: [0, 0.25, 0.5] }
		);

		elements.forEach((element) => observer.observe(element));
		return () => observer.disconnect();
	}, [sections]);

	const options = useMemo(
		() => sections.map(({ id, label }) => ({ value: id, label })),
		[sections]
	);

	const goToSection = (sectionId: ClientFormSectionId | null) => {
		if (!sectionId) return;
		const section = document.getElementById(sectionId);
		if (!section) return;
		section.scrollIntoView({
			behavior: reduceMotion ? 'auto' : 'smooth',
			block: 'start',
		});
		section.focus({ preventScroll: true });
		setActiveSection(sectionId);
	};

	return (
		<>
			<nav className={classes.desktopNav} aria-label={ariaLabel}>
				<Stack gap={4}>
					{sections.map(({ id, label, icon: Icon, hasError }) => (
						<NavLink
							key={id}
							label={label}
							leftSection={<Icon size={17} />}
							rightSection={
								hasError ? (
									<ThemeIcon
										variant='transparent'
										color='red'
										size='sm'
										aria-label={errorLabel}
									>
										<IconAlertCircle size={16} />
									</ThemeIcon>
								) : undefined
							}
							active={activeSection === id}
							aria-current={activeSection === id ? 'location' : undefined}
							onClick={() => goToSection(id)}
						/>
					))}
				</Stack>
			</nav>
			<div className={classes.mobileNav}>
				<Text
					component='label'
					htmlFor='client-section-jump'
					size='sm'
					fw={600}
				>
					{jumpLabel}
				</Text>
				<Select
					id='client-section-jump'
					data={options}
					value={activeSection}
					onChange={(value) => goToSection(value as ClientFormSectionId | null)}
					allowDeselect={false}
					size='sm'
				/>
			</div>
		</>
	);
};

export default ClientSectionNav;
```

- [ ] **Step 2: Add the section-nav barrel export**

```ts
export { default } from './ClientSectionNav';
```

- [ ] **Step 3: Style desktop and mobile navigation**

Use `display: block` for `.desktopNav` above 48em and `display: none` below it. Reverse those values for `.mobileNav`. The desktop rail must be sticky with `top: var(--mantine-spacing-sm)`, use a single `SectionCard`-compatible surface, and avoid a wide decorative shadow. Use `light-dark()` and Mantine variables for background, border, active, hover, and text colors.

```css
.desktopNav {
	position: sticky;
	top: var(--mantine-spacing-sm);
	padding: var(--mantine-spacing-xs);
	border: 1px solid var(--surface-border);
	border-radius: var(--mantine-radius-md);
	background: light-dark(
		var(--mantine-color-white),
		var(--mantine-color-dark-6)
	);
}

.mobileNav {
	display: none;
	gap: var(--mantine-spacing-xs);
}

@media (max-width: 48em) {
	.desktopNav {
		display: none;
	}

	.mobileNav {
		display: grid;
	}
}
```

- [ ] **Step 4: Implement `ClientFormActions`**

```tsx
import { Button, Group, Text } from '@mantine/core';
import type { ClientFormMode } from '../ClientForm/ClientForm.types';
import classes from './ClientFormActions.module.css';

interface ClientFormActionsProps {
	mode: ClientFormMode;
	isDirty: boolean;
	isSubmitting: boolean;
	unsavedLabel: string;
	createLabel: string;
	saveLabel: string;
	cancelLabel: string;
	onCancel: () => void;
}

const ClientFormActions: React.FC<ClientFormActionsProps> = ({
	mode,
	isDirty,
	isSubmitting,
	unsavedLabel,
	createLabel,
	saveLabel,
	cancelLabel,
	onCancel,
}) => (
	<Group className={classes.root} gap='xs' wrap='nowrap'>
		<Text
			className={classes.status}
			size='xs'
			c={isDirty ? 'yellow' : 'dimmed'}
			aria-live='polite'
		>
			{isDirty ? unsavedLabel : null}
		</Text>
		<Button
			type='button'
			variant='default'
			onClick={onCancel}
			disabled={isSubmitting}
		>
			{cancelLabel}
		</Button>
		<Button
			type='submit'
			loading={isSubmitting}
			disabled={mode === 'edit' && !isDirty}
		>
			{mode === 'create' ? createLabel : saveLabel}
		</Button>
	</Group>
);

export default ClientFormActions;
```

- [ ] **Step 5: Add the actions barrel and responsive action styles**

```ts
export { default } from './ClientFormActions';
```

On mobile, keep the same single component instance but make `.root` fixed to the viewport bottom. Use `left: 0`, `right: 0`, `z-index: 10`, `padding: var(--mantine-spacing-sm)`, `padding-bottom: calc(var(--mantine-spacing-sm) + env(safe-area-inset-bottom))`, a top border, and a `light-dark()` surface. Do not render duplicate mobile and desktop save buttons.

- [ ] **Step 6: Typecheck and commit the UI primitives**

Run: `rtk npm run typecheck`

Expected: both components compile and remain unused.

```bash
rtk git add src/modules/clients/ClientSectionNav src/modules/clients/ClientFormActions
rtk git commit -m "feat: add client form navigation controls"
```

### Task 3: Add dedicated routes and replace modal navigation

**Files:**

- Create: `src/modules/clients/ClientFormPage/ClientFormPage.tsx`
- Create: `src/modules/clients/ClientFormPage/ClientFormPage.module.css`
- Create: `src/modules/clients/ClientFormPage/index.ts`
- Modify: `src/routes.tsx`
- Modify: `src/modules/clients/ClientsPage/ClientsPage.tsx`
- Modify: `src/modules/clients/index.ts`

- [ ] **Step 1: Create the route adapter**

```tsx
import { Navigate, useParams } from 'react-router';
import ClientForm from '../ClientForm/ClientForm';
import type { ClientFormMode } from '../ClientForm/ClientForm.types';
import classes from './ClientFormPage.module.css';

interface ClientFormPageProps {
	mode: ClientFormMode;
}

const ClientFormPage: React.FC<ClientFormPageProps> = ({ mode }) => {
	const { clientId: rawClientId } = useParams<{ clientId: string }>();
	const clientId = rawClientId ? Number(rawClientId) : undefined;

	if (mode === 'edit' && (!clientId || !Number.isInteger(clientId))) {
		return <Navigate to='/clients' replace />;
	}

	return (
		<div className={classes.root}>
			<ClientForm mode={mode} clientId={clientId} />
		</div>
	);
};

export default ClientFormPage;
```

```css
.root {
	height: 100%;
	min-height: 0;
}
```

```ts
export { default } from './ClientFormPage';
```

- [ ] **Step 2: Register the lazy route component in `src/routes.tsx`**

Add the lazy import near `ClientsPage`:

```tsx
const ClientFormPage = React.lazy(
	() => import('./modules/clients/ClientFormPage')
);
```

Add sibling routes immediately after the existing `/clients` route. Reuse the exact same guard properties:

```tsx
{
	path: 'clients/new',
	id: 'clients.new',
	element: (
		<ModuleGuard
			module={ModuleEnum.SETTINGS}
			permission={PermissionEnum.MANAGE}
			masterOnly
		>
			<Suspense fallback={<SuspenseFallback />}>
				<ClientFormPage mode='create' />
			</Suspense>
		</ModuleGuard>
	),
},
{
	path: 'clients/:clientId/edit',
	id: 'clients.edit',
	element: (
		<ModuleGuard
			module={ModuleEnum.SETTINGS}
			permission={PermissionEnum.MANAGE}
			masterOnly
		>
			<Suspense fallback={<SuspenseFallback />}>
				<ClientFormPage mode='edit' />
			</Suspense>
		</ModuleGuard>
	),
},
```

Do not wrap these routes in `I18nNamespaceLoader`, because their route IDs are `clients.new` and `clients.edit`; `ClientForm` explicitly loads the `clients` namespace.

- [ ] **Step 3: Replace create/edit modal callbacks in `ClientsPage.tsx`**

Remove the `ClientForm` import and `handleSuccess`. Keep Mantine modals only for deletion. Add `useNavigate` and replace both modal callbacks:

```tsx
import { useNavigate } from 'react-router';

const navigate = useNavigate();

const openCreatePage = useCallback(() => {
	navigate('/clients/new');
}, [navigate]);

const openEditPage = useCallback(
	(clientId: number) => {
		navigate(`/clients/${clientId}/edit`);
	},
	[navigate]
);
```

Wire `openCreatePage` to the New Client button and pass `openEditPage` to `ClientsList`.

- [ ] **Step 4: Export the page from `src/modules/clients/index.ts`**

```ts
export { default as ClientsPage } from './ClientsPage/ClientsPage';
export { default as ClientFormPage } from './ClientFormPage';
export { default as ClientForm } from './ClientForm/ClientForm';
```

- [ ] **Step 5: Typecheck route integration**

Run: `rtk npm run typecheck`

Expected: routes and list navigation compile. The routed form may still show the legacy modal layout until Task 4.

- [ ] **Step 6: Commit routed navigation**

```bash
rtk git add src/routes.tsx src/modules/clients/ClientsPage/ClientsPage.tsx src/modules/clients/ClientFormPage src/modules/clients/index.ts
rtk git commit -m "feat: route client creation and editing"
```

### Task 4: Refactor `ClientForm` into the continuous page layout

**Files:**

- Modify: `src/modules/clients/ClientForm/ClientForm.tsx`
- Modify: `src/modules/clients/ClientForm/ClientForm.module.css`
- Modify: `src/modules/clients/ClientForm/ClientThemeSection.tsx`
- Modify: `src/modules/clients/ClientForm/ClientThemeSection.module.css`

- [ ] **Step 1: Replace callback-oriented props with routed-page props**

```ts
interface ClientFormProps {
	mode: ClientFormMode;
	clientId?: number;
}
```

Remove `onSuccess` and `onCancel`. Add `useNavigate`, use the explicit `clients` namespace, and initialize Mantine Form from `CLIENT_FORM_INITIAL_VALUES`.

- [ ] **Step 2: Gate edit hydration until both client and eligible theme queries are settled**

Destructure `isLoading`, `isError`, `error`, and `refetch` from both `useGetClient` and `useGetClientTheme`. Hydrate once the core client exists and either the theme is not eligible or the theme query has settled successfully.

```ts
const shouldLoadTheme = isEditMode && isMasterClient;
const isEditLoading =
	isEditMode && (isClientLoading || (shouldLoadTheme && isThemeLoading));
const isEditError =
	isEditMode && (isClientError || (shouldLoadTheme && isThemeError));

const hydratedClientIdRef = useRef<number | null>(null);

useEffect(() => {
	if (!isEditMode || !client) return;
	if (shouldLoadTheme && !clientTheme) return;
	if (hydratedClientIdRef.current === client.id) return;

	const hydratedValues = hydrateClientFormValues(client, clientTheme);
	form.setValues(hydratedValues);
	form.resetDirty(hydratedValues);
	setIsAliasManuallyEdited(Boolean(client.alias));
	hydratedClientIdRef.current = client.id;
}, [client, clientTheme, isEditMode, shouldLoadTheme]);
```

Reset `hydratedClientIdRef.current` to `null` when entering create mode. The client-ID guard prevents React Query refreshes from overwriting active user edits after initial hydration.

- [ ] **Step 3: Build translated, permission-aware section items**

Use `IconBuilding`, `IconAddressBook`, `IconMapPin`, `IconReceipt`, and `IconPalette`. Compute each `hasError` value from `CLIENT_SECTION_FIELDS` and `form.errors`. Always render identity, contact, and location/tax. Append billing and branding only when `isEditMode && isMasterClient`.

```ts
const sectionHasError = (sectionId: ClientFormSectionId) =>
	CLIENT_SECTION_FIELDS[sectionId].some((field) => Boolean(form.errors[field]));
```

- [ ] **Step 4: Replace the outer `Paper` with a full-height form and `ContentContainer`**

The root structure must be one form, one page shell, one continuous section column, and one navigation rail:

```tsx
<form id={CLIENT_FORM_ID} className={classes.form} onSubmit={handleSubmit}>
	<ContentContainer
		title={pageTitle}
		description={pageDescription}
		showBackButton
		onBackClick={() => navigate('/clients')}
		titleRight={
			<ClientFormActions
				mode={mode}
				isDirty={form.isDirty()}
				isSubmitting={isSubmitting}
				unsavedLabel={t('form.status.unsaved')}
				createLabel={t('form.actions.createClient')}
				saveLabel={t('form.actions.saveChanges')}
				cancelLabel={t('actions.cancel', { ns: 'common' })}
				onCancel={() => navigate('/clients')}
			/>
		}
	>
		<div className={classes.pageLayout}>
			<aside className={classes.navigationRail}>
				<ClientSectionNav
					sections={sections}
					ariaLabel={t('form.navigation.ariaLabel')}
					jumpLabel={t('form.navigation.jumpLabel')}
					errorLabel={t('form.navigation.sectionError')}
				/>
			</aside>
			<div className={classes.sections}>
				{/* semantic section wrappers and SectionCards */}
			</div>
		</div>
	</ContentContainer>
</form>
```

- [ ] **Step 5: Render each form section as a focusable semantic wrapper**

Use this wrapper pattern for every visible section. Keep the existing field controls and add stable IDs from `CLIENT_FORM_FIELD_IDS` to all focusable inputs.

```tsx
<section
	id='identity'
	tabIndex={-1}
	className={classes.sectionAnchor}
	aria-labelledby='identity-heading'
>
	<SectionCard
		title={
			<span id='identity-heading'>{t('form.sections.profile.title')}</span>
		}
		description={t('form.sections.profile.description')}
		contentSpacing='sm'
		padding='md'
	>
		<div className={classes.twoColumnGrid}>
			<TextInput
				id={CLIENT_FORM_FIELD_IDS.name}
				required
				label={t('form.fields.name.label')}
				{...form.getInputProps('name')}
			/>
			<TextInput
				id={CLIENT_FORM_FIELD_IDS.alias}
				required
				label={t('form.fields.alias.label')}
				value={form.values.alias}
				onChange={handleAliasChange}
				error={form.errors.alias}
			/>
			<Textarea
				id={CLIENT_FORM_FIELD_IDS.description}
				className={classes.fullWidthField}
				label={t('form.fields.description.label')}
				minRows={3}
				{...form.getInputProps('description')}
			/>
		</div>
	</SectionCard>
</section>
```

Use the same pattern for contact, location/tax, billing, and branding. `ClientThemeSection` remains the branding card and receives the same value, error, and disabled contract it already uses. Import `CLIENT_FORM_FIELD_IDS` in `ClientThemeSection.tsx` and assign the corresponding IDs to brand name, primary color, and secondary color controls so validation focus works across the component boundary.

- [ ] **Step 6: Replace the modal loading and error UI with page-shaped states**

For loading, keep `ContentContainer` visible and render skeletons matching three section cards plus the rail. For load failure, render an `Alert` inside `ContentContainer` with Retry and Back to clients buttons. Retry must call both relevant query `refetch` functions.

Do not use the existing centered loader pattern from `ClientsList` in this page.

- [ ] **Step 7: Implement creation redirect and normal edit success**

Creation:

```ts
const createdClient = await createMutation.mutateAsync(
	buildCreateClientPayload(values)
);
form.resetDirty(values);
allowNavigationRef.current = true;
notifications.show({
	title: t('notifications.created.title'),
	message: t('notifications.created.message'),
	color: 'green',
});
navigate(`/clients/${createdClient.id}/edit`, { replace: true });
```

Editing initially preserves the existing sequence of core update followed by optional theme patch. Task 5 hardens partial failure behavior.

- [ ] **Step 8: Replace modal CSS with page and responsive layout CSS**

Use these structural rules:

```css
.form {
	height: 100%;
	min-height: 0;
}

.pageLayout {
	display: grid;
	grid-template-columns: minmax(0, 1fr) minmax(180px, 220px);
	gap: var(--mantine-spacing-md);
	align-items: start;
	padding: var(--mantine-spacing-xs) 0 var(--mantine-spacing-lg);
}

.sections {
	display: flex;
	flex-direction: column;
	gap: var(--mantine-spacing-md);
	min-width: 0;
	grid-column: 1;
	grid-row: 1;
}

.navigationRail {
	grid-column: 2;
	grid-row: 1;
}

.sectionAnchor {
	scroll-margin-top: var(--mantine-spacing-sm);
	outline: none;
}

.sectionAnchor:focus-visible {
	border-radius: var(--mantine-radius-lg);
	box-shadow: 0 0 0 4px
		light-dark(var(--mantine-color-green-2), var(--mantine-color-green-8));
}

.twoColumnGrid {
	display: grid;
	grid-template-columns: repeat(2, minmax(0, 1fr));
	gap: var(--mantine-spacing-sm);
}

.fullWidthField {
	grid-column: 1 / -1;
}

@media (max-width: 48em) {
	.pageLayout {
		grid-template-columns: 1fr;
		padding: var(--mantine-spacing-xs) var(--mantine-spacing-sm)
			calc(84px + env(safe-area-inset-bottom));
	}

	.navigationRail {
		grid-column: 1;
		grid-row: 1;
	}

	.sections {
		grid-column: 1;
		grid-row: 2;
	}

	.twoColumnGrid {
		grid-template-columns: 1fr;
	}

	.fullWidthField {
		grid-column: auto;
	}
}
```

- [ ] **Step 9: Make the branding logo block responsive**

In `ClientThemeSection.module.css`, stack `.logoBlock` below 48em, stretch `.logoActions`, and let `.logoPreview` use `width: 100%` with a fixed 120px height. Preserve the existing dark-mode surface overrides.

- [ ] **Step 10: Typecheck and commit the page-layout refactor**

Run: `rtk npm run typecheck`

Expected: both routed modes compile and the old modal callbacks are no longer required.

```bash
rtk git add src/modules/clients/ClientForm
rtk git commit -m "feat: redesign client form as dedicated page"
```

### Task 5: Add validation focus, dirty navigation, and partial-save recovery

**Files:**

- Modify: `src/modules/clients/ClientForm/ClientForm.tsx`
- Modify: `src/modules/clients/ClientForm/ClientForm.helpers.ts`

- [ ] **Step 1: Focus the first invalid field after validation fails**

Use Mantine Form's invalid callback and the stable field order:

```ts
import type { ReactNode } from 'react';

const focusFirstInvalidField = (
	errors: Partial<Record<ClientFormField, ReactNode>>
) => {
	const firstInvalidField = CLIENT_FORM_FIELD_ORDER.find(
		(field) => errors[field]
	);
	if (!firstInvalidField) return;

	requestAnimationFrame(() => {
		const input = document.getElementById(
			CLIENT_FORM_FIELD_IDS[firstInvalidField]
		);
		input?.scrollIntoView({
			behavior: reduceMotion ? 'auto' : 'smooth',
			block: 'center',
		});
		input?.focus({ preventScroll: true });
	});
};
```

Pass it as the second callback to `form.onSubmit`. Set a localized validation summary in an `aria-live='assertive'` element before focusing.

- [ ] **Step 2: Add a navigation allow-list ref and browser unload protection**

```ts
const allowNavigationRef = useRef(false);
const isDirty = form.isDirty();

useBeforeUnload(
	useCallback(
		(event) => {
			if (!isDirty || allowNavigationRef.current) return;
			event.preventDefault();
			event.returnValue = '';
		},
		[isDirty]
	)
);

const blocker = useBlocker(() => isDirty && !allowNavigationRef.current);
```

- [ ] **Step 3: Present a localized Mantine confirmation for blocked in-app navigation**

When `blocker.state === 'blocked'`, open one confirm modal with:

- Title: `form.leave.title`.
- Body: `form.leave.message`.
- Confirm: `form.leave.confirm`.
- Cancel: `form.leave.stay`.
- Confirm action: `blocker.proceed()`.
- Cancel or close action: `blocker.reset()`.
- `closeOnClickOutside: false` and `withCloseButton: false`.

Use a ref containing the current modal ID so rerenders do not open duplicate dialogs.

- [ ] **Step 4: Preserve branding dirty state after a partial save**

Refactor edit submission into explicit phases:

```ts
await updateMutation.mutateAsync({
	id: clientId,
	data: buildUpdateClientPayload(values),
});

const themePatch = isMasterClient
	? buildClientThemePatch(values, clientTheme)
	: null;

if (themePatch) {
	try {
		await updateThemeMutation.mutateAsync({ id: clientId, data: themePatch });
	} catch (error) {
		form.resetDirty(buildCoreSavedBaseline(values, clientTheme));
		setFailedSection('branding');
		setSaveAnnouncement(t('form.partialSave.message'));
		notifications.show({
			title: t('form.partialSave.title'),
			message: t('form.partialSave.message'),
			color: 'yellow',
		});
		return;
	}
}

form.resetDirty(values);
setFailedSection(null);
setSaveAnnouncement(t('form.status.saved'));
```

Include `failedSection === section.id` in each navigation item's `hasError` calculation. Do not show the generic request-failed notification after the partial-save warning.

- [ ] **Step 5: Clear the navigation bypass correctly**

Before the create redirect, set `allowNavigationRef.current = true`. Edit save does not navigate, so it only resets the dirty baseline. When the component hydrates a different client ID, reset the ref to `false`.

- [ ] **Step 6: Add live status output**

Render one visually unobtrusive status element near the top of the form:

```tsx
<Text className={classes.srStatus} aria-live='assertive'>
	{validationSummary || saveAnnouncement}
</Text>
```

Use a visually hidden CSS pattern that remains available to assistive technology. Clear the validation summary after a valid submit starts.

```css
.srStatus {
	position: absolute;
	width: 1px;
	height: 1px;
	padding: 0;
	margin: -1px;
	overflow: hidden;
	clip: rect(0, 0, 0, 0);
	white-space: nowrap;
	border: 0;
}
```

- [ ] **Step 7: Typecheck and commit resilience behavior**

Run: `rtk npm run typecheck`

Expected: React Router blocker types, before-unload callback, Mantine errors, and partial-baseline values compile cleanly.

```bash
rtk git add src/modules/clients/ClientForm/ClientForm.tsx src/modules/clients/ClientForm/ClientForm.helpers.ts src/modules/clients/ClientForm/ClientForm.module.css
rtk git commit -m "feat: protect client form changes"
```

### Task 6: Finalize localized copy and theme-safe styling

**Files:**

- Modify: `src/locales/en/clients.json`
- Modify: `src/locales/es/clients.json`
- Modify: `src/modules/clients/ClientForm/ClientForm.tsx`
- Modify: `src/modules/clients/ClientForm/ClientForm.module.css`
- Modify: `src/modules/clients/ClientSectionNav/ClientSectionNav.module.css`
- Modify: `src/modules/clients/ClientFormActions/ClientFormActions.module.css`

- [ ] **Step 1: Add the English routed-page copy**

Merge these keys under `form` and remove the no-longer-used `intro` and `footerNote` keys after confirming `rtk proxy rg "form\.intro|form\.footerNote" src` returns no consumers:

```json
{
	"editor": {
		"createTitle": "Create client",
		"createDescription": "Add the essential organization details first. Billing and branding become available after creation.",
		"editTitle": "Edit {{name}}",
		"editDescription": "Review organization details, billing settings, and client branding."
	},
	"navigation": {
		"ariaLabel": "Client form sections",
		"jumpLabel": "Jump to section",
		"sectionError": "This section needs attention"
	},
	"status": {
		"unsaved": "Unsaved changes",
		"saved": "Changes saved",
		"validationSummary": "Review the highlighted fields before saving."
	},
	"leave": {
		"title": "Discard unsaved changes?",
		"message": "Your changes will be lost if you leave this page.",
		"confirm": "Discard changes",
		"stay": "Keep editing"
	},
	"partialSave": {
		"title": "Client details saved",
		"message": "Core details were saved, but branding could not be updated. Review the Branding section and save again."
	},
	"loadError": {
		"title": "Unable to load client",
		"retry": "Retry",
		"back": "Back to clients"
	}
}
```

- [ ] **Step 2: Add the matching Spanish copy**

```json
{
	"editor": {
		"createTitle": "Crear cliente",
		"createDescription": "Agrega primero los datos esenciales de la organización. La facturación y la marca estarán disponibles después de crearla.",
		"editTitle": "Editar {{name}}",
		"editDescription": "Revisa los datos de la organización, la facturación y la marca del cliente."
	},
	"navigation": {
		"ariaLabel": "Secciones del formulario de cliente",
		"jumpLabel": "Ir a una sección",
		"sectionError": "Esta sección requiere atención"
	},
	"status": {
		"unsaved": "Cambios sin guardar",
		"saved": "Cambios guardados",
		"validationSummary": "Revisa los campos resaltados antes de guardar."
	},
	"leave": {
		"title": "¿Descartar los cambios sin guardar?",
		"message": "Los cambios se perderán si abandonas esta página.",
		"confirm": "Descartar cambios",
		"stay": "Continuar editando"
	},
	"partialSave": {
		"title": "Datos del cliente guardados",
		"message": "Los datos principales se guardaron, pero no se pudo actualizar la marca. Revisa la sección Marca y guarda nuevamente."
	},
	"loadError": {
		"title": "No se pudo cargar el cliente",
		"retry": "Reintentar",
		"back": "Volver a clientes"
	}
}
```

- [ ] **Step 3: Remove obsolete modal create/edit labels only after checking usage**

Run:

```bash
rtk proxy rg "page\.modals\.(create|edit)" src
```

Expected: no component references after Task 3. Remove `page.modals.create` and `page.modals.edit` from both locale files while retaining `page.modals.delete`.

- [ ] **Step 4: Audit every manual CSS color and interaction state**

For `ClientForm.module.css`, `ClientSectionNav.module.css`, `ClientFormActions.module.css`, and `ClientThemeSection.module.css`, verify:

- All surfaces and borders use Mantine variables, `var(--surface-border)`, or `light-dark()`.
- Focus, active, hover, disabled, loading, error, and warning states remain legible in both themes.
- No new hardcoded hexadecimal color is introduced.
- No card has both a decorative 1px border and a wide custom shadow.
- All mobile buttons remain at least 44px high.
- Reduced-motion mode disables smooth section scrolling through `useReducedMotion`.

- [ ] **Step 5: Run formatting checks and typecheck**

Run:

```bash
rtk prettier --check src/modules/clients src/locales/en/clients.json src/locales/es/clients.json src/routes.tsx
rtk npm run typecheck
```

Expected: formatting and TypeScript checks pass.

- [ ] **Step 6: Commit localization and visual hardening**

```bash
rtk git add src/locales/en/clients.json src/locales/es/clients.json src/modules/clients
rtk git commit -m "feat: polish client form page experience"
```

### Task 7: Verify production behavior without adding tests

**Files:**

- No new test files.
- Modify implementation files only if verification exposes a defect.

- [ ] **Step 1: Run repository checks**

```bash
rtk npm run typecheck
rtk npm run build
rtk npm run check:inline-styles
```

Expected: all commands exit successfully with no TypeScript, Vite, or inline-style policy errors.

- [ ] **Step 2: Start the application**

Run: `rtk npm run dev`

Open `/clients` as a master-client administrator with manage access.

- [ ] **Step 3: Verify creation flow**

Confirm all of the following:

- New Client opens `/clients/new` without a modal.
- Only identity, contact, and location/tax sections appear.
- Alias follows the name until manually edited.
- Invalid submit focuses the first invalid field and marks the correct section.
- Valid submit creates one client and replaces the route with `/clients/:id/edit`.
- Billing and branding appear after redirect.

- [ ] **Step 4: Verify edit and partial-save flow**

Confirm:

- Row click and Edit action open `/clients/:clientId/edit`.
- Client and theme data hydrate once without overwriting later edits.
- Save is disabled while edit mode is clean and enables after a change.
- Successful save clears Unsaved changes and remains on the edit route.
- Simulated theme-patch failure after a successful client update leaves Branding marked as needing attention while core details remain clean.
- Saving Branding again clears the warning after success.

- [ ] **Step 5: Verify navigation protection**

Confirm:

- Back, Cancel, sidebar navigation, and browser back prompt while the form is dirty.
- Keep editing leaves values intact.
- Discard changes completes the original navigation.
- A clean form exits without prompting.
- Successful create redirect does not trigger the dirty confirmation.
- Browser refresh or tab close uses the native unsaved-changes warning while dirty.

- [ ] **Step 6: Verify section navigation and accessibility**

Confirm:

- The desktop rail tracks the visible section.
- Clicking a section scrolls and moves keyboard focus to its heading wrapper.
- Error sections use an icon and accessible label, not color alone.
- Keyboard order reaches Back, form fields, section navigation, Cancel, and Save logically.
- The validation and save messages are announced by a screen reader or accessibility tree inspection.
- Reduced-motion mode uses immediate scrolling.

- [ ] **Step 7: Verify responsive and theme matrix**

Check light and dark modes at 375px, 390px, 768px, 1024px, and 1440px:

- No horizontal page scroll.
- The rail becomes the section selector below 48em.
- The single action component becomes a sticky bottom bar on mobile.
- Sticky actions do not cover the final branding controls.
- Logo upload, preview, color inputs, alerts, skeletons, and focus rings preserve contrast.
- Button touch targets are at least 44px on mobile.

- [ ] **Step 8: Inspect the final diff and commit any verification fixes**

```bash
rtk git diff --check
rtk git status --short
```

If verification required fixes, stage only the client-form scope and commit them:

```bash
rtk git add src/routes.tsx src/modules/clients src/locales/en/clients.json src/locales/es/clients.json
rtk git commit -m "fix: harden client form page behavior"
```

---

## Acceptance Criteria

- Client creation and editing use dedicated routes, never create/edit modals.
- Creation redirects to the newly created client's edit page.
- The form uses continuous `SectionCard` sections with a desktop rail and mobile jump control.
- Persistent actions communicate dirty and saving state without duplicated save buttons.
- Validation focuses the first invalid field and marks all affected sections.
- Dirty in-app navigation and browser unload are protected.
- Core-save success plus theme-save failure is represented as a partial save.
- Loading uses page-shaped skeletons; load failure offers Retry and Back to clients.
- All new copy exists in English and Spanish.
- Light mode, dark mode, reduced motion, keyboard navigation, and required viewports are usable.
- No automated test files are added.
- `rtk npm run typecheck`, `rtk npm run build`, and `rtk npm run check:inline-styles` pass.
