import StoryDetail from "./story-detail";
import type { HNItem } from "./utils/types";

interface FeedDetailProps {
  story: HNItem;
  onBack: () => void;
}

export default function FeedDetail({ story, onBack }: FeedDetailProps) {
  return <StoryDetail story={story} onBack={onBack} sourceLabel="Top Stories" />;
}