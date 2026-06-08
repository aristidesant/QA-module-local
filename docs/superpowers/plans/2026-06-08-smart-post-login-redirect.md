# Smart Post-Login Redirect Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement intelligent post-login routing that directs users to the most appropriate landing page based on their module permissions.

**Architecture:** Create a pure function `computeLandingPath()` that determines the best landing route from a permission map, wrap it in a `useLandingPath()` hook, and create a `<SmartRootRedirect>` component that wraps the Overview route to redirect users without DASHBOARD access.

**Tech Stack:** React, TypeScript, React Router v7, Vitest

---

## File Structure

| File                                                     | Action | Responsibility                                          |
| -------------------------------------------------------- | ------ | ------------------------------------------------------- |
| `src/utils/computeLandingPath.ts`                        | Create | Pure function: compute landing path from permission map |
| `src/utils/computeLandingPath.test.ts`                   | Create | Unit tests for `computeLandingPath()`                   |
| `src/hooks/useLandingPath.ts`                            | Create | Hook: wrap `computeLandingPath` with `usePermissions()` |
| `src/components/SmartRootRedirect/SmartRootRedirect.tsx` | Create | Component: redirect if user lacks DASHBOARD access      |
| `src/routes.tsx`                                         | Modify | Wrap Overview route with `<SmartRootRedirect>`          |

---

### Task 1: Create `computeLandingPath()` with TDD

**Files:**

- Create: `src/utils/computeLandingPath.test.ts`
- Create: `src/utils/computeLandingPath.ts`

- [ ] **Step 1: Write failing test for DASHBOARD access**

```typescript
// src/utils/computeLandingPath.test.ts
import { describe, it, expect } from 'vitest';
import { computeLandingPath } from './computeLandingPath';
import { ModuleEnum } from '~/constants/ModuleEnum';
import { PermissionEnum } from '~/constants/PermissionEnum';

describe('computeLandingPath', () => {
	it('should return / when user has DASHBOARD access', () => {
		const permissionMap = {
			[ModuleEnum.DASHBOARD]: new Set([PermissionEnum.READ]),
			[ModuleEnum.CAMPAIGNS]: new Set([PermissionEnum.READ]),
		};

		const result = computeLandingPath(permissionMap);

		expect(result).toBe('/');
	});
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/utils/computeLandingPath.test.ts`
Expected: FAIL with "computeLandingPath is not defined" or similar

- [ ] **Step 3: Write minimal implementation**

```typescript
// src/utils/computeLandingPath.ts
import { ModuleEnum } from '~/constants/ModuleEnum';
import { canAccessModule } from '~/utils/permissionUtils';
import type { PermissionMap } from '~/utils/permissionUtils';

const MODULE_PRIORITY: Array<{ module: ModuleEnum; path: string }> = [
	{ module: ModuleEnum.CAMPAIGNS, path: '/campaigns' },
	{ module: ModuleEnum.CONVERSATIONS, path: '/conversations' },
	{ module: ModuleEnum.KNOWLEDGE_BASES, path: '/knowledge-bases' },
	{ module: ModuleEnum.REPORTS, path: '/report-templates' },
	{ module: ModuleEnum.SETTINGS, path: '/campaign-management' },
	{ module: ModuleEnum.USERS, path: '/users' },
	{ module: ModuleEnum.ROLES, path: '/roles' },
	{ module: ModuleEnum.BILLING, path: '/billing/invoices' },
	{ module: ModuleEnum.TOOLS, path: '/tools' },
];

export const computeLandingPath = (permissionMap: PermissionMap): string => {
	if (canAccessModule(permissionMap, ModuleEnum.DASHBOARD)) {
		return '/';
	}

	for (const { module, path } of MODULE_PRIORITY) {
		if (canAccessModule(permissionMap, module)) {
			return path;
		}
	}

	return '/';
};
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- src/utils/computeLandingPath.test.ts`
Expected: PASS

- [ ] **Step 5: Add test for single module access (no dashboard)**

```typescript
// Add to src/utils/computeLandingPath.test.ts
it('should return /campaigns when user has only CAMPAIGNS access', () => {
	const permissionMap = {
		[ModuleEnum.CAMPAIGNS]: new Set([PermissionEnum.READ]),
	};

	const result = computeLandingPath(permissionMap);

	expect(result).toBe('/campaigns');
});
```

- [ ] **Step 6: Run test to verify it passes**

Run: `npm test -- src/utils/computeLandingPath.test.ts`
Expected: PASS

- [ ] **Step 7: Add test for multiple modules without dashboard (priority order)**

```typescript
// Add to src/utils/computeLandingPath.test.ts
it('should return /conversations when user has CONVERSATIONS and KNOWLEDGE_BASES (no dashboard)', () => {
	const permissionMap = {
		[ModuleEnum.CONVERSATIONS]: new Set([PermissionEnum.READ]),
		[ModuleEnum.KNOWLEDGE_BASES]: new Set([PermissionEnum.READ]),
	};

	const result = computeLandingPath(permissionMap);

	expect(result).toBe('/conversations');
});
```

- [ ] **Step 8: Run test to verify it passes**

Run: `npm test -- src/utils/computeLandingPath.test.ts`
Expected: PASS

- [ ] **Step 9: Add test for fallback when no modules accessible**

