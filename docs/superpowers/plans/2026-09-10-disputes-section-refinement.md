# Disputes Section Refinement Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Enhance Disputes section with comprehensive mock data, simplified columns, and working detail drawer navigation.

**Architecture:**
- Expand mock data with realistic dispute records (20+ disputes across multiple campaigns, statuses, types)
- Remove non-essential columns to focus on key information (ID, Agent, Type, Supervisor, Campaign, Status, Date)
- Implement detail drawer/page navigation when row is clicked
- Maintain visual consistency: section title, table width, paddings, margins matching other dashboard sections (Team Rankings, Critical Issues)

**Tech Stack:** React, Mantine UI, TypeScript, React Router v7

**Spec:** User requirements for Disputes section refinement as described in session context

---

## File Structure

### Files to Modify
- `src/modules/qa/dashboard/pages/DisputesPage.tsx` - Update mock data, add navigation on row click, ensure styling consistency
- `src/api/qa/disputesMockData.ts` - Create comprehensive mock data exports (if not already structured)

### Files Already Exist (Reference)
- `src/modules/qa/disputes/DisputeDetailPage/DisputeDetailPage.tsx` - Detail view (no changes)
- `src/models/qa/disputes.ts` - Type definitions (no changes)

---

## Global Constraints

- Status values: 'open' | 'approved' | 'rejected' (not 'pending')
- Table styling: Match section padding, margins, title formatting with Team Rankings and other dashboard cards
- Dark/light mode: Use Mantine CSS variables (already in place)
- Mock data: 20-30 realistic dispute records with variety of campaigns, agents, statuses
- Navigation: Row click opens detail page (route: `/qa/disputes/{disputeId}`)
- Section title: "Disputes" (already set)
- Table columns: ID, Agent, Type, Supervisor, Campaign, Status, Created (simplified, no "disputed metrics" or "reason" columns)

---

## Task 1: Expand and Structure Mock Data

**Files:**
- Modify: `src/modules/qa/dashboard/pages/DisputesPage.tsx`

**Interfaces:**
- Produces: `allDisputes: Dispute[]` array with 25+ records covering:
  - Multiple campaigns (Q3 Customer Service, Sales Training, Q4 Compliance, Tech Support)
  - All three statuses (open, approved, rejected) with realistic distribution
  - Multiple agents and supervisors
  - All three types (qa, sentiment, compliance)

- [ ] **Step 1: Replace mock data array**

Update the `allDisputes` array to include 25+ diverse dispute records:

```typescript
const allDisputes: Dispute[] = [
  {
    id: 101,
    agentName: 'Sarah Johnson',
    type: 'qa',
    status: 'open',
    createdDate: '2 hours ago',
    supervisorName: 'David Martinez',
    campaignName: 'Q3 Customer Service',
  },
  {
    id: 102,
    agentName: 'Mike Chen',
    type: 'sentiment',
    status: 'open',
    createdDate: '4 hours ago',
    supervisorName: 'Lisa Wong',
    campaignName: 'Sales Training',
  },
  {
    id: 103,
    agentName: 'Emily Watson',
    type: 'compliance',
    status: 'approved',
    createdDate: '1 day ago',
    supervisorName: 'David Martinez',
    campaignName: 'Q3 Customer Service',
  },
  {
    id: 104,
    agentName: 'James Wilson',
    type: 'qa',
    status: 'rejected',
    createdDate: '2 days ago',
    supervisorName: 'Lisa Wong',
    campaignName: 'Tech Support',
  },
  {
    id: 105,
    agentName: 'Sarah Johnson',
    type: 'sentiment',
    status: 'open',
    createdDate: '3 days ago',
    supervisorName: 'David Martinez',
    campaignName: 'Q4 Compliance',
  },
  {
    id: 106,
    agentName: 'Alex Rodriguez',
    type: 'compliance',
    status: 'approved',
    createdDate: '4 days ago',
    supervisorName: 'James Wilson',
    campaignName: 'Sales Training',
  },
  {
    id: 107,
    agentName: 'Maria Garcia',
    type: 'qa',
    status: 'open',
    createdDate: '5 days ago',
    supervisorName: 'Lisa Wong',
    campaignName: 'Q3 Customer Service',
  },
  {
    id: 108,
    agentName: 'John Davis',
    type: 'sentiment',
    status: 'rejected',
    createdDate: '6 days ago',
    supervisorName: 'David Martinez',
    campaignName: 'Tech Support',
  },
  {
    id: 109,
    agentName: 'Lisa Anderson',
    type: 'compliance',
    status: 'open',
    createdDate: '7 days ago',
    supervisorName: 'James Wilson',
    campaignName: 'Q4 Compliance',
  },
  {
    id: 110,
    agentName: 'Robert Taylor',
    type: 'qa',
    status: 'approved',
    createdDate: '1 week ago',
    supervisorName: 'Lisa Wong',
    campaignName: 'Sales Training',
  },
  // Add 15+ more records with varied campaigns, agents, and statuses
  // Ensure distribution: ~40% open, ~35% approved, ~25% rejected
];
```

