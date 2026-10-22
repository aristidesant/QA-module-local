# Call evaluation: anchored QA moments (jump, review, send to coaching)

## Goal

On the call detail page (`/qa/campaigns/:campaignId/calls/:callId`, file `src/views/Campaigns/pages/ConversationEvaluations.tsx`), every QA finding the AI identified is pre-anchored to the moment of the call where it happens. The reviewer (Supervisor / QA Manager) can:

1. See the moments as markers on the player timeline and in the transcript, and **jump** to any of them (player seeks, transcript highlights and scrolls, QA item card highlights).
2. **Confirm** or **dismiss** each AI moment (dismiss with a reason) and **add new moments** by flagging a transcript turn.
3. **Send the call to coaching**: schedule a session (call + non-dismissed moments pre-filled as evidence and talking points) or assign training material (moments quoted in the reason). The session detail then lists the moments with timestamps and opens the call at that second.

The player is a simulated one (timer-driven playhead), since the page is a mock with no audio. Scope is the **QA tab only**; other tabs keep their static `EvidenceQuote`.

Agent role: read-only. Agents see markers and can jump, but never see Confirm / Dismiss / Add moment / Send to coaching.

## Context

Today the page is 100% static: the player is a fixed 35% bar, the transcript is a list of `Paper`s with `m:ss` strings, and `QAItemResult.evidence` (`{ timestamp, speaker, quote }`) is shown by `EvidenceQuote` but is not clickable. Coaching sessions already pin `evidenceCallIds` but never a moment inside a call. This feature answers the client's "Call Evaluation" ask (edit what the AI found, listen efficiently) and becomes the starting point for Coaching.

## Decisions taken with the user

- QA tab only.
- Simulated playback (Play advances a playhead, active transcript turn highlights and auto-scrolls).
- Editing = Confirm / Dismiss (with reason) + Add a new moment. No moving of timestamps, no quote editing.
- Coaching hand-off = "Send to coaching" menu with **Schedule coaching session** and **Assign training material**. Session detail shows the moments.

## Global constraints

- DESIGN_ROLE.md: mockup only, no tests, no dev server, no commit unless the user asks.
- Code and comments in English. All new UI strings go through i18n (`qa.calls` namespace for the call page, `qa.coaching` for coaching screens), en + es.
- Dark/light: only Mantine CSS variables (`var(--mantine-color-*)`, `var(--mantine-primary-color-filled)`), `light-dark()` where needed. No hardcoded hex.
- Shared primitives: `SectionCard` (`~/components/SectionCard`), `AppDrawer` (`~/components/AppDrawer`). No Mantine `Drawer` directly.
- Stores are in-memory Zustand (`create<State>()((set, get) => ({...}))`), seeded from mock data, selectors return raw slices (never a new array per call).
- `npm run typecheck` must pass after every task.

## Existing things to reuse (verified paths)

| What                                    | Where                                                                                                                                                                                                                                 |
| --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Page                                    | `src/views/Campaigns/pages/ConversationEvaluations.tsx` (412 lines; player lines 241-325, transcript 328-372, QA panel mount line 380, dispute button 210-226)                                                                        |
| QA panel                                | `src/views/Campaigns/components/call-evaluation/QAEvaluationPanel.tsx` (`EvidenceQuote` at line 219-221, `Accordion defaultValue` at 144-148)                                                                                         |
| Evidence quote (keep for other tabs)    | `src/views/Campaigns/components/call-evaluation/EvidenceQuote.tsx`                                                                                                                                                                    |
| Types                                   | `src/views/Campaigns/types.ts`: `TranscriptTurn` 157-162, `Evidence` 164-168, `QAItemResult` 184-192, `CallEvaluationDetail` 379-394, `QAErrorTypeCode`, `Speaker`                                                                    |
| Mock call                               | `src/views/Campaigns/constants.ts:679` `mockCallEvaluationDetail` (callId `call-001`, agentName `Sarah Johnson`, 165 s, 12 turns `t1`..`t12`; QA evidence on `q3` @ `0:14` = turn `t3`, `q9` @ `1:48` = `t8`, `q10` @ `2:22` = `t11`) |
| `QA_ERROR_TYPES`, `QA_ERROR_TYPE_ORDER` | `src/views/Campaigns/constants.ts:394-421`                                                                                                                                                                                            |
| `formatDuration(seconds)`               | `src/views/Campaigns/components/call-evaluation/scoreColor.ts`                                                                                                                                                                        |
| Role                                    | `useRoleMockStore((s) => s.previewRole)` → `'agent' \| 'supervisor' \| 'qaManager' \| ...` (`src/constants/previewRole.ts`)                                                                                                           |
| Agent id of the mock agent              | `AGT-001` (`src/modules/qa/team/mockData.ts:115`, Sarah Johnson)                                                                                                                                                                      |
| Coaching session record                 | `src/models/qa/coaching.ts:176-219` `CoachingSessionRecord` (`evidenceCallIds`, `talkingPoints`)                                                                                                                                      |
| Session store                           | `src/stores/qa/coachingStore.ts:48-70` `ScheduleSessionInput`; `scheduleSession` impl builds the record field by field                                                                                                                |
| Session new page                        | `src/modules/qa/coaching/CoachingSessionPage/CoachingSessionPage.tsx:52-67` reads `agent`, `cohort`, `type`, `topic` query params into `SessionPreset`                                                                                |
| Session form                            | `src/modules/qa/coaching/components/SessionForm.tsx`: `SessionPreset` 47-54, reset effect 130-153 (`evidenceCallIds: []`, `setTalkingPoints([])`), submit 232-255, evidence chips 406-453                                             |
| Path helper                             | `src/modules/qa/coaching/constants.ts:151-160` `coachingSessionNewPath(role, { agent, cohort, type })`                                                                                                                                |
| Session detail evidence card            | `src/modules/qa/coaching/CoachingSessionDetailPage/CoachingSessionDetailPage.tsx:172-173` (`openCall`), 370-405 (evidence card)                                                                                                       |
| Agent session drawer evidence           | `src/modules/qa/coaching/components/AgentSessionDetailDrawer.tsx:138-157`                                                                                                                                                             |
| Assign drawer                           | `src/modules/qa/lms/components/AssignContentDrawer.tsx`: props `{ opened, onClose, role: TeamRole, preset?: AssignPreset, cohorts? }`, `AssignPreset { agentIds?, contentIds?, pathId?, cohortId?, reason?, ruleId? }`                |
| Notifications                           | `notifySuccess(message)` from `~/modules/qa/utils/notifications`                                                                                                                                                                      |
| Pointer class                           | `pointerStyles.pointer` from `~/modules/qa/lms/components/Cards.module.css`                                                                                                                                                           |
| Namespaces of the route                 | `src/modules/qa/qaNamespaces.ts:148` `'qa.campaigns.conversation': ['qa.disputes', 'qa.calls']` (so new page strings go in `qa.calls.json`)                                                                                           |

