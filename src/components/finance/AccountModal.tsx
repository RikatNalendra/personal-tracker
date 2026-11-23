import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { useDashboard } from '../../context/DashboardContext';
import { Account, AccountType } from '../../types/finance';
import { ACCENT_COLORS } from '../../utils/colors';

interface AccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  accountToEdit?: Account | null;
}

export const AccountModal: React.FC<AccountModalProps> = ({
  isOpen,
  onClose,
  accountToEdit,
}) => {
  const { addAccount, editAccount } = useDashboard();

  const [name, setName] = useState('');
  const [type, setType] = useState<AccountType>('bank');
  const [balance, setBalance] = useState('');
  const [institution, setInstitution] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [color, setColor] = useState(ACCENT_COLORS[0]);

  useEffect(() => {
    if (accountToEdit) {
      setName(accountToEdit.name);
      setType(accountToEdit.type);
      setBalance(accountToEdit.balance.toString());
      setInstitution(accountToEdit.institution || '');
      setAccountNumber(accountToEdit.accountNumber || '');
      setColor(accountToEdit.color);
    } else {
      setName('');
      setType('bank');
      setBalance('');
      setInstitution('');
      setAccountNumber('');
      setColor(ACCENT_COLORS[0]);
    }
  }, [accountToEdit, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const bal = parseFloat(balance.replace(/[^0-9.-]/g, '')) || 0;

    if (accountToEdit) {
      editAccount(accountToEdit.id, {
        name: name.trim(),
        type,
        balance: bal,
        institution: institution.trim() || undefined,
        accountNumber: accountNumber.trim() || undefined,
        color,
      });
    } else {
      addAccount({
        name: name.trim(),
        type,
        balance: bal,
        currency: 'IDR',
        color,
        icon: 'Building2',
        institution: institution.trim() || undefined,
        accountNumber: accountNumber.trim() || undefined,
      });
    }
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={accountToEdit ? 'Edit Account / Wallet' : 'Add Account / Wallet'}
      subtitle="Customize bank accounts, QRIS e-wallets, cash, and investment accounts"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-[#9CA3AF] mb-1">Account Name</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. BCA Priority, Mandiri Payroll, GoPay"
            className="w-full bg-[#171C2A] border border-[#1E2433] rounded-xl px-3 py-2 text-xs text-[#F3F4F6] focus:border-[#F59E0B] focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-[#9CA3AF] mb-1">Account Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as AccountType)}
              className="w-full bg-[#171C2A] border border-[#1E2433] rounded-xl px-3 py-2 text-xs text-[#F3F4F6] focus:border-[#F59E0B] focus:outline-none"
            >
              <option value="bank">Bank Account</option>
              <option value="ewallet">E-Wallet / QRIS</option>
              <option value="investment_cash">Investment Cash (RDI)</option>
              <option value="cash">Cash / Vault</option>
              <option value="brokerage">Brokerage</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#9CA3AF] mb-1">
              Current Balance (IDR)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-[#9CA3AF]">
                Rp
              </span>
              <input
                type="number"
                step="any"
                required
                value={balance}
                onChange={(e) => setBalance(e.target.value)}
                placeholder="0"
                className="w-full bg-[#171C2A] border border-[#1E2433] rounded-xl pl-9 pr-3 py-2 text-xs text-[#F3F4F6] focus:border-[#F59E0B] focus:outline-none"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-[#9CA3AF] mb-1">
              Institution / Provider
            </label>
            <input
              type="text"
              value={institution}
              onChange={(e) => setInstitution(e.target.value)}
              placeholder="e.g. Bank Central Asia"
              className="w-full bg-[#171C2A] border border-[#1E2433] rounded-xl px-3 py-2 text-xs text-[#F3F4F6] focus:border-[#F59E0B] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#9CA3AF] mb-1">
              Account / Phone Number
            </label>
            <input
              type="text"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              placeholder="e.g. 8490-****-12"
              className="w-full bg-[#171C2A] border border-[#1E2433] rounded-xl px-3 py-2 text-xs text-[#F3F4F6] focus:border-[#F59E0B] focus:outline-none"
            />
          </div>
        </div>

        {/* Color Palette Picker */}
        <div>
          <label className="block text-xs font-medium text-[#9CA3AF] mb-1.5">Color Accent</label>
          <div className="flex flex-wrap gap-2">
            {ACCENT_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className={`w-7 h-7 rounded-full transition-transform ${
                  color === c ? 'ring-2 ring-white scale-110' : 'hover:scale-105'
                }`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </div>

        <div className="flex justify-end space-x-2 pt-3 border-t border-[#1E2433]">
          <Button variant="ghost" size="sm" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" type="submit">
            {accountToEdit ? 'Save Changes' : 'Create Account'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
