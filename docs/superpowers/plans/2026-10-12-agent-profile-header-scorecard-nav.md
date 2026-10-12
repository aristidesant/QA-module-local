# Agent profile: a header that answers "how is this agent doing?", one scorecard strip, grouped navigation

## Context

The agent profile (`src/modules/qa/team/AgentProfilePage/`, routes `/qa/supervisor/your-team/:agentId` and `/qa/qa-manager/teams/agents/:agentId`) holds a lot of information and shows all of it at the same weight. Before the first chart the user scrolls past, in order: a header card (identity block with about 12 facts, a score ring with three badges, a period selector, three equal buttons), a row of 10 tabs, then four dimension cards that repeat what the header just said. The header and the card row together take about 450px.

A code read changes two points of the earlier critique, so the plan uses the corrected facts:

- The page has **10 tabs**, not 11 (`PROFILE_TABS`, `constants.ts:70-85`).
- The period selector (`ProfileHeader.tsx:153-160`) looks global but its state only feeds `OverviewTab`'s "Performance over time" chart and its direction badge (`AgentProfilePage.tsx:64-67`, `OverviewTab.tsx:69`). The dimension cards and every other tab ignore it. It belongs in that chart's card, not the page header.

Decisions made with the user (2026-10-12): cover header + score strip, tab grouping, chart readability and a slim sticky bar; keep the team module's quiet color rule (color only when a score is below 70 or something needs attention, overall stays neutral); group the tabs into 4 groups; one primary action plus a "More" menu.

Mode: refinement. Mockup-level, no backend. Keep `SectionCard`, Mantine and the existing mock data. Every new component must work in light and dark mode (Mantine variables, `var(--surface-*)` tokens, no hard-coded colors, no inline styles).

---

## Critique summary