---

## Task 1 — Types, mock and moment helpers

### 1a. `src/views/Campaigns/types.ts`

Add `agentId` to `CallEvaluationDetail` (after `agentName`):

```ts
agentName: string;
/** Roster id of the agent, used to pre-fill coaching flows. */
agentId: string;
```

Append after the `Evidence` interface:

```ts
// ---------- Call moments (QA findings anchored to the call) ----------

export type CallMomentSource = 'ai' | 'reviewer';
export type CallMomentStatus = 'pending' | 'confirmed' | 'dismissed';

/** A QA finding pinned to the transcript turn where it happens. */
export interface CallMoment {
	id: string;
	callId: string;
	/** QA item the moment supports; null when the reviewer flagged a moment with no item. */
	itemId: string | null;
	/** Display name: the QA item name, or the reviewer note's first line. */
	itemName: string;
	errorType: QAErrorTypeCode;
	turnId: string;
	/** m:ss, same format as `TranscriptTurn.timestamp`. */
	timestamp: string;
	seconds: number;
	speaker: Speaker;
	quote: string;
	source: CallMomentSource;
	status: CallMomentStatus;
	/** Dismiss reason or reviewer note. */
	note: string;
}
```

(`QAErrorTypeCode` is declared later in the same file; TypeScript hoists type aliases, so the order is fine.)

### 1b. `src/views/Campaigns/constants.ts`

In `mockCallEvaluationDetail` add `agentId: 'AGT-001',` right after `agentName: 'Sarah Johnson',`.

### 1c. New `src/views/Campaigns/components/call-evaluation/callMoments.ts`

```ts
import type {
	CallEvaluationDetail,
	CallMoment,
	CallMomentStatus,
	TranscriptTurn,
} from '../../types';

/** "m:ss" → seconds. */
export const parseTimestamp = (mmss: string): number => {
	const [m, s] = mmss.split(':').map(Number);
	return (m || 0) * 60 + (s || 0);
};

export const turnSeconds = (turn: TranscriptTurn) =>
	parseTimestamp(turn.timestamp);

/** The turn playing at `seconds`: the last one that started at or before it. */
export const activeTurnAt = (
	turns: TranscriptTurn[],
	seconds: number
): TranscriptTurn | null => {
	let active: TranscriptTurn | null = null;
	for (const t of turns) {
		if (turnSeconds(t) <= seconds) active = t;
		else break;
	}
	return active;
};

/** Every QA item with evidence becomes one AI moment, anchored to the turn with the same timestamp (or the one playing then). */
export const buildAiMoments = (call: CallEvaluationDetail): CallMoment[] =>
	call.qa.aspects.flatMap((aspect) =>
		aspect.items.flatMap((item) => {
			if (!item.evidence) return [];
			const seconds = parseTimestamp(item.evidence.timestamp);
			const turn =
				call.transcript.find((t) => t.timestamp === item.evidence!.timestamp) ??
				activeTurnAt(call.transcript, seconds);
			return [
				{
					id: `m-${call.callId}-${item.id}`,
					callId: call.callId,
					itemId: item.id,
					itemName: item.name,
					errorType: item.errorType,
					turnId: turn?.id ?? '',
					timestamp: item.evidence.timestamp,
					seconds,
					speaker: item.evidence.speaker,
					quote: item.evidence.quote,
					source: 'ai' as const,
					status: 'pending' as const,
					note: '',
				},
			];
		})
	);

export const MOMENT_STATUS_COLOR: Record<CallMomentStatus, string> = {
	pending: 'yellow',
	confirmed: 'red',
	dismissed: 'gray',
};

/** Moments worth coaching on: everything the reviewer did not dismiss, in call order. */
export const coachableMoments = (moments: CallMoment[]) =>
	moments
		.filter((m) => m.status !== 'dismissed')
		.sort((a, b) => a.seconds - b.seconds);
```

### 1d. New store `src/stores/qa/callMomentsStore.ts`

