export type TaskPriority = 'low' | 'medium' | 'high';

export type TaskStatus = 'todo' | 'in_progress' | 'completed';

export type TaskRecurrence = 'none' | 'daily' | 'weekdays' | 'weekly';

export interface Task {
  id: string;
  title: string;
  notes?: string;
  categoryTag: string; // e.g. 'Work / Office', 'Business', 'Personal', 'Fitness', 'Learning'
  priority: TaskPriority;
  dueDate: string; // YYYY-MM-DD
  timeBlock?: string; // e.g. "08:00 - 09:30" or "Morning Focus"
  recurrence: TaskRecurrence;
  status: TaskStatus;
  completedAt?: string;
  createdAt: string;
  streakCount?: number; // for recurring habits
}

export interface TaskWorkspace {
  id: string;
  name: string;
  color: string;
  icon: string;
}
