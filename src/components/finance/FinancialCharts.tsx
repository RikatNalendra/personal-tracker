import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { useDashboard } from '../../context/DashboardContext';
import { Card } from '../common/Card';
import { formatCompactIDR, formatIDR, formatPercent } from '../../utils/currency';
import { TrendingUp, ArrowDownRight, ArrowUpRight, PieChart as PieIcon } from 'lucide-react';

export const FinancialCharts: React.FC = () => {
  const { database } = useDashboard();

  // Aggregate monthly income vs expense for the last 6 months
  const monthlyDataMap: Record<string, { month: string; income: number; expense: number }> = {};

  const months = ['Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov'];
  const monthKeys = ['2026-06', '2026-07', '2026-08', '2026-09', '2026-10', '2026-11'];

  // Seed baseline realistic data for past months if transactions only cover recent
  const baseMonthlyHistory: Record<string, { income: number; expense: number }> = {
    '2026-06': { income: 55000000, expense: 22000000 },
    '2026-07': { income: 58000000, expense: 24500000 },
    '2026-08': { income: 62000000, expense: 23000000 },
    '2026-09': { income: 60000000, expense: 21500000 },
    '2026-10': { income: 65000000, expense: 26000000 },
    '2026-11': { income: 0, expense: 0 },
  };

  monthKeys.forEach((k, idx) => {
    monthlyDataMap[k] = {
      month: months[idx],
      income: baseMonthlyHistory[k]?.income || 0,
      expense: baseMonthlyHistory[k]?.expense || 0,
    };
  });

  // Calculate actual for current month from transactions
  database.transactions.forEach((tx) => {
    const key = tx.date.substring(0, 7);
    if (monthlyDataMap[key]) {
      if (tx.type === 'income') {
        monthlyDataMap[key].income += tx.amount;
      } else if (tx.type === 'expense') {
        monthlyDataMap[key].expense += tx.amount;
      }
    }
  });

  const barChartData = Object.values(monthlyDataMap);

  // Expense breakdown by category for the donut chart
  const categoryExpenseMap: Record<string, number> = {};
  database.transactions
    .filter((tx) => tx.type === 'expense')
    .forEach((tx) => {
      categoryExpenseMap[tx.categoryId] = (categoryExpenseMap[tx.categoryId] || 0) + tx.amount;
    });

  const categoryMap = new Map(database.categories.map((c) => [c.id, c]));

  const pieChartData = Object.entries(categoryExpenseMap)
    .map(([catId, amount]) => {
      const cat = categoryMap.get(catId);
      return {
        name: cat?.name || 'Other',
        value: amount,
        color: cat?.color || '#9CA3AF',
      };
    })
    .sort((a, b) => b.value - a.value);

  const totalExpense = pieChartData.reduce((sum, item) => sum + item.value, 0);

  // Current month totals
  const currentMonth = monthKeys[monthKeys.length - 1];
  const currentIncome = monthlyDataMap[currentMonth]?.income || 0;
  const currentExp = monthlyDataMap[currentMonth]?.expense || 0;
  const currentSavings = currentIncome - currentExp;
  const savingsRate = currentIncome > 0 ? (currentSavings / currentIncome) * 100 : 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      {/* 1. Monthly Cash Flow Bar Chart */}
      <Card className="lg:col-span-2 p-5 flex flex-col justify-between">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-[#1E2433] gap-2">
          <div>
            <h3 className="text-sm font-bold text-[#F3F4F6] flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-[#F59E0B]" />
              <span>Monthly Cash Flow (Income vs. Expense)</span>
            </h3>
            <p className="text-xs text-[#9CA3AF]">
              Executive revenue and burn rate comparison
            </p>
          </div>
          <div className="flex items-center space-x-4 text-xs">
            <div className="flex items-center space-x-1.5">
              <span className="w-3 h-3 rounded-sm bg-[#10B981]" />
              <span className="text-[#9CA3AF]">Income</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-3 h-3 rounded-sm bg-[#EF4444]" />
              <span className="text-[#9CA3AF]">Expense</span>
            </div>
          </div>
        </div>

        <div className="h-64 w-full mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barChartData} margin={{ top: 10, right: 10, left: 15, bottom: 0 }}>
              <XAxis
                dataKey="month"
                stroke="#64748B"
                fontSize={11}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#64748B"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                width={70}
                tickFormatter={(val) => formatCompactIDR(val)}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#131722',
                  borderColor: '#1E2433',
                  borderRadius: '12px',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
                }}
                formatter={(value: any) => [formatIDR(Number(value)), '']}
                labelStyle={{ color: '#F3F4F6', fontWeight: 600 }}
              />
              <Bar dataKey="income" fill="#10B981" radius={[4, 4, 0, 0]} maxBarSize={32} />
              <Bar dataKey="expense" fill="#EF4444" radius={[4, 4, 0, 0]} maxBarSize={32} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-4 pt-3 border-t border-[#1E2433] grid grid-cols-3 gap-2 text-center">
          <div>
            <span className="text-[10px] text-[#9CA3AF] block uppercase">Nov Income</span>
            <span className="text-xs font-bold text-emerald-400 font-mono">
              {formatIDR(currentIncome)}
            </span>
          </div>
          <div>
            <span className="text-[10px] text-[#9CA3AF] block uppercase">Nov Expense</span>
            <span className="text-xs font-bold text-red-400 font-mono">
              {formatIDR(currentExp)}
            </span>
          </div>
          <div>
            <span className="text-[10px] text-[#9CA3AF] block uppercase">Savings Rate</span>
            <span className="text-xs font-bold text-[#F59E0B] font-mono">
              {formatPercent(savingsRate)}
            </span>
          </div>
        </div>
      </Card>

      {/* 2. Expense Breakdown Donut Chart */}
      <Card className="p-5 flex flex-col justify-between">
        <div className="pb-3 border-b border-[#1E2433]">
          <h3 className="text-sm font-bold text-[#F3F4F6] flex items-center space-x-2">
            <PieIcon className="w-4 h-4 text-[#F59E0B]" />
            <span>Expense Breakdown</span>
          </h3>
          <p className="text-xs text-[#9CA3AF]">Spending by category distribution</p>
        </div>

        <div className="h-48 w-full my-2 relative flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieChartData}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={80}
                paddingAngle={3}
                dataKey="value"
              >
                {pieChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} stroke="#131722" strokeWidth={2} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#131722',
                  borderColor: '#1E2433',
                  borderRadius: '12px',
                }}
                formatter={(value: any) => [formatIDR(Number(value)), '']}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-[10px] text-[#9CA3AF]">Total</span>
            <span className="text-xs font-bold text-[#F3F4F6] font-mono">
              {formatCompactIDR(totalExpense)}
            </span>
          </div>
        </div>

        {/* Top 4 Categories List */}
        <div className="space-y-1.5 pt-2 border-t border-[#1E2433] max-h-36 overflow-y-auto">
          {pieChartData.slice(0, 5).map((item, idx) => {
            const pct = totalExpense > 0 ? ((item.value / totalExpense) * 100).toFixed(1) : '0';
            return (
              <div key={idx} className="flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2 min-w-0">
                  <span
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-[#9CA3AF] truncate text-[11px]">{item.name}</span>
                </div>
                <div className="flex items-center space-x-2 font-mono flex-shrink-0">
                  <span className="text-[#F3F4F6] text-[11px]">{formatCompactIDR(item.value)}</span>
                  <span className="text-[#64748B] text-[10px] w-9 text-right">{pct}%</span>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
};