```ts
import { create } from 'zustand';
import type {
	CallMoment,
	CallMomentStatus,
	QAErrorTypeCode,
	TranscriptTurn,
} from '~/views/Campaigns/types';
import { mockCallEvaluationDetail } from '~/views/Campaigns/constants';
import {
	buildAiMoments,
	turnSeconds,
} from '~/views/Campaigns/components/call-evaluation/callMoments';

let counter = 0;
const nextMomentId = () => `m-rev-${++counter}`;

export interface AddMomentInput {
	callId: string;
	turn: TranscriptTurn;
	itemId: string | null;
	itemName: string;
	errorType: QAErrorTypeCode;
	note: string;
}

interface CallMomentsState {
	/** Nothing is persisted; seeded from the mock call. */
	moments: CallMoment[];
	setStatus: (id: string, status: CallMomentStatus, note?: string) => void;
	addMoment: (input: AddMomentInput) => CallMoment;
	removeMoment: (id: string) => void;
}

export const useCallMomentsStore = create<CallMomentsState>()((set) => ({
	moments: buildAiMoments(mockCallEvaluationDetail),
	setStatus: (id, status, note) =>
		set((s) => ({
			moments: s.moments.map((m) =>
				m.id === id
					? { ...m, status, note: note ?? (status === 'pending' ? '' : m.note) }
					: m
			),
		})),
	addMoment: (input) => {
		const moment: CallMoment = {
			id: nextMomentId(),
			callId: input.callId,
			itemId: input.itemId,
			itemName: input.itemName,
			errorType: input.errorType,
			turnId: input.turn.id,
			timestamp: input.turn.timestamp,
			seconds: turnSeconds(input.turn),
			speaker: input.turn.speaker,
			quote: input.turn.text,
			source: 'reviewer',
			status: 'confirmed',
			note: input.note,
		};
		set((s) => ({ moments: [...s.moments, moment] }));
		return moment;
	},
	removeMoment: (id) =>
		set((s) => ({ moments: s.moments.filter((m) => m.id !== id) })),
}));

export const selectMoments = (s: CallMomentsState) => s.moments;
```

Consumers filter by `callId` inside a `useMemo` (never in the selector).

Typecheck.

---

## Task 2 — Locale strings

### `src/locales/en/qa.calls.json` — add a top-level `"moments"` block (after `"evaluationType"`):

```json
	"moments": {
		"title": "Key moments",
		"description": "Where the AI found each issue in the call. Confirm or dismiss them, then send the call to coaching.",
		"count_one": "{{count}} moment",
		"count_other": "{{count}} moments",
		"reviewed": "{{confirmed}} confirmed · {{dismissed}} dismissed",
		"empty": "No moments flagged in this call.",
		"jumpTo": "Jump to {{time}}",
		"playFrom": "Play from here",
		"flagTurn": "Flag this moment",
		"status": {
			"pending": "Pending review",
			"confirmed": "Confirmed",
			"dismissed": "Dismissed"
		},
		"source": {
			"ai": "AI",
			"reviewer": "Reviewer"
		},
		"confirm": "Confirm",
		"dismiss": "Dismiss",
		"undo": "Undo",
		"dismissReason": "Why is this not an issue?",
		"dismissReasonPlaceholder": "e.g. The agent asked a discovery question at 0:50.",
		"dismissSubmit": "Dismiss moment",
		"noItem": "Reviewer-flagged moment",
		"add": {
			"button": "Add moment",
			"title": "Flag a moment",
			"description": "Pick the transcript moment and describe what happened.",
			"turn": "Transcript moment",
			"item": "QA item",
			"itemNone": "Not tied to a QA item",
			"errorType": "Error type",
			"note": "What happened",
			"notePlaceholder": "Describe the issue or the missed opportunity (at least 10 characters).",
			"save": "Save moment",
			"success": "Moment added at {{time}}"
		},
		"coaching": {
			"button": "Send to coaching",
			"schedule": "Schedule coaching session",
			"assign": "Assign training material",
			"topic": "Call review {{callId}}",
			"reason": "From call {{callId}}: {{moments}}",
			"talkingPoint": "{{time}} · {{item}} — \"{{quote}}\""
		},
		"player": {
			"title": "Call Recording",
			"play": "Play",
			"pause": "Pause",
			"marker": "{{time}} · {{item}}"
		},
		"transcript": {
			"title": "Conversation Transcript",
			"turns_one": "{{count}} turn",
			"turns_other": "{{count}} turns",
			"agent": "Agent",
			"customer": "Customer"
		}
	},
```

### `src/locales/es/qa.calls.json` — same keys:

```json
	"moments": {
		"title": "Momentos clave",
		"description": "Dónde encontró la IA cada incidencia en la llamada. Confírmalos o descártalos y envía la llamada a coaching.",
		"count_one": "{{count}} momento",
		"count_other": "{{count}} momentos",
		"reviewed": "{{confirmed}} confirmados · {{dismissed}} descartados",
		"empty": "No hay momentos marcados en esta llamada.",
		"jumpTo": "Ir a {{time}}",
		"playFrom": "Reproducir desde aquí",
		"flagTurn": "Marcar este momento",
		"status": {
			"pending": "Pendiente de revisión",
			"confirmed": "Confirmado",
			"dismissed": "Descartado"
		},
		"source": {
			"ai": "IA",
			"reviewer": "Revisor"
		},
		"confirm": "Confirmar",
		"dismiss": "Descartar",
		"undo": "Deshacer",
		"dismissReason": "¿Por qué no es una incidencia?",
		"dismissReasonPlaceholder": "p. ej. El agente hizo una pregunta de descubrimiento en 0:50.",
		"dismissSubmit": "Descartar momento",
		"noItem": "Momento marcado por el revisor",
		"add": {
			"button": "Añadir momento",
			"title": "Marcar un momento",
			"description": "Elige el momento de la transcripción y describe qué ocurrió.",
			"turn": "Momento de la transcripción",
			"item": "Ítem de QA",
			"itemNone": "Sin ítem de QA asociado",
			"errorType": "Tipo de error",
			"note": "Qué ocurrió",
			"notePlaceholder": "Describe la incidencia o la oportunidad perdida (mínimo 10 caracteres).",
			"save": "Guardar momento",
			"success": "Momento añadido en {{time}}"
		},
		"coaching": {
			"button": "Enviar a coaching",
			"schedule": "Programar sesión de coaching",
			"assign": "Asignar material de formación",
			"topic": "Revisión de llamada {{callId}}",
			"reason": "De la llamada {{callId}}: {{moments}}",
			"talkingPoint": "{{time}} · {{item}} — \"{{quote}}\""
		},
		"player": {
			"title": "Grabación de la llamada",
			"play": "Reproducir",
			"pause": "Pausar",
			"marker": "{{time}} · {{item}}"
		},
		"transcript": {
			"title": "Transcripción de la conversación",
			"turns_one": "{{count}} turno",
			"turns_other": "{{count}} turnos",
			"agent": "Agente",
			"customer": "Cliente"
		}
	},
```

