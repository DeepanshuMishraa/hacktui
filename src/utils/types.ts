export enum Screens {
  HOME = "home",
  FEED = "feed",
  TOP_STORIES = "top-stories",
  SEARCH = "search",
  FEED_DETAIL = "feed-detail",
  TOP_STORIES_DETAIL = "top-stories-detail",
}

export interface HNItem {
  id: number;
  title: string;
  url?: string;
  text?: string;
  score: number;
  by: string;
  time: number;
  descendants?: number;
  kids?: number[];
  type: "story" | "comment" | "job" | "poll" | "pollopt";
}
