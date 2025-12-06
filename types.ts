export type Priority = 'low' | 'medium' | 'high';
export type Category = 'study' | 'personal' | 'work' | 'health' | 'social';

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  category: Category;
  priority: Priority;
  completed: boolean;
  dueDate: string; // ISO string
  estimatedMinutes?: number;
  subtasks: Subtask[];
  aiGenerated?: boolean;
}

export interface UserStats {
  xp: number;
  level: number;
  streak: number;
  tasksCompleted: number;
  focusMinutes: number;
  lastLoginDate: string;
  xpHistory: Record<string, number>; // Date string (YYYY-MM-DD) -> XP amount
}

export interface FocusSession {
  isActive: boolean;
  timeLeft: number; // in seconds
  mode: 'focus' | 'break';
  totalDuration: number;
}

export enum AppView {
  DASHBOARD = 'DASHBOARD',
  TASKS = 'TASKS',
  FOCUS = 'FOCUS',
  ANALYTICS = 'ANALYTICS'
}