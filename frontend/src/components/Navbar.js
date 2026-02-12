import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

const quotes = [
  "Do it now. Later becomes never.",
  "Small steps every day lead to big results.",
  "Done is better than perfect.",
  "Action beats intention every time.",
  "Progress not perfection."
];

const Navbar = ({ onLogout, onToggleMenu }) => {
  const { t, i18n } = useTranslation();
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentQuote = quotes[quoteIndex];
    let timer;

    // Typing letters
    if (!isDeleting && charIndex < currentQuote.length) {
      timer = setTimeout(() => {
        setDisplayedText((prev) => prev + currentQuote[charIndex]);
        setCharIndex((prev) => prev + 1);
      }, 70);
    }

    // Pause after typing full sentence
    if (!isDeleting && charIndex === currentQuote.length) {
      timer = setTimeout(() => {
        setIsDeleting(true);
      }, 1500);
    }

    // Deleting letters
    if (isDeleting && charIndex > 0) {
      timer = setTimeout(() => {
        setDisplayedText((prev) => prev.slice(0, -1));
        setCharIndex((prev) => prev - 1);
      }, 40);
    }

    // Move to next quote
    if (isDeleting && charIndex === 0) {
      setIsDeleting(false);
      setQuoteIndex((prev) => (prev + 1) % quotes.length);
    }

    return () => clearTimeout(timer);
  }, [charIndex, isDeleting, quoteIndex]);

  const handleLanguageChange = (e) => {
    const lang = e.target.value;
    i18n.changeLanguage(lang);
    localStorage.setItem('i18nextLng', lang);
  };

  const currentLang = i18n.language?.split('-')[0] || 'en';

  return (
    <nav className="bg-white dark:bg-slate-900 shadow-md sticky top-0 z-50 border-b border-gray-200 dark:border-slate-800 transition-colors duration-300">
      <div className="max-w-full mx-auto px-4 sm:px-6">
        <div className="flex justify-between items-center h-16 lg:h-20">
          <div className="flex items-center gap-4">
            {/* Menu Toggle Button */}
            <button
              onClick={onToggleMenu}
              className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Toggle Menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
              </svg>
            </button>

            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-2xl font-black text-white">T</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                TaskFlow <span className="text-blue-600 dark:text-blue-400">Pro</span>
              </h1>
            </div>
          </div>

          {/* Quote + Language + Logout */}
          <div className="flex items-center space-x-4">
            {/* Animated Quote */}
            <div className="hidden md:block overflow-hidden min-w-[200px] text-right">
              <span className="text-sm lg:text-base font-medium text-gray-600 dark:text-gray-400">
                {displayedText}
                <span className="inline-block ml-1 w-[2px] h-4 bg-blue-500 animate-pulse align-middle" />
              </span>
            </div>

            {/* Language Selector */}
            <select
              value={currentLang}
              onChange={handleLanguageChange}
              className="text-sm bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white px-3 py-2 rounded-xl border border-gray-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            >
              <option value="en">English</option>
              <option value="hi">हिंदी</option>
              <option value="mr">मराठी</option>
            </select>

            {/* Logout Button */}
            <button
              onClick={onLogout}
              className="bg-red-500 hover:bg-red-600 text-white px-5 py-2.5 rounded-xl font-semibold shadow-md hover:shadow-lg transition-all active:scale-95 text-sm"
            >
              {t('common.logout')}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
