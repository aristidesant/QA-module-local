# Session detail page: less text-dense, scannable brief — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or
> superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.
>
> **Project override on testing:** per `CLAUDE.md` and `DESIGN_ROLE.md` (stakeholder-mockup session), **no test-writing
> steps**. Each task's verification is `npm run typecheck` (must stay clean). Do not run the dev server.
>
> **When executing:** first copy this file to `docs/superpowers/plans/2026-10-08-session-detail-scannable.md`, then
> follow tasks in order on the current branch `feature/coaching-agent-post-coaching`. One commit per task; finish every
> edit of a task before staging (husky runs `tsc` over the whole project). Commit trailer:
> `Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>`.
> **Tooling note:** large heredocs fail to parse in the Bash tool here. Write multi-line edit scripts with the Write
> tool (scratchpad `.py` using the `edit()` helper in `scratchpad/edit.py`) and new/rewritten TSX files with Write.

## Context

Design critique (2026-10-08) of the session detail page (`/qa/{role}/coaching/sessions/:sessionId`): it reads as a
document. Seven brief blocks share the same size and weight, guidance paragraphs run ~140 characters per line, and the
same three evidence calls appear three times (inside each weak aspect and again in the Evidence card). Key facts (53 ·
Critical · +3) are buried in one small line, and the right column ends early while the left keeps growing.

Decisions with the user (all four recommended improvements): (1) a data strip + weak aspects as a list, (2) evidence
shown once (one row per call, aspects as text), (3) guidance with hierarchy and a reading measure, (4) rebalance the columns and hide
noise (Agent commitment on proposals).

## Architecture (reuse-first)

- `SessionBrief.tsx` keeps the brief card but is restructured: a **stat strip** (borderless, divided — no nested cards,
  which the craft floor bans), **weak aspects as rows with a proportion bar**, and a **guide** section with Caption
  headings, a 68ch measure and the real example as a Mantine `Blockquote` (already used in
  `disputes/cases/DisputeCaseDetailPage.tsx:264`).
- `Suggested material` and `Since the previous session` leave the brief and become two compact cards in the right column
  (`SessionBriefAside.tsx`), reusing the existing `assignSuggested` logic and `LMS_*_META` labels.
- The Evidence card lists each call once, with the weak aspects that flagged it (from `session.brief.findings`) as
  text beside it, and stays a plain list for sessions without a brief.
- `weeklyBatch.ts` joins the primary and secondary approach with a blank line so the two paragraphs render separately.
- Color rules stay as agreed: red only for Critical, a declining trend, critical errors and a missed session.

## Global Constraints

- Mantine tokens only, dark and light: no hardcoded hex; reuse `Progress` (already used in the repo) and `Divider`.
- No new inline `style={{}}` (pre-commit hook): spacing and measure through Mantine props (`maw='68ch'`, `lh`).
- Every string through i18n, **both** `src/locales/en` and `src/locales/es` (`qa.coaching`).
- Chips that act as links (calls) get `size='sm'` so the click target is ≥24px tall.
- `npm run typecheck` clean after every task; `noUnusedLocals` is on.

---

## File Structure

**New**

- `src/modules/qa/coaching/components/SessionBriefAside.tsx` — `SuggestedMaterialCard`, `PreviousSessionCard`.

**Modified**

- `src/modules/qa/coaching/components/SessionBrief.tsx` — strip, aspect rows, guide; suggested/previous removed.
- `src/modules/qa/coaching/CoachingSessionDetailPage/CoachingSessionDetailPage.tsx` — grouped Evidence, aside cards,
  commitment only when completed.
- `src/modules/qa/coaching/weeklyBatch.ts` — `approach` joined with `\n\n`.
- `src/locales/{en,es}/qa.coaching.json` — new `sessions.brief.*` keys.

**Untouched:** `QuietIndicators.tsx` (`TierScore`, `ScoreTrendText` are reused), `Queue.module.css` (`.preWrap` reused),
`SectionCard`, `AppDrawer` n/a.

---

## Task 1 — Brief card: stat strip, aspect rows, guide

