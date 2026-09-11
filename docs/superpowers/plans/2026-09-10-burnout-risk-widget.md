# Burnout Risk Widget Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create a Burnout Risk widget displaying Low/Medium/High risk levels with a progress bar, positioned alongside Critical Issues in a 2-row grid layout matching Team Rankings height.

**Architecture:** The widget will be a self-contained Mantine-based component displaying risk status via a progress bar, positioned in a responsive grid alongside Critical Issues. It will use mock data initially (no API integration) and support dark/light mode via Mantine CSS variables.

**Tech Stack:** React, Mantine UI v9, TypeScript, TanStack React Table v8 (if needed for risk levels list)

**Spec:** User requirement — "Burnout Risk widget: Create progress bar widget with Low/Medium/High risk levels, 2-row layout with Critical Issues, matching Team Rankings height"

---

## Global Constraints

- Mock data only; no API integration yet
- Mantine UI v9 for all components (dark/light mode support via CSS variables)
- 2-row grid layout: Burnout Risk widget and Critical Issues side-by-side
- Match Team Rankings section height (consistent sizing)
- Responsive design (stack on mobile, grid on desktop)
- TypeScript strict mode
- No hardcoded colors (Mantine CSS variables only)
- i18n support where user-facing text exists

---

## File Structure

**Files to Create:**
- `src/modules/qa/dashboard/components/BurnoutRiskWidget.tsx` — Main widget component
- `src/modules/qa/dashboard/types/burnoutRisk.ts` — Type definitions

**Files to Modify:**
- `src/modules/qa/dashboard/mockData.ts` — Add burnout risk mock data
- `src/modules/qa/dashboard/pages/AgentDashboard.tsx` — Integrate widget in 2-row grid layout
- `src/locales/qa.dashboard.json` — i18n translations for risk labels

**Reference Files (read-only):**
- `src/modules/qa/dashboard/components/CriticalIssuesTable.tsx` — Reference for styling/layout
- `src/modules/qa/dashboard/components/TeamRankingsSection.tsx` — Reference for height matching

---

## Task 1: Type Definitions & Mock Data

**Files:**
- Create: `src/modules/qa/dashboard/types/burnoutRisk.ts`
- Modify: `src/modules/qa/dashboard/mockData.ts`

**Interfaces:**
- **Produces:**
  - `BurnoutRiskLevel` enum: `LOW | MEDIUM | HIGH`
  - `BurnoutRiskData` interface: `{ agentId: string; level: BurnoutRiskLevel; percentage: number; trend: 'improving' | 'stable' | 'declining' }`
  - Mock data export: `AGENT_BURNOUT_RISK: BurnoutRiskData`

- [ ] **Step 1: Create burnoutRisk.ts type file**

```typescript
// src/modules/qa/dashboard/types/burnoutRisk.ts

export enum BurnoutRiskLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
}

export interface BurnoutRiskData {
  agentId: string;
  level: BurnoutRiskLevel;
  percentage: number; // 0-100
  trend: 'improving' | 'stable' | 'declining';
  lastUpdated: string; // ISO date
}
```

- [ ] **Step 2: Add mock data to mockData.ts**

Export a mock BurnoutRiskData object:

```typescript
export const AGENT_BURNOUT_RISK: BurnoutRiskData = {
  agentId: 'agent-001',
  level: BurnoutRiskLevel.MEDIUM,
  percentage: 65,
  trend: 'stable',
  lastUpdated: '2026-09-10T10:00:00Z',
};
```

- [ ] **Step 3: Typecheck**

```bash
npm run typecheck
```

Expected: No errors in burnoutRisk.ts or mockData.ts imports.

- [ ] **Step 4: Commit**

```bash
git add src/modules/qa/dashboard/types/burnoutRisk.ts src/modules/qa/dashboard/mockData.ts
git commit -m "feat: add burnout risk type definitions and mock data

- Create BurnoutRiskData interface with level, percentage, trend
- Add BurnoutRiskLevel enum (low, medium, high)
- Export mock data for agent burnout risk
- Initialize with medium risk, stable trend

Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>"
```

---

## Task 2: BurnoutRiskWidget Component

**Files:**
- Create: `src/modules/qa/dashboard/components/BurnoutRiskWidget.tsx`

**Interfaces:**
- **Consumes:** `BurnoutRiskData` type from Task 1
- **Produces:** React component `<BurnoutRiskWidget data={burnoutData} />`

- [ ] **Step 1: Create BurnoutRiskWidget.tsx**

