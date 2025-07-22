/**
 * Example usage of the configured TanStack Query client with 401 error handling
 *
 * This example shows how to use the query client that automatically handles
 * 401 errors by redirecting users to logout. The configuration is already
 * applied globally, so all useQuery and useMutation hooks will benefit from
 * the enhanced error handling.
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createAuthenticatedHttpClient,
  getErrorMessage,
} from "~/utils/httpClient";
import { useSessionStore } from "~/stores/sessionStore";

// Example: Using useQuery with automatic 401 handling
export function useUserProfile() {
  const { token } = useSessionStore();

  return useQuery({
    queryKey: ["user", "profile"],
    queryFn: async () => {
      if (!token) {
        throw new Error("No authentication token available");
      }

      const client = createAuthenticatedHttpClient(token);
      const response = await client.get("/users/me");
      return response.data;
    },
    // The query will automatically:
    // - Not retry on 401 errors (handled by global retry logic)
    // - Redirect to logout if 401 is received (handled by global error handler)
    // - Use exponential backoff for other errors
    enabled: !!token, // Only run query if token exists
  });
}

// Example: Using useMutation with automatic 401 handling
export function useUpdateUserProfile() {
  const { token } = useSessionStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userData: { name?: string; email?: string }) => {
      if (!token) {
        throw new Error("No authentication token available");
      }

      const client = createAuthenticatedHttpClient(token);
      const response = await client.patch("/users/me", userData);
      return response.data;
    },
    // The mutation will automatically:
    // - Not retry (configured globally for mutations)
    // - Redirect to logout if 401 is received (handled by global error handler)
    onSuccess: (data) => {
      // Invalidate and refetch user profile
      queryClient.invalidateQueries({ queryKey: ["user", "profile"] });
      console.log("Profile updated successfully:", data);
    },
    onError: (error) => {
      // This will run AFTER the global error handler
      // The global handler already deals with 401s, so this is for other errors
      const errorMessage = getErrorMessage(error);
      console.error("Failed to update profile:", errorMessage);
      // You could show a toast notification here
    },
  });
}

// Example: Custom hook that handles loading and error states
export function useUserData() {
  const profileQuery = useUserProfile();

  return {
    user: profileQuery.data,
    isLoading: profileQuery.isPending,
    isError: profileQuery.isError,
    error: profileQuery.error,
    // Provide a user-friendly error message
    errorMessage: profileQuery.error
      ? getErrorMessage(profileQuery.error)
      : null,
    refetch: profileQuery.refetch,
  };
}

// Example: Component using the enhanced error handling
export function ProfileComponent() {
  const { user, isLoading, isError, errorMessage, refetch } = useUserData();
  const updateProfile = useUpdateUserProfile();

  if (isLoading) {
    return <div>Loading profile...</div>;
  }

  if (isError) {
    return (
      <div>
        <p>Error loading profile: {errorMessage}</p>
        <button onClick={() => refetch()}>Try Again</button>
      </div>
    );
  }

  const handleUpdate = () => {
    updateProfile.mutate({
      name: "Updated Name",
      email: "new@example.com",
    });
  };

  return (
    <div>
      <h2>Profile: {user?.name}</h2>
      <p>Email: {user?.email}</p>
      <button onClick={handleUpdate} disabled={updateProfile.isPending}>
        {updateProfile.isPending ? "Updating..." : "Update Profile"}
      </button>

      {updateProfile.isError && (
        <p style={{ color: "red" }}>
          Update failed: {getErrorMessage(updateProfile.error)}
        </p>
      )}
    </div>
  );
}

/**
 * Key Benefits of This Setup:
 *
 * 1. **Automatic 401 Handling**: Any query or mutation that receives a 401
 *    response will automatically redirect the user to logout, clearing their
 *    session and preventing further unauthorized requests.
 *
 * 2. **Smart Retry Logic**: Network errors and 5xx server errors are retried
 *    with exponential backoff, but 4xx client errors (including 401) are not
 *    retried to avoid unnecessary requests.
 *
 * 3. **Consistent Error Handling**: The `getErrorMessage` utility provides
 *    consistent error message extraction across all components.
 *
 * 4. **Performance Optimized**: The query client uses appropriate stale times
 *    and garbage collection settings to balance data freshness with performance.
 *
 * 5. **TypeScript Support**: Full type safety with proper error typing.
 *
 * 6. **Zero Configuration**: Once set up in root.tsx, all useQuery and useMutation
 *    hooks automatically benefit from the enhanced error handling.
 */
