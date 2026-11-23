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
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 pt-2">
        <button
          onClick={() => setActiveTab('cashflow')}
          className="p-4 rounded-2xl bg-[#131722] border border-[#1E2433] hover:border-[#F59E0B]/40 hover:bg-[#171C2A] text-left transition-all group"
        >
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-2.5 group-hover:scale-105 transition-transform">
            <DollarSign className="w-5 h-5" />
          </div>
          <h4 className="text-xs font-bold text-[#F3F4F6]">Cash Flow & Wallets</h4>
          <p className="text-[11px] text-[#9CA3AF] mt-0.5">Manage bank accounts & budgets</p>
        </button>

        <button
          onClick={() => setActiveTab('portfolio')}
          className="p-4 rounded-2xl bg-[#131722] border border-[#1E2433] hover:border-[#F59E0B]/40 hover:bg-[#171C2A] text-left transition-all group"
        >
          <div className="w-9 h-9 rounded-xl bg-[#F59E0B]/10 text-[#F59E0B] flex items-center justify-center mb-2.5 group-hover:scale-105 transition-transform">
            <TrendingUp className="w-5 h-5" />
          </div>
          <h4 className="text-xs font-bold text-[#F3F4F6]">Assets & Gold Bullion</h4>
          <p className="text-[11px] text-[#9CA3AF] mt-0.5">Live IDX, US stocks & Antam</p>
        </button>

        <button
          onClick={() => setActiveTab('tasks')}
          className="p-4 rounded-2xl bg-[#131722] border border-[#1E2433] hover:border-[#F59E0B]/40 hover:bg-[#171C2A] text-left transition-all group"
        >
          <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center mb-2.5 group-hover:scale-105 transition-transform">
            <CheckSquare className="w-5 h-5" />
          </div>
          <h4 className="text-xs font-bold text-[#F3F4F6]">Operations & Habits</h4>
          <p className="text-[11px] text-[#9CA3AF] mt-0.5">Focus checklist & Kanban board</p>
        </button>

        <button
          onClick={onOpenSettings}
          className="p-4 rounded-2xl bg-[#131722] border border-[#1E2433] hover:border-[#F59E0B]/40 hover:bg-[#171C2A] text-left transition-all group"
        >
          <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center mb-2.5 group-hover:scale-105 transition-transform">
            <Cloud className="w-5 h-5" />
          </div>
          <h4 className="text-xs font-bold text-[#F3F4F6]">Drive & Database</h4>
          <p className="text-[11px] text-[#9CA3AF] mt-0.5">Google Cloud OAuth & JSON sync</p>
        </button>
      </div>
    </div>
  );
};
