// Centralized logout utility: clears local auth data and redirects to login
import { useSessionStore } from "~/stores/sessionStore";

/**
 * Clears auth-related client state and redirects to the login page.
 * Safe no-op on server.
 */
export function logout(redirectTo: string = "/login") {
  if (typeof window === "undefined") return;

  try {
    // Clear token from localStorage
    window.localStorage.removeItem("accessToken");
  } catch {
    // ignore storage errors
  }

  try {
    // Reset in-memory session state
    const { setUser, setToken } = useSessionStore.getState();
    setUser(null);
    setToken(null);
  } catch {
    // ignore store errors
  }

  // Replace current history entry with login
  window.location.replace(redirectTo);
}

export default logout;
