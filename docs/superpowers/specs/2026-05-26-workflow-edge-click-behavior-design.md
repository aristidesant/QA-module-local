# Workflow Edge Click Behavior & Label Redesign

**Date:** 2026-05-26
**Status:** Approved for implementation

## 1. Problem

Two interrelated issues with workflow edges in the canvas:

1. **"Not configured" label** — edges with no condition display "Not configured" text with an orange warning. This implies an error state, but having no condition (`type: "none"`) is a valid configuration.
2. **Edge click behavior** — clicking an edge toggles action buttons (edit/delete) instead of opening the modal directly. This is an extra step for the primary action.

## 2. Design Decisions

### 2.1 Edge Visual States

Three distinct visual states replace the current binary "configured / not configured" model:

| State            | Condition                                                                                             | Arrow style                                                                       | Label                                                                             |
| ---------------- | ----------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| **Unconfigured** | No condition (`type: "none"`, condition undefined)                                                    | Solid gray, 1.5px stroke (thinner than default 2px), subtle dash pattern `[4, 4]` | No label                                                                          |
| **Incomplete**   | Condition type selected (`llm`/`expression`) but required data empty (empty prompt, empty expression) | Orange solid line, 2px stroke (same as current `'error'` warning level)           | No label; small warning icon at midpoint                                          |
| **Configured**   | Has valid condition data                                                                              | Solid gray line, 2px stroke (current style)                                       | Shows truncated label chip as today. Structured forward/backward chips unchanged. |

Start-node edges remain suppressed (no change).

### 2.2 Interaction Model

| Action                                     | Behavior                                                                      |
| ------------------------------------------ | ----------------------------------------------------------------------------- |
| **Click** on edge line (any state)         | Opens Edge Condition modal directly                                           |
| **Click** on label chip (configured edges) | Opens Edge Condition modal directly                                           |
| **Right-click** on edge line               | Context menu: "Delete edge" (and optionally "Edit")                           |
| **Hover** on edge line                     | Subtle highlight — slightly brighter/thicker stroke to indicate interactivity |

Removed: `selectedEdgeActionId` and action button toggle (edit/delete popup above edge). The delete action moves to right-click context menu.

### 2.3 Validation Updates

Current `getEdgeWarningLevel()`:

- No conditions → `'error'` (orange)
- Has conditions → `'none'` (gray)

New logic:

- No conditions (`type: "none"`) → `'none'` (gray, slightly thinner/dashed — valid state)
- Condition type selected but data empty → `'error'` (orange — needs attention)
- Has valid condition data → `'none'` (gray, normal)

Required data per condition type:

- `llm`: `condition` string must be non-empty (`condition.trim() !== ''`)
- `expression`: `expression` must not be the default/empty expression (checked via serialization — if formatted label is `null` or empty, it's incomplete)
- `result`: always has a value (success/failure)
- `unconditional`: always valid

### 2.4 Edge Labels

- **Unconfigured / Incomplete**: No text label rendered. The entire edge line is the click target.
- **Configured**: Label rendered as today (single chip or structured forward/backward chips).
- **"Not configured" i18n key**: Still kept for reference in the Edge Condition modal (as a placeholder indicator) but removed from canvas rendering.

## 3. Files to Change

| File                               | Change                                                                                                                                                                                                            |
| ---------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ConditionEdge.tsx`                | Remove "Not configured" fallback label rendering. Add dash pattern for unconfigured state. Add right-click handler. Change click to call `openEdge` directly instead of `toggleEdgeActions`. Add hover highlight. |
| `ConditionEdge.module.css`         | Add styles for dashed edge, warning icon, right-click context menu, hover highlight.                                                                                                                              |
| `ConditionEdge.types.ts`           | Add `isIncomplete?: boolean` field to `ConditionEdgeData` to distinguish unconfigured vs incomplete.                                                                                                              |
| `WorkflowCanvas.helpers.ts`        | Update `getEdgeWarningLevel` call to produce the three states. Remove "Not configured" from `getEdgeLabel`. Update `defaultEdgeOptions` for unconfigured edges.                                                   |
| `workflowValidation.ts`            | Update `getEdgeWarningLevel` to downgrade no-condition to `'none'` and add incomplete-condition detection (`llm` with empty prompt, `expression` with empty expression).                                          |
| `WorkflowCanvas.tsx`               | Remove edge action toggle logic. Wire right-click handler.                                                                                                                                                        |
| `WorkflowCanvasActionsContext.tsx` | Remove `toggleEdgeActions`, `clearEdgeActions`, `selectedEdgeActionId`.                                                                                                                                           |
| `FlowView.tsx`                     | Pass `onEdgeContextMenu` handler.                                                                                                                                                                                 |

## 4. Edge Context Menu

A lightweight context menu component triggered by right-click on an edge:

- Two actions: **Edit** (opens modal) and **Delete** (removes edge)
- Positioned at cursor, dismisses on click-away or menu action
- Mantine `Menu` positioned at event coordinates

## 5. Out of Scope

- Edge reconnection behavior (unchanged)
- Node-level changes (unchanged)
- Keyboard shortcuts for edge operations
- Touch-device long-press for context menu (follow-up)

## 6. Future Considerations

- Touch-device long-press to trigger context menu
- Edge multi-select
