import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  CheckSquare,
  BarChart3,
  Settings,
  Menu,
  X,
  Sparkles,
  User
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import api from '../services/api';

const Sidebar = ({ isOpen, setIsOpen }) => {
  const { t } = useTranslation();
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
        className={`fixed top-16 lg:top-20 left-0 h-[calc(100vh-4rem)] lg:h-[calc(100vh-5rem)] bg-white dark:bg-slate-900 shadow-2xl z-40 transition-all duration-300 ease-in-out border-r border-gray-200 dark:border-slate-800 ${
          isOpen 
            ? 'w-64 sm:w-72 lg:w-60' 
            : 'w-0 lg:w-20'
        } ${!isOpen && 'lg:block hidden'}`}
      >
        {/* Navigation */}
        <nav className={`p-4 space-y-2 h-full flex flex-col ${!isOpen ? 'items-center' : ''}`}>
          <div className="flex-grow overflow-y-auto overflow-x-hidden space-y-2 custom-scrollbar">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => {
                  if (window.innerWidth < 1024) setIsOpen(false);
                }}
                className={({ isActive }) =>
                  `group relative flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-lg shadow-blue-500/25'
                      : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700/50 hover:text-gray-900 dark:hover:text-white'
                  } ${!isOpen ? 'w-12 h-12 justify-center p-0' : 'w-full'}`
                }
              >
                <item.icon className={`w-6 h-6 flex-shrink-0 transition-transform group-hover:scale-110`} />
                {isOpen && (
                  <span className="font-semibold truncate animate-in fade-in slide-in-from-left-2">
                    {t(item.labelKey)}
                  </span>
                )}
                
                {!isOpen && (
                  <div className="absolute left-full ml-4 px-3 py-2 bg-gray-900 text-white text-xs font-bold rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-[60] shadow-xl border border-white/10">
                    {t(item.labelKey)}
                    <div className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 border-8 border-transparent border-r-gray-900" />
                  </div>
                )}
              </NavLink>
            ))}
          </div>

          {/* User Footer - Inside Nav to benefit from flex-col */}
          <div className={`pt-4 border-t border-gray-100 dark:border-slate-800 ${!isOpen ? 'flex justify-center' : ''}`}>
            {isOpen ? (
              <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-slate-700/30 rounded-2xl border border-gray-100 dark:border-slate-700/50">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
                    {username}
                  </p>
                  <p className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-tighter">
                    {t('common.premium_member')}
                  </p>
                </div>
              </div>
            ) : (
              <div className="group relative">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg hover:scale-110 transition-transform cursor-pointer">
                  <User className="w-6 h-6 text-white" />
                </div>
                <div className="absolute left-full ml-4 bottom-0 px-4 py-3 bg-gray-900 text-white rounded-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-[60] shadow-2xl border border-white/10">
                  <p className="font-bold">{username}</p>
                  <p className="text-[10px] text-blue-400 font-black uppercase tracking-tighter">{t('common.premium_member')}</p>
                </div>
              </div>
            )}
          </div>
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
