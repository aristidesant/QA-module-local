# Client Form Page Visual Redesign

**Date:** 2026-07-03  
**Status:** Approved for implementation planning  
**Surface:** Client creation (`/clients/new`) and editing (`/clients/:clientId/edit`) pages  
**Audience:** Master-client administrators managing client records and configuration

## Summary

Apply a polished, modern "structured tool" visual layer on top of the existing routed client form pages. The redesign keeps the current information architecture and behavior intact while elevating the perceived quality through a cleaner header, stronger section cards, a refined sticky section rail, explicit persistent actions, and careful motion.

## Goals

- Make the create/edit client pages look unmistakably modern, professional, and on-brand.
- Improve scannability and hierarchy without changing the field set or API contracts.
- Deliver a consistent experience across light mode, dark mode, desktop, tablet, and mobile.
- Preserve all existing form behavior: validation, dirty-state guarding, partial save, and section navigation.

## Non-goals

- Adding or removing client fields.
- Changing API contracts, mutations, or permission logic.
- Converting the form into a wizard or multi-step flow.
- Adding automated tests, per repository convention.

## Approved Direction

### Visual register

Product register with a **restrained** color strategy. Newtech Green is the single dominant accent for primary actions, active section, focus rings, success, and progress. Neutrals carry hierarchy. No decorative competing accents.

The working scene is a master administrator configuring an organization in a well-lit operations environment. The page should feel comparable in clarity and density to Stripe settings, Linear settings, or GitHub organization settings while staying inside the existing Newtech component vocabulary.

### Design read

- **Direction:** Structured modern tool.
- **Navigation:** Sticky side rail.
- **Header:** Clean, light surface with explicit actions and summarized metadata.
- **Cards:** Bordered white surfaces with subtle elevation on hover.
- **Motion:** Purposeful micro-interactions only; no decorative page-load choreography.

## Visual System

### Header

- **Background:** `Pure Surface` (`#FFFFFF`) in light mode, `Dark Card` (`#141A22`) in dark mode.
- **Border:** 1 px bottom `Whisper Border` (`rgba(221, 226, 232, 0.7)`) / `Dark Border` (`#232C38`).
- **Title:** H1, `DM Sans` weight 700, `Ink Primary` / `Dark Text Primary`.
- **Subtitle/metadata row:** directly below the title, single flex row with `gap: 16px`.
  - Alias shown as a mono tag (`JetBrains Mono`, size 13 px, background `Sunken Base`, radius 6 px).
  - Status badge with semantic color (active = green, inactive = neutral/gray).
  - Creation date and client ID only in edit mode, `Muted Slate` / `Dark Text Secondary`, size 13 px.
- **Actions:** aligned to the right on the same baseline as the title/metadata.
  - Primary: **Guardar cambios** / **Crear cliente** — green fill, white text, radius 8 px.
  - Secondary: **Cancelar** — outline, `Ink Primary` text, same radius.
- **Unsaved indicator:** a small dot + "Cambios sin guardar" text near the primary action when the form is dirty. Color `Warning` (`#F59E0B`) for the dot, `Muted Slate` for the text.
- **Sticky behavior:** the header becomes sticky on desktop only when the page is scrolled; on mobile it remains in flow to maximize usable space.

### Two-column layout

- **Desktop/tablet (> 768 px):**
  - Main column: `minmax(0, 1fr)`.
  - Side rail: `240 px` fixed.
  - Gap: `24 px`.
  - Max content width: `1240 px`, centered with page padding `32 px`.
- **Mobile (≤ 768 px):**
  - Single column.
  - Side rail collapses to a compact horizontal section jump control (chips or select) placed directly below the header.
  - Bottom fixed action bar for Cancel + primary action.

### Section cards

Each existing section becomes a `SectionCard` with the following visual treatment:

- **Background:** `Pure Surface` / `Dark Card Elevated`.
- **Border:** 1 px `Whisper Border` / `Dark Border`.
- **Radius:** `12 px`.
- **Padding:** `24 px` internal.
- **Shadow:** `0 4px 12px rgba(15, 23, 42, 0.06)` in light mode, subtle dark shadow in dark mode.
- **Hover (desktop):** `translateY(-2px)`, shadow increases to `0 8px 20px rgba(15, 23, 42, 0.08)`.
- **Header:**
  - Icon: 24 px Tabler icon, `Steel Secondary` / `Dark Text Secondary`, aligned with title.
  - Title: H3, `DM Sans` weight 600, `Ink Primary` / `Dark Text Primary`.
  - Description: 14 px body, `Steel Secondary` / `Dark Text Secondary`, max 60 ch.
- **Body:**
  - Fields in a 2-column grid (`gap: 16 px`) by default.
  - Full-width fields for long values (website, address, description).
  - Mobile: single-column fields.

### Section rail

- **Container:** sticky, top `16 px`, width `240 px`, background matches page surface, border 1 px, radius `12 px`, padding `12 px`.
- **Item:**
  - Full width, radius `8 px`, padding `9px 12px`.
  - Icon 18 px + label 14 px weight 500.
  - Default: `Steel Secondary` / `Dark Text Secondary`.
  - Hover: background `Sunken Base` / `Dark Card`.
  - Active: background `Green Soft` (`#ECFDF2`), text `Green Dark` (`#0D7530`), font-weight 600.
  - Error: red dot indicator + `Error` (`#E53935`) text color.