**Verified facts:** `SessionBrief.tsx` currently renders, in one `SectionCard` (`icon={IconSparkles}`, title
`sessions.brief.title`, description `sessions.brief.week` with `{from,to,count}`): a `Group` with `TierScore`,
`ScoreTrendText` and the reason text; `BriefBlock` (Text sm fw 600 heading + optional action) for findings, approach,
solution, example, suggested material and previous session, separated by `Divider`. Findings render a `Badge` per issue
(red `light` when `CRITICAL_ISSUES.has(issue)`, else gray `outline`), a calls/share `Text` and a row of call chips.
`brief` fields: `weekFrom, weekTo, calls, score, previousScore, tier, trend, reason, findings[{issue, aspect, calls,
share, evidenceCallIds}], approach, solution, example, suggestedContentIds, previous`. `QuietIndicators.tsx` exports
`CRITICAL_ISSUES`, `TierScore({score, tier})`, `ScoreTrendText({verdict, current, previous})`. i18n existing:
`sessions.brief.{title, week, findings, noFindings, findingCalls_one/_other, approach, solution, example, suggested,
noSuggested, alreadyAssigned, assignSuggested_*, assigned_*, previous, noPrevious, composite}`, `sessions.batch.reason.*`,
`qa.calls issues.<key>`.

