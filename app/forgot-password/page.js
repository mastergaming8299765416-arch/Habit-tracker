"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function ForgotPasswordPage() {
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) {
      setError(error.message);
      return;
    }
    setSent(true);
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-white border border-sand rounded-2xl shadow-sm p-8">
        <h1 className="text-xl font-serif text-center mb-1">Reset your password</h1>
        {sent ? (
          <p className="text-center text-sm text-ink/70 mt-4">
            If an account exists for {email}, a reset link has been sent.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
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
            {error && <p className="text-sm text-rose">{error}</p>}
            <button
              type="submit"
              className="w-full bg-sage text-white rounded-lg py-2 font-medium hover:opacity-90"
            >
              Send Reset Link
            </button>
          </form>
        )}
        <Link href="/login" className="block text-center mt-6 text-sage hover:underline text-sm">Back to login</Link>
      </div>
    </div>
  );
}
