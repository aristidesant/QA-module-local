# Super admin · Global configuration (7 tabs)

## Context

The superAdmin role preview already lists a **Global Settings** link (`Sidebar.tsx` `rolePreviewNav.superAdmin`, key `role-preview-global-settings` → `/role-preview/global-settings`), but that path falls through to the `role-preview/:section` catch-all and renders the generic "Coming soon" placeholder. The user wants the super admin to have the client configuration shown in the reference screenshots: a **Global configuration** page with seven tabs — Call analysis, Evaluation, Context rules, Campaign types, Naming convention, Score scales, Sentiment analysis.

Decisions (user, 2026-10-20): all 7 tabs (Call analysis gets a plausible mock, it was not in the screenshots); the page **replaces the superAdmin placeholder** only (no new link in other sidebars); **light, store-backed interactivity** (selects, toggles and tables edit a Zustand store, Save persists in-session, Add/Create open `AppDrawer` forms, nothing hits a backend); the Score scales tab **matches the screenshot** (list of named scales) instead of embedding the existing thresholds settings.

Mode: mockup. Mantine v9, CSS modules, strings in `en` and `es`, no inline `style=` (pre-commit hook rejects it), dark/light via Mantine variables and `light-dark()`, colour means exception (neutral by default, colour only for errors / exceptions). No tests, no dev server. Prettier on touched files only. Do not commit unless asked.

Plan copy convention: Task 0 copies this file to `docs/superpowers/plans/2026-10-20-global-config.md`.

---

## Verified facts (do not re-explore)

- **Nav + route today**: `src/components/Sidebar/Sidebar.tsx:638-644` superAdmin item `{ key: 'role-preview-global-settings', label: 'sidebar.rolePreview.items.globalSettings', to: '/role-preview/global-settings' }` (label exists: en `common.json:245` "Global Settings", es `:243` "Configuración global"). `src/routes.tsx:2420-2428` catch-all `role-preview/:section` (id `role-preview`) renders `RolePreviewPlaceholderPage` (lazy at `routes.tsx:83`); `src/constants/rolePreviewPlaceholders.ts:50-54` has the `'global-settings'` entry. Role-preview routes are children of the authenticated layout, **outside** `/qa` (no `ModuleGuard`); `role-preview/emotion-sentiment` (`routes.tsx:2368-2378`) is the model for wrapping a route in `I18nNamespaceLoader` + `Suspense`.
- **Namespace loading**: `I18nNamespaceLoader` (`routes.tsx:432-454`) resolves the last route id through `campaignRouteNamespaces` → `qaRouteNamespaces` (`src/modules/qa/qaNamespaces.ts`, `Record<string, string | readonly string[]>`) → `backofficeRouteNamespaces` → the id itself. `src/locales/i18n.ts` globs `./*/*.json`, so a new `src/locales/{en,es}/qa.globalConfig.json` is picked up with no registration.
- **Page/tab pattern** to copy: `src/modules/qa/settings/SettingsPage/SettingsPage.tsx` (`ContentContainer contentWidth='full'` → `Stack gap='lg'` → eyebrow `Text size='xs' c='dimmed' tt='uppercase' fw={600}`, `Title order={1}`, dimmed description, then Mantine `Tabs` with `Tabs.Tab leftSection={<Icon size={16} />}` and `Tabs.Panel pt='lg'`). URL-synced tabs: `src/modules/qa/lms/LmsManagerPage/LmsManagerPage.tsx:142-152` (`useSearchParams`, `?tab=`, `{ replace: true }`).
- **Shared primitives**: `SectionCard` (`src/components/SectionCard`; props `icon: TablerIcon`, `title`, `description`, `headerActions`, `footer`, `fullHeight`), `AppDrawer` (`src/components/AppDrawer`; `title`, `description`, `icon`, `headerActions`, plus Mantine `DrawerProps`), `BaseTable` (`src/components/BaseTable`; `columns: BaseTableColumnDef<T>[]`, `getRowId`, `density='compact'`, `emptyMessage`, `onRowClick`), `EmptyState` (`src/components/EmptyState`; `icon`, `message`, `description`, `action`).
- **Settings helpers reusable as-is**: `src/modules/qa/settings/useSettingsDraft.ts` (`useSettingsDraft<T>(stored)` → `{ draft, dirty, setDraft/patch, discard, fillWith }` — read the file for the exact names before using), `src/modules/qa/settings/components/SettingsActions.tsx` (`dirty`, `invalid?`, `onSave`, `onDiscard`, `onReset`), `DEFAULT_SETTINGS` in `src/modules/qa/settings/constants.ts` (QA/Compliance/Business `ScoreBands {onTarget, watch}`, Coaching tier cuts).
- **Store pattern**: `src/stores/qa/settingsStore.ts` — non-persisted Zustand v5 store, raw-slice selectors (`selectThresholds`), derive with `useMemo` in components. `src/stores/qa/formsStore.ts` exposes `MOCK_FORMS` (`BuilderForm[]`: `frm-001` "COPC Sales Calls" COPC, `frm-002` "Standard Support Quality" STANDARD, `frm-003` "Retention Playbook (draft)" STANDARD) via `useFormsStore` and `selectPrimaryFormIds`.
- **Emotion catalog source**: `src/modules/qa/emotion-sentiment/types.ts` — `Emotion` (13 values ELATION … RAGE) and `EMOTION_SENTIMENT_MAP: Record<Emotion, SentimentCategory>` with `SentimentCategory = 'very-negative' | 'negative' | 'neutral' | 'positive' | 'very-positive'`.
- **Campaign types in the codebase**: `COPC_CAMPAIGN_TYPES` (`src/modules/qa/forms/constants.ts:15`: ALL, SALES, SUPPORT, RETENTION, COLLECTIONS, ACTIVATION) and `LINES_OF_BUSINESS` in `src/modules/qa/triggers/constants.ts`. The new tab keeps its **own** seeded catalog (the screenshot codes) and does not change those.
- **Evaluator agents** are a real API (`src/api/qa/evaluatorAgentsApi.ts`, `src/queries/qa/evaluatorAgentsQueries`) — do **not** use them; the Evaluation tab uses a seeded list.
- Status conventions already in the app: Switch toggles use `color='gray'` and status reads as a dot + text (`RulesTable.tsx` Status column, `SeverityTag`), code chips are `Badge variant='light' color='gray'`.

