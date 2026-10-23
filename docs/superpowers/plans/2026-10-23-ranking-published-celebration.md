# Rankings: a celebration when a new ranking is published

> On execution: copy this file to `docs/superpowers/plans/2026-10-23-ranking-published-celebration.md`. `npm run typecheck` after each task. No dev server, no tests, no commit unless asked. Prettier on touched files only. Strings in `qa.rankings` en + es.

## Context

Publishing a new ranking is the one deliberate leadership act on the rankings page, and today it ends with a grey toast ("Ranking started — agents have been notified") and an immediate redirect (`RankingForm.tsx:283-289` → `onSaved` → `RankingEditorPage.backToRankings`). The user wants that moment acknowledged: a small modal with an encouraging message and an allegorical illustration with a minimal animation.

Decisions with the user (2026-10-23):

- **Trigger**: only the **first publish of a brand-new ranking** (created in the editor and published in the same save). Saving a draft, editing, re-publishing from the list, enabling the default: toast as today.
- **Illustration**: a **line-drawn bloom that opens once**, with **two small clapping hands** beneath it that clap twice.
- **Copy** (short): title "Your team has a new ranking", line "That's what leaders do: give people something to reach for.", button "See the ranking".

Decided by me: a centered Mantine `Modal` (`size='sm'`, no title bar, `radius='lg'`), one primary button, Esc / overlay also close; closing navigates to the new ranking's page. Inline SVG, single stroke weight, coloured by the primary colour (`--mantine-primary-color-filled` strokes, `--mantine-primary-color-light` fills) so it follows client theming and dark mode. Motion recipe from `src/components/AppTransitionOverlay/AppTransitionOverlay.module.css`: card rises in 300 ms, petals open with a stagger over ~700 ms, hands clap twice (~600 ms), nothing loops, everything off under `prefers-reduced-motion` (the bloom then renders open). The celebrated save skips the toast so the moment is not announced twice.

---

## Files

New:

- `src/modules/qa/rankings/components/RankingPublishedModal.tsx`
- `src/modules/qa/rankings/components/RankingPublishedModal.module.css`
- `src/modules/qa/rankings/components/BloomIllustration.tsx`

Modified:

- `src/modules/qa/rankings/components/RankingForm.tsx` (`onSaved` passes the saved program; no toast on a celebrated publish)
- `src/modules/qa/rankings/RankingEditorPage/RankingEditorPage.tsx` (opens the modal, navigates on close)
- `src/locales/{en,es}/qa.rankings.json`

---

## Task 1 · Illustration

### `BloomIllustration.tsx`

A pure SVG component, `viewBox='0 0 160 150'`, `width={160}`, `aria-hidden`, no text. Props: `className?: string`.

Structure (ids are class names from the CSS module passed in via `classNames` prop? Simpler: the component imports the same CSS module and applies classes itself):

```tsx
import styles from './RankingPublishedModal.module.css';

/** A flower that opens once, and two hands that clap beneath it. Strokes follow the primary colour. */
export function BloomIllustration() {
	return (
		<svg
			viewBox='0 0 160 150'
			width={160}
			height={150}
			aria-hidden='true'
			className={styles.art}
		>
			{/* stem */}
			<path d='M80 96 C80 84 80 72 80 60' className={styles.line} />
			{/* leaves */}
			<path
				d='M80 84 C70 84 62 78 60 70 C68 70 76 74 80 84 Z'
				className={styles.leaf}
			/>
			<path
				d='M80 78 C90 78 98 72 100 64 C92 64 84 68 80 78 Z'
				className={styles.leaf}
			/>
			{/* petals, drawn around the centre (80,52); each scales from the centre */}
			<g className={styles.petals}>
				<ellipse cx='80' cy='34' rx='9' ry='17' className={styles.petal} />
				<ellipse
					cx='80'
					cy='34'
					rx='9'
					ry='17'
					transform='rotate(60 80 52)'
					className={styles.petal}
				/>
				<ellipse
					cx='80'
					cy='34'
					rx='9'
					ry='17'
					transform='rotate(120 80 52)'
					className={styles.petal}
				/>
				<ellipse
					cx='80'
					cy='34'
					rx='9'
					ry='17'
					transform='rotate(180 80 52)'
					className={styles.petal}
				/>
				<ellipse
					cx='80'
					cy='34'
					rx='9'
					ry='17'
					transform='rotate(240 80 52)'
					className={styles.petal}
				/>
				<ellipse
					cx='80'
					cy='34'
					rx='9'
					ry='17'
					transform='rotate(300 80 52)'
					className={styles.petal}
				/>
			</g>
			<circle cx='80' cy='52' r='7' className={styles.core} />
			{/* hands: two mitten outlines facing each other, pivoting at the wrist */}
			<g className={styles.handLeft}>
				<path
					d='M44 136 L44 118 C44 108 56 106 60 112 L62 128 C62 134 56 138 50 138 Z'
					className={styles.hand}
				/>
			</g>
			<g className={styles.handRight}>
				<path
					d='M116 136 L116 118 C116 108 104 106 100 112 L98 128 C98 134 104 138 110 138 Z'
					className={styles.hand}
				/>
			</g>
		</svg>
	);
}
```

