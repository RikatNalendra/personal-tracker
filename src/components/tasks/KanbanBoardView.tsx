import React, { useState } from 'react';
import { useDashboard } from '../../context/DashboardContext';
import { Task, TaskStatus } from '../../types/tasks';
import { getPriorityBadgeColor } from '../../utils/colors';
import { formatDate } from '../../utils/dateUtils';
import { TaskModal } from './TaskModal';
import {
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Clock,
  Calendar,
  Plus,
  Edit2,
  Trash2,
  Circle,
} from 'lucide-react';

interface KanbanBoardViewProps {
  selectedTag: string;
}

export const KanbanBoardView: React.FC<KanbanBoardViewProps> = ({ selectedTag }) => {
  const { database, updateTaskStatus, deleteTask } = useDashboard();
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Filter tasks
  const tasks = database.tasks.filter((t) => {
    if (selectedTag !== 'all' && t.categoryTag !== selectedTag) return false;
    return true;
  });

  const columns: { id: TaskStatus; title: string; color: string; badgeBg: string }[] = [
    { id: 'todo', title: 'To Do', color: '#F59E0B', badgeBg: 'bg-amber-500/10 text-amber-400' },
    { id: 'in_progress', title: 'In Progress', color: '#3B82F6', badgeBg: 'bg-blue-500/10 text-blue-400' },
    { id: 'completed', title: 'Completed', color: '#10B981', badgeBg: 'bg-emerald-500/10 text-emerald-400' },
  ];

  const getNextStatus = (current: TaskStatus): TaskStatus | null => {
    if (current === 'todo') return 'in_progress';
    if (current === 'in_progress') return 'completed';
    return null;
  };

  const getPrevStatus = (current: TaskStatus): TaskStatus | null => {
    if (current === 'completed') return 'in_progress';
    if (current === 'in_progress') return 'todo';
    return null;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-start">
      {columns.map((col) => {
        const colTasks = tasks.filter((t) => t.status === col.id);

        return (
          <div
            key={col.id}
            className="bg-[#0E121B] border border-[#1E2433] rounded-2xl p-4 flex flex-col space-y-3 min-h-[500px]"
          >
            {/* Column Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[#1E2433]">
              <div className="flex items-center space-x-2">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: col.color }}
                />
                <h4 className="text-sm font-bold text-[#F3F4F6]">{col.title}</h4>
              </div>
              <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded-full ${col.badgeBg}`}>
                {colTasks.length}
              </span>
            </div>

            {/* Task Cards */}
            <div className="space-y-3 flex-1 overflow-y-auto">
              {colTasks.length === 0 ? (
                <div className="py-12 text-center text-xs text-[#64748B] border border-dashed border-[#1E2433] rounded-xl">
                  No tasks in {col.title}
                </div>
              ) : (
                colTasks.map((task) => {
                  const priorityColor = getPriorityBadgeColor(task.priority);
                  const next = getNextStatus(task.status);
                  const prev = getPrevStatus(task.status);

                  return (
                    <div
                      key={task.id}
                      className="p-3.5 bg-[#131722] border border-[#1E2433] hover:border-[#2A3246] rounded-xl space-y-2.5 transition-all group shadow-sm"
                    >
                      {/* Header with Tag & Priority */}
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#171C2A] text-[#9CA3AF] border border-[#1E2433]">
                          {task.categoryTag}
                        </span>
                        <span
                          className={`text-[9px] uppercase font-bold px-1.5 py-0.2 rounded border ${priorityColor.bg} ${priorityColor.text} ${priorityColor.border}`}
                        >
                          {task.priority}
                        </span>
                      </div>

                      {/* Title & Notes */}
                      <div>
                        <h5 className="text-xs font-bold text-[#F3F4F6] leading-snug">
                          {task.title}
                        </h5>
                        {task.notes && (
                          <p className="text-[11px] text-[#9CA3AF] mt-1 line-clamp-2">
                            {task.notes}
                          </p>
                        )}
                      </div>

                      {/* Meta & Time Block */}
                      <div className="flex items-center justify-between text-[10px] text-[#64748B] pt-1 border-t border-[#1E2433]/50">
                        <div className="flex items-center space-x-2">
                          <span className="flex items-center space-x-1">
                            <Calendar className="w-3 h-3" />
                            <span>{formatDate(task.dueDate)}</span>
                          </span>
                          {task.timeBlock && (
                            <span className="text-[#F59E0B] font-mono flex items-center space-x-1">
                              <Clock className="w-3 h-3" />
                              <span>{task.timeBlock}</span>
                            </span>
                          )}
                        </div>

                        {/* Move Actions */}
                        <div className="flex items-center space-x-1">
                          {prev && (
                            <button
                              onClick={() => updateTaskStatus(task.id, prev)}
                              className="p-1 rounded bg-[#171C2A] hover:bg-[#1E2433] text-[#9CA3AF] hover:text-[#F3F4F6]"
                              title={`Move to ${prev.replace('_', ' ')}`}
                            >
                              <ArrowLeft className="w-3 h-3" />
                            </button>
                          )}
                          {next && (
                            <button
                              onClick={() => updateTaskStatus(task.id, next)}
                              className="p-1 rounded bg-[#171C2A] hover:bg-[#1E2433] text-[#F59E0B] hover:text-[#FBBF24]"
                              title={`Move to ${next.replace('_', ' ')}`}
                            >
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          )}
                          <button
                            onClick={() => {
                              setEditingTask(task);
                              setIsModalOpen(true);
                            }}
                            className="p-1 rounded hover:bg-[#1E2433] text-[#64748B] hover:text-[#F3F4F6]"
                            title="Edit"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => deleteTask(task.id)}
                            className="p-1 rounded hover:bg-[#1E2433] text-[#64748B] hover:text-red-400"
                            title="Delete"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        );
      })}

      <TaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        taskToEdit={editingTask}
      />
    </div>
  );
};
