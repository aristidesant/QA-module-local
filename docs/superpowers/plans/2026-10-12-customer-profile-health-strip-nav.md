# Customer profile: health strip in the header, one activity row, grouped tabs, shared profile shell

## Context

The customer profile (`src/modules/qa/customers/CustomerProfilePage/`, routes `/qa/supervisor/customers/:customerId` and `/qa/qa-manager/customers/:customerId`) shows everything at once and at the same weight: a header with four lines of facts (about 14 items), a receptiveness ring beside four unlabeled-looking facts, two equal buttons, six tabs, then six KPI cards of which two (Avg. sentiment, Latest NPS) repeat the header. The first chart starts around 680px down.

The agent profile was just restructured the same way (commit `79acbed1`: scorecard strip in the header, grouped tabs with attention dots, sticky compact bar). The user wants the customer profile to follow, and chose: **header + health strip**, **overview consolidation** (6 cards → one activity row), **tab grouping into 3 + attention dots**, **sticky compact bar**, **Add note as the primary action**, and **generalising the agent-profile nav and compact bar into shared pieces** so both pages use one implementation.

Mode: refinement. Mockup-level, no backend, same mock data. Every component works in light and dark mode (Mantine variables, `var(--surface-*)` tokens, CSS modules, no inline styles). Color rule of the customers module stays: red only for what needs attention (resistant, high churn, detractor NPS, low sentiment).

Plan file convention: when execution starts, first copy this plan to `docs/superpowers/plans/2026-10-12-customer-profile-health-strip-nav.md` (Task 0), as with the previous plans.

---

## Critique summary

| Finding                                                                                                                                                                   | Severity | Evidence                                                          |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | ----------------------------------------------------------------- |
| Header carries ~14 facts in four lines at three sizes (id, phone, email, city, plan, value, channel, language, tags, customer since, tracked since, contacts)             | Critical | `CustomerHeader.tsx:75-91`                                        |
| The four right-hand facts (churn, NPS, best window, sentiment delta) sit beside the ring with no grouping; the delta line has no label and prints "/5" twice ("+0.3/5/5") | Moderate | `CustomerHeader.tsx:100-135`, line 134                            |
| Six KPI cards, two of which repeat the header (sentiment, NPS); the other four are activity counts with no comparison                                                     | Critical | `OverviewTab.tsx:45-78`                                           |
| Six flat tabs, no signal of where attention is needed; Overview repeats content from Sentiment (chart), Offers (signals) and Surveys (NPS)                                | Moderate | `CUSTOMER_TABS`, `SentimentTab.tsx:94-112`, `OffersTab.tsx:80-94` |
| Two equal outline buttons; no primary action                                                                                                                              | Minor    | `CustomerHeader.tsx:140-159`                                      |
| Hardcoded English "contacts" in the header; chart empty state reuses the `overview.windows` key ("Contact windows")                                                       | Minor    | `CustomerHeader.tsx:90`, `OverviewTab.tsx:90`                     |
| NPS badge uses green/yellow/red bands while the module rule is "red only for attention"                                                                                   | Minor    | `CustomerHeader.tsx:118`, `helpers.ts:45`                         |
| Long page; actions leave the viewport on scroll                                                                                                                           | Moderate | page layout                                                       |

What works (keep): the quiet one-line "facts" idea, `ReceptivenessGauge` (neutral ring, red only when resistant), the DNC badge as a true attention state, `ContactWindowTiles`, the timeline note flow (`?tab=timeline&focus=note`), `?tab=` in the URL.

---

## Direction

1. **Shared profile shell** (`src/modules/qa/components/ProfileShell/`): a generic `ProfileNav` (groups + pill sub-nav + attention dots), a generic `CompactProfileBar` (identity slot + actions slot) and a `useCompactBar` hook. The agent page switches to them; its agent-specific copies are deleted.
2. **Customer header = identity + actions + health strip.** Two-line identity with a details popover; "Add note" filled, "Flag Do-Not-Call" outline; the receptiveness ring on the left of a strip with four tiles: Churn risk, Avg. sentiment (with sparkline and delta), Latest NPS, Best window; one verdict line under it.
3. **Overview = activity row + the chart + windows + signals.** The six cards become one "Activity" row (Contacts · Answer rate · Avg. duration · Agents · Offers · Acceptance). Sentiment and NPS live only in the header.
4. **Three groups:** Overview · Interactions (Contacts, Timeline) · Insights (Sentiment & Emotion, Offers & Signals, Surveys). `?tab=` values unchanged.
5. **Sticky compact bar:** avatar, name, receptiveness score, actions.

---

## Implementation plan

Execute in order; `npm run typecheck` after each phase. No tests (project rule). Do not commit unless asked. Prettier only on the files touched (listing them explicitly), never on whole folders.

### Task 0 — Plan copy

Copy this file to `docs/superpowers/plans/2026-10-12-customer-profile-health-strip-nav.md`.

