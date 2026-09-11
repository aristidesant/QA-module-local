# Dashboard Evaluation Views + Team Burnout Risk — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking. Execute tasks **in order**; every task compiles on its own.

**Goal:** Cut dashboard scrolling for Agent, Supervisor and QA Manager by adding a segmented view switcher (Overview · Quality Assurance · Compliance · Sentiment & Emotion · Business Insights) that shows only the widgets of the selected evaluation area, build the missing area widgets (including a complete Business Insights set), and add a **Burnout Risk** agent table to the Supervisor and QA Manager dashboards that drills into Analytics › Burnout Risk.

**Architecture:** One shared `DashboardViewSwitcher` (built on the project primitive `AppSegmentedControl`) + a `useDashboardView()` hook that keeps the selected view in the URL (`?view=`), so views are deep-linkable and survive reloads. The three `New*Dashboard` pages keep every existing widget and local mock const; their JSX is regrouped into five view blocks. New area widgets are flat files under `src/modules/qa/dashboard/components/` (the folder's existing style) and read from a **new** mock file `viewMockData.ts` — the 3.2k-line `mockData.ts` is not edited. New code is i18n'd under the existing `qa.dashboard` namespace.

**Tech Stack:** React 19, React Router v7 (`useSearchParams`), Mantine v9.2, recharts (already used by the dashboard charts), `@tabler/icons-react`, react-i18next.

**Spec (user):** "Vamos a agregar segmented controls con los diferentes tipos de evaluación (QA, Compliance, Sentiment & Emotion, Business Insights) a los dashboards de QA Manager, Supervisor y también Agente; al clicar filtran los widgets para reducir el scroll. Widget Burnout Risk en Supervisor y QA Manager: lista de agentes clasificados como burnout risk; al clicar un agente nos lleva a Analytics y muestra el comportamiento que lo llevó ahí." Business Insights metrics: early objection, unhandled objection, competitor + price, mis-targeted offer, best sales time slot; rejected products (offered / rejected / rate); non-conversion reasons; most mentioned competitors.

**User decisions (2026-09-10):** 5 segments with **Overview** as default (cross-cutting widgets live there) · **full Business Insights widget set**.

**Dependencies:** The burnout row click navigates to `/qa/supervisor/analytics?view=burnout&agentId=…` / `/qa/qa-manager/analytics?…`. Those routes are delivered by the *Team Analytics* plan (next in the roadmap). Wire the navigation now; it works as soon as that plan lands.

---

## Global Constraints

- **Design-session rules (DESIGN_ROLE.md):** mock data only. Do **not** run `npm run dev`, tests, or `git commit` unless the user explicitly asks in the execution session. `npm run typecheck` after every task.
- Mantine v9; CSS Modules; no inline `style=` (recharts axis font sizing is the one tolerated exception, annotated `{/* inline-style-allow: … */}` exactly like `SentimentTrendChart.tsx:92`). Chart strokes/fills use CSS variables (`'var(--mantine-color-indigo-6)'`) — never hex.
- Dark & light mode must both look right (`light-dark()` for any custom surface).
- Reuse: `SectionCard`, `BaseTable`, `AppSegmentedControl` (`~/components/ui/AppSegmentedControl`), `EmptyState`, existing dashboard cards (`QualityAssuranceCard`, `ComplianceCard`, `SentimentEmotionCard`, `AutoFailsCard`, `SentimentTrendChart`, `PerformanceTrendChart`, `BestWorstCallsTable`, `CriticalIssuesTable`, `RankingsTable`, `QuickInsightsWidget`, `BurnoutRiskWidget`).
- All **new** user-facing strings go through `useTranslation('qa.dashboard')` with keys added to **both** `src/locales/en/qa.dashboard.json` and `src/locales/es/qa.dashboard.json`. Pre-existing hardcoded strings in the three pages stay as they are (out of scope).
- Do **not** edit `src/modules/qa/dashboard/mockData.ts`. Do not change the existing widgets' props.
- TypeScript strict, no `any`. Tabs for indentation, `~/` imports.
- A pre-existing repo-wide TS error may exist; "typecheck passes" = no errors in files touched by this plan.

---

## File Structure

### New files

```
src/modules/qa/dashboard/types/dashboardViews.ts            — DashboardView + all widget row/point types
src/modules/qa/dashboard/hooks/useDashboardView.ts          — URL-backed selected view
src/modules/qa/dashboard/viewMockData.ts                    — per-role data for the four area views + burnout tables
src/modules/qa/dashboard/components/DashboardViewSwitcher.tsx (+ .module.css)
src/modules/qa/dashboard/components/QaErrorBreakdownCard.tsx
src/modules/qa/dashboard/components/ComplianceAreaBreakdownCard.tsx
src/modules/qa/dashboard/components/ComplianceViolationsTable.tsx
src/modules/qa/dashboard/components/EmotionDistributionCard.tsx
src/modules/qa/dashboard/components/SentimentRecoveryCard.tsx
src/modules/qa/dashboard/components/SentimentBreakdownTable.tsx
src/modules/qa/dashboard/components/BusinessSignalsCards.tsx
src/modules/qa/dashboard/components/ConversionTrendChart.tsx (+ .module.css)
src/modules/qa/dashboard/components/NonConversionReasonsCard.tsx
src/modules/qa/dashboard/components/RejectedProductsTable.tsx
src/modules/qa/dashboard/components/CompetitorMentionsCard.tsx
src/modules/qa/dashboard/components/BurnoutRiskTable.tsx
```

### Modified files

- `src/modules/qa/dashboard/components/index.ts` — export the new components
- `src/modules/qa/dashboard/pages/NewAgentDashboard.tsx`, `NewSupervisorDashboard.tsx`, `NewQAManagerDashboard.tsx` — switcher + view blocks
- `src/modules/qa/qaNamespaces.ts` — map `qa.dashboards.agent|supervisor|qa-manager` → `qa.dashboard`
- `src/locales/en/qa.dashboard.json`, `src/locales/es/qa.dashboard.json` — new keys

### Reference files (read-only)

- `src/components/ui/AppSegmentedControl/AppSegmentedControl.tsx` — props `data`, `value`, `onChange`, `fullWidth`, `size`
- `src/modules/qa/dashboard/components/SentimentTrendChart.tsx`, `PerformanceTrendChart.tsx` (+ `.module.css`) — recharts + tooltip pattern
- `src/modules/qa/dashboard/components/QualityAssuranceCard.tsx` — card shell pattern (`Card className={styles.metricCard} p='lg' radius='md' withBorder shadow='sm' h='100%'`)
- `src/modules/qa/dashboard/components/BurnoutRiskWidget.tsx` + `types/burnoutRisk.ts` — level colors/i18n keys to reuse
- `src/modules/qa/dashboard/components/CriticalIssuesTable.tsx` — clickable row pattern
- `src/modules/qa/agent/analytics/tabs/ComplianceAnalyticsTab.tsx:103-134` — the 8 compliance sub-item keys/labels
- `src/modules/qa/emotion-sentiment/types.ts` — 13 emotions and their 5 sentiment categories

---

## View → widget matrix (source of truth for Tasks 5–7)

| View | Agent | Supervisor | QA Manager |
|---|---|---|---|
| **overview** (default) | Performance Score row (4 cards) · `SimpleGrid md:2` [Burnout Assessment (`BurnoutRiskWidget`) \| Critical Issues] · `SimpleGrid md:2` [Team Rankings \| Quick Insights] | Performance Score row · `SimpleGrid md:2` [**Burnout Risk** (`BurnoutRiskTable`) \| Critical Issues] · `SimpleGrid md:2` [Open Disputes \| Tabs(Team Rankings, Team Members, Quick Insights)] | Performance Score row · `SimpleGrid md:2` [**Burnout Risk** \| Critical Issues] · `SimpleGrid md:2` [Quick Insights \| Tabs(Supervisor Rankings, Supervisors, Disputes, Campaigns)] |
| **qa** | `SimpleGrid md:3` [`QualityAssuranceCard` \| `QaErrorBreakdownCard` \| `AutoFailsCard` (non-compact)] · `SimpleGrid md:2` [QA score trend (`PerformanceTrendChart`) \| Best & Worst Calls] | same, team data | same, platform data |
| **compliance** | `SimpleGrid md:3` [`ComplianceCard` \| `ComplianceAreaBreakdownCard` \| Compliance trend (`PerformanceTrendChart`)] · Recent violations (`ComplianceViolationsTable`) | same | same |
| **sentiment** | `SimpleGrid md:3` [`SentimentEmotionCard` \| `EmotionDistributionCard` \| `SentimentRecoveryCard`] · `SimpleGrid md:2` [Sentiment Trend (existing) \| `SentimentBreakdownTable` rows = my recent calls] | same; breakdown rows = team agents | same; breakdown rows = supervisors/teams |
| **business** | `BusinessSignalsCards` (5) · `SimpleGrid md:2` [`ConversionTrendChart` \| `NonConversionReasonsCard`] · `SimpleGrid md:2` [`RejectedProductsTable` \| `CompetitorMentionsCard`] | same | same |

Sentiment Trend and Best & Worst Calls move out of Overview into their area views (that is where the scroll saving comes from). Nothing is deleted.

---

## Task 1: Types, view hook, mock data

**Files:**
- Create: `src/modules/qa/dashboard/types/dashboardViews.ts`
- Create: `src/modules/qa/dashboard/hooks/useDashboardView.ts`
- Create: `src/modules/qa/dashboard/viewMockData.ts`

- [ ] **Step 1: `types/dashboardViews.ts`** (paste as-is)

```typescript
import type { PerformanceTrendPoint } from '../components/PerformanceTrendChart';
import type { BurnoutRiskData } from './burnoutRisk';

export type DashboardView = 'overview' | 'qa' | 'compliance' | 'sentiment' | 'business';
export const DASHBOARD_VIEWS: DashboardView[] = ['overview', 'qa', 'compliance', 'sentiment', 'business'];
export const isDashboardView = (value: string | null): value is DashboardView =>
	value !== null && (DASHBOARD_VIEWS as string[]).includes(value);

export type QaErrorKey = 'ecn' | 'enc' | 'ecc' | 'ecuf';
export interface QaErrorBreakdownItem {
	key: QaErrorKey;
	/** errors counted this week */
	count: number;
	/** category score 0-100 */
	score: number;
	/** delta vs previous week in percentage points (negative = worse) */
	delta: number;
}

export type ComplianceAreaKey = 'security' | 'regulatory' | 'legal';
export interface ComplianceAreaItem { key: string; score: number }
export interface ComplianceAreaDetail { area: ComplianceAreaKey; score: number; items: ComplianceAreaItem[] }
export type ComplianceSeverity = 'critical' | 'warning' | 'info';
export interface ComplianceViolation {
	id: string;
	date: string;
	agentName: string;
	area: ComplianceAreaKey;
	itemKey: string;
	severity: ComplianceSeverity;
	callId: string;
}

export type SentimentCategoryKey = 'very-negative' | 'negative' | 'neutral' | 'positive' | 'very-positive';
export interface EmotionShare { emotion: string; category: SentimentCategoryKey; share: number }
export interface SentimentRecoveryStats {
	recoveredCalls: number;
	negativeStartCalls: number;
	/** 0-100 */
	recoveryRate: number;
	/** delta vs previous week in percentage points */
	delta: number;
	topRecoverer: string | null;
}
export interface SentimentBreakdownRow {
	id: string;
	label: string;
	sublabel: string | null;
	customerSentiment: number;
	agentSentiment: number;
	predominantEmotion: string;
	recoveries: number;
}

export type BusinessSignalType = 'EARLY_OBJECTION' | 'UNHANDLED_OBJECTION' | 'COMPETITOR_PLUS_COST' | 'MISTARGETED_OFFER';
export interface BusinessSignal {
	type: BusinessSignalType;
	count: number;
	/** % of analysed calls */
	percentage: number;
	trend: 'up' | 'down' | 'stable';
	/** percentage points vs previous week */
	trendValue: number;
}
export interface BestTimeSlot { label: string; conversionRate: number; callsCount: number; delta: number }
export interface RejectedProductRow { id: string; product: string; offered: number; rejected: number; rejectionRate: number }
export interface NonConversionReason { key: string; count: number; share: number }
export interface CompetitorMention { name: string; mentions: number; share: number; trend: 'up' | 'down' | 'stable' }
export interface ConversionTrendPoint { week: string; offers: number; conversions: number; conversionRate: number }

export interface BurnoutRiskRow extends BurnoutRiskData {
	agentName: string;
	team: string;
	supervisorName: string;
	/** short human sentence, e.g. "Agent sentiment ↓ 14% · 44% negative calls" */
	primaryDriver: string;
}

export interface DashboardViewData {
	qaErrors: QaErrorBreakdownItem[];
	qaTrend: PerformanceTrendPoint[];
	complianceAreas: ComplianceAreaDetail[];
	complianceTrend: PerformanceTrendPoint[];
	complianceViolations: ComplianceViolation[];
	emotions: EmotionShare[];
	recovery: SentimentRecoveryStats;
	sentimentRows: SentimentBreakdownRow[];
	businessSignals: BusinessSignal[];
	bestTimeSlot: BestTimeSlot;
	conversionTrend: ConversionTrendPoint[];
	nonConversionReasons: NonConversionReason[];
	rejectedProducts: RejectedProductRow[];
	competitors: CompetitorMention[];
}
```

- [ ] **Step 2: `hooks/useDashboardView.ts`**

```typescript
import { useCallback } from 'react';
import { useSearchParams } from 'react-router';
import { isDashboardView, type DashboardView } from '../types/dashboardViews';

const PARAM = 'view';

/** Selected dashboard view, persisted in the URL (?view=qa). 'overview' is the default and is not written. */
export function useDashboardView(): [DashboardView, (view: DashboardView) => void] {
	const [params, setParams] = useSearchParams();
	const raw = params.get(PARAM);
	const view: DashboardView = isDashboardView(raw) ? raw : 'overview';

	const setView = useCallback(
		(next: DashboardView) => {
			setParams(
				(prev) => {
					const copy = new URLSearchParams(prev);
					if (next === 'overview') copy.delete(PARAM);
					else copy.set(PARAM, next);
					return copy;
				},
				{ replace: true }
			);
		},
		[setParams]
	);

	return [view, setView];
}
```

- [ ] **Step 3: `viewMockData.ts`** — export `AGENT_VIEW_DATA`, `SUPERVISOR_VIEW_DATA`, `QA_MANAGER_VIEW_DATA: DashboardViewData` and `SUPERVISOR_BURNOUT_RISK`, `QA_MANAGER_BURNOUT_RISK: BurnoutRiskRow[]`. Use the values below (Agent in full; Supervisor/QA Manager use the same shapes with the listed differences). Agent identity = John Smith; supervisor roster = the `TEAM_MEMBERS` names already in `NewSupervisorDashboard.tsx` (Sarah Johnson, Mike Chen, Jessica Martinez, John Smith, Emma Davis, David Brown, Lisa Wong); QA Manager roster = the `SUPERVISORS_OVERVIEW` names in `NewQAManagerDashboard.tsx`.

**AGENT_VIEW_DATA**
- `qaErrors`: ecn `{count 1, score 95, delta +2}`, enc `{3, 88, -1}`, ecc `{1, 92, 0}`, ecuf `{2, 85, -3}`
- `qaTrend`: Week 1 84 · Week 2 86 · Week 3 89 · Week 4 90
- `complianceAreas`: security 94 → `dataProtection 96, disclosureCompliance 92`; regulatory 88 → `cobranzaRegulada 85, transparenciaConsentimiento 91`; legal 90 → `amenazasTradicionales 98, rrss 94, superintendenciaBancos 86, noLlamarList 82`
- `complianceTrend`: 86 · 88 · 89 · 91
- `complianceViolations` (4): `VIO-A-001 2026-09-08 John Smith regulatory cobranzaRegulada warning CALL-2026-09-0812`, `VIO-A-002 2026-09-05 John Smith legal noLlamarList critical CALL-2026-09-0533`, `VIO-A-003 2026-09-03 John Smith security disclosureCompliance info CALL-2026-09-0301`, `VIO-A-004 2026-08-29 John Smith legal superintendenciaBancos warning CALL-2026-08-2914`
- `emotions` (shares sum 100): SATISFACTION positive 28, JOY very-positive 14, GRATITUDE positive 10, RELIEF positive 9, NEUTRAL neutral 17, SURPRISE neutral 4, FRUSTRATION negative 9, DISAPPOINTMENT negative 4, SADNESS negative 2, FEAR negative 1, ANGER very-negative 2, RAGE very-negative 0, ELATION very-positive 0
- `recovery`: `{ recoveredCalls 7, negativeStartCalls 12, recoveryRate 58, delta +6, topRecoverer: null }`
- `sentimentRows` (my last 6 calls): `CALL-2026-09-0812 · Q3 Customer Service · 4.6/4.4 · Satisfaction · 1`, `CALL-2026-09-0801 · Tech Support · 3.2/3.9 · Frustration · 0`, `CALL-2026-09-0710 · Q3 Customer Service · 4.8/4.5 · Joy · 1`, `CALL-2026-09-0704 · Sales Training · 2.4/3.6 · Anger · 0`, `CALL-2026-09-0622 · Q3 Customer Service · 4.1/4.2 · Neutral · 0`, `CALL-2026-09-0605 · Tech Support · 4.4/4.3 · Relief · 1` (label = call id, sublabel = campaign, customer/agent sentiment)
- `businessSignals`: EARLY_OBJECTION `{18, 22, down, -3}`, UNHANDLED_OBJECTION `{9, 11, down, -2}`, COMPETITOR_PLUS_COST `{7, 9, up, +2}`, MISTARGETED_OFFER `{5, 6, stable, 0}`
- `bestTimeSlot`: `{ label: '10:00 – 12:00', conversionRate: 34, callsCount: 41, delta: +4 }`
- `conversionTrend`: W1 `{offers 38, conversions 9, rate 24}`, W2 `{42, 11, 26}`, W3 `{40, 12, 30}`, W4 `{45, 15, 33}`
- `nonConversionReasons` (keys are i18n keys under `businessView.reasons.*`): `priceTooHigh 21/35`, `noNeed 12/20`, `distrustQuality 9/15`, `thirdPartyDecision 8/13`, `installationRequirements 6/10`, `other 4/7`
- `rejectedProducts`: `Premium Plan 60/28/47`, `Fiber 300 Mbps 48/19/40`, `TV Bundle 35/21/60`, `Mobile Add-on 52/12/23`, `Device Protection 30/17/57`
- `competitors`: `Claro 23/41 up`, `Altice 17/30 stable`, `Viva 9/16 down`, `Wind 7/13 up`

**SUPERVISOR_VIEW_DATA** — same structure, team scale: qaErrors counts ×7 (ecn 6/92/+1, enc 19/85/-2, ecc 5/89/0, ecuf 11/81/-4); qaTrend 82·84·86·87; compliance areas security 91 / regulatory 86 / legal 89 with items 2–5 points lower than agent; complianceTrend 84·85·87·88; 6 violations across David Brown, Lisa Wong, Emma Davis (2 critical, 3 warning, 1 info); emotions shift +4 to FRUSTRATION/−4 SATISFACTION; recovery `{31, 58, 53, +2, 'Mike Chen'}`; `sentimentRows` = the 7 team members (label name, sublabel `Team 1`, customer/agent from `TEAM_MEMBERS.sentiment` ± 0.2, emotions Satisfaction/Joy for top 5, Frustration/Anger for David Brown & Lisa Wong, recoveries 6,5,4,3,3,1,0); business signals ×7; bestTimeSlot `'15:00 – 17:00' 31% 212 calls +2`; conversionTrend offers 260–310, rate 22→29; reasons ×7; rejected products ×7; competitors ×7.

**QA_MANAGER_VIEW_DATA** — platform scale (×45): qaErrors (ecn 28/90/0, enc 96/83/-1, ecc 24/87/-2, ecuf 52/79/-3); qaTrend 80·81·83·84; violations 8 across supervisors' teams; recovery `{188, 402, 47, -1, 'Sarah Johnson · Team'}`; `sentimentRows` = 7 supervisors (label supervisor name, sublabel `Team of {{teamSize}}` → store as `'8 agents'`), sentiment from `SUPERVISORS_OVERVIEW`; bestTimeSlot `'10:00 – 12:00' 29% 1,480 calls +1`; conversionTrend offers 1,600–1,900, rate 21→27.

**SUPERVISOR_BURNOUT_RISK** (4 rows, `BurnoutRiskLevel` enum values):
| agentId | agentName | team | supervisorName | level | percentage | trend | primaryDriver | lastUpdated |
|---|---|---|---|---|---|---|---|---|
| AGT-006 | David Brown | Team 1 | Maria García | HIGH | 82 | declining | Agent sentiment ↓ 14% · 44% negative-emotion calls | 2026-09-10T08:00:00Z |
| AGT-007 | Lisa Wong | Team 1 | Maria García | HIGH | 76 | stable | 3 consecutive very negative calls · QA ↓ 9% | 2026-09-10T08:00:00Z |
| AGT-005 | Emma Davis | Team 1 | Maria García | MEDIUM | 55 | improving | Negative-emotion calls 31% (threshold 30%) | 2026-09-09T18:00:00Z |
| AGT-004 | John Smith | Team 1 | Maria García | LOW | 28 | improving | Sentiment recovering after last week's dip | 2026-09-09T18:00:00Z |

Supervisor persona = **Maria García (SUP-001, Team 1)** — the same identity used by the Triggers and Team Analytics plans, so deep links resolve across sections.

**QA_MANAGER_BURNOUT_RISK** (6 rows): the 4 above plus `AGT-010 Carlos Vega · Team 2 · Juan Pérez · HIGH 79 declining · "Compliance ↓ 11% · agent sentiment 2.7"` and `AGT-017 Nina Patel · Team 3 · Laura Gómez · MEDIUM 58 stable · "Auto-fails 3 this week · sentiment 3.0"`.

- [ ] **Step 4: Typecheck**; **Step 5: Commit** *(if authorized)* — `feat(qa-dashboard): view types, url-backed view hook and area mock data`

---

## Task 2: View switcher + i18n keys + namespace mapping

**Files:**
- Create: `components/DashboardViewSwitcher.tsx`, `components/DashboardViewSwitcher.module.css`
- Modify: `components/index.ts`, `src/modules/qa/qaNamespaces.ts`, `src/locales/{en,es}/qa.dashboard.json`

- [ ] **Step 1: `DashboardViewSwitcher`**

```tsx
import React from 'react';
import { Group } from '@mantine/core';
import {
	IconBriefcase, IconClipboardCheck, IconLayoutDashboard, IconMoodSmile, IconShieldCheck,
	type TablerIcon,
} from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import AppSegmentedControl from '~/components/ui/AppSegmentedControl';
import { DASHBOARD_VIEWS, type DashboardView } from '../types/dashboardViews';
import styles from './DashboardViewSwitcher.module.css';

const VIEW_ICONS: Record<DashboardView, TablerIcon> = {
	overview: IconLayoutDashboard,
	qa: IconClipboardCheck,
	compliance: IconShieldCheck,
	sentiment: IconMoodSmile,
	business: IconBriefcase,
};

interface DashboardViewSwitcherProps {
	value: DashboardView;
	onChange: (view: DashboardView) => void;
}

/** Segmented control that narrows the dashboard to one evaluation area. */
export const DashboardViewSwitcher: React.FC<DashboardViewSwitcherProps> = ({ value, onChange }) => {
	const { t } = useTranslation('qa.dashboard');
	const data = DASHBOARD_VIEWS.map((view) => {
		const Icon = VIEW_ICONS[view];
		return {
			value: view,
			label: (
				<Group gap={6} wrap='nowrap'>
					<Icon size={16} />
					<span className={styles.label}>{t(`views.${view}`)}</span>
				</Group>
			),
		};
	});
	return (
		<div className={styles.wrapper} role='navigation' aria-label={t('views.ariaLabel')}>
			<AppSegmentedControl data={data} value={value} onChange={(v) => onChange(v as DashboardView)} size='md' />
		</div>
	);
};

export default DashboardViewSwitcher;
```

`DashboardViewSwitcher.module.css`: `.wrapper { overflow-x: auto; padding-bottom: 2px; }` and `@media (max-width: 48em) { .label { display: none; } }` (icons only on phones; keep `aria-label` via `title` attr on the `Group` if desired).

- [ ] **Step 2: export** — in `components/index.ts` append a section `// Dashboard evaluation views` exporting `DashboardViewSwitcher` and (in later tasks) each new widget.

- [ ] **Step 3: namespace mapping** — in `qaNamespaces.ts` add `'qa.dashboards.agent': 'qa.dashboard'`, `'qa.dashboards.supervisor': 'qa.dashboard'`, `'qa.dashboards.qa-manager': 'qa.dashboard'`.

- [ ] **Step 4: i18n keys** — add to `src/locales/en/qa.dashboard.json` (merge at top level, keep existing keys) and mirror in Spanish in `es/qa.dashboard.json`:

```json
{
	"views": {
		"ariaLabel": "Dashboard view",
		"overview": "Overview",
		"qa": "Quality Assurance",
		"compliance": "Compliance",
		"sentiment": "Sentiment & Emotion",
		"business": "Business Insights"
	},
	"common": { "vsLastWeek": "vs last week", "calls_one": "{{count}} call", "calls_other": "{{count}} calls", "viewCall": "View call" },
	"qaView": {
		"breakdownTitle": "Error breakdown",
		"breakdownSubtitle": "Errors this week by category",
		"errors": { "ecn": "Critical business", "enc": "Non-critical", "ecc": "Critical compliance", "ecuf": "Critical end-user" },
		"errorsShort": { "ecn": "ECN", "enc": "ENC", "ecc": "ECC", "ecuf": "ECUF" },
		"total": "Total errors",
		"trendTitle": "QA score trend",
		"trendDescription": "4-week quality assurance progression",
		"bestWorstTitle": "Best & Worst Calls",
		"bestWorstDescription": "Top and bottom performing calls this week"
	},
	"complianceView": {
		"areasTitle": "Areas & sub-items",
		"areasSubtitle": "Score per compliance sub-item",
		"areas": { "security": "Security", "regulatory": "Regulatory", "legal": "Legal" },
		"items": {
			"dataProtection": "Data Protection", "disclosureCompliance": "Disclosure Compliance",
			"cobranzaRegulada": "Billing Process", "transparenciaConsentimiento": "Transparency",
			"amenazasTradicionales": "Threats", "rrss": "Social Media",
			"superintendenciaBancos": "Banking Superintendence", "noLlamarList": "Do-Not-Call"
		},
		"trendTitle": "Compliance trend",
		"trendDescription": "4-week compliance progression",
		"violationsTitle": "Recent violations",
		"violationsDescription": "Latest compliance violations detected in evaluated calls",
		"columns": { "date": "Date", "agent": "Agent", "area": "Area", "item": "Sub-item", "severity": "Severity", "call": "Call" },
		"severity": { "critical": "Critical", "warning": "Warning", "info": "Info" },
		"empty": "No violations this week"
	},
	"sentimentView": {
		"emotionsTitle": "Emotion distribution",
		"emotionsSubtitle": "Share of calls by predominant emotion",
		"categories": { "very-negative": "Very negative", "negative": "Negative", "neutral": "Neutral", "positive": "Positive", "very-positive": "Very positive" },
		"emotions": {
			"ELATION": "Elation", "GRATITUDE": "Gratitude", "JOY": "Joy", "RELIEF": "Relief", "SATISFACTION": "Satisfaction",
			"NEUTRAL": "Neutral", "SURPRISE": "Surprise", "FRUSTRATION": "Frustration", "SADNESS": "Sadness",
			"FEAR": "Fear", "DISAPPOINTMENT": "Disappointment", "ANGER": "Anger", "RAGE": "Rage"
		},
		"recoveryTitle": "Sentiment recovery",
		"recoverySubtitle": "Calls that started negative and ended positive",
		"recoveryRate": "Recovery rate",
		"recovered": "{{recovered}} of {{total}} negative-start calls",
		"topRecoverer": "Top recoverer: {{name}}",
		"trendTitle": "Sentiment Trend",
		"trendDescription": "4-week sentiment progression",
		"breakdownTitle": { "agent": "My recent calls", "supervisor": "Team breakdown", "qaManager": "Breakdown by team" },
		"breakdownDescription": { "agent": "Customer and agent sentiment per call", "supervisor": "Customer and agent sentiment per agent", "qaManager": "Customer and agent sentiment per supervisor team" },
		"columns": { "label": "Name", "customer": "Customer", "agent": "Agent", "emotion": "Predominant emotion", "recoveries": "Recoveries" }
	},
	"businessView": {
		"signalsTitle": "Objection & offer signals",
		"signalsDescription": "How often each signal appeared in analysed calls this week",
		"signals": {
			"EARLY_OBJECTION": "Early objection", "UNHANDLED_OBJECTION": "Unhandled objection",
			"COMPETITOR_PLUS_COST": "Competitor + price", "MISTARGETED_OFFER": "Mis-targeted offer"
		},
		"ofCalls": "{{percentage}}% of calls",
		"bestTimeSlot": "Best sales time slot",
		"bestTimeSlotHint": "{{rate}}% conversion · {{calls}} calls",
		"conversionTitle": "Conversion trend",
		"conversionDescription": "Offers vs conversions over the last 4 weeks",
		"conversionRate": "Conversion rate",
		"offers": "Offers",
		"conversions": "Conversions",
		"reasonsTitle": "Non-conversion reasons",
		"reasonsDescription": "Why customers did not convert",
		"reasons": {
			"priceTooHigh": "Price or plan seems expensive", "noNeed": "Does not need the service",
			"distrustQuality": "Distrust of service quality", "thirdPartyDecision": "Must consult a third party",
			"installationRequirements": "Installation or requirement issues", "other": "Other"
		},
		"rejectedTitle": "Rejected products",
		"rejectedDescription": "Offered vs rejected by product type",
		"rejectedColumns": { "product": "Product", "offered": "Offered", "rejected": "Rejected", "rate": "Rejection rate" },
		"competitorsTitle": "Most mentioned competitors",
		"competitorsDescription": "Competitors named by customers during calls",
		"mentions_one": "{{count}} mention",
		"mentions_other": "{{count}} mentions"
	},
	"burnoutTable": {
		"title": "Burnout Risk",
		"description": { "supervisor": "Agents on your team flagged by your burnout rules", "qaManager": "Agents flagged by burnout rules across all teams" },
		"columns": { "agent": "Agent", "supervisor": "Supervisor", "level": "Level", "risk": "Risk", "trend": "Trend", "driver": "Main driver", "updated": "Updated" },
		"empty": "No agents at risk right now",
		"emptyDescription": "Agents appear here when a burnout rule from Triggers matches them.",
		"viewInAnalytics": "View in Analytics"
	}
}
```

- [ ] **Step 5: Typecheck**; **Step 6: Commit** *(if authorized)* — `feat(qa-dashboard): dashboard view switcher and i18n keys`

---

## Task 3: Quality Assurance + Compliance widgets

**Files (create):** `QaErrorBreakdownCard.tsx`, `ComplianceAreaBreakdownCard.tsx`, `ComplianceViolationsTable.tsx`; export from `components/index.ts`.

All cards use the same shell as `QualityAssuranceCard`: `Card className={styles.metricCard} p='lg' radius='md' withBorder shadow='sm' h='100%'` with `styles` from `../Dashboard.module.css`, header `Group justify='space-between' align='flex-start' wrap='nowrap'` → `Text fw={600} size='md'` title + `Text size='xs' c='dimmed'` subtitle.

**`QaErrorBreakdownCard`** props `{ items: QaErrorBreakdownItem[] }` — body `Stack gap='sm'`: one row per item: `Group justify='space-between'`: left `Group gap='xs'`: `Badge size='xs' variant='light' color={QA_COLORS[key]}` short label (`qaView.errorsShort.*`, colors cyan/blue/grape/indigo — same as `QualityAssuranceCard` `QA_CATEGORIES`) + `Text size='sm'` full label; right `Group gap='xs'`: `Text fw={600} size='sm'` count, delta chip `Text size='xs' c={delta > 0 ? 'green' : delta < 0 ? 'red' : 'dimmed'}` `↑2` / `↓3` / `–`. Under each row `Progress size='xs' value={score} color={QA_COLORS[key]}`. Footer `Divider` + `Group justify='space-between'`: `Text size='xs' c='dimmed'` `qaView.total` and `Text fw={700}` sum of counts.

**`ComplianceAreaBreakdownCard`** props `{ areas: ComplianceAreaDetail[] }` — `Accordion variant='separated' multiple defaultValue={['security']}` (one item per area): control = `Group justify='space-between'`: `Text fw={600} size='sm'` area label + `Badge color={scoreColor(score)} variant='light'` `{score}%` where `scoreColor = ≥90 'teal' · ≥80 'yellow' · else 'red'` (matches `ComplianceCard` statuses); panel = `Stack gap='xs'` of `Group justify='space-between'` `Text size='sm'` item label (`complianceView.items.*`) + `Text size='sm' fw={600} c={scoreColor}` `{score}%` with `Progress size='xs' color={scoreColor(item.score)} value={item.score}`.

**`ComplianceViolationsTable`** props `{ violations: ComplianceViolation[]; onViolationClick?: (v) => void; showAgent?: boolean }` — `BaseTable<ComplianceViolation>` `density='compact'` `getRowId` `onRowClick={onViolationClick}` columns: date (`useDateFormatter('date')`), agent (only when `showAgent`), area `Badge variant='outline'` (security grape · regulatory indigo · legal violet), item label, severity `Badge variant='light'` (critical red · warning yellow · info blue), call id `Text size='xs' c='dimmed'`. Empty → `EmptyState message={t('complianceView.empty')}`.

- [ ] Steps: create the three components → export → typecheck → commit *(if authorized)* `feat(qa-dashboard): QA error breakdown and compliance area widgets`

---

## Task 4: Sentiment & Emotion widgets

**Files (create):** `EmotionDistributionCard.tsx`, `SentimentRecoveryCard.tsx`, `SentimentBreakdownTable.tsx`; export.

**`EmotionDistributionCard`** props `{ emotions: EmotionShare[] }` — group by `category` in fixed order very-positive → positive → neutral → negative → very-negative; stacked bar at top: `Progress.Root size='lg'` with one `Progress.Section` per category (`value` = category share sum, `color` = very-positive green · positive teal · neutral gray · negative orange · very-negative red, `Tooltip` with category label + %). Below: `Stack gap={6}` of the top 6 emotions by share: `Group justify='space-between'`: `Group gap='xs'`: `ColorSwatch size={10} color={`var(--mantine-color-${categoryColor}-6)`}` + `Text size='sm'` emotion label; `Text size='sm' fw={600}` `{share}%`. Footer `Text size='xs' c='dimmed'` category legend (`categories.*` labels joined with ` · `).

**`SentimentRecoveryCard`** props `{ stats: SentimentRecoveryStats }` — center `RingProgress size={120} thickness={12} roundCaps sections={[{ value: recoveryRate, color: 'teal' }]} label={<Text ta='center' fw={700} size='xl'>{recoveryRate}%</Text>}`; right `Stack gap={4}`: `Text size='sm' fw={600}` `sentimentView.recoveryRate`; `Text size='xs' c='dimmed'` `sentimentView.recovered` (interpolate); delta `Text size='xs' c={delta >= 0 ? 'green' : 'red'}` `{delta > 0 ? '+' : ''}{delta} pts · {t('common.vsLastWeek')}`; `topRecoverer` → `Badge variant='light' color='teal'` `sentimentView.topRecoverer` when not null.

**`SentimentBreakdownTable`** props `{ rows: SentimentBreakdownRow[]; onRowClick?: (row) => void }` — `BaseTable` `density='compact'` columns: label (`Stack gap={0}`: `Text size='sm' fw={500}` label, `Text size='xs' c='dimmed'` sublabel), customer sentiment (`Text fw={600} c={bandColor}` value `toFixed(1)` where `bandColor = ≥4 'green' · ≥3 'yellow' · else 'red'` — reuse `getSentimentBand` from `SentimentEmotionCard` if it exposes a color, else local), agent sentiment (same), emotion (`Badge variant='light' color={emotionCategoryColor}` — map via `EMOTION_SENTIMENT_MAP` from `~/modules/qa/emotion-sentiment/types`; Title-case display via `sentimentView.emotions.*` keyed by upper-case), recoveries (number, right aligned).

- [ ] Steps: create → export → typecheck → commit *(if authorized)* `feat(qa-dashboard): emotion distribution, recovery and breakdown widgets`

---

## Task 5: Business Insights widgets

**Files (create):** `BusinessSignalsCards.tsx`, `ConversionTrendChart.tsx` (+ `.module.css`), `NonConversionReasonsCard.tsx`, `RejectedProductsTable.tsx`, `CompetitorMentionsCard.tsx`; export.

**`BusinessSignalsCards`** props `{ signals: BusinessSignal[]; bestTimeSlot: BestTimeSlot }` — `SimpleGrid cols={{ base: 1, sm: 2, lg: 5 }} spacing='md'`: 4 signal cards + 1 best-time-slot card, each the standard card shell: `ThemeIcon variant='light' size='lg' color` (EARLY_OBJECTION orange `IconHandStop`, UNHANDLED_OBJECTION red `IconMessageOff`, COMPETITOR_PLUS_COST violet `IconBuildingStore`, MISTARGETED_OFFER yellow `IconTargetOff`, best slot green `IconClockHour10`), `Text size='xs' c='dimmed'` label, `Text fw={700} fz='xl'` count (slot: `label`), `Text size='xs'` `businessView.ofCalls` (slot: `bestTimeSlotHint`), trend chip `Group gap={4}`: `IconTrendingUp/Down/Minus size={14}` + `Text size='xs'` `±{trendValue} pts` colored (for objection signals **down is good**: down → green, up → red, stable → dimmed; slot delta ≥0 → green).

**`ConversionTrendChart`** props `{ data: ConversionTrendPoint[] }` — recharts `ComposedChart` inside `ResponsiveContainer height={260}`: `Bar dataKey='offers' fill='var(--mantine-color-gray-4)'` + `Bar dataKey='conversions' fill='var(--mantine-color-indigo-5)'` on left axis, `Line dataKey='conversionRate' stroke='var(--mantine-color-teal-6)' strokeWidth={2.5}` on right axis (`yAxisId='rate'` domain `[0, 100]`), `CartesianGrid strokeDasharray='3 3' stroke='var(--mantine-color-gray-3)'`, axes styled exactly like `SentimentTrendChart.tsx:93-106` (with the `inline-style-allow` comments), custom tooltip (module css classes `.tooltip`, `.tooltipLabel`, `.tooltipValue` copied from `PerformanceTrendChart.module.css`), `Legend` with i18n names (`businessView.offers/conversions/conversionRate`).

**`NonConversionReasonsCard`** props `{ reasons: NonConversionReason[] }` — `Stack gap='sm'`, sorted by share desc: `Group justify='space-between'` `Text size='sm'` label (`businessView.reasons.*`) + `Text size='sm' fw={600}` `{share}%` · `Text size='xs' c='dimmed'` `{count}`; `Progress size='sm' value={share} color='orange'`.

**`RejectedProductsTable`** props `{ rows: RejectedProductRow[] }` — `BaseTable` `density='compact'` columns: product (`fw={500}`), offered, rejected, rejection rate (`Group gap='xs'`: `Progress size='sm' value={rate} color={rate >= 50 ? 'red' : rate >= 35 ? 'yellow' : 'teal'} w={80}` + `Text size='sm' fw={600}` `{rate}%`). `initialSort` by rejectionRate desc.

**`CompetitorMentionsCard`** props `{ competitors: CompetitorMention[] }` — `Stack gap='sm'`: rows `Group justify='space-between'`: `Group gap='sm'`: `Avatar size='sm' radius='xl' color='violet'` initial + `Text size='sm' fw={500}` name; right `Group gap='xs'`: `Text size='sm'` `businessView.mentions` (plural) · `Badge size='xs' variant='light'` `{share}%` · trend icon (`IconTrendingUp` red — more mentions is bad — / `IconTrendingDown` green / `IconMinus` dimmed).

- [ ] Steps: create → export → typecheck → commit *(if authorized)* `feat(qa-dashboard): business insights widgets`

---

## Task 6: Burnout Risk table (Supervisor / QA Manager)

**Files (create):** `BurnoutRiskTable.tsx`; export.

Props `{ rows: BurnoutRiskRow[]; showSupervisor?: boolean; onAgentClick: (row: BurnoutRiskRow) => void }`.

- `BaseTable<BurnoutRiskRow>` `density='compact'` `getRowId={(r) => r.agentId}` `onRowClick={onAgentClick}` `initialSort={[{ id: 'percentage', desc: true }]}`.
- Columns: agent (`Group gap='sm'`: `Avatar size='sm' radius='xl'` initials + `Stack gap={0}`: `Text size='sm' fw={500}` name, `Text size='xs' c='dimmed'` team), supervisor (only `showSupervisor`), level (`Badge variant='filled' color={levelColor}` — reuse the mapping in `BurnoutRiskWidget` (`low` green · `medium` yellow · `high` red) and its i18n keys `burnout.level.*`), risk (`Group gap='xs'`: `Progress size='sm' w={90} value={percentage} color={levelColor}` + `Text size='sm' fw={600}` `{percentage}%`), trend (`ThemeIcon variant='light' size='sm'` `IconTrendingDown` green for `improving`, `IconMinus` gray `stable`, `IconTrendingUp` red `declining` + `Tooltip` `burnout.trend.*`), driver (`Text size='xs' lineClamp={2}` primaryDriver), updated (`useDateFormatter('date')`).
- Row hover shows `Button variant='subtle' size='compact-xs'` `burnoutTable.viewInAnalytics` in the last column (always rendered, `stopPropagation`, same handler).
- Empty: `EmptyState icon={<IconFlame size={32} />} message={t('burnoutTable.empty')} description={t('burnoutTable.emptyDescription')}`.
- Wrap usage in the pages with `SectionCard title={t('burnoutTable.title')} description={t('burnoutTable.description.<role>')} headerAccent='red'`.

- [ ] Steps: create → export → typecheck → commit *(if authorized)* `feat(qa-dashboard): burnout risk agent table`

---

## Task 7: Wire the three dashboards

**Files (modify):** `NewAgentDashboard.tsx`, `NewSupervisorDashboard.tsx`, `NewQAManagerDashboard.tsx`.

Common changes in each page:
1. Imports: `useDashboardView`, `DashboardViewSwitcher`, the new widgets, the role's `*_VIEW_DATA` (+ `*_BURNOUT_RISK` for supervisor/QA manager), `useTranslation('qa.dashboard')` for the **new** SectionCard titles only.
2. `const [view, setView] = useDashboardView();` and render `<DashboardViewSwitcher value={view} onChange={setView} />` directly under the header `<div>`.
3. Keep every existing local const/column definition untouched. Regroup the JSX into five blocks, each rendered with `{view === 'overview' && (<>…</>)}` etc., following the **View → widget matrix** exactly. Wrap the new area SectionCards with i18n titles (`qaView.trendTitle`, `complianceView.violationsTitle`, `sentimentView.breakdownTitle.<role>`, `businessView.*Title` …).
4. `PerformanceTrendChart` is exported from `../components` already; pass `data={VIEW_DATA.qaTrend}` / `complianceTrend`.
5. `ComplianceViolationsTable onViolationClick={(v) => navigate(`/qa/call/${v.callId}`)}` (`showAgent` true for supervisor/QA manager, false for agent).
6. `SentimentBreakdownTable` rows from `VIEW_DATA.sentimentRows`; for the agent page `onRowClick={(row) => navigate(`/qa/call/${row.id}`)}`; supervisor/QA manager no click.

Page-specific:
- **Agent:** Overview second row becomes `SimpleGrid md:2` [Team Rankings | Quick Insights]; fix `RankingsTable onViewAll={() => navigate('/qa/agent/rankings')}` (the current `scrollIntoView` targets a non-existent id) and drop the `title/description` duplication inside the card if it renders twice.
- **Supervisor:** Overview row 2 = `SectionCard burnout` (`BurnoutRiskTable rows={SUPERVISOR_BURNOUT_RISK} onAgentClick={(r) => navigate(`/qa/supervisor/analytics?view=burnout&agentId=${r.agentId}`)}`) | Critical Issues; row 3 = Open Disputes | existing Tabs. Sentiment Trend and Best & Worst move to their views.
- **QA Manager:** Overview row 2 = burnout (`QA_MANAGER_BURNOUT_RISK`, `showSupervisor`, navigate to `/qa/qa-manager/analytics?view=burnout&agentId=…`) | Critical Issues; row 3 = Quick Insights | existing Tabs.

- [ ] **Step 1:** Agent page · **Step 2:** Supervisor page · **Step 3:** QA Manager page · **Step 4: Typecheck** · **Step 5: Commit** *(if authorized)* `feat(qa-dashboard): segmented evaluation views and team burnout risk on role dashboards`

---

## Task 8: Final audit

- [ ] No new hardcoded user-facing strings in the new components (grep `label='`, `title='` inside `components/*.tsx` created here); every `t('…')` key exists in en **and** es.
- [ ] No hex colors in new files; all `.module.css` use tokens / `light-dark()`.
- [ ] `npm run typecheck` clean for touched files.
- [ ] *(Only if the user asks to run the app)* Manual checklist: each role dashboard shows the switcher; `?view=business` deep link opens Business Insights; Overview fits in ~1.5 screens at 1440×900; every widget renders in dark mode; burnout row click navigates to the analytics URL (404 until the Analytics plan lands is expected); agent Team Rankings "View all" opens `/qa/agent/rankings`; violation row opens `/qa/call/<id>`.

---

## Spec Coverage Check

- ✅ Segmented control per evaluation type on Agent, Supervisor and QA Manager dashboards, filtering widgets to reduce scroll — Tasks 2, 7 (Overview default per user decision)
- ✅ QA view with the four error types (critical business, non-critical, critical compliance, critical end-user) — Task 3
- ✅ Compliance view with Security / Regulatory / Legal and their sub-items, violations — Task 3
- ✅ Sentiment & Emotion view with grouped emotions (13 emotions → 5 categories), trend, recovery, breakdown — Task 4
- ✅ Business Insights: early objection, unhandled objection, competitor + price, mis-targeted offer, best sales time slot, rejected products (offered / rejected / rate), non-conversion reasons list, most mentioned competitors — Task 5
- ✅ Burnout Risk table on Supervisor and QA Manager dashboards; click → Analytics › Burnout Risk for that agent — Tasks 6, 7 (route delivered by the Team Analytics plan)
- ✅ Dark/light, i18n en+es, shared primitives, no edits to legacy mock file — all tasks

## Execution Choice

1. **Subagent-Driven (recommended for Haiku):** one subagent per task, in order 1→8.
2. **Inline execution:** sequential in one session.
