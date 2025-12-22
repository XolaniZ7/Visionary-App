import { createRoute } from "@tanstack/react-router";
import { indexRoute } from "../dashboard/routes";
import CommentsIndex from "./CommentsIndex";

export const commentsRoute = createRoute({
    getParentRoute: () => indexRoute,
    path: "comments",
});

export const commentsIndexRoute = createRoute({
    getParentRoute: () => commentsRoute,
    path: "/",
    component: CommentsIndex,
});