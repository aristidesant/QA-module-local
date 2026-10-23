# Enmascarado automático de datos sensibles en las llamadas

> Al ejecutar: copiar este plan a `docs/superpowers/plans/2026-10-22-enmascarado-datos-sensibles.md` y seguir las tareas en orden. `npm run typecheck` al final de cada tarea. Sin dev server, sin tests, sin commit salvo que el usuario lo pida. Código y comentarios en inglés; textos de UI en inglés dentro de `views/Campaigns/components/call-evaluation` (convención del área) y en en/es donde ya hay namespaces.

## Contexto

Pedido del usuario: "Enmascara la redacción: automatically mask sensitive call data, transcripts, and screen recordings to protect privacy and comply with regulations", aclarado después como **cualquier dato sensible de la llamada, sin importar la pestaña de evaluación en la que esté el usuario**.

Hoy nada se enmascara. En Global configuration (Super Admin) hay un interruptor "Redact personal data" con una lista de campos que **no está conectado a ninguna pantalla** (`src/modules/qa/global-config/tabs/CallAnalysisTab.tsx:105-125`, `types.ts:9-10`, `seed.ts:29-30`, `constants.ts:78`). La transcripción de ejemplo (`src/views/Campaigns/constants.ts:707-780`) no contiene datos sensibles, así que no hay nada que mostrar.

Decisiones tomadas con el usuario:

- **Revelar**: solo QA Manager y Super Admin, siempre con motivo, y queda registrado.
- **Qué se enmascara**: tarjetas y cuentas bancarias; documentos de identidad; contacto y ubicación; credenciales y datos personales (PIN, contraseñas, códigos, fecha de nacimiento).
- **Dónde se configura**: pestaña nueva **Privacy** en Settings (QA Manager). El interruptor de Global configuration se **reemplaza por un aviso** que apunta a Settings.
- **Alcance**: también coaching y disputas, y ahí **nunca se revela**. Solo se revela en el detalle de la llamada.

Resultado esperado: en toda pantalla que muestre texto de una llamada (transcript, citas de evidencia, momentos, anchors, puntos de conversación de coaching, disputas) los datos sensibles aparecen como un chip gris con candado y una vista parcial (`Card •••• 1234`). El player marca los tramos de audio silenciados. Un QA Manager puede revelar los datos en el detalle de la llamada durante N minutos con un motivo, y la pestaña Privacy muestra el registro.

Fuera de alcance: teléfono y correo del perfil del cliente (`modules/qa/customers`, no es contenido de llamada), campos editables de las disputas (`DecisionRow.tsx`), transcripciones de la API real (`modules/conversations`, `qa/campaigns/.../AudioPlayerBar.tsx`), grabaciones de pantalla (no existen en el mock; el player las representa).

---

## Arquitectura

```
settingsStore.thresholds.privacy (PrivacySettings)   ← Settings → Privacy
            │
            ▼
maskSegments(text, settings) / maskText(text, settings)   src/modules/qa/privacy/mask.ts   (puro)
            │
            ▼
useMasking(callId?)  ──  lee settings + privacyStore.reveals  ──▶ { active, revealed, segments(), mask() }
            │
            ├─ <MaskedText text callId? />  → transcript, EvidenceQuote, MomentCard, AnchorMoments, coaching
            ├─ mask(string)                 → AddMomentDrawer labels, DemoTranscript (disputas), talking points
            └─ PrivacyBanner + RevealDrawer → detalle de la llamada (revelar / ocultar)

privacyStore (zustand): reveals por callId con expiración + log de revelados (seed de 3)
```

Regla de diseño: el texto **nunca se guarda enmascarado** (salvo los puntos de conversación de coaching, que se crean ya enmascarados porque ahí no se revela). El enmascarado ocurre al renderizar.

Color: el chip enmascarado es gris (el enmascarado no es una alerta). El estado **revelado** es el único rojo, porque es la situación que requiere cuidado.

---

## Archivos

Nuevos:

- `src/modules/qa/privacy/types.ts`
- `src/modules/qa/privacy/constants.ts`
- `src/modules/qa/privacy/mask.ts`
- `src/modules/qa/privacy/useMasking.ts`
- `src/modules/qa/privacy/components/MaskedSegments.tsx`
- `src/modules/qa/privacy/components/MaskedText.tsx`
- `src/modules/qa/privacy/components/MaskedSegments.module.css`
- `src/stores/qa/privacyStore.ts`
- `src/modules/qa/settings/SettingsPage/tabs/PrivacyTab.tsx`
- `src/views/Campaigns/components/call-evaluation/PrivacyBanner.tsx`
- `src/views/Campaigns/components/call-evaluation/RevealDrawer.tsx`

Modificados:

- `src/modules/qa/settings/types.ts`, `constants.ts`, `helpers.ts`, `SettingsPage/SettingsPage.tsx`
- `src/locales/{en,es}/qa.settings.json`, `qa.calls.json`, `qa.globalConfig.json`
- `src/modules/qa/global-config/tabs/CallAnalysisTab.tsx`, `types.ts`, `seed.ts`, `constants.ts`
- `src/views/Campaigns/constants.ts` (transcript y compliance de ejemplo)
- `src/views/Campaigns/components/call-evaluation/CallTranscript.tsx`, `CallPlayer.tsx`, `CallPlayer.module.css`, `EvidenceQuote.tsx`, `MomentCard.tsx`, `AnchorMoments.tsx`, `AddMomentDrawer.tsx`
- `src/views/Campaigns/pages/ConversationEvaluations.tsx`
- `src/modules/qa/disputes/cases/helpers.ts`, `DisputeCaseDetailPage/DisputeCaseDetailPage.tsx`
- `src/modules/qa/coaching/CoachingSessionPage/CoachingSessionPage.tsx`, `CoachingSessionDetailPage/CoachingSessionDetailPage.tsx`

---

## Tarea 1 · Modelo, constantes y motor de enmascarado

### `src/modules/qa/privacy/types.ts`

