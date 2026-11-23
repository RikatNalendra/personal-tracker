import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { useDashboard } from '../../context/DashboardContext';
import { Card } from '../common/Card';
import { getAssetClassColor, getAssetClassLabel } from '../../utils/colors';
import {
  formatCompactIDR,
  formatIDR,
  getAssetCurrentValueIDR,
} from '../../utils/currency';
import { PieChart as PieIcon } from 'lucide-react';

export const PortfolioAllocationChart: React.FC = () => {
  const { database } = useDashboard();
  const usdRate = database.settings.usdToIdrRate;

  // Aggregate values by asset class
  const classValueMap: Record<string, number> = {};
  let totalPortfolioValue = 0;

  database.assets.forEach((asset) => {
    const valIDR = getAssetCurrentValueIDR(asset, usdRate);
    classValueMap[asset.assetClass] = (classValueMap[asset.assetClass] || 0) + valIDR;
    totalPortfolioValue += valIDR;
  });

  const chartData = Object.entries(classValueMap)
    .map(([assetClass, value]) => ({
      name: getAssetClassLabel(assetClass),
      assetClass,
      value,
      color: getAssetClassColor(assetClass),
    }))
    .sort((a, b) => b.value - a.value);

  return (
    <Card className="p-5 flex flex-col justify-between">
      <div className="pb-3 border-b border-[#1E2433]">
        <h3 className="text-sm font-bold text-[#F3F4F6] flex items-center space-x-2">
          <PieIcon className="w-4 h-4 text-[#F59E0B]" />
          <span>Asset Class Allocation</span>
        </h3>
        <p className="text-xs text-[#9CA3AF]">
          Diversification across gold, equities, crypto & real estate
        </p>
      </div>

      {chartData.length === 0 ? (
        <div className="py-16 text-center text-xs text-[#9CA3AF]">
          No assets in your portfolio yet. Add assets to view class allocation.
        </div>
      ) : (
        <>
          <div className="h-52 w-full my-2 relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="#131722" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#131722',
                    borderColor: '#1E2433',
                    borderRadius: '12px',
                  }}
                  formatter={(value: any) => [formatIDR(Number(value)), 'Value (IDR)']}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-[10px] text-[#9CA3AF]">Portfolio</span>
              <span className="text-xs font-bold text-[#F3F4F6] font-mono">
                {formatCompactIDR(totalPortfolioValue)}
              </span>
            </div>
          </div>

          {/* Allocation Legend */}
          <div className="space-y-2 pt-2 border-t border-[#1E2433]">
            {chartData.map((item, idx) => {
              const pct =
                totalPortfolioValue > 0
                  ? ((item.value / totalPortfolioValue) * 100).toFixed(1)
                  : '0';
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
        </>
      )}
    </Card>
  );
};
