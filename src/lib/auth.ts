import bcrypt from "bcryptjs";
import type { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import {
  getAdminPasswordHash,
  getAdminUsername,
} from "@/lib/admin-credentials";
import { verifyClientPassword } from "@/lib/client-accounts";
import {
  ADMIN_PROVIDER_ID,
  CLIENT_PROVIDER_ID,
  ROLE_BY_PROVIDER,
} from "@/lib/roles";
import { normalizePhone } from "@/lib/utils";

/**
 * Two credential providers share one session cookie, distinguished by a `role`
 * claim. Provider ids are explicit because CredentialsProvider defaults to the
 * id "credentials" — two of them would collide on the same callback URL and only
 * one would ever resolve. The ids are also the callback paths, so changing them
 * means changing the signIn() call sites.
 */
export const authOptions: AuthOptions = {
  secret: process.env["NEXTAUTH_SECRET"],
  session: { strategy: "jwt" },
  // Global (not per-provider). The client login is the common case; middleware
  // owns the per-path redirect decision for /admin.
  pages: { signIn: "/login", error: "/login" },
  providers: [
    CredentialsProvider({
      id: ADMIN_PROVIDER_ID,
      name: "Admin Login",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // These getters .trim() to guard against a stray leading/trailing space
        // or newline picked up when pasting values into a hosting dashboard.
        const adminUsername = getAdminUsername();
        const adminPasswordHash = getAdminPasswordHash();

        // Deliberately throws: this is a misconfiguration signal, not a
        // credential outcome, and it should be loudly visible to the operator.
        if (!adminUsername || !adminPasswordHash) {
          throw new Error(
            "Admin login is not configured. Set ADMIN_USERNAME and ADMIN_PASSWORD_HASH_B64 (or ADMIN_PASSWORD_HASH)."
          );
        }

        if (!credentials?.username || !credentials?.password) return null;

        const usernameMatches = credentials.username.trim() === adminUsername;
        const passwordMatches = await bcrypt.compare(
          credentials.password,
          adminPasswordHash
        );

        if (!usernameMatches || !passwordMatches) return null;

        return { id: "admin", name: adminUsername, role: "admin" as const };
      },
    }),

    CredentialsProvider({
      id: CLIENT_PROVIDER_ID,
      name: "Client Login",
      credentials: {
        phone: { label: "Mobile number", type: "tel" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.phone || !credentials?.password) return null;

        // Identity comes from the normalized value we look up, never the raw
        // submitted string, so an odd input can't become the session's phone.
        const phone = normalizePhone(credentials.phone);
        if (phone.length !== 10) return null;

        const result = await verifyClientPassword(phone, credentials.password);

        if (!result.ok) {
          // Throwing surfaces this message to the browser, which does confirm
          // the account exists. Accepted deliberately: the client caused the
          // lockout themselves and needs to know why login stopped working,
          // and phone numbers are not secret in this product.
          if (result.reason === "locked") {
            throw new Error(
              "Too many failed attempts. Please try again in about 15 minutes."
            );
          }
          // Every other failure is generic — the browser only sees
          // "CredentialsSignin", so wrong-password and unknown-number look alike.
          return null;
        }

        return { id: phone, name: phone, phone, role: "client" as const };
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user, account }) {
      // Only populated on initial sign-in. account.provider is set by NextAuth
      // itself, which makes it a safer source of truth than the authorize()
      // return value: a bug in one provider can't mint the wrong role.
      if (account && user) {
        const role = ROLE_BY_PROVIDER[account.provider];
        // Unknown provider -> role-less token -> denied by every check.
        if (!role) return {};
        token.role = role;
        if (role === "client") token.phone = user.phone;
      }
      return token;
    },
    async session({ session, token }) {
      // Without this, session.user.role is undefined at runtime even though
      // the TypeScript augmentation compiles fine, and everything 403s.
      if (session.user) {
        session.user.role = token.role;
        session.user.phone = token.phone;
      }
      return session;
    },
  },
};