```ts
/** The groups a QA manager switches on or off. */
export type SensitiveCategory =
	| 'payment'
	| 'identity'
	| 'contact'
	| 'credentials';

/** What exactly was found; each kind belongs to one category. */
export type SensitiveKind =
	| 'card'
	| 'iban'
	| 'cvv'
	| 'expiry'
	| 'bankAccount'
	| 'nationalId'
	| 'ssn'
	| 'passport'
	| 'email'
	| 'phone'
	| 'address'
	| 'dob'
	| 'pin';

export interface SensitiveCategoryConfig {
	enabled: boolean;
	/** Digits left visible at the end, e.g. 4 for a card. 0 hides everything. */
	showLast: number;
}

export interface RevealPolicy {
	/** Whether a QA manager can reveal the data on the call detail at all. */
	allowed: boolean;
	/** How long the data stays visible after a reveal. */
	minutes: number;
	/** A free-text note is required besides the reason. */
	requireNote: boolean;
}

export interface PrivacySettings {
	enabled: boolean;
	categories: Record<SensitiveCategory, SensitiveCategoryConfig>;
	/** Mute the recording while the data is said. */
	muteAudio: boolean;
	reveal: RevealPolicy;
}

/** One span of sensitive data found in a text. */
export interface SensitiveHit {
	start: number;
	end: number;
	kind: SensitiveKind;
	category: SensitiveCategory;
	original: string;
	/** What is shown instead, e.g. "•••• 1234". */
	preview: string;
}

/** A text split into plain parts and masked parts, in order. */
export interface MaskSegment {
	text: string;
	hit?: SensitiveHit;
}

export type RevealReason =
	| 'disputeReview'
	| 'complianceInvestigation'
	| 'customerRequest'
	| 'fraudCheck'
	| 'other';

export interface RevealSession {
	callId: string;
	by: string;
	reason: RevealReason;
	note: string;
	at: string;
	expiresAt: string;
}

export interface RevealLogEntry extends RevealSession {
	id: string;
	/** Set when the reviewer hid the data before it expired. */
	hiddenAt?: string;
}
```

### `src/modules/qa/privacy/constants.ts`

```ts
import type {
	PrivacySettings,
	RevealReason,
	SensitiveCategory,
	SensitiveKind,
} from './types';

export const SENSITIVE_CATEGORIES: SensitiveCategory[] = [
	'payment',
	'identity',
	'contact',
	'credentials',
];

/** Kinds of each category, in the order Settings lists them. */
export const KINDS_BY_CATEGORY: Record<SensitiveCategory, SensitiveKind[]> = {
	payment: ['card', 'cvv', 'expiry', 'iban', 'bankAccount'],
	identity: ['nationalId', 'ssn', 'passport'],
	contact: ['phone', 'email', 'address'],
	credentials: ['pin', 'dob'],
};

/** Short label on the masked chip. English by the call-evaluation convention. */
export const KIND_LABEL: Record<SensitiveKind, string> = {
	card: 'Card',
	iban: 'IBAN',
	cvv: 'CVV',
	expiry: 'Expiry',
	bankAccount: 'Account',
	nationalId: 'ID',
	ssn: 'SSN',
	passport: 'Passport',
	email: 'Email',
	phone: 'Phone',
	address: 'Address',
	dob: 'Date of birth',
	pin: 'PIN / code',
};

export const REVEAL_REASONS: RevealReason[] = [
	'disputeReview',
	'complianceInvestigation',
	'customerRequest',
	'fraudCheck',
	'other',
];

export const REVEAL_MINUTES = { min: 5, max: 120 } as const;

export const DEFAULT_PRIVACY_SETTINGS: PrivacySettings = {
	enabled: true,
	categories: {
		payment: { enabled: true, showLast: 4 },
		identity: { enabled: true, showLast: 0 },
		contact: { enabled: true, showLast: 0 },
		credentials: { enabled: true, showLast: 0 },
	},
	muteAudio: true,
	reveal: { allowed: true, minutes: 15, requireNote: false },
};
```

### `src/modules/qa/privacy/mask.ts`

