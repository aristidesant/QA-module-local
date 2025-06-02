import { createCookieSessionStorage } from "react-router";

type SessionData = {
  userId: string;
  clientId: string;
  email: string;
  accessToken: string;
};

type SessionFlashData = {
  error: string;
  success: string;
};

const { getSession, commitSession, destroySession } =
  createCookieSessionStorage<SessionData, SessionFlashData>({
    cookie: {
      name: "__session",
      httpOnly: true,
      maxAge: 60 * 30, // 30 minutes in seconds
      path: "/",
      sameSite: "lax",
      secrets: ["b7f8c2e1-4a3d-4e2b-9c6f-2d1a7e8f5b9c"],
      secure: true,
    },
  });

async function getTokenFromServer(request?: Request): Promise<string | null> {
  if (request) {
    try {
      const session = await getSession(request.headers.get("Cookie"));
      const sessionToken = session.get("accessToken");
      if (sessionToken) {
        return sessionToken;
      }
    } catch (error) {
      // Ignore errors and fallback to next method
    }
  }

  // Try to get token from localStorage (client-side)
  if (
    typeof window !== "undefined" &&
    typeof window.localStorage !== "undefined"
  ) {
    const localToken = window.localStorage.getItem("accessToken");
    if (localToken) {
      return localToken;
    }
  }

  // If no token found, return null
  return null;
}

export { getSession, commitSession, destroySession, getTokenFromServer };
