// Each theme has a light and dark palette. Values are space-separated RGB
// triples so Tailwind's rgb(var(--x) / <alpha-value>) pattern works with
// opacity modifiers (e.g. bg-cream/50).

export const THEMES = {
  cozy: {
    label: "Cozy Planner",
    light: {
      bg: "251 247 240",
      surface: "255 255 255",
      border: "232 223 207",
      ink: "46 42 38",
      accent: "143 169 139",
      accentLight: "228 236 226",
      danger: "217 142 142",
      dangerLight: "246 228 228",
    },
    dark: {
      bg: "33 30 27",
      surface: "43 39 35",
      border: "61 55 47",
      ink: "242 236 227",
      accent: "159 187 154",
      accentLight: "58 66 56",
      danger: "227 160 160",
      dangerLight: "74 53 53",
    },
  },
  minimal: {
    label: "Modern Minimal",
    light: {
      bg: "255 255 255",
      surface: "250 250 250",
      border: "229 229 229",
      ink: "23 23 23",
      accent: "37 99 235",
      accentLight: "219 234 254",
      danger: "220 38 38",
      dangerLight: "254 226 226",
    },
    dark: {
      bg: "10 10 10",
      surface: "23 23 23",
      border: "38 38 38",
      ink: "250 250 250",
      accent: "96 165 250",
      accentLight: "30 58 95",
      danger: "248 113 113",
      dangerLight: "74 29 29",
    },
  },
  vibrant: {
    label: "Bold Vibrant",
    light: {
      bg: "255 249 240",
      surface: "255 255 255",
      border: "255 224 178",
      ink: "31 19 0",
      accent: "249 115 22",
      accentLight: "255 237 213",
      danger: "225 29 72",
      dangerLight: "255 228 230",
    },
    dark: {
      bg: "26 16 37",
      surface: "36 23 51",
      border: "61 42 82",
      ink: "245 238 255",
      accent: "251 146 60",
      accentLight: "74 46 18",
      danger: "251 113 133",
      dangerLight: "74 18 32",
    },
  },
  premium: {
    label: "Premium Dark",
    light: {
      bg: "245 245 244",
      surface: "255 255 255",
      border: "224 222 217",
      ink: "28 27 26",
      accent: "184 145 46",
      accentLight: "245 235 208",
      danger: "220 38 38",
      dangerLight: "254 226 226",
    },
    dark: {
      bg: "15 17 21",
      surface: "24 27 33",
      border: "42 46 55",
      ink: "232 234 237",
      accent: "212 175 55",
      accentLight: "58 51 26",
      danger: "239 68 68",
      dangerLight: "61 31 31",
    },
  },
};

export const DEFAULT_STYLE = "cozy";
export const DEFAULT_MODE = "light";

export function applyTheme(style, mode) {
  const palette = THEMES[style]?.[mode] || THEMES[DEFAULT_STYLE][DEFAULT_MODE];
  const root = document.documentElement;
  root.style.setProperty("--bg", palette.bg);
  root.style.setProperty("--surface", palette.surface);
  root.style.setProperty("--border", palette.border);
  root.style.setProperty("--ink", palette.ink);
  root.style.setProperty("--accent", palette.accent);
  root.style.setProperty("--accent-light", palette.accentLight);
  root.style.setProperty("--danger", palette.danger);
  root.style.setProperty("--danger-light", palette.dangerLight);
}
