import React, { useState, useEffect } from 'react';
import {
  User, Mail, Sun, Moon, Download, Save, Check, Loader2, Sparkles, BarChart3
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import api from '../services/api';

const Settings = ({ isDarkMode, toggleTheme }) => {
  const { t } = useTranslation();
  const [profile, setProfile] = useState({ fullName: '', email: '' });
  const [saved, setSaved] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    setProfile({
      fullName: user.fullName || '',
      email: user.email || ''
    });
  }, []);

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

  return (
    <div className="p-3 sm:p-4 lg:p-6 min-h-screen bg-[var(--bg-main)] text-[var(--text-main)]">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-1">
          {t('settings.title')}
        </h1>
        <p className="text-sm sm:text-base text-[var(--text-muted)]">
          {t('settings.subtitle')}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Profile & Appearance */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile Settings */}
          <div className="p-5 sm:p-6 rounded-2xl shadow-xl border border-[var(--border-color)] bg-[var(--bg-card)] backdrop-blur-sm transition-all hover:shadow-2xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold">
                  {t('settings.profile')}
                </h2>
                <p className="text-sm text-[var(--text-muted)]">
                  {t('settings.profile_desc')}
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold mb-2">
                    {t('settings.full_name')}
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={profile.fullName}
                      onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                      disabled={loading}
                      className="w-full pl-10 pr-4 py-3 bg-[var(--bg-main)] border border-[var(--border-color)] rounded-xl text-[var(--text-main)] outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">
                    {t('settings.email')}
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      value={profile.email}
                      readOnly
                      className="w-full pl-10 pr-4 py-3 bg-[var(--bg-main)]/50 border border-[var(--border-color)] rounded-xl text-[var(--text-main)] opacity-70 cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || saved}
                className="w-full md:w-auto px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-bold shadow-lg transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : saved ? <Check className="w-5 h-5" /> : <Save className="w-5 h-5" />}
                {loading ? 'Saving...' : saved ? t('common.saved') : t('settings.save_to_db')}
              </button>
            </form>
          </div>

          {/* Appearance & Theme Toggle */}
          <div className="p-5 sm:p-6 rounded-2xl shadow-xl border border-[var(--border-color)] bg-[var(--bg-card)] backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl shadow-lg">
                {isDarkMode ? <Moon className="w-6 h-6 text-white" /> : <Sun className="w-6 h-6 text-white" />}
              </div>
              <div>
                <h2 className="text-xl font-bold">{t('settings.theme')}</h2>
                <p className="text-sm text-[var(--text-muted)]">Customize your experience</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 rounded-xl bg-[var(--bg-main)] border border-[var(--border-color)]">
                <div>
                  <h3 className="font-bold">Dark Mode</h3>
                  <p className="text-sm text-[var(--text-muted)]">Switch between light and dark</p>
                </div>
                <button
                  onClick={toggleTheme}
                  className={`relative inline-flex h-8 w-14 rounded-full transition-colors ${isDarkMode ? 'bg-blue-600' : 'bg-gray-300'}`}
                >
                  <span className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform mt-1 ${isDarkMode ? 'translate-x-7' : 'translate-x-1'}`} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Stats & Pro Card */}
        <div className="space-y-6">
          {/* User Profile Card */}
          <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-6 text-white shadow-2xl transition-transform hover:scale-[1.02]">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Sparkles className="w-24 h-24" />
            </div>
            <div className="relative z-10 flex flex-col items-center">
              <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-4 shadow-inner">
                <User className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-1">{profile.fullName || 'User'}</h3>
              <p className="text-blue-100 text-sm mb-4 bg-white/10 px-3 py-1 rounded-full">{profile.email || 'user@example.com'}</p>
              
              <div className="w-full bg-white/20 backdrop-blur-md rounded-xl p-4 text-center border border-white/10">
                <div className="text-2xl font-black mb-1">PRO</div>
                <div className="text-xs font-semibold text-blue-100 uppercase tracking-widest">Premium Member</div>
              </div>
            </div>
          </div>

          {/* Stats Card */}
          <div className="p-6 rounded-2xl shadow-xl border border-[var(--border-color)] bg-[var(--bg-card)] backdrop-blur-sm">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-500" />
              Quick Stats
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-[var(--border-color)]">
                <span className="text-[var(--text-muted)]">Since</span>
                <span className="font-bold">Jan 2026</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-[var(--border-color)]">
                <span className="text-[var(--text-muted)]">Total Tasks</span>
                <span className="font-bold">156</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-[var(--border-color)]">
                <span className="text-[var(--text-muted)]">Completed</span>
                <span className="font-bold text-green-500">142</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-[var(--text-muted)]">Efficiency</span>
                <span className="font-bold text-blue-500 text-lg">91%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Export Section - Re-aligned with Export CSV on the left */}
      <div className="mt-8 p-6 rounded-2xl shadow-xl border border-[var(--border-color)] bg-[var(--bg-card)] backdrop-blur-sm">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Left side: Export button */}
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
            <button
              onClick={handleExportCSV}
              disabled={exporting}
              className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl font-bold shadow-lg transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {exporting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
              {exporting ? t('common.exporting') : t('common.export_csv')}
            </button>
            <div className="text-center sm:text-left">
              <h2 className="text-lg font-bold leading-tight">{t('common.export')}</h2>
              <p className="text-sm text-[var(--text-muted)]">Download CSV report</p>
            </div>
          </div>

          {/* Right side: Pro Tip */}
          <div className="flex-1 max-w-md w-full bg-gradient-to-br from-amber-400/10 to-orange-500/10 border border-orange-500/20 rounded-xl p-4">
            <h3 className="font-bold text-orange-600 dark:text-orange-400 mb-1 flex items-center gap-2 text-sm">
              <Sparkles className="w-4 h-4" />
              Pro Tip
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
              Your changes are automatically synced to our secure cloud database. No need to manual save for every minor tweak!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Settings;