### `src/locales/{en,es}/qa.coaching.json` — under `sessions.detail` add:

- en: `"openMoment": "Open call at {{time}}"`, `"momentsPinned_one": "{{count}} moment pinned"`, `"momentsPinned_other": "{{count}} moments pinned"`
- es: `"openMoment": "Abrir llamada en {{time}}"`, `"momentsPinned_one": "{{count}} momento fijado"`, `"momentsPinned_other": "{{count}} momentos fijados"`

Under `sessions.editor` add:

- en: `"evidenceMoments": "Moments from the call"`
- es: `"evidenceMoments": "Momentos de la llamada"`

Validate both files parse and the key sets match (`node -e` check as in previous plans).

---

## Task 3 — `CallPlayer` (simulated player with markers)

New `src/views/Campaigns/components/call-evaluation/CallPlayer.tsx` + `CallPlayer.module.css`.

Props:

```ts
interface CallPlayerProps {
	durationSeconds: number;
	currentTime: number;
	isPlaying: boolean;
	onTogglePlay: () => void;
	onSeek: (seconds: number) => void;
	moments: CallMoment[];
	activeMomentId: string | null;
	onMomentClick: (moment: CallMoment) => void;
}
```

Render (a `Card padding='lg' radius='md' withBorder`, replacing lines 241-325 of the page):

1. Header `Group justify='space-between'`: `Text fw={600} size='sm'` `t('moments.player.title')` + `Badge size='sm' variant='light'` `formatDuration(durationSeconds)`.
2. Controls row `Group gap='sm' wrap='nowrap'`:
   - `Button variant='light' size='sm'` with `IconPlayerPause` / `IconPlayerPlay`, label `t('moments.player.pause'|'play')`, `onClick={onTogglePlay}`.
   - A `div className={styles.timeline}` (flex: 1, position: relative, padding-top 14px for the marker rail) containing:
     - `div className={styles.markerRail}` (position absolute, top 0, left/right 0, height 12px). For each moment: `Tooltip label={t('moments.player.marker', { time: m.timestamp, item: m.itemName })}` → `UnstyledButton className={styles.marker} data-status={m.status} data-active={m.id === activeMomentId || undefined} style={{ left: `${(m.seconds / durationSeconds) \* 100}%` }} onClick={() => onMomentClick(m)} aria-label=...`.
     - Mantine `Slider size='sm' value={currentTime} min={0} max={durationSeconds} step={1} onChange={onSeek} label={(v) => formatDuration(v)}`.
   - `Text size='xs' c='dimmed' style={{ whiteSpace: 'nowrap' }}` `{formatDuration(Math.floor(currentTime))} / {formatDuration(durationSeconds)}`.
3. Keep the existing static volume row (IconVolume2 + 70% bar) below, unchanged markup, but move its hardcoded colors to CSS module classes `.volumeTrack` / `.volumeFill`.

`CallPlayer.module.css`:

```css
.timeline {
	position: relative;
	flex: 1;
	padding-top: 14px;
}
.markerRail {
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	height: 12px;
}
.marker {
	position: absolute;
	top: 0;
	width: 10px;
	height: 10px;
	border-radius: 50%;
	transform: translateX(-50%);
	border: 2px solid var(--mantine-color-body);
	background: var(--mantine-color-yellow-6);
}
.marker[data-status='confirmed'] {
	background: var(--mantine-color-red-6);
}
.marker[data-status='dismissed'] {
	background: var(--mantine-color-gray-5);
	opacity: 0.6;
}
.marker[data-active] {
	outline: 2px solid var(--mantine-primary-color-filled);
	outline-offset: 1px;
}
.marker:focus-visible {
	outline: 2px solid var(--mantine-primary-color-filled);
	outline-offset: 2px;
}
.volumeTrack {
	flex: 1;
	height: 4px;
	border-radius: 2px;
	background: var(--mantine-color-default-border);
}
.volumeFill {
	width: 70%;
	height: 100%;
	border-radius: 2px;
	background: var(--mantine-primary-color-filled);
}
```

---

## Task 4 — `CallTranscript` (active turn, markers, flag)

New `src/views/Campaigns/components/call-evaluation/CallTranscript.tsx` + `CallTranscript.module.css`.

Props:

```ts
interface CallTranscriptProps {
	turns: TranscriptTurn[];
	activeTurnId: string | null;
	moments: CallMoment[];
	activeMomentId: string | null;
	canReview: boolean;
	onSeek: (seconds: number) => void;
	onMomentClick: (moment: CallMoment) => void;
	onFlagTurn: (turn: TranscriptTurn) => void;
}
```

Render (a `Card padding='lg' radius='md' withBorder`, replacing lines 328-372):

