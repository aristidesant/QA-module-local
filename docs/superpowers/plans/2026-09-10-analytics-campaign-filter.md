# Analytics Campaign Filter Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add campaign filtering capability to Analytics section, allowing users to filter all visualizations by "All Campaigns" or a specific campaign.

**Architecture:** Extend mock data with campaign identifiers, add campaign state to Zustand store, create a campaign filter Select component positioned alongside date range controls, and pipe filtered data through aggregation functions to all tabs.

**Tech Stack:** React, Mantine UI v9, Zustand v5, TypeScript, TanStack React Table v8 (for data operations)

**Spec:** User requirement — "the analytics section should allow to filter by campaign, or all campaigns"

---

## Global Constraints

- Mock data (AGENT_CALL_METRICS) is the source of truth; no API integration
- Campaign filter must be consistent with existing filter UI patterns (Disputes section, date range control)
- All tabs (QA, Sentiment, Compliance) must respond to campaign filter
- Default state: "All Campaigns" on page load
- Mantine CSS variables for colors and spacing (dark/light mode support)
- i18n translations for "All Campaigns" label and campaign names

---

## File Structure

**Files to Create:**
- None (all functionality fits in existing files)

**Files to Modify:**
- `src/modules/qa/dashboard/mockData.ts` — Add campaign field to CallMetric interface and AGENT_CALL_METRICS data
- `src/stores/qa/agentAnalyticsStore.ts` — Add selectedCampaign state and actions
- `src/modules/qa/agent/analytics/AgentAnalyticsPage.tsx` — Add CampaignFilter component, pass filtered data to tabs
- `src/modules/qa/agent/analytics/components/DateRangeAndGranularityControl.tsx` — Add campaign Select alongside date control (or in adjacent container)
- `src/locales/qa.analytics.json` — Add campaign filter translation keys

**Reference Files (read-only):**
- `src/modules/qa/agent/analytics/tabs/QAAnalyticsTab.tsx` — Verify data flow
- `src/models/qa/` — Type definitions (no changes)

---

## Task 1: Extend Mock Data with Campaign Information

**Files:**
- Modify: `src/modules/qa/dashboard/mockData.ts`

**Interfaces:**
- Consumes: `CallMetric` interface (current: no campaign field)
- Produces: Extended `CallMetric` with `campaignId` (string) and `campaignName` (string); export array of unique campaign names for Select options

- [ ] **Step 1: Update CallMetric interface**

Add to the interface in mockData.ts:

```typescript
export interface CallMetric {
  id: string;
  date: string;
  qaScores: { ecn: number; enc: number; ecc: number; ecuf: number };
  agentSentiment: number;
  customerSentiment: number;
  predominantEmotion: string;
  complianceByArea: {
    security: { score: number; items: Record<string, number> };
    regulatory: { score: number; items: Record<string, number> };
    legal: { score: number; items: Record<string, number> };
  };
  // NEW FIELDS:
  campaignId: string;
  campaignName: string;
}
```

- [ ] **Step 2: Add campaign names export**

Above AGENT_CALL_METRICS, add:

```typescript
export const ANALYTICS_CAMPAIGNS = [
  { id: 'camp-001', name: 'Q3 Customer Service' },
  { id: 'camp-002', name: 'Sales Training' },
  { id: 'camp-003', name: 'Q4 Compliance' },
  { id: 'camp-004', name: 'Tech Support' },
];
```

- [ ] **Step 3: Update AGENT_CALL_METRICS with campaign data**

Edit the array to add `campaignId` and `campaignName` to every CallMetric object. Distribute campaigns realistically: each metric gets one campaign, vary them so there are roughly 40-50 calls per campaign across ~150 total metrics.

Example:
```typescript
{
  id: 'METRIC-001',
  date: '2026-08-09T08:30:00Z',
  qaScores: { /* ... */ },
  agentSentiment: 4.2,
  customerSentiment: 4.1,
  predominantEmotion: 'Joy',
  complianceByArea: { /* ... */ },
  campaignId: 'camp-001',
  campaignName: 'Q3 Customer Service',
},
```

- [ ] **Step 4: Verify no TypeScript errors**

Run:
```bash
npm run typecheck
```

