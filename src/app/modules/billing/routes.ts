import { createRoute } from "@tanstack/react-router";
import { indexRoute } from "../dashboard/routes";
import BillingIndex from "./BillingIndex";
import { z } from "zod";

export const billingRoute = createRoute({
    getParentRoute: () => indexRoute,
    path: "billing",
});

const billingPageSearchSchema = z.object({
    cancel: z.coerce.boolean().optional(),
    success: z.coerce.boolean().optional(),
})

//type BillingPageSearch = z.infer<typeof billingPageSearchSchema>

export const billingIndexRoute = createRoute({
    getParentRoute: () => billingRoute,
    path: "/",
    component: BillingIndex,
    validateSearch: billingPageSearchSchema,
});