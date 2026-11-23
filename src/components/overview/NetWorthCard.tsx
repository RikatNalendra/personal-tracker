import React from 'react';
import { useDashboard } from '../../context/DashboardContext';
import { Card } from '../common/Card';
import {
  formatIDR,
  formatPercent,
  getAssetCurrentValueIDR,
} from '../../utils/currency';
import { TrendingUp, ShieldCheck, ArrowUpRight, Wallet, PieChart } from 'lucide-react';

export const NetWorthCard: React.FC = () => {
  const { database } = useDashboard();
  const usdRate = database.settings.usdToIdrRate;

  // Total liquid cash
  const totalLiquidCash = database.accounts.reduce((sum, acc) => sum + acc.balance, 0);

  // Total portfolio value
  const totalPortfolioValue = database.assets.reduce((sum, asset) => {
    return sum + getAssetCurrentValueIDR(asset, usdRate);
  }, 0);

  // Total Executive Net Worth
  const totalNetWorth = totalLiquidCash + totalPortfolioValue;

  // Monthly savings calculation
  const now = new Date();
  const currentMonthPrefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const mtdIncome = database.transactions
    .filter((tx) => tx.type === 'income' && tx.date.startsWith(currentMonthPrefix))
    .reduce((sum, tx) => sum + tx.amount, 0);
  const mtdExpense = database.transactions
    .filter((tx) => tx.type === 'expense' && tx.date.startsWith(currentMonthPrefix))
    .reduce((sum, tx) => sum + tx.amount, 0);
  const mtdSavings = mtdIncome - mtdExpense;
  const savingsRate = mtdIncome > 0 ? (mtdSavings / mtdIncome) * 100 : 0;

  return (
    <Card className="relative overflow-hidden p-6 border-[#F59E0B]/30 bg-gradient-to-br from-[#131722] via-[#161C2B] to-[#131722] shadow-gold-glow flex flex-col justify-between">
      {/* Background subtle emblem */}
      <div className="absolute right-0 top-0 translate-x-6 -translate-y-6 w-44 h-44 rounded-full bg-[#F59E0B]/5 pointer-events-none blur-2xl" />

      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-[#F59E0B] animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider text-[#9CA3AF]">
              Executive Command Center
            </span>
          </div>
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#F59E0B]/10 text-[#F59E0B] border border-[#F59E0B]/30">
            Audit Grade
          </span>
        </div>

        <h3 className="text-xs font-medium text-[#9CA3AF]">Total Net Worth Valuation</h3>
        <div className="text-2xl sm:text-3xl font-extrabold text-[#F3F4F6] font-mono tracking-tight mt-1">
          {formatIDR(totalNetWorth)}
        </div>
      </div>

      {/* Breakdown Breakdown */}
      <div className="mt-6 pt-4 border-t border-[#1E2433] grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <Wallet className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] text-[#9CA3AF] block">Liquid Cash</span>
            <span className="text-xs font-bold text-[#F3F4F6] font-mono">
              {formatIDR(totalLiquidCash)}
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
            <PieChart className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] text-[#9CA3AF] block">Portfolio Assets</span>
            <span className="text-xs font-bold text-[#F3F4F6] font-mono">
              {formatIDR(totalPortfolioValue)}
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <ArrowUpRight className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] text-[#9CA3AF] block">Savings Rate (MTD)</span>
            <span className="text-xs font-bold text-emerald-400 font-mono">
              {formatPercent(savingsRate)}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
};
