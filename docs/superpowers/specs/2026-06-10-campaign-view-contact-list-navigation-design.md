# Campaign View Contact List Navigation Design

## Context

The `campaign/view/:campaignId` screen currently lets users click a contact-list row to open a right-side App Drawer with details and actions. That pattern is not working well:

- The list already contains a lot of operational information.
- The drawer duplicates a second detail surface inside an overview screen.
- The main user intent is usually to inspect the contact list itself, not to read a preview panel first.
- The same contact list already has a dedicated route: `/campaign/:campaignId/contact-list/:contactGroupId`.

The current drawer also mixes two different concerns:

- previewing the contact list
- hosting all list-level actions

That combination makes the interaction feel heavy and confusing.

## Goal

Make the contact-list table behave like a navigation index:

- clicking a row opens the dedicated contact-list page
- the row actions move into a `3 dots` overflow menu in the table
- the App Drawer is removed from `campaign/view/:campaignId`

## Non-Goals

- Do not redesign the dedicated contact-list detail page.
- Do not change the backend routes or data model.
- Do not introduce a new preview drawer for this screen.
- Do not remove existing contact-list actions.
- Do not add automated tests unless explicitly requested.

## Options Considered

### Option 1: Row click navigates, actions move to a `3 dots` menu

This is the selected direction.

Pros:

- Clear hierarchy: overview screen leads to detail page.
- Removes the awkward drawer-with-actions pattern.
- Matches the existing route structure.
- Uses a familiar table pattern already present elsewhere in the app.

Cons:

- Users lose the quick preview drawer.
- One extra click is required to inspect a contact list, but the destination page is already the intended detail surface.

### Option 2: Keep the drawer and add a separate navigation action

Pros:

- Preserves the current preview behavior.
- Lets power users jump to the detail page from the drawer.

Cons:

- Keeps the confusing dual-purpose drawer.
- Adds another interaction path to maintain.
- Does not solve the visual heaviness.

### Option 3: Hybrid desktop/mobile interaction

Pros:

- Could preserve fast preview on smaller screens and navigation on larger screens.

Cons:

- Introduces inconsistent behavior between breakpoints.
- Adds more edge cases for a problem that is fundamentally a hierarchy issue.

## Decision

Use Option 1.

The overview screen should primarily act as an index. The dedicated contact-list page already exists and is the better place for details, actions, and inspection.

## UX Flow

1. User sees the contact-list table on `campaign/view/:campaignId`.
2. User clicks anywhere on a row, excluding interactive controls in the actions column.
3. The app navigates to `/campaign/:campaignId/contact-list/:contactGroupId`.
4. The contact-list detail page becomes the single source of truth for:
   - metadata
   - operational stats
   - tabs
   - actions

The table row should visually communicate that it is navigable. The current row-selected drawer state should no longer be the primary cue.

## Table Interaction Model

### Row click

- Entire row is clickable.
- Clicking the row navigates to the dedicated contact-list page.
- The click target should exclude the `3 dots` menu and any action icons inside the actions cell.

### Primary cell affordance

- The name cell should reinforce the row as a destination.
- It can use link-like styling or a subtle navigation indicator.
- The row should feel consistent with other navigable tables in the app.

### Actions column

- Replace the inline action cluster with a `3 dots` overflow menu.
- Keep the same permissions and action availability rules.
- Use the existing Mantine `Menu` pattern already used elsewhere in the app.
- Stop propagation on menu interaction so the row does not navigate accidentally.

## Action Grouping

The menu should group actions by intent rather than showing everything as equal-weight controls:

- `Manage`
  - edit contact list
  - extend waves
  - complete list
- `Status`
  - activate/deactivate
  - start/pause/resume when available
- `Operations`
  - clean queue
  - open contact-list page
- `Danger`
  - delete contact list

This grouping reduces visual noise and makes destructive actions easier to notice without taking over the table row.

## Page Behavior

### `campaign/view/:campaignId`

- Remove the App Drawer from this screen.
- Remove row selection state that exists only to support the drawer preview.
- Keep the list itself and the add-contact-list modal behavior intact.
- The table remains the top-level summary of contact lists.

### `/campaign/:campaignId/contact-list/:contactGroupId`

- No structural change is required for this task.
- This page remains the detailed destination for inspection and operations.
- It should continue to own the existing tabs, breadcrumbs, and detail content.

## Data Flow

The overview screen already has the campaign context and the contact-group rows. The only behavioral change is what happens on interaction:

- row click maps to `navigate('/campaign/:campaignId/contact-list/:contactGroupId')`
- menu actions continue to use the existing mutations and confirmation modals
- the drawer store is no longer part of the overview screen flow

No new API contract is needed.

## Accessibility And Usability

- The row must remain keyboard-accessible as a navigable target.
- The `3 dots` menu needs an accessible label such as `More actions`.
- Menu items must keep their current labels and confirmation behavior.
- Hover and focus states must work in both light and dark modes.
- Destructive actions should remain visually distinct inside the menu.

## Implementation Boundaries

The change should stay local to the campaign contacts overview flow:

- update the campaign view page so it navigates instead of opening the drawer
- update the contact-list columns so the actions column renders a menu
- keep the dedicated contact-list page unchanged unless a small affordance adjustment is needed

The shared `AppDrawer` component should remain available for other screens that still need it.

## Risks And Mitigations

- Risk: users may miss the detail drawer preview.
  - Mitigation: the dedicated detail page is already the intended destination and contains richer information than the drawer.
- Risk: the actions menu can become crowded.
  - Mitigation: group actions by intent and keep the most common operation near the top.
- Risk: navigation conflicts with action clicks.
  - Mitigation: stop propagation in the menu and keep the row click handler separate.

## Verification

Manual verification should confirm:

- clicking a contact-list row opens the dedicated contact-list page
- clicking the `3 dots` menu does not navigate away
- action items still respect permissions and confirmations
- the overview screen no longer opens the App Drawer
- light and dark mode both remain readable and consistent

## Open Questions

None. The desired behavior is now fixed: row click navigates, and the drawer is removed from this overview screen.
