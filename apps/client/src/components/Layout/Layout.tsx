import { Outlet } from "react-router-dom";
import { useState } from "react";
import Header from "./Header";
import SkipToMain from "./SkipToMain";
import { useAnnouncements } from "../../hooks/useAnnouncements";
import GoToTop from "../UI/GoToTop";

export default function Layout() {
  const [activeTab, setActiveTab] = useState("discover");
  const { announcement, announce } = useAnnouncements();

  return (
    <div className="min-h-screen bg-slate-900 text-gray-100">
      <SkipToMain />

      {/* Live Region for Announcements */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only">
        {announcement}
      </div>

      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        announce={announce}
      />

      <main
        id="main-content"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet context={{ activeTab, announce }} />
      </main>
      <GoToTop />
    </div>
  );
}
