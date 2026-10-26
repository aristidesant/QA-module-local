# My Learning (agent role) — evaluation-driven redesign

Target path for execution: `docs/superpowers/plans/2026-10-26-agent-my-learning-redesign.md`

## Context

The agent-facing My Learning section (`/qa/agent/lms` and `/qa/agent/lms/:contentId`) is tidy but reads as a stock SaaS kit: an uppercase eyebrow, five count tiles that answer "how many" instead of "what now", tabs with count badges, and stacks of identical gray cards inside shadowed section cards. Format, area, difficulty and persona are all gray by policy, there is no imagery, and the product's one genuinely distinctive idea — every assignment exists because of a measured gap in the agent's evaluation, and is measured again afterwards — is buried as 12px dimmed text under a "Why this was assigned" label.

Decisions taken with the user (design critique session, 2026-10-26):

- **Direction: evaluation-driven.** The overview is organised around the areas the agent is scored on. Each area shows the agent's current score next to the material assigned to close the gap, and the results tab shows whether scores moved after completion.
- **Scope:** the overview page (all three tabs) and the content player page. Manager/supervisor LMS screens stay untouched; shared components they use (`AreaBadge`, `FormatBadge`, `AssignmentDetailDrawer`, players' logic) keep working.
- **Area identity colour:** the five areas get a stable, muted hue from `src/styles/chart-tokens.css` (so learning matches analytics charts). Status hue stays reserved for overdue/needs-response/impact verdicts.
- **Copy and seed data:** stale description, uppercase labels, middle-dot meta strings and the single-author catalogue are cleaned up.

Constraints from `DESIGN_ROLE.md`: mockup quality, no backend, no tests, no dev server, no git commits unless asked in the execution session. The executor must keep both themes correct (Mantine vars, `light-dark()`).

## Design plan (reviewed against the generic default)

- **Memorable element:** one "Start here" hero: the single most urgent item, with its _reason_ set as body copy at `md` size and the agent's current score for that area beside it. Everything else is quiet.
- **Structure encodes information:** areas are ordered weakest score first; rows are hairline-separated, not boxed; colour appears only as a 10px area swatch, a 3px bar on the hero, and the sparkline stroke.
- **Removed template chrome:** eyebrow, KPI tiles, count badges on tabs, "Why this was assigned" label, "Mandatory" badge, uppercase CHAPTERS / THE SITUATION / CUSTOMER / YOUR COACH ASKS labels, `A · B · C` meta strings, raw ISO dates, "Level: Beginner", "By Elena Ruiz".
- **Copy:** sentence case, active verbs, no filler. Dates shown as `12 Sep 2026`.
- **Type:** no new typefaces. Hierarchy comes from size and weight only: hero title `Title order=3`, hero reason `Text size="md"`, row title `sm/600`, row reason `sm` ink (not dimmed), meta `xs` dimmed.

Palette (all via tokens, no hex in components):

| Role                   | Token                                          |
| ---------------------- | ---------------------------------------------- |
| QA area                | `--area-qa` → `--series-1` (blue)              |
| Sentiment area         | `--area-sentiment` → `--series-2` (teal)       |
| Compliance area        | `--area-compliance` → `--series-3` (grape)     |
| Business area          | `--area-business` → `--series-4` (orange)      |
| General                | `--area-general` → `--series-other` (gray)     |
| Overdue / no response  | `danger` theme colour (text only, never fills) |
| Needs-response section | existing `SectionCard headerAccent="yellow"`   |
| Impact verdicts        | existing `VERDICT_COLOR`                       |

Green (theme primary) is never used as an area hue. The team section's `DIMENSION_META` uses a different hue set (orange/violet/green/blue); it is out of scope here and noted for a later alignment.

## Global constraints

- Mantine v9 API (`Grid gap`, `Collapse expanded`, etc.). `AppSegmentedControl` and `EmptyState` are default exports.
- No inline `style={{}}`; CSS Modules, Mantine props, or shared classes only. `tsconfig` has `noUnusedLocals` / `noUnusedParameters`.
- All strings via `useTranslation('qa.lms')`; every key added to both `src/locales/en/qa.lms.json` and `src/locales/es/qa.lms.json`.
- Keep `?tab=` values `assignments | rolePlay | history` (deep links from `LmsContentPage`, `NotificationDetailPage`, `CoachingLearningWidget`).
- Keep `AreaBadge`, `FormatBadge`, `AssignmentStatusBadge`, `AcceptanceBadge`, `ImpactBadge` in `components/Badges.tsx` unchanged (manager screens use them). New agent-side primitives live beside them.
- Agent persona: `AGENT_PERSONA` from `src/modules/qa/lms/constants.ts` (`AGT-004`). Scores: `TEAM_PROFILES[AGENT_PERSONA.id]` from `src/modules/qa/team/mockData.ts` (type `AgentProfile` from `src/modules/qa/team/types.ts`).
- Run `npm run typecheck` after each task. 18 pre-existing errors in `src/views/Campaigns/**` are expected and unrelated.

## File structure

New:

- `src/modules/qa/lms/components/area.module.css` — maps `data-area` to `--lms-area`
- `src/modules/qa/lms/components/AreaMark.tsx` + `AreaMark.module.css`
- `src/modules/qa/lms/components/FormatIcon.tsx`
- `src/modules/qa/lms/components/AreaScoreTile.tsx` + `AreaScoreTile.module.css`
- `src/modules/qa/lms/components/LearningRow.tsx` + `LearningRow.module.css`
- `src/modules/qa/lms/components/DifficultyDots.tsx` + `DifficultyDots.module.css`
- `src/modules/qa/lms/components/RolePlayRow.tsx`
- `src/modules/qa/lms/AgentLmsPage/NextUpCard.tsx` + `NextUpCard.module.css`
- `src/modules/qa/lms/AgentLmsPage/AreaLedger.tsx` + `AreaLedger.module.css`
- `src/modules/qa/lms/LmsContentPage/CompletionPanel.tsx`

Modified:

- `src/styles/chart-tokens.css` (area tokens)
- `src/modules/qa/lms/helpers.ts` (`formatDay`, `pickNextUp`, `areaOrder`, `areaEvidence`)
- `src/modules/qa/lms/AgentLmsPage/AgentLmsPage.tsx`
- `src/modules/qa/lms/AgentLmsPage/tabs/AssignmentsTab.tsx`
- `src/modules/qa/lms/AgentLmsPage/tabs/RolePlayTab.tsx`
- `src/modules/qa/lms/AgentLmsPage/tabs/HistoryTab.tsx`
- `src/modules/qa/lms/components/AcceptanceCard.tsx`
- `src/modules/qa/lms/components/RolePlayDetailDrawer.tsx`
- `src/modules/qa/lms/components/PathStepper.tsx`
- `src/modules/qa/lms/LmsContentPage/LmsContentPage.tsx`
- `src/modules/qa/lms/LmsContentPage/ContentSidebar.tsx`
- `src/modules/qa/lms/LmsContentPage/players/VideoPlayerMock.tsx`
- `src/modules/qa/lms/LmsContentPage/players/ScenarioPlayer.tsx`
- `src/modules/qa/lms/LmsContentPage/players/Players.module.css`
- `src/modules/qa/lms/catalog.ts` (authors, dates)
- `src/locales/en/qa.lms.json`, `src/locales/es/qa.lms.json`

Deleted (orphaned or replaced):

- `src/modules/qa/lms/AgentLmsPage/LearningHeader.tsx`
- `src/modules/qa/lms/AgentLmsPage/tabs/CatalogTab.tsx`
- `src/modules/qa/lms/AgentLmsPage/tabs/PathsTab.tsx`
- `src/modules/qa/lms/components/ContentCard.tsx`
- `src/modules/qa/lms/components/PathCard.tsx`
- `src/modules/qa/lms/components/AssignmentCard.tsx`
- `src/modules/qa/lms/components/RolePlayModelCard.tsx`

Before deleting each file run `rg "from '.*<FileName>'" src` and confirm zero importers (the only expected importers are files this plan rewrites or deletes).

---

## Task 1 — Area tokens and the `data-area` mapping

**1a. `src/styles/chart-tokens.css`** — append inside `:root { … }` after the `--status-*` block:

```css
/* Evaluation-area identity. Learning (and later analytics) read these; never a status colour. */
--area-qa: var(--series-1);
--area-sentiment: var(--series-2);
--area-compliance: var(--series-3);
--area-business: var(--series-4);
--area-general: var(--series-other);
```

**1b. New `src/modules/qa/lms/components/area.module.css`:**

```css
/* Put `.area` + `data-area` on any element; descendants read var(--lms-area). */
.area {
	--lms-area: var(--area-general);
}
.area[data-area='QUALITY_ASSURANCE'] {
	--lms-area: var(--area-qa);
}
.area[data-area='SENTIMENT_EMOTION'] {
	--lms-area: var(--area-sentiment);
}
.area[data-area='COMPLIANCE'] {
	--lms-area: var(--area-compliance);
}
.area[data-area='BUSINESS_INSIGHTS'] {
	--lms-area: var(--area-business);
}
```

**1c. New `src/modules/qa/lms/components/AreaMark.module.css`:**

```css
.swatch {
	width: 10px;
	height: 10px;
	border-radius: 3px;
	flex-shrink: 0;
	background-color: var(--lms-area);
}
```

**1d. New `src/modules/qa/lms/components/AreaMark.tsx`:**

```tsx
import { Group, Text } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import type { LmsArea } from '~/models/qa';
import { LMS_AREA_META } from '../constants';
import areaClasses from './area.module.css';
import classes from './AreaMark.module.css';

interface AreaMarkProps {
	area: LmsArea;
	subItem?: string | null;
	size?: 'xs' | 'sm';
}

/** Area identity: a small swatch in the area hue and the label. Never a chip. */
export function AreaMark({ area, subItem, size = 'xs' }: AreaMarkProps) {
	const { t } = useTranslation('qa.lms');
	return (
		<Group gap={6} wrap='nowrap' className={areaClasses.area} data-area={area}>
			<span className={classes.swatch} aria-hidden />
			<Text size={size} fw={500}>
				{t(LMS_AREA_META[area].labelKey)}
			</Text>
			{subItem && (
				<Text size={size} c='dimmed'>
					{t(`subItems.${subItem}`)}
				</Text>
			)}
		</Group>
	);
}
```

**1e. New `src/modules/qa/lms/components/FormatIcon.tsx`:**

```tsx
import { Tooltip } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import type { LmsFormat } from '~/models/qa';
import { LMS_FORMAT_META } from '../constants';

interface FormatIconProps {
	format: LmsFormat;
	size?: number;
}

/** Format as an icon with a tooltip; the label is only spoken, not printed. */
export function FormatIcon({ format, size = 16 }: FormatIconProps) {
	const { t } = useTranslation('qa.lms');
	const meta = LMS_FORMAT_META[format];
	const Icon = meta.icon;
	return (
		<Tooltip label={t(meta.labelKey)} withArrow>
			<Icon
				size={size}
				color='var(--mantine-color-dimmed)'
				aria-label={t(meta.labelKey)}
			/>
		</Tooltip>
	);
}
```

Typecheck.

---

## Task 2 — Helpers

Edit `src/modules/qa/lms/helpers.ts`. Add imports at the top:

```ts
import dayjs from 'dayjs';
import type { AgentProfile } from '~/modules/qa/team/types';
import { dimensionPercent } from '~/modules/qa/team/helpers';
```

and extend the existing `./constants` import to `import { AREA_TO_DIMENSION, IMPACT_THRESHOLD, LMS_AREAS } from './constants';`.

Append at the end of the file:

```ts
// ── Agent side ────────────────────────────────────────────────────────────────

/** Agent-facing date: `12 Sep 2026`. Never show a raw ISO string to the agent. */
export const formatDay = (iso: string) => dayjs(iso).format('D MMM YYYY');

/** The one item to start with: mandatory and open, earliest due date first (overdue therefore first). */
export const pickNextUp = (rows: LmsAssignment[]): LmsAssignment | undefined =>
	groupAssignments(rows).mandatory[0];

/** The agent's dimension score for an area, or undefined for GENERAL / no profile. */
export const areaDimension = (
	area: LmsArea,
	profile: AgentProfile | undefined
) => {
	if (!profile || area === 'GENERAL') return undefined;
	const key = AREA_TO_DIMENSION[area];
	return profile.dimensions.find((d) => d.key === key);
};

/** Last 12 monthly points of the area's dimension, for a sparkline. */
export const areaSeries = (
	area: LmsArea,
	profile: AgentProfile | undefined
): number[] => {
	if (!profile || area === 'GENERAL') return [];
	const key = AREA_TO_DIMENSION[area];
	return profile.performance.slice(-12).map((p) => p[key]);
};

/** Areas ordered weakest score first; GENERAL always last. */
export const areaOrder = (profile: AgentProfile | undefined): LmsArea[] => {
	const scored = LMS_AREAS.filter((a) => a !== 'GENERAL').sort((a, b) => {
		const da = areaDimension(a, profile);
		const db = areaDimension(b, profile);
		return (
			(da ? dimensionPercent(da) : 100) - (db ? dimensionPercent(db) : 100)
		);
	});
	return [...scored, 'GENERAL'];
};

/** How many completed items in this area were measured, and how many improved. */
export const areaEvidence = (
	area: LmsArea,
	completed: LmsAssignment[],
	contentById: Record<string, LmsContent>
) => {
	const rows = completed.filter((a) => contentById[a.contentId]?.area === area);
	const measured = rows.filter(
		(a) => a.impact && a.impact.verdict !== 'PENDING'
	);
	return {
		finished: rows.length,
		measured: measured.length,
		improved: measured.filter((a) => a.impact?.verdict === 'IMPROVED').length,
	};
};
```

`AREA_TO_DIMENSION` is `Record<EvaluationArea, DimensionKey>`; the `area === 'GENERAL'` guard narrows `LmsArea` to `EvaluationArea` before indexing. `PerformancePoint` has numeric `qa | sentiment | compliance | business` fields (see `buildAgentProfile` in `team/mockData.ts`).

Typecheck.

---

## Task 3 — Locale keys (en + es)

Edit `src/locales/en/qa.lms.json`, inside `"agent": { … }`:

- Delete keys: `eyebrow`, `kpi` (whole object), `assignments.why`, `assignments.mandatory`, `assignments.mandatoryDescription`, `history.kpi` (whole object). Keep `assignments.mandatoryBadge` (used by the manager's `AssignmentDetailDrawer`). Keep `paths.*` and `catalog.*` (dead but harmless).
- Replace `description` with: `"What you've been asked to learn, why it was assigned, and whether it moved your scores."`
- Replace `tabs` with:

```json
"tabs": {
	"assignments": "Assignments",
	"rolePlay": "Practice",
	"history": "Results"
}
```

- In `assignments`, replace `needsResponse` / `needsResponseDescription` / `empty` and add new keys:

```json
"needsResponse": "Needs your answer",
"needsResponseDescription": "Accept the deadline or propose another date. After 48 hours without an answer your supervisor is notified.",
"empty": "Nothing assigned right now",
"emptyDescription": "When your supervisor or a coaching rule assigns material, it shows up here with the reason.",
"assignedOn": "{{name}} assigned this on {{date}}",
"dueOn": "Due {{date}}",
"optional": "Optional",
"progress": "{{value}}% done",
```

- Add a new `"nextUp"` object inside `agent`:

```json
"nextUp": {
	"caption": "Start here",
	"yourScore": "Your {{area}} score",
	"notScored": "Not scored",
	"start": "Start",
	"continue": "Continue"
}
```

- Add a new `"areas"` object inside `agent`:

```json
"areas": {
	"title": "By evaluation area",
	"description": "What you've been assigned for each area you're scored on, next to your current score. Weakest area first.",
	"nothingHere": "Nothing assigned for this area right now.",
	"evidenceNone": "Nothing finished yet",
	"evidence_one": "{{count}} finished, improved after {{improved}}",
	"evidence_other": "{{count}} finished, improved after {{improved}}",
	"evidenceUnmeasured_one": "{{count}} finished",
	"evidenceUnmeasured_other": "{{count}} finished",
	"vsPrevious": "vs previous period"
}
```

- Replace `history` (after deleting `kpi`) with:

```json
"history": {
	"title": "What changed after you finished",
	"description": "Your score on each material's metric, 30 days before against 30 days after.",
	"summary": "{{count}} finished. Scores improved after {{improved}}, held after {{same}}, declined after {{declined}}.",
	"summaryNone": "Nothing finished yet. Results appear 30 days after you complete something.",
	"columns": {
		"material": "Material",
		"area": "Area",
		"completed": "Finished",
		"score": "Score",
		"change": "Before and after",
		"impact": "Impact"
	},
	"impactHint": "30 days before vs 30 days after completion",
	"empty": "Nothing finished yet."
}
```

- Replace `rolePlay.available` / `availableDescription` and add `practice`:

```json
"available": "Clients you can practise with",
"availableDescription": "Your supervisor unlocked these. Each one targets an area you're scored on.",
"practice": "Practise",
```

Inside `"player": { … }`:

- Add `"watched": "{{value}}% watched"` and `"facts": "{{format}}, {{minutes}} min"`.
- Replace `completed` with:

```json
"completed": {
	"title": "Done",
	"message": "We'll measure your {{metric}} for the next 30 days and show the result in Results.",
	"noImpact": "This material is informational, so no score is tracked.",
	"backToList": "Back to My Learning",
	"next": "Next: {{title}}"
}
```

- Add a new `"assignment"` object inside `player`:

```json
"assignment": {
	"title": "Why you're here",
	"assignedOn": "{{name}} assigned this on {{date}}",
	"due": "Due {{date}}"
}
```

- In `meta`, delete `level`, `by`, `author`. Keep `duration`, `assigned`, `due`.
- In `scenario`, keep keys; copy stays.

Edit `src/locales/es/qa.lms.json` with the same structural changes and these values:

```json
"description": "Lo que te han pedido aprender, por qué te lo asignaron y si movió tus puntajes.",
"tabs": { "assignments": "Asignaciones", "rolePlay": "Práctica", "history": "Resultados" },
"assignments": {
	"needsResponse": "Requiere tu respuesta",
	"needsResponseDescription": "Acepta la fecha límite o propón otra. Tras 48 horas sin respuesta se avisa a tu supervisor.",
	"empty": "No tienes nada asignado ahora mismo",
	"emptyDescription": "Cuando tu supervisor o una regla de coaching te asigne material, aparecerá aquí con el motivo.",
	"assignedOn": "{{name}} te lo asignó el {{date}}",
	"dueOn": "Vence el {{date}}",
	"optional": "Opcional",
	"progress": "{{value}}% hecho"
},
"nextUp": {
	"caption": "Empieza por aquí",
	"yourScore": "Tu puntaje de {{area}}",
	"notScored": "Sin puntaje",
	"start": "Empezar",
	"continue": "Continuar"
},
"areas": {
	"title": "Por área de evaluación",
	"description": "Lo que tienes asignado para cada área en la que te evalúan, junto a tu puntaje actual. Primero el área más débil.",
	"nothingHere": "Nada asignado en esta área ahora mismo.",
	"evidenceNone": "Nada terminado todavía",
	"evidence_one": "{{count}} terminado, mejoró en {{improved}}",
	"evidence_other": "{{count}} terminados, mejoraron en {{improved}}",
	"evidenceUnmeasured_one": "{{count}} terminado",
	"evidenceUnmeasured_other": "{{count}} terminados",
	"vsPrevious": "vs periodo anterior"
},
"history": {
	"title": "Qué cambió después de terminar",
	"description": "Tu puntaje en la métrica de cada material, 30 días antes frente a 30 días después.",
	"summary": "{{count}} terminados. El puntaje mejoró en {{improved}}, se mantuvo en {{same}} y bajó en {{declined}}.",
	"summaryNone": "Nada terminado todavía. Los resultados aparecen 30 días después de completar algo.",
	"columns": { "material": "Material", "area": "Área", "completed": "Terminado", "score": "Nota", "change": "Antes y después", "impact": "Impacto" },
	"impactHint": "30 días antes vs 30 días después de completar",
	"empty": "Nada terminado todavía."
},
"rolePlay": { "available": "Clientes con los que puedes practicar", "availableDescription": "Tu supervisor los desbloqueó. Cada uno apunta a un área en la que te evalúan.", "practice": "Practicar", …rest unchanged }
```

and in `player`:

```json
"watched": "{{value}}% visto",
"facts": "{{format}}, {{minutes}} min",
"completed": {
	"title": "Hecho",
	"message": "Mediremos tu {{metric}} durante los próximos 30 días y mostraremos el resultado en Resultados.",
	"noImpact": "Este material es informativo, así que no se mide ningún puntaje.",
	"backToList": "Volver a Mi aprendizaje",
	"next": "Siguiente: {{title}}"
},
"assignment": {
	"title": "Por qué estás aquí",
	"assignedOn": "{{name}} te lo asignó el {{date}}",
	"due": "Vence el {{date}}"
}
```

After editing, run `rg "agent\.(eyebrow|kpi\.|history\.kpi|assignments\.why|assignments\.mandatory\b|assignments\.mandatoryDescription)|player\.meta\.(level|by|author)" src --glob '*.tsx'` — the only hits must be in files this plan deletes or rewrites in later tasks (`LearningHeader.tsx`, `AssignmentsTab.tsx`, `AcceptanceCard.tsx`, `AssignmentCard.tsx`, `HistoryTab.tsx`, `ContentSidebar.tsx`). Those hits disappear by Task 10.

---

## Task 4 — `AreaScoreTile`

**`src/modules/qa/lms/components/AreaScoreTile.module.css`:**

```css
.tile {
	display: flex;
	flex-direction: column;
	gap: 4px;
	min-width: 0;
}

.compact {
	gap: 2px;
}
```

**`src/modules/qa/lms/components/AreaScoreTile.tsx`:**

```tsx
import { Stack, Text } from '@mantine/core';
import { Sparkline } from '@mantine/charts';
import { useTranslation } from 'react-i18next';
import type { LmsArea } from '~/models/qa';
import type { AgentProfile } from '~/modules/qa/team/types';
import {
	alertScoreColor,
	dimensionPercent,
	formatDimensionScore,
} from '~/modules/qa/team/helpers';
import { TrendDelta } from '~/modules/qa/team/components/TrendDelta';
import { LMS_AREA_META } from '../constants';
import { areaDimension, areaSeries } from '../helpers';
import { AreaMark } from './AreaMark';
import areaClasses from './area.module.css';
import classes from './AreaScoreTile.module.css';

interface AreaScoreTileProps {
	area: LmsArea;
	profile: AgentProfile | undefined;
	/** Ledger version: smaller figure, no caption. */
	compact?: boolean;
}

/** The agent's current score for one evaluation area: label, figure, 12-month sparkline, change. */
export function AreaScoreTile({
	area,
	profile,
	compact = false,
}: AreaScoreTileProps) {
	const { t } = useTranslation('qa.lms');
	const dimension = areaDimension(area, profile);
	const series = areaSeries(area, profile);
	const alert = dimension
		? alertScoreColor(dimensionPercent(dimension))
		: undefined;

	return (
		<div
			className={`${areaClasses.area} ${classes.tile} ${compact ? classes.compact : ''}`}
			data-area={area}
		>
			{compact ? (
				<AreaMark area={area} size='sm' />
			) : (
				<Text size='xs' c='dimmed'>
					{t('agent.nextUp.yourScore', {
						area: t(LMS_AREA_META[area].labelKey),
					})}
				</Text>
			)}
			{dimension ? (
				<Stack gap={2}>
					<Text fw={700} size={compact ? 'xl' : '28px'} lh={1.1} c={alert}>
						{formatDimensionScore(dimension)}
					</Text>
					{series.length > 1 && (
						<Sparkline
							h={compact ? 20 : 28}
							data={series}
							color='var(--lms-area)'
							fillOpacity={0.1}
							strokeWidth={1.5}
							curveType='monotone'
						/>
					)}
					<TrendDelta
						delta={dimension.delta}
						trend={dimension.trend}
						unit={dimension.key === 'sentiment' ? '/5' : '%'}
						suffix={t('agent.areas.vsPrevious')}
					/>
				</Stack>
			) : (
				<Text size='sm' c='dimmed'>
					{t('agent.nextUp.notScored')}
				</Text>
			)}
		</div>
	);
}
```

Notes: `alertScoreColor` returns a theme colour name only below 70, so healthy scores stay ink. `TrendDelta` is exported from `src/modules/qa/team/components/TrendDelta.tsx` (props `delta, trend, unit, suffix`). Mantine `Text size` accepts a CSS length string.

Typecheck.

---

## Task 5 — `LearningRow` (replaces `AssignmentCard` on the agent side)

**`src/modules/qa/lms/components/LearningRow.module.css`:**

```css
/* One open item: format icon, title + reason + facts, one quiet action. Hairlines, no boxes. */
.row {
	position: relative;
	display: grid;
	grid-template-columns: auto minmax(0, 1fr) auto;
	gap: var(--mantine-spacing-sm);
	align-items: start;
	padding: var(--mantine-spacing-sm) 0;
}

.row + .row {
	border-top: 1px solid var(--surface-border);
}

.icon {
	display: flex;
	padding-top: 2px;
}

.main {
	display: flex;
	flex-direction: column;
	gap: 2px;
	min-width: 0;
}

.progress {
	position: absolute;
	left: 0;
	right: 0;
	bottom: 0;
}

.due {
	color: light-dark(
		var(--mantine-color-danger-7),
		var(--mantine-color-danger-4)
	);
	font-weight: 600;
}
```

**`src/modules/qa/lms/components/LearningRow.tsx`:**

```tsx
import { Button, Group, Progress, Text } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import type { LmsAssignment, LmsContent } from '~/models/qa';
import { LMS_FORMAT_META } from '../constants';
import { dueLabel, effectiveStatus } from '../helpers';
import { FormatIcon } from './FormatIcon';
import classes from './LearningRow.module.css';

interface LearningRowProps {
	assignment: LmsAssignment;
	content: LmsContent | undefined;
	onOpen: () => void;
}

export function LearningRow({ assignment, content, onOpen }: LearningRowProps) {
	const { t } = useTranslation('qa.lms');
	if (!content) return null;

	const status = effectiveStatus(assignment);
	const overdue = status === 'OVERDUE';
	const inProgress = assignment.progress > 0 && status !== 'COMPLETED';
	const ctaKey = inProgress
		? 'cta.continue'
		: LMS_FORMAT_META[content.format].ctaKey;

	return (
		<div className={classes.row}>
			<span className={classes.icon}>
				<FormatIcon format={content.format} />
			</span>
			<div className={classes.main}>
				<Text size='sm' fw={600}>
					{content.title}
				</Text>
				<Text size='sm'>{assignment.reason}</Text>
				<Group gap='md' wrap='wrap'>
					<Text
						size='xs'
						c='dimmed'
						className={overdue ? classes.due : undefined}
					>
						{dueLabel(t, assignment)}
					</Text>
					<Text size='xs' c='dimmed'>
						{t('common.minutes', { count: content.durationMin })}
					</Text>
					{!assignment.mandatory && (
						<Text size='xs' c='dimmed'>
							{t('agent.assignments.optional')}
						</Text>
					)}
					{inProgress && (
						<Text size='xs' c='dimmed'>
							{t('agent.assignments.progress', { value: assignment.progress })}
						</Text>
					)}
				</Group>
			</div>
			<Button size='xs' variant='subtle' onClick={onOpen}>
				{t(ctaKey)}
			</Button>
			{inProgress && (
				<Progress
					value={assignment.progress}
					size={2}
					radius={0}
					color={overdue ? 'danger' : undefined}
					className={classes.progress}
					aria-hidden
				/>
			)}
		</div>
	);
}
```

Typecheck.

---

## Task 6 — `AcceptanceCard` as a row

Rewrite `src/modules/qa/lms/components/AcceptanceCard.tsx` (keep the file name and props so `AssignmentsTab` keeps importing it):

```tsx
import { Button, Group, Text } from '@mantine/core';
import { IconCheck } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import type { LmsAssignment, LmsContent } from '~/models/qa';
import { ACCEPTANCE_SLA_HOURS } from '../constants';
import { formatDay } from '../helpers';
import { FormatIcon } from './FormatIcon';
import rowClasses from './LearningRow.module.css';

interface AcceptanceCardProps {
	assignment: LmsAssignment;
	content: LmsContent | undefined;
	onAccept: () => void;
	onPropose: () => void;
}

/** An assignment waiting for the agent's answer: the reason, the deadline, two actions. */
export function AcceptanceCard({
	assignment,
	content,
	onAccept,
	onPropose,
}: AcceptanceCardProps) {
	const { t } = useTranslation('qa.lms');
	if (!content) return null;
	const noResponse = assignment.acceptance.status === 'NO_RESPONSE';

	return (
		<div className={rowClasses.row}>
			<span className={rowClasses.icon}>
				<FormatIcon format={content.format} />
			</span>
			<div className={rowClasses.main}>
				<Text size='sm' fw={600}>
					{content.title}
				</Text>
				<Text size='sm'>{assignment.reason}</Text>
				<Group gap='md' wrap='wrap'>
					<Text size='xs' fw={600}>
						{t('agent.assignments.dueOn', {
							date: formatDay(assignment.dueDate),
						})}
					</Text>
					<Text size='xs' c='dimmed'>
						{t('agent.assignments.assignedOn', {
							name: assignment.assignedBy,
							date: formatDay(assignment.assignedAt),
						})}
					</Text>
					<Text size='xs' c='dimmed'>
						{t('common.minutes', { count: content.durationMin })}
					</Text>
				</Group>
				{noResponse && (
					<Text size='xs' className={rowClasses.due}>
						{t('agent.assignments.noResponse', { count: ACCEPTANCE_SLA_HOURS })}
					</Text>
				)}
			</div>
			<Group gap='xs' wrap='nowrap'>
				<Button size='xs' variant='default' onClick={onPropose}>
					{t('agent.assignments.proposeDate')}
				</Button>
				<Button
					size='xs'
					leftSection={<IconCheck size={14} />}
					onClick={onAccept}
				>
					{t('agent.assignments.accept')}
				</Button>
			</Group>
		</div>
	);
}
```

Below `48em` the two buttons would crowd; add to `LearningRow.module.css`:

```css
@media (max-width: 48em) {
	.row {
		grid-template-columns: auto minmax(0, 1fr);
	}
	.row > :nth-child(3) {
		grid-column: 2;
		justify-self: start;
	}
}
```

Typecheck.

---

## Task 7 — `NextUpCard` (the hero)

**`src/modules/qa/lms/AgentLmsPage/NextUpCard.module.css`:**

```css
/* The one memorable element: a 3px bar in the area hue, the reason at body size, the score beside it. */
.hero {
	box-shadow: inset 3px 0 0 var(--lms-area);
}

.grid {
	display: grid;
	grid-template-columns: minmax(0, 1fr) 220px;
	gap: var(--mantine-spacing-xl);
	align-items: start;
}

.score {
	padding-left: var(--mantine-spacing-lg);
	border-left: 1px solid var(--surface-border);
}

@media (max-width: 62em) {
	.grid {
		grid-template-columns: 1fr;
	}
	.score {
		padding-left: 0;
		padding-top: var(--mantine-spacing-md);
		border-left: none;
		border-top: 1px solid var(--surface-border);
	}
}
```

**`src/modules/qa/lms/AgentLmsPage/NextUpCard.tsx`:**

```tsx
import { Button, Group, Stack, Text, Title } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { SectionCard } from '~/components/SectionCard';
import type { LmsAssignment, LmsContent } from '~/models/qa';
import type { AgentProfile } from '~/modules/qa/team/types';
import { AreaMark } from '../components/AreaMark';
import { AreaScoreTile } from '../components/AreaScoreTile';
import { LMS_FORMAT_META } from '../constants';
import { dueLabel, effectiveStatus } from '../helpers';
import areaClasses from '../components/area.module.css';
import rowClasses from '../components/LearningRow.module.css';
import classes from './NextUpCard.module.css';

interface NextUpCardProps {
	assignment: LmsAssignment;
	content: LmsContent;
	profile: AgentProfile | undefined;
	onOpen: () => void;
}

export function NextUpCard({
	assignment,
	content,
	profile,
	onOpen,
}: NextUpCardProps) {
	const { t } = useTranslation('qa.lms');
	const overdue = effectiveStatus(assignment) === 'OVERDUE';
	const inProgress = assignment.progress > 0;

	// `SectionCard` forwards `className` but not data attributes, so the hue
	// variable lives on this wrapper and `.hero` / the sparkline inherit it.
	return (
		<div className={areaClasses.area} data-area={content.area}>
			<SectionCard padding='lg' className={classes.hero} id='next-up'>
				<div className={classes.grid}>
					<Stack gap='sm'>
						<Text size='xs' c='dimmed'>
							{t('agent.nextUp.caption')}
						</Text>
						<Title order={3}>{content.title}</Title>
						<Text size='md'>{assignment.reason}</Text>
						<Group gap='md' wrap='wrap'>
							<AreaMark
								area={content.area}
								subItem={content.subItem}
								size='sm'
							/>
							<Text size='sm' c='dimmed'>
								{t('player.facts', {
									format: t(LMS_FORMAT_META[content.format].labelKey),
									minutes: content.durationMin,
								})}
							</Text>
							<Text
								size='sm'
								c='dimmed'
								className={overdue ? rowClasses.due : undefined}
							>
								{dueLabel(t, assignment)}
							</Text>
						</Group>
						<Group>
							<Button size='sm' onClick={onOpen}>
								{t(inProgress ? 'agent.nextUp.continue' : 'agent.nextUp.start')}
							</Button>
						</Group>
					</Stack>
					<div className={classes.score}>
						<AreaScoreTile area={content.area} profile={profile} />
					</div>
				</div>
			</SectionCard>
		</div>
	);
}
```

Verified: `SectionCard.tsx` lines 84-124 apply `className` to the outer Mantine `Card` and pass no data attributes through, hence the wrapper. `AreaScoreTile` sets its own `data-area` on its root, which resolves to the same hue.

Typecheck.

---

## Task 8 — `AreaLedger`

**`src/modules/qa/lms/AgentLmsPage/AreaLedger.module.css`:**

```css
.block {
	display: grid;
	grid-template-columns: 200px minmax(0, 1fr);
	gap: var(--mantine-spacing-lg);
	padding: var(--mantine-spacing-md) 0;
}

.block + .block {
	border-top: 1px solid var(--surface-border);
}

.side {
	display: flex;
	flex-direction: column;
	gap: 6px;
	min-width: 0;
}

.rows {
	display: flex;
	flex-direction: column;
	min-width: 0;
}

@media (max-width: 48em) {
	.block {
		grid-template-columns: 1fr;
		gap: var(--mantine-spacing-sm);
	}
}
```

**`src/modules/qa/lms/AgentLmsPage/AreaLedger.tsx`:**

```tsx
import { Text } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { SectionCard } from '~/components/SectionCard';
import type { LmsArea, LmsAssignment, LmsContent } from '~/models/qa';
import type { AgentProfile } from '~/modules/qa/team/types';
import { AreaScoreTile } from '../components/AreaScoreTile';
import { LearningRow } from '../components/LearningRow';
import { areaEvidence, areaOrder } from '../helpers';
import classes from './AreaLedger.module.css';

interface AreaLedgerProps {
	open: LmsAssignment[];
	completed: LmsAssignment[];
	contentById: Record<string, LmsContent>;
	profile: AgentProfile | undefined;
	onOpen: (contentId: string) => void;
}

/** One block per evaluation area, weakest first: the score on the left, the open items on the right. */
export function AreaLedger({
	open,
	completed,
	contentById,
	profile,
	onOpen,
}: AreaLedgerProps) {
	const { t } = useTranslation('qa.lms');
	const areas = areaOrder(profile);

	const evidenceLine = (area: LmsArea) => {
		const e = areaEvidence(area, completed, contentById);
		if (e.finished === 0) return t('agent.areas.evidenceNone');
		if (e.measured === 0)
			return t('agent.areas.evidenceUnmeasured', { count: e.finished });
		return t('agent.areas.evidence', {
			count: e.finished,
			improved: e.improved,
		});
	};

	return (
		<SectionCard
			title={t('agent.areas.title')}
			description={t('agent.areas.description')}
			contentSpacing={0}
		>
			{areas.map((area) => {
				const items = open.filter(
					(a) => contentById[a.contentId]?.area === area
				);
				const finished = completed.some(
					(a) => contentById[a.contentId]?.area === area
				);
				if (area === 'GENERAL' && items.length === 0 && !finished) return null;
				return (
					<div key={area} className={classes.block}>
						<div className={classes.side}>
							<AreaScoreTile area={area} profile={profile} compact />
							<Text size='xs' c='dimmed'>
								{evidenceLine(area)}
							</Text>
						</div>
						<div className={classes.rows}>
							{items.length === 0 ? (
								<Text size='sm' c='dimmed' py='sm'>
									{t('agent.areas.nothingHere')}
								</Text>
							) : (
								items.map((a) => (
									<LearningRow
										key={a.id}
										assignment={a}
										content={contentById[a.contentId]}
										onOpen={() => onOpen(a.contentId)}
									/>
								))
							)}
						</div>
					</div>
				);
			})}
		</SectionCard>
	);
}
```

The zero case uses its own key (`evidenceNone`) because English and Spanish plural rules have no `zero` form, so an `evidence_zero` entry would never be picked.

Typecheck.

---

## Task 9 — `AssignmentsTab` and `AgentLmsPage`

Rewrite `src/modules/qa/lms/AgentLmsPage/tabs/AssignmentsTab.tsx`:

```tsx
import { Stack } from '@mantine/core';
import { IconMailForward, IconSchool } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { SectionCard } from '~/components/SectionCard';
import EmptyState from '~/components/EmptyState';
import type { LmsAssignment, LmsContent } from '~/models/qa';
import type { AgentProfile } from '~/modules/qa/team/types';
import { AcceptanceCard } from '../../components/AcceptanceCard';
import { groupAssignments, pickNextUp } from '../../helpers';
import { AreaLedger } from '../AreaLedger';
import { NextUpCard } from '../NextUpCard';

interface AssignmentsTabProps {
	assignments: LmsAssignment[];
	contentById: Record<string, LmsContent>;
	profile: AgentProfile | undefined;
	onOpen: (contentId: string) => void;
	onAccept: (assignmentId: string) => void;
	onPropose: (assignment: LmsAssignment) => void;
}

export function AssignmentsTab({
	assignments,
	contentById,
	profile,
	onOpen,
	onAccept,
	onPropose,
}: AssignmentsTabProps) {
	const { t } = useTranslation('qa.lms');
	const groups = groupAssignments(assignments);
	const nextUp = pickNextUp(assignments);
	const nextContent = nextUp ? contentById[nextUp.contentId] : undefined;
	const rest = [
		...groups.mandatory.filter((a) => a.id !== nextUp?.id),
		...groups.optional,
	];
	const isEmpty = !groups.needsResponse.length && !nextUp && !rest.length;

	if (isEmpty) {
		return (
			<EmptyState
				icon={<IconSchool size={28} />}
				message={t('agent.assignments.empty')}
				description={t('agent.assignments.emptyDescription')}
			/>
		);
	}

	return (
		<Stack gap='lg'>
			{groups.needsResponse.length > 0 && (
				<SectionCard
					title={t('agent.assignments.needsResponse')}
					description={t('agent.assignments.needsResponseDescription')}
					icon={IconMailForward}
					headerAccent='yellow'
					contentSpacing={0}
				>
					{groups.needsResponse.map((a) => (
						<AcceptanceCard
							key={a.id}
							assignment={a}
							content={contentById[a.contentId]}
							onAccept={() => onAccept(a.id)}
							onPropose={() => onPropose(a)}
						/>
					))}
				</SectionCard>
			)}

			{nextUp && nextContent && (
				<NextUpCard
					assignment={nextUp}
					content={nextContent}
					profile={profile}
					onOpen={() => onOpen(nextContent.id)}
				/>
			)}

			<AreaLedger
				open={rest}
				completed={groups.completed}
				contentById={contentById}
				profile={profile}
				onOpen={onOpen}
			/>
		</Stack>
	);
}
```

Edit `src/modules/qa/lms/AgentLmsPage/AgentLmsPage.tsx`:

- Remove the `Badge` import, the `LearningHeader` import and `<LearningHeader … />`, and the `counts` object.
- Add `import { TEAM_PROFILES } from '~/modules/qa/team/mockData';` and `const profile = TEAM_PROFILES[AGENT_PERSONA.id];`.
- `ContentContainer` gets `title={t('agent.title')}` and `description={t('agent.description')}` (same pattern as `AgentCoachingPage.tsx`).
- Each `Tabs.Tab` keeps its `leftSection` icon and loses `rightSection` entirely.
- Pass `profile={profile}` to `AssignmentsTab`.
- The outer `Stack gap='lg'` now only wraps the `Tabs` (keep it; harmless).

Delete `src/modules/qa/lms/AgentLmsPage/LearningHeader.tsx`, `tabs/CatalogTab.tsx`, `tabs/PathsTab.tsx`, `components/ContentCard.tsx`, `components/PathCard.tsx`, `components/AssignmentCard.tsx` (after `rg "AssignmentCard'" src` shows no importer left).

Typecheck.

---

## Task 10 — Practice tab (role play)

**`src/modules/qa/lms/components/DifficultyDots.module.css`:**

```css
.dots {
	display: inline-flex;
	gap: 3px;
	align-items: center;
}

.dot {
	width: 6px;
	height: 6px;
	border-radius: 50%;
	background-color: var(--surface-border-strong);
}

.on {
	background-color: var(--mantine-color-text);
}
```

**`src/modules/qa/lms/components/DifficultyDots.tsx`:**

```tsx
import { Group, Text, Tooltip } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import type { RolePlayDifficulty } from '~/models/qa';
import { ROLE_PLAY_DIFFICULTY_META } from '../constants';
import classes from './DifficultyDots.module.css';

const LEVEL: Record<RolePlayDifficulty, number> = {
	EASY: 1,
	MEDIUM: 2,
	HARD: 3,
};

/** Difficulty as a 3-step scale; the word is in the tooltip and beside it. */
export function DifficultyDots({
	difficulty,
}: {
	difficulty: RolePlayDifficulty;
}) {
	const { t } = useTranslation('qa.lms');
	const label = t(ROLE_PLAY_DIFFICULTY_META[difficulty].labelKey);
	return (
		<Tooltip label={label} withArrow>
			<Group gap={6} wrap='nowrap'>
				<span className={classes.dots} role='img' aria-label={label}>
					{[1, 2, 3].map((n) => (
						<span
							key={n}
							className={`${classes.dot} ${n <= LEVEL[difficulty] ? classes.on : ''}`}
						/>
					))}
				</span>
				<Text size='xs' c='dimmed'>
					{label}
				</Text>
			</Group>
		</Tooltip>
	);
}
```

**`src/modules/qa/lms/components/RolePlayRow.tsx`:**

```tsx
import { Button, Group, Text, ThemeIcon } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import type { RolePlayModel } from '~/models/qa';
import { ROLE_PLAY_PERSONA_META } from '../constants';
import { AreaMark } from './AreaMark';
import { DifficultyDots } from './DifficultyDots';
import rowClasses from './LearningRow.module.css';

interface RolePlayRowProps {
	model: RolePlayModel;
	onOpen: () => void;
}

export function RolePlayRow({ model, onOpen }: RolePlayRowProps) {
	const { t } = useTranslation('qa.lms');
	const persona = ROLE_PLAY_PERSONA_META[model.persona];
	const PersonaIcon = persona.icon;
	return (
		<div className={rowClasses.row}>
			<ThemeIcon
				size='lg'
				radius='xl'
				variant='light'
				color='gray'
				aria-label={t(persona.labelKey)}
			>
				<PersonaIcon size={18} />
			</ThemeIcon>
			<div className={rowClasses.main}>
				<Text size='sm' fw={600}>
					{model.name}
				</Text>
				<Text size='sm'>{model.description}</Text>
				<Group gap='md' wrap='wrap'>
					<AreaMark area={model.area} subItem={model.subItem} />
					<DifficultyDots difficulty={model.difficulty} />
				</Group>
			</div>
			<Button size='xs' variant='subtle' onClick={onOpen}>
				{t('agent.rolePlay.practice')}
			</Button>
		</div>
	);
}
```

Edit `src/modules/qa/lms/AgentLmsPage/tabs/RolePlayTab.tsx`: replace the `SimpleGrid` + `RolePlayModelCard` with `contentSpacing={0}` on the `SectionCard` and `available.map((model) => <RolePlayRow key={model.id} model={model} onOpen={() => setSelected(model)} />)`. Remove the `SimpleGrid` import. Empty state: `<EmptyState icon={<IconMasksTheater size={28} />} message={t('agent.rolePlay.noneAvailable')} />`.

Edit `src/modules/qa/lms/components/RolePlayDetailDrawer.tsx`: replace the badge row with `<Group gap='md'><AreaMark area={model.area} subItem={model.subItem} size='sm' /><DifficultyDots difficulty={model.difficulty} /></Group>`; replace the nested `SectionCard` with `<Stack gap='xs'><Text size='sm' fw={600}>{t('agent.rolePlay.objectives')}</Text><List size='sm' spacing='xs'>…</List></Stack>`. Drop the `Badge` and `SectionCard` imports; keep `AppDrawer`.

Delete `components/RolePlayModelCard.tsx`.

Typecheck.

---

## Task 11 — Results tab (history)

Edit `src/modules/qa/lms/AgentLmsPage/tabs/HistoryTab.tsx`:

- Remove `SimpleGrid`, `StatCard` imports and the KPI grid.
- Add imports: `IconArrowRight` from tabler, `AreaMark`, `FormatIcon`, `formatDay`.
- Compute `same = completed.filter((a) => a.impact?.verdict === 'SAME').length` beside `improved`/`declined`; drop `scored` (unused once the KPI goes; keep the `score` column cell as is).
- Above the `SectionCard`, render:

```tsx
<Text size='sm'>
	{completed.length === 0
		? t('agent.history.summaryNone')
		: t('agent.history.summary', {
				count: completed.length,
				improved,
				same,
				declined,
			})}
</Text>
```

- Columns, in order: `material` (title + `<FormatIcon format={c.format} size={14} />`, drop `FormatBadge`), new `area` (`<AreaMark area={c.area} />`, header `agent.history.columns.area`), `completed` (cell `formatDay(info.getValue())` when present), `score`, new `change` replacing `metric`/`before`/`after`:

```tsx
helper.display({
	id: 'change',
	header: t('agent.history.columns.change'),
	cell: (info) => {
		const impact = info.row.original.impact;
		if (!impact) return <Text size='sm' c='dimmed'>—</Text>;
		return (
			<Group gap={4} wrap='nowrap'>
				<Text size='sm'>{impact.baseline}</Text>
				<IconArrowRight size={12} color='var(--mantine-color-dimmed)' />
				<Text size='sm' fw={600}>{impact.checkpoint30 ?? '—'}</Text>
				<Text size='xs' c='dimmed'>{metricLabel(info.row.original)}</Text>
			</Group>
		);
	},
}) as BaseTableColumnDef<LmsAssignment>,
```

then `impact` (unchanged).

- `SectionCard` title/description read the new keys; keep `headerActions` hint.
- Drawer: `description` becomes `t('agent.history.columns.completed') + ': ' + formatDay(selected.completedAt)` when present.

Typecheck.

---

## Task 12 — Player page: header, sidebar, completion

**New `src/modules/qa/lms/LmsContentPage/CompletionPanel.tsx`:**

```tsx
import { Button, Group, Stack, Text, ThemeIcon, Title } from '@mantine/core';
import { IconCheck } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { SectionCard } from '~/components/SectionCard';

interface CompletionPanelProps {
	metricName: string | null;
	nextTitle?: string;
	onBack: () => void;
	onNext?: () => void;
}

/** Replaces the player once the material is complete: one check, one sentence, where to go next. */
export function CompletionPanel({
	metricName,
	nextTitle,
	onBack,
	onNext,
}: CompletionPanelProps) {
	const { t } = useTranslation('qa.lms');
	return (
		<SectionCard padding='xl'>
			<Stack align='center' gap='sm' py='lg'>
				<ThemeIcon size={64} radius='xl' variant='light' color='green'>
					<IconCheck size={32} />
				</ThemeIcon>
				<Title order={3}>{t('player.completed.title')}</Title>
				<Text size='sm' ta='center' maw={420}>
					{metricName
						? t('player.completed.message', { metric: metricName })
						: t('player.completed.noImpact')}
				</Text>
				<Group gap='xs' mt='xs'>
					<Button variant='default' onClick={onBack}>
						{t('player.completed.backToList')}
					</Button>
					{nextTitle && onNext && (
						<Button onClick={onNext}>
							{t('player.completed.next', { title: nextTitle })}
						</Button>
					)}
				</Group>
			</Stack>
		</SectionCard>
	);
}
```

Edit `src/modules/qa/lms/LmsContentPage/LmsContentPage.tsx`:

- Remove the `IconCircleCheck` import and the `justCompleted` `<Alert>` block. Keep the `Alert` import (the not-assigned notice still uses it). Add imports for `AreaMark` (`../components/AreaMark`), `CompletionPanel` (`./CompletionPanel`) and `Group` from Mantine.
- Compute `const next = path ? nextModule(path, enrollment, contentById) : undefined;` (import `nextModule` from `../helpers`).
- Header block becomes:

```tsx
<Stack gap={6}>
	<Title order={2}>{item.title}</Title>
	<Group gap='md' wrap='wrap'>
		<AreaMark area={item.area} subItem={item.subItem} size='sm' />
		<Text size='sm' c='dimmed'>
			{t('player.facts', {
				format: t(`formats.${item.format}`),
				minutes: item.durationMin,
			})}
		</Text>
	</Group>
	<Text size='sm'>{item.summary}</Text>
</Stack>
```

- The `!assignment` notice stays an `Alert` but `color='gray' variant='light'`.
- Where the player `SectionCard` renders: `justCompleted ? <CompletionPanel metricName={metricName} nextTitle={next && next.id !== item.id ? next.title : undefined} onBack={() => navigate(isManager ? listPath : `${AGENT_LMS_PATH}?tab=assignments`)} onNext={next ? () => openModule(next.id) : undefined} /> : <SectionCard padding='md'>…players…</SectionCard>`.

Rewrite `src/modules/qa/lms/LmsContentPage/ContentSidebar.tsx`:

```tsx
import { Button, Group, Stack, Text } from '@mantine/core';
import { IconRoute } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { SectionCard } from '~/components/SectionCard';
import type {
	LmsAssignment,
	LmsContent,
	LmsLearningPath,
	LmsPathEnrollment,
} from '~/models/qa';
import {
	AcceptanceBadge,
	AssignmentStatusBadge,
	ImpactBadge,
} from '../components/Badges';
import { ImpactSparkline } from '../components/ImpactSparkline';
import { PathStepper } from '../components/PathStepper';
import { formatDay, nextModule } from '../helpers';

interface ContentSidebarProps {
	content: LmsContent;
	assignment?: LmsAssignment;
	path?: LmsLearningPath;
	enrollment?: LmsPathEnrollment;
	contentById: Record<string, LmsContent>;
	onOpenModule: (contentId: string) => void;
}

export function ContentSidebar({
	content,
	assignment,
	path,
	enrollment,
	contentById,
	onOpenModule,
}: ContentSidebarProps) {
	const { t } = useTranslation(['qa.lms', 'qa.triggers']);
	const next = path ? nextModule(path, enrollment, contentById) : undefined;

	return (
		<Stack gap='md'>
			{assignment && (
				<SectionCard title={t('player.assignment.title')} padding='md'>
					<Stack gap='sm'>
						<Text size='sm'>{assignment.reason}</Text>
						<Stack gap={4}>
							<Text size='xs' c='dimmed'>
								{t('player.assignment.assignedOn', {
									name: assignment.assignedBy,
									date: formatDay(assignment.assignedAt),
								})}
							</Text>
							<Text size='xs' fw={600}>
								{t('player.assignment.due', {
									date: formatDay(assignment.dueDate),
								})}
							</Text>
						</Stack>
						<Group gap='xs'>
							<AssignmentStatusBadge assignment={assignment} size='xs' />
							<AcceptanceBadge acceptance={assignment.acceptance} size='xs' />
						</Group>
					</Stack>
				</SectionCard>
			)}

			{assignment?.impact && (
				<SectionCard title={t('impact.title')} padding='md'>
					<Stack gap='sm'>
						<Group gap='xs'>
							<ImpactBadge impact={assignment.impact} size='xs' />
							<Text size='xs' c='dimmed'>
								{t(`metrics.${assignment.impact.metricId}`, {
									ns: 'qa.triggers',
								})}
							</Text>
						</Group>
						<ImpactSparkline impact={assignment.impact} height={70} />
					</Stack>
				</SectionCard>
			)}

			{path && (
				<SectionCard
					title={t('player.partOfPath', { path: path.title })}
					icon={IconRoute}
					padding='md'
				>
					<Stack gap='sm'>
						<PathStepper
							path={path}
							enrollment={enrollment}
							contentById={contentById}
							onOpenModule={onOpenModule}
						/>
						{next && next.id !== content.id && (
							<Button
								size='xs'
								variant='light'
								onClick={() => onOpenModule(next.id)}
							>
								{t('player.completed.next', { title: next.title })}
							</Button>
						)}
					</Stack>
				</SectionCard>
			)}
		</Stack>
	);
}
```

Edit `src/modules/qa/lms/components/PathStepper.tsx`: replace the `description` with `<Text size='xs' c='dimmed'>{t('player.facts', { format: t(`formats.${content.format}`), minutes: content.durationMin })}{module.required ? '' : ` (${t('agent.assignments.optional').toLowerCase()})`}</Text>`; drop the `Badge` and `Group` imports.

Typecheck.

---

## Task 13 — Players: posters, labels, status lines

Edit `src/modules/qa/lms/LmsContentPage/players/Players.module.css`: replace the `.poster` block and all four `.poster[data-area=…]` blocks with:

```css
/* Flat tint in the area hue; the hue comes from area.module.css on the same element. */
.poster {
	position: relative;
	aspect-ratio: 16 / 9;
	border-radius: var(--mantine-radius-md);
	display: flex;
	align-items: center;
	justify-content: center;
	overflow: hidden;
	background-color: light-dark(
		color-mix(in srgb, var(--lms-area) 14%, var(--mantine-color-white)),
		color-mix(in srgb, var(--lms-area) 22%, var(--mantine-color-dark-6))
	);
}
```

Keep `.playButton`, `.chapterActive`, `.markdown`, `.bubbleCustomer`, `.bubbleCoach`.

Edit `VideoPlayerMock.tsx`:

- `import areaClasses from '../../components/area.module.css';` and the poster becomes `<div className={`${areaClasses.area} ${classes.poster}`} data-area={content.area}>`.
- Replace the two-text status line with one: `<Group justify='space-between'><Text size='xs' c='dimmed'>{formatTime(elapsed)} / {formatTime(totalSec)}</Text><Text size='xs' c='dimmed'>{t('player.watched', { value: percent })}</Text></Group>`.
- Chapters label: `<Text size='sm' fw={600} mb={4}>{t('player.chapters')}</Text>` (no `tt`, no `c='dimmed'`).

Edit `ScenarioPlayer.tsx`:

- `Blockquote color='gray'`.
- The situation label: `<Text size='sm' fw={600} mb={4}>` (drop `tt='uppercase'`, `c='dimmed'`, `size='xs'`).
- Timeline item titles: `<Text size='xs' fw={600}>` (drop `tt='uppercase'` and `c='dimmed'`).

Typecheck.

---

## Task 14 — Seed data: authors and dates

Edit `src/modules/qa/lms/catalog.ts`. Set `author` / `publishedAt` / `updatedAt` per item (manager screens show authors; the agent side no longer does, but the sameness still reads as generated in the manager library):

| ids                                         | author              | publishedAt  | updatedAt    |
| ------------------------------------------- | ------------------- | ------------ | ------------ |
| lms-c01, lms-c03, lms-c07, lms-c24, lms-c25 | `Elena Ruiz`        | `2026-03-02` | `2026-08-20` |
| lms-c02, lms-c04, lms-c06                   | `Maria García`      | `2026-04-14` | `2026-07-01` |
| lms-c05, lms-c11, lms-c18, lms-c23          | `Quality team`      | `2026-05-05` | `2026-09-01` |
| lms-c08, lms-c09, lms-c10, lms-c12, lms-c13 | `Compliance office` | `2026-01-12` | `2026-08-28` |
| lms-c26                                     | `Compliance office` | `2025-01-10` | `2025-12-15` |
| lms-c14, lms-c15, lms-c16, lms-c17, lms-c19 | `Lucía Fernández`   | `2026-02-23` | `2026-06-10` |
| lms-c20, lms-c21, lms-c22                   | `Sales enablement`  | `2026-06-01` | `2026-09-05` |

Do not change ids, titles, formats, areas, `impactMetricId`, bodies, questions or stats. Typecheck.

---

## Task 15 — Final sweep

1. `npm run typecheck` — only the pre-existing `src/views/Campaigns/**` errors remain.
2. `rg "tt='uppercase'" src/modules/qa/lms` — zero hits on the agent side (`Caption` in coaching is out of scope).
3. `rg " · " src/modules/qa/lms --glob '*.tsx'` — zero hits in agent-facing components (manager tables may keep theirs).
4. `rg "agent\.(eyebrow|kpi\.|history\.kpi)" src` — zero hits.
5. `rg "LearningHeader|CatalogTab|PathsTab|ContentCard|PathCard|AssignmentCard|RolePlayModelCard" src` — zero hits.
6. Every new `.module.css` uses `light-dark()` or Mantine/surface tokens only; no raw hex.
7. Do not start the dev server and do not commit (DESIGN_ROLE.md); report what was not visually verified.

## Verification (manual, by the user when they run the app)

- `/qa/agent/lms` light and dark: no eyebrow, no KPI tiles, tabs without counts, "Needs your answer" (yellow accent) with two rows, "Start here" hero showing _Regulatory Disclosures 2026_ (overdue 7 days, 20% done) with the Compliance score tile on the right, then "By evaluation area" with Business Insights first (lowest base score 0.60), each area block showing score + sparkline + evidence line and hairline rows; the optional price-objections item appears under Business Insights with "Optional".
- `?tab=rolePlay`: four rows with persona icon, description, area mark, difficulty dots, "Practise" button; drawer without nested card.
- `?tab=history`: one summary sentence, table with Area and "Before and after" columns, dates as `29 Jul 2026`.
- `/qa/agent/lms/lms-c08`: header with area mark and "Document, 15 min"; sidebar "Why you're here" with reason and `Due 5 Sep 2026`; no author/level. Complete a video (`lms-c03`) to see the Done panel replace the player. Video poster is a flat tint, not a gradient; "Chapters" sentence case.
- Supervisor/QA-manager LMS pages still render (they keep `AreaBadge`/`FormatBadge`).

## Out of scope, noted for later

- Align `DIMENSION_META` colours in the team section with `--area-*` tokens.
- `CoachingLearningWidget` on the agent dashboard still hardcodes English and uses the old card look.
- `agent.paths.*` and `agent.catalog.*` locale keys are dead after the orphan deletion and can be pruned.