---

## Design

### Page

`GlobalConfigPage` at `/role-preview/global-settings` (own route, id `role-preview.global-settings`, placed **before** the `:section` catch-all). Header: eyebrow `page.eyebrow` ("Super admin"), title `page.title` ("Global configuration"), description `page.description` ("Configure the client defaults for the active QA workspace.") — on the Sentiment analysis tab the description switches to `page.descriptionShared` ("Configure the sentiment analyzer shared by all clients."), as in the screenshot. Tabs synced to `?tab=` (`callAnalysis | evaluation | contextRules | campaignTypes | namingConvention | scoreScales | sentiment`, default `callAnalysis`), `keepMounted={false}`. Icons: `IconWaveSine`, `IconClipboardCheck`, `IconBook2`, `IconBuildingStore`, `IconFileDescription`, `IconRuler2`, `IconMoodSearch` (all exist in `@tabler/icons-react` v3; swap for a sibling if `tsc` complains).

### Store — `src/stores/qa/globalConfigStore.ts`

Non-persisted Zustand store seeded from `src/modules/qa/global-config/seed.ts`. Slices and actions (ids are strings, `updatedAt` ISO):

```ts
callAnalysis: CallAnalysisConfig;            saveCallAnalysis(next)
evaluation: EvaluationConfig;                saveEvaluation(next)   // bumps version, prepends to evaluationVersions
evaluationVersions: EvaluationVersion[];
contextRules: ContextRule[];                 upsertContextRule(rule) · toggleContextRule(id) · deleteContextRule(id) · duplicateContextRule(id)
protocolDocuments: ProtocolDocument[];       (read-only list)
campaignTypes: CampaignTypeEntry[];          upsertCampaignType(entry) · deleteCampaignType(code)
namingConvention: NamingConvention;          saveNamingConvention(next)
scoreScales: ScoreScale[];                   upsertScoreScale(scale) · deleteScoreScale(id)
sentimentAnalyzer: SentimentAnalyzerConfig;  saveSentimentAnalyzer(next) // bumps version
```