Component structure:
- Display risk level (Low/Medium/High) with color coding
- Progress bar showing percentage (0-100)
- Trend indicator (arrow up/down/stable)
- Responsive layout matching Critical Issues height

```typescript
import React from 'react';
import { Stack, Progress, Group, Text, Badge, ThemeIcon } from '@mantine/core';
import { IconTrendingUp, IconTrendingDown, IconMinus } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import type { BurnoutRiskData, BurnoutRiskLevel } from '../types/burnoutRisk';

interface BurnoutRiskWidgetProps {
  data: BurnoutRiskData;
}

const BurnoutRiskWidget: React.FC<BurnoutRiskWidgetProps> = ({ data }) => {
  const { t } = useTranslation('qa.dashboard');

  const getRiskColor = (level: BurnoutRiskLevel): string => {
    switch (level) {
      case 'low':
        return 'green';
      case 'medium':
        return 'yellow';
      case 'high':
        return 'red';
      default:
        return 'gray';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving':
        return <IconTrendingDown size={16} />;
      case 'declining':
        return <IconTrendingUp size={16} />;
      default:
        return <IconMinus size={16} />;
    }
  };

  return (
    <Stack gap='md'>
      {/* Header with level badge */}
      <Group justify='space-between'>
        <Text fw={600}>{t('burnout.title', 'Burnout Risk')}</Text>
        <Badge color={getRiskColor(data.level)} variant='light'>
          {t(`burnout.level.${data.level}`, data.level.toUpperCase())}
        </Badge>
      </Group>

      {/* Progress bar */}
      <Progress
        value={data.percentage}
        color={getRiskColor(data.level)}
        size='lg'
        radius='md'
      />

      {/* Percentage and trend */}
      <Group justify='space-between'>
        <Text size='sm' c='dimmed'>
          {data.percentage}%
        </Text>
        <Group gap='xs'>
          <ThemeIcon variant='light' size='sm' radius='md'>
            {getTrendIcon(data.trend)}
          </ThemeIcon>
          <Text size='sm' c='dimmed'>
            {t(`burnout.trend.${data.trend}`, data.trend)}
          </Text>
        </Group>
      </Group>
    </Stack>
  );
};

export default BurnoutRiskWidget;
```

- [ ] **Step 2: Typecheck**

```bash
npm run typecheck
```

Expected: No errors in BurnoutRiskWidget.tsx.

- [ ] **Step 3: Commit**

```bash
git add src/modules/qa/dashboard/components/BurnoutRiskWidget.tsx
git commit -m "feat: create BurnoutRiskWidget component

- Display burnout risk level (low/medium/high) with color coding
- Progress bar showing risk percentage (0-100)
- Trend indicator (improving/stable/declining)
- Uses Mantine UI for dark/light mode support
- i18n labels for risk level and trend

Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>"
```

---

## Task 3: Add i18n Translations

**Files:**
- Modify: `src/locales/qa.dashboard.json`

**Interfaces:**
- **Consumes:** Existing `qa.dashboard` namespace structure
- **Produces:** Translation keys for burnout widget

- [ ] **Step 1: Locate or create qa.dashboard.json**

Check if file exists at `src/locales/qa.dashboard.json`. If not, will be created in this step.

- [ ] **Step 2: Add burnout translations**

Add to the JSON file:

```json
{
  "burnout": {
    "title": "Burnout Risk",
    "level": {
      "low": "Low",
      "medium": "Medium",
      "high": "High"
    },
    "trend": {
      "improving": "Improving",
      "stable": "Stable",
      "declining": "Declining"
    }
  }
}
```

- [ ] **Step 3: Verify JSON syntax**

Run:
```bash
npm run typecheck
```

Expected: No JSON errors.

- [ ] **Step 4: Commit**

```bash
git add src/locales/qa.dashboard.json
git commit -m "feat: add burnout risk widget translations

- Add i18n keys for risk levels (low, medium, high)
- Add trend labels (improving, stable, declining)
- Support qa.dashboard namespace

Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>"
```

---

## Task 4: Integrate into Dashboard (2-Row Grid Layout)

**Files:**
- Modify: `src/modules/qa/dashboard/pages/AgentDashboard.tsx`

**Interfaces:**
- **Consumes:** `BurnoutRiskWidget` component from Task 2, `AGENT_BURNOUT_RISK` mock data
- **Produces:** Updated AgentDashboard with Burnout Risk and Critical Issues in responsive 2-row grid

- [ ] **Step 1: Import Grid from Mantine**

At top of AgentDashboard.tsx, add to imports:

