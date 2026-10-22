# Design critique: Call evaluation page, color

## Context

The call evaluation page (`src/views/Campaigns/pages/ConversationEvaluations.tsx` and `src/views/Campaigns/components/call-evaluation/*`) now carries the anchored-moments feature. The user, a product designer, wants the page quieter and more monochromatic, and the selected evaluation tab in a neutral tone rather than the primary color. This critique inventories where color is spent today and proposes a restrained palette; the implementation plan follows the user's answers to the scope questions.

## Design Critique: Call evaluation

### Overall impression

The page reads as a dashboard of alerts rather than a review workspace. Five independent color systems compete on one screen, so the eye has no resting place and the one thing that should pop, the QA moments the reviewer must act on, is just another colored chip among many. The biggest opportunity is to make color mean one thing only: "this needs your attention".

### Where color is spent today

| Element                                                  | File                                                                         | Today                                                                               | Why it competes                                                                                                                               |
| -------------------------------------------------------- | ---------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| Selected evaluation tab                                  | `ConversationEvaluations.tsx:297`                                            | `variant='filled' color='green'` (green is `theme.primaryColor`, `src/theme.ts:36`) | The strongest fill on the page is a navigation state, not content. It also reads as "passed", which is a score meaning.                       |
| Tab score badge                                          | `:285-289`                                                                   | `variant='white'` on the selected tab                                               | Follows the filled tab; fine once the tab is neutral.                                                                                         |
| Dispute button                                           | `:342`                                                                       | `color='red' variant='light'`                                                       | Agent-only; acceptable as a destructive-ish action, but red is also "violation" on this page.                                                 |
| Breadcrumb links                                         | `:68`                                                                        | hardcoded `blue-6`                                                                  | Only blue text on the page besides speaker tints.                                                                                             |
| QA ring + aspect badges + error-type progress            | `QAEvaluationPanel.tsx:129, 258, 298`                                        | `getScoreColor` (green / yellow / red bands)                                        | Every score is colored, including good ones, so "good" is as loud as "bad".                                                                   |
| Pass/fail, auto-fail badges                              | `:145, 151`                                                                  | `filled green/red`, `light red/green`                                               | Two filled semantic badges in the header.                                                                                                     |
| Error-type status icons                                  | `:102-114`                                                                   | green / yellow / red icons                                                          | Duplicates the progress bar color beside it.                                                                                                  |
| Item answer badge                                        | `:342-343`                                                                   | `filled` green / red / gray                                                         | Filled red on every "No" is the loudest element in the list; it fights the moment card below it.                                              |
| Moment status (chips, cards, markers, transcript badges) | `callMoments.ts:60`, `MomentCard`, `CallPlayer.module.css`, `CallTranscript` | pending yellow, confirmed red, dismissed gray                                       | Correct idea (status is what the reviewer acts on) but it shares yellow/red with scores, so a pending moment and a mediocre score look alike. |
| Confirm / undo buttons                                   | `MomentCard.tsx:123, 188`                                                    | green / red subtle                                                                  | Adds two more hues inside the card.                                                                                                           |
| Speaker tint                                             | `EvidenceQuote`, `MomentCard:69`, `CallTranscript.module.css:8`              | agent = blue badge and blue-light turn background                                   | Blue is used for nothing else on the page; the agent/customer split can be carried by the icon and alignment alone.                           |
| Other panels                                             | Sentiment, Compliance, ESG, Business                                         | same green/yellow/red bands, plus blue for "detected" and outcome badges            | Same pattern repeated four more times.                                                                                                        |

### Usability

| Finding                                                                                           | Severity    | Recommendation                                                                                                                                                                                   |
| ------------------------------------------------------------------------------------------------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| The selected tab is the brightest fill on the page and uses the "passed" green.                   | 🟡 Moderate | Neutral selection: `variant='default'` on the selected tab (surface fill + border, strong text), `variant='subtle' color='gray'` on the rest. The score badge stays `light gray` in both states. |
| Good scores are colored as strongly as bad ones, so the reviewer cannot scan for problems.        | 🟡 Moderate | Reuse `alertScoreColor` (`src/modules/qa/team/helpers.ts`): color only below 70, otherwise neutral (`gray.6` ring, default text). The agent profile already does this.                           |
| Every "No" answer is a filled red badge, and the moment card under it adds a second status color. | 🟡 Moderate | Answer badge becomes `variant='light'` and neutral; "No" keeps a red _dot or text_ only. The moment card carries the reviewer status; the answer badge should not shout too.                     |
| Moment status shares yellow/red with score bands.                                                 | 🟡 Moderate | Keep one accent for moments: pending = neutral outline, confirmed = red (the only red on the page), dismissed = gray at reduced opacity. Markers on the timeline follow the same rule.           |
| Blue speaker tint on half the transcript turns adds a hue that carries no decision.               | 🟢 Minor    | Both speakers on the same surface; agent turns distinguished by the headset icon and a slightly stronger left border, not color.                                                                 |

