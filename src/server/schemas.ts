import { z } from "zod";

export const jwtSchema = z.object({
  id: z.number(),
  email: z.string(),
});
export type Jwt = z.infer<typeof jwtSchema>;
