# Agent Team Rankings — Drawer Refinement & Hardening — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking. Execute tasks **in order**; every task compiles on its own.

**Goal:** Fix the Agent-role Team Rankings detail drawer the user flagged: too many competing colors, low-contrast pill tabs (Achievements / Reactions / Metrics), and a gamification row ("↑3 · 🔥 8 weeks · 💪 +0.13 pts · 🤝 24 · 1 badge") that nobody can read without context. Make the drawer near-monochrome with one accent, keep the parts the user likes (the **Next badge** card and the "this period" framing), turn every indicator into a labelled sentence, and while inside the module fix the latent bugs (conditional hook, stale reaction state, mock mutation in an effect, invalid gradient color, missing i18n, non-standard formatting).

**Architecture:** No new routes. Changes are contained in `src/modules/qa/agent/rankings/**` plus a new `qa.rankings` i18n namespace (shared later by the manager Rankings plan) and the namespace mapping. The dashboard `RankingsTable` "View all" fix and the dashboard segmented control are delivered by the *Dashboard Evaluation Views* plan.

**Tech Stack:** React 19, Mantine v9.2, react-i18next, existing mock helpers in `src/modules/qa/dashboard/mockData.ts`.

**Spec (user):** "En Team Ranking, cuando se abre una posición del leaderboard en el drawer: evaluar los colores, hay mucha variedad; los tabs Achievement / Reaction / Metrics no tienen buen contraste; hacerla más monocromática y resaltar solo ciertas cosas (Next badge está bien; 'this period' está bien). El componente con rank, score, streak y los chips '8 weeks, 0.133 in one badge' — no entiendo esa información, le falta contexto al usuario."

**Dependencies:** none. (The Dashboards plan fixes the agent dashboard "View all" link separately.)

---

## Global Constraints

- **Design-session rules (DESIGN_ROLE.md):** mock only; no `npm run dev`, tests or `git commit` unless the user explicitly asks in the execution session. `npm run typecheck` after each task.
- Mantine v9, CSS Modules, tokens/`light-dark()`, dark & light mode.
- Reuse `AppDrawer`, `SectionCard`, `EmptyState`; Tabler icons instead of emoji for indicators (emoji stay only for badge icons and reaction buttons).
- New/edited strings via `useTranslation('qa.rankings')`; create `src/locales/en/qa.rankings.json` and `src/locales/es/qa.rankings.json`.
- Files touched in this module are reformatted to the repo standard: **tabs**, `~/` imports (several Phase-2 files use 2-space indentation and relative imports).
- Do not change the leaderboard data model (`AgentRankingEntry`) or `mockData.ts` exports; only add small helpers where noted.

---

## Design target (drawer)

```
┌ AppDrawer (md) ─────────────────────────────────────────────────┐
│ #4 · John Smith                                                 │
│ Performance detail · This period (Sep 1 – Sep 30, 2026)         │
├─────────────────────────────────────────────────────────────────┤
│ ┌ Summary (Paper, neutral surface) ─────────────────────────┐   │
│ │  RANK        SCORE        STREAK                          │   │
│ │  #4          82 pts       8 weeks                         │   │
│ │  ───────────────────────────────────────────────────────  │   │
│ │  ↑  Up 3 places vs last week (was #7)                     │   │  ← green text only here
│ │  🔥→IconFlame  8 consecutive weeks in the top 10          │   │
│ │  IconStairsUp  1 pt ahead of Emma Davis (#5)              │   │
│ │  IconHeartHandshake  24 peer reactions this period        │   │
│ └───────────────────────────────────────────────────────────┘   │
│ Your reaction  [👍] [👏] [❤️] [🔥]   (unchanged buttons)          │
│ ─────────────────────────────────────────────────────────────── │
│ Achievements (1) | Reactions (24) | Metrics       ← underline tabs│
│ …                                                               │
└─────────────────────────────────────────────────────────────────┘
```
Palette rule: neutral surfaces (`gray-0 / dark-6`), one accent (**blue**) for selected tab, links and the Next-badge progress; **green/red only for deltas** (rank movement, metric deltas); badges are `variant='default'` or `light` gray. Top-3 rank badges in the table keep gold/silver/bronze (they are semantic).