1. Header: `t('moments.transcript.title')` + `Badge` `t('moments.transcript.turns', { count: turns.length })`.
2. `ScrollArea h={420} viewportRef={viewportRef}` → `Stack gap='xs' pr='md'` → one `Paper` per turn:
   - `key={turn.id}`, `ref` stored in a `useRef<Map<string, HTMLDivElement>>`, `className={styles.turn}`, `data-speaker={turn.speaker}`, `data-active={turn.id === activeTurnId || undefined}`, `radius='sm' p='xs'`.
   - Header `Group justify='space-between' gap={6} mb={4} wrap='nowrap'`:
     - left: `ThemeIcon size='xs' variant='transparent'` with `IconHeadset`/`IconUser`, `Text size='xs' c='dimmed'` `{t(agent|customer)} · {turn.timestamp}`.
     - right `Group gap={4} wrap='nowrap'`: for each moment of this turn (`moments.filter(m => m.turnId === turn.id)`): `Badge size='xs' variant='light' color={MOMENT_STATUS_COLOR[m.status]} className={pointerStyles.pointer} onClick={() => onMomentClick(m)}` label `m.errorType`; then `Tooltip label={t('moments.playFrom')}` → `ActionIcon size='xs' variant='subtle' onClick={() => onSeek(turnSeconds(turn))}` `IconPlayerPlay size={12}`; when `canReview`: `Tooltip label={t('moments.flagTurn')}` → `ActionIcon size='xs' variant='subtle' color='gray' onClick={() => onFlagTurn(turn)}` `IconFlag size={12}`.
   - `Text size='sm'>{turn.text}`.
3. Effect: when `activeTurnId` changes, `turnRefs.current.get(activeTurnId)?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })`.

`CallTranscript.module.css`:

```css
.turn {
	border-left: 3px solid transparent;
	background: var(--mantine-color-gray-light);
	transition: border-color 120ms ease;
}
.turn[data-speaker='agent'] {
	background: var(--mantine-color-blue-light);
}
.turn[data-active] {
	border-left-color: var(--mantine-primary-color-filled);
	box-shadow: inset 0 0 0 1px var(--mantine-primary-color-light-hover);
}
```

---

## Task 5 — `MomentCard` and `AddMomentDrawer`

### 5a. New `src/views/Campaigns/components/call-evaluation/MomentCard.tsx`

Replaces `EvidenceQuote` **for QA items only**. Props:

```ts
interface MomentCardProps {
	moment: CallMoment;
	active: boolean;
	canReview: boolean;
	onJump: (moment: CallMoment) => void;
	onSetStatus: (id: string, status: CallMomentStatus, note?: string) => void;
	/** Reviewer-added moments can be removed by the reviewer. */
	onRemove?: (id: string) => void;
}
```

Render `Paper withBorder radius='sm' p='xs' id={`moment-${moment.id}`} className={styles.card} data-active={active || undefined} data-status={moment.status}`:

- Header `Group justify='space-between' gap='xs' wrap='wrap' mb='xs'`:
  - left `Group gap='xs'`: speaker `Badge size='xs' variant='light' color={agent ? 'blue' : 'gray'}`; `Group gap={4}` `IconClock size={12}` + `Text size='xs' c='dimmed'` timestamp; `Badge size='xs' variant='outline' color='gray'` `t('moments.source.' + moment.source)`.
  - right: status `Badge size='xs' variant='light' color={MOMENT_STATUS_COLOR[moment.status]}` `t('moments.status.' + moment.status)`.
- `Text size='sm' fs='italic'` `"{moment.quote}"`. When `moment.itemId === null`: show `Text size='xs' fw={500}` `moment.itemName` above the quote.
- When `moment.note`: `Text size='xs' c='dimmed' mt={4}` `moment.note`.
- Footer `Group gap='xs' mt='xs'`:
  - `Button size='xs' variant='light' leftSection={<IconPlayerPlay size={12} />} onClick={() => onJump(moment)}` `t('moments.jumpTo', { time: moment.timestamp })`.
  - `canReview && moment.status === 'pending'`: `Button size='xs' variant='subtle' color='green' leftSection={<IconCheck size={12} />}` → `onSetStatus(moment.id, 'confirmed')`; and a `Popover width={300} trapFocus withinPortal` whose target is `Button size='xs' variant='subtle' color='gray' leftSection={<IconX size={12} />}` `t('moments.dismiss')` and whose dropdown is `Stack gap='xs'`: `Textarea label={t('moments.dismissReason')} placeholder=... autosize minRows={2} value={reason}`; `Button size='xs' color='gray' disabled={reason.trim().length < 5}` `t('moments.dismissSubmit')` → `onSetStatus(moment.id, 'dismissed', reason.trim())`, close popover.
  - `canReview && moment.status !== 'pending' && moment.source === 'ai'`: `Button size='xs' variant='subtle' color='gray'` `t('moments.undo')` → `onSetStatus(moment.id, 'pending', '')`.
  - `canReview && moment.source === 'reviewer' && onRemove`: `Button size='xs' variant='subtle' color='red'` `t('moments.undo')` → `onRemove(moment.id)`.

`MomentCard.module.css`:

```css
.card {
	background: var(--mantine-color-gray-light);
	scroll-margin-top: 96px;
}
.card[data-status='dismissed'] {
	opacity: 0.6;
}
.card[data-active] {
	border-color: var(--mantine-primary-color-filled);
	box-shadow: 0 0 0 1px var(--mantine-primary-color-filled);
}
```

### 5b. New `src/views/Campaigns/components/call-evaluation/AddMomentDrawer.tsx`

`AppDrawer` (check its props in `src/components/AppDrawer`; follow `OpenDisputeDrawer.tsx` for the exact prop names — title, opened, onClose, footer/actions pattern). Props:

