import React, { useState } from 'react';
import { useDashboard } from '../../context/DashboardContext';
import { TaskPriority } from '../../types/tasks';
import { getTodayString } from '../../utils/dateUtils';
import { Plus, Clock, Tag, Flag } from 'lucide-react';

export const TaskQuickAddBar: React.FC = () => {
  const { database, addTask } = useDashboard();

  const [title, setTitle] = useState('');
  const [categoryTag, setCategoryTag] = useState(database.taskWorkspaces[0]?.name || 'Business');
  const [priority, setPriority] = useState<TaskPriority>('high');
  const [timeBlock, setTimeBlock] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    addTask({
      title: title.trim(),
      categoryTag,
      priority,
      dueDate: getTodayString(),
      timeBlock: timeBlock.trim() || undefined,
      recurrence: 'none',
      status: 'todo',
    });

    setTitle('');
    setTimeBlock('');
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="p-3 bg-[#131722] border border-[#1E2433] rounded-2xl flex flex-col md:flex-row items-center gap-2.5 shadow-md shadow-black/20"
    >
      {/* Title Input */}
      <div className="relative flex-1 w-full">
        <Plus className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#F59E0B]" />
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Quick add priority task for today... (Press Enter to add)"
          className="w-full bg-[#171C2A] border border-[#1E2433] rounded-xl pl-10 pr-4 py-2 text-xs font-medium text-[#F3F4F6] placeholder-[#64748B] focus:border-[#F59E0B] focus:outline-none"
        />
      </div>

      <div className="flex items-center space-x-2 w-full md:w-auto justify-between md:justify-start">
        {/* Workspace Tag */}
        <select
          value={categoryTag}
          onChange={(e) => setCategoryTag(e.target.value)}
          className="bg-[#171C2A] border border-[#1E2433] rounded-xl px-2.5 py-2 text-xs text-[#9CA3AF] focus:border-[#F59E0B] focus:outline-none"
        >
          {database.taskWorkspaces.map((ws) => (
            <option key={ws.id} value={ws.name}>
              {ws.name}
            </option>
          ))}
        </select>

        {/* Priority */}
        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value as TaskPriority)}
          className={`border rounded-xl px-2.5 py-2 text-xs font-semibold focus:outline-none ${
            priority === 'high'
              ? 'bg-red-500/10 border-red-500/30 text-red-400'
              : priority === 'medium'
              ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
              : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
          }`}
        >
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>

        {/* Optional Time Block */}
        <input
          type="text"
          value={timeBlock}
          onChange={(e) => setTimeBlock(e.target.value)}
          placeholder="Time (14:00)"
          className="w-32 bg-[#171C2A] border border-[#1E2433] rounded-xl px-2.5 py-2 text-xs text-[#F3F4F6] placeholder-[#64748B] focus:border-[#F59E0B] focus:outline-none hidden sm:block"
        />

        {/* Add Button */}
        <button
          type="submit"
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#F59E0B] to-[#D97706] text-[#0B0E14] font-bold text-xs hover:from-[#FBBF24] hover:to-[#F59E0B] transition-all flex-shrink-0"
        >
          Add
        </button>
      </div>
    </form>
  );
};
