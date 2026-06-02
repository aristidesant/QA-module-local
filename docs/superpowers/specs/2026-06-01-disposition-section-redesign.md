# DispositionSection Redesign

**Date:** 2026-06-01  
**Status:** Approved

## Goal

Redesign `DispositionSection` to be more helpful and user-friendly across all states: empty, loading, error, and populated. The primary improvements are a contextual empty state, a stats summary bar, a conditional warning banner for flagged nodes, and a cleaner visual hierarchy throughout.

## Architecture

The redesign adds one new component and an inline empty-state component. All existing sub-components (`DispositionViewer`, `NodeDetailPanel`, `DispositionForm`, `dispositionStore`) are unchanged.

```
DispositionSection               ← thin orchestrator (unchanged contract)
├── [loading]  → Skeleton        ← same shape as new populated layout
├── [error]    → Paper           ← existing error state (no change)
├── [empty]    → DispositionEmptyState  ← new, inline in DispositionSection.tsx
└── [has flow] → DispositionSummaryCard ← new file
                 ├── StatsBar           ← inline sub-component
                 ├── WarningBanner      ← conditional, inline sub-component
                 └── DispositionViewer  ← existing, unchanged
```

**Files changed:**

- `DispositionSection/DispositionSection.tsx` — refactored to use new components
- `DispositionSection/DispositionSection.module.css` — updated empty state styles
- `DispositionSection/DispositionSummaryCard/DispositionSummaryCard.tsx` — new
- `DispositionSection/DispositionSummaryCard/DispositionSummaryCard.module.css` — new

## State Designs

### Empty State

Replaces the current icon + two-line text block with a two-column contextual layout inside the existing dashed `Paper`.

**Left column:** `IconSitemap` (muted, size 40), heading "Configure call outcomes", then 2 sentences: "Outcome flows define what happens after every call. Map answered, voicemail, busy, and do-not-call results so your team always knows the next action."

**Right column:** Three-item bullet list of what the user will configure:

1. Pick a catalog (the source of available outcomes)
2. Build the outcome tree (drag nodes into your flow)
3. Set behaviors (reschedule, do-not-call, invalidate number)

Below the bullets: the existing "Add outcome" CTA button (`primary` action, `kind: 'add'`).

On mobile (`< 768px`): columns stack vertically, right column comes second.

### Loading State

Skeleton shape mirrors the new populated layout: a `SimpleGrid` row of 3 chip skeletons at the top, then the existing node list skeleton below.

### Error State

No change from current implementation.

### Populated State — StatsBar

A `SimpleGrid cols={{ base: 2, sm: 4 }}` row of stat chips rendered inside a light-background `Paper` with border. Each chip: bold number + muted label.

| Chip | Label       | Value                                                                                              |
| ---- | ----------- | -------------------------------------------------------------------------------------------------- |
| 1    | Total nodes | `countAllNodes(dispositionNodes)` — recursive count                                                |
| 2    | Groups      | count of non-leaf nodes (nodes with children)                                                      |
| 3    | Outcomes    | count of leaf nodes (nodes without children)                                                       |
| 4    | Flagged     | count of nodes where `doNotCall \|\| isAbandoned \|\| isInvalidatesNumber \|\| requiresReschedule` |

The "Flagged" chip uses `color='yellow'` when count > 0, otherwise renders in the default gray tone.

**Helper:** `computeFlowStats(nodes: DispositionNode[]): FlowStats` — pure function, co-located in `DispositionSummaryCard.tsx`. Walks the tree recursively.

### Populated State — WarningBanner

Rendered only when `stats.flagged > 0`.

Mantine `Alert`, `color='yellow'`, `variant='light'`, `icon=<IconAlertTriangle />`.

Message: `"{{count}} outcome(s) have behavioral flags — review them before activating this campaign."` (i18n key: `disposition.summary.warningBanner`)

No action button. Users click individual nodes in the tree below to open the detail panel.

### Populated State — Tree

`DispositionViewer` passed through with the existing `flow` prop. No changes. Its internal `max-height` scroll behavior is preserved.

## Data / Logic

`computeFlowStats` walks `DispositionNode[]` recursively:

```ts
interface FlowStats {
	total: number;
	groups: number;
	outcomes: number;
	flagged: number;
}

function computeFlowStats(nodes: DispositionNode[]): FlowStats;
```

A node is a **leaf** if `!node.children || node.children.length === 0`.  
A node is **flagged** if any of: `doNotCall`, `do_not_call`, `isAbandoned`, `isInvalidatesNumber`, `requiresReschedule` is truthy.

The function is pure with no side effects — safe to call during render.

## i18n Additions

New keys in `src/locales/en/campaign.form.outcomes.json` under `disposition.summary`:

```json
"summary": {
  "totalNodes": "Total nodes",
  "groups": "Groups",
  "outcomes": "Outcomes",
  "flagged": "Flagged",
  "warningBanner": "{{count}} outcome(s) have behavioral flags — review them before activating this campaign."
}
```

New keys under `disposition.emptyState` (replaces existing `noFlowConfigured` / `noFlowDescription` usage in the empty branch):

```json
"emptyState": {
  "heading": "Configure call outcomes",
  "body": "Outcome flows define what happens after every call. Map answered, voicemail, busy, and do-not-call results so your team always knows the next action.",
  "step1": "Pick a catalog — the source of available outcomes",
  "step2": "Build the outcome tree — drag nodes into your flow",
  "step3": "Set behaviors — reschedule, do-not-call, invalidate number"
}
```

Existing keys `disposition.noFlowConfigured` and `disposition.noFlowDescription` remain in place (used elsewhere or in tests).

## Out of Scope

- Changes to `DispositionForm`, `DispositionBuilder`, `DispositionCatalogMenu`, or `NodeDetailPanel`
- Changes to how the fullscreen modal is opened or closed
- Changes to `dispositionStore`
- Adding inline editing to the section card (still requires the fullscreen modal)