```ts
import { KIND_LABEL } from './constants';
import type {
	MaskSegment,
	PrivacySettings,
	SensitiveCategory,
	SensitiveHit,
	SensitiveKind,
} from './types';

interface Pattern {
	kind: SensitiveKind;
	category: SensitiveCategory;
	regex: RegExp;
}

/** Longer matches win over shorter ones that start at the same place (a date of birth over an expiry). */
const PATTERNS: Pattern[] = [
	{ kind: 'card', category: 'payment', regex: /\b(?:\d[ -]?){12}\d{1,7}\b/g },
	{
		kind: 'iban',
		category: 'payment',
		regex: /\b[A-Z]{2}\d{2}(?: ?[A-Z0-9]{4}){3,7}\b/g,
	},
	{
		kind: 'cvv',
		category: 'payment',
		regex: /\b(?:cvv|cvc|security code)\s*(?:is|:)?\s*\d{3,4}\b/gi,
	},
	{
		kind: 'expiry',
		category: 'payment',
		regex: /\b(?:0[1-9]|1[0-2])\/\d{2}\b/g,
	},
	{
		kind: 'bankAccount',
		category: 'payment',
		regex: /\b(?:account|acct)(?: number)?\s*(?:is|:)?\s*\d{8,14}\b/gi,
	},
	{ kind: 'nationalId', category: 'identity', regex: /\b\d{3}-\d{7}-\d\b/g },
	{ kind: 'ssn', category: 'identity', regex: /\b\d{3}-\d{2}-\d{4}\b/g },
	{
		kind: 'passport',
		category: 'identity',
		regex: /\bpassport\s*(?:number|no\.?)?\s*(?:is|:)?\s*[A-Z0-9]{6,9}\b/gi,
	},
	{
		kind: 'email',
		category: 'contact',
		regex: /[\w.+-]+@[\w-]+(?:\.[\w-]+)+/g,
	},
	{
		kind: 'phone',
		category: 'contact',
		regex: /(?:\+?\d{1,3}[ -])?\(?\d{3}\)?[ -]\d{3}[ -]\d{4}\b/g,
	},
	{
		kind: 'address',
		category: 'contact',
		regex:
			/\b\d{1,5} [A-Z][a-z]+(?: [A-Z][a-z]+)? (?:Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Calle|Avenida)\b\.?/g,
	},
	{
		kind: 'dob',
		category: 'credentials',
		regex: /\b(?:0[1-9]|[12]\d|3[01])\/(?:0[1-9]|1[0-2])\/(?:19|20)\d{2}\b/g,
	},
	{
		kind: 'pin',
		category: 'credentials',
		regex:
			/\b(?:pin|password|passcode|otp|verification code)\s*(?:is|:)?\s*\w{4,12}\b/gi,
	},
];

const previewOf = (original: string, showLast: number) => {
	const digits = original.replace(/\D/g, '');
	return showLast > 0 && digits.length > showLast
		? `•••• ${digits.slice(-showLast)}`
		: '••••';
};

/** Every sensitive span in a text under the given settings, without overlaps, in reading order. */
export const findSensitive = (
	text: string,
	settings: PrivacySettings
): SensitiveHit[] => {
	if (!settings.enabled) return [];
	const hits: SensitiveHit[] = [];
	for (const p of PATTERNS) {
		const config = settings.categories[p.category];
		if (!config.enabled) continue;
		for (const m of text.matchAll(p.regex)) {
			const start = m.index ?? 0;
			hits.push({
				start,
				end: start + m[0].length,
				kind: p.kind,
				category: p.category,
				original: m[0],
				preview: previewOf(m[0], config.showLast),
			});
		}
	}
	hits.sort((a, b) => a.start - b.start || b.end - b.start - (a.end - a.start));
	const out: SensitiveHit[] = [];
	let cursor = 0;
	for (const h of hits) {
		if (h.start < cursor) continue;
		out.push(h);
		cursor = h.end;
	}
	return out;
};

/** The text split into plain and masked parts. */
export const maskSegments = (
	text: string,
	settings: PrivacySettings
): MaskSegment[] => {
	const hits = findSensitive(text, settings);
	if (hits.length === 0) return [{ text }];
	const out: MaskSegment[] = [];
	let cursor = 0;
	for (const hit of hits) {
		if (hit.start > cursor) out.push({ text: text.slice(cursor, hit.start) });
		out.push({ text: hit.original, hit });
		cursor = hit.end;
	}
	if (cursor < text.length) out.push({ text: text.slice(cursor) });
	return out;
};

/** Plain-string placeholder, for places that cannot render a chip. */
export const placeholderOf = (hit: SensitiveHit) =>
	`[${KIND_LABEL[hit.kind]} ${hit.preview}]`;

export const maskText = (text: string, settings: PrivacySettings): string =>
	maskSegments(text, settings)
		.map((s) => (s.hit ? placeholderOf(s.hit) : s.text))
		.join('');
```

**Typecheck.**

---

## Tarea 2 · Settings: tipo, defaults, validación y store de revelados

### `src/modules/qa/settings/types.ts`

- Importar `PrivacySettings` de `~/modules/qa/privacy/types`.
- `SettingsAspect`: añadir `| 'privacy'`.
- `ThresholdSettings`: añadir `privacy: PrivacySettings;`.

### `src/modules/qa/settings/constants.ts`

- Importar `DEFAULT_PRIVACY_SETTINGS` de `~/modules/qa/privacy/constants`.
- En `DEFAULT_SETTINGS.thresholds` añadir `privacy: DEFAULT_PRIVACY_SETTINGS,` después de `burnout`.

### `src/modules/qa/settings/helpers.ts` (añadir al final)

```ts
import { REVEAL_MINUTES } from '~/modules/qa/privacy/constants';
import type { PrivacySettings } from '~/modules/qa/privacy/types';

/** Error key under `qa.settings:privacy.errors`, or null. */
export const validatePrivacy = (p: PrivacySettings): string | null => {
	if (
		p.reveal.minutes < REVEAL_MINUTES.min ||
		p.reveal.minutes > REVEAL_MINUTES.max
	)
		return 'revealMinutes';
	if (Object.values(p.categories).some((c) => c.showLast < 0 || c.showLast > 4))
		return 'showLast';
	return null;
};
```

(`settingsStore.ts` es genérico sobre `SettingsAspect`; no cambia.)

### `src/stores/qa/privacyStore.ts`

```ts
import { create } from 'zustand';
import type {
	RevealLogEntry,
	RevealReason,
	RevealSession,
} from '~/modules/qa/privacy/types';

let counter = 0;
const nextId = () => `rv-${++counter}`;
const minutesFromNow = (minutes: number, from = Date.now()) =>
	new Date(from + minutes * 60_000).toISOString();

/** Earlier reveals, so the log in Settings is not empty on first open. */
const SEED_LOG: RevealLogEntry[] = [
	{
		id: 'rv-seed-1',
		callId: 'call-014',
		by: 'Laura Méndez (QA Manager)',
		reason: 'disputeReview',
		note: 'Dispute DSP-2031: confirm the account number the agent read back.',
		at: '2026-10-20T14:02:00.000Z',
		expiresAt: '2026-10-20T14:17:00.000Z',
	},
	{
		id: 'rv-seed-2',
		callId: 'call-009',
		by: 'Laura Méndez (QA Manager)',
		reason: 'complianceInvestigation',
		note: '',
		at: '2026-10-17T09:40:00.000Z',
		expiresAt: '2026-10-17T09:55:00.000Z',
		hiddenAt: '2026-10-17T09:46:00.000Z',
	},
	{
		id: 'rv-seed-3',
		callId: 'call-003',
		by: 'Admin (Super Admin)',
		reason: 'fraudCheck',
		note: 'Card used on three accounts in one week.',
		at: '2026-10-11T16:15:00.000Z',
		expiresAt: '2026-10-11T16:30:00.000Z',
	},
];

export interface RevealInput {
	callId: string;
	by: string;
	reason: RevealReason;
	note: string;
	minutes: number;
}

interface PrivacyState {
	/** Active reveal per call. Nothing is persisted. */
	reveals: Record<string, RevealSession>;
	log: RevealLogEntry[];
	reveal: (input: RevealInput) => RevealSession;
	conceal: (callId: string) => void;
}

export const usePrivacyStore = create<PrivacyState>()((set) => ({
	reveals: {},
	log: SEED_LOG,
	reveal: ({ callId, by, reason, note, minutes }) => {
		const now = Date.now();
		const session: RevealSession = {
			callId,
			by,
			reason,
			note,
			at: new Date(now).toISOString(),
			expiresAt: minutesFromNow(minutes, now),
		};
		set((s) => ({
			reveals: { ...s.reveals, [callId]: session },
			log: [{ id: nextId(), ...session }, ...s.log],
		}));
		return session;
	},
	conceal: (callId) =>
		set((s) => {
			const session = s.reveals[callId];
			if (!session) return s;
			const { [callId]: _gone, ...rest } = s.reveals;
			const hiddenAt = new Date().toISOString();
			return {
				reveals: rest,
				log: s.log.map((e) =>
					e.callId === callId && e.at === session.at && !e.hiddenAt
						? { ...e, hiddenAt }
						: e
				),
			};
		}),
}));

export const selectReveals = (s: PrivacyState) => s.reveals;
export const selectRevealLog = (s: PrivacyState) => s.log;
```

