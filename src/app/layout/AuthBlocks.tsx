import { trpc } from "@client/utils";
import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
};

/**
 * This will render children content only if the current user is an admin
 */
export const IsAdmin = ({ children }: Props) => {
  const isAdmin = useIsAdmin();
  if (!isAdmin) return null;
  return <>{children}</>;
};

/**
 * This will render children content only if the current user is not an admin
 */
export const IsNotAdmin = ({ children }: Props) => {
  const isAdmin = useIsAdmin();
  if (isAdmin) return null;
  return <>{children}</>;
};

/**
 * This will render children content only if the current user is an author
 */
export const IsAuthor = ({ children }: Props) => {
  const isAuthor = useIsAuthor();
  if (!isAuthor) return null;
  return <>{children}</>;
};

/**
 * This will render children content only if the current user is a reader
 */
export const IsReader = ({ children }: Props) => {
  const isReader = useIsReader();
  if (!isReader) return null;
  return <>{children}</>;
};

/**
 * Custom Hooks to check roles
 */
const useCurrentUser = () => {
  return trpc.getCurrentUser.useQuery(undefined, {
    staleTime: Infinity,
    cacheTime: Infinity,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
};

export const useIsAdmin = () => {
  const user = useCurrentUser();
  return Boolean(user.data?.admin);
};

export const useIsAuthor = () => {
  const user = useCurrentUser();
  return Boolean(user.data && !user.data.reader);
};

export const useIsReader = () => {
  const user = useCurrentUser();
  return Boolean(user.data?.reader);
};
