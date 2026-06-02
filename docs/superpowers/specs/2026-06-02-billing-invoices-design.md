# Billing / Invoices Module — Design

**Date:** 2026-06-02  
**Status:** Approved  
**Scope:** Master-tenant-only invoicing feature

---

## Overview

New top-level Billing section in the sidebar, accessible only to the master tenant (`clientId === 1`). Covers invoice generation, preview, creation, status transitions (DRAFT → ISSUED, void), and DOCX download. Client invoice configuration fields (`website`, `pocUserId`, `invoiceTemplateFileId`) are added to the existing `ClientForm`.

---

## Architecture

### File Structure

```
src/
  api/
    invoiceApi.ts
  models/
    InvoiceModel.ts
  queries/
    invoiceQueries.ts
  modules/
    billing/
      InvoicesPage/
        InvoicesPage.tsx
        InvoicesPage.module.css
        index.ts
      InvoiceNewPage/
        InvoiceNewPage.tsx
        InvoiceNewPage.module.css
        index.ts
      InvoiceDetailPage/
        InvoiceDetailPage.tsx
        InvoiceDetailPage.module.css
        index.ts
      components/
        InvoiceStatusBadge/
          InvoiceStatusBadge.tsx
          index.ts
        InvoiceSnapshotCard/
          InvoiceSnapshotCard.tsx
          InvoiceSnapshotCard.module.css
          index.ts
        InvoiceFilters/
          InvoiceFilters.tsx
          InvoiceFilters.module.css
          index.ts
      hooks/
        useInvoiceColumns.ts
      index.ts
  locales/en/
    billing.json
```

### Routes

Added under the existing `masterOnly` `ModuleGuard` pattern:

```
/billing/invoices          → InvoicesPage
/billing/invoices/new      → InvoiceNewPage
/billing/invoices/:id      → InvoiceDetailPage
```

New `ModuleEnum.BILLING` entry and corresponding nav item. Route guard uses `masterOnly`.

---

## Data Layer

### `InvoiceModel.ts`

Full TypeScript types matching the API spec:

- `InvoiceStatus = 'DRAFT' | 'ISSUED' | 'VOIDED'`
- `InvoiceCurrency = 'USD' | 'DOP'`
- `InvoiceSnapshot` — full snapshot shape including `ClientSnapshot`, `PocSnapshot`, `InvoiceSummaryLine`, `InvoiceExecutionDetail`, `InvoiceTotals`
- `InvoiceResponse` — entity returned by GET/POST/PATCH endpoints
- `InvoicePreviewResponse` — `{ hasActiveInvoiceConflict, activeInvoiceConflict, snapshot }`
- `PreviewInvoiceDto`, `CreateInvoiceDto`, `FilterInvoiceDto`, `VoidInvoiceDto`
- `InvoicePaginatedResponse` — `{ data: InvoiceResponse[], total, limit, offset }` (not reusing existing `Paginator` which uses `page`/`totalPages`)

`ClientModel` extended with `website?: string`, `pocUserId?: number | null`, `invoiceTemplateFileId?: number | null`.  
`UpdateClientRequest` extended with same optional fields.

### `invoiceApi.ts`

Factory function matching `clientApi.ts` pattern:

| Method                                         | Endpoint                                                                     |
| ---------------------------------------------- | ---------------------------------------------------------------------------- |
| `previewInvoice(dto: PreviewInvoiceDto)`       | POST /invoices/preview                                                       |
| `createInvoice(dto: CreateInvoiceDto)`         | POST /invoices                                                               |
| `getInvoices(filters: FilterInvoiceDto)`       | GET /invoices                                                                |
| `getInvoice(id: number)`                       | GET /invoices/:id                                                            |
| `issueInvoice(id: number)`                     | PATCH /invoices/:id/issue                                                    |
| `voidInvoice(id: number, dto: VoidInvoiceDto)` | PATCH /invoices/:id/void                                                     |
| `downloadDocx(id: number, token: string)`      | GET /invoices/:id/docx — `fetch` with auth header, triggers browser download |

DOCX download uses `fetch` directly (not axios) to handle binary blob response and trigger browser download via object URL.

### `invoiceQueries.ts`

TanStack React Query hooks:

| Hook                      | Type          | Notes                                            |
| ------------------------- | ------------- | ------------------------------------------------ |
| `useGetInvoices(filters)` | `useQuery`    | Key includes filters object                      |
| `useGetInvoice(id)`       | `useQuery`    | `enabled: !!id`                                  |
| `usePreviewInvoice()`     | `useMutation` | POST — not a query                               |
| `useCreateInvoice()`      | `useMutation` | Invalidates `['invoices']` on success            |
| `useIssueInvoice()`       | `useMutation` | Invalidates `['invoices']` and `['invoice', id]` |
| `useVoidInvoice()`        | `useMutation` | Invalidates `['invoices']` and `['invoice', id]` |
| `useDownloadDocx()`       | `useMutation` | Calls `invoiceApi().downloadDocx(...)` directly  |

---

## Pages