- **Divider:** none between items; spacing `4 px` is enough.
- **Mobile:** horizontal scrollable chips below the header, or Mantine `Select` if chips exceed viewport.

### Inputs and form controls

- Follow existing Newtech form conventions:
  - Label above input, 13 px weight 600.
  - Input border 1 px `Whisper Border`, radius 8 px, padding `10px 12px`, background surface.
  - Focus: border `Newtech Green`, ring `rgba(27, 181, 74, 0.22)` 4 px.
  - Error: border `Error`, ring `rgba(229, 57, 53, 0.18)`.
  - Error text below input, 13 px `Error`.
- Selects and searchable dropdowns keep Mantine defaults but inherit focus/error colors.

### Actions

- **Desktop:** Cancel + primary action in the header right.
- **Mobile:** fixed bottom bar, full-width buttons, 44 px min touch height, safe-area inset.
- **Loading state:** primary button shows Mantine `Loader` (size `sm`, color inherited) and becomes disabled; label remains "Guardando...".
- **Success state:** after save, primary button briefly shows a check icon + "Guardado" for 1.5 s before returning to default.

### Page states

- **Loading:** shimmer skeleton replicating header metadata row, side rail, and 3 section cards. No centered spinner.
- **Error:** inline alert below the header with retry and back actions; page shell remains.
- **Partial save:** yellow warning alert below the header + section-level warning on the affected card.
- **Dirty navigation:** confirmation modal (existing behavior), styled with Newtech alert colors.

## Motion

- **Card mount:** staggered `opacity 0 → 1` + `translateY(12px → 0)` with 60 ms delay per card, duration 380 ms, ease `[0.22, 1, 0.36, 1]`.
- **Card hover:** `transform translateY(-2px)` + shadow transition, 120 ms ease.
- **Button hover:** `translateY(-1px)`; active: `translateY(1px)`.
- **Focus rings:** 120 ms ease-out.
- **Rail active item:** background/text color transition 120 ms.
- **Reduced motion:** all motion collapses to instant or crossfade. Respect `prefers-reduced-motion`.

## Responsive Requirements

Verify at 375 px, 390 px, 768 px, 1024 px, and 1440 px.

- **≤ 768 px:**
  - Header actions move to fixed bottom bar.
  - Side rail becomes horizontal section control.
  - Cards full width, internal padding `16 px`.
  - Fields single column.
- **> 768 px:**
  - Two-column layout.
  - Sticky rail visible.
  - Header actions visible in header.

## Dark Mode

- Use Mantine CSS variables and `light-dark()` for any manual CSS Module overrides.
- No updated component may hardcode a light-only surface, text, border, hover, focus, or shadow color.
- Verify header, cards, rail, inputs, badges, alerts, skeleton, and bottom action bar in dark mode.

## Component Boundaries

Keep the existing component split and only update visual/styling responsibilities:

- `ClientFormPage`: page wrapper, no visual change beyond ensuring surface color.
- `ClientForm`: header layout, section grid, section card rendering, skeleton, error state, dirty indicator.
- `ClientSectionNav`: rail styling, active/error item visuals, mobile control.
- `ClientFormActions`: header actions on desktop, sticky bottom bar on mobile, loading/success states.
- `ClientThemeSection`: keep existing branding logic; wrap in updated `SectionCard` styling.
- `SectionCard`: may need new props for icon and hover elevation, or use a local styled wrapper.

## Files Likely to Change

- `src/modules/clients/ClientForm/ClientForm.tsx`
- `src/modules/clients/ClientForm/ClientForm.module.css`
- `src/modules/clients/ClientSectionNav/ClientSectionNav.tsx`
- `src/modules/clients/ClientSectionNav/ClientSectionNav.module.css`
- `src/modules/clients/ClientFormActions/ClientFormActions.tsx`
- `src/modules/clients/ClientFormActions/ClientFormActions.module.css`
- `src/modules/clients/ClientForm/ClientThemeSection.tsx`
- `src/modules/clients/ClientForm/ClientThemeSection.module.css`
- `src/locales/en/clients.json`
- `src/locales/es/clients.json`

## Content and Localization

Update copy where the new visual structure introduces new labels:

- Header metadata labels ("Alias", "Estado", "Creado", "ID").
- Unsaved changes indicator text.
- Loading/success button labels.
- Empty or placeholder states inside the new layout.

All visible strings must live in `clients.json` for both `en` and `es`.

## Accessibility

- Maintain visible green focus rings.
- Keep `aria-current` on active rail item.
- Keep `aria-live` region for validation summary, save state, and partial failures.
- Error and active states must include icon or text, not color alone.
- Preserve logical keyboard order.
- Ensure WCAG AA contrast for all text, placeholders, borders, focus, and semantic states.

## Manual Acceptance Criteria

- The create and edit pages visually match the approved "structured" direction.
- Header shows title, alias tag, status badge, and actions on desktop.
- Section cards use bordered white/dark surfaces with hover lift.
- Side rail highlights active section with green soft background.
- Mobile shows horizontal section control and fixed bottom action bar.
- Loading state uses shimmer skeleton, not a spinner.
- All existing form behavior remains intact: validation, dirty guard, partial save, section navigation.
- Light mode, dark mode, keyboard navigation, reduced motion, and required viewport widths remain usable.
- `npm run typecheck` and `npm run build` complete successfully.