---

## File Structure

### New files
```
src/locales/en/qa.rankings.json, src/locales/es/qa.rankings.json
src/modules/qa/agent/rankings/components/SummaryInsights.tsx (+ .module.css)   — the four labelled insight rows
src/modules/qa/agent/rankings/hooks/useReactionsStore.ts                       — tiny zustand store replacing the mutable mock map
```

### Modified files
- `src/modules/qa/agent/rankings/components/RankingDetailDrawer.tsx` (+ `.module.css`)
- `src/modules/qa/agent/rankings/components/tabs/AchievementsTab.tsx`, `ReactionsTab.tsx`, `MetricsTab.tsx` (+ their `.module.css`)
- `src/modules/qa/agent/rankings/components/LeaderboardHeader.tsx`, `WinnerBadge.tsx`, `ReactionButtons.tsx`, `ExpandedRankingsTable.tsx`, `RankingCard.tsx`, `RankingCardGrid.tsx`
- `src/modules/qa/agent/rankings/hooks/useLeaderboardMetadata.ts`, `useUserReaction.ts`
- `src/modules/qa/agent/rankings/gamification.ts`
- `src/modules/qa/agent/rankings/TeamRankingsPage.tsx`
- `src/modules/qa/qaNamespaces.ts` — `'qa.agent.rankings': 'qa.rankings'`

### Reference files (read-only)
- `src/modules/qa/dashboard/mockData.ts:149-167` (`currentLeaderboard`, `userReactions`), `:2750-2764` (`AgentRankingEntry`), `:2907-2922` (`selectWinnerIfPeriodEnded`), drawer helpers `getRankingAchievements`, `getRankingReactionBreakdown`, `getRankingMetricsComparison`
- `src/modules/qa/agent/rankings/gamification.ts` — `getPointLeadFromRoster`, `getRankMovementTooltip`, `getReactionsTotal`

---

## Task 1: i18n namespace + hardening fixes

**Files:** `qa.rankings.json` (en/es), `qaNamespaces.ts`, `useLeaderboardMetadata.ts`, `useUserReaction.ts`, `hooks/useReactionsStore.ts`, `WinnerBadge.tsx`, `TeamRankingsPage.tsx`, `gamification.ts`

- [ ] **Step 1: `src/locales/en/qa.rankings.json`** (paste; es mirrors keys; the manager Rankings plan will add a `manager.*` block later)

