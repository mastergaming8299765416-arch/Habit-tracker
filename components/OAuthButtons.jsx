"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

const PROVIDERS = [
  {
    id: "google",
    label: "Continue with Google",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
        <path fill="#4285F4" d="M23.52 12.27c0-.85-.08-1.67-.22-2.45H12v4.64h6.47a5.53 5.53 0 0 1-2.4 3.63v3h3.88c2.27-2.09 3.57-5.17 3.57-8.82z" />
        <path fill="#34A853" d="M12 24c3.24 0 5.96-1.07 7.95-2.91l-3.88-3c-1.08.72-2.45 1.15-4.07 1.15-3.13 0-5.78-2.11-6.73-4.96H1.27v3.11A12 12 0 0 0 12 24z" />
        <path fill="#FBBC05" d="M5.27 14.28A7.2 7.2 0 0 1 4.89 12c0-.79.14-1.56.38-2.28V6.61H1.27A12 12 0 0 0 0 12c0 1.94.46 3.77 1.27 5.39l4-3.11z" />
        <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.44-3.44C17.95 1.19 15.24 0 12 0A12 12 0 0 0 1.27 6.61l4 3.11C6.22 6.86 8.87 4.75 12 4.75z" />
      </svg>
    ),
  },
  {
    id: "facebook",
    label: "Continue with Facebook",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="#1877F2" aria-hidden="true">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    ),
  },
];

export default function OAuthButtons() {
  const supabase = createClient();
  const [loadingProvider, setLoadingProvider] = useState(null);
  const [error, setError] = useState("");

  async function handleOAuthLogin(providerId) {
    setError("");
    setLoadingProvider(providerId);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: providerId,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) {
      setLoadingProvider(null);
      setError(error.message);
    }
    // on success, the browser redirects to the provider automatically
  }

  return (
    <div>
      <div className="flex items-center gap-3 my-4">
        <div className="h-px flex-1 bg-sand" />
        <span className="text-xs text-ink/40 uppercase tracking-wide">or</span>
        <div className="h-px flex-1 bg-sand" />
      </div>

      <div className="space-y-2">
        {PROVIDERS.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => handleOAuthLogin(p.id)}
            disabled={loadingProvider !== null}
            className="w-full flex items-center justify-center gap-2 border border-sand rounded-lg py-2 bg-surface hover:bg-accentLight/40 text-sm font-medium transition-colors disabled:opacity-50"
          >
            {p.icon}
            {loadingProvider === p.id ? "Redirecting..." : p.label}
          </button>
        ))}
      </div>

      {error && <p className="text-sm text-rose mt-2 text-center">{error}</p>}
    </div>
  );
}
