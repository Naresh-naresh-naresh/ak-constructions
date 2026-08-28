"use client";

import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { clientConfig } from "@/config/client";
import { CLIENT_PROVIDER_ID } from "@/lib/roles";

export default function ClientLoginPage() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError("");

    const result = await signIn(CLIENT_PROVIDER_ID, {
      phone,
      password,
      redirect: false,
    });

    setIsSubmitting(false);

    if (result?.error) {
      // NextAuth returns the literal "CredentialsSignin" for a generic failure,
      // and the provider's own message for a lockout.
      setError(
        result.error === "CredentialsSignin"
          ? "Incorrect mobile number or password."
          : result.error
      );
      return;
    }

    router.push("/track");
    router.refresh();
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-stone-50 px-4 py-10">
      <div className="w-full max-w-sm rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
        <h1 className="text-xl font-bold text-stone-900">Client Login</h1>
        <p className="mt-1 text-sm text-stone-500">
          Track your project with {clientConfig.name}.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label htmlFor="phone" className="text-sm font-semibold text-stone-800">
              Mobile number
            </label>
            <input
              id="phone"
              type="tel"
              autoComplete="username"
              required
              placeholder="10-digit mobile"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              className="mt-2 w-full rounded-xl border border-stone-300 px-4 py-3 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
            />
          </div>

          <div>
            <label htmlFor="password" className="text-sm font-semibold text-stone-800">
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="mt-2 w-full rounded-xl border border-stone-300 px-4 py-3 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-full bg-orange-500 py-3 text-base font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-stone-500">
          First time here?{" "}
          <Link href="/signup" className="font-semibold text-orange-600 hover:underline">
            Create your account
          </Link>
        </p>
        <p className="mt-2 text-center text-xs text-stone-400">
          You&apos;ll need the invite code we sent you. Lost it? Message us on
          WhatsApp and we&apos;ll resend it.
        </p>
      </div>
    </div>
  );
}
