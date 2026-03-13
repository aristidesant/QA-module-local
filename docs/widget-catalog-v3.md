# Analytics Dashboards and Metric Engine Spec

## Purpose

This document summarizes all backend changes introduced after the initial analytics dashboard planning stage, including:

- the new dashboard metadata layer
- the semantic metric layer based on `metric_definition`
- the addition of `value_field`
- the first version of the metric engine
- the first dashboard rendering flow for KPI widgets
- grouped metric execution for chart/table style widgets

This document is intended for an LLM with frontend context that needs the exact backend contract and architecture state.

## Final Product Direction

The analytics system is now split into distinct responsibilities:

- `report_value` remains dedicated to export/report column definitions
- `conversation_attribute` is the transcript-derived analytics table
- `metric_definition` is the semantic analytics metric definition table
- `dashboard` stores dashboard metadata per campaign
- `dashboard_widget` stores widget layout and widget-to-metric binding
- `analytics metric engine` executes semantic metrics against real data sources

## Important Domain Decisions

### 1. `report_value` stays separate

`report_value` is not reused for dashboards.

Reason:

- it is already oriented to campaign export/reporting
- it resolves row-level values, not semantic aggregated metrics
- mixing both responsibilities would make the analytics layer harder to evolve

### 2. `metric_definition.campaign_id` is nullable

This allows two kinds of metric definitions:

- client-global metrics: `campaign_id IS NULL`
- campaign-scoped metrics: `campaign_id = <campaign>`

Execution rules:

- a campaign-specific metric can only run against the same campaign
- a global metric can run for any campaign in the same client

### 3. `metric_definition.value_field` was added

This was added to support typed attribute metrics safely.

Without `value_field`, `COUNT` could work, but aggregations like `SUM` or `AVG` for `conversation_attribute` were ambiguous.

Allowed values:

- `VALUE_STRING`
- `VALUE_NUMBER`
- `VALUE_BOOLEAN`
- `VALUE_JSON`

This maps directly to `conversation_attribute` typed columns.

## Existing Data Sources Used by the Engine

### `conversation`

Used for conversation metrics.

Relevant fields commonly exposed by the engine:

- `id`
- `status`
- `agent_id`
- `campaign_id`
- `contact_id`
- `created_at`
- `start_date`
- `end_date`

### `conversation_attribute`

Used for transcript-derived dynamic metrics.

Relevant fields:

- `metric_key`
- `value_string`
- `value_number`
- `value_boolean`
- `value_json`
- `created_at`

### `call_disposition`

Used for disposition metrics.

Important note:

- the architecture docs used the conceptual word `DISPOSITION`
- the real physical table in this backend is `call_disposition`

Relevant fields exposed by the engine:

- `disposition_name`
- `call_status`
- `requires_reschedule`
- `is_voice_mail`
- `do_not_call`
- `status_contact`
- `created_at`

## New Enums Added

### `MetricSource`

File: `src/common/enum/metric-source.enum.ts`

Values:

- `CONVERSATION`
- `ATTRIBUTE`
- `DISPOSITION`

### `MetricAggregation`

File: `src/common/enum/metric-aggregation.enum.ts`

Values:

- `COUNT`
- `SUM`
- `AVG`
- `MIN`
- `MAX`
- `DISTINCT_COUNT`

### `DashboardWidgetType`

File: `src/common/enum/dashboard-widget-type.enum.ts`

Values:

- `KPI`
- `LINE_CHART`
- `BAR_CHART`
- `PIE_CHART`
- `DONUT_CHART`
- `TABLE`
- `FUNNEL`

### `MetricValueField`

File: `src/common/enum/metric-value-field.enum.ts`

Values:

- `VALUE_STRING`
- `VALUE_NUMBER`
- `VALUE_BOOLEAN`
- `VALUE_JSON`

## New Entities Added

### `MetricDefinition`

File: `src/common/entities/metric-definition.entity.ts`

Purpose:

- semantic definition of a metric
- source-aware and aggregation-aware
- reusable across dashboards and widgets

Important fields:

- `clientId`
- `campaignId` nullable
- `userId`
- `key`
- `name`
- `description`
- `sourceType`
- `aggregationType`
- `fieldName`
- `metricKey`
- `valueField` nullable
- `defaultFilter`
- `supportsGroupBy`
- `supportsTimeSeries`
- `resultType`
- timestamps + soft delete

Unique constraints implemented:

- unique global metric key per client when `campaign_id IS NULL`
- unique metric key per client + campaign when `campaign_id IS NOT NULL`