### `InvoicesPage` (`/billing/invoices`)

- `SectionCard` with `InvoiceFilters` (status select, period date range, issuer/receiver client selects)
- `BaseTable` with server-side pagination (`offset`/`limit`)
- Columns: invoice number, issuer name, receiver name, period, `InvoiceStatusBadge`, currency, total (`snapshot.totals.totalFormatted` when available, fallback to `total` string), created date, actions
- Row actions: View (→ `/billing/invoices/:id`), Issue (DRAFT only), Void, Download DOCX
- "+ New Invoice" button → navigate to `/billing/invoices/new`

### `InvoiceNewPage` (`/billing/invoices/new`)

3-step Mantine `Stepper`:

**Step 1 — Parameters**

- Issuer client (Select, required)
- Receiver client (Select, required)
- Period start / end (DateInput, required)
- Invoice number (TextInput, required)
- Currency (SegmentedControl: USD / DOP)
- Tax rate (NumberInput, 0–100)
- Hourly rate (NumberInput, ≥ 0)
- "Preview Invoice" button → calls `POST /invoices/preview`, advances to step 2

**Step 2 — Preview**

- Renders `InvoiceSnapshotCard` with preview snapshot
- If `calculationWarnings.length > 0`: yellow `Alert` listing warnings (non-blocking)
- If `hasActiveInvoiceConflict: true`: red `Alert` showing existing invoice details + "Replace existing invoice" Checkbox + reason Textarea (required when checked)
- "Back" and "Continue" buttons

**Step 3 — Confirm & Create**

- Status selector: DRAFT (default) / ISSUED
- Summary: period, invoice number, total from preview
- "Create Invoice" button → calls `POST /invoices`
  - If conflict was acknowledged: includes `replaceExisting: true`, `replacesInvoiceId`, `replaceReason`
- On success → navigate to `/billing/invoices/:id`
- On 409 (race condition) → re-call preview, return to step 2

### `InvoiceDetailPage` (`/billing/invoices/:id`)

- Fetches invoice via `GET /invoices/:id`
- Header: invoice number, `InvoiceStatusBadge`, created date
- Action bar:
  - **Issue** — visible for DRAFT only, simple confirm modal
  - **Void** — destructive, `modals.openConfirmModal` with required reason `Textarea`; confirm disabled until reason non-empty
  - **Download DOCX** — loading state on button; 422 → notification "Template invalid"; 404 → notification "No template configured"
- `InvoiceSnapshotCard` — full snapshot display

---

## Components

### `InvoiceSnapshotCard`

Shared between wizard preview (step 2) and detail page. Renders:

- Issuer and receiver info blocks (name, RNC, email, phone, address, website)
- POC contacts (issuer + receiver)
- Summary lines `BaseTable` (campaign, agents, uptime, hourly rate, total)
- Execution details `BaseTable` — collapsible (campaign, date, agents, uptime, calls, start/end timestamps)
- Totals block (subtotal, tax, total)

### `InvoiceStatusBadge`

Mantine `Badge`:

- DRAFT → gray
- ISSUED → green
- VOIDED → red

### `InvoiceFilters`

Filter bar component with controlled state:

- Status `Select`
- Period start / end `DateInput`
- Issuer client `Select`
- Receiver client `Select`
- "Clear filters" button

---

## Client Form Extension

`ClientForm` (existing) gets new "Invoice Settings" `SectionCard` section, rendered only when `useIsMasterClient()` returns true.

Fields:

- `website` — TextInput
- `pocUserId` — Select populated from client's users list
- `invoiceTemplateFileId` — Select populated from client's files, filtered to `.docx` extension (frontend filter)

These fields use `PATCH /clients/:id` via the existing `useUpdateClient` mutation.

---

## Error Handling

| Scenario                         | Behavior                                                                                            |
| -------------------------------- | --------------------------------------------------------------------------------------------------- |
| `calculationWarnings` on preview | Yellow `Alert` in step 2, non-blocking                                                              |
| `hasActiveInvoiceConflict: true` | Red `Alert` + replace checkbox + reason input in step 2                                             |
| 409 on create (race condition)   | Re-call preview, return to step 2 with conflict shown                                               |
| 422 on DOCX download             | Notification: "Invoice template is invalid. Please review the issuer's template."                   |
| 404 on DOCX download             | Notification: "No invoice template configured for issuer. Add a .docx template in client settings." |
| 403                              | Blocked by `masterOnly` route guard before render                                                   |
| Empty preview snapshot           | Empty state in summary/execution tables, warnings explain reason, user can still proceed            |
| Void without reason              | Confirm button disabled until reason Textarea is non-empty                                          |

---

## i18n

All strings in `src/locales/en/billing.json`. Namespace: `billing`. Covers page titles, column headers, form labels, status labels, error/success notifications, confirmation modal text.

---

## Permissions & Guards

- All billing routes use `masterOnly` on `ModuleGuard`
- `useIsMasterClient()` hook guards the "Invoice Settings" section in `ClientForm`
- No new `PermissionEnum` entries needed — master-only access is sufficient
