// Purpose: Authenticate users and initialize session state (JWT + user cache)
// Why: Restricts app routes to authenticated users and sets theme preferences
// How: Submits credentials to FastAPI, stores token/user, and navigates to dashboard
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, CheckSquare, Sparkles, Eye, EyeOff, Sun, Moon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import api from '../services/api';

const Login = ({ onLogin }) => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(document.documentElement.classList.contains('dark'));

  // ✅ Clear stale auth and reset form fields on page load
  useEffect(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    setFormData({
      email: '',
      password: ''
    });
  }, []);

  // ✅ Force English for predictable copy on auth pages
  useEffect(() => {
    if (i18n.language !== 'en') {
      i18n.changeLanguage('en');
      localStorage.setItem('i18nextLng', 'en');
    }
  }, [i18n]);

  // Quick theme toggle for auth screen; persists to localStorage
  const toggleTheme = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    const themeValue = newMode ? 'pro-dark' : 'pro-light';
    localStorage.setItem('colorTheme', themeValue);
    if (newMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    document.documentElement.setAttribute('data-theme', themeValue);
  };

  // Submit credentials; on success store token/user and notify parent
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await api.post('/auth/login', formData);

      localStorage.setItem('token', response.data.access_token);
      localStorage.setItem('user', JSON.stringify(response.data.user));

      onLogin();
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.detail || t('auth.invalid_credentials'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-main)] flex items-center justify-center p-4 sm:p-6">
      <button
        onClick={toggleTheme}
        className="fixed top-4 right-4 px-3 py-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-main)] flex items-center gap-2 shadow"
      >
        {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        <span className="text-sm">{isDarkMode ? 'Light' : 'Dark'}</span>
      </button>
      <div className="max-w-md w-full">

        {/* Logo */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 bg-white rounded-2xl shadow-lg mb-3 sm:mb-4">
            <CheckSquare className="w-8 h-8 sm:w-10 sm:h-10 text-blue-600" />
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[var(--text-main)] mb-2">
            TaskFlow Pro
          </h1>
          <div className="flex items-center justify-center gap-2">
            <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-300" />
            <p className="text-sm sm:text-base text-[var(--text-muted)]">
              {t('auth.login_subtitle')}
            </p>
          </div>
        </div>

        {/* Login Card */}
        <div className="bg-[var(--bg-card)] text-[var(--text-main)] rounded-2xl shadow-2xl p-6 sm:p-8 border border-[var(--border-color)]">
          <h2 className="text-xl sm:text-2xl font-bold text-[var(--text-main)] mb-4 sm:mb-6">
            {t('auth.login_title')}
          </h2>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="space-y-4"
            autoComplete="off"   // ✅ disables browser autofill
          >
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-[var(--text-main)] mb-2">
                {t('auth.email')}
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  required
                  value={formData.email}
                  autoComplete="off"
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-800 text-gray-900 dark:text-white border border-gray-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none placeholder-gray-400 dark:placeholder-gray-400"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-[var(--text-main)] mb-2">
                {t('auth.password')}
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  autoComplete="new-password"
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className="w-full pl-10 pr-12 py-3 bg-white dark:bg-slate-800 text-gray-900 dark:text-white border border-gray-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none placeholder-gray-400 dark:placeholder-gray-400"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 gradient-primary text-white rounded-lg font-medium hover:shadow-lg transition-all duration-200 disabled:opacity-50"
            >
              {loading ? t('auth.signing_in') : t('auth.signin')}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-[var(--text-muted)]">
              {t('auth.no_account')}{' '}
              <Link
                to="/signup"
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                {t('auth.signup')}
              </Link>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Login;