### Visual hierarchy

- **What draws the eye first**: the green filled tab, then the red "No" badges, then the yellow moment chips. The intended order is moments → the item they belong to → the score context.
- **Reading flow**: left column (player, transcript) is calm; right column is a wall of chips. After the change, the only saturated elements should be confirmed moments and genuinely failing scores.
- **Emphasis**: use weight, size and borders for structure (section titles, active turn, active moment), and reserve hue for "needs attention".

### Consistency

| Element        | Issue                                                                                         | Recommendation                                                                                        |
| -------------- | --------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| Score color    | Each panel calls `getScoreColor` directly                                                     | Route all five panels through one `scoreTone(score)` that returns `alertScoreColor(score) ?? 'gray'`. |
| Status icons   | Hard-coded `green-6 / yellow-6 / red-6` inline styles in three panels                         | Icons inherit text color; only the critical icon stays red.                                           |
| Selected state | Page uses filled buttons; the rest of the QA app uses Mantine `Tabs` with a neutral indicator | Match the app: neutral selected button, or switch to `AppSegmentedControl`.                           |

### Accessibility

- **Contrast**: neutral selection must still be distinguishable without color: surface fill + 1px border + `fw={600}` text passes WCAG 1.4.1 (not color alone).
- **Status without color**: moment status keeps its text label and icon (check / x), so dismissed vs confirmed is readable in grayscale.
- **Markers**: confirmed markers are filled, pending are outlined, dismissed are faded, so the timeline reads without hue.

### What works well

- Sections are already cards with clear titles and descriptions; the structure does not need to change.
- Moment cards already carry a text status label and a source badge, so dropping their color costs nothing.
- The transcript active-turn treatment (left border) is the right kind of emphasis and can become the model for the whole page.

### Priority recommendations

1. **Neutral tab selection** — removes the primary green from navigation and lets the content own the page's color.
2. **Color only when it is a problem** — one `scoreTone` helper, applied to every ring, badge, progress bar and icon on the page.
3. **One accent for moments** — red for confirmed, outline for pending, faded for dismissed; drop the blue speaker tint and the green/red action buttons.

## Implementation plan

Decisions: **neutral unless it is a problem** (one accent: red), **whole page** (tab bar, player, transcript, moments, all five panels), **selected tab = surface + border**.

### The rule, in one place

New file `src/views/Campaigns/components/call-evaluation/tone.ts`:

```ts
import type { SentimentCategory } from '../../types';

/** Threshold under which a 0-100 score is a problem; above it everything stays neutral. */
export const PROBLEM_SCORE = 70;
export const NEUTRAL = 'gray';
export const ALERT = 'red';

/** Neutral unless the score signals a problem. The only hue on the page is the alert red. */
export const scoreTone = (score: number): string =>
	score >= PROBLEM_SCORE ? NEUTRAL : ALERT;

/** 1-5 sentiment on the same rule. */
export const sentimentTone = (score: number): string =>
	scoreTone(Math.round(((score - 1) / 4) * 100));

export const sentimentCategoryTone = (category: SentimentCategory): string =>
	category === 'very-negative' || category === 'negative' ? ALERT : NEUTRAL;

/** Mantine Badge color + variant for a boolean "is this a problem" flag. */
export const flagTone = (problem: boolean) =>
	problem
		? ({ color: ALERT, variant: 'light' } as const)
		: ({ color: NEUTRAL, variant: 'light' } as const);
```

Check that `SentimentCategory` is exported from `src/views/Campaigns/types.ts` (it is used by `SENTIMENT_CATEGORIES` in `constants.ts`); otherwise type the parameter as `keyof typeof SENTIMENT_CATEGORIES`.

