import React, { useState, useEffect } from 'react';
import { Briefcase, ArrowRight, Loader2, Lock, Mail, User, ShieldCheck, CheckCircle2, Eye, EyeOff, Phone } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export default function AuthPage() {
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobileNumber: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [slowLoading, setSlowLoading] = useState(false);

  useEffect(() => {
    localStorage.removeItem('last_user_email');
  }, []);

  const { login, register, loading } = useAuth();
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    let timer;
    if (loading) {
      timer = setTimeout(() => {
        setSlowLoading(true);
      }, 3500);
    } else {
      setSlowLoading(false);
    }
    return () => clearTimeout(timer);
  }, [loading]);

  const validate = () => {
    const errs = {};
    if (isRegister) {
      if (!formData.name.trim()) {
        errs.name = 'Full name is required';
      }
      if (!formData.mobileNumber.trim()) {
        errs.mobileNumber = 'Mobile number is required';
      } else if (!/^[0-9+\s()-]{10,15}$/.test(formData.mobileNumber.trim())) {
        errs.mobileNumber = 'Please enter a valid mobile number (10-15 digits)';
      }
    }

    if (!formData.email.trim()) {
      errs.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errs.email = 'Please provide a valid email format';
    }

    if (!formData.password) {
      errs.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errs.password = 'Password must be at least 6 characters';
    }

    if (isRegister) {
      if (!formData.confirmPassword) {
        errs.confirmPassword = 'Confirm password is required';
      } else if (formData.password !== formData.confirmPassword) {
        errs.confirmPassword = 'Passwords do not match';
      }
    }

    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    if (!validate()) return;

    if (isRegister) {
      const res = await register(
        formData.name.trim(),
        formData.email.trim(),
        formData.password,
        formData.mobileNumber.trim()
      );
      if (!res.success) {
        setErrorMsg(res.error);
      }
    } else {
      const res = await login(formData.email.trim(), formData.password);
      if (!res.success) {
        setErrorMsg(res.error);
      }
    }
  };

  const fillDemoAccount = () => {
    setFormData({
      name: 'Shivakumar',
      email: 'shiva@gmail.com',
      mobileNumber: '+91 9876543210',
      password: 'password123',
      confirmPassword: 'password123',
    });
    setFieldErrors({});
    setErrorMsg('');
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 antialiased">
      {/* Left Column / Brand Hero Panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-zinc-900 text-white dark:bg-zinc-900/40 border-r border-zinc-800 p-12 flex-col justify-between relative overflow-hidden">
        {/* Subtle background grid accent */}
        <div className="absolute inset-0 bg-[radial-gradient(#312e81_1px,transparent_1px)] [background-size:24px_24px] opacity-25" />

        <div className="relative z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-600/30">
              <Briefcase className="w-5 h-5" />
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg tracking-tight">Trackr</span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                PRO
              </span>
            </div>
          </div>
        </div>

        <div className="relative z-10 max-w-lg space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-800/80 border border-zinc-700/80 text-xs text-zinc-300">
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
            <span>Production-grade REST API & JWT Security</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight text-zinc-100">
            Your career pipeline, organized with surgical clarity.
          </h1>

          <p className="text-sm text-zinc-400 leading-relaxed">
            Eliminate chaotic spreadsheets. Manage your job applications, multi-round technical interviews, and offer milestones in a unified enterprise workspace.
          </p>

          <div className="space-y-3 pt-4 border-t border-zinc-800 text-xs text-zinc-300">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Full lifecycle tracking from Applied to Selection / Offer</span>
            </div>
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Dedicated round scheduling, interviewers, and feedback</span>
            </div>
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Server-side pagination, dynamic sorting, and aggregated metrics</span>
            </div>
          </div>
        </div>

        <div className="relative z-10 text-xs text-zinc-500">
          Built with Spring Boot 3 & React • MongoDB Atlas
        </div>
      </div>

      {/* Right Column / Auth Form */}
      <div className="flex-1 flex flex-col justify-center px-6 sm:px-12 lg:px-20 py-12">
        <div className="w-full max-w-md mx-auto space-y-6">
          {/* Top Logo for mobile */}
          <div className="lg:hidden flex items-center gap-2.5 mb-6">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold">
              <Briefcase className="w-4 h-4" />
            </div>
            <span className="font-bold text-base tracking-tight">Trackr Pro</span>
          </div>

          <div>
            <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
              {isRegister ? 'Create your account' : 'Welcome back'}
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              {isRegister
                ? 'Sign up to start tracking your applications and interviews'
                : 'Enter your credentials to access your tracker dashboard'}
            </p>
          </div>

          {/* Tab Switcher */}
          <div className="grid grid-cols-2 p-1 rounded-xl bg-zinc-200/70 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
            <button
              type="button"
              onClick={() => {
                setIsRegister(false);
                setFormData({
                  name: '',
                  email: '',
                  mobileNumber: '',
                  password: '',
                  confirmPassword: '',
                });
                setErrorMsg('');
                setFieldErrors({});
                setShowPassword(false);
                setShowConfirmPassword(false);
              }}
              className={`py-2 text-xs font-semibold rounded-lg transition-all ${
                !isRegister
                  ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setIsRegister(true);
                setFormData({
                  name: '',
                  email: '',
                  mobileNumber: '',
                  password: '',
                  confirmPassword: '',
                });
                setErrorMsg('');
                setFieldErrors({});
                setShowPassword(false);
                setShowConfirmPassword(false);
              }}
              className={`py-2 text-xs font-semibold rounded-lg transition-all ${
                isRegister
                  ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Error Banner */}
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs">
              {errorMsg}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
            {isRegister && (
              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Shivakumar"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    autoComplete="off"
                    className={`w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border ${
                      fieldErrors.name
                        ? 'border-rose-500 focus:ring-rose-500/20'
                        : 'border-zinc-200 dark:border-zinc-800 focus:ring-indigo-500/20 focus:border-indigo-500'
                    } bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2`}
                  />
                </div>
                {fieldErrors.name && (
                  <p className="text-[11px] text-rose-500 mt-1">{fieldErrors.name}</p>
                )}
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  autoComplete={isRegister ? "new-password" : "email"}
                  className={`w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border ${
                    fieldErrors.email
                      ? 'border-rose-500 focus:ring-rose-500/20'
                      : 'border-zinc-200 dark:border-zinc-800 focus:ring-indigo-500/20 focus:border-indigo-500'
                  } bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2`}
                />
              </div>
              {fieldErrors.email && (
                <p className="text-[11px] text-rose-500 mt-1">{fieldErrors.email}</p>
              )}
            </div>

            {isRegister && (
              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                  Mobile Number
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={formData.mobileNumber}
                    onChange={(e) => setFormData({ ...formData, mobileNumber: e.target.value })}
                    autoComplete="off"
                    className={`w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border ${
                      fieldErrors.mobileNumber
                        ? 'border-rose-500 focus:ring-rose-500/20'
                        : 'border-zinc-200 dark:border-zinc-800 focus:ring-indigo-500/20 focus:border-indigo-500'
                    } bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2`}
                  />
                </div>
                {fieldErrors.mobileNumber && (
                  <p className="text-[11px] text-rose-500 mt-1">{fieldErrors.mobileNumber}</p>
                )}
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  autoComplete={isRegister ? "new-password" : "current-password"}
                  className={`w-full pl-9 pr-10 py-2.5 text-xs rounded-xl border ${
                    fieldErrors.password
                      ? 'border-rose-500 focus:ring-rose-500/20'
                      : 'border-zinc-200 dark:border-zinc-800 focus:ring-indigo-500/20 focus:border-indigo-500'
                  } bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 p-0.5 transition-colors focus:outline-none"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {fieldErrors.password && (
                <p className="text-[11px] text-rose-500 mt-1">{fieldErrors.password}</p>
              )}
            </div>

            {isRegister && (
              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    autoComplete="new-password"
                    className={`w-full pl-9 pr-10 py-2.5 text-xs rounded-xl border ${
                      fieldErrors.confirmPassword
                        ? 'border-rose-500 focus:ring-rose-500/20'
                        : 'border-zinc-200 dark:border-zinc-800 focus:ring-indigo-500/20 focus:border-indigo-500'
                    } bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 p-0.5 transition-colors focus:outline-none"
                    title={showConfirmPassword ? 'Hide password' : 'Show password'}
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {fieldErrors.confirmPassword && (
                  <p className="text-[11px] text-rose-500 mt-1">{fieldErrors.confirmPassword}</p>
                )}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 shadow-md shadow-indigo-600/10 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500/20 disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{isRegister ? 'Creating Account...' : 'Signing In...'}</span>
                </>
              ) : (
                <>
                  <span>{isRegister ? 'Complete Registration' : 'Sign In to Workspace'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>

            {loading && slowLoading && (
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 text-xs text-center leading-relaxed animate-pulse">
                ⏳ The free cloud server on Render is waking up after inactivity (takes ~45-60 seconds on first request). Please wait a moment...
              </div>
            )}
          </form>

          {/* Quick Demo Pre-fill */}
          <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800 text-center">
            <button
              type="button"
              onClick={fillDemoAccount}
              className="text-xs text-zinc-500 hover:text-indigo-600 dark:text-zinc-400 dark:hover:text-indigo-400 underline underline-offset-4 transition-colors"
            >
              Fill with sample credentials (shiva@gmail.com)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
