# Team Rankings Phase 2 - Enhanced Leaderboard

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Enhance Team Rankings with user reactions, leaderboard metadata display, winner selection logic, and visual indicators for completed periods.

**Architecture:** 
- Extend mock data to include leaderboard metadata (name, startDate, endDate, scoreType)
- Add reaction UI to drawer with button interaction and state management
- Implement winner determination logic based on end date
- Display metadata in page header and winner badge in leaderboard

**Tech Stack:** React, Mantine UI, TypeScript, TanStack React Query (for future API calls), Dark/light mode via Mantine CSS variables

**Spec:** This plan implements Phase 2 of Team Rankings enhancement as described in the session context

---

## File Structure

### New Files
- `src/modules/qa/agent/rankings/hooks/useLeaderboardMetadata.ts` - Hook to fetch/manage leaderboard metadata
- `src/modules/qa/agent/rankings/hooks/useUserReaction.ts` - Hook to manage user reactions state
- `src/modules/qa/agent/rankings/components/LeaderboardHeader.tsx` - Display leaderboard metadata
- `src/modules/qa/agent/rankings/components/WinnerBadge.tsx` - Winner visual indicator
- `src/modules/qa/agent/rankings/components/ReactionButtons.tsx` - Reaction UI component
- `src/modules/qa/agent/rankings/types/leaderboard.ts` - Leaderboard type definitions

### Modified Files
- `src/modules/qa/agent/rankings/TeamRankingsPage.tsx` - Add metadata display and state
- `src/modules/qa/agent/rankings/components/RankingDetailDrawer.tsx` - Add reaction buttons
- `src/modules/qa/agent/rankings/components/ExpandedRankingsTable.tsx` - Add winner badge
- `src/modules/qa/agent/rankings/components/RankingCard.tsx` - Add winner badge to card
- `src/modules/qa/dashboard/mockData.ts` - Add leaderboard metadata and user reactions

---

## Global Constraints

- All new components must support dark/light mode using Mantine CSS variables
- All timestamps use ISO 8601 format
- Mock data is the source of truth until API integration
- Winner selection happens at end date (no manual selection yet)
- Reactions persist in mock data for this phase

---

## Task 1: Add Leaderboard Type Definitions

**Files:**
- Create: `src/modules/qa/agent/rankings/types/leaderboard.ts`

**Interfaces:**
- Produces: `LeaderboardMetadata` with fields: `id`, `name`, `startDate`, `endDate`, `scoreType`, `winnerId`
- Produces: `UserReaction` enum: THUMBS_UP, CLAPPING_HANDS, HEART, FIRE (emoji values)
- Produces: `AgentReactions` map of agentId → UserReaction

- [ ] **Step 1: Write type definitions file**

```typescript
export interface LeaderboardMetadata {
  id: string;
  name: string;
  description?: string;
  startDate: string; // ISO 8601
  endDate: string; // ISO 8601
  scoreType: string; // e.g., "Sentiment & Emotion"
  winnerId: string | null; // agentId of winner
  createdBy: string; // supervisor id
  status: 'active' | 'completed'; // auto-set based on endDate
}

export enum UserReactionType {
  THUMBS_UP = '👍',
  CLAPPING_HANDS = '👏',
  HEART = '❤️',
  FIRE = '🔥',
}

export interface UserReactionMap {
  [agentId: string]: UserReactionType | null;
}

export interface LeaderboardState {
  metadata: LeaderboardMetadata;
  userReactions: UserReactionMap;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/modules/qa/agent/rankings/types/leaderboard.ts
git commit -m "feat: add leaderboard type definitions for Phase 2

- LeaderboardMetadata interface with dates and score type
- UserReactionType enum with emoji values
- UserReactionMap for tracking user reactions per agent
- LeaderboardState combining metadata and reactions

Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>"
```

---

## Task 2: Add Leaderboard Metadata to Mock Data

**Files:**
- Modify: `src/modules/qa/dashboard/mockData.ts`

**Interfaces:**
- Consumes: `LeaderboardMetadata` type
- Produces: `currentLeaderboard: LeaderboardMetadata`
- Produces: `userReactions: UserReactionMap`

- [ ] **Step 1: Add leaderboard metadata to mockData**

Find the existing mock data section and add:

