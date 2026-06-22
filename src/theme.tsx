import { createContext, useContext, useState, useCallback, useEffect } from "react";
import { useRenderer } from "@opentui/react";
import { fileStorage } from "./utils/cache";
import { themes, type ThemeTokens } from "./themes";

const THEME_KEY = "hacktui-theme";

function loadThemeName(): string {
  const cliTheme = typeof process !== "undefined" ? process.env.HACKTUI_THEME : undefined;
  if (cliTheme) {
    fileStorage.setItem(THEME_KEY, cliTheme);
    return cliTheme;
  }
  return fileStorage.getItem(THEME_KEY) || "default";
}

function saveThemeName(name: string) {
  fileStorage.setItem(THEME_KEY, name);
}

export type { ThemeTokens };

interface ThemeContextValue {
  tokens: ThemeTokens;
  themeName: string;
  setTheme: (name: string) => void;
  cycleTheme: (direction?: 1 | -1) => void;
  availableThemes: { name: string; label: string }[];
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return ctx;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [themeName, setThemeName] = useState<string>(loadThemeName);
  const renderer = useRenderer();

  const currentTheme = themes.find((t) => t.name === themeName) ?? themes[0]!;

  useEffect(() => {
    if (!renderer) return;
    renderer.setBackgroundColor(currentTheme.tokens.background);
  }, [renderer, currentTheme.tokens.background]);

  const setTheme = useCallback((name: string) => {
    setThemeName(name);
    saveThemeName(name);
  }, []);

  const cycleTheme = useCallback((direction: 1 | -1 = 1) => {
    setThemeName((prev) => {
      const idx = themes.findIndex((t) => t.name === prev);
      const next = (idx + direction + themes.length) % themes.length;
      const name = themes[next]!.name;
      saveThemeName(name);
      return name;
    });
  }, []);

  const availableThemes = themes.map((t) => ({
    name: t.name,
    label: t.label,
  }));

  return (
    <ThemeContext.Provider
      value={{
        tokens: currentTheme.tokens,
        themeName,
        setTheme,
        cycleTheme,
        availableThemes,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}
