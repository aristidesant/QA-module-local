# Reports preview as US Letter pages with page navigation

## Context

In Reports → Builder, the right-hand **Preview** card renders the report as one long scrolling "paper" (`.paper`, max-width 880px inside a 72vh scroll box). Nothing paginates: a QA Manager report grouped by agent can have 20+ rows per table, several tables and charts, and the user scrolls forever. The user wants the preview to look like a printed document: **US Letter pages**, content that does not fit moving to the **next page**, and **page navigation**.

Decisions (user, 2026-10-20): sections **flow continuously** (they share pages; a section title is never left alone at the bottom of a page; tables split by rows with the header repeated and a "continued" label). Navigation = **Prev / Next buttons + numbered page selector** (arrow keys also turn pages). No thumbnails, no zoom control, no page-size options. A footer with "Page X of N" is part of the page.

Not changed: the composer, `buildReportData`, CSV export, the four fixed Overview KPI tiles (the "selected metrics" only drive table columns, as today).

Mode: mockup. Mantine v9, CSS modules, no inline `style=` (the pre-commit hook rejects it), strings in `en` and `es`, dark/light via Mantine variables and `light-dark()`. No tests, no dev server. Prettier on touched files only. Do not commit unless asked.

Plan copy convention: Task 0 copies this file to `docs/superpowers/plans/2026-10-20-reports-letter-pages.md`.

---

## Verified facts (do not re-explore)

**Preview chain** (`src/modules/qa/reports/components/preview/`): `ReportPreview.tsx` (`{ data: ReportData }`; renders `<div className={styles.previewScroll}><div id='report-preview' className={styles.paper}><Stack gap='lg'>` → `ReportCover` → per section `{index > 0 && <Divider />}<ReportSection section compare />`, or `preview.noSections` text), `ReportCover.tsx` (`{ definition, generatedAt }`; title block, badges, scope line, confidentiality line, `.coverRule`), `ReportSection.tsx` (459 lines: helpers `Tile`, `ChangeCell`, a `segmentTable(rows, metricIds, primary)` closure, a `body()` switch over section keys, then `<Stack className={styles.section}><Title order={4}>{t('sections.items.<key>.label')}</Title>{body()}</Stack>`), `KpiTiles.tsx` (4 tiles in `SimpleGrid cols={{ base: 2, sm: 4 }}`). Mounted in `src/modules/qa/reports/tabs/BuilderTab.tsx` L292-300: `<Grid.Col span={{ base: 12, xl: 7 }}><SectionCard fullHeight title={t('preview.title')} description={t('preview.description')}><ReportPreview data={data} /></SectionCard>`. `SectionCard` clips overflow. `data` is built from the 300 ms debounced draft (`PREVIEW_DEBOUNCE_MS`). The PDF path is `window.print()` (BuilderTab L176-183; also `ReportsPage.tsx` L129-131 for Generated-tab PDF rows, which prints a blank page because the preview is not mounted there: pre-existing, leave it).

**Section blocks** (all tables are Mantine `Table striped withTableBorder verticalSpacing='xs'`, no row cap): `overview` = `KpiTiles` + `AreaChart h={200}` (trend, only if series non-empty) ; `qa|compliance|sentiment|business` = `BarChart h={200}` (first 8 rows) + segment table (columns: Segment, Calls, one per `metricIds`, Change when `compare`; up to 8 metric columns since the analytics rebuild) ; `campaigns|agents` = segment table ; `coaching` = 3 `Tile`s + table (agent, sessions, assignments, completed) ; `disputes` = 4 `Tile`s + 6-column table ; `burnout` = table (agent, level badge, risk %) ; `rankings` = table (program, status badge, period, leader, winner). Empty section → `preview.noData` text. Tables currently use `miw={560|640}` inside `.tableScroll`.

**Current CSS** (`src/modules/qa/reports/Reports.module.css`): `.previewScroll { max-height: 72vh; overflow: auto }`, `.paper { max-width: 880px; ... padding: xl }` (`light-dark(#ffffff, var(--mantine-color-dark-6))`), `.coverMark`, `.coverRule`, `.confidential`, `.section { break-inside: avoid }`, `.tableScroll`, `.numeric`, builder row styles, and an `@media print` block that hides `body *`, shows `#report-preview` (absolute, `inset: 0`, padding 16mm, white/black) and un-scrolls `.previewScroll`. No `@page`.