### `Dashboard`

File: `src/common/entities/dashboard.entity.ts`

Purpose:

- stores dashboard metadata for a campaign

Important fields:

- `clientId`
- `campaignId`
- `userId`
- `name`
- `description`
- `isDefault`
- `layoutConfig`
- timestamps + soft delete

Business rule implemented:

- only one default dashboard per campaign

### `DashboardWidget`

File: `src/common/entities/dashboard-widget.entity.ts`

Purpose:

- stores widget metadata and links a widget to a metric definition

Important fields:

- `clientId`
- `dashboardId`
- `metricDefinitionId`
- `userId`
- `widgetType`
- `title`
- `description`
- `positionX`
- `positionY`
- `width`
- `height`
- `config`
- `enabled`
- timestamps + soft delete

## Migrations Added / Updated

### `1769000000007-CreateAnalyticsDashboardTables.ts`

Creates:

- SQL enum `metric_source_enum`
- SQL enum `metric_aggregation_enum`
- SQL enum `widget_type_enum`
- SQL enum `metric_value_field_enum`
- table `metric_definition`
- table `dashboard`
- table `dashboard_widget`

Also creates:

- indexes
- foreign keys
- partial unique indexes
- one-default-dashboard-per-campaign unique partial index

### `1769000000008-AddValueFieldToMetricDefinition.ts`

Adds `value_field` to `metric_definition` safely if needed.

This migration exists as a compatibility layer so the field can still be added if environments were created from an earlier dashboard migration version.

## New Module Added

### `AnalyticsDashboardsModule`

Files:

- `src/analytics-dashboards/analytics-dashboards.module.ts`
- registered in `src/app.module.ts`

This module currently wires:

- CRUD for metric definitions
- CRUD for dashboards
- CRUD for dashboard widgets
- the metric engine

## CRUD Layer Added

### Service

File: `src/analytics-dashboards/analytics-dashboards.service.ts`

Responsibilities:

- create / list / get / update / delete `metric_definition`
- create / list / get / update / delete `dashboard`
- create / list / update / delete `dashboard_widget`
- validate tenant ownership
- validate campaign ownership
- validate metric definition to dashboard campaign compatibility
- clear competing default dashboards when needed

### Controller

File: `src/analytics-dashboards/analytics-dashboards.controller.ts`

Base route:

- `analytics-dashboards`

CRUD endpoints added:

- `POST /analytics-dashboards/metric-definitions`
- `GET /analytics-dashboards/metric-definitions`
- `GET /analytics-dashboards/metric-definitions/:id`
- `PATCH /analytics-dashboards/metric-definitions/:id`
- `DELETE /analytics-dashboards/metric-definitions/:id`
- `POST /analytics-dashboards/dashboards`
- `GET /analytics-dashboards/dashboards`
- `GET /analytics-dashboards/dashboards/:id`
- `PATCH /analytics-dashboards/dashboards/:id`
- `DELETE /analytics-dashboards/dashboards/:id`
- `POST /analytics-dashboards/widgets`
- `GET /analytics-dashboards/dashboards/:dashboardId/widgets`
- `PATCH /analytics-dashboards/widgets/:id`
- `DELETE /analytics-dashboards/widgets/:id`

## Metric Definition Validation Rules Implemented

### Source rules

#### `ATTRIBUTE`

- requires `metricKey`
- must not use `fieldName`
- may use `valueField`
- if aggregation is not `COUNT`, `valueField` is required

#### `CONVERSATION` and `DISPOSITION`

- require `fieldName`
- must not use `metricKey`
- must not use `valueField`

### Campaign rules

- if `campaignId` is provided, it must belong to the current client
- widgets cannot use a metric bound to another campaign

## Metric Engine Added

### Service

File: `src/analytics-dashboards/analytics-metric-engine.service.ts`

This is the first engine implementation.

### Current scope

Supported now:

- metric execution with `shape.kind = single_value`
- metric execution with `shape.kind = grouped`
- sources:
  - `CONVERSATION`
  - `ATTRIBUTE`
  - `DISPOSITION`
- aggregations:
  - `COUNT`
  - `SUM`
  - `AVG`
  - `MIN`
  - `MAX`
  - `DISTINCT_COUNT`

Current first UI use cases:

- KPI widgets
- grouped widgets backed by a single metric plus `groupBy`

Even though the current render path only supports KPIs, the engine was designed so later we can add grouped and time-series outputs without rewriting the semantic metric layer.

