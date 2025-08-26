import { Outlet, useLoaderData, Navigate, useLocation } from "react-router";
import { ModalsProvider } from "@mantine/modals";
import userApi from "~/api/userApi";
import { useEffect } from "react";
import { useSessionStore } from "~/stores/sessionStore";
import type { UserModel } from "~/models/UserModels";
import { jwtDecode } from "jwt-decode";
import dayjs from "dayjs";

type LoaderData = {
  token: string | null;
  user: UserModel | null;
};

// Client loader to check session from localStorage and get user data
export async function clientLoader(): Promise<LoaderData> {
  const token =
    typeof window !== "undefined"
      ? window.localStorage.getItem("accessToken")
      : null;
  if (!token) return { token: null, user: null };
  try {
    // Decode token to extract user id, then fetch the user by id
    const decoded: any = jwtDecode(token);

    // Enhance visibility of standard JWT times (issued-at and expiration)
    const toLocalDateTime = (sec: unknown) => {
      const n = typeof sec === "number" ? sec : Number(sec);
      return Number.isFinite(n)
        ? new Date(n * 1000).toLocaleString()
        : undefined;
    };

    const expReadable = toLocalDateTime(decoded?.exp);

    // If the token is expired or exp is missing/invalid, treat as unauthenticated
    // Use dayjs for millisecond-precision comparison
    const now = dayjs();
    const expMillis =
      typeof decoded?.exp === "number"
        ? decoded.exp * 1000
        : Number(decoded?.exp) * 1000;
    if (
      !Number.isFinite(expMillis) ||
      dayjs(expMillis).isBefore(now) ||
      dayjs(expMillis).isSame(now)
    ) {
      console.debug("JWT token expired at", expReadable ?? decoded?.exp);
      return { token: null, user: null };
    }

    const userId: number | undefined =
      decoded?.userId ?? decoded?.sub ?? decoded?.id;

    if (!userId || Number.isNaN(Number(userId))) {
      // If we cannot obtain a valid user id, treat as unauthenticated
      return { token, user: null };
    }

    const user = await userApi({
      Authorization: `Bearer ${token}`,
    }).getUserById(Number(userId));
    return { token, user };
  } catch (error) {
    return { token, user: null };
  }
}

export const RouteProtecter = () => {
  const { token, user } = useLoaderData<typeof clientLoader>();
  const { setUser, setToken } = useSessionStore();
  const path = useLocation().pathname;
  useEffect(() => {
    if (token) {
      setToken(token);
    }
    if (user) {
      setUser(user);
    }
  }, [token, user]);

  // Handle authentication redirects
  if (!token && path !== "/login") {
    return <Navigate to="/login" replace />;
  }

  if (token && path === "/login") {
    return <Navigate to="/" replace />;
  }

  return (
    <ModalsProvider modalProps={{ withinPortal: false }}>
      <Outlet />
    </ModalsProvider>
  );
};

export const useToken = () => {
  const { token, user } = useSessionStore();

  return {
    token,
    user,
  };
};

export default RouteProtecter;
