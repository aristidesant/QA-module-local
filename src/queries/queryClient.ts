import { QueryClient } from '@tanstack/react-query';

/**
 * App-wide query client. Exported so code outside the React tree (and the QA
 * query hooks, which follow this pattern) can invalidate queries against the
 * same instance the provider uses.
 */
export const queryClient = new QueryClient({});
