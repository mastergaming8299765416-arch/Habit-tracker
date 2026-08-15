"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  const supabase = createClient();
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setError(error.message);
      return;
    }
    setDone(true);
    setTimeout(() => router.push("/login"), 1500);
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-surface border border-sand rounded-2xl shadow-sm p-8">
        <h1 className="text-xl font-serif text-center mb-4">Choose a new password</h1>
        {done ? (
          <p className="text-center text-sm text-sage">Password updated! Redirecting to login...</p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="password"
              required
              minLength={8}
              placeholder="New password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-sand px-3 py-2 outline-none focus:border-sage"
            />
            {error && <p className="text-sm text-rose">{error}</p>}
            <button type="submit" className="w-full bg-sage text-white rounded-lg py-2 font-medium hover:opacity-90">
              Update Password
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
