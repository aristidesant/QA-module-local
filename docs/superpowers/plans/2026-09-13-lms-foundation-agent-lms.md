# LMS + Coaching — three chained plans (Supervisor / QA Manager / Agent)

> **Executor instructions (Haiku):** this file holds THREE plans. Before starting, split it into
> `docs/superpowers/plans/2026-09-13-lms-foundation-agent-lms.md` (Plan 1),
> `docs/superpowers/plans/2026-09-13-lms-manager.md` (Plan 2) and
> `docs/superpowers/plans/2026-09-13-coaching.md` (Plan 3), each with the **Context**, **Shared conventions** and
> **Global constraints** sections copied at the top. Execute in order 1 → 2 → 3. Run a **foreground**
> `npx tsc --noEmit -p .` after every task (background typecheck + log grep has returned false "0 errors" before).
> Do not run the dev server, tests or commits unless the user asks.

---

## Context

The QA platform (Supervisor `/qa/supervisor/*`, QA Manager `/qa/qa-manager/*`, Agent `/qa/agent/*`) already evaluates
every call on four aspects — **Quality Assurance, Compliance, Sentiment & Emotion, Business Insights** — and already has
Triggers (alert/recognition rules), Your Team + Agent Profile, Customers, and an Agent Inbox. What it lacks is the
**closing of the loop**: when an agent scores low on an aspect, nothing turns that into learning, and nothing measures
whether learning changed the score.

The user (Product Designer, stakeholder mockups, see `DESIGN_ROLE.md`) asked for two strongly linked sections:

- **LMS** (Learning Management System): a catalogue of videos, documents, quizzes and practice scenarios, tagged by the
  same four aspects; learning paths; and an agent view with pending assignments, mandatory material with deadlines, quizzes
  with deadlines, and available material.
- **Coaching** (Supervisor / QA Manager): a configurator that tracks performance and behaviour per agent and per aspect,
  lets managers add **rules** ("if compliance < 80 over 14 days → assign the Compliance certification, due in 14 days"),
  assigns material manually or in bulk, requires the **agent to accept the deadline** (or propose another), tracks
  completion, and shows whether performance **improved / stayed / declined** after the material was consumed.

Industry patterns we deliberately copy (research done 2026-09-13): EvaluAgent *Smart Triggers* (auto-enrol on repeated
line-item failures / compliance breaches), Observe.AI (evidence-linked sessions, documented commitments, follow-up
reminders, coaching→KPI reports), Centrical (prioritised "who needs attention today" queue, KPI-triggered microlearning,
measure whether learning moved the KPI), Zendesk QA (sessions with pinned calls, action items, upcoming/completed/overdue,
"impact on quality score" panel), Cresta/SQM (explicit agent commitment, checkpoints at 15/30 days, before/after by cycle).

### What already exists (verified 2026-09-13) — reuse, do not duplicate

| Thing | Where | State |
|---|---|---|
| Routes `/qa/qa-manager/coaching`, `/qa/qa-manager/lms` | `src/routes.tsx:1141-1162` | registered, render 24-line stubs, **not in sidebar** |
| Route `/qa/agent/lms` | `src/routes.tsx:909-919` | registered, page is hard-coded English mock (`src/modules/qa/agent/lms/AgentLMSPage.tsx`) |
| Stubs to delete | `src/modules/qa/qamanager/pages/{CoachingPage,LmsPage}.tsx`, `src/modules/qa/supervisor/pages/{CoachingPage,LmsPage}.tsx` | identical placeholders |
| Agent nav LMS entry | `src/components/Sidebar/roleNavigation.tsx:67-73` | uses `IconLock` (wrong icon) |
| Agent Profile tab "Coaching & LMS" | `src/modules/qa/team/AgentProfilePage/tabs/CoachingLmsTab.tsx` | reads `profile.coaching` / `profile.lms` |
| Modals | `src/modules/qa/team/components/modals/{AssignLmsModal,ScheduleCoachingModal}.tsx` | write to `teamStore`, push inbox notification |
| `teamStore.assignLms` / `scheduleCoaching` | `src/stores/qa/teamStore.ts:39-61` | coaching notification links to `/qa/agent/coaching` — **route does not exist** |
| Legacy catalogue `LMS_CATALOG` (8 items, `dimension: DimensionKey`) | `src/modules/qa/team/constants.ts:116-125` | consumed by `team/mockData.ts:259` and `AssignLmsModal` |
| Triggers condition engine | `src/models/qa/triggerRules.ts`, `src/modules/qa/triggers/{constants,helpers}.ts`, `components/ConditionRow`, `components/PreviewPanel` | 21 metrics × 4 areas, sub-items, 4 condition modes — **reuse for coaching rules** |
| App chooser cards "Coaching" / "LMS" → `/coaching`, `/lms` | `src/utils/computeAccessibleApps.ts:42,59-62`, `src/hooks/useCurrentApp.ts` | no routes behind them |
| Sidebar label keys | `src/locales/{en,es}/common.json` → `sidebar.agent.*`, `sidebar.supervisor.*`, `sidebar.qamanager.*` (`Sidebar.tsx` translates `item.label` with the **common** namespace; `item.i18nNamespace` is only prefetched) | add new keys here, never in `qa.agent.json` |

### Decisions taken with the user (2026-09-13)

1. **Three chained plans**: (1) LMS foundation + Agent LMS, (2) LMS Manager, (3) Coaching.
2. LMS and Coaching are **QA sub-sections** (`/qa/<role>/lms|coaching`); `/lms` and `/coaching` redirect.
3. Coaching owns its **own rules** (new model) but **reuses the Triggers condition builder** (`ConditionRow`, `PreviewPanel`, metric catalogue). Triggers stays alerts/recognition only.
4. **QA Manager owns content** (publish/archive, global rules, all teams). **Supervisor** browses, assigns to their team, creates team-scoped rules, runs 1:1s.
5. Agent response to an assignment: **Accept** or **Propose new date (with reason)** → supervisor approves/rejects in Coaching/LMS. No response in 48 h → `NO_RESPONSE`, surfaces in the coaching queue.
6. Impact measurement: **30 days before vs 30 days after completion**, checkpoints at 15 and 30 days, verdict Improved (≥ +3) / Same (±3) / Declined (≤ −3) on the content's linked metric; sparkline with a completion marker.
7. People grouping in Coaching: **teams + custom cohorts**.
8. LMS authoring: **library + assignment only** (seeded catalogue; no create-content forms).
9. Agent sees coaching sessions/commitments in a **"Coaching" tab inside My Learning**; `/qa/agent/coaching` redirects to `/qa/agent/lms?tab=coaching`.
10. Content formats: **Video, Document, Quiz, Practice scenario (role-play)**. Learning paths are ordered sets of those.
11. Coaching tabs: **Queue, Agents, Cohorts, Rules, Sessions, Impact**. LMS Manager tabs: **Library, Learning paths, Assignments, Reports**.

---

## Shared conventions (apply to all three plans)

- **Roster & personas** (from `src/modules/qa/team/mockData.ts` + `constants.ts`): Supervisor **Maria García** `SUP-001` (Team 1: AGT-001 Sarah Johnson, AGT-002 Mike Chen, AGT-003 Jessica Martinez, **AGT-004 John Smith** = agent persona, AGT-005 Emma Davis, AGT-006 David Brown (burnout HIGH), AGT-007 Lisa Wong); Juan Pérez `SUP-002` (Team 2, AGT-008…014); Laura Gómez `SUP-003` (Team 3, AGT-015…021, AGT-017 Nina Patel burnout HIGH, AGT-015/AGT-020 have skill `Mentor`); QA Manager **Elena Ruiz** `QAM-001`. Campaigns `camp-001` Q3 Customer Service · `camp-002` Sales Training · `camp-003` Q4 Compliance · `camp-004` Tech Support. Clock: `NOW_ISO = '2026-09-12T15:00:00Z'` from `~/modules/qa/team/constants`.
- **Role from path**: reuse `roleFromPath` (`~/modules/qa/team/helpers`, returns `'supervisor' | 'qa-manager'`). Supervisor scope = agents whose `supervisorId === 'SUP-001'`; QA Manager = everyone.
- **Page shell**: `ContentContainer contentWidth='full'` → `Stack gap='lg'` → eyebrow/title/description `Group` (copy `src/modules/qa/triggers/TriggersPage/TriggersPage.tsx:112-128`) → KPI strip (`SimpleGrid cols={{ base: 2, md: 4 }}` of `StatCard` from `~/components/StatCard`, props `title, value, subtitle?, color?, icon?, badge?, variant?`) → Mantine `Tabs` with `Badge` counters in `rightSection`, `keepMounted={false}`, tab persisted in `?tab=` via `useSearchParams` (copy `AgentProfilePage.tsx:37-45`). Drawers/modals rendered outside the `Stack`.
- **Primitives**: `SectionCard` (`~/components/SectionCard`, named + default; `title, description, icon, headerActions, footer, padding`), `AppDrawer` (`~/components/AppDrawer`, `opened, onClose, title, description, icon, iconColor, size, headerActions, position`) — never Mantine `Drawer`; `BaseTable` (**default export** from `~/components/BaseTable/BaseTable`, type `BaseTableColumnDef`; props `data, columns, getRowId, initialSort, onRowClick, density='compact', emptyMessage, enablePagination, pageSize, getRowClassName`); `EmptyState` (default export, `icon?, message, description?, action?`); toasts via `notifySuccess/notifyWarning` from `~/modules/qa/utils/notifications`.
- **Columns**: `createColumnHelper<T>()` and cast each column `as BaseTableColumnDef<T>` (pattern in `CoachingLmsTab.tsx`).
- **Charts**: `@mantine/charts` 9.2 (`AreaChart`, `BarChart`, `Sparkline`, `DonutChart`). Dates: `dayjs`. Markdown: `@uiw/react-markdown-preview` (already installed) for document bodies. No video library — mock the player.
- **Stores**: plain `create()` Zustand stores under `src/stores/qa/`, seeded from a mock module, id counters `let counter = N; const nextId = (p) => \`${p}-${++counter}\``. **Never build a new array inside a selector** (`useStore((s) => s.items.filter(...))` loops forever) — select the stable slice and `useMemo` in the component.
- **i18n**: one namespace per section (`qa.lms`, `qa.coaching`), files `src/locales/{en,es}/<ns>.json` (auto-discovered by `src/locales/i18n.ts` glob). Register route ids in `src/modules/qa/qaNamespaces.ts`. Never hard-code UI strings. Both languages always.
- **Styling**: Mantine tokens only, `light-dark()` for manual colours, CSS Modules; no inline styles (except `// inline-style-allow:` with a Mantine var). Every component must look right in light and dark.
- **Mantine gotchas**: `Grid` prop is `gap` not `gutter` (prefer `SimpleGrid`); `Progress`, `RingProgress`, `Timeline`, `Stepper`, `SegmentedControl`, `MultiSelect`, `Chip.Group` are all available.
- **Cross-section notifications**: push into `useNotificationStore.getState().addNotification({...})` with the full `AgentNotification` shape (copy the `notify()` helper from `teamStore.ts:27-32`).
- **Pre-existing typecheck errors** in `src/views/Campaigns/pages/CampaignCreate.tsx`, `CampaignDetail.tsx`, `ConversationAspects.tsx` are unrelated — ignore them, everything else must be clean.

