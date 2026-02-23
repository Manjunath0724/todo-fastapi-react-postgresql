// Purpose: Create new user accounts with client-side validation before API call
// Why: Ensures better UX by catching common issues (email domain, password rules)
// How: Validates inputs, calls FastAPI register, stores JWT/user, and redirects
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Mail,
  Lock,
  User,
  CheckSquare,
  Sparkles,
  Eye,
  EyeOff,
  Sun,
  Moon
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import api from '../services/api';

// ✅ Allowed email domains
const allowedDomains = [
  'gmail.com',
  'yahoo.com',
  'outlook.com',
  'hotmail.com',
  'live.com'
];

// ✅ Password strength rules (min length and char classes)
const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

const Signup = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(document.documentElement.classList.contains('dark'));

  // ✅ Force English and clear old data on signup load
  useEffect(() => {
    i18n.changeLanguage('en');
    localStorage.clear();
  }, [i18n]);

  // Toggle UI theme on the auth screen
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

  // Validate inputs, then register account and initialize session
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // 🔴 Email domain validation
    const emailParts = formData.email.split('@');
    if (
      emailParts.length !== 2 ||
      !allowedDomains.includes(emailParts[1].toLowerCase())
    ) {
      setError(t('auth.email_constraint'));
      return;
    }

    // 🔴 Password match check
    if (formData.password !== formData.confirmPassword) {
      setError(t('auth.password_mismatch'));
      return;
    }

    // 🔴 Password strength validation
    if (!passwordRegex.test(formData.password)) {
      setError(t('auth.password_rules'));
      return;
    }

    setLoading(true);

    try {
      const response = await api.post('/auth/register', {
        full_name: formData.fullName,
        email: formData.email,
        password: formData.password
      });

      localStorage.setItem('token', response.data.access_token);
      localStorage.setItem('user', JSON.stringify(response.data.user));

      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create account');
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
            <CheckSquare className="w-8 h-8 sm:w-10 sm:h-10 text-cyan-500" />
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[var(--text-main)] mb-2">
            TaskFlow Pro
          </h1>
          <div className="flex items-center justify-center gap-2">
            <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-300" />
            <p className="text-sm sm:text-base text-[var(--text-muted)]">
              {t('auth.signup_subtitle')}
            </p>
          </div>
        </div>

        {/* Signup Card */}
        <div className="bg-[var(--bg-card)] text-[var(--text-main)] rounded-2xl shadow-2xl p-6 sm:p-8 border border-[var(--border-color)]">
          <h2 className="text-xl sm:text-2xl font-bold text-[var(--text-main)] mb-4 sm:mb-6">
            {t('auth.signup_title')}
          </h2>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">

            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-[var(--text-main)] mb-2">
                {t('settings.full_name')}
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) =>
                    setFormData({ ...formData, fullName: e.target.value })
                  }
                  className="w-full pl-10 pr-4 py-3 bg-white dark:bg-navy-900 text-gray-900 dark:text-white border border-gray-300 dark:border-navy-800 rounded-lg focus:ring-2 focus:ring-cyan-500 outline-none placeholder-gray-400 dark:placeholder-gray-400"
                  placeholder="Enter your full name"
                />
              </div>
            </div>

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
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full pl-10 pr-4 py-3 bg-white dark:bg-navy-900 text-gray-900 dark:text-white border border-gray-300 dark:border-navy-800 rounded-lg focus:ring-2 focus:ring-cyan-500 outline-none placeholder-gray-400 dark:placeholder-gray-400"
                  placeholder="example@gmail.com"
                />
              </div>
              <p className="text-xs text-[var(--text-muted)] mt-1">
                {t('auth.email_hint')}
              </p>
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
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className="w-full pl-10 pr-12 py-3 bg-white dark:bg-navy-900 text-gray-900 dark:text-white border border-gray-300 dark:border-navy-800 rounded-lg focus:ring-2 focus:ring-cyan-500 outline-none placeholder-gray-400 dark:placeholder-gray-400"
                  placeholder="Create a password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200"
                >
                  {showPassword ? <EyeOff /> : <Eye />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-[var(--text-main)] mb-2">
                {t('auth.confirm_password')}
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      confirmPassword: e.target.value
                    })
                  }
                  className="w-full pl-10 pr-12 py-3 bg-white dark:bg-navy-900 text-gray-900 dark:text-white border border-gray-300 dark:border-navy-800 rounded-lg focus:ring-2 focus:ring-cyan-500 outline-none placeholder-gray-400 dark:placeholder-gray-400"
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  onClick={() =>
                    setShowConfirmPassword(!showConfirmPassword)
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200"
                >
                  {showConfirmPassword ? <EyeOff /> : <Eye />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-navy-900 to-cyan-500 text-white rounded-lg font-medium shadow-lg shadow-cyan-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-50"
            >
              {loading ? t('auth.creating_account') : t('auth.signup')}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-[var(--text-muted)]">
              {t('auth.have_account')}{' '}
              <Link
                to="/login"
                className="text-cyan-500 hover:text-cyan-600 font-medium"
              >
                {t('auth.signin')}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
