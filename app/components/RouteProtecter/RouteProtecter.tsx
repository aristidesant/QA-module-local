import type { Route } from "./+types/RouteProtecter";
import { getSession } from "~/server-session";
import {
  Outlet,
  useLoaderData,
  Navigate,
  useLocation,
  useOutletContext,
} from "react-router";
import { ModalsProvider } from "@mantine/modals";

type TokenType = {
  token: string;
};

// Server loader to check session
export async function loader({ request }: Route.LoaderArgs) {
  const session = await getSession(request.headers.get("Cookie"));
  const token = session.get("accessToken");

  return { token };
}

export const RouteProtecter = () => {
  const { token } = useLoaderData<typeof loader>();
  const path = useLocation().pathname;
  if (!token && path !== "/login") {
    return <Navigate to="/login" replace />;
  }
  if (token && path === "/login") {
    return <Navigate to="/" replace />;
  }
  return (
    <ModalsProvider modalProps={{ withinPortal: false }}>
      <Outlet context={{ token }} />
    </ModalsProvider>
  );
};

export const useToken = () => {
  const token = useLoaderData<typeof loader>();
  const tokenContext = useOutletContext<TokenType>();
  return { token: tokenContext?.token || token.token };
};

export default RouteProtecter;