(`_gone` sin usar: con `noUnusedLocals` el prefijo `_` no basta para desestructuraciones; si typecheck se queja, usar `const rest = { ...s.reveals }; delete rest[callId];`.)

**Typecheck.**

---

## Tarea 3 · Hook y componentes de texto enmascarado

### `src/modules/qa/privacy/useMasking.ts`

```ts
import { useEffect, useMemo, useState } from 'react';
import { selectThresholds, useSettingsStore } from '~/stores/qa/settingsStore';
import { selectReveals, usePrivacyStore } from '~/stores/qa/privacyStore';
import { maskSegments, maskText } from './mask';
import type { MaskSegment, PrivacySettings, RevealSession } from './types';

/**
 * What the current viewer sees of a call's text: masked, or the real data while a reveal
 * is active. Pass the callId only on the call detail; everywhere else the data is never revealed.
 */
export const useMasking = (callId?: string) => {
	const settings: PrivacySettings = useSettingsStore(selectThresholds).privacy;
	const reveals = usePrivacyStore(selectReveals);
	const conceal = usePrivacyStore((s) => s.conceal);
	const session: RevealSession | null = callId
		? (reveals[callId] ?? null)
		: null;
	// Re-render when the reveal runs out, so the data hides without a click.
	const [, setTick] = useState(0);
	useEffect(() => {
		if (!session || !callId) return;
		const left = Date.parse(session.expiresAt) - Date.now();
		if (left <= 0) {
			conceal(callId);
			return;
		}
		const timer = window.setTimeout(() => {
			conceal(callId);
			setTick((t) => t + 1);
		}, left);
		return () => window.clearTimeout(timer);
	}, [session, callId, conceal]);

	const revealed = !!session && Date.parse(session.expiresAt) > Date.now();
	const active = settings.enabled && !revealed;

	return useMemo(
		() => ({
			settings,
			active,
			revealed,
			session: revealed ? session : null,
			segments: (text: string): MaskSegment[] =>
				active ? maskSegments(text, settings) : [{ text }],
			mask: (text: string) => (active ? maskText(text, settings) : text),
		}),
		[settings, active, revealed, session]
	);
};
```

### `src/modules/qa/privacy/components/MaskedSegments.module.css`

```css
/* A masked span reads as a chip, not as text; grey because masking is the normal state. */
.chip {
	vertical-align: baseline;
	cursor: help;
}

/* Revealed data is the only red on the page: it is the state that needs care. */
.revealed {
	background: transparent;
	color: inherit;
	text-decoration: underline dotted var(--mantine-color-red-6);
	text-decoration-thickness: 2px;
	text-underline-offset: 3px;
}
```

### `src/modules/qa/privacy/components/MaskedSegments.tsx`

Presentacional: recibe segmentos ya calculados (lo usa `MaskedText` y el probador de Settings).

```tsx
import { Badge, Tooltip } from '@mantine/core';
import { IconLock } from '@tabler/icons-react';
import { KIND_LABEL } from '../constants';
import type { MaskSegment } from '../types';
import styles from './MaskedSegments.module.css';

interface MaskedSegmentsProps {
	segments: MaskSegment[];
	/** Show the real data, underlined, instead of the chip. */
	revealed?: boolean;
}

/** Plain text with each sensitive span drawn as a grey chip (or underlined when revealed). */
export function MaskedSegments({
	segments,
	revealed = false,
}: MaskedSegmentsProps) {
	return (
		<>
			{segments.map((segment, i) =>
				segment.hit ? (
					revealed ? (
						<Tooltip
							key={i}
							label={`${KIND_LABEL[segment.hit.kind]} · revealed`}
							withArrow
						>
							<mark className={styles.revealed}>{segment.text}</mark>
						</Tooltip>
					) : (
						<Tooltip
							key={i}
							label={`${KIND_LABEL[segment.hit.kind]} masked`}
							withArrow
						>
							<Badge
								component='span'
								size='xs'
								variant='light'
								color='gray'
								tt='none'
								leftSection={<IconLock size={10} />}
								className={styles.chip}
							>
								{KIND_LABEL[segment.hit.kind]} {segment.hit.preview}
							</Badge>
						</Tooltip>
					)
				) : (
					<span key={i}>{segment.text}</span>
				)
			)}
		</>
	);
}
```

### `src/modules/qa/privacy/components/MaskedText.tsx`

```tsx
import { useMasking } from '../useMasking';
import { maskSegments } from '../mask';
import { MaskedSegments } from './MaskedSegments';

interface MaskedTextProps {
	text: string;
	/** Only the call detail passes it: there a reveal shows the real data. */
	callId?: string;
}

/** Any call text, with its sensitive data masked for the current viewer. */
export function MaskedText({ text, callId }: MaskedTextProps) {
	const { settings, active, revealed } = useMasking(callId);
	if (!settings.enabled) return <>{text}</>;
	// While revealed the spans are still found, so they can be underlined.
	const segments = maskSegments(text, settings);
	return <MaskedSegments segments={segments} revealed={revealed && !active} />;
}
```

