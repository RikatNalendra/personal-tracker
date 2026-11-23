import React from 'react';
import { useDashboard } from '../../context/DashboardContext';
import { Card } from '../common/Card';
import { formatIDR, formatCompactIDR, formatPercent } from '../../utils/currency';
import { ArrowUpRight, ArrowDownRight, Wallet, CheckCircle2, AlertCircle } from 'lucide-react';

interface CashFlowSnapshotProps {
  onNavigateCashFlow: () => void;
}

export const CashFlowSnapshot: React.FC<CashFlowSnapshotProps> = ({ onNavigateCashFlow }) => {
  const { database } = useDashboard();

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

  const totalMonthlyBudget = database.categories
    .filter((c) => c.type === 'expense' && c.monthlyBudget)
    .reduce((sum, c) => sum + (c.monthlyBudget || 0), 0);

  const budgetRemaining = totalMonthlyBudget - mtdExpense;
  const budgetPercent =
    totalMonthlyBudget > 0 ? Math.min(Math.round((mtdExpense / totalMonthlyBudget) * 100), 100) : 0;
  const rawBudgetPercent =
    totalMonthlyBudget > 0 ? Math.round((mtdExpense / totalMonthlyBudget) * 100) : 0;

  return (
    <Card className="p-5 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between pb-3 border-b border-[#1E2433]">
          <div>
            <h3 className="text-sm font-bold text-[#F3F4F6]">Monthly Cash Flow Snapshot</h3>
            <p className="text-xs text-[#9CA3AF]">Revenue vs Expense and overall budget ceiling</p>
          </div>
          <button
            onClick={onNavigateCashFlow}
            className="text-xs text-[#F59E0B] hover:underline font-medium"
          >
            View Details
          </button>
        </div>

        {/* Income & Expense Two-column summary */}
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="p-3 rounded-xl bg-[#171C2A] border border-[#1E2433]">
            <div className="flex items-center space-x-1.5 text-xs text-emerald-400 font-semibold mb-1">
              <ArrowUpRight className="w-4 h-4" />
              <span>Total Income</span>
            </div>
            <div className="text-base font-bold text-[#F3F4F6] font-mono">
              {formatIDR(mtdIncome)}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[#171C2A] border border-[#1E2433]">
            <div className="flex items-center space-x-1.5 text-xs text-red-400 font-semibold mb-1">
              <ArrowDownRight className="w-4 h-4" />
              <span>Total Expenses</span>
            </div>
            <div className="text-base font-bold text-[#F3F4F6] font-mono">
              {formatIDR(mtdExpense)}
            </div>
          </div>
        </div>

        {/* Overall Budget Progress */}
        <div className="mt-5 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[#9CA3AF]">Monthly Budget Ceiling</span>
            <span className="font-mono text-[#F3F4F6]">
              {formatIDR(mtdExpense)} / {formatIDR(totalMonthlyBudget)}
            </span>
          </div>

          <div className="w-full h-2 rounded-full bg-[#1E2433] overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                rawBudgetPercent >= 100
                  ? 'bg-red-500'
                  : rawBudgetPercent >= 80
                  ? 'bg-amber-500'
                  : 'bg-emerald-500'
              }`}
              style={{ width: `${budgetPercent}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] pt-1">
            <span className="text-[#64748B]">
              {budgetRemaining >= 0 ? (
                <span className="text-emerald-400 font-medium">
                  {formatIDR(budgetRemaining)} remaining
                </span>
              ) : (
                <span className="text-red-400 font-medium">
                  Over limit by {formatIDR(Math.abs(budgetRemaining))}
                </span>
              )}
            </span>
            <span className="font-mono font-bold text-[#F3F4F6]">{rawBudgetPercent}% spent</span>
          </div>
        </div>
      </div>
    </Card>
  );
};
