import { createRoute } from "@tanstack/react-router";
import { adminRoute } from "../routes";
import PayIndex from "./PayIndex";
import PayUser from "./PayUser";
import { z } from "zod";

export const adminPayRoute = createRoute({
    getParentRoute: () => adminRoute,
    path: "pay",
});
export const adminPayIndexRoute = createRoute({
    getParentRoute: () => adminPayRoute,
    path: "/",
    component: PayIndex,
});

const adminPayUserRouteSearchSchema = z.object({
    paymentRequestId: z.number().optional(),
})

export const adminPayUserRoute = createRoute({
    getParentRoute: () => adminPayRoute,
    path: "$userId",
    component: PayUser,
    validateSearch: adminPayUserRouteSearchSchema,

});