## Global constraints

- Mock only: no API calls, no persistence, no backend. State lives in Zustand for the session.
- Do only what each task says; no extra polish.
- Keep the existing `TEAM_PROFILES`, roster names and routes; do not reintroduce the old demo names (Carlos López, etc.).
- Preserve the Agent Profile behaviour (nine tabs, three header actions) while re-pointing it at the new stores.

---

# PLAN 1 — LMS Foundation + Agent "My Learning"

## Goal

Create the single LMS domain model (content, learning paths, assignments with acceptance + impact), the `lmsStore`, the
`qa.lms` namespace, and the agent-facing **My Learning** section at `/qa/agent/lms` (five tabs + content player at
`/qa/agent/lms/:contentId`). Re-point the existing `teamStore`/Agent Profile LMS pieces at the new store so managers and
agents share the same data. Fix the dead links and the App Chooser cards.

## Architecture

```
src/models/qa/lms.ts                      ← domain types (exported from src/models/qa/index.ts)
src/modules/qa/lms/
  constants.ts                            ← AGENT_PERSONA, area/format/status meta, sub-item labels, mapping helpers
  mockData.ts                             ← LMS_CONTENT (25), LMS_PATHS (5), seeded assignments + enrollments + impact
  catalog.ts                              ← LMS_CONTENT (26) + LMS_PATHS (5); NO imports from team/* (breaks the import cycle)
  helpers.ts                              ← selectors-as-functions, date helpers, verdict, reason builders
  AgentLmsPage/
    AgentLmsPage.tsx  index.ts  AgentLmsPage.module.css
    LearningHeader.tsx                    ← title + RingProgress of active path + KPI strip
    tabs/AssignmentsTab.tsx  tabs/PathsTab.tsx  tabs/CatalogTab.tsx  tabs/HistoryTab.tsx  tabs/AgentCoachingTab.tsx
  LmsContentPage/
    LmsContentPage.tsx  index.ts  LmsContentPage.module.css
    players/VideoPlayerMock.tsx  players/DocumentReader.tsx  players/QuizPlayer.tsx  players/ScenarioPlayer.tsx
    ContentSidebar.tsx                    ← assignment meta, path context, next module
  components/
    FormatBadge.tsx  AreaBadge.tsx  AssignmentStatusBadge.tsx  AcceptanceBadge.tsx  ImpactBadge.tsx
    ContentCard.tsx  AssignmentCard.tsx  AcceptanceCard.tsx  PathCard.tsx  PathStepper.tsx  ImpactSparkline.tsx
    RescheduleModal.tsx
src/stores/qa/lmsStore.ts
src/locales/en/qa.lms.json  src/locales/es/qa.lms.json
```

Data flow: `mockData.ts` builds seeds from `TEAM_PROFILES` (so Agent Profile and LMS agree at startup) → `lmsStore`
holds `content`, `paths`, `assignments`, `enrollments` → Agent pages read via `useLmsStore` + `useMemo` → actions
(`accept`, `requestReschedule`, `updateProgress`, `complete`, `submitQuiz`, `enrollPath`) mutate the store and push an
inbox notification / Agent Profile activity where relevant. `teamStore.assignLms` delegates to `lmsStore.assign` and
mirrors the legacy `profile.lms` row so Your Team counters keep working.

## Task 1 — Domain model `src/models/qa/lms.ts`

Create the file with exactly this content, then add `export * from './lms';` to `src/models/qa/index.ts`.

```ts
/**
 * LMS domain model (content, learning paths, assignments). Mock-only, API-shaped.
 */
import type { EvaluationArea, TriggerMetricId } from './triggerRules';

export type LmsFormat = 'VIDEO' | 'DOCUMENT' | 'QUIZ' | 'SCENARIO';
export type LmsArea = EvaluationArea | 'GENERAL';
export type LmsLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
export type LmsContentStatus = 'PUBLISHED' | 'DRAFT' | 'ARCHIVED';

export interface LmsQuizQuestion {
	id: string;
	prompt: string;
	options: string[];
	correctIndex: number;
	explanation: string;
}

export interface LmsVideoChapter { title: string; startSec: number }

export interface LmsScenarioStep { speaker: 'CUSTOMER' | 'COACH'; text: string }

export interface LmsContentStats {
	assigned: number;
	completed: number;
	/** average quiz / self-check score, null for formats without score */
	avgScore: number | null;
	/** 1-5 */
	avgRating: number;
}

export interface LmsContent {
	id: string;
	title: string;
	summary: string;
	format: LmsFormat;
	area: LmsArea;
	/** Sub-criterion key resolved through SUB_ITEM_LABELS (compliance item, emotion, QA aspect, business signal, error type). */
	subItem: string | null;
	/** Metric used to measure impact after completion; null = not measured (onboarding material). */
	impactMetricId: TriggerMetricId | null;
	durationMin: number;
	level: LmsLevel;
	status: LmsContentStatus;
	tags: string[];
	author: string;
	publishedAt: string;
	updatedAt: string;
	/** VIDEO */
	chapters?: LmsVideoChapter[];
	/** DOCUMENT — markdown */
	body?: string;
	/** QUIZ */
	questions?: LmsQuizQuestion[];
	/** QUIZ — percent needed to pass */
	passScore?: number;
	/** SCENARIO */
	scenario?: { situation: string; steps: LmsScenarioStep[]; selfCheck: LmsQuizQuestion[] };
	stats: LmsContentStats;
}

export interface LmsPathModule { contentId: string; required: boolean }

export interface LmsLearningPath {
	id: string;
	title: string;
	description: string;
	area: LmsArea;
	level: LmsLevel;
	modules: LmsPathModule[];
	estimatedMin: number;
	status: LmsContentStatus;
	badgeName: string | null;
	enrolledCount: number;
	/** 0-100 */
	completionRate: number;
}

export type LmsAssignmentSource = 'MANUAL' | 'COACHING_RULE' | 'LEARNING_PATH' | 'SELF';
export type LmsAssignmentStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'OVERDUE';
export type LmsAcceptanceStatus = 'NOT_REQUIRED' | 'PENDING' | 'ACCEPTED' | 'RESCHEDULE_REQUESTED' | 'NO_RESPONSE';
export type LmsRescheduleDecision = 'APPROVED' | 'REJECTED';
export type LmsImpactVerdict = 'IMPROVED' | 'SAME' | 'DECLINED' | 'PENDING';
export type LmsAssignerRole = 'SUPERVISOR' | 'QA_MANAGER' | 'SYSTEM' | 'AGENT';

export interface LmsAcceptance {
	status: LmsAcceptanceStatus;
	respondedAt: string | null;
	proposedDueDate: string | null;
	reason: string | null;
	decision: LmsRescheduleDecision | null;
	decidedBy: string | null;
	decidedAt: string | null;
}

export interface LmsImpactPoint { label: string; value: number; phase: 'BEFORE' | 'COMPLETION' | 'AFTER' }

export interface LmsImpact {
	metricId: TriggerMetricId;
	/** average of the 30 days before the assignment */
	baseline: number;
	checkpoint15: number | null;
	checkpoint30: number | null;
	verdict: LmsImpactVerdict;
	/** weekly points: 4 before, 1 completion, 4 after */
	series: LmsImpactPoint[];
}

export interface LmsAssignment {
	id: string;
	agentId: string;
	contentId: string;
	pathId: string | null;
	source: LmsAssignmentSource;
	/** CoachingRule id when source = COACHING_RULE */
	ruleId: string | null;
	/** Human explanation shown to the agent ("Compliance score 78% < 85% in the last 14 days") */
	reason: string;
	assignedBy: string;
	assignedByRole: LmsAssignerRole;
	assignedAt: string;
	dueDate: string;
	mandatory: boolean;
	acceptance: LmsAcceptance;
	status: LmsAssignmentStatus;
	/** 0-100 */
	progress: number;
	startedAt: string | null;
	completedAt: string | null;
	/** QUIZ / SCENARIO self-check percent */
	score: number | null;
	attempts: number;
	impact: LmsImpact | null;
}

export interface LmsPathEnrollment {
	id: string;
	agentId: string;
	pathId: string;
	source: 'MANUAL' | 'COACHING_RULE' | 'SELF';
	enrolledBy: string;
	enrolledAt: string;
	dueDate: string | null;
	completedContentIds: string[];
	completedAt: string | null;
}

export interface LmsQuizResult { assignmentId: string; score: number; passed: boolean; answers: number[]; submittedAt: string }
```

## Task 2 — `src/modules/qa/lms/constants.ts`