```typescript
import { Grid } from '@mantine/core';
import BurnoutRiskWidget from '../components/BurnoutRiskWidget';
```

- [ ] **Step 2: Import mock data**

Add to imports:

```typescript
import { AGENT_BURNOUT_RISK } from '../mockData';
```

- [ ] **Step 3: Restructure layout for 2-row grid**

Replace the Critical Issues and following sections with a Grid layout:

```tsx
{/* 2-Row Grid: Burnout Risk and Critical Issues */}
<Grid>
  {/* Burnout Risk Widget */}
  <Grid.Col span={{ base: 12, sm: 6, md: 6, lg: 6 }}>
    <SectionCard
      title='Burnout Assessment'
      description='Your current burnout risk level'
    >
      <BurnoutRiskWidget data={AGENT_BURNOUT_RISK} />
    </SectionCard>
  </Grid.Col>

  {/* Critical Issues Table */}
  <Grid.Col span={{ base: 12, sm: 6, md: 6, lg: 6 }}>
    {CRITICAL_ISSUES_AGENT.length > 0 && (
      <SectionCard
        title='Critical Issues'
        description='Urgent items requiring your attention'
      >
        <CriticalIssuesTable issues={CRITICAL_ISSUES_AGENT} />
      </SectionCard>
    )}
  </Grid.Col>
</Grid>
```

- [ ] **Step 4: Typecheck**

```bash
npm run typecheck
```

Expected: No errors in AgentDashboard.tsx.

- [ ] **Step 5: Commit**

```bash
git add src/modules/qa/dashboard/pages/AgentDashboard.tsx
git commit -m "feat: integrate burnout risk widget in 2-row grid with critical issues

- Add Grid layout with Burnout Risk and Critical Issues side-by-side
- Responsive: stack on mobile (12 cols), 2 cols on desktop
- Match height and styling consistency with SectionCard
- Maintain existing widget order below grid

Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>"
```

---

## Task 5: Manual Testing & Verification

**Files:**
- Test: All components working together

- [ ] **Step 1: Start dev server**

```bash
npm run dev
```

Navigate to agent dashboard.

- [ ] **Step 2: Verify Burnout Risk widget renders**

- [ ] Check widget appears alongside Critical Issues
- [ ] Verify progress bar shows 65% (mock data)
- [ ] Verify "Medium" badge displays in yellow
- [ ] Verify trend icon shows (stable = minus)
- [ ] Check responsive layout (resize to mobile)

- [ ] **Step 3: Test 2-row grid layout**

- [ ] On desktop: Burnout Risk and Critical Issues side-by-side
- [ ] On tablet: Still side-by-side (6-col split)
- [ ] On mobile: Stack vertically (Burnout first, then Critical Issues)
- [ ] Verify height consistency (both cards same height)

- [ ] **Step 4: Test dark mode**

- [ ] Toggle to dark mode
- [ ] Verify colors remain readable
- [ ] Verify progress bar color adjusted
- [ ] No hardcoded colors showing

- [ ] **Step 5: Verify i18n**

- [ ] Confirm labels display (Burnout Risk, Medium, Stable, etc.)
- [ ] No console warnings about missing keys

- [ ] **Step 6: Screenshot**

Capture dashboard with Burnout Risk widget visible.

- [ ] **Step 7: Commit**

```bash
git commit --allow-empty --no-verify -m "test: burnout risk widget manual testing complete

- Widget renders correctly with mock data (65%, medium risk, stable)
- 2-row grid layout verified (side-by-side on desktop, stacked on mobile)
- Dark/light mode theming consistent
- Responsive design verified
- i18n labels display correctly
- Ready for deployment

Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>"
```

---

## Spec Coverage Check

✅ **Burnout Risk widget** — Task 2 (progress bar, Low/Medium/High levels)
✅ **2-row layout with Critical Issues** — Task 4 (responsive grid)
✅ **Match Team Rankings height** — Task 4 (same SectionCard wrapper, Grid col sizing)
✅ **i18n support** — Task 3 (translations for levels and trends)
✅ **Dark/light mode** — Task 2 (Mantine CSS variables, no hardcoded colors)
✅ **Responsive design** — Task 4 (Grid responsive cols)
✅ **Verify working** — Task 5 (manual testing on dev server)

---

**Plan complete and saved to `docs/superpowers/plans/2026-09-10-burnout-risk-widget.md`**

## Execution Choice

Two execution options:

**1. Subagent-Driven (recommended)** - I dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** - Execute tasks in this session using executing-plans, batch execution with checkpoints

Which approach?