**Locale** `src/locales/{en,es}/qa.reports.json`: `preview.*` block at en L172-230 (`untitled`, `generatedAt`, `period`, `scope`, `confidential.*`, `noData`, `noSections`, `trend`, `current`, `previous`, `columns.*`, `tiles.*`); section titles `sections.items.<key>.label`. No "Page X of N" string exists in this namespace.

**Utilities to reuse**: `useElementSize` and `useDebouncedValue` from `@mantine/hooks`; Mantine `Pagination` (used as `<Pagination total value onChange size='sm' />` in `qa/campaigns/.../ConversationsTable.tsx`); `useChartReady` is not needed (charts mount inside a laid-out container). Dynamic values go through Mantine style props or `__vars`, never `style=`.

---

## Design

**Letter page at 96 dpi:** 816 × 1056 px, margins 72 px (0.75 in), so the content area is **672 × 912 px**; the footer lives in the bottom margin. Content is laid out at this native size and the whole page is scaled with `transform: scale(k)` to fit the panel width (`k = min(1, panelWidth / 816)`), so wrapping and page breaks are identical at every screen size.

**Flow model.** The document becomes a list of flow items; a pure paginator packs them into pages from measured heights:

```ts
type FlowItem =
	| { kind: 'block'; id: string; node: ReactNode; keepWithNext?: boolean } // atomic: cover, section title, tiles, chart, text
	| {
			kind: 'table';
			id: string;
			title: string; // section label, used for "<title> · continued"
			head: ReactNode; // the header <Table.Tr>
			rows: { id: string; node: ReactNode }[]; // <Table.Tr> per row
	  };
```

**Measuring.** A hidden layer (`position: absolute; left: -10000px; width: 672px; visibility: hidden; pointer-events: none`, outside the scaled area) renders every item at 672 px: blocks in `<div data-flow='id'>`, tables as a full `<Table>` with `data-flow-head` on the `thead` and `data-flow-row='rowId'` on each row. `useLayoutEffect` reads `getBoundingClientRect().height` (unaffected by transforms), stores `Measured`, and re-measures on `ResizeObserver` of the layer and after `document.fonts.ready`. State is only set when the numbers changed (no loops); `items` must be memoised.

**Packing (`paginate`)**, gap between items 20 px:

- Block: if it does not fit in the remaining height and the page is not empty → new page. A block taller than a page goes alone on its own page (clipped; cannot happen with current content).
- `keepWithNext` (section titles): needs `titleHeight + gap + minimumNext` to fit, where `minimumNext` is the next block's height, or for a table `head + chrome + min(2, rows)` rows; else new page first.
- Table: place as many rows as fit after `head + chrome`; require at least `min(2, remainingRows)` rows on a page that already has content, otherwise move the whole table start to a new page; continue the remaining rows on following pages with the header repeated (`continued: true`). A single row taller than a page is forced onto an empty page (no infinite loop).

**Rendering.** All pages stay mounted so charts have a layout and print works: non-current pages are stacked absolutely under the current one with `visibility: hidden`. Each page = `.sheet` (816 × 1056, white/dark paper via `light-dark`, border + soft shadow on screen) with `.sheetContent` (padding 72, `overflow: hidden`) and a footer (report name left, "Page X of N" right). The first block of the first page is the cover; continued tables get a small "`<Section>` · continued" caption above the repeated header.

**Navigation.** Toolbar above the page: Mantine `Pagination` (prev / numbered / next) and the text "Page 2 of 5". The viewport has `tabIndex={0}`; `ArrowLeft` / `ArrowRight` turn pages. The current page is clamped when the page count shrinks after the user edits the report.

**Print.** `@page { size: letter; margin: 0 }`. In print the toolbar and scaling go away and every `.sheet` is shown in sequence (8.5 in × 11 in, `break-after: page`, last one `auto`), so the browser's PDF output is the same pages the user paged through.

**Tables on a page.** `layout='fixed'`, `width: 100%`, 11 px font, header cells wrap, first column ~28%, numeric columns share the rest (8 metric columns fit 672 px); no `miw`, no horizontal scroll wrapper.

---

## Implementation plan

Execute in order; `npm run typecheck` after each task. New files live in `src/modules/qa/reports/components/preview/` unless noted.

