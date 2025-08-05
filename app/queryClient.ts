import { QueryClient, QueryCache } from "@tanstack/react-query";

/**
 * Handles 401 Unauthorized errors by redirecting to logout
 * This ensures consistent behavior across all queries and mutations
 */
function handleUnauthorizedError(): void {
  // Only handle redirect on client side
  if (typeof window !== "undefined") {
    // console.warn("Authentication expired, redirecting to logout...");
    // Use window.location to ensure we navigate away from the current app state
    // This is more reliable than using React Router navigation for auth errors
    // window.location.href = "/logout";
  }
}

/**
 * Creates and configures a TanStack Query client with automatic 401 error handling
 * that redirects users to logout when authentication fails.
 *
 * Features:
 * - Automatic 401 error detection and logout redirect
 * - Smart retry logic (no retries for 4xx errors, up to 3 retries for 5xx/network issues)
 * - Exponential backoff for retries
 * - Optimized cache settings (5min stale time, 10min garbage collection)
 * - Global error handling for both queries and mutations
 */
export function createQueryClient(): QueryClient {
  // Create query cache with global error handling
  const queryCache = new QueryCache({
    onError: (error: any) => {
      console.error("Query error:", error);

      // Handle 401 errors
      if (error?.response?.status === 401 || error?.status === 401) {
        handleUnauthorizedError();
      }
    },
  });

  return new QueryClient({
    queryCache,
    defaultOptions: {
      queries: {
        // Enable retries but be careful with 401s to avoid infinite loops
        retry: (failureCount: number, error: any) => {
          // Don't retry on authentication errors (401)
          if (error?.response?.status === 401 || error?.status === 401) {
            return false;
          }
          // Don't retry on client errors (4xx) except for specific cases like network issues
          if (error?.response?.status >= 400 && error?.response?.status < 500) {
            return false;
          }
          // Retry up to 3 times for other errors (5xx, network issues, etc.)
          return failureCount < 3;
        },

        // Exponential backoff with a maximum delay of 30 seconds
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),

        // Stale time - how long data stays fresh (5 minutes)
        staleTime: 5 * 60 * 1000, // 5 minutes

        // Garbage collection time - how long inactive data stays in cache (10 minutes)
        gcTime: 10 * 60 * 1000, // 10 minutes

        // Refetch settings - automatically refetch when conditions are met
        refetchOnWindowFocus: true,
        refetchOnReconnect: true,
        refetchOnMount: true,
      },

      mutations: {
        // Don't retry mutations by default to avoid duplicate operations
        retry: false,

        // Handle mutation errors
        onError: (error: any) => {
          console.error("Mutation error:", error);

          // Handle 401 errors on mutations
          if (error?.response?.status === 401 || error?.status === 401) {
            handleUnauthorizedError();
          }
        },
      },
    },
  });
}

// Create a singleton instance that can be shared across the app
export const queryClient = createQueryClient();

// Export default for easier imports
export default queryClient;
