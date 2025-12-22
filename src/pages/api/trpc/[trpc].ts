import { createContext } from "../../../server/trpc/context";
import { appRouter } from "@server/trpc/router";
import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import type { APIRoute } from "astro";

export const all: APIRoute = (ctx) => {
  return fetchRequestHandler({
    req: ctx.request,
    endpoint: '/api/trpc',
    router: appRouter,
    createContext: createContext(ctx)
  });
};