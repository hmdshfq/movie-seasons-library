import { Compass, Bookmark, Sparkles, Library } from "lucide-react";

export const getTabIcon = (tabId) => {
  const iconMap = {
    discover: Compass,
    watchlist: Bookmark,
    recommendations: Sparkles,
    library: Library,
  };
  return iconMap[tabId];
};
