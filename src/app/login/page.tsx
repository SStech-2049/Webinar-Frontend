"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserSupabase } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("submitting");
    setMessage("");

    const supabase = createBrowserSupabase();
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) {
      setStatus("error");
      setMessage(error.message);
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-2xl border border-brand-ink/10 bg-white p-8 shadow-lg">
        <p className="serif-italic text-base text-brand-pink">She Sells Remote</p>
        <h1 className="text-2xl font-bold uppercase tracking-tight">
          Webinar Dashboard
        </h1>
        <p className="mt-1 text-sm text-brand-ink/50">
          Sign in to view live metrics.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com"
            className="w-full rounded-lg border border-brand-ink/15 bg-brand-cream px-3 py-2 text-sm outline-none transition focus:border-brand-pink"
          />
          <input
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full rounded-lg border border-brand-ink/15 bg-brand-cream px-3 py-2 text-sm outline-none transition focus:border-brand-pink"
          />
          <button
            type="submit"
            disabled={status === "submitting"}
            className="w-full rounded-full bg-brand-pink px-3 py-2.5 text-sm font-semibold uppercase tracking-wide text-white transition hover:bg-brand-ink disabled:opacity-50"
          >
            {status === "submitting" ? "Signing in…" : "Sign in"}
          </button>
        </form>

        {message && <p className="mt-4 text-sm text-brand-pink">{message}</p>}
      </div>
    </main>
  );
}
