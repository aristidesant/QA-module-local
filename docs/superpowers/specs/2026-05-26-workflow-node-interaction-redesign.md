# Workflow Node Interaction Redesign

**Date:** 2026-05-26  
**Status:** Approved for implementation

---

## Context

The current workflow canvas interaction model requires too many clicks to edit a node:

1. Click node → node is selected, side action portal appears to its right
2. Click Edit icon in side portal → drawer opens

This two-step pattern feels unintuitive. Users also have no right-click affordance on nodes, and the existing edge context menu is a tiny icon-only pair with no labels.

The goal is to make interactions faster, more discoverable, and better looking.

---

## Decisions

| Interaction      | New Behavior                                       |
| ---------------- | -------------------------------------------------- |
| Left-click node  | Open edit drawer directly (1 click)                |
| Right-click node | Show labeled context menu                          |
| Left-click edge  | Open condition modal (unchanged — already works)   |
| Right-click edge | Show labeled context menu (Edit condition, Delete) |
| Pane click       | Close context menu + deselect                      |

---

## Context Menu Design

**Style: Grouped + Highlighted Edit (light & dark mode)**

- Background: `var(--mantine-color-body)`
- Border: `var(--mantine-color-default-border)`
- Shadow: `var(--mantine-shadow-md)`
- Border-radius: 10px
- Section labels: uppercase, `var(--mantine-color-dimmed)`, 10px
- Edit row: blue light background (primary action, highlighted)
- Delete row: red light background, red text (danger zone, visually separated)
- All other rows: standard hover state

**Node context menu items (by node type):**

| Item                          | Visible when                                                                |
| ----------------------------- | --------------------------------------------------------------------------- |
| ✏️ Edit node _(highlighted)_  | Not START or END                                                            |
| 🎨 Change style               | Not START or END                                                            |
| ➕ Add child node _(submenu)_ | `hasAddButton && !isTransferAgent && !isPhoneTransfer && !isStartConnected` |
| ⧉ Clone                       | Not START                                                                   |
| — divider —                   |                                                                             |
| 🗑 Delete node _(danger)_     | Not START                                                                   |

START node: right-click shows "Add child node" only.  
END node: right-click shows "Delete" only.

**Edge context menu items:**

- ✏️ Edit condition _(highlighted)_
- — divider —
- 🗑 Delete edge _(danger)_

---

## Architecture

### New component: `WorkflowContextMenu`

`src/modules/campaigns/CampaignsForm/WorkflowSection/WorkflowContextMenu/`

Generic, accepts a `menuItems: ContextMenuItem[]` array. Two builder helpers produce the correct items for nodes and edges. Renders into a Mantine `Portal` at fixed `{ x, y }` screen coordinates. Closes on outside click (`useClickOutside`) and on `Escape`.

```ts
interface ContextMenuItem {
	key: string;
	label: string;
	icon: React.ReactNode;
	onClick: () => void;
	variant?: 'primary' | 'danger' | 'default';
	submenu?: ContextMenuItem[];
	section?: string; // renders a section label above this item
}
```

### Modified: `FlowView.tsx`

- Add `onNodeContextMenu` prop → passed to ReactFlow's `onNodeContextMenu`
- Add `onNodeOpen` prop → called from `onNodeClick` instead of `onNodeSelect`
- Keep drag suppression logic unchanged

### Modified: `WorkflowCanvas.tsx`

- Add `contextMenuState: { x: number; y: number; nodeId?: string; edgeId?: string } | null`
- Wire `handleNodeContextMenu` → set state
- Wire `handlePaneClick` → clear state + deselect
- Remove `onNodeSelect` logic that drove side portal visibility
- Render `WorkflowContextMenu` when `contextMenuState` is set

### Modified: `ConditionEdge.tsx`

- Replace existing `<Paper>` + `<ActionIcon>` context menu with `WorkflowContextMenu`
- Keep `onClick → openEdge(id)` unchanged

### Removed / Simplified

- `WorkflowNodeActions.tsx` — no longer needed (actions move to context menu)
- `SideActionsPortal.tsx` — no longer needed
- `sideActions` prop removed from `WorkflowNodeWrapper` and all node components (`SubagentNode`, `ToolNode`, `PhoneNumberNode`, `UpdateStateNode`, `StandaloneAgentNode`, `GroupNode`)

---

## Verification

1. `npm run dev` → open workflow canvas
2. Left-click any non-START/END node → edit drawer opens immediately (1 click)
3. Right-click any node → labeled context menu appears at cursor, correct items per node type
4. Click "Edit node" in menu → drawer opens
5. Click "Change style" → NodeStylePopover opens
6. Click "Add child node" → submenu shows node type options, selecting one creates child node + edge
7. Click "Clone" → duplicate node appears
8. Click "Delete" → node removed
9. Right-click START node → only "Add child node" shown
10. Left-click edge → condition modal opens
11. Right-click edge → context menu with "Edit condition" + "Delete"
12. Pane click → menu closes
13. Escape key → menu closes
14. Toggle dark mode → menu looks correct in both themes
15. `npm run typecheck` passes