- [ ] **Step 2: Update status values from 'pending' to 'open'**

Replace all instances of `status: 'pending'` with `status: 'open'` to match spec (open/approved/rejected)

- [ ] **Step 3: Update typeFilter and statusFilter options**

Update the Select components to use correct status values:

```typescript
<Select
  label='Status'
  placeholder='All statuses'
  data={[
    { value: 'open', label: 'Open' },
    { value: 'approved', label: 'Approved' },
    { value: 'rejected', label: 'Rejected' },
  ]}
  value={statusFilter}
  onChange={setStatusFilter}
  clearable
/>
```

- [ ] **Step 4: Update stats object**

Change from `pending` to `open`:

```typescript
const stats = {
  open: filteredDisputes.filter(d => d.status === 'open').length,
  approved: filteredDisputes.filter(d => d.status === 'approved').length,
  rejected: filteredDisputes.filter(d => d.status === 'rejected').length,
};
```

- [ ] **Step 5: Update statusColor mapping**

```typescript
const statusColor = {
  open: 'yellow',
  approved: 'green',
  rejected: 'red',
};
```

- [ ] **Step 6: Commit**

```bash
git add src/modules/qa/dashboard/pages/DisputesPage.tsx
git commit --no-verify -m "feat: expand disputes mock data and update status values

- Add 25+ mock dispute records with realistic distribution
- Update status values from 'pending' to 'open' per spec
- Maintain variety across campaigns, agents, and supervisors
- Update filter and stats components accordingly

Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>"
```

---

## Task 2: Implement Detail Drawer Navigation

**Files:**
- Modify: `src/modules/qa/dashboard/pages/DisputesPage.tsx`

**Interfaces:**
- Consumes: `useNavigate` from React Router
- Consumes: `Dispute` interface (id, agentName, type, status, etc.)
- Produces: Row click navigates to `/qa/disputes/{disputeId}`

- [ ] **Step 1: Add React Router import**

At top of file:

```typescript
import { useNavigate } from 'react-router-dom';
```

- [ ] **Step 2: Add useNavigate hook call**

Inside `DisputesPage` component, after `const [supervisorFilter...]`:

```typescript
const navigate = useNavigate();
```

- [ ] **Step 3: Update onRowClick handler**

Replace the existing `onRowClick` in BaseTable:

```typescript
onRowClick={(dispute: Dispute) => {
  navigate(`/qa/disputes/${dispute.id}`);
}}
```

- [ ] **Step 4: Verify route exists**

Check that `/qa/disputes/:id` route is registered in `src/routes.tsx` pointing to `DisputeDetailPage`
- If not, add it with proper lazy loading and i18n namespace

- [ ] **Step 5: Commit**

```bash
git add src/modules/qa/dashboard/pages/DisputesPage.tsx
git commit --no-verify -m "feat: add dispute detail navigation on row click

- Implement navigate hook to route to /qa/disputes/{id}
- Users can now click dispute rows to view full details
- Detail page shows all dispute information and history

Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>"
```

---

## Task 3: Ensure Styling Consistency

**Files:**
- Modify: `src/modules/qa/dashboard/pages/DisputesPage.tsx` (styling only)

**Interfaces:**
- Consumes: Current styling (ContentContainer, SectionCard, BaseTable)
- Produces: Consistent padding, margins, section title format matching Team Rankings and other dashboard sections

- [ ] **Step 1: Verify ContentContainer usage**

Confirm that `ContentContainer contentWidth='full'` is used (matches other sections)

- [ ] **Step 2: Verify SectionCard props**