- [ ] **1.1** Rewrite `SessionBrief.tsx` (Write tool). Props shrink to `{ brief, role?: never }` → keep only what is
      still used: `brief: CoachingBrief`. Remove `agentId`, `role`, `assignments`, `contentById`, `onOpenCall` (the page
      stops passing them in Task 3) and every import that becomes unused (`Button`, `List`, `IconPhone`, `useLmsStore`,
      `managerPersona`, `today`, `day`, `notifySuccess`, `LMS_*`, `SCORECARD_DIMENSION_META`, `pointerStyles`,
      `LmsAssignment`, `LmsContent`, `TeamRole`).

  ```tsx
  import type { ReactNode } from 'react';
  import {
  	Badge,
  	Blockquote,
  	Divider,
  	Group,
  	Progress,
  	Stack,
  	Text,
  } from '@mantine/core';
  import { IconSparkles } from '@tabler/icons-react';
  import dayjs from 'dayjs';
  import { useTranslation } from 'react-i18next';
  import { SectionCard } from '~/components/SectionCard';
  import type { CoachingBrief } from '~/models/qa';
  import type { CallIssueKey } from '~/modules/qa/calls/issues';
  import {
  	CRITICAL_ISSUES,
  	ScoreTrendText,
  	TierScore,
  } from './QuietIndicators';
  import queueStyles from './Queue.module.css';

  /** Caption-style label: the small uppercase heading used for blocks and stat labels. */
  export function Caption({ children }: { children: ReactNode }) {
  	return (
  		<Text size='xs' fw={600} tt='uppercase' c='dimmed' lh={1.3}>
  			{children}
  		</Text>
  	);
  }

  /** One figure of the strip: caption, the number and a one-line note. */
  function StripStat({
  	label,
  	children,
  	note,
  }: {
  	label: string;
  	children: ReactNode;
  	note?: ReactNode;
  }) {
  	return (
  		<Stack gap={4} flex={1} miw={0}>
  			<Caption>{label}</Caption>
  			{children}
  			{note && (
  				<Text size='xs' c='dimmed' lineClamp={1}>
  					{note}
  				</Text>
  			)}
  		</Stack>
  	);
  }

  interface SessionBriefProps {
  	brief: CoachingBrief;
  }

  /**
   * The weekly brief as scannable data first (strip, aspect rows) and the
   * coaching guide second. Color only for Critical, a falling score and
   * critical errors.
   */
  export function SessionBrief({ brief }: SessionBriefProps) {
  	const { t } = useTranslation(['qa.coaching', 'qa.calls']);

  	return (
  		<SectionCard
  			icon={IconSparkles}
  			title={t('sessions.brief.title')}
  			padding='md'
  		>
  			<Stack gap='lg'>
  				<Group align='flex-start' gap='md' wrap='nowrap'>
  					<StripStat
  						label={t('sessions.brief.stats.scorecard')}
  						note={t(`sessions.batch.reason.${brief.reason}`)}
  					>
  						<TierScore score={brief.score} tier={brief.tier} />
  					</StripStat>
  					<Divider orientation='vertical' />
  					<StripStat
  						label={t('sessions.brief.stats.change')}
  						note={t('sessions.brief.stats.vsPrevious')}
  					>
  						<ScoreTrendText
  							verdict={brief.trend}
  							current={brief.score}
  							previous={brief.previousScore}
  						/>
  					</StripStat>
  					<Divider orientation='vertical' />
  					<StripStat label={t('sessions.brief.stats.calls')}>
  						<Text size='xl' fw={700}>
  							{brief.calls}
  						</Text>
  					</StripStat>
  					<Divider orientation='vertical' />
  					<StripStat label={t('sessions.brief.stats.week')}>
  						<Text size='sm' fw={600}>
  							{dayjs(brief.weekFrom).format('D MMM')} –{' '}
  							{dayjs(brief.weekTo).format('D MMM')}
  						</Text>
  					</StripStat>
  				</Group>

  				<Divider />

  				<Stack gap='sm'>
  					<Caption>{t('sessions.brief.findings')}</Caption>
  					{brief.findings.length === 0 ? (
  						<Text size='sm' c='dimmed'>
  							{t('sessions.brief.noFindings')}
  						</Text>
  					) : (
  						brief.findings.map((f) => {
  							const critical = CRITICAL_ISSUES.has(f.issue);
  							return (
  								<Group
  									key={f.issue}
  									gap='md'
  									wrap='nowrap'
  									justify='space-between'
  								>
  									<Group gap='xs' wrap='nowrap' flex={1} miw={0}>
  										<Badge
  											size='sm'
  											variant={critical ? 'light' : 'outline'}
  											color={critical ? 'red' : 'gray'}
  										>
  											{t(`issues.${f.issue as CallIssueKey}`, {
  												ns: 'qa.calls',
  											})}
  										</Badge>
  									</Group>
  									<Text size='xs' c='dimmed' w={150} ta='right'>
  										{t('sessions.brief.findingOf', {
  											count: f.calls,
  											total: brief.calls,
  										})}
  									</Text>
  									<Progress
  										w={120}
  										size='sm'
  										value={f.share}
  										color={critical ? 'red' : 'gray'}
  										aria-label={`${f.share}%`}
  									/>
  								</Group>
  							);
  						})
  					)}
  				</Stack>

  				<Divider />

  				<Stack gap='md'>
  					<Caption>{t('sessions.brief.guide')}</Caption>
  					<Stack gap={4}>
  						<Text size='sm' fw={600}>
  							{t('sessions.brief.approach')}
  						</Text>
  						<Text
  							size='sm'
  							lh={1.6}
  							maw='68ch'
  							className={queueStyles.preWrap}
  						>
  							{brief.approach}
  						</Text>
  					</Stack>
  					<Stack gap={4}>
  						<Text size='sm' fw={600}>
  							{t('sessions.brief.solution')}
  						</Text>
  						<Text size='sm' lh={1.6} maw='68ch'>
  							{brief.solution}
  						</Text>
  					</Stack>
  					<Stack gap={4}>
  						<Text size='sm' fw={600}>
  							{t('sessions.brief.example')}
  						</Text>
  						<Blockquote color='gray' p='md' maw='68ch'>
  							<Text size='sm' lh={1.6} className={queueStyles.preWrap}>
  								{brief.example}
  							</Text>
  						</Blockquote>
  					</Stack>
  				</Stack>
  			</Stack>
  		</SectionCard>
  	);
  }
  ```

  (`Blockquote` with `color='gray'` keeps it quiet; if the quote icon is unwanted pass `icon={null}`.)

- [ ] **1.2** i18n `qa.coaching.json` (both) under `sessions.brief`:
  - add `stats`: en `{ "scorecard": "Scorecard", "change": "Change", "vsPrevious": "vs previous week", "calls": "Calls evaluated", "week": "Week" }`
    / es `{ "scorecard": "Scorecard", "change": "Cambio", "vsPrevious": "vs semana anterior", "calls": "Llamadas evaluadas", "week": "Semana" }`;
  - add `findingOf`: en `"{{count}} of {{total}} calls"` / es `"{{count}} de {{total}} llamadas"`;
  - add `guide`: en `"Coaching guide"` / es `"Guía de coaching"`.
  - Remove the now-unused `week` (description) key from both locales **only if** `grep -rn "sessions.brief.week" src`
    returns nothing; leave `findingCalls_*`, `suggested`, `previous` etc. (reused in Task 2).
