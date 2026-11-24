import React from 'react';
import {
  LayoutDashboard,
  WalletCards,
  TrendingUp,
  Sparkles,
  CheckSquare,
  Settings,
  Cloud,
  RefreshCw,
  AlertTriangle,
  X,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';
import { useDashboard } from '../../context/DashboardContext';
import { formatIDR } from '../../utils/currency';

export type ActiveTab = 'overview' | 'cashflow' | 'portfolio' | 'intelligence' | 'tasks';

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  openSettings: () => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  openSettings,
  isMobileOpen,
  setIsMobileOpen,
}) => {
  const { database, syncState, lastSyncedAt, syncNowToDrive } = useDashboard();

  const navItems = [
    {
      id: 'overview' as ActiveTab,
      label: 'Executive Overview',
      subtitle: 'Command Center & Health',
      icon: LayoutDashboard,
    },
    {
      id: 'cashflow' as ActiveTab,
      label: 'Cash Flow & Budgets',
      subtitle: 'Income, Expenses & Accounts',
      icon: WalletCards,
    },
    {
      id: 'portfolio' as ActiveTab,
      label: 'Portfolio & Assets',
      subtitle: 'Gold, Stocks, Crypto & Real Estate',
      icon: TrendingUp,
    },
    {
      id: 'intelligence' as ActiveTab,
      label: 'Financial Intelligence',
      subtitle: 'Wealth Projections & FIRE Runway',
      icon: Sparkles,
      badge: 'NEW',
    },
    {
      id: 'tasks' as ActiveTab,
      label: 'Daily Tasks & Operations',
      subtitle: 'Checklists, Habits & Kanban',
      icon: CheckSquare,
    },
  ];

  const handleSelectTab = (tab: ActiveTab) => {
    setActiveTab(tab);
    setIsMobileOpen(false);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-[#0B0E14]/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-72 bg-[#0E121B] border-r border-[#1E2433] flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand / Logo Header */}
        <div className="p-6 border-b border-[#1E2433] flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#F59E0B] via-[#D97706] to-[#78350F] p-0.5 flex items-center justify-center shadow-lg shadow-[#F59E0B]/20">
              <div className="w-full h-full bg-[#131722] rounded-[10px] flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-[#F59E0B]" />
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-extrabold text-base tracking-wider text-[#F3F4F6]">
                  EXECUTIVE
                </span>
                <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-[#F59E0B]/20 text-[#F59E0B] border border-[#F59E0B]/40">
                  OS
                </span>
              </div>
              <p className="text-[11px] text-[#9CA3AF] tracking-tight">Finance & Operations</p>
            </div>
          </div>

          {/* Mobile close button */}
          <button
            onClick={() => setIsMobileOpen(false)}
            className="lg:hidden p-1.5 rounded-lg text-[#9CA3AF] hover:text-[#F3F4F6] hover:bg-[#1E2433]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Card */}
        <div className="px-6 py-4 mx-4 my-3 rounded-xl bg-[#131722] border border-[#1E2433]/80 flex items-center space-x-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#10B981] to-[#3B82F6] flex items-center justify-center text-white font-bold text-xs ring-2 ring-[#1E2433]">
            {database.settings.userName
              .split(' ')
              .map((n) => n[0])
              .join('')
              .substring(0, 2)
              .toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-xs font-semibold text-[#F3F4F6] truncate">
              {database.settings.userName}
            </h4>
            <p className="text-[10px] text-[#9CA3AF] truncate">{database.settings.userRole}</p>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-4 py-2 space-y-1.5 overflow-y-auto">
          <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-[#64748B]">
            Primary Modules
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleSelectTab(item.id)}
                className={`w-full flex items-center space-x-3 px-3.5 py-3 rounded-xl text-left transition-all duration-150 group relative ${
                  isActive
                    ? 'bg-[#1E2433] text-[#F3F4F6] border border-[#F59E0B]/30 shadow-md shadow-[#000000]/40'
                    : 'text-[#9CA3AF] hover:text-[#F3F4F6] hover:bg-[#131722]'
                }`}
              >
                {isActive && (
                  <div className="absolute left-0 top-2 bottom-2 w-1 bg-[#F59E0B] rounded-r-full" />
                )}
                <div
                  className={`p-2 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-[#F59E0B]/20 text-[#F59E0B]'
                      : 'bg-[#171C2A] text-[#9CA3AF] group-hover:text-[#F3F4F6]'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-1.5">
                    <span className="text-sm font-semibold truncate leading-tight">{item.label}</span>
                    {item.badge && (
                      <span className="px-1.5 py-0.5 text-[9px] font-extrabold rounded-full bg-gradient-to-r from-violet-500/30 to-fuchsia-500/30 text-violet-300 border border-violet-500/40 tracking-wider shadow-sm shadow-violet-500/20">
                        {item.badge}
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-[#64748B] group-hover:text-[#9CA3AF] truncate mt-0.5">
                    {item.subtitle}
                  </div>
                </div>
              </button>
            );
          })}
        </nav>

        {/* Footer: Google Drive Status & FX Pill */}
        <div className="p-4 border-t border-[#1E2433] space-y-3 bg-[#0B0E14]/50">
          {/* Live USD/IDR rate badge */}
          <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-[#131722] border border-[#1E2433] text-xs">
            <span className="text-[#9CA3AF] font-medium">USD / IDR</span>
            <span className="text-[#F59E0B] font-mono font-semibold">
              Rp {database.settings.usdToIdrRate.toLocaleString('id-ID')}
            </span>
          </div>

          {/* Cloud Sync Status Pill (Laptop & HP) */}
          <div className="p-3 rounded-xl bg-[#131722] border border-[#1E2433]">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-medium text-[#9CA3AF]">Cloud Database</span>
              {syncState === 'synced' && (
                <span className="inline-flex items-center space-x-1 text-[10px] text-emerald-400 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Cloud Synced</span>
                </span>
              )}
              {syncState === 'syncing' && (
                <span className="inline-flex items-center space-x-1 text-[10px] text-amber-400 font-medium">
                  <RefreshCw className="w-2.5 h-2.5 animate-spin" />
                  <span>Syncing...</span>
                </span>
              )}
              {syncState === 'error' && (
                <span className="inline-flex items-center space-x-1 text-[10px] text-red-400 font-medium">
                  <AlertTriangle className="w-2.5 h-2.5" />
                  <span>Sync Error</span>
                </span>
              )}
              {(syncState === 'local_only' || syncState === 'disconnected') && (
                <span className="inline-flex items-center space-x-1 text-[10px] text-emerald-400 font-medium">
                  <Cloud className="w-2.5 h-2.5" />
                  <span>Cloud Ready</span>
                </span>
              )}
            </div>

            <div className="flex items-center justify-between text-[11px] text-[#64748B]">
              <span className="truncate max-w-[130px]">
                Multi-Device (Laptop & HP)
              </span>
              <button
                onClick={syncNowToDrive}
                className="text-amber-400 hover:text-amber-300 font-medium"
              >
                Sync
              </button>
            </div>
          </div>

          {/* Settings Trigger */}
          <button
            onClick={openSettings}
            className="w-full flex items-center justify-center space-x-2 px-3 py-2 rounded-xl bg-[#1E2433]/70 hover:bg-[#1E2433] text-xs font-medium text-[#F3F4F6] border border-[#1E2433] transition-colors"
          >
            <Settings className="w-4 h-4 text-[#9CA3AF]" />
            <span>Settings & Google Cloud</span>
          </button>
        </div>
      </aside>
    </>
  );
};