```ts
interface AddMomentDrawerProps {
	opened: boolean;
	onClose: () => void;
	turns: TranscriptTurn[];
	/** Pre-selected turn when opened from the transcript flag icon. */
	initialTurnId: string | null;
	/** Flattened QA items: `{ id, name, errorType, aspectName }`. */
	items: {
		id: string;
		name: string;
		errorType: QAErrorTypeCode;
		aspectName: string;
	}[];
	onSave: (input: {
		turn: TranscriptTurn;
		itemId: string | null;
		itemName: string;
		errorType: QAErrorTypeCode;
		note: string;
	}) => void;
}
```

Form (`useForm` from `@mantine/form`, reset in an effect on `[opened, initialTurnId]`):

- `Select label={t('moments.add.turn')} searchable required` data = turns → `{ value: t.id, label: `${t.timestamp} · ${t.speaker === 'agent' ? agentLabel : customerLabel} · ${t.text.slice(0, 70)}${t.text.length > 70 ? '…' : ''}` }`.
- `Select label={t('moments.add.item')} clearable searchable` data = `[{ value: '', label: t('moments.add.itemNone') }, ...items.map(i => ({ value: i.id, label: `${i.errorType} · ${i.name}`, group: i.aspectName }))]` (use Mantine grouped data `{ group, items }` if the project's Mantine version requires it; check an existing grouped `Select` in `src/` first, otherwise flat labels with the aspect name prefixed).
- `Select label={t('moments.add.errorType')} required` data = `QA_ERROR_TYPE_ORDER.map(code => ({ value: code, label: `${code} · ${QA_ERROR_TYPES[code].shortLabel}` }))`. When an item is picked, set errorType to the item's errorType automatically.
- `Textarea label={t('moments.add.note')} placeholder=... required autosize minRows={3}`; validation: at least 10 characters.
- Footer: Cancel (`variant='default'`) + `Button leftSection={<IconFlag size={14} />}` `t('moments.add.save')`.
- On save: resolve the turn, item name (`item?.name ?? t('moments.noItem')`), call `onSave`, close.

Typecheck.

---

## Task 6 — `QAEvaluationPanel` changes

File `src/views/Campaigns/components/call-evaluation/QAEvaluationPanel.tsx`.

New props:

```ts
interface QAEvaluationPanelProps {
	qa: CallQAEvaluation;
	moments: CallMoment[];
	activeMomentId: string | null;
	canReview: boolean;
	onJump: (moment: CallMoment) => void;
	onSetStatus: (id: string, status: CallMomentStatus, note?: string) => void;
	onRemoveMoment: (id: string) => void;
	onAddMoment: () => void;
}
```

Changes:

1. `useTranslation('qa.calls')` for the new strings (existing hardcoded English in this panel stays as is — out of scope).
2. **Key moments section** inserted between the ring-score card and the "Error Types (COPC)" card:
   - `SectionCard title={t('moments.title')} description={t('moments.description')} headerActions={...}`. Header actions: `Badge size='sm' variant='light' color='gray'` `t('moments.count', { count: moments.length })`; when `canReview`: `Button size='xs' variant='default' leftSection={<IconFlag size={14} />} onClick={onAddMoment}` `t('moments.add.button')`.
   - Body `Stack gap='sm'`:
     - When `moments.length === 0`: `Text size='sm' c='dimmed'` `t('moments.empty')`.
     - Chips row `Group gap='xs' wrap='wrap'`: sorted by `seconds`, each `Badge size='lg' tt='none' variant={active ? 'filled' : 'light'} color={MOMENT_STATUS_COLOR[m.status]} leftSection={<IconPlayerPlay size={12} />} className={pointerStyles.pointer} onClick={() => onJump(m)}` label `${m.timestamp} · ${m.errorType}`.
     - `Text size='xs' c='dimmed'` `t('moments.reviewed', { confirmed, dismissed })`.
     - Reviewer-added moments with `itemId === null` (they have no item card to live under): `Stack gap='xs'` of `MomentCard` with `onRemove={onRemoveMoment}`.
3. **Aspects accordion**: make it controlled. `const [expanded, setExpanded] = useState<string[]>(defaultExpandedAspects)`; `<Accordion value={expanded} onChange={setExpanded} ...>`. Effect on `activeMomentId`: find the moment → its item → its aspect id; add the aspect to `expanded` if missing; then after a `requestAnimationFrame`, `document.getElementById(`moment-${activeMomentId}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })`.
4. **Item cards**: replace lines 219-221 (`{item.evidence && <EvidenceQuote .../>}`) with: `const itemMoments = moments.filter(m => m.itemId === item.id)`; render one `MomentCard` per moment (`active={m.id === activeMomentId}`, `canReview`, `onJump`, `onSetStatus`, `onRemove={m.source === 'reviewer' ? onRemoveMoment : undefined}`). If the item has `evidence` but no moment (cannot happen with the seed, but keep safe) fall back to `EvidenceQuote`. Keep `mb={item.evidence ? 'xs' : 0}` logic but base it on `itemMoments.length > 0 || item.evidence`.

Remove the now-unused `EvidenceQuote` import only if it is no longer referenced in this file.

Typecheck.

---

## Task 7 — Page wiring (`ConversationEvaluations.tsx`)

File `src/views/Campaigns/pages/ConversationEvaluations.tsx`.

### State and derived values (replace `isPlaying` state at line 69)

```ts
const [searchParams] = useSearchParams(); // from 'react-router'
const initialT = Number(searchParams.get('t'));
const [currentTime, setCurrentTime] = useState(
	Number.isFinite(initialT) && initialT > 0 ? initialT : 0
);
const [isPlaying, setIsPlaying] = useState(false);
const [activeMomentId, setActiveMomentId] = useState<string | null>(null);
const [addMomentTurnId, setAddMomentTurnId] = useState<string | null>(null);
const [addMomentOpen, setAddMomentOpen] = useState(false);
const [assignOpen, setAssignOpen] = useState(false);

