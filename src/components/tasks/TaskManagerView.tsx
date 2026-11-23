import React, { useState } from 'react';
import { useDashboard } from '../../context/DashboardContext';
import { TaskQuickAddBar } from './TaskQuickAddBar';
import { CompletionProgressRing } from './CompletionProgressRing';
import { DailyFocusView } from './DailyFocusView';
import { KanbanBoardView } from './KanbanBoardView';
import { TaskModal } from './TaskModal';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { getTodayString } from '../../utils/dateUtils';
import {
  CheckSquare,
  Columns,
  Plus,
  Briefcase,
  TrendingUp,
  User,
  Activity,
  BookOpen,
} from 'lucide-react';

export const TaskManagerView: React.FC = () => {
  const { database } = useDashboard();
  const [viewMode, setViewMode] = useState<'checklist' | 'kanban'>('checklist');
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const today = getTodayString();
  const todayTasks = database.tasks.filter((t) => t.dueDate === today);
  const completedToday = todayTasks.filter((t) => t.status === 'completed');

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Banner: Progress Ring & Daily Executive Status */}
      <Card className="p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 bg-gradient-to-r from-[#131722] via-[#151A27] to-[#131722]">
        <CompletionProgressRing
          completedCount={completedToday.length}
          totalCount={todayTasks.length}
        />

        {/* View Mode Switcher & Add Task */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-between md:justify-end">
          {/* Checklist vs Kanban Toggle */}
          <div className="flex items-center p-1 rounded-xl bg-[#0E121B] border border-[#1E2433]">
            <button
              onClick={() => setViewMode('checklist')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'checklist'
                  ? 'bg-[#1E2433] text-[#F3F4F6] shadow-sm'
                  : 'text-[#9CA3AF] hover:text-[#F3F4F6]'
              }`}
            >
              <CheckSquare className="w-3.5 h-3.5 text-[#10B981]" />
              <span>Daily Focus</span>
            </button>
            <button
              onClick={() => setViewMode('kanban')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'kanban'
                  ? 'bg-[#1E2433] text-[#F3F4F6] shadow-sm'
                  : 'text-[#9CA3AF] hover:text-[#F3F4F6]'
              }`}
            >
              <Columns className="w-3.5 h-3.5 text-[#F59E0B]" />
              <span>Kanban Board</span>
            </button>
          </div>

          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsModalOpen(true)}
            icon={<Plus className="w-4 h-4" />}
          >
            New Task
          </Button>
        </div>
      </Card>

      {/* Quick Add Bar */}
      <TaskQuickAddBar />

      {/* Multi-Domain Workspace Filter Tags */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1 no-scrollbar text-xs">
        <span className="text-[#64748B] font-medium mr-1 flex-shrink-0">Workspace:</span>
        <button
          onClick={() => setSelectedTag('all')}
          className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all font-medium ${
            selectedTag === 'all'
              ? 'bg-[#1E2433] text-[#F3F4F6] border border-[#F59E0B]/30'
              : 'bg-[#131722] text-[#9CA3AF] hover:text-[#F3F4F6] border border-[#1E2433]'
          }`}
        >
          All Domains ({database.tasks.length})
        </button>

        {database.taskWorkspaces.map((ws) => {
          const count = database.tasks.filter((t) => t.categoryTag === ws.name).length;
          return (
            <button
              key={ws.id}
              onClick={() => setSelectedTag(ws.name)}
              className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all font-medium flex items-center space-x-1.5 ${
                selectedTag === ws.name
                  ? 'bg-[#1E2433] text-[#F3F4F6] border border-[#F59E0B]/30'
                  : 'bg-[#131722] text-[#9CA3AF] hover:text-[#F3F4F6] border border-[#1E2433]'
              }`}
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: ws.color }}
              />
              <span>{ws.name}</span>
              <span className="text-[10px] text-[#64748B] font-mono">({count})</span>
            </button>
          );
        })}
      </div>

      {/* Main View: Daily Focus Checklist OR Kanban Board */}
      {viewMode === 'checklist' ? (
        <DailyFocusView selectedTag={selectedTag} />
      ) : (
        <KanbanBoardView selectedTag={selectedTag} />
      )}

      <TaskModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};
