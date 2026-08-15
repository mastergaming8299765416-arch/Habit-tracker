"use client";

import { useState, useRef, useEffect } from "react";
import { useTheme } from "@/components/ThemeProvider";

const SWATCH_PREVIEW = {
  cozy: "linear-gradient(135deg, #8FA98B, #FBF7F0)",
  minimal: "linear-gradient(135deg, #2563EB, #FFFFFF)",
  vibrant: "linear-gradient(135deg, #F97316, #FFF9F0)",
  premium: "linear-gradient(135deg, #D4AF37, #0F1115)",
};

export default function ThemeSwitcher({ compact = false }) {
  const { style, mode, setStyle, toggleMode, themes } = useTheme();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function onClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 text-sm border border-sand rounded-lg px-2.5 py-1.5 bg-surface hover:bg-accentLight/40 transition-colors"
        aria-label="Theme settings"
      >
        <span
          className="w-4 h-4 rounded-full border border-sand"
          style={{ background: SWATCH_PREVIEW[style] }}
        />
        {!compact && <span className="text-ink/70">Theme</span>}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-64 bg-surface border border-sand rounded-xl shadow-lg p-3 z-50">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-ink/50 uppercase tracking-wide">Appearance</span>
            <button
              onClick={toggleMode}
              className="text-xs border border-sand rounded-full px-2.5 py-1 bg-cream hover:bg-accentLight/40 flex items-center gap-1"
            >
              {mode === "light" ? "☀️ Light" : "🌙 Dark"}
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {Object.entries(themes).map(([key, t]) => (
              <button
                key={key}
                onClick={() => setStyle(key)}
                className={`flex items-center gap-2 rounded-lg border px-2 py-2 text-left transition-colors ${
                  style === key ? "border-accent bg-accentLight/40" : "border-sand hover:bg-accentLight/20"
                }`}
              >
                <span
                  className="w-6 h-6 rounded-full border border-sand shrink-0"
                  style={{ background: SWATCH_PREVIEW[key] }}
                />
                <span className="text-xs text-ink/80 leading-tight">{t.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
