import { useKeyboard } from "@opentui/react";
import { useState } from "react";
import Feed from "./feed";
import "opentui-spinner/react";
import { Screens } from "./utils/types";
import TopStories from "./top-stories";
import { useDialog, useDialogState } from "@opentui-ui/dialog/react";
import Search from "./search";
import { useTheme } from "./theme";
import { renderer } from "./layout";

function MenuItem({
  keyLabel,
  label,
  tokens,
}: {
  keyLabel: string;
  label: string;
  tokens: ReturnType<typeof useTheme>["tokens"];
}) {
  return (
    <box style={{ flexDirection: "row", gap: 2, alignItems: "center" }}>
      <text fg={tokens.accent}>
        <strong>{keyLabel}</strong>
      </text>
      <text fg={tokens.textSecondary}>{label}</text>
    </box>
  );
}

export default function App() {
  const [screen, setScreen] = useState<Screens>(Screens.HOME);
  const [detailOpen, setDetailOpen] = useState(false);
  const dialog = useDialog();
  const isOpen = useDialogState((s) => s.isOpen);
  const { tokens, toggle } = useTheme();

  useKeyboard((key) => {
    if (detailOpen) return;
    if (key.ctrl) {
      if (key.name === "t") {
        toggle();
      }
      return;
    }

    if (isOpen && (key.name === "f" || key.name === "t" || key.name === "s")) {
      return;
    }

    if (key.name === "f") {
      setScreen(Screens.FEED);
    }

    if (key.name === "q") {
      renderer.destroy();
    }
    if (key.name === "t") {
      setScreen(Screens.TOP_STORIES);
    }
    if (key.name === "escape") {
      setScreen(Screens.HOME);
    }
    if (key.name === "s") {
      dialog.show({
        content: () => <Search />,
        onClose: () => setScreen(Screens.HOME),
        closeOnEscape: true,
        id: "search-dialog",
      });
    }
  });

  if (screen === Screens.FEED) {
    return <Feed onDetailChange={setDetailOpen} />;
  }
  if (screen === Screens.TOP_STORIES) {
    return <TopStories onDetailChange={setDetailOpen} />;
  }

  return (
    <box
      style={{
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100%",
        gap: 0,
      }}
    >
      <ascii-font
        font="tiny"
        text="HackTUI"
        color={tokens.accent}
        marginBottom={1}
      />

      <text fg={tokens.textSecondary} marginBottom={3}>
        HackerNews in your terminal
      </text>

      <box style={{ flexDirection: "column", gap: 1, marginBottom: 3 }}>
        <MenuItem keyLabel="f" label="feed" tokens={tokens} />
        <MenuItem keyLabel="t" label="top stories" tokens={tokens} />
        <MenuItem keyLabel="s" label="search" tokens={tokens} />
      </box>

      <box style={{ flexDirection: "column", gap: 0, alignItems: "center" }}>
        <text fg={tokens.textSecondary}>
          ctrl+t theme · q quit
        </text>
      </box>
    </box>
  );
}
