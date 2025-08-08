import { Outlet, useLoaderData, Navigate, useLocation } from "react-router";
import { ModalsProvider } from "@mantine/modals";
import userApi from "~/api/userApi";
import { useEffect } from "react";
import { useSessionStore } from "~/stores/sessionStore";
import type { UserModel } from "~/models/UserModels";
import { jwtDecode } from "jwt-decode";

type LoaderData = {
  token: string | null;
  user: UserModel | null;
};

type TokenType = {
  token: string;
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
    console.error("Failed to fetch user:", error);
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
