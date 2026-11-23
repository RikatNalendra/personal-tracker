import React, { useState } from 'react';
import { useDashboard } from '../../context/DashboardContext';
import { Asset, AssetClass } from '../../types/finance';
import {
  formatIDR,
  formatUSD,
  formatPercent,
  getAssetCurrentValueIDR,
  getAssetCostBasisIDR,
  getAssetUnrealizedGainIDR,
} from '../../utils/currency';
import { getAssetClassColor, getAssetClassLabel } from '../../utils/colors';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { AssetModal } from './AssetModal';
import {
  Plus,
  Edit2,
  Trash2,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Edit3,
} from 'lucide-react';

export const AssetList: React.FC = () => {
  const { database, deleteAsset, updateAssetPriceManual } = useDashboard();
  const usdRate = database.settings.usdToIdrRate;

  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);

  // Manual price override inline modal/prompt
  const [overrideModalAsset, setOverrideModalAsset] = useState<Asset | null>(null);
  const [overridePriceInput, setOverridePriceInput] = useState('');

  const filteredAssets = database.assets.filter((asset) => {
    if (selectedClass !== 'all' && asset.assetClass !== selectedClass) return false;
    return true;
  });

  const handleOpenPriceOverride = (asset: Asset) => {
    setOverrideModalAsset(asset);
    setOverridePriceInput(asset.currentPrice.toString());
  };

  const handleSavePriceOverride = (e: React.FormEvent) => {
    e.preventDefault();
    if (!overrideModalAsset) return;
    const price = parseFloat(overridePriceInput);
    if (!isNaN(price) && price > 0) {
      updateAssetPriceManual(overrideModalAsset.id, price);
      setOverrideModalAsset(null);
    }
  };

  const assetClasses: { id: string; label: string }[] = [
    { id: 'all', label: 'All Holdings' },
    { id: 'gold', label: 'Gold (Antam)' },
    { id: 'idx_stock', label: 'IDX Stocks' },
    { id: 'us_stock', label: 'US Equities & ETFs' },
    { id: 'crypto', label: 'Crypto' },
    { id: 'custom', label: 'Real Estate & Custom' },
  ];

  return (
    <Card className="p-5 space-y-4">
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-[#1E2433]">
        <div>
          <h3 className="text-base font-bold text-[#F3F4F6] flex items-center space-x-2">
            <span>Portfolio Holdings</span>
            <span className="text-xs font-normal text-[#9CA3AF]">
              ({filteredAssets.length} assets)
            </span>
          </h3>
          <p className="text-xs text-[#9CA3AF]">
            Real-time positions with live quotes and unrealized P&L
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => {
            setEditingAsset(null);
            setIsModalOpen(true);
          }}
          icon={<Plus className="w-4 h-4" />}
        >
          Add Asset
        </Button>
      </div>

      {/* Class Tabs */}
      <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
        {assetClasses.map((ac) => (
          <button
            key={ac.id}
            onClick={() => setSelectedClass(ac.id)}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all font-medium ${
              selectedClass === ac.id
                ? 'bg-[#1E2433] text-[#F3F4F6] border border-[#F59E0B]/30'
                : 'text-[#9CA3AF] hover:text-[#F3F4F6] hover:bg-[#171C2A]'
            }`}
          >
            {ac.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-[#1E2433] text-[#64748B] uppercase tracking-wider">
              <th className="py-2.5 px-3">Asset & Ticker</th>
              <th className="py-2.5 px-3">Holdings</th>
              <th className="py-2.5 px-3">Avg Buy Price</th>
              <th className="py-2.5 px-3">Live Price</th>
              <th className="py-2.5 px-3 text-right">Valuation (IDR)</th>
              <th className="py-2.5 px-3 text-right">Unrealized P&L</th>
              <th className="py-2.5 px-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1E2433]/60">
            {filteredAssets.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-[#9CA3AF]">
                  No assets found in this class.
                </td>
              </tr>
            ) : (
              filteredAssets.map((asset) => {
                const valIDR = getAssetCurrentValueIDR(asset, usdRate);
                const { gainIDR, gainPercent } = getAssetUnrealizedGainIDR(asset, usdRate);
                const isProfitable = gainIDR >= 0;
                const is24hUp = (asset.priceChange24h || 0) >= 0;

                return (
                  <tr
                    key={asset.id}
                    className="hover:bg-[#171C2A]/50 transition-colors group"
                  >
                    {/* Asset Name & Ticker */}
                    <td className="py-3 px-3">
                      <div className="flex items-center space-x-2.5">
                        <div
                          className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                          style={{ backgroundColor: getAssetClassColor(asset.assetClass) }}
                        />
                        <div>
                          <div className="font-bold text-[#F3F4F6] flex items-center space-x-1.5">
                            <span>{asset.name}</span>
                            <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-[#1E2433] text-[#9CA3AF]">
                              {asset.ticker}
                            </span>
                          </div>
                          <span className="text-[10px] text-[#64748B]">
                            {asset.customAssetType || getAssetClassLabel(asset.assetClass)}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Quantity */}
                    <td className="py-3 px-3 font-mono font-medium text-[#F3F4F6]">
                      {asset.quantity}{' '}
                      <span className="text-[10px] text-[#9CA3AF]">
                        {asset.assetClass === 'gold' ? 'grams' : 'units'}
                      </span>
                    </td>

                    {/* Avg Buy Price */}
                    <td className="py-3 px-3 font-mono text-[#9CA3AF]">
                      {asset.currency === 'USD'
                        ? formatUSD(asset.avgBuyPrice)
                        : formatIDR(asset.avgBuyPrice)}
                    </td>

                    {/* Live Market Price with 24h tag */}
                    <td className="py-3 px-3 font-mono">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-[#F3F4F6]">
                          {asset.currency === 'USD'
                            ? formatUSD(asset.currentPrice)
                            : formatIDR(asset.currentPrice)}
                        </span>
                        {asset.priceChange24h !== undefined && (
                          <span
                            className={`text-[10px] font-semibold flex items-center ${
                              is24hUp ? 'text-emerald-400' : 'text-red-400'
                            }`}
                          >
                            {is24hUp ? '+' : ''}
                            {asset.priceChange24h.toFixed(2)}%
                          </span>
                        )}
                        <button
                          onClick={() => handleOpenPriceOverride(asset)}
                          className="opacity-0 group-hover:opacity-100 p-1 text-[#64748B] hover:text-[#F59E0B] transition-opacity"
                          title="Manual price override"
                        >
                          <Edit3 className="w-3 h-3" />
                        </button>
                      </div>
                    </td>

                    {/* Valuation (IDR) */}
                    <td className="py-3 px-3 text-right font-mono font-bold text-sm text-[#F3F4F6]">
                      {formatIDR(valIDR)}
                    </td>

                    {/* Unrealized P&L */}
                    <td className="py-3 px-3 text-right font-mono">
                      <div
                        className={`font-bold ${
                          isProfitable ? 'text-emerald-400' : 'text-red-400'
                        }`}
                      >
                        {formatPercent(gainPercent)}
                      </div>
                      <div className="text-[10px] text-[#9CA3AF]">
                        {isProfitable ? '+' : ''}
                        {formatIDR(gainIDR)}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-3 text-center">
                      <div className="flex items-center justify-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => {
                            setEditingAsset(asset);
                            setIsModalOpen(true);
                          }}
                          className="p-1.5 rounded hover:bg-[#1E2433] text-[#9CA3AF] hover:text-[#F3F4F6]"
                          title="Edit Asset"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`Delete ${asset.name} from portfolio?`)) {
                              deleteAsset(asset.id);
                            }
                          }}
                          className="p-1.5 rounded hover:bg-[#1E2433] text-red-400 hover:text-red-300"
                          title="Delete Asset"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <AssetModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        assetToEdit={editingAsset}
      />

      {/* Manual Price Override Sub-Modal */}
      {overrideModalAsset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#131722] border border-[#1E2433] rounded-2xl p-5 max-w-sm w-full space-y-4 shadow-2xl">
            <div>
              <h4 className="text-sm font-bold text-[#F3F4F6]">Manual Price Override</h4>
              <p className="text-xs text-[#9CA3AF] mt-0.5">
                Override price for {overrideModalAsset.ticker} ({overrideModalAsset.currency})
              </p>
            </div>

            <form onSubmit={handleSavePriceOverride} className="space-y-3">
              <div>
                <input
                  type="number"
                  step="any"
                  required
                  value={overridePriceInput}
                  onChange={(e) => setOverridePriceInput(e.target.value)}
                  className="w-full bg-[#171C2A] border border-[#1E2433] rounded-xl px-3.5 py-2 text-sm font-mono text-[#F3F4F6] focus:border-[#F59E0B] focus:outline-none"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <Button
                  variant="ghost"
                  size="sm"
                  type="button"
                  onClick={() => setOverrideModalAsset(null)}
                >
                  Cancel
                </Button>
                <Button variant="primary" size="sm" type="submit">
                  Save Price
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Card>
  );
};
