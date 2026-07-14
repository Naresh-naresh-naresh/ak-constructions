"use client";

import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { clientConfig } from "@/config/client";

export default function AdminTopBar() {
  const { data: session } = useSession();

  return (
    <header className="sticky top-0 z-40 border-b border-stone-200 bg-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/admin" className="font-bold text-stone-900">
          {clientConfig.name} <span className="text-orange-600">Admin</span>
        </Link>
        {session && (
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/admin/login" })}
            className="rounded-full border border-stone-300 px-4 py-1.5 text-sm font-medium text-stone-700 hover:bg-stone-50"
          >
            Logout
          </button>
        )}
      </div>
    </header>
  );
}
