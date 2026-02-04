import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
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

const Sidebar = ({ isOpen, setIsOpen, onLogout }) => {
  const [username, setUsername] = useState('User');
  
  const navItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/tasks', icon: CheckSquare, label: 'All Tasks' },
    { path: '/analytics', icon: BarChart3, label: 'Analytics' },
    { path: '/settings', icon: Settings, label: 'Settings' },
  ];

  // Fetch username from database
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        if (user.fullName) {
          setUsername(user.fullName.split(' ')[0]); // First name only
        }
        // Also try to fetch from API if localStorage is empty
        const response = await api.get('/auth/profile');
        setUsername(response.data.user.full_name?.split(' ')[0] || 'User');
      } catch (error) {
        console.error('Error fetching user profile:', error);
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        setUsername(user.fullName?.split(' ')[0] || 'User');
      }
    };

    fetchUserProfile();
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
        className={`fixed top-0 left-0 h-screen bg-white dark:bg-slate-800 shadow-md z-50 transition-all duration-200 ${
          isOpen ? 'w-56 sm:w-60' : 'w-14'
        }`}
      >
        {/* Header */}
        <div className="p-2.5 sm:p-3 border-b border-gray-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            {isOpen && (
              <div className="flex items-center gap-1.5 sm:gap-2">
                <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-md flex items-center justify-center shadow-md">
                  <CheckSquare className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white">TaskFlow</h1>
                  <div className="flex items-center gap-0.5 mt-0.5">
                    <Sparkles className="w-2.5 h-2.5 text-blue-500" />
                    <span className="text-xs font-semibold bg-gradient-to-r from-blue-500 to-blue-700 text-transparent bg-clip-text">
                      PRO
                    </span>
                  </div>
                </div>
              </div>
            )}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-1.5 sm:p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-md transition-colors"
            >
              {isOpen ? (
                <X className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 dark:text-gray-300" />
              ) : (
                <Menu className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 dark:text-gray-300" />
              )}
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-2.5  sm:p-4 space-y-1.5 sm:space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-2 sm:gap-3 px-2.5 py-2 sm:py-2.5 rounded-md transition-all duration-200 text-sm ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700'
                } ${!isOpen && 'justify-center py-2.5'}`  
              }
            >
              <item.icon className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
              {isOpen && <span className="font-medium">{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Username + Logout Section */}
        <div className="absolute bottom-3 sm:bottom-4 left-0 right-0 px-2.5  sm:px-4 space-y-2">
          {/* 🔥 USERNAME FROM DATABASE */}
          {isOpen && (
            <div className="flex items-center gap-2 p-2.5 rounded-md bg-gray-50 dark:bg-slate-700/50 border border-gray-200/50 dark:border-slate-600/50">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-sm">
                <User className="w-4 h-4 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                  {username}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  Premium Member
                </p>
              </div>
            </div>
          )}

          {/* Logout Button */}
          <button
            onClick={onLogout}
            className={`w-full flex items-center gap-2 px-2.5 py-2 sm:py-2.5 rounded-md text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all text-xs sm:text-sm ${
              !isOpen && 'justify-center py-2.5'
            }`}
          >
            <LogOut className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
            {isOpen && <span className="font-medium">Logout</span>}
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