**Typecheck.**

---

## Tarea 4 · Datos de ejemplo: una llamada con datos sensibles

En `src/views/Campaigns/constants.ts`, dentro de `mockCallEvaluationDetail`:

1. **Transcript** — reemplazar el texto de `t2`, `t3`, `t10`, e insertar dos turnos entre `t10` y `t11`. Los demás turnos no cambian (los highlights de anchors y las citas de evidencia dependen de ellos).

```ts
		{
			id: 't2',
			speaker: 'customer',
			timestamp: '0:09',
			text: "Yes, that's me. Do you need to verify? My ID is 402-1234567-8 and my date of birth is 03/03/1984.",
		},
		{
			id: 't3',
			speaker: 'agent',
			timestamp: '0:14',
			text: "Thank you, that matches what I have, along with the email j.doe84@gmail.com. Great. I see you've been with us on the 200 Mbps plan for two years, thank you for that. I'm calling because we have a new Premium Fiber 500 bundle with TV included.",
		},
		// ...t4–t9 sin cambios...
		{
			id: 't10',
			speaker: 'customer',
			timestamp: '2:10',
			text: 'Call me back after the 15th, when my current contract ends. Use my cell, 829-555-0193, not the home number.',
		},
		{
			id: 't10b',
			speaker: 'agent',
			timestamp: '2:15',
			text: 'Noted. And to keep the promo price locked until then, could you confirm the card we have on file?',
		},
		{
			id: 't10c',
			speaker: 'customer',
			timestamp: '2:18',
			text: "It's the Visa, 4512 3456 7890 1234, expires 09/28.",
		},
		// t11, t12 sin cambios
```

2. **Compliance → security → dataProtection**: reemplazar `note` y añadir `evidence`:

```ts
					{
						key: 'dataProtection',
						label: 'Data Protection',
						status: 'compliant',
						score: 100,
						note: 'ID, date of birth, email, phone and a card number were spoken. All are masked in the transcript and muted in the recording; the agent did not read any of them back.',
						evidence: {
							timestamp: '2:18',
							speaker: 'customer',
							quote: "It's the Visa, 4512 3456 7890 1234, expires 09/28.",
						},
					},
```

Lo que debe detectarse en la llamada (6 spans): `402-1234567-8` (nationalId), `03/03/1984` (dob), `j.doe84@gmail.com` (email), `829-555-0193` (phone), `4512 3456 7890 1234` (card → `•••• 1234`), `09/28` (expiry). Ningún falso positivo en `$49.99`, `200 Mbps`, `15th`, `500`.

**Typecheck.**

---

## Tarea 5 · Detalle de la llamada: transcript, citas, momentos, player

### `CallTranscript.tsx`

- Nuevo prop `callId: string`.
- Importar `MaskedText` de `~/modules/qa/privacy/components/MaskedText`.
- En el render del texto del turno, dentro de `segmentsOf(...)`: cada segmento (con o sin anchor) renderiza `<MaskedText text={segment.text} callId={callId} />` en lugar de `segment.text`. El `<mark>` del anchor envuelve al `MaskedText`. (Los highlights de anchors no contienen datos sensibles, así que `indexOf` sigue funcionando sobre el texto crudo.)

### `EvidenceQuote.tsx`

- Nuevo prop opcional `callId?: string`.
- `"{evidence.quote}"` → `"<MaskedText text={evidence.quote} callId={callId} />"`.
- Los paneles `QAEvaluationPanel`, `CompliancePanel`, `SentimentEmotionPanel`, `EsgPanel`, `BusinessInsightsPanel` reciben un prop opcional `callId?: string` y lo pasan a cada `EvidenceQuote`. En `ConversationEvaluations.tsx` se pasa `callId={call.callId}`; en `DisputeCaseDetailPage.tsx` no se pasa (nunca se revela).

### `MomentCard.tsx`

- Prop opcional `callId?: string`; `"{moment.quote}"` y `{moment.note}` → `MaskedText`. `QAEvaluationPanel` lo pasa en sus dos usos de `MomentCard`.

### `AnchorMoments.tsx`

- Prop opcional `callId?: string`; `"{anchor.highlight ?? anchor.quote}"` → `MaskedText`. `SentimentEmotionPanel` lo pasa.

### `AddMomentDrawer.tsx`

- `const { mask } = useMasking();` (sin callId: en el selector no se revela). En `turnOptions.label` usar `mask(turn.text).slice(0, TURN_PREVIEW_CHARS)`.

### `CallPlayer.tsx` + `CallPlayer.module.css`

- Nuevo prop `mutedSpans: { seconds: number; label: string }[]`.
- En la cabecera, junto al badge de duración, si `mutedSpans.length > 0`: `<Badge size='sm' variant='light' color='gray' leftSection={<IconVolumeOff size={12} />}>{n} muted</Badge>`.
- En `.markerRail`, después de los marcadores de anchors, un `<Tooltip label={`Audio muted · ${label}`}>` con `<span className={styles.mute} style={{ left }} />` por cada span (comentario `// inline-style-allow:` igual que el marcador existente).
- CSS:

```css
/* A muted stretch of the recording: a small hatched block under the anchors, never a colour. */
.mute {
	position: absolute;
	top: 2px;
	width: 8px;
	height: 8px;
	transform: translateX(-50%);
	border-radius: 2px;
	background: repeating-linear-gradient(
		45deg,
		var(--mantine-color-gray-5) 0 2px,
		transparent 2px 4px
	);
	pointer-events: auto;
}
```

### `ConversationEvaluations.tsx`

- `const { settings: privacy, revealed, segments: maskedSegments } = useMasking(call.callId);`
- `mutedSpans` (useMemo): para cada turno, `findSensitive(turn.text, privacy)` (importar de `mask.ts`); si hay hits y `privacy.muteAudio`, `{ seconds: turnSeconds(turn) + 1, label: hits.map((h) => KIND_LABEL[h.kind]).join(', ') }`.
- `sensitiveCount` (useMemo): suma de hits de todos los turnos. `sensitiveKinds`: lista única de `KIND_LABEL`.
- Pasar `callId` a `CallTranscript`, a los paneles y a `CallPlayer` los `mutedSpans`.
- Debajo del header (antes de la Card de pestañas): `<PrivacyBanner callId={call.callId} count={sensitiveCount} kinds={sensitiveKinds} canReveal={previewRole === 'qaManager' || previewRole === 'superAdmin'} onReveal={() => setRevealOpen(true)} />`.
- Estado `revealOpen` + `<RevealDrawer opened callId onClose />` al final junto a los otros drawers.

