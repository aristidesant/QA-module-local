import type { Route } from "./+types/RouteProtecter";
import { getSession } from "~/server-session";
import {
  Outlet,
  useLoaderData,
  Navigate,
  useLocation,
  useOutletContext,
} from "react-router";

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
  return <Outlet context={{ token }} />;
};

export const useToken = () => {
  const token = useOutletContext<TokenType>();
  console.log("Outlet context:", token);
  return token;
};

export default RouteProtecter;