```typescript
// Add near top of mockData
export const currentLeaderboard: LeaderboardMetadata = {
  id: 'lboard-2026-09-01',
  name: 'September Agent Performance',
  description: 'Agent performance ranking for September 2026',
  startDate: '2026-09-01T00:00:00Z',
  endDate: '2026-09-30T23:59:59Z',
  scoreType: 'Sentiment & Emotion',
  winnerId: null, // Will be set when period ends
  createdBy: 'supervisor-001',
  status: 'active',
};

export const userReactions: UserReactionMap = {
  'agent-001': UserReactionType.THUMBS_UP,
  'agent-002': null, // User hasn't reacted yet
  'agent-003': UserReactionType.FIRE,
  // Add more as needed
};
```

- [ ] **Step 2: Update mock roster data to include reactions per agent**

Ensure each AgentRankingEntry includes `userReaction` field (or manage separately)

- [ ] **Step 3: Commit**

```bash
git add src/modules/qa/dashboard/mockData.ts
git commit -m "feat: add leaderboard metadata and reactions to mock data

- currentLeaderboard with dates, score type, supervisor info
- userReactions map for each agent
- Status field (active/completed) for winner logic

Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>"
```

---

## Task 3: Create LeaderboardHeader Component

**Files:**
- Create: `src/modules/qa/agent/rankings/components/LeaderboardHeader.tsx`

**Interfaces:**
- Consumes: `LeaderboardMetadata` type
- Produces: Component that displays: name, description, score type, date range, days remaining

- [ ] **Step 1: Create component with metadata display**

```typescript
import React from 'react';
import { Group, Stack, Text, Title, Progress, Badge } from '@mantine/core';
import { IconCalendar, IconClock } from '@tabler/icons-react';
import type { LeaderboardMetadata } from '../types/leaderboard';

interface LeaderboardHeaderProps {
  metadata: LeaderboardMetadata;
  daysRemaining: number;
}

export const LeaderboardHeader: React.FC<LeaderboardHeaderProps> = ({
  metadata,
  daysRemaining,
}) => {
  const percentComplete = ((metadata.endDate - Date.now()) / (metadata.endDate - metadata.startDate)) * 100;
  
  return (
    <Stack gap='md'>
      <div>
        <Group justify='space-between' align='flex-start'>
          <div>
            <Title order={2}>{metadata.name}</Title>
            <Text c='dimmed' mt='xs'>{metadata.description}</Text>
          </div>
          <Badge size='lg' variant='light'>
            {metadata.scoreType}
          </Badge>
        </Group>
      </div>

      <Group gap='xl'>
        <div>
          <Text size='xs' c='dimmed' tt='uppercase' fw={600}>Start Date</Text>
          <Group gap={4} mt={4}>
            <IconCalendar size={16} />
            <Text size='sm'>{new Date(metadata.startDate).toLocaleDateString()}</Text>
          </Group>
        </div>
        <div>
          <Text size='xs' c='dimmed' tt='uppercase' fw={600}>End Date</Text>
          <Group gap={4} mt={4}>
            <IconClock size={16} />
            <Text size='sm'>{new Date(metadata.endDate).toLocaleDateString()}</Text>
          </Group>
        </div>
        <div>
          <Text size='xs' c='dimmed' tt='uppercase' fw={600}>Days Remaining</Text>
          <Text size='sm' fw={600}>{Math.max(0, daysRemaining)}</Text>
        </div>
      </Group>

      <Progress value={percentComplete} radius='md' size='sm' />
    </Stack>
  );
};

export default LeaderboardHeader;
```

- [ ] **Step 2: Commit**

```bash
git add src/modules/qa/agent/rankings/components/LeaderboardHeader.tsx
git commit -m "feat: create LeaderboardHeader component for metadata display

- Display leaderboard name, description, and score type
- Show start/end dates and days remaining
- Progress bar showing period completion

Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>"
```

---

## Task 4: Create ReactionButtons Component

**Files:**
- Create: `src/modules/qa/agent/rankings/components/ReactionButtons.tsx`

**Interfaces:**
- Consumes: `UserReactionType` enum
- Consumes: current user's reaction (or null)
- Consumes: callback `onReactionChange: (reaction: UserReactionType | null) => void`
- Produces: Button group with 4 reaction options

- [ ] **Step 1: Create reaction buttons component**

