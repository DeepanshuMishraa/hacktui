import { useState, useEffect, useRef } from "react";
import { useKeyboard } from "@opentui/react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import "opentui-spinner/react";
import { openUrl } from "./utils/open-url";
import { fileStorage } from "./utils/cache";
import { useTheme } from "./theme";

const searchApi = axios.create({
  baseURL: "https://hn.algolia.com/api/v1",
  timeout: 25000,
});

interface SearchHit {
  objectID: string;
  title: string;
  url?: string;
  author: string;
  points: number;
  created_at_i: number;
  num_comments?: number;
}

interface SearchHistoryEntry {
  query: string;
  topResult: SearchHit;
  timestamp: number;
}

const HISTORY_KEY = "hacktui-search-history-v2";
const MAX_HISTORY = 10;

function getHistory(): SearchHistoryEntry[] {
  try {
    const raw = fileStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function saveToHistory(query: string, results: SearchHit[]) {
  if (!results.length) return;
  const history = getHistory();
  const existingIndex = history.findIndex((h) => h.query === query);
  if (existingIndex >= 0) {
    history.splice(existingIndex, 1);
  }
  history.unshift({ query, topResult: results[0]!, timestamp: Date.now() });
  const trimmed = history.slice(0, MAX_HISTORY);
  fileStorage.setItem(HISTORY_KEY, JSON.stringify(trimmed));
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

export default function Search() {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [selected, setSelected] = useState(0);
  const scrollboxRef = useRef<any>(null);
  const { tokens } = useTheme();

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(t);
  }, [query]);

  const {
    data: searchResults,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["hn-search", debouncedQuery],
    queryFn: async () => {
      const res = await searchApi.get("/search", {
        params: {
          query: debouncedQuery,
          tags: "story",
          hitsPerPage: 20,
        },
      });
      return res.data.hits as SearchHit[];
    },
    enabled: debouncedQuery.length > 0,
  });

  useEffect(() => {
    if (searchResults && searchResults.length > 0 && debouncedQuery.length > 0) {
      saveToHistory(debouncedQuery, searchResults);
    }
  }, [searchResults, debouncedQuery]);

  useEffect(() => {
    setSelected(0);
  }, [debouncedQuery, searchResults]);

  const history = getHistory();
  const previousResults = history.map((h) => h.topResult);

  const showPrevious = debouncedQuery.length === 0;
  const displayResults = showPrevious
    ? previousResults
    : (searchResults ?? []);
  const isSearching = isLoading && debouncedQuery.length > 0;

  useEffect(() => {
    if (scrollboxRef.current && displayResults[selected]) {
      scrollboxRef.current.scrollChildIntoView(
        `search-${displayResults[selected].objectID}`,
      );
    }
  }, [selected, displayResults]);

  useKeyboard((key) => {
    if (key.name === "down") {
      setSelected((s) => Math.min(s + 1, displayResults.length - 1));
    }
    if (key.name === "up") {
      setSelected((s) => Math.max(s - 1, 0));
    }
    if (key.name === "o") {
      const item = displayResults[selected];
      if (item) {
        openUrl(
          item.url ?? `https://news.ycombinator.com/item?id=${item.objectID}`,
        );
      }
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
      height="100%"
      backgroundColor={tokens.dialogBg}
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
        <text fg={tokens.textSecondary}>esc</text>
      </box>
      <input
        placeholder="Search"
        value={query}
        onChange={setQuery}
        focused
        backgroundColor={tokens.inputBg}
        textColor={tokens.inputText}
        cursorColor={tokens.cursor}
        focusedBackgroundColor={tokens.inputBg}
      />
      <scrollbox ref={scrollboxRef} height={10}>
        <box style={{ flexDirection: "column", gap: 0 }}>
          {isSearching && (
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
              <text fg={tokens.textSecondary}>Searching...</text>
            </box>
          )}
          {isError && (
            <box
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                paddingY: 1,
              }}
            >
              <text fg={tokens.error}>Search failed. Try again.</text>
            </box>
          )}
          {showPrevious && previousResults.length > 0 && (
            <text fg={tokens.textSecondary} marginBottom={1}>
              <strong>Previous top results</strong>
            </text>
          )}
          {displayResults.length === 0 && !isSearching && !isError && (
            <box
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                paddingY: 1,
              }}
            >
              <text fg={tokens.textSecondary}>
                {showPrevious
                  ? "Type to search Hacker News"
                  : "No results found"}
              </text>
            </box>
          )}
          {displayResults.map((item, i) => (
            <box
              key={item.objectID}
              id={`search-${item.objectID}`}
              paddingX={1}
              paddingY={0}
              backgroundColor={selected === i ? tokens.selectedBg : "transparent"}
            >
              <box style={{ flexDirection: "column", gap: 0 }}>
                <text fg={selected === i ? tokens.textSelected : tokens.textPrimary}>
                  <strong>{item.title}</strong>
                </text>
                <box style={{ flexDirection: "row", gap: 1, marginLeft: 0 }}>
                  <text fg={selected === i ? tokens.textSelected : tokens.textSecondary}>
                    {item.points} points
                  </text>
                  <text fg={selected === i ? tokens.textSelected : tokens.textSecondary}>
                    by {item.author}
                  </text>
                  <text fg={selected === i ? tokens.textSelected : tokens.textSecondary}>
                    {timeAgo(item.created_at_i)}
                  </text>
                  {item.num_comments != null && (
                    <text fg={selected === i ? tokens.textSelected : tokens.textSecondary}>
                      | {item.num_comments} comments
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
        }}
      >
        <text fg={tokens.textPrimary}>
          <strong>Open</strong> <span fg={tokens.textSecondary}>o</span>
        </text>
        <text fg={tokens.textPrimary}>
          <strong>Navigate</strong> <span fg={tokens.textSecondary}>↑↓</span>
        </text>
      </box>
    </box>
  );
}
