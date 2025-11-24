import { useState, useRef, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function MobileNav({ activeTab, setActiveTab, tabs, announce }) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const handleTabClick = (tab) => {
    setActiveTab(tab.id);
    announce(`Switched to ${tab.label} tab`);
    navigate(tab.route);
    setIsOpen(false);
  };

  return (
    <div ref={menuRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-lg hover:bg-slate-700 transition-colors md:hidden"
        aria-label="Toggle navigation menu"
        aria-expanded={isOpen}>
        {isOpen ? (
          <X size={24} className="text-white" />
        ) : (
          <Menu size={24} className="text-white" />
        )}
      </button>

      {isOpen && (
        <>
          {/* Overlay - smooth backdrop */}
          <div
            className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm transition-opacity duration-200"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />

          {/* Mobile Menu - full width drawer from top */}
          <nav
            className="fixed top-16 inset-x-0 bg-slate-800 z-50 overflow-hidden md:hidden animate-slideDown border-b border-slate-700 shadow-lg"
            role="navigation"
            aria-label="Mobile navigation">
            <ul className="flex flex-col max-h-[calc(100vh-64px)] overflow-y-auto">
              {tabs.map((tab) => (
                <li key={tab.id}>
                  <button
                    onClick={() => handleTabClick(tab)}
                    className={`w-full text-left px-6 py-4 font-medium transition-colors border-b border-slate-700 last:border-b-0 text-lg ${
                      activeTab === tab.id
                        ? "bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-md"
                        : "text-gray-300 hover:bg-slate-700 hover:text-white"
                    }`}
                    aria-current={activeTab === tab.id ? "page" : undefined}>
                    {tab.label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </>
      )}
    </div>
  );
}