### `PrivacyBanner.tsx` (nuevo, en `call-evaluation/`)

Usa `InlineNotice` (`~/components/InlineNotice`) y `useMasking(callId)`; strings en `qa.calls` bajo `privacy.*`.

| Estado      | Condición           | Color / icono          | Título                   | Descripción                                                                                             | Acción                                                                                                                                            |
| ----------- | ------------------- | ---------------------- | ------------------------ | ------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| Apagado     | `!settings.enabled` | yellow · `IconLockOff` | `privacy.off.title`      | `privacy.off.description`                                                                               | ninguna                                                                                                                                           |
| Sin datos   | `count === 0`       | gray · `IconLock`      | `privacy.none.title`     | `privacy.none.description`                                                                              | ninguna                                                                                                                                           |
| Enmascarado | default             | gray · `IconLock`      | `privacy.masked.title`   | `privacy.masked.description` `{{count}}`, `{{kinds}}`, + `privacy.masked.audio` si `settings.muteAudio` | `canReveal && settings.reveal.allowed` → Button variant default `privacy.reveal.button` `{{minutes}}`; si no → texto `privacy.masked.onlyManager` |
| Revelado    | `revealed`          | red · `IconLockOpen`   | `privacy.revealed.title` | `privacy.revealed.description` `{{by}}`, `{{time}}`, `{{reason}}`, `{{expires}}` (hora local `HH:mm`)   | Button variant default color red `privacy.revealed.hide` → `conceal(callId)` + `notifySuccess(t('privacy.revealed.hidden'))`                      |

El botón va en `headerActions`? `InlineNotice` no lo tiene: poner el botón dentro de `description` en un `<Group justify='space-between'>` con el texto a la izquierda.

### `RevealDrawer.tsx` (nuevo)

`AppDrawer` con `title={t('privacy.reveal.title')}`, `description={t('privacy.reveal.description', { minutes })}`, `icon={<IconLockOpen />}`. Formulario con `@mantine/form` como `AddMomentDrawer`:

- `Select` motivo: `REVEAL_REASONS` → label `t(`privacy.reasons.${r}`)`, requerido.
- `Textarea` nota: requerida si `reason === 'other'` o `settings.reveal.requireNote` (mín. 10 caracteres), placeholder `privacy.reveal.notePlaceholder`.
- Texto fijo `privacy.reveal.logged` ("Visible for {{minutes}} minutes. Logged under {{by}}.").
- Botones: Cancel (`privacy.reveal.cancel`) / Reveal (`privacy.reveal.confirm`, color red).
- `by`: `previewRole === 'superAdmin' ? 'Admin (Super Admin)' : 'Laura Méndez (QA Manager)'`.
- On submit: `usePrivacyStore.getState().reveal({...})`, `notifySuccess(t('privacy.reveal.success', { minutes }))`, cerrar.

### `src/locales/en/qa.calls.json` — añadir al nivel raíz `"privacy"`

```json
	"privacy": {
		"off": {
			"title": "Sensitive data masking is off",
			"description": "Every number, ID and contact detail in this call is visible. A QA manager can turn masking on in Settings → Privacy."
		},
		"none": {
			"title": "No sensitive data detected",
			"description": "Nothing in this call matches the masking rules."
		},
		"masked": {
			"title": "Sensitive data is masked",
			"description_one": "{{count}} item is hidden in the transcript and the evidence: {{kinds}}.",
			"description_other": "{{count}} items are hidden in the transcript and the evidence: {{kinds}}.",
			"audio": "The recording is muted while they are said.",
			"onlyManager": "Only a QA manager or super admin can reveal them."
		},
		"revealed": {
			"title": "Sensitive data is visible",
			"description": "Revealed by {{by}} at {{time}} · {{reason}} · hides automatically at {{expires}}.",
			"hide": "Hide now",
			"hidden": "Sensitive data hidden again"
		},
		"reveal": {
			"button": "Reveal for {{minutes}} min",
			"title": "Reveal sensitive data",
			"description": "The real values will be visible on this page for {{minutes}} minutes. The reveal is logged.",
			"reason": "Reason",
			"note": "Note",
			"notePlaceholder": "What are you checking? (at least 10 characters)",
			"logged": "Visible for {{minutes}} minutes. Logged under {{by}}.",
			"cancel": "Cancel",
			"confirm": "Reveal",
			"success": "Sensitive data visible for {{minutes}} minutes"
		},
		"reasons": {
			"disputeReview": "Dispute review",
			"complianceInvestigation": "Compliance investigation",
			"customerRequest": "Customer request",
			"fraudCheck": "Fraud check",
			"other": "Other"
		}
	}
```

`es/qa.calls.json`: mismas claves en español ("El enmascarado de datos sensibles está apagado", "No se detectaron datos sensibles", "Datos sensibles enmascarados", "{{count}} dato oculto…/{{count}} datos ocultos en la transcripción y las evidencias: {{kinds}}.", "La grabación se silencia mientras se dicen.", "Solo un QA manager o super admin puede revelarlos.", "Datos sensibles visibles", "Revelado por {{by}} a las {{time}} · {{reason}} · se oculta automáticamente a las {{expires}}.", "Ocultar ahora", "Datos sensibles ocultos de nuevo", "Revelar por {{minutes}} min", "Revelar datos sensibles", "Los valores reales se verán en esta página durante {{minutes}} minutos. El revelado queda registrado.", "Motivo", "Nota", "¿Qué estás verificando? (mínimo 10 caracteres)", "Visible durante {{minutes}} minutos. Registrado a nombre de {{by}}.", "Cancelar", "Revelar", "Datos sensibles visibles durante {{minutes}} minutos", motivos: "Revisión de disputa", "Investigación de cumplimiento", "Solicitud del cliente", "Verificación de fraude", "Otro").