```typescript
import React from 'react';
import { Button, Group, Tooltip } from '@mantine/core';
import { UserReactionType } from '../types/leaderboard';

interface ReactionButtonsProps {
  currentReaction: UserReactionType | null;
  onReactionChange: (reaction: UserReactionType | null) => void;
  disabled?: boolean;
}

const REACTION_OPTIONS = [
  { emoji: UserReactionType.THUMBS_UP, label: 'Thumbs Up' },
  { emoji: UserReactionType.CLAPPING_HANDS, label: 'Clapping Hands' },
  { emoji: UserReactionType.HEART, label: 'Heart' },
  { emoji: UserReactionType.FIRE, label: 'Fire' },
];

export const ReactionButtons: React.FC<ReactionButtonsProps> = ({
  currentReaction,
  onReactionChange,
  disabled = false,
}) => {
  return (
    <Group gap='xs'>
      <span>React:</span>
      {REACTION_OPTIONS.map(({ emoji, label }) => (
        <Tooltip key={emoji} label={label} withArrow>
          <Button
            variant={currentReaction === emoji ? 'filled' : 'light'}
            size='sm'
            p={8}
            onClick={() => {
              if (currentReaction === emoji) {
                onReactionChange(null); // Toggle off
              } else {
                onReactionChange(emoji);
              }
            }}
            disabled={disabled}
          >
            <span style={{ fontSize: '1.2em' }}>{emoji}</span>
          </Button>
        </Tooltip>
      ))}
    </Group>
  );
};

export default ReactionButtons;
```

- [ ] **Step 2: Commit**

```bash
git add src/modules/qa/agent/rankings/components/ReactionButtons.tsx
git commit -m "feat: create ReactionButtons component for user interactions

- Four emoji reaction buttons (👍 👏 ❤️ 🔥)
- Toggle behavior: clicking same reaction twice deselects it
- Visual feedback for selected reaction
- Tooltip labels for accessibility

Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>"
```

---

## Task 5: Create WinnerBadge Component

**Files:**
- Create: `src/modules/qa/agent/rankings/components/WinnerBadge.tsx`

**Interfaces:**
- Consumes: `isWinner: boolean`
- Produces: Visual indicator component (Trophy emoji + "Winner" text)

- [ ] **Step 1: Create winner badge component**

```typescript
import React from 'react';
import { Badge, Tooltip } from '@mantine/core';

interface WinnerBadgeProps {
  isWinner: boolean;
}

export const WinnerBadge: React.FC<WinnerBadgeProps> = ({ isWinner }) => {
  if (!isWinner) return null;

  return (
    <Tooltip label='Period winner' withArrow>
      <Badge
        variant='gradient'
        gradient={{ from: 'gold', to: 'orange' }}
        size='lg'
        radius='sm'
      >
        <span aria-hidden>🏆</span> Winner
      </Badge>
    </Tooltip>
  );
};

export default WinnerBadge;
```

- [ ] **Step 2: Commit**

```bash
git add src/modules/qa/agent/rankings/components/WinnerBadge.tsx
git commit -m "feat: create WinnerBadge component for leaderboard winner

- Display trophy emoji + 'Winner' text
- Gradient styling (gold to orange)
- Tooltip for accessibility

Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>"
```

---

## Task 6: Create Leaderboard Metadata Hook

**Files:**
- Create: `src/modules/qa/agent/rankings/hooks/useLeaderboardMetadata.ts`

**Interfaces:**
- Produces: Hook that returns `{ metadata, isCompleted, daysRemaining, isWinnerSelected }`

- [ ] **Step 1: Create metadata hook**

```typescript
import { useMemo } from 'react';
import { currentLeaderboard } from '~/modules/qa/dashboard/mockData';
import type { LeaderboardMetadata } from '../types/leaderboard';

interface UseLeaderboardMetadataResult {
  metadata: LeaderboardMetadata;
  isCompleted: boolean;
  daysRemaining: number;
  isWinnerSelected: boolean;
}

export const useLeaderboardMetadata = (): UseLeaderboardMetadataResult => {
  return useMemo(() => {
    const now = new Date();
    const endDate = new Date(currentLeaderboard.endDate);
    const startDate = new Date(currentLeaderboard.startDate);
    
    const isCompleted = now >= endDate;
    const daysRemaining = Math.ceil(
      (endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );
    const isWinnerSelected = currentLeaderboard.winnerId !== null;

    return {
      metadata: currentLeaderboard,
      isCompleted,
      daysRemaining: Math.max(0, daysRemaining),
      isWinnerSelected,
    };
  }, []);
};

export default useLeaderboardMetadata;
```

- [ ] **Step 2: Commit**

```bash
git add src/modules/qa/agent/rankings/hooks/useLeaderboardMetadata.ts
git commit -m "feat: create useLeaderboardMetadata hook

- Calculate completion status based on end date
- Calculate days remaining
- Check if winner has been selected
- Memoized for performance

Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>"
```

---

## Task 7: Create User Reaction Hook

