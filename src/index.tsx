import { useKeyboard } from "@opentui/react";
import { useState } from "react";
import Feed from "./feed";
import "opentui-spinner/react";
import { Screens } from "./types";
import TopStories from "./top-stories";

export default function App() {
  const [screen, setScreen] = useState<Screens>(Screens.HOME);

  useKeyboard((key) => {
    if (key.name === "f") {
      setScreen(Screens.FEED);
    }
    if (key.name === "t") {
      setScreen(Screens.TOP_STORIES);
    }
    if (key.name === "escape") {
      setScreen(Screens.HOME);
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
      <ascii-font font="tiny" text="HackTUI" color="#FF653F" marginTop={1.5} />
      <text fg="#666666" marginTop={1}>
        Your HackerNews Inside the Terminal
      </text>
      <box style={{ flexDirection: "row", gap: 1 }}>
        <box paddingX={1} backgroundColor="#FF653F">
          <text>
            <strong>F (Feed)</strong>
          </text>
        </box>

        <box paddingX={1} backgroundColor="#FF653F">
          <text>
            <strong>S (Search)</strong>
          </text>
        </box>

        <box paddingX={1} backgroundColor="#FF653F">
          <text>
            <strong>T (Top Stories)</strong>
          </text>
        </box>
      </box>
    </box>
  );
}
