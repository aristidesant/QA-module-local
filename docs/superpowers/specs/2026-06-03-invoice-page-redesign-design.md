# Invoice Page Redesign — Design

**Date:** 2026-06-03  
**Status:** Approved for planning  
**Scope:** Moderate redesign of the master-only billing invoice workflow

## Overview

Redesign the invoice experience as a cohesive operational workflow across the existing invoice list, creation, detail, and snapshot review surfaces. The goal is a more visually appealing and easier-to-use billing module without changing backend contracts, routes, permissions, or invoice status behavior.

The chosen direction is an **Operational Command Center**: keep the module efficient for day-to-day operations, but give invoice-specific data a clearer visual hierarchy. Totals, status, parties, period, warnings, conflicts, and primary actions should be visible earlier and easier to scan.

## Goals

- Make invoice management feel cohesive across list, creation, and detail pages.
- Surface invoice status, totals, parties, and period with stronger hierarchy.
- Keep the experience practical for repeated operational use.
- Preserve the existing API, React Query hooks, routing, and master-only access model.
- Improve copy and error feedback through the existing `billing` i18n namespace.

## Non-Goals

- No backend or API changes.
- No route changes.
- No new invoice statuses or workflow states.
- No printable/PDF invoice rendering redesign.
- No bulk invoice actions.

## Existing Routes

The redesign keeps the current route structure:

```txt
/billing/invoices
/billing/invoices/new
/billing/invoices/:id
```

All routes remain behind the existing `ModuleGuard` with `masterOnly` billing access.

## Architecture

The redesign stays inside the current `src/modules/billing/` module.

Primary affected surfaces:

```txt
src/modules/billing/
  InvoicesPage/
  InvoiceNewPage/
  InvoiceDetailPage/
  components/
    InvoiceFilters/
    InvoiceSnapshotCard/
    InvoiceStatusBadge/
    InvoiceTemplateManager/
  hooks/
    useInvoiceColumns.tsx
```

Shared primitives remain required:

- `SectionCard` for page and form sections.
- `BaseTable` for invoice, summary line, and execution detail tables.
- Mantine components for controls, alerts, groups, stacks, steppers, and buttons.
- `@tabler/icons-react` for icon actions.

CSS changes use CSS Modules and theme tokens. New or updated UI must work in light, dark, and auto modes.

## Invoice Workspace

`InvoicesPage` becomes the main invoice workspace.

### Header

Add a compact page header area with:

- Page title and short description from `billing.json`.
- Primary `New Invoice` action.
- A concise invoice summary derived from the currently loaded page of invoice data.

The summary is page-scoped, not system-wide. Labels should avoid implying totals across all invoices unless the API provides that data.

Suggested visible summary items:

- Loaded invoice count.
- Draft count.
- Issued count.
- Voided count.
- Visible invoice value when snapshot totals are available.

### Filters

Keep `InvoiceFilters` controlled by `InvoicesPage`, but redesign it as a compact toolbar:

- Status.
- Issuer client.
- Receiver client.
- Period start.
- Period end.
- Clear filters when active.

The filter layout should be easy to scan on desktop and collapse cleanly on mobile.

### Template Settings

Keep `InvoiceTemplateManager` on the invoice workspace, but make it visually secondary:

- It should not interrupt daily invoice review.
- It should remain accessible from the workspace.
- A compact or collapsible presentation is preferred.

### Table

Continue using `BaseTable` with existing server-side pagination.

Improve row scanability:

- Invoice number and status should be visually prominent.
- Issuer and receiver should read as the core billing relationship.
- Total should be emphasized.
- Actions remain icon-based with tooltips.
- Empty and error states should use localized copy and clearer spacing.

## Create Invoice Flow

`InvoiceNewPage` keeps the current preview-first model and current mutations:

```txt
form values -> preview mutation -> snapshot review -> create mutation -> detail page
```

### Step 1: Parameters

Group form controls into clear sections instead of a single undifferentiated grid:

- Parties: issuer and receiver clients.
- Billing period: start and end dates.
- Invoice identity: invoice number.
- Financial settings: currency, tax rate, hourly rate.

The page should include a compact summary panel where useful. The summary can show selected issuer, receiver, period, currency, tax rate, and hourly rate as the user fills values.

