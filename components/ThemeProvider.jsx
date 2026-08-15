"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { THEMES, DEFAULT_STYLE, DEFAULT_MODE, applyTheme } from "@/lib/themes";

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [style, setStyleState] = useState(DEFAULT_STYLE);
  const [mode, setModeState] = useState(DEFAULT_MODE);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const savedStyle = localStorage.getItem("habit-tracker-style") || DEFAULT_STYLE;
    const savedMode = localStorage.getItem("habit-tracker-mode") || DEFAULT_MODE;
    setStyleState(savedStyle);
    setModeState(savedMode);
    applyTheme(savedStyle, savedMode);
    setReady(true);
  }, []);

  const setStyle = useCallback((newStyle) => {
    setStyleState(newStyle);
    localStorage.setItem("habit-tracker-style", newStyle);
    applyTheme(newStyle, mode);
  }, [mode]);

  const setMode = useCallback((newMode) => {
    setModeState(newMode);
    localStorage.setItem("habit-tracker-mode", newMode);
    applyTheme(style, newMode);
  }, [style]);

  const toggleMode = useCallback(() => {
    setMode(mode === "light" ? "dark" : "light");
  }, [mode, setMode]);

  return (
    <ThemeContext.Provider value={{ style, mode, setStyle, setMode, toggleMode, themes: THEMES, ready }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
