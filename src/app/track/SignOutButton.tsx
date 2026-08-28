"use client";

import { signOut } from "next-auth/react";

/**
 * Small client island so the dashboard itself can stay a Server Component.
 * signOut() from next-auth/react works without a SessionProvider.
 */
export default function SignOutButton() {
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: "/login" })}
      className="shrink-0 text-sm font-medium text-stone-500 underline hover:text-orange-600"
    >
      Sign out
    </button>
  );
}
