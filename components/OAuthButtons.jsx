"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function OAuthButtons() {
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleFacebookLogin() {
    setError("");
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "facebook",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) {
      setLoading(false);
      setError(error.message);
    }
    // on success, the browser redirects to Facebook automatically
  }

  return (
    <div>
      <div className="flex items-center gap-3 my-4">
        <div className="h-px flex-1 bg-sand" />
        <span className="text-xs text-ink/40 uppercase tracking-wide">or</span>
        <div className="h-px flex-1 bg-sand" />
      </div>

      <button
        type="button"
        onClick={handleFacebookLogin}
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 border border-sand rounded-lg py-2 bg-surface hover:bg-accentLight/40 text-sm font-medium transition-colors disabled:opacity-50"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="#1877F2" aria-hidden="true">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
        Continue with Facebook
      </button>

      {error && <p className="text-sm text-rose mt-2 text-center">{error}</p>}
    </div>
  );
}
