import type { DefaultSession } from "next-auth";
import type { UserRole } from "@/lib/roles";

/**
 * NextAuth module augmentation.
 *
 * The `import type` lines above are load-bearing: without a top-level import,
 * `declare module` becomes an *ambient* module declaration that SHADOWS the real
 * next-auth types instead of augmenting them.
 *
 * `role` and `phone` are optional on purpose — sessions issued before this
 * feature shipped genuinely lack them, so checks must be written as
 * "must equal the expected role" (fail closed), never "is not the other role".
 *
 * Note these are types only. The `session` callback in src/lib/auth.ts is what
 * actually puts these values on the session at runtime.
 */
declare module "next-auth" {
  interface Session {
    user?: {
      role?: UserRole;
      phone?: string;
    } & DefaultSession["user"];
  }

  interface User {
    role?: UserRole;
    phone?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: UserRole;
    phone?: string;
  }
}
