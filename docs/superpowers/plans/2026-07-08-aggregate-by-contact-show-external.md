# Aggregate By Contact & Show External Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Expose two new backend flags in the frontend — `aggregateByContact` on widget metric config (Widget Editor) and `showExternal` on Campaign (Campaign form, list, dashboard viewer filter).

**Architecture:** Both flags are simple optional booleans threaded through existing form-state/API-payload patterns already established in this codebase (`enabled`/`supportsGroupBy` for widgets, `noiseCancellation` for campaigns). No new abstractions — copy the existing pattern exactly for each flag. `showExternal` requires one field-name translation (`showExternal` internal → `showInMobile` on write) handled in the existing payload sanitizer choke point.

**Tech Stack:** React, TypeScript, Mantine v9 (`Switch`, `Button`, `Tooltip`, `ActionIcon`), Mantine `useForm` (`@mantine/form`), Zustand, TanStack Query v5, react-i18next.

**Note on testing:** Per project convention (`CLAUDE.md`: "Do not create tests unless explicitly requested"), this plan does not include test-writing steps. Each task's "verify" step uses `npm run typecheck` and/or manual behavior confirmation instead of automated tests.

---

## Part 1 — `aggregateByContact` (Widget Editor)

### Task 1: Add `aggregateByContact` to the metric config and form-values types

**Files:**

- Modify: `src/models/AnalyticsDashboard.ts:107-121`
- Modify: `src/modules/campaigns/CampaignsForm/DashboardSection/DashboardSection.types.ts:31-64`

- [ ] **Step 1: Add the field to `DashboardWidgetMetricConfig`**

In `src/models/AnalyticsDashboard.ts`, change:

```ts
export interface DashboardWidgetMetricConfig {
	key?: string | null;
	name?: string;
	description?: string | null;
	sourceType: MetricSourceType;
	aggregationType: MetricAggregationType;
	fieldName?: string | null;
	metricKey?: string | null;
	valueField?: MetricValueField | null;
	defaultFilter?: DashboardWidgetDefaultFilter | null;
	compareWith?: MetricCompareWith;
	supportsGroupBy?: boolean;
	supportsTimeSeries?: boolean;
	resultType: MetricResultType;
}
```

to:

```ts
export interface DashboardWidgetMetricConfig {
	key?: string | null;
	name?: string;
	description?: string | null;
	sourceType: MetricSourceType;
	aggregationType: MetricAggregationType;
	fieldName?: string | null;
	metricKey?: string | null;
	valueField?: MetricValueField | null;
	defaultFilter?: DashboardWidgetDefaultFilter | null;
	compareWith?: MetricCompareWith;
	supportsGroupBy?: boolean;
	supportsTimeSeries?: boolean;
	aggregateByContact?: boolean;
	resultType: MetricResultType;
}
```

- [ ] **Step 2: Add the field to `WidgetFormValues`**

In `src/modules/campaigns/CampaignsForm/DashboardSection/DashboardSection.types.ts`, change:

```ts
export type WidgetFormValues = {
	widgetType: DashboardWidgetType;
	title: string;
	description: string;
	sourceType: MetricSourceType;
	aggregationType: MetricAggregationType;
	fieldName: string | null;
	metricKey: string | null;
	valueField: MetricValueField | null;
	compareWith: MetricCompareWith;
	resultType: MetricResultType | null;
	supportsGroupBy: boolean;
	supportsTimeSeries: boolean;
```

to:

```ts
export type WidgetFormValues = {
	widgetType: DashboardWidgetType;
	title: string;
	description: string;
	sourceType: MetricSourceType;
	aggregationType: MetricAggregationType;
	fieldName: string | null;
	metricKey: string | null;
	valueField: MetricValueField | null;
	compareWith: MetricCompareWith;
	resultType: MetricResultType | null;
	supportsGroupBy: boolean;
	supportsTimeSeries: boolean;
	aggregateByContact: boolean;
```

(the rest of the type is unchanged)

- [ ] **Step 3: Run typecheck to confirm the new required field surfaces every call site that needs updating**

