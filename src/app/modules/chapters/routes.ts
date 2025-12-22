import { createRoute } from "@tanstack/react-router";
import { bookDetailsRoute } from "../books/routes";
import CreateChapter from "./CreateChapter";
import EditChapter from "./EditChapter";

export const chaptersRoute = createRoute({
    getParentRoute: () => bookDetailsRoute,
    path: "chapters",
});

export const createChaptersRoute = createRoute({
    getParentRoute: () => chaptersRoute,
    path: "create",
    component: CreateChapter,
});

export const editChaptersRoute = createRoute({
    getParentRoute: () => chaptersRoute,
    path: "$chapterId",
    component: EditChapter,
});