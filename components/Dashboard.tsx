import React, { useState } from 'react';
import { Task, UserStats, Category } from '../types';
import { Trophy, Flame, Target, Wand2, Plus, Calendar, CheckCircle2, Circle } from 'lucide-react';
import { parseSmartTask, getMotivationalMessage } from '../services/gemini';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface DashboardProps {
  tasks: Task[];
  stats: UserStats;
  onAddTask: (task: Task) => void;
  onToggleTask: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
  theme: 'dark' | 'light';
}

export const Dashboard: React.FC<DashboardProps> = ({ tasks, stats, onAddTask, onToggleTask, onDeleteTask, theme }) => {
  const [smartInput, setSmartInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [motivationalMsg, setMotivationalMsg] = useState("Ready to peak? 🏔️");

  // Calculate stats
  const todaysTasks = tasks.filter(t => {
      const taskDate = new Date(t.dueDate).toDateString();
      const today = new Date().toDateString();
      return taskDate === today;
  });

  const handleSmartSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!smartInput.trim()) return;

    setIsProcessing(true);
    const parsed = await parseSmartTask(smartInput);
    if (parsed) {
      const newTask: Task = {
        id: crypto.randomUUID(),
        title: parsed.title || smartInput,
        category: parsed.category || 'personal',
        priority: parsed.priority || 'medium',
        dueDate: new Date().toISOString(),
        completed: false,
        subtasks: parsed.subtasks || [],
        estimatedMinutes: parsed.estimatedMinutes || 30,
        aiGenerated: true
      };
      onAddTask(newTask);
      setSmartInput('');
      
      // Refresh motivation
      getMotivationalMessage({ xp: stats.xp, tasksCompleted: stats.tasksCompleted })
        .then(setMotivationalMsg);
    }
    setIsProcessing(false);
  };

  const getCategoryColor = (cat: Category) => {
    switch (cat) {
      case 'study': return 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300';
      case 'work': return 'bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-300';
      case 'health': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300';
      case 'social': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-300';
      default: return 'bg-slate-100 text-slate-700 dark:bg-slate-500/20 dark:text-slate-300';
    }
  };

  // Generate Real Chart Data from History
  const getChartData = () => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const data = [];
    for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateKey = d.toISOString().split('T')[0];
        const xp = stats.xpHistory[dateKey] || 0;
        data.push({
            name: days[d.getDay()],
            xp: xp,
            isToday: i === 0
        });
    }
    return data;
  };

  const chartData = getChartData();

  return (
    <div className="space-y-6 animate-fade-in pb-20 md:pb-0">
      
      {/* Welcome & Stats Header */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="col-span-1 md:col-span-2 p-6 rounded-3xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white relative overflow-hidden shadow-xl shadow-violet-900/20 dark:shadow-none">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
            <div className="relative z-10">
                <h2 className="text-3xl font-heading font-bold mb-2">Rise & Grind! 🚀</h2>
                <p className="text-violet-100 text-lg mb-6 max-w-md font-medium">{motivationalMsg}</p>
                
                <div className="flex gap-4">
                    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 flex items-center gap-3 border border-white/10">
                        <div className="w-10 h-10 rounded-full bg-amber-400/20 flex items-center justify-center text-amber-300 border border-amber-400/30">
                            <Trophy size={20} />
                        </div>
                        <div>
                            <p className="text-xs text-violet-200 uppercase tracking-wide">Level {stats.level}</p>
                            <p className="font-bold text-xl">{stats.xp} XP</p>
                        </div>
                    </div>
                    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 flex items-center gap-3 border border-white/10">
                         <div className="w-10 h-10 rounded-full bg-rose-400/20 flex items-center justify-center text-rose-300 border border-rose-400/30">
                            <Flame size={20} />
                        </div>
                        <div>
                            <p className="text-xs text-violet-200 uppercase tracking-wide">Streak</p>
                            <p className="font-bold text-xl">{stats.streak} Days</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div className="p-6 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
            <h3 className="text-slate-500 dark:text-slate-400 font-medium mb-4 flex items-center gap-2 text-sm uppercase tracking-wider">
                <Target size={18} /> Performance
            </h3>
            <div className="flex items-center justify-center h-40">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                        <XAxis 
                            dataKey="name" 
                            tick={{fontSize: 10, fill: theme === 'dark' ? '#64748b' : '#94a3b8'}} 
                            axisLine={false} 
                            tickLine={false} 
                        />
                        <Tooltip 
                            contentStyle={{
                                backgroundColor: theme === 'dark' ? '#1e293b' : '#ffffff', 
                                border: theme === 'dark' ? '1px solid #334155' : '1px solid #e2e8f0', 
                                borderRadius: '12px', 
                                color: theme === 'dark' ? '#fff' : '#0f172a',
                                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                            }}
                            itemStyle={{color: theme === 'dark' ? '#fff' : '#0f172a'}}
                            cursor={{fill: theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}}
                            formatter={(value: number) => [`${value} XP`, 'XP Gained']}
                        />
                        <Bar dataKey="xp" radius={[4, 4, 0, 0]}>
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.isToday ? '#8b5cf6' : theme === 'dark' ? '#334155' : '#e2e8f0'} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
      </div>

      {/* AI Quick Add */}
      <div className="relative group z-30">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-pink-500 to-violet-500 rounded-2xl blur opacity-30 group-hover:opacity-75 transition duration-500"></div>
        <form onSubmit={handleSmartSubmit} className="relative bg-white dark:bg-slate-900 rounded-2xl p-2 flex items-center gap-2 shadow-sm border border-slate-200 dark:border-slate-800">
            <div className="p-3 text-violet-500 dark:text-violet-400">
                <Wand2 className={isProcessing ? "animate-spin" : ""} size={24} />
            </div>
            <input 
                type="text" 
                value={smartInput}
                onChange={(e) => setSmartInput(e.target.value)}
                placeholder="Ask AI: 'Study math for 1 hour' or 'Gym at 6pm'..." 
                className="w-full bg-transparent text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 outline-none text-lg font-medium py-2"
                disabled={isProcessing}
            />
            <button 
                type="submit" 
                disabled={!smartInput.trim() || isProcessing}
                className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-white p-3 rounded-xl transition-colors disabled:opacity-50"
            >
                <Plus size={20} />
            </button>
        </form>
      </div>

      {/* Task List - Bento Box Style */}
      <div className="space-y-4">
        <h3 className="text-xl font-heading font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Calendar className="text-violet-500" size={24} /> 
            Today's Focus
        </h3>
        
        {todaysTasks.length === 0 ? (
            <div className="p-12 text-center text-slate-500 dark:text-slate-400 border border-dashed border-slate-300 dark:border-slate-700 rounded-3xl bg-slate-50 dark:bg-slate-800/20">
                <p className="font-medium">No tasks scheduled for today.</p>
                <p className="text-sm mt-2 text-slate-400 dark:text-slate-500">Use the AI wand or go to the Tasks tab to add some!</p>
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {todaysTasks.map(task => (
                    <div 
                        key={task.id} 
                        className={`
                            group relative p-5 rounded-2xl border transition-all duration-300 hover:scale-[1.02]
                            ${task.completed 
                                ? 'bg-slate-50 border-slate-200 dark:bg-slate-900/50 dark:border-slate-800 opacity-60' 
                                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-lg dark:hover:shadow-violet-500/5'}
                        `}
                    >
                        <div className="flex justify-between items-start mb-3">
                            <span className={`px-2 py-1 rounded-md text-xs font-bold uppercase tracking-wider ${getCategoryColor(task.category)}`}>
                                {task.category}
                            </span>
                            <div className="flex gap-1">
                                <span className={`w-2 h-2 rounded-full ${task.priority === 'high' ? 'bg-red-500' : task.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'}`}></span>
                            </div>
                        </div>
                        
                        <h4 className={`text-lg font-bold mb-2 ${task.completed ? 'line-through text-slate-400 dark:text-slate-600' : 'text-slate-800 dark:text-white'}`}>
                            {task.title}
                        </h4>
                        
                        {task.subtasks.length > 0 && (
                            <div className="space-y-1 mb-4">
                                {task.subtasks.slice(0, 2).map(st => (
                                    <div key={st.id} className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                                        <div className="w-1 h-1 bg-slate-400 dark:bg-slate-500 rounded-full"></div>
                                        <span className={st.completed ? 'line-through opacity-70' : ''}>{st.title}</span>
                                    </div>
                                ))}
                                {task.subtasks.length > 2 && (
                                    <p className="text-xs text-slate-400 dark:text-slate-500 pl-3">+{task.subtasks.length - 2} more subtasks</p>
                                )}
                            </div>
                        )}

                        <div className="flex items-center justify-between mt-auto pt-2 border-t border-slate-100 dark:border-slate-700/50">
                             <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-2">
                                ⏱ {task.estimatedMinutes} min
                             </p>
                             <button 
                                onClick={() => onToggleTask(task.id)}
                                className={`
                                    w-9 h-9 rounded-full flex items-center justify-center transition-all mt-1
                                    ${task.completed 
                                        ? 'bg-emerald-500 text-white shadow-emerald-500/20' 
                                        : 'bg-slate-100 dark:bg-slate-700 text-slate-400 hover:bg-violet-500 hover:text-white dark:hover:bg-violet-600'}
                                `}
                             >
                                {task.completed ? <CheckCircle2 size={18} /> : <Circle size={18} />}
                             </button>
                        </div>
                    </div>
                ))}
            </div>
        )}
      </div>
    </div>
  );
};