### Task 0 — Plan copy

Copy this file to `docs/superpowers/plans/2026-10-20-reports-letter-pages.md`.

### Task 1 — Constants and the pure paginator

`src/modules/qa/reports/constants.ts` (append):

```ts
/** US Letter at 96 dpi, portrait. */
export const LETTER = {
	width: 816,
	height: 1056,
	margin: 72,
	contentWidth: 672, // width - 2 * margin
	contentHeight: 912, // height - 2 * margin
	gap: 20, // between flow items
} as const;
```

New `pagination.ts` (no React, fully typed, no imports except `ReactNode` type and `LETTER`):

```ts
import type { ReactNode } from 'react';

export type FlowItem = /* as above */;

export interface Measured {
	blocks: Record<string, number>;
	tables: Record<string, { head: number; rows: number[]; chrome: number }>;
}

export type PageEntry =
	| { kind: 'block'; id: string }
	| { kind: 'table'; id: string; from: number; to: number; continued: boolean };

export function paginate(items: FlowItem[], measured: Measured, height: number, gap: number): PageEntry[][];
```

Implement exactly the packing rules in "Packing" above: keep `used` and `current` page; helper `room()` = `height - used - (current.length ? gap : 0)`; `newPage()` pushes a page and resets `used`. For `keepWithNext` look ahead at `items[i + 1]`. An item with no measurement yet (first render) is treated as 0 height so the paginator never throws; the component shows a single page until the first measurement lands. Return at least one (possibly empty) page.

Sanity check without a test file: bundle `pagination.ts` with the npx esbuild one-liner used for the analytics data check into the scratchpad, call `paginate` with synthetic items (e.g. a 40-row table with 28 px rows and `height = 912`) and assert: no page exceeds `height`, row ranges are contiguous and cover all rows, the header repeats (`continued` true after the first chunk), a `keepWithNext` title never ends a page.

### Task 2 — Turn sections into flow items

Refactor `ReportSection.tsx` into plain builders (keep `Tile`, `ChangeCell`; `KpiTiles` unchanged):

```ts
export interface FlowContext {
	t: TFunction<'qa.reports'>;
	tMetrics: TFunction<'qa.teamAnalytics'>;
	compare: boolean;
}
export function sectionFlowItems(
	section: ReportSectionData,
	ctx: FlowContext
): FlowItem[];
```

Per section, in this order (ids are `${section.key}:<part>`):

- A **title block** first: `<Title order={4} className={styles.sectionTitle}>{t('sections.items.<key>.label')}</Title>` with `keepWithNext: true` (`.sectionTitle` has a hairline bottom border and 4 px padding).
- `overview`: block `KpiTiles`; if `series.length > 0` a block with the trend caption + `AreaChart h={200}`.
- `qa|compliance|sentiment|business`: block `BarChart h={200}` when `bars.length > 0`; then the segment table.
- `campaigns|agents`: segment table.
- `coaching`: block with the 3 `Tile`s; then a table (or the empty text block).
- `disputes`: block with the 4 `Tile`s; then a table (or empty).
- `burnout`, `rankings`: table (or empty).
- Empty data → one block with `preview.noData`.

Table items reuse today's cell markup: `head` is the existing `<Table.Tr>` of `<Table.Th>`s, each row is the existing `<Table.Tr key=...>` (same `ChangeCell`, same badges). Row ids: segment rows `row.key`, coaching/burnout `agentName`, disputes `dispute.id`, rankings `row.name`. Drop `miw`, `.tableScroll` wrappers and the `Stack`/`Divider` between sections.

New `buildReportFlow(data: ReportData, ctx: FlowContext, noSectionsText: string): FlowItem[]` in a new `reportFlow.tsx`: cover block (`ReportCover`) → either one text block (`noSectionsText`) or the concatenated `sectionFlowItems`.

### Task 3 — The paginated document

New `PaginatedReport.tsx` — props `{ items: FlowItem[]; reportName: string }`:

- `MeasureLayer` (internal): renders the hidden layer described above; exposes `onMeasured(measured)` via a ref callback + `useLayoutEffect` on `[items]`; `ResizeObserver` on the layer root; `document.fonts?.ready.then(measure)`.
- `const pages = useMemo(() => paginate(items, measured, LETTER.contentHeight, LETTER.gap), [items, measured])`.
- `const [page, setPage] = useState(1)`; `const current = Math.min(page, pages.length)`.
- Toolbar: `Group justify='space-between'`: left `Text size='sm' c='dimmed'` `t('preview.pagination.pageOf', { page: current, total: pages.length })`; right `Pagination total={pages.length} value={current} onChange={setPage} size='sm'`.
- Viewport: `const { ref, width } = useElementSize()`; `const scale = width > 0 ? Math.min(1, width / LETTER.width) : 1`. Stage `Box w={LETTER.width * scale} h={LETTER.height * scale} mx='auto' pos='relative' className={styles.stage}`; inside, every page `<ReportPage ... scale={scale} current={n === current} />`. The scale reaches CSS as `__vars={{ '--page-scale': String(scale) }}` on the stage; `.sheet { transform: scale(var(--page-scale, 1)); transform-origin: top left; }` (no `style=`).
- Keyboard: `tabIndex={0}` on the viewport; `onKeyDown` ArrowLeft/ArrowRight → `setPage(current ∓ 1)` within bounds.

New `ReportPage.tsx` — props `{ entries: PageEntry[]; items: FlowItem[]; reportName: string; index: number; total: number; current: boolean }`: renders `<section className={styles.sheet} data-current={current || undefined} aria-hidden={!current} aria-label=...>`, `.sheetContent` with a `Stack gap={LETTER.gap}`-equivalent (use `gap` Mantine prop with the numeric px) mapping entries to nodes (block → `item.node`; table → `<Table ...>` with `item.head` and `item.rows.slice(from, to)`, preceded by the "continued" caption when `continued`), and `.sheetFooter` with `reportName` and `t('preview.pagination.pageOf', ...)`. Share a small `renderTable(item, rows, props)` helper between the measure layer and the page so they use identical markup and class names.

`ReportPreview.tsx` becomes:

```tsx
const { t } = useTranslation('qa.reports');
const { t: tMetrics } = useTranslation('qa.teamAnalytics');
const compare = data.definition.period.compareWithPrevious;
const items = useMemo(
	() =>
		buildReportFlow(data, { t, tMetrics, compare }, t('preview.noSections')),
	[data, t, tMetrics, compare]
);
return (
	<div id='report-preview' className={styles.document}>
		<PaginatedReport
			items={items}
			reportName={data.definition.name || t('preview.untitled')}
		/>
	</div>
);
```

`BuilderTab.tsx`: unchanged except the preview card keeps `fullHeight`.

### Task 4 — Styles (`Reports.module.css`) and print

Remove `.previewScroll`, `.paper`, `.section`, `.tableScroll`. Add:

```css
.document {
	display: flex;
	flex-direction: column;
	gap: var(--mantine-spacing-sm);
}
.viewport {
	outline: none;
	padding: var(--mantine-spacing-sm);
	border-radius: var(--mantine-radius-md);
	background: light-dark(
		var(--mantine-color-gray-1),
		var(--mantine-color-dark-8)
	);
}
.viewport:focus-visible {
	outline: 2px solid var(--mantine-primary-color-filled);
	outline-offset: 2px;
}
.stage {
	position: relative;
}
.measure {
	position: absolute;
	left: -10000px;
	top: 0;
	width: 672px;
	visibility: hidden;
	pointer-events: none;
}
.sheet {
	position: absolute;
	top: 0;
	left: 0;
	width: 816px;
	height: 1056px;
	box-sizing: border-box;
	transform: scale(var(--page-scale, 1));
	transform-origin: top left;
	background: light-dark(#ffffff, var(--mantine-color-dark-6));
	border: 1px solid var(--mantine-color-default-border);
	box-shadow: var(--mantine-shadow-md);
	visibility: hidden;
}
.sheet[data-current] {
	visibility: visible;
}
.sheetContent {
	padding: 72px;
	height: 100%;
	box-sizing: border-box;
	overflow: hidden;
	display: flex;
	flex-direction: column;
	gap: 20px;
}
.sheetFooter {
	position: absolute;
	left: 72px;
	right: 72px;
	bottom: 28px;
	display: flex;
	justify-content: space-between;
	font-size: var(--mantine-font-size-xs);
	color: var(--mantine-color-dimmed);
	border-top: 1px solid var(--mantine-color-default-border);
	padding-top: 6px;
}
.sectionTitle {
	padding-bottom: 4px;
	border-bottom: 1px solid var(--mantine-color-default-border);
}
.continued {
	font-size: var(--mantine-font-size-xs);
	color: var(--mantine-color-dimmed);
	font-style: italic;
}
.pageTable {
	table-layout: fixed;
	width: 100%;
	font-size: 11px;
}
.pageTable th,
.pageTable td {
	overflow-wrap: anywhere;
}
.pageTable th:first-child,
.pageTable td:first-child {
	width: 28%;
}
.numeric {
	text-align: right;
	white-space: nowrap;
}
```