```ts
import type { TablerIcon } from '@tabler/icons-react';
import {
	IconBook, IconClipboardCheck, IconMasksTheater, IconPlayerPlay, IconBriefcase, IconClipboardList,
	IconMoodSmile, IconShieldCheck, IconSchool,
} from '@tabler/icons-react';
import type { EvaluationArea } from '~/models/qa';
import type { LmsAcceptanceStatus, LmsArea, LmsAssignmentStatus, LmsFormat, LmsImpactVerdict, LmsLevel } from '~/models/qa';
import type { DimensionKey } from '~/modules/qa/team/types';

export const AGENT_PERSONA = { id: 'AGT-004', name: 'John Smith' };

export const LMS_AREAS: LmsArea[] = ['QUALITY_ASSURANCE', 'COMPLIANCE', 'SENTIMENT_EMOTION', 'BUSINESS_INSIGHTS', 'GENERAL'];

/** Colors aligned with src/modules/qa/triggers/constants.ts AREA_COLORS. */
export const LMS_AREA_META: Record<LmsArea, { labelKey: string; color: string; icon: TablerIcon }> = {
	QUALITY_ASSURANCE: { labelKey: 'areas.QUALITY_ASSURANCE', color: 'cyan', icon: IconClipboardList },
	COMPLIANCE: { labelKey: 'areas.COMPLIANCE', color: 'grape', icon: IconShieldCheck },
	SENTIMENT_EMOTION: { labelKey: 'areas.SENTIMENT_EMOTION', color: 'teal', icon: IconMoodSmile },
	BUSINESS_INSIGHTS: { labelKey: 'areas.BUSINESS_INSIGHTS', color: 'indigo', icon: IconBriefcase },
	GENERAL: { labelKey: 'areas.GENERAL', color: 'gray', icon: IconSchool },
};

export const LMS_FORMATS: LmsFormat[] = ['VIDEO', 'DOCUMENT', 'QUIZ', 'SCENARIO'];
export const LMS_FORMAT_META: Record<LmsFormat, { labelKey: string; color: string; icon: TablerIcon; ctaKey: string }> = {
	VIDEO: { labelKey: 'formats.VIDEO', color: 'blue', icon: IconPlayerPlay, ctaKey: 'cta.watch' },
	DOCUMENT: { labelKey: 'formats.DOCUMENT', color: 'orange', icon: IconBook, ctaKey: 'cta.read' },
	QUIZ: { labelKey: 'formats.QUIZ', color: 'violet', icon: IconClipboardCheck, ctaKey: 'cta.takeQuiz' },
	SCENARIO: { labelKey: 'formats.SCENARIO', color: 'pink', icon: IconMasksTheater, ctaKey: 'cta.practice' },
};

export const LMS_LEVELS: LmsLevel[] = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'];

export const ASSIGNMENT_STATUS_COLOR: Record<LmsAssignmentStatus, string> = {
	NOT_STARTED: 'gray', IN_PROGRESS: 'blue', COMPLETED: 'green', OVERDUE: 'red',
};
export const ACCEPTANCE_COLOR: Record<LmsAcceptanceStatus, string> = {
	NOT_REQUIRED: 'gray', PENDING: 'yellow', ACCEPTED: 'green', RESCHEDULE_REQUESTED: 'orange', NO_RESPONSE: 'red',
};
export const VERDICT_COLOR: Record<LmsImpactVerdict, string> = { IMPROVED: 'green', SAME: 'gray', DECLINED: 'red', PENDING: 'blue' };

/** Impact rules agreed with the user: 30-day windows, checkpoints at 15/30 days, ±3 band. */
export const IMPACT_WINDOW_DAYS = 30;
export const IMPACT_CHECKPOINT_DAYS = [15, 30] as const;
export const IMPACT_THRESHOLD = 3;
/** Hours the agent has to answer a mandatory assignment before it becomes NO_RESPONSE. */
export const ACCEPTANCE_SLA_HOURS = 48;

/** Sub-criterion keys → i18n label key (namespace qa.lms, `subItems.*`). Keys reuse triggers COMPLIANCE_SUB_ITEMS / EMOTION_SUB_ITEMS. */
export const SUB_ITEM_KEYS = [
	// QA aspects (from team/mockData topFailedItems)
	'openingIdentification', 'needsAssessment', 'objectionHandling', 'closing', 'mandatoryDisclosures',
	// QA error types
	'ECN', 'ENC', 'ECC', 'ECUF',
	// compliance items
	'dataProtection', 'disclosureCompliance', 'cobranzaRegulada', 'transparenciaConsentimiento',
	'amenazasTradicionales', 'rrss', 'superintendenciaBancos', 'noLlamarList',
	// emotions
	'FRUSTRATION', 'ANGER', 'DISAPPOINTMENT', 'SADNESS', 'FEAR', 'RAGE',
	// business signals
	'EARLY_OBJECTION', 'UNHANDLED_OBJECTION', 'COMPETITOR_PLUS_COST', 'MISTARGETED_OFFER', 'BEST_TIME_FRAME',
	// wellbeing
	'WELLBEING',
] as const;
export type SubItemKey = (typeof SUB_ITEM_KEYS)[number];

export const AREA_TO_DIMENSION: Record<EvaluationArea, DimensionKey> = {
	QUALITY_ASSURANCE: 'qa', COMPLIANCE: 'compliance', SENTIMENT_EMOTION: 'sentiment', BUSINESS_INSIGHTS: 'business',
};
export const DIMENSION_TO_AREA: Record<DimensionKey, EvaluationArea> = {
	qa: 'QUALITY_ASSURANCE', compliance: 'COMPLIANCE', sentiment: 'SENTIMENT_EMOTION', business: 'BUSINESS_INSIGHTS',
};

export type AgentLmsTab = 'assignments' | 'paths' | 'catalog' | 'history' | 'coaching';
export const AGENT_LMS_TABS: AgentLmsTab[] = ['assignments', 'paths', 'catalog', 'history', 'coaching'];

export const AGENT_LMS_PATH = '/qa/agent/lms';
export const agentContentPath = (contentId: string) => `${AGENT_LMS_PATH}/${contentId}`;
```

## Task 3 — `src/modules/qa/lms/catalog.ts` + `src/modules/qa/lms/mockData.ts`

Rules for the executor: `catalog.ts` holds `LMS_CONTENT` (26 items) and `LMS_PATHS` (5) and imports **only** types from
`~/models/qa` (no import from `team/*`, otherwise there is a runtime import cycle: `team/constants` → `lms/catalog`).
`mockData.ts` re-exports both (`export { LMS_CONTENT, LMS_PATHS } from './catalog';`) and builds the seeds. Write **all**
items exactly as listed; document bodies and quiz questions are given below (keep them short but real). Seeds must be
deterministic (use the `seeded()` LCG with prime `4441`). Imports needed at the top of `mockData.ts`:

```ts
import type { LmsAssignment, LmsContent, LmsImpact, LmsImpactPoint, LmsImpactVerdict, LmsLearningPath, LmsPathEnrollment, TriggerMetricId } from '~/models/qa';
import { TEAM_PROFILES, PERSONAS } from '~/modules/qa/team/mockData';
import { NOW_ISO } from '~/modules/qa/team/constants';
import { METRIC_BY_ID } from '~/modules/qa/triggers/constants';
import { LMS_CONTENT, LMS_PATHS } from './catalog';
```
Do **not** import the legacy `LmsAssignment` from `~/modules/qa/team/types` here (same name); the legacy row type is
inferred from `profile.lms[i]`.

### 3.1 Content catalogue `LMS_CONTENT: LmsContent[]`

Common fields unless stated: `status: 'PUBLISHED'`, `author: 'Elena Ruiz'`, `publishedAt: '2026-06-01'`, `updatedAt: '2026-08-20'`, `level: 'INTERMEDIATE'`, `tags: []`, `stats` per the table.

| id | title | format | area | subItem | impactMetricId | min | level | stats (assigned/completed/avgScore/avgRating) |
|---|---|---|---|---|---|---|---|---|
| lms-c01 | Opening & Identification: the first 30 seconds | VIDEO | QUALITY_ASSURANCE | openingIdentification | QA_OVERALL_SCORE | 12 | BEGINNER | 18/15/null/4.6 |
| lms-c02 | Needs Assessment Questions that uncover the real problem | DOCUMENT | QUALITY_ASSURANCE | needsAssessment | QA_OVERALL_SCORE | 10 | BEGINNER | 21/17/null/4.4 |
| lms-c03 | Objection Handling Fundamentals | VIDEO | QUALITY_ASSURANCE | objectionHandling | QA_ENC_COUNT | 20 | INTERMEDIATE | 20/14/null/4.5 |
| lms-c04 | Closing the Call: recap & next steps | DOCUMENT | QUALITY_ASSURANCE | closing | QA_ENC_COUNT | 8 | BEGINNER | 16/13/null/4.2 |
| lms-c05 | QA Fundamentals check | QUIZ (passScore 80) | QUALITY_ASSURANCE | null | QA_OVERALL_SCORE | 10 | BEGINNER | 19/16/84/4.1 |
| lms-c06 | Practice: the unclear request | SCENARIO | QUALITY_ASSURANCE | needsAssessment | QA_OVERALL_SCORE | 15 | INTERMEDIATE | 9/6/78/4.7 |
| lms-c07 | Auto-fail prevention: critical errors explained | VIDEO | QUALITY_ASSURANCE | ECN | QA_AUTO_FAIL_COUNT | 14 | INTERMEDIATE | 11/9/null/4.3 |
| lms-c08 | Regulatory Disclosures 2026 | DOCUMENT | COMPLIANCE | disclosureCompliance | COMPLIANCE_SECURITY_SCORE | 15 | INTERMEDIATE | 21/12/null/4.0 |
| lms-c09 | Data Protection on Calls | VIDEO | COMPLIANCE | dataProtection | COMPLIANCE_SECURITY_SCORE | 18 | BEGINNER | 21/18/null/4.4 |
| lms-c10 | Transparency & consent in billing conversations | DOCUMENT | COMPLIANCE | transparenciaConsentimiento | COMPLIANCE_REGULATORY_SCORE | 12 | INTERMEDIATE | 12/8/null/4.1 |
| lms-c11 | Compliance certification quiz | QUIZ (passScore 90) | COMPLIANCE | null | COMPLIANCE_OVERALL_SCORE | 15 | INTERMEDIATE | 17/11/88/3.9 |
| lms-c12 | Practice: the customer asks you to skip the disclosure | SCENARIO | COMPLIANCE | disclosureCompliance | COMPLIANCE_VIOLATION_COUNT | 12 | INTERMEDIATE | 8/5/82/4.6 |
| lms-c13 | Do-Not-Call list: what you must check | VIDEO | COMPLIANCE | noLlamarList | COMPLIANCE_LEGAL_SCORE | 9 | BEGINNER | 6/6/null/4.2 |
| lms-c14 | Active Listening & Empathy | VIDEO | SENTIMENT_EMOTION | FRUSTRATION | CUSTOMER_SENTIMENT_SCORE | 20 | BEGINNER | 20/16/null/4.8 |
| lms-c15 | De-escalation Techniques | VIDEO | SENTIMENT_EMOTION | ANGER | NEGATIVE_EMOTION_CALL_SHARE | 25 | INTERMEDIATE | 18/11/null/4.7 |
| lms-c16 | Empathy statements that work | DOCUMENT | SENTIMENT_EMOTION | null | CUSTOMER_SENTIMENT_SCORE | 8 | BEGINNER | 15/14/null/4.5 |
| lms-c17 | Practice: turning a negative call around | SCENARIO | SENTIMENT_EMOTION | DISAPPOINTMENT | SENTIMENT_RECOVERY_COUNT | 15 | ADVANCED | 7/4/75/4.6 |
| lms-c18 | Emotion recognition check | QUIZ (passScore 75) | SENTIMENT_EMOTION | null | AGENT_SENTIMENT_SCORE | 8 | BEGINNER | 14/12/81/4.0 |
| lms-c19 | Managing your own stress on high-volume days | DOCUMENT | SENTIMENT_EMOTION | WELLBEING | AGENT_SENTIMENT_SCORE | 6 | BEGINNER | 10/9/null/4.9 |
| lms-c20 | Handling Competitor Comparisons | VIDEO | BUSINESS_INSIGHTS | COMPETITOR_PLUS_COST | BI_COMPETITOR_PLUS_COST_RATE | 18 | INTERMEDIATE | 13/9/null/4.3 |
| lms-c21 | Objection handling playbook: price | DOCUMENT | BUSINESS_INSIGHTS | UNHANDLED_OBJECTION | BI_UNHANDLED_OBJECTION_RATE | 12 | INTERMEDIATE | 14/10/null/4.4 |
| lms-c22 | Practice: the early objection | SCENARIO | BUSINESS_INSIGHTS | EARLY_OBJECTION | BI_EARLY_OBJECTION_RATE | 15 | INTERMEDIATE | 6/3/79/4.5 |
| lms-c23 | Offer targeting check | QUIZ (passScore 80) | BUSINESS_INSIGHTS | MISTARGETED_OFFER | BI_MISTARGETED_OFFER_RATE | 8 | INTERMEDIATE | 9/7/86/4.0 |
| lms-c24 | Welcome to Quality at NewTech: how you are evaluated | VIDEO | GENERAL | null | null | 15 | BEGINNER | 21/21/null/4.6 |
| lms-c25 | Reading your evaluation report | DOCUMENT | GENERAL | null | null | 7 | BEGINNER | 21/19/null/4.3 |