**Files:**
- Create: `src/modules/qa/agent/rankings/hooks/useUserReaction.ts`

**Interfaces:**
- Consumes: `agentId: string`
- Produces: Hook that returns `{ currentReaction, setReaction }`

- [ ] **Step 1: Create user reaction hook**

```typescript
import { useState, useCallback } from 'react';
import { userReactions } from '~/modules/qa/dashboard/mockData';
import type { UserReactionType } from '../types/leaderboard';

interface UseUserReactionResult {
  currentReaction: UserReactionType | null;
  setReaction: (reaction: UserReactionType | null) => void;
}

export const useUserReaction = (agentId: string): UseUserReactionResult => {
  const [currentReaction, setCurrentReaction] = useState<UserReactionType | null>(
    userReactions[agentId] || null
  );

  const setReaction = useCallback((reaction: UserReactionType | null) => {
    // In real app, this would call an API
    setCurrentReaction(reaction);
    // Update mock data
    userReactions[agentId] = reaction;
  }, [agentId]);

  return { currentReaction, setReaction };
};

export default useUserReaction;
```

- [ ] **Step 2: Commit**

```bash
git add src/modules/qa/agent/rankings/hooks/useUserReaction.ts
git commit -m "feat: create useUserReaction hook for reaction state

- Track current user reaction for an agent
- Callback to update reaction (stores in mock data)
- Ready for API integration in Phase 3

Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>"
```

---

## Task 8: Update RankingDetailDrawer with Reactions

**Files:**
- Modify: `src/modules/qa/agent/rankings/components/RankingDetailDrawer.tsx`

**Interfaces:**
- Consumes: `ReactionButtons` component
- Consumes: `useUserReaction` hook
- Produces: Drawer with reaction buttons below existing content

- [ ] **Step 1: Import new components and hooks**

Add to imports:
```typescript
import ReactionButtons from './ReactionButtons';
import { useUserReaction } from '../hooks/useUserReaction';
import { WinnerBadge } from './WinnerBadge';
```

- [ ] **Step 2: Add reactions section to drawer**

Find the Stack in RankingDetailDrawer and add before the tabs:

```typescript
// Add inside RankingDetailDrawer component body, after const declarations
const { currentReaction, setReaction } = useUserReaction(entry.agentId);

// Add this section after the gamification badges, before the Tabs
<Divider />

<Stack gap='sm'>
  <ReactionButtons
    currentReaction={currentReaction}
    onReactionChange={setReaction}
  />
  <Text size='xs' c='dimmed'>
    Your reaction helps celebrate team achievements
  </Text>
</Stack>
```

- [ ] **Step 3: Commit**

```bash
git add src/modules/qa/agent/rankings/components/RankingDetailDrawer.tsx
git commit -m "feat: add reaction buttons to ranking detail drawer

- User can now react to agents with emoji buttons
- Reactions persist in drawer state
- Helpful tooltip text for context

Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>"
```

---

## Task 9: Update TeamRankingsPage with Header

**Files:**
- Modify: `src/modules/qa/agent/rankings/TeamRankingsPage.tsx`

**Interfaces:**
- Consumes: `LeaderboardHeader` component
- Consumes: `useLeaderboardMetadata` hook

- [ ] **Step 1: Import new component and hook**

Add to imports:
```typescript
import LeaderboardHeader from './components/LeaderboardHeader';
import { useLeaderboardMetadata } from './hooks/useLeaderboardMetadata';
```

- [ ] **Step 2: Add metadata display**

In TeamRankingsPage component, after const declarations:
```typescript
const { metadata, isCompleted, daysRemaining } = useLeaderboardMetadata();
```

Replace the existing title/description section with:
```typescript
<LeaderboardHeader metadata={metadata} daysRemaining={daysRemaining} />
```

- [ ] **Step 3: Commit**

```bash
git add src/modules/qa/agent/rankings/TeamRankingsPage.tsx
git commit -m "feat: display leaderboard metadata in page header

- Show leaderboard name, score type, and dates
- Display days remaining with progress bar
- Metadata updates in real-time based on current date

Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>"
```

---

## Task 10: Update Table and Cards with Winner Badge

**Files:**
- Modify: `src/modules/qa/agent/rankings/components/ExpandedRankingsTable.tsx`
- Modify: `src/modules/qa/agent/rankings/components/RankingCard.tsx`

**Interfaces:**
- Consumes: `WinnerBadge` component
- Consumes: `useLeaderboardMetadata` hook
- Produces: Display winner badge for rank #1 when leaderboard is completed

