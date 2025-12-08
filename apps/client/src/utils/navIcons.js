import { Compass, Bookmark, Sparkles, Library } from "lucide-react";

export const getTabIcon = (tabId) => {
  const iconMap = {
    discover: Compass,
    watchlist: Bookmark,
    library: Library,
  };
  return iconMap[tabId];
};