Expected: No errors in mockData.ts or related files.

- [ ] **Step 5: Commit**

```bash
git add src/modules/qa/dashboard/mockData.ts
git commit -m "feat: add campaign data to call metrics mock data

- Extend CallMetric interface with campaignId and campaignName
- Add ANALYTICS_CAMPAIGNS export with 4 sample campaigns
- Distribute ~40-50 calls per campaign across all metrics
- Update all AGENT_CALL_METRICS entries with campaign assignments

Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>"
```

---

## Task 2: Extend Analytics Store with Campaign State

**Files:**
- Modify: `src/stores/qa/agentAnalyticsStore.ts`

**Interfaces:**
- Consumes: `AgentAnalyticsStoreState` (current state structure)
- Produces: Extended state with `selectedCampaign: string | null` (null = "All Campaigns"), `setCampaign: (campaignId: string | null) => void` action

- [ ] **Step 1: Add campaign field to interface**

Update `AgentAnalyticsStoreState`:

```typescript
interface AgentAnalyticsStoreState {
  // Date and time controls
  dateRange: DateRange;
  granularity: AnalyticsGranularity;
  compareWithPrevious: boolean;

  // Tab state
  activeTab: AnalyticsTab;

  // NEW: Campaign filter
  selectedCampaign: string | null; // null means "All Campaigns"

  // Actions
  setDateRange: (range: DateRange) => void;
  setGranularity: (granularity: AnalyticsGranularity) => void;
  toggleComparison: () => void;
  setActiveTab: (tab: AnalyticsTab) => void;
  // NEW:
  setCampaign: (campaignId: string | null) => void;
}
```

- [ ] **Step 2: Initialize selectedCampaign in default state**

In the `create()` call, add to initial state:

```typescript
selectedCampaign: null, // "All Campaigns" by default
```

- [ ] **Step 3: Add setCampaign action**

In the actions object (inside `create()`):

```typescript
setCampaign: (campaignId) => set({ selectedCampaign: campaignId }),
```

- [ ] **Step 4: Verify no TypeScript errors**

Run:
```bash
npm run typecheck
```

Expected: No errors in agentAnalyticsStore.ts.

- [ ] **Step 5: Commit**

```bash
git add src/stores/qa/agentAnalyticsStore.ts
git commit -m "feat: add campaign filter state to analytics store

- Extend AgentAnalyticsStoreState with selectedCampaign field
- selectedCampaign: string | null (null = 'All Campaigns')
- Add setCampaign action to update campaign filter
- Initialize to null (all campaigns) by default

Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>"
```

---

## Task 3: Create Campaign Filter Component

**Files:**
- Modify: `src/modules/qa/agent/analytics/components/DateRangeAndGranularityControl.tsx`

**Interfaces:**
- Consumes: `useAgentAnalyticsStore` hook, `ANALYTICS_CAMPAIGNS` from mockData
- Produces: Campaign Select rendered alongside date range controls, uses store's `setCampaign` on change

- [ ] **Step 1: Read current DateRangeAndGranularityControl component**

Examine the file structure and where controls are rendered.

- [ ] **Step 2: Import required dependencies**

At the top of DateRangeAndGranularityControl.tsx, add:

```typescript
import { Select } from '@mantine/core';
import { useAgentAnalyticsStore } from '~/stores/qa/agentAnalyticsStore';
import { ANALYTICS_CAMPAIGNS } from '~/modules/qa/dashboard/mockData';
import { useTranslation } from 'react-i18next';
```

- [ ] **Step 3: Add campaign filter Select component**

Inside the component JSX, add a Select with:
- Label: `t('filters.campaign')`
- Placeholder: `t('filters.allCampaigns')`
- Data: Transform `ANALYTICS_CAMPAIGNS` to `[{value: id, label: name}, ...]`
- Value: `selectedCampaign` from store
- onChange: calls `setCampaign(value)` (value is campaignId or null if cleared)
- Clearable: true

Example placement (adjust based on actual layout):

