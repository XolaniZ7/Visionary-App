import { createRoute } from "@tanstack/react-router";
import { indexRoute } from "../dashboard/routes";
import PaymentRequestsIndex from "./PaymentRequestsIndex";

export const paymentRequestsRoute = createRoute({
    getParentRoute: () => indexRoute,
    path: "paymentRequests",
});

export const paymentRequestsIndexRoute = createRoute({
    getParentRoute: () => paymentRequestsRoute,
    path: "/",
    component: PaymentRequestsIndex,
});