import bcrypt from "bcryptjs";
import type { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions: AuthOptions = {
  session: { strategy: "jwt" },
  pages: { signIn: "/admin/login" },
  providers: [
    CredentialsProvider({
      name: "Admin Login",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const adminUsername = process.env.ADMIN_USERNAME;
        const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH;

        if (!adminUsername || !adminPasswordHash) {
          throw new Error(
            "Admin login is not configured. Set ADMIN_USERNAME and ADMIN_PASSWORD_HASH."
          );
        }

        if (!credentials?.username || !credentials?.password) return null;

        const usernameMatches = credentials.username === adminUsername;
        const passwordMatches = await bcrypt.compare(
          credentials.password,
          adminPasswordHash
        );

        if (!usernameMatches || !passwordMatches) return null;

        return { id: "admin", name: adminUsername };
      },
    }),
  ],
};
