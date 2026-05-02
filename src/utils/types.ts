export enum Screens {
  HOME = "home",
  FEED = "feed",
  TOP_STORIES = "top-stories",
}

export interface HNItem {
  id: number;
  title: string;
  url?: string;
  score: number;
  by: string;
  time: number;
  descendants?: number;
  type: "story" | "comment" | "job" | "poll" | "pollopt";
}
