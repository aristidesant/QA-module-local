# Client Form UX Friction Fixes — Design

**Date:** 2026-07-06
**Scope:** `/clients/new` and `/clients/:clientId/edit` routes (`src/modules/clients/ClientForm`, `ClientFormActions`, `ClientFormPage`)
**Goal:** Reduce UX friction in both flows and make each flow visibly distinct, without changing the recently merged visual redesign's card/rail system for edit mode.

## Background

The client form was recently visually redesigned (sidebar section nav + section cards, branch `mena/client-form-visual-redesign`). Create mode currently reuses the full edit layout (nav rail + 3 stacked cards) even though it only exposes 7 fields, of which only `name` and `alias` are required. Save actions live in the page header corner on desktop and in a fixed bottom bar on mobile (`ClientFormActions.module.css`).

## Decisions (validated with user via visual companion)

1. **Create flow:** focused single card (option A) — not a wizard, not the current heavy layout.
2. **Edit flow:** sticky save bar on dirty (option A) — no rail state dots, no required/optional label pass, no identity summary header in this iteration.

## Section 1 — Create flow: focused card

### Layout

- `/clients/new` renders a centered single-column layout, max-width ~560px.
- No `ClientSectionNav` rail. No header-corner actions (`titleRight`).
- One `SectionCard` (project primitive, mandatory) titled with the existing create title copy.

### Content

- Required fields first: `name` (required), `alias` (required, existing auto-suggestion from name preserved), then `description`.
- Below them, a collapsed optional group toggle: "Contact & location (optional)" containing `email`, `phone`, `address`, `rnc`, using Mantine `Collapse` (or equivalent) with an accessible disclosure button.
- The optional group auto-expands when any contained field has a validation error (e.g. invalid email) so errors are never hidden.
- Card footer: full-width primary "Create client" submit button plus a secondary Cancel action.

### Behavior preserved

- Unsaved-changes route blocker and `beforeunload` guard.
- Validation summary + scroll-and-focus to first invalid field (works with the collapse auto-expand).
- Successful create navigates to `/clients/:id/edit` (replace), as today.
- Billing and branding sections remain edit-only/master-only — unchanged.

### Implementation shape

- Conditional layout inside `ClientForm.tsx` based on `mode` — the `useForm` instance, validation rules, helpers, mutations, and blockers are shared. No duplicated form logic; only the rendered layout branches.
- New CSS in `ClientForm.module.css` for the focused-card layout (centered column, collapse group, footer button), using Mantine tokens and `light-dark()` for both themes.

## Section 2 — Edit flow: sticky save bar

### Behavior

- Remove `ClientFormActions` from the page header (`titleRight`) in edit mode.
- A sticky bottom bar — unified for desktop and mobile, evolving the existing mobile fixed-bar pattern in `ClientFormActions.module.css` — appears only when `form.isDirty()` or a save is in flight.
- Bar content: "● Unsaved changes" status text, a Discard button, and the primary "Save changes" button.
- Enter/exit uses a slide-in transition; `prefers-reduced-motion` disables the animation (bar still appears/disappears instantly).

### Discard semantics

- Discard resets the form to the **last saved baseline**, not to empty initial values. On hydrate (and after each successful save), call `form.setInitialValues(baseline)` alongside the existing `resetDirty(baseline)`, so `form.reset()` restores saved data.
- Discard also clears `failedSection` and any validation summary.

### Layout details

- Bar spans the form content column, position sticky/fixed at the bottom, `z-index` below Mantine modals, safe-area inset padding on mobile (as the current mobile bar already does).
- The existing mobile bottom padding on `.pageLayout` is kept/adjusted so content is never hidden behind the bar.
- Both light and dark mode via Mantine tokens (`light-dark()`), matching the current mobile bar's surface treatment.

### Behavior preserved

- Partial-save (branding PATCH failure) flow, notifications, and `failedSection` alert.
- Route blocker interplay: the bar's visibility condition matches the blocker's dirty check, so users always see why navigation is blocked.
- Create mode does not use the bar — the focused card's footer button is the submit affordance (Section 1).

### Implementation shape

- Rework `ClientFormActions` into the sticky bar component (rename or keep name), receiving the same props plus an `onDiscard` handler; drop its desktop header-corner variant.
- i18n: new keys for "Discard" and any changed copy in `src/locales/*/clients.json`, following the i18n convention doc.

## Out of scope

- Wizard/stepper, rail state dots, required/optional label audit, identity summary header, autosave.
- No tests (per project rule: only on explicit request).

## Success criteria

- Create: user sees only essential fields on a compact centered card; optional fields discoverable but not in the way; both routes visibly distinct at a glance.
- Edit: save/discard always reachable while scrolled anywhere in the form; no unreachable dirty state; dark and light modes both correct.
- `npm run typecheck` and `npm run build` pass.