**Typecheck** y paridad de claves en/es.

---

## Tarea 6 · Coaching y disputas (siempre enmascarado)

### `src/modules/qa/disputes/cases/helpers.ts`

`toDemoTurns(turns, mask: (text: string) => string = (t) => t)` → `text: mask(turn.text)`.

### `DisputeCaseDetailPage.tsx`

- `const { mask } = useMasking();` (sin callId).
- `toDemoTurns(call.transcript, mask)`.
- `{dispute.agentComment}` → `{mask(dispute.agentComment)}`; igual `managerComment` (L344) y `decision.edits.evidenceQuote` (L395-404).
- Los paneles se renderizan sin `callId`, así que `EvidenceQuote` ya enmascara.

### `CoachingSessionPage.tsx`

- `const { mask } = useMasking();`
- `quote: mask(m.quote)` y en `talkingPoint` `quote: mask(m.quote)`. Añadir `mask` a las dependencias del `useMemo`.

### `CoachingSessionDetailPage.tsx`

- `"{m.quote}"` (≈L435) → `"<MaskedText text={m.quote} />"`.

(Los puntos de conversación ya nacen enmascarados; `AgentSessionDetailDrawer` y `CoachingLearningWidget` no cambian.)

**Typecheck.**

---

## Tarea 7 · Settings → pestaña Privacy

### `SettingsPage.tsx`

- Importar `IconLock` y `PrivacyTab`. Añadir `<Tabs.Tab value='privacy' leftSection={<IconLock size={16} />}>{t('page.tabs.privacy')}</Tabs.Tab>` después de burnout, y su `<Tabs.Panel value='privacy' pt='lg'><PrivacyTab /></Tabs.Panel>`.

### `tabs/PrivacyTab.tsx`

Mismo esqueleto que `BurnoutTab`: `useSettingsStore(selectThresholds).privacy`, `useSettingsDraft<PrivacySettings>`, `validatePrivacy`, `SettingsActions` con `saveThresholds('privacy', draft)` + `notifySuccess(t('saved'))`, `fillWith(DEFAULT_SETTINGS.thresholds.privacy)`. Namespace `qa.settings`, claves bajo `privacy.*`. Secciones (cada una un `SectionCard`):

| Sección                                               | Contenido                                                                                                                                                                                                                                                                                                                                                                                                       | Comportamiento                                                                                                                              |
| ----------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| **Masking** (`privacy.masking.title/description`)     | `Switch` `privacy.masking.enabled` (color gray). `Table` con una fila por `SENSITIVE_CATEGORIES`: Switch habilitada · nombre + descripción (`privacy.categories.{cat}.label/description`) · chips de `KINDS_BY_CATEGORY` con `KIND_LABEL` (Badge gray outline) · `NumberInput` `privacy.masking.showLast` 0–4 (w 90)                                                                                            | Con `enabled` apagado la tabla queda `disabled`. `showLast` fuera de 0–4 → error `showLast`.                                                |
| **Recording** (`privacy.recording.title/description`) | `Switch` `privacy.recording.muteAudio` + texto `privacy.recording.screen` ("Screen recordings follow the same rule: the field is blurred while the data is on screen.")                                                                                                                                                                                                                                         | solo texto; no hay grabaciones de pantalla en el mock                                                                                       |
| **Reveal** (`privacy.reveal.title/description`)       | `Switch` `privacy.reveal.allowed`; `NumberInput` `privacy.reveal.minutes` (min 5, max 120, `rightSection` "min"); `Switch` `privacy.reveal.requireNote`; texto `privacy.reveal.who`                                                                                                                                                                                                                             | minutos fuera de rango → error `revealMinutes`; con `allowed` apagado los otros dos quedan disabled                                         |
| **Try a sentence** (`privacy.test.title`)             | `Textarea` autosize + debajo `<MaskedSegments segments={maskSegments(sentence, draft)} />` y una línea `privacy.test.found` `{{count}}` / `privacy.test.none`                                                                                                                                                                                                                                                   | usa el **draft**, no lo guardado; placeholder `privacy.test.placeholder` ("e.g. My card is 4512 3456 7890 1234 and my ID is 402-1234567-8") |
| **Reveal log** (`privacy.log.title/description`)      | `Table` de `usePrivacyStore(selectRevealLog)`: When (fecha+hora local) · Who · Call · Reason (`qa.calls:privacy.reasons.*` → añadir `'qa.calls'` a `useTranslation(['qa.settings','qa.calls'])` y a `qaNamespaces.ts` en `'qa.qa-manager.settings'`) · Note (dimmed, lineClamp 1) · Status: Badge gray "Hidden early" si `hiddenAt`, gray outline "Expired" si `expiresAt < now`, red light "Visible" si activo | solo lectura                                                                                                                                |
| Footer                                                | `SettingsActions`                                                                                                                                                                                                                                                                                                                                                                                               | igual que Burnout                                                                                                                           |

Error: si `errorKey`, mostrar `<Text size='xs' c='red'>{t(`privacy.errors.${errorKey}`)}</Text>` sobre el footer.

### `src/locales/en/qa.settings.json`

- `page.tabs.privacy: "Privacy"`.
- Bloque `"privacy"` al nivel raíz:

