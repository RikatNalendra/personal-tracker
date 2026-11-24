import React from 'react';
import { NetWorthCard } from './NetWorthCard';
import { CashFlowSnapshot } from './CashFlowSnapshot';
import { TopMoversWidget } from './TopMoversWidget';
import { TodayPrioritiesWidget } from './TodayPrioritiesWidget';
import { LivePriceTicker } from '../portfolio/LivePriceTicker';
import { ActiveTab } from '../layout/Sidebar';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import {
  DollarSign,
  TrendingUp,
  CheckSquare,
  RefreshCw,
  Cloud,
  ArrowRight,
  Shield,
  Layers,
  Sparkles,
} from 'lucide-react';
import { useDashboard } from '../../context/DashboardContext';

interface ExecutiveOverviewProps {
  setActiveTab: (tab: ActiveTab) => void;
  onOpenQuickAdd: () => void;
  onOpenSettings: () => void;
}

export const ExecutiveOverview: React.FC<ExecutiveOverviewProps> = ({
  setActiveTab,
  onOpenQuickAdd,
  onOpenSettings,
}) => {
  const { refreshLivePrices, isRefreshingPrices, syncNowToDrive } = useDashboard();

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Live Market Price Ribbon */}
      <LivePriceTicker />

      {/* Hero Command Center: Net Worth & Top Stats */}
      <NetWorthCard />

      {/* Main 2-column or 3-column Grid for Key Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Column 1: Cash Flow Snapshot */}
        <div className="lg:col-span-1">
          <CashFlowSnapshot onNavigateCashFlow={() => setActiveTab('cashflow')} />
        </div>

        {/* Column 2: Portfolio Top Movers */}
        <div className="lg:col-span-1">
          <TopMoversWidget onNavigatePortfolio={() => setActiveTab('portfolio')} />
        </div>

        {/* Column 3: Today's Priorities & Habits */}
        <div className="lg:col-span-1">
          <TodayPrioritiesWidget onNavigateTasks={() => setActiveTab('tasks')} />
        </div>
      </div>

      {/* Quick Action Navigation Deck */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 pt-2">
        <button
          onClick={() => setActiveTab('cashflow')}
          className="p-4 rounded-2xl bg-[#0D111A] border border-white/[0.08] hover:border-emerald-500/40 hover:bg-[#101522] text-left transition-all group card-rim"
        >
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-2.5 group-hover:scale-105 transition-transform border border-emerald-500/20">
            <DollarSign className="w-5 h-5" />
          </div>
          <h4 className="text-xs font-bold text-[#F3F4F6]">Cash Flow & Wallets</h4>
          <p className="text-[11px] text-[#9CA3AF] mt-0.5">Bank accounts & budgets</p>
        </button>

        <button
          onClick={() => setActiveTab('portfolio')}
          className="p-4 rounded-2xl bg-[#0D111A] border border-white/[0.08] hover:border-amber-500/40 hover:bg-[#101522] text-left transition-all group card-rim"
        >
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center mb-2.5 group-hover:scale-105 transition-transform border border-amber-500/20">
            <TrendingUp className="w-5 h-5" />
          </div>
          <h4 className="text-xs font-bold text-[#F3F4F6]">Assets & Gold Bullion</h4>
          <p className="text-[11px] text-[#9CA3AF] mt-0.5">Live IDX, US & Antam</p>
        </button>

        <button
          onClick={() => setActiveTab('intelligence')}
          className="p-4 rounded-2xl bg-[#0D111A] border border-violet-500/30 hover:border-violet-500/60 hover:bg-[#101522] text-left transition-all group card-rim relative overflow-hidden"
        >
          <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded-full bg-gradient-to-r from-violet-500/30 to-fuchsia-500/30 text-violet-300 text-[9px] font-extrabold border border-violet-500/30">
            NEW
          </div>
          <div className="w-9 h-9 rounded-xl bg-violet-500/15 text-violet-400 flex items-center justify-center mb-2.5 group-hover:scale-105 transition-transform border border-violet-500/30 shadow-[0_0_12px_rgba(139,92,246,0.25)]">
            <Sparkles className="w-5 h-5" />
          </div>
          <h4 className="text-xs font-bold text-[#F3F4F6]">Intelligence & FIRE</h4>
          <p className="text-[11px] text-[#9CA3AF] mt-0.5">Wealth trajectory & runway</p>
        </button>

        <button
          onClick={() => setActiveTab('tasks')}
          className="p-4 rounded-2xl bg-[#0D111A] border border-white/[0.08] hover:border-blue-500/40 hover:bg-[#101522] text-left transition-all group card-rim"
        >
          <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center mb-2.5 group-hover:scale-105 transition-transform border border-blue-500/20">
            <CheckSquare className="w-5 h-5" />
          </div>
          <h4 className="text-xs font-bold text-[#F3F4F6]">Operations & Habits</h4>
          <p className="text-[11px] text-[#9CA3AF] mt-0.5">Focus checklist & Kanban</p>
        </button>

        <button
          onClick={onOpenSettings}
          className="p-4 rounded-2xl bg-[#0D111A] border border-white/[0.08] hover:border-white/20 hover:bg-[#101522] text-left transition-all group card-rim"
        >
          <div className="w-9 h-9 rounded-xl bg-white/10 text-slate-300 flex items-center justify-center mb-2.5 group-hover:scale-105 transition-transform border border-white/10">
            <Cloud className="w-5 h-5" />
          </div>
          <h4 className="text-xs font-bold text-[#F3F4F6]">Drive & Database</h4>
          <p className="text-[11px] text-[#9CA3AF] mt-0.5">Cloud OAuth & JSON sync</p>
        </button>
      </div>
    </div>
  );
};
