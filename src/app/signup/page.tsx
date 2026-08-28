"use client";

import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { clientConfig } from "@/config/client";
import { CLIENT_PROVIDER_ID } from "@/lib/roles";

const PASSWORD_MIN_LENGTH = 10;

export default function ClientSignupPage() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");

    // Client-side checks are UX only — the API re-validates authoritatively.
    if (password !== confirm) {
      setError("The two passwords don't match.");
      return;
    }
    if (password.length < PASSWORD_MIN_LENGTH) {
      setError(`Password must be at least ${PASSWORD_MIN_LENGTH} characters.`);
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/client/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, code, password }),
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setError(data.error || "Could not create your account.");
        setIsSubmitting(false);
        return;
      }

      // Log straight in so the client isn't asked for the same details twice.
      const result = await signIn(CLIENT_PROVIDER_ID, {
        phone,
        password,
        redirect: false,
      });

      if (result?.error) {
        // Account exists but auto-login failed — send them to log in manually.
        router.push("/login");
        return;
      }

      router.push("/track");
      router.refresh();
    } catch {
      setError("Could not create your account right now. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-stone-50 px-4 py-10">
      <div className="w-full max-w-sm rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
        <h1 className="text-xl font-bold text-stone-900">Create Your Account</h1>
        <p className="mt-1 text-sm text-stone-500">
          Use the mobile number and invite code {clientConfig.name} sent you.
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
            <label htmlFor="code" className="text-sm font-semibold text-stone-800">
              Invite code
            </label>
            <input
              id="code"
              type="text"
              required
              placeholder="e.g. 7F2K9MP"
              value={code}
              onChange={(event) => setCode(event.target.value.toUpperCase())}
              className="mt-2 w-full rounded-xl border border-stone-300 px-4 py-3 font-mono tracking-widest outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
            />
          </div>

          <div>
            <label htmlFor="password" className="text-sm font-semibold text-stone-800">
              Create a password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="new-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="mt-2 w-full rounded-xl border border-stone-300 px-4 py-3 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
            />
            <p className="mt-1 text-xs text-stone-400">
              At least {PASSWORD_MIN_LENGTH} characters.
            </p>
          </div>

          <div>
            <label htmlFor="confirm" className="text-sm font-semibold text-stone-800">
              Confirm password
            </label>
            <input
              id="confirm"
              type="password"
              autoComplete="new-password"
              required
              value={confirm}
              onChange={(event) => setConfirm(event.target.value)}
              className="mt-2 w-full rounded-xl border border-stone-300 px-4 py-3 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-full bg-orange-500 py-3 text-base font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-stone-500">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-orange-600 hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
