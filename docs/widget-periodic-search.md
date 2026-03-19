# Analytics Dashboards Time Range and Comparison Spec

## Purpose

This document tracks the implementation phases for analytics dashboard period filtering and KPI comparison.

It is intended to be shared with an LLM that already has frontend context, so it focuses on backend contracts, exact payloads, and rollout status.

## Phase Status

- [x] Phase 1 - Add `timeRange` support to normal dashboard render
- [x] Phase 2 - Add `render-comparison` with `PREVIOUS_PERIOD` for KPI widgets
- [x] Phase 3 - Final spec consolidation after all changes

## Final Backend Contract Summary

### Normal render endpoint

`POST /analytics-dashboards/dashboards/:id/render`

Supports:

- `startDate` + `endDate`
- or `timeRange`

Example:

```json
{
	"timeRange": "MONTH"
}
```

### Comparison render endpoint

`POST /analytics-dashboards/dashboards/:id/render-comparison`

Supports:

- `startDate` + `endDate`
- or `timeRange`
- `comparisonMode = PREVIOUS_PERIOD`

Example:

```json
{
	"timeRange": "TODAY",
	"comparisonMode": "PREVIOUS_PERIOD"
}
```

### Current limitations

- normal render supports KPI and grouped widgets (`BAR_CHART`, `PIE_CHART`, `DONUT_CHART`, `TABLE`)
- comparison render only supports `KPI`
- `LINE_CHART` still needs future `time_series`
- `FUNNEL` is still unsupported

### Frontend implementation notes

- if the frontend wants a simple filtered dashboard, call `render`
- if the frontend wants current vs previous KPI deltas, call `render-comparison`
- for grouped widgets, keep sending `groupBy` inside `dashboard_widget.config`
- for time-based filtering, prefer `timeRange` instead of computing dates client-side
- use `period` from backend response as the canonical displayed date window

### Files added or changed in this feature set

- `src/common/enum/analytics-time-range.enum.ts`
- `src/common/enum/analytics-comparison-mode.enum.ts`
- `src/analytics-dashboards/analytics-dashboards.dto.ts`
- `src/analytics-dashboards/analytics-dashboards.controller.ts`
- `src/analytics-dashboards/analytics-metric-engine.service.ts`
- `docs/analytics_dashboards_time_range_and_comparison_spec.md`

### Suggested next frontend/backend step

After this, the next most natural extension is:

1. add `time_series` support for `LINE_CHART`
2. add grouped comparison for chart/table widgets
3. optionally add labels like `vs yesterday`, `vs last week`, `vs last month` in frontend using `comparisonMode` and `period`

## Phase 1 - Time Range Support in Normal Render

### Goal

Allow dashboard render requests to filter widget data by a semantic time range instead of only explicit `startDate` / `endDate`.

### New enum

File: `src/common/enum/analytics-time-range.enum.ts`

Values:

- `TODAY`
- `WEEK`
- `MONTH`
- `YEAR`

### Render request changes

File: `src/analytics-dashboards/analytics-dashboards.dto.ts`

`RenderDashboardDto` now accepts:

- `startDate?: string`
- `endDate?: string`
- `timeRange?: AnalyticsTimeRange`

The same capability was also added to `ExecuteMetricDefinitionDto` so the metric engine can reuse the same range resolution rules.

### Resolution rules

Implemented in `src/analytics-dashboards/analytics-metric-engine.service.ts`

Rules:

- if `startDate` and `endDate` are provided, they take precedence
- otherwise, if `timeRange` is provided, backend resolves the period
- otherwise, no date filter is applied

### Current time range behavior

- `TODAY` -> from today `00:00:00.000` until now
- `WEEK` -> from start of current week until now
- `MONTH` -> from start of current month until now
- `YEAR` -> from start of current year until now

### Render response changes

`RenderDashboardResponseDto` now includes:

- `timeRange?: AnalyticsTimeRange`
- `period?: { start, end }`

Example:

```json
{
	"dashboardId": 10,
	"campaignId": 47,
	"name": "Campaign Overview",
	"timeRange": "TODAY",
	"period": {
		"start": "2026-03-11T00:00:00.000Z",
		"end": "2026-03-11T13:04:43.000Z"
	},
	"widgets": []
}
```

### Current render endpoint

`POST /analytics-dashboards/dashboards/:id/render`

Example request using `timeRange`:

```json
{
	"timeRange": "TODAY"
}
```

### Implementation notes

- date range resolution is centralized in the analytics metric engine service
- widget execution reuses the same engine path as before
- grouped and single-value widgets both inherit the resolved time filter

## Phase 2 - KPI Comparison with Previous Period

### Goal

Add a dedicated endpoint to compare KPI dashboard results against the immediately previous equivalent period.

### New enum

File: `src/common/enum/analytics-comparison-mode.enum.ts`

Values:

- `PREVIOUS_PERIOD`

### New endpoint

`POST /analytics-dashboards/dashboards/:id/render-comparison`

### Request DTO

File: `src/analytics-dashboards/analytics-dashboards.dto.ts`

`RenderDashboardComparisonDto` extends the render request and adds:

- `comparisonMode?: PREVIOUS_PERIOD`

Supported request example:

```json
{
	"timeRange": "TODAY",
	"comparisonMode": "PREVIOUS_PERIOD"
}
```

### Comparison behavior

- only KPI widgets are supported in this first comparison version
- non-KPI widgets are returned as `UNSUPPORTED`
- current period is resolved from `timeRange` or explicit dates
- previous period is derived automatically from the current period duration

### Previous period calculation

If current period is:

- start = `current.start`
- end = `current.end`

Then previous period is:

- end = `current.start - 1ms`
- start = `previous.end - current.duration`

This means:

- `TODAY` compares against the same elapsed portion of yesterday
- `WEEK` compares against the same elapsed portion of last week
- `MONTH` compares against the same elapsed portion of last month-equivalent duration
- `YEAR` compares against the same elapsed portion of last year-equivalent duration

### Response DTOs added

New DTOs in `src/analytics-dashboards/analytics-dashboards.dto.ts`:

- `DashboardComparisonSummaryDto`
- `RenderedDashboardComparisonWidgetDto`
- `RenderDashboardComparisonResponseDto`

### KPI comparison response shape

```json
{
	"dashboardId": 10,
	"campaignId": 47,
	"name": "Campaign Overview",
	"timeRange": "TODAY",
	"comparisonMode": "PREVIOUS_PERIOD",
	"period": {
		"current": {
			"start": "2026-03-11T00:00:00.000Z",
			"end": "2026-03-11T13:04:43.000Z"
		},
		"previous": {
			"start": "2026-03-10T00:00:00.000Z",
			"end": "2026-03-10T13:04:42.999Z"
		}
	},
	"widgets": [
		{
			"widgetId": 100,
			"widgetType": "KPI",
			"title": "Call Volume",
			"status": "SUCCESS",
			"current": {
				"kind": "single_value",
				"metricDefinitionId": 1,
				"metricKey": "call_volume",
				"value": 120
			},
			"previous": {
				"kind": "single_value",
				"metricDefinitionId": 1,
				"metricKey": "call_volume",
				"value": 95
			},
			"comparison": {
				"absoluteChange": 25,
				"percentageChange": 26.32,
				"trend": "UP"
			}
		}
	]
}
```

### Comparison summary rules

Implemented summary values:

- `absoluteChange = current - previous`
- `percentageChange = ((current - previous) / previous) * 100`
- `trend = UP | DOWN | FLAT | UNAVAILABLE`

If either side is not numeric:

- `absoluteChange = null`
- `percentageChange = null`
- `trend = UNAVAILABLE`

### Implementation notes

- period resolution and comparison logic live in `src/analytics-dashboards/analytics-metric-engine.service.ts`
- current and previous KPI values are computed through the same `executeMetric(...)` path
- this keeps one metric execution path and avoids branching SQL logic
