import type { Route } from "./+types/RouteProtecter";
import { getSession } from "~/session.server";
import { Outlet, useLoaderData, Navigate, useLocation } from "react-router";

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
  return <Outlet />;
};

export default RouteProtecter;
