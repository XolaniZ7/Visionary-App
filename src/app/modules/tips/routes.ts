import { createRoute } from "@tanstack/react-router";
import { indexRoute } from "../dashboard/routes";
import TipsIndex from "./TipsIndex";

export const tipsRoute = createRoute({
    getParentRoute: () => indexRoute,
    path: "tips",
});

export const tipsIndexRoute = createRoute({
    getParentRoute: () => tipsRoute,
    path: "/",
    component: TipsIndex,
});