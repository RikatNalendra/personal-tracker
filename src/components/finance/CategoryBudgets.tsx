import React, { useState } from 'react';
import { useDashboard } from '../../context/DashboardContext';
import { Category } from '../../types/finance';
import { formatIDR } from '../../utils/currency';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { CategoryModal } from './CategoryModal';
import { AlertCircle, CheckCircle, Plus, Edit2, Trash2 } from 'lucide-react';

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
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-[#F3F4F6]">Monthly Category Budgets</h3>
          <p className="text-xs text-[#9CA3AF]">
            Track monthly spending limits with 80% and 100% threshold alerts
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setEditingCategory(null);
            setIsModalOpen(true);
          }}
          icon={<Plus className="w-3.5 h-3.5 text-[#F59E0B]" />}
        >
          Add Category
        </Button>
      </div>

      {budgetedCategories.length === 0 ? (
        <Card className="p-8 text-center border-dashed border-[#1E2433]">
          <h4 className="text-sm font-semibold text-[#F3F4F6]">No Category Budgets Configured</h4>
          <p className="text-xs text-[#9CA3AF] max-w-md mx-auto mt-1 mb-4">
            Set monthly budget limits on your expense categories to monitor spending thresholds and receive alerts.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setEditingCategory(null);
              setIsModalOpen(true);
            }}
            icon={<Plus className="w-3.5 h-3.5 text-[#F59E0B]" />}
          >
            Add Category Budget
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {budgetedCategories.map((cat) => {
            const spent = getSpentForCategory(cat.id);
            const budget = cat.monthlyBudget!;
            const percent = Math.min(Math.round((spent / budget) * 100), 100);
            const rawPercent = Math.round((spent / budget) * 100);
            const remaining = budget - spent;

            const isOverBudget = rawPercent >= 100;
            const isWarning = rawPercent >= 80 && rawPercent < 100;

            return (
              <Card key={cat.id} className="p-4 group hover:border-[#2A3246] transition-all">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-2.5">
                    <span
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: cat.color }}
                    />
                    <h4 className="text-xs font-semibold text-[#F3F4F6] truncate">{cat.name}</h4>
                  </div>

                  <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => {
                        setEditingCategory(cat);
                        setIsModalOpen(true);
                      }}
                      className="p-1 rounded hover:bg-[#1E2433] text-[#9CA3AF] hover:text-[#F3F4F6]"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm(`Delete category ${cat.name}?`)) {
                          deleteCategory(cat.id);
                        }
                      }}
                      className="p-1 rounded hover:bg-[#1E2433] text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-3">
                  <div className="w-full h-2 rounded-full bg-[#1E2433] overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isOverBudget
                          ? 'bg-[#EF4444]'
                          : isWarning
                          ? 'bg-[#F59E0B]'
                          : 'bg-[#10B981]'
                      }`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>

                {/* Stats & Threshold label */}
                <div className="mt-3 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[#9CA3AF]">Spent: </span>
                    <span className="font-semibold text-[#F3F4F6] font-mono">
                      {formatIDR(spent)}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[#64748B]">Limit: </span>
                    <span className="font-medium text-[#9CA3AF] font-mono">
                      {formatIDR(budget)}
                    </span>
                  </div>
                </div>

                <div className="mt-2 pt-2 border-t border-[#1E2433]/60 flex items-center justify-between text-[11px]">
                  <div className="flex items-center space-x-1">
                    {isOverBudget ? (
                      <span className="text-red-400 font-semibold flex items-center space-x-1">
                        <AlertCircle className="w-3 h-3" />
                        <span>Exceeded by {formatIDR(Math.abs(remaining))}</span>
                      </span>
                    ) : isWarning ? (
                      <span className="text-amber-400 font-medium flex items-center space-x-1">
                        <AlertCircle className="w-3 h-3" />
                        <span>{100 - rawPercent}% remaining</span>
                      </span>
                    ) : (
                      <span className="text-emerald-400 font-medium flex items-center space-x-1">
                        <CheckCircle className="w-3 h-3" />
                        <span>On Track ({formatIDR(remaining)} left)</span>
                      </span>
                    )}
                  </div>
                  <span
                    className={`font-mono font-bold text-xs ${
                      isOverBudget
                        ? 'text-red-400'
                        : isWarning
                        ? 'text-amber-400'
                        : 'text-emerald-400'
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