const allMoments = useCallMomentsStore(selectMoments);
const { setStatus, addMoment, removeMoment } = useCallMomentsStore.getState(); // or select the three actions
const moments = useMemo(
	() => allMoments.filter((m) => m.callId === call.callId),
	[allMoments, call.callId]
);
const activeTurn = useMemo(
	() => activeTurnAt(call.transcript, currentTime),
	[call.transcript, currentTime]
);

const canReview = previewRole !== 'agent';
const coachingRole: TeamRole =
	previewRole === 'qaManager' ? 'qa-manager' : 'supervisor';
```

On mount, if `initialT > 0`, set `activeMomentId` to the moment whose `seconds === initialT` (if any).

### Simulated playback

```ts
useEffect(() => {
	if (!isPlaying) return;
	const id = window.setInterval(() => {
		setCurrentTime((t) => {
			if (t + 0.25 >= call.durationSeconds) {
				setIsPlaying(false);
				return call.durationSeconds;
			}
			return t + 0.25;
		});
	}, 250);
	return () => window.clearInterval(id);
}, [isPlaying, call.durationSeconds]);
```

### Handlers

```ts
const seek = (seconds: number) => {
	setCurrentTime(seconds);
	setActiveMomentId(null);
};
const jumpToMoment = (m: CallMoment) => {
	setCurrentTime(m.seconds);
	setActiveMomentId(m.id);
	if (selectedTab !== 'qa') setSelectedTab('qa');
};
const flagTurn = (turn: TranscriptTurn) => {
	setAddMomentTurnId(turn.id);
	setAddMomentOpen(true);
};
const openAddMoment = () => {
	setAddMomentTurnId(activeTurn?.id ?? null);
	setAddMomentOpen(true);
};
```

### Send to coaching (header, non-agent roles)

In the header `Group` where the agent's dispute button sits (line 210-226), add for `canReview`:

```tsx
<Menu position='bottom-end' withinPortal>
	<Menu.Target>
		<Button
			variant='light'
			leftSection={<IconSchool size={16} />}
			rightSection={<IconChevronDown size={14} />}
		>
			{t('moments.coaching.button', { ns: 'qa.calls' })}
		</Button>
	</Menu.Target>
	<Menu.Dropdown>
		<Menu.Item
			leftSection={<IconCalendarEvent size={14} />}
			onClick={scheduleFromCall}
		>
			{t('moments.coaching.schedule', { ns: 'qa.calls' })}
		</Menu.Item>
		<Menu.Item
			leftSection={<IconBook size={14} />}
			onClick={() => setAssignOpen(true)}
		>
			{t('moments.coaching.assign', { ns: 'qa.calls' })}
		</Menu.Item>
	</Menu.Dropdown>
</Menu>
```

```ts
const scheduleFromCall = () =>
	navigate(
		coachingSessionNewPath(coachingRole, {
			agent: call.agentId,
			call: call.callId,
			topic: t('moments.coaching.topic', {
				ns: 'qa.calls',
				callId: call.callId,
			}),
		})
	);

const assignReason = t('moments.coaching.reason', {
	ns: 'qa.calls',
	callId: call.callId,
	moments: coachableMoments(moments)
		.map((m) => `${m.timestamp} ${m.itemName}`)
		.join('; '),
});
```

Mount at the bottom next to `OpenDisputeDrawer`:

```tsx
<AddMomentDrawer
	opened={addMomentOpen}
	onClose={() => setAddMomentOpen(false)}
	turns={call.transcript}
	initialTurnId={addMomentTurnId}
	items={call.qa.aspects.flatMap((a) => a.items.map((i) => ({ id: i.id, name: i.name, errorType: i.errorType, aspectName: a.name })))}
	onSave={(input) => {
		const m = addMoment({ callId: call.callId, ...input });
		notifySuccess(t('moments.add.success', { ns: 'qa.calls', time: m.timestamp }));
		setActiveMomentId(m.id);
		setCurrentTime(m.seconds);
	}}
/>
<AssignContentDrawer
	opened={assignOpen}
	onClose={() => setAssignOpen(false)}
	role={coachingRole}
	preset={{ agentIds: [call.agentId], reason: assignReason }}
/>
```

### Replace the left column

Lines 241-325 → `<CallPlayer durationSeconds={call.durationSeconds} currentTime={currentTime} isPlaying={isPlaying} onTogglePlay={() => setIsPlaying((p) => !p)} onSeek={seek} moments={moments} activeMomentId={activeMomentId} onMomentClick={jumpToMoment} />`.

Lines 328-372 → `<CallTranscript turns={call.transcript} activeTurnId={activeTurn?.id ?? null} moments={moments} activeMomentId={activeMomentId} canReview={canReview} onSeek={seek} onMomentClick={jumpToMoment} onFlagTurn={flagTurn} />`.

### QA panel mount (line 380)

```tsx
<QAEvaluationPanel
	qa={call.qa}
	moments={moments}
	activeMomentId={activeMomentId}
	canReview={canReview}
	onJump={jumpToMoment}
	onSetStatus={setStatus}
	onRemoveMoment={removeMoment}
	onAddMoment={openAddMoment}
