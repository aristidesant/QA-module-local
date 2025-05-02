import {
  type RouteConfig,
  index,
  layout,
  route,
} from "@react-router/dev/routes";

export default [
  layout("components/RouteProtecter/RouteProtecter.tsx", [
    route("/login", "routes/login.tsx"),
    layout("components/Layout/Layout.tsx", [
      index("routes/home.tsx"),
      route("/agent/:agent_id", "routes/agent_id.tsx"),
      route("/agent", "routes/agents.tsx"),
    ]),
  ]),
] satisfies RouteConfig;