### Phase 1 — Shared profile shell (`src/modules/qa/components/ProfileShell/`)

**1a. `ProfileNav.tsx`** — generic version of `src/modules/qa/team/AgentProfilePage/ProfileNav.tsx`. Labels arrive translated, so the component has no i18n dependency.

```tsx
import type { ReactNode } from 'react';
import { Stack, Tabs } from '@mantine/core';
import type { TablerIcon } from '@tabler/icons-react';
import styles from './ProfileNav.module.css';

export type Attention = 'warning' | 'critical';
export type AttentionMap<T extends string> = Partial<Record<T, Attention>>;

export interface NavTab<T extends string> {
	value: T;
	label: string;
	icon?: TablerIcon;
}

export interface NavGroup<T extends string> {
	value: string;
	label: string;
	icon: TablerIcon;
	tabs: NavTab<T>[];
}

interface ProfileNavProps<T extends string> {
	groups: NavGroup<T>[];
	tab: T;
	onChange: (tab: T) => void;
	attention: AttentionMap<T>;
	/** Accessible name of an attention dot, e.g. "Needs attention". */
	attentionLabel: string;
}

/** The worst level among a set of tabs, or undefined when none needs a look. */
export const worstAttention = <T extends string>(
	tabs: T[],
	attention: AttentionMap<T>
): Attention | undefined => {
	const levels = tabs.map((tab) => attention[tab]);
	return levels.includes('critical')
		? 'critical'
		: levels.includes('warning')
			? 'warning'
			: undefined;
};

/** Groups on top; inside a group with several tabs, a pill row to move between them. */
export function ProfileNav<T extends string>({
	groups,
	tab,
	onChange,
	attention,
	attentionLabel,
}: ProfileNavProps<T>) {
	const group =
		groups.find((g) => g.tabs.some((x) => x.value === tab)) ?? groups[0];

	const dot = (level: Attention | undefined): ReactNode =>
		level ? (
			<span
				className={styles.dot}
				data-level={level}
				role='img'
				aria-label={attentionLabel}
			/>
		) : undefined;

	return (
		<Stack gap='xs'>
			<Tabs
				value={group.value}
				onChange={(value) => {
					const next = groups.find((g) => g.value === value);
					if (next) onChange(next.tabs[0].value);
				}}
			>
				<Tabs.List>
					{groups.map(({ value, label, icon: Icon, tabs }) => (
						<Tabs.Tab
							key={value}
							value={value}
							leftSection={<Icon size={16} />}
							rightSection={dot(
								worstAttention(
									tabs.map((x) => x.value),
									attention
								)
							)}
						>
							{label}
						</Tabs.Tab>
					))}
				</Tabs.List>
			</Tabs>

			{group.tabs.length > 1 && (
				<Tabs
					variant='pills'
					value={tab}
					onChange={(value) => value && onChange(value as T)}
				>
					<Tabs.List>
						{group.tabs.map(({ value, label, icon: Icon }) => (
							<Tabs.Tab
								key={value}
								value={value}
								leftSection={Icon ? <Icon size={14} /> : undefined}
								rightSection={dot(attention[value])}
							>
								{label}
							</Tabs.Tab>
						))}
					</Tabs.List>
				</Tabs>
			)}
		</Stack>
	);
}
```

`ProfileNav.module.css`: move `src/modules/qa/team/AgentProfilePage/ProfileNav.module.css` here unchanged (`.dot`, `.dot[data-level='critical']`).

**1b. `CompactProfileBar.tsx` + `CompactProfileBar.module.css`** — generic version of the agent one.

```tsx
import type { ReactNode } from 'react';
import { Group } from '@mantine/core';
import styles from './CompactProfileBar.module.css';

interface CompactProfileBarProps {
	/** True once the full header has scrolled out of view. */
	visible: boolean;
	/** Avatar, name and the one number that matters. */
	children: ReactNode;
	actions: ReactNode;
}

/** A slim bar that floats over the page while the long profile scrolls. */
export function CompactProfileBar({
	visible,
	children,
	actions,
}: CompactProfileBarProps) {
	return (
		<div className={styles.anchor}>
			<div
				className={styles.bar}
				data-visible={visible || undefined}
				aria-hidden={!visible}
			>
				<Group gap='sm' wrap='nowrap' miw={0}>
					{children}
				</Group>
				{actions}
			</div>
		</div>
	);
}
```

CSS: the current `src/modules/qa/team/AgentProfilePage/AgentProfilePage.module.css` content, with `.compactAnchor` renamed `.anchor` and `.compactBar` renamed `.bar` (keep the `[data-visible]` and reduced-motion rules).

**1c. `useCompactBar.ts`** — the IntersectionObserver now inline in `AgentProfilePage.tsx:58-67`.