Selectors: one raw selector per slice (`selectContextRules`, …). Types in `src/modules/qa/global-config/types.ts`:

```ts
export type ConfigStatus = 'ACTIVE' | 'INACTIVE';
export interface CallAnalysisConfig {
	language: 'AUTO' | 'es' | 'en';
	diarization: boolean;
	redactPii: boolean;
	piiFields: string[];
	analyses: ('QA' | 'COMPLIANCE' | 'SENTIMENT' | 'BUSINESS')[];
	minDurationSeconds: number;
	audioRetentionDays: number;
	updatedAt: string;
}
export interface EvaluationConfig {
	version: number;
	format: 'STANDARD' | 'COPC';
	defaultFormId: string | null;
	primaryEvaluatorId: string | null;
	fallbackEvaluatorId: string | null;
	updatedAt: string;
}
export interface EvaluationVersion {
	version: number;
	savedAt: string;
	savedBy: string;
	summary: string;
}
export interface EvaluatorOption {
	id: string;
	name: string;
	code: string;
} // "Luna" / "R8_1E1F27B67ED3_PRIMARY"
export type RuleScope = 'CLIENT' | 'CAMPAIGN_TYPE' | 'CAMPAIGN';
export interface ContextRule {
	id: string;
	topic: string;
	scope: RuleScope;
	target: string;
	agentType: 'ALL' | 'HUMAN' | 'AI';
	context: string;
	status: ConfigStatus;
	updatedAt: string;
}
export interface ProtocolDocument {
	id: string;
	name: string;
	lineOfBusiness: string;
	version: number;
	uploadedAt: string;
}
export interface CampaignTypeEntry {
	code: string;
	name: string;
	description: string | null;
	status: ConfigStatus;
	locked?: boolean;
	updatedAt: string;
}
export type NamingToken =
	| 'source-campaign-id'
	| 'date-time'
	| 'source-agent-id'
	| 'dialed-number'
	| 'direction'
	| 'customer-name'
	| 'customer-id';
export interface NamingConvention {
	separator: '_' | '-' | '.';
	tokens: NamingToken[];
	dateTimeFormat: 'YYYYMMDD-HHmmss' | 'YYYYMMDDHHmmss' | 'YYYY-MM-DD_HH-mm-ss';
	sampleFilename: string;
	updatedAt: string;
}
export type ScaleType =
	| 'QA'
	| 'COMPLIANCE'
	| 'SENTIMENT'
	| 'BUSINESS'
	| 'COACHING';
export interface ScaleBand {
	label: string;
	min: number;
} // sorted ascending; last band is open-ended
export interface ScoreScale {
	id: string;
	name: string;
	type: ScaleType;
	bands: ScaleBand[];
	updatedAt: string;
}
export type SentimentLevel =
	| 'VERY_POSITIVE'
	| 'POSITIVE'
	| 'NEUTRAL'
	| 'NEGATIVE'
	| 'VERY_NEGATIVE';
export interface EmotionEntry {
	label: string;
	description: string;
	level: SentimentLevel;
}
export interface SentimentAnalyzerConfig {
	version: number;
	systemPrompt: string;
	classificationInstructions: string;
	emotions: EmotionEntry[];
	updatedAt: string;
}
```

### Seed (`seed.ts`)

