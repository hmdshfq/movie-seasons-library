import { useAuth } from "../../contexts/AuthContext";
import UserMenu from "./UserMenu";
import MobileNav from "./MobileNav";
import { useNavigate } from "react-router-dom";
import { getTabIcon } from "../../utils/navIcons";

export default function Header({ activeTab, setActiveTab, announce }) {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const tabs = [
    { id: "discover", label: "Discover", route: "/" },
    { id: "library", label: "Watched", route: "/library" },
    { id: "watchlist", label: "Watchlist", route: "/watchlist" },
  ];

  const handleTabClick = (tab) => {
    setActiveTab(tab.id);
    announce(`Switched to ${tab.label} tab`);
    navigate(tab.route);
  };

  return (
    <header className="sticky top-0 z-50 bg-linear-to-b from-slate-800 to-slate-900 backdrop-blur-lg animate-slideIn">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black bg-linear-to-r from-indigo-500 to-pink-500 bg-clip-text text-transparent">
            MOSE
          </h1>

          <div className="flex items-center gap-2 sm:gap-4">
            {/* Desktop Navigation */}
            <nav
              role="navigation"
              aria-label="Main navigation"
              className="hidden md:block">
              <ul className="flex gap-2 bg-slate-800 p-1 rounded-full">
                {tabs.map((tab) => {
                  const Icon = getTabIcon(tab.id);
                  return (
                    <li key={tab.id}>
                      <button
                        onClick={() => handleTabClick(tab)}
                        className={`px-6 py-2 rounded-full font-medium transition-all duration-300 flex items-center gap-2 ${
                          activeTab === tab.id
                            ? "bg-indigo-600 text-white shadow-lg"
                            : "text-gray-400 hover:text-white"
                        }`}
                        aria-current={
                          activeTab === tab.id ? "page" : undefined
                        }
                        aria-label={tab.label}>
                        <Icon size={18} />
                        <span className="hidden lg:inline">{tab.label}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </nav>

            {/* Tablet Navigation (icon-only) */}
            <nav
              role="navigation"
              aria-label="Main navigation"
              className="hidden sm:block md:hidden">
              <ul className="flex gap-2 bg-slate-800 p-1 rounded-full">
                {tabs.map((tab) => {
                  const Icon = getTabIcon(tab.id);
                  return (
                    <li key={tab.id}>
                      <button
                        onClick={() => handleTabClick(tab)}
                        className={`p-2 rounded-full transition-all duration-300 group relative ${
                          activeTab === tab.id
                            ? "bg-indigo-600 text-white shadow-lg"
                            : "text-gray-400 hover:text-white"
                        }`}
                        aria-current={
                          activeTab === tab.id ? "page" : undefined
                        }
                        aria-label={tab.label}
                        title={tab.label}>
                        <Icon size={20} />
                        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 text-xs bg-slate-900 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                          {tab.label}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </nav>

            {/* Mobile Navigation */}
            <MobileNav
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              tabs={tabs}
              announce={announce}
            />

            <UserMenu />
          </div>
        </div>
      </div>
    </header>
  );
}
