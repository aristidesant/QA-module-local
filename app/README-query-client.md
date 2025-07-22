# TanStack Query Client with 401 Error Handling

This project uses a custom-configured TanStack Query client that automatically handles 401 Unauthorized errors by redirecting users to the logout page.

## Features

- ✅ **Automatic 401 Error Detection**: Any query or mutation receiving a 401 response triggers an automatic logout redirect
- ✅ **Smart Retry Logic**: Retries server errors (5xx) but not client errors (4xx) to avoid unnecessary requests
- ✅ **Exponential Backoff**: Implements exponential backoff for retries with a maximum delay of 30 seconds
- ✅ **Optimized Caching**: 5-minute stale time and 10-minute garbage collection for optimal performance
- ✅ **Global Error Handling**: Consistent error handling across all queries and mutations
- ✅ **TypeScript Support**: Full type safety with proper error typing

## Setup

The query client is automatically configured and provided in `app/root.tsx`:

```tsx
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./queryClient";

// In your root component
<QueryClientProvider client={queryClient}>
  {/* Your app components */}
</QueryClientProvider>;
```

## Usage

### Basic Query Usage

```tsx
import { useQuery } from "@tanstack/react-query";
import { createAuthenticatedHttpClient } from "~/utils/httpClient";
import { useSessionStore } from "~/stores/sessionStore";

export function useUserProfile() {
  const { token } = useSessionStore();

  return useQuery({
    queryKey: ["user", "profile"],
    queryFn: async () => {
      const client = createAuthenticatedHttpClient(token);
      const response = await client.get("/users/me");
      return response.data;
    },
    enabled: !!token,
  });
}
```

### Basic Mutation Usage

```tsx
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createAuthenticatedHttpClient,
  getErrorMessage,
} from "~/utils/httpClient";
import { useSessionStore } from "~/stores/sessionStore";

export function useUpdateProfile() {
  const { token } = useSessionStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userData) => {
      const client = createAuthenticatedHttpClient(token);
      const response = await client.patch("/users/me", userData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user", "profile"] });
    },
    onError: (error) => {
      console.error("Update failed:", getErrorMessage(error));
    },
  });
}
```

### Error Handling

The system provides multiple layers of error handling:

1. **HTTP Client Level** (`app/utils/httpClient.ts`): Axios interceptors catch 401 responses and redirect to logout
2. **Query Client Level** (`app/queryClient.ts`): Global error handlers catch any 401 errors that reach TanStack Query
3. **Component Level**: Use `getErrorMessage()` utility for user-friendly error messages

```tsx
import { getErrorMessage } from "~/utils/httpClient";

function MyComponent() {
  const query = useQuery({
    /* ... */
  });

  if (query.isError) {
    const errorMessage = getErrorMessage(query.error);
    return <div>Error: {errorMessage}</div>;
  }

  // ...
}
```

## Configuration Details

### Retry Logic

```tsx
retry: (failureCount: number, error: any) => {
  // Never retry 401 errors (handled by redirect)
  if (error?.response?.status === 401) return false;

  // Don't retry other 4xx client errors
  if (error?.response?.status >= 400 && error?.response?.status < 500)
    return false;

  // Retry up to 3 times for 5xx server errors and network issues
  return failureCount < 3;
};
```

### Cache Settings

- **Stale Time**: 5 minutes - How long data is considered fresh
- **Garbage Collection**: 10 minutes - How long inactive data stays in cache
- **Refetch Settings**: Enabled for window focus, reconnect, and mount

### Authentication Flow

1. User makes an authenticated request
2. If the response is 401:
   - HTTP client interceptor catches it and redirects to `/logout`
   - Query client error handler provides backup coverage
   - User session is cleared via the logout route
3. If the response is successful, data is cached normally
4. If the response is a different error (5xx, network), retry logic applies

## Migrating Existing Code

### From Individual Axios Instances

**Before:**

```tsx
const client = axios.create({
  baseURL: API_URL,
  headers: { Authorization: `Bearer ${token}` },
});
```

**After:**

```tsx
import { createAuthenticatedHttpClient } from "~/utils/httpClient";
const client = createAuthenticatedHttpClient(token);
```

### From Manual Error Handling

**Before:**

```tsx
try {
  const response = await api.getUser();
  return response.data;
} catch (error) {
  if (error.response?.status === 401) {
    // Manual logout logic
    window.location.href = "/login";
  }
  throw error;
}
```

**After:**

```tsx
// 401 handling is automatic, just focus on the happy path
const response = await client.get("/user");
return response.data;
```

## Files

- `app/queryClient.ts` - Main query client configuration
- `app/utils/httpClient.ts` - HTTP client utilities with automatic 401 handling
- `app/examples/queryClientUsage.tsx` - Usage examples and best practices
- `app/root.tsx` - Query client provider setup

## Testing

The 401 error handling can be tested by:

1. Making an authenticated request
2. Receiving a 401 response from the server
3. Verifying the user is redirected to `/logout`
4. Confirming the session is cleared

## Best Practices

1. **Always use the provided HTTP client utilities** instead of creating raw Axios instances
2. **Use the `getErrorMessage()` utility** for consistent error message display
3. **Handle loading states** in your components for better UX
4. **Use query keys consistently** for proper caching and invalidation
5. **Enable queries conditionally** when authentication is required (`enabled: !!token`)

## Troubleshooting

### 401 Redirect Not Working

- Check that the error has the expected structure (`error.response.status === 401`)
- Verify the code is running in the browser (`typeof window !== 'undefined'`)
- Ensure the logout route (`/logout`) is properly configured

### Infinite Retry Loops

- Verify that 401 errors are not being retried in the retry configuration
- Check that your API is returning proper HTTP status codes

### Cache Issues

- Use React Query DevTools to inspect cache state
- Verify query keys are consistent across components
- Check that `invalidateQueries` is called after mutations when needed
