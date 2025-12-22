import { createRoute } from "@tanstack/react-router";
import { indexRoute } from "../dashboard/routes";
import PaymentDetailsIndex from "./PaymentDetailsIndex";

export const paymentDetailsRoute = createRoute({
    getParentRoute: () => indexRoute,
    path: "paymentDetails",
});

export const paymentDetailsIndexRoute = createRoute({
    getParentRoute: () => paymentDetailsRoute,
    path: "/",
    component: PaymentDetailsIndex,
});