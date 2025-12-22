import { createRoute } from "@tanstack/react-router";
import { adminRoute } from "../routes";
import UsersIndex from "./UsersIndex";

export const adminUsersRoute = createRoute({
    getParentRoute: () => adminRoute,
    path: "users",
});
export const adminUsersIndexRoute = createRoute({
    getParentRoute: () => adminUsersRoute,
    path: "/",
    component: UsersIndex,
});