Extra states for the manager library (Plan 2 needs them): set `lms-c19.status = 'DRAFT'` and add one archived item
`lms-c26` "Regulatory Disclosures 2025 (superseded)" DOCUMENT / COMPLIANCE / disclosureCompliance / null / 15 / ARCHIVED, stats 30/28/null/3.8.

`summary`: one sentence each, e.g. lms-c15 *"Recognise anger early, lower the temperature with tone and pacing, and get the call back to problem-solving."* Write a plausible one-liner for every item.

**Video chapters** (VIDEO items): 3–4 chapters, e.g. lms-c15: `[{ title: 'Spotting the escalation curve', startSec: 0 }, { title: 'Tone, pace and silence', startSec: 320 }, { title: 'Reframing the problem', startSec: 780 }, { title: 'Closing with commitment', startSec: 1200 }]`. Give every video chapters that fit its topic.

**Document bodies** (DOCUMENT items): markdown with an H2 intro, a bullet list of 4–5 practical points, and a short "Checklist" section. Example for lms-c02:

```md
## Why discovery questions matter
Agents who ask two open questions before presenting an offer score 11 points higher on QA and convert 8% more.

## The five questions
- **What prompted your call today?** — opens the conversation without assumptions.
- **How is this affecting you right now?** — surfaces urgency and emotion.
- **What have you already tried?** — avoids repeating failed steps.
- **What would a good outcome look like?** — aligns the offer with the customer's goal.
- **Is there anything else I should know?** — catches hidden constraints.

## Checklist before you present anything
1. Two open questions asked.
2. Customer's goal repeated back in their words.
3. Constraint (budget, time, decision-maker) identified.
```

Write bodies of similar length for lms-c04, c08, c10, c16, c19, c21, c25 (and c26 = copy of c08 with a "superseded" note).

**Quiz questions** (QUIZ items, 4 each, `explanation` one sentence). Example lms-c11:

```ts
questions: [
	{ id: 'q1', prompt: 'When must the recording disclosure be given?', options: ['After identity verification', 'Within the first 30 seconds, before any account data', 'Only if the customer asks', 'At the end of the call'], correctIndex: 1, explanation: 'Disclosure precedes any account discussion.' },
	{ id: 'q2', prompt: 'A number is on the Do-Not-Call list. You should…', options: ['Call once and log it', 'Not call and flag the record', 'Call from a different line', 'Send an SMS instead'], correctIndex: 1, explanation: 'DNC numbers must never be contacted.' },
	{ id: 'q3', prompt: 'Which data can be read back to confirm identity?', options: ['Full card number', 'Last 4 digits of the ID', 'Full password', 'Mother\'s maiden name in full'], correctIndex: 1, explanation: 'Only partial identifiers are allowed.' },
	{ id: 'q4', prompt: 'A customer disputes a charge. Transparency requires you to…', options: ['Explain the charge, the date and how to dispute it', 'Transfer immediately', 'Offer a discount', 'End the call'], correctIndex: 0, explanation: 'Billing transparency = what, when and how to dispute.' },
],
passScore: 90,
```

Write 4 topical questions for lms-c05, c18, c23 as well.

**Scenarios** (SCENARIO items): `scenario.situation` (2 sentences), 4 `steps` alternating `CUSTOMER` / `COACH` (the COACH step is a prompt like *"How would you acknowledge the frustration before asking for the account number?"*), and 3 `selfCheck` questions (same shape as quiz). Write them for lms-c06, c12, c17, c22.

### 3.2 Learning paths `LMS_PATHS: LmsLearningPath[]`

| id | title | area | level | modules (contentId:required) | estimatedMin | badgeName | enrolled | completionRate |
|---|---|---|---|---|---|---|---|---|
| path-qa | QA Essentials | QUALITY_ASSURANCE | BEGINNER | c01:true, c02:true, c04:true, c06:false, c05:true | 55 | QA Foundations | 14 | 64 |
| path-compliance | Compliance Certification 2026 | COMPLIANCE | INTERMEDIATE | c09:true, c08:true, c10:true, c13:true, c12:false, c11:true | 81 | Compliance Guardian | 17 | 47 |
| path-sentiment | Emotional Intelligence on Calls | SENTIMENT_EMOTION | INTERMEDIATE | c14:true, c16:true, c15:true, c17:false, c18:true | 76 | Empathy Champion | 11 | 55 |
| path-business | Sales Conversations that Convert | BUSINESS_INSIGHTS | INTERMEDIATE | c21:true, c20:true, c22:false, c23:true | 53 | Business Driver | 8 | 38 |
| path-onboarding | New Agent Onboarding | GENERAL | BEGINNER | c24:true, c25:true, c01:true, c05:true | 44 | null | 21 | 90 |

`description`: one sentence each. `status: 'PUBLISHED'`.

### 3.3 Seeded assignments `LMS_ASSIGNMENT_SEEDS: LmsAssignment[]`

Build with a function so it is deterministic:

```ts
export function seeded(seed: number) { let s = seed; return () => { s = (s * 9301 + 49297) % 233280; return s / 233280; }; }
/** YYYY-MM-DD shifted by `delta` days. Exported: lmsStore, coachingStore and the manager helpers use it. */
export const day = (iso: string, delta: number) => { const d = new Date(iso); d.setUTCDate(d.getUTCDate() + delta); return d.toISOString().slice(0, 10); };

/** Weekly series: 4 before, completion, 4 after. verdict decides the after-slope. */
export function buildImpact(metricId: TriggerMetricId, completedAt: string, rand: () => number, verdict: LmsImpactVerdict): LmsImpact {
	const def = METRIC_BY_ID[metricId];
	const base = def.unit === 'SCORE_5' ? 3.2 + rand() * 0.6 : def.unit === 'COUNT' ? 2 + Math.round(rand() * 3) : 68 + Math.round(rand() * 12);
	const step = def.unit === 'SCORE_5' ? 0.15 : def.unit === 'COUNT' ? 0.6 : 2.2;
	const dir = verdict === 'IMPROVED' ? (def.higherIsBetter ? 1 : -1) : verdict === 'DECLINED' ? (def.higherIsBetter ? -1 : 1) : 0;
	const round = (v: number) => (def.unit === 'SCORE_5' ? Math.round(v * 10) / 10 : Math.round(v));
	const series: LmsImpactPoint[] = [];
	for (let i = -4; i <= 4; i++) {
		const noise = (rand() - 0.5) * step * 0.6;
		const value = round(Math.max(def.min, Math.min(def.max, base + (i > 0 ? dir * step * i : 0) + noise)));
		series.push({ label: `W${i < 0 ? i : i === 0 ? '0' : `+${i}`}`, value, phase: i < 0 ? 'BEFORE' : i === 0 ? 'COMPLETION' : 'AFTER' });
	}
	const before = series.filter((p) => p.phase === 'BEFORE');
	const after = series.filter((p) => p.phase === 'AFTER');
	const avg = (arr: LmsImpactPoint[]) => round(arr.reduce((s, p) => s + p.value, 0) / arr.length);
	const isPending = day(completedAt, 15) > NOW_ISO.slice(0, 10);
	return {
		metricId, baseline: avg(before),
		checkpoint15: isPending ? null : avg(after.slice(0, 2)),
		checkpoint30: day(completedAt, 30) > NOW_ISO.slice(0, 10) ? null : avg(after),
		verdict: isPending ? 'PENDING' : verdict,
		series,
	};
}
```

Then, for every profile in `TEAM_PROFILES` **except AGT-004**, map each legacy `profile.lms[i]` (`LmsAssignment` from team/types) to the new shape:

- `id: legacy.id`, `agentId: profile.agent.id`, `contentId: legacy.materialId` (after Task 5 the legacy ids are the new content ids), `pathId: null`, `source: i === 0 ? 'COACHING_RULE' : 'MANUAL'`, `ruleId: i === 0 ? 'cr-001' : null`, `reason`: for `COACHING_RULE` use `"<Dimension label> score below target in the last 14 days"`, for `MANUAL` use `"Assigned by <assignedBy> from the agent profile"`.
- `assignedBy: legacy.assignedBy`, `assignedByRole: 'SUPERVISOR'`, `assignedAt: legacy.assignedAt`, `dueDate: legacy.dueDate`, `mandatory: legacy.mandatory`.
- `status`: map `'not-started' → 'NOT_STARTED'`, `'in-progress' → 'IN_PROGRESS'`, `'completed' → 'COMPLETED'`, `'overdue' → 'OVERDUE'`; `progress: legacy.progress`; `startedAt: status !== NOT_STARTED ? assignedAt : null`; `completedAt: legacy.completedAt ?? null`; `score`: 82–96 (rand) when the content is QUIZ/SCENARIO and completed, else null; `attempts: completed && QUIZ ? 1 : 0`.
- `acceptance`: mandatory ⇒ `{ status: 'ACCEPTED', respondedAt: day(assignedAt, 1), ... nulls }`; not mandatory ⇒ `NOT_REQUIRED`. Exception for realism: agents **AGT-006** and **AGT-017** get their `OVERDUE` row as `NO_RESPONSE` (respondedAt null); **AGT-010** and **AGT-012** get their `IN_PROGRESS` row as `RESCHEDULE_REQUESTED` with `proposedDueDate: day(dueDate, 10)`, `reason: 'Covering two shifts this week, need 10 more days'`.
- `impact`: only when `COMPLETED` and the content has `impactMetricId`: `buildImpact(metricId, completedAt, rand, verdict)` where verdict = `IMPROVED` if the agent's persona `slope > 0.05`, `DECLINED` if `slope < -0.15`, else `SAME` (read slope from `PERSONAS` in team/mockData — export it if not already exported; it is).

**Curated rows for AGT-004 (John Smith)** — write literally (rand seeded with 4441):

