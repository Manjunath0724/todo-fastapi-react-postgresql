import React, { useState, useEffect } from 'react';
import {
  User, Mail, Sun, Moon, Download, Save, Check, Loader2
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import api from '../services/api';

const Settings = ({ isDarkMode, toggleTheme }) => {
  const { t } = useTranslation();
  const [profile, setProfile] = useState({ fullName: '', email: '' });
  const [saved, setSaved] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [themeKey, setThemeKey] = useState(localStorage.getItem('colorTheme') || 'modern-dark');

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    setProfile({
      fullName: user.fullName || '',
      email: user.email || ''
    });
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', themeKey);
    localStorage.setItem('colorTheme', themeKey);
  }, [themeKey]);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await api.put('/auth/profile', {
        // 🔒 Email is now immutable – only update full name
        full_name: profile.fullName
      });
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const updatedUser = { 
        ...user, 
        fullName: response.data.user.fullName || profile.fullName,
        email: response.data.user.email || profile.email 
      };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Failed to update profile: ' + (error.response?.data?.detail || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = async () => {
    try {
      setExporting(true);
      const response = await api.get('/tasks');
      const tasks = response.data;
      const headers = ['Title', 'Description', 'Priority', 'Status', 'Due Date', 'Created At'];
      const csvContent = [
        headers.join(','),
        ...tasks.map(task => [
          `"${task.title}"`,
          `"${task.description || ''}"`,
          task.priority,
          task.status,
          task.due_date || '',
          task.created_at || ''
        ].join(','))
      ].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `tasks_export_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error exporting CSV:', error);
      alert('Failed to export tasks');
    } finally {
      setExporting(false);
    }
  };

  const themeOptions = [
    { id: 'modern-dark', label: t('themes.modern_dark') },
    { id: 'glassy-ocean', label: t('themes.glassy_ocean') },
    { id: 'sunset-gradient', label: t('themes.sunset_gradient') },
    { id: 'royal-purple', label: t('themes.royal_purple') },
    { id: 'soft-minimal', label: t('themes.soft_minimal') }
  ];

  return (
    <div className="p-3 sm:p-4 lg:p-6 min-h-screen bg-[var(--bg-main)] text-[var(--text-main)]">
      {/* Header - TINY */}
      <div className="mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-1">
          {t('settings.title')}
        </h1>
        <p className="text-xs sm:text-sm text-[var(--text-muted)]">
          {t('settings.subtitle')}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Main Settings Column */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          {/* Profile Settings */}
          <div className="p-4 sm:p-5 rounded-xl shadow-md border border-[var(--border-color)] bg-[var(--bg-card)]">
            <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-md">
                <User className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-bold">
                  {t('settings.profile')}
                </h2>
                <p className="text-xs sm:text-sm text-[var(--text-muted)]">
                  {t('settings.profile_desc')}
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-3 sm:space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-1.5 sm:mb-2">
                  {t('settings.full_name')}
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={profile.fullName}
                    onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                    disabled={loading}
                    className={`w-full pl-10 pr-3 py-2.5 text-sm border rounded-lg transition-all focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 disabled:opacity-50 ${
                      isDarkMode
                        ? 'bg-gray-700/80 border-gray-600 text-white placeholder-gray-400 focus:bg-gray-600/80'
                        : 'bg-white border-gray-200 text-gray-900 placeholder-gray-500 focus:bg-white'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1.5 sm:mb-2">
                  {t('settings.email')}
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="email"
                    value={profile.email}
                    readOnly
                    className="w-full pl-10 pr-3 py-2.5 text-sm border rounded-lg transition-all focus:ring-2 focus:ring-[var(--accent-primary)] focus:border-[var(--accent-primary)] disabled:opacity-50 bg-[var(--bg-main)] border-[var(--border-color)] text-[var(--text-main)] placeholder-[var(--text-muted)]"
                  />
                </div>
                <p className="mt-1 text-xs sm:text-sm text-[var(--text-muted)]">
                  {t('settings.email_immutable')}
                </p>
              </div>

              <button
                type="submit"
                disabled={loading || saved}
                className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-bold rounded-lg shadow-md transition-all h-11 ${
                  loading || saved
                    ? 'bg-gray-400/80 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 hover:shadow-lg hover:scale-[1.01]'
                } text-white`}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : saved ? (
                  <>
                    <Check className="w-4 h-4" />
                    {t('common.saved')}
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    {t('settings.save_to_db')}
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Appearance & Theme */}
          <div className="p-4 sm:p-5 rounded-xl shadow-md border border-[var(--border-color)] bg-[var(--bg-card)]">
            <div className="flex items-center gap-2 sm:gap-3 mb-4">
              <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg shadow-md">
                {isDarkMode ? <Moon className="w-5 h-5 text-white" /> : <Sun className="w-5 h-5 text-white" />}
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-bold">{t('settings.theme')}</h2>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 sm:p-4 rounded-lg bg-purple-50/80 dark:bg-purple-900/30 border border-purple-200/40 dark:border-purple-800/40">
              <div>
                <h3 className="text-sm font-bold">Dark Mode</h3>
                <p className="text-xs text-[var(--text-muted)]">Light/Dark theme</p>
              </div>
              <button
                onClick={toggleTheme}
                className={`relative inline-flex h-10 w-14 rounded-full p-1 transition-all shadow-md ${
                  isDarkMode 
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 shadow-purple-500/25' 
                    : 'bg-gradient-to-r from-gray-200 to-gray-300 shadow-gray-400/25'
                }`}
              >
                <span
                  className={`inline-flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-sm transition-transform ${
                    isDarkMode ? 'translate-x-3 rotate-180' : 'translate-x-1'
                  }`}
                >
                  {isDarkMode ? (
                    <Moon className="w-4 h-4 text-purple-600" />
                  ) : (
                    <Sun className="w-4 h-4 text-gray-600" />
                  )}
                </span>
              </button>
            </div>
            </div>

            {/* Color Theme Selector */}
            <div className="mt-4 border-t border-[var(--border-color)] pt-3 sm:pt-4">
              <p className="text-xs sm:text-sm font-semibold text-[var(--text-muted)] mb-2">
                {t('settings.theme')} Palette
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                {themeOptions.map((theme) => (
                  <button
                    key={theme.id}
                    type="button"
                    onClick={() => setThemeKey(theme.id)}
                    className={`flex items-center justify-between px-3 py-2 rounded-lg border text-xs sm:text-sm ${
                      themeKey === theme.id
                        ? 'border-[var(--accent-primary)] bg-[var(--accent-primary)]/10 text-[var(--accent-primary)]'
                        : 'border-[var(--border-color)] bg-[var(--bg-main)]/40 text-[var(--text-main)]'
                    }`}
                  >
                    <span>{theme.label}</span>
                    {themeKey === theme.id && (
                      <span className="w-2.5 h-2.5 rounded-full bg-[var(--accent-primary)]" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Export */}
          <div className="p-4 sm:p-5 rounded-xl shadow-md border border-[var(--border-color)] bg-[var(--bg-card)]">
            <div className="flex items-center gap-2 sm:gap-3 mb-4">
              <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg shadow-md">
                <Download className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-bold">{t('common.export')}</h2>
                <p className="text-xs sm:text-sm text-[var(--text-muted)]">Download tasks</p>
              </div>
            </div>

            <div className="border rounded-lg p-3 mb-4 bg-emerald-50/80 dark:bg-emerald-900/30 border-emerald-200/60 dark:border-emerald-800">
              <p className="text-xs sm:text-sm text-emerald-800 dark:text-emerald-200">
                Export all tasks to CSV
              </p>
            </div>
            <button
              onClick={handleExportCSV}
              disabled={exporting}
              className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-bold rounded-lg shadow-md transition-all h-11 ${
                exporting
                  ? 'bg-gray-400/80 cursor-not-allowed'
                  : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 hover:shadow-lg hover:scale-[1.01]'
              } text-white`}
            >
              {exporting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {t('common.exporting')}
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  {t('common.export_csv')}
                </>
              )}
            </button>
          </div>
        </div>

        {/* Sidebar - EXTRA SMALL */}
        <div className="space-y-4 sm:space-y-6">
          <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl p-4 sm:p-5 text-white shadow-lg">
            <div className="w-14 sm:w-16 h-14 sm:h-16 bg-white/20 rounded-xl flex items-center justify-center mb-3 mx-auto">
              <User className="w-7 h-7" />
            </div>
            <h3 className="text-center font-black text-base sm:text-lg mb-1">
              {profile.fullName || 'User'}
            </h3>
            <p className="text-center text-blue-100 text-xs sm:text-sm mb-3 bg-white/10 rounded-lg p-2">
              {profile.email || 'user@example.com'}
            </p>
            <div className="bg-white/20 rounded-lg p-2 text-center">
              <div className="text-lg font-black mb-0.5">PRO</div>
              <div className="text-xs font-semibold text-blue-100">Premium</div>
            </div>
          </div>

          <div className={`p-4 sm:p-5 rounded-xl shadow-md border ${isDarkMode ? 'bg-gray-800/90 border-gray-700/50' : 'bg-white/90 border-gray-200/50'}`}>
            <h3 className="font-black text-base sm:text-lg text-gray-900 dark:text-white mb-3 sm:mb-4">
              Stats
            </h3>
            <div className="space-y-2 text-xs sm:text-sm">
              <div className="flex justify-between py-1.5 border-b border-gray-200 dark:border-gray-700">
                <span className="text-gray-600 dark:text-gray-300">Since</span>
                <span className="font-bold text-gray-900 dark:text-white">Jan 2026</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-gray-200 dark:border-gray-700">
                <span className="text-gray-600 dark:text-gray-300">Created</span>
                <span className="font-bold text-gray-900 dark:text-white">156</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-gray-200 dark:border-gray-700">
                <span className="text-gray-600 dark:text-gray-300">Done</span>
                <span className="font-bold text-gray-900 dark:text-white">142</span>
              </div>
              <div className="flex justify-between py-2 pt-1.5">
                <span className="text-gray-600 dark:text-gray-300">Rate</span>
                <span className="font-bold text-green-600 dark:text-green-400 text-sm">91%</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-amber-400 to-orange-500 rounded-xl p-4 sm:p-5 text-white shadow-lg border border-amber-300/50">
            <h3 className="font-black text-base sm:text-lg mb-2">💡 Tip</h3>
            <p className="text-xs sm:text-sm leading-tight">
              Changes save instantly to PostgreSQL & sync everywhere!
            </p>
          </div>
        </div>
        </div>
  );
};
export default Settings;