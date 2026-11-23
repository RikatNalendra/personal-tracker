import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { useDashboard } from '../../context/DashboardContext';
import { TransactionType, AssetClass } from '../../types/finance';
import { TaskPriority, TaskRecurrence } from '../../types/tasks';
import { DollarSign, TrendingUp, CheckSquare, ArrowRightLeft, ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { getTodayString } from '../../utils/dateUtils';

interface QuickAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'transaction' | 'asset' | 'task';
}

export const QuickAddModal: React.FC<QuickAddModalProps> = ({
  isOpen,
  onClose,
  defaultTab = 'transaction',
}) => {
  const { database, addTransaction, addAsset, addTask } = useDashboard();
  const [activeTab, setActiveTab] = useState<'transaction' | 'asset' | 'task'>(defaultTab);

  // Transaction form state
  const [txType, setTxType] = useState<TransactionType>('expense');
  const [txAmount, setTxAmount] = useState<string>('');
  const [txDate, setTxDate] = useState<string>(getTodayString());
  const [txAccountId, setTxAccountId] = useState<string>(database.accounts[0]?.id || '');
  const [txToAccountId, setTxToAccountId] = useState<string>(database.accounts[1]?.id || '');
  const [txCategoryId, setTxCategoryId] = useState<string>(
    database.categories.find((c) => c.type === 'expense')?.id || ''
  );
  const [txNotes, setTxNotes] = useState<string>('');

  // Asset form state
  const [assetName, setAssetName] = useState<string>('');
  const [assetTicker, setAssetTicker] = useState<string>('');
  const [assetClass, setAssetClass] = useState<AssetClass>('gold');
  const [assetQuantity, setAssetQuantity] = useState<string>('');
  const [assetBuyPrice, setAssetBuyPrice] = useState<string>('');
  const [assetCurrentPrice, setAssetCurrentPrice] = useState<string>('');
  const [assetCurrency, setAssetCurrency] = useState<'IDR' | 'USD'>('IDR');
  const [assetDate, setAssetDate] = useState<string>(getTodayString());

  // Task form state
  const [taskTitle, setTaskTitle] = useState<string>('');
  const [taskNotes, setTaskNotes] = useState<string>('');
  const [taskCategoryTag, setTaskCategoryTag] = useState<string>('Business');
  const [taskPriority, setTaskPriority] = useState<TaskPriority>('high');
  const [taskDueDate, setTaskDueDate] = useState<string>(getTodayString());
  const [taskTimeBlock, setTaskTimeBlock] = useState<string>('');
  const [taskRecurrence, setTaskRecurrence] = useState<TaskRecurrence>('none');

  const handleCreateTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(txAmount.replace(/[^0-9.]/g, ''));
    if (!amount || amount <= 0) return;

    addTransaction({
      type: txType,
      amount,
      date: txDate,
      accountId: txAccountId,
      toAccountId: txType === 'transfer' ? txToAccountId : undefined,
      categoryId: txType === 'transfer' ? 'transfer' : txCategoryId,
      notes: txNotes.trim(),
    });

    setTxAmount('');
    setTxNotes('');
    onClose();
  };

  const handleCreateAsset = (e: React.FormEvent) => {
    e.preventDefault();
    const qty = parseFloat(assetQuantity);
    const buyPrice = parseFloat(assetBuyPrice.replace(/[^0-9.]/g, ''));
    const currPrice = assetCurrentPrice
      ? parseFloat(assetCurrentPrice.replace(/[^0-9.]/g, ''))
      : buyPrice;

    if (!assetName || !assetTicker || isNaN(qty) || isNaN(buyPrice)) return;

    addAsset({
      name: assetName.trim(),
      ticker: assetTicker.trim().toUpperCase(),
      assetClass,
      quantity: qty,
      avgBuyPrice: buyPrice,
      currentPrice: currPrice,
      currency: assetCurrency,
      purchaseDate: assetDate,
    });

    setAssetName('');
    setAssetTicker('');
    setAssetQuantity('');
    setAssetBuyPrice('');
    setAssetCurrentPrice('');
    onClose();
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;

    addTask({
      title: taskTitle.trim(),
      notes: taskNotes.trim() || undefined,
      categoryTag: taskCategoryTag,
      priority: taskPriority,
      dueDate: taskDueDate,
      timeBlock: taskTimeBlock.trim() || undefined,
      recurrence: taskRecurrence,
      status: 'todo',
    });

    setTaskTitle('');
    setTaskNotes('');
    setTaskTimeBlock('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Executive Quick Entry"
      subtitle="Instantly log a transaction, add an investment, or schedule a priority task"
      maxWidth="lg"
    >
      {/* Tab Switcher */}
      <div className="grid grid-cols-3 gap-2 p-1 bg-[#0E121B] rounded-xl border border-[#1E2433] mb-6">
        <button
          type="button"
          onClick={() => setActiveTab('transaction')}
          className={`flex items-center justify-center space-x-2 py-2 text-xs font-semibold rounded-lg transition-all ${
            activeTab === 'transaction'
              ? 'bg-[#1E2433] text-[#F3F4F6] shadow-sm'
              : 'text-[#9CA3AF] hover:text-[#F3F4F6]'
          }`}
        >
          <DollarSign className="w-3.5 h-3.5 text-[#10B981]" />
          <span>Transaction</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('asset')}
          className={`flex items-center justify-center space-x-2 py-2 text-xs font-semibold rounded-lg transition-all ${
            activeTab === 'asset'
              ? 'bg-[#1E2433] text-[#F3F4F6] shadow-sm'
              : 'text-[#9CA3AF] hover:text-[#F3F4F6]'
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5 text-[#F59E0B]" />
          <span>Asset / Stock</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('task')}
          className={`flex items-center justify-center space-x-2 py-2 text-xs font-semibold rounded-lg transition-all ${
            activeTab === 'task'
              ? 'bg-[#1E2433] text-[#F3F4F6] shadow-sm'
              : 'text-[#9CA3AF] hover:text-[#F3F4F6]'
          }`}
        >
          <CheckSquare className="w-3.5 h-3.5 text-[#3B82F6]" />
          <span>Priority Task</span>
        </button>
      </div>

      {/* 1. TRANSACTION FORM */}
      {activeTab === 'transaction' && (
        <form onSubmit={handleCreateTransaction} className="space-y-4">
          {/* Type Selector */}
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => {
                setTxType('expense');
                const cat = database.categories.find((c) => c.type === 'expense');
                if (cat) setTxCategoryId(cat.id);
              }}
              className={`flex items-center justify-center space-x-2 p-2.5 rounded-xl border text-xs font-bold transition-all ${
                txType === 'expense'
                  ? 'bg-red-500/10 border-red-500/50 text-red-400'
                  : 'bg-[#171C2A] border-[#1E2433] text-[#9CA3AF]'
              }`}
            >
              <ArrowDownRight className="w-4 h-4" />
              <span>Expense</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setTxType('income');
                const cat = database.categories.find((c) => c.type === 'income');
                if (cat) setTxCategoryId(cat.id);
              }}
              className={`flex items-center justify-center space-x-2 p-2.5 rounded-xl border text-xs font-bold transition-all ${
                txType === 'income'
                  ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400'
                  : 'bg-[#171C2A] border-[#1E2433] text-[#9CA3AF]'
              }`}
            >
              <ArrowUpRight className="w-4 h-4" />
              <span>Income</span>
            </button>
            <button
              type="button"
              onClick={() => setTxType('transfer')}
              className={`flex items-center justify-center space-x-2 p-2.5 rounded-xl border text-xs font-bold transition-all ${
                txType === 'transfer'
                  ? 'bg-blue-500/10 border-blue-500/50 text-blue-400'
                  : 'bg-[#171C2A] border-[#1E2433] text-[#9CA3AF]'
              }`}
            >
              <ArrowRightLeft className="w-4 h-4" />
              <span>Transfer</span>
            </button>
          </div>

          {/* Amount input */}
          <div>
            <label className="block text-xs font-medium text-[#9CA3AF] mb-1">
              Amount ({database.settings.defaultCurrency})
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-semibold text-[#9CA3AF]">
                Rp
              </span>
              <input
                type="number"
                step="any"
                required
                value={txAmount}
                onChange={(e) => setTxAmount(e.target.value)}
                placeholder="0"
                className="w-full bg-[#171C2A] border border-[#1E2433] rounded-xl pl-11 pr-4 py-2.5 text-base font-semibold text-[#F3F4F6] focus:border-[#F59E0B] focus:outline-none"
              />
            </div>
          </div>

          {/* Account Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#9CA3AF] mb-1">
                {txType === 'transfer' ? 'From Account' : 'Account / Wallet'}
              </label>
              {database.accounts.length === 0 ? (
                <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-[11px] text-amber-300">
                  No accounts yet. Please add an account in <strong>Cash Flow & Wallets</strong> first.
                </div>
              ) : (
                <select
                  value={txAccountId}
                  onChange={(e) => setTxAccountId(e.target.value)}
                  className="w-full bg-[#171C2A] border border-[#1E2433] rounded-xl px-3 py-2 text-xs text-[#F3F4F6] focus:border-[#F59E0B] focus:outline-none"
                >
                  {database.accounts.map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.name} (Rp {acc.balance.toLocaleString('id-ID')})
                    </option>
                  ))}
                </select>
              )}
            </div>

            {txType === 'transfer' ? (
              <div>
                <label className="block text-xs font-medium text-[#9CA3AF] mb-1">To Account</label>
                {database.accounts.length < 2 ? (
                  <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-[11px] text-amber-300">
                    Transfers require at least 2 accounts.
                  </div>
                ) : (
                  <select
                    value={txToAccountId}
                    onChange={(e) => setTxToAccountId(e.target.value)}
                    className="w-full bg-[#171C2A] border border-[#1E2433] rounded-xl px-3 py-2 text-xs text-[#F3F4F6] focus:border-[#F59E0B] focus:outline-none"
                  >
                    {database.accounts
                      .filter((a) => a.id !== txAccountId)
                      .map((acc) => (
                        <option key={acc.id} value={acc.id}>
                          {acc.name}
                        </option>
                      ))}
                  </select>
                )}
              </div>
            ) : (
              <div>
                <label className="block text-xs font-medium text-[#9CA3AF] mb-1">Category</label>
                <select
                  value={txCategoryId}
                  onChange={(e) => setTxCategoryId(e.target.value)}
                  className="w-full bg-[#171C2A] border border-[#1E2433] rounded-xl px-3 py-2 text-xs text-[#F3F4F6] focus:border-[#F59E0B] focus:outline-none"
                >
                  {database.categories
                    .filter((c) => c.type === txType)
                    .map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                </select>
              </div>
            )}
          </div>

          {/* Date & Notes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#9CA3AF] mb-1">Date</label>
              <input
                type="date"
                required
                value={txDate}
                onChange={(e) => setTxDate(e.target.value)}
                className="w-full bg-[#171C2A] border border-[#1E2433] rounded-xl px-3 py-2 text-xs text-[#F3F4F6] focus:border-[#F59E0B] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#9CA3AF] mb-1">Notes / Description</label>
              <input
                type="text"
                value={txNotes}
                onChange={(e) => setTxNotes(e.target.value)}
                placeholder="e.g. Lunch with partners, Dividends, etc."
                className="w-full bg-[#171C2A] border border-[#1E2433] rounded-xl px-3 py-2 text-xs text-[#F3F4F6] focus:border-[#F59E0B] focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-3 border-t border-[#1E2433]">
            <Button variant="ghost" size="sm" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button
              variant={txType === 'income' ? 'emerald' : txType === 'expense' ? 'coral' : 'primary'}
              size="sm"
              type="submit"
            >
              Save Transaction
            </Button>
          </div>
        </form>
      )}

      {/* 2. ASSET FORM */}
      {activeTab === 'asset' && (
        <form onSubmit={handleCreateAsset} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#9CA3AF] mb-1">Asset Class</label>
              <select
                value={assetClass}
                onChange={(e) => {
                  const val = e.target.value as AssetClass;
                  setAssetClass(val);
                  if (val === 'us_stock' || val === 'crypto') setAssetCurrency('USD');
                  else setAssetCurrency('IDR');
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
              <label className="block text-xs font-medium text-[#9CA3AF] mb-1">Currency</label>
              <select
                value={assetCurrency}
                onChange={(e) => setAssetCurrency(e.target.value as 'IDR' | 'USD')}
                className="w-full bg-[#171C2A] border border-[#1E2433] rounded-xl px-3 py-2 text-xs text-[#F3F4F6] focus:border-[#F59E0B] focus:outline-none"
              >
                <option value="IDR">IDR (Indonesian Rupiah)</option>
                <option value="USD">USD (US Dollar)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#9CA3AF] mb-1">
                Asset Name
              </label>
              <input
                type="text"
                required
                value={assetName}
                onChange={(e) => setAssetName(e.target.value)}
                placeholder="e.g. Antam 100g, Bank BCA, Nvidia"
                className="w-full bg-[#171C2A] border border-[#1E2433] rounded-xl px-3 py-2 text-xs text-[#F3F4F6] focus:border-[#F59E0B] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#9CA3AF] mb-1">
                Ticker / Code
              </label>
              <input
                type="text"
                required
                value={assetTicker}
                onChange={(e) => setAssetTicker(e.target.value)}
                placeholder="e.g. ANTAM, BBCA.JK, NVDA, BTC"
                className="w-full bg-[#171C2A] border border-[#1E2433] rounded-xl px-3 py-2 text-xs text-[#F3F4F6] focus:border-[#F59E0B] focus:outline-none uppercase"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#9CA3AF] mb-1">
                Quantity {assetClass === 'gold' ? '(Grams)' : '(Units / Shares)'}
              </label>
              <input
                type="number"
                step="any"
                required
                value={assetQuantity}
                onChange={(e) => setAssetQuantity(e.target.value)}
                placeholder="0"
                className="w-full bg-[#171C2A] border border-[#1E2433] rounded-xl px-3 py-2 text-xs text-[#F3F4F6] focus:border-[#F59E0B] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#9CA3AF] mb-1">
                Avg Buy Price ({assetCurrency})
              </label>
              <input
                type="number"
                step="any"
                required
                value={assetBuyPrice}
                onChange={(e) => setAssetBuyPrice(e.target.value)}
                placeholder="0"
                className="w-full bg-[#171C2A] border border-[#1E2433] rounded-xl px-3 py-2 text-xs text-[#F3F4F6] focus:border-[#F59E0B] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#9CA3AF] mb-1">
                Current Price ({assetCurrency})
              </label>
              <input
                type="number"
                step="any"
                value={assetCurrentPrice}
                onChange={(e) => setAssetCurrentPrice(e.target.value)}
                placeholder="Leave blank for same"
                className="w-full bg-[#171C2A] border border-[#1E2433] rounded-xl px-3 py-2 text-xs text-[#F3F4F6] focus:border-[#F59E0B] focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-3 border-t border-[#1E2433]">
            <Button variant="ghost" size="sm" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Add Investment
            </Button>
          </div>
        </form>
      )}

      {/* 3. TASK FORM */}
      {activeTab === 'task' && (
        <form onSubmit={handleCreateTask} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[#9CA3AF] mb-1">Task Title</label>
            <input
              type="text"
              required
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
              placeholder="e.g. Executive Board Meeting Preparation"
              className="w-full bg-[#171C2A] border border-[#1E2433] rounded-xl px-3.5 py-2.5 text-sm font-medium text-[#F3F4F6] focus:border-[#F59E0B] focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#9CA3AF] mb-1">Tag / Workspace</label>
              <select
                value={taskCategoryTag}
                onChange={(e) => setTaskCategoryTag(e.target.value)}
                className="w-full bg-[#171C2A] border border-[#1E2433] rounded-xl px-3 py-2 text-xs text-[#F3F4F6] focus:border-[#F59E0B] focus:outline-none"
              >
                {database.taskWorkspaces.map((ws) => (
                  <option key={ws.id} value={ws.name}>
                    {ws.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-[#9CA3AF] mb-1">Priority</label>
              <select
                value={taskPriority}
                onChange={(e) => setTaskPriority(e.target.value as TaskPriority)}
                className="w-full bg-[#171C2A] border border-[#1E2433] rounded-xl px-3 py-2 text-xs text-[#F3F4F6] focus:border-[#F59E0B] focus:outline-none"
              >
                <option value="high">High Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="low">Low Priority</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-[#9CA3AF] mb-1">Due Date</label>
              <input
                type="date"
                required
                value={taskDueDate}
                onChange={(e) => setTaskDueDate(e.target.value)}
                className="w-full bg-[#171C2A] border border-[#1E2433] rounded-xl px-3 py-2 text-xs text-[#F3F4F6] focus:border-[#F59E0B] focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#9CA3AF] mb-1">
                Time Block (Optional)
              </label>
              <input
                type="text"
                value={taskTimeBlock}
                onChange={(e) => setTaskTimeBlock(e.target.value)}
                placeholder="e.g. 09:00 - 10:30 or Morning Focus"
                className="w-full bg-[#171C2A] border border-[#1E2433] rounded-xl px-3 py-2 text-xs text-[#F3F4F6] focus:border-[#F59E0B] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#9CA3AF] mb-1">Recurrence</label>
              <select
                value={taskRecurrence}
                onChange={(e) => setTaskRecurrence(e.target.value as TaskRecurrence)}
                className="w-full bg-[#171C2A] border border-[#1E2433] rounded-xl px-3 py-2 text-xs text-[#F3F4F6] focus:border-[#F59E0B] focus:outline-none"
              >
                <option value="none">One-time Task</option>
                <option value="daily">Daily Habit</option>
                <option value="weekdays">Weekdays (Mon-Fri)</option>
                <option value="weekly">Weekly Routine</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#9CA3AF] mb-1">
              Notes / Sub-actions
            </label>
            <textarea
              rows={2}
              value={taskNotes}
              onChange={(e) => setTaskNotes(e.target.value)}
              placeholder="Key deliverables, meeting links, or reference notes..."
              className="w-full bg-[#171C2A] border border-[#1E2433] rounded-xl px-3 py-2 text-xs text-[#F3F4F6] focus:border-[#F59E0B] focus:outline-none resize-none"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-3 border-t border-[#1E2433]">
            <Button variant="ghost" size="sm" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Create Priority Task
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
};