```ts
import { useEffect, useRef, useState } from 'react';

/** Returns a ref for the full header and whether the compact bar should show (header scrolled out). */
export function useCompactBar(resetKey: string | undefined) {
	const headerRef = useRef<HTMLDivElement>(null);
	const [headerVisible, setHeaderVisible] = useState(true);
	useEffect(() => {
		const el = headerRef.current;
		if (!el) return;
		const observer = new IntersectionObserver(
			([entry]) => setHeaderVisible(entry.isIntersecting),
			{ threshold: 0 }
		);
		observer.observe(el);
		return () => observer.disconnect();
	}, [resetKey]);
	return { headerRef, compact: !headerVisible };
}
```

**1d. `index.ts`:** `export * from './ProfileNav'; export { CompactProfileBar } from './CompactProfileBar'; export { useCompactBar } from './useCompactBar';`

**1e. Switch the agent page.**

- `src/modules/qa/team/AgentProfilePage/attention.ts`: replace its own `Attention`/`AttentionMap` with `import type { AttentionMap } from '~/modules/qa/components/ProfileShell';` and `export type AgentAttentionMap = AttentionMap<ProfileTab>;` used as the return type of `profileAttention`. Delete the local `Attention` type and the `AttentionMap` alias.
- `AgentProfilePage.tsx`: delete the `headerRef`/`headerVisible` state and effect, `useEffect`/`useRef` imports if unused; add `const { headerRef, compact } = useCompactBar(profile?.agent.id);`. Replace the `ProfileNav` and `CompactProfileBar` imports with the shared ones. Build the groups with translated labels:
  ```tsx
  const navGroups = useMemo(
  	() =>
  		PROFILE_TAB_GROUPS.map((g) => ({
  			value: g.value,
  			label: t(g.labelKey),
  			icon: g.icon,
  			tabs: g.tabs.map((value) => ({
  				value,
  				label: t(`tabs.${value}`),
  				icon: PROFILE_TABS.find((x) => x.value === value)?.icon,
  			})),
  		})),
  	[t]
  );
  ```
  (`PROFILE_TABS` joins the existing `PROFILE_TAB_GROUPS` import.) Render `<ProfileNav groups={navGroups} tab={tab} onChange={setTab} attention={attention} attentionLabel={t('tabs.attention')} />` and:
  ```tsx
  <CompactProfileBar
  	visible={compact}
  	actions={<ProfileActions size='xs' {...actions} />}
  >
  	<Avatar size={32} radius='md' color='gray' name={profile.agent.name} />
  	<Text fw={600} truncate>
  		{profile.agent.name}
  	</Text>
  	<Text fw={700}>{profile.overall.score}</Text>
  	<Text size='sm' c='dimmed' visibleFrom='sm'>
  		{t('header.rank', {
  			rank: profile.overall.rankInTeam,
  			size: profile.overall.teamSize,
  		})}
  	</Text>
  </CompactProfileBar>
  ```
  (add `Avatar` to the Mantine import; `ProfileActions` import from `./ProfileActions`).
- Delete `src/modules/qa/team/AgentProfilePage/ProfileNav.tsx`, `ProfileNav.module.css`, `CompactProfileBar.tsx`, `AgentProfilePage.module.css` (nothing else imports them: verified with grep). `profileGroupOf` in `team/constants.ts` becomes unused; delete it.

`npm run typecheck`.

### Phase 2 — Customer constants, attention, locale

**2a. `src/modules/qa/customers/constants.ts`** after `CUSTOMER_TABS`:

```ts
export type CustomerGroup = 'overview' | 'interactions' | 'insights';

/** Three groups on top; Interactions and Insights hold a pill sub-nav. */
export const CUSTOMER_TAB_GROUPS: {
	value: CustomerGroup;
	labelKey: string;
	icon: TablerIcon;
	tabs: CustomerTab[];
}[] = [
	{
		value: 'overview',
		labelKey: 'tabs.overview',
		icon: IconAddressBook,
		tabs: ['overview'],
	},
	{
		value: 'interactions',
		labelKey: 'tabs.groups.interactions',
		icon: IconPhone,
		tabs: ['contacts', 'timeline'],
	},
	{
		value: 'insights',
		labelKey: 'tabs.groups.insights',
		icon: IconMoodSmile,
		tabs: ['sentiment', 'offers', 'surveys'],
	},
];

/** Detractors (0-6) are the only NPS scores worth flagging. */
export const NPS_DETRACTOR_MAX = 6;
```

Remove the local `NPS_DETRACTOR_MAX` from `OverviewTab.tsx:23` (it moves here).

**2b. New `src/modules/qa/customers/CustomerProfilePage/attention.ts`:**