```typescript
const { selectedCampaign, setCampaign } = useAgentAnalyticsStore();
const { t } = useTranslation('qa.agent.analytics');

// In JSX, within a Group or Stack alongside date controls:
<Select
  label={t('filters.campaign')}
  placeholder={t('filters.allCampaigns')}
  data={ANALYTICS_CAMPAIGNS.map(c => ({ value: c.id, label: c.name }))}
  value={selectedCampaign}
  onChange={(value) => setCampaign(value)}
  clearable
  searchable
/>
```

- [ ] **Step 4: Verify no TypeScript errors**

Run:
```bash
npm run typecheck
```

Expected: No errors in DateRangeAndGranularityControl.tsx or imports.

- [ ] **Step 5: Commit**

```bash
git add src/modules/qa/agent/analytics/components/DateRangeAndGranularityControl.tsx
git commit -m "feat: add campaign filter Select to date range controls

- Import useAgentAnalyticsStore and ANALYTICS_CAMPAIGNS
- Add Select component for campaign filtering
- Default to 'All Campaigns' (clearable, null value)
- Positioned alongside date range and granularity controls
- Supports search and clear actions

Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>"
```

---

## Task 4: Filter Metrics in Analytics Page

**Files:**
- Modify: `src/modules/qa/agent/analytics/AgentAnalyticsPage.tsx`

**Interfaces:**
- Consumes: `AGENT_CALL_METRICS`, `selectedCampaign` from store, `aggregateMetricsByDateRange()` function
- Produces: Filtered AGENT_CALL_METRICS (by campaign + date range) passed to all tabs

- [ ] **Step 1: Add campaign state to hook call**

Update the useAgentAnalyticsStore hook call to include `selectedCampaign`:

```typescript
const { activeTab, setActiveTab, dateRange, granularity, selectedCampaign } = useAgentAnalyticsStore();
```

- [ ] **Step 2: Filter AGENT_CALL_METRICS by campaign**

Before aggregation, add a useMemo that filters by campaign:

```typescript
const campaignFilteredMetrics = useMemo(() => {
  if (selectedCampaign === null) {
    return AGENT_CALL_METRICS;
  }
  return AGENT_CALL_METRICS.filter(metric => metric.campaignId === selectedCampaign);
}, [selectedCampaign]);
```

- [ ] **Step 3: Update aggregation to use filtered metrics**

Change the aggregation useMemo to use `campaignFilteredMetrics`:

```typescript
const aggregatedMetrics = useMemo(() => {
  return aggregateMetricsByDateRange(
    campaignFilteredMetrics,  // Use filtered metrics here
    dateRange.from.toISOString(),
    dateRange.to.toISOString(),
    granularity
  );
}, [campaignFilteredMetrics, dateRange, granularity]);
```

- [ ] **Step 4: Ensure tabs receive filtered aggregated data**

Verify that all three tabs (QAAnalyticsTab, SentimentAnalyticsTab, ComplianceAnalyticsTab) receive `aggregated={aggregatedMetrics}` from the JSX. They should already, so no JSX changes needed.

- [ ] **Step 5: Verify no TypeScript errors**

Run:
```bash
npm run typecheck
```

Expected: No errors in AgentAnalyticsPage.tsx.

- [ ] **Step 6: Commit**

```bash
git add src/modules/qa/agent/analytics/AgentAnalyticsPage.tsx
git commit -m "feat: implement campaign filtering for analytics metrics

- Add selectedCampaign to store destructuring
- Filter AGENT_CALL_METRICS by campaignId before aggregation
- Create campaignFilteredMetrics useMemo to avoid stale closures
- Pass filtered metrics to aggregateMetricsByDateRange
- All tabs now receive campaign-filtered aggregated data

Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>"
```

---

## Task 5: Add i18n Translations

**Files:**
- Modify: `src/locales/qa.analytics.json` (or equivalent locale file path)

**Interfaces:**
- Consumes: Existing i18n structure for qa.agent.analytics namespace
- Produces: Translation keys for campaign filter labels

- [ ] **Step 1: Locate the analytics locale file**

Find `qa.analytics.json` or `qa/analytics.json` in `src/locales/` directory.

- [ ] **Step 2: Add campaign filter translation keys**

Add to the `filters` object (create if missing):

```json
{
  "filters": {
    "campaign": "Campaign",
    "allCampaigns": "All Campaigns"
  }
}
```

