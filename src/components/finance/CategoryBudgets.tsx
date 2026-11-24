import React, { useState } from 'react';
import { useDashboard } from '../../context/DashboardContext';
import { Category } from '../../types/finance';
import { formatIDR } from '../../utils/currency';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { CategoryModal } from './CategoryModal';
import { AlertCircle, CheckCircle, Plus, Edit2, Trash2, Sparkles, TrendingUp } from 'lucide-react';

export const CategoryBudgets: React.FC = () => {
  const { database, deleteCategory } = useDashboard();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // Compute current month expenses per category
  const now = new Date();
  const currentMonthPrefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  const currentMonthExpenses = database.transactions.filter(
    (tx) => tx.type === 'expense' && tx.date.startsWith(currentMonthPrefix)
  );

  const getSpentForCategory = (catId: string) => {
    return currentMonthExpenses
      .filter((tx) => tx.categoryId === catId)
      .reduce((sum, tx) => sum + tx.amount, 0);
  };

  const budgetedCategories = database.categories.filter(
    (c) => c.type === 'expense' && c.monthlyBudget && c.monthlyBudget > 0
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-[#FFB800] shadow-[0_0_8px_#FFB800]" />
            <h3 className="text-base font-bold text-slate-100 tracking-tight">
              Monthly Budget Guardrails
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Spending threshold controls with automated 80% caution & 100% breach alerts
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setEditingCategory(null);
            setIsModalOpen(true);
          }}
          icon={<Plus className="w-3.5 h-3.5 text-[#FFB800]" />}
        >
          Add Category Budget
        </Button>
      </div>

      {budgetedCategories.length === 0 ? (
        <Card className="p-8 text-center border-dashed border-white/[0.08]">
          <h4 className="text-sm font-semibold text-slate-200">No Category Budgets Configured</h4>
          <p className="text-xs text-slate-400 max-w-md mx-auto mt-1 mb-4">
            Set monthly budget limits on your expense categories to monitor spending thresholds and receive alerts.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setEditingCategory(null);
              setIsModalOpen(true);
            }}
            icon={<Plus className="w-3.5 h-3.5 text-[#FFB800]" />}
          >
            Add Category Budget
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {budgetedCategories.map((cat) => {
            const spent = getSpentForCategory(cat.id);
            const budget = cat.monthlyBudget!;
            const percent = Math.min(Math.round((spent / budget) * 100), 100);
            const rawPercent = Math.round((spent / budget) * 100);
            const remaining = budget - spent;

            const isOverBudget = rawPercent >= 100;
            const isWarning = rawPercent >= 80 && rawPercent < 100;

            return (
              <Card
                key={cat.id}
                className="p-5 group hover:border-white/[0.18] transition-all relative overflow-hidden"
              >
                {/* Header with Jewel Indicator */}
                <div className="flex items-start justify-between mb-3.5">
                  <div className="flex items-center space-x-2.5">
                    <span
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0 ring-2 ring-white/10"
                      style={{
                        backgroundColor: cat.color,
                        boxShadow: `0 0 10px ${cat.color}90`,
                      }}
                    />
                    <h4 className="text-xs font-bold text-slate-100 tracking-tight truncate max-w-[170px]">
                      {cat.name}
                    </h4>
                  </div>

                  <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => {
                        setEditingCategory(cat);
                        setIsModalOpen(true);
                      }}
                      className="p-1 rounded-lg hover:bg-white/[0.08] text-slate-400 hover:text-slate-100 transition-colors"
                      title="Edit Category"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm(`Delete category ${cat.name}?`)) {
                          deleteCategory(cat.id);
                        }
                      }}
                      className="p-1 rounded-lg hover:bg-white/[0.08] text-[#FF3358] hover:text-red-300 transition-colors"
                      title="Delete Category"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Modern High-Tech Neon Progress Bar */}
                <div className="mt-2">
                  <div className="w-full h-2 rounded-full bg-black/40 border border-white/[0.06] overflow-hidden p-[1px]">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isOverBudget
                          ? 'bg-gradient-to-r from-[#FF3358] to-[#D91B40] shadow-[0_0_10px_#FF3358]'
                          : isWarning
                          ? 'bg-gradient-to-r from-[#FFB800] to-[#D97706] shadow-[0_0_10px_#FFB800]'
                          : 'bg-gradient-to-r from-[#00D68F] to-[#00A86B] shadow-[0_0_10px_#00D68F]'
                      }`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>

                {/* Amount Readouts */}
                <div className="mt-3.5 flex items-center justify-between text-xs font-mono">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-sans font-semibold">
                      Spent
                    </span>
                    <span className="font-bold text-slate-200">
                      {formatIDR(spent)}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-sans font-semibold">
                      Limit
                    </span>
                    <span className="font-semibold text-slate-400">
                      {formatIDR(budget)}
                    </span>
                  </div>
                </div>

                {/* Status Badge & Percentage Footer */}
                <div className="mt-3 pt-3 border-t border-white/[0.06] flex items-center justify-between text-[11px]">
                  <div className="flex items-center space-x-1.5">
                    {isOverBudget ? (
                      <span className="text-[#FF3358] font-bold flex items-center space-x-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>Breached by {formatIDR(Math.abs(remaining))}</span>
                      </span>
                    ) : isWarning ? (
                      <span className="text-[#FFB800] font-semibold flex items-center space-x-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>{100 - rawPercent}% remaining capacity</span>
                      </span>
                    ) : (
                      <span className="text-[#00D68F] font-semibold flex items-center space-x-1">
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Safe ({formatIDR(remaining)} left)</span>
                      </span>
                    )}
                  </div>
                  <span
                    className={`font-mono font-extrabold text-xs px-2 py-0.5 rounded-md ${
                      isOverBudget
                        ? 'bg-[#FF3358]/15 text-[#FF3358] border border-[#FF3358]/30'
                        : isWarning
                        ? 'bg-[#FFB800]/15 text-[#FFB800] border border-[#FFB800]/30'
                        : 'bg-[#00D68F]/15 text-[#00D68F] border border-[#00D68F]/30'
                    }`}
                  >
                    {rawPercent}%
                  </span>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <CategoryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        categoryToEdit={editingCategory}
      />
    </div>
  );
};
