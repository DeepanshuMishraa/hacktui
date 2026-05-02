import { useState } from "react";
import { useKeyboard } from "@opentui/react";

const DUMMY_RESULTS = [
  {
    title: "Show HN: I built a TUI framework in Zig",
    author: "anomaly",
    points: 234,
  },
  { title: "The future of AI-powered development", author: "dhh", points: 189 },
  { title: "Why I switched from Rust to Zig", author: "andrewrk", points: 456 },
  { title: "Understanding Linux namespaces", author: "lwn", points: 312 },
  {
    title: "Docker is dead, long live containers",
    author: "solomon",
    points: 567,
  },
  {
    title: "Building a database from scratch in Go",
    author: "cockroach",
    points: 278,
  },
];

export default function Search() {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(0);

  const results = DUMMY_RESULTS.filter((r) =>
    r.title.toLowerCase().includes(query.toLowerCase()),
  );

  useKeyboard((key) => {
    if (key.name === "down") {
      setSelected((s) => Math.min(s + 1, results.length - 1));
    }
    if (key.name === "up") {
      setSelected((s) => Math.max(s - 1, 0));
    }
  });

  return (
    <box
      style={{
        flexDirection: "column",
        width: "100%",
        height: "100%",
        paddingX: 2,
        paddingY: 1,
        gap: 1,
      }}
    >
      <box
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <text>
          <strong>Search stories</strong>
        </text>
        <text fg="#666666">esc</text>
      </box>
      <input
        placeholder="Search"
        value={query}
        onChange={setQuery}
        focused
        width="100%"
        backgroundColor="#1a1a2e"
        textColor="#c0caf5"
        cursorColor="#FF653F"
        focusedBackgroundColor="#1a1a2e"
      />
      <box style={{ flexDirection: "column", flexGrow: 1, gap: 0 }}>
        {results.map((item, i) => (
          <box
            key={i}
            paddingX={1}
            paddingY={0}
            backgroundColor={selected === i ? "#FF653F" : "transparent"}
          >
            <text fg={selected === i ? "#ffffff" : "#c0caf5"}>
              {item.title}
            </text>
          </box>
        ))}
      </box>

      <box
        style={{
          flexDirection: "row",
          gap: 3,
          marginTop: 1,
        }}
      >
        <text>
          <strong>Open</strong> <span fg="#666666">enter</span>
        </text>
        <text>
          <strong>Navigate</strong> <span fg="#666666">↑↓</span>
        </text>
      </box>
    </box>
  );
}