```json
{
	"page": {
		"leaderboardTitle": "Leaderboard",
		"leaderboardDescription": "All team members ranked by score — select a row for details",
		"emptyTitle": "No rankings yet",
		"emptyDescription": "Your supervisor has not started a ranking for this period."
	},
	"header": {
		"startDate": "Start date", "endDate": "End date", "daysRemaining": "Days remaining", "completed": "Completed",
		"winner": "Winner", "periodWinner": "Period winner"
	},
	"table": {
		"rank": "Rank", "name": "Name", "score": "Score", "badges": "Badges", "reactions": "Reactions", "streak": "Streak", "movement": "Movement",
		"moreBadges": "+{{count}}", "noData": "—", "empty": "No agents in this ranking yet"
	},
	"drawer": {
		"title": "#{{rank}} · {{name}}",
		"subtitle": "Performance detail · {{period}}",
		"period": "This period ({{from}} – {{to}})",
		"stats": { "rank": "Rank", "score": "Score", "scoreValue": "{{score}} pts", "streak": "Streak", "streakValue_one": "{{count}} week", "streakValue_other": "{{count}} weeks" },
		"insights": {
			"movementUp": "Up {{count}} places vs last week (was #{{previous}})",
			"movementDown": "Down {{count}} places vs last week (was #{{previous}})",
			"movementFlat": "Same position as last week (#{{rank}})",
			"streak_one": "{{count}} consecutive week in the top {{top}}",
			"streak_other": "{{count}} consecutive weeks in the top {{top}}",
			"noStreak": "Not in the top {{top}} yet — a streak starts at week 1",
			"lead_one": "{{count}} pt ahead of {{name}} (#{{rank}})",
			"lead_other": "{{count}} pts ahead of {{name}} (#{{rank}})",
			"leadTied": "Tied with {{name}} (#{{rank}})",
			"leadLast": "Last position — no one below to compare against",
			"reactions_one": "{{count}} peer reaction this period",
			"reactions_other": "{{count}} peer reactions this period",
			"noReactions": "No peer reactions yet this period"
		},
		"reactionHint": "Your reaction helps celebrate team achievements",
		"tabs": { "achievements": "Achievements", "reactions": "Reactions", "metrics": "Metrics" }
	},
	"reactions": {
		"buttons": { "THUMBS_UP": "Well done", "CLAPPING_HANDS": "Applause", "HEART": "Love it", "FIRE": "On fire" },
		"received_one": "{{count}} reaction received", "received_other": "{{count}} reactions received",
		"emptyTitle": "No reactions yet", "emptyDescription": "Share your appreciation — be the first to react.",
		"viewMore": "View more ({{count}})", "moreTeammates_one": "+{{count}} more teammate", "moreTeammates_other": "+{{count}} more teammates"
	},
	"achievements": {
		"earned_one": "Earned this period ({{count}})", "earned_other": "Earned this period ({{count}})",
		"emptyTitle": "No badges earned yet", "emptyDescription": "Keep performing — the first badge is within reach.",
		"criteriaMet": "Criteria met", "nextBadge": "Next badge", "stillMissing": "Still missing", "earnedOn": "Earned {{date}}",
		"progressAria": "Progress towards {{name}}"
	},
	"metrics": {
		"qa": "QA score", "sentiment": "Sentiment score", "compliance": "Compliance score", "callsEvaluated": "Calls evaluated",
		"vs": "vs. {{value}}", "currentPeriod": "This period", "previousPeriod": "Previous period"
	},
	"winner": { "badge": "Winner", "tooltip": "Period winner" }
}
```

- [ ] **Step 2:** `qaNamespaces.ts` → add `'qa.agent.rankings': 'qa.rankings'`.

- [ ] **Step 3: `hooks/useReactionsStore.ts`** — zustand store `{ reactions: UserReactionMap; setReaction(agentId, reaction | null) }` seeded from `userReactions` (copy, do not mutate the mock). Rewrite `useUserReaction(agentId)` to read/write this store: `const currentReaction = useReactionsStore((s) => s.reactions[agentId] ?? null); const setReaction = (r) => useReactionsStore.getState().setReaction(agentId, r);` — no local `useState`, so switching agents shows the right reaction.

- [ ] **Step 4: `hooks/useLeaderboardMetadata.ts`** — pure and reactive: `const isCompleted = new Date() >= new Date(metadata.endDate) || metadata.status === 'completed'; const winnerId = metadata.winnerId ?? (isCompleted ? AGENT_RANKINGS[0]?.agentId ?? null : null);` return `{ metadata, isCompleted, daysRemaining, winnerId, isWinnerSelected: winnerId !== null }`; memo deps `[metadata]`. Remove the `selectWinnerIfPeriodEnded` `useEffect` from `TeamRankingsPage.tsx` (leave the exported function in `mockData.ts` untouched). `ExpandedRankingsTable` / `RankingCard` use `winnerId === entry.agentId` for `WinnerBadge`.

- [ ] **Step 5: `WinnerBadge.tsx`** — `gradient={{ from: 'yellow', to: 'orange' }}` (`gold` is not a Mantine color); i18n `winner.*`; tabs + `~/` imports.

- [ ] **Step 6: `gamification.ts`** — add `formatPoints(points: number): string` (`Number.isInteger ? `${points}` : points.toFixed(1)`) and `TOP_N_FOR_STREAK = 10`; export `getPreviousRank` (exists). Remove hardcoded tooltip copy functions (`getPointLeadTooltip`, `getRankMovementTooltip`) **or** keep them but stop using them in the drawer (the drawer now builds sentences from i18n) — keep and mark `@deprecated` to avoid touching the table.

