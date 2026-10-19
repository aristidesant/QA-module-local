# Inbox message detail: a body and a graphic that fit each kind of message

## Context

The message detail (`/qa/{role}/inbox/:id`) now reads like a mail pane, but every kind of message still gets the same generic "facts strip": metric alerts and trend warnings show three numbers and an unlabelled sparkline with no threshold; burnout shows the risk ring plus bare driver labels; the automatic recognition is a trophy icon with one sentence; a badge is an emoji in a gray circle that ignores its tier; direct messages show replies labelled by role, without the person or an avatar, under a generic composer.

Goal: each scenario tells its own story with the right visual, using data the app already has.

Decisions made with the user (2026-10-19):

- **Alerts and trends:** a dated line chart (dates derived from the window) with a dashed reference line at the threshold (alert) or at the starting level (trend), the last point highlighted, and tiles above with the gap in points.
- **Burnout:** the agent's live drivers from the trigger rules (condition, current value, status) and the 6-month risk timeline; team-level alerts fall back to the driver labels.
- **Positive tone:** recognitions and badges use the brand accent (primary green); tier colours only on the tier label. Alerts keep amber and danger.
- **Direct messages:** a chat thread with avatar, person name, role and time; the original message is the first bubble; the composer says "Reply to {name}" and sends with Ctrl+Enter.

Mode: mockup. Mantine v9 + `@mantine/charts`, CSS modules, no inline styles, strings in `en` and `es`. No tests, no dev server. Prettier on touched files only. Do not commit unless asked.

Plan copy convention: Task 0 copies this file to `docs/superpowers/plans/2026-10-19-inbox-detail-per-kind.md`.

---

## Verified facts (do not re-explore)

**Files (all LF):** `src/modules/qa/inbox/NotificationDetailPage/NotificationDetailPage.tsx` (reader: toolbar → header → `.readerBody` text → `.readerFacts` with `<PayloadDetail payload />`; `primaryAction()` switch; `showThread = viewer !== 'operation-manager' && (sourceRole !== 'SYSTEM' || replies.length > 0)`; thread rendered below the reader in a `SectionCard`), `src/modules/qa/inbox/components/details/index.tsx` (`PayloadDetail` switch, private `Fact`, exported `DeltaText`), `src/modules/qa/inbox/components/MessageThread.tsx` (props `replies, viewerRole, onSend`; bubbles labelled `t('sources.'+fromRole)`), `src/modules/qa/inbox/components/Inbox.module.css` (`.message`, `.badgeCircle`, `.rankBlock`, `.thread`, `.bubble`, `.bubbleOwn` blue-light, `.reader*`, `.riskTile`, `.riskDrivers`), `src/modules/qa/qaNamespaces.ts` (the four `*.inbox.detail` entries load `qa.inbox, qa.teamAnalytics, qa.team, qa.calls, qa.coaching, qa.lms`; **not** `qa.triggers`).