- [ ] **1.3** `weeklyBatch.ts` ~L209-211: replace
      `? \`${playbook.approach} ${secondary.approach}\`` with `? \`${playbook.approach}\n\n${secondary.approach}\``.
- [ ] **1.4** The page still passes the removed props, so typecheck fails until Task 3. **Do not commit yet**; continue
      to Task 2 and 3, then commit tasks 1-3 together as
      `feat(qa-coaching): scannable session brief with stat strip, aspect rows and a readable guide`.

---

## Task 2 — Aside cards: suggested material and previous session

**Files:** `components/SessionBriefAside.tsx` (new), both `qa.coaching.json` (no new keys; reuse
`sessions.brief.{suggested, noSuggested, alreadyAssigned, assignSuggested_*, assigned_*, previous, noPrevious, composite}`).

**Verified facts:** the logic to move is the old `suggested` / `alreadyOpen` / `assignable` computation and
`assignSuggested` (`managerPersona(role)`, `useLmsStore.getState().assign({ agentIds, contentIds, dueDate: day(today(), 14),
mandatory: false, requireAcceptance: false, reason: 'Suggested in the weekly coaching brief', source: 'MANUAL',
assignedBy, assignedByRole })`, `notifySuccess(t('sessions.brief.assigned', { count }))`). Imports there:
`managerPersona, today` from `~/modules/qa/lms/helpers`, `day` from `~/modules/qa/lms/mockData`, `notifySuccess` from
`~/modules/qa/utils/notifications`, `useLmsStore` from `~/stores/qa/lmsStore`, `LMS_AREA_META, LMS_FORMAT_META` from
`~/modules/qa/lms/constants`, `SCORECARD_DIMENSION_META` from `../scorecard`.

- [ ] **2.1** Create `SessionBriefAside.tsx` (Write tool) exporting:
  - `SuggestedMaterialCard({ brief, agentId, role, assignments, contentById })`: a `SectionCard`
    (`title={t('sessions.brief.suggested')}`, `padding='md'`, `headerActions` = the "Assign N material" `Button size='xs'
variant='default'` when `assignable.length > 0`) whose body is a `Stack gap='sm'`: per material a `Stack gap={0}` with
    the title (`Text size='sm'`) and a dimmed `Text size='xs'` line
    `{format label} · {area label}` plus ` · {alreadyAssigned}` when already open. Empty → `noSuggested` dimmed.
    Returns `null` when `brief.suggestedContentIds` is empty **and** nothing else to say? No: keep the empty message.
  - `PreviousSessionCard({ brief })`: a `SectionCard` (`title={t('sessions.brief.previous')}`, `padding='md'`). With
    `brief.previous`: `Text size='sm'` topic · date (`dayjs(...).format('D MMM YYYY')`) and a second line
    `{dimension label or composite}: before → after` with the verdict word on its own `Text size='xs'`; the verdict line is
    red + `fw=600` only when `DECLINED`, dimmed otherwise. Without it → `noPrevious` dimmed.
    Use the same `useTranslation(['qa.coaching', 'qa.lms'])` namespaces as the old brief.
- [ ] **2.2** No commit yet (see 1.4).

---

## Task 3 — Page: grouped Evidence, aside cards, quieter right column

**Files:** `CoachingSessionDetailPage.tsx`.

**Verified facts:** the left column renders `SessionBrief` (props `brief, agentId, role, assignments, contentById,
onOpenCall`), the AI message card, then (if `!isAi`) the Evidence card (flat `Group` of outline gray `Badge`s with
`IconPhone`, `className={pointerStyles.pointer}`, `onClick={() => openCall(callId)}`), Talking points and Action items.
The right column renders, in order: proposed card (PROPOSED), outcome form (SCHEDULED), read-only outcome, **Agent
commitment** (`!isAi`), Linked material, impact chart (COMPLETED). `session.brief?.findings[].evidenceCallIds` holds the
calls per aspect; `session.evidenceCallIds` is the union.

