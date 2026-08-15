"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import ThemeSwitcher from "@/components/ThemeSwitcher";

export default function SignupPage() {
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/login` },
    });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    setDone(true);
  }

  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-sm bg-surface border border-sand rounded-2xl shadow-sm p-8 text-center">
          <h1 className="text-xl font-serif mb-2">Check your inbox</h1>
          <p className="text-sm text-ink/70">We sent a confirmation link to {email}. Confirm your email, then sign in.</p>
          <Link href="/login" className="inline-block mt-6 text-sage hover:underline text-sm">Back to login</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative">
      <div className="absolute top-4 right-4">
        <ThemeSwitcher />
      </div>
      <div className="w-full max-w-sm bg-surface border border-sand rounded-2xl shadow-sm p-8">
        <h1 className="text-2xl font-serif text-center mb-1">Create your account</h1>
        <p className="text-center text-sm text-ink/60 mb-6">Start tracking your habits today.</p>

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
              minLength={8}
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
            {loading ? "Creating account..." : "Sign Up"}
          </button>
        </form>

        <p className="text-center mt-4 text-sm">
          Already have an account? <Link href="/login" className="text-sage hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
