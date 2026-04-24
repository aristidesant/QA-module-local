# Queue Tab Progress Metrics & Reorder Simplification — Frontend

## Overview

Added progress metrics UI to the Queue tab with global and per-wave statistics, simplified the reorder controls by removing the wave scope selector (backend now auto-targets the latest wave), and passed `contactGroupId` to the sort fields API for schema-aware field resolution.

---

## Changes

### 1. Types

- File: `src/models/ContactsModel.ts`
- Added interfaces: `StatusCount`, `WaveProgress`, `GlobalProgress`, `QueueProgressResponse`.
- Removed `waveNumber?` from `ReorderTasksPayload`.

### 2. API

- File: `src/api/outboundApi.ts`
- `getSortFields(campaignId, contactGroupId?)` — now accepts optional `contactGroupId` for schema-aware field resolution.
- `getQueueProgress(contactGroupId, campaignId)` — new function calling `GET /outbound-call-tasks/queue-progress`.

### 3. React Query Hooks

- File: `src/queries/outboundQueries.ts`
- `useGetOutboundTaskSortFields(campaignId, contactGroupId?, enabled?)` — updated signature and query key.
- `useGetQueueProgress(contactGroupId, campaignId, enabled?)` — new hook with `refetchInterval: 30_000`.
- Updated `outboundTaskKeys.sortFields` to include `contactGroupId`.
- Added `outboundTaskKeys.queueProgress`.

### 4. QueueProgressBar Component (new)

- Path: `src/modules/campaigns/CampaignContactListPage/QueueTab/QueueProgressBar/`
- Shows global stats: progress bar with percentage, "X / Y contacts" label, status breakdown badges, total task count.
- Wrapped in `SectionCard`.

### 5. WaveProgressHeader Component (new)

- Path: `src/modules/campaigns/CampaignContactListPage/QueueTab/WaveProgressHeader/`
- Used as custom accordion header for each wave.
- Shows: wave number, task count badge, "X / Y contacts" text, percentage, mini progress bar.

### 6. QueueTab Integration

- File: `src/modules/campaigns/CampaignContactListPage/QueueTab/QueueTab.tsx`
- Added `useGetQueueProgress` query.
- Renders `QueueProgressBar` at the top when progress data is available.
- Replaces plain text accordion headers with `WaveProgressHeader` (with graceful fallback).
- Removed `availableWaves` prop from `ReorderControls`.

### 7. ReorderControls Simplification

- File: `src/modules/campaigns/CampaignContactListPage/QueueTab/ReorderControls/ReorderControls.tsx`
- Removed wave scope `Select` dropdown and `scopeWave` state.
- Removed `waveNumber` from mutation payload.
- Added "Applies to the latest wave only" helper text.
- Now passes `contactGroupId` to `useGetOutboundTaskSortFields` for schema-aware fields.
- Removed `availableWaves` from props interface.

### 8. i18n Keys

Files: `src/locales/en/campaign.contact-list.json` + `src/locales/es/campaign.contact-list.json`

**Added:**

- `queue.progress.title` — "Queue Progress" / "Progreso de la Cola"
- `queue.progress.description` — overall description
- `queue.progress.contacted` — "{{contacted}} / {{total}} contacts"
- `queue.progress.totalTasks` — "{{count}} total tasks"
- `queue.reorder.latestWaveNote` — "Applies to the latest wave only" / "Se aplica solo a la última oleada"

---

## Component Hierarchy

```
QueueTab
├── QueueProgressBar          (global stats — SectionCard)
├── ReorderControls           (sort rules — SectionCard, no wave selector)
└── SectionCard (task list)
    ├── Filters (status, wave)
    └── Accordion
        └── WaveProgressHeader  (per-wave stats — accordion control)
            └── QueueWaveTable  (accordion panel)
```

## Related Backend Changes

See `agent-service/docs/queue-progress-metrics.md` for the backend counterpart including the migration, backfill, new endpoint, and reorder logic changes.
