import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  CheckSquare,
  BarChart3,
  Settings,
  Menu,
  X,
  LogOut,
  Sparkles,
  User
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import api from '../services/api';

const Sidebar = ({ isOpen, setIsOpen }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [username, setUsername] = useState('User');

  const navItems = [
    { path: '/dashboard', icon: LayoutDashboard, labelKey: 'common.dashboard' },
    { path: '/tasks', icon: CheckSquare, labelKey: 'common.all_tasks' },
    { path: '/analytics', icon: BarChart3, labelKey: 'common.analytics' },
    { path: '/settings', icon: Settings, labelKey: 'common.settings' },
  ];

  // ✅ Fetch username ONLY if user exists
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));

    if (!user) {
      setUsername('User');
      return;
    }

    if (user.full_name || user.fullName) {
      const name = user.full_name || user.fullName;
      setUsername(name.split(' ')[0]);
      return;
    }

    // Optional API fallback
    const fetchProfile = async () => {
      try {
        const response = await api.get('/auth/profile');
        setUsername(response.data.user.full_name.split(' ')[0]);
      } catch {
        setUsername('User');
      }
    };

    fetchProfile();
  }, []);

  // ✅ Proper logout handler
  const handleLogout = () => {
    localStorage.clear();          // 🔥 clears token + user
    setUsername('User');           // 🔥 reset UI state
    navigate('/login');            // 🔥 redirect
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-screen bg-white dark:bg-slate-800 shadow-md z-50 sidebar-transition ${
          isOpen 
            ? 'w-64 sm:w-72 lg:w-56 xl:w-60' 
            : 'w-0 lg:w-14'
        } ${!isOpen && 'lg:block hidden'}`}
      >
        {/* Header */}
        <div className={`p-3 sm:p-4 border-b border-gray-200 dark:border-slate-700 ${!isOpen && 'lg:px-2'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-9 sm:h-9 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-md flex items-center justify-center flex-shrink-0">
                <CheckSquare className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              {isOpen && (
                <div className="min-w-0">
                  <h1 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white truncate">
                    TaskFlow
                  </h1>
                  <div className="flex items-center gap-1">
                    <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-blue-500" />
                    <span className="text-xs sm:text-sm font-semibold text-blue-600">
                      {t('common.pro')}
                    </span>
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-md transition-colors flex-shrink-0"
              aria-label={isOpen ? 'Close sidebar' : 'Open sidebar'}
            >
              {isOpen ? <X size={18} className="sm:w-5 sm:h-5" /> : <Menu size={18} className="sm:w-5 sm:h-5" />}
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className={`p-3 sm:p-4 space-y-2 ${!isOpen && 'lg:px-2'}`}>
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => {
                // Close sidebar on mobile after navigation
                if (window.innerWidth < 1024) {
                  setIsOpen(false);
                }
              }}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-md text-sm sm:text-base transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700'
                } ${!isOpen && 'lg:justify-center'}`
              }
            >
              <item.icon className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" />
              {isOpen && <span className="truncate">{t(item.labelKey)}</span>}
            </NavLink>
          ))}
        </nav>

        {/* User + Logout */}
        <div className={`absolute bottom-4 left-0 right-0 px-3 sm:px-4 space-y-2 ${!isOpen && 'lg:px-2'}`}>
          {isOpen ? (
            <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-gray-50 dark:bg-slate-700/50 rounded-md">
              <div className="w-8 h-8 sm:w-9 sm:h-9 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
                <User className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white truncate">
                  {username}
                </p>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 truncate">
                  {t('common.premium_member')}
                </p>
              </div>
            </div>
          ) : (
            <div className="hidden lg:flex justify-center">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
            </div>
          )}

          <button
            onClick={handleLogout}
            className={`w-full flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-md text-sm sm:text-base text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors ${
              !isOpen && 'lg:justify-center'
            }`}
          >
            <LogOut className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" />
            {isOpen && <span className="truncate">{t('common.logout')}</span>}
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
