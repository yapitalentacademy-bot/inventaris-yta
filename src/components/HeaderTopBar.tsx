'use client';

import { Search, Sun, Moon, Bell } from 'lucide-react';
import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export function HeaderTopBar() {
  const router = useRouter();
  const pathname = usePathname();
  const [search, setSearch] = useState('');
  const [darkMode, setDarkMode] = useState(false);

  if (pathname.startsWith('/b/') || pathname === '/login') {
    return null;
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      router.push(`/items?q=${encodeURIComponent(search.trim())}`);
    }
  };

  const toggleTheme = () => {
    setDarkMode(!darkMode);
    if (!darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  return (
    <header className="bg-[#dcebf4] dark:bg-slate-900 py-4 px-6 flex items-center justify-between border-b border-slate-300/40 dark:border-slate-800">
      {/* Page Title Context / Breadcrumb */}
      <div>
        <h1 className="text-xl font-bold text-[#174355] dark:text-white tracking-tight">
          Inventaris YTA
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
          PT YAPI Talent Academy Inventory Portal
        </p>
      </div>

      {/* Right Controls: Pill Search Bar + Actions */}
      <div className="flex items-center space-x-4">
        {/* Pill Search Bar */}
        <form onSubmit={handleSearchSubmit} className="relative hidden sm:block w-72">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search items, code, location..."
            className="w-full py-2.5 pl-5 pr-12 rounded-full border border-slate-300 dark:border-slate-700 bg-white/90 dark:bg-slate-800 text-slate-800 dark:text-white text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#174355] shadow-sm"
          />
          <button
            type="submit"
            className="absolute right-1 top-1 bottom-1 w-9 bg-slate-300/60 dark:bg-slate-700 hover:bg-[#174355] hover:text-white text-slate-600 dark:text-slate-200 rounded-full flex items-center justify-center transition-colors"
          >
            <Search className="w-4 h-4" />
          </button>
        </form>

        {/* Theme Toggle Sun / Moon */}
        <div className="bg-white/80 dark:bg-slate-800 p-1.5 rounded-full border border-slate-300 dark:border-slate-700 flex items-center space-x-1 shadow-sm">
          <button
            onClick={toggleTheme}
            className={`p-1.5 rounded-full text-xs transition-colors ${
              !darkMode ? 'bg-[#174355] text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Light Mode"
          >
            <Sun className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={toggleTheme}
            className={`p-1.5 rounded-full text-xs transition-colors ${
              darkMode ? 'bg-emerald-500 text-white shadow' : 'text-slate-400 hover:text-slate-600'
            }`}
            title="Dark Mode"
          >
            <Moon className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Notification Bell */}
        <button className="relative p-2.5 rounded-full bg-white/80 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 shadow-sm transition-colors">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white dark:border-slate-800 animate-pulse" />
        </button>
      </div>
    </header>
  );
}
