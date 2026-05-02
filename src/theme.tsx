import { createContext, useContext, useState, useCallback, useEffect } from "react";
import { useRenderer } from "@opentui/react";
import { fileStorage } from "./utils/cache";

export type ThemeMode = "dark" | "light";

const THEME_KEY = "hacktui-theme";

function loadMode(): ThemeMode {
  const saved = fileStorage.getItem(THEME_KEY);
  return saved === "light" ? "light" : "dark";
}

function saveMode(mode: ThemeMode) {
  fileStorage.setItem(THEME_KEY, mode);
}

export interface ThemeTokens {
  textPrimary: string;
  textSecondary: string;
  textSelected: string;
  accent: string;
  selectedBg: string;
  inputBg: string;
  inputText: string;
  cursor: string;
  spinner: string;
  error: string;
  dialogBg: string;
}

const darkTokens: ThemeTokens = {
  textPrimary: "#c0caf5",
  textSecondary: "#666666",
  textSelected: "#1a1b26",
  accent: "#FF653F",
  selectedBg: "#FF653F",
  inputBg: "#1a1a2e",
  inputText: "#c0caf5",
  cursor: "#FF653F",
  spinner: "#FF653F",
  error: "#FF653F",
  dialogBg: "#262626",
};

const lightTokens: ThemeTokens = {
  textPrimary: "#1a1a2e",
  textSecondary: "#666666",
  textSelected: "#ffffff",
  accent: "#FF653F",
  selectedBg: "#FF653F",
  inputBg: "#f0f0f5",
  inputText: "#1a1a2e",
  cursor: "#FF653F",
  spinner: "#FF653F",
  error: "#FF653F",
  dialogBg: "#ffffff",
};

interface ThemeContextValue {
  mode: ThemeMode;
  tokens: ThemeTokens;
  toggle: () => void;
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
  const [mode, setMode] = useState<ThemeMode>(loadMode);
  const renderer = useRenderer();

  const toggle = useCallback(() => {
    setMode((prev) => {
      const next = prev === "dark" ? "light" : "dark";
      saveMode(next);
      return next;
    });
  }, []);

  useEffect(() => {
    if (!renderer) return;
    renderer.setBackgroundColor(mode === "dark" ? "#1a1a2e" : "#ffffff");
  }, [mode, renderer]);

  const tokens = mode === "dark" ? darkTokens : lightTokens;

  return (
    <ThemeContext.Provider value={{ mode, tokens, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}
