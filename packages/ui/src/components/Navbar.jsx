import { Recycle, Moon, Sun, Bell } from 'lucide-react';
import { useThemeStore, useNotificationStore } from '@cleanflow/core';

export default function Navbar({ onShowNotifications }) {
  const { isDarkMode, toggleTheme } = useThemeStore();
  const { notifications } = useNotificationStore();
  
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header className="sticky top-0 z-50 glass border-b border-slate-200/60 dark:border-slate-800/60">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 h-14">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center shadow-sm">
            <Recycle className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-lg tracking-tight text-slate-900 dark:text-white">
            Clean<span className="text-primary">Flow</span>
            <span className="text-xs text-slate-400 ml-1 font-medium">KE</span>
          </span>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3 ml-3">
          <button 
            onClick={onShowNotifications}
            className="relative p-2.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors shadow-sm bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full border border-white dark:border-slate-900 animate-pulse" />
            )}
          </button>

          <button 
            onClick={toggleTheme} 
            className="p-2.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors shadow-sm bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800"
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </header>
  );
}
