"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

// This path is intentionally not linked from any nav, sitemap, or robots-visible
// route. Access control is enforced server-side in middleware.js (role check
// against the profiles table) — this page only handles the login form.
export default function AdminLoginPage() {
  const supabase = createClient();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setLoading(false);
      setError("Invalid credentials.");
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", data.user.id)
      .single();

    setLoading(false);

    if (!profile || profile.role !== "admin") {
      await supabase.auth.signOut();
      setError("This account does not have admin access.");
      return;
    }

    router.push("/secure-admin-x7q9/dashboard");
    router.refresh();
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-ink px-4">
      <div className="w-full max-w-sm bg-white rounded-xl p-8">
        <h1 className="text-lg font-medium text-center mb-6">Admin Access</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            required
            placeholder="Admin email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-sand px-3 py-2 outline-none focus:border-ink"
          />
          <input
            type="password"
            required
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border border-sand px-3 py-2 outline-none focus:border-ink"
          />
          {error && <p className="text-sm text-rose">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-ink text-white rounded-lg py-2 font-medium hover:opacity-90 disabled:opacity-50"
          >
            {loading ? "Checking..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}