```typescript
// Add to src/utils/computeLandingPath.test.ts
it('should return / when user has no module access', () => {
	const permissionMap = {};

	const result = computeLandingPath(permissionMap);

	expect(result).toBe('/');
});
```

- [ ] **Step 10: Run test to verify it passes**

Run: `npm test -- src/utils/computeLandingPath.test.ts`
Expected: PASS

- [ ] **Step 11: Run all tests**

Run: `npm test`
Expected: All tests pass

- [ ] **Step 12: Commit**

```bash
git add src/utils/computeLandingPath.ts src/utils/computeLandingPath.test.ts
git commit -m "feat: add computeLandingPath utility with tests"
```

---

### Task 2: Create `useLandingPath()` hook

**Files:**

- Create: `src/hooks/useLandingPath.ts`

- [ ] **Step 1: Create the hook**

```typescript
// src/hooks/useLandingPath.ts
import { useMemo } from 'react';
import { usePermissions } from '~/hooks/usePermissions';
import { computeLandingPath } from '~/utils/computeLandingPath';

export const useLandingPath = (): string => {
	const { permissionMap } = usePermissions();

	return useMemo(() => computeLandingPath(permissionMap), [permissionMap]);
};
```

- [ ] **Step 2: Run typecheck**

Run: `npm run typecheck`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add src/hooks/useLandingPath.ts
git commit -m "feat: add useLandingPath hook"
```

---

### Task 3: Create `<SmartRootRedirect>` component

**Files:**

- Create: `src/components/SmartRootRedirect/SmartRootRedirect.tsx`

- [ ] **Step 1: Create the component**

```typescript
// src/components/SmartRootRedirect/SmartRootRedirect.tsx
import { Navigate } from 'react-router';
import { useLandingPath } from '~/hooks/useLandingPath';

interface SmartRootRedirectProps {
	children: React.ReactNode;
}

const SmartRootRedirect = ({ children }: SmartRootRedirectProps) => {
	const landingPath = useLandingPath();

	if (landingPath !== '/') {
		return <Navigate to={landingPath} replace />;
	}

	return <>{children}</>;
};

export default SmartRootRedirect;
```

- [ ] **Step 2: Run typecheck**

Run: `npm run typecheck`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add src/components/SmartRootRedirect/SmartRootRedirect.tsx
git commit -m "feat: add SmartRootRedirect component"
```

---

### Task 4: Integrate `<SmartRootRedirect>` into routes

**Files:**

- Modify: `src/routes.tsx:1-190`

- [ ] **Step 1: Add import for SmartRootRedirect**

Add this import at the top of `src/routes.tsx` (after the existing imports):

```typescript
import SmartRootRedirect from './components/SmartRootRedirect/SmartRootRedirect';
```

- [ ] **Step 2: Wrap Overview route with SmartRootRedirect**

Find this section in `src/routes.tsx` (around line 180-190):

```typescript
{
	index: true,
	id: 'overview',
	element: (
		<I18nNamespaceLoader>
			<Suspense fallback={<SuspenseFallback />}>
				<OverviewDashboardPage />
			</Suspense>
		</I18nNamespaceLoader>
	),
},
```

Replace it with:

```typescript
{
	index: true,
	id: 'overview',
	element: (
		<SmartRootRedirect>
			<I18nNamespaceLoader>
				<Suspense fallback={<SuspenseFallback />}>
					<OverviewDashboardPage />
				</Suspense>
			</I18nNamespaceLoader>
		</SmartRootRedirect>
	),
},
```

- [ ] **Step 3: Run typecheck**

Run: `npm run typecheck`
Expected: No errors

- [ ] **Step 4: Run lint**

Run: `npm run lint`
Expected: No errors

- [ ] **Step 5: Commit**

```bash
git add src/routes.tsx
git commit -m "feat: integrate SmartRootRedirect into routes"
```

---

### Task 5: Manual testing

- [ ] **Step 1: Start dev server**

Run: `npm run dev`

- [ ] **Step 2: Test with user having DASHBOARD access**

Login with a user who has DASHBOARD module access.
Expected: User lands on Overview page (`/`)

- [ ] **Step 3: Test with user having only CAMPAIGNS access**

Login with a user who has only CAMPAIGNS module access (no DASHBOARD).
Expected: User is redirected to `/campaigns`

- [ ] **Step 4: Test with user having CONVERSATIONS + KNOWLEDGE_BASES access**

Login with a user who has CONVERSATIONS and KNOWLEDGE_BASES but no DASHBOARD.
Expected: User is redirected to `/conversations` (higher priority)

- [ ] **Step 5: Test client switch scenario**

Login as a user with DASHBOARD access, then switch to a client where they don't have DASHBOARD access.
Expected: User is redirected to their best accessible module

- [ ] **Step 6: Verify no flash on redirect**

Login with a user without DASHBOARD access.
Expected: Redirect happens instantly, no visible flash of Overview page

- [ ] **Step 7: Run full test suite**

Run: `npm test`
Expected: All tests pass

- [ ] **Step 8: Run typecheck and lint**

Run: `npm run typecheck && npm run lint`
Expected: No errors

---

## Implementation Complete

All tasks completed. The smart post-login redirect feature is now active:

- Users with DASHBOARD access land on Overview (`/`)
- Users without DASHBOARD access are redirected to their highest-priority accessible module
- No changes needed to LoginForm, RouteProtecter, or other auth components
- Single integration point in routes.tsx
