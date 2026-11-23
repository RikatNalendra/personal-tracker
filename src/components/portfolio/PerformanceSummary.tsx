import React from 'react';
import { useDashboard } from '../../context/DashboardContext';
import { Card } from '../common/Card';
import {
  formatIDR,
  formatPercent,
  getAssetCostBasisIDR,
  getAssetCurrentValueIDR,
  getAssetUnrealizedGainIDR,
} from '../../utils/currency';
import { TrendingUp, Coins, Award, Shield, ArrowUpRight, ArrowDownRight } from 'lucide-react';

export const PerformanceSummary: React.FC = () => {
  const { database } = useDashboard();
  const usdRate = database.settings.usdToIdrRate;

  let totalPortfolioValue = 0;
  let totalCostBasis = 0;
  let totalGoldGrams = 0;
  let topMover: { name: string; ticker: string; gainPercent: number; gainIDR: number } | null = null;

  for (const asset of database.assets) {
    const val = getAssetCurrentValueIDR(asset, usdRate);
    const cost = getAssetCostBasisIDR(asset, usdRate);
    const { gainIDR, gainPercent } = getAssetUnrealizedGainIDR(asset, usdRate);

    totalPortfolioValue += val;
    totalCostBasis += cost;

    if (asset.assetClass === 'gold') {
      totalGoldGrams += asset.quantity;
    }

    if (!topMover || gainPercent > topMover.gainPercent) {
      topMover = {
        name: asset.name,
        ticker: asset.ticker,
        gainPercent,
        gainIDR,
      };
    }
  }

  const totalGainIDR = totalPortfolioValue - totalCostBasis;
  const totalGainPercent = totalCostBasis > 0 ? (totalGainIDR / totalCostBasis) * 100 : 0;
  const isOverallPositive = totalGainIDR >= 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Total Portfolio Value */}
      <Card className="p-4 flex items-center space-x-3.5">
        <div className="w-11 h-11 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-[#F59E0B]">
          <TrendingUp className="w-5 h-5" />
        </div>
        <div>
          <span className="text-xs text-[#9CA3AF] block font-medium">Portfolio Valuation</span>
          <span className="text-base font-bold text-[#F3F4F6] font-mono">
            {formatIDR(totalPortfolioValue)}
          </span>
        </div>
      </Card>

      {/* 2. Total Unrealized Return */}
      <Card className="p-4 flex items-center space-x-3.5">
        <div
          className={`w-11 h-11 rounded-xl flex items-center justify-center ${
            isOverallPositive
              ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
              : 'bg-red-500/10 border border-red-500/20 text-red-400'
          }`}
        >
          {isOverallPositive ? (
            <ArrowUpRight className="w-5 h-5" />
          ) : (
            <ArrowDownRight className="w-5 h-5" />
          )}
        </div>
        <div>
          <span className="text-xs text-[#9CA3AF] block font-medium">Total Unrealized P&L</span>
          <div className="flex items-center space-x-1.5">
            <span
              className={`text-base font-bold font-mono ${
                isOverallPositive ? 'text-emerald-400' : 'text-red-400'
              }`}
            >
              {formatPercent(totalGainPercent)}
            </span>
            <span className="text-xs font-mono text-[#9CA3AF]">
              ({formatIDR(totalGainIDR)})
            </span>
          </div>
        </div>
      </Card>

      {/* 3. Gold Bullion Reserves */}
      <Card className="p-4 flex items-center space-x-3.5">
        <div className="w-11 h-11 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-[#F59E0B]">
          <Coins className="w-5 h-5" />
        </div>
        <div>
          <span className="text-xs text-[#9CA3AF] block font-medium">Physical Gold Bullion</span>
          <div className="flex items-center space-x-1.5">
            <span className="text-base font-bold text-[#F59E0B] font-mono">
              {totalGoldGrams} Grams
            </span>
            <span className="text-xs text-[#9CA3AF]">Antam 999.9</span>
          </div>
        </div>
      </Card>

      {/* 4. Top Performer */}
      <Card className="p-4 flex items-center space-x-3.5">
        <div className="w-11 h-11 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
          <Award className="w-5 h-5" />
        </div>
        <div>
          <span className="text-xs text-[#9CA3AF] block font-medium">Top Performer</span>
          {topMover ? (
            <div className="flex items-center space-x-1.5">
              <span className="text-sm font-bold text-[#F3F4F6] font-mono">{topMover.ticker}</span>
              <span className="text-xs font-bold text-emerald-400 font-mono">
                {formatPercent(topMover.gainPercent)}
              </span>
            </div>
          ) : (
            <span className="text-xs text-[#9CA3AF]">No assets</span>
          )}
        </div>
      </Card>
    </div>
  );
};
