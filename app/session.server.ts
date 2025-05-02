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
      secrets: ["your-secret-here"],
      secure: true,
    },
  });

export { getSession, commitSession, destroySession };
