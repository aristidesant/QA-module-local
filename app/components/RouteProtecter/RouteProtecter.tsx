import type { Route } from "./+types/RouteProtecter";
import { getSession } from "~/server-session";
import {
  Outlet,
  useLoaderData,
  Navigate,
  useLocation,
  useOutletContext,
  useNavigate,
} from "react-router";
import { ModalsProvider } from "@mantine/modals";
import userApi from "~/api/userApi";
import { useEffect } from "react";
import { useSessionStore } from "~/stores/sessionStore";
import type { UserModel } from "~/models/UserModels";

type LoaderData = {
  token: string | null;
  user: UserModel | null;
};

type TokenType = {
  token: string;
  user: UserModel | null;
};

// Server loader to check session and get user data
export async function loader({
  request,
}: Route.LoaderArgs): Promise<LoaderData> {
  const session = await getSession(request.headers.get("Cookie"));
  const token = session.get("accessToken");
  const userId = session.get("userId");

  if (!token) {
    return { token: null, user: null };
  }

  try {
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
  const { token, user } = useLoaderData<typeof loader>();
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
