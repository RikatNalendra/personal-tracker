import React from 'react';
import {
  Menu,
  RefreshCw,
  Plus,
  Cloud,
  AlertTriangle,
  Settings,
  DollarSign,
  TrendingUp,
  Lock,
} from 'lucide-react';
import { ActiveTab } from './Sidebar';
import { useDashboard } from '../../context/DashboardContext';
import { formatExecutiveGreeting } from '../../utils/dateUtils';
import { Button } from '../common/Button';

interface HeaderProps {
  activeTab: ActiveTab;
  onOpenMobileMenu: () => void;
  onOpenQuickAdd: () => void;
  onOpenSettings: () => void;
  onLock?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onOpenMobileMenu,
  onOpenQuickAdd,
  onOpenSettings,
  onLock,
}) => {
  const {
    database,
    syncState,
    isRefreshingPrices,
    refreshLivePrices,
    syncNowToDrive,
  } = useDashboard();

  const { greeting, subtitle } = formatExecutiveGreeting();

  const getTabTitle = () => {
    switch (activeTab) {
      case 'overview':
        return { title: 'Executive Overview', badge: 'Command Center' };
      case 'cashflow':
        return { title: 'Cash Flow & Budgets', badge: 'Income, Expense & Wallets' };
      case 'portfolio':
        return { title: 'Portfolio & Assets', badge: 'Live Valuation' };
      case 'intelligence':
        return { title: 'Financial Intelligence', badge: 'Wealth Projections & FIRE' };
      case 'tasks':
        return { title: 'Daily Tasks & Operations', badge: 'Checklists & Kanban' };
    }
  };

  const { title, badge } = getTabTitle();

  return (
    <header className="sticky top-0 z-30 bg-[#0B0E14]/85 backdrop-blur-md border-b border-[#1E2433] px-4 sm:px-8 py-3.5 flex items-center justify-between">
      {/* Left: Mobile Toggle & Title */}
      <div className="flex items-center space-x-3 sm:space-x-4">
        <button
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 rounded-xl bg-[#131722] border border-[#1E2433] text-[#F3F4F6] hover:bg-[#1E2433]"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-lg sm:text-xl font-bold text-[#F3F4F6] tracking-tight">
              {title}
            </h1>
            <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-semibold rounded-full bg-[#1E2433] text-[#9CA3AF] border border-[#2A3246]">
              {badge}
            </span>
          </div>
          <p className="text-xs text-[#9CA3AF] hidden md:block">{subtitle}</p>
        </div>
      </div>

      {/* Right: Actions & Indicators */}
      <div className="flex items-center space-x-2 sm:space-x-3">
        {/* Live USD/IDR Rate Pill */}
        <div className="hidden xl:flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-[#131722] border border-[#1E2433] text-xs">
          <span className="text-[#9CA3AF]">USD / IDR</span>
          <span className="text-[#F59E0B] font-mono font-bold">
            Rp {database.settings.usdToIdrRate.toLocaleString('id-ID')}
          </span>
        </div>

        {/* Cloud Sync Status Pill (Laptop & Mobile) */}
        <div
          onClick={syncNowToDrive}
          className="flex items-center space-x-2 px-2.5 sm:px-3 py-1.5 rounded-xl bg-[#131722] border border-[#1E2433] hover:border-emerald-500/30 cursor-pointer transition-colors text-xs select-none"
          title="Click to sync instantly across your Laptop and Phone"
        >
          {syncState === 'synced' && (
            <>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-medium text-emerald-400 hidden sm:inline">Cloud Synced</span>
            </>
          )}
          {syncState === 'syncing' && (
            <>
              <RefreshCw className="w-3.5 h-3.5 text-amber-400 animate-spin" />
              <span className="text-xs font-medium text-amber-400 hidden sm:inline">Syncing...</span>
            </>
          )}
          {syncState === 'error' && (
            <>
              <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
              <span className="text-xs font-medium text-red-400 hidden sm:inline">Sync Error</span>
            </>
          )}
          {(syncState === 'local_only' || syncState === 'disconnected') && (
            <>
              <Cloud className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-xs font-medium text-emerald-400 hidden sm:inline">Cloud Ready</span>
            </>
          )}
        </div>

        {/* Refresh Live Prices Button */}
        <button
          onClick={refreshLivePrices}
          disabled={isRefreshingPrices}
          className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-[#131722] border border-[#1E2433] hover:bg-[#1E2433] text-xs font-medium text-[#F3F4F6] flex items-center space-x-1.5 transition-colors disabled:opacity-50"
          title="Refresh market prices and currency exchange rates"
        >
          <RefreshCw
            className={`w-4 h-4 text-[#F59E0B] ${isRefreshingPrices ? 'animate-spin' : ''}`}
          />
          <span className="hidden md:inline">Refresh Prices</span>
        </button>

        {/* Quick Add Button */}
        <Button
          variant="primary"
          size="sm"
          onClick={onOpenQuickAdd}
          icon={<Plus className="w-4 h-4" />}
          className="shadow-sm"
        >
          <span>Quick Entry</span>
        </Button>

        {/* Quick Lock Button */}
        {onLock && (
          <button
            onClick={onLock}
            className="p-2 rounded-xl bg-[#131722] border border-[#1E2433] text-[#9CA3AF] hover:text-[#F59E0B] hover:bg-[#1E2433] hover:border-[#F59E0B]/30 transition-colors"
            title="Lock Dashboard (Restricted Single-User Terminal)"
          >
            <Lock className="w-4 h-4" />
          </button>
        )}

        {/* Settings button */}
        <button
          onClick={onOpenSettings}
          className="p-2 rounded-xl bg-[#131722] border border-[#1E2433] text-[#9CA3AF] hover:text-[#F3F4F6] hover:bg-[#1E2433] transition-colors"
          title="Settings & Google Drive Configuration"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
