import type { AppRouter } from "@server/trpc/router";
import { createTRPCProxyClient, createTRPCReact, httpBatchLink } from "@trpc/react-query";
import superjson from "superjson";

//use this in react components
export const trpc = createTRPCReact<AppRouter>({
  unstable_overrides: {
    useMutation: {

      /**
       * This function is called whenever a `.useMutation` succeeds
       **/
      async onSuccess(opts) {
        /**
         * @note that order here matters:
         * The order here allows route changes in `onSuccess` without
         * having a flash of content change whilst redirecting.
         **/
        // Calls the `onSuccess` defined in the `useQuery()`-options:
        await opts.originalFn();
        // Invalidate all queries in the react-query cache:
        await opts.queryClient.invalidateQueries();
      },
    },
  }
});

//use this for mutations if you do not want all the data on the page to be automatically refetched
export const manualTrpc = createTRPCReact<AppRouter>();

//use this outside react components like in react-location loaders (which runs before the component renders)
export const vanillaTrpc = createTRPCProxyClient<AppRouter>({
  transformer: superjson,
  links: [
    httpBatchLink({
      url: "/api/trpc",
    }),
  ],

});