- [ ] **Step 7: Typecheck**; **Step 8: Commit** *(if authorized)* — `fix(qa-rankings): reactions store, reactive winner, i18n namespace and formatting`

---

## Task 2: Summary insights + drawer restyle

**Files:** `components/SummaryInsights.tsx` (+ `.module.css`), `RankingDetailDrawer.tsx` (+ `.module.css`), `LeaderboardHeader.tsx`, `ReactionButtons.tsx`

**`SummaryInsights`** props `{ entry: AgentRankingEntry }` — `Stack gap='xs'` of four `InsightRow`s (`Group gap='sm' wrap='nowrap' align='flex-start'`): `ThemeIcon variant='light' color={color} size='md' radius='md'` icon + `Text size='sm'` sentence (`fw={500}` for the number part is fine as one string).
| Row | Icon | Color | Sentence (i18n) |
|---|---|---|---|
| Movement | `IconTrendingUp` / `IconTrendingDown` / `IconMinus` | green / red / gray | `drawer.insights.movementUp/Down/Flat` with `count = |rankTrend|`, `previous = getPreviousRank(entry)` |
| Streak | `IconFlame` | gray (orange only when streak ≥ 4) | `drawer.insights.streak` (`count`, `top = TOP_N_FOR_STREAK`) or `noStreak` |
| Lead | `IconStairsUp` | gray | `lead` (`count = formatPoints(points)`, `name`, `rank = entry.rank + 1`) / `leadTied` / `leadLast` from `getPointLeadFromRoster` |
| Reactions | `IconHeartHandshake` | gray | `reactions` (`count = getReactionsTotal(entry)`) or `noReactions` |
No emoji, no colored badges. The badge count moves to the Achievements tab label.

**`RankingDetailDrawer.tsx`** rewrite (keep the props):
- Hooks first: `const { t } = useTranslation('qa.rankings'); const { metadata } = useLeaderboardMetadata(); const { currentReaction, setReaction } = useUserReaction(entry?.agentId ?? '');` **then** `if (!entry) return null;` (fixes the conditional hook).
- `AppDrawer size='md' title={t('drawer.title', { rank, name })} description={t('drawer.subtitle', { period: t('drawer.period', { from, to }) })}` with dates from `metadata.startDate/endDate` via `useDateFormatter('date')`.
- Summary `Paper withBorder radius='md' p='md' className={styles.statsCard}`: `Group grow` of three `QuickStat` (labels i18n; score `drawer.stats.scoreValue`; streak `streakValue` plural — no emoji) → `Divider my='sm'` → `SummaryInsights entry`.
- Reactions block: `Group justify='space-between' align='center'`: `Text size='sm' fw={600}` "Your reaction" (`reactions.yourReaction` — add key) + `ReactionButtons` (update `ReactionButtons.tsx` tooltips to `reactions.buttons.*`); `Text size='xs' c='dimmed'` `drawer.reactionHint`.
- `Tabs defaultValue='achievements' variant='default' keepMounted={false}` (underline style; remove `pills`). Tab labels with counts: `t('drawer.tabs.achievements')` + `Badge size='xs' variant='default'` when `achievements.length`, reactions count badge likewise.
- `RankingDetailDrawer.module.css`: keep `.statsCard`, add `.tabsList { border-bottom: 1px solid light-dark(var(--mantine-color-gray-3), var(--mantine-color-dark-4)) }` if needed for contrast.

**`LeaderboardHeader.tsx`** — i18n labels (`header.*`), tabs/`~/` formatting, `Badge size='lg' variant='default'` for scoreType (was `light` accent), dates via `useDateFormatter('date')`; when `isCompleted` show `Badge color='yellow' variant='light' leftSection={<IconTrophy size={12}/>}` `header.completed` and the winner name (`header.winner: {{name}}`) — add `header.winnerName` key `"Winner: {{name}}"`; props gain `winnerName?: string | null`.

