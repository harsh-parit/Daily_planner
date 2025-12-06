import React from 'react';
import { UserStats } from '../types';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Trophy, TrendingUp, Clock, Zap, Target } from 'lucide-react';

interface ProgressViewProps {
  stats: UserStats;
  theme: 'dark' | 'light';
}

export const ProgressView: React.FC<ProgressViewProps> = ({ stats, theme }) => {
  // Process History Data for Chart
  const getHistoryData = () => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const data = [];
    // Last 14 days
    for (let i = 13; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateKey = d.toISOString().split('T')[0];
        const xp = stats.xpHistory[dateKey] || 0;
        data.push({
            name: i % 2 === 0 ? days[d.getDay()] : '', // Show label every other day
            fullDate: d.toLocaleDateString(),
            xp: xp
        });
    }
    return data;
  };

  const chartData = getHistoryData();
  const progressToNext = (stats.xp % 1000) / 1000 * 100;

  return (
    <div className="space-y-8 animate-fade-in pb-20 md:pb-0">
      <div className="flex flex-col md:flex-row justify-between items-end gap-4">
        <div>
          <h2 className="text-3xl font-heading font-bold text-slate-900 dark:text-white mb-2">Your Legacy 🚀</h2>
          <p className="text-slate-500 dark:text-slate-400">Track your journey from novice to master.</p>
        </div>
        <div className="bg-white dark:bg-slate-800/50 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-sm text-slate-500 dark:text-slate-400 shadow-sm dark:shadow-none">
           Last updated: {new Date().toLocaleTimeString()}
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800/40 p-6 rounded-2xl border border-violet-100 dark:border-violet-500/20 shadow-sm dark:shadow-none backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-2 text-violet-600 dark:text-violet-400">
                <Trophy size={20} />
                <span className="font-medium text-sm uppercase tracking-wider">Total XP</span>
            </div>
            <p className="text-3xl font-bold text-slate-900 dark:text-white">{stats.xp.toLocaleString()}</p>
        </div>
        <div className="bg-white dark:bg-slate-800/40 p-6 rounded-2xl border border-pink-100 dark:border-pink-500/20 shadow-sm dark:shadow-none backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-2 text-pink-600 dark:text-pink-400">
                <Zap size={20} />
                <span className="font-medium text-sm uppercase tracking-wider">Streak</span>
            </div>
            <p className="text-3xl font-bold text-slate-900 dark:text-white">{stats.streak} <span className="text-base font-normal text-slate-400">Days</span></p>
        </div>
        <div className="bg-white dark:bg-slate-800/40 p-6 rounded-2xl border border-emerald-100 dark:border-emerald-500/20 shadow-sm dark:shadow-none backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-2 text-emerald-600 dark:text-emerald-400">
                <TrendingUp size={20} />
                <span className="font-medium text-sm uppercase tracking-wider">Tasks</span>
            </div>
            <p className="text-3xl font-bold text-slate-900 dark:text-white">{stats.tasksCompleted}</p>
        </div>
        <div className="bg-white dark:bg-slate-800/40 p-6 rounded-2xl border border-amber-100 dark:border-amber-500/20 shadow-sm dark:shadow-none backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-2 text-amber-600 dark:text-amber-400">
                <Clock size={20} />
                <span className="font-medium text-sm uppercase tracking-wider">Focus</span>
            </div>
            <p className="text-3xl font-bold text-slate-900 dark:text-white">{(stats.focusMinutes / 60).toFixed(1)} <span className="text-base font-normal text-slate-400">Hrs</span></p>
        </div>
      </div>

      {/* Level Progress */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-6 rounded-2xl relative overflow-hidden shadow-sm dark:shadow-none">
          <div className="absolute top-0 right-0 w-64 h-64 bg-violet-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          <div className="relative z-10">
            <div className="flex justify-between items-center mb-4">
                <div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">Level {stats.level}</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Keep going to reach Level {stats.level + 1}</p>
                </div>
                <div className="text-right">
                    <p className="font-mono text-violet-600 dark:text-violet-400">{stats.xp % 1000} / 1000 XP</p>
                </div>
            </div>
            <div className="h-4 bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden border border-slate-200 dark:border-slate-700/50">
                <div 
                    className="h-full bg-gradient-to-r from-violet-500 via-fuchsia-500 to-pink-500 transition-all duration-1000 ease-out"
                    style={{ width: `${progressToNext}%` }}
                ></div>
            </div>
          </div>
      </div>

      {/* Analytics Chart */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-6 rounded-2xl shadow-sm dark:shadow-none">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
            <Target className="text-violet-500" />
            XP History (Last 14 Days)
        </h3>
        <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                    <defs>
                        <linearGradient id="colorXp" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#334155' : '#e2e8f0'} vertical={false} />
                    <XAxis 
                        dataKey="name" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{fill: theme === 'dark' ? '#94a3b8' : '#64748b', fontSize: 12}} 
                        dy={10}
                    />
                    <YAxis 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{fill: theme === 'dark' ? '#94a3b8' : '#64748b', fontSize: 12}} 
                    />
                    <Tooltip 
                        contentStyle={{
                            backgroundColor: theme === 'dark' ? '#0f172a' : '#ffffff', 
                            border: theme === 'dark' ? '1px solid #1e293b' : '1px solid #e2e8f0', 
                            borderRadius: '8px', 
                            color: theme === 'dark' ? '#fff' : '#0f172a',
                            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                        }}
                        itemStyle={{color: theme === 'dark' ? '#fff' : '#0f172a'}}
                        labelStyle={{color: theme === 'dark' ? '#94a3b8' : '#64748b', marginBottom: '4px'}}
                        formatter={(value) => [`${value} XP`, 'Gained']}
                        labelFormatter={(label, payload) => payload[0]?.payload.fullDate || label}
                    />
                    <Area 
                        type="monotone" 
                        dataKey="xp" 
                        stroke="#8b5cf6" 
                        strokeWidth={3}
                        fillOpacity={1} 
                        fill="url(#colorXp)" 
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};