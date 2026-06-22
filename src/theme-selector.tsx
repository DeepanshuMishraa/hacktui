import { useState, useRef, useEffect } from "react";
import { useKeyboard } from "@opentui/react";
import { useTheme } from "./theme";

interface ThemeSelectorProps {
  onClose: () => void;
}

export default function ThemeSelector({ onClose }: ThemeSelectorProps) {
  const { themeName, setTheme, availableThemes, tokens } = useTheme();
  const [selected, setSelected] = useState(() => {
    const idx = availableThemes.findIndex((t) => t.name === themeName);
    return Math.max(0, idx);
  });
  const scrollboxRef = useRef<any>(null);

  useEffect(() => {
    if (scrollboxRef.current) {
      scrollboxRef.current.scrollChildIntoView(`theme-${selected}`);
    }
  }, [selected]);

  useKeyboard((key) => {
    if (key.name === "down") {
      setSelected((s) => Math.min(s + 1, availableThemes.length - 1));
    }
    if (key.name === "up") {
      setSelected((s) => Math.max(s - 1, 0));
    }
    if (key.name === "enter" || key.name === "return") {
      const t = availableThemes[selected];
      if (t) setTheme(t.name);
      onClose();
    }
  });

  return (
    <box
      style={{
        flexDirection: "column",
        paddingX: 2,
        paddingY: 1,
        gap: 1,
      }}
      width="100%"
    >
      <box
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <text>
          <strong>Select Theme</strong>
        </text>
        <text fg={tokens.textSecondary}>enter confirm · esc</text>
      </box>
      <scrollbox ref={scrollboxRef} height={14}>
        <box style={{ flexDirection: "column", gap: 0 }}>
          {availableThemes.map((t, i) => (
            <box
              key={t.name}
              id={`theme-${i}`}
              paddingX={1}
              paddingY={0}
            >
              <text fg={selected === i ? tokens.accent : tokens.textPrimary}>
                {selected === i ? "▸ " : "  "}
                {t.label}
                {t.name === themeName && (
                  <span fg={tokens.textSecondary}> (active)</span>
                )}
              </text>
            </box>
          ))}
        </box>
      </scrollbox>
    </box>
  );
}
