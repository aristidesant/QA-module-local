# Invoice Template Settings Redesign

**Date:** 2026-06-03  
**Status:** Approved  
**Component:** `InvoiceTemplateManager`  
**Page:** `/billing/invoices`

---

## Problem

The Invoice Template Settings section currently uses a full `SectionCard` wrapper that sits between the filters and the invoices table. This gives the section too much visual prominence for a secondary configuration area, making it feel intrusive despite being collapsed by default.

## Goal

Reduce the visual weight of the Invoice Template Settings while preserving its functionality and relevance. The section should feel like a lightweight, discoverable toolbar element rather than a primary section card.

## Solution

Replace the `SectionCard` wrapper with a **minimalist toolbar row** that expands inline to reveal controls.

### Collapsed State (Default)

A single row with:

- **Dashed border** (`1px dashed #dee2e6`)
- **Rounded corners** (6px)
- **Left side:** Document icon + "Invoice Templates" label (font-weight: 500) + green badge showing configured count
- **Right side:** Chevron down icon
- **Cursor:** pointer
- **Background:** white

The row sits between the filters SectionCard and the invoices table SectionCard, maintaining its current position in the page flow.

### Expanded State

Clicking the toolbar row toggles expansion. The expanded content appears directly below the toolbar row:

- **Border:** Same dashed border continues from the toolbar row, with the top border removed (creating visual continuity)
- **Top corners:** 0 (flush with toolbar row bottom)
- **Bottom corners:** 6px (matching toolbar row)
- **Background:** `#fafbfc` (subtle gray, lighter than the page background)
- **Padding:** 12px

The toolbar row's bottom corners become square (border-radius: 6px 6px 0 0) and its bottom border is removed, creating a seamless visual connection with the expanded panel.

### Expanded Content

The expanded panel contains the same functionality as the current implementation:

1. **"View Available Variables" link** — Opens the `PlaceholderGuideModal`. Styled as a subtle text link with a book icon.

2. **Issuer Client Select** — A labeled Select component (searchable, clearable) for choosing which client's template to manage.

3. **Template Status** (when client is selected):
   - "Current:" label + template filename + "Configured" badge (green) or "None" badge (gray)
   - Info text explaining .xlsx format requirement (plain dimmed text, not an Alert component)
   - Action buttons: Upload, Download (if template exists), Remove (if template exists)

4. **Empty State** (when no client is selected):
   - Centered dimmed text: "Select a client to manage its template"

### What's Removed

- `SectionCard` wrapper (title, description, card padding/shadow)
- `Alert` component for info text (replaced with plain dimmed text)
- Card-style visual hierarchy

### What's Preserved

- All data fetching logic and lazy loading (queries only fire when `isExpanded` is true)
- All mutations (upload, update, download, remove)
- All notifications and error handling
- `PlaceholderGuideModal` functionality
- Badge showing configured template count
- Collapsible behavior (now toolbar row click instead of SectionCard title click)

## Implementation Details

### Component Structure

```
InvoiceTemplateManager
├── Toolbar Row (clickable, toggles isExpanded)
│   ├── Icon (document)
│   ├── Label ("Invoice Templates")
│   ├── Badge (configured count)
│   └── Chevron (down/up)
├── Collapse (Mantine)
│   └── Expanded Panel
│       ├── "View Available Variables" link
│       ├── Select (issuer client)
│       ├── [if client selected]
│       │   ├── Template status row
│       │   ├── Info text
│       │   └── Action buttons (Upload, Download, Remove)
│       └── [if no client]
│           └── Empty state text
└── PlaceholderGuideModal
```

### Styling Approach

- Use CSS modules for the toolbar row and expanded panel
- Dashed border style is consistent between collapsed and expanded states
- Background color transition is not animated (instant toggle)
- Chevron rotation can be animated with CSS transition (optional)

### Position in Page

The component remains at its current position in `InvoicesPage.tsx` (line 273), rendered between the filters SectionCard and the invoices table SectionCard.

No changes to `InvoicesPage.tsx` are required beyond removing any spacing adjustments that assumed a full SectionCard.

## Success Criteria

- The Invoice Template Settings section is visually less prominent than the filters and invoices table sections
- All existing functionality is preserved
- The section remains discoverable and clearly interactive
- The configured template count badge is visible in the collapsed state
- Lazy loading behavior is preserved (no performance regression)
