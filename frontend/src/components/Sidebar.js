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
import api from '../services/api';

const Sidebar = ({ isOpen, setIsOpen }) => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('User');

  const navItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/tasks', icon: CheckSquare, label: 'All Tasks' },
    { path: '/analytics', icon: BarChart3, label: 'Analytics' },
    { path: '/settings', icon: Settings, label: 'Settings' },
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
          isOpen ? 'w-56 sm:w-60' : 'w-14'
        }`}
      >
        {/* Header */}
        <div className="p-3 border-b border-gray-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-md flex items-center justify-center">
                <CheckSquare className="w-5 h-5 text-white" />
              </div>
              {isOpen && (
                <div>
                  <h1 className="text-base font-bold text-gray-900 dark:text-white">
                    TaskFlow
                  </h1>
                  <div className="flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-blue-500" />
                    <span className="text-xs font-semibold text-blue-600">
                      PRO
                    </span>
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-md"
            >
              {isOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700'
                } ${!isOpen && 'justify-center'}`
              }
            >
              <item.icon className="w-5 h-5" />
              {isOpen && item.label}
            </NavLink>
          ))}
        </nav>

        {/* User + Logout */}
        <div className="absolute bottom-4 left-0 right-0 px-4 space-y-2">
          {isOpen ? (
            <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-slate-700/50 rounded-md">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  {username}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Premium Member
                </p>
              </div>
            </div>
          ) : (
            <div className="flex justify-center">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
            </div>
          )}

          <button
            onClick={handleLogout}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 ${
              !isOpen && 'justify-center'
            }`}
          >
            <LogOut className="w-5 h-5" />
            {isOpen && 'Logout'}
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
