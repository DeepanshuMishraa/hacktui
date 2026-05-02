import { useQuery } from "@tanstack/react-query";
import "opentui-spinner/react";
import { api } from "./utils/api";
import type { HNItem } from "./utils/types";
import { useState, useRef, useEffect } from "react";
import { useKeyboard } from "@opentui/react";
import { openUrl } from "./utils/open-url";
import { useTheme } from "./theme";
import TopStoryDetail from "./top-story-detail";

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

interface TopStoriesProps {
  onDetailChange?: (isOpen: boolean) => void;
}

export default function TopStories({ onDetailChange }: TopStoriesProps) {
  const [selected, setSelected] = useState(0);
  const [page, setPage] = useState(1);
  const [detailStory, setDetailStory] = useState<HNItem | null>(null);
  const scrollboxRef = useRef<any>(null);
  const { tokens } = useTheme();

  const {
    data: allStoryIds,
    isLoading: idsLoading,
    isError: idsError,
  } = useQuery({
    queryKey: ["best-ids"],
    queryFn: async () => {
      const res = await api.get<number[]>("/v0/beststories.json");
      return res.data;
    },
  });

  const storyIds = allStoryIds?.slice((page - 1) * 30, page * 30);

  const {
    data: stories,
    isLoading: storiesLoading,
    isError: storiesError,
  } = useQuery({
    queryKey: ["best-stories", page, storyIds],
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
  const totalPages = allStoryIds ? Math.ceil(allStoryIds.length / 30) : 1;

  useEffect(() => {
    onDetailChange?.(detailStory !== null);
  }, [detailStory, onDetailChange]);

  useKeyboard((key) => {
    if (detailStory) return;
    if (!stories) return;
    if (key.name === "down") {
      setSelected((s) => Math.min(s + 1, stories.length - 1));
    }
    if (key.name === "up") {
      setSelected((s) => Math.max(s - 1, 0));
    }
    if (key.name === "left") {
      if (page > 1) {
        setPage((p) => p - 1);
        setSelected(0);
      }
    }
    if (key.name === "right") {
      if (page < totalPages) {
        setPage((p) => p + 1);
        setSelected(0);
      }
    }
    if (key.name === "enter" || key.name === "return") {
      if (stories[selected]) {
        setDetailStory(stories[selected]);
      }
    }
    if (key.name === "o") {
      if (stories[selected]) {
        const story = stories[selected];
        openUrl(story.url ?? `https://news.ycombinator.com/item?id=${story.id}`);
      }
    }
  });

  useEffect(() => {
    if (scrollboxRef.current && stories && stories[selected]) {
      scrollboxRef.current.scrollChildIntoView(`story-${stories[selected].id}`);
    }
  }, [selected, stories]);

  if (detailStory) {
    return <TopStoryDetail story={detailStory} onBack={() => setDetailStory(null)} />;
  }

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
        <spinner name="bouncingBall" color={tokens.spinner} />
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
        <text fg={tokens.error}>
          <strong>Something went wrong!</strong>
        </text>
        <text fg={tokens.textSecondary}>Could not load best stories.</text>
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
        <text fg={tokens.accent}>
          <strong>HackTUI</strong>
        </text>
        <text fg={tokens.textSecondary}>|</text>
        <text fg={tokens.textPrimary}>
          <strong>Best Stories</strong>
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
              backgroundColor={selected === i ? tokens.selectedBg : "transparent"}
            >
              <box style={{ flexDirection: "column", gap: 0 }}>
                <box style={{ flexDirection: "row", gap: 1 }}>
                  <text fg={tokens.textSecondary}>{(page - 1) * 30 + i + 1}.</text>
                  <text fg={selected === i ? tokens.textSelected : tokens.textPrimary}>
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
                  <text fg={selected === i ? tokens.textSelected : tokens.textSecondary}>
                    {story.score} points
                  </text>
                  <text fg={selected === i ? tokens.textSelected : tokens.textSecondary}>
                    by {story.by}
                  </text>
                  <text fg={selected === i ? tokens.textSelected : tokens.textSecondary}>
                    {timeAgo(story.time)}
                  </text>
                  <text fg={selected === i ? tokens.textSelected : tokens.textSecondary}>
                    | {getDomain(story.url)}
                  </text>
                  {story.descendants != null && (
                    <text fg={selected === i ? tokens.textSelected : tokens.textSecondary}>
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
        <text fg={tokens.textSecondary}>
          <strong>Navigate</strong> ↑↓
        </text>
        <text fg={tokens.textSecondary}>
          <strong>Paginate</strong> ← → ({page}/{totalPages})
        </text>
        <text fg={tokens.textSecondary}>
          <strong>Open</strong> o
        </text>
        <text fg={tokens.textSecondary}>
          <strong>Detail</strong> enter
        </text>
        <text fg={tokens.textSecondary}>
          <strong>Back</strong> esc
        </text>
      </box>
    </box>
  );
}
