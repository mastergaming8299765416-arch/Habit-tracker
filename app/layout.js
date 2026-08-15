import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { THEMES } from "@/lib/themes";

export const metadata = {
  title: "Habit Tracker",
  description: "Your monthly habit tracker, automated.",
};

// Flatten THEMES (which also carries a `label`) into just the light/dark
// palettes the init script needs, so there's a single source of truth.
const RAW_PALETTES = Object.fromEntries(
  Object.entries(THEMES).map(([key, t]) => [key, { light: t.light, dark: t.dark }])
);

const themeInitScript = `
(function() {
  try {
    var THEMES = ${JSON.stringify(RAW_PALETTES)};
    var style = localStorage.getItem('habit-tracker-style') || 'cozy';
    var mode = localStorage.getItem('habit-tracker-mode') || 'light';
    var p = (THEMES[style] || THEMES.cozy)[mode] || THEMES.cozy.light;
    var root = document.documentElement.style;
    root.setProperty('--bg', p.bg);
    root.setProperty('--surface', p.surface);
    root.setProperty('--border', p.border);
    root.setProperty('--ink', p.ink);
    root.setProperty('--accent', p.accent);
    root.setProperty('--accent-light', p.accentLight);
    root.setProperty('--danger', p.danger);
    root.setProperty('--danger-light', p.dangerLight);
  } catch (e) {}
})();
`;

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="min-h-screen font-sans">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
