import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'emerald' | 'coral' | 'ruby' | 'violet' | 'outline' | 'ghost' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  children?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  icon,
  children,
  className = '',
  disabled,
  ...props
}) => {
  const sizeStyles = {
    sm: 'px-3 py-1.5 text-xs font-semibold rounded-xl gap-1.5',
    md: 'px-4 py-2 text-xs font-semibold rounded-xl gap-2',
    lg: 'px-5 py-2.5 text-sm font-bold rounded-xl gap-2.5',
  };

  const variantStyles = {
    // Imperial Champagne Gold
    primary:
      'bg-gradient-to-r from-[#FFB800] via-[#F5A623] to-[#D97706] text-[#080A10] font-bold hover:brightness-110 shadow-md shadow-[#FFB800]/25 active:scale-[0.98]',
    // Bold Executive Emerald
    emerald:
      'bg-gradient-to-r from-[#00D68F] to-[#00A86B] text-[#080A10] font-bold hover:brightness-110 shadow-md shadow-[#00D68F]/25 active:scale-[0.98]',
    // Bold Ruby Crimson
    coral:
      'bg-gradient-to-r from-[#FF3358] to-[#D91B40] text-white font-bold hover:brightness-110 shadow-md shadow-[#FF3358]/25 active:scale-[0.98]',
    ruby:
      'bg-gradient-to-r from-[#FF3358] to-[#D91B40] text-white font-bold hover:brightness-110 shadow-md shadow-[#FF3358]/25 active:scale-[0.98]',
    // Gen Z Electric Violet
    violet:
      'bg-gradient-to-r from-[#8B5CF6] to-[#6366F1] text-white font-bold hover:brightness-110 shadow-md shadow-[#8B5CF6]/25 active:scale-[0.98]',
    // Glass Outline
    outline:
      'bg-white/[0.04] border border-white/[0.1] text-[#F8FAFC] hover:bg-white/[0.08] hover:border-white/[0.2] active:scale-[0.98]',
    // Deep Titanium
    secondary:
      'bg-[#151B28] text-[#F8FAFC] hover:bg-[#1C2436] border border-white/[0.08] active:scale-[0.98]',
    // Minimal Ghost
    ghost:
      'bg-transparent text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-white/[0.06]',
  };

  return (
    <button
      className={`inline-flex items-center justify-center transition-all duration-150 disabled:opacity-40 disabled:pointer-events-none select-none ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      disabled={disabled}
      {...props}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      {children}
    </button>
  );
};
