import { createRoute } from "@tanstack/react-router";
import { adminRoute } from "../routes";
import EmailIndex from "./EmailIndex";

export const adminEmailRoute = createRoute({
    getParentRoute: () => adminRoute,
    path: "email",
});
export const adminEmailIndexRoute = createRoute({
    getParentRoute: () => adminEmailRoute,
    path: "/",
    component: EmailIndex,
});