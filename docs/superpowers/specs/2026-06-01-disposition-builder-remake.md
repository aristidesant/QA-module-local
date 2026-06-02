# Disposition Builder Remake — Unified Tree + Toggles

**Date:** 2026-06-01
**Status:** Approved (design)

## Goal

Remake the fullscreen disposition builder modal (`DispositionForm`) to be easier, cleaner, and faster to use. Replace the three-panel "catalog + flow + empty inspector" layout with a two-pane "unified tree + docked inspector" model. The user toggles outcomes on/off in a single tree instead of pushing nodes between two parallel trees.

## Core Problem (today)

- Two parallel trees of the same shape (catalog vs. flow). Users mentally diff "available" vs. "added" and push nodes across with `+` buttons.
- The third (right) panel is empty until a node is clicked.
- "Add missing siblings / children" helper buttons exist only because the dual-tree model hides what is available.
- Lots of dead space; the screen feels unfinished.

## New Model

### Layout (fullscreen modal)

- **Header:** prominent flow-name input + close. (Today the name is a small field buried in the body.)
- **Body — 2 panes:**
  - **Left (~62%) — Unified outcome tree.** Toolbar: compact catalog selector, search, expand/collapse-all, included-count badge. Below: the catalog tree where every node is a toggle row, with branch-tone connector guides (same visual language as `DispositionViewer` / `NodeEditor`).
  - **Right (~38%) — Inspector.** Never empty. Nothing selected -> live flow summary. Node selected -> its editor.
- **Footer:** Cancel + Save/Update (unchanged behavior).

### Tree rows

Row anatomy: `[toggle] [chevron if group] [tone dot] [name] [included flags] [hover meta]`

- Toggle ON = node is in the flow; OFF = not.
- **Cascade semantics:** toggling a GROUP on includes the group + all its children; toggling it off removes them all. Toggling a LEAF on auto-includes its ancestor path (a leaf cannot exist in the flow without its parent chain).
- Search filters rows by name.
- Connector guides colored by branch-root tone (effective / noEffective / noContact / default).

Removed from the tree experience: the `+` add buttons, the separate flow tree, and the "add missing siblings / children" helper buttons (everything is now visible in one place).

### Inspector

- **Nothing selected -> live summary:** included total, groups, outcomes, flagged; plus a clickable list of flagged outcomes. Replaces the old empty "Select a node" panel.
- **Leaf selected -> editor:** name + behavior toggles (invalidates number, do-not-call, abandoned, requires reschedule). Reuses `DispositionNodeForm`.
- **Group selected -> branch preview:** reuses `DispositionGroupPreview`.

## Data / State — low risk

The remake is a **presentation change over the existing store**. No store rewrite; the save path is unchanged.

- Source tree rendered on the left = `selectedCatalog.dispositionNodes` (the full catalog tree).
- "Included" = node id present in `flowJson.dispositionNodes` (use `findNodeById`).
- Toggle maps to existing store actions:
  - Leaf ON -> existing `handleAddNode` hierarchy logic (`addNode` / `addNodeToParent`, pulls ancestor path).
  - Group ON -> existing `handleAddGroupWithChildren` (cascade include).
  - Any node OFF -> `removeNode` (removes the node and its subtree from `flowJson`).
- Per-node editing (name + behaviors) continues to operate on the `flowJson` copy via `DispositionNodeForm`, exactly as today.
- The "missing siblings / children" store actions (`populateNodeWithChildren`, `addMissingSiblingsToParent`) become unused by the new UI. Leave the store actions in place (no removal) but stop calling them from the builder.

## Components

| Component                    | Change                                                                                                                                                       |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `DispositionForm`            | New 2-pane layout (tree + inspector), prominent name input moved to header area.                                                                             |
| `DispositionCatalogMenu`     | Reworked into the unified toggle tree (renders catalog, toggle reflects/controls flow membership). May be renamed conceptually but keep file to limit churn. |
| `DispositionCatalogMenuItem` | Becomes a toggle row (switch/checkbox + tone dot + name + included flags), connector-guide styling.                                                          |
| `NodeEditor`                 | No longer used as the separate flow tree. Either retired or repurposed; the unified tree replaces it. Decide during planning.                                |
| New: `BuilderInspector`      | Right pane. Switches between live summary and node editor/group preview.                                                                                     |
| `DispositionNodeForm`        | Reused inside the inspector (leaf editor).                                                                                                                   |
| `DispositionGroupPreview`    | Reused inside the inspector (group preview).                                                                                                                 |
| Store (`dispositionStore`)   | No new actions required; reuse existing add/remove. `populateNodeWithChildren` / `addMissingSiblingsToParent` left in place but unused by builder.           |

## Out of Scope

- The campaign-form `DispositionSection` summary card and `DispositionViewer` (already redesigned).
- Backend / flow JSON schema — unchanged.
- Catalog CRUD (create catalog flow) — unchanged.
- Drag-and-drop (the builder has none today; not introducing it).

## Open Questions (resolved defaults)

- **Toggle control style:** Mantine `Switch` vs `Checkbox`. Default to `Switch` (reads as "include in flow" on/off). Revisit in polish if it feels heavy at scale.
- **Search scope:** filter by name only (not description). Default yes.
- **Indeterminate group state:** not in scope (user chose plain cascade, not indeterminate).