### Step 2: Review

The preview step becomes a review screen.

Priority order:

1. Calculation warnings, if present.
2. Active invoice conflict, if present.
3. Snapshot summary with total, parties, period, and campaign lines.
4. Collapsed execution details.

Conflict handling remains unchanged:

- Show existing invoice number, status, and period.
- Require `Replace existing invoice` before continuing.
- Require a replace reason when replacement is selected.

### Step 3: Confirm

The final step shows a concise confirmation summary:

- Invoice number.
- Period.
- Total.
- Selected create status.

The create-as status selector remains `DRAFT` or `ISSUED`, but the UI should clearly communicate the difference between saving a draft and issuing immediately.

## Detail Review Workspace

`InvoiceDetailPage` becomes a review workspace.

### Review Header

The first viewport should make the invoice understandable without scrolling:

- Back navigation.
- Invoice number.
- `InvoiceStatusBadge`.
- Total amount.
- Billing period.
- Created date.
- Primary actions.

Action hierarchy:

- Draft invoices: `Issue` is the primary state-specific action.
- Issued invoices: `Download` is the primary non-destructive action.
- Non-voided invoices: `Void` remains available as a destructive secondary action.
- Voided invoices: destructive actions are not shown.

### Review Layout

Below the header, use a two-column layout on desktop and a single column on mobile.

Left side:

- Invoice identity.
- Issuer information.
- Receiver information.
- Issuer and receiver POC information.

Right side:

- Subtotal.
- Tax.
- Total.
- Currency.
- Hourly rate.
- Tax rate.

Campaign summary lines appear below the review layout as the main detailed table. Execution details remain collapsed by default because they are audit/supporting detail.

### Voided State

If an invoice has `voidedAt` or `voidReason`, show a warning-style panel near the top of the detail page with:

- Voided date.
- Void reason.

## Invoice Snapshot Component

`InvoiceSnapshotCard` should become a richer reusable review surface for both preview and detail pages.

If the file grows too large, split it into colocated internal components under `src/modules/billing/components/InvoiceSnapshotCard/`, such as:

- Party information panels.
- POC information panels.
- Totals panel.
- Summary lines table.
- Execution details disclosure.
- Warning or metadata panels.

The public component API should stay simple:

```ts
interface InvoiceSnapshotCardProps {
	snapshot: InvoiceSnapshot;
}
```

Optional presentation props may be added only if preview and detail genuinely need different emphasis.

## Data Flow

No data layer changes are required.

Existing hooks remain the source of server data and mutations:

- `useGetInvoices`
- `useGetInvoice`
- `usePreviewInvoice`
- `useCreateInvoice`
- `useIssueInvoice`
- `useVoidInvoice`
- `useDownloadInvoice`

Client filtering remains server-side through `FilterInvoiceDto`. Pagination remains based on the existing `limit` and `offset` flow.

Workspace summary metrics are derived from the currently loaded `invoices` array. They do not require new endpoints.

## Error Handling And Copy

Preserve current error behavior while improving localization and clarity.

All user-facing copy should live in:

```txt
src/locales/en/billing.json
src/locales/es/billing.json
```

Copy to localize or improve:

- Preview failure.
- Create failure.
- Create conflict refresh message.
- Issue failure.
- Void failure.
- Void reason required.
- Download invalid-template failure.
- Download missing-template failure.
- Generic download failure.
- Empty list state.
- Page-scoped summary labels.
- Voided invoice panel labels.

Existing success notifications remain, but should continue using localized billing keys.

## Accessibility And Responsiveness

- Keep icon actions wrapped in tooltips.
- Use visible text for primary actions such as `New Invoice`, `Issue`, `Download`, and `Create`.
- Preserve keyboard-accessible buttons, steppers, form controls, and table rows.
- Ensure two-column review layouts collapse to a readable single-column mobile layout.
- Avoid layout shifts on hover and loading states.
- Use Mantine theme tokens for color, spacing, borders, and surfaces.

## Implementation Notes

- Keep changes scoped to billing pages/components and billing locale files.
- Use `SectionCard`, `BaseTable`, and Mantine components rather than introducing a new UI system.
- Avoid hardcoded user-facing strings.
- Avoid inline styles.
- Keep comments in English and only add them when the code is not self-explanatory.