/>
```

Imports to add: `Menu`, `useMemo`, `useEffect`, `useSearchParams`, `IconSchool`, `IconChevronDown`, `IconCalendarEvent`, `IconBook`, `CallPlayer`, `CallTranscript`, `AddMomentDrawer`, `AssignContentDrawer`, `useCallMomentsStore`/`selectMoments`, `activeTurnAt`/`coachableMoments`, `coachingSessionNewPath`, `notifySuccess`, types `CallMoment`, `TranscriptTurn`, `TeamRole`. Remove now-unused `IconPlayerPause`, `IconPlayerPlay`, `IconVolume2`, `IconHeadset`, `IconUser`, `Paper`, `ScrollArea`, `ThemeIcon` if nothing else in the file uses them.

Typecheck.

---

## Task 8 — Coaching hand-off (session preset, record, detail)

### 8a. `src/models/qa/coaching.ts`

Add before `CoachingSessionRecord`:

```ts
/** A moment of a call pinned as evidence: opens the call at that second. */
export interface CoachingEvidenceMoment {
	callId: string;
	momentId: string;
	timestamp: string;
	seconds: number;
	itemName: string;
	quote: string;
}
```

Add to `CoachingSessionRecord` after `evidenceCallIds`:

```ts
	/** Moments inside the evidence calls, when the session was started from a call review. */
	evidenceMoments?: CoachingEvidenceMoment[];
```

### 8b. `src/stores/qa/coachingStore.ts`

- `ScheduleSessionInput`: add `evidenceMoments?: CoachingEvidenceMoment[];` after `evidenceCallIds`.
- `scheduleSession` impl: add `evidenceMoments: input.evidenceMoments ?? [],` after `evidenceCallIds: input.evidenceCallIds,`.

### 8c. `src/modules/qa/coaching/constants.ts`

Extend the preset type of `coachingSessionNewPath` to `{ agent?: string; cohort?: string; type?: string; topic?: string; call?: string }` and update the doc comment to list `topic`, `call`.

### 8d. `src/modules/qa/coaching/components/SessionForm.tsx`

- `SessionPreset`: add `evidenceCallIds?: string[]; evidenceMoments?: CoachingEvidenceMoment[]; talkingPoints?: string[];`.
- Reset effect (130-153): `evidenceCallIds: preset?.evidenceCallIds ?? []`, `setTalkingPoints(preset?.talkingPoints ?? [])`.
- Evidence section (406-453): below the call chips, when `preset?.evidenceMoments?.length`, render `Text size='xs' fw={500} mt='xs'` `t('sessions.editor.evidenceMoments')` and a `Stack gap={4}` of `Text size='xs' c='dimmed'` rows `• {m.timestamp} · {m.itemName}` for moments whose `callId` is still in `form.values.evidenceCallIds`.
- Submit (232-255): add `evidenceMoments: (preset?.evidenceMoments ?? []).filter((m) => form.values.evidenceCallIds.includes(m.callId)),`.

### 8e. `src/modules/qa/coaching/CoachingSessionPage/CoachingSessionPage.tsx`

- Read `const callParam = searchParams.get('call');`.
- `const allMoments = useCallMomentsStore(selectMoments);`
- In the `preset` memo add:

```ts
evidenceCallIds: callParam ? [callParam] : undefined,
evidenceMoments: callParam
	? coachableMoments(allMoments.filter((m) => m.callId === callParam)).map((m) => ({
			callId: m.callId, momentId: m.id, timestamp: m.timestamp, seconds: m.seconds, itemName: m.itemName, quote: m.quote,
		}))
	: undefined,
talkingPoints: callParam
	? coachableMoments(allMoments.filter((m) => m.callId === callParam)).map((m) =>
			t('moments.coaching.talkingPoint', { ns: 'qa.calls', time: m.timestamp, item: m.itemName, quote: m.quote }))
	: undefined,
```

with `callParam` and `allMoments` in the deps. Add `'qa.calls'` to the `useTranslation` namespaces of this page if not already loaded (the coaching routes already load `qa.calls` per `qaNamespaces.ts`; verify, otherwise add it to the route's list).

### 8f. `CoachingSessionDetailPage.tsx` evidence card (370-405)

Under each call badge row, when `session.evidenceMoments?.some((m) => m.callId === callId)`, render `Stack gap={4} pl='md'`:

```tsx
{
	session.evidenceMoments
		.filter((m) => m.callId === callId)
		.map((m) => (
			<Group key={m.momentId} gap='xs' wrap='nowrap'>
				<Badge
					size='xs'
					variant='light'
					leftSection={<IconClock size={10} />}
					className={pointerStyles.pointer}
					onClick={() =>
						navigate(`/qa/campaigns/1/calls/${callId}?t=${m.seconds}`)
					}
				>
					{m.timestamp}
				</Badge>
				<Text size='xs'>{m.itemName}</Text>
				<Text size='xs' c='dimmed' lineClamp={1} fs='italic'>
					"{m.quote}"
				</Text>
			</Group>
		));
}
```

Add a `Tooltip label={t('sessions.detail.openMoment', { time: m.timestamp })}` around the badge. Add the count `t('sessions.detail.momentsPinned', { count })` as a dimmed text next to the card title when moments exist.

### 8g. `AgentSessionDetailDrawer.tsx` (138-157)

Same moments list under the badges, navigating to `/qa/campaigns/2/calls/${callId}?t=${m.seconds}` (keeps that file's existing campaign id).

Typecheck.

---

## Verification

1. `npm run typecheck` passes after every task.
2. `node -e` JSON parse of the four locale files; en/es key sets of `qa.calls.moments` and `qa.coaching.sessions.{detail,editor}` match.
3. Grep sanity: `grep -rn "EvidenceQuote" src/views/Campaigns/components/call-evaluation/QAEvaluationPanel.tsx` (only the fallback use or none); `grep -rn "coachingSessionNewPath(" src` all call sites still compile with the widened preset type.
4. No dev server, no visual run, no commit (DESIGN_ROLE).

## Out of scope (do not build)

- Anchoring compliance / business / sentiment findings.
- Real audio, waveform, backend `CallMarker` queries.
- Translating the pre-existing hardcoded English of `QAEvaluationPanel` / page header.