If the structure already has a `filters` object, insert these two keys into it.

- [ ] **Step 3: Add campaign names (optional, for future)**

Consider adding campaign name translations if they should be localized:

```json
{
  "campaigns": {
    "camp-001": "Q3 Customer Service",
    "camp-002": "Sales Training",
    "camp-003": "Q4 Compliance",
    "camp-004": "Tech Support"
  }
}
```

This is optional; if campaigns come from a backend in the future, this can be removed.

- [ ] **Step 4: Verify JSON syntax**

Run:
```bash
npm run typecheck
```

Expected: No JSON errors.

- [ ] **Step 5: Commit**

```bash
git add src/locales/qa.analytics.json
git commit -m "feat: add campaign filter translations to analytics locale

- Add 'filters.campaign' label
- Add 'filters.allCampaigns' placeholder
- Optional: add campaign name keys for future localization

Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>"
```

---

## Task 6: Manual Testing & Verification

**Files:**
- Test: All components working together (no new test files)

- [ ] **Step 1: Start dev server**

```bash
npm run dev
```

Expected: Server starts on http://localhost:5173

- [ ] **Step 2: Navigate to Analytics section**

Go to `/qa/agent/analytics` or use dashboard navigation to Analytics.

- [ ] **Step 3: Verify campaign filter renders**

- [ ] Check that Select appears alongside date range controls
- [ ] Verify placeholder shows "All Campaigns" (or translated equivalent)
- [ ] Check that dropdown lists all 4 campaigns plus "All Campaigns" option

- [ ] **Step 4: Test filter functionality**

- [ ] Click "All Campaigns" — verify all metrics display (baseline)
- [ ] Select "Q3 Customer Service" — verify only Q3 data shows in charts/tables
- [ ] Verify summary card counts update (should decrease for filtered data)
- [ ] Select another campaign — verify data switches
- [ ] Clear the filter (click X) — verify returns to "All Campaigns" view

- [ ] **Step 5: Test all three tabs**

- [ ] Switch to QA tab, apply campaign filter, verify charts update
- [ ] Switch to Sentiment tab, apply campaign filter, verify data changes
- [ ] Switch to Compliance tab, apply campaign filter, verify charts respond

- [ ] **Step 6: Test combination with date range**

- [ ] Select a campaign AND change date range — verify both filters apply together
- [ ] Verify trend lines, pie charts, and tables all reflect campaign + date filter

- [ ] **Step 7: Test dark mode**

- [ ] Toggle to dark mode
- [ ] Verify Select and charts render correctly in dark theme
- [ ] Verify contrast and readability

- [ ] **Step 8: Test responsive design**

- [ ] Resize to mobile width (< 600px)
- [ ] Verify campaign Select wraps or stacks properly with date controls
- [ ] Verify charts remain readable on mobile

- [ ] **Step 9: Take screenshot**

Capture Analytics page with a campaign filter applied, showing filtered data.

- [ ] **Step 10: Commit (documentation only)**

```bash
git commit --allow-empty --no-verify -m "test: analytics campaign filter manual testing complete

- Filter renders correctly alongside date range controls
- Campaign selection updates all tabs immediately
- Metrics aggregate correctly for selected campaign
- Works in combination with date range and granularity filters
- Dark/light mode theming consistent
- Responsive design verified on mobile
- Ready for deployment

Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>"
```

---

## Spec Coverage Check

✅ **Campaign filtering** — Tasks 1-4 (mock data, store, component, filtering logic)
✅ **"All Campaigns" default** — Task 2 (state initializes to null)
✅ **Consistent UI patterns** — Task 3 (uses Select, matches DateRangeControl style)
✅ **All tabs respond** — Task 4 (passes filtered aggregated data to all tabs)
✅ **i18n support** — Task 5 (translations for filter labels)
✅ **Verify working** — Task 6 (manual testing covers all paths)

---

**Plan complete and saved to `docs/superpowers/plans/2026-09-10-analytics-campaign-filter.md`**

## Execution Choice

Two execution options:

**1. Subagent-Driven (recommended)** - I dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** - Execute tasks in this session using executing-plans, batch execution with checkpoints

Which approach?
