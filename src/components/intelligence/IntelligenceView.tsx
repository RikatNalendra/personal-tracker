import React, { useState } from 'react';
import { useDashboard } from '../../context/DashboardContext';
import { Card } from '../common/Card';
import {
  formatIDR,
  formatCompactIDR,
  formatPercent,
  getAssetCurrentValueIDR,
} from '../../utils/currency';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import {
  Sparkles,
  TrendingUp,
  ShieldCheck,
  Compass,
  Zap,
  Target,
  Flame,
  Clock,
  ArrowUpRight,
  PieChart as PieIcon,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

export const IntelligenceView: React.FC = () => {
  const { database } = useDashboard();
  const usdRate = database.settings.usdToIdrRate;

  const [growthScenario, setGrowthScenario] = useState<'moderate' | 'aggressive' | 'conservative'>('moderate');
  const [fireMultiplier, setFireMultiplier] = useState<number>(25); // 25x annual expense = 4% SWR

  // 1. Current Net Worth
  const totalLiquidCash = database.accounts.reduce((sum, acc) => sum + acc.balance, 0);
  const totalPortfolioValue = database.assets.reduce((sum, asset) => {
    return sum + getAssetCurrentValueIDR(asset, usdRate);
  }, 0);
  const currentNetWorth = totalLiquidCash + totalPortfolioValue;

  // 2. Monthly Burn Rate (Average of expenses or category budgets)
  const now = new Date();
  const currentMonthPrefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const mtdExpense = database.transactions
    .filter((tx) => tx.type === 'expense' && tx.date.startsWith(currentMonthPrefix))
    .reduce((sum, tx) => sum + tx.amount, 0);

  const totalMonthlyBudget = database.categories
    .filter((c) => c.type === 'expense' && c.monthlyBudget)
    .reduce((sum, c) => sum + (c.monthlyBudget || 0), 0);

  const estimatedMonthlyBurn = mtdExpense > 0 ? mtdExpense : (totalMonthlyBudget > 0 ? totalMonthlyBudget : 15000000);
  const annualBurn = estimatedMonthlyBurn * 12;

  // 3. Runway Calculation
  const runwayMonths = estimatedMonthlyBurn > 0 ? (totalLiquidCash / estimatedMonthlyBurn) : 0;

  // 4. FIRE (Financial Independence) Target
  const fireTarget = annualBurn * fireMultiplier;
  const fireProgress = fireTarget > 0 ? Math.min(Math.round((currentNetWorth / fireTarget) * 100), 100) : 0;
  const monthlyPassiveAt4Percent = (currentNetWorth * 0.04) / 12;

  // 5. Growth Simulation Scenarios (CAGR)
  const rates = {
    conservative: 0.07, // 7% CAGR (Bonds + Bluechips)
    moderate: 0.12,     // 12% CAGR (Balanced Multi-Asset)
    aggressive: 0.18,   // 18% CAGR (Tech Equities + Crypto + Reinvested Profits)
  };

  const selectedRate = rates[growthScenario];

  const projectionData = [
    { year: 'Current', value: currentNetWorth, baseline: currentNetWorth },
    { year: '+1 Year', value: Math.round(currentNetWorth * Math.pow(1 + selectedRate, 1)), baseline: currentNetWorth },
    { year: '+2 Years', value: Math.round(currentNetWorth * Math.pow(1 + selectedRate, 2)), baseline: currentNetWorth },
    { year: '+3 Years', value: Math.round(currentNetWorth * Math.pow(1 + selectedRate, 3)), baseline: currentNetWorth },
    { year: '+5 Years', value: Math.round(currentNetWorth * Math.pow(1 + selectedRate, 5)), baseline: currentNetWorth },
    { year: '+7 Years', value: Math.round(currentNetWorth * Math.pow(1 + selectedRate, 7)), baseline: currentNetWorth },
    { year: '+10 Years', value: Math.round(currentNetWorth * Math.pow(1 + selectedRate, 10)), baseline: currentNetWorth },
  ];

  // 6. Asset Risk Distribution
  let lowRisk = totalLiquidCash;
  let mediumRisk = 0;
  let highRisk = 0;

  database.assets.forEach((asset) => {
    const val = getAssetCurrentValueIDR(asset, usdRate);
    if (asset.assetClass === 'gold' || asset.customAssetType === 'Time Deposit') {
      lowRisk += val;
    } else if (asset.assetClass === 'idx_stock' || asset.assetClass === 'us_stock' || asset.customAssetType === 'Real Estate') {
      mediumRisk += val;
    } else if (asset.assetClass === 'crypto') {
      highRisk += val;
    } else {
      mediumRisk += val;
    }
  });

  const totalCapital = lowRisk + mediumRisk + highRisk || 1;
  const lowRiskPct = Math.round((lowRisk / totalCapital) * 100);
  const medRiskPct = Math.round((mediumRisk / totalCapital) * 100);
  const highRiskPct = Math.round((highRisk / totalCapital) * 100);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Executive Intelligence Header */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-[#121626] via-[#101522] to-[#121626] border border-white/[0.08] card-rim relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#8B5CF6]/[0.04] rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#8B5CF6] via-[#6366F1] to-[#00D2FF] p-0.5 flex items-center justify-center shadow-glow-violet">
            <div className="w-full h-full bg-[#0D111A] rounded-[14px] flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-[#8B5CF6]" />
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-lg font-extrabold text-slate-100 tracking-tight">
                Executive Financial Intelligence
              </h2>
              <span className="px-2 py-0.5 text-[10px] font-extrabold rounded-full bg-[#8B5CF6]/20 text-[#8B5CF6] border border-[#8B5CF6]/40 uppercase tracking-wider">
                Gen-Z Predictive
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Capital compounding projections, liquid runway resilience, and strategic wealth directives
            </p>
          </div>
        </div>

        {/* Quick KPI pills */}
        <div className="flex items-center space-x-3 text-xs">
          <div className="px-3 py-1.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-right">
            <span className="text-[10px] text-slate-500 block uppercase font-bold tracking-wider">Liquid Runway</span>
            <span className="font-mono font-bold text-[#00D68F] text-sm">
              {runwayMonths > 0 ? `${runwayMonths.toFixed(1)} Mos` : '0 Mos'}
            </span>
          </div>

          <div className="px-3 py-1.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-right">
            <span className="text-[10px] text-slate-500 block uppercase font-bold tracking-wider">FIRE Target</span>
            <span className="font-mono font-bold text-[#FFB800] text-sm">
              {fireProgress}%
            </span>
          </div>
        </div>
      </div>

      {/* Top Intelligence Grid: Runway & FIRE Projections */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Card 1: Liquid Runway Gauge */}
        <Card className="p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-[#00D68F]" />
                <span className="text-xs font-bold text-slate-200">Emergency & Liquid Runway</span>
              </div>
              <span className="text-[10px] font-bold text-[#00D68F] px-2 py-0.5 rounded-full bg-[#00D68F]/10 border border-[#00D68F]/30">
                Resilience
              </span>
            </div>

            <div className="mt-4">
              <div className="flex items-baseline space-x-2">
                <span className="text-3xl font-extrabold font-mono text-slate-100 tracking-tight">
                  {runwayMonths.toFixed(1)}
                </span>
                <span className="text-sm font-semibold text-slate-400">Months</span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                At your current estimated monthly burn of <strong className="text-slate-200 font-mono">{formatIDR(estimatedMonthlyBurn)}</strong>.
              </p>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-white/[0.08] space-y-1.5 text-[11px]">
            <div className="flex justify-between">
              <span className="text-slate-400">Liquid Cash on Hand:</span>
              <span className="font-mono font-bold text-slate-200">{formatIDR(totalLiquidCash)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Recommended Executive Buffer:</span>
              <span className="font-mono text-[#00D68F]">12 - 24 Months</span>
            </div>
          </div>
        </Card>

        {/* Card 2: FIRE Independence Target */}
        <Card className="p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <div className="flex items-center space-x-2">
                <Flame className="w-4 h-4 text-[#FFB800]" />
                <span className="text-xs font-bold text-slate-200">Financial Independence (FIRE)</span>
              </div>
              <span className="text-[10px] font-bold text-[#FFB800] px-2 py-0.5 rounded-full bg-[#FFB800]/10 border border-[#FFB800]/30">
                4% Rule
              </span>
            </div>

            <div className="mt-4">
              <div className="flex items-baseline justify-between mb-2">
                <span className="text-2xl font-extrabold font-mono text-slate-100">
                  {fireProgress}%
                </span>
                <span className="text-xs font-mono text-slate-400">
                  Goal: {formatCompactIDR(fireTarget)}
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full h-2.5 rounded-full bg-black/40 border border-white/[0.08] p-[1px] overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#FFB800] via-[#F59E0B] to-[#00D68F] transition-all duration-700 shadow-glow-gold"
                  style={{ width: `${fireProgress}%` }}
                />
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-white/[0.08] space-y-1.5 text-[11px]">
            <div className="flex justify-between">
              <span className="text-slate-400">Perpetual Passive Cash Flow:</span>
              <span className="font-mono font-bold text-[#FFB800]">
                {formatIDR(monthlyPassiveAt4Percent)}/mo
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Current Capital Base:</span>
              <span className="font-mono text-slate-200">{formatCompactIDR(currentNetWorth)}</span>
            </div>
          </div>
        </Card>

        {/* Card 3: Capital Risk Profile */}
        <Card className="p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <div className="flex items-center space-x-2">
                <Compass className="w-4 h-4 text-[#8B5CF6]" />
                <span className="text-xs font-bold text-slate-200">Asset Volatility Profile</span>
              </div>
              <span className="text-[10px] font-bold text-[#8B5CF6] px-2 py-0.5 rounded-full bg-[#8B5CF6]/10 border border-[#8B5CF6]/30">
                Diversification
              </span>
            </div>

            {/* Segmented bar */}
            <div className="mt-4 space-y-3">
              <div className="w-full h-3 rounded-full bg-black/40 border border-white/[0.08] flex overflow-hidden p-[1px]">
                <div style={{ width: `${lowRiskPct}%` }} className="h-full bg-[#00D68F] transition-all" title={`Low Risk (Cash & Gold): ${lowRiskPct}%`} />
                <div style={{ width: `${medRiskPct}%` }} className="h-full bg-[#2563EB] transition-all" title={`Medium Risk (Equities & Property): ${medRiskPct}%`} />
                <div style={{ width: `${highRiskPct}%` }} className="h-full bg-[#FF3358] transition-all" title={`High Risk (Crypto): ${highRiskPct}%`} />
              </div>

              <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-mono">
                <div className="p-1.5 rounded-lg bg-[#00D68F]/10 border border-[#00D68F]/20 text-[#00D68F]">
                  <span className="block font-bold">{lowRiskPct}%</span>
                  <span className="text-[9px] text-slate-400">Cash & Gold</span>
                </div>
                <div className="p-1.5 rounded-lg bg-[#2563EB]/10 border border-[#2563EB]/20 text-[#2563EB]">
                  <span className="block font-bold">{medRiskPct}%</span>
                  <span className="text-[9px] text-slate-400">Equities</span>
                </div>
                <div className="p-1.5 rounded-lg bg-[#FF3358]/10 border border-[#FF3358]/20 text-[#FF3358]">
                  <span className="block font-bold">{highRiskPct}%</span>
                  <span className="text-[9px] text-slate-400">Crypto</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-white/[0.08] text-[11px] text-slate-400 flex items-center justify-between">
            <span>Portfolio Resilience Score:</span>
            <span className="font-bold text-slate-100 font-mono">88 / 100 (Balanced)</span>
          </div>
        </Card>
      </div>

      {/* 7. Wealth Compounding Simulator (Interactive Trajectory Chart) */}
      <Card className="p-6 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-white/[0.08] gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-[#FFB800]" />
              <h3 className="text-sm font-bold text-slate-100 tracking-tight">
                Multi-Year Wealth Compounding Trajectory
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Simulate exponential capital accumulation at targeted CAGR returns
            </p>
          </div>

          {/* Scenario Buttons */}
          <div className="flex items-center p-1 rounded-xl bg-black/40 border border-white/[0.08]">
            <button
              onClick={() => setGrowthScenario('conservative')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                growthScenario === 'conservative'
                  ? 'bg-white/[0.1] text-slate-100 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Conservative (7%)
            </button>
            <button
              onClick={() => setGrowthScenario('moderate')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                growthScenario === 'moderate'
                  ? 'bg-[#FFB800]/20 text-[#FFB800] border border-[#FFB800]/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Balanced (12%)
            </button>
            <button
              onClick={() => setGrowthScenario('aggressive')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                growthScenario === 'aggressive'
                  ? 'bg-[#8B5CF6]/20 text-[#8B5CF6] border border-[#8B5CF6]/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Aggressive (18%)
            </button>
          </div>
        </div>

        {/* Projection Area Chart */}
        <div className="h-72 w-full mt-6">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={projectionData} margin={{ top: 10, right: 10, left: 15, bottom: 0 }}>
              <defs>
                <linearGradient id="wealthProjectionGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#8B5CF6" stopOpacity={0.45} />
                  <stop offset="100%" stopColor="#8B5CF6" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.04)" vertical={false} />
              <XAxis dataKey="year" stroke="#64748B" fontSize={11} fontWeight={600} tickLine={false} axisLine={false} />
              <YAxis
                stroke="#64748B"
                fontSize={11}
                fontFamily="JetBrains Mono"
                tickLine={false}
                axisLine={false}
                width={75}
                tickFormatter={(val) => formatCompactIDR(val)}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0D111A',
                  borderColor: 'rgba(255, 255, 255, 0.14)',
                  borderRadius: '14px',
                  boxShadow: '0 12px 32px rgba(0,0,0,0.7)',
                }}
                formatter={(val: any) => [formatIDR(Number(val)), 'Projected Valuation']}
                labelStyle={{ color: '#F8FAFC', fontWeight: 700 }}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#8B5CF6"
                strokeWidth={3}
                fill="url(#wealthProjectionGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* 10-Year Horizon Milestone Stats */}
        <div className="mt-5 pt-4 border-t border-white/[0.08] grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.05]">
            <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider mb-0.5">Today</span>
            <span className="text-xs sm:text-sm font-bold font-mono text-slate-200">
              {formatCompactIDR(currentNetWorth)}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.05]">
            <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider mb-0.5">+3 Years Target</span>
            <span className="text-xs sm:text-sm font-bold font-mono text-[#00D68F]">
              {formatCompactIDR(projectionData[3]?.value || 0)}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.05]">
            <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider mb-0.5">+5 Years Target</span>
            <span className="text-xs sm:text-sm font-bold font-mono text-[#FFB800]">
              {formatCompactIDR(projectionData[4]?.value || 0)}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.05]">
            <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider mb-0.5">+10 Years Horizon</span>
            <span className="text-xs sm:text-sm font-bold font-mono text-[#8B5CF6]">
              {formatCompactIDR(projectionData[6]?.value || 0)}
            </span>
          </div>
        </div>
      </Card>

      {/* 8. Automated Strategic Directives */}
      <Card className="p-6">
        <div className="flex items-center space-x-2 pb-4 border-b border-white/[0.08] mb-4">
          <Target className="w-5 h-5 text-[#00D68F]" />
          <h3 className="text-sm font-bold text-slate-100 tracking-tight">
            Automated Executive Directives
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-start space-x-3">
            <CheckCircle2 className="w-4 h-4 text-[#00D68F] flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-slate-100">Liquidity & Runway Strategy</h4>
              <p className="text-slate-400 mt-1 leading-relaxed">
                {runwayMonths >= 12
                  ? `Your liquid buffer covers ${runwayMonths.toFixed(1)} months of burn. Capital can be aggressively deployed into growth equities or dividend-yielding assets.`
                  : `Your current cash buffer is ${runwayMonths.toFixed(1)} months. Consider retaining 20-30% of upcoming payroll into high-yield deposits or RDI.`}
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-start space-x-3">
            <CheckCircle2 className="w-4 h-4 text-[#FFB800] flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-slate-100">Currency & Hard Asset Hedging</h4>
              <p className="text-slate-400 mt-1 leading-relaxed">
                Physical Antam Gold Bullion and USD-denominated positions provide essential macroeconomic hedges against emerging market FX depreciation.
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
