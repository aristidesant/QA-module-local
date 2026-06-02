# Move Analytics Tab from Campaign to Agent Detail

**Date:** 2026-06-01
**Status:** Approved
**Drivers:** Ramon Mena

## Summary

Move the Analytics (data collection variables) tab from the campaign editor to
the agent detail page, visible **only for principal agents**. Remove the
analytics tab entirely from the campaign editor.

## Motivation

Analytics variables are agent-level configuration, not campaign-level. They
define what data an agent collects during conversations. Moving them to the
agent detail page — and restricting them to the principal agent — makes the UI
semantically correct and reduces clutter in the campaign form.

## Files Changed

| #   | File                                                        | Change                                   |
| --- | ----------------------------------------------------------- | ---------------------------------------- |
| 1   | `src/modules/campaigns/CampaignTabs/CampaignTabs.tsx`       | Remove `analytics` tab entry             |
| 2   | `src/modules/campaigns/CampaignsForm/CampaignsForm.tsx`     | Remove analytics section + its imports   |
| 3   | `src/modules/campaigns/AgentDetailPage/AgentDetailTabs.tsx` | Add conditionally-rendered analytics tab |
| 4   | `src/modules/campaigns/AgentDetailPage/AgentDetailPage.tsx` | Pass `showAnalyticsTab` prop             |
| 5   | `src/locales/en/campaign.form.agents.json`                  | Add `"analytics"` tab key                |
| 6   | `src/locales/es/campaign.form.agents.json`                  | Add `"analytics"` tab key                |

## Detail

### 1. Remove analytics from `CampaignTabs` (campaign editor)

**File:** `src/modules/campaigns/CampaignTabs/CampaignTabs.tsx`

- Remove the `<Tabs.Tab value='analytics'>` element (line 47-49)
- Remove unused `IconChartBar` import

### 2. Remove analytics block from `CampaignsForm`

**File:** `src/modules/campaigns/CampaignsForm/CampaignsForm.tsx`

- Remove the `{selectedTab === 'analytics' && (...)}` conditional block
  (lines 749-768)
- Remove `AnalyticsSection` import (line 42)
- Remove `getDataCollectionFromAgentConfig` import (line 58)

### 3. Add analytics tab to `AgentDetailTabs`

**File:** `src/modules/campaigns/AgentDetailPage/AgentDetailTabs.tsx`

- Add `'analytics'` to the `AgentTabValue` type:
  ```ts
  export type AgentTabValue =
  	| 'setup'
  	| 'workflow'
  	| 'advanced'
  	| 'versioning'
  	| 'analytics';
  ```
- Accept new prop `showAnalyticsTab?: boolean`
- Add `IconChartBar` import
- Add the analytics `<Tabs.Tab>` **before `versioning`**, wrapping it in a
  conditional so it only renders when `showAnalyticsTab` is `true`
- Add `<Tabs.Panel value='analytics'>` containing `<AnalyticsSection />`
- Render the existing versioning tab (last position) unconditionally as before
- Import `AnalyticsSection` from `'../CampaignsForm/AnalyticsSection'`

### 4. Wire `showAnalyticsTab` in `AgentDetailPage`

**File:** `src/modules/campaigns/AgentDetailPage/AgentDetailPage.tsx`

- Pass `showAnalyticsTab` to `AgentDetailTabs`:
  ```tsx
  <AgentDetailTabs
  	agentId={selectedCampaignAgent.agentId}
  	value={activeTab}
  	onChange={setActiveTab}
  	onWorkflowSaveRequest={handleWorkflowSaveRequest}
  	isWorkflowSavePending={updateCampaignAgentConfig.isPending}
  	showAnalyticsTab={selectedCampaignAgent?.isPrincipal ?? false}
  />
  ```
- The `isPrincipal` field is already available on `selectedCampaignAgent`

### 5. Add translation keys

**Files:**

- `src/locales/en/campaign.form.agents.json`
- `src/locales/es/campaign.form.agents.json`

Add under `agentDetail.tabs`:

```json
"analytics": "Analytics"
```

Spanish:

```json
"analytics": "Analytics"
```

## Data flow

- `AnalyticsSection` already uses `useCampaignFormContext()` which is provided
  by `CampaignFormProvider` in `AgentDetailPage`
- It syncs changes to `agentConfig.dataCollection` and
  `agentConfig.platformSettings.dataCollection` via `campaignForm.setFieldValue`
- The existing save button at `AgentDetailPage` top persists these via
  `config: form.values.agentConfig` (sent to `PATCH .../agents/:id/config`)
- `dataCollectionVariables` in the form is **not** sent in the agent config save
  — this is acceptable because `agentConfig.dataCollection` is the source of
  truth

## Save dirty detection

Edits in the analytics sub-form (`AnalyticsFormProvider`) sync to the main form
(`CampaignFormProvider`) via `useEffect`, mutating `agentConfig`. This
triggers `form.isDirty() → true`, so the existing save button activates
correctly.

## Error/loading/empty states

The `AnalyticsSection` and its children already handle:

- **Empty** — shows empty-state alert (info banner + "No variables" table)
- **Loading** — N/A (local state only; no API call at mount time)
- **Error** — N/A (form internal; no fetcher in this component)

No new error/loading/empty handling is needed.

## Future considerations

- If `dataCollectionVariables` at campaign level becomes necessary later, we
  can add a dedicated campaign-level mutation triggered on agent config save.
  Not needed now.
