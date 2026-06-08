# Smart Post-Login Redirect Design

**Date:** 2026-06-08  
**Status:** Approved

## Overview

Implement intelligent post-login routing that directs users to the most appropriate landing page based on their module permissions. Users with DASHBOARD access land on Overview (`/`), while users without dashboard access are redirected to their highest-priority accessible module.

## Problem Statement

Currently, all authenticated users navigate to `/` (Overview/Dashboard) after login, regardless of their permissions. Users without DASHBOARD access see an access-denied state or empty dashboard, creating confusion and requiring manual navigation.

## Requirements

1. **Login redirect**: After successful authentication (including OTP, client selection, force password change), redirect users to their optimal landing page
2. **Root route guard**: If a user navigates to `/` but lacks DASHBOARD access, redirect them to their best accessible module
3. **Priority-based selection**: When user has multiple accessible modules but no dashboard, use a fixed priority order
4. **No perceptible flash**: Redirects should be instant, no loading states visible to user

## Design: Approach A — Shared Hook + SmartRedirect Component

### Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    computeLandingPath()                     │
│              (Pure function in utils/)                      │
│                                                             │
│  Input: permissionMap                                       │
│  Output: landing path string                                │
│                                                             │
│  Logic:                                                     │
│  1. If DASHBOARD accessible → return '/'                    │
│  2. Else iterate priority list, return first accessible     │
│  3. Fallback: '/'                                           │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    useLandingPath()                         │
│              (Hook in hooks/)                               │
│                                                             │
│  Wraps computeLandingPath with usePermissions()             │
│  Returns computed path for current user                     │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│              <SmartRootRedirect>                            │
│              (Component in components/)                     │
│                                                             │
│  Placed inside '/' route                                    │
│  On mount:                                                  │
│  - Call useLandingPath()                                    │
│  - If result !== '/' → <Navigate to={result} replace />     │
│  - If result === '/' → render children (Overview)           │
└─────────────────────────────────────────────────────────────┘
```

### Module Priority Order

When user lacks DASHBOARD access, redirect to the first accessible module in this order:

| Priority | Module          | Route                  | Rationale                                     |
| -------- | --------------- | ---------------------- | --------------------------------------------- |
| 1        | CAMPAIGNS       | `/campaigns`           | Primary business entity, most common workflow |
| 2        | CONVERSATIONS   | `/conversations`       | Active engagement, time-sensitive             |
| 3        | KNOWLEDGE_BASES | `/knowledge-bases`     | Reference content, agent support              |
| 4        | REPORTS         | `/report-templates`    | Analytics, performance review                 |
| 5        | SETTINGS        | `/campaign-management` | Configuration, operational setup              |
| 6        | USERS           | `/users`               | Admin: user management                        |
| 7        | ROLES           | `/roles`               | Admin: role management                        |
| 8        | BILLING         | `/billing/invoices`    | Admin: billing/invoices                       |
| 9        | TOOLS           | `/tools`               | Admin: tool management                        |

### Integration Points

| File                                                     | Change Type | Description                                                  |
| -------------------------------------------------------- | ----------- | ------------------------------------------------------------ |
| `src/utils/computeLandingPath.ts`                        | **New**     | Pure function: `computeLandingPath(permissionMap): string`   |
| `src/hooks/useLandingPath.ts`                            | **New**     | Hook: `useLandingPath(): string`                             |
| `src/components/SmartRootRedirect/SmartRootRedirect.tsx` | **New**     | Component that wraps Overview route                          |
| `src/routes.tsx`                                         | **Modify**  | Wrap `/` route's Overview element with `<SmartRootRedirect>` |

### Why Not Change LoginForm?

After login, the permission map isn't loaded yet — it comes from `RouteProtecter`'s `/users/me` fetch. So:

- LoginForm keeps `navigate('/')` (no changes needed)
- `<SmartRootRedirect>` handles the redirect once permissions are available
- The client-side `<Navigate>` is instant, no perceptible flash

### Edge Cases

1. **User has only 1 module access**: Redirects to that module's route
2. **User has multiple modules but no dashboard**: Redirects to highest-priority accessible module
3. **User has no module access at all**: Falls back to `/` (shouldn't happen for authenticated users; RouteProtecter would catch this)
4. **User has DASHBOARD + other modules**: Lands on `/` (dashboard)
5. **Client switch**: After switching clients, permissions may change. `SmartRootRedirect` re-evaluates on mount, so user lands correctly.

### Testing Strategy

- **Unit test**: `computeLandingPath()` with various permission maps
  - User with DASHBOARD → returns `/`
  - User with only CAMPAIGNS → returns `/campaigns`
  - User with CONVERSATIONS + KNOWLEDGE_BASES → returns `/conversations`
  - User with no modules → returns `/` (fallback)
- **Integration test**: `<SmartRootRedirect>` renders Overview or redirects based on permissions
- **Manual test**: Login with users having different permission sets, verify landing pages

## Implementation Order

1. Create `src/utils/computeLandingPath.ts` with unit tests
2. Create `src/hooks/useLandingPath.ts`
3. Create `src/components/SmartRootRedirect/SmartRootRedirect.tsx`
4. Update `src/routes.tsx` to wrap Overview route
5. Manual testing with different user permission sets

## Future Considerations

- **Customizable priority**: Allow admins to configure module priority per client
- **Last-visited memory**: Remember user's last landing page and prefer it on next login
- **Role-based defaults**: Different roles could have different default landing pages
