import { createRoute } from "@tanstack/react-router";
import { indexRoute } from "../dashboard/routes";
import MonthlyEarningsIndex from "./MonthlyEarningsIndex";

export const monthlyEarningsRoute = createRoute({
    getParentRoute: () => indexRoute,
    path: "monthlyEarnings",
});

export const monthlyEarningsIndexRoute = createRoute({
    getParentRoute: () => monthlyEarningsRoute,
    path: "/",
    component: MonthlyEarningsIndex,
});