(`#ffffff` is the paper colour, as in the existing `.paper`; keep the light-dark counterpart.) Keep `.coverMark`, `.coverRule`, `.confidential`, builder styles. Replace the print block:

```css
@page {
	size: letter;
	margin: 0;
}
@media print {
	body * {
		visibility: hidden;
	}
	#report-preview,
	#report-preview * {
		visibility: visible;
	}
	#report-preview {
		position: absolute;
		inset: 0;
		margin: 0;
		padding: 0;
		background: #ffffff;
		color: #000000;
	}
	.toolbar,
	.measure {
		display: none !important;
	}
	.viewport {
		padding: 0;
		background: none;
	}
	.stage {
		width: auto !important;
		height: auto !important;
	}
	.sheet {
		position: relative !important;
		transform: none;
		width: 8.5in;
		height: 11in;
		border: 0;
		box-shadow: none;
		break-after: page;
		visibility: visible;
	}
	.sheet:last-child {
		break-after: auto;
	}
}
```

### Task 5 — Copy (`src/locales/{en,es}/qa.reports.json`, additions inside `preview`)

| key                            | en                         | es                           |
| ------------------------------ | -------------------------- | ---------------------------- |
| `preview.pagination.pageOf`    | Page {{page}} of {{total}} | Página {{page}} de {{total}} |
| `preview.pagination.prev`      | Previous page              | Página anterior              |
| `preview.pagination.next`      | Next page                  | Página siguiente             |
| `preview.pagination.continued` | {{section}} · continued    | {{section}} · continuación   |
| `preview.pagination.pageLabel` | Page {{page}}              | Página {{page}}              |

Use `preview.pagination.pageLabel` for each sheet's `aria-label`; `prev`/`next` for the pagination controls' `getControlProps` (`aria-label`).

### Task 6 — Checks

- `npm run typecheck` clean.
- Greps: `style=` in `src/modules/qa/reports/components/preview/**` → none; `previewScroll|styles.paper|tableScroll` in `src/modules/qa/reports/**` → none; `miw=` in the preview folder → none; every `t('preview.pagination.*')` key exists in en and es.
- Paginator sanity script (scratchpad, not in the repo) as described in Task 1.
- Prettier on touched files only; `git status --short` lists only intended files.

---

## Verification (user, in the browser; no dev server is started here)

QA Manager → Reports → Builder: leave the default sections and group by **Agent** (21 rows):

1. The preview shows one Letter page at a time, scaled to the panel; the toolbar reads "Page 1 of N" with Prev/Next and numbers; clicking, the arrows and `←` / `→` turn pages.
2. Page 1 starts with the cover and Overview; a section title is never the last line of a page; the QA table splits across pages with its header repeated and "QA · continued" above it; the last page footer reads "Page N of N".
3. Add Disputes, Coaching and Burnout; remove sections: the page count updates and the current page clamps.
4. Select 8 metrics in the metrics field: table columns wrap inside the 672 px page, nothing is cut off horizontally.
5. Resize the window narrower: the page scales down, line breaks and page breaks stay the same.
6. Dark mode: sheets use the dark paper, text and chart colours stay legible; light mode shows white paper on a gray canvas.
7. Generate → PDF: the print dialog shows every page as Letter, one per sheet, no toolbar, correct footers.
8. Client audience with names hidden, supervisor role (fewer rows → fewer pages), and an empty section (shows "No data" without breaking the layout).

## Out of scope

- Overview KPI tiles following the selected metrics (they stay the four fixed tiles).
- Other page sizes, landscape, thumbnails, zoom, "section on a new page", page-number links in a table of contents.
- The Generated-tab PDF re-print, which prints a blank page because the preview is not mounted there (pre-existing).
- Real PDF generation (the PDF format remains the browser print dialog).
