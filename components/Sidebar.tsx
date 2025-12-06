import React from 'react';
import { LayoutDashboard, CheckSquare, Timer, BarChart2, MountainSnow, Moon, Sun } from 'lucide-react';
import { AppView } from '../types';

interface SidebarProps {
  currentView: AppView;
  onChangeView: (view: AppView) => void;
  isMobileMenuOpen: boolean;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, onChangeView, isMobileMenuOpen, theme, onToggleTheme }) => {
  const menuItems = [
    { id: AppView.DASHBOARD, icon: LayoutDashboard, label: 'Dashboard' },
    { id: AppView.TASKS, icon: CheckSquare, label: 'Tasks' },
    { id: AppView.FOCUS, icon: Timer, label: 'Focus Zone' },
    { id: AppView.ANALYTICS, icon: BarChart2, label: 'Progress' },
  ];

  return (
    <aside className={`
      fixed inset-y-0 left-0 z-40 w-64 border-r transition-transform duration-300 ease-in-out
      bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-slate-200 dark:border-slate-800
      ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
    `}>
      <div className="flex flex-col h-full p-4">
        <div className="flex items-center justify-between mb-8 px-4 py-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/30">
              <MountainSnow className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-heading font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300">
              Zenith
            </h1>
          </div>
        </div>

        <nav className="flex-1 space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onChangeView(item.id)}
              className={`
                w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group
                ${currentView === item.id 
                  ? 'bg-violet-50 text-violet-700 border-violet-100 dark:bg-violet-500/10 dark:text-violet-400 dark:border-violet-500/20 border' 
                  : 'text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200'}
              `}
            >
              <item.icon className={`w-5 h-5 ${currentView === item.id ? 'animate-pulse' : 'group-hover:scale-110 transition-transform'}`} />
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Theme Toggle */}
        <div className="px-4 mb-4">
            <button 
                onClick={onToggleTheme}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-slate-600 dark:text-slate-400"
            >
                <span className="text-sm font-medium flex items-center gap-2">
                    {theme === 'dark' ? <Moon size={16} /> : <Sun size={16} />}
                    {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
                </span>
                <div className={`w-8 h-4 rounded-full relative transition-colors ${theme === 'dark' ? 'bg-violet-500' : 'bg-slate-300'}`}>
                    <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-transform duration-200 shadow-sm ${theme === 'dark' ? 'left-[18px]' : 'left-0.5'}`}></div>
                </div>
            </button>
        </div>

        <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-100 to-white dark:from-slate-800 dark:to-slate-900 border border-slate-200 dark:border-slate-700 mt-auto shadow-sm">
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-2 font-bold uppercase tracking-wider">Daily Stoic</p>
          <p className="text-sm text-slate-700 dark:text-slate-300 font-medium italic">"The best way to predict the future is to create it."</p>
        </div>
      </div>
    </aside>
  );
};