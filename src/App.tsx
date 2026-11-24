import React, { useState } from 'react';
import { Sidebar, ActiveTab } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { QuickAddModal } from './components/layout/QuickAddModal';
import { SettingsModal } from './components/settings/SettingsModal';
import { ExecutiveOverview } from './components/overview/ExecutiveOverview';
import { CashFlowView } from './components/finance/CashFlowView';
import { PortfolioView } from './components/portfolio/PortfolioView';
import { IntelligenceView } from './components/intelligence/IntelligenceView';
import { TaskManagerView } from './components/tasks/TaskManagerView';
import { useDashboard } from './context/DashboardContext';

export const AppContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
  const [isMobileOpen, setIsMobileOpen] = useState<boolean>(false);
  const [isQuickAddOpen, setIsQuickAddOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);

  return (
    <div className="min-h-screen bg-[#0B0E14] text-[#F3F4F6] flex">
      {/* Sleek Executive Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        openSettings={() => setIsSettingsOpen(true)}
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
      />

      {/* Main Content Area */}
      <div className="flex-1 lg:ml-72 flex flex-col min-w-0 min-h-screen">
        {/* Sticky Executive Header */}
        <Header
          activeTab={activeTab}
          onOpenMobileMenu={() => setIsMobileOpen(true)}
          onOpenQuickAdd={() => setIsQuickAddOpen(true)}
          onOpenSettings={() => setIsSettingsOpen(true)}
        />

        {/* View Router */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {activeTab === 'overview' && (
            <ExecutiveOverview
              setActiveTab={setActiveTab}
              onOpenQuickAdd={() => setIsQuickAddOpen(true)}
              onOpenSettings={() => setIsSettingsOpen(true)}
            />
          )}

          {activeTab === 'cashflow' && (
            <CashFlowView onOpenQuickAdd={() => setIsQuickAddOpen(true)} />
          )}

          {activeTab === 'portfolio' && <PortfolioView />}

          {activeTab === 'intelligence' && <IntelligenceView />}

          {activeTab === 'tasks' && <TaskManagerView />}
        </main>
      </div>

      {/* Global Modals */}
      <QuickAddModal
        isOpen={isQuickAddOpen}
        onClose={() => setIsQuickAddOpen(false)}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
};

export default AppContent;
