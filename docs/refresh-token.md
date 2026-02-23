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