Run: `npm run typecheck`
Expected: Errors in `DashboardWidgetForm.helpers.ts` (`widgetFormValues` return, `buildMetricPayload`) — these are fixed in Task 2. No errors elsewhere yet is also fine; just confirm the command runs (don't fix errors in this task).

- [ ] **Step 4: Commit**

```bash
git add src/models/AnalyticsDashboard.ts src/modules/campaigns/CampaignsForm/DashboardSection/DashboardSection.types.ts
git commit -m "feat(dashboard-widgets): add aggregateByContact to metric config types"
```

---

### Task 2: Default the value and wire it into the create/update payload

**Files:**

- Modify: `src/modules/campaigns/CampaignsForm/DashboardSection/DashboardWidgetForm/DashboardWidgetForm.helpers.ts:2396-2420` (`buildMetricPayload`)
- Modify: `src/modules/campaigns/CampaignsForm/DashboardSection/DashboardWidgetForm/DashboardWidgetForm.helpers.ts:2541-2583` (`widgetFormValues`)

- [ ] **Step 1: Default `aggregateByContact` when building form values from a saved widget**

In `DashboardWidgetForm.helpers.ts`, inside `widgetFormValues`, change:

```ts
		supportsGroupBy: metric?.supportsGroupBy ?? false,
		supportsTimeSeries: metric?.supportsTimeSeries ?? true,
```

to:

```ts
		supportsGroupBy: metric?.supportsGroupBy ?? false,
		supportsTimeSeries: metric?.supportsTimeSeries ?? true,
		aggregateByContact: metric?.aggregateByContact ?? false,
```

- [ ] **Step 2: Include the field in the create/update payload builder**

In the same file, change `buildMetricPayload`:

```ts
export const buildMetricPayload = (
	values: WidgetFormValues,
	options: {
		conversationFields?: MetricColumnConfigEntry[];
		dispositionFields?: MetricColumnConfigEntry[];
	} = {}
): DashboardWidgetMetricConfig => ({
	sourceType: values.sourceType,
	aggregationType: values.aggregationType,
	fieldName:
		values.sourceType === 'ATTRIBUTE' ? undefined : trimText(values.fieldName),
	metricKey:
		values.sourceType === 'ATTRIBUTE' ? trimText(values.metricKey) : undefined,
	valueField: requiresValueField(values.sourceType, values.aggregationType)
		? (values.valueField ?? undefined)
		: undefined,
	defaultFilter: buildDefaultFilter(values.defaultFilters),
	...(!supportsCompareWithWidget(values.widgetType) ||
	values.compareWith === 'LATEST'
		? {}
		: { compareWith: values.compareWith }),
	supportsGroupBy: values.supportsGroupBy,
	supportsTimeSeries: values.supportsTimeSeries,
	resultType:
		values.resultType ??
		inferResultType(
			values,
			options.conversationFields ?? [],
			options.dispositionFields ?? []
		),
});
```

to:

```ts
export const buildMetricPayload = (
	values: WidgetFormValues,
	options: {
		conversationFields?: MetricColumnConfigEntry[];
		dispositionFields?: MetricColumnConfigEntry[];
	} = {}
): DashboardWidgetMetricConfig => ({
	sourceType: values.sourceType,
	aggregationType: values.aggregationType,
	fieldName:
		values.sourceType === 'ATTRIBUTE' ? undefined : trimText(values.fieldName),
	metricKey:
		values.sourceType === 'ATTRIBUTE' ? trimText(values.metricKey) : undefined,
	valueField: requiresValueField(values.sourceType, values.aggregationType)
		? (values.valueField ?? undefined)
		: undefined,
	defaultFilter: buildDefaultFilter(values.defaultFilters),
	...(!supportsCompareWithWidget(values.widgetType) ||
	values.compareWith === 'LATEST'
		? {}
		: { compareWith: values.compareWith }),
	supportsGroupBy: values.supportsGroupBy,
	supportsTimeSeries: values.supportsTimeSeries,
	aggregateByContact: values.aggregateByContact,
	resultType:
		values.resultType ??
		inferResultType(
			values,
			options.conversationFields ?? [],
			options.dispositionFields ?? []
		),
});
```

- [ ] **Step 3: Run typecheck**

Run: `npm run typecheck`
Expected: No errors related to `WidgetFormValues.aggregateByContact` being missing anymore (it's now defaulted and produced everywhere the type requires it — remaining errors, if any, should be about the not-yet-added handler in Task 3).

- [ ] **Step 4: Commit**

```bash
git add src/modules/campaigns/CampaignsForm/DashboardSection/DashboardWidgetForm/DashboardWidgetForm.helpers.ts
git commit -m "feat(dashboard-widgets): default and persist aggregateByContact in widget payload"
```

---

### Task 3: Add the form handler and expose it via context

**Files:**

- Modify: `src/modules/campaigns/CampaignsForm/DashboardSection/DashboardWidgetForm/DashboardWidgetForm.context.tsx:130-133` (handlers type)
- Modify: `src/modules/campaigns/CampaignsForm/DashboardSection/DashboardWidgetForm/useDashboardWidgetFormController.ts` (handler implementation + return object)

- [ ] **Step 1: Add the handler signature to the context type**

In `DashboardWidgetForm.context.tsx`, change:

```ts
		handleEnabledChange: (checked: boolean) => void;
		handleSupportsGroupByChange: (checked: boolean) => void;
		handleSupportsTimeSeriesChange: (checked: boolean) => void;
		handleViewLegendChange: (checked: boolean) => void;
```

to:

```ts
		handleEnabledChange: (checked: boolean) => void;
		handleSupportsGroupByChange: (checked: boolean) => void;
		handleSupportsTimeSeriesChange: (checked: boolean) => void;
		handleAggregateByContactChange: (checked: boolean) => void;
		handleViewLegendChange: (checked: boolean) => void;
```

- [ ] **Step 2: Implement the handler in the controller**

In `useDashboardWidgetFormController.ts`, near `handleSupportsTimeSeriesChange` (line ~1384-1390), add a new handler right after it:

```ts
const handleSupportsTimeSeriesChange = (checked: boolean) => {
	setManualCompatibility((current) => ({
		...current,
		supportsTimeSeries: true,
	}));
	form.setFieldValue('supportsTimeSeries', checked);
};

const handleAggregateByContactChange = (checked: boolean) => {
	form.setFieldValue('aggregateByContact', checked);
};
```

(This mirrors `handleEnabledChange` — a direct `form.setFieldValue`, no manual-compatibility tracking needed since `aggregateByContact` has no inferred/derived default to diverge from.)

- [ ] **Step 3: Return the handler from the two handler-object literals**

In the same file, find the two locations that list `handleSupportsGroupByChange,` / `handleSupportsTimeSeriesChange,` inside returned objects (around lines 1488-1489 and 1535-1536 per current line numbers — search for the literal text) and add `handleAggregateByContactChange,` immediately after `handleSupportsTimeSeriesChange,` in both places.

- [ ] **Step 4: Run typecheck**

Run: `npm run typecheck`
Expected: No errors. `DashboardWidgetFormState['handlers']` now matches the object returned by the controller.

- [ ] **Step 5: Commit**

```bash
git add src/modules/campaigns/CampaignsForm/DashboardSection/DashboardWidgetForm/DashboardWidgetForm.context.tsx src/modules/campaigns/CampaignsForm/DashboardSection/DashboardWidgetForm/useDashboardWidgetFormController.ts
git commit -m "feat(dashboard-widgets): wire aggregateByContact form handler"
```

---

### Task 4: Add the Switch to Advanced Options UI

**Files:**

- Modify: `src/modules/campaigns/CampaignsForm/DashboardSection/DashboardWidgetForm/DashboardWidgetAdvancedSection.tsx:534-592`

- [ ] **Step 1: Add a new switch tile in the `SimpleGrid`, always visible**

Change:

```tsx
						<SimpleGrid cols={{ base: 1, sm: 2 }} spacing='xs'>
							<div
								className={styles.switchTile}
								onClick={() =>
									state.handlers.handleSupportsGroupByChange(
										!state.values.supportsGroupBy
									)
								}
							>
								<Switch
									labelPosition='left'
									label={t('dashboardBuilder.form.fields.supportsGroupBy')}
									checked={state.values.supportsGroupBy}
									onChange={(event) =>
										state.handlers.handleSupportsGroupByChange(
											event.currentTarget.checked
										)
									}
									classNames={{ body: styles.switchBody }}
								/>
							</div>
							<div
								className={styles.switchTile}
								onClick={() =>
									state.handlers.handleSupportsTimeSeriesChange(
										!state.values.supportsTimeSeries
									)
								}
							>
								<Switch
									labelPosition='left'
									label={t('dashboardBuilder.form.fields.supportsTimeSeries')}
									checked={state.values.supportsTimeSeries}
									onChange={(event) =>
										state.handlers.handleSupportsTimeSeriesChange(
											event.currentTarget.checked
										)
									}
									classNames={{ body: styles.switchBody }}
								/>
							</div>
							<div
								className={styles.switchTile}
								onClick={() =>
									state.handlers.handleEnabledChange(!state.values.enabled)
								}
							>
								<Switch
									labelPosition='left'
									label={t('dashboardBuilder.form.fields.enabled')}
									checked={state.values.enabled}
									onChange={(event) =>
										state.handlers.handleEnabledChange(
											event.currentTarget.checked
										)
									}
									classNames={{ body: styles.switchBody }}
								/>
							</div>
```

to (adding the new tile right after "Widget Enabled"):

```tsx
						<SimpleGrid cols={{ base: 1, sm: 2 }} spacing='xs'>
							<div
								className={styles.switchTile}
								onClick={() =>
									state.handlers.handleSupportsGroupByChange(
										!state.values.supportsGroupBy
									)
								}
							>
								<Switch
									labelPosition='left'
									label={t('dashboardBuilder.form.fields.supportsGroupBy')}
									checked={state.values.supportsGroupBy}
									onChange={(event) =>
										state.handlers.handleSupportsGroupByChange(
											event.currentTarget.checked
										)
									}
									classNames={{ body: styles.switchBody }}
								/>
							</div>
							<div
								className={styles.switchTile}
								onClick={() =>
									state.handlers.handleSupportsTimeSeriesChange(
										!state.values.supportsTimeSeries
									)
								}
							>
								<Switch
									labelPosition='left'
									label={t('dashboardBuilder.form.fields.supportsTimeSeries')}
									checked={state.values.supportsTimeSeries}
									onChange={(event) =>
										state.handlers.handleSupportsTimeSeriesChange(
											event.currentTarget.checked
										)
									}
									classNames={{ body: styles.switchBody }}
								/>
							</div>
							<div
								className={styles.switchTile}
								onClick={() =>
									state.handlers.handleEnabledChange(!state.values.enabled)
								}
							>
								<Switch
									labelPosition='left'
									label={t('dashboardBuilder.form.fields.enabled')}
									checked={state.values.enabled}
									onChange={(event) =>
										state.handlers.handleEnabledChange(
											event.currentTarget.checked
										)
									}
									classNames={{ body: styles.switchBody }}
								/>
							</div>
							<div
								className={styles.switchTile}
								onClick={() =>
									state.handlers.handleAggregateByContactChange(
										!state.values.aggregateByContact
									)
								}
							>
								<Switch
									labelPosition='left'
									label={t('dashboardBuilder.form.fields.aggregateByContact')}
									description={t(
										'dashboardBuilder.form.aggregateByContactHint'
									)}
									checked={state.values.aggregateByContact}
									onChange={(event) =>
										state.handlers.handleAggregateByContactChange(
											event.currentTarget.checked
										)
									}
									classNames={{ body: styles.switchBody }}
								/>
							</div>
```

- [ ] **Step 2: Add the i18n keys**

In `src/locales/en/campaign.form.dashboards.json`, inside `"fields"` (same object as `"enabled": "Widget enabled"`, around line 203), add a new key right after it:

```json
				"enabled": "Widget enabled",
				"aggregateByContact": "Aggregate by contact"
```

And, as a sibling of `"aggregationHint"` (same nesting level, right after the `"fields"` object closes, around line 204-205), add:

```json
			"aggregationHint": "Aggregation defines the math applied to the selected source field.",
			"aggregateByContactHint": "Count each contact once, using their latest conversation.",
```

In `src/locales/es/campaign.form.dashboards.json`, make the equivalent changes:

```json
				"enabled": "Widget habilitado",
				"aggregateByContact": "Agrupar por contacto"
```

```json
			"aggregationHint": "La agregación define la matemática aplicada al campo de origen seleccionado.",
			"aggregateByContactHint": "Cuenta cada contacto una sola vez, usando su última conversación.",
```

- [ ] **Step 3: Manually verify in the browser**

Run: `npm run dev` (if not already running), open a campaign's dashboard widget editor, expand "Advanced Options".
Expected: A new "Aggregate by contact" switch appears after "Widget enabled", with the hint text shown below the label, toggles on/off, and the state persists when you switch between form sections without saving.

- [ ] **Step 4: Commit**

```bash
git add src/modules/campaigns/CampaignsForm/DashboardSection/DashboardWidgetForm/DashboardWidgetAdvancedSection.tsx src/locales/en/campaign.form.dashboards.json src/locales/es/campaign.form.dashboards.json
git commit -m "feat(dashboard-widgets): add aggregateByContact switch to advanced options"
```

---

### Task 5: Wire `aggregateByContact` into the live widget-preview payload

**Files:**

- Modify: `src/queries/analyticsDashboardsQueries.ts:267-312` (`normalizePreviewPayload`)

- [ ] **Step 1: Include the field in the explicit preview re-pick**

Change:

```ts
const normalizePreviewPayload = (
	payload: PreviewDashboardWidgetDto
): PreviewDashboardWidgetDto => ({
	...(payload.campaignId == null ? {} : { campaignId: payload.campaignId }),
	widgetType: payload.widgetType,
	...(payload.width == null ? {} : { width: payload.width }),
	...(payload.height == null ? {} : { height: payload.height }),
	dataConfig: {
		metric: {
			sourceType: payload.dataConfig.metric.sourceType,
			aggregationType: payload.dataConfig.metric.aggregationType,
			...(payload.dataConfig.metric.fieldName
				? { fieldName: payload.dataConfig.metric.fieldName }
				: {}),
			...(payload.dataConfig.metric.metricKey
				? { metricKey: payload.dataConfig.metric.metricKey }
				: {}),
			...(payload.dataConfig.metric.valueField
				? { valueField: payload.dataConfig.metric.valueField }
				: {}),
			...(payload.dataConfig.metric.defaultFilter
				? { defaultFilter: payload.dataConfig.metric.defaultFilter }
				: {}),
			...(payload.dataConfig.metric.compareWith
				? { compareWith: payload.dataConfig.metric.compareWith }
				: {}),
			...(payload.dataConfig.metric.supportsGroupBy === undefined
				? {}
				: { supportsGroupBy: payload.dataConfig.metric.supportsGroupBy }),
			...(payload.dataConfig.metric.supportsTimeSeries === undefined
				? {}
				: { supportsTimeSeries: payload.dataConfig.metric.supportsTimeSeries }),
			resultType: payload.dataConfig.metric.resultType,
		},
		...(payload.dataConfig.query ? { query: payload.dataConfig.query } : {}),
		...(payload.dataConfig.runtimeFilters?.length
			? { runtimeFilters: payload.dataConfig.runtimeFilters }
			: {}),
		...(payload.dataConfig.joins?.length
			? { joins: payload.dataConfig.joins }
			: {}),
	},
	...(payload.viewConfig ? { viewConfig: payload.viewConfig } : {}),
	...(payload.timeRange ? { timeRange: payload.timeRange } : {}),
	...(payload.comparisonMode ? { comparisonMode: payload.comparisonMode } : {}),
});
```

to (adding the `aggregateByContact` re-pick right after `supportsTimeSeries`):

```ts
const normalizePreviewPayload = (
	payload: PreviewDashboardWidgetDto
): PreviewDashboardWidgetDto => ({
	...(payload.campaignId == null ? {} : { campaignId: payload.campaignId }),
	widgetType: payload.widgetType,
	...(payload.width == null ? {} : { width: payload.width }),
	...(payload.height == null ? {} : { height: payload.height }),
	dataConfig: {
		metric: {
			sourceType: payload.dataConfig.metric.sourceType,
			aggregationType: payload.dataConfig.metric.aggregationType,
			...(payload.dataConfig.metric.fieldName
				? { fieldName: payload.dataConfig.metric.fieldName }
				: {}),
			...(payload.dataConfig.metric.metricKey
				? { metricKey: payload.dataConfig.metric.metricKey }
				: {}),
			...(payload.dataConfig.metric.valueField
				? { valueField: payload.dataConfig.metric.valueField }
				: {}),
			...(payload.dataConfig.metric.defaultFilter
				? { defaultFilter: payload.dataConfig.metric.defaultFilter }
				: {}),
			...(payload.dataConfig.metric.compareWith
				? { compareWith: payload.dataConfig.metric.compareWith }
				: {}),
			...(payload.dataConfig.metric.supportsGroupBy === undefined
				? {}
				: { supportsGroupBy: payload.dataConfig.metric.supportsGroupBy }),
			...(payload.dataConfig.metric.supportsTimeSeries === undefined
				? {}
				: { supportsTimeSeries: payload.dataConfig.metric.supportsTimeSeries }),
			...(payload.dataConfig.metric.aggregateByContact === undefined
				? {}
				: { aggregateByContact: payload.dataConfig.metric.aggregateByContact }),
			resultType: payload.dataConfig.metric.resultType,
		},
		...(payload.dataConfig.query ? { query: payload.dataConfig.query } : {}),
		...(payload.dataConfig.runtimeFilters?.length
			? { runtimeFilters: payload.dataConfig.runtimeFilters }
			: {}),
		...(payload.dataConfig.joins?.length
			? { joins: payload.dataConfig.joins }
			: {}),
	},
	...(payload.viewConfig ? { viewConfig: payload.viewConfig } : {}),
	...(payload.timeRange ? { timeRange: payload.timeRange } : {}),
	...(payload.comparisonMode ? { comparisonMode: payload.comparisonMode } : {}),
});
```

- [ ] **Step 2: Run typecheck**

Run: `npm run typecheck`
Expected: No errors.

- [ ] **Step 3: Manually verify**

In the widget editor, toggle "Aggregate by contact" on for a CONVERSATION-source widget with existing preview data, and confirm (via Network tab or `preview_network` tooling) that the `POST .../widgets/preview` request body includes `"aggregateByContact": true` inside `dataConfig.metric`.

- [ ] **Step 4: Commit**

```bash
git add src/queries/analyticsDashboardsQueries.ts
git commit -m "feat(dashboard-widgets): forward aggregateByContact in widget preview payload"
```

---

## Part 2 — `showExternal` (Campaigns)

### Task 6: Add `showExternal` to the `Campaign` type

**Files:**

- Modify: `src/models/CampaignsModel.ts:180`

- [ ] **Step 1: Add the field next to `noiseCancellation`**

Change:

```ts
	noiseCancellation?: boolean;
```

to:

```ts
	noiseCancellation?: boolean;
	showExternal?: boolean;
```

- [ ] **Step 2: Run typecheck**

Run: `npm run typecheck`
Expected: No errors (optional field, backward compatible).

- [ ] **Step 3: Commit**

```bash
git add src/models/CampaignsModel.ts
git commit -m "feat(campaigns): add showExternal field to Campaign model"
```

---

### Task 7: Add the campaign-write field rename (`showExternal` → `showInMobile`)

**Files:**

- Modify: `src/utils/agentPayloadSanitizer.ts:131-143` (`sanitizeNestedPayload`)

- [ ] **Step 1: Add a rename branch for `showExternal`**

Change:

```ts
const sanitizeNestedPayload = (value: unknown): unknown => {
	if (Array.isArray(value)) {
		return value.map(sanitizeNestedPayload);
	}

	if (!isRecord(value)) {
		return value;
	}

	const nextValue = cloneValue(value) as Record<string, unknown>;
	Object.entries(nextValue).forEach(([key, nestedValue]) => {
		if (key === 'conversationConfig' || key === 'conversation_config') {
			nextValue[key] = sanitizeConversationConfig(nestedValue);
			return;
		}

		if (key === 'workflow') {
			nextValue[key] = sanitizeWorkflow(nestedValue);
			return;
		}

		nextValue[key] = sanitizeNestedPayload(nestedValue);
	});

	return nextValue;
};
```

to:

```ts
const sanitizeNestedPayload = (value: unknown): unknown => {
	if (Array.isArray(value)) {
		return value.map(sanitizeNestedPayload);
	}

	if (!isRecord(value)) {
		return value;
	}

	const nextValue = cloneValue(value) as Record<string, unknown>;
	Object.entries(nextValue).forEach(([key, nestedValue]) => {
		if (key === 'conversationConfig' || key === 'conversation_config') {
			nextValue[key] = sanitizeConversationConfig(nestedValue);
			return;
		}

		if (key === 'workflow') {
			nextValue[key] = sanitizeWorkflow(nestedValue);
			return;
		}

		if (key === 'showExternal') {
			delete nextValue[key];
			nextValue.showInMobile = sanitizeNestedPayload(nestedValue);
			return;
		}

		nextValue[key] = sanitizeNestedPayload(nestedValue);
	});

	return nextValue;
};
```

- [ ] **Step 2: Run typecheck**

Run: `npm run typecheck`
Expected: No errors — `sanitizeAgentPayload` is generic (`<T>(payload: T): T`), so this internal key rename doesn't change its type signature.

- [ ] **Step 3: Manually verify**

After Task 8 wires up the form, save a campaign with the new toggle checked and confirm (Network tab) the `POST/PATCH .../campaigns...` request body has `showInMobile: true` and no `showExternal` key.

- [ ] **Step 4: Commit**

```bash
git add src/utils/agentPayloadSanitizer.ts
git commit -m "feat(campaigns): rename showExternal to showInMobile on write"
```

---

### Task 8: Add the campaign form toggle

**Files:**

- Create: `src/modules/campaigns/CampaignsForm/GeneralSection/ShowExternalSection.tsx`
- Modify: `src/modules/campaigns/CampaignsForm/GeneralSection/GeneralSection.tsx`

- [ ] **Step 1: Create `ShowExternalSection.tsx`**

```tsx
import { Switch } from '@mantine/core';
import { IconDeviceMobile } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import SectionCard from '~/components/SectionCard';
import { useCampaignFormContext } from '../../campaignFormFunctions';

const ShowExternalSection = () => {
	const { t } = useTranslation('campaign.form.general');
	const form = useCampaignFormContext();

	return (
		<SectionCard
			title={t('general.showExternalTitle')}
			description={t('general.showExternalSectionDesc')}
			icon={IconDeviceMobile}
			contentSpacing='sm'
		>
			<Switch
				aria-label={t('general.showExternalLabel')}
				label={t('general.showExternalLabel')}
				description={t('general.showExternalDesc')}
				size='sm'
				checked={form.values.showExternal ?? false}
				onChange={(event) =>
					form.setFieldValue('showExternal', event.currentTarget.checked)
				}
			/>
		</SectionCard>
	);
};

export default ShowExternalSection;
```

- [ ] **Step 2: Wire it into `GeneralSection.tsx`**

Change:

```tsx
import CampaignBasicsSection from './CampaignBasicsSection';
import ExecutionDefaultsSection from './ExecutionDefaultsSection';
import styles from './GeneralSection.module.css';
import NoiseCancellationSection from './NoiseCancellationSection';
import RoutingSection from './RoutingSection';
import RoleVisibilitySection from './RoleVisibilitySection';

interface GeneralSectionProps {
	roleVisibilityValue: number[];
	onRoleVisibilityChange: (roleIds: number[]) => void;
	roleVisibilityDisabled?: boolean;
}

const GeneralSection: React.FC<GeneralSectionProps> = ({
	roleVisibilityValue,
	onRoleVisibilityChange,
	roleVisibilityDisabled,
}) => (
	<div className={styles.generalLayout}>
		<div className={styles.column}>
			<CampaignBasicsSection />
			<RoutingSection />
		</div>

		<div className={styles.column}>
			<ExecutionDefaultsSection />
			<NoiseCancellationSection />
			<RoleVisibilitySection
				value={roleVisibilityValue}
				onChange={onRoleVisibilityChange}
				disabled={roleVisibilityDisabled}
			/>
		</div>
	</div>
);

export default GeneralSection;
```

to:

```tsx
import CampaignBasicsSection from './CampaignBasicsSection';
import ExecutionDefaultsSection from './ExecutionDefaultsSection';
import styles from './GeneralSection.module.css';
import NoiseCancellationSection from './NoiseCancellationSection';
import RoutingSection from './RoutingSection';
import RoleVisibilitySection from './RoleVisibilitySection';
import ShowExternalSection from './ShowExternalSection';

interface GeneralSectionProps {
	roleVisibilityValue: number[];
	onRoleVisibilityChange: (roleIds: number[]) => void;
	roleVisibilityDisabled?: boolean;
}

const GeneralSection: React.FC<GeneralSectionProps> = ({
	roleVisibilityValue,
	onRoleVisibilityChange,
	roleVisibilityDisabled,
}) => (
	<div className={styles.generalLayout}>
		<div className={styles.column}>
			<CampaignBasicsSection />
			<RoutingSection />
		</div>

		<div className={styles.column}>
			<ExecutionDefaultsSection />
			<NoiseCancellationSection />
			<ShowExternalSection />
			<RoleVisibilitySection
				value={roleVisibilityValue}
				onChange={onRoleVisibilityChange}
				disabled={roleVisibilityDisabled}
			/>
		</div>
	</div>
);

export default GeneralSection;
```

- [ ] **Step 3: Add the i18n keys**

In `src/locales/en/campaign.form.general.json`, right after the `noiseCancellation*` keys (line 67), add:

```json
		"noiseCancellationDesc": "When enabled, applies noise suppression and voice activity detection tuning to outbound calls.",
		"showExternalTitle": "Mobile visibility",
		"showExternalSectionDesc": "Control whether this campaign's dashboards can be seen in the mobile app.",
		"showExternalLabel": "Visible in mobile app",
		"showExternalDesc": "When enabled, this campaign's metrics are included in the mobile app's dashboards.",
```

In `src/locales/es/campaign.form.general.json`, right after the equivalent `noiseCancellation*` keys (line 67), add:

```json
		"noiseCancellationDesc": "Cuando está activado, aplica supresión de ruido y ajuste de detección de actividad de voz en las llamadas salientes.",
		"showExternalTitle": "Visibilidad en mobile",
		"showExternalSectionDesc": "Controla si los dashboards de esta campaña se pueden ver en la app móvil.",
		"showExternalLabel": "Visible en app móvil",
		"showExternalDesc": "Cuando está activado, las métricas de esta campaña se incluyen en los dashboards de la app móvil.",
```

- [ ] **Step 4: Run typecheck**

Run: `npm run typecheck`
Expected: No errors.

- [ ] **Step 5: Manually verify in the browser**

Open a campaign's edit form, General section. Confirm the new "Mobile visibility" card renders below "Noise cancellation" in both light and dark mode, toggles correctly, and persists after save + reload.

- [ ] **Step 6: Commit**

```bash
git add src/modules/campaigns/CampaignsForm/GeneralSection/ShowExternalSection.tsx src/modules/campaigns/CampaignsForm/GeneralSection/GeneralSection.tsx src/locales/en/campaign.form.general.json src/locales/es/campaign.form.general.json
git commit -m "feat(campaigns): add showExternal toggle to campaign general section"
```

---

### Task 9: Add the non-invasive list indicator

**Files:**

- Modify: `src/modules/campaigns/CampaignsList/useCampaignsColumns.tsx:224-244`
- Modify: `src/locales/en/campaigns.list.json`, `src/locales/es/campaigns.list.json`

- [ ] **Step 1: Add the icon-only column after `status`**

In `useCampaignsColumns.tsx`, change:

```tsx
		{
			accessorKey: 'status',
			header: t('columns.status'),
			cell: ({ row }) => {
				const campaign = row.original;
				const statusInfo = getCampaignStatusInfo(campaign.status);
				const StatusIcon = statusInfo.icon;
				return (
					<Badge
						variant='light'
						color={statusInfo.color}
						size='sm'
						radius='sm'
						leftSection={<StatusIcon size={12} />}
					>
						{t(statusInfo.label)}
					</Badge>
				);
			},
			size: 120,
		},
		{
			accessorKey: 'updatedAt',
```

to:

```tsx
		{
			accessorKey: 'status',
			header: t('columns.status'),
			cell: ({ row }) => {
				const campaign = row.original;
				const statusInfo = getCampaignStatusInfo(campaign.status);
				const StatusIcon = statusInfo.icon;
				return (
					<Badge
						variant='light'
						color={statusInfo.color}
						size='sm'
						radius='sm'
						leftSection={<StatusIcon size={12} />}
					>
						{t(statusInfo.label)}
					</Badge>
				);
			},
			size: 120,
		},
		{
			id: 'showExternal',
			header: '',
			cell: ({ row }) => {
				const campaign = row.original;
				if (!campaign.showExternal) {
					return null;
				}
				return (
					<Tooltip label={t('columns.showExternalTooltip')} withArrow>
						<ActionIcon
							variant='subtle'
							color='blue'
							size='xs'
							aria-label={t('columns.showExternalTooltip')}
						>
							<IconDeviceMobile size={13} />
						</ActionIcon>
					</Tooltip>
				);
			},
			size: 40,
		},
		{
			accessorKey: 'updatedAt',
```

- [ ] **Step 2: Add the `IconDeviceMobile` import**

At the top of `useCampaignsColumns.tsx`, in the existing `@tabler/icons-react` import block, add `IconDeviceMobile`:

```tsx
import {
	IconTrash,
	IconCheck,
	IconArrowUpRight,
	IconArrowDownLeft,
	IconCopy,
	IconPhone,
	IconInfoCircle,
	IconPencil,
	IconFileDescription,
	IconSettings,
	IconPlayerPlay,
	IconPlayerPause,
	IconDotsVertical,
	IconDeviceMobile,
} from '@tabler/icons-react';
```

- [ ] **Step 3: Add the i18n key**

In `src/locales/en/campaigns.list.json`, inside the `"columns"` object (near `"lastUpdated"`, line 39), add:

```json
		"lastUpdated": "Last Updated",
		"showExternalTooltip": "Visible in mobile app",
```

In `src/locales/es/campaigns.list.json`, add the equivalent key right after `"lastUpdated": "Última Actualización",`:

```json
		"lastUpdated": "Última Actualización",
		"showExternalTooltip": "Visible en app móvil",
```

- [ ] **Step 4: Run typecheck**

Run: `npm run typecheck`
Expected: No errors.

- [ ] **Step 5: Manually verify in the browser**

Open the campaigns list. Confirm: campaigns with `showExternal: true` show a small mobile icon with a tooltip after the Status column; campaigns without it show nothing in that column (no empty badge, no placeholder).

- [ ] **Step 6: Commit**

```bash
git add src/modules/campaigns/CampaignsList/useCampaignsColumns.tsx src/locales/en/campaigns.list.json src/locales/es/campaigns.list.json
git commit -m "feat(campaigns): show non-invasive mobile-visibility icon in campaigns list"
```

---

### Task 10: Add `showExternal` to the dashboard render request types

**Files:**

- Modify: `src/models/AnalyticsDashboard.ts:300-306` (`DashboardRenderRequest`)
- Modify: `src/models/AnalyticsDashboard.ts:328-334` (`DashboardRenderComparisonRequest`)

- [ ] **Step 1: Add the field to both request interfaces**

Change:

```ts
export interface DashboardRenderRequest {
	startDate?: string;
	endDate?: string;
	timeRange?: AnalyticsTimeRange;
	filters?: RuntimeFilter[];
	contactGroupId?: number | null;
}
```

to:

```ts
export interface DashboardRenderRequest {
	startDate?: string;
	endDate?: string;
	timeRange?: AnalyticsTimeRange;
	filters?: RuntimeFilter[];
	contactGroupId?: number | null;
	showExternal?: boolean;
}
```

And change:

```ts
export interface DashboardRenderComparisonRequest {
	startDate?: string;
	endDate?: string;
	timeRange?: AnalyticsTimeRange;
	comparisonMode?: AnalyticsComparisonMode;
	contactGroupId?: number | null;
}
```

to:

```ts
export interface DashboardRenderComparisonRequest {
	startDate?: string;
	endDate?: string;
	timeRange?: AnalyticsTimeRange;
	comparisonMode?: AnalyticsComparisonMode;
	contactGroupId?: number | null;
	showExternal?: boolean;
}
```

- [ ] **Step 2: Run typecheck**

Run: `npm run typecheck`
Expected: No errors (optional field).

- [ ] **Step 3: Commit**

```bash
git add src/models/AnalyticsDashboard.ts
git commit -m "feat(dashboards): add showExternal to render request types"
```

---

### Task 11: Add the viewer filter state and UI

**Files:**

- Modify: `src/modules/campaigns/CampaignDashboardViewer/store/useCampaignDashboardViewerStore.ts`
- Modify: `src/modules/campaigns/CampaignDashboardViewer/CampaignDashboardViewer.tsx:170-192, 512-538`
- Modify: `src/modules/campaigns/CampaignDashboardViewer/CampaignDashboardViewerToolbar/CampaignDashboardViewerToolbar.tsx`
- Modify: `src/locales/en/campaign.form.dashboards.json`, `src/locales/es/campaign.form.dashboards.json`

- [ ] **Step 1: Add store state and setter**

In `useCampaignDashboardViewerStore.ts`, change:

```ts
interface CampaignDashboardViewerState {
	selectedDashboardId: string | null;
	isEditingLayout: boolean;
	draftLayouts: ViewerWidgetLayout[];
	selectedTimeRange: AnalyticsTimeRange | null;
	comparisonEnabled: boolean;
	reset: (selectedDashboardId?: string | null) => void;
	setSelectedDashboardId: (selectedDashboardId: string | null) => void;
	startEditing: (persistedLayouts: ViewerWidgetLayout[]) => void;
	cancelEditing: (persistedLayouts: ViewerWidgetLayout[]) => void;
	stopEditing: () => void;
	syncDraftLayouts: (persistedLayouts: ViewerWidgetLayout[]) => void;
	setDraftLayouts: (draftLayouts: ViewerWidgetLayout[]) => void;
	setSelectedTimeRange: (timeRange: AnalyticsTimeRange | null) => void;
	setComparisonEnabled: (enabled: boolean) => void;
}

const initialState = {
	selectedDashboardId: null as string | null,
	isEditingLayout: false,
	draftLayouts: [] as ViewerWidgetLayout[],
	selectedTimeRange: 'WEEK' as AnalyticsTimeRange,
	comparisonEnabled: true,
};
```

to:

```ts
interface CampaignDashboardViewerState {
	selectedDashboardId: string | null;
	isEditingLayout: boolean;
	draftLayouts: ViewerWidgetLayout[];
	selectedTimeRange: AnalyticsTimeRange | null;
	comparisonEnabled: boolean;
	showExternalOnly: boolean;
	reset: (selectedDashboardId?: string | null) => void;
	setSelectedDashboardId: (selectedDashboardId: string | null) => void;
	startEditing: (persistedLayouts: ViewerWidgetLayout[]) => void;
	cancelEditing: (persistedLayouts: ViewerWidgetLayout[]) => void;
	stopEditing: () => void;
	syncDraftLayouts: (persistedLayouts: ViewerWidgetLayout[]) => void;
	setDraftLayouts: (draftLayouts: ViewerWidgetLayout[]) => void;
	setSelectedTimeRange: (timeRange: AnalyticsTimeRange | null) => void;
	setComparisonEnabled: (enabled: boolean) => void;
	setShowExternalOnly: (enabled: boolean) => void;
}

const initialState = {
	selectedDashboardId: null as string | null,
	isEditingLayout: false,
	draftLayouts: [] as ViewerWidgetLayout[],
	selectedTimeRange: 'WEEK' as AnalyticsTimeRange,
	comparisonEnabled: true,
	showExternalOnly: false,
};
```

And change:

```ts
		setComparisonEnabled: (enabled) => set({ comparisonEnabled: enabled }),
	}));
```

to:

```ts
		setComparisonEnabled: (enabled) => set({ comparisonEnabled: enabled }),
		setShowExternalOnly: (enabled) => set({ showExternalOnly: enabled }),
	}));
```

- [ ] **Step 2: Include the filter in `renderPayload` and read/write the store in `CampaignDashboardViewer.tsx`**

Add the store reads near the existing `comparisonEnabled`/`setComparisonEnabled` reads (around line 92-119):

```tsx
const comparisonEnabled = useCampaignDashboardViewerStore(
	(state) => state.comparisonEnabled
);
const showExternalOnly = useCampaignDashboardViewerStore(
	(state) => state.showExternalOnly
);
```

```tsx
const setComparisonEnabled = useCampaignDashboardViewerStore(
	(state) => state.setComparisonEnabled
);
const setShowExternalOnly = useCampaignDashboardViewerStore(
	(state) => state.setShowExternalOnly
);
```

Change the `renderPayload` memo:

```tsx
const renderPayload = useMemo(
	() => ({
		...(selectedTimeRange
			? { timeRange: selectedTimeRange }
			: { timeRange: 'ALL' as AnalyticsTimeRange }),
		...(contactGroupId != null ? { contactGroupId } : {}),
	}),
	[selectedTimeRange, contactGroupId]
);
```

to:

```tsx
const renderPayload = useMemo(
	() => ({
		...(selectedTimeRange
			? { timeRange: selectedTimeRange }
			: { timeRange: 'ALL' as AnalyticsTimeRange }),
		...(contactGroupId != null ? { contactGroupId } : {}),
		...(showExternalOnly ? { showExternal: true } : {}),
	}),
	[selectedTimeRange, contactGroupId, showExternalOnly]
);
```

Pass the new prop and handler to the toolbar (around lines 515-538):

```tsx
<CampaignDashboardViewerToolbar
	dashboardOptions={dashboardOptions}
	isFetching={isFetching}
	isLayoutEditingAvailable={isLayoutEditingAvailable}
	isMobile={Boolean(isMobile)}
	isSavingLayout={isSavingLayout}
	renderLoading={renderLoading}
	selectedTimeRange={selectedTimeRange}
	period={renderResult?.period}
	comparisonPeriod={unifiedRenderResult?.comparisonPeriod}
	comparisonEnabled={comparisonEnabled}
	allowLayoutEditing={allowLayoutEditing}
	showBackButton={Boolean(onBackClick)}
	onBackClick={onBackClick}
	onAutoOrganize={handleAutoOrganize}
	onCancelEditing={handleCancelEditing}
	onRefresh={() => void refetchRenderResult()}
	onSaveLayout={() => void handleSaveLayout()}
	onStartEditing={handleStartEditing}
	onTimeRangeChange={(v: AnalyticsTimeRange | null) => setSelectedTimeRange(v)}
	onComparisonChange={setComparisonEnabled}
/>
```

to:

```tsx
<CampaignDashboardViewerToolbar
	dashboardOptions={dashboardOptions}
	isFetching={isFetching}
	isLayoutEditingAvailable={isLayoutEditingAvailable}
	isMobile={Boolean(isMobile)}
	isSavingLayout={isSavingLayout}
	renderLoading={renderLoading}
	selectedTimeRange={selectedTimeRange}
	period={renderResult?.period}
	comparisonPeriod={unifiedRenderResult?.comparisonPeriod}
	comparisonEnabled={comparisonEnabled}
	showExternalOnly={showExternalOnly}
	allowLayoutEditing={allowLayoutEditing}
	showBackButton={Boolean(onBackClick)}
	onBackClick={onBackClick}
	onAutoOrganize={handleAutoOrganize}
	onCancelEditing={handleCancelEditing}
	onRefresh={() => void refetchRenderResult()}
	onSaveLayout={() => void handleSaveLayout()}
	onStartEditing={handleStartEditing}
	onTimeRangeChange={(v: AnalyticsTimeRange | null) => setSelectedTimeRange(v)}
	onComparisonChange={setComparisonEnabled}
	onShowExternalOnlyChange={setShowExternalOnly}
/>
```

- [ ] **Step 3: Add the toggle button to the toolbar**

In `CampaignDashboardViewerToolbar.tsx`, add the new props to the interface:

```tsx
interface CampaignDashboardViewerToolbarProps {
	dashboardOptions: DashboardOption[];
	isFetching: boolean;
	isLayoutEditingAvailable: boolean;
	isMobile: boolean;
	isSavingLayout: boolean;
	renderLoading: boolean;
	selectedTimeRange: AnalyticsTimeRange | null;
	period?: DashboardPeriod;
	comparisonPeriod?: { current: DashboardPeriod; previous: DashboardPeriod };
	comparisonEnabled: boolean;
	allowLayoutEditing: boolean;
	showBackButton?: boolean;
	onBackClick?: () => void;
	onAutoOrganize: () => void;
	onCancelEditing: () => void;
	onRefresh: () => void;
	onSaveLayout: () => void;
	onStartEditing: () => void;
	onTimeRangeChange: (value: AnalyticsTimeRange | null) => void;
	onComparisonChange: (value: boolean) => void;
}
```

to:

```tsx
interface CampaignDashboardViewerToolbarProps {
	dashboardOptions: DashboardOption[];
	isFetching: boolean;
	isLayoutEditingAvailable: boolean;
	isMobile: boolean;
	isSavingLayout: boolean;
	renderLoading: boolean;
	selectedTimeRange: AnalyticsTimeRange | null;
	period?: DashboardPeriod;
	comparisonPeriod?: { current: DashboardPeriod; previous: DashboardPeriod };
	comparisonEnabled: boolean;
	showExternalOnly: boolean;
	allowLayoutEditing: boolean;
	showBackButton?: boolean;
	onBackClick?: () => void;
	onAutoOrganize: () => void;
	onCancelEditing: () => void;
	onRefresh: () => void;
	onSaveLayout: () => void;
	onStartEditing: () => void;
	onTimeRangeChange: (value: AnalyticsTimeRange | null) => void;
	onComparisonChange: (value: boolean) => void;
	onShowExternalOnlyChange: (value: boolean) => void;
}
```

Destructure the two new props in the component signature:

```tsx
const CampaignDashboardViewerToolbar = ({
	dashboardOptions,
	isFetching,
	isLayoutEditingAvailable,
	isMobile,
	isSavingLayout,
	renderLoading,
	selectedTimeRange,
	period,
	comparisonPeriod,
	comparisonEnabled,
	allowLayoutEditing,
	showBackButton,
	onBackClick,
	onAutoOrganize,
	onCancelEditing,
	onRefresh,
	onSaveLayout,
	onStartEditing,
	onTimeRangeChange,
	onComparisonChange,
}: CampaignDashboardViewerToolbarProps) => {
```

to:

```tsx
const CampaignDashboardViewerToolbar = ({
	dashboardOptions,
	isFetching,
	isLayoutEditingAvailable,
	isMobile,
	isSavingLayout,
	renderLoading,
	selectedTimeRange,
	period,
	comparisonPeriod,
	comparisonEnabled,
	showExternalOnly,
	allowLayoutEditing,
	showBackButton,
	onBackClick,
	onAutoOrganize,
	onCancelEditing,
	onRefresh,
	onSaveLayout,
	onStartEditing,
	onTimeRangeChange,
	onComparisonChange,
	onShowExternalOnlyChange,
}: CampaignDashboardViewerToolbarProps) => {
```

Add a new toggle button right after the existing comparison button (around line 253-269), following the exact same pattern:

```tsx
{
	selectedTimeRange ? (
		<Tooltip label={t('dashboard.comparison.toggle')}>
			<Button
				size='sm'
				variant='default'
				className={clsx(
					styles.compareButton,
					comparisonEnabled && styles['compareButton--active']
				)}
				leftSection={<IconArrowsRightLeft size={15} />}
				onClick={() => onComparisonChange(!comparisonEnabled)}
				disabled={isControlDisabled}
			>
				{t('dashboard.comparison.shortToggle')}
			</Button>
		</Tooltip>
	) : null;
}
```

to:

```tsx
{
	selectedTimeRange ? (
		<Tooltip label={t('dashboard.comparison.toggle')}>
			<Button
				size='sm'
				variant='default'
				className={clsx(
					styles.compareButton,
					comparisonEnabled && styles['compareButton--active']
				)}
				leftSection={<IconArrowsRightLeft size={15} />}
				onClick={() => onComparisonChange(!comparisonEnabled)}
				disabled={isControlDisabled}
			>
				{t('dashboard.comparison.shortToggle')}
			</Button>
		</Tooltip>
	) : null;
}
<Tooltip label={t('dashboard.showExternal.toggle')}>
	<Button
		size='sm'
		variant='default'
		className={clsx(
			styles.compareButton,
			showExternalOnly && styles['compareButton--active']
		)}
		leftSection={<IconDeviceMobile size={15} />}
		onClick={() => onShowExternalOnlyChange(!showExternalOnly)}
		disabled={isControlDisabled}
	>
		{t('dashboard.showExternal.shortToggle')}
	</Button>
</Tooltip>;
```

Add the `IconDeviceMobile` import to the existing `@tabler/icons-react` import block at the top of the file:

```tsx
import {
	IconArrowsRightLeft,
	IconCheck,
	IconChevronDown,
	IconDeviceFloppy,
	IconEdit,
	IconLayoutDashboard,
	IconLayoutGrid,
	IconRefresh,
	IconTimeline,
	IconX,
	IconDeviceMobile,
} from '@tabler/icons-react';
```

- [ ] **Step 4: Add the i18n keys**

In `src/locales/en/campaign.form.dashboards.json`, add a new `showExternal` object as a sibling of `"comparison"` (right after the `"comparison"` object closes):

```json
		"comparison": {
			"toggle": "Compare to previous period",
			"shortToggle": "Compare",
```

(leave the rest of `"comparison"` untouched, and add after its closing `}`):

```json
		"showExternal": {
			"toggle": "Show only campaigns visible in the mobile app",
			"shortToggle": "Mobile only"
		},
```

In `src/locales/es/campaign.form.dashboards.json`, add the equivalent:

```json
		"showExternal": {
			"toggle": "Mostrar solo campañas visibles en la app móvil",
			"shortToggle": "Solo móvil"
		},
```

- [ ] **Step 5: Run typecheck**

Run: `npm run typecheck`
Expected: No errors.

- [ ] **Step 6: Manually verify in the browser**

Open a campaign dashboard viewer. Confirm a new "Mobile only" button appears next to the existing "Compare" button, toggles an active state visually (same style as Compare), and that toggling it on adds `showExternal: true` to the render request body (check via Network tab).

- [ ] **Step 7: Commit**

```bash
git add src/modules/campaigns/CampaignDashboardViewer/store/useCampaignDashboardViewerStore.ts src/modules/campaigns/CampaignDashboardViewer/CampaignDashboardViewer.tsx src/modules/campaigns/CampaignDashboardViewer/CampaignDashboardViewerToolbar/CampaignDashboardViewerToolbar.tsx src/locales/en/campaign.form.dashboards.json src/locales/es/campaign.form.dashboards.json
git commit -m "feat(dashboards): add showExternal-only filter toggle to dashboard viewer"
```

---

## Final Verification

- [ ] **Run the full typecheck one more time after all tasks**

Run: `npm run typecheck`
Expected: No errors.

- [ ] **Run the build**

Run: `npm run build`
Expected: Build succeeds with no new errors or warnings introduced by this work.