| id | contentId | source/ruleId | mandatory | assignedAt | dueDate | acceptance | status | progress | notes |
|---|---|---|---|---|---|---|---|---|---|
| lms-a04-01 | lms-c15 | COACHING_RULE / cr-002 | true | 2026-09-11 | 2026-09-26 | PENDING | NOT_STARTED | 0 | reason "Negative emotion share 34% > 30% in the last 14 days (rule: Negative emotion share → De-escalation)", assignedBy 'Maria García' SUPERVISOR |
| lms-a04-02 | lms-c11 | COACHING_RULE / cr-001 | true | 2026-09-10 | 2026-09-30 | PENDING | NOT_STARTED | 0 | reason "Compliance score 79% < 85% in the last 14 days", assignedBy 'Elena Ruiz' QA_MANAGER |
| lms-a04-03 | lms-c03 | MANUAL | true | 2026-08-28 | 2026-09-20 | ACCEPTED (respondedAt 2026-08-28) | IN_PROGRESS | 45 | startedAt 2026-09-01, reason "Assigned by Maria García after the 1:1 on objection handling" |
| lms-a04-04 | lms-c08 | MANUAL | true | 2026-08-15 | 2026-09-05 | ACCEPTED | OVERDUE | 20 | startedAt 2026-08-20 |
| lms-a04-05 | lms-c21 | MANUAL | false | 2026-09-02 | 2026-10-02 | NOT_REQUIRED | NOT_STARTED | 0 | reason "Recommended: price objections on 3 of your last 10 calls" |
| lms-a04-06 | lms-c02 | COACHING_RULE / cr-003 | true | 2026-07-20 | 2026-08-03 | ACCEPTED | COMPLETED | 100 | completedAt 2026-07-29, impact `buildImpact('QA_OVERALL_SCORE','2026-07-29',rand,'IMPROVED')` |
| lms-a04-07 | lms-c16 | MANUAL | false | 2026-07-01 | 2026-07-15 | NOT_REQUIRED | COMPLETED | 100 | completedAt 2026-07-10, impact SAME on CUSTOMER_SENTIMENT_SCORE |
| lms-a04-08 | lms-c05 | LEARNING_PATH / pathId path-qa | true | 2026-06-10 | 2026-07-10 | NOT_REQUIRED | COMPLETED | 100 | completedAt 2026-06-30, score 85, attempts 1, impact IMPROVED on QA_OVERALL_SCORE |
| lms-a04-09 | lms-c24 | LEARNING_PATH / path-onboarding | true | 2025-03-03 | 2025-03-17 | NOT_REQUIRED | COMPLETED | 100 | completedAt 2025-03-05, impact null |
| lms-a04-10 | lms-c01 | LEARNING_PATH / path-qa | true | 2026-06-10 | 2026-07-10 | NOT_REQUIRED | COMPLETED | 100 | completedAt 2026-06-14, impact IMPROVED |
| lms-a04-11 | lms-c04 | LEARNING_PATH / path-qa | true | 2026-06-10 | 2026-07-10 | NOT_REQUIRED | NOT_STARTED | 0 | — |

Export `LMS_ASSIGNMENT_SEEDS = [...curatedAgt004, ...derivedOthers]`.

### 3.4 Enrollments `LMS_ENROLLMENT_SEEDS: LmsPathEnrollment[]`

- `enr-a04-01`: AGT-004 / path-qa / MANUAL / enrolledBy 'Maria García' / 2026-06-10 / dueDate 2026-10-10 / completedContentIds `['lms-c01','lms-c02','lms-c05']` / completedAt null.
- `enr-a04-02`: AGT-004 / path-onboarding / MANUAL / 'Elena Ruiz' / 2025-03-03 / null / all four ids / completedAt 2025-03-20.
- For every other agent: enrol in `path-onboarding` (completed, all ids) and, for agents whose weakest dimension (lowest `profile.dimensions` score in %) is `compliance`, enrol in `path-compliance` with 2 completed modules (`lms-c09`, `lms-c08`).

## Task 4 — `src/modules/qa/lms/helpers.ts`

```ts
import type { TFunction } from 'i18next';
import type { LmsAssignment, LmsAssignmentStatus, LmsContent, LmsImpactVerdict, LmsLearningPath, LmsPathEnrollment } from '~/models/qa';
import { NOW_ISO } from '~/modules/qa/team/constants';
import { IMPACT_THRESHOLD } from './constants';

export const today = () => NOW_ISO.slice(0, 10);
export const daysUntil = (isoDate: string) => Math.ceil((new Date(isoDate).getTime() - new Date(NOW_ISO).getTime()) / 86_400_000);
export const isOverdue = (a: LmsAssignment) => a.status !== 'COMPLETED' && a.dueDate < today();
/** Status the UI should show (recomputes OVERDUE from the clock). */
export const effectiveStatus = (a: LmsAssignment): LmsAssignmentStatus => (a.status === 'COMPLETED' ? 'COMPLETED' : isOverdue(a) ? 'OVERDUE' : a.status);
export const needsResponse = (a: LmsAssignment) => a.acceptance.status === 'PENDING' || a.acceptance.status === 'NO_RESPONSE';
export const dueLabel = (t: TFunction, a: LmsAssignment) => {
	const d = daysUntil(a.dueDate);
	if (a.status === 'COMPLETED') return t('due.completed');
	if (d < 0) return t('due.overdueBy', { count: -d });
	if (d === 0) return t('due.today');
	return t('due.inDays', { count: d });
};
export const verdictFromDelta = (delta: number, higherIsBetter: boolean): LmsImpactVerdict => {
	const signed = higherIsBetter ? delta : -delta;
	return signed >= IMPACT_THRESHOLD ? 'IMPROVED' : signed <= -IMPACT_THRESHOLD ? 'DECLINED' : 'SAME';
};
export const pathProgress = (path: LmsLearningPath, enrollment: LmsPathEnrollment | undefined) => {
	const required = path.modules.filter((m) => m.required).length || path.modules.length;
	const done = enrollment ? path.modules.filter((m) => enrollment.completedContentIds.includes(m.contentId)).length : 0;
	return { done, total: path.modules.length, percent: Math.round((done / Math.max(1, required)) * 100) };
};
export const nextModule = (path: LmsLearningPath, enrollment: LmsPathEnrollment | undefined, content: Record<string, LmsContent>) =>
	path.modules.map((m) => content[m.contentId]).find((c) => c && !(enrollment?.completedContentIds ?? []).includes(c.id));
export const groupAssignments = (rows: LmsAssignment[]) => ({
	needsResponse: rows.filter(needsResponse),
	mandatory: rows.filter((a) => a.mandatory && !needsResponse(a) && a.status !== 'COMPLETED').sort((a, b) => a.dueDate.localeCompare(b.dueDate)),
	optional: rows.filter((a) => !a.mandatory && a.status !== 'COMPLETED' && !needsResponse(a)),
	completed: rows.filter((a) => a.status === 'COMPLETED').sort((a, b) => (b.completedAt ?? '').localeCompare(a.completedAt ?? '')),
});
export const agentLmsKpis = (rows: LmsAssignment[]) => {
	const open = rows.filter((a) => a.status !== 'COMPLETED');
	return {
		needsResponse: rows.filter(needsResponse).length,
		dueThisWeek: open.filter((a) => { const d = daysUntil(a.dueDate); return d >= 0 && d <= 7; }).length,
		overdue: open.filter(isOverdue).length,
		completedThisMonth: rows.filter((a) => a.completedAt && a.completedAt >= today().slice(0, 7) + '-01').length,
		quizAverage: (() => { const s = rows.filter((a) => a.score !== null); return s.length ? Math.round(s.reduce((x, a) => x + (a.score ?? 0), 0) / s.length) : null; })(),
	};
};
```

## Task 5 — `src/stores/qa/lmsStore.ts` + legacy bridge

### 5.1 Store

