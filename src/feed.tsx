import { useQuery } from "@tanstack/react-query";
import "opentui-spinner/react";
import { api } from "./utils/api";
import type { HNItem } from "./utils/types";
import { useState, useRef, useEffect } from "react";
import { useKeyboard } from "@opentui/react";

function getDomain(url?: string): string {
  if (!url) return "news.ycombinator.com";
  try {
    const u = new URL(url);
    return u.hostname.replace(/^www\./, "");
  } catch {
    return "news.ycombinator.com";
  }
}

function timeAgo(timestamp: number): string {
  const seconds = Math.floor(Date.now() / 1000 - timestamp);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return `${seconds}s ago`;
}

export default function Feed() {
  const [selected, setSelected] = useState(0);
  const scrollboxRef = useRef<any>(null);

  const {
    data: storyIds,
    isLoading: idsLoading,
    isError: idsError,
  } = useQuery({
    queryKey: ["feed-ids"],
    queryFn: async () => {
      const res = await api.get<number[]>("/v0/topstories.json");
      return res.data.slice(0, 30);
    },
  });

  const {
    data: stories,
    isLoading: storiesLoading,
    isError: storiesError,
  } = useQuery({
    queryKey: ["feed-stories", storyIds],
    queryFn: async () => {
      if (!storyIds) return [];
      const results = await Promise.all(
        storyIds.map(async (id) => {
          const res = await api.get<HNItem>(`/v0/item/${id}.json`);
          return res.data;
        }),
      );
      return results.filter(
        (s): s is HNItem => s != null && s.type === "story",
      );
    },
    enabled: !!storyIds && storyIds.length > 0,
  });

  const isLoading = idsLoading || storiesLoading;
  const isError = idsError || storiesError;

  useKeyboard((key) => {
    if (!stories) return;
    if (key.name === "down") {
      setSelected((s) => Math.min(s + 1, stories.length - 1));
    }
    if (key.name === "up") {
      setSelected((s) => Math.max(s - 1, 0));
    }
  });

  useEffect(() => {
    if (scrollboxRef.current && stories && stories[selected]) {
      scrollboxRef.current.scrollChildIntoView(`story-${stories[selected].id}`);
    }
  }, [selected, stories]);

  if (isLoading) {
    return (
      <box
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "90%",
          gap: 1,
        }}
      >
        <spinner name="dots" color="#FF653F" />
        <text fg="#666666">Loading stories...</text>
      </box>
    );
  }

  if (isError) {
    return (
      <box
        style={{
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100%",
          gap: 1,
        }}
      >
        <text fg="#FF653F">
          <strong>Something went wrong!</strong>
        </text>
        <text fg="#666666">Could not load the feed.</text>
      </box>
    );
  }

  return (
    <box
      style={{
        flexDirection: "column",
        width: "100%",
        height: "100%",
        paddingX: 2,
        paddingY: 1,
      }}
    >
      <box
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 1,
          marginBottom: 1,
        }}
      >
        <text fg="#FF653F">
          <strong>HackTUI</strong>
        </text>
        <text fg="#666666">|</text>
        <text fg="#c0caf5">
          <strong>Top Stories</strong>
        </text>
      </box>
      <scrollbox ref={scrollboxRef} flexGrow={1}>
        <box style={{ flexDirection: "column", gap: 0 }}>
          {stories?.map((story, i) => (
            <box
              key={story.id}
              id={`story-${story.id}`}
              paddingX={1}
              paddingY={0}
              backgroundColor={selected === i ? "#FF653F" : "transparent"}
            >
              <box style={{ flexDirection: "column", gap: 0 }}>
                <box style={{ flexDirection: "row", gap: 1 }}>
                  <text fg="#666666">{i + 1}.</text>
                  <text fg={selected === i ? "#1a1b26" : "#c0caf5"}>
                    <strong>{story.title}</strong>
                  </text>
                </box>
                <box
                  style={{
                    flexDirection: "row",
                    gap: 1,
                    marginLeft: 3,
                  }}
                >
                  <text fg={selected === i ? "#1a1b26" : "#666666"}>
                    {story.score} points
                  </text>
                  <text fg={selected === i ? "#1a1b26" : "#666666"}>
                    by {story.by}
                  </text>
                  <text fg={selected === i ? "#1a1b26" : "#666666"}>
                    {timeAgo(story.time)}
                  </text>
                  <text fg={selected === i ? "#1a1b26" : "#666666"}>
                    | {getDomain(story.url)}
                  </text>
                  {story.descendants != null && (
                    <text fg={selected === i ? "#1a1b26" : "#666666"}>
                      | {story.descendants} comments
                    </text>
                  )}
                </box>
              </box>
            </box>
          ))}
        </box>
      </scrollbox>
      <box
        style={{
          flexDirection: "row",
          gap: 3,
          marginTop: 1,
          paddingTop: 1,
        }}
      >
        <text fg="#666666">
          <strong>Navigate</strong> ↑↓
        </text>
        <text fg="#666666">
          <strong>Open</strong> enter
        </text>
        <text fg="#666666">
          <strong>Back</strong> esc
        </text>
      </box>
    </box>
  );
}