```ts
import type { AttentionMap } from '~/modules/qa/components/ProfileShell';
import type { CustomerTab } from '../constants';
import { NPS_DETRACTOR_MAX } from '../constants';
import type { CustomerProfile } from '../types';

export type CustomerAttentionMap = AttentionMap<CustomerTab>;

/** Same rule as the header colours: resistant, high churn, detractor NPS, low sentiment. */
export const customerAttention = (
	profile: CustomerProfile,
	lowSentiment: number
): CustomerAttentionMap => {
	const { kpis } = profile;
	const out: CustomerAttentionMap = {};
	if (kpis.churnRisk === 'high' || kpis.receptivenessBand === 'resistant') {
		out.overview = 'critical';
	}
	if (kpis.avgCustomerSentiment < lowSentiment) out.sentiment = 'warning';
	if (kpis.npsLatest !== undefined && kpis.npsLatest <= NPS_DETRACTOR_MAX) {
		out.surveys = 'warning';
	}
	return out;
};
```

**2c. Locale — `src/locales/en/qa.customers.json` and `es/`** (nested into the existing objects; validate both with `node -e "JSON.parse(...)"`).

`en`:

```json
"header": {
  "contacts": "{{count}} contacts",
  "details": {
    "open": "Customer details",
    "id": "ID", "email": "Email", "city": "City", "language": "Language",
    "channel": "Preferred channel", "plan": "Plan", "value": "Monthly value",
    "customerSince": "Customer since", "trackedSince": "Tracked since",
    "consent": "Consent", "recording": "Recording", "marketing": "Marketing",
    "none": "None", "tags": "Tags"
  },
  "strip": {
    "sentiment": "Avg. sentiment",
    "npsNone": "No survey yet",
    "windowStats": "{{accepted}} accepted of {{contacts}}"
  },
  "verdict": {
    "ok": "No signal needs attention.",
    "attention": "Needs attention: {{items}}.",
    "items": {
      "resistant": "resistant to offers",
      "churn": "high churn risk",
      "nps": "detractor NPS",
      "sentiment": "low sentiment"
    }
  }
},
"tabs": {
  "groups": { "interactions": "Interactions", "insights": "Insights" },
  "attention": "Needs attention"
},
"overview": {
  "activity": "Activity",
  "activityDescription": "From {{first}} to {{last}}",
  "noSentiment": "No answered contact yet."
}
```

`es`:

```json
"header": {
  "contacts": "{{count}} contactos",
  "details": {
    "open": "Detalles del cliente",
    "id": "ID", "email": "Correo", "city": "Ciudad", "language": "Idioma",
    "channel": "Canal preferido", "plan": "Plan", "value": "Valor mensual",
    "customerSince": "Cliente desde", "trackedSince": "Monitoreado desde",
    "consent": "Consentimiento", "recording": "Grabación", "marketing": "Marketing",
    "none": "Ninguno", "tags": "Etiquetas"
  },
  "strip": {
    "sentiment": "Sentimiento prom.",
    "npsNone": "Sin encuesta aún",
    "windowStats": "{{accepted}} aceptadas de {{contacts}}"
  },
  "verdict": {
    "ok": "Ninguna señal requiere atención.",
    "attention": "Requiere atención: {{items}}.",
    "items": {
      "resistant": "reacio a las ofertas",
      "churn": "riesgo de abandono alto",
      "nps": "NPS detractor",
      "sentiment": "sentimiento bajo"
    }
  }
},
"tabs": {
  "groups": { "interactions": "Interacciones", "insights": "Análisis" },
  "attention": "Requiere atención"
},
"overview": {
  "activity": "Actividad",
  "activityDescription": "Del {{first}} al {{last}}",
  "noSentiment": "Aún no hay contactos respondidos."
}
```

Existing keys reused: `header.receptiveness`, `header.churn`, `header.nps`, `header.bestWindow`, `header.plan`, `header.value`, `header.prefers`, `header.language.*`, `header.dnc`, `header.actions.*`, `overview.kpi.*`, `overview.direction.*`, `overview.directionHint`, `common.vsFirst`, `surveys.band.*`, `churn.*`, `receptiveness.*`. `overview.kpi.sentiment` and `overview.kpi.nps` become unused; remove them from both files.

`npm run typecheck`.

### Phase 3 — Customer header pieces (`src/modules/qa/customers/CustomerProfilePage/`)

**3a. `CustomerActions.tsx`**

```tsx
import { Button, Group } from '@mantine/core';
import { IconBan, IconNote } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';

export interface CustomerActionsProps {
	size?: 'xs' | 'sm';
	doNotCall: boolean;
	onAddNote: () => void;
	onToggleDnc: () => void;
}

/** Add note is the everyday action; the Do-Not-Call flag stays quiet beside it. */
export function CustomerActions({
	size = 'sm',
	doNotCall,
	onAddNote,
	onToggleDnc,
}: CustomerActionsProps) {
	const { t } = useTranslation('qa.customers');
	return (
		<Group gap='xs' wrap='nowrap'>
			<Button
				size={size}
				leftSection={<IconNote size={16} />}
				onClick={onAddNote}
			>
				{t('header.actions.addNote')}
			</Button>
			<Button
				size={size}
				variant='default'
				leftSection={<IconBan size={16} />}
				onClick={onToggleDnc}
			>
				{t(doNotCall ? 'header.actions.unflagDnc' : 'header.actions.flagDnc')}
			</Button>
		</Group>
	);
}
```

