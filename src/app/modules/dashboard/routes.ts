import { Outlet, createRootRoute, createRoute } from "@tanstack/react-router";
import Layout from "src/app/layout/Layout";
import Dashboard from "./DashboardIndex";

export const rootRoute = createRootRoute({
  component: Outlet,
});

export const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/app",
  component: Layout,
});

export const dashboardRoute = createRoute({
  getParentRoute: () => indexRoute,
  path: "/",
  component: Dashboard,
});