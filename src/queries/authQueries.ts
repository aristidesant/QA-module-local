import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  authenticate,
  type AuthRequest,
  type AuthSuccessResponse,
} from "~/api/authApi";
import userApi from "~/api/userApi";
import { jwtDecode } from "jwt-decode";
import { useSessionStore } from "~/stores/sessionStore";
import { getErrorMessage } from "~/utils/httpClient";

export type LoginResult = {
  accessToken: string;
};

/**
 * Login mutation: calls /auth/login, stores token, decodes it, and fetches the user.
 * Also primes any relevant user queries in the cache.
 */
export function useLogin() {
  const queryClient = useQueryClient();
  const { setToken, setUser } = useSessionStore.getState();

  return useMutation<LoginResult, Error, AuthRequest>({
    mutationFn: async (payload: AuthRequest) => {
      const res: AuthSuccessResponse = await authenticate(payload);
      if (!res?.accessToken) throw new Error("No access token returned");
      return { accessToken: res.accessToken };
    },
    onSuccess: async ({ accessToken }) => {
      // Persist token
      try {
        window.localStorage.setItem("accessToken", accessToken);
      } catch {}

      // Put token in store
      setToken(accessToken);

      // Decode token for user id
      let userId: number | undefined;
      try {
        const decoded: any = jwtDecode(accessToken);
        userId = decoded?.userId ?? decoded?.sub ?? decoded?.id;
      } catch {
        // If decoding fails, we won't fetch user by id; try /users/me instead
      }

      // Fetch current user (prefer users/me, but keep fallback by id if present)
      try {
        const api = userApi({ Authorization: `Bearer ${accessToken}` });
        const user = userId
          ? await api.getUserById(Number(userId))
          : await api.getCurrentUser();
        setUser(user);
        queryClient.setQueryData(["currentUser"], user);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.warn("Failed to fetch user after login:", getErrorMessage(err));
      }
    },
  });
}

export function logoutClientSide() {
  try {
    window.localStorage.removeItem("accessToken");
  } catch {}
  const { setToken, setUser } = useSessionStore.getState();
  setToken(null);
  setUser(null);
}