**3b. `CustomerDetailsPopover.tsx`** — same shape as `team/AgentProfilePage/AgentDetailsPopover.tsx` (Popover width 320, `ActionIcon` info trigger, rows of dimmed label + value, tag list). Props `{ customer: CustomerRecord }`. Rows, in order: ID, email, city, language (`header.language.${customer.language}`), preferred channel (`t(CHANNEL_META[customer.preferredChannel].labelKey)`), plan, monthly value (`$${customer.monthlyValue}` or `—` when 0), customer since (`formatDate`), tracked since, consent (`[recording && t('header.details.recording'), marketing && t('header.details.marketing')].filter(Boolean).join(' · ') || t('header.details.none')`). Then a `TagList` of `customer.tags` under `header.details.tags` (light gray badges). `formatDate` from `~/modules/qa/team/helpers`.

**3c. `HealthStrip.tsx` + `HealthStrip.module.css`**

```tsx
import { Group, Stack, Text } from '@mantine/core';
import { Sparkline } from '@mantine/charts';
import { useTranslation } from 'react-i18next';
import { Caption } from '~/modules/qa/coaching/components/SessionBrief';
import { TrendDelta } from '~/modules/qa/team/components/TrendDelta';
import { useSettingsStore, selectThresholds } from '~/stores/qa/settingsStore';
import type { CustomerProfile } from '../types';
import { NPS_DETRACTOR_MAX } from '../constants';
import { ReceptivenessGauge } from '../components/ReceptivenessGauge';
import { npsBand, windowHours, windowLabel } from '../helpers';
import styles from './HealthStrip.module.css';

/** Red text is the only colour here, and only for what needs attention. Adapts to light and dark. */
const ALERT = 'var(--mantine-color-red-text)';

interface TileProps {
	label: string;
	value: string;
	alert?: boolean;
	children?: React.ReactNode;
}

function Tile({ label, value, alert, children }: TileProps) {
	return (
		<div className={styles.tile}>
			<Caption>{label}</Caption>
			<Text fw={700} size='xl' lh={1.1} c={alert ? ALERT : undefined}>
				{value}
			</Text>
			{children}
		</div>
	);
}

interface HealthStripProps {
	profile: CustomerProfile;
}

/** Receptiveness on the left; churn, sentiment, NPS and the best window beside it; one verdict line under. */
export function HealthStrip({ profile }: HealthStripProps) {
	const { t } = useTranslation('qa.customers');
	const { kpis, bestWindows, sentimentSeries } = profile;
	const lowSentiment =
		useSettingsStore(selectThresholds).sentiment.lowSentimentIncident;
	const nps = kpis.npsLatest !== undefined ? npsBand(kpis.npsLatest) : null;
	const best = bestWindows[0];

	const concerns = [
		kpis.receptivenessBand === 'resistant' &&
			t('header.verdict.items.resistant'),
		kpis.churnRisk === 'high' && t('header.verdict.items.churn'),
		nps?.label === 'detractor' && t('header.verdict.items.nps'),
		kpis.avgCustomerSentiment < lowSentiment &&
			t('header.verdict.items.sentiment'),
	].filter((x): x is string => Boolean(x));

	return (
		<Stack gap='sm'>
			<div className={styles.strip}>
				<div className={styles.gauge}>
					<ReceptivenessGauge
						score={kpis.receptivenessScore}
						band={kpis.receptivenessBand}
						size={88}
					/>
				</div>
				<div className={styles.tiles}>
					<Tile
						label={t('header.churn')}
						value={t(`churn.${kpis.churnRisk}`)}
						alert={kpis.churnRisk === 'high'}
					/>
					<Tile
						label={t('header.strip.sentiment')}
						value={`${kpis.avgCustomerSentiment.toFixed(1)}/5`}
						alert={kpis.avgCustomerSentiment < lowSentiment}
					>
						<Sparkline
							h={24}
							data={sentimentSeries.map((p) => p.customer)}
							color={
								kpis.avgCustomerSentiment < lowSentiment ? 'red.6' : 'gray.6'
							}
							fillOpacity={0.12}
							strokeWidth={1.5}
							curveType='monotone'
						/>
						<TrendDelta
							delta={kpis.sentimentDelta}
							trend={kpis.sentimentTrend}
							unit='/5'
							suffix={t('common.vsFirst')}
						/>
					</Tile>
					<Tile
						label={t('header.nps')}
						value={kpis.npsLatest !== undefined ? String(kpis.npsLatest) : '—'}
						alert={
							kpis.npsLatest !== undefined &&
							kpis.npsLatest <= NPS_DETRACTOR_MAX
						}
					>
						<Text size='xs' c='dimmed'>
							{nps ? t(`surveys.band.${nps.label}`) : t('header.strip.npsNone')}
						</Text>
					</Tile>
					<Tile
						label={t('header.bestWindow')}
						value={best ? windowLabel(best, t) : '—'}
					>
						{best && (
							<Text size='xs' c='dimmed'>
								{windowHours(best)} ·{' '}
								{t('header.strip.windowStats', {
									accepted: best.accepted,
									contacts: best.contacts,
								})}
							</Text>
						)}
					</Tile>
				</div>
			</div>
			<Text size='sm' c={concerns.length ? undefined : 'dimmed'}>
				{concerns.length
					? t('header.verdict.attention', { items: concerns.join(', ') })
					: t('header.verdict.ok')}
			</Text>
		</Stack>
	);
}
```