- [ ] **Step 1:** `SummaryInsights` · **Step 2:** drawer rewrite · **Step 3:** `LeaderboardHeader` + `ReactionButtons` i18n · **Step 4: Typecheck** · **Step 5: Commit** *(if authorized)* `refactor(qa-rankings): monochrome detail drawer with labelled insights`

---

## Task 3: Tabs restyle (Achievements / Reactions / Metrics) and table/card polish

**Files:** `tabs/AchievementsTab.tsx`, `tabs/ReactionsTab.tsx`, `tabs/MetricsTab.tsx` (+ css), `ExpandedRankingsTable.tsx`, `RankingCard.tsx`, `RankingCardGrid.tsx`

- **AchievementsTab** — i18n all strings; earned-date `Badge variant='light' color='gray'` → `Text size='xs' c='dimmed'` (`achievements.earnedOn`); keep the **Next badge** card as is (blue `Progress`, `IconTargetArrow`) — it is the one accent the user approved; `List` icon `IconCircleCheck` color → `var(--mantine-color-dimmed)` via css (not green). Date formatting via `useDateFormatter('date')` (remove the hardcoded `en-US` `Intl.DateTimeFormat`).
- **ReactionsTab** — i18n; count `Badge` → `variant='default'` (no blue); giver avatars keep `avatarColor`; header text `reactions.received` plural.
- **MetricsTab** — i18n; keep tone colors on the **current** value (semantic thresholds) but render previous value `c='dimmed'`; delta arrows keep green/red; remove the "Trend sparklines arrive in a later phase." line; period labels via `metrics.currentPeriod/previousPeriod` (ignore mock `period` strings) .
- **ExpandedRankingsTable / RankingCard** — i18n headers/labels; achievements chips `variant='default'`; reactions cell `variant='default'`; `RANK_BADGE_COLORS` for ranks 1–3 unchanged, others `variant='default' color='gray'`; `WinnerBadge isWinner={winnerId === entry.agentId}`; tabs formatting.
- **RankingCardGrid** — empty text → `table.empty`.

- [ ] Steps: three tabs → table/card/grid → typecheck → commit *(if authorized)* `refactor(qa-rankings): i18n and neutral palette for drawer tabs and leaderboard`

---

## Task 4: Final audit

- [ ] No hardcoded user-facing strings remain in `src/modules/qa/agent/rankings/**` (grep for `'[A-Z][a-z]+ [a-z]`-style literals and `label='`).
- [ ] Only these colors remain in the drawer: gray/default surfaces, blue (selected tab, next-badge progress), green/red deltas, gold/silver/bronze rank badges, yellow winner badge.
- [ ] `useUserReaction` is called before any early return; no module-level mock mutation in effects.
- [ ] `npm run typecheck` clean; en/es keys aligned.
- [ ] *(Only if the user asks to run the app)* Manual: open `/qa/agent/rankings`, click #4 → drawer shows "Up 3 places vs last week (was #7)"-style sentences, readable tabs in dark mode; react 👍, close, open #5, reaction not carried over; reopen #4 → 👍 persists.

---

## Spec Coverage Check

- ✅ Less color variety, monochrome with selective highlights (Next badge kept) — Tasks 2, 3
- ✅ Tab contrast (Achievements / Reactions / Metrics) — Task 2 (`variant='default'`)
- ✅ Rank / score / streak block and the "8 weeks · 0.133 · 1 badge" chips replaced by labelled, contextual sentences — Task 2 (`SummaryInsights`)
- ✅ "This period" framing kept and made explicit with dates — Task 2
- ✅ Hardening: conditional hook, reaction state, winner derivation, invalid gradient, i18n, formatting — Task 1
- ✅ Agent dashboard segmented control — delivered by the Dashboard Evaluation Views plan

## Execution Choice

1. **Subagent-Driven (recommended for Haiku):** one subagent per task in order 1→4.
2. **Inline execution:** sequential in one session.
