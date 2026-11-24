import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  glow?: 'gold' | 'emerald' | 'ruby' | 'violet' | 'none';
  variant?: 'default' | 'glass' | 'interactive';
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  glow = 'none',
  variant = 'default',
  ...props
}) => {
  const glowStyles = {
    gold: 'border-[#FFB800]/30 shadow-glow-gold bg-gradient-to-b from-[#131722] to-[#0D111A]',
    emerald: 'border-[#00D68F]/30 shadow-glow-emerald bg-gradient-to-b from-[#101920] to-[#0D111A]',
    ruby: 'border-[#FF3358]/30 shadow-glow-ruby bg-gradient-to-b from-[#1D1118] to-[#0D111A]',
    violet: 'border-[#8B5CF6]/30 shadow-glow-violet bg-gradient-to-b from-[#151226] to-[#0D111A]',
    none: 'border-white/[0.08] hover:border-white/[0.16] bg-[#0E131E]/95',
  };

  const variantStyles = {
    default: 'card-rim',
    glass: 'bg-[#0E131E]/75 backdrop-blur-xl card-rim',
    interactive: 'card-rim hover:-translate-y-0.5 hover:shadow-xl cursor-pointer',
  };

  return (
    <div
      className={`rounded-2xl border transition-all duration-200 ${variantStyles[variant]} ${glowStyles[glow]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