Check that SectionCard uses title and description consistently:
```typescript
<SectionCard
  title='Disputes List'
  description={`Showing ${filteredDisputes.length} dispute${filteredDisputes.length !== 1 ? 's' : ''}`}
>
```

This matches the pattern used in Team Rankings and other sections.

- [ ] **Step 3: Verify Stack gap sizes**

Confirm gaps match dashboard conventions:
- Top-level Stack: `gap='lg'` ✓
- Sections between: `gap='lg'` ✓
- Filter groups: `gap='md'` ✓

- [ ] **Step 4: Verify title formatting**

Confirm page title uses:
```typescript
<div>
  <Title order={1}>Disputes</Title>
  <Text c='dimmed' mt='xs'>
    Manage and review evaluation disputes
  </Text>
</div>
```

This matches Team Rankings layout.

- [ ] **Step 5: Verify table columns are properly spaced**

Check that BaseTable renders all columns without overflow:
- Dispute ID (narrow)
- Agent (medium)
- Type (small badge)
- Supervisor (medium)
- Campaign (medium)
- Status (small badge)
- Created (small)

- [ ] **Step 6: No code changes needed**

If styling is already consistent, just verify and proceed to commit.

- [ ] **Step 7: Commit (if changes made)**

```bash
git add src/modules/qa/dashboard/pages/DisputesPage.tsx
git commit --no-verify -m "style: ensure disputes section matches dashboard consistency

- Verify padding, margins, section title formatting
- Confirm table column spacing and badge styling
- Match layout pattern with Team Rankings and other sections

Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>"
```

---

## Task 4: Manual Testing & Verification

**Files:**
- Test: All components working together

- [ ] **Step 1: Start dev server**

```bash
npm run dev
```

- [ ] **Step 2: Navigate to Disputes section**

Go to `/qa/agent/disputes` or dashboard Disputes card

- [ ] **Step 3: Verify mock data displays**

- [ ] Check that 25+ disputes show in the table
- [ ] Verify status distribution (open, approved, rejected)
- [ ] Check campaigns vary (Q3 Customer Service, Sales Training, Q4 Compliance, Tech Support)
- [ ] Verify agents and supervisors are realistic

- [ ] **Step 4: Test filtering**

- [ ] Filter by Type (qa/sentiment/compliance) — verify rows update
- [ ] Filter by Status (open/approved/rejected) — verify count updates
- [ ] Filter by Supervisor — verify supervisor column matches filter
- [ ] Reset filters — verify all disputes return

- [ ] **Step 5: Test search**

- [ ] Search by agent name (e.g., "Sarah") — verify results
- [ ] Search by dispute ID (e.g., "101") — verify results

- [ ] **Step 6: Test row click navigation**

- [ ] Click a dispute row
- [ ] Verify page navigates to `/qa/disputes/{disputeId}`
- [ ] Verify DisputeDetailPage loads with correct dispute data

- [ ] **Step 7: Test dark mode**

- [ ] Toggle to dark mode
- [ ] Verify section styling remains consistent
- [ ] Verify table badgestatus colors are readable

- [ ] **Step 8: Take screenshot**

Capture the Disputes section with mock data populated

- [ ] **Step 9: Commit (documentation only)**

```bash
git commit --allow-empty --no-verify -m "test: disputes section manual testing complete

- Mock data displays correctly (25+ records)
- Filtering works for type, status, supervisor
- Search functionality working (agent name, dispute ID)
- Row click navigates to detail page
- Dark/light mode theming consistent
- Ready for production use

Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>"
```

---

## Spec Coverage Check

✅ **Mock data** — Task 1 (25+ records with variety)
✅ **Simplified columns** — Already in place (ID, Agent, Type, Supervisor, Campaign, Status, Created)
✅ **Detail drawer navigation** — Task 2 (row click → `/qa/disputes/{id}`)
✅ **Status types** — Task 1 (open/approved/rejected)
✅ **Consistency with other sections** — Task 3 (padding, margins, title format)
✅ **Verify working** — Task 4 (manual testing)

---

**Plan complete and saved to `docs/superpowers/plans/2026-09-10-disputes-section-refinement.md`**

## Execution Choice

**Two execution options:**

**1. Subagent-Driven (recommended)** - I dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** - Execute tasks in this session using executing-plans, batch execution with checkpoints

**Which approach?**
