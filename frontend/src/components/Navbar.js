// Purpose: Top navigation bar with responsive menu toggle, i18n switcher, and sign-out
// Why: Provides global controls and brand identity across all pages
// How: Typewriter effect cycles motivational quotes; logout clears auth data
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { PanelLeft, LogOut } from "lucide-react";

// Quotes used by the typewriter animation to encourage productivity
const quotes = [
  "Do it now. Later becomes never.",
  "Small steps every day lead to big results.",
  "Done is better than perfect.",
  "Action beats intention every time.",
  "Progress not perfection."
];

const Navbar = ({ onLogout, onToggleMenu, isSidebarOpen }) => {
  const { t, i18n } = useTranslation();
  // Track which quote and character position is currently displayed
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  // Typewriter animation: type, pause, delete, then proceed to next quote
  useEffect(() => {
    const currentQuote = quotes[quoteIndex];
    let timer;

    // Typing forward
    if (!isDeleting && charIndex < currentQuote.length) {
      timer = setTimeout(() => {
        setDisplayedText((prev) => prev + currentQuote[charIndex]);
        setCharIndex((prev) => prev + 1);
      }, 70);
    }

    // Pause at end of quote before deleting
    if (!isDeleting && charIndex === currentQuote.length) {
      timer = setTimeout(() => {
        setIsDeleting(true);
      }, 1500);
    }

    // Delete characters
    if (isDeleting && charIndex > 0) {
      timer = setTimeout(() => {
        setDisplayedText((prev) => prev.slice(0, -1));
        setCharIndex((prev) => prev - 1);
      }, 40);
    }

    // After deletion completes, move to next quote
    if (isDeleting && charIndex === 0) {
      setIsDeleting(false);
      setQuoteIndex((prev) => (prev + 1) % quotes.length);
    }

    return () => clearTimeout(timer);
  }, [charIndex, isDeleting, quoteIndex]);

  // Switch active language and persist choice
  const handleLanguageChange = (e) => {
    const lang = e.target.value;
    i18n.changeLanguage(lang);
    localStorage.setItem('i18nextLng', lang);
  };

  // Normalize language code (e.g., en-US -> en)
  const currentLang = i18n.language?.split('-')[0] || 'en';

  return (
    <nav className={`bg-white dark:bg-slate-900 shadow-md sticky top-0 z-50 border-b border-gray-200 dark:border-slate-800 transition-all duration-300 ${isSidebarOpen ? 'lg:ml-60' : 'lg:ml-20'} ml-0`}>
      <div className="max-w-full mx-auto px-3 sm:px-4">
        <div className="flex justify-between items-center h-14 sm:h-16 lg:h-20">
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Menu Toggle Button */}
            <button
              onClick={onToggleMenu}
              className="p-1.5 sm:p-2.5 rounded-lg sm:rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 transition-all active:scale-95 group"
              aria-label="Toggle Menu"
            >
              <PanelLeft className="w-5 h-5 sm:w-6 sm:h-6 group-hover:text-blue-600 dark:group-hover:text-blue-400" />
            </button>

            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-xl sm:text-2xl font-black text-white">T</span>
              </div>
              <h1 className="text-lg sm:text-xl md:text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                TaskFlow <span className="text-blue-600 dark:text-blue-400">Pro</span>
              </h1>
            </div>
          </div>

          {/* Quote + Language + Logout */}
          <div className="flex items-center space-x-2 sm:space-x-3 md:space-x-4">
            {/* Animated Quote */}
            <div className="hidden md:block overflow-hidden min-w-[200px] text-right">
              <span className="text-sm lg:text-base font-medium text-gray-600 dark:text-gray-400">
                {displayedText}
                <span className="inline-block ml-1 w-[2px] h-4 bg-blue-500 animate-pulse align-middle" />
              </span>
            </div>

            {/* Language Selector: feeds react-i18next to re-render content */}
            <select
              value={currentLang}
              onChange={handleLanguageChange}
              className="text-xs sm:text-sm bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white px-2 py-1 sm:px-3 sm:py-2 rounded-lg sm:rounded-xl border border-gray-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            >
              <option value="en">English</option>
              <option value="hi">हिंदी</option>
              <option value="mr">मराठी</option>
            </select>

            {/* Logout Button: delegates to parent to clear auth and route */}
            <button
              onClick={onLogout}
              className="flex items-center gap-2 bg-red-500/10 hover:bg-red-500 text-red-600 hover:text-white px-3 py-1.5 sm:px-4 sm:py-2.5 rounded-lg sm:rounded-xl font-bold transition-all active:scale-95 text-xs sm:text-sm group"
            >
              <LogOut className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
              <span className="hidden sm:inline">{t('common.logout')}</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