- [ ] **Step 1: Update ExpandedRankingsTable**

Add imports:
```typescript
import { WinnerBadge } from './WinnerBadge';
import { useLeaderboardMetadata } from '../hooks/useLeaderboardMetadata';
```

In render, add hook call:
```typescript
const { isCompleted, metadata } = useLeaderboardMetadata();
```

In the table row for rank #1, add after the rank badge:
```typescript
<WinnerBadge isWinner={isCompleted && entry.rank === 1} />
```

- [ ] **Step 2: Update RankingCard**

Apply same changes to RankingCard component

- [ ] **Step 3: Commit both files**

```bash
git add src/modules/qa/agent/rankings/components/ExpandedRankingsTable.tsx src/modules/qa/agent/rankings/components/RankingCard.tsx
git commit -m "feat: display winner badge when leaderboard period ends

- Show 🏆 Winner badge next to rank #1 when period is completed
- Badge visible in both desktop table and mobile cards
- Visual indicator that period has concluded

Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>"
```

---

## Task 11: Add Winner Selection Logic (Auto-select)

**Files:**
- Modify: `src/modules/qa/dashboard/mockData.ts`

**Interfaces:**
- Consumes: Current date
- Produces: Logic to auto-select winner when period ends

- [ ] **Step 1: Create winner selection function**

Add to mockData:

```typescript
/**
 * Determine if a leaderboard period has ended and auto-select winner
 */
export function selectWinnerIfPeriodEnded(
  leaderboard: LeaderboardMetadata,
  roster: AgentRankingEntry[]
): void {
  const now = new Date();
  const endDate = new Date(leaderboard.endDate);
  
  if (now >= endDate && leaderboard.winnerId === null) {
    // Auto-select rank #1 as winner
    const winner = roster.find(entry => entry.rank === 1);
    if (winner) {
      leaderboard.winnerId = winner.agentId;
      leaderboard.status = 'completed';
    }
  }
}
```

- [ ] **Step 2: Call function in TeamRankingsPage**

In TeamRankingsPage, after getting metadata:
```typescript
import { selectWinnerIfPeriodEnded } from '~/modules/qa/dashboard/mockData';

// ... in component
useEffect(() => {
  selectWinnerIfPeriodEnded(metadata, roster);
}, [metadata, roster]);
```

- [ ] **Step 3: Commit**

```bash
git add src/modules/qa/dashboard/mockData.ts src/modules/qa/agent/rankings/TeamRankingsPage.tsx
git commit -m "feat: implement auto-winner selection when period ends

- selectWinnerIfPeriodEnded() called on page load
- Automatically selects rank #1 when endDate passes
- Sets leaderboard status to 'completed'
- Ready for supervisor notification in Phase 3

Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>"
```

---

## Task 12: Test Complete Phase 2 Flow

**Files:**
- Test: All components working together

- [ ] **Step 1: Run dev server**

```bash
npm run dev
```

- [ ] **Step 2: Test manual scenarios**

- [ ] Navigate to `/qa/agent/rankings` — verify leaderboard metadata displays
- [ ] Verify header shows correct dates and days remaining
- [ ] Click on an agent row — drawer opens with reaction buttons
- [ ] Test clicking each reaction button — verify it highlights and toggles
- [ ] Test date logic: open console and set `Date.now()` past `endDate` — verify winner badge appears on rank #1
- [ ] Test dark mode toggle — verify all new components theme correctly

- [ ] **Step 3: Take screenshot of metadata display**

- [ ] **Step 4: Take screenshot of reaction buttons**

- [ ] **Step 5: Commit (documentation only)**

```bash
git commit --allow-empty -m "test: Phase 2 manual testing complete

- Leaderboard metadata displays correctly
- Reaction buttons work as expected
- Winner badge appears when period ends
- Dark/light mode themes working
- Ready for Phase 3 (API integration & supervisor controls)

Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>"
```

---

## Spec Coverage Check

✅ **Reaction buttons in drawer** — Task 4, 8
✅ **Leaderboard metadata display** — Task 2, 3, 9
✅ **Winner selection logic** — Task 5, 11, 12
✅ **Visual winner indicator** — Task 5, 10
✅ **Auto-select on end date** — Task 11

---

**Plan complete and saved to `docs/superpowers/plans/2026-09-10-team-rankings-phase-2.md`**

## Execution Choice

**Two execution options:**

**1. Subagent-Driven (recommended)** - I dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** - Execute tasks in this session using executing-plans, batch execution with checkpoints

**Which approach would you prefer?**