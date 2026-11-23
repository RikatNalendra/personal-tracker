import React, { useState } from 'react';
import { useDashboard } from '../../context/DashboardContext';
import { Account } from '../../types/finance';
import { formatIDR } from '../../utils/currency';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { AccountModal } from './AccountModal';
import {
  Building2,
  Landmark,
  Smartphone,
  Briefcase,
  Wallet,
  Plus,
  MoreVertical,
  Edit2,
  Trash2,
} from 'lucide-react';

export const AccountsOverview: React.FC = () => {
  const { database, deleteAccount } = useDashboard();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);

  const getAccountIcon = (type: string) => {
    switch (type) {
      case 'bank':
        return Building2;
      case 'ewallet':
        return Smartphone;
      case 'investment_cash':
        return Briefcase;
      case 'cash':
        return Wallet;
      default:
        return Landmark;
    }
  };

  const totalLiquidCash = database.accounts.reduce((sum, acc) => sum + acc.balance, 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-[#F3F4F6] flex items-center space-x-2">
            <span>Accounts & Liquid Wallets</span>
            <span className="text-xs font-normal text-[#9CA3AF]">
              (Total: {formatIDR(totalLiquidCash)})
            </span>
          </h3>
          <p className="text-xs text-[#9CA3AF]">
            Bank accounts, QRIS e-wallets, and investment cash reserves
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setEditingAccount(null);
            setIsModalOpen(true);
          }}
          icon={<Plus className="w-3.5 h-3.5 text-[#F59E0B]" />}
        >
          Add Account
        </Button>
      </div>

      {database.accounts.length === 0 ? (
        <Card className="p-8 text-center border-dashed border-[#1E2433]">
          <Wallet className="w-8 h-8 text-[#F59E0B] mx-auto mb-2 opacity-60" />
          <h4 className="text-sm font-semibold text-[#F3F4F6]">No Accounts or Wallets Added</h4>
          <p className="text-xs text-[#9CA3AF] max-w-md mx-auto mt-1 mb-4">
            Add your bank accounts (BCA, Mandiri), e-wallets (GoPay, OVO), or cash vaults to start tracking balances.
          </p>
          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              setEditingAccount(null);
              setIsModalOpen(true);
            }}
            icon={<Plus className="w-3.5 h-3.5" />}
          >
            Add Your First Account
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3.5">
          {database.accounts.map((acc) => {
            const Icon = getAccountIcon(acc.type);
            return (
              <Card
                key={acc.id}
                className="relative group p-4 flex flex-col justify-between hover:border-[#F59E0B]/30"
              >
                <div>
                  <div className="flex items-start justify-between mb-3">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: `${acc.color}20`, color: acc.color }}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => {
                          setEditingAccount(acc);
                          setIsModalOpen(true);
                        }}
                        className="p-1 rounded hover:bg-[#1E2433] text-[#9CA3AF] hover:text-[#F3F4F6]"
                        title="Edit Account"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (
                            window.confirm(`Are you sure you want to delete ${acc.name}?`)
                          ) {
                            deleteAccount(acc.id);
                          }
                        }}
                        className="p-1 rounded hover:bg-[#1E2433] text-red-400 hover:text-red-300"
                        title="Delete Account"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <h4 className="text-xs font-semibold text-[#F3F4F6] truncate">{acc.name}</h4>
                  <p className="text-[11px] text-[#64748B] truncate mt-0.5">
                    {acc.institution || acc.accountNumber || acc.type.toUpperCase()}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-[#1E2433]">
                  <span className="text-[10px] text-[#9CA3AF] block font-medium">Available</span>
                  <span className="text-sm font-bold text-[#F3F4F6] font-mono">
                    {formatIDR(acc.balance)}
                  </span>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <AccountModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        accountToEdit={editingAccount}
      />
    </div>
  );
};
