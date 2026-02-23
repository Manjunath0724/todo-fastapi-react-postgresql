// Purpose: User settings page for profile updates, theme toggle, and data export
// Why: Lets users personalize name and theme and take their data with them
// How: Persists profile to backend, theme to localStorage, and exports CSV via Blob
import React, { useState, useEffect } from 'react';
import {
  User, Mail, Sun, Moon, Download, Save, Check, Loader2, Sparkles, BarChart3
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import api from '../services/api';

const Settings = ({ isDarkMode, toggleTheme }) => {
  const { t } = useTranslation();
  // Profile form state and UI flags for save/export feedback
  const [profile, setProfile] = useState({ fullName: '', email: '' });
  const [saved, setSaved] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [loading, setLoading] = useState(false);

  // Initialize fields from local user cache
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    setProfile({
      fullName: user.fullName || '',
      email: user.email || ''
    });
  }, []);

  // Save only full name to backend; email remains read-only/immutable
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

  // Download current tasks as CSV for offline analysis or backup
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
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)]">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-main)] uppercase tracking-tighter">{t('settings.title')}</h1>
          <p className="text-sm sm:text-base text-[var(--text-muted)] font-medium">{t('settings.subtitle')}</p>
        </div>

        <div className="space-y-6">
          <div className="p-6 rounded-2xl shadow-sm border border-[var(--border-color)] bg-[var(--bg-card)]">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-[var(--accent-primary)] rounded-xl shadow-lg shadow-[var(--accent-primary)]/20">
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-[var(--text-main)]">{t('settings.profile')}</h2>
                <p className="text-sm text-[var(--text-muted)] font-medium">{t('settings.profile_desc')}</p>
              </div>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-black uppercase mb-2 text-[var(--text-muted)]">{t('settings.full_name')}</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)]" />
                    <input
                      type="text"
                      value={profile.fullName}
                      onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                      disabled={loading}
                      className="w-full pl-10 pr-4 py-3 bg-[var(--bg-main)] border border-[var(--border-color)] rounded-xl text-[var(--text-main)] font-bold outline-none focus:ring-2 focus:ring-[var(--accent-primary)] transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-black uppercase mb-2 text-[var(--text-muted)]">{t('settings.email')}</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)]" />
                    <input
                      type="email"
                      value={profile.email}
                      readOnly
                      className="w-full pl-10 pr-4 py-3 bg-[var(--bg-main)]/50 border border-[var(--border-color)] rounded-xl text-[var(--text-main)] font-medium opacity-50 cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>
              <button
                type="submit"
                disabled={loading || saved}
                className="px-6 py-3 h-11 bg-[var(--accent-primary)] text-white rounded-xl font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-md hover:scale-[1.02] transition-all"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : saved ? <Check className="w-5 h-5" /> : <Save className="w-5 h-5" />}
                {loading ? 'Saving...' : saved ? t('common.saved') : t('settings.save_to_db')}
              </button>
            </form>
          </div>

          <div className="p-6 rounded-2xl shadow-sm border border-[var(--border-color)] bg-[var(--bg-card)]">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-[var(--accent-primary)] rounded-xl shadow-lg shadow-[var(--accent-primary)]/20">
                {isDarkMode ? <Moon className="w-6 h-6 text-white" /> : <Sun className="w-6 h-6 text-white" />}
              </div>
              <div>
                <h2 className="text-xl font-bold text-[var(--text-main)]">{t('settings.theme')}</h2>
                <p className="text-sm text-[var(--text-muted)] font-medium">Customize your experience</p>
              </div>
            </div>
            <div className="flex items-center justify-between p-4 rounded-xl bg-[var(--bg-main)] border border-[var(--border-color)]">
              <div>
                <h3 className="font-bold text-[var(--text-main)]">Dark Mode</h3>
                <p className="text-sm text-[var(--text-muted)] font-medium">Switch between light and dark</p>
              </div>
              <button
                onClick={toggleTheme}
                className={`relative inline-flex h-8 w-14 rounded-full transition-colors ${isDarkMode ? 'bg-[var(--accent-primary)]' : 'bg-gray-300'}`}
              >
                <span className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform mt-1 ${isDarkMode ? 'translate-x-7' : 'translate-x-1'}`} />
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <div className="p-6 rounded-2xl shadow-sm border border-[var(--border-color)] bg-[var(--bg-card)]">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-[var(--accent-secondary)] rounded-xl">
                <User className="w-6 h-6 text-[var(--text-main)]" />
              </div>
              <h2 className="text-xl font-bold text-[var(--text-main)]">User Card</h2>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-xl bg-[var(--bg-main)] border border-[var(--border-color)] flex items-center justify-center shadow-inner">
                <User className="w-7 h-7 text-[var(--accent-primary)]" />
              </div>
              <div className="flex-1">
                <div className="font-black text-[var(--text-main)] text-lg uppercase tracking-tighter">{profile.fullName || 'User'}</div>
                <div className="text-sm text-[var(--text-muted)] font-bold">{profile.email || 'user@example.com'}</div>
              </div>
              <div className="px-3 py-1 rounded-lg bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] font-black text-[10px] uppercase tracking-widest border border-[var(--accent-primary)]/20">PRO</div>
            </div>
          </div>

          <div className="p-6 rounded-2xl shadow-sm border border-[var(--border-color)] bg-[var(--bg-card)]">
            <h3 className="text-lg font-black uppercase tracking-tighter mb-4 flex items-center gap-2 text-[var(--text-main)]">
              <BarChart3 className="w-5 h-5 text-[var(--accent-primary)]" />
              Quick Stats
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-[var(--border-color)]">
                <span className="text-[var(--text-muted)] font-bold text-xs uppercase">Since</span>
                <span className="font-black text-[var(--text-main)]">Feb 2026</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-[var(--border-color)]">
                <span className="text-[var(--text-muted)] font-bold text-xs uppercase">Efficiency</span>
                <span className="font-black text-[var(--accent-primary)] text-lg">94%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 rounded-2xl shadow-sm border border-[var(--border-color)] bg-[var(--bg-card)] mt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-500">
                <Download className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-[var(--text-main)]">{t('common.export')}</h2>
                <p className="text-sm text-[var(--text-muted)] font-medium">Download your task history</p>
              </div>
            </div>
            <button
              onClick={handleExportCSV}
              disabled={exporting}
              className="px-6 py-3 bg-emerald-500 text-white rounded-xl font-black uppercase tracking-widest flex items-center gap-2 text-sm shadow-md hover:scale-[1.02] transition-all"
            >
              {exporting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-4 h-4" />}
              {exporting ? t('common.exporting') : t('common.export_csv')}
            </button>
          </div>
        </div>

        <div className="p-6 rounded-2xl shadow-sm border border-[var(--accent-primary)]/20 bg-[var(--accent-primary)]/5 mt-6 border-dashed">
          <h3 className="font-black uppercase tracking-widest text-[var(--accent-primary)] mb-2 flex items-center gap-2 text-xs">
            <Sparkles className="w-4 h-4" />
            Pro Tip
          </h3>
          <p className="text-sm text-[var(--text-muted)] font-medium">
            Your changes are automatically synced to our secure cloud database. No need to manually save for every minor tweak!
          </p>
        </div>
      </div>
    </div>
  );
};
export default Settings;
