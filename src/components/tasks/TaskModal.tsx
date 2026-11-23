import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { useDashboard } from '../../context/DashboardContext';
import { Task, TaskPriority, TaskRecurrence } from '../../types/tasks';
import { getTodayString } from '../../utils/dateUtils';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskToEdit?: Task | null;
}

export const TaskModal: React.FC<TaskModalProps> = ({ isOpen, onClose, taskToEdit }) => {
  const { database, addTask, editTask } = useDashboard();

  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [categoryTag, setCategoryTag] = useState('Business');
  const [priority, setPriority] = useState<TaskPriority>('high');
  const [dueDate, setDueDate] = useState(getTodayString());
  const [timeBlock, setTimeBlock] = useState('');
  const [recurrence, setRecurrence] = useState<TaskRecurrence>('none');

  useEffect(() => {
    if (taskToEdit) {
      setTitle(taskToEdit.title);
      setNotes(taskToEdit.notes || '');
      setCategoryTag(taskToEdit.categoryTag);
      setPriority(taskToEdit.priority);
      setDueDate(taskToEdit.dueDate);
      setTimeBlock(taskToEdit.timeBlock || '');
      setRecurrence(taskToEdit.recurrence);
    } else {
      setTitle('');
      setNotes('');
      setCategoryTag(database.taskWorkspaces[0]?.name || 'Business');
      setPriority('high');
      setDueDate(getTodayString());
      setTimeBlock('');
      setRecurrence('none');
    }
  }, [taskToEdit, isOpen, database.taskWorkspaces]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (taskToEdit) {
      editTask(taskToEdit.id, {
        title: title.trim(),
        notes: notes.trim() || undefined,
        categoryTag,
        priority,
        dueDate,
        timeBlock: timeBlock.trim() || undefined,
        recurrence,
      });
    } else {
      addTask({
        title: title.trim(),
        notes: notes.trim() || undefined,
        categoryTag,
        priority,
        dueDate,
        timeBlock: timeBlock.trim() || undefined,
        recurrence,
        status: 'todo',
      });
    }
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={taskToEdit ? 'Edit Task / Activity' : 'Create Task / Activity'}
      subtitle="Organize executive operations, habits, and critical meetings"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-[#9CA3AF] mb-1">Title</label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Q4 Asset Allocation Rebalance"
            className="w-full bg-[#171C2A] border border-[#1E2433] rounded-xl px-3.5 py-2.5 text-xs text-[#F3F4F6] focus:border-[#F59E0B] focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-[#9CA3AF] mb-1">Tag / Workspace</label>
            <select
              value={categoryTag}
              onChange={(e) => setCategoryTag(e.target.value)}
              className="w-full bg-[#171C2A] border border-[#1E2433] rounded-xl px-3 py-2 text-xs text-[#F3F4F6] focus:border-[#F59E0B] focus:outline-none"
            >
              {database.taskWorkspaces.map((ws) => (
                <option key={ws.id} value={ws.name}>
                  {ws.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#9CA3AF] mb-1">Priority</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as TaskPriority)}
              className="w-full bg-[#171C2A] border border-[#1E2433] rounded-xl px-3 py-2 text-xs text-[#F3F4F6] focus:border-[#F59E0B] focus:outline-none"
            >
              <option value="high">High Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="low">Low Priority</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-[#9CA3AF] mb-1">Due Date</label>
            <input
              type="date"
              required
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full bg-[#171C2A] border border-[#1E2433] rounded-xl px-3 py-2 text-xs text-[#F3F4F6] focus:border-[#F59E0B] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#9CA3AF] mb-1">Time Block</label>
            <input
              type="text"
              value={timeBlock}
              onChange={(e) => setTimeBlock(e.target.value)}
              placeholder="e.g. 09:00 - 10:30"
              className="w-full bg-[#171C2A] border border-[#1E2433] rounded-xl px-3 py-2 text-xs text-[#F3F4F6] focus:border-[#F59E0B] focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-[#9CA3AF] mb-1">Recurring Habit</label>
          <select
            value={recurrence}
            onChange={(e) => setRecurrence(e.target.value as TaskRecurrence)}
            className="w-full bg-[#171C2A] border border-[#1E2433] rounded-xl px-3 py-2 text-xs text-[#F3F4F6] focus:border-[#F59E0B] focus:outline-none"
          >
            <option value="none">One-time Task</option>
            <option value="daily">Daily Habit (Tracks Streaks)</option>
            <option value="weekdays">Weekdays Only (Mon-Fri)</option>
            <option value="weekly">Weekly Routine</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-[#9CA3AF] mb-1">
            Notes / Reference Links
          </label>
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Deliverables, agenda, or key points..."
            className="w-full bg-[#171C2A] border border-[#1E2433] rounded-xl px-3 py-2 text-xs text-[#F3F4F6] focus:border-[#F59E0B] focus:outline-none resize-none"
          />
        </div>

        <div className="flex justify-end space-x-2 pt-3 border-t border-[#1E2433]">
          <Button variant="ghost" size="sm" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" type="submit">
            {taskToEdit ? 'Save Changes' : 'Create Task'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