**Payloads** (`src/models/qa/notifications.ts`): METRIC_ALERT `{ area, metricId, value, threshold, direction: 'BELOW'|'ABOVE', windowLabel, sparkline: number[], ruleName? }`; TREND_WARNING `{ area, metricId, from, to, deltaPct, periodLabel, sparkline, ruleName? }`; BURNOUT_RISK `{ level: 'medium'|'high', percentage, drivers: string[] /* keys of burnout.drivers.* */ }`; RECOGNITION `{ type: 'MILESTONE'|'STREAK'|'IMPROVEMENT', area?, metricId?, value?, streakWeeks?, deltaPct? }`; BADGE_EARNED `{ badgeId, badgeName, badgeIcon, badgeColor, tier: BadgeTier, reason }`; MESSAGE `{}`. Seeds: every sparkline has 7 points; windows are "Last 7 days" / "Last 14 days" / "Last 30 days"; every alert is BELOW with a `ruleName`; the only RECOGNITION is `ntf-a04` STREAK 3 weeks (no metric); badges `ntf-a05` (BDG-007 🔥 orange SILVER, agent's own) and `ntf-q05` (BDG-004 🛡️ green GOLD, about AGT-011); burnout `ntf-a03` (agent AGT-004, medium 55), `ntf-s02` (AGT-006, high 78), `ntf-o02` (team-level, agentId = OPM-001). Render badges from the payload (the catalogue disagrees with it).

**Metrics:** `METRIC_BY_ID[id]` (`src/modules/qa/triggers/constants.ts`) has `unit: 'PERCENT'|'SCORE_5'|'COUNT'`, `min`, `max`, `higherIsBetter`; `formatMetricValue(metricId, value)` (`triggers/helpers.ts`); metric labels `tAnalytics('metrics.'+id)` (`qa.teamAnalytics`). `TIER_COLORS` (`triggers/constants.ts` L399): BRONZE orange, SILVER gray, GOLD yellow.

**Charts:** `LineChart` / `AreaChart` accept `referenceLines?: ChartReferenceLineProps[]` (extends recharts `ReferenceLineProps` minus `ref`/`label`, plus `color?: MantineColor`, `label?: string`, `labelPosition?`), so `{ y, color, label, labelPosition, strokeDasharray }` is valid; `LineChartSeries` has `strokeDasharray`; `yAxisProps={{ domain }}`, `valueFormatter`, `withDots`, `curveType='monotone'`, `unit` as used in `PlatformBurnoutCard.tsx`. Existing example with a reference line: `src/modules/qa/lms/components/ImpactSparkline.tsx`. Burnout timeline example: `AreaChart h={160} data={profile.risk.burnoutTrend} dataKey='label' series={[{ name: 'percentage', color: 'gray.6' }]} withXAxis={false} withYAxis={false} withTooltip curveType='monotone'` (`team/AgentProfilePage/tabs/BurnoutTab.tsx`).

**Burnout data:** `assessBurnout(agentId, rules = store.rules): BurnoutAssessment` (`src/modules/qa/analytics/helpers.ts` L1083) → `{ level, percentage, breached, near, enabledCount, drivers: BurnoutDriver[], matchedRuleIds }`; `BurnoutDriver = { id, ruleId, ruleName, condition: RuleCondition, currentValue: number | null, status: 'BREACHED'|'NEAR'|'OK' }` (`analytics/types.ts` L293-306); `describeCondition(tTriggers, condition)` (`triggers/helpers.ts` L45, needs `useTranslation('qa.triggers')`); status labels `tAnalytics('burnout.driverStatus.'+status)`; driver labels `tAnalytics('burnout.drivers.'+key)`; `TEAM_PROFILES[agentId]?.risk.burnoutTrend: { label, percentage }[]` (`team/mockData.ts`, 6 monthly points); `TEAM_AGENTS` (`RosterAgent { id, name, supervisorId, … }`); `useTriggerRulesStore(selectTriggerRules)`.

**Badges store:** `useTriggerRulesStore((s) => s.badges): BadgeDefinition[]` with `{ id, name, icon, color, tier, holders: { agentId, agentName, team, earnedAt }[] }`; mock ids BDG-001…BDG-010.

**People and paths:** `personNameOf(id)`, `agentNameOf(id)`, `inboxRouteRole(viewer)`, `rankingsBasePath`, `analyticsPath` (`inbox/constants.ts`); `agentProfilePath(role: 'supervisor'|'qa-manager', { id, supervisorId })` (`team/helpers.ts`) + `?tab=burnout|achievements`; agent calls `/qa/agent/calls?tab=calls&issue=<a,b>&period=7d|30d`; `teamConversationsPath(role, { issue?, period: PerformanceScorePeriod, lineOfBusiness })` (`calls/constants.ts` L117); `CallIssueKey` list in `calls/issues.ts`; `TODAY`, `addDays` (`analytics/constants.ts`); `dayjs` is a dependency; Mantine `Avatar name=… color='gray' radius='xl'` is the repo pattern; theme `primaryColor: 'green'`.

**i18n:** `qa.inbox.json` en/es have identical `details.*` keys (78); unused today: `details.metricAlert.direction.{BELOW,ABOVE}`, `details.burnout.cta`, `details.recognition.value`, `details.badge.earned`.

---

## Direction (one body per kind)

```
METRIC ALERT                         TREND WARNING
┌ 71% ─────┬ 75% ────┬ 4 pts ──┬ 7d ┐  ┌ 4.1 ─┬ 3.6 ─┬ −12% ─┬ 14 d ┐
│ Current   Threshold  below     Win │  │ Was   Now    Change  Period │
│ ── line, 7 dated points, last dot │  │ ── line, dashed line at "Was" │
│ - - - threshold 75% (dashed)      │  │                               │
│ ⚡ Triggered by rule: QA score drop│  │ ⚡ Rule: Sentiment decline     │
└ CTA: Review the calls (issue=low-qa-score)      └ CTA: Review the calls

BURNOUT RISK                                  RECOGNITION (streak)
┌ [ring 55% Medium] │ risk timeline 6 months ┐ ┌ 🔥 3-week streak                ┐
│ Why you were flagged                       │ │ Three weeks in a row in the top 3│
│ Condition                 Current  Status  │ │ [W1 ★][W2 ★][W3 ★]  Keep it up! │
│ Negative-emotion calls > 30% · 7d  38%  Met│ └ CTA: Open rankings              ┘
│ QA score < 78 · 14 days             81%  OK│
└ CTA (managers): Open David's burnout tab    BADGE
                                              ┌ (🛡️)  Compliance Guardian  [Gold] ┐
DIRECT MESSAGE                                │        Thirty consecutive calls…  │
┌ (MG) Maria García · Supervisor · 12 Sep    ┐ │ Earned 6 Sep · 4 agents hold it   │
│      Great save on the Ramirez call…       │ └ CTA: View my badges / Open Lucía's│
│                 (JS) You · 12 Sep  ───────┐│        achievements
│                       Thanks, I…           ││
│ [Reply to Maria García…        ] Ctrl+Enter│
└────────────────────────────────────────────┘
```

---

## Implementation plan

Execute in order; `npm run typecheck` after each task. All touched files are LF.

### Task 0 — Plan copy

Copy this file to `docs/superpowers/plans/2026-10-19-inbox-detail-per-kind.md`.

### Task 1 — Shared helpers: `src/modules/qa/inbox/detailHelpers.ts` (new)

```ts
/** Days covered by a window label such as "Last 14 days"; 7 when it has no number. */
export const windowDays = (label: string): number => Number(label.match(/(\d+)/)?.[1] ?? 7);

/** Spreads bare sparkline values over the window, ending today, so the chart has dates. */
export const datedSeries = (values: number[], days: number): { label: string; value: number }[] => {
	const step = Math.max(1, Math.round((days - 1) / Math.max(values.length - 1, 1)));
	return values.map((value, i) => ({
		label: dayjs(addDays(TODAY, -(values.length - 1 - i) * step)).format('D MMM'),
		value,
	}));
};

/** Y-axis domain: the metric's own scale, zoomed to the values (and the reference level) with a little air. */
export const chartDomain = (metricId: TriggerMetricId, values: number[]): [number, number] => {
	const { unit, min, max } = METRIC_BY_ID[metricId];
	const pad = unit === 'SCORE_5' ? 0.5 : unit === 'PERCENT' ? 10 : 2;
	const lo = Math.max(min, Math.floor(Math.min(...values) - pad));
	const hi = Math.min(max, Math.ceil(Math.max(...values) + pad));
	return [lo, hi];
};

/** "4 pts", "0.5", "3" — the distance between two readings in the metric's unit. */
export const gapText = (metricId, a: number, b: number): string

/** The My Calls / Conversations issue that best matches an alerting metric; undefined when none fits (e.g. the overall compliance score). */
export const METRIC_ISSUE: Partial<Record<TriggerMetricId, CallIssueKey>> = {
	QA_OVERALL_SCORE: 'low-qa-score', QA_ECN_COUNT: 'qa-ecn', QA_ENC_COUNT: 'qa-enc', QA_ECC_COUNT: 'qa-ecc', QA_ECUF_COUNT: 'qa-ecuf',
	QA_AUTO_FAIL_COUNT: 'auto-fail', COMPLIANCE_SECURITY_SCORE: 'compliance-security', COMPLIANCE_REGULATORY_SCORE: 'compliance-regulatory',
	COMPLIANCE_LEGAL_SCORE: 'compliance-legal', CUSTOMER_SENTIMENT_SCORE: 'low-customer-sentiment', AGENT_SENTIMENT_SCORE: 'low-agent-sentiment',
	NEGATIVE_EMOTION_CALL_SHARE: 'negative-customer-emotion',
};

/** Where "Review the calls" goes for this viewer: the agent's My Calls or the team's Conversations. */
export const callsPathFor = (viewer: InboxViewer, issue: CallIssueKey, days: number): string =>
	viewer === 'agent'
		? `/qa/agent/calls?tab=calls&issue=${issue}&period=${days <= 7 ? '7d' : '30d'}`
		: teamConversationsPath(inboxRouteRole(viewer) as TeamRole, { issue, period: days <= 7 ? 'week' : 'month', lineOfBusiness: null });
```

`gapText`: PERCENT → `${Math.round(Math.abs(a - b))} pts`, SCORE_5 → `Math.abs(a - b).toFixed(1)`, COUNT → `String(Math.round(Math.abs(a - b)))`.

### Task 2 — `MetricAlertDetail.tsx` and `TrendWarningDetail.tsx` (`src/modules/qa/inbox/components/details/`)

Both take `{ payload }` of their kind and use `useTranslation('qa.inbox')` + `qa.teamAnalytics` for the metric label.

**MetricAlertDetail**

- Tiles `SimpleGrid cols={{ base: 2, sm: 4 }}` with the existing `Fact` (move `Fact` and `DeltaText` to `details/Fact.tsx` and export both): Current (value in `c='danger.7'`, `fw={700}`, `size='lg'`), Threshold, Gap = `t('details.metricAlert.gapBelow'|'gapAbove', { gap: gapText(...) })` ("4 pts below" / "above"), Window = `windowLabel`.
- Chart: `LineChart h={200} data={datedSeries(sparkline, windowDays(windowLabel))} dataKey='label' series={[{ name: 'value', label: metricLabel, color: 'danger.6' }]} curveType='monotone' withDots strokeWidth={2} yAxisProps={{ domain: chartDomain(metricId, [...sparkline, threshold]) }} valueFormatter={(v) => formatMetricValue(metricId, v)} referenceLines={[{ y: threshold, color: 'gray.6', strokeDasharray: '6 4', label: t('details.metricAlert.thresholdLine', { value: formatMetricValue(metricId, threshold) }), labelPosition: 'insideTopRight' }]}`.
- Footer `Group gap='xs'`: when `ruleName`, `Badge variant='light' color='gray' tt='none' leftSection={<IconBolt size={12} />}` with `t('details.metricAlert.rule', { name })`; dimmed `Text size='xs'` `t('details.metricAlert.caption', { metric: metricLabel, window: windowLabel })` ("QA score over the last 7 days, one point per day" → keep generic: "{{metric}} · {{window}}").

**TrendWarningDetail**

- Tiles: Was, Now (`c='amber.8'` light/dark safe → use `c='var(--mantine-color-amber-8)'`? no: use `<Text c='amber.8'>` which Mantine resolves per scheme), Change (`DeltaText value={deltaPct} suffix='%'`), Period.
- Chart: same as above with `color: 'amber.6'`, `referenceLines` at `y: from` labelled `t('details.trendWarning.fromLine', { value })`, domain over `[...sparkline, from, to]`.
- Footer: rule badge (same key) + caption.

Delete the METRIC_ALERT and TREND_WARNING branches from `index.tsx`; it imports and dispatches to these two. `Sparkline` import goes.

### Task 3 — `BurnoutRiskDetail.tsx`

Props `{ payload, agentId, viewer }`.

- `const rules = useTriggerRulesStore(selectTriggerRules)`; `const isAgent = TEAM_AGENTS.some((a) => a.id === agentId)`; `assessment = useMemo(() => (isAgent ? assessBurnout(agentId, rules) : null), [agentId, isAgent, rules])`; `profile = TEAM_PROFILES[agentId]` (undefined for team-level).
- Layout `Stack gap='md'`:
  1. `Group align='stretch' gap='lg' wrap='wrap'`: the existing `.riskTile` (ring `size={76}`, tone `danger`/`amber`, level badge) and, in `.riskDrivers`, either the timeline (`profile` present): caption `Text size='xs' c='dimmed'` `tAnalytics('burnout.timelineTitle')` + `AreaChart h={120} data={profile.risk.burnoutTrend} dataKey='label' series={[{ name: 'percentage', label: tAnalytics('burnout.timelineSeries'), color: tone }]} curveType='monotone' withYAxis={false} withTooltip unit='%' yAxisProps={{ domain: [0, 100] }}` — or, with no profile, the driver chips as today.
  2. Drivers: title `Text size='sm' fw={600}` = `t(viewer === 'agent' ? 'details.burnout.whyYou' : 'details.burnout.whyAgent', { name: agentNameOf(agentId) })`. When `assessment?.drivers.length`: `BaseTable density='compact'` (`~/components/BaseTable`) rows sorted BREACHED → NEAR → OK, columns: Condition (`describeCondition(tTriggers, d.condition)` + `Text size='xs' c='dimmed'` `d.ruleName`), Current (`d.currentValue === null ? '—' : formatMetricValue(d.condition.metricId, d.currentValue)`), Status (`Badge variant='light' size='sm' color={{ BREACHED: 'danger', NEAR: 'amber', OK: 'gray' }[status]}` with `tAnalytics('burnout.driverStatus.'+status)`). Otherwise the chips (`payload.drivers` → `tAnalytics('burnout.drivers.'+key)`), which is also the team-level fallback.
- `qaNamespaces.ts`: add `'qa.triggers'` to the four `*.inbox.detail` arrays (`describeCondition` reads `metrics.*`, `conditions.*`, `windows.*` from it — same as `BurnoutView`).
- Page CTA (`primaryAction`, case BURNOUT_RISK): manager viewers → when `TEAM_AGENTS.find(a => a.id === live.agentId)` exists, `{ label: t('details.burnout.ctaProfile', { name: agent.name.split(' ')[0] }), to: `${agentProfilePath(routeRole, agent)}?tab=burnout` }`; otherwise the current `analyticsPath(routeRole)?view=burnout`. Agent viewer stays `null`.

### Task 4 — `RecognitionDetail.tsx`

Props `{ payload }`. `Stack gap='md'`:

- Headline `Group gap='md' wrap='nowrap'`: `ThemeIcon size='xl' radius='md' variant='light'` (primary colour: omit `color`) with `IconFlame` (STREAK), `IconTrendingUp` (IMPROVEMENT), `IconTrophy` (MILESTONE); `Text fw={600}` = existing `details.recognition.{STREAK|IMPROVEMENT|MILESTONE}` sentence; `Text size='sm' c='dimmed'` = `t('details.recognition.keepItUp')`.
- STREAK: a strip `Group gap='xs'` of `streakWeeks` tiles `Paper className={styles.streakTile}` (36px square, `var(--mantine-primary-color-light)` background, primary border, `IconStar size={16} fill='currentColor'` via class) each with `VisuallyHidden` "Week N"; captions under them `Text size='xs' c='dimmed'` `t('details.recognition.week', { n })`. Cap the strip at 12 tiles, then "+N".
- IMPROVEMENT: `DeltaText value={deltaPct ?? null} suffix='%'` at `size='lg'` plus the metric label when `metricId`; MILESTONE: when `metricId && value !== undefined`, `Text size='xl' fw={700}` = `formatMetricValue(metricId, value)` with the metric label; else nothing more.
- Page CTA: case RECOGNITION → `{ label: t('details.recognition.cta'), to: rankingsBasePath(routeRole) }`.

### Task 5 — `BadgeEarnedDetail.tsx`

Props `{ payload, agentId, earnedAt, viewer }`.

- `const holders = useTriggerRulesStore((s) => s.badges).find((b) => b.id === payload.badgeId)?.holders.length ?? 0`.
- `Group gap='lg' wrap='nowrap' align='flex-start'`: hero `ThemeIcon size={96} radius='xl' variant='light'` (primary; no tier colour on the ring) holding `Text fz={40} lh={1}` emoji, `aria-hidden`, plus `VisuallyHidden` badge name. Beside it `Stack gap={6}`: `Group gap='xs'`: `Title order={3}` name + `Badge variant='light' color={TIER_COLORS[tier]} size='sm'` `t('details.badge.tier.'+tier)`; `Text size='sm'` reason; `Text size='xs' c='dimmed'` = `t('details.badge.earnedOn', { date: dayjs(earnedAt).format('DD MMM YYYY') })` + (holders > 0 ? ` · ${t('details.badge.holders', { count: holders })}` : ''); for manager viewers, a `Group gap='xs'` with `Avatar name={agentName} size='sm' radius='xl' color='gray'` + `Text size='sm'` agent name.
- Page CTA: case BADGE_EARNED → agent viewer: existing (`rankingsBasePath`); manager: when the agent is in `TEAM_AGENTS`, `{ label: t('details.badge.ctaProfile', { name: first name }), to: `${agentProfilePath(routeRole, agent)}?tab=achievements` }`, else `rankingsBasePath`.
- Remove `.badgeCircle` from the CSS and the `data-badge-color` attribute.

### Task 6 — Direct messages: `MessageThread.tsx` and the page

`MessageThread` props become `{ original?: { fromId?: string; fromRole: AgentNotification['sourceRole']; message: string; createdAt: string }; replies; viewerRole; viewerId: string; replyTo: string; onSend }`.

- Bubbles = `[original (when given), ...replies]`, each `Group align='flex-start' gap='sm' wrap='nowrap'` with `Avatar name={name} color='gray' radius='xl' size='sm'` and a `Paper withBorder p='sm' radius='md' className={bubble|bubbleOwn}`; header `Group justify='space-between' gap='sm'`: `Text size='xs' fw={600}` name (`own ? t('drawer.you') : personNameOf(fromId) ?? t('sources.'+fromRole)`) with `Text span c='dimmed'` ` · role`, and the time. `own = fromId === viewerId || (fromId === undefined && fromRole === viewerRole)`; own bubbles sit right (`flex-direction: row-reverse` on the group via `.bubbleRowOwn`).
- Composer: `Textarea placeholder={t('drawer.replyTo', { name: replyTo })} onKeyDown={(e) => (e.ctrlKey || e.metaKey) && e.key === 'Enter' && send()}`; under it `Group justify='space-between'`: `Text size='xs' c='dimmed'` `t('drawer.sendHint')` and the Send button.
- CSS: `.bubbleOwn { background-color: var(--mantine-primary-color-light); }`; add `.bubbleRow { display: flex; gap: var(--mantine-spacing-sm); align-items: flex-start; }` `.bubbleRowOwn { flex-direction: row-reverse; }`; keep `.bubble` max-width 85%.
- Page: when `payload.kind === 'MESSAGE' && showThread`, render the thread **inside** the reader instead of the plain body: `.readerBody` holds `<MessageThread original={{ fromId: live.sourceId, fromRole: live.sourceRole, message: live.message, createdAt: live.createdAt }} replies viewerRole={me.role} viewerId={me.id} replyTo={sender} onSend />` and the separate `SectionCard` thread is not rendered. For every other kind the body text stays, and a thread (when `showThread`) renders below the reader as today, with `original` omitted, `viewerId` and `replyTo` passed.

### Task 7 — Page wiring (`NotificationDetailPage.tsx`) and `PayloadDetail`

- `PayloadDetail` props: `{ payload, agentId, createdAt, viewer }`; `index.tsx` dispatches METRIC_ALERT → `MetricAlertDetail`, TREND_WARNING → `TrendWarningDetail`, BURNOUT_RISK → `BurnoutRiskDetail`, RECOGNITION → `RecognitionDetail`, BADGE_EARNED → `BadgeEarnedDetail`; the remaining cases (WEEKLY_SUMMARY, COACHING_SESSION, LMS_ASSIGNMENT, FOLLOW_UP, DISPUTE_UPDATE, RANKING_UPDATE) stay as they are, using `Fact` / `DeltaText` from `details/Fact.tsx`.
- Page: pass `agentId={live.agentId} createdAt={live.createdAt} viewer={viewer}`; CTA additions from Tasks 3-5; "Review the calls" for alerts: in `primaryAction`, cases METRIC_ALERT / TREND_WARNING → `const issue = METRIC_ISSUE[payload.metricId]; return issue ? { label: t('details.metricAlert.reviewCalls'), to: callsPathFor(viewer, issue, windowDays(payload.windowLabel ?? payload.periodLabel)) } : { label: t('details.metricAlert.cta'), to: analyticsPath(routeRole) }`. Seed `live.actions` that already say "Review the calls" (`ntf-a02`, `ntf-a13`) would duplicate the CTA: skip an `actions` entry whose `url` equals `cta.to`, or whose label equals the CTA label.

### Task 8 — Copy (`src/locales/{en,es}/qa.inbox.json`, deep-merge, additions only)

| key                                         | en                                                                  | es                                                                            |
| ------------------------------------------- | ------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| `details.metricAlert.gapBelow` / `gapAbove` | {{gap}} below / {{gap}} above                                       | {{gap}} por debajo / {{gap}} por encima                                       |
| `details.metricAlert.gap`                   | Gap                                                                 | Diferencia                                                                    |
| `details.metricAlert.thresholdLine`         | Threshold {{value}}                                                 | Umbral {{value}}                                                              |
| `details.metricAlert.caption`               | {{metric}} · {{window}}                                             | {{metric}} · {{window}}                                                       |
| `details.metricAlert.reviewCalls`           | Review the calls                                                    | Revisar las llamadas                                                          |
| `details.trendWarning.fromLine`             | Was {{value}}                                                       | Antes {{value}}                                                               |
| `details.burnout.whyYou`                    | Why you were flagged                                                | Por qué se te marcó                                                           |
| `details.burnout.whyAgent`                  | Why {{name}} was flagged                                            | Por qué se marcó a {{name}}                                                   |
| `details.burnout.ctaProfile`                | Open {{name}}'s burnout tab                                         | Abrir el burnout de {{name}}                                                  |
| `details.recognition.keepItUp`              | Keep it up — this is the kind of consistency the team notices.      | Sigue así: esta constancia es la que nota el equipo.                          |
| `details.recognition.week`                  | W{{n}}                                                              | S{{n}}                                                                        |
| `details.recognition.cta`                   | Open rankings                                                       | Abrir rankings                                                                |
| `details.badge.earnedOn`                    | Earned {{date}}                                                     | Obtenida el {{date}}                                                          |
| `details.badge.holders_one` / `_other`      | {{count}} agent holds this badge / {{count}} agents hold this badge | {{count}} agente tiene esta insignia / {{count}} agentes tienen esta insignia |
| `details.badge.ctaProfile`                  | Open {{name}}'s achievements                                        | Abrir los logros de {{name}}                                                  |
| `drawer.you`                                | You                                                                 | Tú                                                                            |
| `drawer.replyTo`                            | Reply to {{name}}…                                                  | Responder a {{name}}…                                                         |
| `drawer.sendHint`                           | Ctrl + Enter to send                                                | Ctrl + Enter para enviar                                                      |

Window labels inside seeds stay English (seed content is out of scope).

### Task 9 — Checks

- `npm run typecheck` clean.
- Key script: every `t('details.…')` / `t('drawer.…')` key used by the five detail components, `MessageThread` and the page exists in en and es (plurals via `_one/_other`).
- Greps, all empty: `badgeCircle` anywhere; `Sparkline` in `details/`; `sources.\${reply.fromRole}` in `MessageThread.tsx`; `style=` in the new files (the star icon fill goes through a CSS class, `.streakTile svg { fill: currentColor; }`).
- `qaNamespaces.ts`: the four detail entries include `'qa.triggers'`.
- `npx prettier --write` on touched files only; `git status --short` lists only intended files.

---

## Behaviour summary (demo script)

| Message                                                    | What the reader shows                                                                                                                                                                                |
| ---------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ntf-a01` QA score below target (agent)                    | Tiles 71% · 75% · 4 pts below · Last 7 days; line of 7 dated points with a dashed 75% line; "Triggered by rule: QA score drop"; CTA "Review the calls" → My Calls filtered to low QA score, 7 days   |
| `ntf-s03` Team compliance under the floor (supervisor)     | Same layout; COMPLIANCE_OVERALL_SCORE has no single issue, so the CTA is "Open analytics"                                                                                                            |
| `ntf-a02` Sentiment trending down                          | Was 4.1 · Now 3.6 · −12% · Last 14 days; amber line with a dashed "Was 4.1" line; CTA → My Calls, low customer sentiment, 30 days; the seed's duplicate "Review the calls" action is not shown twice |
| `ntf-s02` David Brown at high burnout risk (supervisor)    | Ring 78% High + 6-month timeline; "Why David Brown was flagged" table with live conditions, values and Met / Close / Within range; CTA "Open David's burnout tab"                                    |
| `ntf-a03` Your burnout risk moved to medium (agent)        | Ring 55% Medium + own timeline; "Why you were flagged" table; no CTA                                                                                                                                 |
| `ntf-o02` Burnout rising across Team 2 (Operation Manager) | Ring + driver chips (no profile for a team); CTA "Open burnout analytics"                                                                                                                            |
| `ntf-a04` Three weeks in the top 3                         | Flame icon, "3-week streak", three W1-W3 star tiles, "Keep it up"; CTA "Open rankings"; the supervisor's thread stays below                                                                          |
| `ntf-a05` Badge earned (agent)                             | Big 🔥 in a green ring, "Consistency Streak" + Silver label, reason, "Earned 8 Sep · N agents hold this badge"; CTA "View my badges"                                                                 |
| `ntf-q05` Lucía earned Compliance Guardian (QA Manager)    | Same hero + Lucía's avatar line; CTA "Open Lucía's achievements"                                                                                                                                     |
| `ntf-a11` Great save on the Ramirez call                   | Chat: Maria's bubble first (avatar, name, Supervisor, time), John's reply on the right as "You", Maria's second reply; composer "Reply to Maria García…", Ctrl+Enter sends                           |
| `ntf-q06` Question on the compliance rubric (QA Manager)   | Chat with Maria's message as the first bubble; "Reply to Maria García…"                                                                                                                              |

## Verification

No dev server and no tests: typecheck, the key script and the greps in Task 9. Visual check by the user on the eleven messages above, light and dark, desktop and a narrow width (tiles wrap to two columns, the chart keeps its height, the streak strip wraps).

## Out of scope

- Translating the seeded message bodies and window labels.
- WEEKLY_SUMMARY, COACHING_SESSION, LMS_ASSIGNMENT, FOLLOW_UP, DISPUTE_UPDATE and RANKING_UPDATE bodies (unchanged).
- Reconciling badge payloads with the badge catalogue.
- A reply thread for system alerts (burnout, metric) — the agent still cannot reply to a system message.
