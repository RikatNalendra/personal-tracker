import React from 'react';
import { PerformanceSummary } from './PerformanceSummary';
import { PortfolioAllocationChart } from './PortfolioAllocationChart';
import { AssetList } from './AssetList';
import { LivePriceTicker } from './LivePriceTicker';
import { Card } from '../common/Card';
import { useDashboard } from '../../context/DashboardContext';
import { Shield, Target } from 'lucide-react';
import { formatIDR, getAssetCurrentValueIDR } from '../../utils/currency';

export const PortfolioView: React.FC = () => {
  const { database } = useDashboard();
  const usdRate = database.settings.usdToIdrRate;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Live Market Price Ribbon */}
      <LivePriceTicker />

      {/* Top Portfolio Valuation & Return Cards */}
      <PerformanceSummary />

      {/* Allocation & Strategy Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <PortfolioAllocationChart />
        </div>

        {/* Investment Strategy & Class Breakdown Summary */}
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card className="p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center space-x-2 text-[#F59E0B] text-xs font-bold uppercase tracking-wider mb-2">
                <Target className="w-4 h-4" />
                <span>Executive Asset Allocation Strategy</span>
              </div>
              <h4 className="text-base font-bold text-[#F3F4F6]">All-Weather Wealth Preservation</h4>
              <p className="text-xs text-[#9CA3AF] mt-2 leading-relaxed">
                Balanced diversification across hard monetary stores (Antam physical gold bullion), blue-chip Indonesian financial institutions (BBCA, BBRI), global compute leaders (Nvidia, S&P 500 ETF), and asymmetric digital assets (BTC, ETH).
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-[#1E2433] flex items-center justify-between text-xs text-[#9CA3AF]">
              <span>Holdings Monitored</span>
              <span className="font-mono font-bold text-[#F3F4F6]">{database.assets.length} Active Positions</span>
            </div>
          </Card>

          <Card className="p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center space-x-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-2">
                <Shield className="w-4 h-4" />
                <span>Currency Hedging & Liquidity</span>
              </div>
              <h4 className="text-base font-bold text-[#F3F4F6]">Dual IDR & USD Exposure</h4>
              <p className="text-xs text-[#9CA3AF] mt-2 leading-relaxed">
                Global equities and crypto positions are tagged and quoted in US Dollars ($) with automatic real-time conversion into Indonesian Rupiah (Rp) at the active executive exchange rate.
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-[#1E2433] flex items-center justify-between text-xs text-[#9CA3AF]">
              <span>Active FX Benchmark</span>
              <span className="font-mono font-bold text-[#F59E0B]">
                1 USD = Rp {usdRate.toLocaleString('id-ID')}
              </span>
            </div>
          </Card>
        </div>
      </div>

      {/* Full-Width Holdings Table */}
      <AssetList />
    </div>
  );
};
