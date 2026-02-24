# Refresh Token Implementation

## Overview

When a user logs in, the server returns both an `accessToken` (short-lived) and a `refreshToken` (long-lived). Instead of forcing the user to log in again when the access token expires, the app silently exchanges the refresh token for a new pair of tokens behind the scenes.

---

## Flow

```
Request → 401 Unauthorized
        ↓
  Has refreshToken?
  ├── No  → logout() → /login?reason=expired
  └── Yes → POST /auth/refresh { refreshToken }
              ├── Success → update accessToken + refreshToken
              │             → retry original request
              └── Failure → logout() → /login?reason=expired
```

---

## Token Storage

Both tokens are stored in `sessionStorage` (cleared when the browser tab is closed).

| Key            | Value             | Set by                           |
| -------------- | ----------------- | -------------------------------- |
| `accessToken`  | JWT (short-lived) | `sessionStore.setToken()`        |
| `refreshToken` | Opaque token      | `sessionStore.setRefreshToken()` |

---

## Proactive Session Expiration Warning

In addition to the silent reactive refresh (on 401), the app proactively warns the user when their session is about to expire.

### Behavior

- A background watcher polls the access token every **30 seconds**.
- When the token has **≤ 2 minutes** remaining, a modal is shown:

  > _"Your session is about to expire, please update your session."_

- **Yes** — immediately calls `refreshAccessToken` and updates the store with the new token pair.
- **No** — closes the modal; no refresh is performed.
- If the user clicks **Yes** but the refresh fails, `logout()` is called and the user is redirected to `/login?reason=expired`.
- A ref flag (`isModalOpenRef`) prevents duplicate modals from stacking if the poll fires again before the user responds.

### Flow

```
Every 30s: decode accessToken
         ↓
  remaining ≤ 120s?
  ├── No  → do nothing
  └── Yes → show confirm modal
              ├── Yes → POST /auth/refresh → update tokens
              │         └── Failure → logout() → /login?reason=expired
              └── No  → close modal (session will expire naturally)
```

---

## Files Changed

### `src/api/authApi.ts`

- `MFALoginResponse` now includes an optional `refreshToken?: string` field.
- New `RefreshTokenResponse` interface: `{ accessToken: string; refreshToken: string }`.
- New `refreshAccessToken(refreshToken)` function — calls `POST /auth/refresh` with `{ refreshToken }`.

### `src/stores/sessionStore.ts`

- New `refreshToken: string | null` state field.
- New `setRefreshToken(token)` action — persists to `sessionStorage['refreshToken']`.

### `src/queries/authQueries.ts`

- `completeLoginFlow()` accepts an optional `refreshToken` parameter and stores it via `setRefreshToken`.
- `useLogin` passes `data.refreshToken` from the login response to `completeLoginFlow`.

### `src/utils/axiosInterceptor.ts`

- The 401 response handler now attempts a token refresh before logging out.
- A **concurrency queue** (`isRefreshing` flag + `pendingQueue`) ensures that if multiple requests fail with 401 simultaneously, only one refresh call is made. All queued requests are retried once the refresh settles.
- `/auth/refresh` is added to the auth endpoint skip-list to prevent infinite refresh loops.

### `src/utils/logout.ts`

- `sessionStorage.removeItem('refreshToken')` is called alongside `accessToken` removal on logout.

### `src/hooks/useSessionExpirationWatcher.tsx` _(new)_

- Polls every 30 seconds using `setInterval`.
- Decodes the access token with `jwt-decode` to compute remaining seconds.
- Opens a Mantine `openConfirmModal` when ≤ 120 seconds remain.
- On confirm: calls `refreshAccessToken`, then updates `sessionStore` via `setToken` / `setRefreshToken`.
- On cancel: closes the modal with no side effects.
- Uses a `useRef` guard to prevent duplicate modals.

### `src/components/RouteProtecter/RouteProtecter.tsx`

- Calls `useSessionExpirationWatcher()` to activate the proactive warning for all authenticated routes.

### `src/locales/en/common.json` · `src/locales/es/common.json`

- Added `sessionExpiration` key group: `title`, `message`, `confirm`, `cancel`.

---

## Concurrency Guard

Multiple API calls may fail with 401 at the same time (e.g., parallel requests on page load). Without a guard, each would independently call `POST /auth/refresh`, causing race conditions.

The interceptor handles this with a simple queue:

1. First 401 sets `isRefreshing = true` and starts the refresh call.
2. Subsequent 401s see `isRefreshing = true` and add themselves to `pendingQueue`.
3. When the refresh resolves, `processQueue()` retries all queued requests with the new token.
4. If the refresh fails, all queued requests are rejected and the user is logged out.

---

## API Contract

**Request**

```
POST /auth/refresh
Content-Type: application/json

{ "refreshToken": "<token>" }
```

**Response**

```json
{
	"accessToken": "<new-jwt>",
	"refreshToken": "<new-refresh-token>"
}
```

> Both tokens are rotated on each refresh. The old refresh token is invalidated immediately after use.
