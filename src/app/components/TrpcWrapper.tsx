import { trpc } from "@client/utils";
import { useSnackbar } from "@saas-ui/react";
import { MutationCache, QueryCache, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink } from "@trpc/client";
import type { TRPCErrorResponse } from "@trpc/server/rpc";
import type { ReactNode } from "react";
import superjson from "superjson";
import { z } from "zod";

const zodErrorArraySchema = z.array(
  z.object({
    message: z.string(),
  })
);

type TrpcWrapperProps = {
  children: ReactNode;
};
const TrpcWrapper = ({ children }: TrpcWrapperProps) => {
  const snackbar = useSnackbar();
  const queryClient = new QueryClient({
    queryCache: new QueryCache({
      onError: (error) => {
        if ((error as TRPCErrorResponse["error"]).message) {
          let stringJSON = "";
          try {
            stringJSON = JSON.parse((error as TRPCErrorResponse["error"]).message);
          } catch {
            console.log("parse error");
          }
          const isZod = zodErrorArraySchema.safeParse(stringJSON);

          if (isZod.success) {
            snackbar.error(isZod.data[0].message);
          } else {
            snackbar.error((error as TRPCErrorResponse["error"]).message);
          }
        }
      },
    }),
    mutationCache: new MutationCache({
      onError: (error) => {
        if ((error as TRPCErrorResponse["error"]).message) {
          let stringJSON = "";
          try {
            stringJSON = JSON.parse((error as TRPCErrorResponse["error"]).message);
          } catch {
            console.log("parse error");
          }
          const isZod = zodErrorArraySchema.safeParse(stringJSON);

          if (isZod.success) {
            snackbar.error(isZod.data[0].message);
          } else {
            snackbar.error((error as TRPCErrorResponse["error"]).message);
          }
        }
      },
    }),
  });
  const trpcClient = trpc.createClient({
    transformer: superjson,
    links: [
      httpBatchLink({
        url: "/api/trpc",
      }),
    ],
  });
  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </trpc.Provider>
  );
};

export default TrpcWrapper;
