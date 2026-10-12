# Session detail: highlight the change and the previous session; a more critical automated message

## Context

On the coaching session page (`src/modules/qa/coaching/CoachingSessionDetailPage/CoachingSessionDetailPage.tsx`) the two facts a coach needs first — how the agent's scorecard moved (week before → now) and what happened in the previous session — are buried: the change is a small stat inside the weekly brief's figures strip, and `PreviousSessionCard` sits fourth in the right column. Separately, the automated weekly message (`buildAiCoachingMessage`) only lists scores and a one-line focus; it never tells the agent what the critical points were, the weak aspect of the week, how to approach it, or gives examples — even though the session brief already carries `findings`, `approach` and `example` from `COACHING_PLAYBOOK`.

Decisions made with the user (2026-10-12): **accent cards at the top of the right column** (a new "Scorecard change" card, then `PreviousSessionCard` moved up, both with a colored header accent); **"Action items" renamed to "Notes"** including button and empty state (field labels "What"/"By" stay; the previous-session card's "Supervisor notes" block keeps its name); **the critical message lands in both the generated text and the structured inbox view**, and the inbox's "What this coaching covers" card is skipped for automated messages so it isn't said twice.

Mode: refinement. Mockup-level; `COACHING_PLAYBOOK` and `buildAiCoachingMessage` are intentionally English-only mock copy, and stay so. UI strings go to en + es locales. Light/dark via Mantine variables. No tests; Prettier on touched files only; do not commit unless asked.

Plan copy convention: Task 0 copies this file to `docs/superpowers/plans/2026-10-12-session-critical-highlights-ai-message.md`.

---

## Critique summary

| Finding                                                                                                                                                                                      | Severity | Evidence                                                             |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | -------------------------------------------------------------------- |
| Scorecard change is a small `StripStat` inside the brief, same weight as "Calls" and "Week"                                                                                                  | Critical | `SessionBrief.tsx:80-89`                                             |
| Previous session summary is 4th in the right column, below decision and outcome                                                                                                              | Critical | page `:603-608`                                                      |
| "Action items" title; user's model calls these notes                                                                                                                                         | Minor    | page `:398-482`, key `sessions.detail.actionItems`                   |
| Automated message: scores + generic focus sentence only; the brief's finding/approach/example never reach the text                                                                           | Critical | `helpers.ts:43-60`                                                   |
| Structured inbox view (`AutomatedCoachingMessage`) shows scores + focus; the critical detail lives in a separate "What this coaching covers" card that doesn't read like part of the message | Moderate | `AutomatedCoachingMessage.tsx`, `CoachingSessionContext.tsx:104-175` |

---

## Implementation plan

Execute in order; `npm run typecheck` after each phase.

### Task 0 — Plan copy

Copy this file to `docs/superpowers/plans/2026-10-12-session-critical-highlights-ai-message.md`.

### Phase 1 — Locale keys (`src/locales/{en,es}/qa.coaching.json`, `src/locales/{en,es}/qa.inbox.json`)

Both qa.coaching files are tab-indented; validate with `node -e "JSON.parse(...)"` after editing. Anchor edits on single lines (CRLF/tab mismatches bit earlier sessions).

**qa.coaching — rename under `sessions.detail` (values only, keys unchanged):**

- en: `actionItems` "Action items" → **"Notes"**; `addItem` "Add action item" → **"Add note"**; `noItems` "No action items yet." → **"No notes yet."**
- es: `actionItems` → **"Notas"**; `addItem` → **"Agregar nota"**; `noItems` → **"Todavía no hay notas."**
- Leave `itemText` ("What"/"Qué"… verify es value stays), `itemDue`, and `sessions.previous.notes` ("Supervisor notes") untouched.

**qa.coaching — new `sessions.change` group (sibling of `sessions.detail`):**

- en: `{ "title": "Scorecard change", "description": "The week before vs this week" }`
- es: `{ "title": "Cambio del scorecard", "description": "La semana anterior vs esta semana" }`

**qa.inbox — add under `details.automated`:**

- en: `"critical": "What needs attention"`
- es: `"critical": "Qué requiere atención"`
  (The approach/example/problemOf labels reuse existing `details.coaching.{approach,example,problemOf}`.)

### Phase 2 — Session page highlights

**2a. New `src/modules/qa/coaching/components/ScoreChangeCard.tsx`:**

```tsx
import { Group, Text } from '@mantine/core';
import {
	IconArrowRight,
	IconTrendingDown,
	IconTrendingUp,
} from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { SectionCard } from '~/components/SectionCard';
import type { CoachingBrief } from '~/models/qa';
import { ScoreTrendText } from './QuietIndicators';

interface ScoreChangeCardProps {
	brief: CoachingBrief;
}

/** The one number the coach opens the session for: last week's scorecard against this week's. */
export function ScoreChangeCard({ brief }: ScoreChangeCardProps) {
	const { t } = useTranslation('qa.coaching');
	const declined = brief.trend === 'DECLINED';

	return (
		<SectionCard
			title={t('sessions.change.title')}
			description={t('sessions.change.description')}
			icon={declined ? IconTrendingDown : IconTrendingUp}
			headerAccent={declined ? 'red' : 'blue'}
			padding='md'
		>
			<Group gap='sm' align='baseline' wrap='nowrap'>
				<Text fz={28} fw={700} c='dimmed'>
					{brief.previousScore ?? '—'}
				</Text>
				<IconArrowRight size={20} color='var(--mantine-color-dimmed)' />
				<Text
					fz={28}
					fw={700}
					c={declined ? 'var(--mantine-color-red-text)' : undefined}
				>
					{brief.score}
				</Text>
				<ScoreTrendText
					verdict={brief.trend}
					current={brief.score}
					previous={brief.previousScore}
				/>
			</Group>
		</SectionCard>
	);
}

export default ScoreChangeCard;
```

**2b. `src/modules/qa/coaching/components/SessionBriefAside.tsx`:** give `PreviousSessionCard`'s `SectionCard` `headerAccent='blue'` (only the card whose title is `sessions.previous.title`; `SuggestedMaterialCard` unchanged).

**2c. `CoachingSessionDetailPage.tsx`:**

- Import `ScoreChangeCard` from `../components/ScoreChangeCard`.
- Right column (Grid.Col md=4, `:488`): new order —
  1. `{session.brief && <ScoreChangeCard brief={session.brief} />}` (all session types, AI included)
  2. the existing `{!isAi && <PreviousSessionCard …/>}` block moved here (from `:603-608`), unchanged props
  3. `SessionDecisionCard` block, 4. outcome form, 5. read-only outcome, 6. `AgentLearningCard`, 7. `SuggestedMaterialCard`, 8. commitment, 9. linked material, 10. impact chart — all as today.
- No other changes; the brief's small Change stat inside `SessionBrief` stays (per the chosen option).

### Phase 3 — Critical automated message (generated text)

**3a. `src/modules/qa/coaching/helpers.ts`:**

- Imports: add `CoachingBrief` to the existing `~/models/qa` type import; add `import type { CallIssueKey } from '~/modules/qa/calls/issues';` and `import { COACHING_PLAYBOOK } from './playbook';` (playbook imports only types + `calls/issues`, no cycle with helpers).
- New signature: `buildAiCoachingMessage(profile, ruleName, contentTitles, brief?: CoachingBrief | null)`.
- New body (replace `:43-60`; keep `DIMENSION_LABEL`, score lines and the material suffix as they are):

```ts
export const buildAiCoachingMessage = (
	profile: AgentProfile,
	ruleName: string,
	contentTitles: string[],
	brief?: CoachingBrief | null
): string => {
	const lines = profile.dimensions.map((d) => {
		const unit = DIMENSION_META[d.key].unit;
		const delta =
			d.delta === 0 ? 'stable' : `${d.delta > 0 ? '+' : ''}${d.delta}${unit}`;
		return `• ${DIMENSION_LABEL[d.key]}: ${d.score}${unit} (${delta} vs last week)`;
	});
	const weakest = weakestDimension(profile);
	const material = contentTitles.length
		? `\n\nTo work on it this week I attached: ${contentTitles.join(', ')}.`
		: '';

	const finding = brief?.findings[0];
	const playbook = finding
		? COACHING_PLAYBOOK[finding.issue as CallIssueKey]
		: null;
	const declines = profile.dimensions
		.filter((d) => d.delta < 0)
		.map(
			(d) =>
				`• ${DIMENSION_LABEL[d.key]} fell ${d.delta}${DIMENSION_META[d.key].unit} vs last week.`
		);

	// With a brief the message gets critical: the finding, the weak aspect, the approach and an example.
	const body =
		brief && finding && playbook
			? [
					`Critical points this week:\n${[
						`• ${playbook.topic}: flagged on ${finding.calls} of ${brief.calls} evaluated calls (${finding.share}% of the week).`,
						...declines,
					].join('\n')}`,
					`Your weakest aspect this week was ${weakest ? DIMENSION_LABEL[weakest.key] : 'quality'}.`,
					`How to approach it: ${brief.approach}`,
					`For example: ${brief.example}`,
				].join('\n\n')
			: `Your focus for the week is ${weakest ? DIMENSION_LABEL[weakest.key] : 'quality'}. Pick one call from last week where it slipped and note what you would do differently.`;

	return `Hi ${profile.agent.name.split(' ')[0]}, here is your weekly review (${ruleName}).\n\n${lines.join('\n')}\n\n${body}${material}`;
};
```

**3b. Pass the brief at every call site that has one:**

- `src/stores/qa/coachingStore.ts` `toAiMessage` (~L219): `buildAiCoachingMessage(profile, 'Weekly coaching review', titles, session.brief ?? null)`
- `coachingStore.ts` rule-created session (~L385): unchanged call (no brief there) — the fallback branch covers it.
- `coachingStore.ts` `setSuggestedMaterials` (~L595): `…, x.topic, titles, x.brief ?? null)` — note it rebuilds from `next.brief` after the materials change; use `next.brief ?? null` so the message names the same brief it was updated with.
- `src/modules/qa/coaching/weeklyBatch.ts` (~L384): `…, 'Weekly QA review', titles, brief)`
- `src/modules/qa/coaching/mockData.ts` `weeklyAiMessage` (~L672): unchanged (no brief in that factory).
- `mockData.ts` patched switch (~L904): `…, 'Weekly coaching review', [], s.brief ?? null)`

**3c. Demo message `src/modules/qa/inbox/mockData.ts` ntf-a14 (~L176-183):** replace the hardcoded `message` string with the new shape so the raw-text fallback matches, e.g. keep the greeting + 4 score lines, then:

```
'Critical points this week:\n' +
'• Confirm before committing: flagged on 3 of 12 evaluated calls (25% of the week).\n' +
'• QA fell -4% vs last week.\n\n' +
'Your weakest aspect this week was QA.\n\n' +
'How to approach it: <copy the first sentence of COACHING_PLAYBOOK["qa-ecn"].approach>\n\n' +
'For example: <copy COACHING_PLAYBOOK["qa-ecn"].example>\n\n' +
'To work on it this week I attached: Objection Handling Fundamentals, Closing the Call: recap & next steps.'
```

(Read `playbook.ts` while implementing and paste the real strings.)

### Phase 4 — Structured inbox view

**4a. `src/modules/qa/inbox/components/AutomatedCoachingMessage.tsx`:**

- Namespaces: `useTranslation(['qa.inbox', 'qa.team', 'qa.calls'])` (route namespaces already load `qa.calls`).
- Imports: add `Badge` (Mantine), `CRITICAL_ISSUES` from `~/modules/qa/coaching/components/QuietIndicators`, `queueStyles` from `~/modules/qa/coaching/components/Queue.module.css`, `type CallIssueKey` from `~/modules/qa/calls/issues`.
- After the focus block, with `const brief = session.brief; const finding = brief?.findings[0];`:

```tsx
{
	brief && finding && (
		<Stack gap={6}>
			<Caption>{t('details.automated.critical')}</Caption>
			<Group gap='sm'>
				<Badge
					size='sm'
					variant={CRITICAL_ISSUES.has(finding.issue) ? 'light' : 'outline'}
					color={CRITICAL_ISSUES.has(finding.issue) ? 'red' : 'gray'}
				>
					{t(`issues.${finding.issue as CallIssueKey}`, { ns: 'qa.calls' })}
				</Badge>
				<Text size='xs' c='dimmed'>
					{t('details.coaching.problemOf', {
						count: finding.calls,
						total: brief.calls,
					})}
				</Text>
			</Group>
		</Stack>
	);
}
{
	brief?.approach && (
		<Stack gap={4}>
			<Caption>{t('details.coaching.approach')}</Caption>
			<Text size='sm' className={queueStyles.preWrap}>
				{brief.approach}
			</Text>
		</Stack>
	);
}
{
	brief?.example && (
		<Stack gap={4}>
			<Caption>{t('details.coaching.example')}</Caption>
			<Text size='sm' c='dimmed' className={queueStyles.preWrap}>
				{brief.example}
			</Text>
		</Stack>
	);
}
```

**4b. `src/modules/qa/inbox/components/CoachingSessionContext.tsx`:** add prop `materialsOnly?: boolean`; when true, skip the first `SectionCard` (`details.coaching.sessionTitle`, `:104-175`) and render only the "Learning material" card. Keep the early `if (!session || !brief) return null;`.

**4c. `src/modules/qa/inbox/NotificationDetailPage/NotificationDetailPage.tsx`:** pass `materialsOnly={Boolean(automated)}` to `CoachingSessionContext` (the `automated` const already exists next to the session lookup).

`npm run typecheck`; `npx prettier --write` on the touched files only (list them explicitly); typecheck again.

---

## Files touched

- New: `src/modules/qa/coaching/components/ScoreChangeCard.tsx`
- Edited: `coaching/CoachingSessionDetailPage/CoachingSessionDetailPage.tsx`, `coaching/components/SessionBriefAside.tsx`, `coaching/helpers.ts`, `coaching/weeklyBatch.ts`, `coaching/mockData.ts`, `stores/qa/coachingStore.ts`, `inbox/components/AutomatedCoachingMessage.tsx`, `inbox/components/CoachingSessionContext.tsx`, `inbox/NotificationDetailPage/NotificationDetailPage.tsx`, `inbox/mockData.ts`, `src/locales/{en,es}/qa.coaching.json`, `src/locales/{en,es}/qa.inbox.json`
- Plan copy: `docs/superpowers/plans/2026-10-12-session-critical-highlights-ai-message.md`

## Out of scope (noted)

- The brief's own figures strip and guide (unchanged; the Change stat stays there too).
- The agent-side session drawer (`AgentSessionDetailDrawer`) and `AgentCoachingTab` — they show the raw `aiMessage` text and pick the new wording up automatically.
- Localizing `buildAiCoachingMessage` / `COACHING_PLAYBOOK` (mock English by design).
- Renaming the `actionItems` data field or the agent drawer's "Action items" label (`qa.lms` namespace).

## Verification

1. `npm run typecheck` passes.
2. Supervisor → Coachings → Sessions → open a proposed 1:1 that has a brief (dev server only if the user asks; DESIGN_ROLE.md keeps it off otherwise): right column starts with **Scorecard change** (big `before → now`, red number and red header accent only when declining, blue otherwise) followed by **Previous session** with a blue accent; decision card and outcome come after; the left column is unchanged except the "Notes" section (title, "Add note" button, "No notes yet." when empty).
3. Open an automated-message session on the same page: the Automated message card's text now has "Critical points this week", the weakest aspect line, "How to approach it:" and "For example:"; the Scorecard change card shows too.
4. Agent inbox → `ntf-a14`: the structured message shows greeting, score tiles, focus block, then **What needs attention** (issue badge + "N of M calls last week"), **How to approach it** and **For example**; below it only the "Learning material" card remains (no "What this coaching covers" duplicate). A 1:1 "session scheduled" notice still shows the full coverage card.
5. Agent drawer (Coaching tab → open an automated message) shows the new text; `AgentCoachingTab`'s 280-char preview still renders.
6. Dark mode (accents, badges) and Spanish: "Notas", "Agregar nota", "Cambio del scorecard", "Qué requiere atención" all resolve; the message body itself stays English (mock).