Notes: `TrendDelta` replaces the "+0.3/5/5" line (it formats `/5` once). `ReceptivenessGauge` keeps its own caption and band label, so the gauge tile has no extra label. The sparkline has no empty-state concern: `Sparkline` renders nothing with an empty array.

`HealthStrip.module.css` — copy `src/modules/qa/team/AgentProfilePage/ScorecardStrip.module.css` and rename `.overall` → `.gauge`; same breakpoints (4 tiles, 2 below 62em).

**3d. Rewrite `CustomerHeader.tsx`:**

```tsx
import {
	Avatar,
	Badge,
	Divider,
	Group,
	Stack,
	Text,
	Title,
} from '@mantine/core';
import { IconBan } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { SectionCard } from '~/components/SectionCard';
import { formatDate } from '~/modules/qa/team/helpers';
import type { CustomerProfile } from '../types';
import { CHANNEL_META, SEGMENT_META, STATUS_META } from '../constants';
import { CustomerActions, type CustomerActionsProps } from './CustomerActions';
import { CustomerDetailsPopover } from './CustomerDetailsPopover';
import { HealthStrip } from './HealthStrip';

/** How many tags show beside the plan before "+N". */
const VISIBLE_TAGS = 2;

interface CustomerHeaderProps extends Omit<
	CustomerActionsProps,
	'size' | 'doNotCall'
> {
	profile: CustomerProfile;
}

export function CustomerHeader({
	profile,
	onAddNote,
	onToggleDnc,
}: CustomerHeaderProps) {
	const { t } = useTranslation('qa.customers');
	const { customer, kpis } = profile;
	const hiddenTags = Math.max(0, customer.tags.length - VISIBLE_TAGS);

	return (
		<SectionCard padding='lg'>
			<Stack gap='md'>
				<Group justify='space-between' align='flex-start' wrap='wrap'>
					<Group gap='md' align='flex-start' wrap='nowrap'>
						<Avatar size={56} radius='md' color='gray' name={customer.name} />
						<Stack gap={4}>
							<Group gap='xs'>
								<Title order={2}>{customer.name}</Title>
								<Badge variant='outline' color='gray'>
									{t(SEGMENT_META[customer.segment].labelKey)}
								</Badge>
								{customer.status !== 'active' && (
									<Badge variant='light' color='gray'>
										{t(STATUS_META[customer.status].labelKey)}
									</Badge>
								)}
								{customer.doNotCall && (
									<Badge
										color='red'
										variant='light'
										leftSection={<IconBan size={12} />}
									>
										{t('header.dnc')}
									</Badge>
								)}
							</Group>
							<Text size='sm' c='dimmed'>
								{customer.phone} ·{' '}
								{t('header.prefers', {
									channel: t(CHANNEL_META[customer.preferredChannel].labelKey),
								})}{' '}
								· {t(`header.language.${customer.language}`)} · {customer.city}
							</Text>
							<Group gap={6} wrap='wrap'>
								<Text size='xs' c='dimmed'>
									{t('header.plan')}: {customer.currentPlan}
									{customer.monthlyValue > 0 &&
										` · ${t('header.value', { value: `$${customer.monthlyValue}` })}`}
									{' · '}
									{t('header.customerSince', {
										date: formatDate(customer.customerSince),
									})}
									{' · '}
									{t('header.contacts', { count: kpis.totalContacts })}
								</Text>
								{customer.tags.slice(0, VISIBLE_TAGS).map((tag) => (
									<Badge key={tag} variant='light' color='gray' size='sm'>
										{tag}
									</Badge>
								))}
								{hiddenTags > 0 && (
									<Badge variant='outline' color='gray' size='sm'>
										+{hiddenTags}
									</Badge>
								)}
								<CustomerDetailsPopover customer={customer} />
							</Group>
						</Stack>
					</Group>

					<CustomerActions
						doNotCall={customer.doNotCall}
						onAddNote={onAddNote}
						onToggleDnc={onToggleDnc}
					/>
				</Group>

				<Divider />

				<HealthStrip profile={profile} />
			</Stack>
		</SectionCard>
	);
}
```

