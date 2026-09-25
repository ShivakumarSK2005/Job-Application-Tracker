import React from 'react';
import { Briefcase, Plus, Sun, Moon, LogOut, User, Bell } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { notificationService } from '../../utils/notificationService';

export default function Navbar({ onOpenAddModal, stats, reminderEngine }) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const isGranted = reminderEngine?.permission === 'granted';
  const isDenied = reminderEngine?.permission === 'denied';

  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-200/80 dark:border-zinc-800/80 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-sm font-bold">
            <Briefcase className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm tracking-tight text-zinc-900 dark:text-zinc-100">
                Trackr
              </span>
              <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700/60">
                PRO
              </span>
            </div>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 hidden sm:block">
              Job Application & Pipeline Tracker
            </p>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {/* New Application CTA */}
          <button
            type="button"
            onClick={onOpenAddModal}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Add Application</span>
          </button>

          {/* Web Push Notification Toggle Button */}
          <button
            type="button"
            onClick={async () => {
              if (isGranted) {
                reminderEngine?.sendTestNotification();
              } else {
                await reminderEngine?.requestPermission();
              }
            }}
            title={
              isGranted
                ? 'Desktop Notifications Active (Click to send test alert)'
                : isDenied
                ? 'Desktop notifications blocked by browser settings'
                : 'Click to enable Desktop Push Reminders'
            }
            className="p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors relative"
          >
            <Bell className="w-4 h-4" />
            {isGranted ? (
              <span className="w-2 h-2 rounded-full bg-emerald-500 absolute top-1.5 right-1.5 ring-2 ring-white dark:ring-zinc-950" title="Notifications Active" />
            ) : isDenied ? (
              <span className="w-2 h-2 rounded-full bg-rose-500 absolute top-1.5 right-1.5 ring-2 ring-white dark:ring-zinc-950" title="Notifications Denied" />
            ) : (
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse absolute top-1.5 right-1.5 ring-2 ring-white dark:ring-zinc-950" title="Notifications Not Enabled" />
            )}
          </button>

          {/* Theme Toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-zinc-600" />
            )}
          </button>

          {/* User Profile & Logout */}
          <div className="flex items-center pl-2 border-l border-zinc-200 dark:border-zinc-800 gap-2">
            <div className="hidden md:flex flex-col text-right">
              <span className="text-xs font-medium text-zinc-900 dark:text-zinc-200 leading-tight">
                {user?.name || 'User'}
              </span>
              <span className="text-[10px] text-zinc-500 dark:text-zinc-400 leading-tight">
                {user?.email || ''}
              </span>
            </div>
            <div className="w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-xs font-semibold text-zinc-700 dark:text-zinc-300 select-none uppercase">
              {user?.name ? user.name.slice(0, 2) : <User className="w-4 h-4" />}
            </div>
            <button
              type="button"
              onClick={logout}
              title="Sign Out"
              className="p-2 rounded-lg text-zinc-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