- Evaluators: `ev-primary` "Luna" `R8_1E1F27B67ED3_PRIMARY`, `ev-fallback` "Luna Respaldo" `R8_1E1F27B67ED3_FALLBACK`, `ev-nova` "Nova" `R8_77A0C1D2E3F4_PRIMARY`. Evaluation: version 33, format `COPC`, defaultFormId `frm-001`, primary `ev-primary`, fallback `ev-fallback`; 4 prior versions (33 → 30) with short summaries.
- Context rules (13 = 1 client + 7 campaign types + 5 campaigns), topics as in the screenshot (`glosario.polaridad-si-no`, `copc-cobros.principios`, `linea-localizacion.callback`, …), contexts in uppercase-leading sentences truncated by the table. The client-level `glosario.polaridad-si-no` carries `overriddenBy: 'CAMPAIGN_TYPE'` derived at render time: a rule is overridden when a more specific scope has the same topic (helper `overriddenBy(rule, rules)` in `helpers.ts`). 3 protocol documents (Cobros v3, Localización v2, Ventas v1).
- Campaign types: `ALL` "All" (locked), `CANCELLATION_ATTEMPT` "Cancellation attempt", `CARD_ACTIVATION` "Card activation", `COBROS` "Collections", `LOCALIZACION` "Localization" (with description "Localization line: outbound calls handled by …"), `SALES` "Sales" — all ACTIVE.
- Naming convention: separator `_`, tokens in the screenshot order, `dateTimeFormat: 'YYYYMMDD-HHmmss'`, sample `P710_20260721-083002_wmendez_8098583149_CE_Maria-Perez_customer-123.mp3`.
- Score scales (4): "QA score" (QA; Low <`watch`, Watch, On target ≥`onTarget` from `DEFAULT_SETTINGS.qa.scoreBands`), "Compliance" (COMPLIANCE, from `DEFAULT_SETTINGS.compliance`), "Conversion rate" (BUSINESS), "Coaching tiers" (COACHING, from tier cuts). Read `DEFAULT_SETTINGS` for the exact field names.
- Sentiment analyzer: version 7, the two prompt texts from the screenshot (English), emotions = the 13 `Emotion` values mapped through `EMOTION_SENTIMENT_MAP` to `SentimentLevel` (`'very-negative'`→`VERY_NEGATIVE` …) with the screenshot descriptions for ELATION, GRATITUDE, JOY, RELIEF, SATISFACTION, NEUTRAL, SURPRISE ("Unexpected realization, astonishment, or disbelief.") and short ones for the rest.

### Tabs (each in `src/modules/qa/global-config/tabs/<Name>Tab.tsx`, each a `Stack gap='lg'` of `SectionCard`s)

