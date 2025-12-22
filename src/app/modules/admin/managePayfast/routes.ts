import { createRoute } from "@tanstack/react-router";
import { adminRoute } from "../routes";
import ManagePayfastIndex from "./ManagePayfastIndex";

export const adminManagePayfastRoute = createRoute({
    getParentRoute: () => adminRoute,
    path: "manage-payfast",
});
export const adminManagePayfastIndexRoute = createRoute({
    getParentRoute: () => adminManagePayfastRoute,
    path: "/",
    component: ManagePayfastIndex,
});