```ts
import { create } from 'zustand';
import type { AgentNotification } from '~/models/qa/notifications';
import type {
	LmsAssignment, LmsAssignmentSource, LmsAssignerRole, LmsContent, LmsContentStatus, LmsLearningPath, LmsPathEnrollment, LmsRescheduleDecision,
} from '~/models/qa';
import { useNotificationStore } from '~/stores/qa/notificationStore';
import { LMS_CONTENT, LMS_PATHS, LMS_ASSIGNMENT_SEEDS, LMS_ENROLLMENT_SEEDS, buildImpact, day } from '~/modules/qa/lms/mockData';
import { AGENT_LMS_PATH } from '~/modules/qa/lms/constants';
import { NOW_ISO, QA_MANAGER_PERSONA, SUPERVISOR_PERSONA } from '~/modules/qa/team/constants';

let counter = 900;
export const nextLmsId = (prefix: string) => `${prefix}-${++counter}`;

export interface AssignInput {
	agentIds: string[];
	contentIds: string[];
	pathId?: string | null;
	dueDate: string; // YYYY-MM-DD
	mandatory: boolean;
	requireAcceptance: boolean;
	reason: string;
	source?: LmsAssignmentSource;
	ruleId?: string | null;
	assignedBy: string;
	assignedByRole: LmsAssignerRole;
}

interface LmsState {
	content: LmsContent[];
	paths: LmsLearningPath[];
	assignments: LmsAssignment[];
	enrollments: LmsPathEnrollment[];
	/** Manager side */
	assign: (input: AssignInput) => LmsAssignment[];
	enroll: (agentIds: string[], pathId: string, enrolledBy: string, source: LmsPathEnrollment['source'], dueDate: string | null) => void;
	setContentStatus: (contentId: string, status: LmsContentStatus) => void;
	decideReschedule: (assignmentId: string, decision: LmsRescheduleDecision, decidedBy: string) => void;
	/** Agent side */
	accept: (assignmentId: string) => void;
	requestReschedule: (assignmentId: string, proposedDueDate: string, reason: string) => void;
	updateProgress: (assignmentId: string, progress: number) => void;
	complete: (assignmentId: string, score?: number | null) => void;
	selfEnroll: (agentId: string, contentId: string) => LmsAssignment;
	selfEnrollPath: (agentId: string, pathId: string) => void;
}

/** Exported: Plan 2 (AssignmentDetailDrawer) and Plan 3 (queue reminders) reuse it. */
export const notifyAgent = (agentId: string, from: { name: string; role: LmsAssignerRole }, partial: Pick<AgentNotification, 'priority' | 'title' | 'message' | 'actions'>) =>
	useNotificationStore.getState().addNotification({
		id: nextLmsId('ntf'), agentId, category: 'DIRECT_MESSAGE', icon: 'book',
		sourceRole: from.role === 'QA_MANAGER' ? 'QA_MANAGER' : from.role === 'SUPERVISOR' ? 'SUPERVISOR' : 'SYSTEM',
		sourceId: from.role === 'QA_MANAGER' ? QA_MANAGER_PERSONA.id : SUPERVISOR_PERSONA.id,
		read: false, archived: false, actioned: false, createdAt: NOW_ISO, ...partial,
	});

export const useLmsStore = create<LmsState>((set, get) => ({
	content: LMS_CONTENT,
	paths: LMS_PATHS,
	assignments: LMS_ASSIGNMENT_SEEDS,
	enrollments: LMS_ENROLLMENT_SEEDS,

	assign: (input) => {
		const created: LmsAssignment[] = [];
		for (const agentId of input.agentIds) for (const contentId of input.contentIds) {
			if (get().assignments.some((a) => a.agentId === agentId && a.contentId === contentId && a.status !== 'COMPLETED')) continue;
			created.push({
				id: nextLmsId('lms-a'), agentId, contentId, pathId: input.pathId ?? null, source: input.source ?? 'MANUAL', ruleId: input.ruleId ?? null,
				reason: input.reason, assignedBy: input.assignedBy, assignedByRole: input.assignedByRole, assignedAt: NOW_ISO.slice(0, 10), dueDate: input.dueDate,
				mandatory: input.mandatory,
				acceptance: { status: input.requireAcceptance ? 'PENDING' : 'NOT_REQUIRED', respondedAt: null, proposedDueDate: null, reason: null, decision: null, decidedBy: null, decidedAt: null },
				status: 'NOT_STARTED', progress: 0, startedAt: null, completedAt: null, score: null, attempts: 0, impact: null,
			});
		}
		set((s) => ({ assignments: [...created, ...s.assignments] }));
		for (const a of created) {
			const c = get().content.find((x) => x.id === a.contentId);
			notifyAgent(a.agentId, { name: a.assignedBy, role: a.assignedByRole }, {
				priority: a.mandatory ? 'HIGH' : 'NORMAL',
				title: `New training assigned: ${c?.title ?? a.contentId}`,
				message: `${a.assignedBy} assigned "${c?.title}" · due ${a.dueDate}${a.acceptance.status === 'PENDING' ? ' · please accept or propose a new date' : ''}. ${a.reason}`,
				actions: [{ label: 'Open My Learning', url: `${AGENT_LMS_PATH}?tab=assignments`, icon: 'book' }],
			});
		}
		return created;
	},

	enroll: (agentIds, pathId, enrolledBy, source, dueDate) => set((s) => ({
		enrollments: [
			...agentIds.filter((id) => !s.enrollments.some((e) => e.agentId === id && e.pathId === pathId)).map((agentId) => ({
				id: nextLmsId('enr'), agentId, pathId, source, enrolledBy, enrolledAt: NOW_ISO.slice(0, 10), dueDate, completedContentIds: [], completedAt: null,
			})),
			...s.enrollments,
		],
	})),

	setContentStatus: (contentId, status) => set((s) => ({ content: s.content.map((c) => (c.id === contentId ? { ...c, status, updatedAt: NOW_ISO.slice(0, 10) } : c)) })),

	decideReschedule: (assignmentId, decision, decidedBy) => set((s) => ({
		assignments: s.assignments.map((a) => a.id !== assignmentId ? a : {
			...a,
			dueDate: decision === 'APPROVED' && a.acceptance.proposedDueDate ? a.acceptance.proposedDueDate : a.dueDate,
			acceptance: { ...a.acceptance, status: 'ACCEPTED', decision, decidedBy, decidedAt: NOW_ISO },
		}),
	})),

	accept: (assignmentId) => set((s) => ({
		assignments: s.assignments.map((a) => (a.id === assignmentId ? { ...a, acceptance: { ...a.acceptance, status: 'ACCEPTED', respondedAt: NOW_ISO } } : a)),
	})),

	requestReschedule: (assignmentId, proposedDueDate, reason) => set((s) => ({
		assignments: s.assignments.map((a) => (a.id === assignmentId ? { ...a, acceptance: { ...a.acceptance, status: 'RESCHEDULE_REQUESTED', respondedAt: NOW_ISO, proposedDueDate, reason } } : a)),
	})),

	updateProgress: (assignmentId, progress) => set((s) => ({
		assignments: s.assignments.map((a) => (a.id === assignmentId && a.status !== 'COMPLETED'
			? { ...a, progress: Math.max(a.progress, Math.min(99, progress)), status: 'IN_PROGRESS', startedAt: a.startedAt ?? NOW_ISO.slice(0, 10) }
			: a)),
	})),

	complete: (assignmentId, score = null) => {
		const a = get().assignments.find((x) => x.id === assignmentId);
		if (!a) return;
		const c = get().content.find((x) => x.id === a.contentId);
		const rand = (() => { let s = 4441 + counter; return () => { s = (s * 9301 + 49297) % 233280; return s / 233280; }; })();
		const impact = c?.impactMetricId ? buildImpact(c.impactMetricId, NOW_ISO.slice(0, 10), rand, 'IMPROVED') : null;
		set((s) => ({
			assignments: s.assignments.map((x) => (x.id === assignmentId ? { ...x, status: 'COMPLETED', progress: 100, completedAt: NOW_ISO.slice(0, 10), score, attempts: x.attempts + (score !== null ? 1 : 0), impact } : x)),
			enrollments: s.enrollments.map((e) => (e.agentId === a.agentId && (a.pathId ? e.pathId === a.pathId : s.paths.some((p) => p.id === e.pathId && p.modules.some((m) => m.contentId === a.contentId)))
				? { ...e, completedContentIds: e.completedContentIds.includes(a.contentId) ? e.completedContentIds : [...e.completedContentIds, a.contentId] }
				: e)),
		}));
	},

	selfEnroll: (agentId, contentId) => {
		const [created] = get().assign({ agentIds: [agentId], contentIds: [contentId], dueDate: day(NOW_ISO.slice(0, 10), 14), mandatory: false, requireAcceptance: false, reason: 'Self-enrolled from the catalogue', source: 'SELF', assignedBy: 'You', assignedByRole: 'AGENT' });
		return created;
	},

	selfEnrollPath: (agentId, pathId) => get().enroll([agentId], pathId, 'You', 'SELF', null),
}));

export const selectAssignments = (s: LmsState) => s.assignments;
export const selectContent = (s: LmsState) => s.content;
export const selectPaths = (s: LmsState) => s.paths;
export const selectEnrollments = (s: LmsState) => s.enrollments;
```

`notifyAgent` for `assignedByRole === 'AGENT'` (self-enrol) must be skipped (guard with `if (a.source !== 'SELF')`). `tsconfig` has `noUnusedLocals` / `noUnusedParameters` — never leave an unused import or parameter in any file of these plans.

### 5.2 Legacy bridge (edit existing files)

1. `src/modules/qa/team/constants.ts`: replace the literal `LMS_CATALOG` with a derived one so the old modal and seeds keep compiling. Add `LmsMaterialType` to the existing `./types` type import and add these imports:
   ```ts
   import type { EvaluationArea, LmsFormat } from '~/models/qa';
   import { LMS_CONTENT } from '~/modules/qa/lms/catalog';
   import { AREA_TO_DIMENSION } from '~/modules/qa/lms/constants';
   const LEGACY_TYPE: Record<LmsFormat, LmsMaterialType> = { VIDEO: 'Video', DOCUMENT: 'Article', QUIZ: 'Course', SCENARIO: 'Course' };
   export const LMS_CATALOG: LmsMaterial[] = LMS_CONTENT
   	.filter((c) => c.status === 'PUBLISHED' && c.area !== 'GENERAL')
   	.map((c) => ({ id: c.id, title: c.title, type: LEGACY_TYPE[c.format], durationMin: c.durationMin, dimension: AREA_TO_DIMENSION[c.area as EvaluationArea] }));
   ```
   **Why `catalog.ts`**: `lms/mockData.ts` imports `TEAM_PROFILES` from `team/mockData.ts`, which imports `LMS_CATALOG` from `team/constants.ts`; if `team/constants.ts` imported `lms/mockData.ts` there would be a runtime cycle. `lms/catalog.ts` has no team imports, and `lms/constants.ts` only has a **type** import from `team/types` (type-only imports are erased, no cycle).
2. `src/stores/qa/teamStore.ts`: `assignLms` keeps its signature but now (a) calls `useLmsStore.getState().assign({ agentIds: [input.agentId], contentIds: [input.materialId], dueDate: input.dueDate, mandatory: input.mandatory, requireAcceptance: input.mandatory, reason: 'Assigned from the agent profile', assignedBy: a.name, assignedByRole: a.sourceRole })`, (b) still prepends the legacy `profile.lms` row and the activity event, and (c) **removes its own `notify(...)` call** (lmsStore already notifies). `scheduleCoaching`: change the action URL to `'/qa/agent/lms?tab=coaching'` (Plan 3 will move the whole action to `coachingStore`).
3. `src/modules/qa/team/AgentProfilePage/tabs/CoachingLmsTab.tsx`: remove the legacy `LmsAssignment` from the `../../types` import (name collision) together with `LMS_STATUS_COLOR` and `lmsHelper`; import the new `LmsAssignment` from `~/models/qa` and `useLmsStore, selectAssignments` from `~/stores/qa/lmsStore`. The LMS table now reads `useLmsStore(selectAssignments)` + `useMemo(() => all.filter((a) => a.agentId === profile.agent.id))` and shows columns Material (title from `content` map + Mandatory badge) · Format (`FormatBadge`) · Assigned · Due (red when `isOverdue`) · Acceptance (`AcceptanceBadge`) · Progress · Status (`AssignmentStatusBadge`) · Impact (`ImpactBadge`, "—" when null). KPI tiles: `LMS completion`, `Overdue`, `Mandatory pending` computed from the same rows; `Coaching attendance` unchanged. Import the badge components from `~/modules/qa/lms/components/*`.
4. `src/modules/qa/team/helpers.ts` `toTableRow`: leave as is (legacy mirror keeps counts right).

## Task 6 — i18n `src/locales/en/qa.lms.json` and `src/locales/es/qa.lms.json`

English file (full). Spanish file: translate every key (keep placeholders). Plan 2 appends a `manager` block to both.