Every change below replaces a color prop with one of these helpers or with the literal `'gray'` / `'red'`. No new CSS colors other than Mantine variables. Do not touch `getScoreColor` or `badgeColors.ts` (other pages use them).

### 1. `ConversationEvaluations.tsx` (page chrome)

- **Tab buttons** (lines ~294-303): `variant={isSelected ? 'default' : 'subtle'}`, `color='gray'` always, add `fw={isSelected ? 600 : 500}`. The score badge (lines ~285-289) becomes `variant='light' color='gray'` in both states.
- **Send to coaching** menu button: `variant='default'` (today `variant='light'`, which paints it in the primary green).
- **Dispute button** (agent): `variant='default'`, keep `IconFlag`; drop `color='red'`.
- **Breadcrumb anchors** (`breadcrumbLinkStyle`, line ~66): remove the blue color from the style object and add `c='dimmed' underline='hover'` to the `Anchor` in `renderBreadcrumbLink`. Keep the `inline-style-allow` comment only if a `cursor` style remains; otherwise delete the style object.
- **Customer name anchor** in the header: `c='dimmed' underline='always'`.

### 2. Moments (`callMoments.ts`, `MomentCard`, `CallPlayer`, `CallTranscript`, `QAEvaluationPanel` chips)

- `callMoments.ts`: `MOMENT_STATUS_COLOR = { pending: 'gray', confirmed: 'red', dismissed: 'gray' }` and add `MOMENT_STATUS_VARIANT: Record<CallMomentStatus, 'outline' | 'light'> = { pending: 'outline', confirmed: 'light', dismissed: 'light' }`.
- Every status `Badge` (MomentCard header, transcript turn badges, Key moments chips) uses both: `color={MOMENT_STATUS_COLOR[s]} variant={MOMENT_STATUS_VARIANT[s]}`. The active chip / badge keeps `variant='filled'` with `color='gray'` (neutral selected).
- **MomentCard**: speaker badge `color='gray' variant='outline'` for both speakers; Confirm button `variant='subtle' color='gray'` (keeps `IconCheck`); the reviewer "Undo" that removes a moment becomes `color='gray'` with `IconTrash`; everything else already gray.
- **MomentCard.module.css**: `.card[data-active]` border and shadow use `light-dark(var(--mantine-color-gray-7), var(--mantine-color-gray-4))` instead of the primary color.
- **CallPlayer.module.css**: `.marker` default (pending) = outlined: `background: var(--mantine-color-body); border: 2px solid var(--mantine-color-gray-6)`; `[data-status='confirmed']` = `background: var(--mantine-color-red-6); border-color: var(--mantine-color-red-6)`; `[data-status='dismissed']` = `background: var(--mantine-color-gray-4); border-color: var(--mantine-color-gray-4); opacity: 0.6`; `[data-active]` outline = `light-dark(var(--mantine-color-gray-7), var(--mantine-color-gray-4))`. `.volumeFill` = `var(--mantine-color-gray-6)`. `:focus-visible` keeps the primary outline (focus ring convention).
- **CallTranscript.module.css**: remove the agent `blue-light` background; both speakers use `var(--mantine-color-gray-light)`; agent turns get `border-left-color: var(--mantine-color-gray-4)` so the split is still visible without hue; `[data-active]` border = `light-dark(var(--mantine-color-gray-7), var(--mantine-color-gray-4))`, inset shadow dropped.
- **EvidenceQuote.tsx**: speaker badge `color='gray'` for both.

### 3. `QAEvaluationPanel.tsx`

- Status icons map (lines ~99-116): `good` and `warning` icons use `color='var(--mantine-color-dimmed)'` (Tabler `color` prop, no inline style); `critical` keeps red.
- Ring `color: scoreTone(qa.overallScore)`; pass badge `{...flagTone(!qa.passed)}` label unchanged; threshold stays gray; auto-fails `{...flagTone(qa.autoFailCount > 0)}`.
- Error-type cards: `Progress color={scoreTone(errorType.score)}`.
- Aspect header badge: `color={scoreTone(pct)} variant='light'`.
- Item answer badge: `yes` → `variant='outline' color='gray'`; `na` → `variant='outline' color='gray'`; `no` → `variant='light' color='red'`.

### 4. `CompliancePanel.tsx` and `EsgPanel.tsx` (same shape)