1. **CallAnalysisTab** — `SectionCard` "Call analysis defaults" (+ `ActiveClientBanner`): `Select` language, `Switch` diarization, `Switch` redact PII + `MultiSelect` piiFields (phone, card, national id, email), `Checkbox.Group` analyses, `NumberInput` min duration (s), `Select` audio retention (30/90/180/365 days). Footer `SettingsActions` (draft via `useSettingsDraft`).
2. **EvaluationTab** — `SectionCard` "Client evaluation configuration", `headerActions` = `Text c='dimmed'` "Current version {{n}}" + `Button variant='default' leftSection={<IconHistory/>}` "Version history" (opens `VersionHistoryDrawer`: `AppDrawer` with a `Timeline` of `evaluationVersions`). Body: `ActiveClientBanner` (title + help + `Badge color='green' variant='light'` "Configured"), `Alert variant='light' color='blue' icon={<IconInfoCircle/>}` with the requirement text, `SegmentedControl` Evaluation format (Standard / COPC) + hint, `Select` Default evaluation form (options = `MOCK_FORMS` filtered by `modality === format`, label `name`), `SimpleGrid cols={{ base: 1, md: 2 }}` with `Select` Primary evaluator and Fallback evaluator (option label `"{name} [{code}]"`, the fallback excludes the primary). Footer: right-aligned `Button leftSection={<IconDeviceFloppy/>} disabled={!dirty}` "Save evaluation configuration" → `saveEvaluation` (version +1, toast via `notifications.show` if `@mantine/notifications` is already used in `src/modules/qa/settings`; otherwise no toast).
3. **ContextRulesTab** — `SectionCard` "Evaluator context rules", `headerActions`: `Button variant='default'` "Protocol documents" (→ `ProtocolDocumentsDrawer`, table of `protocolDocuments`), `Button variant='default' leftSection={<IconEye/>}` "Preview" (→ `RulePreviewDrawer`: `Select` campaign, then the effective rules for it, most specific wins, rendered as a `Stack` of topic + context), `Button leftSection={<IconPlus/>}` "Add rule" (→ `ContextRuleDrawer`). `Alert` "Each rule covers one topic. In each topic the most specific level wins: campaign, then campaign type, then client." with an `Anchor` "How rules combine" toggling a `Collapse` with three bullet lines. Toolbar `Group`: `TextInput leftSection={<IconSearch/>}` search (topic, target, context), `SegmentedControl` scope with counts (`All (13)`, `Client (1)`, `Campaign types (7)`, `Campaigns (5)`), `Select` status (All / Active / Inactive). `BaseTable` columns: Topic (`Code`-styled mono text + dimmed "Overridden by: {scope}" line when applicable), Applies to (`Text fw={600}` target + two gray `Badge variant='light'` chips: scope, agent type), Context (`Text lineClamp={1}`), Status (`StatusDot` + text), actions `Menu` (Edit, Duplicate, Activate/Deactivate, Delete). `ContextRuleDrawer` fields: topic, scope `SegmentedControl`, target `Select` (client name / campaign type codes / campaign names), agent type, context `Textarea autosize minRows={4}`, status `Switch`; Save → `upsertContextRule`.
4. **CampaignTypesTab** — `SectionCard` "Campaign types" with `headerActions` `Button leftSection={<IconPlus/>}` "Create campaign type" (→ `CampaignTypeDrawer`: code `TextInput` uppercase/underscore, name, description, status). Toolbar: `TextInput` "Search by code", `Select` status, right-aligned `Text c='dimmed'` "{{count}} campaign types". `BaseTable` columns: Code (`Badge variant='light' color='gray' ff='monospace'` + `IconLock size={14}` when `locked`), Name (`Text fw={600}` + dimmed description or "Not available"), Status (`StatusDot`), Actions (`ActionIcon variant='subtle' color='gray'` edit and `color='red'` delete, both `disabled` when locked; delete opens Mantine `modals.openConfirmModal` if `@mantine/modals` is wired in `src/main.tsx`, otherwise deletes directly).
5. **NamingConventionTab** — `SectionCard` "Audio import naming convention": `ActiveClientBanner` ("No default parser exists. Until a convention is saved, every audio import for this client is rejected." when `tokens.length === 0`, else "Configured"), dimmed note "Saving replaces the full naming convention document and only affects future imports…". Inner `Paper withBorder` "Live filename preview" with `headerActions`-like right `Button variant='subtle' leftSection={<IconRefresh/>}` "Use generated example" (resets the input to `sampleFilename`), `TextInput ff='monospace'` sample filename (local state, not saved), and a `Table` (plain Mantine `Table`, 4 columns: Field, Raw, After transformations, Status) fed by `parseFilename(filename, convention)` from `helpers.ts`: strip extension, split by separator, map by token order, `date-time` transformed to `YYYY-MM-DD HH:mm:ss` for the selected format; status `IconCircleCheck color green` when present/valid, `IconAlertCircle color red` when missing or (date) unparsable. Below, `SectionCard` "Convention": `Select` separator, token order as an ordered list of `Select`s (7 rows, each a `NamingToken`, with up/down `ActionIcon`s) and `Select` date-time format; footer `SettingsActions`.
6. **ScoreScalesTab** — two `SectionCard`s like the screenshot: (a) "Score scales" with description and `headerActions` `Button leftSection={<IconPlus/>}` "Create scale" (→ `ScoreScaleDrawer`: name, type `Select`, bands editor = `Stack` of rows `TextInput label` + `NumberInput min` with add/remove, validated ascending); toolbar `Group grow`: `TextInput` search, `Select` type, `Select` sort by (Updated / Name / Type), `Select` direction, `Button variant='default' leftSection={<IconRefresh/>}` "Refresh" (resets filters). (b) `SectionCard` body `BaseTable` columns Name, Type (gray badge), Bands (`Group gap={4}` of `Badge variant='outline' color='gray'` "Low <60", "Fair 60–79", "Excellent ≥80"), Updated (date), actions `Menu` (Edit, Delete). `emptyMessage` not enough: when the filtered list is empty render `EmptyState icon={<IconInbox/>} message="No score scales found" description="Create a scale or change the filters to see results."` instead of the table.
7. **SentimentTab** — `Alert variant='light' color='blue'` "Saving creates and immediately activates an immutable version for new sentiment analyses." `SectionCard` "Analyzer instructions": `Textarea` LLM system prompt (`required`, `autosize minRows={4}`, right-aligned counter `{{n}} / 20000 characters`), `Textarea` Classification instructions (same). `SectionCard` "Emotion catalog" with `headerActions` `Button variant='outline' leftSection={<IconPlus/>}` "Add emotion" (prepends an empty row and focuses it); summary chips row: one `Badge variant='light' color='gray'` per level "Very positive · 2" … (neutral chips — colour is reserved for validation errors); rows table (plain `Table`): Label `TextInput ff='monospace'` (uppercased on blur; duplicate → `error`), Description `Textarea autosize minRows={1}`, Sentiment level `Select`, delete `ActionIcon color='red' variant='subtle'`. Footer `SettingsActions` whose save calls `saveSentimentAnalyzer` (version +1); `invalid` when a label is empty/duplicate or a prompt is empty.

