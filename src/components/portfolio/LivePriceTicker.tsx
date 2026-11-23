import React from 'react';
import { useDashboard } from '../../context/DashboardContext';
import { RefreshCw, TrendingUp, TrendingDown } from 'lucide-react';
import { formatIDR, formatUSD, formatPercent } from '../../utils/currency';

export const LivePriceTicker: React.FC = () => {
  const { database, isRefreshingPrices, refreshLivePrices } = useDashboard();

  return (
    <div className="p-3 rounded-2xl bg-[#131722] border border-[#1E2433] flex items-center justify-between overflow-hidden gap-4">
      {/* Scrollable / Flexible ticker elements */}
      <div className="flex items-center space-x-6 overflow-x-auto py-0.5 no-scrollbar flex-1">
        <div className="flex items-center space-x-1.5 flex-shrink-0 text-xs font-bold text-[#F59E0B]">
          <span className="w-2 h-2 rounded-full bg-[#F59E0B] animate-pulse" />
          <span>MARKET TICKER</span>
        </div>

        {database.assets.map((asset) => {
          const isUp = (asset.priceChange24h || 0) >= 0;
          return (
            <div
              key={asset.id}
              className="flex items-center space-x-2 flex-shrink-0 text-xs font-mono"
            >
              <span className="font-bold text-[#F3F4F6]">{asset.ticker}</span>
              <span className="text-[#9CA3AF]">
                {asset.currency === 'USD'
                  ? formatUSD(asset.currentPrice)
                  : formatIDR(asset.currentPrice)}
              </span>
              <span
                className={`text-[11px] font-semibold flex items-center ${
                  isUp ? 'text-emerald-400' : 'text-red-400'
                }`}
              >
                {isUp ? (
                  <TrendingUp className="w-3 h-3 mr-0.5" />
                ) : (
                  <TrendingDown className="w-3 h-3 mr-0.5" />
                )}
                {formatPercent(asset.priceChange24h || 0)}
              </span>
            </div>
          );
        })}
      </div>

      {/* Refresh Action */}
      <button
        onClick={refreshLivePrices}
        disabled={isRefreshingPrices}
        className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-[#171C2A] hover:bg-[#1E2433] text-xs font-medium text-[#F3F4F6] border border-[#1E2433] flex-shrink-0 transition-colors disabled:opacity-50"
      >
        <RefreshCw
          className={`w-3.5 h-3.5 text-[#F59E0B] ${isRefreshingPrices ? 'animate-spin' : ''}`}
        />
        <span className="hidden sm:inline">Refresh Prices</span>
      </button>
    </div>
  );
};