```json
{
	"areas": { "QUALITY_ASSURANCE": "Quality Assurance", "COMPLIANCE": "Compliance", "SENTIMENT_EMOTION": "Sentiment & Emotion", "BUSINESS_INSIGHTS": "Business Insights", "GENERAL": "General" },
	"formats": { "VIDEO": "Video", "DOCUMENT": "Document", "QUIZ": "Quiz", "SCENARIO": "Practice scenario" },
	"levels": { "BEGINNER": "Beginner", "INTERMEDIATE": "Intermediate", "ADVANCED": "Advanced" },
	"cta": { "watch": "Watch", "read": "Read", "takeQuiz": "Take quiz", "practice": "Practice", "continue": "Continue", "start": "Start", "review": "Review", "retry": "Retry" },
	"status": { "NOT_STARTED": "Not started", "IN_PROGRESS": "In progress", "COMPLETED": "Completed", "OVERDUE": "Overdue" },
	"acceptance": { "NOT_REQUIRED": "No response needed", "PENDING": "Awaiting your response", "ACCEPTED": "Accepted", "RESCHEDULE_REQUESTED": "New date requested", "NO_RESPONSE": "No response", "approved": "New date approved", "rejected": "New date rejected" },
	"verdict": { "IMPROVED": "Improved", "SAME": "No change", "DECLINED": "Declined", "PENDING": "Measuring" },
	"source": { "MANUAL": "Assigned by your supervisor", "COACHING_RULE": "Assigned by a coaching rule", "LEARNING_PATH": "Part of a learning path", "SELF": "Self-enrolled" },
	"due": { "completed": "Completed", "overdueBy": "Overdue by {{count}} days", "today": "Due today", "inDays": "Due in {{count}} days", "date": "Due {{date}}" },
	"subItems": {
		"openingIdentification": "Opening & Identification", "needsAssessment": "Needs Assessment", "objectionHandling": "Objection Handling", "closing": "Closing", "mandatoryDisclosures": "Mandatory Disclosures",
		"ECN": "Critical Business Error", "ENC": "Non-Critical Error", "ECC": "Critical Compliance Error", "ECUF": "Critical End-User Error",
		"dataProtection": "Data Protection", "disclosureCompliance": "Disclosure Compliance", "cobranzaRegulada": "Billing Process", "transparenciaConsentimiento": "Transparency", "amenazasTradicionales": "Threats", "rrss": "Social Media", "superintendenciaBancos": "Banking Superintendence", "noLlamarList": "Do-Not-Call",
		"FRUSTRATION": "Frustration", "ANGER": "Anger", "DISAPPOINTMENT": "Disappointment", "SADNESS": "Sadness", "FEAR": "Fear", "RAGE": "Rage",
		"EARLY_OBJECTION": "Early Objection", "UNHANDLED_OBJECTION": "Unhandled Objection", "COMPETITOR_PLUS_COST": "Competitor Plus Cost", "MISTARGETED_OFFER": "Mis-targeted Offer", "BEST_TIME_FRAME": "Best Time Frame",
		"WELLBEING": "Wellbeing"
	},
	"agent": {
		"eyebrow": "Agent",
		"title": "My Learning",
		"description": "Your assignments, learning paths and coaching commitments — tied to the aspects you are evaluated on.",
		"activePath": "Active path",
		"noActivePath": "No active learning path",
		"kpi": { "needsResponse": "Needs your response", "dueThisWeek": "Due this week", "overdue": "Overdue", "completedThisMonth": "Completed this month", "quizAverage": "Quiz average" },
		"tabs": { "assignments": "My assignments", "paths": "Learning paths", "catalog": "Catalogue", "history": "History", "coaching": "Coaching" },
		"assignments": {
			"needsResponse": "Needs your response",
			"needsResponseDescription": "Your supervisor assigned this with a deadline. Accept it or propose another date.",
			"mandatory": "Mandatory with deadline",
			"mandatoryDescription": "Sorted by due date. Overdue items are highlighted.",
			"optional": "Recommended for you",
			"optionalDescription": "Optional material picked for your recent evaluations.",
			"empty": "Nothing assigned right now — explore the catalogue.",
			"assignedBy": "Assigned by {{name}}",
			"why": "Why this was assigned",
			"accept": "I accept this deadline",
			"proposeDate": "Propose another date",
			"accepted": "Accepted on {{date}}",
			"rescheduleSent": "New date proposed: {{date}} — waiting for {{name}}",
			"noResponse": "No response for {{count}} hours — your supervisor has been notified",
			"mandatoryBadge": "Mandatory",
			"progress": "{{value}}% complete",
			"score": "Score {{value}}%"
		},
		"reschedule": {
			"title": "Propose another date",
			"current": "Current deadline: {{date}}",
			"newDate": "Proposed deadline",
			"reason": "Reason",
			"reasonPlaceholder": "Tell your supervisor why you need more time",
			"submit": "Send proposal",
			"cancel": "Cancel",
			"success": "Proposal sent to your supervisor"
		},
		"paths": {
			"enrolled": "Your learning paths",
			"enrolledDescription": "Complete the required modules in order to earn the path badge.",
			"available": "Available paths",
			"availableDescription": "Enrol yourself in a path for any aspect you want to strengthen.",
			"modules": "{{done}} of {{total}} modules",
			"required": "Required",
			"optional": "Optional",
			"nextUp": "Next up",
			"enrol": "Enrol",
			"enrolled_success": "You are enrolled in {{title}}",
			"badge": "Earn: {{badge}}",
			"completedOn": "Completed on {{date}}",
			"dueDate": "Path due {{date}}",
			"empty": "No learning paths available."
		},
		"catalog": {
			"title": "Catalogue",
			"description": "Everything published, grouped by the aspect it strengthens.",
			"search": "Search material",
			"format": "Format",
			"area": "Aspect",
			"all": "All",
			"enrolSelf": "Add to my learning",
			"alreadyAssigned": "Already in your list",
			"enrolled_success": "Added to your assignments",
			"empty": "No material matches these filters.",
			"count": "{{count}} items"
		},
		"history": {
			"title": "Completed material",
			"description": "What you finished and how your scores moved afterwards.",
			"columns": { "material": "Material", "completed": "Completed", "score": "Score", "impact": "Impact", "metric": "Metric", "before": "Before", "after": "After" },
			"impactHint": "30 days before vs 30 days after completion",
			"empty": "Nothing completed yet."
		},
		"coaching": {
			"upcoming": "Upcoming sessions",
			"upcomingDescription": "Sessions scheduled with your supervisor or the QA manager.",
			"commitments": "My commitments",
			"commitmentsDescription": "Action items agreed in coaching. Confirm them so your coach knows you are on it.",
			"past": "Past sessions",
			"columns": { "date": "Date", "topic": "Topic", "coach": "Coach", "area": "Aspect", "status": "Status", "outcome": "Outcome" },
			"status": { "scheduled": "Scheduled", "completed": "Completed", "missed": "Missed" },
			"acknowledge": "I commit to this",
			"acknowledged": "Committed on {{date}}",
			"linkedMaterial": "Linked material",
			"empty": "No coaching sessions yet."
		}
	},
	"player": {
		"back": "Back to My Learning",
		"partOfPath": "Part of {{path}}",
		"nextModule": "Next module",
		"markWatched": "Mark as watched",
		"markRead": "Mark as read",
		"chapters": "Chapters",
		"playing": "Playing",
		"paused": "Paused",
		"readingProgress": "Reading progress",
		"quiz": { "question": "Question {{n}} of {{total}}", "next": "Next", "previous": "Previous", "submit": "Submit answers", "passed": "You passed with {{score}}%", "failed": "{{score}}% — you need {{pass}}% to pass", "retry": "Try again", "explanation": "Why", "passScore": "Pass mark {{value}}%" },
		"scenario": { "situation": "The situation", "customerSays": "Customer", "coachAsks": "Your coach asks", "selfCheck": "Self-check", "yourAnswer": "Your answer", "finish": "Finish practice" },
		"completed": { "title": "Completed!", "message": "We will measure your {{metric}} over the next 30 days and show the result here.", "noImpact": "This material is informational — no score is tracked.", "backToList": "Back to my assignments" },
		"meta": { "duration": "{{count}} min", "level": "Level", "assigned": "Assigned {{date}}", "due": "Due {{date}}", "by": "By {{name}}", "author": "Author" }
	},
	"impact": { "title": "Impact on your score", "baseline": "Before", "after": "After 30 days", "checkpoint15": "Day 15", "checkpoint30": "Day 30", "pending": "Still measuring — {{days}} days to go", "delta": "{{value}} points" },
	"common": { "notFound": "Material not found", "notFoundDescription": "No content with id {{id}}.", "minutes": "{{count}} min", "cancel": "Cancel", "close": "Close", "save": "Save" }
}
```

Register in `src/modules/qa/qaNamespaces.ts`:
```ts
'qa.agent.lms': ['qa.lms', 'qa.team', 'qa.triggers'],
'qa.agent.lms.content': ['qa.lms', 'qa.team', 'qa.triggers'],
'qa.agent.coaching': ['qa.lms', 'qa.team'],
```
(`qa.triggers` is needed for `t('metrics.<id>')` labels of impact metrics.)

## Task 7 — Shared LMS components (`src/modules/qa/lms/components/`)

All named exports, flat files, `useTranslation('qa.lms')`.

| Component | Props | Renders |
|---|---|---|
| `FormatBadge` | `format: LmsFormat; size?` | `Badge variant='light' color={LMS_FORMAT_META.color} leftSection={<Icon size={12}/>}` label `t(labelKey)` |
| `AreaBadge` | `area: LmsArea; subItem?: string \| null` | area badge (`LMS_AREA_META.color`) + optional dimmed `Text size='xs'` with `t('subItems.'+subItem)` |
| `AssignmentStatusBadge` | `assignment: LmsAssignment` | `Badge color={ASSIGNMENT_STATUS_COLOR[effectiveStatus(a)]}` |
| `AcceptanceBadge` | `acceptance: LmsAcceptance` | `Badge variant='outline' color={ACCEPTANCE_COLOR}`; hidden when `NOT_REQUIRED` |
| `ImpactBadge` | `impact: LmsImpact \| null` | verdict badge with arrow icon (`IconTrendingUp/Down/Minus`); `Tooltip` with baseline→checkpoint30 |
| `ImpactSparkline` | `impact: LmsImpact; height?=40` | `@mantine/charts` `Sparkline` of `series.map(v)` with `color` by verdict, plus a small `Text` "W0" marker below (use `AreaChart` with `referenceLines={[{ x: 'W0', label: t('impact.title') }]}` if you prefer the marker inline; keep it simple) |
| `ContentCard` | `content: LmsContent; assignment?: LmsAssignment; onOpen(): void; onEnrol?(): void` | `Paper withBorder p='md' radius='md'` → row: `ThemeIcon` format icon · title (`fw={600}`) · `FormatBadge` · `AreaBadge`; summary `lineClamp={2}`; footer: duration `IconClock`, level, `Rating readOnly value={stats.avgRating} size='xs'`, CTA `Button size='xs'` (`t(ctaKey)` or `t('agent.catalog.alreadyAssigned')` disabled) |
| `AssignmentCard` | `assignment; content; onOpen()` | card with left colour bar by area (CSS module `borderLeft: 4px solid var(--mantine-color-<c>-6)` via `data-area` attr + `light-dark()`), title, badges (format, mandatory red badge, status), `Text c='dimmed'` reason line ("Why this was assigned"), `Progress` if in progress, due label (red when overdue) + `AcceptanceBadge`, CTA button |
| `AcceptanceCard` | `assignment; content; onAccept(); onPropose()` | highlighted card (`bg: light-dark(var(--mantine-color-yellow-0), var(--mantine-color-dark-6))`, border yellow-4/yellow-8): title, format/area badges, `assignedBy` + date, **reason block** with `IconInfoCircle`, deadline (`t('due.date')`), two buttons: primary `t('agent.assignments.accept')`, default `t('agent.assignments.proposeDate')`; when `NO_RESPONSE` show red `Alert` `t('agent.assignments.noResponse', { count: hours })` above the buttons |
| `RescheduleModal` | `assignment \| null; opened; onClose; onSubmit(date, reason)` | Mantine `Modal` (allowed: it is a form dialog, same as team modals) with `DatePickerInput minDate={new Date(assignment.dueDate)}`, `Textarea` reason (required, min 10 chars), submit disabled until valid |
| `PathCard` | `path; enrollment?; contentById; onOpen(); onEnrol?()` | header area badge + title + level, `RingProgress` (size 64) with percent, `t('agent.paths.modules')`, "Next up: <title>" line, badge chip `t('agent.paths.badge')` if any, CTA continue/enrol |
| `PathStepper` | `path; enrollment?; contentById; onOpenModule(contentId)` | Mantine `Stepper orientation='vertical' active={doneCount}` — each step: format icon, title, required/optional tag, duration; completed steps green; clicking a step calls `onOpenModule` |