Removed on purpose: the `role` prop (unused), the ID / email / tracked-since lines (popover), the right-hand facts column (now the strip), the two equal buttons, the hardcoded "contacts".

`npm run typecheck` (fails only in `CustomerProfilePage.tsx` until Phase 4).

### Phase 4 — Page: nav, compact bar, tab fallback

Rewrite the body of `CustomerProfilePage.tsx` (keep the DNC modal, the not-visible guard and `handleAddNoteClick` / `handleConfirmDnc` as they are):

- Imports: add `Avatar`; from `'~/modules/qa/components/ProfileShell'` import `CompactProfileBar`, `ProfileNav`, `useCompactBar`; from `'../constants'` import `CUSTOMER_TABS, CUSTOMER_TAB_GROUPS, type CustomerTab`; `import { customerAttention } from './attention';`, `import { CustomerActions } from './CustomerActions';`, `import { useSettingsStore, selectThresholds } from '~/stores/qa/settingsStore';`, `useMemo` from react. Drop the `Tabs` import.
- Tab parsing: `const isCustomerTab = (v: string | null): v is CustomerTab => CUSTOMER_TABS.some((x) => x.value === v);` at module level; `const tab: CustomerTab = isCustomerTab(rawTab) ? rawTab : 'overview';` (an unknown `?tab=` now falls back to Overview). `setTab` takes `CustomerTab`.
- `const { headerRef, compact } = useCompactBar(profile?.customer.id);` and `const lowSentiment = useSettingsStore(selectThresholds).sentiment.lowSentimentIncident;` before the early return; `const attention = useMemo(() => (profile ? customerAttention(profile, lowSentiment) : {}), [profile, lowSentiment]);`
- `navGroups` built from `CUSTOMER_TAB_GROUPS` exactly as the agent page does from `PROFILE_TAB_GROUPS` (labels via `t`, icons from `CUSTOMER_TABS`).
- `renderTab()` switch over `tab` returning the six tab components (same props as today; `TimelineTab` keeps `autoFocusNote={searchParams.get('focus') === 'note'}`), default `OverviewTab`.
- JSX inside `ContentContainer`:
  ```tsx
  <CompactProfileBar
  	visible={compact}
  	actions={<CustomerActions size='xs' doNotCall={profile.customer.doNotCall} onAddNote={handleAddNoteClick} onToggleDnc={() => setDncModalOpen(true)} />}
  >
  	<Avatar size={32} radius='md' color='gray' name={profile.customer.name} />
  	<Text fw={600} truncate>{profile.customer.name}</Text>
  	<Text fw={700}>{profile.kpis.receptivenessScore}</Text>
  	<Text size='sm' c='dimmed' visibleFrom='sm'>{t('header.receptiveness')}</Text>
  </CompactProfileBar>
  <Stack gap='lg'>
  	<Breadcrumbs>…unchanged…</Breadcrumbs>
  	<div ref={headerRef}>
  		<CustomerHeader profile={profile} onAddNote={handleAddNoteClick} onToggleDnc={() => setDncModalOpen(true)} />
  	</div>
  	<ProfileNav groups={navGroups} tab={tab} onChange={setTab} attention={attention} attentionLabel={t('tabs.attention')} />
  	<Box role='tabpanel' pt='md'>{renderTab()}</Box>
  </Stack>
  ```
  (add `Box` to the Mantine import.)

`npm run typecheck` (fails only in `OverviewTab.tsx` until Phase 5).

### Phase 5 — Overview: activity row, chart fixes

`tabs/OverviewTab.tsx`:

1. Delete the six-`StatCard` `SimpleGrid`, the `StatCard` import, the `ALERT` const, the local `NPS_DETRACTOR_MAX`, and the `useSettingsStore`/`selectThresholds` import (no longer used here). Add `import { Caption } from '~/modules/qa/coaching/components/SessionBrief';` and `import { formatDate, formatSeconds } from '~/modules/qa/team/helpers';` (`formatSeconds` is already imported from there).
2. Add an `ActivityRow` block as the first child of the returned `Stack`:
   ```tsx
   <SectionCard
   	title={t('overview.activity')}
   	description={t('overview.activityDescription', {
   		first: formatDate(kpis.firstContactAt),
   		last: formatDate(kpis.lastContactAt),
   	})}
   	padding='md'
   >
   	<SimpleGrid cols={{ base: 2, sm: 3, md: 6 }} spacing='md'>
   		{[
   			{
   				label: t('overview.kpi.contacts'),
   				value: String(kpis.totalContacts),
   			},
   			{ label: t('overview.kpi.answerRate'), value: `${kpis.answerRate}%` },
   			{
   				label: t('overview.kpi.avgDuration'),
   				value: formatSeconds(kpis.avgDurationSeconds),
   			},
   			{
   				label: t('overview.kpi.agents'),
   				value: String(kpis.agentsInvolved),
   			},
   			{
   				label: t('overview.kpi.offers'),
   				value: String(kpis.offersPresented),
   			},
   			{
   				label: t('overview.kpi.acceptance'),
   				value: `${kpis.acceptanceRate}%`,
   			},
   		].map((item) => (
   			<Stack key={item.label} gap={2}>
   				<Caption>{item.label}</Caption>
   				<Text fw={700} size='lg' lh={1.1}>
   					{item.value}
   				</Text>
   			</Stack>
   		))}
   	</SimpleGrid>
   </SectionCard>
   ```