Shared pieces in `src/modules/qa/global-config/components/`: `ActiveClientBanner` (`title`, `description`, `configured: boolean` → green light badge "Configured" / gray "Not configured"), `StatusDot` (`status: ConfigStatus`; `.dot` 6 px circle, `light-dark(var(--mantine-color-green-6), var(--mantine-color-green-5))` for ACTIVE, gray-5 for INACTIVE, + text), `CodeText` (mono `Text`), drawers listed above. Styles in `GlobalConfig.module.css` (dot, mono code, counter alignment, token row) — Mantine props elsewhere.

### Locale `src/locales/{en,es}/qa.globalConfig.json`

Blocks: `page` (eyebrow, title, description, descriptionShared, tabs._), `common` (configured, notConfigured, active, inactive, save, discard, reset, search, status, all, notAvailable, never, updated, actions.edit/duplicate/delete/activate/deactivate, version "Version {{n}}", currentVersion "Current version {{n}}"), `callAnalysis._`, `evaluation._`(title, description, banner.title/description, requirement, format.label/standard/copc/hint, form.label/description, primary.label/description, fallback.label/description, save, history.title/description/savedBy),`contextRules._`(title, description, docs, preview, add, howRules.summary/link/bullets, scope.client/campaignType/campaign, agentType.all/human/ai, columns.topic/appliesTo/context/status/actions, overriddenBy, filters.all/client/campaignTypes/campaigns, drawer.*),`campaignTypes._` (title, description, create, searchCode, count "{{count}} campaign types", columns._, drawer._, lockedHint), `naming._`(title, description, banner.*, note, preview.title/description/useExample/sample.label/sample.help, columns.field/raw/transformed/status, tokens.<NamingToken>, convention.title/separator/order/dateFormat),`scoreScales._` (title, description, create, filters.search/type/sortBy/direction/refresh, sort.updated/name/type, direction.asc/desc, columns.name/type/bands/updated/actions, empty.title/description, band "{{label}} ≥ {{min}}", bandBelow "{{label}} < {{min}}", drawer._), `sentiment.*` (notice, instructions.title/description, systemPrompt.label/help, classification.label/help, counter "{{count}} / {{max}} characters", catalog.title/description/add, levels.VERY_POSITIVE…VERY_NEGATIVE, columns.label/description/level/actions, errors.duplicate/empty). Spanish strings follow the screenshots ("Configuración global", "Reglas de contexto del evaluador", "Convención de nombres para importación de audio", "Escalas de puntaje", "Catálogo de emociones", …).

---

## Implementation plan

Execute in order; `npm run typecheck` after each task. New code lives in `src/modules/qa/global-config/` unless noted.

### Task 0 — Plan copy

Copy this file to `docs/superpowers/plans/2026-10-20-global-config.md`.

### Task 1 — Types, seed, helpers, store

Create `types.ts`, `constants.ts` (`GLOBAL_CONFIG_TABS` ordered keys + icons, `NAMING_TOKENS`, `SCALE_TYPES`, `SENTIMENT_LEVELS` in display order, `PROMPT_MAX = 20000`), `seed.ts` (as in Design), `helpers.ts` (`overriddenBy`, `effectiveRulesFor(campaign)`, `parseFilename`, `formatBand(t, band, next)`, `emotionCountsByLevel`), and `src/stores/qa/globalConfigStore.ts` (slices/actions/selectors as in Design, every write sets `updatedAt = new Date().toISOString()`; `saveEvaluation` and `saveSentimentAnalyzer` increment `version` and `saveEvaluation` prepends `{version, savedAt, savedBy: 'Super admin', summary}` to `evaluationVersions`).

