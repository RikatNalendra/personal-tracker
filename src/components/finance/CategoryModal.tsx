import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { useDashboard } from '../../context/DashboardContext';
import { Category, CategoryType } from '../../types/finance';
import { ACCENT_COLORS } from '../../utils/colors';

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  categoryToEdit?: Category | null;
}

export const CategoryModal: React.FC<CategoryModalProps> = ({
  isOpen,
  onClose,
  categoryToEdit,
}) => {
  const { addCategory, editCategory } = useDashboard();

  const [name, setName] = useState('');
  const [type, setType] = useState<CategoryType>('expense');
  const [monthlyBudget, setMonthlyBudget] = useState('');
  const [color, setColor] = useState(ACCENT_COLORS[0]);

  useEffect(() => {
    if (categoryToEdit) {
      setName(categoryToEdit.name);
      setType(categoryToEdit.type);
      setMonthlyBudget(categoryToEdit.monthlyBudget ? categoryToEdit.monthlyBudget.toString() : '');
      setColor(categoryToEdit.color);
    } else {
      setName('');
      setType('expense');
      setMonthlyBudget('');
      setColor(ACCENT_COLORS[0]);
    }
  }, [categoryToEdit, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const budget = monthlyBudget ? parseFloat(monthlyBudget.replace(/[^0-9.]/g, '')) : undefined;

    if (categoryToEdit) {
      editCategory(categoryToEdit.id, {
        name: name.trim(),
        type,
        monthlyBudget: type === 'expense' ? budget : undefined,
        color,
      });
    } else {
      addCategory({
        name: name.trim(),
        type,
        color,
        icon: 'Tag',
        monthlyBudget: type === 'expense' ? budget : undefined,
      });
    }
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={categoryToEdit ? 'Edit Category' : 'Create Custom Category'}
      subtitle="Organize income sources or set monthly spending limits"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-[#9CA3AF] mb-1">Category Name</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Sports & Golf, Luxury Dining, Consulting"
            className="w-full bg-[#171C2A] border border-[#1E2433] rounded-xl px-3 py-2 text-xs text-[#F3F4F6] focus:border-[#F59E0B] focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-[#9CA3AF] mb-1">Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as CategoryType)}
              className="w-full bg-[#171C2A] border border-[#1E2433] rounded-xl px-3 py-2 text-xs text-[#F3F4F6] focus:border-[#F59E0B] focus:outline-none"
            >
              <option value="expense">Expense (Spending)</option>
              <option value="income">Income (Revenue)</option>
            </select>
          </div>

          {type === 'expense' && (
            <div>
              <label className="block text-xs font-medium text-[#9CA3AF] mb-1">
                Monthly Budget Limit (IDR)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-[#9CA3AF]">
                  Rp
                </span>
                <input
                  type="number"
                  step="any"
                  value={monthlyBudget}
                  onChange={(e) => setMonthlyBudget(e.target.value)}
                  placeholder="e.g. 5000000"
                  className="w-full bg-[#171C2A] border border-[#1E2433] rounded-xl pl-9 pr-3 py-2 text-xs text-[#F3F4F6] focus:border-[#F59E0B] focus:outline-none"
                />
              </div>
            </div>
          )}
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
            {categoryToEdit ? 'Save Changes' : 'Create Category'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
