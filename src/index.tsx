import { useKeyboard } from "@opentui/react";
import { useState } from "react";
import Feed from "./feed";
import "opentui-spinner/react";
import { Screens } from "./utils/types";
import TopStories from "./top-stories";
import { useDialog, useDialogState } from "@opentui-ui/dialog/react";
import Search from "./search";
import { useTheme } from "./theme";
import { exit } from "process";

export default function App() {
  const [screen, setScreen] = useState<Screens>(Screens.HOME);
  const dialog = useDialog();
  const isOpen = useDialogState((s) => s.isOpen);
  const { tokens, toggle } = useTheme();

  useKeyboard((key) => {
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
      exit(0);
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
    return <Feed />;
  }
  if (screen === Screens.TOP_STORIES) {
    return <TopStories />;
  }

  return (
    <box
      style={{
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "90%",
        gap: 0.5,
      }}
    >
      <ascii-font
        font="tiny"
        text="HackTUI"
        color={tokens.accent}
        marginTop={1.5}
      />
      <text fg={tokens.textSecondary} marginTop={1}>
        Your HackerNews Inside the Terminal
      </text>
      <box style={{ flexDirection: "row", gap: 1 }}>
        <box paddingX={1} backgroundColor={tokens.accent}>
          <text>
            <strong>F (Feed)</strong>
          </text>
        </box>

        <box paddingX={1} backgroundColor={tokens.accent}>
          <text>
            <strong>S (Search)</strong>
          </text>
        </box>

        <box paddingX={1} backgroundColor={tokens.accent}>
          <text>
            <strong>T (Top Stories)</strong>
          </text>
        </box>
      </box>
      <box marginTop={1}>
        <text fg={tokens.textSecondary}>Toggle theme: ctrl + t</text>
      </box>
    </box>
  );
}
