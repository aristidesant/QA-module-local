# Clone Campaign Modal Redesign

**Date:** 2026-06-02  
**Status:** Approved (Option C — Table + Switch)

## Problem

The current `CloneCampaignForm` renders a `Paper` inside a Mantine `Modal`, creating a double-container with redundant border, background, and padding. It also has a custom header (icon + title + subtitle + badge) that duplicates the modal's own title. Agent rows carry 5 elements each (checkbox + avatar + name text + meta text + input), making them visually heavy.

## Design: Table + Switch (C)

Remove the Paper wrapper entirely. The Mantine modal is the container. Form is a `Stack` with two zones separated by a labeled divider. Agent section uses a bordered table-like layout with a `Switch` toggle per row.

### Zone 1 — Campaign details

- `TextInput` for campaign name (pre-filled "Copy of [name]")
- `Textarea` for description (min 3 rows)
- `Alert` (blue, `variant="light"`) for INBOUND phone notice — shown only when `campaign.type === 'INBOUND'`

### Divider

`Divider` with centered label: `"N AGENTS"` (total agent count).

### Zone 2 — Agent table

Bordered container (`border: 1px solid var(--mantine-color-default-border)`, `border-radius: var(--mantine-radius-sm)`, `overflow: hidden`).

**Header row:** 3 columns — `[switch col, 40px]` | `[ORIGINAL]` | `[NEW NAME]`  
Small uppercase labels, muted color, subtle background.

**Agent rows:** same 3-column grid.

- Col 1: `Switch` (Mantine) — controls selected state
- Col 2: Original agent name. When switch OFF → `text-decoration: line-through`, muted color
- Col 3: `TextInput` for new name, `size="xs"`. When switch OFF → `disabled`

Row separator: `border-top` between rows.  
No avatars, no meta text, no arrow.

**All colors use Mantine CSS variables** — no hardcoded hex — so dark/light mode works automatically.

### Footer

`Group justify="flex-end"` at the bottom:  
`Button variant="default"` (Cancel) + `Button` loading (Clone campaign).

Cancel calls `onComplete` — closes the modal and refetches (harmless on cancel).

### Validation error

`Alert` (`color="yellow"`) between agents table and footer.

## File changes

| File                           | Change                                                                |
| ------------------------------ | --------------------------------------------------------------------- |
| `CloneCampaignForm.tsx`        | Remove Paper + custom header; restructure to table layout with Switch |
| `CloneCampaignForm.module.css` | Full rewrite — table styles using Mantine CSS vars only               |

No i18n changes needed. Cancel uses existing `actions.cancel` key from `common.json`.

## Out of scope

- CloneAgentModal (separate component, different flow)
- Behavior changes (validation logic, mutation, error handling unchanged)
