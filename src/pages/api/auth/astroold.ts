// import AstroAuth from "@astro-auth/core";
// import { CredentialProvider, GoogleProvider } from "@astro-auth/providers";
// import { p } from "@server/db";
// import type { Jwt } from "@server/schemas";
// import bcrypt from "bcryptjs";
// import { z } from "zod";

// export const all = AstroAuth({
//   authProviders: [
//     GoogleProvider({
//       clientId: process.env.GOOGLE_CLIENT_ID ?? "",
//       clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
//     }),
//     CredentialProvider({
//       authorize: async (properties) => {
//         const loginSchema = z.object({ email: z.string().email(), password: z.string() });
//         const loginDetails = loginSchema.parse(properties);

//         const user = await p.users.findUnique({
//           where: { email: properties.email },
//         });
//         if (!user) return false;

//         const match = await bcrypt.compare(loginDetails.password, user.password ?? "");
//         if (!match) return false;

//         return { user: { email: loginDetails.email } };
//       },
//     }),
//   ],
//   hooks: {
//     jwt: async (jwt) => {
//       const userJwt = googleJwtSchema.parse(jwt);
//       const user = await p.users.findUniqueOrThrow({
//         where: { email: userJwt.user.email },
//       });

//       const result: Jwt = { id: user.id, email: user.email };
//       return result;
//     },
//     signIn: async (jwt) => {
//       const userJwt = googleJwtSchema.parse(jwt);
//       const user = await p.users.findUnique({
//         where: { email: userJwt.user.email },
//       });

//       if (!user) {
//         //TODO: Create User if one does not exist
//         return false;
//       }

//       return true;
//     },
//   },
// });

// export const googleJwtSchema = z.object({
//   user: z.object({
//     name: z.string().optional(),
//     email: z.string(),
//     image: z.string().optional(),
//   }),
// });
export default function aa() {
  console.log("")
}