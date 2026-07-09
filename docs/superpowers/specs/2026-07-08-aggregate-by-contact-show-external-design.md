# Aggregate By Contact & Show External — Frontend Design

**Date:** 2026-07-08
**Related backend spec:** `agent-service` — `aggregateByContact` + `showExternal` (see backend changes doc supplied by user, 2026-07-08)

## Context

Backend shipped two independent features on the Analytics Dashboards / Campaigns API:

1. `aggregateByContact` — optional boolean on a widget's metric config. When true, the metric engine groups conversations by `contact_id` and only uses each contact's latest conversation, avoiding double-counting a contact across multiple conversations.
2. `showExternal` — new boolean column on `Campaign`, controlling whether a campaign is visible in the mobile app's dashboards. Read as `showExternal` in GET responses; written as `showInMobile` in POST/PATCH bodies (naming kept as specified by backend, resolved on the frontend via a single sanitizer rename).

This document covers the frontend work needed to expose and wire both flags.

---

## Part 1 — `aggregateByContact` (Widget Editor)

### Type changes

- `DashboardWidgetMetricConfig` (`src/models/AnalyticsDashboard.ts:107-121`): add `aggregateByContact?: boolean`.
- Widget form values type (in `DashboardWidgetForm.context.tsx` / helpers): add `aggregateByContact: boolean` alongside existing flags like `enabled`, `supportsGroupBy`.

### Form state & UI

- Add a handler `handleAggregateByContactChange` to the form context, following the exact pattern of `handleEnabledChange` / `handleSupportsGroupByChange`.
- Add a new `Switch` in `DashboardWidgetAdvancedSection.tsx`, in the existing `SimpleGrid` of switches (alongside "Widget Enabled", "Supports grouped output"), using the same `switchTile` styling and click-to-toggle wrapper.
- **Visibility:** always shown, no conditional gating by `sourceType` or `widgetType`. Simpler than per-source gating and backend already no-ops safely when the source doesn't involve conversations.
- Default: `false` / unset (unchecked), matching backend default.

### Wiring (two explicit points — no blanket spread exists in this codebase)

1. `buildMetricPayload` (`DashboardWidgetForm.helpers.ts:2396-2420`) — add `aggregateByContact` to the explicit field list. This feeds `buildWidgetDataConfig`, used by both widget create and update submission (`useDashboardWidgetFormController.ts:739`). Once saved, the flag is persisted server-side as part of the widget's `dataConfig.metric`.
2. `normalizePreviewPayload` (`src/queries/analyticsDashboardsQueries.ts:280-300`) — add `aggregateByContact` to this explicit re-pick, so live widget-preview calls (`previewDashboardWidget`) reflect the toggle before saving.

### Render-comparison — no change needed

`renderDashboardComparison` (used by `CampaignDashboardViewer.tsx`) renders already-saved widgets by `dashboardId`; it does not rebuild `dataConfig.metric` from the widget form. Once a widget is saved with `aggregateByContact: true` via create/update, the backend reads it from the persisted config automatically when the dashboard is rendered. No wiring needed in `CampaignDashboardViewer.tsx` or `DashboardRenderComparisonRequest` for this flag.

### i18n

Namespace `campaign.form.dashboards`, under `dashboardBuilder.form.fields`:

- `aggregateByContact` — label, e.g. "Aggregate by contact" / "Agrupar por contacto"
- `aggregateByContactHint` — short description, e.g. "Count each contact once using their latest conversation" / "Contar cada contacto una vez usando su última conversación"

---

## Part 2 — `showExternal` (Campaigns)

### Type changes

- `Campaign` (`src/models/CampaignsModel.ts:180` area): add `showExternal?: boolean`, next to `noiseCancellation`.

### Campaign form

- New component `ShowExternalSection.tsx` under `src/modules/campaigns/CampaignsForm/GeneralSection/`, copying the exact structure of `NoiseCancellationSection.tsx` (a `SectionCard` + Mantine `Switch` bound to `form.values.showExternal` / `form.setFieldValue`).
- Wired into `GeneralSection.tsx` the same way `NoiseCancellationSection` is.
- Default: unchecked (`false`).
- Label: "Visible in mobile app" (`general.showExternalLabel`), matching the spec's suggested wording.

### API field-name resolution (`showExternal` ↔ `showInMobile`)

The frontend model, form, and list column all use `showExternal` internally for consistency with the GET response shape. Only the write path (create/update) needs a rename to match the backend's POST/PATCH body field name (`showInMobile`).

- Add a rename branch inside `sanitizeNestedPayload` (`src/utils/agentPayloadSanitizer.ts:131-143`), the single choke point already used by `createCampaign` and `updateCampaign`/`updateCampaignLight`: when the key is `showExternal`, write it out as `showInMobile` instead.
- No reverse mapping needed on read — `findCampaign`/`findAllCampaigns`/`findAllCampaignsPaginated` return `response.data` untouched, and GET responses already use `showExternal` per the backend spec.

### Campaigns list — non-invasive indicator

- Add an icon-only column to `useCampaignsColumns.tsx` (after the `status` column), following the icon+Tooltip pattern from `useDispositionCatalogTableColumns.tsx:87-105`.
- Renders **only when `showExternal === true`**: a small `ActionIcon`/icon wrapped in a `Tooltip` (e.g. `IconDeviceMobile` or similar) with a label like "Visible in mobile app". Renders nothing (`null`) when false — no icon, no placeholder, no visual noise for the common case.
- No new filter added to `CampaignFilters` — out of scope per explicit instruction to keep this non-invasive. Can be added later if needed.

### Dashboard render filter (`CampaignDashboardViewer`)

- Add `showExternal?: boolean` to `DashboardRenderRequest` and `DashboardRenderComparisonRequest` (`src/models/AnalyticsDashboard.ts:300-306` and `:328-334`).
- Add a new filter control (Switch) in `CampaignDashboardViewer.tsx` alongside the existing `selectedTimeRange`/`contactGroupId` state (lines ~170-192), threaded into the `renderPayload` memo so it's sent on `renderDashboard`/`renderDashboardComparison` calls when toggled on.
- Default: off/unset — matches backend default behavior (omitting the field means no filtering by `show_external`).

### i18n

- `general.showExternalTitle` / `general.showExternalSectionDesc` / `general.showExternalLabel` / `general.showExternalDesc` in `campaign.form.general.json` (en/es), mirroring the `noiseCancellation` key group.
- A tooltip label key for the list column (e.g. `columns.showExternalTooltip` in the campaigns list namespace).
- A filter label key for the `CampaignDashboardViewer` toggle, added to whichever i18n namespace already holds the `selectedTimeRange`/`contactGroupId` filter labels in that component.

---

## Out of Scope

- No changes to `CampaignFilters` (no new "visible in mobile" filter dropdown/switch in the campaigns list toolbar).
- No conditional gating of the `aggregateByContact` switch by widget/source type — always visible.
- No backend changes (already shipped).
- No new tests added unless requested (per project convention — tests are not created unless explicitly asked).

## Backward Compatibility

- Both flags are optional and default to falsy/unset on the frontend, matching backend defaults. Existing widgets and campaigns render and behave identically until a user explicitly opts in via the new switches.
