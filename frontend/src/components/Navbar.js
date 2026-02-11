import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

const quotes = [
  "Do it now. Later becomes never.",
  "Small steps every day lead to big results.",
  "Done is better than perfect.",
  "Action beats intention every time.",
  "Progress not perfection."
];

const Navbar = ({ onLogout }) => {
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
    <nav className="bg-white/20 backdrop-blur-md shadow-lg sticky top-0 z-50 border-b border-white/30 dark:bg-gray-900/80 dark:border-gray-700/50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14 sm:h-16 lg:h-20">
          {/* Logo - Smaller */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 lg:w-11 lg:h-11 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-xl sm:text-2xl lg:text-2xl font-black text-white">T</span>
            </div>
            <h1 className="text-xl sm:text-2xl lg:text-2xl font-extrabold text-white tracking-tight">
              TaskFlow <span className="text-blue-300">Pro</span>
            </h1>
          </div>

          {/* Quote + Language + Logout */}
          <div className="flex items-center space-x-3 sm:space-x-4 ml-auto">
            {/* Animated Quote - Smaller */}
            <div className="max-w-xs sm:max-w-sm lg:max-w-md overflow-hidden">
              <span className="text-sm sm:text-base lg:text-lg font-semibold tracking-wide 
                    bg-gradient-to-r from-slate-100 via-blue-200 to-indigo-300 
                    bg-clip-text text-transparent">
                {displayedText}
                <span className="inline-block ml-1 w-[2px] h-4 sm:h-5 
                      bg-indigo-300 animate-pulse align-middle" />
              </span>
            </div>

            {/* Language Selector */}
            <select
              value={currentLang}
              onChange={handleLanguageChange}
              className="text-xs sm:text-sm bg-white/80 dark:bg-gray-800 text-gray-800 dark:text-gray-100 px-2 sm:px-3 py-1.5 rounded-lg border border-white/40 dark:border-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option value="en">{t('languages.en')}</option>
              <option value="hi">{t('languages.hi')}</option>
              <option value="mr">{t('languages.mr')}</option>
            </select>

            {/* Logout Button - Smaller */}
            <button
              onClick={onLogout}
              className="bg-gradient-to-br from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 text-white px-5 sm:px-6 lg:px-7 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl font-semibold shadow-lg sm:shadow-xl transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 text-sm sm:text-base"
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
