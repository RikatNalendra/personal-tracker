import React, { useState } from 'react';
import { useDashboard } from '../../context/DashboardContext';
import { Task } from '../../types/tasks';
import { Card } from '../common/Card';
import { TaskModal } from './TaskModal';
import { getPriorityBadgeColor } from '../../utils/colors';
import { formatDate, getTodayString, isToday, isPastDue } from '../../utils/dateUtils';
import {
  CheckCircle2,
  Circle,
  Clock,
  Flame,
  Calendar,
  Edit2,
  Trash2,
  Repeat,
  AlertCircle,
  Sparkles,
} from 'lucide-react';

interface DailyFocusViewProps {
  selectedTag: string;
}

export const DailyFocusView: React.FC<DailyFocusViewProps> = ({ selectedTag }) => {
  const { database, toggleTaskStatus, deleteTask } = useDashboard();
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const today = getTodayString();

  // Filter tasks by workspace tag if selected
  const allTasks = database.tasks.filter((t) => {
    if (selectedTag !== 'all' && t.categoryTag !== selectedTag) return false;
    return true;
  });

  // Group 1: Today's Priorities (non-recurring due today or past due, plus completed today)
  const todayPriorities = allTasks.filter(
    (t) => t.recurrence === 'none' && (t.dueDate === today || isPastDue(t.dueDate))
  );

  // Group 2: Recurring Habits & Daily Routines
  const recurringHabits = allTasks.filter((t) => t.recurrence !== 'none');

  // Group 3: Upcoming Deliverables
  const upcomingTasks = allTasks.filter(
    (t) => t.recurrence === 'none' && t.dueDate > today && t.status !== 'completed'
  );

  const renderTaskItem = (task: Task) => {
    const isDone = task.status === 'completed';
    const priorityColor = getPriorityBadgeColor(task.priority);

    return (
      <div
        key={task.id}
        className={`group p-3.5 rounded-xl border transition-all duration-200 flex items-start space-x-3.5 ${
          isDone
            ? 'bg-[#131722]/50 border-[#1E2433]/50 opacity-65'
            : 'bg-[#131722] border-[#1E2433] hover:border-[#2A3246]'
        }`}
      >
        {/* Checkbox */}
        <button
          onClick={() => toggleTaskStatus(task.id)}
          className={`flex-shrink-0 mt-0.5 rounded-lg transition-transform active:scale-90 ${
            isDone ? 'text-emerald-400' : 'text-[#64748B] hover:text-[#F59E0B]'
          }`}
        >
          {isDone ? (
            <CheckCircle2 className="w-5 h-5 fill-emerald-500/20 text-emerald-400" />
          ) : (
            <Circle className="w-5 h-5" />
          )}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 flex-wrap gap-y-1">
            <span
              className={`text-sm font-semibold tracking-tight transition-all ${
                isDone ? 'line-through text-[#64748B]' : 'text-[#F3F4F6]'
              }`}
            >
              {task.title}
            </span>

            {/* Tag */}
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#171C2A] text-[#9CA3AF] border border-[#1E2433]">
              {task.categoryTag}
            </span>

            {/* Priority Badge */}
            <span
              className={`text-[10px] uppercase font-bold px-1.5 py-0.2 rounded border ${priorityColor.bg} ${priorityColor.text} ${priorityColor.border}`}
            >
              {task.priority}
            </span>

            {/* Habit Streak Badge */}
            {task.streakCount && task.streakCount > 0 ? (
              <span className="inline-flex items-center space-x-1 text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30">
                <Flame className="w-3 h-3 fill-amber-400" />
                <span className="font-bold">{task.streakCount}d streak</span>
              </span>
            ) : null}
          </div>

          {task.notes && (
            <p className="text-xs text-[#9CA3AF] mt-1 line-clamp-2 leading-relaxed">
              {task.notes}
            </p>
          )}

          {/* Metadata Footer */}
          <div className="mt-2 flex items-center space-x-3 text-[11px] text-[#64748B]">
            {task.timeBlock && (
              <span className="flex items-center space-x-1 text-[#F59E0B]">
                <Clock className="w-3 h-3" />
                <span className="font-mono">{task.timeBlock}</span>
              </span>
            )}
            <span className="flex items-center space-x-1">
              <Calendar className="w-3 h-3" />
              <span>{formatDate(task.dueDate)}</span>
            </span>
            {task.recurrence !== 'none' && (
              <span className="flex items-center space-x-1 text-[#3B82F6]">
                <Repeat className="w-3 h-3" />
                <span className="capitalize">{task.recurrence}</span>
              </span>
            )}
          </div>
        </div>

        {/* Action icons */}
        <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => {
              setEditingTask(task);
              setIsModalOpen(true);
            }}
            className="p-1.5 rounded-lg text-[#64748B] hover:text-[#F3F4F6] hover:bg-[#1E2433]"
            title="Edit Task"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => {
              if (window.confirm('Delete this task?')) {
                deleteTask(task.id);
              }
            }}
            className="p-1.5 rounded-lg text-[#64748B] hover:text-red-400 hover:bg-[#1E2433]"
            title="Delete Task"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* 1. TODAY'S PRIORITIES */}
      <div className="space-y-3">
        <div className="flex items-center justify-between pb-1">
          <h3 className="text-sm font-bold text-[#F3F4F6] flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-[#10B981]" />
            <span>Today's Critical Priorities</span>
            <span className="text-xs font-normal text-[#9CA3AF]">
              ({todayPriorities.filter((t) => t.status === 'completed').length}/
              {todayPriorities.length} completed)
            </span>
          </h3>
        </div>

        {todayPriorities.length === 0 ? (
          <div className="p-6 rounded-2xl bg-[#131722] border border-[#1E2433] text-center text-xs text-[#9CA3AF]">
            No pending one-off priorities scheduled for today. Use the Quick Add bar above to add one.
          </div>
        ) : (
          <div className="space-y-2.5">
            {todayPriorities.map((task) => renderTaskItem(task))}
          </div>
        )}
      </div>

      {/* 2. RECURRING HABITS & ROUTINES */}
      <div className="space-y-3">
        <div className="flex items-center justify-between pb-1">
          <h3 className="text-sm font-bold text-[#F3F4F6] flex items-center space-x-2">
            <Flame className="w-4 h-4 text-[#F59E0B]" />
            <span>Executive Routines & Daily Habits</span>
            <span className="text-xs font-normal text-[#9CA3AF]">
              ({recurringHabits.length} habits)
            </span>
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {recurringHabits.map((habit) => renderTaskItem(habit))}
        </div>
      </div>

      {/* 3. UPCOMING DELIVERABLES */}
      {upcomingTasks.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between pb-1">
            <h3 className="text-sm font-bold text-[#F3F4F6] flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-[#3B82F6]" />
              <span>Upcoming Focus & Deliverables</span>
              <span className="text-xs font-normal text-[#9CA3AF]">
                ({upcomingTasks.length} tasks)
              </span>
            </h3>
          </div>

          <div className="space-y-2.5">
            {upcomingTasks.map((task) => renderTaskItem(task))}
          </div>
        </div>
      )}

      <TaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        taskToEdit={editingTask}
      />
    </div>
  );
};
