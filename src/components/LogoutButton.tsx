"use client";

import { useRouter } from "next/navigation";
import { createBrowserSupabase } from "@/lib/supabase/client";

export function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    const supabase = createBrowserSupabase();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <button
      onClick={handleLogout}
      className="rounded-full border border-brand-ink/20 px-4 py-1.5 text-xs font-medium uppercase tracking-wide text-brand-ink/70 transition hover:bg-brand-ink hover:text-white"
    >
      Sign out
    </button>
  );
}
