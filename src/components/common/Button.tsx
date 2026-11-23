import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'emerald' | 'coral' | 'outline' | 'ghost' | 'secondary';
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
    sm: 'px-3 py-1.5 text-xs font-medium rounded-lg gap-1.5',
    md: 'px-4 py-2 text-sm font-medium rounded-xl gap-2',
    lg: 'px-5 py-2.5 text-base font-semibold rounded-xl gap-2.5',
  };

  const variantStyles = {
    // Warm Champagne / Gold Accent
    primary:
      'bg-gradient-to-r from-[#F59E0B] to-[#D97706] text-[#0B0E14] font-semibold hover:from-[#FBBF24] hover:to-[#F59E0B] shadow-md shadow-[#F59E0B]/20 active:scale-[0.98]',
    // Emerald Green Accent
    emerald:
      'bg-gradient-to-r from-[#10B981] to-[#059669] text-white hover:from-[#34D399] hover:to-[#10B981] shadow-md shadow-[#10B981]/20 active:scale-[0.98]',
    // Coral / Red Accent
    coral:
      'bg-gradient-to-r from-[#EF4444] to-[#DC2626] text-white hover:from-[#F87171] hover:to-[#EF4444] shadow-md shadow-[#EF4444]/20 active:scale-[0.98]',
    // Outline Surface
    outline:
      'bg-[#131722]/80 border border-[#1E2433] text-[#F3F4F6] hover:bg-[#1E2433] hover:border-[#2A3246] active:scale-[0.98]',
    // Secondary Dark Surface
    secondary:
      'bg-[#1E2433] text-[#F3F4F6] hover:bg-[#2A3246] active:scale-[0.98]',
    // Ghost
    ghost:
      'bg-transparent text-[#9CA3AF] hover:text-[#F3F4F6] hover:bg-[#1E2433]/50',
  };

  return (
    <button
      className={`inline-flex items-center justify-center transition-all duration-150 disabled:opacity-50 disabled:pointer-events-none select-none ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      disabled={disabled}
      {...props}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      {children}
    </button>
  );
};
