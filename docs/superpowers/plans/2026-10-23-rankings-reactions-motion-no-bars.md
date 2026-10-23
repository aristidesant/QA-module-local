# Rankings: reaction micro-animations and no score bars

> On execution: copy this file to `docs/superpowers/plans/2026-10-23-rankings-reactions-motion-no-bars.md`. `npm run typecheck` after each task. No dev server, no tests, no commit unless asked. Prettier on touched files only.

## Context

Two findings on the standings (both roles) after the rankings rebuild:

- The **score column draws a bar per row** (`StandingsTable.tsx:113-126`, `StandingCard.tsx:142-152`) that repeats the number next to it and reads as filler. The same kind of bar sits under the agent's own score in the "you" strip (`YourStandingStrip.tsx:113`) and in the drawer's next-badge card (`AchievementsTab.tsx:173-178`). The card score is also blue (`StandingCard.module.css .score`), which makes every score look like a link.
- **Reactions** (`LeaderboardReactions.tsx`, used by the table, the cards and the detail drawer) toggle with a 120 ms colour swap and nothing else. They are the one social moment on the agent's page and deserve a small, honest response.

Decisions with the user (2026-10-23): remove **every** bar (standings column, cards, "you" strip, next-badge card); add micro-animations to reactions on the agent side only. Managers' read-only chips stay static.

Decided by me: three motions, all CSS, each under 300 ms, cancelled under `prefers-reduced-motion: reduce` (same pattern as `CompactProfileBar.module.css:38`). No confetti, no bursts, no sound. The card score becomes neutral text.

---

## Task 1 · Remove the bars

- `src/modules/qa/rankings/components/StandingsTable.tsx`: delete the `<Progress …>` inside the score cell (keep the `Group` with the score text and tooltip); drop `Progress` from the Mantine import. In `Rankings.module.css` delete `.scoreBar` and shrink `.scoreCell` to `width: 120px`.
- `src/modules/qa/rankings/components/StandingCard.tsx`: delete the `{!dense && (<Progress …/>)}` block and the `Progress` import; the `Stack gap={6}` becomes just the score `Text`. In `StandingCard.module.css` change `.score` to `color: inherit;` (keep `line-height`).
- `src/modules/qa/agent/rankings/components/YourStandingStrip.tsx`: delete the `extra={…Progress…}` prop on the Score cell, the `progress` const, the `Progress` import and the now-unused `higherIsBetterOf` import. The `extra` prop of `Cell` stays (used nowhere else: remove it too).
- `src/modules/qa/agent/rankings/components/tabs/AchievementsTab.tsx`: delete the `<Progress …/>` and its import; the `{next.progress}%` text stays, so the card still says how close the agent is.

**Typecheck.** `grep -rn "<Progress" src/modules/qa/rankings src/modules/qa/agent/rankings` must return only `RankingHeader.tsx` (period elapsed, manager detail page).

---

## Task 2 · Reaction micro-animations (agent only)

### `src/modules/qa/agent/rankings/components/LeaderboardReactions.tsx`

- `UnstyledButton` keeps its size; the moving part is an inner `<span className={styles.inner}>` wrapping icon + count, so the hit area never shrinks.
- Track when the persona just gave this reaction: `const [popped, setPopped] = useState<UserReactionType | null>(null)`. In the click handler, when turning a reaction **on**, `setPopped(emoji)`; the button gets `data-pop={popped === emoji || undefined}` and `onAnimationEnd={() => setPopped(null)}`. Turning off plays no pop.
- Count: render `<span key={count} className={styles.count}>{count}</span>` so a changed number remounts and plays its enter animation.

### `src/modules/qa/agent/rankings/components/LeaderboardReactions.module.css` (add)

```css
.inner {
	display: inline-flex;
	align-items: center;
	gap: 4px;
	transition: transform 80ms ease;
}

/* Press: the content squashes, the button (hit area) does not. */
.chip:active .inner {
	transform: scale(0.92);
}

/* Give: the icon pops once, then settles. */
@keyframes reaction-pop {
	0% {
		transform: scale(1);
	}
	40% {
		transform: scale(1.35);
	}
	100% {
		transform: scale(1);
	}
}
.chip[data-pop] .icon {
	animation: reaction-pop 260ms cubic-bezier(0.2, 0.8, 0.2, 1.2);
}

/* Count: a new number slides up into place. */
@keyframes count-in {
	from {
		opacity: 0;
		transform: translateY(5px);
	}
	to {
		opacity: 1;
		transform: translateY(0);
	}
}
.count {
	animation: count-in 180ms ease-out;
}

@media (prefers-reduced-motion: reduce) {
	.inner,
	.chip[data-pop] .icon,
	.count {
		animation: none;
		transition: none;
		transform: none;
	}
}
```

- Existing `.chip` keeps its background / border transition (120 ms). `.icon` gets `transition: color 120ms ease; transform-origin: center;`.
- Read-only chips (`.readOnlyChip`) get nothing.

### `src/modules/qa/agent/rankings/components/RankingDetailDrawer.tsx`

No change: it renders `LeaderboardReactions` with `size='md'`, so the same motion applies.

**Typecheck.** Prettier on the four `.tsx` and two `.css` files.

---

## Verification

1. `npm run typecheck` clean.
2. `grep -rn "<Progress" src/modules/qa/rankings src/modules/qa/agent/rankings` → only `RankingHeader.tsx`.
3. `grep -n "animation\|transition" src/modules/qa/agent/rankings/components/LeaderboardReactions.module.css` shows every motion rule and the `prefers-reduced-motion` block.
4. Code review: no inline styles added; `data-pop` is cleared on `animationend`; the count `key` changes only when the number changes.
