"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-white border border-sand rounded-2xl shadow-sm p-8">
        <h1 className="text-2xl font-serif text-center mb-1">Habit Tracker</h1>
        <p className="text-center text-sm text-ink/60 mb-6">Small habits today, extraordinary results tomorrow.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm text-ink/70">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-lg border border-sand px-3 py-2 outline-none focus:border-sage"
            />
          </div>
          <div>
            <label className="text-sm text-ink/70">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-lg border border-sand px-3 py-2 outline-none focus:border-sage"
            />
          </div>

          {error && <p className="text-sm text-rose">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-sage text-white rounded-lg py-2 font-medium hover:opacity-90 disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div className="flex justify-between mt-4 text-sm">
          <Link href="/forgot-password" className="text-sage hover:underline">Forgot password?</Link>
          <Link href="/signup" className="text-sage hover:underline">Create account</Link>
        </div>
      </div>
    </div>
  );
}
