import React from 'react';
import { useDashboard } from '../../context/DashboardContext';
import { Card } from '../common/Card';
import {
  formatIDR,
  formatPercent,
  getAssetCurrentValueIDR,
  getAssetUnrealizedGainIDR,
} from '../../utils/currency';
import { TrendingUp, TrendingDown, ArrowUpRight, Award } from 'lucide-react';
import { getAssetClassColor } from '../../utils/colors';

interface TopMoversWidgetProps {
  onNavigatePortfolio: () => void;
}

export const TopMoversWidget: React.FC<TopMoversWidgetProps> = ({ onNavigatePortfolio }) => {
  const { database } = useDashboard();
  const usdRate = database.settings.usdToIdrRate;

  // Rank assets by unrealized gain %
  const sortedAssets = [...database.assets].sort((a, b) => {
    const gainA = getAssetUnrealizedGainIDR(a, usdRate).gainPercent;
    const gainB = getAssetUnrealizedGainIDR(b, usdRate).gainPercent;
    return gainB - gainA;
  });

  const topMovers = sortedAssets.slice(0, 4);

  return (
    <Card className="p-5 flex flex-col justify-between">
      <div className="flex items-center justify-between pb-3 border-b border-[#1E2433]">
        <div>
          <h3 className="text-sm font-bold text-[#F3F4F6] flex items-center space-x-1.5">
            <Award className="w-4 h-4 text-[#F59E0B]" />
            <span>Portfolio Top Movers</span>
          </h3>
          <p className="text-xs text-[#9CA3AF]">Highest yield holdings & live daily swings</p>
        </div>
        <button
          onClick={onNavigatePortfolio}
          className="text-xs text-[#F59E0B] hover:underline font-medium"
        >
          View All
        </button>
      </div>

      {topMovers.length === 0 ? (
        <div className="py-8 text-center text-xs text-[#9CA3AF]">
          No investment assets in portfolio yet.
        </div>
      ) : (
        <div className="divide-y divide-[#1E2433]/60 my-2">
          {topMovers.map((asset) => {
            const val = getAssetCurrentValueIDR(asset, usdRate);
            const { gainPercent, gainIDR } = getAssetUnrealizedGainIDR(asset, usdRate);
            const isProfitable = gainIDR >= 0;

            return (
              <div key={asset.id} className="py-2.5 flex items-center justify-between">
                <div className="flex items-center space-x-2.5 min-w-0">
                  <span
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: getAssetClassColor(asset.assetClass) }}
                  />
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-[#F3F4F6] truncate flex items-center space-x-1">
                      <span>{asset.name}</span>
                      <span className="font-mono text-[10px] text-[#9CA3AF]">({asset.ticker})</span>
                    </div>
                    <span className="text-[10px] text-[#64748B] font-mono">
                      {formatIDR(val)}
                    </span>
                  </div>
                </div>

                <div className="text-right font-mono flex-shrink-0">
                  <div
                    className={`text-xs font-bold flex items-center justify-end ${
                      isProfitable ? 'text-emerald-400' : 'text-red-400'
                    }`}
                  >
                    {isProfitable ? (
                      <TrendingUp className="w-3 h-3 mr-0.5" />
                    ) : (
                      <TrendingDown className="w-3 h-3 mr-0.5" />
                    )}
                    {formatPercent(gainPercent)}
                  </div>
                  <div className="text-[10px] text-[#9CA3AF]">
                    {isProfitable ? '+' : ''}
                    {formatIDR(gainIDR)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
};