3. Chart empty state: `<EmptyState message={t('overview.noSentiment')} />` (was the wrong `overview.windows` key).
4. The rest (chart, windows, signals) unchanged.

`npm run typecheck` must pass. Then `npx prettier --write` on the touched files only, and `npm run typecheck` once more.

---

## Files touched

- New shared: `src/modules/qa/components/ProfileShell/{ProfileNav.tsx, ProfileNav.module.css, CompactProfileBar.tsx, CompactProfileBar.module.css, useCompactBar.ts, index.ts}`
- Agent page (switch to shared): `team/AgentProfilePage/{AgentProfilePage.tsx, attention.ts}`, `team/constants.ts` (drop `profileGroupOf`); deleted `team/AgentProfilePage/{ProfileNav.tsx, ProfileNav.module.css, CompactProfileBar.tsx, AgentProfilePage.module.css}`
- Customer page: new `customers/CustomerProfilePage/{CustomerActions.tsx, CustomerDetailsPopover.tsx, HealthStrip.tsx, HealthStrip.module.css, attention.ts}`; rewritten `CustomerHeader.tsx`, `CustomerProfilePage.tsx`; edited `tabs/OverviewTab.tsx`, `customers/constants.ts`
- Locale: `src/locales/{en,es}/qa.customers.json`
- Plan copy: `docs/superpowers/plans/2026-10-12-customer-profile-health-strip-nav.md`

## Out of scope (noted)

- Contents of the Contacts, Sentiment, Offers, Surveys and Timeline tabs (their repeated chart / signals / NPS stay; a later pass can trim them).
- `ScorecardStrip` (agent) and `HealthStrip` (customer) stay separate: same CSS recipe, different tiles.
- Generalising `AgentDetailsPopover` / `CustomerDetailsPopover` into one component (rows differ; two small files are clearer).
- The customers list page and `LegacyCustomerRedirect`.

## Verification

1. `npm run typecheck` passes after Phase 5.
2. **Agent profile regression** (`/qa/supervisor/your-team/AGT-001`): nav, pill sub-nav, dots and the compact bar behave exactly as before the refactor (same groups, `?tab=coaching` deep link, bar fades in on scroll).
3. **Customer header** (`/qa/supervisor/customers/CUST-019`, Transportes Caribe; dev server only if the user asks): name + "Business" outline chip, no status chip (active), DNC badge only when flagged; line "+1 809 218 1666 · Prefers Phone · Spanish · Santo Domingo"; plan/value/customer-since/"12 contacts" line with two tags + "+N" and the info button; popover lists ID, email, city, language, channel, plan, value, dates, consent and all tags. "Add note" is filled, "Flag Do-Not-Call" outline; both still work (note → Timeline with the note field focused; DNC → confirm modal).
4. **Health strip**: ring 51 "Neutral" on the left; Churn risk "Medium" (plain), Avg. sentiment "2.8/5" with sparkline and "+0.3 vs first contacts" (no double "/5"), Latest NPS "—" with "No survey yet", Best window "Tue afternoon · 12:00–17:00 · N accepted of M"; verdict line reads "No signal needs attention." unless sentiment is under the settings threshold. Pick a customer with high churn or resistant band to see red text and the "Needs attention: …" verdict.
5. **Overview**: the six cards are gone; "Activity" row shows Contacts 12 · Answer rate 58% · Avg. duration 4:42 · Agents 3 · Offers 4 · Acceptance 50%; chart, windows and signals unchanged; a customer with no answered contact shows "No answered contact yet." under the chart title.
6. **Navigation**: three top items; Interactions shows pills Contacts / Timeline, Insights shows Sentiment & Emotion / Offers & Signals / Surveys, Overview none. `?tab=timeline&focus=note` still opens Timeline inside Interactions; `?tab=foo` falls back to Overview. Dots: a resistant/high-churn customer gets a dot on Overview; a detractor NPS on Surveys and Insights; low sentiment on Sentiment & Emotion and Insights.
7. **Compact bar**: scroll down → bar with avatar, name, "51 Receptiveness" and the two actions; hidden buttons are not tabbable.
8. Light and dark mode (strip dividers, popover, bar surface, pills) and Spanish (all new strings resolve, no raw keys); narrow width (strip stacks: gauge on top, tiles in two columns; activity row wraps to 2-3 columns).
