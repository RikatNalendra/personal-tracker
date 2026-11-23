import React, { useState, useMemo } from 'react';
import { useDashboard } from '../../context/DashboardContext';
import { Transaction, TransactionType } from '../../types/finance';
import { formatIDR } from '../../utils/currency';
import { formatDate } from '../../utils/dateUtils';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import {
  Search,
  Filter,
  ArrowDownRight,
  ArrowUpRight,
  ArrowRightLeft,
  Trash2,
  Edit2,
  Calendar,
  Tag,
} from 'lucide-react';

interface TransactionListProps {
  onOpenQuickAdd: () => void;
}

export const TransactionList: React.FC<TransactionListProps> = ({ onOpenQuickAdd }) => {
  const { database, deleteTransaction } = useDashboard();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedAccountId, setSelectedAccountId] = useState<string>('all');
  const [page, setPage] = useState(1);
  const pageSize = 10;

  // Account & Category lookups
  const accountMap = useMemo(
    () => new Map(database.accounts.map((a) => [a.id, a])),
    [database.accounts]
  );
  const categoryMap = useMemo(
    () => new Map(database.categories.map((c) => [c.id, c])),
    [database.categories]
  );

  // Filtered transactions
  const filteredTransactions = useMemo(() => {
    return database.transactions.filter((tx) => {
      // Type filter
      if (selectedType !== 'all' && tx.type !== selectedType) return false;

      // Account filter
      if (
        selectedAccountId !== 'all' &&
        tx.accountId !== selectedAccountId &&
        tx.toAccountId !== selectedAccountId
      )
        return false;

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const notesMatch = tx.notes?.toLowerCase().includes(query);
        const cat = categoryMap.get(tx.categoryId);
        const catMatch = cat?.name.toLowerCase().includes(query);
        const acc = accountMap.get(tx.accountId);
        const accMatch = acc?.name.toLowerCase().includes(query);
        const amountMatch = tx.amount.toString().includes(query);
        return notesMatch || catMatch || accMatch || amountMatch;
      }

      return true;
    });
  }, [database.transactions, selectedType, selectedAccountId, searchQuery, categoryMap, accountMap]);

  const totalPages = Math.ceil(filteredTransactions.length / pageSize) || 1;
  const paginatedTransactions = filteredTransactions.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  const getTypeIcon = (type: TransactionType) => {
    switch (type) {
      case 'income':
        return <ArrowUpRight className="w-4 h-4 text-emerald-400" />;
      case 'expense':
        return <ArrowDownRight className="w-4 h-4 text-red-400" />;
      case 'transfer':
        return <ArrowRightLeft className="w-4 h-4 text-blue-400" />;
    }
  };

  return (
    <Card className="p-5 space-y-4">
      {/* Title & Filter Bar */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3 pb-3 border-b border-[#1E2433]">
        <div>
          <h3 className="text-base font-bold text-[#F3F4F6] flex items-center space-x-2">
            <span>Transaction Ledger</span>
            <span className="text-xs font-normal text-[#9CA3AF]">
              ({filteredTransactions.length} records)
            </span>
          </h3>
          <p className="text-xs text-[#9CA3AF]">
            Audited history of income, expenses, and internal transfers
          </p>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
          {/* Search Box */}
          <div className="relative flex-1 sm:w-48">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              placeholder="Search transactions..."
              className="w-full bg-[#171C2A] border border-[#1E2433] rounded-xl pl-8 pr-3 py-1.5 text-xs text-[#F3F4F6] focus:border-[#F59E0B] focus:outline-none placeholder-[#64748B]"
            />
          </div>

          {/* Type Filter */}
          <select
            value={selectedType}
            onChange={(e) => {
              setSelectedType(e.target.value);
              setPage(1);
            }}
            className="bg-[#171C2A] border border-[#1E2433] rounded-xl px-2.5 py-1.5 text-xs text-[#F3F4F6] focus:border-[#F59E0B] focus:outline-none"
          >
            <option value="all">All Types</option>
            <option value="income">Income Only</option>
            <option value="expense">Expense Only</option>
            <option value="transfer">Transfers</option>
          </select>

          {/* Account Filter */}
          <select
            value={selectedAccountId}
            onChange={(e) => {
              setSelectedAccountId(e.target.value);
              setPage(1);
            }}
            className="bg-[#171C2A] border border-[#1E2433] rounded-xl px-2.5 py-1.5 text-xs text-[#F3F4F6] focus:border-[#F59E0B] focus:outline-none"
          >
            <option value="all">All Accounts</option>
            {database.accounts.map((acc) => (
              <option key={acc.id} value={acc.id}>
                {acc.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-[#1E2433] text-[#64748B] uppercase tracking-wider">
              <th className="py-2.5 px-3">Type</th>
              <th className="py-2.5 px-3">Date</th>
              <th className="py-2.5 px-3">Description / Category</th>
              <th className="py-2.5 px-3">Account / Flow</th>
              <th className="py-2.5 px-3 text-right">Amount</th>
              <th className="py-2.5 px-3 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1E2433]/60">
            {paginatedTransactions.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-[#9CA3AF]">
                  No transactions match your search filter.
                </td>
              </tr>
            ) : (
              paginatedTransactions.map((tx) => {
                const sourceAcc = accountMap.get(tx.accountId);
                const targetAcc = tx.toAccountId ? accountMap.get(tx.toAccountId) : null;
                const category = categoryMap.get(tx.categoryId);

                return (
                  <tr
                    key={tx.id}
                    className="hover:bg-[#171C2A]/50 transition-colors group"
                  >
                    {/* Type badge */}
                    <td className="py-3 px-3">
                      <div className="flex items-center space-x-2">
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                            tx.type === 'income'
                              ? 'bg-emerald-500/10'
                              : tx.type === 'expense'
                              ? 'bg-red-500/10'
                              : 'bg-blue-500/10'
                          }`}
                        >
                          {getTypeIcon(tx.type)}
                        </div>
                        <span className="font-semibold text-[#F3F4F6] uppercase text-[10px]">
                          {tx.type}
                        </span>
                      </div>
                    </td>

                    {/* Date */}
                    <td className="py-3 px-3 text-[#9CA3AF] whitespace-nowrap">
                      {formatDate(tx.date)}
                    </td>

                    {/* Description & Category */}
                    <td className="py-3 px-3 max-w-xs">
                      <div className="font-medium text-[#F3F4F6] truncate">
                        {tx.notes || (tx.type === 'transfer' ? 'Internal Transfer' : 'Transaction')}
                      </div>
                      <div className="flex items-center space-x-1.5 mt-0.5">
                        {category ? (
                          <span
                            className="inline-flex items-center space-x-1 px-1.5 py-0.5 rounded text-[10px] font-medium"
                            style={{
                              backgroundColor: `${category.color}15`,
                              color: category.color,
                            }}
                          >
                            <span>{category.name}</span>
                          </span>
                        ) : tx.type === 'transfer' ? (
                          <span className="text-[10px] text-blue-400 font-medium">
                            Inter-account transfer
                          </span>
                        ) : null}
                      </div>
                    </td>

                    {/* Account / Flow */}
                    <td className="py-3 px-3">
                      {tx.type === 'transfer' ? (
                        <div className="flex items-center space-x-1.5 text-[11px] text-[#F3F4F6]">
                          <span className="truncate max-w-[100px] text-[#9CA3AF]">
                            {sourceAcc?.name || 'Account'}
                          </span>
                          <ArrowRightLeft className="w-3 h-3 text-blue-400 flex-shrink-0" />
                          <span className="truncate max-w-[100px] font-semibold text-emerald-400">
                            {targetAcc?.name || 'Target Account'}
                          </span>
                        </div>
                      ) : (
                        <span className="text-[11px] text-[#9CA3AF] truncate block max-w-[140px]">
                          {sourceAcc?.name || 'Unknown Account'}
                        </span>
                      )}
                    </td>

                    {/* Amount */}
                    <td className="py-3 px-3 text-right whitespace-nowrap">
                      <span
                        className={`font-mono font-bold text-sm ${
                          tx.type === 'income'
                            ? 'text-emerald-400'
                            : tx.type === 'expense'
                            ? 'text-red-400'
                            : 'text-blue-400'
                        }`}
                      >
                        {tx.type === 'income' ? '+' : tx.type === 'expense' ? '-' : ''}
                        {formatIDR(tx.amount)}
                      </span>
                    </td>

                    {/* Action buttons */}
                    <td className="py-3 px-3 text-center">
                      <button
                        onClick={() => {
                          if (window.confirm('Delete this transaction? Balances will be recalculated.')) {
                            deleteTransaction(tx.id);
                          }
                        }}
                        className="p-1.5 rounded-lg text-[#64748B] hover:text-red-400 hover:bg-[#1E2433] opacity-0 group-hover:opacity-100 transition-all"
                        title="Delete Transaction"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Bar */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-3 border-t border-[#1E2433] text-xs text-[#9CA3AF]">
          <span>
            Showing {(page - 1) * pageSize + 1} to{' '}
            {Math.min(page * pageSize, filteredTransactions.length)} of{' '}
            {filteredTransactions.length}
          </span>
          <div className="flex space-x-1">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              className="px-2.5 py-1 rounded bg-[#171C2A] border border-[#1E2433] hover:bg-[#1E2433] disabled:opacity-40"
            >
              Prev
            </button>
            <span className="px-3 py-1 font-semibold text-[#F3F4F6]">
              {page} / {totalPages}
            </span>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
              className="px-2.5 py-1 rounded bg-[#171C2A] border border-[#1E2433] hover:bg-[#1E2433] disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </Card>
  );
};
