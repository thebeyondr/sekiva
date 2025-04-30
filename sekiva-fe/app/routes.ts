import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("organizations", "routes/organizations/index.tsx"),
  route("organizations/new", "routes/organizations/new.tsx"),
] satisfies RouteConfig;
