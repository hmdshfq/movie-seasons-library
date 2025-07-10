import { useAuth } from "../../contexts/AuthContext";
import UserMenu from "./UserMenu";

export default function Header({ activeTab, setActiveTab, announce }) {
  const { profile } = useAuth();
  const tabs = [
    { id: "discover", label: "Discover" },
    { id: "library", label: "My Library" },
    { id: "watchlist", label: "Watchlist" },
    { id: "recommendations", label: "For You" },
  ];

  return (
    <header className="sticky top-0 z-50 bg-gradient-to-b from-slate-800 to-slate-900 backdrop-blur-lg animate-slideIn">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <h1 className="text-4xl font-black bg-gradient-to-r from-indigo-500 to-pink-500 bg-clip-text text-transparent">
            Movie Library
          </h1>

          <div className="flex items-center gap-4">
            <nav role="navigation" aria-label="Main navigation">
              <ul className="flex gap-2 bg-slate-800 p-1 rounded-full">
                {tabs.map((tab) => (
                  <li key={tab.id}>
                    <button
                      onClick={() => {
                        setActiveTab(tab.id);
                        announce(`Switched to ${tab.label} tab`);
                      }}
                      className={`px-6 py-2 rounded-full font-medium transition-all duration-300 ${
                        activeTab === tab.id
                          ? "bg-indigo-600 text-white shadow-lg"
                          : "text-gray-400 hover:text-white"
                      }`}
                      aria-current={activeTab === tab.id ? "page" : undefined}
                      aria-label={tab.label}>
                      {tab.label}
                    </button>
                  </li>
                ))}
              </ul>
            </nav>

            {profile && <UserMenu />}
          </div>
        </div>
      </div>
    </header>
  );
}
