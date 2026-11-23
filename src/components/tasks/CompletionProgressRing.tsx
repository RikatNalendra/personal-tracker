import React from 'react';
import { CheckCircle2, Flame, Award } from 'lucide-react';

interface CompletionProgressRingProps {
  completedCount: number;
  totalCount: number;
}

export const CompletionProgressRing: React.FC<CompletionProgressRingProps> = ({
  completedCount,
  totalCount,
}) => {
  const percent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percent / 100) * circumference;

  return (
    <div className="flex items-center space-x-4">
      {/* SVG Circular Ring */}
      <div className="relative w-24 h-24 flex items-center justify-center flex-shrink-0">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
          {/* Background circle */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            stroke="#1E2433"
            strokeWidth="8"
            fill="transparent"
          />
          {/* Progress circle */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            stroke={percent === 100 ? '#10B981' : '#F59E0B'}
            strokeWidth="8"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-700 ease-out"
          />
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-lg font-bold font-mono text-[#F3F4F6]">{percent}%</span>
          <span className="text-[10px] text-[#9CA3AF] font-medium">Done</span>
        </div>
      </div>

      {/* Completion Text */}
      <div>
        <div className="flex items-center space-x-2">
          <h4 className="text-sm font-bold text-[#F3F4F6]">Daily Focus Completion</h4>
          {percent === 100 && (
            <span className="flex items-center space-x-1 px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">
              <Award className="w-3 h-3" />
              <span>Target Achieved</span>
            </span>
          )}
        </div>
        <p className="text-xs text-[#9CA3AF] mt-0.5">
          <span className="font-mono font-bold text-[#F3F4F6]">{completedCount}</span> of{' '}
          <span className="font-mono font-bold text-[#F3F4F6]">{totalCount}</span> scheduled
          priorities completed today
        </p>

        <div className="mt-2 flex items-center space-x-3 text-[11px] text-[#64748B]">
          <span className="flex items-center space-x-1 text-emerald-400">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>High priority tracking</span>
          </span>
          <span className="flex items-center space-x-1 text-amber-400">
            <Flame className="w-3.5 h-3.5" />
            <span>Habit streak maintained</span>
          </span>
        </div>
      </div>
    </div>
  );
};
