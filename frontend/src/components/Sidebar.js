// Purpose: Responsive navigation rail with routes and compact tooltip mode
// Why: Gives quick access to core pages and keeps context visible while working
// How: Collapses on small screens; shows tooltips when collapsed on desktop
import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  CheckSquare,
  BarChart3,
  Settings,
  User
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import api from '../services/api';

const Sidebar = ({ isOpen, setIsOpen }) => {
  const { t } = useTranslation();
  // Show first name from cached user or fallback to generic
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

    // Optional API fallback if local cache incomplete
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
        className={`fixed top-16 lg:top-20 left-0 h-[calc(100vh-4rem)] lg:h-[calc(100vh-5rem)] bg-[var(--bg-sidebar)] shadow-2xl z-40 transition-all duration-300 ease-in-out border-r border-[var(--border-color)] ${isOpen
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
                  `group relative flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-200 ${isActive
                    ? 'bg-[var(--accent-primary)] text-white shadow-lg shadow-[var(--accent-primary)]/25'
                    : 'text-[var(--text-muted)] hover:bg-[var(--accent-secondary)] hover:text-[var(--text-main)]'
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
                  <div className="absolute left-full ml-4 px-3 py-2 bg-[var(--bg-card)] text-[var(--text-main)] text-xs font-bold rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-[60] shadow-xl border border-[var(--border-color)]">
                    {t(item.labelKey)}
                    <div className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 border-8 border-transparent border-r-[var(--bg-card)]" />
                  </div>
                )}
              </NavLink>
            ))}
          </div>

          {/* User Footer - Inside Nav to benefit from flex-col */}
          <div className={`pt-4 border-t border-[var(--border-color)] ${!isOpen ? 'flex justify-center' : ''}`}>
            {isOpen ? (
              <div className="flex items-center gap-3 p-3 bg-[var(--bg-main)] rounded-2xl border border-[var(--border-color)]">
                <div className="w-10 h-10 bg-[var(--accent-primary)] rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-[var(--text-main)] truncate">
                    {username}
                  </p>
                  <p className="text-[10px] font-black text-[var(--accent-primary)] uppercase tracking-tighter">
                    {t('common.premium_member')}
                  </p>
                </div>
              </div>
            ) : (
              <div className="group relative">
                <div className="w-12 h-12 bg-[var(--accent-primary)] rounded-xl flex items-center justify-center shadow-lg hover:scale-110 transition-transform cursor-pointer">
                  <User className="w-6 h-6 text-white" />
                </div>
                <div className="absolute left-full ml-4 bottom-0 px-4 py-3 bg-[var(--bg-card)] text-[var(--text-main)] rounded-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-[60] shadow-2xl border border-[var(--border-color)]">
                  <p className="font-bold">{username}</p>
                  <p className="text-[10px] text-[var(--accent-primary)] font-black uppercase tracking-tighter">{t('common.premium_member')}</p>
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