(The executor may tune the path numbers; the contract is: six petals around (80,52), a core, a stem, two leaves, two hands at the bottom corners pivoting from their wrists at x≈44 and x≈116, y≈136.)

### `RankingPublishedModal.module.css`

```css
/* The card rises once; the flower opens once; the hands clap twice. Nothing loops. */
.body {
	text-align: center;
	animation: rise-in 300ms ease-out;
}

.art {
	display: block;
	margin: 0 auto var(--mantine-spacing-md);
	overflow: visible;
}

.line,
.petal,
.hand,
.core {
	fill: var(--mantine-primary-color-light);
	stroke: var(--mantine-primary-color-filled);
	stroke-width: 2;
	stroke-linecap: round;
	stroke-linejoin: round;
}

.line {
	fill: none;
}

.leaf {
	fill: var(--mantine-primary-color-light);
	stroke: var(--mantine-primary-color-filled);
	stroke-width: 2;
}

.core {
	fill: var(--mantine-primary-color-filled);
}

/* Each petal grows out of the centre, one after the other. */
.petal {
	transform-box: fill-box;
	transform-origin: 50% 100%;
	animation: petal-open 520ms cubic-bezier(0.2, 0.8, 0.2, 1) both;
}
.petal:nth-child(1) {
	animation-delay: 80ms;
}
.petal:nth-child(2) {
	animation-delay: 140ms;
}
.petal:nth-child(3) {
	animation-delay: 200ms;
}
.petal:nth-child(4) {
	animation-delay: 260ms;
}
.petal:nth-child(5) {
	animation-delay: 320ms;
}
.petal:nth-child(6) {
	animation-delay: 380ms;
}

/* The hands pivot at the wrist and meet twice after the flower has opened. */
.handLeft,
.handRight {
	transform-box: fill-box;
	transform-origin: 50% 100%;
}
.handLeft {
	animation: clap-left 600ms ease-in-out 700ms both;
}
.handRight {
	animation: clap-right 600ms ease-in-out 700ms both;
}

@keyframes rise-in {
	from {
		opacity: 0;
		transform: translateY(14px);
	}
	to {
		opacity: 1;
		transform: translateY(0);
	}
}
@keyframes petal-open {
	from {
		transform: scale(0.2);
		opacity: 0;
	}
	to {
		transform: scale(1);
		opacity: 1;
	}
}
@keyframes clap-left {
	0%,
	100% {
		transform: rotate(-18deg);
	}
	25%,
	75% {
		transform: rotate(6deg);
	}
	50% {
		transform: rotate(-18deg);
	}
}
@keyframes clap-right {
	0%,
	100% {
		transform: rotate(18deg);
	}
	25%,
	75% {
		transform: rotate(-6deg);
	}
	50% {
		transform: rotate(18deg);
	}
}

@media (prefers-reduced-motion: reduce) {
	.body,
	.petal,
	.handLeft,
	.handRight {
		animation: none;
		transform: none;
		opacity: 1;
	}
}
```

---

