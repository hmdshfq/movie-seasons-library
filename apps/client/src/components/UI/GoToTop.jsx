import { useEffect, useState, useCallback } from 'react';

// Floating "Go to top" button consistent with app design system
export default function GoToTop() {
  const [visible, setVisible] = useState(false);

  const onScroll = useCallback(() => {
    const y = window.scrollY || document.documentElement.scrollTop;
    setVisible(y > 400);
  }, []);

  useEffect(() => {
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [onScroll]);

  const handleClick = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div aria-live="polite" className="pointer-events-none">
      <button
        type="button"
        aria-label="Go to top"
        onClick={handleClick}
        className={
          `pointer-events-auto fixed bottom-6 right-6 z-40 inline-flex items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-300 ` +
          // Align with app primary (indigo) used in components.css
          `bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg focus:ring-indigo-500 focus:ring-offset-slate-900 ` +
          // Size
          `h-12 w-12 ` +
          // Motion: respect reduced-motion preference for opacity only
          (visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4')
        }
      >
        {/* Up arrow icon styled like nav icons */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className=""
        >
          <path d="M12 19V5" />
          <path d="M5 12l7-7 7 7" />
        </svg>
      </button>
    </div>
  );
}
