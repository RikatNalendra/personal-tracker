// Curated bold, executive jewel tones (clean, professional, non-generic)
export const ACCENT_COLORS = [
  '#00D68F', // Executive Emerald
  '#FFB800', // Imperial Gold
  '#2563EB', // Sapphire Blue
  '#FF3358', // Crimson Ruby
  '#8B5CF6', // Electric Violet
  '#00D2FF', // Cyber Cyan
  '#6366F1', // Deep Indigo
  '#0D9488', // Titanium Teal
  '#EC4899', // Rich Rose
  '#94A3B8', // Platinum Slate
];

export function getPriorityBadgeColor(priority: 'low' | 'medium' | 'high'): {
  bg: string;
  text: string;
  border: string;
  glow: string;
} {
  switch (priority) {
    case 'high':
      return {
        bg: 'bg-[#FF3358]/10',
        text: 'text-[#FF3358]',
        border: 'border-[#FF3358]/30',
        glow: 'shadow-[0_0_12px_rgba(255,51,88,0.2)]',
      };
    case 'medium':
      return {
        bg: 'bg-[#FFB800]/10',
        text: 'text-[#FFB800]',
        border: 'border-[#FFB800]/30',
        glow: 'shadow-[0_0_12px_rgba(255,184,0,0.2)]',
      };
    case 'low':
      return {
        bg: 'bg-[#00D68F]/10',
        text: 'text-[#00D68F]',
        border: 'border-[#00D68F]/30',
        glow: 'shadow-[0_0_12px_rgba(0,214,143,0.2)]',
      };
    default:
      return {
        bg: 'bg-slate-500/10',
        text: 'text-slate-400',
        border: 'border-slate-500/30',
        glow: '',
      };
  }
}

export function getAssetClassColor(assetClass: string): string {
  switch (assetClass) {
    case 'gold':
      return '#FFB800'; // Bold Champagne Gold
    case 'idx_stock':
      return '#2563EB'; // Authoritative Sapphire
    case 'us_stock':
      return '#8B5CF6'; // Electric Violet
    case 'crypto':
      return '#00D68F'; // Bold Emerald
    case 'custom':
      return '#00D2FF'; // Cyber Cyan
    default:
      return '#94A3B8';
  }
}

export function getAssetClassLabel(assetClass: string): string {
  switch (assetClass) {
    case 'gold':
      return 'Gold (Logam Mulia)';
    case 'idx_stock':
      return 'IDX Stock (Saham Indo)';
    case 'us_stock':
      return 'Global / US Equities';
    case 'crypto':
      return 'Digital Assets / Crypto';
    case 'custom':
      return 'Real Estate & Alternative';
    default:
      return assetClass;
  }
}
