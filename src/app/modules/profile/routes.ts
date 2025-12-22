import { createRoute } from "@tanstack/react-router";
import { indexRoute } from "../dashboard/routes";
import ProfileIndex from "./ProfileIndex";

export const profileRoute = createRoute({
    getParentRoute: () => indexRoute,
    path: "profile",
});

export const profileIndexRoute = createRoute({
    getParentRoute: () => profileRoute,
    path: "/",
    component: ProfileIndex,
});