## Task 8 — Agent page `src/modules/qa/lms/AgentLmsPage/`

`AgentLmsPage.tsx` (default export, barrel `index.ts`):

- `const { t } = useTranslation('qa.lms')`; agent = `AGENT_PERSONA`.
- Store reads: `assignments = useLmsStore(selectAssignments)`, `content`, `paths`, `enrollments`; `mine = useMemo(() => assignments.filter(a => a.agentId === AGENT_PERSONA.id), [assignments])`; `contentById = useMemo(Object.fromEntries)`.
- Tab from `?tab=` (default `assignments`), `setTab` writes search params (copy from AgentProfilePage).
- Layout: `ContentContainer contentWidth='full'` → `Stack gap='lg'` → `LearningHeader` → `Tabs` with 5 tabs (icons `IconListCheck`, `IconRoute`, `IconLibrary`, `IconHistory`, `IconSchool`; counters: assignments = open count, paths = enrolled count, catalog = published count, history = completed, coaching = scheduled sessions).
- `RescheduleModal` mounted at page level; `onSubmit` → `requestReschedule`, `notifySuccess(t('agent.reschedule.success'))`.

`LearningHeader.tsx`: eyebrow/title/description group; right side `RingProgress` (size 96, thickness 10) with the active path percent (first enrollment with `completedAt === null`, else `t('agent.noActivePath')`) and `Text size='xs'` path title; below, `SimpleGrid cols={{ base: 2, md: 5 }}` of `StatCard`s from `agentLmsKpis(mine)` (needsResponse yellow when > 0, overdue red when > 0, quizAverage shows `—` when null).

Tabs (each a named component in `tabs/`, props `{ mine, contentById, paths, enrollments, onOpen(contentId), onAccept(id), onPropose(assignment) }` as needed):

| Tab | Behaviour |
|---|---|
| `AssignmentsTab` | `groupAssignments(mine)` → three `SectionCard`s in order: **Needs your response** (`AcceptanceCard` grid `SimpleGrid cols={{ base: 1, md: 2 }}`; hidden when empty), **Mandatory with deadline** (`AssignmentCard` list; overdue first via `effectiveStatus`), **Recommended for you** (optional). `EmptyState` when all three empty. Accept → `useLmsStore.getState().accept(id)` + `notifySuccess`. Open → `navigate(agentContentPath(contentId))`. |
| `PathsTab` | `SectionCard` "Your learning paths" with `PathCard` per enrollment (`SimpleGrid cols={{ base: 1, md: 2 }}`), click → expands an `Accordion` item under the grid showing `PathStepper` (or open the first module directly via CTA). `SectionCard` "Available paths" with the rest; `Enrol` → `selfEnrollPath` + toast. |
| `CatalogTab` | Filters row: `TextInput` search (`IconSearch`), `SegmentedControl` format (All + 4), `Chip.Group` areas (multi). Grid of `ContentCard` for `status === 'PUBLISHED'`, grouped under `Title order={4}` per area in `LMS_AREAS` order. CTA `Add to my learning` → `selfEnroll` + toast; disabled if an open assignment exists. Count text in header. |
| `HistoryTab` | KPI row (completed total, average score, improved count, declined count) + `SectionCard` with `BaseTable<LmsAssignment>` of `completed`: Material (title + `FormatBadge`) · Completed date · Score (`—` if null) · Metric (`t('metrics.'+id, { ns: 'qa.triggers' })`) · Before (baseline) · After (checkpoint30 or `t('verdict.PENDING')`) · Impact (`ImpactBadge`). Row click opens an `AppDrawer` (`size='md'`) with `ImpactSparkline`, checkpoint tiles, and a button `Review` → player. |
| `AgentCoachingTab` | **Plan 1 reads `useTeamStore(selectProfile(AGENT_PERSONA.id))?.coaching ?? []`** (`selectProfile` returns `AgentProfile \| undefined`; Plan 3 swaps to `coachingStore`). `SectionCard` "Upcoming sessions" (status `scheduled`, `Timeline` with date, topic, coach + role badge, dimension badge via `DIMENSION_META`), `SectionCard` "My commitments" (for each `completed` session with `outcome`: a `Checkbox`-style row with the outcome text and an `I commit to this` button that toggles local state and shows `t('agent.coaching.acknowledged')` — local `useState<Set<string>>` is enough in Plan 1), `SectionCard` "Past sessions" with `BaseTable` (columns in i18n). Deep link `?tab=coaching` works because the tab param is read on mount. |

CSS module: `.areaBar[data-area='QUALITY_ASSURANCE'] { border-left-color: light-dark(var(--mantine-color-cyan-6), var(--mantine-color-cyan-4)); }` etc. for the four areas + GENERAL.

## Task 9 — Content player `src/modules/qa/lms/LmsContentPage/`

Route `/qa/agent/lms/:contentId`. Page:

- Reads `content` by id (else `EmptyState` with `t('common.notFound')` + back button). Finds the agent's assignment for this content (may be undefined → catalogue preview mode: show a `Add to my learning` button instead of progress actions).
- `ContentContainer contentWidth='full' showBackButton onBackClick={() => navigate(AGENT_LMS_PATH)}`; breadcrumb `My Learning › <title>`.
- Two-column `Grid`: left 8/12 player, right 4/12 `ContentSidebar` (`SectionCard`: `FormatBadge`, `AreaBadge` with subItem, duration, level, author, `t('player.meta.assigned')`, due, `AcceptanceBadge`; if `pathId` or the content belongs to an enrolled path: `t('player.partOfPath')` + mini `PathStepper` + `Next module` button; `impact` block when completed (`ImpactSparkline` + verdict) or `t('player.completed.message')` right after completion).
- Header row on the player: title, summary, `Progress` of the assignment.

Players (all local UI state; call `updateProgress` as they go and `complete` at the end):

| Player | Behaviour |
|---|---|
| `VideoPlayerMock` | 16:9 `Paper` with gradient poster (`light-dark()` two-tone by area colour) and centred play `ActionIcon size={64}`; a fake timeline (`Slider` disabled look) and elapsed/total text (`durationMin*60` seconds); when "playing", a `setInterval` (1 s = 20 s of video) advances; chapters list on the right (`NavLink`s, active by `startSec`); progress mapped to percent → `updateProgress` every 10 %; button `Mark as watched` (enabled from 80 %) → `complete()` and show the completion `Alert`. Clear the interval on unmount. |
| `DocumentReader` | `MarkdownPreview` from `@uiw/react-markdown-preview` with `wrapperElement={{ 'data-color-mode': computedColorScheme }}` (use `useComputedColorScheme('light')`), inside a `ScrollArea h={520}` whose `onScrollPositionChange` computes percent read → `updateProgress`; sticky footer `Progress` + `Mark as read` (enabled ≥ 90 %) → `complete()`. |
| `QuizPlayer` | `Stepper` header `t('player.quiz.question')`; one `Radio.Group` per question; Previous/Next; `Submit answers` when all answered → score = correct/total×100; result `Alert` green `passed` / red `failed`; per-question review list with `IconCheck/IconX` and `explanation`; `passed` → `complete(score)`; failed → `Retry` resets (increments attempts via `complete` only on pass; failed attempts just re-render). |
| `ScenarioPlayer` | `situation` in a `Blockquote`; then a `Timeline` of steps: `CUSTOMER` bubbles (left, `Paper bg=light-dark(gray-1, dark-6)`) and `COACH` prompts with a `Textarea` for the agent's answer (min 20 chars to continue); after the last step, `selfCheck` questions like the quiz (3) → score → `complete(score)`; `Finish practice`. |

Completion `Alert` (all players): `t('player.completed.title')` + metric message (`t('player.completed.message', { metric: t('metrics.'+impactMetricId, { ns: 'qa.triggers' }) })` or `noImpact`) + buttons `Back to my assignments` / `Next module` (if path).

## Task 10 — Routes, navigation, redirects, cleanup

1. `src/routes.tsx`
   - Replace the lazy import `AgentLMSPage` → `const AgentLmsPage = React.lazy(() => import('./modules/qa/lms/AgentLmsPage'));` and add `const LmsContentPage = React.lazy(() => import('./modules/qa/lms/LmsContentPage'));`.
   - Route `agent/lms` (id `qa.agent.lms`) renders `<AgentLmsPage />`; add sibling `{ path: 'agent/lms/:contentId', id: 'qa.agent.lms.content', element: <I18nNamespaceLoader><Suspense …><LmsContentPage /></Suspense></I18nNamespaceLoader> }` and `{ path: 'agent/coaching', id: 'qa.agent.coaching', element: <Navigate to='/qa/agent/lms?tab=coaching' replace /> }`.
   - App-chooser redirects: in the same children array that contains `{ path: 'qa', id: 'qa', … }`, add `{ path: 'lms', id: 'app.lms', element: <Navigate to='/qa/agent/lms' replace /> }` and `{ path: 'coaching', id: 'app.coaching', element: <Navigate to='/qa/supervisor/coaching' replace /> }` (the coaching target exists after Plan 3; until then it 404s like today — acceptable).
2. Delete `src/modules/qa/agent/lms/AgentLMSPage.tsx` (and the folder if empty).
3. `src/components/Sidebar/roleNavigation.tsx`: agent item `agent-lms` → `icon: <IconSchool size={20} className={styles.menuIcon} />` (import `IconSchool`), and move it into the **My Work** group: `items: [items[1], items[2], items[4]]` for `agent-mywork` and `items: [items[3], items[5], items[6]]` for `agent-insights` (update the comments). Label: add `"lms": "My Learning"` under `sidebar.agent` in `src/locales/en/common.json` and `"lms": "Mi aprendizaje"` in `es/common.json` (the Sidebar translates labels with the `common` namespace; `qa.agent.json` is not used for it).
4. `qaNamespaces.ts` entries from Task 6.
5. Foreground `npx tsc --noEmit -p .` — must be clean apart from the three pre-existing Campaign files.

## Verification (Plan 1)

- `/qa/agent/lms`: header ring shows QA Essentials 3/5; KPI "Needs your response" = 2; tab Assignments shows two yellow acceptance cards (De-escalation Techniques, Compliance certification quiz), then Objection Handling (45 %), Regulatory Disclosures 2026 (overdue, red), then the recommended playbook.
- Accept → card moves to Mandatory list with "Accepted" badge; Propose date → modal → sends → orange "New date requested" badge.
- Open Objection Handling → video mock plays, chapters highlight, progress climbs, Mark as watched enables at 80 %, completion alert names the metric; back in History the row shows "Measuring".
- Quiz lms-c11 → 4 questions, 90 % pass mark; wrong answers show explanations; pass completes.
- Catalogue → Add to my learning creates a non-mandatory assignment.
- Agent Profile (`/qa/supervisor/your-team/AGT-004`, tab Coaching & LMS) shows the same rows with acceptance + impact columns; Assign material from the profile creates a pending-acceptance row visible in `/qa/agent/lms`.
- Sidebar: agent "My Learning" with school icon in My Work; `/qa/agent/coaching` redirects to the Coaching tab.

---

