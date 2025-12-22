import { createRoute } from "@tanstack/react-router";
import { indexRoute } from "../dashboard/routes";

export const adminRoute = createRoute({
    getParentRoute: () => indexRoute,
    path: "admin",
});