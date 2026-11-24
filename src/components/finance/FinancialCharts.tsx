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
  CartesianGrid,
} from 'recharts';
import { useDashboard } from '../../context/DashboardContext';
import { Card } from '../common/Card';
import { formatCompactIDR, formatIDR, formatPercent } from '../../utils/currency';
import { TrendingUp, ArrowDownRight, ArrowUpRight, PieChart as PieIcon, Sparkles } from 'lucide-react';

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

  // Curated bold jewel tones for donut breakdown
  const JEWEL_DONUT_COLORS = [
    '#00D68F', // Bold Emerald
    '#FFB800', // Imperial Gold
    '#2563EB', // Sapphire Blue
    '#FF3358', // Crimson Ruby
    '#8B5CF6', // Electric Violet
    '#00D2FF', // Cyber Cyan
    '#6366F1', // Indigo
    '#0D9488', // Titanium Teal
  ];

  const pieChartData = Object.entries(categoryExpenseMap)
    .map(([catId, amount], idx) => {
      const cat = categoryMap.get(catId);
      return {
        name: cat?.name || 'Other',
        value: amount,
        color: JEWEL_DONUT_COLORS[idx % JEWEL_DONUT_COLORS.length],
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
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* 1. Monthly Cash Flow Bar Chart with Rich Gradients */}
      <Card className="lg:col-span-2 p-6 flex flex-col justify-between relative overflow-hidden">
        {/* Subtle background ambient glow */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-[#00D68F]/[0.03] rounded-full blur-3xl pointer-events-none" />

        <div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-white/[0.08] gap-3">
            <div>
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-[#00D68F] shadow-[0_0_8px_#00D68F]" />
                <h3 className="text-sm font-bold text-slate-100 tracking-tight">
                  Monthly Cash Flow Dynamics
                </h3>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Executive revenue generation vs operating cash burn
              </p>
            </div>

            {/* Bold Legend Badges */}
            <div className="flex items-center space-x-3 text-xs">
              <div className="flex items-center space-x-2 px-2.5 py-1 rounded-lg bg-[#00D68F]/10 border border-[#00D68F]/30">
                <span className="w-2 h-2 rounded-full bg-[#00D68F] shadow-[0_0_6px_#00D68F]" />
                <span className="text-xs font-bold text-[#00D68F]">Income</span>
              </div>
              <div className="flex items-center space-x-2 px-2.5 py-1 rounded-lg bg-[#FF3358]/10 border border-[#FF3358]/30">
                <span className="w-2 h-2 rounded-full bg-[#FF3358] shadow-[0_0_6px_#FF3358]" />
                <span className="text-xs font-bold text-[#FF3358]">Expense</span>
              </div>
            </div>
          </div>

          {/* Chart Canvas */}
          <div className="h-64 w-full mt-5">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barChartData} margin={{ top: 12, right: 12, left: 10, bottom: 0 }}>
                {/* SVG Gradients for bold, professional finish */}
                <defs>
                  <linearGradient id="boldIncomeGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#00E599" stopOpacity={0.95} />
                    <stop offset="100%" stopColor="#007A50" stopOpacity={0.8} />
                  </linearGradient>
                  <linearGradient id="boldExpenseGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#FF3358" stopOpacity={0.95} />
                    <stop offset="100%" stopColor="#9E0C28" stopOpacity={0.8} />
                  </linearGradient>
                </defs>

                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(255, 255, 255, 0.04)"
                  vertical={false}
                />
                <XAxis
                  dataKey="month"
                  stroke="#64748B"
                  fontSize={11}
                  fontWeight={600}
                  tickLine={false}
                  axisLine={{ stroke: 'rgba(255, 255, 255, 0.08)' }}
                />
                <YAxis
                  stroke="#64748B"
                  fontSize={11}
                  fontFamily="JetBrains Mono"
                  tickLine={false}
                  axisLine={false}
                  width={72}
                  tickFormatter={(val) => formatCompactIDR(val)}
                />
                <Tooltip
                  cursor={{ fill: 'rgba(255, 255, 255, 0.03)' }}
                  contentStyle={{
                    backgroundColor: '#0D111A',
                    borderColor: 'rgba(255, 255, 255, 0.14)',
                    borderRadius: '14px',
                    boxShadow: '0 12px 32px rgba(0,0,0,0.7)',
                    padding: '12px',
                  }}
                  formatter={(value: any) => [formatIDR(Number(value)), '']}
                  labelStyle={{ color: '#F8FAFC', fontWeight: 700, marginBottom: '4px' }}
                />
                <Bar
                  dataKey="income"
                  fill="url(#boldIncomeGradient)"
                  radius={[6, 6, 2, 2]}
                  maxBarSize={30}
                />
                <Bar
                  dataKey="expense"
                  fill="url(#boldExpenseGradient)"
                  radius={[6, 6, 2, 2]}
                  maxBarSize={30}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Executive Stat Footer */}
        <div className="mt-5 pt-4 border-t border-white/[0.08] grid grid-cols-3 gap-3">
          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.05] text-center">
            <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider mb-1">
              Current Income
            </span>
            <span className="text-sm font-extrabold text-[#00D68F] font-mono tracking-tight">
              {formatIDR(currentIncome)}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.05] text-center">
            <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider mb-1">
              Current Expense
            </span>
            <span className="text-sm font-extrabold text-[#FF3358] font-mono tracking-tight">
              {formatIDR(currentExp)}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.05] text-center">
            <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider mb-1">
              Savings Rate
            </span>
            <span className="text-sm font-extrabold text-[#FFB800] font-mono tracking-tight">
              {formatPercent(savingsRate)}
            </span>
          </div>
        </div>
      </Card>

      {/* 2. Expense Breakdown Donut Chart with Jewel Rings */}
      <Card className="p-6 flex flex-col justify-between relative overflow-hidden">
        {/* Subtle ambient violet glow */}
        <div className="absolute top-0 right-0 w-56 h-56 bg-[#8B5CF6]/[0.03] rounded-full blur-3xl pointer-events-none" />

        <div className="pb-4 border-b border-white/[0.08]">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-[#FFB800] shadow-[0_0_8px_#FFB800]" />
            <h3 className="text-sm font-bold text-slate-100 tracking-tight">
              Capital Outflow Breakdown
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">Burn distribution by custom category</p>
        </div>

        {pieChartData.length === 0 ? (
          <div className="py-20 text-center text-xs text-slate-400 flex flex-col items-center justify-center">
            <div className="w-12 h-12 rounded-2xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-center text-slate-500 mb-3">
              <PieIcon className="w-6 h-6" />
            </div>
            <p className="font-semibold text-slate-300">No Outflow Recorded</p>
            <p className="text-[11px] text-slate-500 max-w-xs mt-1">
              As expenses are logged, your category distribution will generate automatically.
            </p>
          </div>
        ) : (
          <>
            <div className="h-52 w-full my-3 relative flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={62}
                    outerRadius={88}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.color}
                        stroke="#0D111A"
                        strokeWidth={3}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0D111A',
                      borderColor: 'rgba(255, 255, 255, 0.14)',
                      borderRadius: '12px',
                      padding: '10px',
                    }}
                    formatter={(value: any) => [formatIDR(Number(value)), 'Total Spent']}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Total Burn
                </span>
                <span className="text-sm font-extrabold text-slate-100 font-mono tracking-tight mt-0.5">
                  {formatCompactIDR(totalExpense)}
                </span>
              </div>
            </div>

            {/* Top Categories List with Glowing Badges */}
            <div className="space-y-2 pt-3 border-t border-white/[0.08] max-h-40 overflow-y-auto">
              {pieChartData.slice(0, 5).map((item, idx) => {
                const pct = totalExpense > 0 ? ((item.value / totalExpense) * 100).toFixed(1) : '0';
                return (
                  <div key={idx} className="flex items-center justify-between text-xs group">
                    <div className="flex items-center space-x-2.5 min-w-0">
                      <span
                        className="w-2.5 h-2.5 rounded-full flex-shrink-0 ring-2 ring-white/10"
                        style={{
                          backgroundColor: item.color,
                          boxShadow: `0 0 8px ${item.color}80`,
                        }}
                      />
                      <span className="text-slate-300 font-medium truncate text-xs group-hover:text-white transition-colors">
                        {item.name}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 font-mono flex-shrink-0">
                      <span className="text-slate-200 font-semibold text-xs">
                        {formatCompactIDR(item.value)}
                      </span>
                      <span className="text-slate-500 text-[11px] font-bold w-10 text-right">
                        {pct}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </Card>
    </div>
  );
};
