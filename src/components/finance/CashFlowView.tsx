import React from 'react';
import { useDashboard } from '../../context/DashboardContext';
import { formatIDR, formatPercent } from '../../utils/currency';
import { AccountsOverview } from './AccountsOverview';
import { CategoryBudgets } from './CategoryBudgets';
import { FinancialCharts } from './FinancialCharts';
import { TransactionList } from './TransactionList';
import { Card } from '../common/Card';
import { ArrowUpRight, ArrowDownRight, Wallet, TrendingUp, PiggyBank } from 'lucide-react';

interface CashFlowViewProps {
  onOpenQuickAdd: () => void;
}

export const CashFlowView: React.FC<CashFlowViewProps> = ({ onOpenQuickAdd }) => {
  const { database } = useDashboard();

  // Current month calculation
  const now = new Date();
  const currentMonthPrefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  const currentMonthTransactions = database.transactions.filter((tx) =>
    tx.date.startsWith(currentMonthPrefix)
  );

  const mtdIncome = currentMonthTransactions
    .filter((tx) => tx.type === 'income')
    .reduce((sum, tx) => sum + tx.amount, 0);

  const mtdExpense = currentMonthTransactions
    .filter((tx) => tx.type === 'expense')
    .reduce((sum, tx) => sum + tx.amount, 0);

  const mtdNetSavings = mtdIncome - mtdExpense;
  const savingsRate = mtdIncome > 0 ? (mtdNetSavings / mtdIncome) * 100 : 0;
  const totalLiquidReserves = database.accounts.reduce((sum, acc) => sum + acc.balance, 0);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Liquid Cash */}
        <Card className="p-4 flex items-center space-x-3.5">
          <div className="w-11 h-11 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <Wallet className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-[#9CA3AF] block font-medium">Liquid Cash Reserves</span>
            <span className="text-base font-bold text-[#F3F4F6] font-mono">
              {formatIDR(totalLiquidReserves)}
            </span>
          </div>
        </Card>

        {/* MTD Income */}
        <Card className="p-4 flex items-center space-x-3.5">
          <div className="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <ArrowUpRight className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-[#9CA3AF] block font-medium">MTD Total Income</span>
            <span className="text-base font-bold text-emerald-400 font-mono">
              {formatIDR(mtdIncome)}
            </span>
          </div>
        </Card>

        {/* MTD Expenses */}
        <Card className="p-4 flex items-center space-x-3.5">
          <div className="w-11 h-11 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
            <ArrowDownRight className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-[#9CA3AF] block font-medium">MTD Total Expenses</span>
            <span className="text-base font-bold text-red-400 font-mono">
              {formatIDR(mtdExpense)}
            </span>
          </div>
        </Card>

        {/* Savings Rate */}
        <Card className="p-4 flex items-center space-x-3.5">
          <div className="w-11 h-11 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-[#F59E0B]">
            <PiggyBank className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-[#9CA3AF] block font-medium">Monthly Savings Rate</span>
            <div className="flex items-center space-x-2">
              <span className="text-base font-bold text-[#F59E0B] font-mono">
                {formatPercent(savingsRate)}
              </span>
              <span className="text-[11px] text-[#9CA3AF] font-mono">
                ({formatIDR(mtdNetSavings)})
              </span>
            </div>
          </div>
        </Card>
      </div>

      {/* Accounts & Wallets */}
      <AccountsOverview />

      {/* Financial Visualizations: Income vs Expense Bar Chart & Donut */}
      <FinancialCharts />

      {/* Category Budgets with Progress Bars */}
      <CategoryBudgets />

      {/* Full Transaction Ledger with Search & Filters */}
      <TransactionList onOpenQuickAdd={onOpenQuickAdd} />
    </div>
  );
};
