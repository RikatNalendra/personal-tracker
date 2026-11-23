import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  glow?: 'gold' | 'emerald' | 'coral' | 'none';
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  glow = 'none',
  ...props
}) => {
  const glowStyles = {
    gold: 'border-[#F59E0B]/30 shadow-gold-glow',
    emerald: 'border-[#10B981]/30 shadow-emerald-glow',
    coral: 'border-[#EF4444]/30 shadow-coral-glow',
    none: 'border-[#1E2433] hover:border-[#2A3246]',
  };

  return (
    <div
      className={`bg-[#131722] rounded-2xl border p-5 transition-all duration-200 ${glowStyles[glow]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
