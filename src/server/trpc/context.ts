//import { getUser } from "@astro-auth/core";
import type { users } from "@prisma/client";
import { authOpts } from "@server/authOpts";
import { p } from "@server/db";
import type { inferAsyncReturnType } from "@trpc/server";
import type { APIContext } from "astro";
import { getSession } from "auth-astro"


type Session = {
  user: users | null;
};

type CreateContextOptions = {
  session: Session | null;
};

export const createContextInner = async (opts: CreateContextOptions) => {
  return {
    session: opts.session,
  };
};

export const createContext = (apiContext: APIContext) => async () => {
  const jwt = await getSession(apiContext.request, authOpts)
  const user = await p.users.findUnique({ where: { email: jwt?.user?.email ?? "" } });
  const session = { user: user };
  return await createContextInner({
    session,
  });
};

export type Context = inferAsyncReturnType<inferAsyncReturnType<typeof createContext>>;
