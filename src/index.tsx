import { createCliRenderer } from "@opentui/core";
import { createRoot, useKeyboard } from "@opentui/react";
import { useState } from "react";
import Feed from "./feed";
import "opentui-spinner/react";

export default function App() {
  const [screen, setScreen] = useState<"login" | "feed">("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [focusField, setFocusField] = useState<"username" | "password" | null>(
    "username",
  );

  useKeyboard((key) => {
    if (key.name === "tab") {
      setFocusField((f) => {
        if (f === "username") return "password";
        if (f === "password") return null;
        return "username";
      });
    }
    if (
      (key.name === "enter" ||
        key.name === "return" ||
        key.sequence === "\r") &&
      focusField === "password"
    ) {
      if (screen === "login") setScreen("feed");
    }
  });

  if (screen === "feed") {
    return <Feed username={username} />;
  }

  return (
    <box
      style={{
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100%",
        gap: 0.5,
      }}
    >
      <ascii-font font="tiny" text="HackTUI" color="#FF653F" marginTop={1.5} />
      <text fg="#666666" marginTop={1}>
        Your HackerNews Inside the Terminal
      </text>

      <box
        flexDirection="column"
        alignItems="center"
        border
        borderStyle="rounded"
        borderColor="#FF653F"
        padding={1}
        gap={1}
        marginTop={1}
        width={40}
      >
        <text fg="#FF653F">
          <strong>Login</strong>
        </text>

        <box flexDirection="column" width="100%" gap={1}>
          <text fg="#888888">Username</text>
          <input
            value={username}
            onChange={setUsername}
            placeholder="Enter your username"
            focused={focusField === "username"}
            backgroundColor="#1a1a2e"
            focusedBackgroundColor="#2a2a3e"
            textColor="#FFFFFF"
          />
        </box>

        <box flexDirection="column" width="100%" gap={1}>
          <text fg="#888888">Password</text>
          <input
            value={password}
            onChange={setPassword}
            placeholder="Enter your password"
            focused={focusField === "password"}
            backgroundColor="#1a1a2e"
            focusedBackgroundColor="#2a2a3e"
            textColor="#FFFFFF"
          />
        </box>
      </box>
    </box>
  );
}