| Finding                                                                                                          | Severity | Evidence                                                     |
| ---------------------------------------------------------------------------------------------------------------- | -------- | ------------------------------------------------------------ |
| Header holds ~12 facts at 3 sizes (ID, team, supervisor, shift, 4 tag chips, tracked since, tenure, evaluations) | Moderate | `ProfileHeader.tsx:71-104`                                   |
| `ACTIVE` badge says nothing for nearly everyone; the other badge reads `LOW` with no label                       | Moderate | `ProfileHeader.tsx:74-79`                                    |
| Four equal score cards repeat the header; bars of 93 / 100 / 85 look the same; no target or trend shape          | Moderate | `DimensionScoreCard.tsx`, `OverviewTab.tsx:93-100`           |
| Rank (`#1 OF 7`) and percentile (`P100`) say the same thing                                                      | Minor    | `ProfileHeader.tsx:118-130`                                  |
| Period selector sits in the header but only drives one chart                                                     | Critical | `AgentProfilePage.tsx:64-67`, `OverviewTab.tsx:50,69`        |
| 10 flat tabs, no signal of where attention is needed                                                             | Critical | `PROFILE_TABS`, `AgentProfilePage.tsx:121-132`               |
| Chart y-axis is 0-100 but all series live between ~80 and 100, so lines overlap in one band                      | Critical | `PerformanceTrendChart.tsx:66`                               |
| Legend appears twice (toggle chips and `withLegend`); `STABLE` badge has no subject                              | Minor    | `PerformanceTrendChart.tsx:44-64`, `OverviewTab.tsx:107-113` |
| Three identical outline buttons, no primary action                                                               | Minor    | `ProfileHeader.tsx:161-183`                                  |
| Evaluations count repeats on every card (and means "this period" there, while the header's 536 is lifetime)      | Minor    | `DimensionScoreCard.tsx:49-51`, `ProfileHeader.tsx:102`      |
| Long page; the actions leave the viewport as soon as you scroll                                                  | Moderate | page layout                                                  |

What works (keep): identity, score and actions together; `TrendDelta` arrow + signed number without color; toggleable chart series; the "color only for problems" rule; deep links `?tab=coaching` from `CoachingAgentPage.tsx:161`.

---

## Direction

1. **Header = identity + actions.** Quiet two-line identity, one primary action, a "More" menu, details in a popover.
2. **Scorecard strip inside the header.** Overall score on the left; four dimension tiles (value, sparkline, delta) on the right; one verdict line under it. Replaces the four cards in the Overview tab.
3. **Grouped navigation.** 5 top-level items (Overview, Performance, Operations & wellbeing, Development, Notes), with a pill sub-nav inside groups that hold several tabs. Attention dots appear only when something needs action. URLs stay `?tab=<old value>`, so no links break.
4. **Period selector moves into the chart card** and the chart axis zooms to the data.
5. **Slim sticky bar** (avatar, name, score, actions) fades in when the header has scrolled away.

---

## Implementation plan

Execute in order; run `npm run typecheck` after each phase. Do not create tests (project rule). Do not commit unless the user asks.

Editing note: the locale JSON and some `.ts` files in this repo use tabs and can be CRLF. When an `Edit` does not match, anchor on a shorter, single-line string.

### Phase 1 — Constants, helpers, attention

**1a. `src/modules/qa/team/constants.ts`** (the file already imports `IconTrendingUp`, `IconClipboardList`, `IconHeadset`, `IconSchool`, `IconNote`). Add after `PROFILE_TABS`:

```ts
export type ProfileGroup =
	| 'overview'
	| 'performance'
	| 'wellbeing'
	| 'development'
	| 'notes';

/** The top-level navigation: one item per group; the group's tabs are its sub-nav. */
export const PROFILE_TAB_GROUPS: {
	value: ProfileGroup;
	labelKey: string;
	icon: TablerIcon;
	tabs: ProfileTab[];
}[] = [
	{
		value: 'overview',
		labelKey: 'tabs.overview',
		icon: IconTrendingUp,
		tabs: ['overview'],
	},
	{
		value: 'performance',
		labelKey: 'tabs.groups.performance',
		icon: IconClipboardList,
		tabs: ['qa', 'sentiment', 'compliance', 'business'],
	},
	{
		value: 'wellbeing',
		labelKey: 'tabs.groups.wellbeing',
		icon: IconHeadset,
		tabs: ['operations', 'burnout'],
	},
	{
		value: 'development',
		labelKey: 'tabs.groups.development',
		icon: IconSchool,
		tabs: ['coaching', 'achievements'],
	},
	{
		value: 'notes',
		labelKey: 'tabs.notes',
		icon: IconNote,
		tabs: ['notes'],
	},
];

export const profileGroupOf = (tab: ProfileTab) =>
	PROFILE_TAB_GROUPS.find((g) => g.tabs.includes(tab)) ?? PROFILE_TAB_GROUPS[0];
```

**1b. `src/modules/qa/team/helpers.ts`.** Add `DimensionScore` to the existing `import type { … } from './types'` (first lines of the file), then add after `alertSentimentColor` (about line 40):

```ts
/** A dimension as a 0-100 share, so sentiment (1-5) and the others compare on one scale. */
export const dimensionPercent = (d: DimensionScore): number =>
	d.key === 'sentiment' ? ((d.score - 1) / 4) * 100 : d.score;

/** The value as shown: sentiment keeps one decimal; every value carries its unit. */
export const formatDimensionScore = (d: DimensionScore): string =>
	`${d.key === 'sentiment' ? d.score.toFixed(1) : d.score}${DIMENSION_META[d.key].unit}`;
```

`DIMENSION_META` lives in `./constants`; extend the existing `import { NOW_ISO, PROFILE_PERIODS, SCORE_COLOR_STEPS } from './constants';` to include `DIMENSION_META`.

**1c. New `src/modules/qa/team/AgentProfilePage/attention.ts`:**

```ts
import type { AgentProfile } from '../types';
import type { ProfileTab } from '../constants';
import { dimensionPercent } from '../helpers';

export type Attention = 'warning' | 'critical';
export type AttentionMap = Partial<Record<ProfileTab, Attention>>;

const worse = (a: Attention | undefined, b: Attention): Attention =>
	a === 'critical' || b === 'critical' ? 'critical' : 'warning';

/**
 * Which tabs need a look. Same quiet rule as the rest of the module: only a
 * score below 70, an unacknowledged alert, or a burnout level above low.
 */
export const profileAttention = (
	profile: AgentProfile,
	burnoutLevel: 'low' | 'medium' | 'high'
): AttentionMap => {
	const out: AttentionMap = {};
	const open = profile.risk.alerts.filter((a) => !a.acknowledged);
	if (open.length > 0) {
		out.overview = open.some((a) => a.severity === 'critical')
			? 'critical'
			: 'warning';
	}
	for (const d of profile.dimensions) {
		if (dimensionPercent(d) < 70) out[d.key] = worse(out[d.key], 'warning');
	}
	if (burnoutLevel !== 'low') {
		out.burnout = burnoutLevel === 'high' ? 'critical' : 'warning';
	}
	return out;
};
```

Run `npm run typecheck`.

### Phase 2 — Locale keys (`src/locales/en/qa.team.json` and `es/qa.team.json`)

Add the keys below, keeping the existing ones. `header.percentile` becomes unused; remove it from both files.

`en`:

```json
"header": {
  "burnoutRisk": "Burnout risk: {{level}}",
  "more": "More",
  "details": {
    "open": "Agent details",
    "id": "ID",
    "email": "Email",
    "hireDate": "Hired",
    "trackedSince": "Tracked since",
    "campaigns": "Campaigns",
    "skills": "Skills"
  },
  "scorecard": {
    "basedOn": "Based on {{count}} evaluations this period",
    "evaluations": "{{count}} evaluations",
    "percentileHint": "Percentile {{value}} in the team"
  },
  "verdict": "Lowest dimension: {{dimension}} at {{value}} ({{delta}} vs previous)."
},
"tabs": {
  "groups": {
    "performance": "Performance",
    "wellbeing": "Operations & wellbeing",
    "development": "Development"
  },
  "attention": "Needs attention"
},
"overview": {
  "directionOver": "{{direction}} over the period"
}
```

`es`:

```json
"header": {
  "burnoutRisk": "Riesgo de burnout: {{level}}",
  "more": "Más",
  "details": {
    "open": "Detalles del agente",
    "id": "ID",
    "email": "Correo",
    "hireDate": "Ingreso",
    "trackedSince": "Monitoreado desde",
    "campaigns": "Campañas",
    "skills": "Habilidades"
  },
  "scorecard": {
    "basedOn": "Basado en {{count}} evaluaciones de este período",
    "evaluations": "{{count}} evaluaciones",
    "percentileHint": "Percentil {{value}} del equipo"
  },
  "verdict": "Dimensión más baja: {{dimension}} con {{value}} ({{delta}} vs. anterior)."
},
"tabs": {
  "groups": {
    "performance": "Desempeño",
    "wellbeing": "Operaciones y bienestar",
    "development": "Desarrollo"
  },
  "attention": "Requiere atención"
},
"overview": {
  "directionOver": "{{direction}} en el período"
}
```

(These are nested into the existing `header`, `tabs` and `overview` objects, not new top-level keys. Validate with `node -e "JSON.parse(require('fs').readFileSync('src/locales/en/qa.team.json','utf8'))"` for both languages.)

### Phase 3 — Header pieces

**3a. New `src/modules/qa/team/AgentProfilePage/ProfileActions.tsx`** (shared by the header and the sticky bar):

```tsx
import { Button, Group, Menu } from '@mantine/core';
import {
	IconBook,
	IconCalendarEvent,
	IconChevronDown,
	IconSend,
} from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';

export interface ProfileActionsProps {
	size?: 'xs' | 'sm';
	onScheduleCoaching: () => void;
	onAssignLms: () => void;
	onSendMessage: () => void;
}

/** One primary action; the other two live in a quiet menu. */
export function ProfileActions({
	size = 'sm',
	onScheduleCoaching,
	onAssignLms,
	onSendMessage,
}: ProfileActionsProps) {
	const { t } = useTranslation('qa.team');
	return (
		<Group gap='xs' wrap='nowrap'>
			<Button
				size={size}
				leftSection={<IconCalendarEvent size={16} />}
				onClick={onScheduleCoaching}
			>
				{t('header.actions.scheduleCoaching')}
			</Button>
			<Menu position='bottom-end' withinPortal>
				<Menu.Target>
					<Button
						size={size}
						variant='default'
						rightSection={<IconChevronDown size={14} />}
					>
						{t('header.more')}
					</Button>
				</Menu.Target>
				<Menu.Dropdown>
					<Menu.Item leftSection={<IconBook size={14} />} onClick={onAssignLms}>
						{t('header.actions.assignLms')}
					</Menu.Item>
					<Menu.Item
						leftSection={<IconSend size={14} />}
						onClick={onSendMessage}
					>
						{t('header.actions.sendMessage')}
					</Menu.Item>
				</Menu.Dropdown>
			</Menu>
		</Group>
	);
}
```

**3b. New `src/modules/qa/team/AgentProfilePage/AgentDetailsPopover.tsx`:**

```tsx
import { ActionIcon, Badge, Group, Popover, Stack, Text } from '@mantine/core';
import { IconInfoCircle } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import type { RosterAgent } from '../types';
import { formatDate } from '../helpers';

interface AgentDetailsPopoverProps {
	agent: RosterAgent;
	campaignNames: string[];
}

function TagList({
	label,
	items,
	variant,
}: {
	label: string;
	items: string[];
	variant: 'outline' | 'light';
}) {
	return (
		<Stack gap={4}>
			<Text size='xs' c='dimmed'>
				{label}
			</Text>
			<Group gap={6}>
				{items.map((item) => (
					<Badge key={item} variant={variant} color='gray' size='sm'>
						{item}
					</Badge>
				))}
			</Group>
		</Stack>
	);
}

/** Everything about the agent that is not needed at a glance: ID, email, dates, all campaigns and skills. */
export function AgentDetailsPopover({
	agent,
	campaignNames,
}: AgentDetailsPopoverProps) {
	const { t } = useTranslation('qa.team');
	const rows = [
		{ label: t('header.details.id'), value: agent.id },
		{ label: t('header.details.email'), value: agent.email },
		{ label: t('header.details.hireDate'), value: formatDate(agent.hireDate) },
		{
			label: t('header.details.trackedSince'),
			value: formatDate(agent.trackedSince),
		},
	];
	return (
		<Popover width={320} position='bottom-start' withArrow shadow='md'>
			<Popover.Target>
				<ActionIcon
					variant='subtle'
					color='gray'
					size='sm'
					aria-label={t('header.details.open')}
				>
					<IconInfoCircle size={16} />
				</ActionIcon>
			</Popover.Target>
			<Popover.Dropdown>
				<Stack gap='sm'>
					{rows.map((row) => (
						<Group key={row.label} justify='space-between' wrap='nowrap'>
							<Text size='xs' c='dimmed'>
								{row.label}
							</Text>
							<Text size='sm'>{row.value}</Text>
						</Group>
					))}
					{campaignNames.length > 0 && (
						<TagList
							label={t('header.details.campaigns')}
							items={campaignNames}
							variant='outline'
						/>
					)}
					{agent.skills.length > 0 && (
						<TagList
							label={t('header.details.skills')}
							items={agent.skills}
							variant='light'
						/>
					)}
				</Stack>
			</Popover.Dropdown>
		</Popover>
	);
}
```

**3c. New `src/modules/qa/team/AgentProfilePage/ScorecardStrip.tsx` + `ScorecardStrip.module.css`:**

```tsx
import { ActionIcon, Group, Stack, Text, Tooltip } from '@mantine/core';
import { Sparkline } from '@mantine/charts';
import { IconInfoCircle } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { Caption } from '~/modules/qa/coaching/components/SessionBrief';
import { weakestDimension } from '~/modules/qa/coaching/helpers';
import type { AgentProfile, DimensionScore } from '../types';
import { DIMENSION_META, DIMENSION_ORDER } from '../constants';
import {
	alertScoreColor,
	dimensionPercent,
	formatDimensionScore,
	trendDelta,
} from '../helpers';
import { ScoreRing } from '../components/ScoreRing';
import { TrendDelta } from '../components/TrendDelta';
import styles from './ScorecardStrip.module.css';

interface DimensionTileProps {
	dimension: DimensionScore;
	series: number[];
	showEvaluations: boolean;
}

function DimensionTile({
	dimension,
	series,
	showEvaluations,
}: DimensionTileProps) {
	const { t } = useTranslation('qa.team');
	const meta = DIMENSION_META[dimension.key];
	const Icon = meta.icon;
	const alert = alertScoreColor(dimensionPercent(dimension));
	return (
		<div className={styles.tile}>
			<Group gap={6} wrap='nowrap'>
				<Icon size={14} color='var(--mantine-color-dimmed)' aria-hidden />
				<Caption>{t(meta.labelKey)}</Caption>
			</Group>
			<Text fw={700} size='xl' lh={1.1} c={alert}>
				{formatDimensionScore(dimension)}
			</Text>
			<Sparkline
				h={24}
				data={series}
				color={alert ? `${alert}.6` : 'gray.6'}
				fillOpacity={0.12}
				strokeWidth={1.5}
				curveType='monotone'
			/>
			<TrendDelta
				delta={dimension.delta}
				trend={dimension.trend}
				unit={dimension.key === 'sentiment' ? '/5' : '%'}
				suffix={t('common.vsPrevious')}
			/>
			{showEvaluations && (
				<Text size='xs' c='dimmed'>
					{t('header.scorecard.evaluations', { count: dimension.evaluations })}
				</Text>
			)}
		</div>
	);
}

interface ScorecardStripProps {
	profile: AgentProfile;
}

/** Overall score on the left, the four dimensions beside it, and one line saying which is lowest. */
export function ScorecardStrip({ profile }: ScorecardStripProps) {
	const { t } = useTranslation('qa.team');
	const { overall, dimensions } = profile;
	const last12 = profile.performance.slice(-12);

	// The most common evaluation count is stated once; a tile repeats it only when it differs.
	const counts = dimensions.map((d) => d.evaluations);
	const base = [...counts].sort(
		(a, b) =>
			counts.filter((c) => c === b).length -
			counts.filter((c) => c === a).length
	)[0];

	const weakest = weakestDimension(profile);
	const weights = t('header.weights', {
		qa: overall.weights.qa,
		sentiment: overall.weights.sentiment,
		compliance: overall.weights.compliance,
		business: overall.weights.business,
	});

	return (
		<Stack gap='sm'>
			<div className={styles.strip}>
				<Group gap='md' wrap='nowrap' className={styles.overall}>
					<ScoreRing
						value={overall.score}
						size={88}
						thickness={9}
						color={alertScoreColor(overall.score) ?? 'gray.6'}
					/>
					<Stack gap={4}>
						<Caption>{t('header.overall')}</Caption>
						<Group gap={4} wrap='nowrap'>
							<Tooltip
								label={t('header.scorecard.percentileHint', {
									value: overall.percentile,
								})}
							>
								<Text fw={700} size='lg'>
									{t('header.rank', {
										rank: overall.rankInTeam,
										size: overall.teamSize,
									})}
								</Text>
							</Tooltip>
							<Tooltip label={weights} multiline maw={260}>
								<ActionIcon
									variant='transparent'
									color='gray'
									size='xs'
									aria-label={weights}
								>
									<IconInfoCircle size={14} />
								</ActionIcon>
							</Tooltip>
						</Group>
						<TrendDelta
							delta={overall.delta}
							trend={overall.trend}
							unit=''
							suffix={t('header.vsPrevious')}
						/>
					</Stack>
				</Group>

				<div className={styles.tiles}>
					{DIMENSION_ORDER.map((key) => {
						const dimension = dimensions.find((d) => d.key === key);
						if (!dimension) return null;
						return (
							<DimensionTile
								key={key}
								dimension={dimension}
								series={last12.map((p) => p[key])}
								showEvaluations={dimension.evaluations !== base}
							/>
						);
					})}
				</div>
			</div>

			<Group justify='space-between' gap='sm' wrap='wrap'>
				{weakest && (
					<Text size='sm'>
						{t('header.verdict', {
							dimension: t(DIMENSION_META[weakest.key].labelKey),
							value: formatDimensionScore(weakest),
							delta: trendDelta(
								weakest.delta,
								weakest.key === 'sentiment' ? '/5' : '%'
							),
						})}
					</Text>
				)}
				<Text size='xs' c='dimmed'>
					{t('header.scorecard.basedOn', { count: base })}
				</Text>
			</Group>
		</Stack>
	);
}
```

`ScorecardStrip.module.css`:

```css
.strip {
	display: grid;
	grid-template-columns: auto minmax(0, 1fr);
	gap: var(--mantine-spacing-lg);
	align-items: center;
}

.overall {
	padding-right: var(--mantine-spacing-lg);
	border-right: 1px solid var(--surface-border);
}

.tiles {
	display: grid;
	grid-template-columns: repeat(4, minmax(0, 1fr));
}

.tile {
	display: flex;
	flex-direction: column;
	gap: 6px;
	min-width: 0;
	padding-inline: var(--mantine-spacing-md);
}

.tile + .tile {
	border-left: 1px solid var(--surface-border);
}

@media (max-width: 62em) {
	.strip {
		grid-template-columns: 1fr;
	}

	.overall {
		padding-right: 0;
		padding-bottom: var(--mantine-spacing-md);
		border-right: none;
		border-bottom: 1px solid var(--surface-border);
	}

	.tiles {
		grid-template-columns: repeat(2, minmax(0, 1fr));
		row-gap: var(--mantine-spacing-md);
	}

	.tile {
		padding-inline: 0;
	}

	.tile + .tile {
		border-left: none;
	}
}
```

If `DIMENSION_ORDER` is not exported from `../constants`, it is: `OverviewTab.tsx:42` imports it from there.

**3d. Rewrite `src/modules/qa/team/AgentProfilePage/ProfileHeader.tsx`:**

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
import { useTranslation } from 'react-i18next';
import { SectionCard } from '~/components/SectionCard';
import type { AgentProfile } from '../types';
import { TEAM_CAMPAIGNS } from '../mockData';
import { formatTenure } from '../helpers';
import { AgentDetailsPopover } from './AgentDetailsPopover';
import { ProfileActions, type ProfileActionsProps } from './ProfileActions';
import { ScorecardStrip } from './ScorecardStrip';

/** Burnout is the only status that earns colour, and only when it is a concern. */
const BURNOUT_COLOR = { low: 'gray', medium: 'yellow', high: 'red' } as const;
/** How many tags show beside the name before "+N". */
const VISIBLE_TAGS = 2;

interface ProfileHeaderProps extends Omit<ProfileActionsProps, 'size'> {
	profile: AgentProfile;
	burnoutLevel: 'low' | 'medium' | 'high';
}

export function ProfileHeader({
	profile,
	burnoutLevel,
	onScheduleCoaching,
	onAssignLms,
	onSendMessage,
}: ProfileHeaderProps) {
	const { t } = useTranslation('qa.team');
	const { agent } = profile;
	const campaignNames = agent.campaignIds
		.map((id) => TEAM_CAMPAIGNS.find((c) => c.id === id)?.name)
		.filter((name): name is string => Boolean(name));
	const tags = [...campaignNames, ...agent.skills];
	const hiddenTags = Math.max(0, tags.length - VISIBLE_TAGS);

	return (
		<SectionCard padding='lg'>
			<Stack gap='md'>
				<Group justify='space-between' align='flex-start' wrap='wrap'>
					<Group gap='md' align='flex-start' wrap='nowrap'>
						<Avatar size={56} radius='md' color='gray' name={agent.name} />
						<Stack gap={4}>
							<Group gap='xs'>
								<Title order={2}>{agent.name}</Title>
								{agent.status !== 'active' && (
									<Badge variant='light' color='gray'>
										{t(`status.${agent.status}`)}
									</Badge>
								)}
								{burnoutLevel !== 'low' && (
									<Badge variant='dot' color={BURNOUT_COLOR[burnoutLevel]}>
										{t('header.burnoutRisk', {
											level: t(`burnout.${burnoutLevel}`),
										})}
									</Badge>
								)}
							</Group>
							<Text size='sm' c='dimmed'>
								{agent.team} · {agent.supervisorName} ·{' '}
								{t(`header.shift.${agent.shift}`)}
							</Text>
							<Group gap={6} wrap='wrap'>
								{tags.slice(0, VISIBLE_TAGS).map((tag) => (
									<Badge key={tag} variant='light' color='gray' size='sm'>
										{tag}
									</Badge>
								))}
								{hiddenTags > 0 && (
									<Badge variant='outline' color='gray' size='sm'>
										+{hiddenTags}
									</Badge>
								)}
								<Text size='xs' c='dimmed'>
									{t('header.tenure', { tenure: formatTenure(agent.hireDate) })}{' '}
									· {t('header.evaluations', { count: profile.qa.evaluations })}
								</Text>
								<AgentDetailsPopover
									agent={agent}
									campaignNames={campaignNames}
								/>
							</Group>
						</Stack>
					</Group>

					<ProfileActions
						onScheduleCoaching={onScheduleCoaching}
						onAssignLms={onAssignLms}
						onSendMessage={onSendMessage}
					/>
				</Group>

				<Divider />

				<ScorecardStrip profile={profile} />
			</Stack>
		</SectionCard>
	);
}
```

Removed on purpose: the period selector, the percentile badge (now a tooltip on the rank), the always-visible `ACTIVE` and `LOW` badges, the ID and "tracked since" lines (now in the popover), the `role` prop (it was never used).

Run `npm run typecheck` (it will fail in `AgentProfilePage.tsx` until Phase 5; that is expected, continue).

### Phase 4 — Grouped navigation

**4a. New `src/modules/qa/team/AgentProfilePage/ProfileNav.module.css`:**

```css
.dot {
	display: inline-block;
	width: 8px;
	height: 8px;
	border-radius: 50%;
	background: var(--mantine-color-yellow-filled);
}

.dot[data-level='critical'] {
	background: var(--mantine-color-red-filled);
}
```

**4b. New `src/modules/qa/team/AgentProfilePage/ProfileNav.tsx`:**

```tsx
import { Stack, Tabs } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import {
	PROFILE_TABS,
	PROFILE_TAB_GROUPS,
	profileGroupOf,
	type ProfileTab,
} from '../constants';
import type { Attention, AttentionMap } from './attention';
import styles from './ProfileNav.module.css';

interface ProfileNavProps {
	tab: ProfileTab;
	onChange: (tab: ProfileTab) => void;
	attention: AttentionMap;
}

/** The worst level among a set of tabs, or undefined when none needs a look. */
const worstOf = (
	tabs: ProfileTab[],
	attention: AttentionMap
): Attention | undefined => {
	const levels = tabs.map((tab) => attention[tab]);
	return levels.includes('critical')
		? 'critical'
		: levels.includes('warning')
			? 'warning'
			: undefined;
};

/** Five groups on top; inside a group with several tabs, a pill row to move between them. */
export function ProfileNav({ tab, onChange, attention }: ProfileNavProps) {
	const { t } = useTranslation('qa.team');
	const group = profileGroupOf(tab);

	const dot = (level: Attention | undefined) =>
		level ? (
			<span
				className={styles.dot}
				data-level={level}
				role='img'
				aria-label={t('tabs.attention')}
			/>
		) : undefined;

	return (
		<Stack gap='xs'>
			<Tabs
				value={group.value}
				onChange={(value) => {
					const next = PROFILE_TAB_GROUPS.find((g) => g.value === value);
					if (next) onChange(next.tabs[0]);
				}}
			>
				<Tabs.List>
					{PROFILE_TAB_GROUPS.map(({ value, labelKey, icon: Icon, tabs }) => (
						<Tabs.Tab
							key={value}
							value={value}
							leftSection={<Icon size={16} />}
							rightSection={dot(worstOf(tabs, attention))}
						>
							{t(labelKey)}
						</Tabs.Tab>
					))}
				</Tabs.List>
			</Tabs>

			{group.tabs.length > 1 && (
				<Tabs
					variant='pills'
					value={tab}
					onChange={(value) => value && onChange(value as ProfileTab)}
				>
					<Tabs.List>
						{group.tabs.map((value) => {
							const Icon = PROFILE_TABS.find((x) => x.value === value)?.icon;
							return (
								<Tabs.Tab
									key={value}
									value={value}
									leftSection={Icon ? <Icon size={14} /> : undefined}
									rightSection={dot(attention[value])}
								>
									{t(`tabs.${value}`)}
								</Tabs.Tab>
							);
						})}
					</Tabs.List>
				</Tabs>
			)}
		</Stack>
	);
}
```

Selecting a group opens its first tab. `?tab=` keeps carrying the old tab value, so `CoachingAgentPage.tsx:161` (`?tab=coaching`) still lands on Coaching & LMS inside the Development group.

### Phase 5 — The page, the sticky bar, tab content

**5a. `src/modules/qa/team/AgentProfilePage/AgentProfilePage.module.css`.** Replace the unused `.stickyHeader` rule with:

```css
/* A zero-height anchor that sticks to the top of the scrolling content; the bar floats over the page. */
.compactAnchor {
	position: sticky;
	top: 0;
	z-index: 20;
	height: 0;
}

.compactBar {
	position: absolute;
	inset-inline: 0;
	top: 0;
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: var(--mantine-spacing-md);
	padding: var(--mantine-spacing-xs) var(--mantine-spacing-md);
	background: var(--surface-card);
	border: 1px solid var(--surface-border);
	border-radius: var(--mantine-radius-md);
	box-shadow: var(--mantine-shadow-sm);
	opacity: 0;
	visibility: hidden;
	transform: translateY(-8px);
	transition:
		opacity 150ms ease,
		transform 150ms ease,
		visibility 0s linear 150ms;
}

.compactBar[data-visible] {
	opacity: 1;
	visibility: visible;
	transform: none;
	transition-delay: 0s;
}

@media (prefers-reduced-motion: reduce) {
	.compactBar {
		transition: none;
	}
}
```

**5b. New `src/modules/qa/team/AgentProfilePage/CompactProfileBar.tsx`:**

```tsx
import { Avatar, Group, Text } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import type { AgentProfile } from '../types';
import { ProfileActions, type ProfileActionsProps } from './ProfileActions';
import styles from './AgentProfilePage.module.css';

interface CompactProfileBarProps extends Omit<ProfileActionsProps, 'size'> {
	profile: AgentProfile;
	/** True once the full header has scrolled out of view. */
	visible: boolean;
}

/** Avatar, name, score and the actions, kept in reach while the long profile scrolls. */
export function CompactProfileBar({
	profile,
	visible,
	...actions
}: CompactProfileBarProps) {
	const { t } = useTranslation('qa.team');
	const { agent, overall } = profile;
	return (
		<div className={styles.compactAnchor}>
			<div
				className={styles.compactBar}
				data-visible={visible || undefined}
				aria-hidden={!visible}
			>
				<Group gap='sm' wrap='nowrap' miw={0}>
					<Avatar size={32} radius='md' color='gray' name={agent.name} />
					<Text fw={600} truncate>
						{agent.name}
					</Text>
					<Text fw={700}>{overall.score}</Text>
					<Text size='sm' c='dimmed' visibleFrom='sm'>
						{t('header.rank', {
							rank: overall.rankInTeam,
							size: overall.teamSize,
						})}
					</Text>
				</Group>
				<ProfileActions size='xs' {...actions} />
			</div>
		</div>
	);
}
```

**5c. Rewrite `src/modules/qa/team/AgentProfilePage/AgentProfilePage.tsx`** (full file). The period state, `points` and `filterByPeriod` leave the page (the Overview tab owns them now); the burnout level is computed here because the header, the nav dots and the tabs all need it.

```tsx
import { useEffect, useMemo, useRef, useState } from 'react';
import {
	useLocation,
	useNavigate,
	useParams,
	useSearchParams,
} from 'react-router';
import { useTranslation } from 'react-i18next';
import { Anchor, Box, Breadcrumbs, Button, Stack, Text } from '@mantine/core';
import { ContentContainer } from '~/components/ContentContainer';
import { EmptyState } from '~/components/EmptyState/EmptyState';
import { useTeamStore, selectProfile } from '~/stores/qa/teamStore';
import {
	useTriggerRulesStore,
	selectTriggerRules,
} from '~/stores/qa/triggerRulesStore';
import { assessBurnout } from '~/modules/qa/analytics/helpers';
import {
	PROFILE_TAB_GROUPS,
	SUPERVISOR_PERSONA,
	type ProfileTab,
} from '../constants';
import { roleFromPath, teamBasePath } from '../helpers';
import { ProfileHeader } from './ProfileHeader';
import { ProfileNav } from './ProfileNav';
import { CompactProfileBar } from './CompactProfileBar';
import { profileAttention } from './attention';
import { OverviewTab } from './tabs/OverviewTab';
import { QATab } from './tabs/QATab';
import { SentimentTab } from './tabs/SentimentTab';
import { ComplianceTab } from './tabs/ComplianceTab';
import { BusinessTab } from './tabs/BusinessTab';
import { OperationsTab } from './tabs/OperationsTab';
import { BurnoutTab } from './tabs/BurnoutTab';
import { CoachingLmsTab } from './tabs/CoachingLmsTab';
import { AchievementsTab } from './tabs/AchievementsTab';
import { NotesTab } from './tabs/NotesTab';
import { coachingSessionNewPath } from '~/modules/qa/coaching/constants';
import { AssignContentDrawer } from '~/modules/qa/lms/components/AssignContentDrawer';
import { SendMessageModal } from '../components/modals/SendMessageModal';

const isProfileTab = (value: string | null): value is ProfileTab =>
	PROFILE_TAB_GROUPS.some((g) => g.tabs.includes(value as ProfileTab));

export default function AgentProfilePage() {
	const { t } = useTranslation('qa.team');
	const navigate = useNavigate();
	const location = useLocation();
	const { agentId } = useParams<{ agentId: string }>();
	const role = roleFromPath(location.pathname);
	const profile = useTeamStore(selectProfile(agentId));
	const triggerRules = useTriggerRulesStore(selectTriggerRules);
	const [searchParams, setSearchParams] = useSearchParams();
	const [lmsOpen, setLmsOpen] = useState(false);
	const [messageOpen, setMessageOpen] = useState(false);

	// The compact bar shows once the full header has scrolled out of the content area.
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
	}, [profile?.agent.id]);

	const rawTab = searchParams.get('tab');
	const tab: ProfileTab = isProfileTab(rawTab) ? rawTab : 'overview';
	const setTab = (value: ProfileTab) => {
		setSearchParams(
			(prev) => {
				const next = new URLSearchParams(prev);
				next.set('tab', value);
				return next;
			},
			{ replace: true }
		);
	};

	const notVisible =
		profile &&
		role === 'supervisor' &&
		profile.agent.supervisorId !== SUPERVISOR_PERSONA.id;

	// The level follows the burnout rules in Triggers.
	const burnoutLevel = useMemo(
		() =>
			profile ? assessBurnout(profile.agent.id, triggerRules).level : 'low',
		[profile, triggerRules]
	);
	const attention = useMemo(
		() => (profile ? profileAttention(profile, burnoutLevel) : {}),
		[profile, burnoutLevel]
	);

	const scheduleCoaching = () =>
		navigate(coachingSessionNewPath(role, { agent: profile?.agent.id }));

	if (!profile || notVisible) {
		return (
			<ContentContainer contentWidth='full'>
				<EmptyState
					message={t('common.notFound')}
					description={t('common.notFoundDescription', { id: agentId })}
					action={
						<Button onClick={() => navigate(teamBasePath(role))}>
							{t('header.back')}
						</Button>
					}
				/>
			</ContentContainer>
		);
	}

	const renderTab = () => {
		switch (tab) {
			case 'qa':
				return <QATab profile={profile} />;
			case 'sentiment':
				return <SentimentTab profile={profile} />;
			case 'compliance':
				return <ComplianceTab profile={profile} />;
			case 'business':
				return <BusinessTab profile={profile} />;
			case 'operations':
				return <OperationsTab profile={profile} />;
			case 'burnout':
				return (
					<BurnoutTab
						profile={profile}
						role={role}
						onScheduleCoaching={scheduleCoaching}
					/>
				);
			case 'coaching':
				return (
					<CoachingLmsTab
						profile={profile}
						onScheduleCoaching={scheduleCoaching}
						onAssignLms={() => setLmsOpen(true)}
					/>
				);
			case 'achievements':
				return <AchievementsTab profile={profile} />;
			case 'notes':
				return <NotesTab profile={profile} role={role} />;
			default:
				return <OverviewTab profile={profile} />;
		}
	};

	const actions = {
		onScheduleCoaching: scheduleCoaching,
		onAssignLms: () => setLmsOpen(true),
		onSendMessage: () => setMessageOpen(true),
	};

	return (
		<ContentContainer
			contentWidth='full'
			showBackButton
			onBackClick={() => navigate(teamBasePath(role))}
		>
			<CompactProfileBar
				profile={profile}
				visible={!headerVisible}
				{...actions}
			/>
			<Stack gap='lg'>
				<Breadcrumbs>
					<Anchor onClick={() => navigate(teamBasePath(role))}>
						{t(role === 'qa-manager' ? 'teams.list.title' : 'team.title')}
					</Anchor>
					{role === 'qa-manager' && (
						<Anchor
							onClick={() =>
								navigate(`/qa/qa-manager/teams/${profile.agent.supervisorId}`)
							}
						>
							{profile.agent.team}
						</Anchor>
					)}
					<Text c='dimmed'>{profile.agent.name}</Text>
				</Breadcrumbs>

				<div ref={headerRef}>
					<ProfileHeader
						profile={profile}
						burnoutLevel={burnoutLevel}
						{...actions}
					/>
				</div>

				<ProfileNav tab={tab} onChange={setTab} attention={attention} />

				<Box role='tabpanel' pt='md'>
					{renderTab()}
				</Box>
			</Stack>

			<AssignContentDrawer
				opened={lmsOpen}
				onClose={() => setLmsOpen(false)}
				role={role}
				preset={{ agentIds: [profile.agent.id] }}
			/>
			<SendMessageModal
				agentId={profile.agent.id}
				role={role}
				opened={messageOpen}
				onClose={() => setMessageOpen(false)}
			/>
		</ContentContainer>
	);
}
```

Behavior notes: an invalid `?tab=` now falls back to Overview (it used to render a blank panel). The tab content still mounts only when active, as `keepMounted={false}` did.

Run `npm run typecheck`; it fails only in `OverviewTab.tsx` (props changed) until Phase 6.

### Phase 6 — Overview tab and chart

**6a. `src/modules/qa/team/AgentProfilePage/tabs/OverviewTab.tsx`:**

1. Imports: from `@mantine/core` add `SegmentedControl`; change the types import to `import type { AgentProfile, ProfilePeriod } from '../../types';` (drop `PerformancePoint`); replace `import { DIMENSION_ORDER } from '../../constants';` with `import { PROFILE_PERIODS } from '../../constants';`; change `import { formatDateTime, periodDirection } from '../../helpers';` to `import { filterByPeriod, formatDateTime, periodDirection } from '../../helpers';`; delete `import { DimensionScoreCard } from '../../components/DimensionScoreCard';`.
2. Props and state:

   ```tsx
   interface OverviewTabProps {
   	profile: AgentProfile;
   }

   export function OverviewTab({ profile }: OverviewTabProps) {
   	const { t } = useTranslation('qa.team');
   	const navigate = useNavigate();
   	// The period only drives the trend chart, so it lives here beside the chart.
   	const [period, setPeriod] = useState<ProfilePeriod>('12m');
   	const points = useMemo(
   		() => filterByPeriod(profile.performance, period),
   		[profile.performance, period]
   	);
   ```

   (keep the rest of the existing state: `visible`, `dir`, `DirIcon`, etc., after these lines).

3. Delete the whole `<SimpleGrid cols={{ base: 2, md: 4 }} spacing='md'> … DimensionScoreCard … </SimpleGrid>` block at the top of the returned `Stack`.
4. In the "Performance over time" `SectionCard`, replace `headerActions` with:
   ```tsx
   headerActions={
   	<Group gap='sm' wrap='wrap'>
   		<SegmentedControl
   			size='xs'
   			value={period}
   			onChange={(v) => setPeriod(v as ProfilePeriod)}
   			data={PROFILE_PERIODS.map((p) => ({
   				value: p.value,
   				label: t(p.labelKey),
   			}))}
   		/>
   		<Badge
   			color='gray'
   			variant='light'
   			leftSection={<DirIcon size={12} />}
   		>
   			{t('overview.directionOver', {
   				direction: t(`overview.direction.${dir.trend}`),
   			})}
   		</Badge>
   	</Group>
   }
   ```
   (`Group` and `Badge` are already imported.)

**6b. `src/modules/qa/team/components/PerformanceTrendChart.tsx`:** zoom the axis to the data and drop the duplicate legend. After the `series` constant add:

```tsx
// Zoom the axis to where the data lives, in steps of 10, so the lines separate.
const shown = points.flatMap((p) =>
	SERIES_ORDER.filter((k) => visible[k]).map((k) => p[k])
);
const domainMin =
	shown.length > 0
		? Math.max(0, Math.floor((Math.min(...shown) - 5) / 10) * 10)
		: 0;
```

Then in `<LineChart … />` replace `withLegend` (delete the prop) and `yAxisProps={{ domain: [0, 100] }}` with `yAxisProps={{ domain: [domainMin, 100] }}`. The toggle chips stay as the legend (each chip carries its line's hue).

**6c. Delete `src/modules/qa/team/components/DimensionScoreCard.tsx`.** Its only importer was `OverviewTab.tsx` (confirm with `Grep DimensionScoreCard src`; expect zero hits).

Run `npm run typecheck` (must pass) and `npx prettier --write` on the new/edited files **only** (list them explicitly; running Prettier on a whole folder rewrites line endings of untouched files, as happened on the rankings folder).

---

## Files touched

- New (`src/modules/qa/team/AgentProfilePage/`): `ProfileActions.tsx`, `AgentDetailsPopover.tsx`, `ScorecardStrip.tsx`, `ScorecardStrip.module.css`, `ProfileNav.tsx`, `ProfileNav.module.css`, `CompactProfileBar.tsx`, `attention.ts`
- Rewritten: `ProfileHeader.tsx`, `AgentProfilePage.tsx`
- Edited: `AgentProfilePage.module.css`, `tabs/OverviewTab.tsx`, `src/modules/qa/team/constants.ts`, `src/modules/qa/team/helpers.ts`, `src/modules/qa/team/components/PerformanceTrendChart.tsx`, `src/locales/{en,es}/qa.team.json`
- Deleted: `src/modules/qa/team/components/DimensionScoreCard.tsx`

## Out of scope (noted)

- The content of the other eight tabs (QA, Sentiment, Compliance, Business, Operations, Burnout, Coaching & LMS, Achievements, Notes).
- Making the other tabs respond to a period. If they should, that is a separate plan; today the selector only affects the Overview chart.
- Sticky tab navigation (only the slim bar is sticky).
- A per-tab "last visited" memory when switching groups (selecting a group opens its first tab).
- The customer profile page (`CustomerHeader`), which has a similar header.
- Tooling note: the working tree already contains commits and edits from other plans; do not reformat unrelated files.

## Verification

1. `npm run typecheck` passes.
2. Open `/qa/supervisor/your-team/AGT-001` (Sarah Johnson) at desktop width (dev server only if the user asks; DESIGN_ROLE.md keeps it off otherwise):
   - Header: name only (no `ACTIVE`, no `LOW`), one meta line, two tags + `+N`, tenure and evaluations, an info button that opens the details popover with ID, email, dates, all campaigns and skills.
   - One filled "Schedule coaching" button and a "More" menu with Assign material and Send message (both still open the drawer / modal).
   - Scorecard strip: ring + `#1 of 7` (tooltip shows percentile; info icon shows weights), four tiles with sparklines and deltas, the verdict line ("Lowest dimension: Conversion rate at 85% (+5% vs previous)") and "Based on 32 evaluations this period"; only the conversion tile shows its own 19 evaluations.
   - The four old cards are gone from Overview; the Performance chart has the period selector in its header, a zoomed y-axis (about 70-100), no second legend, and "Stable over the period".
3. Navigation: five top items; Performance shows a pill row (QA, Sentiment & Emotion, Compliance, Business Insights); Operations & wellbeing and Development show two pills each; Overview and Notes show none. `?tab=coaching` opens Development > Coaching & LMS; `?tab=foo` falls back to Overview. Attention dots: set an agent with a score below 70, an open alert or a medium/high burnout level (for example via Triggers) and confirm the dot on the matching tab and its group; none for Sarah.
4. Sticky bar: scroll down in the Overview; the bar fades in at the top with avatar, name, score, rank and the two action controls; scroll back up and it hides; Tab key cannot reach its buttons while hidden.
5. Header in a status case: an agent whose status is not active shows the status badge; one with medium/high burnout shows "Burnout risk: Medium" with a yellow dot.
6. Light and dark mode (strip dividers, popover, sticky bar surface, pill sub-nav), Spanish (all new strings resolve), and narrow widths (strip stacks under 62em: ring on top, tiles in 2 columns; header actions wrap).
