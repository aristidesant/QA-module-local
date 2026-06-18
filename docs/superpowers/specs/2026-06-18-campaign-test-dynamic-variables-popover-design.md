# Campaign Test Dynamic Variables Popover

## Goal

Replace the expanded dynamic-variable workspace in the campaign agent test panel with a compact control that stays out of the primary testing flow while keeping overrides easy to inspect and edit.

## Interaction Design

The test panel shows one compact trigger row below the voice selector. The row contains the variable icon, the label "Dynamic variables", a concise count summary, an override status badge when applicable, and a "Configure" button.

Activating the row or button opens a Mantine `Popover` rendered through its portal. The popover contains:

- A header with the title, route-local storage explanation, and close action.
- A vertically scrollable direct-edit list with every variable visible.
- A text or number input for string and numeric defaults.
- A switch for boolean defaults.
- The default value and modified state shown beside each variable.
- A per-variable reset action when its current value differs from the default.
- A footer with the active override count and a reset-all action.

The popover closes on outside click and Escape. Edits apply immediately to the existing local state and browser persistence, matching the current behavior. No additional save action is needed.

## Visual Design

The trigger is visually quieter than the voice selector and occupies a single row. The popover uses the existing Newtech product vocabulary: restrained neutral surfaces, subtle borders, compact spacing, and green only for active overrides and focus states.

Variable names use the project mono type treatment and wrap safely. Inputs remain full width. The popover width is constrained for desktop and capped against the viewport on small screens. Its list receives a maximum height and internal scrolling so it never expands the surrounding test panel.

All custom colors use Mantine variables and `light-dark()` so the component preserves contrast in both themes. Mantine supplies keyboard handling, focus management, and portal positioning.

## Component Boundaries

`ConvaiDynamicVariablesPanel` remains the only UI component for this control. It reads and updates the existing context values:

- `dynamicVariables`
- `dynamicVariablesDefaults`
- `setDynamicVariables`
- `resetDynamicVariables`

The context persistence, route scoping, primitive normalization, and `startSession` merge remain unchanged.

## Responsive Behavior

The trigger summary truncates before the action controls. The popover width uses the available viewport width on narrow screens. Long variable names wrap, controls remain one column, and the list scrolls vertically.

## Edge Cases

- Agents with no defaults render no control.
- Storage failures continue to use in-memory state.
- Empty strings remain valid string overrides.
- Numeric and boolean defaults retain typed controls.
- Resetting one variable restores its agent default.
- Resetting all variables removes persisted overrides through the existing context behavior.

## Verification

- Run `npm run typecheck` and `npm run build`.
- Inspect the test route in light and dark themes.
- Verify keyboard opening, Escape dismissal, focus visibility, scrolling, long variable names, and narrow viewport behavior.
- Verify edit persistence after refresh, per-variable reset, reset-all, route isolation, and session payload behavior.
- Confirm English and Spanish copy is complete.
