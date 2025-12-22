import { createRoute } from "@tanstack/react-router";
import { indexRoute } from "../dashboard/routes";
import BankDetailsIndex from "./BankDetailsIndex";

export const bankDetailsRoute = createRoute({
    getParentRoute: () => indexRoute,
    path: "bankDetails",
});

export const bankDetailsIndexRoute = createRoute({
    getParentRoute: () => bankDetailsRoute,
    path: "/",
    component: BankDetailsIndex,
});