### Task 2 — Page shell and route

- `GlobalConfigPage/GlobalConfigPage.tsx` + `index.ts`: header, `?tab=`-synced `Tabs` with the 7 panels (`keepMounted={false}`), description switches on the sentiment tab.
- `src/routes.tsx`: add `const GlobalConfigPage = React.lazy(() => import('./modules/qa/global-config/GlobalConfigPage'))` next to the other lazies and a route `{ path: 'role-preview/global-settings', id: 'role-preview.global-settings', element: <I18nNamespaceLoader><Suspense fallback={<SuspenseFallback />}><GlobalConfigPage /></Suspense></I18nNamespaceLoader> }` **immediately before** the `role-preview/:section` entry.
- `src/modules/qa/qaNamespaces.ts`: `'role-preview.global-settings': 'qa.globalConfig'`.
- `src/constants/rolePreviewPlaceholders.ts`: remove the `'global-settings'` entry (no longer a placeholder).
- Locale files with the `page.*` and `common.*` blocks (the rest is added per tab).

### Task 3 — Shared components

`components/ActiveClientBanner.tsx`, `components/StatusDot.tsx`, `components/CodeText.tsx`, `GlobalConfig.module.css`.

### Task 4 — Evaluation tab (+ `VersionHistoryDrawer`)

### Task 5 — Context rules tab (+ `ContextRuleDrawer`, `ProtocolDocumentsDrawer`, `RulePreviewDrawer`)

### Task 6 — Campaign types tab (+ `CampaignTypeDrawer`)

### Task 7 — Naming convention tab

### Task 8 — Score scales tab (+ `ScoreScaleDrawer`)

### Task 9 — Sentiment analysis tab

### Task 10 — Call analysis tab

Each of Tasks 4–10 adds its locale block (en + es) and uses the shared pieces from Task 3; forms use `useSettingsDraft` + `SettingsActions` where the screenshot shows a footer, and `AppDrawer` for create/edit.

### Task 11 — Checks

- `npm run typecheck` clean.
- Greps: `style=` under `src/modules/qa/global-config/**` → none; every `t('…')` key used under the module exists in both `qa.globalConfig.json` files (script: collect `t\('([\w.]+)'` keys, resolve against both JSON files); no hardcoded colour hex in the module CSS without a `light-dark()` counterpart.
- Prettier on touched files only; `git status --short` lists only intended files.

---

## Verification (user, in the browser; no dev server is started here)

User menu → Preview as role → **Super admin** → sidebar **Global Settings** (`/role-preview/global-settings`).

1. Page header + 7 tabs; `?tab=` updates on click, reload keeps the tab, Sentiment analysis changes the description line.
2. Evaluation: COPC/Standard switch filters the form select, choosing the primary evaluator removes it from the fallback list, Save is disabled until something changes, then bumps "Current version 33 → 34" and the Version history drawer shows the new entry on top.
3. Context rules: counts in the scope chips add up (13 / 1 / 7 / 5), search filters, "How rules combine" expands, the client-level `glosario.polaridad-si-no` shows "Overridden by: Campaign type", Add rule drawer creates a row, row menu toggles status (dot turns gray) and deletes; Preview drawer lists effective rules per campaign; Protocol documents drawer opens.
4. Campaign types: `ALL` is locked (lock icon, disabled edit/delete); create and delete work; count line updates.
5. Naming convention: editing the sample filename re-parses live; removing a segment flags the field red; "Use generated example" restores the sample; reordering tokens changes the parse; Save keeps the convention.
6. Score scales: filters reduce the list to the empty state; Create scale adds a row with band chips; sort and direction reorder rows.
7. Sentiment analysis: counters update while typing; summary chips reflect the level selects; Add emotion prepends a row; duplicate/empty labels disable Save; Save bumps the version.
8. Call analysis: toggles/selects edit the draft, Discard and Reset work.
9. Dark and light mode on every tab (badges, dots, alerts, drawers), and widths down to ~1024 px (tab list wraps, tables keep their columns).

## Out of scope

- Linking these settings to the real `settingsStore` thresholds, the real evaluator-agents API, or any backend.
- A "Global configuration" entry in the QA admin / other role sidebars.
- Client switching inside the page (it always shows the "active client").