## Metric Engine Execution Flow

For `executeMetric(...)`:

1. validate `shape.kind`
2. load `metric_definition`
3. validate client ownership and soft delete state
4. validate execution campaign against metric campaign
5. build source-specific base query
6. apply date range filters
7. apply `defaultFilter`
8. apply runtime filters
9. apply aggregation
10. execute query
11. normalize result by `resultType`

For grouped execution, the flow also:

12. validates `groupBy`
13. applies `GROUP BY`
14. orders rows by metric value descending
15. returns `rows[]`

## Source-Specific Query Building

### `CONVERSATION`

Base query conditions:

- `conversation.client_id = clientId`
- `conversation.deleted_at IS NULL`
- optional campaign filter
- optional createdAt date range

### `ATTRIBUTE`

Base query conditions:

- `conversation_attribute.client_id = clientId`
- optional campaign filter
- `conversation_attribute.metric_key = metricDefinition.metricKey`
- optional createdAt date range

Aggregation field selection:

- uses `metricDefinition.valueField`
- mapping:
  - `VALUE_STRING -> valueString`
  - `VALUE_NUMBER -> valueNumber`
  - `VALUE_BOOLEAN -> valueBoolean`
  - `VALUE_JSON -> valueJson`

### `DISPOSITION`

Base query conditions:

- base table is `call_disposition`
- joined with `conversation`
- both scoped by `clientId`
- both exclude soft deleted rows
- campaign filter comes from joined `conversation`
- optional date range uses `call_disposition.created_at`

## Allowed Filter Fields by Source

The engine only accepts a whitelist of fields to avoid unsafe or arbitrary column access.

### Conversation allowed fields

- `id`
- `status`
- `agentId` / `agent_id`
- `campaignId` / `campaign_id`
- `contactId` / `contact_id`
- `createdAt` / `created_at`
- `startDate` / `start_date`
- `endDate` / `end_date`

### Attribute allowed fields

- `metricKey` / `metric_key`
- `valueString` / `value_string`
- `valueNumber` / `value_number`
- `valueBoolean` / `value_boolean`
- `createdAt` / `created_at`

### Disposition allowed fields

- `dispositionName` / `disposition_name`
- `callStatus` / `call_status`
- `requiresReschedule` / `requires_reschedule`
- `isVoiceMail` / `is_voice_mail`
- `doNotCall` / `do_not_call`
- `statusContact` / `status_contact`
- `createdAt` / `created_at`

## Runtime Filter Operators Implemented

Supported runtime operators:

- `eq`
- `neq`
- `in`
- `not_in`
- `gt`
- `gte`
- `lt`
- `lte`
- `is_null`
- `is_not_null`

## Result Normalization

Current result normalization logic:

- `resultType = NUMBER` -> numeric output
- `resultType = BOOLEAN` -> boolean output
- anything else -> string output

Response shape:

```json
{
	"kind": "single_value",
	"metricDefinitionId": 1,
	"metricKey": "call_volume",
	"value": 512,
	"meta": {
		"campaignId": 497,
		"sourceType": "CONVERSATION",
		"aggregationType": "COUNT"
	}
}
```

Grouped response shape:

```json
{
	"kind": "grouped",
	"metricDefinitionId": 2,
	"metricKey": "positive_calls",
	"rows": [
		{ "label": "POSITIVE", "value": 120 },
		{ "label": "NEGATIVE", "value": 45 }
	],
	"meta": {
		"campaignId": 497,
		"sourceType": "DISPOSITION",
		"aggregationType": "COUNT",
		"groupBy": "call_status"
	}
}
```

## Dashboard Rendering Flow Added

The first dashboard render path was added in the metric engine service.

### Behavior

- loads the dashboard
- loads widgets in layout order
- skips disabled or soft-deleted widgets
- executes KPI widgets through the metric engine using `single_value`
- executes BAR/PIE/DONUT/TABLE widgets through the metric engine using `grouped`
- returns unsupported markers for non-KPI widget types

This means the current render API is already future-friendly:

- KPI widgets return results
- BAR/PIE/DONUT/TABLE can already return grouped results if the widget config includes `groupBy`
- LINE/FUNNEL still return `UNSUPPORTED` for now

## New Metric Engine Endpoints Added

### Execute one metric

`POST /analytics-dashboards/metric-engine/execute`

Example request:

```json
{
	"metricDefinitionId": 1,
	"campaignId": 497,
	"startDate": "2026-01-01T00:00:00.000Z",
	"endDate": "2026-01-31T23:59:59.999Z",
	"shape": {
		"kind": "single_value"
	},
	"filters": [
		{
			"field": "value_boolean",
			"operator": "eq",
			"value": true
		}
	]
}
```

Grouped execution example:

```json
{
	"metricDefinitionId": 4,
	"campaignId": 497,
	"shape": {
		"kind": "grouped",
		"groupBy": "call_status",
		"limit": 10
	}
}
```

### Render dashboard

`POST /analytics-dashboards/dashboards/:id/render`

Example request:

```json
{
	"startDate": "2026-01-01T00:00:00.000Z",
	"endDate": "2026-01-31T23:59:59.999Z"
}
```

Example response shape:

```json
{
	"dashboardId": 10,
	"campaignId": 497,
	"name": "Campaign Overview",
	"widgets": [
		{
			"widgetId": 100,
			"widgetType": "KPI",
			"title": "Call Volume",
			"status": "SUCCESS",
			"result": {
				"kind": "single_value",
				"metricDefinitionId": 1,
				"metricKey": "call_volume",
				"value": 512,
				"meta": {
					"campaignId": 497,
					"sourceType": "CONVERSATION",
					"aggregationType": "COUNT"
				}
			}
		},
		{
			"widgetId": 101,
			"widgetType": "BAR_CHART",
			"title": "Blocked Calls by Day",
			"status": "SUCCESS",
			"result": {
				"kind": "grouped",
				"metricDefinitionId": 4,
				"metricKey": "call_status_distribution",
				"rows": [
					{ "label": "POSITIVE", "value": 120 },
					{ "label": "NEGATIVE", "value": 45 }
				],
				"meta": {
					"campaignId": 497,
					"sourceType": "DISPOSITION",
					"aggregationType": "COUNT",
					"groupBy": "call_status"
				}
			}
		}
	]
}
```

Grouped widgets expect `dashboard_widget.config.groupBy`.

Example widget config:

```json
{
	"groupBy": "call_status",
	"limit": 10
}
```

### Important `ATTRIBUTE` groupBy rule

For `ATTRIBUTE` metrics, `groupBy` can work in two modes:

- typed column grouping, for example `value_string`, `value_boolean`, `value_number`
- semantic metric-key grouping, for example `province`, `city`, `payment_method`

If the provided `groupBy` is not one of the built-in attribute columns, the engine treats it as another `conversation_attribute.metric_key` and groups by that metric's typed value column.

Example:

- metric definition: count blocked calls from `is_blocked`
- widget config: `{ "groupBy": "province" }`

The engine will:

- keep the metric definition aggregation
- switch the grouping field to the attribute rows where `metric_key = 'province'`
- use the metric definition `valueField` to decide which typed column to group on, defaulting to string when absent

This allows frontend configs to use business keys like `province` instead of low-level column names.

## Files Added

- `src/common/enum/metric-value-field.enum.ts`
- `src/analytics-dashboards/analytics-metric-engine.service.ts`
- `src/database/migrations/1769000000008-AddValueFieldToMetricDefinition.ts`

## Files Updated

- `src/common/entities/metric-definition.entity.ts`
- `src/analytics-dashboards/analytics-dashboards.dto.ts`
- `src/analytics-dashboards/analytics-dashboards.service.ts`
- `src/analytics-dashboards/analytics-dashboards.controller.ts`
- `src/analytics-dashboards/analytics-dashboards.module.ts`
- `src/database/migrations/1769000000007-CreateAnalyticsDashboardTables.ts`
- `src/app.module.ts`

## Current MVP State

Implemented now:

- semantic metric definitions
- dashboards and widgets metadata
- typed attribute metric support through `valueField`
- one-metric execution endpoint
- first dashboard render endpoint
- KPI execution path
- grouped execution path
- grouped dashboard render path for BAR/PIE/DONUT/TABLE
- multi-tenant validation and campaign consistency checks

Not implemented yet:

- time series results
- chart-specific output shapes
- formula metrics
- cache or pre-aggregation
- dashboard-level runtime filters from the frontend UI

## Recommended Next Backend Step

The next clean extension is to add additional query shapes to the same engine:

- `time_series`

That should reuse the existing components instead of creating a parallel chart engine.

Recommended order:

1. support `time_series` execution
2. update dashboard render logic so `LINE_CHART` can resolve through the same engine
3. add richer grouped metadata for stacked/grouped charts if needed
4. later add formula metrics if needed
