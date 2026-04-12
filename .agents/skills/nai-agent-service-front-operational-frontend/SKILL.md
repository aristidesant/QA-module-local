---
name: nai-agent-service-front-operational-frontend
description: Use when generating or refactoring frontend UI in this repository. Biases toward operational screens, compact Mantine layouts, route-level guards, i18n, and explicit loading/empty/error states. Derived from frontend-skill and adapted for dashboards, forms, drawers, and workflow builders.
---

# NAI Agent Service Frontend Skill

Use this skill for frontend work in this repo when the goal is to ship clear, production-ready operational UI.

This repository is not a marketing site by default. The dominant patterns are:

- operational dashboards
- list/detail admin screens
- forms and multi-section editors
- drawers and side inspectors
- workflow and configuration builders

## Working Model

Before building, write three things:

- visual thesis: one sentence describing the screen's tone, hierarchy, and layout rhythm
- content plan: what the first screen shows, what follows, and what the primary action is
- interaction thesis: 2-3 interaction choices that improve clarity or speed

For complex screens, also identify:

- the primary data source
- the permission boundary
- the loading, empty, and error states
- whether a preview pane needs deferred rendering

## Non-Negotiable Repo Rules

- Use the existing stack: React Router v7, Mantine v8, TanStack React Query, Zustand, Axios, and react-i18next.
- Prefer the existing primitives before inventing new layout systems:
  - `ContentContainer` for page shells
  - `SectionCard` for logical subsections
  - `AppDrawer` for side panels
  - `BaseTable` for tables
  - `ModuleGuard` for protected screens
  - `SuspenseFallback` for route loading states
- Route pages must keep explicit route IDs and route-level guards.
- Never hardcode user-facing strings. Use route-aligned translation namespaces and keep `en` and `es` in sync.
- Keep hooks at the top level and do not break hook order.
- Prefer `size="sm"` and `gap="xs"` unless the layout needs a stronger hierarchy.
- Keep the app light-mode first and operational-first.

## Screen Blueprints

### 1. List Screens

Use this pattern for campaigns, users, roles, tools, knowledge bases, and similar admin lists.

- page shell with title and short description
- filters or search row
- primary action in the header
- data table as the main body
- drawer or modal for secondary detail/edit flows

Rules:

- one primary action only
- table labels should describe real operational intent
- empty state should explain what is missing and offer one next step
- loading state should be explicit and non-jarring

### 2. Detail Screens

Use this pattern for role details, campaign details, and conversation detail surfaces.

- title plus short operational summary
- sectioned content with clear responsibility per block
- side inspector or drawer for secondary actions
- avoid decorative chrome that does not support understanding

Rules:

- section headers should name the task, not the mood
- if a section can be plain layout, do not make it a card
- keep the first viewport focused on orientation and the next action

### 3. Builder And Wizard Screens

Use this pattern for campaign configuration, dashboard widget editing, and workflow editors.

- a main editing column
- a preview or inspection column when needed
- progressive disclosure for advanced settings
- sticky or anchored footer actions when the form is long

Rules:

- group fields into meaningful sections such as Basic, Configuration, and Advanced
- keep live previews deferred when the preview is expensive or noisy
- prefer `useDeferredValue` for preview panes or derived state
- use `startTransition` for non-urgent updates when the UI benefits from it

### 4. Dashboard Screens

Use this pattern for overview and analytics surfaces.

- metrics or the working surface first
- charts and tables only when they help the decision
- no hero marketing copy
- no decorative card mosaic

Rules:

- if a panel can be plain layout without losing meaning, remove the card treatment
- use cards only when they contain an interaction, a distinct data block, or an important section boundary
- keep copy operational and compact

### 5. Empty States

Use this pattern whenever data is missing, filtered away, or not yet created.

- say what is missing
- say why that matters
- offer one clear next action

Rules:

- do not use vague motivational copy
- do not leave the user without a path forward

## Card Standard

`RightSectionCard` (`src/components/RightSectionCard`) is the canonical card shell for all right-column panels, form sections, and detail cards. It is implemented as plain divs (not Mantine `Card`) for full padding control.

Established visual standard (do not deviate):
- **Structure**: `div.card > div.header + div.content` — no Mantine Card/Card.Section
- **Icon**: `<ThemeIcon variant='light' radius={12} size={40}>` with `<Icon size={20}>` — 40×40 rounded-square container
- **Card border-radius**: `16px`, `overflow: hidden`
- **Card shadow**: `0 1px 2px rgba(15,23,42,0.04), 0 6px 16px rgba(15,23,42,0.06)`
- **Hover**: `translateY(-1px)` lift + slightly stronger shadow — do not skip this
- **Header padding**: `20px 24px` (not via Mantine spacing tokens)
- **Content padding**: `20px 24px 24px`
- **Header divider**: `1px solid #F1F5F9` (light), `dark-6` (dark) — intentionally hairline
- **Title**: `font-size: 16px`, `font-weight: 600`, `letter-spacing: -0.01em`
- **Subtitle**: `font-size: 13px`, `color: gray-5`
- **Mobile** (`≤520px`): header and content padding reduce to `16px`

## Design Rules

- Start from composition and hierarchy, not component count.
- Use the existing theme and spacing scale before introducing custom styling.
- Avoid custom shadows and gradients unless a specific component already depends on them.
- Prefer soft borders and subtle elevation over heavy visual effects.
- Avoid generic dashboard-card mosaics, pill clusters, and decorative icon rows.
- Use a single clear accent for action or state unless the product already has a stronger system.
- Do not introduce new fonts or a new visual identity unless the task explicitly requires it.
- Keep copy short, functional, and easy to scan in seconds.
- Use real product language, not design commentary.
- If deleting 30 percent of the copy improves the screen, keep deleting.

## Prompting Recipe For Generating UI

When asked to create or improve a screen, follow this sequence:

1. Restate the screen type and the primary user task.
2. Write the visual thesis, content plan, and interaction thesis.
3. List the mandatory data, states, permissions, and translations.
4. Choose the correct repo primitive for the shell and subregions.
5. Implement the simplest layout that satisfies the task.
6. Verify desktop and mobile behavior.

For visually simple operational screens, start with low or medium reasoning and keep the layout restrained.

For long-horizon builders or complex editors, raise reasoning only if the added depth helps with state flow, layout correctness, or preview logic.

## Validation Checklist

Before shipping, check the screen against these questions:

- Is the primary task obvious in the first screen?
- Is there exactly one primary action?
- Are loading, empty, and error states present?
- Are all user-facing strings translated?
- Does the layout hold on mobile?
- Are cards only used where they are doing real work?
- Does the screen still make sense if decorative chrome is removed?

## Canonical Repo Patterns

Use existing examples as reference patterns rather than inventing new ones:

- `src/modules/overview/OverviewDashboardPage/OverviewDashboardPage.tsx`
- `src/modules/campaigns/CampaignsList/CampaignsList.tsx`
- `src/modules/roles/RolesPage/RolesPage.tsx`
- `src/modules/campaigns/CampaignsForm/DashboardSection/DashboardWidgetForm/DashboardWidgetForm.tsx`

## Hard Rejections

- hero marketing on operational screens
- card overload when plain layout is enough
- multiple competing primary actions
- hardcoded strings
- missing empty or error states
- layouts that break on mobile
- decorative gradients or shadows that do not improve comprehension
