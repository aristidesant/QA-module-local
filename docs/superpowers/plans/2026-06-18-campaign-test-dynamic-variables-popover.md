# Campaign Test Dynamic Variables Popover Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the expanded campaign-test dynamic-variable workspace with a concise, accessible direct-edit popover.

**Architecture:** Keep route-scoped state, persistence, primitive parsing, and session payload handling in `CampaignConvaiContext`. Refactor only `ConvaiDynamicVariablesPanel` into a compact trigger and portal-mounted Mantine popover, with CSS-module styling and localized copy.

**Tech Stack:** React, TypeScript, Mantine v9, Tabler Icons, react-i18next, CSS Modules

---

## File Structure

- Modify `src/modules/campaigns/CampaignConvaiWidget/ConvaiDynamicVariablesPanel.tsx`: render the trigger, popover, typed direct-edit controls, and reset actions.
- Modify `src/modules/campaigns/CampaignConvaiWidget/CampaignConvaiWidget.module.css`: replace the workspace styles with compact responsive popover styles using Mantine theme variables.
- Modify `src/locales/en/campaign.detail.test.json`: provide concise English labels and helper text.
- Modify `src/locales/es/campaign.detail.test.json`: provide matching Spanish labels and helper text.

### Task 1: Build the direct-edit popover

- [ ] Replace `useDisclosure`, selected-variable state, workspace navigation, and focused editor markup with a Mantine `Popover` controlled by local opened state.
- [ ] Build a one-row trigger with the variable count, active override count, and a `Configure` action.
- [ ] Render all entries in a `ScrollArea.Autosize`; use `Switch` for boolean defaults and `TextInput` with `type="number"` for numeric defaults.
- [ ] Show each default inline, expose a per-variable reset only when modified, and retain the reset-all footer action.
- [ ] Preserve `parseInputValue`, `setDynamicVariables`, `resetDynamicVariables`, and the no-variables early return.

### Task 2: Implement compact theme-aware styling

- [ ] Remove obsolete two-pane workspace, navigation, summary tile, editor card, and expanded-row rules.
- [ ] Add styles for the trigger row, popover header, scrollable direct-edit list, field metadata, modified state, and footer.
- [ ] Use Mantine variables and `light-dark()` for surfaces, borders, text, hover, focus, and modified states.
- [ ] Cap popover width against the viewport, wrap long keys, retain visible focus rings, and support narrow screens.

### Task 3: Complete copy and verification

- [ ] Replace obsolete workspace keys with concise trigger, header, saved-state, default-value, configure, close, and reset labels in English and Spanish.
- [ ] Run `npm run typecheck`; expect TypeScript to complete without errors.
- [ ] Run `npm run build`; expect Vite production build to complete successfully.
- [ ] Inspect the campaign test route in light and dark mode at desktop and narrow viewport widths, verifying popover positioning, keyboard dismissal, scrolling, editing, persistence, and reset actions.
