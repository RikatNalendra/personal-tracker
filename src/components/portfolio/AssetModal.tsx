import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { useDashboard } from '../../context/DashboardContext';
import { Asset, AssetClass, Currency } from '../../types/finance';
import { getTodayString } from '../../utils/dateUtils';

interface AssetModalProps {
  isOpen: boolean;
  onClose: () => void;
  assetToEdit?: Asset | null;
}

export const AssetModal: React.FC<AssetModalProps> = ({
  isOpen,
  onClose,
  assetToEdit,
}) => {
  const { addAsset, editAsset } = useDashboard();

  const [name, setName] = useState('');
  const [ticker, setTicker] = useState('');
  const [assetClass, setAssetClass] = useState<AssetClass>('gold');
  const [quantity, setQuantity] = useState('');
  const [avgBuyPrice, setAvgBuyPrice] = useState('');
  const [currentPrice, setCurrentPrice] = useState('');
  const [currency, setCurrency] = useState<Currency>('IDR');
  const [purchaseDate, setPurchaseDate] = useState(getTodayString());
  const [customAssetType, setCustomAssetType] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (assetToEdit) {
      setName(assetToEdit.name);
      setTicker(assetToEdit.ticker);
      setAssetClass(assetToEdit.assetClass);
      setQuantity(assetToEdit.quantity.toString());
      setAvgBuyPrice(assetToEdit.avgBuyPrice.toString());
      setCurrentPrice(assetToEdit.currentPrice.toString());
      setCurrency(assetToEdit.currency);
      setPurchaseDate(assetToEdit.purchaseDate);
      setCustomAssetType(assetToEdit.customAssetType || '');
      setNotes(assetToEdit.notes || '');
    } else {
      setName('');
      setTicker('');
      setAssetClass('gold');
      setQuantity('');
      setAvgBuyPrice('');
      setCurrentPrice('');
      setCurrency('IDR');
      setPurchaseDate(getTodayString());
      setCustomAssetType('');
      setNotes('');
    }
  }, [assetToEdit, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const qty = parseFloat(quantity);
    const buyPrice = parseFloat(avgBuyPrice.replace(/[^0-9.]/g, ''));
    const currPrice = currentPrice
      ? parseFloat(currentPrice.replace(/[^0-9.]/g, ''))
      : buyPrice;

    if (!name || !ticker || isNaN(qty) || isNaN(buyPrice)) return;

    if (assetToEdit) {
      editAsset(assetToEdit.id, {
        name: name.trim(),
        ticker: ticker.trim().toUpperCase(),
        assetClass,
        quantity: qty,
        avgBuyPrice: buyPrice,
        currentPrice: currPrice,
        currency,
        purchaseDate,
        customAssetType: assetClass === 'custom' ? customAssetType.trim() : undefined,
        notes: notes.trim() || undefined,
      });
    } else {
      addAsset({
        name: name.trim(),
        ticker: ticker.trim().toUpperCase(),
        assetClass,
        quantity: qty,
        avgBuyPrice: buyPrice,
        currentPrice: currPrice,
        currency,
        purchaseDate,
        customAssetType: assetClass === 'custom' ? customAssetType.trim() : undefined,
        notes: notes.trim() || undefined,
      });
    }
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={assetToEdit ? 'Edit Asset Holding' : 'Add Investment Asset'}
      subtitle="Track physical gold, IDX stocks, global equities, crypto, and alternative holdings"
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-[#9CA3AF] mb-1">Asset Class</label>
            <select
              value={assetClass}
              onChange={(e) => {
                const val = e.target.value as AssetClass;
                setAssetClass(val);
                if (val === 'us_stock' || val === 'crypto') setCurrency('USD');
                else setCurrency('IDR');
              }}
              className="w-full bg-[#171C2A] border border-[#1E2433] rounded-xl px-3 py-2 text-xs text-[#F3F4F6] focus:border-[#F59E0B] focus:outline-none"
            >
              <option value="gold">Gold (Logam Mulia Antam)</option>
              <option value="idx_stock">Indonesian Stock (IDX)</option>
              <option value="us_stock">US / Global Stock or ETF</option>
              <option value="crypto">Cryptocurrency</option>
              <option value="custom">Real Estate & Alternative</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#9CA3AF] mb-1">Pricing Currency</label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value as Currency)}
              className="w-full bg-[#171C2A] border border-[#1E2433] rounded-xl px-3 py-2 text-xs text-[#F3F4F6] focus:border-[#F59E0B] focus:outline-none"
            >
              <option value="IDR">IDR (Indonesian Rupiah)</option>
              <option value="USD">USD (US Dollar)</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-[#9CA3AF] mb-1">Asset Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Antam 50g, Bank Central Asia, Apple Inc"
              className="w-full bg-[#171C2A] border border-[#1E2433] rounded-xl px-3 py-2 text-xs text-[#F3F4F6] focus:border-[#F59E0B] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#9CA3AF] mb-1">Ticker / Symbol</label>
            <input
              type="text"
              required
              value={ticker}
              onChange={(e) => setTicker(e.target.value)}
              placeholder="e.g. ANTAM, BBCA.JK, AAPL, BTC"
              className="w-full bg-[#171C2A] border border-[#1E2433] rounded-xl px-3 py-2 text-xs text-[#F3F4F6] focus:border-[#F59E0B] focus:outline-none uppercase font-mono"
            />
          </div>
        </div>

        {assetClass === 'custom' && (
          <div>
            <label className="block text-xs font-medium text-[#9CA3AF] mb-1">
              Custom Asset Subtype
            </label>
            <input
              type="text"
              value={customAssetType}
              onChange={(e) => setCustomAssetType(e.target.value)}
              placeholder="e.g. Real Estate, Time Deposit, SBN / ORI, P2P Lending"
              className="w-full bg-[#171C2A] border border-[#1E2433] rounded-xl px-3 py-2 text-xs text-[#F3F4F6] focus:border-[#F59E0B] focus:outline-none"
            />
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-medium text-[#9CA3AF] mb-1">
              {assetClass === 'gold' ? 'Weight (Grams)' : 'Quantity / Units'}
            </label>
            <input
              type="number"
              step="any"
              required
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="0"
              className="w-full bg-[#171C2A] border border-[#1E2433] rounded-xl px-3 py-2 text-xs text-[#F3F4F6] focus:border-[#F59E0B] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#9CA3AF] mb-1">
              Avg Buy Price ({currency})
            </label>
            <input
              type="number"
              step="any"
              required
              value={avgBuyPrice}
              onChange={(e) => setAvgBuyPrice(e.target.value)}
              placeholder="0"
              className="w-full bg-[#171C2A] border border-[#1E2433] rounded-xl px-3 py-2 text-xs text-[#F3F4F6] focus:border-[#F59E0B] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#9CA3AF] mb-1">
              Current Market Price ({currency})
            </label>
            <input
              type="number"
              step="any"
              value={currentPrice}
              onChange={(e) => setCurrentPrice(e.target.value)}
              placeholder="Leave blank for same"
              className="w-full bg-[#171C2A] border border-[#1E2433] rounded-xl px-3 py-2 text-xs text-[#F3F4F6] focus:border-[#F59E0B] focus:outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-[#9CA3AF] mb-1">Purchase Date</label>
            <input
              type="date"
              required
              value={purchaseDate}
              onChange={(e) => setPurchaseDate(e.target.value)}
              className="w-full bg-[#171C2A] border border-[#1E2433] rounded-xl px-3 py-2 text-xs text-[#F3F4F6] focus:border-[#F59E0B] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#9CA3AF] mb-1">
              Notes / Safe Deposit Location
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. SDB BCA Sudirman, Cold Storage, etc."
              className="w-full bg-[#171C2A] border border-[#1E2433] rounded-xl px-3 py-2 text-xs text-[#F3F4F6] focus:border-[#F59E0B] focus:outline-none"
            />
          </div>
        </div>

        <div className="flex justify-end space-x-2 pt-3 border-t border-[#1E2433]">
          <Button variant="ghost" size="sm" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" type="submit">
            {assetToEdit ? 'Save Changes' : 'Add Investment'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
