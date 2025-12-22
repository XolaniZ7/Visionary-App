import { AstroAuth } from "auth-astro"
import { authOpts } from "@server/authOpts";

export const { get, post } = AstroAuth(authOpts);