```json
	"privacy": {
		"masking": {
			"title": "Masking",
			"description": "Sensitive data is hidden wherever a call is shown: transcripts, evidence quotes, moments, coaching and disputes. The analysis still runs on the full text.",
			"enabled": "Mask sensitive data",
			"columns": { "category": "Data", "matches": "What it matches", "showLast": "Show last digits" }
		},
		"categories": {
			"payment": { "label": "Cards and bank accounts", "description": "Card numbers, CVV, expiry dates, IBAN and account numbers." },
			"identity": { "label": "Identity documents", "description": "National IDs, social security numbers and passports." },
			"contact": { "label": "Contact and location", "description": "Phone numbers, email addresses and street addresses." },
			"credentials": { "label": "Credentials and personal data", "description": "PINs, passwords, one-time codes and dates of birth." }
		},
		"recording": {
			"title": "Recording",
			"description": "What happens to the audio while the data is said.",
			"muteAudio": "Mute the recording while sensitive data is said",
			"screen": "Screen recordings follow the same rule: the field is blurred while the data is on screen."
		},
		"reveal": {
			"title": "Reveal",
			"description": "A QA manager or super admin can see the real data on the call detail for a short time, with a reason that is logged.",
			"allowed": "Allow revealing on the call detail",
			"minutes": "Visible for",
			"requireNote": "Require a note besides the reason",
			"who": "Supervisors and agents never see the real data. Coaching and disputes always show it masked."
		},
		"test": {
			"title": "Try a sentence",
			"placeholder": "e.g. My card is 4512 3456 7890 1234 and my ID is 402-1234567-8",
			"found_one": "{{count}} item would be masked.",
			"found_other": "{{count}} items would be masked.",
			"none": "Nothing in this sentence would be masked."
		},
		"log": {
			"title": "Reveal log",
			"description": "Every time the real data was shown, by whom and why.",
			"columns": { "when": "When", "who": "Who", "call": "Call", "reason": "Reason", "note": "Note", "status": "Status" },
			"status": { "visible": "Visible", "expired": "Expired", "hiddenEarly": "Hidden early" }
		},
		"errors": {
			"revealMinutes": "The reveal time must be between 5 and 120 minutes.",
			"showLast": "Visible digits must be between 0 and 4."
		}
	}
```

`es/qa.settings.json`: `page.tabs.privacy: "Privacidad"` y el bloque equivalente en español (Enmascarado / "Los datos sensibles se ocultan en cualquier pantalla que muestre una llamada: transcripciones, citas de evidencia, momentos, coaching y disputas. El análisis sigue usando el texto completo." / "Enmascarar datos sensibles" / columnas "Datos", "Qué detecta", "Mostrar últimos dígitos" / categorías "Tarjetas y cuentas bancarias", "Documentos de identidad", "Contacto y ubicación", "Credenciales y datos personales" con sus descripciones / "Grabación", "Silenciar la grabación mientras se dicen datos sensibles", "Las grabaciones de pantalla siguen la misma regla: el campo se difumina mientras el dato está en pantalla." / "Revelar", "Permitir revelar en el detalle de la llamada", "Visible durante", "Exigir una nota además del motivo", "Los supervisores y agentes nunca ven el dato real. Coaching y disputas siempre lo muestran enmascarado." / "Probar una frase", "p. ej. Mi tarjeta es 4512 3456 7890 1234 y mi cédula es 402-1234567-8", "{{count}} dato se enmascararía." / "{{count}} datos se enmascararían." / "Nada de esta frase se enmascararía." / "Registro de revelados", "Cada vez que se mostró el dato real, quién y por qué.", columnas "Cuándo", "Quién", "Llamada", "Motivo", "Nota", "Estado", estados "Visible", "Vencido", "Ocultado antes" / errores "El tiempo de revelado debe estar entre 5 y 120 minutos.", "Los dígitos visibles deben estar entre 0 y 4.").

**Typecheck** y paridad en/es.

---

## Tarea 8 · Global configuration: reemplazar el interruptor por un aviso

- `global-config/types.ts`: quitar `redactPii` y `piiFields`.
- `global-config/seed.ts`: quitar las dos líneas.
- `global-config/constants.ts`: quitar `PII_FIELDS`.
- `CallAnalysisTab.tsx`: quitar el `Switch` de redact y el `MultiSelect`, y el import de `MultiSelect` y `PII_FIELDS`. En su lugar, debajo del switch de diarización:

```tsx
<InlineNotice
	icon={<IconLock size={16} />}
	color='gray'
	title={t('callAnalysis.masking.title')}
	description={t('callAnalysis.masking.description')}
/>
```

- `qa.globalConfig.json` (en/es): quitar `callAnalysis.redact` y `callAnalysis.piiFields`; añadir `callAnalysis.masking: { title: "Sensitive data masking", description: "What is masked, for how long it can be revealed and the reveal log live in QA Manager → Settings → Privacy." }` / es: `"Enmascarado de datos sensibles"`, `"Qué se enmascara, por cuánto tiempo se puede revelar y el registro de revelados están en QA Manager → Settings → Privacidad."`.
- `grep -rn "redactPii\|piiFields\|PII_FIELDS" src` debe quedar vacío.

**Typecheck.**

---

## Verificación

1. `npm run typecheck` limpio.
2. Paridad de claves en/es para `qa.settings`, `qa.calls`, `qa.globalConfig` (script node que aplana claves y compara, como en sesiones anteriores).
3. Script Vite SSR (`scratchpad/mask_check.mjs`, mismo patrón que `anchor_check.mjs`): cargar `mask.ts`, `privacy/constants.ts` y `Campaigns/constants.ts`; para cada turno imprimir `findSensitive(turn.text, DEFAULT_PRIVACY_SETTINGS)`. Esperado: exactamente 6 hits (nationalId, dob, email, phone, card con preview `•••• 1234`, expiry) y ninguno en los demás turnos. Probar además `maskText` sobre una frase con `$49.99`, `200 Mbps`, `ORD-2026-12345`: sin hits. Con `categories.contact.enabled=false`: 4 hits.
4. Volver a correr `scratchpad/anchor_check.mjs`: todos los highlights siguen con `ok: true` (los turnos modificados conservan las frases ancladas).
5. `grep -rn "redactPii\|piiFields\|PII_FIELDS" src` vacío.
6. Revisión manual de código (sin dev server): el chip usa solo variables Mantine; `.revealed` y `.mute` funcionan en claro y oscuro; `MaskedText` no se usa con `callId` fuera de `ConversationEvaluations`.

## Notas para la historia (después)

- El enmascarado protege la lectura, no el análisis: QA, sentimiento y compliance se calculan sobre el texto completo.
- Grabaciones de pantalla: no existen en el mock; el player representa el audio silenciado y Settings explica que la pantalla sigue la misma regla.
- Pregunta abierta: si el agente debería ver los datos del cliente que él mismo recogió.
