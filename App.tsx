import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { FocusTimer } from './components/FocusTimer';
import { ProgressView } from './components/ProgressView';
import { Task, UserStats, AppView } from './types';
import { Menu, X, Plus, Edit2, MountainSnow } from 'lucide-react';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>(AppView.DASHBOARD);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Theme State
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('zenith_theme');
        return (saved as 'dark' | 'light') || 'dark';
    }
    return 'dark';
  });

  // Apply Theme Effect
  useEffect(() => {
    localStorage.setItem('zenith_theme', theme);
    if (theme === 'dark') {
        document.documentElement.classList.add('dark');
    } else {
        document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
      setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };
  
  // State for Tasks
  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('nebula_tasks'); // Keeping key for backward compat
    return saved ? JSON.parse(saved) : [];
  });

  // State for Stats
  const [stats, setStats] = useState<UserStats>(() => {
    const saved = localStorage.getItem('nebula_stats');
    if (saved) {
        const parsed = JSON.parse(saved);
        if (!parsed.xpHistory) parsed.xpHistory = {};
        return parsed;
    }
    return {
      xp: 0,
      level: 1,
      streak: 0,
      tasksCompleted: 0,
      focusMinutes: 0,
      lastLoginDate: new Date().toISOString(),
      xpHistory: {}
    };
  });

  // State for Inline Editing & Creation
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  
  // Quick Add State (Tasks View)
  const [newTaskTitle, setNewTaskTitle] = useState('');

  // Effects for Persistence
  useEffect(() => {
    localStorage.setItem('nebula_tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('nebula_stats', JSON.stringify(stats));
  }, [stats]);

  // Streak Logic
  useEffect(() => {
    const lastDate = new Date(stats.lastLoginDate).toDateString();
    const today = new Date().toDateString();
    
    if (lastDate !== today) {
      // It's a new day
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      let newStreak = stats.streak;
      if (lastDate === yesterday.toDateString()) {
        newStreak += 1;
      } else {
        newStreak = 1; // Reset streak if missed a day
      }

      setStats(prev => ({
        ...prev,
        lastLoginDate: new Date().toISOString(),
        streak: newStreak
      }));
    }
  }, []);

  const handleAddTask = (task: Task) => {
    setTasks(prev => [task, ...prev]);
  };

  const handleManualAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    
    const newTask: Task = {
        id: crypto.randomUUID(),
        title: newTaskTitle,
        category: 'personal',
        priority: 'medium',
        dueDate: new Date().toISOString(),
        completed: false,
        subtasks: [],
        estimatedMinutes: 15,
        aiGenerated: false
    };
    
    handleAddTask(newTask);
    setNewTaskTitle('');
  };

  const handleToggleTask = (taskId: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        const newCompleted = !t.completed;
        
        // Update stats only if completing
        if (newCompleted) {
          const xpGain = t.priority === 'high' ? 100 : t.priority === 'medium' ? 50 : 25;
          const todayKey = new Date().toISOString().split('T')[0];
          
          setStats(s => {
              const currentDailyXP = s.xpHistory[todayKey] || 0;
              return {
                ...s,
                xp: s.xp + xpGain,
                tasksCompleted: s.tasksCompleted + 1,
                level: Math.floor((s.xp + xpGain) / 1000) + 1,
                xpHistory: {
                    ...s.xpHistory,
                    [todayKey]: currentDailyXP + xpGain
                }
              };
          });
        }
        
        return { ...t, completed: newCompleted };
      }
      return t;
    }));
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks(prev => prev.filter(t => t.id !== taskId));
  };

  const handleFocusComplete = (minutes: number) => {
    const xpGain = Math.floor(minutes * 2); // 2 XP per minute focused
    const todayKey = new Date().toISOString().split('T')[0];
    
    setStats(s => {
      const currentDailyXP = s.xpHistory[todayKey] || 0;
      return {
        ...s,
        focusMinutes: s.focusMinutes + minutes,
        xp: s.xp + xpGain,
        level: Math.floor((s.xp + xpGain) / 1000) + 1,
        xpHistory: {
            ...s.xpHistory,
            [todayKey]: currentDailyXP + xpGain
        }
      };
    });
  };

  // Editing Handlers
  const startEditing = (task: Task) => {
    setEditingTaskId(task.id);
    setEditValue(task.title);
  };

  const saveTaskTitle = () => {
    if (editingTaskId && editValue.trim()) {
      setTasks(prev => prev.map(t =>
        t.id === editingTaskId ? { ...t, title: editValue.trim() } : t
      ));
    }
    setEditingTaskId(null);
    setEditValue('');
  };

  const cancelEditing = () => {
    setEditingTaskId(null);
    setEditValue('');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-200 font-sans selection:bg-violet-500/30 transition-colors duration-300">
      <Sidebar 
        currentView={currentView} 
        onChangeView={(view) => {
            setCurrentView(view);
            setIsMobileMenuOpen(false);
        }}
        isMobileMenuOpen={isMobileMenuOpen}
        theme={theme}
        onToggleTheme={toggleTheme}
      />
      
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 p-4 flex justify-between items-center transition-colors">
        <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
                <MountainSnow className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-heading font-bold text-slate-900 dark:text-white">Zenith</h1>
        </div>
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      <main className="md:pl-64 min-h-screen pt-20 md:pt-0">
        <div className="max-w-7xl mx-auto p-4 md:p-8">
          
          {currentView === AppView.DASHBOARD && (
            <Dashboard 
              tasks={tasks}
              stats={stats}
              onAddTask={handleAddTask}
              onToggleTask={handleToggleTask}
              onDeleteTask={handleDeleteTask}
              theme={theme}
            />
          )}

          {currentView === AppView.TASKS && (
             <div className="space-y-6 animate-fade-in">
                 <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                     <h2 className="text-3xl font-heading font-bold text-slate-900 dark:text-white">All Tasks</h2>
                 </div>

                 {/* Manual Quick Add */}
                 <form onSubmit={handleManualAddTask} className="flex gap-3 bg-white dark:bg-slate-900 p-2 rounded-xl border border-slate-200 dark:border-slate-800 focus-within:border-violet-500/50 transition-colors shadow-sm dark:shadow-none">
                    <input 
                        type="text" 
                        value={newTaskTitle}
                        onChange={(e) => setNewTaskTitle(e.target.value)}
                        placeholder="Add a new task..."
                        className="flex-1 bg-transparent px-4 py-2 outline-none text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500"
                    />
                    <button 
                        type="submit"
                        disabled={!newTaskTitle.trim()}
                        className="bg-violet-600 hover:bg-violet-500 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        <Plus size={18} />
                        <span className="hidden md:inline">Add</span>
                    </button>
                 </form>

                 <div className="grid gap-3">
                    {tasks.length === 0 && (
                        <div className="text-center py-12 bg-white dark:bg-slate-900/50 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800">
                            <p className="text-slate-500 dark:text-slate-500">No tasks found. Add one above to get started!</p>
                        </div>
                    )}
                    
                    {tasks.map(task => (
                        <div key={task.id} className="group bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/80 p-4 rounded-xl flex items-center justify-between border border-slate-200 dark:border-slate-700 transition-all shadow-sm dark:shadow-none">
                             <div className="flex-1 flex items-center gap-4 min-w-0 mr-4">
                                <button 
                                    onClick={() => handleToggleTask(task.id)}
                                    className={`shrink-0 w-6 h-6 rounded-md border flex items-center justify-center transition-all duration-200 ${task.completed ? 'bg-emerald-500 border-emerald-500' : 'border-slate-300 dark:border-slate-500 hover:border-violet-400'}`}
                                >
                                    {task.completed && <div className="w-2 h-2 bg-white rounded-full" />}
                                </button>
                                
                                {editingTaskId === task.id ? (
                                    <input
                                        type="text"
                                        value={editValue}
                                        onChange={(e) => setEditValue(e.target.value)}
                                        onBlur={saveTaskTitle}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') saveTaskTitle();
                                            if (e.key === 'Escape') cancelEditing();
                                        }}
                                        autoFocus
                                        className="flex-1 bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-white px-3 py-1.5 rounded-lg border border-violet-500 outline-none focus:ring-2 focus:ring-violet-500/50 min-w-0"
                                    />
                                ) : (
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <span 
                                                onClick={() => startEditing(task)}
                                                className={`cursor-text hover:text-violet-600 dark:hover:text-violet-300 transition-colors truncate select-none font-medium ${task.completed ? 'line-through text-slate-400 dark:text-slate-500' : 'text-slate-700 dark:text-slate-200'}`}
                                                title="Click to edit"
                                            >
                                                {task.title}
                                            </span>
                                            <Edit2 
                                                size={12} 
                                                className="opacity-0 group-hover:opacity-100 text-slate-400 transition-opacity" 
                                            />
                                        </div>
                                    </div>
                                )}
                             </div>
                             
                             <button 
                                onClick={() => handleDeleteTask(task.id)} 
                                className="shrink-0 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-400/10 transition-colors p-2 rounded-lg opacity-0 group-hover:opacity-100"
                                title="Delete Task"
                             >
                                <X size={18} />
                             </button>
                        </div>
                    ))}
                 </div>
             </div>
          )}

          {currentView === AppView.FOCUS && (
             <div className="min-h-[calc(100vh-100px)] flex flex-col items-center justify-center animate-fade-in py-10">
                <div className="text-center mb-8">
                    <h2 className="text-4xl font-heading font-bold text-slate-900 dark:text-white mb-2">Deep Focus</h2>
                    <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto text-sm">Select a duration, choose your ambience, and flow.</p>
                </div>
                <FocusTimer onComplete={handleFocusComplete} />
             </div>
          )}

          {currentView === AppView.ANALYTICS && (
            <ProgressView stats={stats} theme={theme} />
          )}

        </div>
      </main>
    </div>
  );
};

export default App;