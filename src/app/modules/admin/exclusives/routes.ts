import { createRoute } from "@tanstack/react-router";
import { adminRoute } from "../routes";
import ExclusivesIndex from "./ExclusivesIndex";

export const adminExclusivesRoute = createRoute({
    getParentRoute: () => adminRoute,
    path: "exclusives",
});
export const adminExclusivesIndexRoute = createRoute({
    getParentRoute: () => adminExclusivesRoute,
    path: "/",
    component: ExclusivesIndex,
});

