import { createRoute } from "@tanstack/react-router";
import { indexRoute } from "../dashboard/routes";
import BooksIndex from "./BooksIndex";
import CreateBook from "./CreateBook";
import BookDetails from "./BookDetails";

export const booksRoute = createRoute({
    getParentRoute: () => indexRoute,
    path: "books",
});

export const booksIndexRoute = createRoute({
    getParentRoute: () => booksRoute,
    path: "/",
    component: BooksIndex,
});

export const createBooksRoute = createRoute({
    getParentRoute: () => booksRoute,
    path: "create",
    component: CreateBook,
});

export const bookDetailsRoute = createRoute({
    getParentRoute: () => booksRoute,
    path: "$bookId",
});

export const bookDetailsIndexRoute = createRoute({
    getParentRoute: () => bookDetailsRoute,
    path: "/",
    component: BookDetails,
});