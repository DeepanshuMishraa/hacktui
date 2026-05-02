import { useQuery } from "@tanstack/react-query";
import "opentui-spinner/react";
import { api } from "./utils/api";
import type { HNItem } from "./utils/types";
import { useRef, useEffect } from "react";
import { useKeyboard } from "@opentui/react";
import { openUrl } from "./utils/open-url";
import { useTheme } from "./theme";

function stripHtml(html: string): string {
  return html
    .replace(/<p>/g, "\n\n")
    .replace(/<br\s*\/?>/g, "\n")
    .replace(/<a\s+href="[^"]*"[^>]*>([^<]*)<\/a>/g, "$1")
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&#x2F;/g, "/")
    .replace(/&nbsp;/g, " ")
    .trim();
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

function getDomain(url?: string): string {
  if (!url) return "news.ycombinator.com";
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "news.ycombinator.com";
  }
}

interface StoryDetailProps {
  story: HNItem;
  onBack: () => void;
  sourceLabel: string;
}

export default function StoryDetail({
  story,
  onBack,
  sourceLabel,
}: StoryDetailProps) {
  const { tokens } = useTheme();
  const scrollboxRef = useRef<any>(null);

  const { data: comments, isLoading } = useQuery({
    queryKey: ["comments", story.id],
    queryFn: async () => {
      if (!story.kids || story.kids.length === 0) return [];
      const ids = story.kids;
      const results = await Promise.all(
        ids.map(async (id) => {
          const res = await api.get<HNItem>(`/v0/item/${id}.json`);
          return res.data;
        }),
      );
      return results.filter(
        (c): c is HNItem => c != null && c.type === "comment",
      );
    },
    enabled: !!story.kids && story.kids.length > 0,
  });

  useKeyboard((key) => {
    if (key.name === "escape") {
      onBack();
    }
    if (key.name === "o") {
      openUrl(story.url ?? `https://news.ycombinator.com/item?id=${story.id}`);
    }
    if (key.name === "enter" || key.name === "return") {
      openUrl(story.url ?? `https://news.ycombinator.com/item?id=${story.id}`);
    }
  });

  useEffect(() => {
    if (scrollboxRef.current) {
      scrollboxRef.current.scrollTop = 0;
    }
  }, []);

  const domain = getDomain(story.url);
  const storyText = story.text ? stripHtml(story.text) : null;

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
          <strong>{sourceLabel}</strong>
        </text>
      </box>

      <scrollbox ref={scrollboxRef} focused flexGrow={1}>
        <box style={{ flexDirection: "column", gap: 0 }}>
          <text fg={tokens.textPrimary}>
            <strong>{story.title}</strong>
          </text>
          <box
            style={{
              flexDirection: "row",
              gap: 1,
              marginTop: 1,
            }}
          >
            <text fg={tokens.accent}>{story.score} points</text>
            <text fg={tokens.textSecondary}>by {story.by}</text>
            <text fg={tokens.textSecondary}>{timeAgo(story.time)}</text>
            {story.url && (
              <text fg={tokens.textSecondary}>| {domain}</text>
            )}
            {story.descendants != null && (
              <text fg={tokens.textSecondary}>
                | {story.descendants} comments
              </text>
            )}
          </box>

          {storyText && (
            <box
              border
              borderStyle="rounded"
              borderColor={tokens.textSecondary}
              style={{ marginTop: 1, paddingX: 1, paddingY: 1 }}
            >
              <text fg={tokens.textPrimary}>{storyText}</text>
            </box>
          )}

          <box style={{ marginTop: 1, marginBottom: 1 }}>
            <text fg={tokens.textSecondary}>
              {"─".repeat(80)}
            </text>
          </box>

          <box
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 1,
              marginBottom: 1,
            }}
          >
            <text fg={tokens.accent}>
              <strong>Comments</strong>
            </text>
            {story.descendants != null && (
              <text fg={tokens.textSecondary}>
                ({story.descendants})
              </text>
            )}
          </box>

          {isLoading && (
            <box
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                gap: 1,
                paddingY: 1,
              }}
            >
              <spinner name="dots" color={tokens.spinner} />
              <text fg={tokens.textSecondary}>Loading comments...</text>
            </box>
          )}

          {comments && comments.length > 0 && (
            <box style={{ flexDirection: "column", gap: 1 }}>
              {comments.map((comment) => {
                const text = comment.text
                  ? stripHtml(comment.text)
                  : "";
                return (
                  <box
                    key={comment.id}
                    style={{ flexDirection: "column", gap: 0 }}
                  >
                    <box style={{ flexDirection: "row", gap: 1 }}>
                      <text fg={tokens.accent}>
                        <strong>{comment.by}</strong>
                      </text>
                      <text fg={tokens.textSecondary}>
                        {timeAgo(comment.time)}
                      </text>
                    </box>
                    <text fg={tokens.textPrimary}>{text}</text>
                  </box>
                );
              })}
            </box>
          )}

          {comments && comments.length === 0 && !isLoading && (
            <text fg={tokens.textSecondary}>No comments yet.</text>
          )}
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
          <strong>Back</strong> esc
        </text>
        <text fg={tokens.textSecondary}>
          <strong>Open</strong> o / enter
        </text>
      </box>
    </box>
  );
}