import React from 'react';
import { useDashboard } from '../../context/DashboardContext';
import { Card } from '../common/Card';
import { getTodayString } from '../../utils/dateUtils';
import { getPriorityBadgeColor } from '../../utils/colors';
import {
  CheckSquare,
  CheckCircle2,
  Circle,
  Clock,
  Flame,
  ArrowRight,
} from 'lucide-react';

interface TodayPrioritiesWidgetProps {
  onNavigateTasks: () => void;
}

export const TodayPrioritiesWidget: React.FC<TodayPrioritiesWidgetProps> = ({
  onNavigateTasks,
}) => {
  const { database, toggleTaskStatus } = useDashboard();
  const today = getTodayString();

  // Tasks due today or recurring
  const todayTasks = database.tasks.filter(
    (t) => t.dueDate === today || t.recurrence !== 'none'
  );

  const completedCount = todayTasks.filter((t) => t.status === 'completed').length;

  return (
    <Card className="p-5 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between pb-3 border-b border-[#1E2433]">
          <div>
            <h3 className="text-sm font-bold text-[#F3F4F6] flex items-center space-x-2">
              <CheckSquare className="w-4 h-4 text-[#10B981]" />
              <span>Today's Priorities & Habits</span>
            </h3>
            <p className="text-xs text-[#9CA3AF]">
              {completedCount} of {todayTasks.length} items checked off
            </p>
          </div>
          <button
            onClick={onNavigateTasks}
            className="text-xs text-[#F59E0B] hover:underline font-medium inline-flex items-center space-x-1"
          >
            <span>Open Tasks</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {/* Interactive List */}
        {todayTasks.length === 0 ? (
          <div className="py-8 text-center text-xs text-[#9CA3AF]">
            No priorities scheduled for today. Add tasks in Daily Tasks.
          </div>
        ) : (
          <div className="divide-y divide-[#1E2433]/60 my-2">
            {todayTasks.slice(0, 5).map((task) => {
              const isDone = task.status === 'completed';
              const priorityColor = getPriorityBadgeColor(task.priority);

              return (
                <div
                  key={task.id}
                  className="py-2.5 flex items-start space-x-3 group transition-colors"
                >
                  <button
                    onClick={() => toggleTaskStatus(task.id)}
                    className={`mt-0.5 flex-shrink-0 transition-transform active:scale-90 ${
                      isDone ? 'text-emerald-400' : 'text-[#64748B] hover:text-[#F59E0B]'
                    }`}
                  >
                    {isDone ? (
                      <CheckCircle2 className="w-4 h-4 fill-emerald-500/20 text-emerald-400" />
                    ) : (
                      <Circle className="w-4 h-4" />
                    )}
                  </button>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-1.5 flex-wrap">
                      <span
                        className={`text-xs font-semibold truncate ${
                          isDone ? 'line-through text-[#64748B]' : 'text-[#F3F4F6]'
                        }`}
                      >
                        {task.title}
                      </span>

                      {task.streakCount && task.streakCount > 0 ? (
                        <span className="inline-flex items-center space-x-0.5 text-[9px] px-1.5 py-0.2 rounded-full bg-amber-500/10 text-amber-400">
                          <Flame className="w-2.5 h-2.5 fill-amber-400" />
                          <span>{task.streakCount}d</span>
                        </span>
                      ) : null}
                    </div>

                    <div className="flex items-center space-x-2 text-[10px] text-[#64748B] mt-0.5">
                      {task.timeBlock && (
                        <span className="text-[#F59E0B] font-mono flex items-center space-x-0.5">
                          <Clock className="w-2.5 h-2.5" />
                          <span>{task.timeBlock}</span>
                        </span>
                      )}
                      <span>{task.categoryTag}</span>
                      <span
                        className={`uppercase text-[8px] font-bold px-1 rounded ${priorityColor.text}`}
                      >
                        {task.priority}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Card>
  );
};
