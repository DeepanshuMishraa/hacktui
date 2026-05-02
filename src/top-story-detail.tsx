import StoryDetail from "./story-detail";
import type { HNItem } from "./utils/types";

interface TopStoryDetailProps {
  story: HNItem;
  onBack: () => void;
}

export default function TopStoryDetail({ story, onBack }: TopStoryDetailProps) {
  return <StoryDetail story={story} onBack={onBack} sourceLabel="Best Stories" />;
}