- `statusMeta` colors: `compliant: 'gray'`, `warning: 'gray'`, `violation: 'red'`; icons for compliant/warning use `color='var(--mantine-color-dimmed)'` (replace the inline `style` with the icon `color` prop), violation keeps red.
- Ring `scoreTone(overallScore)`; header status badge `variant='light'`; violations count `{...flagTone(violationCount > 0)}`; warnings count `color='gray' variant='light'` always.
- Area / pillar badge and `Progress`: `scoreTone(score)`.
- Item status badge: `variant={item.status === 'violation' ? 'light' : 'outline'} color={itemStatus.color}`.

### 5. `SentimentEmotionPanel.tsx`

- Speaker headline `ThemeIcon color={sentimentCategoryTone(categoryKey)}` (find how `categoryMeta` is derived at the top of `renderSpeakerCard`; pass its key).
- Burnout header badge and `Progress`: red when the level's current color is `'red'` or `'orange'`, otherwise gray (look at `BURNOUT_LEVEL_META` in `constants.ts`; add a `tone` field there mapping each level to `'red' | 'gray'` rather than branching in the panel). Burnout signals detected → `{...flagTone(signal.detected)}`.
- Journey badges (start / lowest / end): `color={sentimentCategoryTone(category)}`.
- Recovered badge: `variant='light'`, `color={sentiment.recovery.recovered ? 'gray' : 'red'}`; delta badge `{...flagTone(improvementDelta < 0)}`.
- Agent tone `Progress color={scoreTone(value)}`.
- Talk-time ratio: agent section `color='gray.7'` with `Progress.Label c='white'`; customer `color='gray.3'` with `Progress.Label c='dark'`.
- Any remaining `EMOTION_COLORS` use on this page: leave the constant, but if a badge uses it, map through `sentimentCategoryTone` of the speaker's category instead (check the file; the earlier inventory found none).

### 6. `BusinessInsightsPanel.tsx`

- Outcome `ThemeIcon color='gray'`; outcome badge `variant='light' color='gray'`; "signals detected" and "Follow-up recommended" badges `color='gray'`.
- Signal rows: `ThemeIcon color={signal.detected ? (meta.tone === 'risk' ? 'red' : 'gray') : 'gray'}` keeping the filled/light variant switch; tone badge `color={meta.tone === 'risk' ? 'red' : 'gray'} variant='outline'`; "Detected" badge `color='gray' variant={signal.detected ? 'light' : 'outline'}`.

### Files

| Action | Path                                                                                                                                                                                                                                                                                          |
| ------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| New    | `src/views/Campaigns/components/call-evaluation/tone.ts`                                                                                                                                                                                                                                      |
| Edit   | `src/views/Campaigns/pages/ConversationEvaluations.tsx`                                                                                                                                                                                                                                       |
| Edit   | `src/views/Campaigns/components/call-evaluation/{callMoments.ts, MomentCard.tsx, MomentCard.module.css, CallPlayer.module.css, CallTranscript.module.css, EvidenceQuote.tsx, QAEvaluationPanel.tsx, CompliancePanel.tsx, EsgPanel.tsx, SentimentEmotionPanel.tsx, BusinessInsightsPanel.tsx}` |
| Edit   | `src/views/Campaigns/constants.ts` (`BURNOUT_LEVEL_META.tone` only)                                                                                                                                                                                                                           |

No locale changes. No store or model changes.

### Verification

1. `npm run typecheck` passes.
2. Hue audit, must return nothing (red is the only allowed hue):
   ```bash
   grep -rnE "'(green|blue|yellow|orange|teal|violet)'|mantine-color-(green|blue|yellow|orange|teal|violet)" src/views/Campaigns/pages/ConversationEvaluations.tsx src/views/Campaigns/components/call-evaluation
   ```
   Expected leftovers to review by hand: `getScoreColor` import may now be unused in some panels (remove it), and `src/views/Campaigns/constants.ts` keeps its tab/emotion colors (used elsewhere).
3. `grep -n "variant='filled'" src/views/Campaigns/pages/ConversationEvaluations.tsx` returns nothing (no filled tab).
4. Dark mode: every new CSS value is a Mantine variable or `light-dark()`.
5. No dev server, no visual run, no commit unless asked (DESIGN_ROLE).
