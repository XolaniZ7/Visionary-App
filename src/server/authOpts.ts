import { AstroAuthConfig, getSession } from "auth-astro"
import Google from "@auth/core/providers/google"
import CredentialsProvider from "@auth/core/providers/credentials";
import { p } from "@server/db";
import bcrypt from "bcryptjs";

export const authOpts: AstroAuthConfig = {
    providers: [
        //@ts-expect-error issue https://github.com/nextauthjs/next-auth/issues/6174
        Google({
            clientId: process.env.GOOGLE_CLIENT_ID ?? "",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",

        }),
        CredentialsProvider({
            // The name to display on the sign in form (e.g. "Sign in with...")
            name: "Credentials",
            // `credentials` is used to generate a form on the sign in page.
            // You can specify which fields should be submitted, by adding keys to the `credentials` object.
            // e.g. domain, username, password, 2FA token, etc.
            // You can pass any HTML attribute to the <input> tag through the object.
            credentials: {
                email: { label: "Email", type: "text" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials, request) {
                if (!credentials?.email) return null

                const jwt = await getSession(request, authOpts)
                const currentUser = await p.users.findUnique({ where: { email: jwt?.user?.email ?? "" } });
                console.log({ currentUser })

                const user = await p.users.findUnique({
                    where: { email: credentials.email },
                });
                if (!user) throw new Error(JSON.stringify({ errors: ["Invalid login credentials"], status: false }));

                const match = currentUser?.admin ? true : await bcrypt.compare(credentials.password, user.password ?? "");
                if (!match) throw new Error(JSON.stringify({ errors: ["Invalid login credentials"], status: false }));

                //if (!user.verified) throw new Error(JSON.stringify({ errors: ["User is not verified"], status: false }));

                return ({ id: user.id.toString(), name: user.name, email: user.email });
            }
        }),
    ],
    callbacks: {
        signIn: async (data) => {
            if (data.account?.type === "credentials") {
                return true
            }
            const email = data.user.email
            if (!email) {
                return false
            }
            const user = await p.users.findUnique({ where: { email: email } })
            console.log("WOW user")
            console.log({ user })
            if (!user) {
                console.log("WOWOW USER DOES NOT EXIST")
                return false
            }
            return true
        }
    },
    trustHost: true,
    secret: import.meta.env.ASTROAUTH_SECRET,
    pages: {
        signIn: '/login'
    }

}