## Task 2 · The modal and its trigger

### `RankingPublishedModal.tsx`

```tsx
import { Button, Modal, Stack, Text, Title } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import type { RankingProgram } from '~/models/qa/rankingPrograms';
import { BloomIllustration } from './BloomIllustration';
import styles from './RankingPublishedModal.module.css';

interface RankingPublishedModalProps {
	program: RankingProgram | null;
	/** Closing, by the button or otherwise, takes the manager to the ranking. */
	onClose: () => void;
}

/** A small moment after a new ranking goes live: a flower opens, two hands clap, one line of credit. */
export function RankingPublishedModal({
	program,
	onClose,
}: RankingPublishedModalProps) {
	const { t } = useTranslation('qa.rankings');
	return (
		<Modal
			opened={program !== null}
			onClose={onClose}
			size='sm'
			centered
			radius='lg'
			withCloseButton={false}
			aria-label={t('published.title')}
			overlayProps={{ backgroundOpacity: 0.45, blur: 2 }}
		>
			<Stack gap='sm' align='center' className={styles.body} py='md'>
				<BloomIllustration />
				<Title order={3}>{t('published.title')}</Title>
				<Text size='sm' c='dimmed' maw={300}>
					{t('published.line')}
				</Text>
				{program && (
					<Text size='xs' c='dimmed'>
						{t('published.detail', {
							name: program.name,
							count: program.teams.length,
						})}
					</Text>
				)}
				<Button mt='sm' onClick={onClose} data-autofocus>
					{t('published.cta')}
				</Button>
			</Stack>
		</Modal>
	);
}
export default RankingPublishedModal;
```

### `RankingForm.tsx`

- `onSaved: (status: RankingStatus, saved: RankingProgram) => void;` with the doc comment "Called after saving, with the status and the saved ranking."
- In `handleSave`: `const saved = program ? updateProgram(program.id, next) : createProgram(next);` then `if (!saved) return;`. The toast: `const celebrated = !program && status === 'active'; if (!celebrated) notifySuccess(status === 'active' && !isPublished ? t('editor.launched') : t('editor.saved'));` with the comment "A new ranking going live is celebrated by the editor page instead of a toast." Then `onSaved(status, saved)`.

### `RankingEditorPage.tsx`

- `import { useState } from 'react';` `import { RankingPublishedModal } from '../components/RankingPublishedModal';` `import { rankingPath } from '../constants';`
- `const [published, setPublished] = useState<RankingProgram | null>(null);`
- `onSaved={(status, saved) => { if (mode === 'create' && status === 'active') setPublished(saved); else backToRankings(status); }}`
- Render `<RankingPublishedModal program={published} onClose={() => { const target = published; setPublished(null); if (target) navigate(rankingPath(role, target.id)); }} />` after the form.
- Note: `createProgram` returns the reconciled program, so a scheduled one (future start) is also "published" and celebrated; its page shows "Starts …".

### Locale (`qa.rankings.json`, root `published`)

en:

```json
"published": {
	"title": "Your team has a new ranking",
	"line": "That's what leaders do: give people something to reach for.",
	"detail_one": "{{name}} is on for 1 team.",
	"detail_other": "{{name}} is on for {{count}} teams.",
	"cta": "See the ranking"
}
```

es: `"title": "Tu equipo tiene un nuevo ranking"`, `"line": "Eso hacen los líderes: dar a la gente algo por lo que esforzarse."`, `"detail_one": "{{name}} está activo para 1 equipo."`, `"detail_other": "{{name}} está activo para {{count}} equipos."`, `"cta": "Ver el ranking"`.

**Typecheck**, locale parity.

---

## Verification

1. `npm run typecheck` clean; en/es parity for `qa.rankings`.
2. Vite SSR load of `RankingEditorPage.tsx` and `RankingPublishedModal.tsx` (pattern of `load_check.mjs`) to catch import errors.
3. Code review: the modal opens only when `mode === 'create' && status === 'active'`; the toast is skipped only in that case; every colour in the CSS is a Mantine variable; the `prefers-reduced-motion` block covers the card, petals and hands; no inline styles.