- [ ] **3.1** Left column: `<SessionBrief brief={session.brief} />` (only `brief`).
- [ ] **3.2** Evidence card body: **one row per call**, each call once, with the weak aspects that flagged it. Several
      aspects often share the same calls (e.g. both aspects of AGT-006 cite TXCALL-00493/00502/00494), so grouping by
      aspect would repeat them. Build the map from the brief:
  ```tsx
  const aspectsByCall = new Map<string, string[]>();
  for (const f of session.brief?.findings ?? [])
  	for (const id of f.evidenceCallIds)
  		aspectsByCall.set(id, [...(aspectsByCall.get(id) ?? []), f.issue]);
  ```
  Render `session.evidenceCallIds.map((callId) => …)` as a `Stack gap='xs'` of rows
  `<Group key={callId} gap='sm' wrap='nowrap'>` with the call chip (`Badge size='sm' variant='outline' color='gray'
leftSection={<IconPhone size={12} />} className={pointerStyles.pointer} onClick={() => openCall(callId)}`) followed by
  `<Text size='xs' c='dimmed'>` = the aspects joined with `' · '` using
  `t(\`issues.${issue}\`, { ns: 'qa.calls' })`(nothing when the call has no aspect, e.g. sessions without a brief).
Empty state unchanged.`sessions.detail.evidenceOther`is **not needed** (drop 3.5).`Caption` is not used here.
- [ ] **3.3** Right column order: proposed card / outcome form / read-only outcome (unchanged) → **Suggested material**
      (`session.brief` only) → **Previous session** (`session.brief` only) → Linked material → Agent commitment → impact
      chart. Add
  ```tsx
  {
  	session.brief && (
  		<>
  			<SuggestedMaterialCard
  				brief={session.brief}
  				agentId={session.agentId}
  				role={role}
  				assignments={assignments}
  				contentById={contentById}
  			/>
  			<PreviousSessionCard brief={session.brief} />
  		</>
  	);
  }
  ```
  right after the read-only outcome block (import from `../components/SessionBriefAside`).
- [ ] **3.4** Agent commitment: change `{!isAi && (` to `{!isAi && session.status === 'COMPLETED' && (` — a proposal or a
      scheduled session has nothing to confirm yet. Drop the now-unused `notCommitted` branch only if the typecheck flags it.
- [ ] **3.5** `npm run typecheck` (clean again) → commit tasks 1-3 together:
      `feat(qa-coaching): scannable session brief with stat strip, aspect rows and a readable guide`.

---

## Verification (after Task 3)

1. `npm run typecheck` clean; `git diff --stat` touches only the files in **File Structure** (plus `src/version.ts`).
2. Read-through:
   - `SessionBrief.tsx` renders no call chips and no `Button`; its only imports are the ones in 1.1.
   - The same call id appears once per page: one row in Evidence, with its aspects as text, and nowhere in the brief.
   - `grep -rn "sessions.brief.week\|findingCalls" src` — either both removed from locales and code, or still used.
   - A PROPOSED session shows no "Agent commitment" card; a COMPLETED one does; AI messages never do.
   - Both locales have `sessions.brief.stats.*`, `findingOf` and `guide`.
3. Mock sanity (mental, no dev server): open a proposed session (e.g. AGT-006 "Keeping your own tone steady"): header
   unchanged; the brief card opens with a four-figure strip (53 · Critical / +3 vs previous week / 20 / 31 Aug – 6 Sep),
   then two aspect rows each with "20 of 20 calls" and a full bar, then "Coaching guide" with approach in two short
   paragraphs, solution and the example as a gray quote, all capped at ~68 characters per line. Left column continues
   with Evidence as three rows (one call each, "Negative agent emotion · Low agent sentiment" beside it), Talking
   points and Action items. The right column shows the schedule card, Suggested material with
   the Assign button, and Since the previous session with a red "Declined" line; no Agent commitment.
