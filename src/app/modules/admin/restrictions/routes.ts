import { createRoute } from "@tanstack/react-router";
import { adminRoute } from "../routes";
import RestrictionsIndex from "./RestrictionsIndex";

export const adminRestrictionsRoute = createRoute({
    getParentRoute: () => adminRoute,
    path: "restrictions",
});
export const adminRestrictionsIndexRoute = createRoute({
    getParentRoute: () => adminRestrictionsRoute,
    path: "/",
    component: RestrictionsIndex,
});